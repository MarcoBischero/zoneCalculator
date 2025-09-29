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

// Whitelist for development environments
$whitelist = array(
    '127.0.0.1',
    '::1'
);

// You can override the general settings for development environments
if (in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
    // Development specific settings can go here
}

?>
