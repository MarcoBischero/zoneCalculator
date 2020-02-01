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
#$conn = mysqli_connect($host, $user, $pwd) or die(mysqli_error($conn));
$conn = mysqli_connect($host, $username, $password, $db) or die("Error message...");
#mysqli_select_db ($db);
#mysqli_select_db($db_name,$conn)  or die(mysqli_error($conn));
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>
