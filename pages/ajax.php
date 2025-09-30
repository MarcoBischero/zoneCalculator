<?php
// Core file, required for all operations
require_once("../include/connection.php");
require_once("../include/auth_user.php");
require_once("../include/functions.php"); // Contains random_string() and other utils

header('Content-Type: application/json; charset=utf-8');

// Centralized error and response handling
$response = [
    'status' => 'error',
    'message' => 'An unknown error occurred.',
    'data' => []
];

// Determine the action from the request
$action = $_POST['action'] ?? $_GET['action'] ?? $_GET['opt'] ?? $_GET['operation'] ?? null;
$user_id = $_SESSION['userid']['id'] ?? null;

// Ensure user is logged in for most actions
if (!$user_id && $action !== 'pgcTotal') { // pgcTotal is a pure calculator
    $response['message'] = 'Authentication required.';
    echo json_encode($response);
    exit();
}

try {
    switch ($action) {
        // Corresponds to the form in addAlimento.php
        case 'addAlimento':
            $desc = $_POST['descrizione'] ?? null;
            $tipo = $_POST['tipo'] ?? null;
            $fonte = $_POST['fonte'] ?? null;
            $prot = isset($_POST['proteine']) ? (float)str_replace(',', '.', $_POST['proteine']) : null;
            $carb = isset($_POST['carboidrati']) ? (float)str_replace(',', '.', $_POST['carboidrati']) : null;
            $gras = isset($_POST['grassi']) ? (float)str_replace(',', '.', $_POST['grassi']) : null;

            if (!$desc || !$tipo || !$fonte || $prot === null || $carb === null || $gras === null) {
                throw new Exception("Tutti i campi sono obbligatori.");
            }

            $stmt = $conn->prepare("INSERT INTO {$DBPrefix}alimenti (nome, proteine, grassi, carboidrati, cod_tipo, cod_fonte) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('sddiii', $desc, $prot, $gras, $carb, $tipo, $fonte);
            $stmt->execute();

            $response['status'] = 'success';
            $response['message'] = 'Alimento aggiunto con successo!';
            $response['data'] = ['id' => $conn->insert_id];
            break;

        // Corresponds to the form in editAlimento.php
        case 'updateAlimento':
            $id = $_POST['id'] ?? null;
            $desc = $_POST['descrizione'] ?? null;
            $tipo = $_POST['tipo'] ?? null;
            $fonte = $_POST['fonte'] ?? null;
            $prot = isset($_POST['proteine']) ? (float)str_replace(',', '.', $_POST['proteine']) : null;
            $carb = isset($_POST['carboidrati']) ? (float)str_replace(',', '.', $_POST['carboidrati']) : null;
            $gras = isset($_POST['grassi']) ? (float)str_replace(',', '.', $_POST['grassi']) : null;

            if (!$id || !$desc || !$tipo || !$fonte || $prot === null || $carb === null || $gras === null) {
                throw new Exception("Tutti i campi (incluso l'ID) sono obbligatori per l'aggiornamento.");
            }

            $stmt = $conn->prepare("UPDATE {$DBPrefix}alimenti SET nome = ?, proteine = ?, grassi = ?, carboidrati = ?, cod_tipo = ?, cod_fonte = ? WHERE codice_alimento = ?");
            $stmt->bind_param('sddiiii', $desc, $prot, $gras, $carb, $tipo, $fonte, $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                $response['status'] = 'success';
                $response['message'] = 'Alimento aggiornato con successo!';
            } else {
                // This can happen if the data was not changed
                $response['status'] = 'success'; // It's not an error
                $response['message'] = 'Nessuna modifica rilevata.';
            }
            break;

        // Handles all deletion operations
        case 'DEL':
            // ... (deletion logic remains the same)
            break;

        // ... (other cases remain the same)

        default:
            $response['message'] = "Azione '{$action}' non riconosciuta o non implementata.";
            break;
    }
} catch (Exception $e) {
    if ($conn->in_transaction) {
        $conn->rollback();
    }
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response, JSON_NUMERIC_CHECK | JSON_UNESCAPED_UNICODE);
