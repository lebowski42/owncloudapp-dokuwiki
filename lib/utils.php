<?php
if(!defined('DOKU_INC')) define('DOKU_INC', OC_Appconfig::getValue('dokuwiki', 'dokuwikibase', '/var/www/dokuwikitest').'/');
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




?>
