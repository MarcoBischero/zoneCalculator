
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<!--[if IE]>
	<style>
		.item .tooltip .content{ display:none; opacity:1; }
		.item .tooltip:hover .content{ display:block; }
	</style>
	<![endif]-->
	<style type="text/css">
.checked {
    text-decoration:line-through;
}
	</style>
	<script>
	$(".checkbox").change(function(){
		var res = $(this).attr("id").split(";");
		if (res[0]=='checkbox'){
			if($(this).is(":checked")) {
				$('#alim'+res[1]).addClass("checked");
				$('#gr'+res[1]).addClass("checked");
			}else{
				$('#alim'+res[1]).removeClass("checked");
				$('#gr'+res[1]).removeClass("checked");
			}
		}
	});

		$("#printRecipe").click(function(){
			$("div.PrintArea").printArea();
		});
                           

	
	</script>
	
	
</head>
<body>
	<?

require_once("../include/connection.php");
		
		$query = 'SELECT `alimenti`.nome AS AlimName, gr_alimento as TotalGrAlimento FROM `pasti_alimenti`,`alimenti` WHERE alimenti.codice_alimento=pasti_alimenti.cod_alimento AND pasti_alimenti.cod_pasto='.$_COOKIE["PastoID"].'' ;
		//echo $query;
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){	
	?>
	
		<div class="PrintArea">
	<table id="tableRecipe" class="ui-corner-all" style="width: 100%; text-decoration: none; color: white;"  border="0" cellpadding="5"  bgcolor="#2B72AC">
		<thead bgcolor="#1B486D">
			<tr height="40">
				<th></th>
				<th><div align="center"><strong>Alimento</strong></div></th>
				<th><div align="center"><strong>Gr. Totali</strong></div></th>
			</tr>
		</thead>
		<tbody>
		<?
			$c = 0;
			while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				$TotalAlimento=$row['TotalGrAlimento'];
				if($TotalAlimento>=1000){ 
					$TotalAlimento=$TotalAlimento/1000;
					$TotalAlimento=$TotalAlimento.' Kg';
				} 
		?>
				<tr style="cursor:pointer" >
					<th>
						<input type="checkbox" id="checkbox;<?=$c?>" class="checkbox">
					</th>
					<th height="20">
						<div align="left" id="alim<?=$c?>"><?=$row['AlimName']?></div>
					</th>
					<th>
						<div align="center" id="gr<?=$c?>"><?=$TotalAlimento?></div>
					</th>
				</tr>
		<?
			$c++;
			}		
	?>
		</tbody>
	</table>
			<br />
	</div>
	<div align="right" style="display: inline-block; float: right">
			<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="printRecipe" type="button">
				<span class="ui-button-text">Stampa</span>
			</button>
		</div>
	<?
	}
	?>
</body>
</html>
