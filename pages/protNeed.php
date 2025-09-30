<?php
require_once("../include/connection.php");
require_once("../include/auth_user.php"); // To get user's gender from session

// We need to know the user's gender to show the correct form fields
$sesso = $_SESSION['userid']['sesso'] ?? 'uomo'; // Default to 'uomo' if not set

?>
<div class="container-fluid mt-4">
    <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">Calcolo Fabbisogno Proteico</h4>
                </div>
                <div class="card-body">
                    <form id="protNeedForm">
                        <div class="row">
                            <!-- Colonna Misure Comuni -->
                            <div class="col-md-6">
                                <h5>Misure Comuni</h5>
                                <div class="mb-3">
                                    <label for="peso" class="form-label">Peso (Kg)</label>
                                    <input type="number" step="0.1" class="form-control" id="peso" required>
                                    <div class="form-text">Pesarsi la mattina prima di colazione.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="altezza" class="form-label">Altezza (cm)</label>
                                    <input type="number" class="form-control" id="altezza" required>
                                </div>
                                <div class="mb-3">
                                    <label for="collo" class="form-label">Collo (cm)</label>
                                    <input type="number" step="0.1" class="form-control" id="collo" required>
                                    <div class="form-text">Circonferenza all'altezza del pomo di Adamo.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="attivita" class="form-label">Tipo Attivit&agrave;</label>
                                    <select id="attivita" class="form-select" required>
                                        <option value="1.1">1.1 - Sedentario</option>
                                        <option value="1.3">1.3 - No sport</option>
                                        <option value="1.5">1.5 - Sport occasionale</option>
                                        <option value="1.7">1.7 - Sport 3 volte/sett</option>
                                        <option value="1.9">1.9 - Allenamento ogni giorno</option>
                                        <option value="2.1">2.1 - Allenamento intenso</option>
                                        <option value="2.3">2.3 - Allenamento agonistico</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Colonna Misure Specifiche per Sesso -->
                            <div class="col-md-6">
                                <!-- Campi per Uomo -->
                                <div class="misura-uomo <?= $sesso === 'donna' ? 'd-none' : '' ?>">
                                    <h5>Misure Uomo</h5>
                                    <div class="mb-3">
                                        <label for="addome" class="form-label">Addome (cm)</label>
                                        <input type="number" step="0.1" class="form-control" id="addome" required>
                                        <div class="form-text">Circonferenza all'altezza dell'ombelico.</div>
                                    </div>
                                </div>

                                <!-- Campi per Donna -->
                                <div class="misura-donna <?= $sesso === 'uomo' ? 'd-none' : '' ?>">
                                    <h5>Misure Donna</h5>
                                    <div class="mb-3">
                                        <label for="vita" class="form-label">Vita (cm)</label>
                                        <input type="number" step="0.1" class="form-control" id="vita" required>
                                        <div class="form-text">Nel punto pi&ugrave; stretto tra ombelico e sterno.</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="anche" class="form-label">Anche (cm)</label>
                                        <input type="number" step="0.1" class="form-control" id="anche" required>
                                        <div class="form-text">Nel punto pi&ugrave; largo dei fianchi.</div>
                                    </div>
                                     <div class="mb-3">
                                        <label for="polso" class="form-label">Polso (cm)</label>
                                        <input type="number" step="0.1" class="form-control" id="polso" required>
                                     </div>
                                     <div class="mb-3">
                                        <label for="avambraccio" class="form-label">Avambraccio (cm)</label>
                                        <input type="number" step="0.1" class="form-control" id="avambraccio" required>
                                     </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-4">
                            <button type="submit" class="btn btn-primary">Calcola</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h4 class="mb-0">Risultati</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">% Massa Grassa</label>
                                <input type="text" id="out_percentualeMG" class="form-control" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Massa Magra (Kg)</label>
                                <input type="text" id="out_percentualeMM" class="form-control" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Fabbisogno Proteico Giornaliero (gr)</label>
                                <input type="text" id="out_proteineDay" class="form-control" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Totale Blocchi Zona</label>
                                <input type="text" id="out_blocchiZona" class="form-control" readonly>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
