<?
require("include/connection.php");
require("include/top.inc.php");
require("include/functions.php");
require("include/config.php");
require("include/Crypt.php");
$error = false;
$redirect = false;
$check_key = false;
$pwdform = new HTML_Crypt(); 
$key=random_string();
$sql="INSERT INTO ".$DBPrefix."random_key(codice,data) VALUES('".$key."',NOW())";
$result_sql=mysql_query($sql,CONN);
$pwdform->setText('<input name="'.$key.'" type="password" class="input" id="'.$key.'" size="20" value=""/>');
$url=fix_special_char($_SERVER['QUERY_STRING'],1);
//colore expose
$color=random_string2();
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<? require("head.inc.php"); ?>
		<link rel="shortcut icon" href="logo.gif" />
		<link rel="stylesheet" href="jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css">
		<script src="jquery-ui-1.10.4.custom/js/jquery-1.10.2.js" type="text/javascript"></script>
		<script src="jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js" type="text/javascript"></script>
		<script src="js/jquery.tools.min.js" type="text/javascript"></script>
	</head>

	<body>

		<?
if(isset($_POST['Entra'])){
	$username=trim(fix_special_char($_POST['username'])); //function fix_special_char NOT fix_special_char_sql
	unset ($_POST['Entra']);
	unset ($_POST['username']);
	foreach($_POST as $pwdkey=>$password){
		$pwdkey = $pwdkey;
		$password = $password;
		break;
	}
	$sql="SELECT * from ".$DBPrefix."random_key WHERE codice='".$pwdkey."'";
	
	$result=mysql_query($sql,CONN);
	$rows=mysql_num_rows($result);
	if($rows>0){
		$check_key = true;
	}

	$password=trim(fix_special_char_sql($password));
	if(strlen($username)>0 && strlen($password)>0 && $check_key = true){
		$sql = "SELECT id FROM ".$DBPrefix."risorse WHERE username='".fix_special_char_sql($username)."'";
		$result = mysql_query($sql,CONN);
		$rows =  mysql_num_rows($result);
		if($rows!=0){
		
			$row = mysql_fetch_array($result, MYSQL_ASSOC);
			$password = md5(fix_special_char_sql($password)).":".md5($row['id']);
			$sql = "SELECT id,id_ruolo,nome,cognome, mode,sesso,cookie FROM ".$DBPrefix."risorse WHERE username='".fix_special_char_sql($username)."' AND password='".$password."'";
			$result = mysql_query($sql,CONN);
			$rows =  mysql_num_rows($result);
			if($rows!=0){				
				$row = mysql_fetch_array($result, MYSQL_ASSOC);
				$key = random_string();
				$update= "UPDATE ".$DBPrefix."risorse SET rand_key='".$key."' WHERE id=".$row['id'];
				$result_update = mysql_query($update);
				if($row['cookie']=='1'){
					setcookie("id", $row['id'], time()+60*60*24*30, "/" ,NULL,0); 
					setcookie("key", $key, time()+60*60*24*30, "/" ,NULL,0);
					setcookie("nome", $row['nome'], time()+60*60*24*30, "/" ,NULL,0); 
					setcookie("cognome", $row['cognome'], time()+60*60*24*30, "/" ,NULL,0);
					setcookie("sesso", $row['sesso'], time()+60*60*24*30, "/" ,NULL,0);
				}
				lastaccess($row['id'],$_SERVER['REMOTE_ADDR'],$DBPrefix); //-> update last access
				$userinfo['id']= $row['id'];
				$userinfo['ruolo']= $row['id_ruolo'];
				$userinfo['mode']= $row['mode'];
				$userinfo['sesso']= $row['sesso'];
				$_SESSION['userid']= $userinfo;
				echo $message_successful;			
				header("Refresh: 1; URL=index.php?".$url);
				$redirect = true;
			}else $error=true;
		}else $error=true;
	}else $error=true;
}
if($redirect == false){?>
	<table valign="top" bgcolor="#3288CB" width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="padding: 5px; color:#FFFFFF;" class="ui-corner-all">
		<tr>
			<td></td>
			<td>
				<div align="center" style="font-weight: bold">
					<img src="favicon/favicon-32x32.png" width="32" height="32" />
				</div>
			</td>
			<td></td>
		</tr>
		<tr>
			<td></td>
			<td>
				<div align="center" style="font-weight: bold">
					<?=$company.' WEB INTERFACE'?>
				</div>
			</td>
			<td></td>
		</tr>
		<tr>
			<td></td>
			<td>
				<form id="form1" name="form1" method="post" action="<?=$_SERVER['PHP_SELF']?>?<?=$url?>">
					<?
		if($error==true){
			echo "<div align=center> <font color=\"#ff9900\"><strong>Login non avvenuto</strong></font></div>";
			sleep(1);
		}
		?>
				<br>
				<table style="padding: 5px; color:#FFFFFF;" class="ui-corner-all" width="280" border="0" align="center" cellpadding="0" cellspacing="1" bgcolor="#1B486D">
					<!--DWLayoutTable-->
					<tr>
						<td height="20">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> Username </td>
						<td>
							<input name="username" type="text" class="input" id="username" size="20" value="<?=$username?>" /> </td>
					</tr>
					<tr>
						<td height="20">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> Password </td>
						<td>
							<? $pwdform->output(); ?>
						</td>
					</tr>
					<tr>
						<td height="35" colspan="2">
							<div align="center">
								<label for="Submit"></label>
								<div align="center">
									<button name="Entra" type="submit" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="Entra"><span class="ui-button-text">Entra</span></button>
								</div>
							</div>
						</td>
					</tr>
				</table>
				</form>
			</td>
			<td></td>
		</tr>
		<tr>
			<td></td>
			<td>
				<div align="left">
					<?=$CAMversion?>
				</div>
			</td>
			<td></td>
		</tr>
	</table>
	</body>
</html>
	<?
}
require("include/bottom.inc.php");

?>