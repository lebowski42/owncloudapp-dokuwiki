<?php
/**
*  This file is part of the DokuWiki-app for owncloud.
*
* @author Martin Schulte
* @copyright 2013 Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
* 
*/

OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();
if(!isset($_POST['fileid'])){
		OCP\JSON::error(array("data" => array( "message" => 'No fileid given' )));
}else{
	if(!isset($_POST['ret'])){
		if(!isset($_POST['desc'])){	
			OCP\JSON::error(array("data" => array( "message" => 'No description given.' )));
		}else{
			$query = \OC_DB::prepare('UPDATE `*PREFIX*dokuwiki_media_meta` SET `desc`=? WHERE fileid=? ORDER BY `timestamp` DESC LIMIT 1');
			$query->execute(array(htmlspecialchars($_POST['desc']),$_POST['fileid']));
			OCP\JSON::success(array("data" => array( "message" => 'Update Description for {file}' )));
		}
	}else{
		$query = \OC_DB::prepare('SELECT `desc` FROM `*PREFIX*dokuwiki_media_meta` WHERE fileid=? ORDER BY `timestamp` DESC LIMIT 1');
		$query->execute(array($_POST['fileid']));
		OCP\JSON::success(array("data" => array( "message" =>$query->fetchOne())));
	}
}

?>
