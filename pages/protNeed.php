<?
/*------------------------------------------
CHECK SETUP*/
if (!file_exists( '../include/config.php' )){
	if(file_exists('../setup/index.php')){
		header( 'Location: ../setup/index.php' );
		exit();
	}else{
		echo 'No configuration file found and no installation code available. Exiting...';
		exit();
	}
}elseif(file_exists( '../include/config.php') && file_exists('../setup/index.php')){
		echo 'Setup folder still exists. Please delete it.';
		exit();
}

/*----------------------------------------*/
$redirect = false;
require_once("../include/connection.php");
require_once("../include/top.inc.php");
require_once("../include/config.php");
require_once("../include/auth_user.php");

cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Fabbisogno Proteico</title>
		<script type="text/javascript">

			$(function() {
				$('.readonly').focus(function() {
					$(this).blur();
				});

				$("." + getCookie('sesso')).show();
				//Better to construct options first and then pass it as a parameter

				$("#contentProtNeed").show();
			});
			validator.message['empty'] = 'Obbligatorio';

			// validate a field on "blur" event, a 'select' on 'change' event & a '.reuired' classed multifield on 'keyup':
			$('#protNeed')
				.on('blur', 'input[required], input.optional, select.required', validator.checkField)
				.on('change', 'select.required', validator.checkField)
				.on('keypress', 'input[required][pattern]', validator.keypress);


		</script>

	</head>


	<?
	if($_GET['logout']=='1'){
		@session_start();
		@session_destroy();
		
		#Here is a way to delete alle cookies and cookie arrays from your domain.###########
		foreach ($_COOKIE as $key=>$value) setcookie($key,'', time()-1, "/" ,NULL,0); 
		####################################################################################
		echo $message_logout;
		header("Refresh: 1; URL=../login.php");
		$redirect = true;
		@ob_end_flush();
	}
	if ($redirect == false){

$act = trim($_GET['act']);


?>

		<body>
			<div id="contentProtNeed" style="display: none; align:left;" width="100%">

				<table width="365px" border="0" align="center" cellpadding="0" class="ui-corner-all" style="color:#FFFFFF;" bgcolor="#3288CB">
					<tr>
						<td>
							<form id="protNeed">
								<fieldset>
									<div class="item">
										<label>
									<span>Peso (Kg)</span>
									<input  id="peso" required="required" value="" size="5" />		
								</label>
										<div class='tooltip help'>
											<span>?</span>
											<div class='content'>
												<b></b>
												<p>Pesarsi la mattina prima di colazione</p>
											</div>
										</div>
									</div>
									<div class="item">
										<label>
									<span>Altezza (cm)</span>
										<input type="text" id="altezza" value="" size="5" required="required"/>						
								</label>
									</div>
									<div class="item">
										<label>
									<span>Collo (cm)</span>
										<input type="text" id="collo" value="" size="5" required="required"/>						
								</label>
										<div class='tooltip help'>
											<span>?</span>
											<div class='content'>
												<b></b>
												<p>Circonferenza all'altezza del pomo di adamo</p>
											</div>
										</div>
									</div>
									<div class="uomo" style="display:none;">
										<div class="item">
											<label>
									<span>Addome (cm)</span>
										<input type="text" id="addome" value="" size="5" required="required" />						
								</label>
											<div class='tooltip help'>
												<span>?</span>
												<div class='content'>
													<b></b>
													<p>Circonferenza della vita all'altezza dell'ombelico</p>
												</div>
											</div>
										</div>
									</div>

									<div class="donna" style="display:none;">

										<div class="item">
											<label>
									<span>Vita (cm)</span>
										<input type="text" id="vita" value="" size="5" required="required"/>						
								</label>
											<div class='tooltip help'>
												<span>?</span>
												<div class='content'>
													<b></b>
													<p>Circonferenza della vita nel punto pi&ugrave; stretto tra ombelico e sterno</p>
												</div>
											</div>
										</div>
										<div class="item">
											<label>
									<span>Anche (cm)</span>
										<input type="text" id="anche" value="" size="5" required="required"/>						
								</label>
											<div class='tooltip help'>
												<span>?</span>
												<div class='content'>
													<b></b>
													<p>Circonferenza delle anche o dei fianchi nel punto pi&ugrave; largo</p>
												</div>
											</div>
										</div>
										<div class="item">
											<label>
									<span>Polso (cm)</span>
										<input type="text" id="polso" value="" size="5" required="required"/>						
								</label>
											<div class='tooltip help'>
												<span>?</span>
												<div class='content'>
													<b></b>
													<p>Circonferenza del polso nel punto in cui si piega, tenendo la mano dritta</p>
												</div>
											</div>
										</div>
										<div class="item">
											<label>
									<span>Avambraccio (cm)</span>
										<input type="text" id="avambraccio" value="" size="5" required="required"/>						
								</label>
											<div class='tooltip help'>
												<span>?</span>
												<div class='content'>
													<b></b>
													<p>Circonferenza dell'avambraccio nel punto pi&ugrave; largo, tenendolo piegato a 90 gradi e con il palmo della mano rivolto all'ins&ugrave;</p>
												</div>
											</div>
										</div>

									</div>
									<div class="item">
										<label>
									<span>Tipo Attivit&agrave;</span>
									<select id="attivita" size="1" class="required">
											<option value="1.1">1.1</option>
											<option value="1.3">1.3</option>
											<option value="1.5">1.5</option>
											<option value="1.7">1.7</option>
											<option value="1.9">1.9</option>
											<option value="2.1">2.1</option>
											<option value="2.3">2.3</option> 
									</select>
								</label>
										<div class='tooltip help'>
											<span>?</span>
											<div class='content'>
												<b></b>
												<p>Tipo di attivit&agrave; fisica svolta durante la giornata:</p><br />
												<p><em>1.1 = Sedentario.</em></p>
												<p><em>1.3 = No sport.</em></p>
												<p><em>1.5 = Sport occasionale (Selezionare se obesi o con massa grassa superiore al 50%).</em></p>
												<p><em>1.7 = Sport tre volte alla settimana.</em></p>
												<p><em>1.9 = Allenamento ogni giorno (pesi o aerobico).</em></p>
												<p><em>2.1 = Allenamento intenso</em></p>
												<p><em>2.3 = Allenamento agonistico + macchine, ogni giorno.</em></p>
											</div>
										</div>
									</div>
								</fieldset>
							</form>
						</td>
					</tr>
				</table>

				<br>
				<div align="center">
					<button type="button" id="calcola" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" onclick="validing('#protNeed',getCookie('sesso'));">
				<span class="ui-button-text">
					Calcola
				</span>
			</button>
				</div>
				<br>
				<table border="0" align="center" cellpadding="0" class="ui-corner-all" style="padding: 5px; color:#FFFFFF;" bgcolor="#3288CB">
					<tr>
						<td>
							<p><input class="readonly" type="text" id="percentualeMG" size="7"> &#37; Massa Grassa</p>
							<p><input class="readonly" type="text" id="percentualeMM" size="7"> Massa Magra (Kg)</p>
							<p><input class="readonly" type="text" id="proteineDay" size="7"> Fabbisogno proteico giornaliero (gr)</p>
							<p><input class="readonly" type="text" id="blocchiZona" size="7"> Totale blocchi zona</p>
						</td>
					</tr>
				</table>
				<br />
			</div>
		</body>

	</html>

	<?
	}

	?>