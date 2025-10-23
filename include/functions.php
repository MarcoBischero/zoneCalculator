<?php
/*================================================================================
    OMNI-FUNCTIONS-PHP
    - LastAccess($conn, $id, $ip, $DBPrefix)
    - data_it($data)
    - cancella_random_key($conn, $DBPrefix)
    - random_string($length)
 =================================================================================*/

/**
 * Updates the last access timestamp and IP address for a given user.
 *
 * @param mysqli $conn The database connection object.
 * @param int $id The user's ID.
 * @param string $ip The user's IP address.
 * @param string $DBPrefix The prefix for the database tables.
 * @return void
 */
function LastAccess($conn, $id, $ip, $DBPrefix)
{
    $query = "UPDATE {$DBPrefix}risorse SET ultimo_accesso = NOW(), last_ip = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $ip, $id);
    $stmt->execute();
}

/**
 * Formats a timestamp into a standard Italian date format (d/m/Y H:i:s).
 *
 * @param string $data The timestamp to format.
 * @return string The formatted date.
 */
function data_it($data)
{
    return date("d/m/Y H:i:s", strtotime($data));
}

/**
 * Deletes expired random keys from the database.
 * This is used for the "remember me" functionality.
 *
 * @param mysqli $conn The database connection object.
 * @param string $DBPrefix The prefix for the database tables.
 * @return void
 */
function cancella_random_key($conn, $DBPrefix)
{
    $query = "UPDATE {$DBPrefix}risorse SET rand_key = NULL WHERE ultimo_accesso < DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $conn->query($query);
}

/**
 * Generates a random string of a specified length.
 *
 * @param int $length The desired length of the random string.
 * @return string The generated random string.
 */
function random_string($length) {
    // Each byte from random_bytes is represented by two hex characters, so we need half the length.
    $byteLength = ceil($length / 2);
    $randomBytes = random_bytes($byteLength);
    // Convert to hex and trim to the exact desired length
    return substr(bin2hex($randomBytes), 0, $length);
}

?>