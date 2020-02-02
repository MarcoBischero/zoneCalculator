<?
require_once('date.inc.php');
require_once('class.phpmailer.php');
require_once('filters.php');
if (file_exists( 'config.php' )) require_once('config.php');
//convert MYSQL datetime to italian time

function file_name($string){
	$pos= strpos($string,'_');
	$string = substr($string,$pos+1,strlen($string));
	return $string;
}
function fix_windows_filename($string){
	$char = array('\\','/',':','*','?','"','<','>','|');
	$string = str_replace($char,'',$string);
	return $string;
}
function fix_special_char($post,$type=0){
	//type 0 = all post and get
	//type 1 = query sting
	$post = trim($post);
	if (!function_exists('html_entity_decode')) {
		$trans_tbl = get_html_translation_table(HTML_ENTITIES);
		$trans_tbl = array_flip($trans_tbl);
		$post = strtr($post, $trans_tbl);
	}else{
		$post = html_entity_decode($post);
	}
	$post = stripslashes($post);
	$post = htmlentities($post);
	if($type=1) $post=str_replace("&amp;","&",$post);
	return $post;
}
function fix_special_char_sql($post){
	$post = trim($post);
	if (!function_exists('html_entity_decode')) {
		$trans_tbl = get_html_translation_table(HTML_ENTITIES);
		$trans_tbl = array_flip($trans_tbl);
		$post = strtr($post, $trans_tbl);
	}else{
		$post = html_entity_decode($post);
	}
	$post = stripslashes($post);
	$post = htmlentities($post);
	$post = addslashes($post);
	return $post;
}

function checkemail($email) {
	$email = str_replace("..",".",$email);
   if (preg_match("/^[A-Z0-9._%-]+@[A-Z0-9._%-]+\.[A-Z]{2,6}$/i", $email)) {
			return true;
        }else{  
			return false;
        }
}

function addget($string,$value="",$action="add"){
		/*
		ADD value to a get.
		Ex. if we have "page.php?page=2" and with a link we will add value 3, 4
		1) click <a href=addget('page',2)>page 2</a>
		2) click <a href=addget('page',3)>page 3</a>
		3) result: page.php?page=2,3
		
		features:
		-remove duplicate from all query
		-add value with "," separator
		*/
		$string_value = trim($_GET[$string]);
		$st=fix_special_char($_SERVER['QUERY_STRING'],1); //query string
		$word = $string."=".$string_value;
		if($action=="add"){
		$edit=false;
		$word2add = ",".$value;		
		if(strlen($string_value)>0){
			if(stristr($string_value, ",") == TRUE){ //check duplicate value for this $value
				$string_value_arr = explode(",",$string_value);
				if(in_array($value,$string_value_arr)){
					$word2add = "";
				}			
				//del duplicate value in all string
				sort($string_value_arr);
				/*
				foreach($string_value_arr as $key_copy=>$value_copy){
				  if (array_key_exists($key_copy+1, $string_value_arr)){
					if($value_copy!=$string_value_arr[$key_copy+1]){
						$string_value_final[]=$value_copy;
					}
				  }else{
					$string_value_final[]=$value_copy;
				  }
				}
				*/
				$string_value_final = array_unique($string_value_arr);
				//print_r($string_value_final);
				$string_value_fixed = implode(",",$string_value_final);	
				$word_fixed = $string."=".$string_value_fixed.$word2add;
			}elseif($string_value==$value){ //if the unique value is equal with the new value
				$word2add = "";
				$word_fixed = $word;
			}else{  //if the unique value is NOT equal with the new value
				$word_fixed = $word.$word2add;
			}
				$queryfilter = str_replace($word, $word_fixed, $st); //delete words
				$new_get = $queryfilter;
		}else{
			if(stristr($st, $string) == TRUE){
				$queryfilter = str_replace($word, "", $st);
				$new_get = $queryfilter."&".$string."=".$value;
			}else $new_get = $st."&".$string."=".$value;
		}
	}elseif($action="rem"){ //remove a value
		$string_value_arr = explode(",",$string_value);
		sort($string_value_arr);
		foreach($string_value_arr as $key_arr=>$value_arr){
			if($value_arr==$value) unset($string_value_arr[$key_arr]);
		}
		$string_value_fixed = implode(",",$string_value_arr);
		$word_fixed = $string."=".$string_value_fixed;
		$queryfilter = str_replace($word, $word_fixed, $st); //delete words
		$new_get = $queryfilter;
	}
	$rem_descr="&descr=".$_GET['descr']; //get descr
	$new_get = str_replace($rem_descr, "", $new_get); //descr remove
	
	$new_get = str_replace("&&", "&", $new_get);
	return $_SERVER['PHP_SELF'].'?'.$new_get;
}
//echo addget('features',1,"add");

