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
<table width="100%" class="ui-corner-all" valign="center" bgcolor="#3288CB" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#FFFFFF;">
  <tr>
    <td>
		 <section class='form'>
						<form id="editMealForm" >
							<fieldset>
								<div class="item">
									<label>
										<span>Descrizione </span>
										<input data-validate-length-range="3" id="descMealEdit" placeholder="ex. Pollo e mele" required="required" />		
									</label>
									<div class='tooltip help'>
										<span>?</span>
										<div class='content'>
											<b></b>
											<p>Nome del pasto</p>
										</div>
									</div>
								</div>
								<div class="item">
									<label>
										<span>Tipo pasto</span>
										<select id="mealTypeEdit" size="1" class="required">
												<option value="">Scegli il tipo di pasto</option>
												<option value="0">Colazione</option>
												<option value="1">Pranzo</option>
												<option value="2">Cena</option>
												<option value="3">Spuntino</option>
											</select>
									</label>
									<div class='tooltip help'>
										<span>?</span>
										<div class='content'>
											<b></b>
											<p>Tipo pasto</p>
										</div>
									</div>
								</div>
								<div class="item">
									<label>
										<span>Note</span>
												<textarea id="noteEdit" style="width: 210px; height: 60px;"></textarea>
									</label>
								<div class='tooltip help'>
										<span>?</span>
										<div class='content'>
											<b></b>
											<p>Descrizione del pasto</p>
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