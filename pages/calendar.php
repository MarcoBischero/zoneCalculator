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

  <style>

  h1 { padding: .2em; margin: 0; }
  #pasti { width: 80%; margin-right: 2em; }
	li.draggable {display: inline; list-style-type: none; padding-right: 20px};

  </style>
  <script>
  //$.getScript("js/ajax.js");
  $(function() {
		
		$('#ListaSpesa').click(function() {
			groceryListFunc()
		});	
		$('#azzera').click(function() {
				$(".dropped").remove();
				azzeraCalendarCookie();
			
		});
		$('#saveCalendar').click(function() {
			console.log("clickFunc");
			saveCalendar();
			//azzeraCalendarCookie();
		});
	
    $( "#catalog" ).accordion({
	    active: false,
				animated: 'bounceslide',
				icons: {
	    			header: "ui-icon-circle-arrow-e",
	   				headerSelected: "ui-icon-circle-arrow-s"
				},
				heightStyle: "fill",
				collapsible: true
    });
    
    $('#catalog >div').css('height', '100%');

    $( ".draggable" ).draggable({
      appendTo: "body",
			revert: "invalid",
			opacity: 0.7,
      helper: "clone",
			cursor: "pointer"
    });
		
    $( "#table_calendar th" ).droppable({
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      accept: ".draggable, .dropped, ui-draggable",
      drop: function( event, ui ) {
				var draggableId=$(ui.draggable).attr("id");
				var droppableId = $(this).attr("id");
				var parentDroppable = ui.draggable.parent().attr("id")
				 if ( $( ui.draggable ).hasClass( "dropped" ) ) {
								$(ui.draggable).remove();
					 			console.log("dropIDpar"+parentDroppable);
					 			Cookies.remove(parentDroppable);
           } 
				
							
        $( "<p style='cursor:pointer' id="+draggableId+" onclick='return loadMeal("+draggableId+");'></p>" ).text( ui.draggable.text() )
					.addClass("dropped")
					.appendTo( this );
				console.log(droppableId, draggableId+";"+ui.draggable.text());
				let name = droppableId;
				let value = draggableId+";"+ui.draggable.text()

				// encodes the cookie as my%20name=John%20Smith
				document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
				//Cookies.set({name: droppableId, value: draggableId+";"+ui.draggable.text()});
				     
				$(".dropped").draggable({
					appendTo: "body",
					revert: "invalid",
					opacity: 0.7,
					helper: "clone",
    		});
      }
			
    });
		
		
		$("#trash").droppable({
        drop: function(event, ui) {
            if ( $( ui.draggable ).hasClass( "dropped" ) ) {
								$(ui.draggable).remove();
           } 
				
        },
        hoverClass: "ui-state-hover",
				activeClass: "ui-state-hover",
        accept: '.dropped'
    });		
		loadCalendarCookie();
  });
  </script>

<title>Pasti</title>

</head>

<body>
<div align="center" id='contentCalendar' class="ui-corner-all display responsive">

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
	 

	<table id="table_calendar" class="display responsive no-wrap ui-corner-all" id="calendar" cellspacing="0" cellpadding="0" style="width: 100%; color:#FFFFFF;" bgcolor="#1B486D">
	<thead align="center">
      <tr height="40">
        <td align="center"><div align="center"><i class="fa fa-calendar fa-lg"></i></div></td>
		<td><strong>L</strong></td>
		<td><strong>M</strong></td>
		<td><strong>M</strong></td>
		<td><strong>G</strong></td>
		<td><strong>V</strong></td>
		<td><strong>S</strong></td>
		</tr>
	</thead>
	<tbody>
<?
		$conta=0;
			for($i=0;$i<6;$i++){
				if ($conta == 1){
					$color = "#26689D";
					$conta = 0;
				}else{
					$conta = 1;
					$color = "#2B72AC";
				}
				echo '<tr style="z-index:1" bgcolor='.$color.' height="40">'; 
				switch ($i) {
					case 0:
						echo '<td bgcolor="#1B486D" align="center"><div align="center"><i class="flaticon-toast"></i></div></td>';
						break;
					case 1:
						echo '<td bgcolor="#1B486D"><div align="center"><i class="flaticon-yogurt"></i></div></td>';
						break;
					case 2:
						echo '<td bgcolor="#1B486D"><div align="center"><i class="flaticon-insalata"></i></div></td>';
						break;
					case 3:
						echo '<td bgcolor="#1B486D"><div align="center"><i class="flaticon-yogurt"></i></div></td>';
						break;
					case 4:
						echo '<td bgcolor="#1B486D"><div align="center"><i class="flaticon-pesce"></i></div></td>';
						break;
					case 5:
						echo '<td bgcolor="#1B486D"><div align="center"><i class="flaticon-yogurt"></i></div></td>';
						break;
				}			
				for($c=0;$c<6;$c++){
					$query = 'SELECT * FROM '.$DBPrefix.'calendar_items,'.$DBPrefix.'pasti WHERE calendar_items.column='.$c.' AND calendar_items.order='.$i.' AND calendar_items.cod_pasto=pasti.codice_pasto AND calendar_items.id_user='.$_COOKIE["id"];
					//echo $query;
					$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
					echo '<th id="'.$c.$i.'"></th>';
					if($row = mysql_fetch_array($result, MYSQL_ASSOC)){
						setcookie($c.$i, $row["cod_pasto"].";".rawurldecode($row["nome"]).' | '.$row['blocks'], strtotime( '+365 days' ),"/" );
					}
				}
				echo'</tr>';
			}	
		?>
	</tbody>
	</table>
	<br>
	<div>
		
		<div align="left" style="display: inline-block; float: left; width:75px;height:75px;">
			<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="azzera" type="button">
				<span class="ui-button-text"><i class="fa fa-ban fa-lg"></i><br />&nbsp;Azzera</span>
			</button>
		</div>
		<div align="right" style="display: inline-block; float: left; width:75px;height:75px;" >
				<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="azzera" type="button">
			<span id="trash" class="ui-button-text"><i class="fa fa-trash fa-lg"></i><br />&nbsp;Elimina</span>
			</button>
		</div>
		<div align="center" style="display: inline-block; float: center; width:110px;height:75px;">
			<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="ListaSpesa" type="button">
				<span class="ui-button-text"><i class="fa fa-shopping-basket fa-lg"></i><br />&nbsp;Lista Spesa</span>
			</button>
		</div>
		<div align="right" style="display: inline-block; float: right; width:75px;height:75px;">
			<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="saveCalendar" type="button">
				<span class="ui-button-text"><i class="fa fa-floppy-o fa-lg"></i><br />&nbsp;Save</span>
			</button>
		</div>
	</div>

