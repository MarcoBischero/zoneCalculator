<?
/*------------------------------------------
CHECK SETUP*/
if (!file_exists( 'include/config.php' )){
	if(file_exists('setup/index.php')){
		header( 'Location: setup/index.php' );
		exit();
	}else{
		echo 'No configuration file found and no installation code available. Exiting...';
		exit();
	}
}elseif(file_exists( 'include/config.php') && file_exists('setup/index.php')){
		echo 'Setup folder still exists. Please delete it.';
		exit();
}

/*----------------------------------------*/
$redirect = false;
require_once("include/connection.php");
require_once("include/top.inc.php");
require_once("include/config.php");
require_once("include/auth_user.php");

cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <? require_once("head.inc.php"); ?>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="css/flatIcon/flaticon.css">
    <noscript><link rel="stylesheet" type="text/css" href="css/noJS.css" /></noscript>
    <!-- DataTables CSS -->
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.10/css/jquery.dataTables.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.0.0/css/responsive.dataTables.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/1.1.2/css/buttons.dataTables.min.css" />
    <script type="text/javascript" src="js/js.cookie.js"></script>
    <script type="text/javascript" src="js/noty/packaged/jquery.noty.packaged.min.js"></script>
    <!-- DataTables -->
    <script type="text/javascript" src="https://cdn.datatables.net/1.10.10/js/jquery.dataTables.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/responsive/2.0.0/js/dataTables.responsive.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/buttons/1.1.2/js/dataTables.buttons.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js"></script>
    <script type="text/javascript" src="//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/pdfmake.min.js"></script>
    <script type="text/javascript" src="//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/vfs_fonts.js"></script>
    <script type="text/javascript" src="//cdn.datatables.net/buttons/1.1.2/js/buttons.print.min.js"></script>
    <script type="text/javascript" src="//cdn.datatables.net/buttons/1.1.2/js/buttons.html5.min.js"></script>
</head>
<body>

<?
if(isset($_GET['logout']) && $_GET['logout']=='1'){
    @session_start();
    @session_destroy();
    foreach ($_COOKIE as $key=>$value){
        if($key!="cookieconsent_dismissed"){
            setcookie($key,'', time()-1, "/" ,NULL,0);
        }
    }
    echo $message_logout;
    header("Refresh: 1; URL=login.php");
    $redirect = true;
    @ob_end_flush();
}
if ($redirect == false){
?>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="#">zoneCalculator</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
            <?
            if(is_array($page_menu)){
                asort($page_menu,SORT_NUMERIC);
                foreach($page_menu as $pagina=>$descrizione){
                    list($ordine, $descrizione, $class)=explode(":",$descrizione);
            ?>
            <li class="nav-item">
                <a class="nav-link" href="#" data-page="pages/<?=$pagina?>">
                    <i class="<?=$class?>"></i> <?=$descrizione?>
                </a>
            </li>
            <?
                }
            }
            ?>
        </ul>
        <ul class="navbar-nav ml-auto">
            <? require("include/logout.inc.php");?>
        </ul>
    </div>
</nav>

<div class="container-fluid" id="main-content">
    <!-- Content will be loaded here -->
</div>

<footer class="footer mt-auto py-3 bg-light">
  <div class="container">
    <span class="text-muted">Copyright &copy; 2007 MB | <a href="mailto:marco.biscardi@gmail.com?subject=zoneCalculator">Contact</a></span>
  </div>
</footer>

<script>
$(document).ready(function() {
    // Handle menu clicks
    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        var page = $(this).data('page');
        if (page) {
            $('#main-content').html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>');
            $('#main-content').load(page, function(response, status, xhr) {
                if (status == "error") {
                    $('#main-content').html("Could not load page. Please reload or try again later.");
                }
            });
        }
    });

    // Load the first page by default
    var firstPage = $('.nav-link').first().data('page');
    if(firstPage){
        $('#main-content').html('<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>');
        $('#main-content').load(firstPage);
    }
});
</script>

<?
}
?>
</body>
</html>
<?
require_once("include/bottom.inc.php");
?>
