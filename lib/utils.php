<?php
if(!defined('DOKU_INC')) define('DOKU_INC', OC_Appconfig::getValue('dokuwiki', 'dokuwikibase', '/var/www/dokuwiki').'/');
if(!defined('DOKU_CONF')) define('DOKU_CONF',DOKU_INC.'conf/');
global $conf;
global $config_cascade;
$config_cascade = array();
$conf = array();
include_once(DOKU_CONF.'dokuwiki.php');
include_once(DOKU_CONF.'local.php');
require_once(DOKU_INC.'inc/config_cascade.php');
require_once(DOKU_INC.'inc/confutils.php');
require_once(DOKU_INC.'inc/pageutils.php');
require_once(DOKU_INC.'inc/utf8.php');
require_once(DOKU_INC.'inc/io.php');
require_once(DOKU_INC.'inc/common.php');


require_once(DOKU_INC.'inc/changelog.php');
require_once(DOKU_INC.'inc/media.php');
$conf['mediadir'] = DOKU_INC.$conf['savedir'].'/'.'media';
$conf['mediametadir'] = DOKU_INC.$conf['savedir'].'/'.'media_meta';
$conf['mediaolddir'] = DOKU_INC.$conf['savedir'].'/'.'media_attic';
//$conf['media_changelog'] = DOKU_INC.$conf['mediadir'].'/'.'_media.changes';
$conf['media_changelog'] = DOKU_INC.$conf['savedir'].'/meta/'.'_media.changes';
$conf['lockdir'] = DOKU_INC.$conf['savedir'].'/'.'locks';
$conf['datadir'] = 'pages';
global $wiki;
$wiki = 'wiki';
global $l;
$l = OC_L10N::get('dokuwiki');


// overwritte Dokuwikis msg-function (we need no output)
if(!function_exists('msg')){
	function msg(){};
}

if(!function_exists('clientIP')){
	function clientIP(){
			return $_SERVER['REMOTE_ADDR'];
	};
}

/**
	* Snips wiki from path
	*
	* @param $path path
	* @return $string path without leading /wiki/
*/
function snipWiki($path){
	global $wiki;
	return substr($path, -strlen($path) + strlen('/'.$wiki.'/'));
}

/**
	* Checks if a file is in the wiki-dir (leading /wiki/)
	*
	* @param $path path
	* @return $string true if inside, else false
*/
function inWiki($path){
	global $wiki;
	return $path != '' && (strncmp($path, '/'.$wiki, strlen('/'.$wiki)) == 0);	
}

/**
	* Converts a path to a wikiid (replaces / with :)
	*
	* @param $path path
	* @return $string wikiid
*/
function pathToWikiID($path){
	return str_replace('/',':',$path);
}

/**
	* If overwritting an existing file, oc creates a file with name
	* 'foobar (3).txt'. This is not a cleanid, but it must be written
	* to disc. This function checks this.
	*
	* @param $filename filename
	* @return $bool
*/
function allowedFilenameIfNotCleandID($filename){
		$i = preg_match('#.* \(\d\)\.?.*$#',$filename); // Filename OCP\Files::buildNotExistingFileName when uploaded file exists
		if($i == 1) return true;
		return false;
}


/**
	* Normally this app disables deleting of all files inside the wiki dir
	* from ownCloud (only deleting from DokuWiki is allowed). But there
	* are some files, which must be remove from oc. This are the temporary
	* files stored on disc when trying to overwrite an file. Say look like
	* 'foo (2).txt' and 'foo_2.txt'.
	*
	* @param $filename filename
	* @return $bool
*/
function fileAllowedToRemove($filename){
		$i = preg_match('#.*_\d\.?.*$#',$filename); // if cancel Upload of existing file.
		if($i == 1 || allowedFilenameIfNotCleandID($filename)) return true;
		return false;
}


?>
