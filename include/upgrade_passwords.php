<?php
require_once("connection.php");
require_once("config.php");

$stmt = $conn->prepare("SELECT id, password FROM {$DBPrefix}risorse");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Check if the password is not already hashed with password_hash
        if (strlen($row['password']) < 60) { // password_hash produces a 60-character hash
            $new_password = password_hash($row['password'], PASSWORD_DEFAULT);

            $update_stmt = $conn->prepare("UPDATE {$DBPrefix}risorse SET password = ? WHERE id = ?");
            $update_stmt->bind_param("si", $new_password, $row['id']);
            $update_stmt->execute();
        }
    }
}

echo "Passwords updated successfully!";
?>