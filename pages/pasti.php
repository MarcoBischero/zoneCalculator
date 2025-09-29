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

<title>Pasti</title>

<script type="text/javascript"> 
$.getScript("js/ajax.js");

$(document).ready( function () {
     $('#table_pasti').dataTable( {
			 
			pagingType: "full_numbers",
        responsive: {
            details: {
                type: 'inline'
            }
        },
        columnDefs: [
            {
                targets: [ 3 ],
                sortable: false
            },
					{
                targets: [ 4 ],
                sortable: false
            },
            {
                targets: [ 5 ],
                sortable: false
            }
        ],
			 	"autoWidth": false,
        order: [ 0, 'asc' ]
    } );
} );



</script>


  
</head>

<body>
<div align="center" id='contentPasti'>
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
		$query = 'SELECT * FROM '.$DBPrefix.'pasti';
		//echo $query;
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){
	?>
	
	<table id="table_pasti" class="display responsive" style="width: 100%; color:#FFFFFF;">
	<thead bgcolor="#1B486D">
      <tr>
				<th class="desktop mobile tablet"><strong>Nome Pasto</strong></th>
				<th class="desktop"><strong>Tipo pasto</strong></th>
				<th class="desktop mobile tablet"><strong>Blocchi</strong></th>
				<th class="desktop mobile tablet" width="20"></th>
				<th class="desktop tablet" width="20"></th>
				<th class="desktop tablet" width="20"></th>
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
				//$sql_tipo = "SELECT * FROM ".$DBPrefix."pasti_alimenti, alimenti WHERE codice_tipo=".$row['cod_tipo'];
				//echo $sql_tipo;
				//$result_tipo = mysql_query($sql_tipo,CONN);
				//$row_tipo = mysql_fetch_array($result_tipo);
				//$sql_fonte = "SELECT * FROM ".$DBPrefix."fonte WHERE codice_fonte=".$row['cod_fonte'];
				//echo $sql_fonte;
				//$result_fonte = mysql_query($sql_fonte,CONN);
				//$row_fonte = mysql_fetch_array($result_fonte);
				
				switch ($row['mealType']){
					case "0":
						$mealType="Colazione";
						break;
					case "1":
						$mealType="Pranzo";
						break;
					case "2":
						$mealType="Cena";
						break;
					case "3":
						$mealType="Spuntino";
						break;
					
				}
				
		?>

	 <tr height="40" id="selector<?=$c_menu?>" style="cursor:pointer; background-color: #2191c0;" >
        <td height="20" style="background-color: #2191c0;"><div align="center">
          <?=$row['nome']?>
        </div></td>
        <td><div align="center">
          <?=$mealType?>
        </div></td>
        <td><div align="center">
          <?=$row['blocks']?>
        </div></td>	
        <td> 
        	<div align="center" class="ui-widget-header">
        		<span onclick="return loadMeal(<?=$row['codice_pasto']?>);" class="ui-icon ui-icon-pencil">
        		</span>
        	</div>
        </td>	
			<td> 
        	<div align="center" class="ui-widget-header">
        		<span onclick="Cookies.remove('PastoID');loadRecipe(<?=$row['codice_pasto']?>);" class="ui-icon ui-icon-folder-open">
				</span>
        	</div>
        </td>
        <td> 
        	<div align="center" class="ui-widget-header">
        		<span onclick="notyDelPasto(<?=$row['codice_pasto']?>,'<?=fix_special_char($row['nome'])?>')" class="ui-icon ui-icon-trash">
        		</span>
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

	<?	
	}
	?>
	<div id="showRecipe" title="Recipe" style="display:none">
<? include_once('showRecipe.php')?>
	</div>
</div>
		
</body>
</html>