function link_filter_2($string,$value="",$del=''){
		if($del!='')
			$st=str_replace("?","",fix_special_char(get_delete($del),1));
		else	
			$st=fix_special_char($_SERVER['QUERY_STRING'],1); //query string
		$string_value = $_GET[$string]; //language value
		$word = $string."=".$string_value; //word to delete

		if(stristr($st, $word) == TRUE) {
		  	//have found!
			$queryfilter = str_replace($word, "", $st); //delete words
			$queryfilter = str_replace("&&", "&", $queryfilter);
		}else{
			$queryfilter = $st;
		}
		
		if (substr($queryfilter, -1, 1)=="&") $z='';
		else $z='&';
			
		return $_SERVER['PHP_SELF'].'?'.$queryfilter.$z.$string."=".$value;
		
	
	//return $_SERVER['PHP_SELF'].'?'.$queryfilter.$z;
}


function menu_filter($nome){
	$bad_char = array("&agrave;","&egrave;","&igrave;","&ograve;","&ugrave;","&lt;","&gt","&amp;"," ", "%20", "'", '"', "`", "*", "!", "?", "&","<", ">",".",";","^","/","\\","�","%","|",":","#","�","=","(",")","�");
	$nome_id = str_replace($bad_char, "_", $nome);
	return $nome_id;
}

function mysql_table_exist($conn,  $db, $tbl){
	//check if exists a table
	$tables = array();
	#$link = @mysql_connect($host, $user, $pass);
	@mysql_select_db($db);
	$q = @mysql_query("SHOW TABLES");
	while ($r = @mysql_fetch_array($q)) { $tables[] = $r[0]; }
	@mysql_free_result($q);
	@mysql_close($link);
	if (in_array($tbl, $tables)) { return TRUE; }
	else { return FALSE; }
}

function mysql_field_exist($conn,$db,$tbl,$field){
	//check if exists a field on a table
	$fields = mysql_list_fields($db, $tbl, $conn);
	$column = mysql_num_fields($fields);
	for ($i = 0; $i < $column; $i++) {
	   $fieldschk[]=mysql_field_name($fields, $i);
	}
	if (in_array($field, $fieldschk)) { return TRUE; }
	else { return FALSE; }
}

function cancella_tmp($dirname){
//del temporary folder's content
//accept array of directory ore once
	if(is_array($dirname)){
	  foreach($dirname as $value){
		$dh = opendir($value) or die("Impossibile aprire la directory");
		$maxtime = 86400; // 1day = 60sec * 60min *24h
		while (!(($file = readdir($dh)) === false ) ) {
			 if (is_file("$value/$file")) {
				   if (filectime("$value/$file")+$maxtime <= time()){
						@unlink("$value/$file");
					}
			 }
		}
		closedir($dh);
	  }
	}else{
		$dh = opendir($dirname) or die("Impossibile aprire la directory");
		$maxtime = 86400; // 1day = 60sec * 60min *24h
		while (!(($file = readdir($dh)) === false ) ) {
			 if (is_file("$dirname/$file")) {
				   if (filectime("$dirname/$file")+$maxtime <= time()){
						@unlink("$dirname/$file");
					}
			 }
		}
		closedir($dh);
	}
}


class Pager { 
	function getPagerData($numHits, $limit, $page) { 
		$numHits = (int) $numHits; 
		$limit = max((int) $limit, 1); 
		$page = (int) $page; 
		$numPages = ceil($numHits / $limit); 
	
		$page = max($page, 1); 
		$page = min($page, $numPages); 
	
		if($page!=0)
			$offset = ($page - 1) * $limit;
		else
			$offset = 0;
			
		$ret = new stdClass; 
	
		$ret->offset = $offset; 
		$ret->limit = $limit; 
		$ret->numPages = $numPages; 
		$ret->page = $page; 
	
		return $ret; 
	} 
} 


