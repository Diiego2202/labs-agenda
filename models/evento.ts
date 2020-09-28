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
			lista = (await sql.query("select id, nome, date_format(inicio, '%Y-%m-%dT%T') inicio, date_format(termino, '%Y-%m-%dT%T') termino from evento where inicio <= ? and termino >= ?", [fimDiaHoje, inicioDiaHoje])) as Evento[];
		});

		//if (lista !== null) {
		//	return lista;
		//} else {
		//	return [];
		//}
		return lista || [];
	}
};
