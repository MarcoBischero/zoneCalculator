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
		<title>zoneCalculator</title>
		<link rel="stylesheet" href="css/comboBox.css" type="text/css" />
		<script src="js/validator.js"></script>
		<script type="text/javascript">
			$.getScript("js/ajax.js");
			$.getScript("js/comboBox.js");
			$.getScript("js/noty/packaged/jquery.noty.packaged.min.js");
			//$.getScript("js/validator.js");

			validator.message['empty'] = 'Obbligatorio';
			$('#addAlimentoForm')
				.on('blur', 'input[required], input.optional, select.required', validator.checkField)
				.on('change', 'select.required', validator.checkField)
				.on('keypress', 'input[required][pattern]', validator.keypress);
			$('#saveMeal')
				.on('blur', 'input[required], input.optional, select.required', validator.checkField)
				.on('change', 'select.required', validator.checkField)
				.on('keypress', 'input[required][pattern]', validator.keypress);

			$('#AddAlim').click(function() {
				aggiungiAlimento(true)
			});
			$('#SalvaPasto').click(function() {
				if (Cookies.get('PastoID') !== undefined) {
					editMealfunc(Cookies.get('PastoID'));
				} else {
					saveMealfunc();
				}
			});
			$('#selectAlim > input.ui-autocomplete-input').css('width', '600px');
			$('.readonly').focus(function() {
				$(this).blur();
			});
			$('#calcolatore').dataTable({
    	"bFilter": false,
			"bInfo": false,
				paging: false,
				responsive: {
					details: {
						type: false
					}
				},
				"autoWidth": false,
				ordering: false,
				sorting: false
			});
		</script>

		
	</head>



	<body>

		<div align="center" id='contentCalculator'>
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
		
	?>


				<?
$act = trim($_GET['act']);