function offset($count,$limit,$anchor=""){
 				// get the pager input values 
				$page = $_GET['page']; 
				$limit = $limit; 
				$total = $count;

				// work out the pager values //call class from page pager.inc.php
				$pager = Pager::getPagerData($total, $limit, $page); 
				global $limit;
				global $offset;
				$offset = $pager->offset;
				$limit = $pager->limit; 
				$page = $pager->page;
				
				$st=fix_special_char($_SERVER['QUERY_STRING'],1);
				
				$word="#page=".$_GET['page'];

				if(stristr($st, $word) == TRUE) {
					//have found!
					$queryfilter = str_replace($word, "", $st); //delete words
					$queryfilter = str_replace("&&", "&", $queryfilter);
				}else{
					$queryfilter = $st;
				}
				
				// output paging system (could also do it before we output the page content) 
				global $arrayPaging;
				$arrayPaging = array();
				#$arrayPaging[] =
				if (($page == 1) || ($page==0))// this is the first page - there is no previous page 
				$arrayPaging[] = "&lt <tag>Prec.</tag>"; 
				else // not the first page, link to the previous page 
				$arrayPaging[] = "<a href=\"#page=".($page - 1).$anchor."\"><font color='".$border_color."'><b>&lt <tag>Prec.</tag></b></font></a>";
				
				for ($i = 1; $i <= $pager->numPages; $i++) { 
				$arrayPaging[] = " | "; 
				if ($i == $pager->page) 
				$arrayPaging[] = "$i"; 
				else
				$arrayPaging[] = "<a href=\"#page=".$i.$anchor."\"><b>$i</b></a>"; 
				}
				$arrayPaging[] = " | "; 
				if ($page == $pager->numPages) // this is the last page - there is no next page 
				$arrayPaging[] = "<tag>Succ.</tag> &gt;"; 
				else // not the last page, link to the next page 
				$arrayPaging[] = "<a href=\"#page=".($page + 1).$anchor."\"><font color='".$border_color."'><b><tag>Succ.</tag> &gt;</b></font></a>"; 
}

function random_string(){
	$acceptedChars = 'AZERTYUIOPQSDFGHJKLMWXCVBN789123456abcdefghilmnopqrstuvzwxyj';
	$max = strlen($acceptedChars)-1;
	$rdmstring = null;
	for($i=0; $i < 32; $i++) {
		$rdmstring .= $acceptedChars{mt_rand(0, $max)};
	}
	return $rdmstring;
}
function random_string2(){
	$acceptedChars = 'ABCDEF789123456';
	$max = strlen($acceptedChars)-1;
	$rdmstring = null;
	for($i=0; $i < 6; $i++) {
		$rdmstring .= $acceptedChars{mt_rand(0, $max)};
	}
	return $rdmstring;
}

function get_delete($getname){
	$newget = array();
	$url = '';
	$allget = $_GET;
	if(strlen(fix_special_char($_SERVER['QUERY_STRING'],1))>0){
		foreach($allget as $key=>$value){	
			if (!is_array($getname)){		
				if($key==$getname)
					unset($allget[$key]);
			}else{
				if(in_array($key,$getname)){
					unset($allget[$key]);
					}
			 }
		}
		foreach($allget as $key=>$value){	
			$newget[]= $key."=".$value;
		}	
		$url=fix_special_char('?'.implode('&',$newget));
	}
	return $url;
}
/*
function get_deletev2($getname,$filtro){
	$qs=$_SERVER['QUERY_STRING'];
	$qs2=strstr($qs,'?');
	$qs2=explode('&',$qs);
	$newget = array();
	
	if(strlen(strstr($qs,$filtro))>0){
		$url='?'.$qs2[0].implode('&',$newget);
		return $url;
	}else{
	
		foreach($_GET as $key=>$value){	
			if (!is_array($getname)){		
				if($key==$getname)
					unset($key);
			}else{		
				if(array_key_exists($key,$getname))
					unset($getname[$key]);
			 }
		}
		$newget[]= $key."=".$value;
		$url='?'.implode('&',$newget);
		return $url;
	 }
	 	//foreach($_GET as $key=>$value){
}
*/
//update last access row user/admin
function lastaccess($session,$ip,$DBPrefix){
		//EDIT USER
		$query = 'UPDATE '.$DBPrefix.'risorse SET lastaccess = lastaccessupdate,lastaccessupdate='.time().', ip=ipupdate,ipupdate="'.$ip.'" WHERE  id='.$session.'';
		$result = mysql_query($query, CONN);
		
}
function lastaccesshtml($rowaccess,$ip){
		if (strlen($rowaccess==0)){
			$message = 'Primo accesso al programma';
		}else{
			$message = "From IP: <strong>".$ip."</strong><br>Date: <strong>".italiandatetime(timestamp($rowaccess))."</strong><br>";
		}
		$rowaccess = "<br>
		<table align=\"center\" bgcolor=\"#002743\" height=\"100\" width=\"300\" style=\"border: 1px solid #ffffff;\">
			<tr>
			<td>
			<div align=center>Last access: <br><br>".$message."<br>
			</td>
			</tr>
		</table>";
		return $rowaccess;
}

