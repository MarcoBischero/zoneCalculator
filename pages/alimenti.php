
<div class="container-fluid mt-4">
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Gestione Alimenti</h4>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAlimentoModal">
                <i class="fas fa-plus"></i> Aggiungi Alimento
            </button>
        </div>
        <div class="card-body">
            <?php
            // We need to re-establish connection and fetch data here because this file is loaded via AJAX
            // and doesn't have the context of the initial index.php load.
            require_once("../include/connection.php");

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
            }
            ?>
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
                                    <button class="btn btn-sm btn-warning btn-edit-alimento" data-alimento-id="<?php echo $alimento['codice_alimento']; ?>">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-danger btn-delete-alimento" data-alimento-id="<?php echo $alimento['codice_alimento']; ?>">
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
                <?php include 'addAlimento.php'; ?>
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
