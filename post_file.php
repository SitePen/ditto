<?php
	$upload_dir 	= 'uploads/';
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
			exec("python ditto.py ".escapeshellarg($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4)), $output);
			$deps = $output[0];
			exec("rm -rf ".escapeshellarg($upload_dir.substr($pic['name'], 0, strlen($pic['name'])-4)), $dontCare);
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