function cancella_random_key($DBPrefix){
	$query = "DELETE FROM ".$DBPrefix."random_key WHERE (DATE_ADD(data, INTERVAL '1' DAY) <= NOW()) OR (data='0000-00-00 00:00:00')";
	$result = mysql_query($query,CONN);
}

function download_file($id_file,$form,$path="attach/"){
	if(is_numeric($id_file)){
		$query_file = "SELECT id,file FROM ".$form."_files WHERE id_file=".$id_file;
		$result_file = mysql_query($query_file,CONN);
		$rows_file = mysql_num_rows($result_file);
		if($rows_file!=0){
			$row_file = mysql_fetch_array($result_file,MYSQL_ASSOC);
			$file = $row_file['file'];

			//fix filename input
			if (!function_exists('html_entity_decode')) {
				$trans_tbl = get_html_translation_table(HTML_ENTITIES);
				$trans_tbl = array_flip($trans_tbl);
				$file = strtr($file,$trans_tbl);
			}else{
				$file = html_entity_decode($file);
			}
			$data = implode('', file($path.$file));
			
			//fix filename output
			if (!function_exists('html_entity_decode')) {
				$trans_tbl = get_html_translation_table(HTML_ENTITIES);
				$trans_tbl = array_flip($trans_tbl);
				$name = strtr(file_name($file),$trans_tbl);
			}else{
				$name = html_entity_decode(file_name($file));
			}

		function force_download ($data, $name, $mimetype='', $filesize=false) {
			// File size not set?
			if ($filesize == false OR !is_numeric($filesize)) {
				$filesize = strlen($data);
			}
		
			// Mimetype not set?
			if (empty($mimetype)) {
				$mimetype = 'application/octet-stream';
			}
		
			// Make sure there's not anything else left
			ob_clean_all();
		
			// Start sending headers
			header("Pragma: public"); // required
			header("Expires: 0");
			header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
			header("Cache-Control: private",false); // required for certain browsers
			header("Content-Transfer-Encoding: binary");
			header("Content-Type: " . $mimetype);
			header("Content-Length: " . $filesize);
			header("Content-Disposition: attachment; filename=\"" . $name . "\";" );
			// Send data
			echo $data;
			die();
		}
	
		function ob_clean_all () {
			$ob_active = ob_get_length () !== false;
			while($ob_active) {
				ob_end_clean();
				$ob_active = ob_get_length () !== false;
			}
			return true;
		}
		force_download ($data, $name, $mimetype);
		die();
		}
	}
}

