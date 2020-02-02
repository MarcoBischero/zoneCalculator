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
$conn = new mysqli($host, $user, $pwd);
mysqli_select_db($db_name,$conn);
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>
