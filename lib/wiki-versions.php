<?php
/**
* Copyright (c) 2012 Frank Karlitschek <frank@owncloud.org>
* 2013 Bjoern Schiessle <schiessle@owncloud.com>
* This file is licensed under the Affero General Public License version 3 or
* later.
* See the COPYING-README file.
*/

/**
* Versions
*
* A class to handle the versioning of files.
*/

namespace OCA\DokuWiki;

// + Dokuwiki utils
require_once('utils.php');
if(!defined('DOKU_CHANGE_TYPE_MOVE')) define('DOKU_CHANGE_TYPE_MOVE','M');
if(!defined('DOKU_CHANGE_TYPE_REPLACE')) define('DOKU_CHANGE_TYPE_REPLACE','R');

class Storage {
        
        const DW_EMBED_NAME = "dokuwikiembed";

        public static function getUidAndFilename($filename) {
                $uid = \OC\Files\Filesystem::getOwner($filename);
                \OC\Files\Filesystem::initMountPoints($uid);
                if ( $uid != \OCP\User::getUser() ) {
                        $info = \OC\Files\Filesystem::getFileInfo($filename);
                        $ownerView = new \OC\Files\View('/'.$uid.'/files');
                        $filename = $ownerView->getPath($info['fileid']);
                }
                return array($uid, $filename);
        }

        /**
         * store a new version of a file.
         */
        public static function store($filename) {

                if(!inWiki($filename)) {
                        return;
                }

                // if the file gets streamed we need to remove the .part extension
                // to get the right target
                $ext = pathinfo($filename, PATHINFO_EXTENSION);
                $isPart = false;
                if ($ext === 'part') {
                        $isPart = true;
                        $filename = substr($filename, 0, strlen($filename)-5);
                }
                
                list($uid, $filename) = self::getUidAndFilename($filename);

                $files_view = new \OC\Files\View('/'.$uid .'/files');
                $users_view = new \OC\Files\View('/'.$uid);

                // check if filename is a directory
                if($files_view->is_dir($filename)) {
                        return false;
                }

                // we should have a source file to work with
                $exists = !!$files_view->file_exists($filename);

                if(!$exists){// There is no post_write hook for files coming from webDAV, so we use this ugly hack
                        if($isPart) register_shutdown_function('OCA\DokuWiki\Storage::shutdownPartNew',$filename);
                }else{
                        self::saveOldRevision($filename);
                        if($isPart) register_shutdown_function('OCA\DokuWiki\Storage::shutdownPartReplace',$filename);
                }
        }
        
        
        public static function shutdownPartNew($filename){
                Storage::addMediaMetaEntry(0,DOKU_CHANGE_TYPE_CREATE,'', \OCP\User::getUser(),$filename);
        }
        
        public static function shutdownPartReplace($filename){
                Storage::addMediaMetaEntry(0,DOKU_CHANGE_TYPE_REPLACE,'', \OCP\User::getUser(),$filename);
        }

        public static function saveOldRevision($filename){
                if(!inWiki($filename)) {
                        return;
                }
                global $wiki;
                global $l;
                global $lang;
                $lang['created']=$l->t('created');
                // snip /wiki from filenmae and replace / with :
                $wikiid = str_replace('/',':',snipWiki($filename));
                if(!isset($_SERVER['REMOTE_USER'])) $_SERVER['REMOTE_USER'] = \OCP\User::getUser();
                $date = media_saveOldRevision($wikiid); // use DokuWiki's method
        }
        
        
        public static function addMediaMetaEntry($date,$type,$desc='',$user,$file='',$extra=''){        
                if(!inWiki($file)) {
                        return;
                }
                global $l;                
                global $conf;
                global $wiki;
                global $lang;
                if($user == '') $user = \OCP\User::getUser();
                $files_view = new \OC\Files\View('/'.$user .'/files');
                if($files_view->is_dir($file)) return false;
                $fileid = '#';
                $remote = clientIP(true);
                $strip = array("\t", "\n");
                $type = str_replace($strip, '', $type);
                if($date == 0 || $date == ''){
                        $data = $files_view->getFileInfo($file);
                        $fileid = $data['fileid'];
                        $date = $data['mtime'];
                }
                $filename = snipWiki($file);
                $wikiname = str_replace('/',':',$filename);// to wikiname
                if($type == '') $type = (self::isVersioned($wikiname))?DOKU_CHANGE_TYPE_EDIT:DOKU_CHANGE_TYPE_CREATE;
                if($type == DOKU_CHANGE_TYPE_CREATE) $desc = $l->t('created');
                if($desc==''){// Get the latest description as new description
                        require_once('dokuwiki/lib/helper.php');
                        $desc = dw_descriptionOfMediaFile($filename,false);
                        if($desc == $l->t('created') || $desc == $l->t('removed') || is_int($desc)) $desc = '';
                }
                if(!isset($_SERVER['REMOTE_USER'])) $_SERVER['REMOTE_USER'] = \OCP\User::getUser();
                if($extra=='')$extra="fileid=$fileid";
                addMediaLogEntry($date, pathToWikiID($filename), $type, $desc,$extra);// DokuWiki method /inc/changelog.php
        }
        
