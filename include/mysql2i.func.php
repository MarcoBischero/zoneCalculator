<?php
/*
mysql2i.func.php rev 3
member of mysql2i.class.php ver 1.5
*/

//predifined fetch constants
define('MYSQL_BOTH',MYSQLI_BOTH);
define('MYSQL_NUM',MYSQLI_NUM);
define('MYSQL_ASSOC',MYSQLI_ASSOC);

function mysqli_affected_rows($link=null){
    
    return mysql2i::mysqli_affected_rows($link);
    
}

function mysqli_client_encoding($link=null){
    
    return mysql2i::mysqli_client_encoding($link);
    
}

function mysqli_close($link=null){
    
    return mysql2i::mysqli_close($link);
    
}

function mysqli_connect($host = '',$username = '',$passwd = '',$new_link = false,$client_flags = 0){
    
    return mysql2i::mysqli_connect($host,$username,$passwd);
    
}

function mysqli_create_db($database_name,$link=null){
    
    return mysql2i::mysqli_create_db($database_name,$link);
    
}

function mysqli_data_seek($result,$offset){
    
    return mysql2i::mysqli_data_seek($result,$offset);
    
}

function mysqli_db_name($result,$row,$field=null){
    
    return mysql2i::mysqli_db_name($result,$row,$field);
    
}

function mysqli_db_query($database,$query,$link=null){
    
    return mysql2i::mysqli_db_query($database,$query,$link);
    
}

function mysqli_drop_db($database,$link=null){
    
    return mysql2i::mysqli_drop_db($database,$link);
    
}

function mysqli_errno($link=null){
    
    return mysql2i::mysqli_errno($link);
    
}

function mysqli_error($link=null){
    
    return mysql2i::mysqli_error($link);
    
}

function mysqli_escape_string($escapestr){
    
    return mysql2i::mysqli_escape_string($escapestr);
    
}

function mysqli_fetch_array($result,$resulttype=MYSQLI_BOTH){
    
    return mysql2i::mysqli_fetch_array($result,$resulttype);
    
}

function mysqli_fetch_assoc($result){
    
    return mysql2i::mysqli_fetch_assoc($result);
    
}

function mysqli_fetch_field($result,$field_offset=null){
    
    return mysql2i::mysqli_fetch_field($result,$field_offset);
    
}

function mysqli_fetch_lengths($result){
    
    return mysql2i::mysqli_fetch_lengths($result);
    
}

function mysqli_fetch_object($result,$class_name=null,$params=null){
    
    return mysql2i::mysqli_fetch_object($result,$class_name,$params);
    
}

function mysqli_fetch_row($result){
    
    return mysql2i::mysqli_fetch_row($result);
    
}

function mysqli_field_flags($result,$field_offset){
    
    return mysql2i::mysqli_field_flags($result,$field_offset);
    
}

function mysqli_field_len($result,$field_offset){
    
    return mysql2i::mysqli_field_len($result,$field_offset);
    
}

function mysqli_field_name($result,$field_offset){
    
    return mysql2i::mysqli_field_name($result,$field_offset);
    
}

function mysqli_field_seek($result,$fieldnr){
    
    return mysql2i::mysqli_field_seek($result,$fieldnr);
    
}

function mysqli_field_table($result,$field_offset){
    
    return mysql2i::mysqli_field_table($result,$field_offset);
    
}

function mysqli_field_type($result,$field_offset){
    
    return mysql2i::mysqli_field_type($result,$field_offset);
    
}

function mysqli_free_result($result){
    
    return mysql2i::mysqli_free_result($result);
    
}

function mysqli_get_client_info(){
    
    return mysql2i::mysqli_get_client_info();
}

function mysqli_get_host_info($link=null){
    
    return mysql2i::mysqli_get_host_info($link);
    
}

function mysqli_get_proto_info($link=null){
    
    return mysql2i::mysqli_get_proto_info($link);
    
}

function mysqli_get_server_info($link=null){
    
    return mysql2i::mysqli_get_server_info($link);
    
}

function mysqli_info($link=null){
    
    return mysql2i::mysqli_info($link);
    
}

function mysqli_insert_id($link=null){
    
    return mysql2i::mysqli_insert_id($link);
    
}

function mysqli_list_dbs($link=null){
    
    return mysql2i::mysqli_list_dbs();
    
}

function mysqli_list_fields($database_name,$table_name,$link=null){
    
    return mysql2i::mysqli_list_fields($database_name,$table_name,$link);
    
}

function mysqli_list_processes($link=null){
    
    return mysql2i::mysqli_list_processes($link);
    
}

function mysqli_list_tables($database,$link){
    
    return mysql2i::mysqli_list_tables($database,$link);
    
}

function mysqli_num_fields($result){
    
    return mysql2i::mysqli_num_fields($result);
    
}

function mysqli_num_rows($result){
    
    return mysql2i::mysqli_num_rows($result);
    
}

function mysqli_pconnect($host = '',$username = '',$passwd = '',$new_link = false,$client_flags = 0){
    
    return mysql2i::mysqli_pconnect($host,$username,$passwd,$new_link,$client_flags);
    
}

function mysqli_ping($link=null){
    
    return mysql2i::mysqli_ping($link);
    
}

function mysqli_query($query,$link=null){
    
    return mysql2i::mysqli_query($query,$link);
    
}

function mysqli_real_escape_string($escapestr,$link=null){
    
    return mysql2i::mysqli_real_escape_string($escapestr,$link);
    
}

function mysqli_result($result,$row,$field=null){
    
    return mysql2i::mysqli_result($result,$row,$field);
    
}

function mysqli_select_db($dbname,$link=null){
    
    return mysql2i::mysqli_select_db($dbname,$link);
    
}

function mysqli_set_charset($charset,$link=null){
    
    return mysql2i::mysqli_set_charset($charset,$link);
    
}

function mysqli_stat($link=null){
    
    return mysql2i::mysqli_stat($link);
    
}

function mysqli_tablename($result,$row,$field=null){
    
    return mysql2i::mysqli_tablename($result,$row,$field);
    
}

function mysqli_thread_id($link=null){
    
    return mysql2i::mysqli_thread_id($link);
    
}

function mysqli_unbuffered_query($query,$link=null){
    
    return mysql2i::mysqli_unbuffered_query($query,$link);
    
}
?>
