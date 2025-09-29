var mealHeight=250,
		alimHeight=340,
		alimWidth=700,
		mealWidth=700;
function DropDown(el) {
    this.dd = el;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            event.stopPropagation();
        }); 
    }
}
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
}

function round(value, precision, mode) {
	//  discuss at: http://phpjs.org/functions/round/
	// original by: Philip Peterson
	//  revised by: Onno Marsman
	//  revised by: T.Wild
	//  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
	//    input by: Greenseed
	//    input by: meo
	//    input by: William
	//    input by: Josep Sanz (http://www.ws3.es/)
	// bugfixed by: Brett Zamir (http://brett-zamir.me)
	//        note: Great work. Ideas for improvement:
	//        note: - code more compliant with developer guidelines
	//        note: - for implementing PHP constant arguments look at
	//        note: the pathinfo() function, it offers the greatest
	//        note: flexibility & compatibility possible
	//   example 1: round(1241757, -3);
	//   returns 1: 1242000
	//   example 2: round(3.6);
	//   returns 2: 4
	//   example 3: round(2.835, 2);
	//   returns 3: 2.84
	//   example 4: round(1.1749999999999, 2);
	//   returns 4: 1.17
	//   example 5: round(58551.799999999996, 2);
	//   returns 5: 58551.8
	var m, f, isHalf, sgn; // helper variables
	precision |= 0; // making sure precision is integer
	m = Math.pow(10, precision);
	value *= m;
	sgn = (value > 0) | -(value < 0); // sign of the number
	isHalf = value % 1 === 0.5 * sgn;
	f = Math.floor(value);
	if (isHalf) {
		switch (mode) {
			case 'PHP_ROUND_HALF_DOWN':
				value = f + (sgn < 0); // rounds .5 toward zero
				break;
			case 'PHP_ROUND_HALF_EVEN':
				value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
				break;
			case 'PHP_ROUND_HALF_ODD':
				value = f + !(f % 2); // rounds .5 towards the next odd integer
				break;
			default:
				value = f + (sgn > 0); // rounds .5 away from zero
		}
	}
	return (isHalf ? value : Math.round(value)) / m;
}

function getNumberOfgramsNew(row, alimID, grams, option, loadMeal) {
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			alimID: alimID,
			grams: grams,
			pgc: option,
			loadMeal: loadMeal
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			if (option == 100 || loadMeal == 1) {
				$("#img" + row).attr("src", "img/" + data['imgFonte']);
				if (loadMeal === 1) {
					$("#proteine100_" + row).val(round(data['proteine100'], 2));
					$("#grassi100_" + row).val(round(data['grassi100'], 2));
					$("#carboidrati100_" + row).val(round(data['carboidrati100'], 2));
				}
			}

			//$("#proteine" + option + "_" + row).attr('value', round(data['proteine'], 2));
			//	$("#grassi" + option + "_" + row).attr('value', round(data['grassi'], 2));
			//$("#carboidrati" + option + "_" + row).attr('value', round(data['carboidrati'], 2));
			$("#proteine" + option + "_" + row).val(round(data['proteine'], 2));
			$("#grassi" + option + "_" + row).val(round(data['grassi'], 2));
			$("#carboidrati" + option + "_" + row).val(round(data['carboidrati'], 2));
			console.table(data);
			console.table('getNumberOfGrams success');
		},
		complete: function() {
			$("#grammi_" + row).attr("disabled", false);

			if (loadMeal !== 1) {
				pgcTotalNew();
			}

			console.table('getNumberOfGrams complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(data);
			console.table(textStatus, errorThrown);
			console.table('Error getNumberOfGrams');
		}
	});
}

function decrement(pos, plus) {
	if ($("#grammi_" + pos).val() >= plus) {
		var gvalore = parseFloat($("#grammi_" + pos).val()) - plus;
		$("#grammi_" + pos).val(gvalore);
	} else {
		$("#grammi_" + pos).val(0);
	}
}

function increment(pos, plus) {
	if ($("#grammi_" + pos).val() === "") {
		$("#grammi_" + pos).val(plus);
	} else if ($("#grammi_" + pos).val() >= 0) {
		var gvalore = parseFloat($("#grammi_" + pos).val()) + plus;
		$("#grammi_" + pos).val(gvalore);
	}
}

