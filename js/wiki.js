Wiki={
	wiki: 'wiki',
	dokuwikiurl: 'http://localhost/wax',
	dokuwikidetail: '/lib/exe/detail.php',
	dokuwikibase: '/var/www/wax',
	//From DokuWiki
	align: "1",
	link: "2",
	size: "3",
	forbidden_opts: {},
	$popup: null,
	img: true,
	
	isFileNameValid:function (name) {
		if (name === '.') {
			OC.Notification.show(t('files', '\'.\' is an invalid file name.'));
			return false;
		}
		if (name.length == 0) {
			OC.Notification.show(t('files', 'File name cannot be empty.'));
			return false;
		}

		// check for invalid characters
		var invalid_characters = ['\\', '/', '<', '>', ':', '"', '|', '?', '*',')','(',']','[','{','}','&','%','$','§','+','!',' '];
		for (var i = 0; i < invalid_characters.length; i++) {
			if (name.indexOf(invalid_characters[i]) != -1) {
				OC.Notification.show(t('files', "Invalid name, '\\', '/', '<', '>', ':', '\"', '|', '?', '*',')','(',']','[','{','}','&','%','$','§','+','!' and spaces are not allowed."));
				return false;
			}
		}
		var daccent = 1;
		var success = true;
		if(daccent){
			$.ajax({
					type: 'POST',
					url: OC.filePath('dokuwiki', 'ajax', 'cleanid.php'),
					data: {file: name},
					async: false,
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
		return success;
		
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
		var detailurl = Wiki.dokuwikiurl + Wiki.dokuwikidetail + '?media=' + wikiid;
		
		//http://localhost/wax/doku.php?id=start&ns=neuer&image=neuer%3Aausgabe.pdf&do=media
		var mmurl = Wiki.dokuwikiurl + '/doku.php' + '?ns=' + encodeURIComponent(dir).replace( /\//g, ':' ).replace( /%2F/g, ':' ).substring(Wiki.wiki.length+1)+'&image='+ wikiid + '&do=media&tab_details=history';
		var html = '<div id="dropdown" class="drop drop-wiki" data-file="'+escapeHTML(file)+'">';
		html += '<div id="private" style="margin-bottom: 5px;">';
		html += '<button name="makelink" id="dokuwikidetail"> <img src="'+OC.imagePath('core','actions/search')+'" style="vertical-align:middle"> Detailseite</button>';
		//html += '<input type="button" value="Detailseite" name="makelink" id="dokuwikidetail" />';
		html += '<button name="makelink" id="dokuwikimediamanager"> <img src="'+OC.imagePath('core','actions/info')+'" style="vertical-align:middle"> Mediamanager</button>';
		//html += '<input type="button" value="Mediamanager" name="makelink" id="dokuwikimediamanager" style="margin-left: 5px;"/>';
		html += '</div>';
		html += '<div id="private">';
		html += '<input id="link" style="display:none; width:90%;" />';
		html += '</div>';
		html += '<div id="private" style="margin-bottom: 5px;">';
		html += '<button name="makelink" id="linkconfig"> <img src="'+OC.imagePath('core','actions/password')+'" style="vertical-align:middle"> Linkbauen</button>';
		//html += '<input type="button" value="Linkbauen" name="makelink" id="linkconfig"  />';
		html += '<input id="link" style="display:none; width:90%;" />';
		if(!isDir){
			html += '<button name="makelink" id="authors"> <img src="'+OC.imagePath('core','actions/shared')+'" style="vertical-align:middle"> Autoren</button>';
			//html += '<input type="button" value="Autoren" name="makelink" id="authors"  />';
		}
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
		$("#linkconfig").click(function() {
			$("#dropdown").hide();
			if(isDir) Wiki.dirpopup(file);
			else Wiki.mediapopup(file);
		});
		
	},
	
	authorpopup: function(file){
		$.ajax({url: OC.filePath('dokuwiki', 'ajax', 'authors.php'), async: false, data: {file: encodeURIComponent(file).replace( /%2F/g, ':' ) }, success: function(result) {
				if (result && result.status == 'success') {
					authorpopup = jQuery(document.createElement('div'))
						.attr('id', 'fileauthors')
						.dialog({ width: 280, height: 200,modal: false,
						draggable: true, title: "Autoren",
						resizable: true});
					authorpopup.append('<p><b>'+t('dokuwiki','File')+': '+file+'</b></p><hr/><div>'+result.data.message+'</div>');
					//OC.dialogs.prompt(result.data.message, 'Autoren');
				} else {
					OC.dialogs.alert(result.data.message, t('dokuwiki','No authorlist available'));
				}
			}});
	},
	
	gotoPage: function(url){
		window.open(url);
		//window.location.assign(url);
	},
	
	
	/* This method is original from DokuWiks /lib/scripts/media.js function initpopup. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
	mediapopup: function(filename){
		var opts, $insp, $insbtn;
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
                       .attr('title', text)
                       .click(bind(Wiki.setOpt, opt.id));//+ Wiki.setOpt
                

                $img = jQuery(document.createElement('img'))
                       .attr('src', Wiki.dokuwikiurl + '/lib/images/media_' +
                                    opt.id + '_' + text + '.png');
                                    

                $btn.append($img);
                //+ default checked buttons
                if(opt.id == 'link' && i == 1) $btn.css('border-style','inset');
                if(opt.id == 'align' && i == 0) $btn.css('border-style','inset');
                if(opt.id == 'size' && i == 2) $btn.css('border-style','inset');
                $p.append($btn);
            });
			//+ Wiki
            Wiki.$popup.append($p);
        });
        //+ Textfield for description
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $p.html('<label>Description: </label>' +
        '<textarea name="desc" id="desc" rows="2" style="overflow:hidden;width:90%;"></textarea>');
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
                  .val(t('dokuwiki', 'Insert'))
                  .click(function(){
						Wiki.insert(filename, $('#desc'));
				   });
        $insp.append($insbtn);
        
        Wiki.$popup.dialog('open');
	},
	
	
	dirpopup: function(filename){
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
        $p.html('<label>Description: </label>' +
        '<textarea name="desc" id="desc" rows="2" style="overflow:hidden;width:90%;"></textarea>');
        //$p.html('<label>Description: </label>' +
	      //'<input type="text" name="desc" id="desc" value="" >');
        Wiki.$popup.append($p);
        // Checkbox for direct
        $p = jQuery(document.createElement('p'));
        $p.css('padding-top','5px');
        $p.html('<input type="checkbox" name="dirdirect" id="dirdirect" value="direct"> Ordnerinhalt auf der Seite anzeigen?<br>');
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
                  .val(t('dokuwiki', 'Insert'))
                  .click(function(){
						Wiki.insert(filename, $('#desc'), $('#dirdirect'));
				   });
        $insp.append($insbtn);
        
        Wiki.$popup.dialog('open');
	},

	/* This method is original from DokuWiks /lib/scripts/media.js. Written by
	 * Andreas Gohr <andi@splitbrain.org> andPierre Spring <pierre.spring@caillou.ch>
	 * 
	 * Modifications marked with //+
	*/
	insert: function (id,textfield, checkbox) {
        var opts, alignleft, alignright, edid, s;

        // set syntax options
        //+ Wiki
        Wiki.$popup.dialog( "destroy" );
		if(typeof checkbox == "undefined"){
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
        $.ajax({
					type: 'POST',
					url: OC.filePath('dokuwiki', 'ajax', 'fileid.php'),
					data: {file: Wiki.wiki +'/'+id},
					async: false,
					success: function(result){
						if (result.status == 'success') {
							opts += (opts.length)?'&':'?';
							opts += 'fileid='+result.data.fileid;
						}
					}
			});
                          
        //+ add link copy
        id = id.replace( /\//g, ':' ).replace( /%2F/g, ':' );
		var link = '{{'+alignleft+id+opts+alignright+'|'+desc+'}}';
		linkpopup = jQuery(document.createElement('div'))
			.attr('id', 'media__popup_link')
			.dialog({autoOpen: false, modal: true, width: 600,
			         draggable: true, title: t('dokuwiki', 'Wikilink'),
			         close:  function(event, ui){$(this).dialog('destroy').remove();},resizable: false});
		$p = jQuery(document.createElement('p'));
        $p.html('<label>Hit Ctrl+C to copy the link to clipboard, and hit Ctrl+V then to insert it into the wikitext.</label><br/>' +
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
	}
}


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






