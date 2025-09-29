<?php
require_once("../include/connection.php");
require_once("../include/functions.php");
header('Content-Type: application/json; charset=utf-8');

if(fix_special_char_sql($_GET['alimID'])!='' && fix_special_char_sql($_GET['pgc'])!='' && isset($_GET['grams'])){
	$alimID=fix_special_char_sql($_GET['alimID']);
	$query="SELECT proteine,grassi,carboidrati,img,perc_prot FROM ".$DBPrefix."alimenti,".$DBPrefix."tipo,".$DBPrefix."fonte Where codice_tipo=cod_tipo AND codice_fonte=cod_fonte AND codice_alimento=".$alimID." ORDER BY nome ASC";
	$result=mysql_query($query, $conn);
	if($result){
		$data = array();
		while($row=mysql_fetch_array($result,MYSQL_ASSOC)){        
			if($_GET['pgc']==100){
				$data['proteine']=$row['proteine']; 
				$data['grassi']=$row['grassi'];
				$data['carboidrati']=$row['carboidrati'];
				$data['imgFonte']=$row['img'];
			}else if($_GET['pgc']==0){
				$data['proteine']=$row['proteine']/100*$row['perc_prot']/100*$_GET['grams'];
				$data['grassi']=$row['grassi']/100*$_GET['grams'];
				$data['carboidrati']=$row['carboidrati']/100*$_GET['grams'];
				if($_GET['loadMeal']==1){
					$data['proteine100']=$row['proteine']; 
					$data['grassi100']=$row['grassi'];
					$data['carboidrati100']=$row['carboidrati'];
					$data['imgFonte']=$row['img'];
				}
			}
		}
		$data['queryStatus'] = 'Success';	
	}else{
		 $data['queryStatus'] = 'Error:'.mysql_error(CONN);  
	}
 
	echo json_encode($data, JSON_NUMERIC_CHECK);
}
if (!empty($_GET['cookies']) && $_GET['opt'] == 'saveCalendar') {
	function get_db_connection() {
    global $host, $user, $pwd, $db_name;
    $conni = new mysqli($host, $user, $pwd, $db_name);
    if ($conni->connect_error) {
        die("Connection failed: " . $conni->connect_error);
    }
    return $conni;
	}
	
    $connection = get_db_connection();
    $error = false;
    $cod_user = fix_special_char($_COOKIE['id']);
    $cookies = $_GET['cookies'];

    $data = ['debug' => [], 'queryStatus' => ''];

    $data['debug'][] = 'Received cookies: ' . json_encode($cookies);
    $data['debug'][] = 'User ID: ' . $cod_user;

    $queryDelCal = "DELETE FROM calendar_items WHERE id_user=?";
    $stmt = $connection->prepare($queryDelCal);
    $stmt->bind_param("i", $cod_user);

    if (!$stmt->execute()) {
        $error = true;
        $data['queryStatus'] = 'Error: ' . $stmt->error;
    }
    $stmt->close();

    if (!$error) {
        $query = "INSERT INTO {$DBPrefix}calendar_items (`column`, `order`, `id_user`, `cod_pasto`) VALUES (?, ?, ?, ?)";
        $stmt = $connection->prepare($query);

        for ($col = 0; $col < 6; $col++) {
            for ($row = 0; $row < 6; $row++) {
                $intersection = (string)$col . (string)$row;
                $pastoID = $cookies[$intersection];

                $data['debug'][] = "Intersection: $intersection, PastoID: $pastoID";

                if ($pastoID !== null) {
                	$pasto = explode(";", $pastoID);
					$pastoID = $pasto[0];
                    $stmt->bind_param("iiis", $col, $row, $cod_user, $pastoID);
                    if (!$stmt->execute()) {
                        $error = true;
                       $data['query' . $col . $row] = $pastoID;
                        $data['queryStatus'] = 'Error: ' . $stmt->error;
                        break 2;
                    } else {
                        $data['query' . $col . $row] = 'QuerySuccess';
                    }
                }
            }
        }
        $stmt->close();
    }

    if (!$error) {
        $data['queryStatus'] = 'Calendario Salvato';
    }
    $connection->close();
    echo json_encode($data);
}

