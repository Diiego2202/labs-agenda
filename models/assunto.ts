import Sql = require("../infra/sql");

export = class Assunto {
	public id: number;
	public nome: string;
	public criacao: string;

	private static validar(a: Assunto): string {
		a.nome = (a.nome || "").normalize().trim();
		if (a.nome.length < 3 || a.nome.length > 100)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Assunto[]> {
		let lista: Assunto[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, date_format(criacao, '%d/%m/%Y') criacao from assunto order by nome asc")) as Assunto[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Assunto> {
		let lista: Assunto[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, date_format(criacao, '%d/%m/%Y') from assunto where id = ?", [id])) as Assunto[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(a: Assunto): Promise<string> {
		let res: string;
		if ((res = Assunto.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into assunto (nome, criacao) values (?, now())", [a.nome]);
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY")
				res = `O assunto ${a.nome} já existe`;
			else
				throw e;
			}
		});

		return res;
	}

	public static async alterar(a: Assunto): Promise<string> {
		let res: string;
		if ((res = Assunto.validar(a)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update assunto set nome = ? where id = ?", [a.nome, a.id]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O assunto ${a.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from assunto where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};
