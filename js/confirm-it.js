function elimina_prodotto_ordine(codice_prodotto,descrizione_prodotto,ordine){
	return confirm('Cancellare il prodotto?','Si è scelto di cancellare il prodotto: '+descrizione_prodotto+'. Continuare?','javascript: delProd('+codice_prodotto+',"'+ordine+'")');
}
function elimina_ordine(ordine){
	return window.confirm_old("Si  è scelto di cancellare l'ordine: "+ordine+". Continuare?");
}
function elimina_fattura(ordine){
		return window.confirm_old("Si è scelto di cancellare la fattura dell'ordine: "+ordine+". Continuare?");
}
function elimina_canvas(){
		return window.confirm_old("Si è scelto di cancellare il canvas. Continuare?");
}
function elimina(azienda){
		return window.confirm_old("Si è scelto di cancellare l'azienda: "+azienda+". Continuare?");
		
}
function elimina_cliente(cliente){
		return window.confirm_old("Si è scelto di cancellare: " +cliente+". Continuare?");
}
function elimina_prodotto(prodotto){
		return window.confirm_old("Si è scelto di cancellare il prodotto: "+prodotto+". Continuare?");
}
function elimina_categoria(categoria){
		return window.confirm_old("Si è scelto di cancellare la categoria: "+categoria+". Continuare?");
}
function elimina_promo(){
		return window.confirm_old("Si è scelto di cancellare il piano promo. Continuare?");
}
function elimina_visita(){
		return window.confirm_old("Si è scelto di cancellare la visita. Continuare?");
}
function elimina_utente(){		return window.confirm_old("Si è scelto di cancellare l'utente. Continuare?");}
function elimina_ruolo(){
		return window.confirm_old("Si è scelto di cancellare il ruolo. Continuare?");
}
