<?php

OCP\User::checkAdminUser();

OCP\Util::addscript( 'dokuwiki', 'admin' );
$tmpl = new OCP\Template( 'dokuwiki', 'settings');

return $tmpl->fetchPage();
