
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<!--[if IE]>
	<style>
		.item .tooltip .content{ display:none; opacity:1; }
		.item .tooltip:hover .content{ display:block; }
	</style>
	<![endif]-->
</head>
<body>
<table border="0" width="100%" bgcolor="#3288CB" align="center" cellpadding="0" cellspacing="0" class="ui-corner-all" style="color:#FFFFFF;">
	  <tr>
	    <td>
		 <section class='form'>
				<form id="addAlimentoFormAlimenti" >
					<fieldset>
						<div class="item">
							<label>
								<span>Descrizione</span>
								<input data-validate-length-range="3" id="desc_alimentoAlimenti" placeholder="ex. Pollo" required="required" />	
							</label>
							<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Nome dell'alimento che si desidera aggiungere</p>
								</div>
							</div>
						</div>
						<div class="item">
							<label>
								<span>Tipo Alimento</span>
								<select name="tipo" id="tipoAlimenti" class="required">
								    	<option value=''>
								    		---Selezionare Tipo---
								    	</option>
										  <?
										  $sql_tipo = "SELECT * FROM ".$DBPrefix."tipo ORDER BY codice_tipo ASC";
											echo $sql_tipo;
											$result_tipo = mysql_query($sql_tipo,CONN);
											$rows_tipo = mysql_num_rows($result_tipo);
											if($rows_tipo!=0){
												while ($row_tipo=mysql_fetch_array($result_tipo,MYSQL_ASSOC)){?>
									      	<option value="<?=$row_tipo['codice_tipo']?>">
									      		<?=$row_tipo['descrizione']?>
									      	</option>
										  <?}
										  }?>
	    							</select>   
							</label>
							<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Tipo alimento</p>
								</div>
							</div>
						</div>
						<div class="item">
							<label>
								<span>Fonte</span>
									<select name="fonte" id="fonteAlimenti" class="required">
								    	<option value=''>
								    		---Selezionare Fonte---
								    	</option>
										  <?
										  $sql_tipo = "SELECT * FROM ".$DBPrefix."fonte ORDER BY codice_fonte ASC";
											//echo $sql_azienda;
											$result_tipo = mysql_query($sql_tipo,CONN);
											$rows_tipo = mysql_num_rows($result_tipo);
											if($rows_tipo!=0){
												while ($row_tipo=mysql_fetch_array($result_tipo,MYSQL_ASSOC)){?>
									      	<option value="<?=$row_tipo['codice_fonte']?>">
									      		<?=$row_tipo['descrizione']?>
									      	</option>
										  <?}
										  }?>
	    							</select>   						</label>
							<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Fonte<br /><em>Ottima - Accettabile - Discutibile</em></p>
								</div>
							</div>
						</div>
						
						<div class="item">
							<label>
								<span>Proteine 100g</span>
									<input style="border:0; font-weight:bold;" required="required" type="text" id="proteine100Alimenti" size="5"  value="" />
							</label>
						<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Proteine per 100g di prodotto</p>
								</div>
							</div>
						</div>
							<div class="item">
							<label>
								<span>Grassi 100g</span>
									<input style="border:0; font-weight:bold;" required="required" type="text" id="grassi100Alimenti" size="5"  value="" />
							</label>
						<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Grassi per 100g di prodotto</p>
								</div>
							</div>
						</div>
							<div class="item">
							<label>
								<span>Carbo 100g</span>
									<input style="border:0; font-weight:bold;" required="required" type="text" id="carboidrati100Alimenti" size="5"  value="" />
							</label>
						<div class='tooltip help'>
								<span>?</span>
								<div class='content'>
									<b></b>
									<p>Carboidrati per 100g di prodotto</p>
								</div>
							</div>
						</div>
					</fieldset>
				</form>	
		 </section>
	</td>
	  </tr>
	</table>
</body>
</html>
