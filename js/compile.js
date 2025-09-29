i=0;
	while(i<=9){
		
        var pos = i;
        var selectValue=$("#selAlim"+i).val();
            //alert('valore:'+selectValue+' option:'+pos);
             
			getNumberOfgrams(pos,selectValue,'','100');

		//gr_alimento=$("#grammi_"+i).val();
		//alert(selValue+":"+gr_alimento);
		
		//if(selValue!='' && gr_alimento!=''){
		//	getNumberOfgrams(i,selValue,"","100");
		//	getNumberOfgrams(i,selValue,gr_alimento,"0");
		//}
				i++;
	}
		           return;