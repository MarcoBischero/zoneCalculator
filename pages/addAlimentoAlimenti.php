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
        <div class="card-header bg-success text-white">
            <h4>Aggiungi Alimento (Alimenti)</h4>
        </div>
        <div class="card-body">
            <form id="addAlimentoFormAlimenti">
                <div class="mb-3">
                    <label for="desc_alimentoAlimenti" class="form-label">Descrizione</label>
                    <input type="text" class="form-control" id="desc_alimentoAlimenti" placeholder="Es. Salmone Affumicato" required>
                    <div class="form-text">Il nome dell'alimento che desideri aggiungere.</div>
                </div>

                <div class="mb-3">
                    <label for="tipoAlimenti" class="form-label">Tipo Alimento</label>
                    <select class="form-select" id="tipoAlimenti" name="tipo" required>
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
                    <label for="fonteAlimenti" class="form-label">Fonte</label>
                    <select class="form-select" id="fonteAlimenti" name="fonte" required>
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
                        <label for="proteine100Alimenti" class="form-label">Proteine (per 100g)</label>
                        <input type="number" class="form-control" id="proteine100Alimenti" step="0.1" required>
                    </div>
                    <div class="col-md-4">
                        <label for="grassi100Alimenti" class="form-label">Grassi (per 100g)</label>
                        <input type="number" class="form-control" id="grassi100Alimenti" step="0.1" required>
                    </div>
                    <div class="col-md-4">
                        <label for="carboidrati100Alimenti" class="form-label">Carboidrati (per 100g)</label>
                        <input type="number" class="form-control" id="carboidrati100Alimenti" step="0.1" required>
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-success">Salva Alimento</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Add validation and AJAX submission logic here if needed
$(document).ready(function() {
    $('#addAlimentoFormAlimenti').on('submit', function(e) {
        e.preventDefault();
        
        // AJAX logic to submit the form data, similar to the other form
        // but perhaps to a different endpoint or with a different action.
    });
});
</script>
