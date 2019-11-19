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

if(!is_dir('../ordini')){
	mkdir("../ordini", 0775); //standard files folder
	
}
if(!is_dir('../piano_promo')){
	mkdir("../piano_promo", 0775); //standard files folder
	
}
cancella_tmp('../ordini');
cancella_tmp('../piano_promo');
cancella_random_key($DBPrefix);
//print_r( $_SESSION['userid']);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<? require_once("../head.inc.php"); 
	
?>
<body>


<div align="center" id='content'>
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
<title>Alimenti</title>
<script src="jquery-ui-1.10.4.custom/js/jquery-1.10.2.js"></script>
<script src="jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js"></script>
<link rel="stylesheet" href="jquery-ui-1.10.4.custom/css/custom-theme/jquery-ui-1.10.4.custom.css">

	<script type="text/javascript" src="js/typesearch/jquery.typesearch.js"></script>
<link href="js/typesearch/typesearch.css" rel="stylesheet" type="text/css">

<script type="text/javascript" src="js/jquery.contextMenu/jquery.contextMenu.js"></script>
<link href="js/jquery.contextMenu/jquery.contextMenu.css"  rel="stylesheet" type="text/css">

<ul id="myMenu" class="contextMenu">
    <li class="edit">
        <a href="#edit">Modifica</a>
    </li>
        <li class="delete">
        <a href="#delete">Cancella</a>
    </li>
 </ul>
<script type="text/javascript">
	$(function(){ // it's domready
		$('.search').typeSearch();
	});
</script>

<?
$act = trim($_GET['act']);


?>
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
if(trim($_GET['act'])!="add" && trim($_GET['act'])!="edit" && trim($_GET['act'])!="add_cat" && trim($_GET['act'])!="view_cat" && trim($_GET['act'])!="edit_cat"){
?>

 <table align="center">
  	<tr>
			<td height="35" colspan="2" bgcolor="#1B486D"><div align="center"><strong>RICERCA ALIMENTO</strong></div></td>
		</tr>
  	<tr>
			<td  height="20" bgcolor="#26689D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Prodotto</tag>:</td>
			<td align="center" height="20" bgcolor="#26689D"><input class="search" name="prodotto" id="prodotto" value='<?=fix_special_char($_GET['prodotto'])?>' onkeypress="SearchProduct(document.getElementById('prodotto').value,document.getElementById('azienda').value)" />
		  </td>
		</tr>
		
  </table>
<br />
<div align="center"><button name="Cerca" type="button" class="button" id="Cerca" onClick="SearchProduct(document.getElementById('prodotto').value)">Cerca</button>
</div>
<br />
<br />
<? } 
	//start dispaly
	if(strlen($act)==0){
		if ($_GET['prodotto']!=''){
			if($_GET['prodotto']!=''){
				$query_prodotto = $query_union.' WHERE (nome LIKE "%'.fix_special_char_sql($_GET["prodotto"]).'%" )';	
				$query_update=true;	
			}
			$query_union=' WHERE ';
			
		}
			$query = 'SELECT * FROM '.$DBPrefix.'alimenti'.$query_prodotto.' ORDER BY nome ASC';
			//echo $query;
		$count=querycount($query);
			offset($count,10,"");			
			$query .=" LIMIT $offset,$limit";	
			$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
			$rows = mysql_num_rows($result);
		if($rows>0){
	?>
	<div id="table_alimenti">
	<table width="auto" border="0" align="center" cellpadding="0" cellspacing="1" bgcolor="#1B486D" >
      <tr height="35">
        <td width="80" bgcolor="#1B486D"><div align="center"><strong>Nome</strong></div></td>
		<td width="130" bgcolor="#1B486D"><div align="center"><strong>Proteine</strong></div></td>
		<td width="130" bgcolor="#1B486D"><div align="center"><strong>Carboidrati</strong></div></td>
		<td width="80" bgcolor="#1B486D"><div align="center"><strong>Grassi</strong></div></td>
		<td width="80" bgcolor="#1B486D"><div align="center"><strong>Tipo</strong></div></td>
		<td width="80" bgcolor="#1B486D"><div align="center"><strong>Fonte</strong></div></td>
      </tr>
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
		<script type="text/JavaScript">
		
			$(function() {
			    $("#selector<?=$c_menu?>").contextMenu({menu: "myMenu"},
			        function(action, el, pos) {
			        if(action=="edit"){
			        	window.location.href="<?=$_SERVER['PHP_SELF'].'?'.fix_special_char($_SERVER['QUERY_STRING'],1)?>&act=edit&id=<?=$row['codice_alimento']?>&tipo=<?=$row['cod_tipo']?>&fonte=<?=$row['cod_fonte']?>";
			        }
			        if(action=="delete"){
			        	if(elimina_prodotto("<?=$row['nome']?>")) {
			        		delProdotto(<?=$row['codice_alimento']?>);
			        	}
					}

 
			        });
			});
		</script>

	  <tr id="selector<?=$c_menu?>" bgcolor="<?=$color?>" onmouseOver="this.bgColor=mouseover;" onmouseOut="this.bgColor='<?=$color?>'" style="cursor:pointer" onClick="window.location.href='<?=$_SERVER['PHP_SELF'].'?'.fix_special_char($_SERVER['QUERY_STRING'],1)?>&act=edit&id=<?=$row['codice_alimento']?>&tipo=<?=$row['cod_tipo']?>&fonte=<?=$row['cod_fonte']?>'">
        <td height="20"><div align="center">
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
        <td><div align="center">
        	<img WIDTH="20" HEIGHT="20" src="img/<?=$row_fonte['img']?>" />
          
        </div></td>
	  </tr>
		<?
			}		
	?>
	</table>
<?
	}else{
	$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Nessun record da visualizzare</strong></font></div><br>";
			echo $errore;
	}  ?>
	<br />
	
	<div align="center"><?