if($_GET['opt']=="chart"){
	$data_points = array();
	$query="SELECT lastCheck, peso, percentualeMG, percentualeMM, vita, anche, addome FROM ".$DBPrefix."prot_need WHERE (cod_user=".$_COOKIE['id'].") ORDER BY lastCheck ASC";
	$result=mysql_query($query, $conn);
 	$i=0;
	while($row=mysql_fetch_array($result,MYSQL_ASSOC)){        
		$point = array("label" => $row['lastCheck'] , "y" => $row['peso']);
		$point2 = array("label" => $row['lastCheck'] , "y" => $row['percentualeMG']);
		$point3 = array("label" => $row['lastCheck'] , "y" => $row['percentualeMM']);
		$point4 = array("label" => $row['lastCheck'] , "y" => $row['vita']);
		$point5 = array("label" => $row['lastCheck'] , "y" => $row['anche']);
		$point6 = array("label" => $row['lastCheck'] , "y" => $row['addome']);
		$data_points['peso'][$i]=$point; 
		$data_points['MG'][$i]=$point2;
		$data_points['MM'][$i]=$point3;
		$data_points['vita'][$i]=$point4;
		$data_points['anche'][$i]=$point5;
		$data_points['addome'][$i]=$point6;
		$i++;
	}
	echo json_encode($data_points, JSON_NUMERIC_CHECK);
}
if(!empty($_GET['pesokg']) && !empty($_GET['altezzacm']) && !empty($_GET['collocm']) && !empty($_GET['moltiplicatore']) && $_GET['opt']=='addProteinNeed'){

	$cod_user = fix_special_char($_COOKIE['id']);
	$pesokg=fix_special_char($_GET['pesokg']);
	$altezzacm=fix_special_char($_GET['altezzacm']);
	$collocm=fix_special_char($_GET['collocm']);
	$moltiplicatore=fix_special_char($_GET['moltiplicatore']);
	$blocchimin = 0;
    
    if(!empty($_GET['addomecm'])){ //uomo
    
    	$addomecm=fix_special_char($_GET['addomecm']);
	   //calcolo 
    	$percentuale1 = (76.5 * log10($addomecm - $collocm)) - (68.7 * log10($altezzacm)) + 46.9; //alert(percentuale1);
		$percentuale2 = (86.01 * log10(($addomecm/2.54 - $collocm/2.54))) - (70.041 * log10($altezzacm/2.54)) + 36.76; //alert(percentuale2);
		
		$queryField=",addome";
		$queryValue=",".$addomecm;

    }
    
    if(!empty($_GET['vitacm']) && !empty($_GET['anchecm']) && !empty($_GET['polsocm']) && !empty($_GET['avambracciocm'])){ //donna
    

    	$vitacm=fix_special_char($_GET['vitacm']);
    	$anchecm=fix_special_char($_GET['anchecm']);
    	$polsocm=fix_special_char($_GET['polsocm']);
    	$avambracciocm=fix_special_char($_GET['avambracciocm']);
    	//calcolo 
    	$percentuale1 = (105.3 * log10($pesokg)) - (0.2 * $polsocm) - (0.533 * $collocm) - (1.574 * $avambracciocm) + (0.173 * $anchecm) - (0.515 * $altezzacm) - 35.6; 
    	//alert(percentuale1);
		$percentuale2 = (163.205 * log10((($vitacm/2.54 + $anchecm/2.54) - $collocm/2.54))) - (97.684 * log10($altezzacm/2.54)) - 78.387; //alert(percentuale2);
		
		$queryField=",vita,anche,polso,avambraccio";
		$queryValue=",".$vitacm.",".$anchecm.",".$polsocm.",".$avambracciocm;

	}
		$percmedia = round((($percentuale1 + $percentuale2*2) / 3),1);
		$data["percentualeMG"]= "".$percmedia."";
		$massamagra = round(($pesokg - $pesokg/100*$percmedia),1);
		$data["percentualeMM"]= "".$massamagra."";
		$proteine = $moltiplicatore * $massamagra;
		$data["proteineDay"]= "".round($proteine,1)."";
		$blocchi = round(($proteine / 7),1);
		
		if($blocchi<11){
			$blocchi=11;
			$blocchimin=1;			
		}
				$data["blocchiZona"] = "".$blocchi."";
				$data["blocchiMin"] = "".$blocchimin."";
				
				
		$resultAddProtNeed = mysql_query("INSERT INTO ".$DBPrefix."prot_need(percentualeMM,percentualeMG,proteineDay,lastCheck,peso, altezza, collo, moltiplicatore, cod_user, blocchi".$queryField.") VALUES ('".$massamagra."','".$percmedia."','".round($proteine,1)."','".date('Y-m-d')."','".$pesokg."','".$altezzacm."' , '".$collocm."' , '".$moltiplicatore."' , '".$cod_user."' , '".$blocchi."'".$queryValue.")",$conn);
					//echo $queryAddProtNeed;
					
		if($resultAddProtNeed){
		    $data['queryStatus'] = 'Success';  
			
		}else{
		    $data['queryStatus'] = 'Error:'.mysql_error(CONN);  
		}
              echo json_encode($data);
}

