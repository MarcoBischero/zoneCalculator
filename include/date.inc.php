<?
//actual day/time
function timenow(){
		$timenow = time();
		$timenow = date("d-m-y G.i:s", $timenow);
		return $timenow;
}

//actual day (american format)
function timenow_short(){
		$timenow = time();
		$timenow = date("Y-m-d", $timenow);
		return $timenow;
}

//convert unix timestamtp to MYSQL timestamp -> yyyy-m-d h:m:s
function timestamp($unixtimestamp){
		if ($unixtimestamp==NULL){
			$pgtimestamp=NULL;
		}else{
			$pgtimestamp=date("Y-m-d H:i:s",$unixtimestamp);
		}
		return $pgtimestamp;
}
//convert MYSQL datetime to italian time
function italiandatetime($date){
		if ($date==NULL){
			$date=NULL;
		}else{
			$date=strtotime($date);
			$date=date("d-m-Y H:i:s",$date);
		}
		return $date;
}

//convert MYSQL date to italian time
function italiandate($date){
		if ($date==NULL){
			$date=NULL;
		}else{
			$date=strtotime($date);
			$date=date("d-m-Y",$date);
		}
		return $date;
}
//convert italian time to MYSQL datetime
function americandatetime($date){
			$checkchar = (strrpos($date, "/"));
			if ($checkchar==true){
				$date = strtr($date,'/','-');
			}
			if (checktime($date. '00:00:01')==true){
				$subdate = substr($date, 0, 10);
				$subtime = substr($date, 11);
				$expldate = explode('-', $subdate);
				$expltime = explode(':', $subtime);
				$datefix = mktime ($expltime[0],$expltime[1],$expltime[2],$expldate[1],$expldate[0],$expldate[2]);
				$pgtimestamp=date("Y/m/d H:i:s",$datefix);
			}else{
				#header("Location: index.php");
				$pgtimestamp = date("Y/m/d H:i:s");
			}
			return $pgtimestamp;
}

//convert italian time to MYSQL datetime
function americandate($date){
			$checkchar = (strrpos($date, "/"));
			if ($checkchar==true){
				$date = strtr($date,'/','-');
			}
			$subdate = substr($date, 0, 10);
			$expldate = explode('-', $subdate);
			$datefix = mktime (0,0,0,$expldate[1],$expldate[0],$expldate[2]);
			$pgtimestamp=date("Y/m/d",$datefix);
			return $pgtimestamp;
}

//controllo espressione regolare
function checktime($date_acquisition){
	$checkchar = (strrpos($date_acquisition, "/"));
	if ($checkchar==true){
		$date_acquisition = strtr($date_acquisition,'/','-');
	}
	//echo $date_acquisition;
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

function checktime_american($date_acquisition){
	$checkchar = (strrpos($date_acquisition, "/"));
	if ($checkchar==true){
		$date_acquisition = strtr($date_acquisition,'/','-');
	}
	//check date fotmat 2007-12-23 11:3:42 with checkdate control
	if (ereg ("([0-9]{4})-([0-1][0-9]{1,2})-([0-3][0-9]{1,2}) ([0-2][0-9]{1,2}):([0-5][0-9]{1,2}):([0-5][0-9]{1,2})", $date_acquisition, $regs)) {
  		//check i date is true mm-dd-yyyy
		if ((checkdate ($regs[2],$regs[3],$regs[1])) && ($regs[4])<=23) {
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

function italiandatetime2timestamp($date){
	$date = trim($date);
	if(checktime($date)==true){
		$checkchar = (strrpos($date, "/"));
		if ($checkchar==true){
			$date = strtr($date,'/','-');
		}
		$date = explode(' ',$date);
		$subdate = $date[0];
		$subtime = $date[1];
		$expldate = explode('-', $subdate);
		$expltime = explode(':', $subtime);
		$datefix = mktime ($expltime[0],$expltime[1],$expltime[2],$expldate[1],$expldate[0],$expldate[2]);
		return $datefix;
	}return false;
}
?>
