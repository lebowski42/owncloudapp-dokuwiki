<?php

OCP\User::checkAdminUser();
OCP\App::checkAppEnabled('dokuwiki');

OCP\Util::addscript( 'dokuwiki', 'admin' );
$tmpl = new OCP\Template( 'dokuwiki', 'settings');

return $tmpl->fetchPage();