foreach ($arrayPaging as $page){
	echo $page;
}
?></div><div align="center"><br /><tag>Totale record</tag>: <?=$count?></div></div>
	<? }
	//end display
	elseif($act=="add" || $act=="edit"){//----------------------------------------------------------------------------------------------------------- START ADD
		if($act=="edit"){
			$edit = true;
			$button_value = "Modifica";
			$userid=trim($_GET['id']);
			if(is_numeric($userid)){
				$query = 'SELECT * FROM '.$DBPrefix.'alimenti WHERE codice_alimento='.$userid;
				$result = mysql_query($query,CONN);
				$rows = mysql_num_rows($result);
				if ($rows != 0){
					$row = mysql_fetch_array($result, MYSQL_ASSOC);
					$nome = fix_special_char($row['nome']);
					$proteine = fix_special_char($row['proteine']);
					$carboidrati = fix_special_char($row['carboidrati']);
					$grassi = fix_special_char($row['grassi']);
					$tipo = fix_special_char($row['cod_tipo']);
					$fonte = fix_special_char($row['cod_fonte']);
				}
			}else{
				$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Parametro ID non valido</strong></font></div><br>";
				echo $errore;			
			}
		}elseif($act=="add"){
			$edit = false;
			$button_value = "Aggiungi";
		}
		
		if(isset($_POST['Aggiungi'])){
					$nome = fix_special_char($_POST['nome']);
					$proteine = str_replace(",",".",fix_special_char($_POST['proteine']));
					$carboidrati = str_replace(",",".",fix_special_char($_POST['carboidrati']));
					$grassi = str_replace(",",".",fix_special_char($_POST['grassi']));
					$tipo = fix_special_char($_POST['tipo']);
					$fonte = fix_special_char($_POST['fonte']);
			if(strlen($nome)==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Inserire la descrizione del prodotto</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}
			if(strlen($nome)!=0 && $error == false){
				if ($edit == true) $nome_sql = " AND codice_alimento <>".$userid;
				$sql = "SELECT nome FROM ".$DBPrefix."alimenti WHERE nome='".$nome."'".$nome_sql;
				if (@mysql_num_rows(@mysql_query($sql,CONN)) != 0){
					print('<div align="center"><img src="img/alert.gif" /><font color="#ff9900"> <strong>Descrizione gi&agrave; esistente nel database</strong></font></div><br>');
					$error = true;
				}			
			}
			if(strlen($proteine)==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Inserire il valore delle proteine</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}
			if(strlen($grassi)==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Inserire il valore dei grassi</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}
			if(strlen($carboidrati)==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Inserire il valore dei carboidrati</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}						
			if (!$error){
				if($edit==false){
				$query = "INSERT INTO ".$DBPrefix."alimenti(nome, proteine, grassi, carboidrati, cod_tipo, cod_fonte) VALUES ('".$nome."','".$proteine."','".$grassi."','".$carboidrati."','".$tipo."' , '".$fonte."')";
				$result = mysql_query($query,CONN);
				
				}else{
	
					$query = "UPDATE ".$DBPrefix."alimenti SET nome='".fix_special_char_sql($nome)."',proteine='".fix_special_char_sql($proteine)."',grassi='".fix_special_char_sql($grassi)."',carboidrati='".fix_special_char_sql($carboidrati)."',cod_tipo='".fix_special_char_sql($tipo)."',cod_fonte='".fix_special_char_sql($fonte)."' WHERE codice_alimento='".$userid."'";
				//echo $query;
				//exit;
				$result = mysql_query($query,CONN);
				}
				
				print $message_successful;
				header("Refresh: 1; URL=".$_SERVER['PHP_SELF'].'?pg='.$pg."");
				$redirect=true;
			}
		}
		if(isset($_POST['Cancella'])){
			$query = "DELETE FROM ".$DBPrefix."alimenti WHERE codice_alimento=".$userid."";
			$result = mysql_query($query,CONN);

			print $message_successful;
			header("Refresh: 1; URL=".$_SERVER['PHP_SELF'].'?pg='.$pg."");
			$redirect = true;
		}
		
		if ($redirect==false){
	?>
</form>
	
	<form id="form1" name="form1" method="post" action="<?=$_SERVER['PHP_SELF'].'?'.fix_special_char($_SERVER['QUERY_STRING'],1)?>">
	  <!--tabella edit/add-->
	<table width="408"align="center">
	  <!--DWLayoutTable--> 
  <tr>
    <td width="199" height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Descrizione</tag>: *</td>
    <td width="206" bgcolor="#26689D">
      <input name="nome" type="text" class="input" id="nome" value="<?=$nome?>" size="30" />    </td>
  </tr>
  <tr>
    <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Proteine gr.</tag>: *</td>
    <td bgcolor="#26689D"><input name="proteine" type="text" class="input" id="proteine" value="<?=str_replace(".",",",$proteine)?>" size="30" /></td>
  </tr>
  <tr>
    <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Carboidrati gr.</tag>: *</td>
    <td bgcolor="#26689D"><input name="carboidrati" type="text" class="input" id="carboidrati" value="<?=str_replace(".",",",$carboidrati)?>" size="30" /></td>
  </tr>
  <tr>
    <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Grassi gr.</tag>:</td>
    <td bgcolor="#26689D"><input name="grassi" type="text" class="input" id="grassi" value="<?=str_replace(".",",",$grassi)?>" size="30" /></td>
  </tr>
   <tr>
    <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Tipo</tag>: *</td>
    <td bgcolor="#26689D"><select name="tipo" id="tipo" class="input" style="width:100%" onchange="showCat(this.value)">
    	<option value='0'>---Selezionare Tipo---</option>
	  <?
	  $sql_tipo = "SELECT * FROM ".$DBPrefix."tipo ORDER BY codice_tipo ASC";
		//echo $sql_azienda;
		$result_tipo = mysql_query($sql_tipo,CONN);
		$rows_tipo = mysql_num_rows($result_tipo);
		if($rows_tipo!=0){
			while ($row_tipo=mysql_fetch_array($result_tipo,MYSQL_ASSOC)){
		?>
      <option value="<?=$row_tipo['codice_tipo']?>" <? if($row_tipo['codice_tipo']==fix_special_char($_GET['tipo'])) echo "SELECTED" ?>><?=$row_tipo['descrizione']?></option>
	  <?
	  }
	  }
	  ?>
    </select>    </td>
  </tr>

    <tr>
    <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Fonte</tag>: *</td>
    <td bgcolor="#26689D">
    	<select name="fonte" id="fonte" class="input" style="width:100%" onchange="showCat(this.value)">
    	<option value='0'>---Selezionare Fonte---</option>
	  <?
	  $sql_fonte = "SELECT * FROM ".$DBPrefix."fonte ORDER BY codice_fonte ASC";
		//echo $sql_azienda;
		$result_fonte = mysql_query($sql_fonte,CONN);
		$rows_fonte = mysql_num_rows($result_fonte);
		if($rows_fonte!=0){
			while ($row_fonte=mysql_fetch_array($result_fonte,MYSQL_ASSOC)){
		?>
      <option value="<?=$row_fonte['codice_fonte']?>" <? if($row_fonte['codice_fonte']==fix_special_char($_GET['fonte'])) echo "SELECTED" ?>><?=$row_fonte['descrizione']?></option>
	  <?
	  }
	  }
	  ?>
    </select>    </td>
  </tr>
  
  <tr align="center">
    <td height="35" colspan="2" bgcolor="#1B486D">
          <button name="Aggiungi" type="submit" class="button" id="Aggiungi"><?=$button_value?></button>
          <button type="reset" class="button">Ripristina</button>
		  <? if($edit==true){ ?>
		  <button name="Cancella" type="submit" class="button" id="Canella" onClick="return elimina_prodotto('<?=$nome?>');">Cancella</button>
		  <? } ?>
          </div>
    </div></td>
    </tr>
</table>
    <div align="center"><br />
      <tag>* Campi obbligatori</tag>
    </div>
	</form>
	<?
		
	}

	}
	
	}

	?>
