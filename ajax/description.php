<?php
/**
*  This file is part of the DokuWiki-app for owncloud.
*
* @author Martin Schulte
* @copyright 2013 Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
* 
*/

OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();

if(!isset($_POST['file'])){
	OCP\JSON::error(array("data" => array( "message" => "No Filename given." )));
}else{	
	$file = $_POST['file'];
	$file = str_replace(':','/',$file);
	require_once('dokuwiki/lib/helper.php');
	if(isset($_POST['ret'])){// return description
		$msg = dw_descriptionOfMediaFile($file,false);
	}else{
		if(!isset($_POST['desc'])) $msg = NO_DESCRIPTION;
		else $msg =dw_descriptionOfMediaFile($file,true,$_POST['desc']);
	}
	if($msg === METADATA_NOT_FOUND) OCP\JSON::error(array("data" => array( "message" => "No metadata found")));
	elseif($msg === CANNOT_GET_METADATA) OCP\JSON::error(array("data" => array( "message" => "Cannot get metadata.")));
	elseif($msg === UPDATE_DESCRIPTION) OCP\JSON::success(array("data" => array( "message" => 'Update Description for {file}' )));
	elseif($msg === NO_DESCRIPTION) OCP\JSON::error(array("data" => array( "message" => "No description given." )));
	else OCP\JSON::success(array("data" => array( "message" =>$msg)));
	
}	

// Using DB
/*if(!isset($_POST['fileid'])){
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
}*/

?>