function addAlim(descr, tipo, fonte, p, g, c, calculator) {
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			descr: descr,
			tipo: tipo,
			fonte: fonte,
			p: p,
			g: g,
			c: c,
			operation: 'addAlim'
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			myNoty("success", "Alimento aggiunto",10);
			console.table(data);
			console.table('addAlim success');
			if (calculator === true) {
				var optionValue = "<option value=\"" + data.id + "\">" + descr + "</option>",
					optionSel = "<option value=\"" + data.id + "\" selected=\"selected\">" + descr + "</option>",
					selValue = 0,
					update = false;
				i = 0;
				while (i <= 7) {
					selValue = $("#selAlim" + i).val();
					if (selValue == "" && update == false) {
						$("#selAlim" + i).append(optionSel);
						$("#alimentoIN" + i).val(descr);
						selValue = $("#selAlim" + i).val();
						update = true;
						getNumberOfgramsNew(i, selValue, "", "100");
					} else {
						$("#selAlim" + i).append(optionValue);
					}
					i++;
				}
			}
		},
		complete: function() {
			$('#ui-tabs-3').load("pages/alimenti.php");
			console.table('addAlim complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			myNoty("error", "Alimento non aggiunto",10);
			//console.table(data);
			console.table(textStatus, errorThrown);
			console.table('Error addAlim');
		}
	});
}

