<?php
// General settings
$server_url = $_SERVER['SERVER_NAME'];
$CAMversion = 'v2.0';

// Database credentials
$DBhostname = 'localhost';
$DBuser = 'mycam2';
$DBpasswd = 'Aqlt709_!0';
$DBname = 'zoneCalculator';
$DBPrefix = '';
$DBOld = '';

// Whitelist for development environments
$whitelist = array(
    '127.0.0.1',
    '::1'
);

// You can override the general settings for development environments
if (in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
    // Development specific settings can go here
}

// Message variables to be replaced with a notification system
$message_successful = "Operazione effettuata con successo";
$message_scheda = "Per visionare un'altra scheda cliente tornare indietro";
$message_successful_popup = "Operazione effettuata con successo";
$message_logout = "Logout effettuato con successo";

?>
