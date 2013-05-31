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


// Direct from DokuWikis medi meta files
if(!isset($_GET['id'])){
	OCP\JSON::error(array("data" => array( "message" => "No Filename given." )));
}else{	
	$file = $_GET['id'];
	$file = str_replace(':','/',$file);
	require_once('dokuwiki/lib/helper.php');
	$authors = dw_getAuthorsOfMediaFile($file);
	if($authors === METADATA_NOT_FOUND) OCP\JSON::error(array("data" => array( "message" => "Cannot get metadata.")));
	elseif($authors === AUTHORS_NOT_FOUND) OCP\JSON::error(array("data" => array( "message" => "No authorlist available")));	
	else OCP\JSON::success(array("data" => array( "message" => $authors )));
	
}

// Using DB
/*if(!isset($_GET['id'])){
	OCP\JSON::error(array("data" => array( "message" => "No FileID given." )));
}else{	
	$userurl = OC_Appconfig::getValue('dokuwiki', 'dokuwikiuserurl', 'user:%USER%');
	$url = OC_Appconfig::getValue('dokuwiki', 'dokuwikiurl', 'http://localhost/wax');
	$query = \OC_DB::prepare('SELECT `user` FROM `*PREFIX*dokuwiki_media_meta` WHERE fileid=? GROUP BY `user` ORDER BY `user`ASC');
	$query->execute(array(intval($_GET['id'])));
	$rows = $query->numRows();
	$authors = array();
	for($i = 1; $i <= $rows; $i++){
		$row = $query->fetchRow();
		if($row['user'] != ''){
			$ref = '<a href="'.$url.'/doku.php?id='.str_replace('%USER%',$row['user'],$userurl).'" target="_blank">'.htmlspecialchars($row['user']).'</a>';
			array_push($authors,$ref);
		}
	}
	if($rows>0) OCP\JSON::success(array("data" => array( "message" => implode(', ', $authors))));
	else OCP\JSON::error(array("data" => array( "message" => "No authorlist available")));
}*/

?>
