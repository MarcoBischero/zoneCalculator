<title>zoneCalculator</title>
<script language="JavaScript" src="js/jquery-1.3.1.min.js"></script>
<script type="text/javascript" src="js/jquery-ui-1.7.2.custom.min.js"></script>
<link href="jquery-ui/css/ui-lightness/jquery-ui-1.7.2.custom.css" rel="stylesheet" type="text/css">
<script>
	function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
	function pgcArray(){
	  var p=new Array();
	  var g=new Array();
	  var c=new Array();
	  for(i=0;i<10;i++){
	  	p[i]=document.getElementById('proteine0_'+i).value;
	  	g[i]=document.getElementById('grassi0_'+i).value;
	  	c[i]=document.getElementById('carboidrati0_'+i).value;
	  }
	  pgcTotal(p,g,c);
	}
	function azzeraOnChange(c_menu){
	  document.getElementById('grammi_'+c_menu).value='';
		document.getElementById('proteine0_'+c_menu).value='';
		document.getElementById('grassi0_'+c_menu).value='';
		document.getElementById('carboidrati0_'+c_menu).value='';
		}
	function azzera(c_menu){
		document.getElementById('alimento'+c_menu).selectedIndex=0;
		document.getElementById('img'+c_menu).src='img/fonte.png';
		document.getElementById('proteine100_'+c_menu).value='';
		document.getElementById('grassi100_'+c_menu).value='';
		document.getElementById('carboidrati100_'+c_menu).value='';
	  document.getElementById('grammi_'+c_menu).value='';
		document.getElementById('proteine0_'+c_menu).value='';
		document.getElementById('grassi0_'+c_menu).value='';
		document.getElementById('carboidrati0_'+c_menu).value='';
		}
	function azzeraTutto(){
		for(var i=0; i<10; i++){
			azzera(i);
			}
		}
	</script>
