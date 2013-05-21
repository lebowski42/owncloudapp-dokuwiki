<form id="dokuwiki" action="#" method="post">
	<fieldset class="personalblock">
		<legend><strong><?php p($l->t('DokuWiki app configuration'));?></strong></legend>
		<!--<p>
			<label for="wikidirname"><?php p($l->t('Foldername (External Storage) for DokuWiki files').':');?></label>
			<input type="text" id="wikidirname" name="wikidirname" data-default="wiki" 
				value ="<?php echo(OCP\Config::getAppValue('dokuwiki', 'wikidirname' , 'wiki'));?>"
				title="<?php p($l->t("This is exactly the name, that you have chosen as the folder name for the external storage for your DokuWiki files, e.g. 'wiki' (see settings for 'External Storage' below)."));?>"
		</p>-->
		<p>
			<label for="dokuwikiurl"><?php p($l->t('URL to DokuWiki').':');?></label>
			<input type="text" id="dokuwikiurl" name="dokuwikiurl" data-default="http://example.org/dokuwiki"  style="width:250px;"
				value ="<?php echo(OCP\Config::getAppValue('dokuwiki', 'dokuwikiurl' , 'http://example.org/dokuwiki'));?>"
				title="<?php p($l->t('The URL to your DokiWiki-Site.'));?>">
		</p>
		<p>
			<label for="dokuwikibase"><?php p($l->t('Path to DokuWiki').':');?></label>
			<input type="text" id="dokuwikibase" name="dokuwikibase" data-default="/var/www/dokuwiki"  style="width:250px;"
				value ="<?php echo(OCP\Config::getAppValue('dokuwiki', 'dokuwikibase' , '/var/www/dokuwiki'));?>"
				title="<?php p($l->t('The path to your DokuWiki installation. This is the place, where doku.php is located. Do not use a trailing slash.'));?>">
		</p>
		<p>
			<label for="dokuwikideaccent"><?php p($l->t('Clean pagenames').':');?></label>
			<select id="dokuwikideaccent" name="dokuwikideaccent" data-default="0" title="<?php p($l->t('This have to be exactly the same value used for the config key "deaccent" in your DokuWiki installation.'));?>">
				<?php $default = OCP\Config::getAppValue('dokuwiki', 'dokuwikideaccent' , '0');?>
				<option <?php if($default==0) echo('selected');?> value="0"><?php p($l->t('off'));?></option>
				<option <?php if($default==1) echo('selected');?> value="1"><?php p($l->t('remove accents'));?></option>
				<option <?php if($default==2) echo('selected');?> value="2"><?php p($l->t('romanize'));?></option>
			</select>
		</p>
		<p>
			<label for="dokuwikisepchar"><?php p($l->t('Word separator in filenames').':');?></label>
			<select id="dokuwikisepchar" name="dokuwikisepchar" data-default="_" title="<?php p($l->t('This have to be exactly the same value used for the config key \"sepchar\" in your DokuWiki installation.'));?>">
				<?php $default = OCP\Config::getAppValue('dokuwiki', 'dokuwikisepchar' , '_');?>
				<option <?php if($default=='_') echo('selected');?> value="_">_</option>
				<option <?php if($default=='-') echo('selected');?> value="-">-</option>
				<option <?php if($default=='.') echo('selected');?> value=".">.</option>
			</select>
		</p>


        
		<span class="msg"></span>
	</fieldset>
</form>
