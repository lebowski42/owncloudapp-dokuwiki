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
if(!isset($_POST['file'])){
	OCP\JSON::error(array("data" => array( "fileid" => '-1' )));
	
}else{	
	$uid = \OCP\User::getUser();
	\OC\Files\Filesystem::init($uid,'/'.$uid .'/files');
	$data = \OC\Files\Filesystem::getFileInfo($_POST['file']);
	OCP\JSON::success(array("data" => array("fileid" => $data['fileid'])));
}

?>
