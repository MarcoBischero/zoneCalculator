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
<script type="text/javascript"> 
//$.getScript("js/ajax.js");

$(document).ready( function () {
    $('#table_alimenti').dataTable( {
			pagingType: "full_numbers",
        responsive: {
            details: {
                type: 'inline'
            }
        },
        columnDefs: [
            {
                targets: [ 6 ],
                sortable: false
            },
            {
                targets: [ 7 ],
                sortable: false
            }
        ],
			  "autoWidth": false,
        order: [ 0, 'asc' ]
    } );
} );
$('#AddAlimAlimenti').click(function() {
				aggiungiAlimento(false)
			});
validator.message['empty'] = 'Obbligatorio';	
	$('#editAlimentoForm')
			.on('blur', 'input[required], input.optional, select.required', validator.checkField)
			.on('change', 'select.required', validator.checkField)
			.on('keypress', 'input[required][pattern]', validator.keypress);
	$('#addAlimentoFormAlimenti')
			.on('blur', 'input[required], input.optional, select.required', validator.checkField)
			.on('change', 'select.required', validator.checkField)
			.on('keypress', 'input[required][pattern]', validator.keypress);
			
</script>

</head>
<body>
<div align="center" id='contentAlimenti'>
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

	//start dispaly
		$query = 'SELECT * FROM '.$DBPrefix.'alimenti'.$query_prodotto.' ORDER BY nome ASC';
			//echo $query;
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){
	?>
	<table id="table_alimenti" class="display responsive" style="width: 100%; color:#FFFFFF;">
	<thead height="40" bgcolor="#1B486D">
      <tr >
    <th class="desktop mobile tablet"><strong>Nome</strong></th>
		<th class="desktop"><strong>Proteine</strong></th>
		<th class="desktop"><strong>Carboidrati</strong></th>
		<th class="desktop"><strong>Grassi</strong></th>
		<th class="desktop tablet"><strong>Tipo</strong></th>
		<th class="desktop mobile tablet"><strong>Fonte</strong></th>
		<th class="desktop mobile tablet"></th>
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
				$sql_tipo = "SELECT * FROM ".$DBPrefix."tipo WHERE codice_tipo=".$row['cod_tipo'];
				//echo $sql_azienda;
				$result_tipo = mysql_query($sql_tipo,CONN);
				$row_tipo = mysql_fetch_array($result_tipo);
				$sql_fonte = "SELECT * FROM ".$DBPrefix."fonte WHERE codice_fonte=".$row['cod_fonte'];
				//echo $sql_azienda;
				$result_fonte = mysql_query($sql_fonte,CONN);
				$row_fonte = mysql_fetch_array($result_fonte);
				
		?>


	  <tr height="40" id="selector<?=$c_menu?>" style="cursor:pointer; background-color: #2191c0;" >
        <td height="20" style="background-color: #2191c0;"><div align="center">
          <?=$row['nome']?>
        </div></td>
		<td><div align="center">
		  <? echo str_replace('.',',',$row['proteine'])?>
	    </div></td>
        <td><div align="center">
          <? echo str_replace('.',',',$row['carboidrati'])?>
        </div></td>
        <td><div align="center">
        <? echo str_replace('.',',',$row['grassi'])?>
        </div></td>
		<td><div align="center">
		  <?=$row_tipo['descrizione']?>
	    </div></td>
        <td>
        	<div align="center">
        		<img WIDTH="20" HEIGHT="20" src="img/<?=$row_fonte['img']?>" />
             </div>
        </td>
        <td> 
        	<div align="center" class="ui-widget-header">
        		<span onclick="return modifyAlimento('<?=$row['codice_alimento']?>','<?=fix_special_char_sql($row['nome'])?>','<?=$row['cod_tipo']?>','<?=$row['cod_fonte']?>','<?=str_replace('.',',',$row['proteine'])?>','<?=str_replace('.',',',$row['grassi'])?>','<?=str_replace('.',',',$row['carboidrati'])?>');" class="ui-icon ui-icon-pencil">
				</span>
        	</div>
        </td>
       <td> 
   		<div align="center" class="ui-widget-header">
		   	<span onclick="notyDelAlimento(<?=$row['codice_alimento']?>,'<?=fix_special_char_sql($row['nome'])?>')" class="ui-icon ui-icon-white ui-icon-trash">
		   	</span>
		</div>
       </td>
	  </tr>
		<?
			}		
	?>
	</tbody>
	</table>
	<div align="left" style="display: inline-block; float: left">
							<button role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" id="AddAlimAlimenti" type="button">
				<span class="ui-button-text"><i class="fa fa-plus"></i>&nbsp;Aggiungi Alimento</span>
			</button>
						</div>
	<?
	}else{
	$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Nessun record da visualizzare</strong></font></div><br>";
			echo $errore;
	}  ?>
	<br />
	
	
	<?
		
	}
	?>
</div>


<div id="addAlimentoAlimenti" title="Aggiungi Alimento" style="display:none">
<? include_once('addAlimentoAlimenti.php')?>
	</div>
	
	<div id="editAlimento" title="Modifica Alimento" style="display:none">
<? include_once('editAlimento.php')?>
	</div>

</body>
</html>