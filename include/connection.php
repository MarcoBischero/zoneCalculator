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
$conn = mysqli_connect($host, $user, $pwd, $db_name) or die("Error message...");
if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}
#mysqli_select_db ($db);
#mysqli_select_db($db_name,$conn)  or die(mysqli_error($conn));
define("CONN", $conn);
//--------------------------------------------------------------------------------------------------


?>
