<?php
//require_once('dokuwiki/ajax/setConfig.php');
OC::$CLASSPATH['OCA\DokuWiki\Storage'] = 'dokuwiki/lib/versions.php';
OC::$CLASSPATH['OCA\DokuWiki\Hooks'] = 'dokuwiki/lib/hooks.php';
OC::$CLASSPATH['OCA\DokuWiki\Capabilities'] = 'dokuwiki/lib/capabilities.php';

//OCP\Util::addscript('dokuwiki', 'versions');
OCP\Util::addscript('dokuwiki', 'wiki');
//OCP\Util::addscript('dokuwiki', 'media');

// Settings
OCP\App::registerAdmin('dokuwiki', 'settings');

// Listen to write signals
OCP\Util::connectHook('OC_Filesystem', 'write', "OCA\DokuWiki\Hooks", "pre_write_hook");
OCP\Util::connectHook('OC_Filesystem', 'post_write', "OCA\DokuWiki\Hooks", "post_write_hook");
// Listen to delete and rename signals
OCP\Util::connectHook('OC_Filesystem', 'delete', "OCA\DokuWiki\Hooks", "pre_remove_hook");
OCP\Util::connectHook('OC_Filesystem', 'rename', "OCA\DokuWiki\Hooks", "pre_rename_hook");
OCP\Util::connectHook('OC_Filesystem', 'post_rename', "OCA\DokuWiki\Hooks", "post_rename_hook");

