<?php
/**
*  This file is part of the DokuWiki-app for owncloud.
*
* @author Martin Schulte
* @copyright 2013 Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
* 
*/
define('AUTHORS_NOT_FOUND', 1);
define('METADATA_NOT_FOUND', 2);
define('CANNOT_GET_METADATA', 3);
define('NO_DESCRIPTION', 4);
define('UPDATE_DESCRIPTION', 5);
if(!defined('DOKU_CHANGE_TYPE_MOVE')) define('DOKU_CHANGE_TYPE_MOVE','M');


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
    * and Jakob Sack.
    * here no brackets a spaces are used. 
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

/**
	* Returns all authors of a mediafile, using the dowuwiki
	* filename.changes files in /data/media_meta. It's used
	* by /ajax/authors.php
	*
	* @param $file mediafile full path
	* @return $mixed Array with authors or error constant (see above)
*/
function dw_getAuthorsOfMediaFile($file){
	require_once('dokuwiki/lib/utils.php');
	global $conf;
	if(file_exists($conf['mediametadir'].'/'.$file.'.changes')){
		$meta = file($conf['mediametadir'].'/'.$file.'.changes');
		if(!empty($meta)){
			$authors = array(); 
			foreach($meta as $onemeta){
				$line = explode("\t", $onemeta);
				if($line[4] != "" && !in_array($line[4],$authors)) array_push($authors,$line[4]);
			}
			return implode(", ", $authors);
		}else{
			return METADATA_NOT_FOUND;
		}
	}else{
			return AUTHORS_NOT_FOUND;
	}
}

/**
	* Set or get an description from DokuWiki's mediameta file
	*
	* @param $file mediafile full path
	* @param $set true, if new description should be set, false to get
	*             the description
	* @param $newDesc the new description if should be set.
	* @return $mixed description or success or error constant (see above)
*/
function dw_descriptionOfMediaFile($file,$set=false, $newDesc){
	require_once('dokuwiki/lib/utils.php');
	global $conf;
	$file = $conf['mediametadir'].'/'.$file.'.changes';
	if(file_exists($file)){
		$meta = file($file);
		$desc = '';
		if(!empty($meta)){
			$lastLine = array_pop($meta);
			$line = explode("\t", $lastLine);
			$desc = (isset($line[5]))?$line[5]:'';
			//$desc = $line[0];
			if(!$set){// return description
				return trim($desc);
			}else{
				$strip = array("\t", "\n");
				$line[5] = utf8_substr(str_replace($strip, ' ',htmlspecialchars(trim($newDesc))),0,255);
				array_push($meta,trim(implode("\t", $line))."\n");
				io_saveFile($file,implode("", $meta));
				return UPDATE_DESCRIPTION;
			}
		}else{
			return METADATA_NOT_FOUND;
		}
	}else{
			return CANNOT_GET_METADATA;
	}
}




