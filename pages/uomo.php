
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Uomo</title>

<script type="text/javascript">
$.getScript("js/noty/packaged/jquery.noty.packaged.min.js");
$.getScript("js/validator.js");

validator.message['empty'] = 'Obbligatorio';
		
		// validate a field on "blur" event, a 'select' on 'change' event & a '.reuired' classed multifield on 'keyup':
		$('#protNeed')
			.on('blur', 'input[required], input.optional, select.required', validator.checkField)
			.on('change', 'select.required', validator.checkField)
			.on('keypress', 'input[required][pattern]', validator.keypress);



		var n = noty({
			type        : 'information',
            dismissQueue: true,
            modal		: true,
            layout      : 'centerRight',
            theme       : 'defaultTheme',
			text: "Calcolo del fabbisogno proteico giornaliero, della massa magra, della percentuale di massa grassa e dei blocchi per la dieta zona.",
			});	

					
			

</script>
</head>
<body>	 
<table border="0" align="center" cellpadding="0" cellspacing="0"  style="color:#FFFFFF;">
  <tr>
    <td>
    	<img src="../img/corner_top_left.gif"/>
    </td>
    <td background="../img/bg_pages_top.gif">
    	<div align="center" style="font-weight: bold">
    		<?=$company.' WEB INTERFACE'?> 
    	</div>
    </td>
    <td>
    	<img src="../img/corner_top_right.gif"/>
    </td>
  </tr>
  <tr>
    <td background="img/bg_pages_left.gif">
    </td>
    <td bgcolor="#3288CB" >
			<div id="uomo" >
					<form id="protNeed" style="min-width:550px" >
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
										<p>Circonferenza del collo all'altezza del pomo di adamo</p>
									</div>
								</div>
							</div>
							<div class="item">
								<label>
									<span>Addome (cm)</span>
										<input type="text" id="addome" value="" size="5" required="required" />						
								</label>
								<div class='tooltip help'>
									<span>?</span>
									<div class='content'>
										<b></b>
										<p>Misurare la circonferenza della vita all'altezza dell'ombelico,<br /> utilizzare un metro da sarto</p>
									</div>
								</div>
							</div>
							<div class="item">
								<label>
									<span>Tipo Attivit&agrave;</span>
									<select id="attivita" size="1">
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
										<p>Selezionare il tipo di attivit&agrave; fisica che si svolge durante la giornata:</p><br />
											<p><em>1.1 = Completamente sedentario.</em></p>
											<p><em>1.3 = Lavoro tranquillo, sempre seduti, no sport.</em></p>
											<p><em>1.5 = Lavoro normale, qualche camminata, sport occasionale (Selezionare se si rientra tra i soggetti obesi o con massa grassa superiore al 50%).</em></p>
											<p><em>1.7 = Lavoro intenso o sport tre volte alla settimana.</em></p>
											<p><em>1.9 = Lavoro + allenamento ogni giorno (pesi o aerobico).</em></p>
											<p><em>2.1 = Intenso allenamento quotidiano + pesi o macchine.</em></p>
											<p><em>2.3 = Allenamento agonistico + macchine, ogni giorno.</em></p> 
									</div>
								</div>
							</div>
		
									
							<div align="center">
								<button type="button" id="calcola" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" onclick="validing('#protNeed',getCookie('sesso'));">
									<span class="ui-button-text">
										Calcola
									</span>
								</button>
							</div>
									<p></p>
									<p><input type="text" id="percentualeMG" size="7"> % di massa grassa</p>
									<p><input type="text" id="percentualeMM" size="7"> kg di massa magra</p>
									<p><input type="text" id="proteineDay" size="7"> fabbisogno proteico in grammi al giorno</p>
									<p><input type="text" id="blocchiZona" size="7"> totale blocchi zona</p>
									<p></p>
						</fieldset>
					</form>

				</div>
	</td>
    <td background="../img/bg_pages_right.gif">
    </td>
  </tr>
  <tr>
    <td>
		<img src="../img/corner_bottom_left.gif"/>
    </td>
    <td background="../img/bg_pages_bottom.gif">
    	<? require_once("../include/logout.inc.php");?>
    </td>
    <td>
    	<img src="../img/corner_bottom_right.gif"/>
    </td>
  </tr>
</table>
</body>
</html>
 