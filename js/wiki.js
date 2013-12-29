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

// We need Files, but not for the settings stuff. But it needs to be
// defined.
var Files = Files || {};

Wiki = {
	wiki: 'wiki',
	dokuwikiurl: 'http://localhost/dokuwiki',
	dokuwikidetail: '/lib/exe/detail.php',
	dokuwikibase: '/var/www/dokuwikitest',
        dokuwikiembed: 'disabled', // set to URL inside OC if embedding app is enabled
	dokuwikideaccent: '0',
	dokuwikisepchar: "_",
	//From DokuWiki
	align: "1",
	link: "1",
	size: "3",
	forbidden_opts: {},
	$popup: null,
	img: true,
	filenamecache: {},
	cleanfilenames: {},
	oldFileNameValid: function (name) { return false; },
        oldCheckName: function (modName, newName, isNewFile) { return false },

	// we call the old control function from Files and then add additional test.
	isFileNameValid:function (name) {
                if (!Wiki.oldFileNameValid(name)) {
                        return false;
                }

		//save ajax calls
		if(name in Wiki.filenamecache && Wiki.filenamecache[name] != undefined)  return Wiki.filenamecache[name];

		if(name.toLowerCase() != name){
			OC.Notification.show(t('dokuwiki', 'The file or folder name must be lowercase in the wiki/ folder'));
			return false;
		}
		// check for additonal invalid characters
		var invalid_characters = [/*'\\', '/', '<', '>', ':', '"', '|', '?', '*', */ ')','(',']','[','{','}','&','%','$','§','+','!',' '];
		for (var i = 0; i < invalid_characters.length; i++) {
			if (name.indexOf(invalid_characters[i]) != -1) {
				OC.Notification.show(t('dokuwiki', "Invalid name, \\, /, <, >, :, \", |, ?, *, ), (, ], [, {, }, &, %, $, §, +, ! and spaces are not allowed."));
				return false;
			}
		}
		var success = true;
		if(Wiki.dokuwikideaccent != '0'){
			$.ajax({
					type: 'POST',
					url: OC.filePath('dokuwiki', 'ajax', 'cleanid.php'),
					data: {file: name},
					async: true,
					success: function(result){
						if (result.status == 'success') {
							success = true;
							
						}else{
							OC.Notification.show(t('dokuwiki',result.data.message));
							success = false;
						}
					}
			});
		}
		if(success)	OC.Notification.hide();
		Wiki.filenamecache[name] = success;
		return success;	
	},	
	sanitizeFilename: function(name){
		oldname = name;
		//save ajax calls
		if(oldname in Wiki.cleanfilenames && Wiki.cleanfilenames[oldname] != undefined) return Wiki.cleanfilenames[oldname];
		name = name.replace(/ +/g,Wiki.dokuwikisepchar);
		//name = name.toLowerCase();
		if(Wiki.dokuwikideaccent != '0'){
			$.when(
				$.ajax({
					type: 'POST',
					url: OC.filePath('dokuwiki', 'ajax', 'cleanid.php'),
					data: {file: name, ret: '1'},
					async: false
				})
			).done(
				function(result){ name = result.data.message; }
			);
		}
		Wiki.cleanfilenames[oldname] = name;
		return name;
	},
	getUniqueName: function(name){
		if($('tr').filterAttr('data-file',name).length>0){
			var parts=name.split('.');
			var extension = "";
			if (parts.length > 1) {
				extension=parts.pop();
			}
			var base=parts.join('.');
			numMatch=base.match(/_(\d+)/);
			var num=2;
			if(numMatch && numMatch.length>0){
				num=parseInt(numMatch[numMatch.length-1])+1;
				base=base.split('_')
				base.pop();
				base=$.trim(base.join('_'));
			}
			name=base+'_'+num;
			if (extension) {
				name = name+'.'+extension;
			}
			return Wiki.getUniqueName(name);
		}
		return name;
	},
	wikiid: function(file){
			return file.replace( /\//g, ':' ).replace( /%2F/g, ':' );
	},
	createDescriptionPopup: function(file){
		fileid = Wiki.getFileID(file);
		file = file.substring(Wiki.wiki.length+1);
		Wiki.$popup = jQuery(document.createElement('div'))
			.attr('id', 'desc_popup')
			.dialog({autoOpen: false, width: 300, modal: true,
			         draggable: true, title: t('dokuwiki','Description of {file}',{file: file}),
			         //+ destroy on close
			         close:  function(event, ui){$(this).dialog('destroy').remove();},resizable: false});
        // Textfield for description
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $textarea = jQuery(document.createElement('textarea'))
                  .attr('name', 'filedesc')
                  .attr('id', 'filedesc')
                  .attr('rows', '8')
                  .attr('maxlength', '256')
                  .css('overflow','hidden')
                  .css('width','90%')
        //$p.html('<textarea name="filedesc" id="filedesc" rows="8" maxlength="256" style="overflow:hidden;width:90%;"></textarea>');
        $.ajax({
			type: 'POST',
			url: OC.filePath('dokuwiki', 'ajax', 'description.php'),
			data: {/*fileid: fileid*/file: encodeURIComponent(file).replace( /%2F/g, ':' ), ret: true},
			async: true,
			success: function(result){
				$textarea.val(result.data.message);
			}
		});
		$p.append($textarea);
        Wiki.$popup.append($p);
       
        
        // save and close button
        $insp = jQuery(document.createElement('p'));
        $insp.css('float','right')
        //+ Wiki
        Wiki.$popup.append($insp);

        $savebtn = jQuery(document.createElement('button'))
                  .attr('id', 'desc_savebtn')
                  .attr('type', 'button')
                  .addClass('button')
                  .append('<img src="'+OC.imagePath('core','actions/add')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Save changes'))
                  .click(function(){
					   $.ajax({
							type: 'POST',
							url: OC.filePath('dokuwiki', 'ajax', 'description.php'),
							data: {/*fileid: fileid*/file: encodeURIComponent(file).replace( /%2F/g, ':' ), desc: $('#filedesc').val()},
							async: true,
							success: function(result){
								OC.Notification.show(t('dokuwiki','Update description for {file}',{file: file}));
							}
						});
						Wiki.$popup.dialog("destroy");
				   });
        $insp.append($savebtn);
        $closebtn = jQuery(document.createElement('button'))
                  .attr('id', 'desc_closebtn')
                  .attr('type', 'button')
                  .addClass('button')
                  .append('<img src="'+OC.imagePath('core','actions/close')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Close'))
                  .click(function(){
					   Wiki.$popup.dialog("destroy");
				   });
        $insp.append($closebtn);
        
        Wiki.$popup.dialog('open');
	},

        makeDokuWikiURL: function(dwPath) {
                var dwURL = Wiki.dokuwikiurl;
                if (Wiki.dokuwikiembed && Wiki.dokuwikiembed != 'disabled') {
                        dwURL = Wiki.dokuwikiembed;
                        dwPath = '?wikiPath='+Wiki.urlencode(dwPath);
                }
                return dwURL + dwPath;
        },
	
	createWikiDropdown: function(filename, file, dir){
		// Check if it is a directory.
		isDir = false;
		if(file == ''){
				isDir = true;
				file = dir;
		}
		// Todo check rewrite
		file = file.substring(Wiki.wiki.length+1);
		var wikiid = file.replace( /\//g, ':' ).replace( /%2F/g, ':' );
		var detailurl = Wiki.makeDokuWikiURL(Wiki.dokuwikidetail + '?media=' + wikiid);
		
		//http://localhost/wax/doku.php?id=start&ns=neuer&image=neuer%3Aausgabe.pdf&do=media
	        var mmurl = Wiki.makeDokuWikiURL('/doku.php' + '?ns=' + encodeURIComponent(dir).replace( /\//g, ':' ).replace( /%2F/g, ':' ).substring(Wiki.wiki.length+1)+'&image='+ wikiid + '&do=media&tab_details=history');
		var html = '<div id="dropdown" class="drop drop-wiki" data-file="'+escapeHTML(file)+'">';
		html += '<div id="private" style="margin-bottom: 5px;">';
		html += '<button name="makelink" id="dokuwikidetail"> <img src="'+OC.imagePath('core','actions/search')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Details')+'</button>';
		//html += '<input type="button" value="Detailseite" name="makelink" id="dokuwikidetail" />';
		html += '<button name="makelink" id="dokuwikimediamanager"> <img src="'+OC.imagePath('core','actions/info')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Mediamanager')+'</button>';
		//html += '<input type="button" value="Mediamanager" name="makelink" id="dokuwikimediamanager" style="margin-left: 5px;"/>';
		html += '</div>';
		html += '<div id="private">';
		html += '<input id="link" style="display:none; width:90%;" />';
		html += '</div>';
			html += '<div id="private" style="margin-bottom: 5px;">';
		html += '<button name="usedin" id="usedin"> <img src="'+OC.imagePath('core','actions/password')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Usage on ...')+'</button>';
		if(!isDir){
			html += '<button name="authors" id="authors"> <img src="'+OC.imagePath('core','actions/shared')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Authors')+'</button>';
			//html += '<input type="button" value="Autoren" name="makelink" id="authors"  />';
		}
		html += '</div>';
		html += '<div id="private" style="margin-bottom: 5px;">';
		html += '<button name="makelink" id="linkconfig"> <img src="'+OC.imagePath('core','filetypes/model.png')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Create wikilink')+'</button>';
		//html += '<input type="button" value="Linkbauen" name="makelink" id="linkconfig"  />';
		if(!isDir){
			html += '<button name="versions" id="versions"> <img src="'+OC.imagePath('core','actions/clock')+'" style="vertical-align:middle"> '+t('dokuwiki', 'Versions')+'</button>';
			//html += '<input type="button" value="Autoren" name="makelink" id="authors"  />';
		}
		html += '<input id="link" style="display:none; width:90%;" />';
		html += '</div>';
	
		
		// highlight
		$('tr').filterAttr('data-file',filename).addClass('mouseOver');
		$(html).appendTo($('tr').filterAttr('data-file',filename).find('td.filename'));
		//Link to dokuwiki detailpage
		$("#dokuwikidetail").click(function() {
			$("#dropdown").hide();
			Wiki.gotoPage(detailurl);
		});
		//Link to dokuwiki mediamanger
		$("#dokuwikimediamanager").click(function() {
			$("#dropdown").hide();
			Wiki.gotoPage(mmurl);
		});
		$("#authors").click(function() {
			$("#dropdown").hide();
			Wiki.authorpopup(file);
		});
		$("#usedin").click(function() {
			$("#dropdown").hide();
			Wiki.usedinpopup(file);
		});
		$("#linkconfig").click(function() {
			$("#dropdown").hide();
			if(isDir) Wiki.dirpopup(file);
			else Wiki.mediapopup(file);
		});
		$("#versions").click(function() {
			$("#dropdown").hide();
			Wiki.versionspopup(file);
		});
		
	},
	versionspopup: function(file){
                var popup = $('#wikiversions');
                if (popup.length > 0) {
                        popup.dialog('close');
                        popup.dialog('destroy').remove();
                        popup.remove();
                }
		$.ajax({url: OC.filePath('dokuwiki', 'ajax', 'wikiVersions.php'), async: false, data: {file: file, id: Wiki.getFileID(file)/*encodeURIComponent(file).replace( /%2F/g, ':' )*/}, success: function(result) {
                        popup = jQuery(document.createElement('div'))
                                .attr('id', 'wikiversions')
                                .dialog({ width: 280,
                                          height: 'auto',
                                          modal: false,
					  draggable: true,
                                          title: t('dokuwiki', 'Versions'),
					  resizable: true,
                                          // close: function(event, ui) {
                                          //         $('#wikiversions').dialog('close');
                                          //         $('#wikiversions').dialog('destroy').remove();
                                          // }
                                        });	
			popup.append('<p><b>'+t('dokuwiki','File')+': '+file+'</b></p><hr/><div>'+t('dokuwiki',result.data.message)+'</div>');
                        $('a.wikiversion').click(function (event) {
                                if ($('#wikiversionshow').length > 0) {
                                        $('#wikiversionshow').dialog('close');
                                        $('#wikiversionshow').dialog('destroy').remove();
                                        $('#wikiversionshow').remove();
                                }
                                event.preventDefault();
                                var versionURL = $(this).attr('href');
                                popup = jQuery(document.createElement('div'))
                                        .attr('id', 'wikiversionshow');
                                popup.append('<iframe id="wikiversionshowframe" src="'+versionURL+'" height="100%" width="100%"></iframe>');
                                popup.dialog({ width: 'auto',
                                               height: 'auto',
                                               modal: false,
                                               draggable: true,
                                               title: t('dokuwiki', file),
                                               close: function(event, ui) {
                                                       $('#wikiversionshowframe').remove();
                                                       $('#wikiversionshow').dialog('close');
                                                       $('#wikiversionshow').dialog('destroy').remove();
                                               }
                                             });
                                $('#wikiversionshowframe').load(function () {
                                        popup.height($(this).contents().height());
                                        popup.width($(this).contents().width());
                                });
                        });
		}});
	},	
	authorpopup: function(file){
                var popup = $('#fileauthors');
                if (popup.length > 0) {
                        popup.dialog('close');
                        popup.dialog('destroy').remove();
                        popup.remove();
                }
		$.ajax({url: OC.filePath('dokuwiki', 'ajax', 'authors.php'), async: false, data: {id: /*Wiki.getFileID(file)*/encodeURIComponent(file).replace( /%2F/g, ':' )}, success: function(result) {
			popup = jQuery(document.createElement('div'))
				.attr('id', 'fileauthors')
				.dialog({ width: 280, height: 200,modal: false,
					  draggable: true, title: t('dokuwiki', 'Authors'),
					  resizable: true});	
			popup.append('<p><b>'+t('dokuwiki','File')+': '+file+'</b></p><hr/><div>'+t('dokuwiki',result.data.message)+'</div>');
		}});
	},
	
	usedinpopup: function(file){
                var popup = $('#fileusedin');
                if (popup.length > 0) {
                        popup.dialog('close');
                        popup.dialog('destroy').remove();
                        popup.remove();
                }
		$.ajax({url: OC.filePath('dokuwiki', 'ajax', 'mediaUse.php'), async: false, data: {file: Wiki.wiki +'/'+file}, success: function(result) {
			popup = jQuery(document.createElement('div'))
				.attr('id', 'fileusedin')
				.dialog({ width: 280, height: 200,modal: false,
				          draggable: true, title: t('dokuwiki', 'Usage on ...'),
				          resizable: true});
			popup.append('<p><b>'+t('dokuwiki','File')+': '+file+'</b></p><hr/><div>'+t('dokuwiki',result.data.message)+'</div>');
		}});
	},
	
	gotoPage: function(url){
                if (Wiki.dokuwikiembed) {
		        //window.location.assign(url);
		        window.open(url, '_self');
                } else {
		        window.open(url, 'DokuWiki');
                }
	},
	
	getFileID: function(filename){
		return $('tr').filterAttr('data-file', filename.replace( /.*\//,'')).attr('data-id');
	},
	
	/* This method is original from DokuWiks /lib/scripts/media.js function initpopup. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
	mediapopup: function(filename){
		var opts, $insp, $insbtn;
		fileid = Wiki.getFileID(filename);
		//+ Wiki
		Wiki.$popup = jQuery(document.createElement('div'))
			.attr('id', 'media__popup_content')
			.dialog({autoOpen: false, width: 300, modal: true,
			         draggable: true, title: t('dokuwiki', 'Linksettings'),
			         //+ destroy on close
			         close:  function(event, ui){$(this).dialog('destroy').remove();},resizable: false});
		//+ ownClouds translationssystem.
        opts = [{id: 'link', label: t('dokuwiki', 'Linktarget'),
                 btns: ['lnk', 'direct', 'nolnk', 'displaylnk']},
                {id: 'align', label: t('dokuwiki', 'Alignment'),
                 btns: ['noalign', 'left', 'center', 'right']},
                {id: 'size', label: t('dokuwiki', 'Mediasize'),
                 btns: ['small', 'medium', 'large', 'original']}
               ];
		//+ show Buttons only for images
		Wiki.img = Wiki.isImage(filename);
        jQuery.each(opts, function (_, opt) {
            var $p, $l;
            $p = jQuery(document.createElement('p'))
                 .attr('id', 'media__' + opt.id);
			//+ showbuttons
            if (!Wiki.img) {
                $p.hide();
            }

            $l = jQuery(document.createElement('label'))
                 .text(opt.label);
            $p.append($l);

            jQuery.each(opt.btns, function (i, text) {
                var $btn, $img;
                $btn = jQuery(document.createElement('button'))
                       .addClass('button')
                       .attr('id', "media__" + opt.id + "btn" + (i + 1))
                       .attr('title', t('dokuwiki', text))
                       .click(bind(Wiki.setOpt, opt.id));//+ Wiki.setOpt
                

                $img = jQuery(document.createElement('img'))
                       .attr('src', Wiki.dokuwikiurl + '/lib/images/media_' +
                                    opt.id + '_' + text + '.png');
                                    

                $btn.append($img);
                //+ default checked buttons
                if(opt.id == 'link' && i == 0) $btn.css('border-style','inset');
                if(opt.id == 'align' && i == 0) $btn.css('border-style','inset');
                if(opt.id == 'size' && i == 3) $btn.css('border-style','inset');
                $p.append($btn);
            });
			//+ Wiki
            Wiki.$popup.append($p);
        });
        //+ Textfield for description
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $p.html('<label>'+t('dokuwiki','Image/file title')+':</label>' +
        '<textarea name="desc" id="desc" rows="2" style="overflow:hidden;width:90%;"></textarea>');
        //$p.html('<label>Description: </label>' +
	      //'<input type="text" name="desc" id="desc" value="" >');
        Wiki.$popup.append($p);
        if (Wiki.img){
			$p = jQuery(document.createElement('p'));
			$p.css('padding-top','5px');
			$p.html('<input type="checkbox" name="imagebox" id="imagebox" value="imagebox"> '+t('dokuwiki','Frame and caption?')+'<br>');
			Wiki.$popup.append($p);
		}
        
        // insert button
        $insp = jQuery(document.createElement('p'));
        //+ Wiki
        Wiki.$popup.append($insp);

        $insbtn = jQuery(document.createElement('input'))
                  .attr('id', 'media__sendbtn')
                  .attr('type', 'button')
                  .addClass('button')
                  .val(t('dokuwiki', 'Create wikilink'))
                  .click(function(){
						Wiki.insert(filename,fileid,$('#desc'),$('#imagebox'),true);
				   });
        $insp.append($insbtn);
        
        Wiki.$popup.dialog('open');
	},
	
	
	dirpopup: function(filename){
		fileid = Wiki.getFileID(filename);
		var opts, $insp, $insbtn;
		//+ Wiki
		Wiki.$popup = jQuery(document.createElement('div'))
			.attr('id', 'media__popup_content')
			.dialog({autoOpen: false, width: 300, modal: true,
			         draggable: true, title: t('dokuwiki', 'Linksettings'),
			         //+ destroy on close
			         close:  function(event, ui){$(this).dialog('destroy').remove();},resizable: false});
        // Textfield for description
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $p.html('<label>'+t('dokuwiki','Title')+'</label>' +
        '<textarea name="desc" id="desc" rows="2" style="overflow:hidden;width:90%;"></textarea>');
        //$p.html('<label>Description: </label>' +
	      //'<input type="text" name="desc" id="desc" value="" >');
        Wiki.$popup.append($p);
        // Checkbox for direct
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $p.html('<input type="checkbox" name="dirdirect" id="dirdirect" value="direct"> '+t('dokuwiki','Show the folder content directly on the page?')+'<br>');
        //$p.html('<label>Description: </label>' +
	      //'<input type="text" name="desc" id="desc" value="" >');
        Wiki.$popup.append($p);
        
        
        // insert button
        $insp = jQuery(document.createElement('p'));
        //+ Wiki
        Wiki.$popup.append($insp);

        $insbtn = jQuery(document.createElement('input'))
                  .attr('id', 'media__sendbtn')
                  .attr('type', 'button')
                  .addClass('button')
                  .val(t('dokuwiki', 'Create wikilink'))
                  .click(function(){
						Wiki.insert(filename,fileid, $('#desc'), $('#dirdirect'),false);
				   });
        $insp.append($insbtn);
        
        Wiki.$popup.dialog('open');
	},
	
	
	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> and Pierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
	insert: function (id,fielid,textfield, checkbox,file) {
        var opts, alignleft, alignright, edid, s;

        // set syntax options
        //+ Wiki
        Wiki.$popup.dialog( "destroy" );
        // We have a directory
		if(file){
			opts = '';
			alignleft = '';
			alignright = '';
			//+ Wiki
			if(Wiki.img) {
				//+ Wiki
				if (Wiki.link === '4') {
						opts = '?linkonly';
				} else {
					//+ Wiki & Wiki.img
					if (Wiki.link === "3" && Wiki.img) {
						opts = '?nolink';
					//+ Wiki & Wiki.img
					} else if (Wiki.link === "2" && Wiki.img) {
						opts = '?direct';
					}

					s = parseInt(Wiki.size, 10);

					if (s && s >= 1 && s < 4) {
						opts += (opts.length)?'&':'?';
						//+ Wiki
						opts += Wiki.size + '00';
						//+ Wiki
						if (Wiki.ext === 'swf') {
							switch (s) {
							case 1:
								opts += 'x62';
								break;
							case 2:
								opts += 'x123';
								break;
							case 3:
								opts += 'x185';
								break;
							}
						}
					}
					//+ Wiki
					if (Wiki.align !== '1') {
						//+ Wiki
						alignleft = Wiki.align === '2' ? '' : ' ';
						alignright = Wiki.align === '4' ? '' : ' ';
					}
				}
			}
		}else{
			alignleft = '';
			alignright = '';
			if(typeof checkbox.attr('checked') != 'undefined') opts = '?direct';
			else opts='';
		}
        //+ Description
        desc = textfield.val();
        //+ Delete
        /*edid = String.prototype.match.call(document.location, /&edid=([^&]+)/);
        opener.insertTags(edid ? edid[1] : 'wiki__text',
                          '{{'+alignleft+id+opts+alignright+'|','}}','');*/
        //+ getFileID
        if(fileid =='' || fileid <=0){
			$.ajax({
					type: 'POST',
					url: OC.filePath('dokuwiki', 'ajax', 'fileid.php'),
					data: {file: Wiki.wiki +'/'+id},
					async: false,
					success: function(result){
						if (result.status == 'success') {
							fileid= result.data.fileid;
						}
					}
			});
        }
        opts += (opts.length)?'&':'?';
		opts += 'fileid='+fileid;
        //+ add link copy
        id = id.replace( /\//g, ':' ).replace( /%2F/g, ':' );
		var link = '{{'+alignleft+id+opts+alignright+'|'+desc+'}}';
		if(file && typeof checkbox.attr('checked') != 'undefined') link = '['+link+']';
		linkpopup = jQuery(document.createElement('div'))
			.attr('id', 'media__popup_link')
			.dialog({autoOpen: false, modal: true, width: 600,
			         draggable: true, title: t('dokuwiki', 'Wikilink'),
			         close:  function(event, ui){$(this).dialog('destroy').remove();},resizable: false});
		$p = jQuery(document.createElement('p'));
        $p.html('<label>'+t('dokuwiki','Hit Ctrl+C to copy the link to clipboard, and hit Ctrl+V then to insert it into the wikitext.')+'</label><br/>' +
	      '<input type="text" name="link" id="link" value="'+link+'" style="width:90%;font: 150% monospace;">');
        linkpopup.append($p);
        $insp = jQuery(document.createElement('p'));
        linkpopup.append($insp);
        $insbtn = jQuery(document.createElement('input'))
                  .attr('id', 'media__sendbtn')
                  .attr('type', 'button')
                  .addClass('button')
                  .val(t('dokuwiki', 'OK'))
                  .click(function(){
						linkpopup.dialog( "destroy" );
				   });
        $insp.append($insbtn);
        // Select field contents
        $p.find('#link').focus(function(){
			this.select();
		});
		linkpopup.dialog('open');         
		
        //+ Delete
        
        return false;
    },

	
	
	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
	setOpt: function(opt, e){
        var val, i;
        if (typeof e !== 'undefined') {
            val = this.id.substring(this.id.length - 1);
        } else {
			//+ Wiki
            val = Wiki.getOpt(opt);
        }

        //+ delete

        if (opt === 'link') {
			//+ Wiki
            if (val !== '4' && Wiki.link === '4') {
				//+ Wiki
                Wiki.unforbid('linkonly');
                //+ Wiki
                Wiki.setOpt('align');
                //+ Wiki
                Wiki.setOpt('size');
                //+ show
                jQuery("#media__size, #media__align").show('slow');
            } else if (val === '4') {
				//+ Wiki
                Wiki.forbid('linkonly', {align: false, size: false});
                //+ dw_toggle to hide
                 jQuery("#media__size, #media__align").hide('slow');
            }
			
           
        }

		//+ Delete Cookie
		
		//+ Wiki
        Wiki[opt] = val;
        //+ no selected, set css direct
        for (i = 1; i <= 4; i++) {
            //jQuery("#media__" + opt + "btn" + i).removeClass('selected');
            jQuery("#media__" + opt + "btn" + i).css('border-style','');
        }
        //jQuery('#media__' + opt + 'btn' + val).addClass('selected');
        jQuery('#media__' + opt + 'btn' + val).css('border-style','inset');
        
    },

	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
    unforbid: function (group) {
		//+ Wiki
        delete Wiki.forbidden_opts[group];
    },

	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
    forbid: function (group, forbids) {
		//+ Wiki
        Wiki.forbidden_opts[group] = forbids;
    },

	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
    allowedOpt: function (opt, val) {
        var ret = true;
        //+ Wiki
        jQuery.each(Wiki.forbidden_opts,
                    function (_, forbids) {
                        ret = forbids[opt] !== false &&
                              jQuery.inArray(val, forbids[opt]) === -1;
                        return ret;
                    });
        return ret;
    },

	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
    getOpt: function (opt) {
		//+ Wiki
        var allowed = bind(Wiki.allowedOpt, opt);

        // Current value
        //+ Wiki
        if (Wiki[opt] !== false && allowed(Wiki[opt])) {
			//+ Wiki
            return Wiki[opt];
        }

        //+ Delete Cookie

        // size default
        if (opt === 'size' && allowed('2')) {
            return '2';
        }

        // Whatever is allowed, and be it false
        return jQuery.grep(['1', '2', '3', '4'], allowed)[0] || false;
    },
	
	getExtension: function(filename) {
		var parts = filename.split('.');
		return parts[parts.length - 1];
	},

	isImage: function(filename) {
		var ext = Wiki.getExtension(filename);
		switch (ext.toLowerCase()) {
			case 'jpg':
			case 'gif':
			case 'png':
			return true;
		}
		return false;
	},
	// Original from apps/files/js/filelist.js
	// Changed  FileList.isFilenameValid and FileList.checkname to Wiki.... 
	rename:function(name){
		var tr, td, input, form;
		tr=$('tr').filterAttr('data-file',name);
		tr.data('renaming',true);
		td=tr.children('td.filename');
		input=$('<input class="filename"/>').val(name);
		form=$('<form></form>');
		form.append(input);
		td.children('a.name').hide();
		td.append(form);
		input.focus();
		form.submit(function(event){
			event.stopPropagation();
			event.preventDefault();
			var newname=Wiki.sanitizeFilename(input.val());
			input.val(newname);
			if (!Wiki.isFileNameValid(newname)) {
				form.remove();
				td.children('a.name').show();
				return false;
			} else if (newname != name) {
				if (Wiki.fileAlreadyExists(name, newname, false)) {
					newname = name;
				} else {
					$.get(OC.filePath('files','ajax','rename.php'), { dir : $('#dir').val(), newname: newname, file: name },function(result) {
						if (!result || result.status == 'error') {
							OC.dialogs.alert(result.data.message, 'Error moving file');
							newname = name;
						}
					});

				}
			}
			tr.data('renaming',false);
			tr.attr('data-file', newname);
			var path = td.children('a.name').attr('href');
			td.children('a.name').attr('href', path.replace(encodeURIComponent(name), encodeURIComponent(newname)));
			if (newname.indexOf('.') > 0 && tr.data('type') != 'dir') {
				var basename=newname.substr(0,newname.lastIndexOf('.'));
			} else {
				var basename=newname;
			}
			td.find('a.name span.nametext').text(basename);
			if (newname.indexOf('.') > 0 && tr.data('type') != 'dir') {
				if (td.find('a.name span.extension').length == 0 ) {
					td.find('a.name span.nametext').append('<span class="extension"></span>');
				}
				td.find('a.name span.extension').text(newname.substr(newname.lastIndexOf('.')));
			}
			form.remove();
			td.children('a.name').show();
			return false;
		});
		input.keyup(function(event){
			if (event.keyCode == 27) {
				tr.data('renaming',false);
				form.remove();
				td.children('a.name').show();
			}
		});
		input.click(function(event){
			event.stopPropagation();
			event.preventDefault();
		});
		input.blur(function(){
			form.trigger('submit');
		});
	},
	// Original from apps/files/js/filelist.js
	// Here only if file exists is checked.
	fileAlreadyExists:function(oldName, newName) {
		if ($('tr').filterAttr('data-file', newName).length > 0) {
			var html;
			html = t('files', '{new_name} already exists', {new_name: escapeHTML(newName)});
			html = $('<span>' + html + '</span>');
			html.attr('data-oldName', oldName);
			html.attr('data-newName', newName);
			html.attr('data-isNewFile', false);
			OC.Notification.showHtml(html);
			return true;
		}
		return false;
	},
	checkName:function(modName, newName, isNewFile) {
		if (isNewFile || $('tr').filterAttr('data-file', newName).length > 0) {
			//renamedFilename = Wiki.sanitizeFilename(newName);
			if( Wiki.sanitizeFilename(newName)!=newName){
					OC.dialogs.alert(t('dokuwiki', '{new_name} is not a valid filename. Please rename it and try again.', {new_name: escapeHTML(newName)}), t('dokuwiki','Error uploading file'));
					//html = t('dokuwiki', '{new_name} is not a valid filename. Please rename it and try again.', {new_name: escapeHTML(newName)});	
			}
                }
                return Wiki.oldCheckName(modName, newName, isNewFile);
	},
	getAppConfig: function(){
		$.ajax({
			url: OC.filePath('dokuwiki', 'ajax', 'appConfig.php'),
			async: false,
			success: function(config) {
				if(config.status == 'success') {
                                        if('embeddeddokuwiki' in config.data) Wiki.dokuwikiembed = config.data['embeddeddokuwiki'];
					if('dokuwikibase' in config.data) Wiki.dokuwikibase = config.data['dokuwikibase'];
					if('dokuwikiurl' in config.data) Wiki.dokuwikiurl = config.data['dokuwikiurl'];
					if('dokuwikideaccent' in config.data) Wiki.dokuwikideaccent = config.data['dokuwikideaccent'];
					if('dokuwikisepchar' in config.data) Wiki.dokuwikisepchar = config.data['dokuwikisepchar'];
				}
			}
		});
	},
        urlencode: function(str) {
                // http://kevin.vanzonneveld.net
                // + original by: Philip Peterson
                // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // + input by: AJ
                // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // + improved by: Brett Zamir (http://brett-zamir.me)
                // + bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // + input by: travc
                // + input by: Brett Zamir (http://brett-zamir.me)
                // + bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // + improved by: Lars Fischer
                // + input by: Ratheous
                // + reimplemented by: Brett Zamir (http://brett-zamir.me)
                // + bugfixed by: Joris
                // + reimplemented by: Brett Zamir (http://brett-zamir.me)
                // % note 1: This reflects PHP 5.3/6.0+ behavior
                // % note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
                // % note 2: pages served as UTF-8
                // * example 1: urlencode('Kevin van Zonneveld!');
                // * returns 1: 'Kevin+van+Zonneveld%21'
                // * example 2: urlencode('http://kevin.vanzonneveld.net/');
                // * returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
                // * example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
                // * returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
                str = (str + '').toString();

                // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
                // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
                return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                        replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
        }
}
// Set configvalues
/*OC.AppConfig.getCall('getValue',{app:'dokuwiki',key:'dokuwikibase',defaultValue:'wiki'},function(q){Wiki.dokuwikibase = q;});
OC.AppConfig.getCall('getValue',{app:'dokuwiki',key:'dokuwikiurl',defaultValue:'wiki'},function(q){Wiki.dokuwikiurl = q;});
OC.AppConfig.getCall('getValue',{app:'dokuwiki',key:'dokuwikideaccent',defaultValue:'wiki'},function(q){Wiki.dokuwikideaccent = q;});
OC.AppConfig.getCall('getValue',{app:'dokuwiki',key:'dokuwikisepchar',defaultValue:'wiki'},function(q){Wiki.dokuwikisepchar = q;});*/
Wiki.getAppConfig();

function bind(fnc/*, ... */) {
    var Aps = Array.prototype.slice,
    // Store passed arguments in this scope.
    // Since arguments is no Array nor has an own slice method,
    // we have to apply the slice method from the Array.prototype
        static_args = Aps.call(arguments, 1);

    // Return a function evaluating the passed function with the
    // given args and optional arguments passed on invocation.
    return function (/* ... */) {
        // Same here, but we use Array.prototype.slice solely for
        // converting arguments to an Array.
        return fnc.apply(this,
                         static_args.concat(Aps.call(arguments, 0)));
    };
}


$(document).ready(function(){
	// Overwrite getUniqueName from apps/files/js/files.js (line 1061-1084) to sanitize filename for new files and folders
	getUniqueName = function(newname){
			return Wiki.getUniqueName(Wiki.sanitizeFilename(newname));
	}
	
	
        if (typeof FileActions !== 'undefined' && $('#dir').length > 0) {
		// Add versions button to 'files/index.php', but only outside the wiki-folder.
		if($('#dir').val().substr(0, 5) == '/'+Wiki.wiki){
                        FileActions.actions['file'][t('files_versions', 'Versions')] = false;
                        //FileActions.icons[t('files_versions', 'Versions')] = null;
			FileActions.register(
				'file'
				, t('dokuwiki', 'Description')
				, OC.PERMISSION_READ
				, function() {
					// Specify icon for wiki menu entry
					return OC.imagePath('core','actions/info');
				}
				,function(filename){
					// Action to perform when clicked
					if (scanFiles.scanning){return;}//workaround to prevent additional http request block scanning feedback
					var dir = $('#dir').val();
					var file = dir+'/'+filename;
					if (($('#dropdown').length > 0) && $('#dropdown').hasClass('drop-desc') ) {
						$('#dropdown').hide('blind', function() {
							$('#dropdown').remove();
							$('tr').removeClass('mouseOver');
						});
						// if another file is choose
						if (file != $('#dropdown').data('file')) {
							Wiki.createDescriptionPopup(file);
						}
					} else {
						Wiki.createDescriptionPopup(file);
						//Wiki.mediapopup(filename);
					}	
				}
			);
			FileActions.register(
				'file'
				, t('dokuwiki', 'Wiki')
				, OC.PERMISSION_READ
				, function() {
					// Specify icon for wiki menu entry
					return OC.imagePath('core','actions/history');
				}
				,function(filename){
					// Action to perform when clicked
					if (scanFiles.scanning){return;}//workaround to prevent additional http request block scanning feedback
					var dir = $('#dir').val();
					var file = dir+'/'+filename;
					if (($('#dropdown').length > 0) && $('#dropdown').hasClass('drop-wiki') ) {
						$('#dropdown').hide('blind', function() {
							$('#dropdown').remove();
							$('tr').removeClass('mouseOver');
						});
						// if another file is choose
						if (file != $('#dropdown').data('file')) {
							Wiki.createWikiDropdown(filename,file,dir);
						}
					} else {
						Wiki.createWikiDropdown(filename,file,dir);
						//Wiki.mediapopup(filename);
					}
					
					
					
				}
			);
			FileActions.register(
				'dir'
				, t('dokuwiki', 'Wiki')
				, OC.PERMISSION_READ
				, function() {
					// Specify icon for wiki menu entry
					return OC.imagePath('core','actions/history');
				}
				,function(filename){
					// Action to perform when clicked
					if (scanFiles.scanning){return;}//workaround to prevent additional http request block scanning feedback
					var parent = $('#dir').val();
					var dir = parent+'/'+filename;
					if (($('#dropdown').length > 0) && $('#dropdown').hasClass('drop-wiki') ) {
						$('#dropdown').hide('blind', function() {
							$('#dropdown').remove();
							$('tr').removeClass('mouseOver');
						});
						// if another file is choose
						if (dir != $('#dropdown').data('file')) {
							Wiki.createWikiDropdown(filename,'',dir);
						}
					} else {
						Wiki.createWikiDropdown(filename,'',dir);
						//Wiki.mediapopup(filename);
					}
				}
			);
			// Overwrite Delete-action from files-app
			FileActions.register('file', 'Delete',
				OC.PERMISSION_DELETE,
				function () {
					return OC.imagePath('core', 'actions/delete');
				}, 
				function (filename) {
					var pat = /.* \(\d\)\..*$/g;
					if(!pat.test(filename)){
						OC.Notification.show(t('dokuwiki', 'The file is opened in the Mediamanager. If you have sufficient rights, you can delete them or restore an older version.'));
						var dir = $('#dir').val();
						dir = dir.substring(Wiki.wiki.length+1);
						var file = dir+'/'+filename;
						var wikiid = file.replace( /\//g, ':' ).replace( /%2F/g, ':' );
						var mmurl = Wiki.makeDokuWikiURL('/doku.php' + '?ns=' + encodeURIComponent(dir).replace( /\//g, ':' ).replace( /%2F/g, ':' )+'&image='+ wikiid + '&do=media');
						Wiki.gotoPage(mmurl);
					}else{// From  apps/files/js/files.js
						if (Files.cancelUpload(filename)) {
							if (filename.substr) {
								filename = [filename];
							}
							$.each(filename, function (index, file) {
								var filename = $('tr').filterAttr('data-file', file);
								filename.hide();
								filename.find('input[type="checkbox"]').removeAttr('checked');
								filename.removeClass('selected');
							});
							procesSelection();
						} else {
							FileList.do_delete(filename);
						}
						$('.tipsy').remove();
					}
				}
			);
			FileActions.register('dir', 'Delete',
				OC.PERMISSION_DELETE,
				function () {
					return OC.imagePath('core', 'actions/delete');
				}, 
				function (dir) {
					//From FileList.do_delete, only delete empty folders.
					if (FileList.lastAction) {
						FileList.lastAction();
					}
					$.post(OC.filePath('dokuwiki', 'ajax', 'delete.php'),
							{dir:$('#dir').val()+'/'+dir},
							function(result){
								if (result.status == 'success') {
									var files = $('tr').filterAttr('data-file',dir);
									files.remove();
									files.find('input[type="checkbox"]').removeAttr('checked');
									files.removeClass('selected');
								} else {
									OC.dialogs.alert(t('dokuwiki', 'The folder can be deleted only if all files inside and subfolders have been deleted.'), t('dokuwiki', 'Delete folder'));
								}
					});
					
				}
			);
			FileActions.register('all', 'Rename',
				OC.PERMISSION_UPDATE,
				function () { 
					return OC.imagePath('core', 'actions/rename');
				},
				
				function (filename) {
					Wiki.rename(filename);
				}
			);
		}
	}
	// overwrite Files.isFileNameValid
	$(window).load(function(){
		if($('#dir').length != 0 && $('#dir').val().substr(0, 5) == '/'+Wiki.wiki){
                        Wiki.oldFileNameValid = Files.isFileNameValid;
		        Files.isFileNameValid = function(name){return Wiki.isFileNameValid(name)};

                        Wiki.oldCheckName = FileList.checkName;
		        FileList.checkName = function(oldName, newName, isNewFile){return Wiki.checkName(oldName, newName, isNewFile)};
                }
		$('#notification:first-child').on('click', '.cancel', function() {
			FileList.do_delete($('#notification > span').attr('data-oldName'));
		});	
		// Remove delete-action for wiki folder.
		if($('#dir').val() == '/'){
			$wiki = $("tr[data-file='"+Wiki.wiki+"']");
			$wiki.find('td.date').find('a.delete').remove();
			$actions = $wiki.find('td.filename').find('a.name').find('span.fileactions');
			$actions.find("a[data-action='Rename']").remove();
			$actions.find("a[data-action='Share']").remove();
		}
	});
});



$(this).click(
	function(event) {
		if ($('#dropdown').has(event.target).length === 0 && $('#dropdown').hasClass('drop-wiki')) {
			$('#dropdown').hide('blind', function() {
				$('#dropdown').remove();
				$('tr').removeClass('mouseOver');
			});
		}
}
);

$(this).click(
	function(event) {
	if ($('#dropdown').has(event.target).length === 0 && $('#dropdown').hasClass('drop-versions')) {
		$('#dropdown').hide('blind', function() {
			$('#dropdown').remove();
			$('tr').removeClass('mouseOver');
		});
	}


	}
);










