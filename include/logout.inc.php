  <link rel="stylesheet" href="jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css">

<?
//echo '<div align="center">Sei loggato come <b>'.$_COOKIE['cognome'].' '.$_COOKIE['nome'].'</b> - <a href="'.$_SERVER['PHP_SELF'].'?logout=1'.'"><img src="img/logout.gif" border="0"  align="absmiddle" title="logout"></a></div>'

echo
	'<div align="center" class="logout">
		Sei loggato come <b>'.$_COOKIE['cognome'].' '.$_COOKIE['nome'].'</b>
	</div>
	<div align="center" class="ui-state-default ui-corner-all logout" title=".ui-icon-power">
		<a href="'.$_SERVER['PHP_SELF'].'?logout=1'.'">
			<span class="ui-icon ui-icon-power">
			</span>
		</a>
	</div>'
?>