function word_promo ($aziendap,$clientep,$dalp,$alp,$DBPrefix){
	
	?>
			  <script type="text/javascript">
		 <!--
		 function PopupCentrata(pagina) {
		   var w = 900;
		   var h = 260;
		   open("piano_promo/"+pagina+"","", "width="+w+",height="+h+", left="+((screen.width-w)/2)+",top="+((screen.height-h)/2)+",scrollbars=yes,status=no");
		 }
		 //-->
		</script>
		<?
        $azienda=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."anagrafica_azienda WHERE codice_azienda=".fix_special_char($aziendap)));
		$cliente=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."anagrafica WHERE codice_cliente=".fix_special_char($clientep)));
		//	echo "../piano_promo/".$azienda['ragione_sociale']."-".$cliente['ragione_sociale']."-dal ".$dalp."-al-".$alp.".doc";
			//exit;
			 $fp = fopen("piano_promo/".$azienda['ragione_sociale']."-".$cliente['ragione_sociale']."-dal-".$dalp."-al-".$alp.".doc", 'w+');
			
			$str = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
		<html xmlns='http://www.w3.org/1999/xhtml'>
		<head>
		<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
		<title>Print Order</title>
		<style type='text/css'>
		.primo_td{
			border:thin; 
			border-bottom-style:solid;
			border-right-style:solid;
			
		}
		.td_interni{
			border:thin; 
			border-bottom-style:solid; 
			border-right-style:solid;
		}
		.ultimo_td{
			border:thin; 
			border-bottom-style:solid;
		}
		.bordo{
			border:thin;
			border-bottom-style:dotted;
			border-right-style:dotted;
		}
		.bordo_ultimo{
			border:thin;
			border-right-style:dotted;
		}
		.bordo_lastcol{
			border:thin;
			border-bottom-style:dotted;
		}
		</style>
		
		</head><body>
		<div align='center'><h1>CALENDARIO PROMOZIONALE DAL: ".fix_special_char($dalp)." AL: ".fix_special_char($alp)."</h1></div>
		<table width='406' align='center'>
		  <tr>
			<td align='left'>Azienda: <strong><span style='font-size:18px'>".$azienda['ragione_sociale']."</span></strong>
			</td>
			<td align='right'>Cliente: <strong><span style='font-size:18px'>".$cliente['ragione_sociale']."</span></strong>
			</td>
		  </tr>
		</table><br /><br />";
		
		$sql="SELECT * FROM ".$DBPrefix."piano_promozionale WHERE cod_azienda=".$azienda['codice_azienda']." AND cod_cliente=".$cliente['codice_cliente']." AND sellinda>='".americandate(fix_special_char($dalp))."' AND sellouta<='".americandate(fix_special_char($alp))."'";
		//echo $sql;
		$result=mysql_query($sql);
		$str.="<table style='border:thin; border-style:solid' border='1' align='center' cellpadding='0' cellspacing='1' >
			  <tr>
				<td width='201' height='20' class='primo_td'> <div align='center'><strong>SELL-IN	</strong></div></td>
				<td width='207' class='td_interni'><div align='center'><strong>  SELL-OUT	</strong></div></td>
				<td width='99' class='td_interni'><div align='center'><strong>  COD. PRODOTTO	</strong></div></td>
				<td width='206' class='td_interni'><div align='center'><strong>  DESCRIZIONE PRODOTTO</strong></div></td>
				<td width='80' class='td_interni'><div align='center'><strong>  PREZZO</strong></div></td>
				<td width='93' class='td_interni'><div align='center'><strong>  SCONTI</strong></div></td>
				<td width='102' class='ultimo_td'><div align='center'><strong>TIPO</strong></div></td>
			</tr>";
		
		$conta = 0;
		$color = '#FFFFFF';
		$rows=mysql_num_rows($result);
		while ($row_piano=mysql_fetch_array($result)) {
			$sql_prod="SELECT * FROM ".$DBPrefix."prodotto WHERE codice='".$row_piano['cod_prodotto']."'";
			$result_prod=mysql_query($sql_prod);
			$row_prod=mysql_fetch_array($result_prod);
			$c++;
			if ($conta == 1){
				$color = '#26689D';
				$conta = 0;
			}else{
				$conta = 1;
				$color = '#2B72AC';
			}	
				$bordo='bordo_ultimo';//classi da richiamare
			  if($c!=$rows) $bordo='bordo';
		
			$str.="
			 <tr align='center' >
			 <td height='20' class='".$bordo."'>Dal: ".italiandate($row_piano['sellinda']).' Al: '.italiandate($row_piano['sellina'])."</td>
			<td class='".$bordo."'>Dal: ".italiandate($row_piano['selloutda']).' Al: '.italiandate($row_piano['sellouta'])."</td>
			<td class='".$bordo."'>".$row_prod['codice_prodotto']."</td>
			 <td class='".$bordo."'>".$row_prod['descrizione_prodotto']."</td>
			<td class='".$bordo."'> ".str_replace('.',',',$row_prod['euro_pz'])."</td>
			<td class='".$bordo."'>".$row_piano['sconto']."</td>
			<td class='".$bordo."' style='border-right:none'>".$row_piano['tipo']."</td>		
		  </tr>";
		}
		$str.="</table>
		</body>
		</html>
		"; 	
		
		
		 fwrite($fp, $str);	
		  fclose($fp);
		  //print $message_successful_popup;
		$file= '
		<script>
		PopupCentrata("'.$azienda['ragione_sociale'].'-'.$cliente['ragione_sociale'].'-dal-'.fix_special_char($dalp).'-al-'.fix_special_char($alp).'.doc");
		</script>';
		print $file;
	}
	
