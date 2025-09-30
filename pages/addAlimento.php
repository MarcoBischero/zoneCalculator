<?php
require_once("../include/connection.php");
require_once("../include/auth_user.php");

// Use modern mysqli for database queries
$sql_tipo = "SELECT * FROM {$DBPrefix}tipo ORDER BY codice_tipo ASC";
$result_tipo = $conn->query($sql_tipo);

$sql_fonte = "SELECT * FROM {$DBPrefix}fonte ORDER BY codice_fonte ASC";
$result_fonte = $conn->query($sql_fonte);
?>

<div class="container mt-4">
    <div class="card">
        <div class="card-header bg-primary text-white">
            <h4>Aggiungi Alimento</h4>
        </div>
        <div class="card-body">
            <form id="addAlimentoForm">
                <div class="mb-3">
                    <label for="desc_alimento" class="form-label">Descrizione</label>
                    <input type="text" class="form-control" id="desc_alimento" placeholder="Es. Petto di Pollo" required>
                    <div class="form-text">Il nome dell'alimento che desideri aggiungere.</div>
                </div>

                <div class="mb-3">
                    <label for="tipo" class="form-label">Tipo Alimento</label>
                    <select class="form-select" id="tipo" name="tipo" required>
                        <option value="" selected>--- Seleziona Tipo ---</option>
                        <?php
                        if ($result_tipo && $result_tipo->num_rows > 0) {
                            while ($row_tipo = $result_tipo->fetch_assoc()) {
                                echo "<option value=\"{$row_tipo['codice_tipo']}\">{$row_tipo['descrizione']}</option>";
                            }
                        }
                        ?>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="fonte" class="form-label">Fonte</label>
                    <select class="form-select" id="fonte" name="fonte" required>
                        <option value="" selected>--- Seleziona Fonte ---</option>
                        <?php
                        if ($result_fonte && $result_fonte->num_rows > 0) {
                            while ($row_fonte = $result_fonte->fetch_assoc()) {
                                echo "<option value=\"{$row_fonte['codice_fonte']}\">{$row_fonte['descrizione']}</option>";
                            }
                        }
                        ?>
                    </select>
                    <div class="form-text">Indica la qualità della fonte (es. Ottima, Accettabile).</div>
                </div>

                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="proteine100" class="form-label">Proteine (per 100g)</label>
                        <input type="number" class="form-control" id="proteine100" step="0.1" required>
                    </div>
                    <div class="col-md-4">
                        <label for="grassi100" class="form-label">Grassi (per 100g)</label>
                        <input type="number" class="form-control" id="grassi100" step="0.1" required>
                    </div>
                    <div class="col-md-4">
                        <label for="carboidrati100" class="form-label">Carboidrati (per 100g)</label>
                        <input type="number" class="form-control" id="carboidrati100" step="0.1" required>
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary">Salva Alimento</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Add validation and AJAX submission logic here if needed
$(document).ready(function() {
    $('#addAlimentoForm').on('submit', function(e) {
        e.preventDefault();
        
        // You can add your AJAX logic here to submit the form data
        // For example:
        /*
        $.ajax({
            url: 'pages/ajax.php',
            type: 'POST',
            data: {
                action: 'addAlimento',
                descrizione: $('#desc_alimento').val(),
                tipo: $('#tipo').val(),
                fonte: $('#fonte').val(),
                proteine: $('#proteine100').val(),
                grassi: $('#grassi100').val(),
                carboidrati: $('#carboidrati100').val()
            },
            success: function(response) {
                // Handle success
                new Noty({
                    type: 'success',
                    layout: 'topRight',
                    text: 'Alimento aggiunto con successo!',
                    timeout: 3000
                }).show();
                // Optionally, reload the main table or clear the form
            },
            error: function() {
                // Handle error
                new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'Errore durante l\'aggiunta dell\'alimento.',
                    timeout: 3000
                }).show();
            }
        });
        */
    });
});
</script>
