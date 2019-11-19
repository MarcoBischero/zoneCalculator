<?
if(!file_exists("../include/config.php"))
	require_once("include/config.php");
else
	require_once("../include/config.php");
$host = $DBhostname;
$user = $DBuser;
$pwd = $DBpasswd;
$db_name = $DBname;


$conn=mysqli_init(); mysqli_ssl_set($con, NULL, NULL, {ca-cert filename}, NULL, NULL); 
mysqli_real_connect($conn, $DBhostname, $DBuser, $DBpasswd, $DBname, 3306);
#Do not edit
//--------------------------------------------------------------------------------------------------
//$conn = mysql_connect($host, $user, $pwd) or die(mysql_error());
//mysql_select_db($db_name,$conn)  or die(mysql_error());
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>
