<?
/*------------------------------------------
CHECK SETUP*/
if (!file_exists( '../include/config.php' )){
	if(file_exists('../setup/index.php')){
		header( 'Location: ../setup/index.php' );
		exit();//
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
	<script type="text/javascript" src="js/jquery.canvasjs.min.js"></script>

	
	
	<script type="text/javascript"> 
//$.getScript("js/ajax.js");
//$.getScript("js/validator.js");
$(document).ready( function () {
	if(getCookie('sesso')==='donna'){
	var uomoClass="never",
		 donnaClass="none";
	
}else if(getCookie('sesso')==='uomo'){
		var uomoClass="none",
				donnaClass="never";

}
	var table = $('#tableInfoChart').DataTable({
		dom: 'Bfrtip',
        buttons: [
           'copy', 'excel', 'pdf', 'print', 
        ],
		iDisplayLength : 3,
		ordering: false,
		pagingType: "full_numbers",
		responsive: true,
		autoWidth: false,
		"columnDefs": [
    { className: uomoClass, "targets": [ 2 ] },
			 { className: donnaClass, "targets": [ 4 ] },
			{ className: donnaClass, "targets": [ 5 ] },
			{ className: donnaClass, "targets": [ 6 ] },
		 { className: donnaClass, "targets": [ 7 ] }
  ]
  });

	   
 
    table.buttons().container()
        .appendTo( '#tableInfoChart .col-sm-6:eq(0)' );
	
    
		CanvasJS.addColorSet("greenShades",
                [//colorSet Array
                "#3288CB",
                "#1B486D"              
                ]);
	//Better to construct options first and then pass it as a parameter
	$.getJSON("pages/ajax.php?opt=chart", function (result) {
		console.log(result);		
	var chart = new CanvasJS.Chart("chartContainerInfo", {
	backgroundColor: "#eeeeee",
			zoomEnabled: true,
      panEnabled: true,
			title: {
				text: "ZoneTrend"
			},
      animationEnabled: true,
			data: [{
				type: "spline",  
				showInLegend: true, 
				legendText: "Peso",
				dataPoints: result["peso"]
			},
			{
				type: "spline",  
				showInLegend: true, 
				legendText: "MassaMagra",
				dataPoints: result["MM"]
			},
			{
				type: "spline",
				showInLegend: true,
				legendText: "MassaGrassa",
				dataPoints: result["MG"]
			}
						
			],
			legend: {
			cursor: "pointer",
			itemclick: function (e) {
				if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
					e.dataSeries.visible = false;
				} else {
					e.dataSeries.visible = true;
			}
			chart.render();
			}
		}
		});
		
			 var type= "spline";
			var showInLegend= true;
		if(getCookie('sesso')=='donna'){	
    chart.options.data.push( {type: type, showInLegend: showInLegend, legendText: "Vita", dataPoints: result['vita']} );
		chart.options.data.push( {type: type, showInLegend: showInLegend, legendText: "Anche", dataPoints: result['anche']} );	
		
		}else if(getCookie('sesso')=='uomo'){
			chart.options.data.push( {type: type, showInLegend: showInLegend, legendText: "Addome", dataPoints: result['addome']} );
		}
chart.render();
	});
	$("#contentInfoChart").show();
});
	
			

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
	<div id="contentInfoChart" style="display: none">
		
	<div id="chartContainerInfo" style="display: inline-block; float: center; width: 100%; height: 300px;"></div>
	<br />
	<br />
	
	<?
	//start dispaly
		$query = 'SELECT * FROM '.$DBPrefix.'prot_need WHERE cod_user='.$_COOKIE["id"].' ORDER BY codice_protneed DESC';
			//echo $query;
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){
	?>
		
	<table id="tableInfoChart" cellspacing="0" class="display responsive no-wrap ui-corner-all" style="color:#FFFFFF; width: 100%">
	<thead bgcolor="#1B486D">
      <tr height="40">
        <th class="desktop mobile tablet"><strong>Peso</strong></th>
				<th class="desktop tablet"><strong>Altezza</strong></th>
				<th id="addomeTh" class="desktop tablet uomo"><strong>Addome</strong></th>
				<th class="desktop "><strong>Collo</strong></th>
				<th class="desktop tablet donna" ><strong>Vita</strong></th>
				<th class="desktop tablet donna"><strong>Anche</strong></th>
				<th class="desktop donna"><strong>Polso</strong></th>
				<th class="desktop donna"><strong>Avambraccio</strong></th>
        <th class="desktop mobile tablet"><strong>Blocchi</strong></th>
        <th class="desktop tablet" ><strong>MM (Kg)</strong></th>
        <th class="desktop tablet"><strong>&#37;MG</strong></th>
		    <th class="desktop mobile tablet"><strong>Data</strong></th>
				<th class="desktop mobile tablet"></th>
      </tr>
	</thead>
	<tbody>
		<?
			$conta = 0;
			$color = "#FFFFFF";
			while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			$c_menu++;
				if ($conta == 1){
					$color = "#26689D";
					$conta = 0;
				}else{
					$conta = 1;
					$color = "#2B72AC";
				}	
				
		?>


	  <tr height="40" id="selector<?=$c_menu?>" style="cursor:pointer;background-color: #2191c0;">
        <td style="background-color: #2191c0;"><div align="center">
          <?=$row['peso']?>
        </div></td>
		<td><div align="center">
		  <?=$row['altezza']?>
	    </div></td>
        <td class="uomo" style="display:none"><div align="center">
          <?=$row['addome']?>
        </div></td>
        <td><div align="center">
        <?=$row['collo']?>
        </div></td>
		<td class="donna" style="display:none"><div align="center">
		  <?=$row['vita']?>
	    </div></td>
  	<td class="donna" style="display:none"><div align="center">
		  <?=$row['anche']?>
	    </div></td>
				<td class="donna" style="display:none"><div align="center">
		  <?=$row['polso']?>
	    </div></td>
				<td class="donna" style="display:none"><div align="center">
		  <?=$row['avambraccio']?>
	    </div></td>
				<td ><div align="center">
		  <?=$row['blocchi']?>
	    </div></td>
				<td ><div align="center">
		  <?=$row['percentualeMM']?>
	    </div></td>
				<td ><div align="center">
		  <?=$row['percentualeMG']?>
	    </div></td>
			<td ><div align="center">
		  <?=$row['lastCheck']?>
	    </div></td>
			<td>
			<div align="center" class="ui-widget-header" style="z-index:99">
				<span onclick="notyDelProtNeed(<?=$row['codice_protneed']?>,'<?=$row['lastCheck']?>')" class="ui-icon ui-icon-trash"></span>
        </div>
			</td>
	  </tr>
		<?
			}		
	?>
	</tbody>
	</table>

<?
	}else{
	$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Nessun record da visualizzare</strong></font></div><br>";
			echo $errore;
	}  ?>
	<br />
	
	
		</div>
</body>
</html>
		
		<?
	}

	?>