function aggiungiAlimento(calculator) {
	$(function() {
		if (calculator === true) {
			var dialog = $("#addAlimento"),
				form = $("#addAlimentoForm"),
				desc_alimento = $("#desc_alimento"),
				tipo = $("#tipo"),
				fonte = $("#fonte"),
				p100 = $("#proteine100"),
				g100 = $("#grassi100"),
				c100 = $("#carboidrati100");
		} else if (calculator === false) {
			var dialog = $("#addAlimentoAlimenti"),
				form = $("#addAlimentoFormAlimenti"),
				desc_alimento = $("#desc_alimentoAlimenti"),
				tipo = $("#tipoAlimenti"),
				fonte = $("#fonteAlimenti"),
				p100 = $("#proteine100Alimenti"),
				g100 = $("#grassi100Alimenti"),
				c100 = $("#carboidrati100Alimenti");
		}
		//alert ("alimarray:"+alimArray+"gramsArray:"+gramsArray);	
		dialog.dialog({
			close: function(event, ui) {
				desc_alimento.val("");
				tipo.val("");
				fonte.val("");
				p100.val("");
				g100.val("");
				c100.val("");
				$(this).dialog("close")
			},
			bgiframe: true,
			height: alimHeight,
		width: alimWidth,
			modal: true,
			buttons: {
				"Add": function() {
					var submit = true;
					// evaluate the form using generic validaing
					if (!validator.checkAll(form)) {
						submit = false;
					}
					if (submit) {
						addAlim(desc_alimento.val(), tipo.val(), fonte.val(), p100.val(), g100.val(), c100.val(), calculator);
						$(this).dialog("close");
					}
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		});
	});
}

function pgcTotalNew() {
	var p = new Array(),
		g = new Array(),
		c = new Array();
	for (i = 0; i < 10; i++) {
		p[i] = $('#proteine0_' + i).val();
		g[i] = $('#grassi0_' + i).val();
		c[i] = $('#carboidrati0_' + i).val();
	}
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			p: p,
			g: g,
			c: c,
			operation: 'pgcTotal'
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			if (data['rapportoPC'] < 0.6 || data['rapportoPC'] > 1) {
				$('#rapportoPC').css({
					'color': 'red'
				});
			} else {
				$('#rapportoPC').css({
					'color': 'green'
				});
			}
			$("#calorieTot").val(round(data['calorieTot']));
			$("#grassiTot").val(round(data['grassiTot'], 1));
			$("#carboidratiTot").val(round(data['carboidratiTot'], 1));
			$("#proteineTot").val(round(data['proteineTot'], 1));
			$("#proteineBloc").val(round(data['proteineBloc'], 1));
			$("#grassiBloc").val(round(data['grassiBloc'], 1));
			$("#carboidratiBloc").val(round(data['carboidratiBloc'], 1));
			$("#rapportoPC").val(round(data['rapportoPC'], 2));
			console.table(data);
			console.table('pgcTotalNew success');
		},
		complete: function() {
			console.table('pgcTotalNew complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(data);
			console.table(textStatus, errorThrown);
			console.table('Error pgcTotalNew');
		}
	});
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function azzeraOnChange(c_menu) {
	$('#grammi_' + c_menu).val('');
	$('#proteine0_' + c_menu).val('');
	$('#grassi0_' + c_menu).val('');
	$('#carboidrati0_' + c_menu).val('');
}

function azzera(c_menu) {
	$('#selAlim' + c_menu).val('');
	$("#img" + c_menu).attr("src", "img/fonte.png");
	$('#proteine100_' + c_menu).val('');
	$('#grassi100_' + c_menu).val('');
	$('#carboidrati100_' + c_menu).val('');
	$('#grammi_' + c_menu).val('');
	$('#grammi_' + c_menu).attr('disabled', true);
	$('#proteine0_' + c_menu).val('');
	$('#grassi0_' + c_menu).val('');
	$('#carboidrati0_' + c_menu).val('');
	$('#alimentoIN' + c_menu).val('');
}

function azzeraTutto(load) {
	for (var i = 0; i < 10; i++) {
		azzera(i);
	}
	$("#calorieTot").val("");
	$("#grassiTot").val("");
	$("#carboidratiTot").val("");
	$("#proteineTot").val("");
	$("#proteineBloc").val("");
	$("#grassiBloc").val("");
	$("#carboidratiBloc").val("");
	$("#rapportoPC").val("");
	if (load != 1) {
		Cookies.remove("PastoID");
		Cookies.remove("note");
		Cookies.remove("mealType");
		Cookies.remove("pastoNome");
		$("#SaveEdit").text("Salva Pasto")
	}
}

function myNoty(type, text, closeAfter, killer, buttons) {
	if (typeof closeAfter === 'undefined') closeAfter = false;
	if (typeof killer === 'undefined') killer = false;
	var n = noty({
		text: text,
		type: type,
		dismissQueue: true,
		modal: true,
		killer: killer,
		layout: 'center',
		theme: 'defaultTheme',
		timeout: closeAfter,
		maxVisible: 10
	});
	console.table('Noty ' + type + ': ' + n.options.id);
}

function newCalculator() {
	//azzeraTutto();
	Cookies.remove("PastoID");
	Cookies.remove("note");
	Cookies.remove("mealType");
	Cookies.remove("pastoNome");
	$('#ui-tabs-1').load("pages/zoneCalculator.php");

}

function changeTab(json) {
	$("#tabs").tabs("option", "active", 0);
	if (Cookies.get('PastoID') !== undefined) {
		$("#SaveEdit").text("Modifica Pasto")
	}
	Cookies.set("pastoNome", json[0]['pastoNome'], {
		expires: 365
	});
	Cookies.set("mealType", json[0]['mealType'], {
		expires: 365
	});
	Cookies.set("note", json[0]['note'], {
		expires: 365
	});
	azzeraTutto(1);
	var i = 0;
	while (i < json.length) {
		var resultValue = json[i]['cod_alimento'],
			desc_alimento = json[i]['nome'],
			gr_alimento = json[i]['gr_alimento'],
			optionValue = "<option value=\"" + resultValue + "\" selected=\"selected\">" + desc_alimento + "</option>";
		//alert(resultValue+":"+desc_alimento+":"+gr_alimento);
		$("#selAlim" + i).append(optionValue);
		$("#alimentoIN" + i).val(desc_alimento);
		$("#grammi_" + i).val(gr_alimento);
		//getNumberOfgramsNew(i, resultValue, "", "100",1);
		getNumberOfgramsNew(i, resultValue, gr_alimento, "0", 1);
		i++;
	}
	pgcTotalNew();
	return true;
}

function loadRecipe(id) {
	Cookies.set("PastoID", id, {
		expires: 365
	});
	var dialog = $("#showRecipe");
	dialog.dialog({
		close: function(event, ui) {
			//Cookies.remove('PastoID');
			$(this).dialog("close")
		},
		bgiframe: true,
		height: "auto",
		width: 450,
		modal: true,
		Cancel: function() {
			//Cookies.remove('PastoID');
			$(this).dialog("close");
		}
	});
	$('#showRecipe').load("pages/showRecipe.php");

}

function loadMeal(id) {
	Cookies.set("PastoID", id, {
		expires: 365
	});
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			pastoID: id
		},
		dataType: 'json',
		success: function(data) {
			var json = data;
			changeTab(json);
			console.table('loadMeal success');
		},
		complete: function(jqXHR, status) {
			var json = $.parseJSON(jqXHR.responseText)
			if (json[0]['note'] !== '') {
				myNoty("success", "Note:<br>" + json[0]['note'],"", "true");

				console.table('loadMeal complete');
			}
		},
		error: function() {
			console.table('loadMeal error');
			myNoty("error", "Impossibile caricare il pasto",10);
		}
	});
}

