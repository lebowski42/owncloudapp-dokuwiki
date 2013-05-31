<?php
OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();

OCP\JSON::success(array("data" => \OC_Appconfig::getValues('dokuwiki',false)));
?>
