<?php

// Init owncloud


OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();
$count = 0;
// Get data
$dir = stripslashes($_POST["dir"]);
$success = false;
require_once('dokuwiki/lib/helper.php');
$success = isEmptyDir($dir);
if($success) \OC\Files\Filesystem::rmdir($dir);

if ($success) {
	OCP\JSON::success(array("data" => array( "message" => "Removed directory")));
} else {
	OCP\JSON::error(array("data" => array( "message" => "Directory have to be empty")));
}