function editMealfunc() {
	//alert(Cookies.get("pastoNome"));
	$("#descMealEdit").val(Cookies.get("pastoNome"));
	$("#mealTypeEdit").val(Cookies.get("mealType"));
	$("#noteEdit").val(Cookies.get("note"));


	var alimArray = new Array(),
		gramsArray = new Array();
	i = 0;
	while (i <= 7) {
		alimArray[i] = $("#selAlim" + i).val();
		gramsArray[i] = $("#grammi_" + i).val();
		i++;
	}
	$("#editMeal").dialog({
		close: function(event, ui) {
			$(" this ").dialog("close")
		},
		bgiframe: true,
		height: mealHeight,
		width: mealWidth,
		modal: true,
		buttons: {
			"Edit": function() {
				var submit = true;
				// evaluate the form using generic validaing
				if (!validator.checkAll($("#editMealForm"))) {
					submit = false;
				}
				var descMeal = $("#descMealEdit"),
					mealType = $("#mealTypeEdit"),
					note = $("#noteEdit"),
					pastoID = Cookies.get("PastoID"),
					blocchi = $("#proteineBloc");
				//alert(submit);
				if (submit) {
					i = 0;
					dati = {};
					while (i <= 7) {
						dati["a" + i] = alimArray[i];
						dati["g" + i] = gramsArray[i];
						i++;
					}
					dati['descMeal'] = descMeal.val();
					dati['mealType'] = mealType.val();
					dati["note"] = note.val();
					dati["blocks"] = blocchi.val();
					dati["operation"] = 'editMeal';
					dati["pastoID"] = pastoID;
					//alert("id:"+id+" tipo:"+tipoVar.val()+" desc_alimentoVar:"+desc_alimentoVar.val()+" fonteVar:"+fonteVar.val()+"p100Var:"+p100Var);
					$.ajax({
						type: "GET",
						url: "pages/ajax.php",
						data: dati,
						async: false,
						dataType: 'json',
						success: function(data) {
							console.table(data);
							if(data['queryStatus']==='Success'){
								azzeraTutto();
								myNoty("success", "Pasto modificato",10);
								$('#ui-tabs-2').load("pages/pasti.php");
								$('#ui-tabs-6').load("pages/calendar.php");
								console.table('PastoModificato success');
								Cookies.remove("PastoID");
							Cookies.remove("note");
							Cookies.remove("mealType");
							Cookies.remove("pastoNome");
							console.table('PastoModificato complete');
							$("#SaveEdit").text("Salva Pasto")
							}else{
								myNoty("error", "Pasto non modificato",10);
							}
						},
						complete: function() {
							
						},
						error: function(jqXHR, textStatus, errorThrown) {
							console.table(textStatus, errorThrown);
							console.table('Error editMeal');
						}
					});
					$(this).dialog("close");
				}
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
}

function saveMealfunc() {
	$(function() {
		var buttonName = "Add",
			descMeal = $("#descMeal"),
			mealType = $("#mealType"),
			note = $("#note"),
			blocchi = $("#proteineBloc");
		var alimArray = new Array(),
			gramsArray = new Array();
		i = 0;
		while (i <= 7) {
			alimArray[i] = $("#selAlim" + i).val();
			gramsArray[i] = $("#grammi_" + i).val();
			i++;
		}

		//alert ("alimarray:"+alimArray+"gramsArray:"+gramsArray);	
		$("#saveMeal").dialog({
			close: function(event, ui) {
				$(this).dialog("close")
			},
			bgiframe: true,
			height: mealHeight,
			width: mealWidth,
			modal: true,
			buttons: [{
				text: buttonName,
				click: function() {
					var submit = true;
					// evaluate the form using generic validaing
					if (!validator.checkAll($("#saveMealForm"))) {
						submit = false;
					}
					if (submit) {
						i = 0;
						dati = {};
						while (i <= 7) {
							dati["a" + i] = alimArray[i];
							dati["g" + i] = gramsArray[i];
							i++;
						}
						dati['descr'] = descMeal.val();
						dati['tipo'] = mealType.val();
						dati["note"] = note.val();
						dati["blocks"] = blocchi.val();
						dati["operation"] = 'saveMeal';


						console.table(dati);
						$.ajax({
							type: "GET",
							url: "pages/ajax.php",
							data: dati,
							async: false,
							dataType: 'json',
							success: function(data) {
								var notyText = 'Pasto aggiunto';
								myNoty("success", notyText,10);
								console.table(data);
								console.table('Save/EditMeal success');
							},
							complete: function() {
								$('#saveMeal').dialog("close");
								$('#ui-tabs-2').load("pages/pasti.php");
								console.table('Save/EditMeal complete');
							},
							error: function(jqXHR, textStatus, errorThrown) {
								myNoty("error", "Pasto non aggiunto/modificato",10);
								console.table(data);
								console.table(textStatus, errorThrown);
								console.table('Error pgcTotalNew');
							}
						});
						//saveMeal(descMeal.val(), mealType.val(), dow.val(), note.val(), blocchi.val(), alimArray, gramsArray);
					}
				}
			}, {
				text: "Cancel",
				click: function() {
					$(this).dialog("close");
				}
			}]
		});
	});
}

function Log10(x) {
	return (Math.log(x) / Math.log(10));
}

function addProtNeed(sex) {
	var peso = $('#peso').val(),
		collo = $('#collo').val(),
		altezza = $('#altezza').val(),
		activity = $('#attivita').val(),
		addome = "",
		polso = "",
		avambraccio = "",
		anche = "",
		vita = "";
	if (sex == 'uomo') {
		addome = $('#addome').val();
	}
	if (sex == 'donna') {
		polso = $('#polso').val(),
			avambraccio = $('#avambraccio').val(),
			anche = $('#anche').val(),
			vita = $('#vita').val();
	}
	//alert("peso"+peso+"collo:"+collo+"altezza:"+altezza+"activity:"+activity+"addome:"+addome);
	//var noty=myNoty("information","Caricamento del pasto in corso","",false);
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			pesokg: peso,
			polsocm: polso,
			collocm: collo,
			avambracciocm: avambraccio,
			anchecm: anche,
			altezzacm: altezza,
			vitacm: vita,
			addomecm: addome,
			moltiplicatore: activity,
			opt: "addProteinNeed"
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			// console.table(data);
			var json = data,
				percentualeMG = json['percentualeMG'],
				percentualeMM = json['percentualeMM'],
				proteineDay = json['proteineDay'],
				blocchiZona = json['blocchiZona'],
				blocchimin = json['blocchiMin'],
				queryStatus = json['queryStatus'];
			$("#percentualeMG").val(percentualeMG);
			$("#percentualeMM").val(percentualeMM);
			$("#proteineDay").val(proteineDay);
			$("#blocchiZona").val(blocchiZona);
			//alert(blocchimin);
			if (blocchimin === "1") {
				var n = noty({
					type: 'alert',
					dismissQueue: true,
					modal: true,
					layout: 'center',
					theme: 'defaultTheme',
					text: 'ATTENZIONE: il valore minimo consigliato dagli autori della Dieta Zona è di 11 blocchi, click OK per maggiori informazioni',
					buttons: [{
						addClass: 'btn btn-primary',
						text: 'Ok',
						onClick: function() {
							window.open("http://www.massamagra.com/cosa-fare-sotto-11-blocchi.htm");
						}
					}, {
						addClass: 'btn btn-danger',
						text: 'Cancel',
						onClick: function($noty) {
							$noty.close();
						}
					}]
				});
			}
			myNoty("success", "Misurazione inserita con successo",10)
			console.table('addProtNeed success');
		},
		complete: function() {
			$('#ui-tabs-5').load("pages/infoChart.php");
			$("#contentInfoChart").css("display", "block")
			console.table('addProtNeed complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(textStatus, errorThrown);
			console.table('Error addProtNeed');
		}
	});
}

function validing(form, sex) {
	validator.message['empty'] = 'Obbligatorio';
	var submit = true;
	// evaluate the form using generic validaing
	if (!validator.checkAll($(form))) {
		submit = false;
	}
	if (submit) {
		addProtNeed(sex);
	} else {
		console.table('Error Validating');
		return false;
	}
}

function modifyAlimento(id, desc_alimento, tipo, fonte, p100, g100, c100) {
	//alert(tipo);
	$("#desc_alimentoedit").val(desc_alimento);
	$("#tipoedit").val(tipo);
	$("#fonteedit").val(fonte);
	$("#proteine100edit").val(p100);
	$("#grassi100edit").val(g100);
	$("#carboidrati100edit").val(c100);
	var desc_alimentoVar = $("#desc_alimentoedit"),
		tipoVar = $("#tipoedit"),
		fonteVar = $("#fonteedit"),
		p100Var = $("#proteine100edit"),
		g100Var = $("#grassi100edit"),
		c100Var = $("#carboidrati100edit");
	$("#editAlimento").dialog({
		close: function(event, ui) {
			$(" this ").dialog("close")
		},
		bgiframe: true,
		height: alimHeight,
		width: alimWidth,
		modal: true,
		buttons: {
			"Edit": function() {
				var submit = true;
				// evaluate the form using generic validaing
				if (!validator.checkAll($("#editAlimentoForm"))) {
					submit = false;
				}
				//alert(submit);
				if (submit) {
					//alert("id:"+id+" tipo:"+tipoVar.val()+" desc_alimentoVar:"+desc_alimentoVar.val()+" fonteVar:"+fonteVar.val()+"p100Var:"+p100Var);
					$.ajax({
						type: "GET",
						url: "pages/ajax.php",
						data: {
							idData: id,
							tipoData: tipoVar.val(),
							fonteData: fonteVar.val(),
							desc_alimentoData: desc_alimentoVar.val(),
							p100Data: p100Var.val(),
							g100Data: g100Var.val(),
							c100Data: c100Var.val()
						},
						async: false,
						dataType: 'json',
						success: function(data) {
							console.table(data);
							myNoty("success", "Alimento modificato",10);
							$('#contentAlimenti').load("pages/alimenti.php");
							console.table('ModificaAlimento success');
						},
						complete: function() {
							//$noty.close();
							//myNoty("information","Caricamento completato");
							//myNoty("success","Pasto caricato","300","");
							console.table('ModificaAlimento complete');
						},
						error: function(jqXHR, textStatus, errorThrown) {
							console.table(textStatus, errorThrown);
							console.table('Error editAlim');
						}
					});
					$(this).dialog("close");
				}
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
}

function delAlimento(id) {
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			idAlimento: id,
			opt: "DEL"
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			console.table(data);
			myNoty("success", data['queryStatus'],10);
			$('#contentAlimenti').load("pages/alimenti.php");
			console.table('ModificaAlimento success');
		},
		complete: function() {
			console.table('ModificaAlimento complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(textStatus, errorThrown);
			console.table('Error delAlim');
		}
	});
}

function notyDelAlimento(id, desc) {
	var n = noty({
		type: 'alert',
		dismissQueue: true,
		modal: true,
		layout: 'center',
		theme: 'defaultTheme',
		text: 'ATTENZIONE: si sta per cancellare l\'alimento: ' + desc + '. Sei sicuro?',
		buttons: [{
			addClass: 'btn btn-primary',
			text: 'Ok',
			onClick: function($noty) {
				$noty.close();
				delAlimento(id);
			}
		}, {
			addClass: 'btn btn-danger',
			text: 'Cancel',
			onClick: function($noty) {
				$noty.close();
			}
		}]
	});
}

function delPasto(id) {
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			idPasto: id,
			opt: "DEL"
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			console.table(data);
			myNoty("success", data['queryStatus'],10);
			$('#contentPasti').load("pages/pasti.php");
			console.table('delPasto success');
		},
		complete: function() {
			console.table('delpasto complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(textStatus, errorThrown);
			console.table('Error delPasto');
		}
	});
}

function notyDelPasto(id, desc) {
	var n = noty({
		type: 'alert',
		dismissQueue: true,
		modal: true,
		layout: 'center',
		theme: 'defaultTheme',
		text: 'ATTENZIONE: si sta per cancellare il pasto: ' + desc + '. Sei sicuro?',
		buttons: [{
			addClass: 'btn btn-primary',
			text: 'Ok',
			onClick: function($noty) {
				$noty.close();
				delPasto(id);
			}
		}, {
			addClass: 'btn btn-danger',
			text: 'Cancel',
			onClick: function($noty) {
				$noty.close();
			}
		}]
	});
}
//da provare
function saveCalendar() {
	var cookiesArray = Cookies.get();
	console.log("Cookies Array aveCalendar:", cookiesArray);
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			cookies: cookiesArray,
			opt: "saveCalendar"
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			console.table(data);
			myNoty("success", data['queryStatus'],10);
			console.table('saveCalendar success');
		},
		complete: function() {
			$('#groceryList').load("pages/groceryList.php");
			console.table('saveCalendar complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error: ", textStatus, errorThrown);
            console.log("Response Text:", jqXHR.responseText);
            console.log('Error saveCalendar');
        }
	});
}

