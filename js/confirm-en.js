function elimina_prodotto_ordine(codice_prodotto,descrizione_prodotto,ordine){
	return confirm('Delete the product?','You chose to delete the product: '+descrizione_prodotto+'. Go on?','javascript: delProd('+codice_prodotto+',"'+ordine+'")');
}
function elimina_ordine(ordine){
	return window.confirm_old("You chose to delete the order: "+ordine+". Go on?");
}
function elimina_fattura(ordine)
	{
		return window.confirm_old("You chose to delete this invoice related to the order: "+ordine+". Go on?");
	}
function elimina_canvas()
	{
		return window.confirm_old("You chose to delete this canvas. Go on?");
	}
function elimina_azienda(azienda){
		return window.confirm_old("You chose to delete the company: "+azienda+". Go on?");
		
}
function elimina_cliente(cliente){
		return window.confirm_old("You chose to delete the customer: "+cliente+". Go on?");
}
function elimina_prodotto(prodotto){
		return window.confirm_old("You chose to delete the product: "+prodotto+". Go on?");
}
function elimina_categoria(categoria){
		return window.confirm_old("You chose to delete the category: "+categoria+". Go on?");
}
function elimina_promo(){
		return window.confirm_old("You chose to delete this discount plan. Go on?");
}
function elimina_visita(){
		return window.confirm_old("You chose to delete this visit. Go on?");
}
function elimina_utente(){		return window.confirm_old("You chose to delete this user. Go on?");}
function elimina_ruolo(){
		return window.confirm_old("You chose to delete this role. Go on?");
}