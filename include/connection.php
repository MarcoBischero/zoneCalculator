<?
if(!file_exists("../include/config.php"))
	require_once("include/config.php");
else
	require_once("../include/config.php");
$host = $DBhostname;
$user = $DBuser;
$pwd = $DBpasswd;
$db_name = $DBname;

#Do not edit
//--------------------------------------------------------------------------------------------------
$conn = mysql_connect($host, $user, $pwd) or die(mysql_error());
mysql_select_db($db_name,$conn)  or die(mysql_error());
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>