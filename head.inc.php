<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script type="text/javascript">
	var mouseover = "#ff9703";
	var mouseout = "";
	function PopupCentrata(pagina, get) {
		var w = 1024;
		var h = 260;
		open("pages/" + pagina + get + "", "", "width=" + w + ",height=" + h + ", left=" + ((screen.width - w) / 2) + ",top=" + ((screen.height - h) / 2) + ",scrollbars=yes,status=no");
	}
	//-->
	(function($) {
		$("#dialog:ui-dialog").dialog("destroy");

		$("#dialog-message").dialog({
			modal: true,
			autoOpen: false,
			hide: "explode",
			buttons: {
				Ok: function() {
					$(this).dialog("close");
				}
			}
		});
	});
</script>
<!-- Begin Cookie Consent plugin by Silktide - http://silktide.com/cookieconsent -->
<script type="text/javascript">
	window.cookieconsent_options = {
		"message": "Questo programma usa i cookies per fornirti la migliore esperienza possibile.",
		"dismiss": "Accetto!!",
		"learnMore": "Info",
		"link": null,
		"theme": "dark-bottom"
	};
</script>

<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js"></script>
<!-- End Cookie Consent plugin -->

<link rel="apple-touch-icon" sizes="57x57" href="favicon/apple-touch-icon-57x57.png" />
<link rel="apple-touch-icon" sizes="60x60" href="favicon/apple-touch-icon-60x60.png" />
<link rel="apple-touch-icon" sizes="72x72" href="faviconapple-touch-icon-72x72.png" />
<link rel="apple-touch-icon" sizes="76x76" href="favicon/apple-touch-icon-76x76.png" />
<link rel="apple-touch-icon" sizes="114x114" href="favicon/apple-touch-icon-114x114.png" />
<link rel="apple-touch-icon" sizes="120x120" href="favicon/apple-touch-icon-120x120.png" />
<link rel="apple-touch-icon" sizes="144x144" href="favicon/apple-touch-icon-144x144.png" />
<link rel="apple-touch-icon" sizes="152x152" href="favicon/apple-touch-icon-152x152.png" />
<link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon-180x180.png" />
<link rel="icon" type="image/png" href="favicon/favicon-32x32.png" sizes="32x32" />
<link rel="icon" type="image/png" href="favicon/favicon-194x194.png" sizes="194x194" />
<link rel="icon" type="image/png" href="favicon/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/png" href="favicon/android-chrome-192x192.png" sizes="192x192" />
<link rel="icon" type="image/png" href="favicon/favicon-16x16.png" sizes="16x16" />
<link rel="manifest" href="favicon/manifest.json" />
<link rel="mask-icon" href="favicon/safari-pinned-tab.svg" color="#5bbad5" />
<meta name="apple-mobile-web-app-title" content="zoneCalculator" />
<meta name="application-name" content="zoneCalculator" />
<meta name="msapplication-TileColor" content="#da532c" />
<meta name="msapplication-TileImage" content="favicon/mstile-144x144.png" />
<meta name="theme-color" content="#ffffff" />


<?


if(substr($_SERVER['PHP_SELF'],5)=='login.php')
	echo '<title> Login Area </title>'; 
if ($_GET['pg']=="")
	echo '<title>zoneCalculator</title>'; 
	
	?>