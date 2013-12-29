<?php

OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();
OCP\App::checkAppEnabled('dokuwiki');

/* We fetch the array of config options and augment it by some
* auto-settings. Currently we check whether the dokuwikiembed app is
* also enabled. If so, any link to DokuWiki points to the proper page
* inside the embedded DokuWiki to give a more "consistent" look'n
* feel.
*/

$configOptions = \OC_Appconfig::getValues('dokuwiki',false);

$dwEmbedName = "dokuwikiembed";

if (\OC_App::isEnabled($dwEmbedName)) {
        /* If the app is enabled, we set the "faked" config-setting to
* the proper URL, otherwise to "disabled"
*/
        $configOptions["embeddeddokuwiki"] = \OCP\Util::linkTo($dwEmbedName, "index.php");
} else {
        $configOptions["embeddeddokuwiki"] = "disabled";
}

OCP\JSON::success(array("data" => $configOptions));
?>
