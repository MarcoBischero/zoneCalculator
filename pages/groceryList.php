
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
		}else if(res[0]=='checkday'){
			if($(this).is(":checked")) {
				Cookies.set("groceryDay"+res[1], true, { expires: 365 });
				Cookies.set("groceryCheck"+res[1], true, { expires: 365 });
				$('#groceryList').load("pages/groceryList.php");
				//$($(this)).attr("checked", true);

			}else{
				Cookies.remove("groceryDay"+res[1]);
				Cookies.remove("groceryCheck"+res[1]);
				$('#groceryList').load("pages/groceryList.php");
				//$($(this)).attr("checked", false);

			}
		}
	});

		$("#print_button").click(function(){
			$("div.PrintArea").printArea();
		});
                           

	
	</script>
	
	
</head>
<body>
	<div style="width: 100%;" align="justify">
		<input type="checkbox" id="checkday;0" class="checkbox" <? if(isset($_COOKIE['groceryCheck0'])) echo 'checked="checked"'?>><span>L</span>
		<input type="checkbox" id="checkday;1" class="checkbox" <? if(isset($_COOKIE['groceryCheck1'])) echo 'checked="checked"'?>><span>M</span>
		<input type="checkbox" id="checkday;2" class="checkbox" <? if(isset($_COOKIE['groceryCheck2'])) echo 'checked="checked"'?>><span>M</span>
		<input type="checkbox" id="checkday;3" class="checkbox" <? if(isset($_COOKIE['groceryCheck3'])) echo 'checked="checked"'?>><span>G</span>
		<input type="checkbox" id="checkday;4" class="checkbox" <? if(isset($_COOKIE['groceryCheck4'])) echo 'checked="checked"'?>><span>V</span>
		<input type="checkbox" id="checkday;5" class="checkbox" <? if(isset($_COOKIE['groceryCheck5'])) echo 'checked="checked"'?>><span>S</span>
	</div>
	<?

require_once("../include/connection.php");
	
		if(isset($_COOKIE['groceryDay0']) || isset($_COOKIE['groceryDay1']) || isset($_COOKIE['groceryDay2']) || isset($_COOKIE['groceryDay3']) || isset($_COOKIE['groceryDay4']) || isset($_COOKIE['groceryDay5'])  ) {
    	$query_update=false;
			$queryDay=' AND calendar_items.column in (';
			if(isset($_COOKIE['groceryDay0'])){
				$queryDay=$queryDay."'0'";
				$query_update=true;	
			}
			if($query_update==true) $query_union=','; else $query_union=''; 
			if(isset($_COOKIE['groceryDay1'])){
				$queryDay=$queryDay.$query_union."'1'";
				$query_update=true;
			}
			if($query_update==true) $query_union=','; else $query_union=''; 
			if(isset($_COOKIE['groceryDay2'])){
				$queryDay=$queryDay.$query_union."'2'";
				$query_update=true;
			}
			if($query_update==true) $query_union=','; else $query_union=''; 
			if(isset($_COOKIE['groceryDay3'])){
				$queryDay=$queryDay.$query_union."'3'";
				$query_update=true;
			}	
			if($query_update==true) $query_union=','; else $query_union=''; 
			if(isset($_COOKIE['groceryDay4'])){
				$queryDay=$queryDay.$query_union."'4'";
				$query_update=true;
			}	
			if($query_update==true) $query_union=','; else $query_union=''; 
			if(isset($_COOKIE['groceryDay5'])){
				$queryDay=$queryDay.$query_union."'5'";
				$query_update=true;
			}	
			$queryDay=$queryDay.')';
		}	
		

	
		$query = 'SELECT `alimenti`.nome AS AlimName, SUM(`pasti_alimenti`.gr_alimento) AS TotalGrAlimento FROM `calendar_items`,`pasti_alimenti`,`alimenti` WHERE calendar_items.id_user='.$_COOKIE["id"].''.$queryDay.' AND cod_alimento=codice_alimento AND calendar_items.cod_pasto=pasti_alimenti.cod_pasto GROUP BY alimenti.nome';
		//echo $query;
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){	
	?>
	
		<div class="PrintArea">
	<table id="tableGrocery" class="ui-corner-all" style="width: 100%; text-decoration: none; color: white;"  border="0" cellpadding="5"  bgcolor="#2B72AC">
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
				if($row['TotalGrAlimento']>=1000){ 
					$TotalAlimento=$row['TotalGrAlimento']/1000;
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
			<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="print_button" type="button">
				<span class="ui-button-text">Stampa</span>
			</button>
		</div>
	<?
	}
	?>
</body>
</html>
