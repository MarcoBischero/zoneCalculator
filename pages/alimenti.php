<?php
require_once("../include/connection.php");
require_once("../include/auth_user.php");

// Fetch all data needed for the page with proper joins and error handling
$alimenti = [];
$query = "SELECT 
            a.codice_alimento, 
            a.nome, 
            a.proteine, 
            a.carboidrati, 
            a.grassi, 
            t.descrizione as tipo_desc, 
            f.descrizione as fonte_desc, 
            f.img as fonte_img
          FROM {$DBPrefix}alimenti a
          LEFT JOIN {$DBPrefix}tipo t ON a.cod_tipo = t.codice_tipo
          LEFT JOIN {$DBPrefix}fonte f ON a.cod_fonte = f.codice_fonte
          ORDER BY a.nome ASC";

$result = $conn->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $alimenti[] = $row;
    }
} else {
    // Handle query error, maybe log it or show a user-friendly message
    // For now, we just have an empty array.
}

?>
<div class="container-fluid mt-4">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Gestione Alimenti</h4>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAlimentoModal">
                <i class="fas fa-plus"></i> Aggiungi Alimento
            </button>
        </div>
        <div class="card-body">
            <?php if (empty($alimenti)): ?>
                <div class="alert alert-info">Nessun alimento trovato. Inizia aggiungendone uno!</div>
            <?php else: ?>
                <table id="table_alimenti" class="table table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Proteine</th>
                            <th>Carboidrati</th>
                            <th>Grassi</th>
                            <th>Tipo</th>
                            <th>Fonte</th>
                            <th class="no-sort">Modifica</th>
                            <th class="no-sort">Elimina</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($alimenti as $alimento): ?>
                            <tr id="alimento-<?php echo $alimento['codice_alimento']; ?>">
                                <td><?php echo htmlspecialchars($alimento['nome']); ?></td>
                                <td><?php echo str_replace('.', ',', $alimento['proteine']); ?></td>
                                <td><?php echo str_replace('.', ',', $alimento['carboidrati']); ?></td>
                                <td><?php echo str_replace('.', ',', $alimento['grassi']); ?></td>
                                <td><?php echo htmlspecialchars($alimento['tipo_desc']); ?></td>
                                <td><img src="img/<?php echo htmlspecialchars($alimento['fonte_img']); ?>" alt="<?php echo htmlspecialchars($alimento['fonte_desc']); ?>" title="<?php echo htmlspecialchars($alimento['fonte_desc']); ?>" style="width: 24px; height: 24px;"></td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-warning" onclick="openEditModal(<?php echo $alimento['codice_alimento']; ?>)">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-danger" onclick="confirmDelete(<?php echo $alimento['codice_alimento']; ?>)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Add Alimento Modal -->
<div class="modal fade" id="addAlimentoModal" tabindex="-1" aria-labelledby="addAlimentoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addAlimentoModalLabel">Aggiungi Nuovo Alimento</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <?php include 'addAlimento.php'; // Includes the refactored form ?>
            </div>
        </div>
    </div>
</div>

<!-- Edit Alimento Modal -->
<div class="modal fade" id="editAlimentoModal" tabindex="-1" aria-labelledby="editAlimentoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editAlimentoModalLabel">Modifica Alimento</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="editAlimentoModalBody">
                <!-- Content will be loaded via AJAX -->
                <div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>
            </div>
        </div>
    </div>
</div>


<script>
$(document).ready(function() {
    const alimentiTable = $('#table_alimenti').DataTable({
        pagingType: "full_numbers",
        responsive: true,
        language: { url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json' },
        columnDefs: [ {
            targets: 'no-sort',
            orderable: false
        } ]
    });

    // Handle form submission for adding an alimento
    $(document).on('submit', '#addAlimentoForm', function(e) {
        e.preventDefault();
        const formData = {
            action: 'addAlimento',
            descrizione: $('#desc_alimento').val(),
            tipo: $('#tipo').val(),
            fonte: $('#fonte').val(),
            proteine: $('#proteine100').val(),
            grassi: $('#grassi100').val(),
            carboidrati: $('#carboidrati100').val()
        };

        $.post('pages/ajax.php', formData, function(response) {
            if (response.status === 'success') {
                new Noty({ type: 'success', text: response.message, timeout: 3000 }).show();
                $('#addAlimentoModal').modal('hide');
                // Here you should dynamically add the new row to the DataTable
                // or simply reload the page/table content to see the changes.
                loadPage('alimenti.php'); // Reloads the page content
            } else {
                new Noty({ type: 'error', text: response.message || 'Errore sconosciuto.', timeout: 3000 }).show();
            }
        }, 'json').fail(function() {
            new Noty({ type: 'error', text: 'Errore di comunicazione con il server.', timeout: 3000 }).show();
        });
    });
});

function openEditModal(alimentoId) {
    $('#editAlimentoModalBody').load(`pages/editAlimento.php?id=${alimentoId}`, function() {
        $('#editAlimentoModal').modal('show');
    });
}

function confirmDelete(alimentoId) {
    new Noty({
        text: 'Sei sicuro di voler eliminare questo alimento?',
        layout: 'center',
        modal: true,
        buttons: [
            Noty.button('Sì, Elimina', 'btn btn-danger', function () {
                $.getJSON('pages/ajax.php', { action: 'DEL', idAlimento: alimentoId }, function(response) {
                    if (response.status === 'success') {
                        new Noty({ type: 'success', text: response.message, timeout: 2000 }).show();
                        $(`#alimento-${alimentoId}`).fadeOut(300, function() { $(this).remove(); });
                    } else {
                        new Noty({ type: 'error', text: response.message, timeout: 3000 }).show();
                    }
                }).fail(function() {
                    new Noty({ type: 'error', text: 'Errore di comunicazione.', timeout: 3000 }).show();
                });
                Noty.closeAll();
            }),
            Noty.button('Annulla', 'btn btn-secondary', function () {
                Noty.closeAll();
            })
        ]
    }).show();
}

</script>