if(!empty($_GET['idData']) &&!empty($_GET['tipoData']) && !empty($_GET['fonteData']) && !empty($_GET['desc_alimentoData']))
{
    $tipo = fix_special_char($_GET['tipoData']);
     $fonte = fix_special_char($_GET['fonteData']);
      $desc_alimento = fix_special_char($_GET['desc_alimentoData']);
       $p100 = str_replace(",",".",fix_special_char($_GET['p100Data']));
        $g100 = str_replace(",",".",fix_special_char($_GET['g100Data']));
         $c100 = str_replace(",",".",fix_special_char($_GET['c100Data']));
          $idAlimento = fix_special_char($_GET['idData']);

    $resultUpdate = mysql_query("UPDATE ".$DBPrefix."alimenti SET nome='".fix_special_char_sql($desc_alimento)."', cod_tipo=".$tipo.", cod_fonte=".$fonte.", proteine=".$p100.", carboidrati=".$c100.", grassi=".$g100." WHERE codice_alimento=".$idAlimento, $conn);
	if(!$resultUpdate){
		 $data['queryStatus'] = 'Error:'.mysql_error(CONN); 
		// die('Could not update data: ' . mysql_error());
		 }else{
			 $data['queryStatus'] = 'Success';  
		 }
              echo json_encode($data);
 }

if(!empty($_GET['idAlimento']) && $_GET['opt']=='DEL')
{
    $idAlimento = fix_special_char($_GET['idAlimento']);
     
    $resultDel = mysql_query("DELETE FROM ".$DBPrefix."alimenti WHERE codice_alimento=".$idAlimento, $conn);
	if(!$resultDel){
		 $data['queryStatus'] = 'Error:'.mysql_error(CONN); 
		// die('Could not update data: ' . mysql_error());
		 }else{
			 $data['queryStatus'] = 'Alimento cancellato con successo';  
		 }
              echo json_encode($data);
 }
 
 if(!empty($_GET['idPasto']) && $_GET['opt']=='DEL'){
	$idPasto = fix_special_char($_GET['idPasto']);
  $resultDel = mysql_query("DELETE FROM ".$DBPrefix."pasti WHERE codice_pasto=".$idPasto, $conn);
	if(!$resultDel){
		 $data['queryStatus'] = 'Error:'.mysql_error(CONN); 
		//die('Could not update data: ' . mysql_error());
		}else{
			$data['queryStatus'] = 'Pasto cancellato con successo';  
		}
  echo json_encode($data);
 }

 if(!empty($_GET['idProtNeed']) && $_GET['opt']=='DEL'){
	$idProtNeed = fix_special_char($_GET['idProtNeed']);
  $resultDel = mysql_query("DELETE FROM ".$DBPrefix."prot_need WHERE codice_protneed=".$idProtNeed, $conn);
	if(!$resultDel){
		 $data['queryStatus'] = 'Error:'.mysql_error(CONN); 
		//die('Could not update data: ' . mysql_error());
		}else{
			$data['queryStatus'] = 'Misurazione cancellata con successo';  
		}
  echo json_encode($data);
 }
 
