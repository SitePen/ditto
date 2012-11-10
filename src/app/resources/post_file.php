<?php
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
			$output = array();

			// Process params here
			$legacyMode = (array_key_exists("legacyMode", $_GET)==TRUE && $_GET["legacyMode"] == "enabled") ? "-l " : "";
			$customOnly = (array_key_exists("customOnly", $_GET)==TRUE && $_GET["customOnly"] == "enabled") ? "-c " : "";
			$dojoCheck = (array_key_exists("dojoCheck", $_GET)==TRUE && $_GET["dojoCheck"] == "on") ? "-noDojo " : "";
			$dojoxCheck = (array_key_exists("dojoxCheck", $_GET)==TRUE && $_GET["dojoxCheck"] == "on") ? "-noDojox " : "";
			$dijitCheck = (array_key_exists("dijitCheck", $_GET)==TRUE && $_GET["dijitCheck"] == "on") ? "-noDijit " : "";
			$customCheck = (array_key_exists("customCheck", $_GET)==TRUE && $_GET["customCheck"] == "on");
			$customIgnore = "";
			if($customCheck == TRUE){
				$customIgnore = "-i ".$_GET["customCheckArea"]." ";
			}


			$bash = "python ditto.py -d ".escapeshellarg($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4))." ".$customIgnore.$legacyMode.$customOnly.$dijitCheck.$dojoxCheck.$dojoCheck;
			exec($bash, $output);
			$deps = $output[0];
			exec("rm -rf ".escapeshellarg($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4))."*", $dontCare);
			exit_status($deps);
		}
	}

	exit_status('Something went wrong with your upload!');

	function exit_status($str){
		echo json_encode(array('deps'=>explode(",", $str)));
		exit;
	}

	function get_extension($file_name){
		$ext = explode('.', $file_name);
		$ext = array_pop($ext);
		return strtolower($ext);
	}
?>