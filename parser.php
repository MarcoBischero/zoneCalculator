<?
include('prova.php');
$html = file_get_html('http://www.bda-ieo.it/test/ComponentiAlimento.aspx?Lan=Ita&foodid=100205_1');

// Find all images
foreach($html->find('td') as $element)
  if($element->class=='titolo')     
  echo $element->value . '<br>';

// Find all links
foreach($html->find('a') as $element)
       echo $element->href . '<br>'; 
?>