if(!empty($_GET['pastoID']) && $_GET['operation']!='editMeal')
{
  $pastoID = fix_special_char($_GET['pastoID']);
  $result = mysql_query("SELECT proteine,carboidrati,grassi, cod_alimento, gr_alimento, alimenti.nome, pasti.note,pasti.nome AS pastoNome,pasti.mealType FROM ".$DBPrefix."pasti,".$DBPrefix."pasti_alimenti,".$DBPrefix."alimenti WHERE (codice_pasto=".$pastoID." AND codice_pasto=cod_pasto AND cod_alimento=codice_alimento)", $conn);
	$rows = mysql_num_rows($result);
	$i=0;
	while($row=mysql_fetch_array($result,MYSQL_ASSOC)){
		$data[$i]['proteine']=fix_special_char($row['proteine']); 
		$data[$i]['grassi']=fix_special_char($row['grassi']);
		$data[$i]['carboidrati']=fix_special_char($row['carboidrati']);
		$data[$i]['cod_alimento']=fix_special_char($row['cod_alimento']);
		$data[$i]['gr_alimento']=fix_special_char($row['gr_alimento']);
		$data[$i]['nome']=fix_special_char($row['nome']);
		$data[$i]['note']=fix_special_char($row['note']);
		$data[$i]['pastoNome']=fix_special_char($row['pastoNome']);
		$data[$i]['mealType']=fix_special_char($row['mealType']);
		$i++;
	}
    if ($result){
	    echo json_encode($data);
    }           
}

if(!empty($_GET['pastoID']) && $_GET['operation']=='editMeal'){
  $descMeal = fix_special_char_sql($_GET['descMeal']);
	$mealType = fix_special_char_sql($_GET['mealType']);
	$note = fix_special_char_sql($_GET['note']);
	$pastoID=fix_special_char_sql($_GET['pastoID']);
	$blocks=fix_special_char_sql($_GET['blocks']);
	
	$query = "UPDATE ".$DBPrefix."pasti SET `blocks` = '".$blocks."', `nome` = '".$descMeal."', `mealType` = '".$mealType."', `note` = '".$note."' WHERE `codice_pasto` = '".$pastoID."'";
	$data['query']=$query;
	$resultPasto = mysql_query($query,CONN);
	$query = "DELETE FROM  ".$DBPrefix."pasti_alimenti WHERE `cod_pasto` = '".$pastoID."'";
	$resultDelPasto = mysql_query($query,CONN);
					$c=0;
					while ($c<=7) {
						$a = fix_special_char_sql($_GET['a'.$c]);
						$g = fix_special_char_sql($_GET['g'.$c]);
						
						if ($a !='' && $g !=''){	
							$query = "INSERT INTO ".$DBPrefix."pasti_alimenti(cod_pasto, cod_alimento, gr_alimento) VALUES ($pastoID,'".$a."' , '".$g."')";
							$resultalimenti = mysql_query($query,CONN);
							}
						$c++;
					}
				if($resultPasto){
					if($resultDelPasto){
						if($resultalimenti){
							$data['queryStatus']="Success";
						}else{
							$data['queryStatus'] = 'Error:'.mysql_error(CONN);  
						}
					}else{
						$data['queryStatus'] = 'Error:'.mysql_error(CONN);  
					}
				}else{
					$data['queryStatus'] = 'Error:'.mysql_error(CONN);  
				}		
		echo json_encode($data);	   
}

if(fix_special_char_sql($_GET['operation'])=='saveMeal'){
	$nome = fix_special_char_sql($_GET['descr']);
	$tipo = fix_special_char_sql($_GET['tipo']);
	$note = fix_special_char_sql($_GET['note']);
	$blocks = fix_special_char_sql(round($_GET['blocks'],0));
	$cod_user = fix_special_char_sql($_COOKIE['id']);

	
			if(strlen($nome)!='' && $error == false){
				$sql = "SELECT * FROM ".$DBPrefix."pasti WHERE nome='".$nome."'";
				//echo $sql;
				if (@mysql_num_rows(@mysql_query($sql,CONN)) != 0){
					print('<div align="center"><img src="img/alert.gif" /><font color="#ff9900"> <strong>Descrizione gi&agrave; esistente nel database</strong></font></div><br>');
					$error = true;
				}			
			}	
			if (!$error){
					$query = "INSERT INTO ".$DBPrefix."pasti(nome, mealType, note,blocks,cod_user) VALUES ('".fix_special_char_sql($nome)."','".$tipo."' ,  '".fix_special_char_sql($note)."' , '".$blocks."' , '".$cod_user."')";
					$resultPasto = mysql_query($query,CONN);
					$cod_pasto=mysql_insert_id();
					
					$c=0;
					while ($c<=7) {
						$a = fix_special_char_sql($_GET['a'.$c]);
						$g = fix_special_char_sql($_GET['g'.$c]);
						
						if ($a !='' && $g !=''){
							$query = "INSERT INTO ".$DBPrefix."pasti_alimenti(cod_pasto, cod_alimento, gr_alimento) VALUES ($cod_pasto,'".$a."' , '".$g."')";
							$result = mysql_query($query,CONN);
							}
						$c++;
					}
				if($result){
					if($resultPasto){
						$data['queryStatus']="Success";
					}else{
					$data['queryStatus'] = 'Error:'.mysql_error(CONN);  
					}
				}else{
					$data['queryStatus'] = 'Error:'.mysql_error(CONN);  
				}
					
			}
		echo json_encode($data);
	}
