<?php
/**
 * Copyright (c) 2012 Sam Tuke <samtuke@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

/**
 * This class contains all hooks.
 */

namespace OCA\DokuWiki;

require_once('utils.php');

class Hooks {



	/**
	 * listen to write event.
	 */
	public static function write_hook($params) {
		global $conf;
		global $wiki;
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($path);
		$replaceFile = preg_match('#.* \(\d\)\.?.*$#',$filename);
		if($replaceFile != 1 && cleanID($filename) != $filename && strncmp($path, '/'.$wiki, strlen('/'.$wiki)) == 0){
				$params['run'] = false;
		}else{		
			if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true' && $replaceFile != 1)  {	
				if($path<>'') {
					Storage::store($path);
				}
			}
		}
	}
	
	public static function post_write_hook($params) {
		global $conf;
		global $wiki;
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($path);
		$dir = dirname($path);
		$replaceFile = preg_match('#.* \(\d\)\.?.*$#',$filename);
		if($replaceFile == 1){
			require_once('dokuwiki/lib/helper.php');
			if($pos = strrpos($filename, '.')){
				$name = substr($filename, 0, $pos);
				$ext = substr($filename, $pos);
			}else{
				$name = $filename;
				$ext = '';
			}
			// Find (nr)
			$pos = strrpos($name, ' ');
			$oldname = substr($filename, 0, $pos).$ext;
			$newname = buildNotExistingFileNameWithoutSpaces($dir, $oldname);
			$newname = \OC\Files\Filesystem::normalizePath($newname);
			\OC\Files\Filesystem::rename($path, $newname);
		}else{		
			if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {	
				if($path<>'') {
					Storage::store($path);
				}
			}
		}
}
	
	
	public static function fileCreated($params){
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
				if($path<>'') {
					Storage::mediaMeta($path);
				}
			}
	}


	/**
	 * @brief Erase versions of deleted file
	 * @param array
	 *
	 * This function is connected to the delete signal of OC_Filesystem
	 * cleanup the versions directory if the actual file gets deleted
	 */
	public static function remove_hook($params) {
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
			if($path<>'') {
				Storage::delete($path);
			}
		}
	}
	
	
	/**
	 * @brief Erase versions of deleted file
	 * @param array
	 *
	 * This function is connected to the delete signal of OC_Filesystem
	 * cleanup the versions directory if the actual file gets deleted
	 */
	public static function pre_remove_hook($params) {
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		//prevent deleting files inside wiki-folder. Always from mediamanager
		global $wiki;
		$filename = basename($path);
		if(strncmp($path, '/'.$wiki, strlen('/'.$wiki)) == 0){
			$params['run'] = false;
			require_once('dokuwiki/lib/helper.php');
			
			//if(\OC\Files\Filesystem::filemtime($path) < $n) $params['run'] = 0;
			if(isEmptyDir($path) || preg_match('#.* \(\d\)\.?.*$#',$filename) == 1) $params['run'] = true;
			 
		}
	}

	/**
	 * @brief rename/move versions of renamed/moved files
	 * @param array with oldpath and newpath
	 *
	 * This function is connected to the rename signal of OC_Filesystem and adjust the name and location
	 * of the stored versions along the actual file
	 */
	public static function rename_hook($params) {
		$oldpath = $params[\OC\Files\Filesystem::signal_param_oldpath];
		$newpath = $params[\OC\Files\Filesystem::signal_param_newpath];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($newpath);
		global $wiki;
		if($oldpath == $wiki || $oldpath == '/'.$wiki || cleanID($filename) != $filename){
			
			 $params['run'] = false;
		// renaming to a name outside wiki folder means moving
		}elseif(strncmp($oldpath, $wiki, strlen($wiki)) == 0 && strncmp($newpath, $wiki, strlen($wiki))!=0){
			$params['run'] = false;
		}else{	
			if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
				if($oldpath<>'' && $newpath<>'') {
					Storage::rename( $oldpath, $newpath );
				}

			}
		 }
	}

	/**
	 * @brief clean up user specific settings if user gets deleted
	 * @param array with uid
	 *
	 * This function is connected to the pre_deleteUser signal of OC_Users
	 * to remove the used space for versions stored in the database
	 */
	public static function deleteUser_hook($params) {
		if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
			$uid = $params['uid'];
			Storage::deleteUser($uid);
			}
	}

}
