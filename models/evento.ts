import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");

export = class Evento {
	public id: number;
	public nome: string;
	public inicio: string;
	public termino: string;

	public static async listarHoje(): Promise<Evento[]> {
		let inicioDiaHoje = DataUtil.hojeISOInicioDoDia();
		let fimDiaHoje = DataUtil.hojeISOFimDoDia();

		let lista: Evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_evento, nome_evento, date_format(inicio_evento, '%Y-%m-%dT%T') inicio_evento, date_format(termino_evento, '%Y-%m-%dT%T') termino_evento from evento where inicio_evento <= ? and termino_evento >= ?", [fimDiaHoje, inicioDiaHoje])) as Evento[];
		});

		//if (lista !== null) {
		//	return lista;
		//} else {
		//	return [];
		//}
		return lista || [];
	}
};
