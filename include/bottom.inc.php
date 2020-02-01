<?
$sql_lang="SELECT valore FROM ".$DBPrefix."opzioni WHERE opzione='language'";
$result_lang=mysqli_query($sql_lang,CONN);
$row_lang=mysqli_fetch_array($result_lang,MYSQL_ASSOC);
if($row_lang['valore']=='en')
	echo '<script>__dlg_translate(I18N);</script>';
ob_end_flush();
@mysqli_close(CONN);	
?>