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
error_reporting (E_ALL | E_STRICT);  
ini_set ('display_errors', 'On');

OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();

if(!isset($_GET['id'])){
	OCP\JSON::error(array("data" => array( "message" => "No FileID given." )));
}else{
	$url = OC_Appconfig::getValue('dokuwiki', 'dokuwikiurl', 'http://localhost/wax');
	$fetch = "$url/lib/exe/fetch.php";
	$query = \OC_DB::prepare('SELECT `timestamp`, `user`, `ip`, `desc`, `mod` FROM `*PREFIX*dokuwiki_media_meta` WHERE fileid=? ORDER BY `timestamp` DESC');
	$query->execute(array(intval($_GET['id'])));
	$rows = $query->numRows();
	if($rows <= 1)OCP\JSON::error(array("data" => array( "message" => "No versions"))); 
	else{
		$row = $query->fetchRow();// Skip current Version
		$ret = '<ul>';
		for($i = 2; $i <= $rows; $i++){
			$row = $query->fetchRow();
			$date = strftime('%Y/%m/%d %H:%M',$row['timestamp']);
			if(empty($row['user'])) $row['user'] = $row['ip'];
			if($row['mod'] != 'm') $ret .= '<li><a title="'.$row['desc'].'" href="'.$fetch.'?media='.$_GET['file'].'&rev='.$row['timestamp'].'" target="_blank"><b>'.htmlspecialchars($date).'</b>'.htmlspecialchars(' ('.$row['user'].')').'</a></li>';
		}
		$ret .= '</ul>';
		OCP\JSON::success(array("data" => array( "message" => $ret)));
	}
}



// Direc from DokuWikis medi meta files
/*if(!isset($_GET['id'])){
	OCP\JSON::error(array("data" => array( "message" => "No Filename given." )));
}else{	
	$file = $_GET['id'];
	$file = str_replace(':','/',$file);
	require_once('dokuwiki/lib/utils.php');
	global $conf;
	if(file_exists($conf['mediametadir'].'/'.$file.'.changes')){
		$meta = file($conf['mediametadir'].'/'.$file.'.changes');
		if(!empty($meta)){
			$authors = array(); 
			foreach($meta as $onemeta){
				$line = explode("\t", $onemeta);
				if($line[4] != "" && !in_array($line[4],$authors)) array_push($authors,$line[4]);
			}
			OCP\JSON::success(array("data" => array( "message" => implode(", ", $authors) )));
		}else{
			OCP\JSON::error(array("data" => array( "message" => "Cannot get metadata.")));
		}
	}else{
			OCP\JSON::error(array("data" => array( "message" => "No authorlist available")));
	}	
}*/


?>
