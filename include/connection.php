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
$conn = mysqli_connect($host, $user, $pwd, $db_name);
mysqli_select_db($db_name,$conn);
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>