<?
$act = trim($_GET['act']);
if($auth_user==true){

?>
<form id="zoneCalculator">
	<table width="auto" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#1B486D" >
		<tr height="35">
							<td class="testo11px" width="274"><strong>Alimenti</strong> <span class="testo9px2">(normalmente crudi se non segnalato)</span></td>
							<td width="4"><img src="img/fonti.gif" alt="" width="100" height="33" border="0"></td>
							<td class="testo11px" align="center" bgcolor="#1B486D" width="44">P<br>
								100g</td>
							<td class="testo11px" align="center" bgcolor="#1B486D" width="44">G<br>
								100g</td>
							<td class="testo11px" align="center" bgcolor="#1B486D" width="44">C<br>
								100g</td>
							<td width="7"></td>
							<td class="testo11px" bgcolor="#1B486D">
								<div align="center">
									Grammi</div>
							</td>
							<td width="7"></td>
							<td class="testo11px" align="center" bgcolor="#1B486D" width="60">Proteine<br>
						    Reali</td>
						  <td class="testo11px" align="center" bgcolor="#1B486D" width="60">Grassi</td>
							<td class="testo11px" width="60" align="center" bgcolor="#1B486D" >Carbo</td>
							<td width="4"></td>
		</tr>
					<?	$conta = 0;
				$color = "#FFFFFF";
				$c_menu=-1;
				while ($c_menu<9) {
				$c_menu++;
					
					if ($conta == 1){
						$color = "#26689D";
						$conta = 0;
					}else{
						$conta = 1;
						$color = "#2B72AC";
					}	
					?>
					
						<tr id="selector<?=$c_menu?>" bgcolor="<?=$color?>" onmouseOver="this.bgColor=mouseover;" onmouseOut="this.bgColor='<?=$color?>'" style="cursor:pointer" >
							<td width="354" colspan="2">
								<table>
									<tr>
										<td width="354" colspan="2">
								<select name="alimento<?=$c_menu?>" id="alimento<?=$c_menu?>" class="input" style="width:100%" onchange="getNumberOfgrams(<?=$c_menu?>,this.value,document.getElementById('grammi_<?=$c_menu?>').value,'100');azzeraOnChange(<?=$c_menu?>)">
			   <option value="0">----------------------SELEZIONARE ALIMENTO----------------------</option>
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
			  <option value="0">----------------------SELEZIONARE IINTEGRATORE----------------------</option>
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
			</select>	</td><td id="imgFonte<?=$c_menu?>">
		<span><img id="img<?=$c_menu?>" src="img/fonte.png" alt="" name="img<?=$c_menu?>" width="15" height="15" border="0"></span></td>
		</tr>
	</table></td>
							<td align="center" id="p100_<?=$c_menu?>"><input style="border:0; font-weight:bold;" type="text" id="proteine100_<?=$c_menu?>" size="5"  value=""></td>
							<td align="center" id="g100_<?=$c_menu?>"><input style="border:0; font-weight:bold;" type="text" id="grassi100_<?=$c_menu?>" size="5" value=""></td>
							<td align="center" id="c100_<?=$c_menu?>"><input style="border:0; font-weight:bold;" type="text" id="carboidrati100_<?=$c_menu?>" size="5" value=""></td>
							<td width="7"></td>
	
							<td align="center" >
								<input onKeyUp="getNumberOfgrams(<?=$c_menu?>,document.getElementById('alimento<?=$c_menu?>').options[document.getElementById('alimento<?=$c_menu?>').selectedIndex].value,this.value,'0')" id="grammi_<?=$c_menu?>" size="5"  style="border:0; font-weight:bold;" type="text" >
							</td>
							<td width="7"></td>
	
							<td align="center" id="p0_<?=$c_menu?>" width="44"><input id="proteine0_<?=$c_menu?>" style="border:0; font-weight:bold;" type="text" name="proteine0_<?=$c_menu?>" size="5" onfocus="this.blur()">
							</td>                                                     
							<td align="center" id="g0_<?=$c_menu?>" width="44"><input id="carboidrati0_<?=$c_menu?>" style="border:0; font-weight:bold;" type="text" name="grassi0_<?=$c_menu?>" size="5" onfocus="this.blur()">
							</td>
							<td  align="center" id="c0_<?=$c_menu?>"width="44"><input id="grassi0_<?=$c_menu?>" style="border:0;  font-weight:bold;" type="text" name="carboidrati0_<?=$c_menu?>" size="5" onfocus="this.blur()">
							</td>
							<td align="center" ><img onclick="javascript:azzera(<?=$c_menu?>)" src="img/del.gif" width="15" height="15" border="0" alt="azzera"></td>
							
						</tr>
						<?
					}
					?>
				
			</table>
			<br><br>
			<table width="auto" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#2B72AC" id="pgcTOT">
					<tr>
						<td width="430" colspan="3" align="left">
							<button type="button" class="button" onclick="javascript:azzeraTutto()">Azzera Tutto</button>
						</td>		
						<td class="testo9px1" colspan="6" align="right">
							Tot calorie
						
								<input id="calorieTot" type="text" size="3" style="border:0; font-weight:bold;">
						
							<span class="testo11pxita">Totale grammi PGC effettivi</span>
					
								<input id="proteineTot" type="text" size="3" style="border:0; font-weight:bold;">
						
								<input  id="grassiTot" type="text" size="3" style="border:0; font-weight:bold;">
					
								<input id="carboidratiTot" type="text" size="3" style="border:0; font-weight:bold;">
						</td>
					</tr>
		
			<tr>
				<td colspan="7" >
					---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
				</td>
			</tr>

				<tr>
					<td>
							&nbsp;Rapporto proteine/carboidrati &nbsp;&nbsp;&nbsp;&nbsp;
					</td>
					<td >
						<input type="text" size="1" id="rapportoPC" align="center" style="border:0; font-weight:bold;">
					</td>
				<td>
						<span class="testo9px1">migliore = 0,75<br>min 0,6 max1,0</span>
					</td>
					
					<td colspan="6" align="right" class="testo9px1">
						<strong style="font-size:11px">Blocchetti</strong>
					
								<input id="proteineBloc" type="text" size="3" style="border:0; font-weight:bold;">
						
								<input id="grassiBloc" type="text" size="3" style="border:0; font-weight:bold;">
						
								<input id="carboidratiBloc" type="text" size="3" style="border:0; font-weight:bold;">
						</td>
				</tr>
			</table>
</form>
	<script>
	$(function() {
		$( "#dialog:ui-dialog" ).dialog( "destroy" );
	
		$( "#dialog-message" ).dialog({
			modal: true,
			autoOpen: false,
			hide: "explode",
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
	</script>





<div id="dialog-message" title="Alimento Aggiunto">
	
</div>
<script type="text/javascript">
	function creaDivAddAlimento(){
		var ni = document.getElementById('link');
		var listino = document.getElementById('addAlimento');
		var newdiv = document.createElement('div');
		newdiv.setAttribute('id','addAlimento_new');
		newdiv.setAttribute('title','Aggiungi Alimento');
		newdiv.innerHTML = listino.innerHTML;
		ni.appendChild(newdiv);
	}
</script> 
<div id="link"></div>
<div id="addAlimento" style="display:none"><? include ('addAlimento.php') ?></div>

<div align="center">
	     <a style="text-decoration: none;" href="javascript:;" onclick='creaDivAddAlimento(); $(function() {
				var desc_alimento = $( "#desc_alimento" ),
						tipo = $( "#tipo" ),
						fonte = $( "#fonte" ),
						p100 = $( "#proteine100" ),
						g100 = $( "#grassi100" ),
						c100 = $( "#carboidrati100" );
			$("#addAlimento_new").dialog({
				close: function(event, ui) { $("#listino").dialog( "destroy" ) },
				bgiframe: true,
				height: 320,
				width: 700,
				modal: true,
				buttons: {
				"Add": function() {
						addAlim(desc_alimento.val(),tipo.val(),fonte.val(),p100.val(),g100.val(),c100.val());				 
							$( this ).dialog( "close" );
							$( "#dialog-message" ).dialog( "open" );
						
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
				
			});
		});'>
	     <h4>Aggiungi Alimento
	     <img src="img/listino.gif" width="16" height="16" border="0" />
	     </a>
</div>

	
	
				<?
			}?>