function loadCalendarCookie() {
	for (col = 0; col < 6; col++) {
		for (row = 0; row < 6; row++) {
			colString = col.toString();
			rowString = row.toString();
			var intersection = colString + rowString;
			console.table(intersection);
			var pastoCookie = Cookies.get(intersection);
			if (typeof pastoCookie != "undefined") {
				console.table(intersection+':'+pastoCookie);
				var pastoArray = pastoCookie.split(";");
				var pastoID = pastoArray['0'];
				var pastoName = pastoArray['1'].replace(/\+/g, ' ');
				//var pastoName	decodeURIComponent(pastoArray['1']);
				console.table(intersection+':'+pastoID);
				$("<p style='cursor:pointer' id=pasto" + intersection + " onclick='return loadMeal(" + pastoID + ");'>" + pastoName + "</p>").addClass("dropped").appendTo("#" + intersection);
			}
		}
	}
	$(".dropped").draggable({
		appendTo: "body",
		revert: "invalid",
		opacity: 0.7,
		helper: "clone",
	});
}

function azzeraCalendarCookie() {
	for (col = 0; col < 6; col++) {
		for (row = 0; row < 6; row++) {
			colString = col.toString();
			rowString = row.toString();
			var azzeraCookie = colString + rowString;
			Cookies.remove(azzeraCookie);
		}
	}
}