if($_GET['operation']=='addAlim'){
	$nome = fix_special_char_sql($_GET['descr']);
	$proteine = str_replace(",",".",fix_special_char_sql($_GET['p']));
	$carboidrati = str_replace(",",".",fix_special_char_sql($_GET['c']));
	$grassi = str_replace(",",".",fix_special_char_sql($_GET['g']));
	$tipo = fix_special_char_sql($_GET['tipo']);
	$fonte = fix_special_char_sql($_GET['fonte']);
	if(strlen($nome)==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Inserire la descrizione del prodotto</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}
			if(strlen($nome)!='' && $error == false){
				$sql = "SELECT * FROM ".$DBPrefix."alimenti WHERE nome='".$nome."'";
				//echo $sql;
				if (@mysql_num_rows(@mysql_query($sql,CONN)) != 0){
					print('<div align="center"><img src="img/alert.gif" /><font color="#ff9900"> <strong>Descrizione gi&agrave; esistente nel database</strong></font></div><br>');
					$error = true;
				}			
			}
			if($tipo==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Selezionare il tipo di alimento</strong></font></div><br>";
					echo $errore;
					$error = true;						
			}
			if($fonte==0 && $error == false){
					$errore = "<div align=center><img src=\"img/alert.gif\" /> <font color=\"#ff9900\"><strong>Selezionare la fonte</strong></font></div><br>";
					echo $errore;
					$error = true;						
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
					$query = "INSERT INTO ".$DBPrefix."alimenti(nome, proteine, grassi, carboidrati, cod_tipo, cod_fonte) VALUES ('".$nome."','".round($proteine,1)."','".round($grassi,1)."','".round($carboidrati,1)."','".$tipo."' , '".$fonte."')";
					$result = mysql_query($query,CONN);
				$data = array();
				
					if(!$result){
					 $data['queryStatus'] = 'Error:'.mysql_error(CONN); 
					//die('Could not update data: ' . mysql_error());
					}else{
						$data['id'] = mysql_insert_id();
						$data['queryStatus'] = 'Alimento inserito con successo';  
					}
				echo json_encode($data);
			}
	}
		
	if($_GET['operation']=='pgcTotal'){
		$data = array();
	//	$data['$pArray']=$_GET['p'][0];
		for($i=0;$i<10;$i++){
			$ptot=$ptot+$_GET['p'][$i];
			$gtot=$gtot+$_GET['g'][$i];
			$ctot=$ctot+$_GET['c'][$i];
		}
		$calorieTot=$ptot*4+$gtot*9+$ctot*4;
		if($ctot!=0)
			$rapportoPC = $ptot/$ctot; 
		$pblock = $ptot/7;
		$gblock =$gtot/3.04;
		$cblock = $ctot/9.33;
		
		$data['calorieTot'] = round($calorieTot);
		$data['grassiTot']=round($gtot,1);
		$data['carboidratiTot']=round($ctot,1);
		$data['proteineTot']=round($ptot,1);
		$data['proteineBloc']=round($pblock,1);
		$data['grassiBloc']=round($gblock,1);
		$data['carboidratiBloc']=round($cblock,1);
		$data['rapportoPC']=round($rapportoPC,2);
		echo json_encode($data);
}
