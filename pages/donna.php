
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Uomo</title>
</head>
<body>	 
<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#FFFFFF;">
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
    <td bgcolor="#3288CB">
<form id="fabbisogno">
	<table width="auto" border="0" align="center" cellpadding="0" cellspacing="1" bgcolor="#ED82D1" >
		<tr height="35">
			<td>
			<div id="donna">
						<h1>DONNA</h1>
						Calcolo del fabbisogno proteico giornaliero per la donna. Calcolo della massa magra, Calcolo della percentuale di massa grassa. Calcolo dei blocchi per la dieta zona.
						<form>
							inserire i seguenti dati.
							<p><b>peso kg</b> <input type="text" id="peso" value="" size="5"> (pesarsi la mattina prima di colazione)</p>
							<p><b>altezza cm</b> <input type="text" id="altezza" value="" size="5"></p>
							<p><b>vita cm</b> <input type="text" id="vita" value="" size="5"><br>
								(misurare la circonferenza della vita nel punto più stretto, tra ombelico e sterno, utilizzare un metro da sarto)</p>
							<p><b>anche cm</b> <input type="text" id="anche" value="" size="5"><br>
								(misurare la circonferenza delle anche o dei fianchi nel punto più largo)</p>
							<p><b>collo cm </b><input type="text" id="collo" value="" size="5"><br>
									(circonferenza del collo all'altezza della laringe)</p>
							<p><b>polso cm</b> <input type="text" id="polso" value="" size="5"><br>
									(misurare la circonferenza del polso nel punto in cui si piega, tenendo la mano dritta)</p>
							<p><b>avambraccio cm</b> <input type="text" id="avambraccio" value="" size="5"><br>
								(misurare la circonferenza dell'avambraccio nel punto più largo, tenendolo piegato a 90 gradi e con il palmo della mano rivolto all'insù)</p>
							<p><b>tipo attività</b> <select id="attivita" size="1">
									<option value="1.1">1.1</option>
									<option value="1.3">1.3</option>
									<option value="1.5">1.5</option>
									<option value="1.7">1.7</option>
									<option value="1.9">1.9</option>
									<option value="2.1">2.1</option>
									<option value="2.3">2.3</option>
								</select> (selezionare il tipo di attività fisica che si svolge durante la giornata:</p>
							<p><b>1.1</b> = completamente sedentario.<br>
								<b>1.3</b> = lavoro tranquillo, sempre seduti, no sport.<br>
								<b>1.5 </b>= lavoro normale, qualche camminata, sport occasionale. Selezionare se si rientra tra i soggetti obesi o con massa grassa superiore al 40%.<br>
								<b>1.7</b> = lavoro intenso o sport tre volte alla settimana.<br>
								<b>1.9</b> = lavoro + allenamento ogni giorno (pesi o aerobico).<br>
								<b>2.1</b> = intenso allenamento quotidiano + pesi o macchine.<br>
								<b>2.3</b> = allenamento agonistico + macchine, ogni giorno.</p>
							<p></p>
							<button type="button" id="calcola" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" onclick="addProtNeed(getCookie('sesso'))">
												<span class="ui-button-text">
													Calcola
												</span>
											</button>
							<p></p>
							<p><input type="text" id="percentualeMG" size="7"> % di massa grassa</p>
							<p><input type="text" id="percentualeMM" size="7"> kg di massa magra</p>
							<p><input type="text" id="proteineDay" size="7"> fabbisogno proteico in grammi al giorno</p>
							<p><input type="text" id="blocchiZona" size="7"> totale blocchi zona</p>
							<p></p>
						</form>
					</div>
			</td>
		</tr>
	</table>
</form>
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
 