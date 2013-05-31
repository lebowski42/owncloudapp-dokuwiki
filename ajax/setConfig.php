<?php
OCP\User::checkAdminUser();
OCP\JSON::callCheck();
OCP\Config::setAppValue("dokuwiki", $_POST['key'], $_POST['value']);
?>
