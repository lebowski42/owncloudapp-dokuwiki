<?php

function isEmptyDir($dir){
	$success = false;
	if ($dir !== '' && $dir !== '/Shared' && $dir !== '/wiki' && \OC\Files\Filesystem::file_exists($dir)) {
		$handler = \OC\Files\Filesystem::opendir($dir);
		$count = 0;
		if(!$handler){
			$success = false;
		}else{
			while (false !== ($filename = readdir($handler))) {
				$count++;
			}
			closedir($handler);
			if ($count <= 2){// '.' and '..'
				$success = true;
			}else {
				$success = false;
				
			}
		}
	return $success;
	}
}

/**
	* This is original from lib/helper.php written by Frank Karlitschek
    * Jakob Sack.
    * modified that way, that no brackets a spaces are used. 
	*
	* @param $path
	* @param $filename
	* @return string
	*/
function buildNotExistingFileNameWithoutSpaces($path, $filename) {
		if($path==='/') {
			$path='';
		}
		if ($pos = strrpos($filename, '.')) {
			$name = substr($filename, 0, $pos);
			$ext = substr($filename, $pos);
		} else {
			$name = $filename;
			$ext = '';
		}

		$newpath = $path . '/' . $filename;
		$counter = 2;
		while (\OC\Files\Filesystem::file_exists($newpath)) {
			$newname = $name.'_'.$counter.$ext;
			$newpath = $path . '/' . $newname;
			$counter++;
		}

		return $newpath;
	}
