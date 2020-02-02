<?
/*------------------------------------------
CHECK SETUP*/
if (!file_exists( 'include/config.php' )){
	if(file_exists('setup/index.php')){
		header( 'Location: setup/index.php' );
		exit();
	}else{
		echo 'No configuration file found and no installation code available. Exiting...';
		exit();
	}
}elseif(file_exists( 'include/config.php') && file_exists('setup/index.php')){
		echo 'Setup folder still exists. Please delete it.';
		exit();
}

/*----------------------------------------*/
$redirect = false;
require_once("include/connection.php");
require_once("include/top.inc.php");
require_once("include/config.php");
require_once("include/auth_user.php");

cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<? 
		require_once("head.inc.php"); 
	?>
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="css/flatIcon/flaticon.css"> 
		
		<noscript><link rel="stylesheet" type="text/css" href="css/noJS.css" /></noscript>
			<!-- DataTables CSS -->
			<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.10/css/jquery.dataTables.css" />
			<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.0.0/css/responsive.dataTables.css" />
			<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/1.1.2/css/buttons.dataTables.min.css" />
			<link rel="stylesheet" href="jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css" />
			<script src="//code.jquery.com/jquery-1.10.2.js"></script>
			<script src="//code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
			<script type="text/javascript" src="js/js.cookie.js"></script>
			<script type="text/javascript" src="js/noty/packaged/jquery.noty.packaged.min.js"></script>
			<!-- DataTables -->
			<script type="text/javascript" src="https://cdn.datatables.net/1.10.10/js/jquery.dataTables.js"></script>
			<script type="text/javascript" src="https://cdn.datatables.net/responsive/2.0.0/js/dataTables.responsive.js"></script>
			<script type="text/javascript" src="https://cdn.datatables.net/buttons/1.1.2/js/dataTables.buttons.min.js"></script>

			<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js"></script>
			<script type="text/javascript" src="//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/pdfmake.min.js"></script>
			<script type="text/javascript" src="//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/vfs_fonts.js"></script>
			<script type="text/javascript" src="//cdn.datatables.net/buttons/1.1.2/js/buttons.print.min.js"></script>
			<script type="text/javascript" src="//cdn.datatables.net/buttons/1.1.2/js/buttons.html5.min.js"></script>
			<script charset='UTF-8'>
