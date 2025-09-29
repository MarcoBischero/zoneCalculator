<?php
// This file handles user authentication and authorization.

// Start a session to manage user login state.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include the database connection and functions.
require_once("connection.php");
require_once("functions.php");

$auth_user = false;
$page_menu = [];

// Check if the user is logged in via session or cookies.
if (!isset($_SESSION['userid'])) {
    if (isset($_COOKIE['id']) && isset($_COOKIE['key'])) {
        $id = $_COOKIE['id'];
        $key = $_COOKIE['key'];

        // Fetch user details including name for the session
        $stmt = $conn->prepare("SELECT id, id_ruolo, mode, nome, cognome FROM {$DBPrefix}risorse WHERE id = ? AND rand_key = ?");
        $stmt->bind_param("is", $id, $key);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            lastaccess($conn, $row['id'], $_SERVER['REMOTE_ADDR'], $DBPrefix);
            
            // Store user info in the session
            $_SESSION['userid'] = [
                'id' => $row['id'],
                'ruolo' => $row['id_ruolo'],
                'mode' => $row['mode'],
                'nome' => $row['nome'],
                'cognome' => $row['cognome'],
            ];
        }
    }
}

// If the user is logged in, fetch their permissions and build the menu.
if (isset($_SESSION['userid'])) {
    $id_ruolo = $_SESSION['userid']['ruolo'];

    if (is_numeric($id_ruolo) && $id_ruolo != 0) {
        $stmt = $conn->prepare("SELECT f.descrizione, f.pagina, f.ordine, f.class 
                                 FROM {$DBPrefix}ruoli_features rf 
                                 JOIN {$DBPrefix}features f ON rf.id_feature = f.id 
                                 WHERE rf.id_ruolo = ? ORDER BY f.ordine");
        $stmt->bind_param("i", $id_ruolo);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $page_menu[$row['pagina']] = $row['ordine'] . ':' . $row['descrizione'] . ':' . $row['class'];
            }
        }

        // Check if the user is authorized to access the current page.
        $auth_user = !isset($_GET['pg']) || array_key_exists(trim($_GET['pg']), $page_menu);
    } else {
        header("Location: pages/norules.php");
        exit();
    }
} else {
    // If the user is not logged in, redirect to the login page.
    header("Location: login.php");
    exit();
}
?>
