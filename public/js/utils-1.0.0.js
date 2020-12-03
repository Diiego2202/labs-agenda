function converterEventos(eventos) {
	if (!eventos)
		return null;
	for (var i = 0; i < eventos.length; i++) {
		eventos[i].title = eventos[i].nome_evento;
		eventos[i].start = converterDataISO(eventos[i].inicio_evento);
		eventos[i].end = converterDataISO(eventos[i].termino_evento);
	}
}

function converterDataISO(dataComOuSemHorario) {
	if (!dataComOuSemHorario || !(dataComOuSemHorario = trim(dataComOuSemHorario)))
		return null;
	var b1 = dataComOuSemHorario.indexOf("/");
	var b2 = dataComOuSemHorario.lastIndexOf("/");
	var dia, mes, ano;
	if (b1 <= 0 || b2 <= b1) {
		var b1 = dataComOuSemHorario.indexOf("-");
		var b2 = dataComOuSemHorario.lastIndexOf("-");
		if (b1 <= 0 || b2 <= b1)
			return null;
		ano = parseInt(dataComOuSemHorario.substring(0, b1));
		mes = parseInt(dataComOuSemHorario.substring(b1 + 1, b2));
		dia = parseInt(dataComOuSemHorario.substring(b2 + 1));
	} else {
		dia = parseInt(dataComOuSemHorario.substring(0, b1));
		mes = parseInt(dataComOuSemHorario.substring(b1 + 1, b2));
		ano = parseInt(dataComOuSemHorario.substring(b2 + 1));
	}
	if (isNaN(dia) || isNaN(mes) || isNaN(ano) ||
		dia < 1 || mes < 1 || ano < 1 ||
		dia > 31 || mes > 12 || ano > 9999)
		return null;
	switch (mes) {
		case 2:
			if (!(ano % 4) && ((ano % 100) || !(ano % 400))) {
				if (dia > 29)
					return null;
			} else {
				if (dia > 28)
					return null;
			}
			break;
		case 4:
		case 6:
		case 9:
		case 11:
			if (dia > 30)
				return null;
			break;
	}
	var sepHorario = dataComOuSemHorario.indexOf(" ");
	if (sepHorario < 0)
		sepHorario = dataComOuSemHorario.indexOf("T");
	if (sepHorario >= 0) {
		var horario = dataComOuSemHorario.substr(sepHorario + 1);
		var sepMinuto = horario.indexOf(":");
		if (sepMinuto >= 0) {
			var hora = parseInt(horario);
			var minuto = parseInt(horario.substr(sepMinuto + 1));
			if (hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59)
				return ano + "-" + ((mes < 10) ? ("0" + mes) : mes) + "-" + ((dia < 10) ? ("0" + dia) : dia) + "T" + ((hora < 10) ? ("0" + hora) : hora) + ":" + ((minuto < 10) ? ("0" + minuto) : minuto) + ":00";
		}
		return null;
	}
	return ano + "-" + ((mes < 10) ? ("0" + mes) : mes) + "-" + ((dia < 10) ? ("0" + dia) : dia);
}
