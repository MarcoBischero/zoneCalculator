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

/*------------------------------------------
CHECK SETUP*/
if (!file_exists('include/config.php')) {
    if (file_exists('setup/index.php')) {
        header('Location: setup/index.php');
        exit();
    } else {
        echo 'No configuration file found and no installation code available. Exiting...';
        exit();
    }
} elseif (file_exists('include/config.php') && file_exists('setup/index.php')) {
    echo 'Setup folder still exists. Please delete it.';
    exit();
}

/*----------------------------------------*/
require_once("include/connection.php");
require_once("include/auth_user.php");
require_once("include/functions.php");

// Clean up expired random keys for 'remember me' functionality
cancella_random_key($conn, $DBPrefix);

?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zoneCalculator</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- DataTables Bootstrap 5 CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.7/css/dataTables.bootstrap5.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/3.0.2/css/responsive.bootstrap5.css">
    <!-- Noty CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.css" />

    
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables & Plugins -->
    <script src="https://cdn.datatables.net/2.0.7/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.0.7/js/dataTables.bootstrap5.js"></script>
    <script src="https://cdn.datatables.net/responsive/3.0.2/js/dataTables.responsive.js"></script>
    <script src="https://cdn.datatables.net/responsive/3.0.2/js/responsive.bootstrap5.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.bootstrap5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js"></script>

    <!-- JS Cookie -->
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
    <!-- Noty JS -->
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
                    foreach ($page_menu as $pagina => $descrizione) {
                        list($ordine, $desc, $class) = explode(":", $descrizione, 3);
                ?>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-page="pages/<?php echo $pagina; ?>">
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
        <!-- Content will be loaded here -->
    </div>
</main>

<footer class="footer mt-auto py-3 bg-light">
  <div class="container text-center">
    <span class="text-muted">Copyright &copy; 2007-<?php echo date("Y"); ?> MB | <a href="mailto:marco.biscardi@gmail.com?subject=zoneCalculator">Contact</a></span>
  </div>
</footer>

<script>
$(document).ready(function() {
    // Handle menu clicks
    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        var page = $(this).data('page');
        if (page) {
            // Set active class
            $('.nav-link').removeClass('active');
            $(this).addClass('active');
            
            $('#main-content').html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
            $('#main-content').load(page, function(response, status, xhr) {
                if (status == "error") {
                    new Noty({
                        type: 'error',
                        layout: 'topRight',
                        text: 'Could not load page. Please reload or try again later.',
                        timeout: 5000
                    }).show();
                    $('#main-content').html('<div class="alert alert-danger" role="alert">Could not load page. Please reload or try again later.</div>');
                }
            });
        }
    });

    // Load the first page by default
    var firstPageLink = $('.nav-link').first();
    if(firstPageLink.length){
        firstPageLink.addClass('active');
        $('#main-content').html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        $('#main-content').load(firstPageLink.data('page'));
    } else {
        // If no menu items are available, show a message.
        $('#main-content').html('<div class="alert alert-warning" role="alert">No pages available. Please contact an administrator.</div>');
    }
});
</script>

</body>
</html>
