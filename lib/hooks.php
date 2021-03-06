<?php
/**
 * Copyright (c) 2012 Sam Tuke <samtuke@owncloud.com> and Martin Schulte 
 * <lebowski[at]corvus[dot]uberspace[dot]de>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

/* 
 * This file is based on the file hooks.php from ownClouds version app 
 * (apps/files_versions/lib/hook.php), which was written by Sam Tuke 
 * <samtuke@owncloud.com>. It's modified for the needs of the dokuwiki-app
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
	public static function pre_write_hook($params) {
		$path = $params[\OC\Files\Filesystem::signal_param_path];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($path);
		$specialFile = allowedFilenameIfNotCleandID($filename);
		if(!$specialFile  && cleanID($filename) != $filename && inWiki($path)){
				$params['run'] = false;
		}else{		
			if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true' && !$specialFile)  {	
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
		$specialFile = allowedFilenameIfNotCleandID($filename);
		
		if($specialFile){
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
				if($path<>'' && inWiki($path)) {
					Storage::addMediaMetaEntry(0,'','', \OCP\User::getUser(),$path);
					//Storage::addMediaMetaEntryOLD('',0,'','', \OCP\User::getUser(),$path,true);
				}
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
		if(inWiki($path)){
			$params['run'] = false;
			require_once('dokuwiki/lib/helper.php');
			if(isEmptyDir($path) || fileAllowedToRemove($filename)) $params['run'] = true;
		}
	}

	/**
	 * @brief rename/move versions of renamed/moved files
	 * @param array with oldpath and newpath
	 *
	 * This function is connected to the rename signal of OC_Filesystem and adjust the name and location
	 * of the stored versions along the actual file
	 */
	public static function pre_rename_hook($params) {
		$oldpath = $params[\OC\Files\Filesystem::signal_param_oldpath];
		$newpath = $params[\OC\Files\Filesystem::signal_param_newpath];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($newpath);
		global $wiki;
		if($oldpath == $wiki || $oldpath == '/'.$wiki || cleanID($filename) != $filename){
			
			 $params['run'] = false;
		// renaming to a name outside wiki folder means moving
		}elseif(inWiki($oldpath) && !inWiki($newpath)){
			$params['run'] = false;
		}else{	
			if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
				if($oldpath<>'' && $newpath<>'') {
					Storage::rename( $oldpath, $newpath );
				}

			}
		 }
	}
	
	
	public static function post_rename_hook($params) {
		$oldpath = $params[\OC\Files\Filesystem::signal_param_oldpath];
		$newpath = $params[\OC\Files\Filesystem::signal_param_newpath];
		// Do we've a valid filename (no spaces, etc.)
		$filename = basename($newpath);
		global $wiki;
		if(\OCP\Config::getSystemValue('dokuwiki', Storage::DEFAULTENABLED)=='true') {
			if($oldpath<>'' && $newpath<>'' && inWiki($newpath)) {
				Storage::rename($oldpath,$newpath,true);
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
