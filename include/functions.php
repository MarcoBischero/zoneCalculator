<?php
/**
 * Deletes expired random keys from the database.
 *
 * @param mysqli $conn The database connection object.
 * @param string $DBPrefix The database table prefix.
 */
function cancella_random_key($conn, $DBPrefix) {
    $query = "DELETE FROM {$DBPrefix}random_key WHERE (DATE_ADD(data, INTERVAL '1' DAY) <= NOW()) OR (data = '0000-00-00 00:00:00')";
    $conn->query($query);
}

/**
 * Updates the last access timestamp and IP address for a given user.
 *
 * @param mysqli $conn The database connection object.
 * @param int $userId The user's ID.
 * @param string $ipAddress The user's IP address.
 * @param string $DBPrefix The database table prefix.
 */
function lastaccess($conn, $userId, $ipAddress, $DBPrefix) {
    $stmt = $conn->prepare(
        "UPDATE {$DBPrefix}risorse 
         SET lastaccess = lastaccessupdate, 
             lastaccessupdate = NOW(), 
             ip = ipupdate, 
             ipupdate = ? 
         WHERE id = ?"
    );
    $stmt->bind_param("si", $ipAddress, $userId);
    $stmt->execute();
}
?>