window['adrum-start-time'] = new Date().getTime();
(function(config){
    config.appKey = 'AD-AAB-AAH-JHR';
    config.adrumExtUrlHttp = 'http://cdn.appdynamics.com';
    config.adrumExtUrlHttps = 'https://cdn.appdynamics.com';
    config.beaconUrlHttp = 'http://col.eum-appdynamics.com';
    config.beaconUrlHttps = 'https://col.eum-appdynamics.com';
    config.xd = {enable : false};
})(window['adrum-config'] || (window['adrum-config'] = {}));
if ('https:' === document.location.protocol) {
    document.write(unescape('%3Cscript')
 + " src='https://cdn.appdynamics.com/adrum/adrum-4.3.7.1.js' "
 + " type='text/javascript' charset='UTF-8'" 
 + unescape('%3E%3C/script%3E'));
} else {
    document.write(unescape('%3Cscript')
 + " src='http://cdn.appdynamics.com/adrum/adrum-4.3.7.1.js' "
 + " type='text/javascript' charset='UTF-8'" 
 + unescape('%3E%3C/script%3E'));
}
</script>

			
			<link rel="stylesheet" href="css/media.css" />
			<script type="text/javascript" src="js/jquery.ui.touch-punch.min.js"></script>
			<script type="text/javascript" src="js/jquery.PrintArea.js"></script>

			<script type="text/javascript">
				$(function() {
					var tabs = $("#tabs").tabs({
						beforeLoad: function(event, ui) {
							if (ui.tab.data("loaded")) {
								event.preventDefault();
								return;
							}
							ui.ajaxSettings.cache = false,
								$("#logout").hide();
							ui.panel.html('<img alt="loading" src="img/ajax-loader.gif" width="15" height="15" style="vertical-align:middle;" /> Loading...'),
								ui.jqXHR.success(function() {
									ui.tab.data("loaded", true);
									$("#logout").show();
								}),
								ui.jqXHR.error(function() {
									ui.panel.html(
										"Couldn't load Data. Plz Reload Page or Try Again Later.");
								});
						},
						load: function(event, ui) { // load callback, hijacking every loaded panel
							//$(ui.panel).hijack();
						},
						collapsible: true,
						cache: false,
						//active: true, 
					});
					tabs.find(".ui-tabs-nav").sortable({
						axis: "x",
						stop: function() {
							tabs.tabs("refresh");
						}
					});
				});

				//Per abilitare la console rimuovere la linea sotto
				//console.table = function() {};
			</script>

			<style>
				table.dataTable.display tbody tr {
					background-color: #2191c0;
				}
				
				table.dataTable.stripe tbody tr.odd,
				table.dataTable.display tbody tr.odd {
					background-color: #2B72AC;
				}
				
				table.dataTable.hover tbody tr:hover,
				table.dataTable.hover tbody tr.odd:hover,
				table.dataTable.hover tbody tr.even:hover,
				table.dataTable.display tbody tr:hover,
				table.dataTable.display tbody tr.odd:hover,
				table.dataTable.display tbody tr.even:hover {
					background-color: #f39640;
				}
				
				table.dataTable tbody td {
					padding: 3px 5px;
				}
			</style>
	</head>

	<body>
		<?
	if($_GET['logout']=='1'){
		@session_start();
		@session_destroy();
		
		#Here is a way to delete alle cookies and cookie arrays from your domain.###########
		foreach ($_COOKIE as $key=>$value){
			if($key!="cookieconsent_dismissed"){
				setcookie($key,'', time()-1, "/" ,NULL,0);
			}
		}  
		####################################################################################
		echo $message_logout;
		header("Refresh: 1; URL=login.php");
		$redirect = true;
		@ob_end_flush();
	}
	if ($redirect == false){
		
	?>
			<div align="center" id='contentIndex' style="display:table; width: 100%;">
				<!-- dropDown menu 
<div style="z-index: 1000;top:1; right:1; position: relative;" class="panel">
	<div style="z-index: 1000; position: absolute; top:1; right: 1px;" id="dd" class="wrapper-dropdown-5" tabindex="1"><?=$_COOKIE['cognome'].' '.$_COOKIE['nome']?>
						<ul class="dropdown">
							<li><a href="#"><i class="fa fa-user"></i>Profile</a></li>
							<li><a href="#"><i class="fa fa-cog fa-fw"></i>Settings</a></li>
						</ul>
		</div>
		</div>
	-->
				<div id="tabs">
					<ul>
						<?
				if(is_array($page_menu)){
					asort($page_menu,SORT_NUMERIC);
					foreach($page_menu as $pagina=>$descrizione){
						list($ordine, $descrizione, $class)=split(":",$descrizione);
						
						
			?>
							<li>
								<a href="<?='pages/'.$pagina?>" id="<?=$descrizione?>" title="<?=$descrizione?>">
									<i class="<?=$class?>"></i>
									<span id="menuText">
										<?=$descrizione?>
									</span>
								</a>
							</li>
							<?
					}
				}
		?>
					</ul>
				</div>

				<br>
				<? require("include/logout.inc.php");?>

					<br />
					<div align="right" style="font-size:10px" class="bottom">
						Copyright &copy; 2007 MB</div>
					<div align="right" class="bottom">
						<a href="mailto:marco.biscardi@gmail.com?subject=zoneCalculator">
							<span class="ui-icon ui-icon-mail-closed"></span>
						</a>
					</div>
			</div>
			<?
				}
			?>
	</body>

	</html>
	<?
require_once("include/bottom.inc.php");
?>