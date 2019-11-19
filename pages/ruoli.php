<title>Ruoli</title>
<link href="jquery-ui/css/ui-lightness/jquery-ui-1.7.2.custom.css" rel="stylesheet" type="text/css">
<?
$act = trim($_GET['act']);
if($auth_user==true){
function querycount_ruoli(){
		$querycount = 'SELECT count(*) FROM '.$DBPrefix.'ruoli';
		$result = mysql_query($querycount,CONN);
		global $count;
		@list($count) = mysql_fetch_row($result);
		return $count;
}
offset(querycount_ruoli(),20,"");
?>
<div align="center"><strong><a href="<?=$_SERVER['PHP_SELF'].'?pg='.$pg?>">Visualizza ruoli</a> </strong>| <strong><a href="<?=link_filter_2('act','add')?>">Aggiungi ruolo</a></strong></div><br>
<?
	//start dispaly
	if(strlen($act)==0){
	?>
	<?
		$query = 'SELECT id,descrizione FROM '.$DBPrefix.'ruoli LIMIT '.$offset.','.$limit.'';
		$result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
		$rows = mysql_num_rows($result);
		if($rows>0){
	?>
        <table width="246" border="0" align="center" cellpadding="0" cellspacing="1" bgcolor="#1B486D">
          <tr align="center">
            <td width="150" height="35" bgcolor="#1B486D"><strong>Descrizione</strong></td>
          </tr>
          <?
			$conta = 0;
			$color = "#FFFFFF";
			while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			   $get_features = "";
			   $features_assoc = "";
				if ($conta == 1){
					$color = "#26689D";
					$conta = 0;
				}else{
					$conta = 1;
					$color = "#2B72AC";
				}
			$query_assoc = 'SELECT id_feature FROM '.$DBPrefix.'ruoli_features WHERE id_ruolo='.$row['id'].'';
			$result_assoc = mysql_query($query_assoc,CONN);
			$rows_assoc = mysql_num_rows($result_assoc);
			if ($rows_assoc != 0){
			  while ($row_assoc = mysql_fetch_array($result_assoc, MYSQL_ASSOC)) {
				$features_assoc[] = $row_assoc['id_feature'];
			  }
			  //print_r($features_assc);
			  $get_features = implode(",",$features_assoc);
			}

		?>
          <tr bgcolor="<?=$color?>" onmouseover="this.bgColor=mouseover;" onmouseout="this.bgColor='<?=$color?>'" style="cursor:pointer" onclick="window.location.href='<?=$_SERVER['PHP_SELF'].'?'.fix_special_char($_SERVER['QUERY_STRING'],1)?>&act=edit&id=<?=$row['id']?>&features=<?=$get_features?>'">
            <td height="20"><?=$row['descrizione']?></td>
          </tr>
          <?
			}		
		?>
</table>
        <br />
              <div align="center"><?

foreach ($arrayPaging as $page){
	echo $page;
}
?></div><div align="center"><br />
        <tag>Totale record</tag>:
        <?=$rows?>
      </div>
      <?
	}else{
	?>
        <div align="center"><br />
            <br />
          <br />
          <tag>Nessun record da visualizzare</tag></div>
      <?
	}
	}
	//end display
	elseif($act=="add" || $act=="edit"){//----------------------------------------------------------------------------------------------------------- START ADD
		$features = trim($_GET['features']);
		if(strlen($features)>0){
			$features = explode(",",$features);
			sort($features);
			$features = array_unique($features);
		}
		$descrizione = fix_special_char(trim($_GET['descr']));
		if($act=="edit"){
			$edit = true;
			$button_value = "Modifica";
			$ruoloid=trim($_GET['id']);
			if(is_numeric($ruoloid)){
				$query = 'SELECT id,descrizione FROM '.$DBPrefix.'ruoli WHERE id='.$ruoloid.'';
				$result = mysql_query($query,CONN);
				$rows = mysql_num_rows($result);
				if ($rows != 0){
					$row = mysql_fetch_array($result, MYSQL_ASSOC);
					$descrizione = fix_special_char($row['descrizione']);
				}
			}else{
				$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><b>Parametro ID non valido</b></font></div><br>";
				echo $errore;			
			}
		}elseif($act=="add"){
			$edit = false;
			$button_value = "Aggiungi";
		}
		
		if(isset($_POST['Aggiungi'])){
			$descrizione = trim(fix_special_char($_POST['descrizione']));
			if(strlen($descrizione)==0){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><b>Inserire una descrizione</b></font></div><br>";
					echo $errore;
					$error = true;						
			}

			if (!$error){
				if($edit==false){
				  $query = "INSERT INTO ".$DBPrefix."ruoli (descrizione) VALUES ('".fix_special_char_sql($descrizione)."')";
				  $result = mysql_query($query,CONN);
				  $ruoloid = mysql_insert_id();
				}else{
				  $query = "UPDATE ".$DBPrefix."ruoli SET descrizione='".fix_special_char_sql($descrizione)."' WHERE id=".$ruoloid."";
				  $result = mysql_query($query,CONN);
				
				  $query = "DELETE FROM ".$DBPrefix."ruoli_features WHERE id_ruolo=".$ruoloid."";
				  $result = mysql_query($query,CONN);
				}

				foreach($features as $feature){
					$feature=trim($feature);
					if(is_numeric($feature)){
						$query = "INSERT INTO ".$DBPrefix."ruoli_features (id_ruolo,id_feature) VALUES (".$ruoloid.",".fix_special_char_sql($feature).")";
						$result = mysql_query($query,CONN);
					}
				}
				
				print $message_successful;
				#header("Refresh: 1; URL=".$_SERVER['PHP_SELF']."");
				header("Refresh: 1; URL=".$_SERVER['PHP_SELF'].'?pg='.$pg."");
				$redirect=true;
			}
		}
		if(isset($_POST['Cancella'])){
			$query = "DELETE FROM ".$DBPrefix."ruoli WHERE id=".$ruoloid."";
			$result = mysql_query($query,CONN);
		    $query = "DELETE FROM ".$DBPrefix."ruoli_features WHERE id_ruolo=".$ruoloid."";
		    $result = mysql_query($query,CONN);

			print $message_successful;
			#header("Refresh: 1; URL=".$_SERVER['PHP_SELF']."");
			header("Refresh: 1; URL=".$_SERVER['PHP_SELF'].'?pg='.$pg."");
			$redirect = true;
		}
		
		if ($redirect==false){
	?>
	<script type="text/JavaScript">
	<!--
	function PageChanger(page,descr) {
		 document.location= page+"&descr="+descr;
	}
	//-->
	</script>
        <title>Aggiungi ruolo</title>
        <form id="form1" name="form1" method="post" action="<?=$_SERVER['PHP_SELF'].'?'.fix_special_char($_SERVER['QUERY_STRING'],1)?>">
          <table width="330" align="center">
            <!--DWLayoutTable-->
            <tr>
              <td bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> <tag>Descrizione</tag>: *</td>
              <td colspan="2" bgcolor="#26689D"><input style="width:97%" name="descrizione" class="input" id="descrizione" value="<?=$descrizione?>"/></td>
            </tr>

            <tr>
              <td height="20" bgcolor="#1B486D">&nbsp;<img src="img/menu_ico.gif" width="8" height="8" /> Features :</td>
              <td  bgcolor="#26689D">
			  <select name="features" id="features" class="input" style="width:97%">
			  <?
			  $query = 'SELECT id,descrizione FROM '.$DBPrefix.'features';
			  $result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
			  $rows = mysql_num_rows($result);
			  if($rows>0){
			  	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				  if(!in_array($row['id'],$features)){
			  ?>
                  <option value="<?=addget('features',$row['id'])?>"><?=$row['descrizione']?></option>
			  <?
			      }
			  	}
			  }
			  ?>
                </select></td>
              <td width="18" bgcolor="#26689D"><div align="center"><a href="javascript:;" onclick="PageChanger(document.forms[0].features.options[document.forms[0].features.selectedIndex].value,document.forms[0].descrizione.value);return false;">
					<span class="ui-icon2 ui-icon-plusthick2 ui-state-default2 ui-corner-all2"/>
			
				</a></div></td>
            </tr>
			<?
			if(is_array($features)){
				foreach($features as $feature){
				 if(is_numeric($feature)){
				   $query = 'SELECT id,descrizione FROM '.$DBPrefix.'features WHERE id='.trim($feature).'';
				   $result = mysql_query($query,CONN) or die('Query fallita: ' . mysql_error());
				   $rows = mysql_num_rows($result);
				   if($rows>0){
				     $row = mysql_fetch_array($result, MYSQL_ASSOC);
			?>
            <tr>
              <td height="20" bgcolor="#1B486D" align="right">ID:<?=$row['id']?>&nbsp;</td>
              <td bgcolor="#26689D"><?=$row['descrizione']?></td>
              <td bgcolor="#26689D" align="center"><a href="#" onclick="PageChanger('<?=addget('features',$row['id'],"rem")?>',document.forms[0].descrizione.value);return false;"> 
            
					<span class="ui-icon2 ui-icon-minusthick2 ui-state-default2 ui-corner-all2"/>
			</a></td>
            </tr>
			<?
			        }
				  }
				}
			}
			?>
            <tr>
              <td height="35" colspan="3" bgcolor="#1B486D"><div align="center">
              
                  <div align="center">
                    <button name="Aggiungi" type="submit" class="button" id="Aggiungi"><?=$button_value?></button>
                    <button name="reset" type="reset" class="button" >Ripristina</button>
                    <? if($edit==true){ ?>
                    <button name="Cancella" type="submit" class="button" id="Canella" onclick="return elimina_ruolo();">Cancella</button>
                    <? } ?>
                  </div>
              </div></td>
            </tr>
          </table>
          <div align="center"><br />
            <tag>* Campi obbligatori</tag> </div>
        </form>
      <?
		}
	}//-------------------------------------------------------------------------------------------------------------------------------------END ADD
}else echo '<br><br><br><br><div align="center"><img src="img/alert.gif"><tag>Accesso non autorizzato</tag></div>'
	?>
	