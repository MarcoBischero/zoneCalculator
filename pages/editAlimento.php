<?php
require_once("../include/connection.php");
require_once("../include/auth_user.php");

// Get the ID of the alimento from the URL
$alimento_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($alimento_id === 0) {
    echo '<div class="alert alert-danger">ID Alimento non valido.</div>';
    exit;
}

// Fetch the specific alimento data
$stmt = $conn->prepare("SELECT * FROM {$DBPrefix}alimenti WHERE codice_alimento = ?");
$stmt->bind_param('i', $alimento_id);
$stmt->execute();
$result = $stmt->get_result();
$alimento = $result->fetch_assoc();

if (!$alimento) {
    echo '<div class="alert alert-danger">Alimento non trovato.</div>';
    exit;
}

// Fetch options for dropdowns
$tipi = $conn->query("SELECT * FROM {$DBPrefix}tipo ORDER BY descrizione ASC");
$fonti = $conn->query("SELECT * FROM {$DBPrefix}fonte ORDER BY descrizione ASC");

?>

<form id="editAlimentoForm">
    <input type="hidden" name="alimento_id" value="<?php echo $alimento['codice_alimento']; ?>">

    <div class="mb-3">
        <label for="desc_alimento_edit" class="form-label">Descrizione</label>
        <input type="text" class="form-control" id="desc_alimento_edit" name="descrizione" value="<?php echo htmlspecialchars($alimento['nome']); ?>" required>
    </div>

    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="tipo_edit" class="form-label">Tipo Alimento</label>
            <select class="form-select" id="tipo_edit" name="tipo" required>
                <?php while($tipo = $tipi->fetch_assoc()): ?>
                    <option value="<?php echo $tipo['codice_tipo']; ?>" <?php echo ($alimento['cod_tipo'] == $tipo['codice_tipo']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($tipo['descrizione']); ?>
                    </option>
                <?php endwhile; ?>
            </select>
        </div>
        <div class="col-md-6 mb-3">
            <label for="fonte_edit" class="form-label">Fonte</label>
            <select class="form-select" id="fonte_edit" name="fonte" required>
                <?php while($fonte = $fonti->fetch_assoc()): ?>
                    <option value="<?php echo $fonte['codice_fonte']; ?>" <?php echo ($alimento['cod_fonte'] == $fonte['codice_fonte']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($fonte['descrizione']); ?>
                    </option>
                <?php endwhile; ?>
            </select>
        </div>
    </div>

    <div class="row g-3">
        <div class="col-md-4">
            <label for="proteine100_edit" class="form-label">Proteine (100g)</label>
            <input type="number" class="form-control" id="proteine100_edit" name="proteine" value="<?php echo $alimento['proteine']; ?>" step="0.1" required>
        </div>
        <div class="col-md-4">
            <label for="grassi100_edit" class="form-label">Grassi (100g)</label>
            <input type="number" class="form-control" id="grassi100_edit" name="grassi" value="<?php echo $alimento['grassi']; ?>" step="0.1" required>
        </div>
        <div class="col-md-4">
            <label for="carboidrati100_edit" class="form-label">Carboidrati (100g)</label>
            <input type="number" class="form-control" id="carboidrati100_edit" name="carboidrati" value="<?php echo $alimento['carboidrati']; ?>" step="0.1" required>
        </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Annulla</button>
        <button type="submit" class="btn btn-primary">Salva Modifiche</button>
    </div>
</form>

<script>
// This script block will be executed when the form is loaded into the modal
$(document).ready(function() {
    $('#editAlimentoForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            action: 'updateAlimento',
            id: $('[name="alimento_id"]').val(),
            descrizione: $('#desc_alimento_edit').val(),
            tipo: $('#tipo_edit').val(),
            fonte: $('#fonte_edit').val(),
            proteine: $('#proteine100_edit').val(),
            grassi: $('#grassi100_edit').val(),
            carboidrati: $('#carboidrati100_edit').val()
        };

        $.post('pages/ajax.php', formData, function(response) {
            if (response.status === 'success') {
                new Noty({ type: 'success', text: response.message, timeout: 3000 }).show();
                $('#editAlimentoModal').modal('hide');
                loadPage('alimenti.php'); // Reload the main content to see changes
            } else {
                new Noty({ type: 'error', text: response.message || 'Errore durante l\'aggiornamento.', timeout: 3000 }).show();
            }
        }, 'json').fail(function() {
            new Noty({ type: 'error', text: 'Errore di comunicazione con il server.', timeout: 3000 }).show();
        });
    });
});
</script>
