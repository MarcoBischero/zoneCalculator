<title>Profilo</title>
<? 
$error = false;
$userid=$_COOKIE['id'];
			if(is_numeric($userid)){
				$query = 'SELECT password,cookie FROM '.$DBPrefix.'risorse WHERE id='.$userid;
				
				$result = mysql_query($query,CONN);
				$rows = mysql_num_rows($result);
				if ($rows != 0){
					$row = mysql_fetch_array($result, MYSQL_ASSOC);
					$password = fix_special_char($row['password']);
				}
			}else{
				$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Parametro ID non valido</strong></font></div><br>";
				$error = true;
				echo $errore;			
			}

if(isset($_POST['Modifica'])){
	$old_password=	trim(fix_special_char($_POST['old_password']));	
	$old_password_chk = md5($old_password).":".md5($userid);
	if($old_password_chk!=$password && strlen($old_password)>0){
		$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>La vecchia password &egrave; errata</strong></font></div><br>";
		echo $errore;
		$error = true;		
	}
	$password = trim(fix_special_char($_POST['password']));			
				
			if($_POST['cookie']=='si')
				$cookie = 1;
			else
				$cookie = 0;
											
			if (!$error){
				if(strlen($password)>0){
					$password = md5($password).":".md5($userid);
					$sql_password="password='".$password."',";
				}
				$query = "UPDATE ".$DBPrefix."risorse SET ".$sql_password."cookie='".$cookie."' WHERE id=".$userid;
				
				$result = mysql_query($query,CONN);
				
				
				print $message_successful;
				header("Refresh: 1; URL=".$_SERVER['PHP_SELF'].'?pg='.$pg."");
				$redirect=true;
			
			}
}

?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<title>Pannello Utente</title>
</head>

<body>

<form id="form1" name="form1" method="post" action="">
<? if ($redirect==false){?>
  <table width="300" align="center">
    <!--DWLayoutTable-->
  
      <tr>
        <td height="35" colspan="2" bgcolor="#1B486D"><div align="center"><strong>Profilo utente</strong></div></td>
      </tr>
      <tr>
        <td width="100%" height="20"bgcolor="#26689D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Vecchia Password</tag>: *</td>
        <td bgcolor="#26689D"><input name="old_password" type="password" class="input" id="old_password"/></td>
      </tr>
      <tr>
        <td height="20"bgcolor="#26689D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Nuova Password</tag>: *</td>
      <td bgcolor="#26689D"><input name="password" type="password" class="input" id="password" /></td>
    </tr>
    
    <tr>
      <td height="20" bgcolor="#26689D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Accesso automatico</tag>: </td>
      <td bgcolor="#26689D"><input name="cookie" type="checkbox" id="cookie" value="si" <? if($row['cookie']==1) echo 'checked="checked"';?> /></td>
    </tr>
     </table>
    <br />
        <div align="center">
          <button name="Modifica" type="submit" class="button" id="Modifica">Modifica</button>
          <button name="reset" type="reset" class="button">Ripristina</button>
          </div>
    
 
  <div align="center"><br />
    <tag>* Campi obbligatori</tag> </div>
	<? }?>
</form>

</body>
</html>