function word_order ($aziendap,$clientep,$id_ordinep,$DBPrefix) {
	  ?><script type="text/javascript">
 <!--
 function PopupCentrata(pagina) {
   var w = 900;
   var h = 260;
   open("ordini/"+pagina+"","", "width="+w+",height="+h+", left="+((screen.width-w)/2)+",top="+((screen.height-h)/2)+",scrollbars=yes,status=no,resizable=yes");
 }
 //-->
</script>
<?
	$azienda=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."anagrafica_azienda WHERE codice_azienda=".fix_special_char($aziendap)));
	$azienda_agente=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."agente_azienda WHERE cod_azienda=".fix_special_char($aziendap)));
	$agente=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."risorse WHERE id=".fix_special_char($azienda_agente['cod_agente'])));
	$cliente=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."anagrafica WHERE codice_cliente=".fix_special_char($clientep)));
	
 	
	 $fp = fopen("ordini/".$agente['nome']." ".$agente['cognome']."-".$azienda['ragione_sociale']."-".$cliente['ragione_sociale']."-Ordine n ".fix_special_char($id_ordinep).".doc", 'w+');
	$idordine=array();
	$idordine = explode(",",fix_special_char($id_ordinep));
	
    $str = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html xmlns='http://www.w3.org/1999/xhtml'>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
<title>Print Order</title>
<style type='text/css'>
.primo_td{
	border:thin; 
	border-bottom-style:solid;
	border-right-style:solid;
	
}
.td_interni{
	border:thin; 
	border-bottom-style:solid; 
	border-right-style:solid;
}
.ultimo_td{
	border:thin; 
	border-bottom-style:solid;
}
.bordo{
	border:thin;
	border-bottom-style:dotted;
	border-right-style:dotted;
}
.bordo_ultimo{
	border:thin;
	border-right-style:dotted;
}
.bordo_lastcol{
	border:thin;
	border-bottom-style:dotted;
}
</style>

</head><body>";
fwrite($fp, $str);

		$idordine=array();
		$idordine = explode(",",fix_special_char($id_ordinep));
		$ordine=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."ordine WHERE codice_ordine=".$idordine[0]));

    $str2 = " <table align='center'>
        <tr>
        	<td width='526'>
<div style='font-size:16px; border: thin; border-color:#000000; border-style:solid; width:450px;' align='center'>";
                $sql = "SELECT valore FROM ".$DBPrefix."opzioni WHERE opzione='intestazione_ordine'";
						$result = mysql_query($sql,CONN);
						$rows = mysql_num_rows($result);
						if($rows!=0)
							$row = mysql_fetch_array($result,MYSQL_ASSOC);   
    $str2 .= $row['valore']." </div>
          </td>
            <td width='319' align='right'>
				<div align='center' style=' font-size:16px'>
                    <strong>".$azienda['ragione_sociale']."</strong><br />
                    ".$azienda['via']."<br />
                    ".$azienda['cap'].' - '.$azienda['localita']."<br />
                    <br />
                    Agente: ".$agente['id'].' '.$agente['cognome'].' '.$agente['nome']."<br />
                    <strong>Ordine n&deg; ".fix_special_char($id_ordinep)." del ".italiandate($ordine['data_ordine'])."</strong>
                </div>
          </td>
      </tr>  
        <tr>
       	  <td colspan='2'>
              <div style=' font-size:18px;border: thin; border-color:#000000; border-style:solid; width:600px;'>
                  <table style='font-size:18px' align='center'><tr><td style='font-size:18px' width='26' align='left'><strong>".strtoupper($cliente['codice_cliente'])."</strong></td>
                  <td style='font-size:18px' width='506' align='center'> DESTINATARIO</td>
                  <td style='font-size:18px' width='52' align='right'> (4141)</td>
                  </tr></table> <strong> 
                  ".strtoupper($cliente['ragione_sociale'])."
                  </strong><br />
                  ".strtoupper($cliente['via'])."
                  <br />
                  ".strtoupper($cliente['cap']).' - '.strtoupper($cliente['localita'])."
                  <br />
                  P.IVA: 
                  ".strtoupper($cliente['p_iva'])."
                  <br />
                  TEL. &nbsp;:
                  ".strtoupper($cliente['telefono'])."
                  <br />
                  FAX &nbsp;:
                  ".strtoupper($cliente['fax'])."
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CELL.:
                  ".strtoupper($cliente['cellulare'])."
                  <br />
                  CAT. : 
                  ".strtoupper($cliente['tipo_vendita'])."
                  <br />
            </div>
          </td>
        </tr>  
    </table><br /><br />";
	fwrite($fp, $str2);
