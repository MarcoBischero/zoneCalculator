<?
/*------------------------------------------
CHECK SETUP*/
if (!file_exists( '../include/config.php' )){
	if(file_exists('../setup/index.php')){
		header( 'Location: ../setup/index.php' );
		exit();
	}else{
		echo 'No configuration file found and no installation code available. Exiting...';
		exit();
	}
}elseif(file_exists( '../include/config.php') && file_exists('../setup/index.php')){
		echo 'Setup folder still exists. Please delete it.';
		exit();
}

/*----------------------------------------*/
$redirect = false;
require_once("../include/connection.php");
require_once("../include/top.inc.php");
require_once("../include/config.php");
require_once("../include/auth_user.php");

cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Fabbisogno Proteico</title>
<script type="text/javascript"> 
$.getScript("js/ajax.js");
$.getScript("js/validator.js");

validator.message['empty'] = 'Obbligatorio';
		
		// validate a field on "blur" event, a 'select' on 'change' event & a '.reuired' classed multifield on 'keyup':
		$('#protNeed')
			.on('blur', 'input[required], input.optional, select.required', validator.checkField)
			.on('change', 'select.required', validator.checkField)
			.on('keypress', 'input[required][pattern]', validator.keypress);



		var n = noty({
			type        : 'information',
            dismissQueue: true,
            modal		: true,
            layout      : 'centerRight',
            theme       : 'defaultTheme',
			text: "Calcolo del fabbisogno proteico giornaliero, della massa magra, della percentuale di massa grassa e dei blocchi per la dieta zona.",
			});	
			
</script>
  
</head>