        // Not used anymore
        public static function dokuwikiUploadFinish($file,$user,$newFile){
                //self::addMediaMetaEntryOLD('',0,($newFile)? DOKU_CHANGE_TYPE_CREATE:DOKU_CHANGE_TYPE_EDIT,'',$user,$file,false);
        }


        public static function isVersioned($id){
                return file_exists(mediaMetaFN($id,'.changes'));
        }

        /**
         * rename versions of a file
*
* If $post == true, then we are called from the post-rename hook.
         */
        public static function rename($old_path, $new_path,$post = false) {
                // Prevent default behavior, if not inside wiki-folder
                global $wiki;
                global $l;
                global $conf;
                list($uid, $oldpath) = self::getUidAndFilename($old_path);
                list($uidn, $newpath) = self::getUidAndFilename($new_path);

                // Surprise, surprise. The /files view "sees" /wiki ...
                $files_view = new \OC\Files\View('/'.$uid .'/files');        

                if($post){
                        // after renaming update the meta-data
                        $from = snipWiki($old_path);
                        $wikiid = pathToWikiID($from);
                        $newWikiid = pathToWikiID(snipWiki($new_path));
                        $oldmeta = mediaMetaFN($wikiid,'.changes');
                        $newmeta = mediaMetaFN($newWikiid,'.changes');
                        if(@file_exists($oldmeta)){
                                        if (!@file_exists($newmeta)){
                                                $type = DOKU_CHANGE_TYPE_MOVE;
                                                rename($oldmeta,$newmeta);
                                        }else{
                                                $type = DOKU_CHANGE_TYPE_REPLACE;
                                                if(count(file($oldmeta)) > 1) io_saveFile($newmeta,file_get_contents($oldmeta),true); // Only if more than 1 line ("created") exists
                                                unlink($oldmeta);
                                        }
                                $pathinfo = pathinfo($old_path);
                                $dir = $pathinfo['dirname'];
                                $dir = $conf['mediaolddir'].substr($dir,strlen('/'.$wiki));
                                $filename = $pathinfo['filename'];
                                $ext = $pathinfo['extension'];
                                $pathinfonew = pathinfo($new_path);
                                $newdir = $pathinfonew['dirname'];
                                $newdir = $conf['mediaolddir'].substr($newdir,strlen('/'.$wiki));
                                $newfilename = $pathinfonew['filename'];
                                $newext = $pathinfonew['extension'];
                                $files = scandir($dir);
                                foreach($files as $file){
                                        if(preg_match("#$filename\.(\d*)\.$ext*#", $file,$timestamp)){
                                                        rename($dir.'/'.$file,$newdir.'/'.$newfilename.'.'.$timestamp[1].'.'.$newext);
                                        }
                                }
                        }
                        //addMediaLogEntry($date, $newWikiid, 'm', $sum.' '.$wikiid);
                        self::addMediaMetaEntry($date,$type,'',\OCP\User::getUser(),$new_path,$from);
                        //self::addMediaMetaEntryOLD($data['fileid'],$date,'m','','',$new_path,true);
                }else{
                        if(!inWiki($old_path)){
                                // $old_path outside wiki, but newpath may
                                // already exist in wiki. If so, stash the new
                                // path away.
                                if ($files_view->file_exists($newpath)) {
                                        return self::store($new_path);
                                }
                                
                        } else {
                                // before renaming remember the old file
                                self::store($old_path);
                        }
                }
        }

        /**Remove all versions generated by the core versions
* app. Only do this for files in the wiki media storage.
*
* @param[input] $path Path of the file. BIG FAT NOTE: only
* the OLD versions of this file are
* deleted. The actual instance is by no
* means affected.
*/
        public static function deleteOwnCloudVersions($path) {
                if(!inWiki($filename)) {
                        return;
                }
                // Finally undo the versioning from the core
                // files_version-app. Of course, this only works --
                // more or less -- reliably as long as the
                // files_version app does not use post-hooks (it does
                // not, currently). We simply delete everything
                // present in the versioning storage.
                if (\OC_App::isEnabled(self::DW_EMBED_NAME)) {
                        \OCA\Files_Versions\Storage::delete($path);
                }
        }
}
