
export = class DataUtil {
	private static formatar(ano: number, mes: number, dia: number): string {
		return ano + "-" + ((mes < 10) ? ("0" + mes) : mes) + "-" + ((dia < 10) ? ("0" + dia) : dia);
	}

	private static formatarComHorario(ano: number, mes: number, dia: number, hora: number, minuto: number, segundo: number): string {
		return ano + "-" + ((mes < 10) ? ("0" + mes) : mes) + "-" + ((dia < 10) ? ("0" + dia) : dia) + "T" + ((hora < 10) ? ("0" + hora) : hora) + ":" + ((minuto < 10) ? ("0" + minuto) : minuto) + ":" + ((segundo < 10) ? ("0" + segundo) : segundo);
	}

	public static converterDataISO(data: string): string {
		if (!data || !(data = data.trim()) || data.length > 10)
			return null;
		let b1 = data.indexOf("/");
		let b2 = data.lastIndexOf("/");
		let dia: number, mes: number, ano: number;
		if (b1 <= 0 || b2 <= b1) {
			let b1 = data.indexOf("-");
			let b2 = data.lastIndexOf("-");
			if (b1 <= 0 || b2 <= b1)
				return null;
			ano = parseInt(data.substring(0, b1));
			mes = parseInt(data.substring(b1 + 1, b2));
			dia = parseInt(data.substring(b2 + 1));
		} else {
			dia = parseInt(data.substring(0, b1));
			mes = parseInt(data.substring(b1 + 1, b2));
			ano = parseInt(data.substring(b2 + 1));
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
		return DataUtil.formatar(ano, mes, dia);
	}

	public static converterDateISO(data: Date): string {
		return DataUtil.formatar(data.getFullYear(), data.getMonth() + 1, data.getDate())
	}

	public static converterDateISOComHorario(data: Date): string {
		return DataUtil.formatarComHorario(data.getFullYear(), data.getMonth() + 1, data.getDate(), data.getHours(), data.getMinutes(), data.getSeconds());
	}

	public static converterDateISOInicioDoDia(data: Date): string {
		return DataUtil.formatarComHorario(data.getFullYear(), data.getMonth() + 1, data.getDate(), 0, 0, 0);
	}

	public static converterDateISOFimDoDia(data: Date): string {
		return DataUtil.formatarComHorario(data.getFullYear(), data.getMonth() + 1, data.getDate(), 23, 59, 59);
	}

	public static hojeISO(): string {
		const hoje = new Date();

		return DataUtil.formatar(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
	}

	public static hojeISOComHorario(): string {
		const hoje = new Date();

		return DataUtil.formatarComHorario(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate(), hoje.getHours(), hoje.getMinutes(), hoje.getSeconds());
	}

	public static hojeISOInicioDoDia(): string {
		const hoje = new Date();

		return DataUtil.formatarComHorario(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate(), 0, 0, 0);
	}

	public static hojeISOFimDoDia(): string {
		const hoje = new Date();

		return DataUtil.formatarComHorario(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate(), 23, 59, 59);
	}
}