foreach($idordine as $key=>$value){
	$ordine=mysql_fetch_array(mysql_query("SELECT * FROM ".$DBPrefix."ordine WHERE codice_ordine=".$value));
	

    $str2="<div><strong>ORDINE N&deg; ".$value."</strong></div><br />
<br /><table>
    	<tr >
        	<td>
   				Pagamento	
    		</td>
            <td>:
            </td>
            <td style='font-size:16px'><strong>".strtoupper($ordine['pagamento'])."</strong>
            </td>
        </tr>
    	<tr>
        	<td>
   				Tipo Consegna	
    		</td>
            <td>:
            </td>
            <td style='font-size:16px'><strong>".strtoupper($ordine['tipo_consegna'])."</strong>
            </td>
        </tr>
		<tr>
        	<td>
   				in data	
    		</td>
            <td>:
            </td>
            <td style='font-size:16px'><strong>".strtoupper(italiandate($ordine['data_consegna']))."</strong>
            </td>
        </tr>

     </table><br /><br />
     *** SALVO APPROVAZIONE DELLA CASA ***<br /><br /><br /> ";
 $query="SELECT * FROM ".$DBPrefix."prodotto, ".$DBPrefix."prodotto_ordine, ".$DBPrefix."ordine WHERE codice=".$DBPrefix."prodotto_ordine.cod_prodotto AND cod_ordine=codice_ordine AND codice_ordine='".fix_special_char($value)."'";
	$result=mysql_query($query) or die ("dderrore query");
	$query_col="SELECT * FROM ".$DBPrefix."prodotto, ".$DBPrefix."prodotto_ordine, ".$DBPrefix."ordine WHERE codice=".$DBPrefix."prodotto_ordine.cod_prodotto AND cod_ordine=codice_ordine AND codice_ordine='".fix_special_char($value)."'";
	$result_col=mysql_query($query_col) or die ("dderrore query");
	$valore=0;
	$canale=0;
	$percentuale=0;
	$merce=0;
	$cartoni=0;
	$pedane=0;
	while ($datax=mysql_fetch_object($result_col)) {
		$valore.=$valore+$datax->sconto_valore;//controlla se � presente almeno un el. con questa colonna 
		$canale.=$canale+$datax->sconto_canale1+$datax->sconto_canale2+$datax->sconto_canale3;
		$percentuale.=$percentuale+$datax->sconto_per+$datax->sconto_per2+$datax->sconto_per3;
		$merce.=$merce+$datax->sconto_merce;
		$cartoni.=$cartoni+$datax->cartoni;
		$pedane.=$pedane+$datax->pedane;
	}
		$str2.="<table style='border:thin; border-style:solid' border='1' align='center' cellpadding='0' cellspacing='1' >
	  <tr>
		<td height='20' class='primo_td'> <div align='center'><strong>CODICE PRODOTTO	</strong></div></td>
		<td class='td_interni'><div align='center'><strong>  DESCRIZIONE	</strong></div></td>
		<td class='td_interni'><div align='center'><strong>  PZ X CT	</strong></div></td>
		<td class='td_interni'><div align='center'><strong>  CT PER PALLET</strong></div></td>
		<td class='td_interni'><div align='center'><strong>  PREZZO</strong></div></td>";
		 if ($canale!=0)
		 $str2.="<td class='td_interni'><div align='center'><strong>  SC. CANALE (%)</strong></div></td>";
		 if ($percentuale!=0)
		   $str2.="<td class='td_interni'><div align='center'><strong>  SC. CANVAS (%)</strong></div></td>";
		 if ($valore!=0)
		 	 $str2.="<td class='td_interni'><div align='center'><strong>  SC. VALORE</strong></div></td>";
		 if ($merce!=0)
		  $str2.="<td class='td_interni'><div align='center'><strong> SC. IN MERCE</strong></div></td>";
		 if ($cartoni!=0)
		  $str2.="<td class='td_interni'><div align='center'><strong>Q.TA' ORDINATA (CT)	</strong></div></td>";
		 if ($pedane!=0)
		  $str2.="<td class='td_interni'><div align='center'><strong>Q.TA' ORDINATA (PALLET)	</strong></div></td>";
		   $str2.="<td class='td_interni'><div align='center'><strong>PREZZO FINALE	</strong></div></td>
        <td class='ultimo_td'><div align='center'><strong>IVA</strong></div></td>
	</tr>";
	 
	fwrite($fp, $str2);
	
$conta = 0;
$color = "#FFFFFF";
$rows=mysql_num_rows($result);

while ($data=mysql_fetch_object($result)) {
	$c++;
	if ($conta == 1){
		$color = "#26689D";
		$conta = 0;
	}else{
		$conta = 1;
		$color = "#2B72AC";
	}	
		$bordo='bordo_ultimo';//classi da richiamare
	  if($c!=$rows) $bordo='bordo';
	  $srt="<tr align='center'>
	 <td height='20' class='".$bordo."'>".$data->codice_prodotto."</td>
	<td class='".$bordo."'> ".$data->descrizione_prodotto."</td>
    <td class='".$bordo."'>".$data->pz_ct."</td>
    <td class='".$bordo."'>".$data->ct_pd." </td>
    <td class='".$bordo."'>".'&euro;'.' '.str_replace('.',',',$data->euro_pz)."</td> ";
if($canale!=0){
	if(($data->sconto_canale1!="")&&($data->sconto_canale2!="")&&($data->sconto_canale3!=""))
	   $srt.="<td class=".$bordo.">".$data->sconto_canale1."+".$data->sconto_canale2."+".$data->sconto_canale3."</td>";
	 elseif(($data->sconto_canale1!="")&&($data->sconto_canale2!=""))
	 $srt.="<td class=".$bordo.">".$data->sconto_canale1."+".$data->sconto_canale2."</td>";
	  else
    $srt.='<td class='.$bordo.'>'.$data->sconto_canale1."</td>";
}			
	if($percentuale!=0){
	if(($data->sconto_per!="")&&($data->sconto_per2!="")&&($data->sconto_per3!=""))
	 $srt.="<td class='".$bordo."'>".$data->sconto_per."+".$data->sconto_per2."+".$data->sconto_per3."</td>";
	 elseif(($data->sconto_per!="")&&($data->sconto_per2!=""))
	  $srt.="<td class='".$bordo."'>".$data->sconto_per."+".$data->sconto_per2."</td>";
	  else
		$srt.="<td class='".$bordo."'>".$data->sconto_per."</td>";
}


	
if($valore!=0){
	   $srt.="<td class='".$bordo."'>";
	   if ($data->sconto_valore!='') $srt.=  "&euro; ".str_replace(".",",",$data->sconto_valore)."</td>";
}
if($merce!=0){  
	  $srt.="<td class='".$bordo."'>".$data->sconto_merce."</td>";
}  
if($cartoni!=0){ 
   $srt.="<td class='".$bordo."'>".$data->cartoni."</td>";
   }  
   if($pedane!=0){ 
 $srt.="<td class=".$bordo.">".$data->pedane."</td>";
 }  
  $srt.="<td class='".$bordo."'>"."&euro; ".str_replace(".",",",$data->prezzo_finaleo)."</td>";
   $srt.= "<td class='".$bordo."' style='border-right:none'>".$data->iva.'</td></tr>';
 fwrite($fp, $srt);
 

 
   }
   
   $srt2="</table><br />";
  $query_totale="SELECT totale_euro FROM ".$DBPrefix."ordine WHERE codice_ordine='".$value."';";
$result_totale=mysql_query($query_totale) or die ("errore query");
$data_totaleeuro=mysql_fetch_array($result_totale);

 $srt2.="<div align='right'>"."Totale ordine: "."&euro; ".str_replace(".",",",$data_totaleeuro[0])."</div><br />
<br />
";
 fwrite($fp, $srt2);	
 }
 echo "</body></html>";
 
  fclose($fp);
  print $message_successful_popup;
  $idordine=implode(",",$idordine);
$file= '
<script>
PopupCentrata("'.$agente['nome'].' '.$agente['cognome'].'-'.$azienda['ragione_sociale'].'-'.$cliente['ragione_sociale'].'-Ordine n '.$idordine.'.doc");
</script>';
print $file;

	
	}
function querycount($query){
		$result = mysql_query($query,CONN);
		$count = mysql_num_rows($result);
		return $count;
}	


function jsspecialchars( $array = '') {

foreach ($array as $chiave=>$string) {
	 $array[$chiave] = preg_replace("/\r*\n/","\\n",$array[$chiave]);
	 $array[$chiave] = preg_replace("/\//","\\\/",$array[$chiave]);
	 $array[$chiave] = preg_replace("/\"/","\\\"",$array[$chiave]);
	 $array[$chiave] = preg_replace("/'/"," ",$array[$chiave]);
	 }
    return $array;
}
?>