<br>
	<br>
	<div id="pasti">
		<div style="text-align: center;">
			  <h1 style="text-align: center; " class="ui-widget-header ui-corner-all"><i class="fa fa-cutlery fa-lg"></i>&nbsp;Pasti</h1>
		</div>
  <div id="catalog">
		<div style="text-align: center;">
    <h2 style="text-align: left; display: inline-block;"><a href="#"><i class="flaticon-yogurt"></i>&nbsp;Spuntino</a></h2>
		</div> <div>
      <?
				$sql_tipo = "SELECT * FROM ".$DBPrefix."pasti WHERE mealType='3'";
				//echo $sql_azienda;
				$result_tipo = mysql_query($sql_tipo,CONN);
				while ($row_tipo = mysql_fetch_array($result_tipo, MYSQL_ASSOC)) {

  ?>
        <li style="cursor:pointer" id="<?=$row_tipo['codice_pasto']?>" class="draggable"><? echo $row_tipo['nome'].' | '.$row_tipo['blocks']?></li>
        <?
	        }
        ?>
    </div>
	<div style="text-align: center;">
   <h2 style="text-align: left; display: inline-block;"><a href="#"><i class="flaticon-toast"></i>&nbsp;Colazione</a></h2>
		</div>
		<div>
      <?
				$sql_tipo = "SELECT * FROM ".$DBPrefix."pasti WHERE mealType='0'";
				//echo $sql_azienda;
				$result_tipo = mysql_query($sql_tipo,CONN);
				while ($row_tipo = mysql_fetch_array($result_tipo, MYSQL_ASSOC)) {

  ?>
        <li style="cursor:pointer" id="<?=$row_tipo['codice_pasto']?>" class="draggable"><? echo $row_tipo['nome'].' | '.$row_tipo['blocks']?></li>
        <?
	        }
        ?>
    </div>
    <div style="text-align: center;">
    <h2 style="text-align: left; display: inline-block;"><a href="#"><i class="flaticon-insalata"></i>&nbsp;Pranzo</a></h2>
		</div>
		<div>
      <?
				$sql_tipo = "SELECT * FROM ".$DBPrefix."pasti WHERE mealType='1'";
				//echo $sql_azienda;
				$result_tipo = mysql_query($sql_tipo,CONN);
				while ($row_tipo = mysql_fetch_array($result_tipo, MYSQL_ASSOC)) {

  ?>
        <li style="cursor:pointer" id="<?=$row_tipo['codice_pasto']?>" class="draggable"><? echo $row_tipo['nome'].' | '.$row_tipo['blocks']?></li>
        <?
	        }
        ?>
    </div>
    <div style="text-align: center;">
    <h2 style="text-align: left; display: inline-block;"><a href="#"><i class="flaticon-pesce"></i>&nbsp;Cena</a></h2>
		</div>
		<div>
      <?
				$sql_tipo = "SELECT * FROM ".$DBPrefix."pasti WHERE mealType='2'";
				//echo $sql_azienda;
				$result_tipo = mysql_query($sql_tipo,CONN);
				while ($row_tipo = mysql_fetch_array($result_tipo, MYSQL_ASSOC)) {

  ?>
        <li style="cursor:pointer" id="<?=$row_tipo['codice_pasto']?>"  class="draggable"><? echo $row_tipo['nome'].' | '.$row_tipo['blocks']?></li>
        <?
	        }
        ?>

    </div>
    
  </div>
</div>
<?
	  ?>
	<br />

	<?	
	}
	?>
</div>
	<div id="groceryList" title="Grocery List" style="display:none">
<? include_once('groceryList.php')?>
	</div>
</body>
</html>