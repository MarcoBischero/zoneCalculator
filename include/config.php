<?
$border_color = '#ff7200';
$font_color = '#ffffff';
$message_successful = "<link href=\"style.css\" rel=\"stylesheet\" type=\"text/css\">
	<table height=\"100%\" width=\"100%\">
	<tr>
		<td>
		<table align=\"center\" bgcolor=\"#1B486D\" height=\"100\" width=\"300\" style=\"border: 1px solid ".$border_color.";\">
			<tr>
			<td>
			<div align=center><font color=".$font_color.">Operazione effettuata con successo</font> <span class='ui-icon ui-icon-circle-check'></span></div>
			</td>
			</tr>
		</table>
		</td>
	</tr>
	</table>";
$message_scheda = "<link href=\"style.css\" rel=\"stylesheet\" type=\"text/css\">
	<table height=\"100%\" width=\"100%\">
	<tr>
		<td>
		<table align=\"center\" bgcolor=\"#1B486D\" height=\"100\" width=\"300\" style=\"border: 1px solid ".$border_color.";\">
			<tr>
			<td>
			<div align=center><font color=".$font_color.">Per visionare un'altra scheda cliente tornare indietro</font> <img src=\"img/back.gif\"></div>
			</td>
			</tr>
		</table>
		</td>
	</tr>
	</table>";

$message_successful_popup = "<link href=\"../style.css\" rel=\"stylesheet\" type=\"text/css\">
	<table height=\"100%\" width=\"100%\">
	<tr>
		<td>
		<table align=\"center\" bgcolor=\"#1B486D\" height=\"100\" width=\"300\" style=\"border: 1px solid ".$border_color.";\">
			<tr>
			<td>
			<div align=center><font color=".$font_color.">Operazione effettuata con successo</font> <span  class='ui-icon ui-icon-circle-check'></span>><br><br><a href='#' onclick='window.close()'>Chiudi finestra</a></div>
			</td>
			</tr>
		</table>
		</td>
	</tr>
	</table>
	";

$message_logout = "<link href=\"style.css\" rel=\"stylesheet\" type=\"text/css\">
	<link rel='stylesheet' href='jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css' type='text/css' >
	<table height=\"100%\" width=\"100%\">
	<tr>
		<td>
		<table align=\"center\" bgcolor=\"#1B486D\" height=\"100\" width=\"300\" style=\"border: 1px solid ".$border_color.";\">
			<tr>
			<td>
			<div align=center><font color=".$font_color.">Logout effettuato con successo</font> <span class='ui-icon ui-icon-circle-check'></span>
			</td>
			</tr>
		</table>
		</td>
	</tr>
	</table>
	</div>";

	$mail_host="10.10.10.33";
	$server_url= $_SERVER['SERVER_NAME'];
	$CAMversion='v2.0';
	 $DBhostname= 'zonecalcdb.mariadb.database.azure.com';
	 $DBuser= 'zonecalculator@zonecalcdb';
 	$DBpasswd= 'T7r3mGFp_Me6nF-zXR';
	$DBname= 'zoneCalculator';
	 $DBPrefix= '';
	 $DBOld= '';
	 $whitelist = array(
	    '127.0.0.1',
	    '::1'
	);

	if(in_array($_SERVER['REMOTE_ADDR'], $whitelist)){
	    $CAMversion='v2.0';
	 $DBhostname= 'zonecalcdb.mariadb.database.azure.com';
 	$DBuser= 'zonecalculator@zonecalcdb';
 	$DBpasswd= 'T7r3mGFp_Me6nF-zXR';
	$DBname= 'zoneCalculator';
	 $DBPrefix= '';
	 $DBOld= '';
	}
	 $company= 'ZoneCalculator';
?>
