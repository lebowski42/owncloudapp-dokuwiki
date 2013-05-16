<?php
//require_once 'dokuwiki/versions.php';
OC::$CLASSPATH['OCA\DokuWiki\Storage'] = 'dokuwiki/lib/versions.php';
OC::$CLASSPATH['OCA\DokuWiki\Hooks'] = 'dokuwiki/lib/hooks.php';
OC::$CLASSPATH['OCA\DokuWiki\Capabilities'] = 'dokuwiki/lib/capabilities.php';

OCP\Util::addscript('dokuwiki', 'versions');
OCP\Util::addscript('dokuwiki', 'wiki');
//OCP\Util::addscript('dokuwiki', 'media');

// Listen to write signals
OCP\Util::connectHook('OC_Filesystem', 'write', "OCA\DokuWiki\Hooks", "write_hook");
OCP\Util::connectHook('OC_Filesystem', 'post_write', "OCA\DokuWiki\Hooks", "write_hook");
// Listen to delete and rename signals
OCP\Util::connectHook('OC_Filesystem', 'delete', "OCA\DokuWiki\Hooks", "pre_remove_hook");
OCP\Util::connectHook('OC_Filesystem', 'post_delete', "OCA\DokuWiki\Hooks", "remove_hook");
OCP\Util::connectHook('OC_Filesystem', 'rename', "OCA\DokuWiki\Hooks", "rename_hook");
//Listen to delete user signal
OCP\Util::connectHook('OC_User', 'pre_deleteUser', "OCA\DokuWiki\Hooks", "deleteUser_hook");
