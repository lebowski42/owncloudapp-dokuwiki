<?php

OCP\JSON::checkAppEnabled('dokuwiki');
OCP\JSON::callCheck();

$userDirectory = "/".OCP\USER::getUser()."/files";

$file = $_GET['file'];
$revision=(int)$_GET['revision'];

if(OCA\DokuWiki\Storage::rollback( $file, $revision )) {
	OCP\JSON::success(array("data" => array( "revision" => $revision, "file" => $file )));
}else{
	$l = OC_L10N::get('dokuwiki');
	OCP\JSON::error(array("data" => array( "message" => $l->t("Could not revert: %s", array($file) ))));
}
