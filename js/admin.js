$(document).ready(function(){
	// Initialize
	// wikidirname
	/*$('input[name=wikidirname]').change(function() {
		OC.AppConfig.setValue('dokuwiki',$(this).attr('name'),$(this).val());
	});*/
	
	// dokuwikiurl
	$('input[name=dokuwikiurl]').change(function() {
		OC.AppConfig.setValue('dokuwiki',$(this).attr('name'),$(this).val());
	});
	
	// dokuwikibase
	$('input[name=dokuwikibase]').change(function() {
		OC.AppConfig.setValue('dokuwiki',$(this).attr('name'),$(this).val());
	});
	
	$('#dokuwikideaccent').click(function() {
		OC.AppConfig.setValue('dokuwiki',$(this).attr('name'),$(this).val());
	});
	$('#dokuwikisepchar').click(function() {
		OC.AppConfig.setValue('dokuwiki',$(this).attr('name'),$(this).val());
	});
});
