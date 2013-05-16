<?php
OCP\JSON::checkAppEnabled('dokuwiki');

$source = $_GET['source'];
list ($uid, $filename) = OCA\DokuWiki\Storage::getUidAndFilename($source);
$count = 5; //show the newest revisions
if( ($versions = OCA\DokuWiki\Storage::getVersions($uid, $filename, $count)) ) {

	$versionsFormatted = array();

	foreach ( $versions AS $version ) {
		$versionsFormatted[] = OCP\Util::formatDate( $version['version'] );
	}

	$versionsSorted = array_reverse( $versions );

	if ( !empty( $versionsSorted ) ) {
		OCP\JSON::encodedPrint($versionsSorted);
	}

} else {

	return;

}
