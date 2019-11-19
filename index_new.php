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

if(!is_dir('ordini')){
	mkdir("ordini", 0775); //standard files folder
	
}
if(!is_dir('piano_promo')){
	mkdir("piano_promo", 0775); //standard files folder
	
}
cancella_tmp('ordini');
cancella_tmp('piano_promo');
cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<? require_once("head.inc.php"); 
	
?>
<script src="jquery-ui-1.10.4.custom/js/jquery-1.10.2.js"></script>
<script src="jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js"></script>
<link rel="stylesheet" href="jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css">
<script src="js/ajax.js"></script>

<body>


<div align="center" id='content'>
	  <?
	if($_GET['logout']=='1'){
		@session_start();
		@session_destroy();
		
		#Here is a way to delete alle cookies and cookie arrays from your domain.###########
		foreach ($_COOKIE as $key=>$value) setcookie($key,'', time()-1, "/" ,NULL,0); 
		####################################################################################
		echo $message_logout;
		header("Refresh: 1; URL=login.php");
		$redirect = true;
		@ob_end_flush();
	}
	if ($redirect == false){
		
	?>
  
  <script>
    $(function() {
      $( "#tabs" ).tabs({
        beforeLoad: function( event, ui ) {
          ui.jqXHR.error(function() {
            ui.panel.html(
              "Couldn't load this tab. We'll try to fix this as soon as possible. " );
          });
        }
      });
    });
    
       </script>
    <style>.ui-tabs .ui-tabs-nav
    {
    background: #2191c0;
    }
    </style>
  <div id="tabs">
  <ul>
  	<?
			if(is_array($page_menu)){
			asort($page_menu,SORT_NUMERIC);
			foreach($page_menu as $pagina=>$descrizione){
				$descrizione=strstr($descrizione,':');
				
			?>
			<li><a href="#zoneCalculator-1">Preloaded</a></li>			<?
			}
			}
			?>
  </ul>
   <div id="zoneCalculator-1"><? require_once("pages/zoneCalculator.php"); ?></div>
</div>
<!-- <div id="menu">
		<table border="0" align="center" cellpadding="0" cellspacing="0">
		  <tr>
		  	<?
			if(is_array($page_menu)){
			asort($page_menu,SORT_NUMERIC);
			foreach($page_menu as $pagina=>$descrizione){
				$descrizione=strstr($descrizione,':');
				if ($pg==$pagina) $pg_class = "menu_over"; else $pg_class = "menu_out";
			?>
		    <td class="<?=$pg_class ?>" onMouseOver="this.className='menu_over';" onMouseOut="this.className='<?=$pg_class?>';" onClick="window.location.href='<?=$_SERVER['PHP_SELF'].'?pg='.$pagina?>';"><?=substr($descrizione,1)?></td>
			<?
			}
			}
			?>
		  </tr>
		</table>
	</div>
	<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#FFFFFF;">
	  <tr>
	    <td><img src="img/corner_top_left.gif" width="50" height="46" /></td>
	    <td width="100%" background="img/bg_pages_top.gif"><div align="center" style="font-weight: bold"><?=$company.' WEB INTERFACE'?> </div></td>
	    <td><img src="img/corner_top_right.gif" width="50" height="46" /></td>
	  </tr>
	  <tr>
	    <td height="129" background="img/bg_pages_left.gif">&nbsp;</td>
	    <td valign="top" bgcolor="#3288CB">
		  <p>
		    <?
		echo $error;
		$page_require_once='pages/'.$pg;
		$page_require_once=str_replace('..','',$page_require_once);
		if(is_file($page_require_once)){
			require_once($page_require_once);
		}elseif(isset($_SESSION['userid'])){
			$query_access = 'SELECT lastaccess,ip FROM '.$DBPrefix.'risorse WHERE id='.$_SESSION['userid']['id'].'';
			$result_access = mysql_query($query_access,CONN);
			$rows_access = mysql_num_rows($result_access);
			if ($rows_access > 0){
				$row_access = mysql_fetch_array($result_access);
				echo lastaccesshtml($row_access['lastaccess'],$row_access['ip']);
			}else echo lastaccesshtml('');
			
		}
		?>
	&nbsp;	</p>
	
	  <div align="right"><?=$CAMversion?></div> </td>
	    <td background="img/bg_pages_right.gif">&nbsp;</td>
	  </tr>
	  <tr>
	    <td height="33"><img src="img/corner_bottom_left.gif" width="50" height="52" /></td>
	    <td background="img/bg_pages_bottom.gif"><? require_once("include/logout.inc.php");?></td>
	    <td><img src="img/corner_bottom_right.gif" width="50" height="52" /></td>
	  </tr>
	</table>
			-->
	
	<?
	
	}
	?>
	<br />
	<div align="center">
		Copyright © 2007 Marco Biscardi - <tag>Sito Web</tag>: <a style="color:#0033CC" href="http://mycam.no-ip.info">http://mycam.no-ip.info</a> 
	</div>
	<div align="center">
		<a href="mailto:marco.biscardi@gmail.com?subject=CAM">
	    	<img src="img/message-me.png" border="0"/>
	    </a>
	</div>
</div>	
</body>
</html>
<?
require_once("include/bottom.inc.php");
?>
