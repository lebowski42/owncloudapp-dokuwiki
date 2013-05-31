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

if(!isset($_GET['file'])){
	OCP\JSON::error(array("data" => array( "message" => "No file given")));	
}else{	
	$uid = \OCP\User::getUser();
	\OC\Files\Filesystem::init($uid,'/'.$uid .'/files');
	$data = \OC\Files\Filesystem::getFileInfo($_GET['file']);
	$db = \OC_DB::prepare('SELECT `firstheading`,`wikipage` FROM `*PREFIX*dokuwiki_media_use` JOIN `*PREFIX*filecache` USING (fileid) WHERE fileid = ?');
	if($data['fileid']>0){
		$res = $db->execute(array($data['fileid']));
		$rows = $res->numRows();
		if($rows > 0){
			$ret = '<ul>';
			// TODO rewrite
			$url = \OC_Appconfig::getValue('dokuwiki', 'dokuwikiurl', 'http://www.exampl.org/dokuwiki').'/doku.php?id=';
			for($i = 1; $i <= $rows; $i++){
						$row = $res ->fetchRow();
						$title = ($row['firstheading']!='')?$row['firstheading'].' ('.$row['wikipage'].')':$row['wikipage'];
						$ret .= '<li><span class="curid"><a href="'.$url.$row['wikipage'].'" title="'.$title.'" target="_blank">'.$title.'</a></span></li>';
				}
			$ret .= '</ul>';
			OCP\JSON::success(array("data" => array("message" => $ret)));
		}else{
			OCP\JSON::error(array("data" => array("message" => "Media not in use")));
		}
	}else{
		OCP\JSON::error(array("data" => array( "message" => "File not found in database" )));	
	}
	
}
?>
