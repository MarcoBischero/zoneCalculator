<?php
// Logout logic must be executed before any other session-related actions or HTML output.
if (isset($_GET['logout']) && $_GET['logout'] == '1') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION = [];
    session_destroy();

    // Clear 'remember me' cookies
    if (isset($_COOKIE['id'])) {
        setcookie('id', '', time() - 3600, '/');
    }
    if (isset($_COOKIE['key'])) {
        setcookie('key', '', time() - 3600, '/');
    }

    header("Location: login.php?status=loggedout");
    exit();
}

require_once("include/connection.php");
require_once("include/functions.php");
require_once("include/auth_user.php");

cancella_random_key($conn, $DBPrefix);

?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zoneCalculator</title>
    <!-- CSS Dependencies -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.7/css/dataTables.bootstrap5.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/3.0.2/css/responsive.bootstrap5.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.css" />

    <!-- JS Dependencies -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.7/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.0.7/js/dataTables.bootstrap5.js"></script>
    <script src="https://cdn.datatables.net/responsive/3.0.2/js/dataTables.responsive.js"></script>
    <script src="https://cdn.datatables.net/responsive/3.0.2/js/responsive.bootstrap5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.js"></script>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">zoneCalculator</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <?php
                if (!empty($page_menu) && is_array($page_menu)) {
                    // Sort menu items by order specified in the database
                    asort($page_menu);
                    foreach ($page_menu as $pagina => $descrizione) {
                        list($ordine, $desc, $class) = explode(":", $descrizione, 3);
                ?>
                <li class="nav-item">
                    <a class="nav-link main-nav-link" href="#" data-page="pages/<?php echo $pagina; ?>">
                        <i class="fa <?php echo $class; ?>"></i> <?php echo $desc; ?>
                    </a>
                </li>
                <?php
                    }
                }
                ?>
            </ul>
            <ul class="navbar-nav">
                 <?php require("include/logout.inc.php");?>
            </ul>
        </div>
    </div>
</nav>

<main class="container-fluid mt-4">
    <div id="main-content">
        <!-- AJAX Content will be loaded here -->
    </div>
</main>

<footer class="footer mt-auto py-3 bg-light fixed-bottom">
  <div class="container text-center">
    <span class="text-muted">Copyright &copy; 2007-<?php echo date("Y"); ?> MB | <a href="mailto:marco.biscardi@gmail.com?subject=zoneCalculator">Contact</a></span>
  </div>
</footer>

<script>
// Function to initialize event handlers and plugins for dynamically loaded content
function initializePage(pageUrl) {
    // Extract page name to apply specific logic
    const pageName = pageUrl.split('/').pop();

    if (pageName === 'alimenti.php') {
        // Initialize DataTable for the aliments table
        $('#table_alimenti').DataTable({
            pagingType: "full_numbers",
            responsive: true,
            language: { url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json' },
            columnDefs: [{ targets: 'no-sort', orderable: false }]
        });

        // Handle form submission for adding an alimento
        $(document).off('submit', '#addAlimentoForm').on('submit', '#addAlimentoForm', function(e) {
            e.preventDefault();
            const formData = { action: 'addAlimento', ...Object.fromEntries(new FormData(e.target)) };
            $.post('pages/ajax.php', formData, handleAjaxResponse, 'json');
        });

        // Handle clicks for editing an alimento
        $('.btn-edit-alimento').off('click').on('click', function() {
            const alimentoId = $(this).data('alimento-id');
            $('#editAlimentoModalBody').html('<div class="text-center"><div class="spinner-border"></div></div>');
            $('#editAlimentoModal').modal('show');
            $('#editAlimentoModalBody').load(`pages/editAlimento.php?id=${alimentoId}`);
        });

        // Handle clicks for deleting an alimento
        $('.btn-delete-alimento').off('click').on('click', function() {
            const alimentoId = $(this).data('alimento-id');
            confirmDeletion(alimentoId);
        });
    }
}

// Generic AJAX response handler
function handleAjaxResponse(response) {
    if (response.status === 'success') {
        new Noty({ type: 'success', text: response.message, timeout: 3000 }).show();
        $('.modal').modal('hide');
        // Reload the current page to see changes
        const currentPage = $('.main-nav-link.active').data('page');
        loadPage(currentPage);
    } else {
        new Noty({ type: 'error', text: response.message || 'Errore sconosciuto.', timeout: 5000 }).show();
    }
}

// Confirmation for deletion
function confirmDeletion(alimentoId) {
    new Noty({
        text: 'Sei sicuro di voler eliminare questo alimento?',
        layout: 'center', modal: true,
        buttons: [
            Noty.button('Sì, Elimina', 'btn btn-danger', function () {
                $.post('pages/ajax.php', { action: 'DEL', idAlimento: alimentoId }, function(response) {
                    if(response.status === 'success'){
                       new Noty({ type: 'success', text: response.message, timeout: 2000 }).show();
                       loadPage($('.main-nav-link.active').data('page'));
                    } else {
                       new Noty({ type: 'error', text: response.message, timeout: 3000 }).show();
                    }
                }, 'json').fail(() => new Noty({ type: 'error', text: 'Errore di comunicazione.' }).show());
                Noty.closeAll();
            }),
            Noty.button('Annulla', 'btn btn-secondary', () => Noty.closeAll())
        ]
    }).show();
}

// Function to load a page into the main content area
function loadPage(pageUrl) {
    if (!pageUrl) return;
    $('#main-content').html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    $('#main-content').load(pageUrl, function(response, status, xhr) {
        if (status === "error") {
            $('#main-content').html('<div class="alert alert-danger">Errore di caricamento.</div>');
        } else {
            // After loading, initialize any scripts specific to that page
            initializePage(pageUrl);
        }
    });
}

// Main document ready handler
$(document).ready(function() {
    // Handle main navigation clicks
    $('.main-nav-link').on('click', function(e) {
        e.preventDefault();
        var page = $(this).data('page');
        $('.main-nav-link').removeClass('active');
        $(this).addClass('active');
        loadPage(page);
    });

    // Load the first page by default
    const firstPageLink = $('.main-nav-link').first();
    if (firstPageLink.length) {
        firstPageLink.addClass('active');
        loadPage(firstPageLink.data('page'));
    } else {
        $('#main-content').html('<div class="alert alert-warning">Nessuna pagina disponibile.</div>');
    }
});
</script>

</body>
</html>