function groceryListFunc() {
	var dialog = $("#groceryList");
	dialog.dialog({
		close: function(event, ui) {
			for (i = 0; i < 6; i++) {
				Cookies.remove('groceryDay' + i);
				Cookies.remove('groceryCheck' + i);
			}
			$('#groceryList').load("pages/groceryList.php");
			$(" this ").dialog("close")
		},
		bgiframe: true,
		height: "auto",
		width: 450,
		modal: true,
		Cancel: function() {
			$(this).dialog("close");
		}
	});
}

function delProtNeed(id) {
	$.ajax({
		type: "GET",
		url: "pages/ajax.php",
		data: {
			idProtNeed: id,
			opt: "DEL"
		},
		async: false,
		dataType: 'json',
		success: function(data) {
			console.table(data);
			myNoty("success", data['queryStatus'],10);
			console.table('delProtNeed success');
		},
		complete: function() {
			$('#ui-tabs-5').load("pages/infoChart.php");
			$("#contentInfoChart").css("display", "block")
			console.table('delProtNeed complete');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.table(textStatus, errorThrown);
			console.table('Error delProtNeed');
		}
	});
}

function notyDelProtNeed(id, data) {
	var n = noty({
		type: 'alert',
		dismissQueue: true,
		modal: true,
		layout: 'center',
		theme: 'defaultTheme',
		text: 'ATTENZIONE: si sta per cancellare la misurazione effettuata il: ' + data + '. Sei sicuro?',
		buttons: [{
			addClass: 'btn btn-primary',
			text: 'Ok',
			onClick: function($noty) {
				$noty.close();
				delProtNeed(id);
			}
		}, {
			addClass: 'btn btn-danger',
			text: 'Cancel',
			onClick: function($noty) {
				$noty.close();
			}
		}]
	});
}