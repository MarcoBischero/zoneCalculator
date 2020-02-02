<?
require('functions.php');
$auth_user = false;

if(!isset($_SESSION['userid'])){
	if(isset($_COOKIE['id']) && isset($_COOKIE['key'])){
		$id=fix_special_char_sql($_COOKIE['id']);
		$key=fix_special_char_sql($_COOKIE['key']);
		$auth = "SELECT id,id_ruolo,mode FROM ".$DBPrefix."risorse WHERE id=".$id." AND rand_key='".$key."'";
		}else{
			$id=fix_special_char_sql($_SESSION['userid']['id']);
			$auth = "SELECT id,id_ruolo,mode FROM ".$DBPrefix."risorse WHERE id=".$id;
		 }
		$result_auth = mysql_query($auth,CONN);
		@$row=mysql_fetch_array($result_auth);
		@$rows=mysql_num_rows($result_auth);
		if ($rows>0){
			lastaccess($row['id'],$_SERVER['REMOTE_ADDR'],$DBPrefix); //-> update last access
			$userinfo['id']= $row['id'];
			$userinfo['ruolo']= $row['id_ruolo'];
			$userinfo['mode']= $row['mode'];
			
			$_SESSION['userid']= $userinfo;	
	}
}


if(is_array($_SESSION['userid'])){

	if(is_numeric($_SESSION['userid']['ruolo']) && $_SESSION['userid']['ruolo']<>0){
		//echo $_SESSION['userid']['id'];
		$sql = "SELECT id_feature FROM ".$DBPrefix."ruoli_features WHERE id_ruolo=".$_SESSION['userid']['ruolo'];
		$result = mysql_query($sql,CONN);
		$rows = mysql_num_rows($result);
		if($rows!=0){
			while($row = mysql_fetch_array($result,MYSQL_ASSOC)){
				//build menu with the enabled pages
				//create a variable for each page for autentication
				$sql = "SELECT descrizione,pagina, ordine, class FROM ".$DBPrefix."features WHERE id=".$row['id_feature'];
				$result_pg = mysql_query($sql,CONN);
				$rows_pg = mysql_num_rows($result_pg);
				if($rows_pg!=0){
					$row_pg = mysql_fetch_array($result_pg,MYSQL_ASSOC);
					$pg = trim($_GET['pg']);
					$pg = str_replace('..','',$pg);
					$page_menu[$row_pg['pagina']] = $row_pg['ordine'].':'.$row_pg['descrizione'].':'.$row_pg['class']; //add array elements for menu
					if($pg==$row_pg['pagina']){
						$auth_user = true; //do i permessi per caricare la pagina
					}
				}
			}
		}		
	}else{
		$pg = 'norules.php';
	}
}else{
	$url=fix_special_char($_SERVER['QUERY_STRING'],1);
	
	$error = '<br /><br /><br />
<div align="center"><img src="img/alert.gif" /> <tag>Accesso non autorizzato</tag> </div>';
	header("Refresh: 1; URL=login.php?".$url);
	//redirect login.php
}
?>