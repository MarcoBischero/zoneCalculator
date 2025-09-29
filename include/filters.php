<?
//include 'date.inc.php';
function numeric_field($string){
	if(!is_numeric($string)) return false;
	else return true;
}
function email_field($email) {
	$email = str_replace("..",".",$email);
   if (preg_match("/^[A-Z0-9._%-]+@[A-Z0-9._%-]+\.[A-Z]{2,6}$/i", $email)) {
			return true;
        }else{  
			return false;
        }
}
function datetime_field($date_acquisition){
	if (strstr ($date_acquisition,"/")){
		$date_acquisition = str_replace("/","-",$date_acquisition);
	}
	if (checktime($date_acquisition.' 00:00:01')==true){
		$date_acquisition = $date_acquisition.' 00:00:01';
	}
	//check date fotmat 04-07-2005 11:3:42 with checkdate control
	if (ereg ("([0-3][0-9]{1,2})-([0-1][0-9]{1,2})-([0-9]{4}) ([0-2][0-9]{1,2}):([0-5][0-9]{1,2}):([0-5][0-9]{1,2})", $date_acquisition, $regs)) {
  		//check i date is true mm-dd-yyyy
		if ((checkdate ($regs[2],$regs[1],$regs[3])) && ($regs[4])<=23) {
   			$checktime = true;
			return $checktime;
   		}else{
			$checktime = false;
			return $checktime;
   		}
	} else {
		$checktime = false;
		return $checktime;
	}
}
//check if actual date is greater then today date
function date_gt_today($string){
	if (checktime($string.' 00:00:01')==true){
		$string = $string.' 00:00:01';
	}
	if(datetime_field($string)==true){
		$date1 = italiandatetime2timestamp($string);
		$date2 = time();
		if(datetime_field($string)==true && ($date1>=$date2)) return true;
		else return false;
	}else return false;
	//$one_day = 86400; //60 * 60 * 24
}
?>