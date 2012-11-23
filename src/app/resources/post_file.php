<?php

class Ditto {
    private $dirs;      // Scanned directories list
    private $files;     // Found files list
    private $matches;   // Matches list

    function __construct() {
        $this->dirs = array();
        $this->files = array();
        $this->matches = array();
    }

    function loadFiles($path, $noDojo, $noDijit, $noDojox, $customIgnore, $recursive = TRUE) {
        $this->dirs[] = realpath($path);
        foreach (scandir($path) as $file) {
            if (($file != '.') && ($file != '..')) {
                $fullname = realpath("{$path}/{$file}");
                $valid = TRUE;
                if(( $noDojo==TRUE && $file=="dojo") 		|| 
                		($noDijit==TRUE && $file=="dijit") 	|| 
                		($noDojox==TRUE && $file=="dojox") 	|| 
                		(strlen($customIgnore)>0 && $file==$customIgnore)){
                	$valid = FALSE;
                }

                if($valid){
	                if (is_dir($fullname) && !is_link($fullname) && $recursive) {
	                    if (!in_array($fullname, $this->dirs)) {
	                        $this->loadFiles($fullname, $noDojo, $noDijit, $noDojox, $customIgnore, $recursive);
	                    }
	                } else if (is_file($fullname)){
	                    $this->files[] = $fullname;
	                }
                }
            }
        }
        return($this->files);
    }

    function grep($pattern) {
        $this->matches = array();
        foreach ($this->files as $file) {
            if ($contents = file_get_contents($file)) {
                if (preg_match_all($pattern, $contents, $matches) > 0) {
                    $this->appendMatches($matches);
                }
            }
        }
        return($this->matches);
    }

    function appendMatches($arr) {
    	foreach($arr as $match){
    		foreach($match as $dep){
    			array_push($this->matches, $dep);
    		}
    	}
    }


    function sanitize($modules, $amd, $customOnly){
    	$cleanModules = array();
    	if($amd == TRUE){
    		foreach($modules as $module){
    			$module = str_replace(array("\r", "\r\n", "\n", " ", "\t"), "", $module);
	    		$module = str_replace(array("'", '"'), "", $module);
	    		$module = str_replace("require([", "", $module);
	    		$module = str_replace("define([", "", $module);
	    		$module = str_replace("]", "", $module);
	    		$module = substr($module, 0, -1);
	    		$deps = explode(",", $module);
	    		$cleanModules = array_merge($cleanModules, $deps);
    		}
    	}else{
    		$i = 0;
    		foreach($modules as $module){
    			$module = str_replace(array("\r", "\r\n", " ", "\t"), "", $module);
    			$module = str_replace(array("'", '"'), "", $module);
    			$module = str_replace("dojo.require(", "", $module);
    			$module = str_replace(")", "", $module);
    			$module = str_replace(".", "/", $module);
    			if(strlen($module)>0){
    				$cleanModules[$i] = $module;
    				$i++;
    			}
    		}
    	}
    	if($customOnly == TRUE){
    		$cleanModules = $this->removeDojoModules($cleanModules);
    	}
    	return($cleanModules);
    }

    function removeDojoModules($modules){
    	$customModules = array();
    	$i = 0;
    	foreach($modules as $module){
    		$valid = TRUE;
    		if(strlen($module)>=5 && substr($module, 0, 5)=="dojo/"){
    			$valid = FALSE;
    		}else if(strlen($module)>=6 && substr($module, 0, 6)=="dojox/"){
    			$valid = FALSE;
    		}else if(strlen($module)>=6 && substr($module, 0, 6)=="dijit/"){
    			$valid = FALSE;
    		}
    		if($valid == TRUE){
    			$customModules[$i] = $module;
	    		$i++;
    		}
    	}
    	return $customModules;
    }
}

$upload_dir 	= './';
$allowed_ext 	= array('png','zip');

if(strtolower($_SERVER['REQUEST_METHOD']) != 'post'){
	exit_status('Error! Wrong HTTP method!');
}

if(array_key_exists('pic',$_FILES) && $_FILES['pic']['error'] == 0 ){
	$pic = $_FILES['pic'];
	if(!in_array(get_extension($pic['name']),$allowed_ext)){
		exit_status('Only '.implode(',',$allowed_ext).' files are allowed!');
	}
	if(move_uploaded_file($pic['tmp_name'], $upload_dir.$pic['name'])){
		$zip = new ZipArchive;
		$res = $zip->open($upload_dir.$pic['name']);
		if ($res === TRUE) {
			$zip->extractTo($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4));
			$zip->close();
		} else {
		 	exit_status('Unzip failed!');
		}

		// Process params here
		$legacyMode = array_key_exists("legacyMode", $_GET)==TRUE && $_GET["legacyMode"] == "enabled";
		$customOnly = array_key_exists("customOnly", $_GET)==TRUE && $_GET["customOnly"] == "enabled";
		$noDojo = array_key_exists("dojoCheck", $_GET)==TRUE && $_GET["dojoCheck"] == "on";
		$noDojox = array_key_exists("dojoxCheck", $_GET)==TRUE && $_GET["dojoxCheck"] == "on";
		$noDijit = array_key_exists("dijitCheck", $_GET)==TRUE && $_GET["dijitCheck"] == "on";
		$customCheck = array_key_exists("customCheck", $_GET)==TRUE && $_GET["customCheck"] == "on";
		$customIgnore = "";
		if($customCheck == TRUE){
			$customIgnore = $_GET["customCheckArea"];
		}

		// Build Ditto
		$fg = new Ditto();
		// Lock and load
		$files = $fg->loadFiles($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4), $noDojo, $noDijit, $noDojox, $customIgnore);
		// Hanlde requires
		$matches = $fg->sanitize($fg->grep('/require\\(\\s*\\[[^]]*\\]\\s*\\,/'), TRUE, $customOnly);
		// Handle defines
		$matches = array_merge($fg->sanitize($fg->grep('/define\\(\\s*\\[[^]]*\\]\\s*\\,/'), TRUE, $customOnly), $matches);
		// Find the legacy modules if we need to
		if($legacyMode == TRUE){
			$matches = array_merge($fg->sanitize($fg->grep('/dojo.require\\(..*?\\)/'), FALSE, $customOnly), $matches);	
		}

		exec("rm -rf ".escapeshellarg($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4))."*", $dontCare);
		exit_status($matches);
	}
}

exit_status('Something went wrong with your upload!');

function exit_status($arr){
	echo json_encode(array('deps'=>array_unique($arr)));
	exit;
}

function get_extension($file_name){
	$ext = explode('.', $file_name);
	$ext = array_pop($ext);
	return strtolower($ext);
}

?>