?>


					<table border="0"  cellpadding="0" cellspacing="0" id="calcolatore" class="display responsive no-wrap ui-corner-all" style="width:100%; color:#FFFFFF">
						<thead bgcolor="#1B486D">
							<tr align="center" >
								<th class="desktop mobile tablet">
									Alimenti<br />(crudi se non segnalato)
								</th>
								<th class="desktop mobile tablet">
								</th>
								<th align="center" class="desktop tablet-l">
									P<br />100g
								</th>
								<th align="center" class="desktop tablet-l">
									G<br />100g
								</th>
								<th align="center" class="desktop tablet-l">
									C <br />100g
								</th>

								<th align="center" class="desktop mobile tablet">
									Grammi
								</th>

								<th align="center" class="desktop tablet-l">
									Proteine<br />Reali
								</th>
								<th align="center" class="desktop tablet-l">
									Grassi
								</th>
								<th align="center" class="desktop tablet-l">
									Carbo
								</th>
								<th class="desktop mobile tablet">
								</th>
							</tr>
						</thead>
						<tbody>
							<?	$conta = 0;
				$color = "#111111";
				$c_menu=-1;
				while ($c_menu<7) {
				$c_menu++;
					
					if ($conta == 1){
						$color = "#2191c0";
						$conta = 0;
					}else{
						$conta = 1;
						$color = "#2B72AC";
					}	
					?>

								<tr id="selector<?=$c_menu?>" cellpadding="0">
									<td >
										<div id="selectAlim">
											<select class="selAlim" id="selAlim<?=$c_menu?>" style="display:none;" name="selAlim<?=$c_menu?>">
									   <option value=""><p align="center">--- SELEZIONARE ALIMENTO ---</p> </option>
										<?
										$sql = "SELECT * FROM ".$DBPrefix."alimenti,".$DBPrefix."tipo WHERE codice_tipo=cod_tipo AND cod_tipo<>12 ORDER BY nome ASC";
										$result = mysql_query($sql,CONN);
										$rows = mysql_num_rows($result);
										if($rows!=0){
											while ($row=mysql_fetch_array($result,MYSQL_ASSOC)){
												?>
											  <option value="<?=$row['codice_alimento']?>" ><?=$row['nome']?></option>
											  <?
									  	}
									  }
									  ?>
									  <option value=""> --- SELEZIONARE INTEGRATORE ---</option>
									  <?
										$sql = "SELECT * FROM ".$DBPrefix."alimenti,".$DBPrefix."tipo WHERE codice_tipo=cod_tipo AND cod_tipo=12 ORDER BY nome ASC";
										$result = mysql_query($sql,CONN);
										$rows = mysql_num_rows($result);
										if($rows!=0){
											while ($row=mysql_fetch_array($result,MYSQL_ASSOC)){
												?>
											  <option value="<?=$row['codice_alimento']?>" ><?=$row['nome']?></option>
											  <?
									  	}
									  }
									  ?>
									</select>

										</div>
									</td>
									<td>
										<div id="imgFonte<?=$c_menu?>" align="center">
											<img id="img<?=$c_menu?>" src="img/fonte.png" alt="" name="img<?=$c_menu?>" width="15" height="15" border="0">
										</div>
									</td>
									<td align="center" id="p100_<?=$c_menu?>">
										<input class="readonly" style="border:0; font-weight:bold;" type="text" id="proteine100_<?=$c_menu?>" size="5" value="" />
									</td>
									<td align="center"  id="g100_<?=$c_menu?>">
										<input class="readonly" style="border:0; font-weight:bold;" type="text" id="grassi100_<?=$c_menu?>" size="5" value="" />
									</td>
									<td align="center" id="c100_<?=$c_menu?>">
										<input class="readonly" style="border:0; font-weight:bold;" type="text" id="carboidrati100_<?=$c_menu?>" size="5" value="" />
									</td>
									<td align="center">
										<table class="ui-widget-header ui-corner-all" cellpadding="0">
											<tr style="background-color: #f35440;">
												<td>
													<input disabled="disabled" onchange="getNumberOfgramsNew(<?=$c_menu?>,$('#selAlim<?=$c_menu?>').val(),this.value,'0')" id="grammi_<?=$c_menu?>" size="5" style="border:0; font-weight:bold;" type="text">
												</td>
												<td>
														<a onclick="increment(<?=$c_menu?>,10); getNumberOfgramsNew(<?=$c_menu?>,$('#selAlim<?=$c_menu?>').val(),$('#grammi_<?=$c_menu?>').val(),'0')">
															<span style="float: right;" class="ui-icon ui-icon-circle-arrow-n">
												</span>
														</a>
												</td>
												<td>10</td>
												<td>
														<a onclick="decrement(<?=$c_menu?>,10);getNumberOfgramsNew(<?=$c_menu?>,$('#selAlim<?=$c_menu?>').val(),$('#grammi_<?=$c_menu?>').val(),'0')">
															<span style="float: right;" class="ui-icon ui-icon-circle-arrow-s">
														</span>
														</a>
												</td>
											</tr>
										</table>

									</td>

									<td align="center" id="p0_<?=$c_menu?>">
										<input class="readonly" style="border:0; font-weight:bold;" type="text" id="proteine0_<?=$c_menu?>" size="5" value="" />
									</td>
									<td align="center" id="g0_<?=$c_menu?>">
										<input class="readonly" id="grassi0_<?=$c_menu?>" style="border:0; font-weight:bold;" type="text" name="grassi0_<?=$c_menu?>" size="5" value="">
									</td>
									<td align="center" id="c0_<?=$c_menu?>">
										<input class="readonly" id="carboidrati0_<?=$c_menu?>" style="border:0;  font-weight:bold;" type="text" name="carboidrati0_<?=$c_menu?>" size="5" value="">
									</td>
									<td align="center">
										<div  class="ui-widget-header">
											<a onclick="getNumberOfgramsNew(<?=$c_menu?>,$('#selAlim<?=$c_menu?>').val(),'0','0');azzera(<?=$c_menu?>)" >
											<span class="ui-icon ui-icon-trash"></span>
											</a>
											 										

										</div>
									</td>

								</tr>
								<?
					}
					?>

						</tbody>
					</table>
					<br />
					<div>
						<div align="left" style="display: inline-block; float: left">
							<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="AddAlim" type="button">
				<span class="ui-button-text"><i class="fa fa-plus"></i>&nbsp;Aggiungi Alimento</span>
			</button>
						</div>
						<div align="center" style="display: inline-block; float: center">
							<button type="button" id="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" onclick="azzeraTutto()">
				<span class="ui-button-text"><i class="fa fa-ban"></i>&nbsp;Azzera Tutto</span>
			</button>
						</div>
						<div align="right" style="display: inline-block; float: right">
							<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="SalvaPasto" type="button">
				<span id="SaveEdit" class="ui-button-text"><i class="fa fa-floppy-o"></i>&nbsp;Salva Pasto</span>
			</button>
						</div>
					</div>
					<br />
					<br />
					<table style="padding: 5px; text-decoration: none; color: white;" border="0" cellpadding="0" bgcolor="#2B72AC" id="pgcTOT" class="ui-corner-all">
						<tr>
							<td class="testo9px1">
								Tot calorie
								<input class="readonly" id="calorieTot" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
							<td>
								<span class="testo11pxita">
							Totale grammi PGC effettivi
						</span>
							</td>
							<td>
								<input class="readonly" id="proteineTot" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
							<td>
								<input class="readonly" id="grassiTot" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
							<td>
								<input class="readonly" id="carboidratiTot" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
						</tr>
						<tr>
							<td></td>
							<td align="right" class="testo9px1">
								<strong style="font-size:11px">
							Blocchetti
						</strong>
							</td>
							<td>
								<input class="readonly" id="proteineBloc" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
							<td>
								<input class="readonly" id="grassiBloc" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
							<td>
								<input class="readonly" id="carboidratiBloc" type="text" size="4" style="border:0; font-weight:bold;">
							</td>
						</tr>
						<tr>
							<td>Rapporto proteine/carboidrati
								<input class="readonly" type="text" size="4" id="rapportoPC" align="center" style="border:0; font-weight:bold; color:<?=$colorRapporto?>;"></td>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
						</tr>
					</table>
					<br />
					<br />

					<? } ?>






		</div>

		<div id="dialog-message"></div>



		<div id="addAlimento" title="Aggiungi Alimento" style="display:none">
			<? include('addAlimento.php')?>
		</div>
		<div id="saveMeal" title="Salva Pasto" style="display:none">
			<? include ('saveMeal.php') ?>
		</div>
		<div id="editMeal" title="Modifica Pasto" style="display:none">
			<? include ('editMeal.php') ?>
		</div>



	</body>

	</html>
	<?
require_once("../include/bottom.inc.php");
?>