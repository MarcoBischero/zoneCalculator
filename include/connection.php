<?php
// Include the configuration file, checking for its existence in different paths.
if (file_exists("include/config.php")) {
    require_once("include/config.php");
} elseif (file_exists("../include/config.php")) {
    require_once("../include/config.php");
}

// Establish a database connection using mysqli.
$conn = new mysqli($DBhostname, $DBuser, $DBpasswd, $DBname);

// Check for a connection error and terminate if one occurs.
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set the character set to UTF-8 for proper data handling.
$conn->set_charset("utf8");
?>
