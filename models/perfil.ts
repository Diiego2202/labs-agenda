import Sql = require("../infra/sql");

export = class Perfil {
	public id: number;
	public nome: string;

	private static validar(p: Perfil): string {
		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 50)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Perfil[]> {
		let lista: Perfil[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from perfil order by nome asc")) as Perfil[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Perfil> {
		let lista: Perfil[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from perfil where id = ?", [id])) as Perfil[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(p: Perfil): Promise<string> {
		let res: string;
		if ((res = Perfil.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into perfil (nome) values (?)", [p.nome]);
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O perfil ${p.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async alterar(p: Perfil): Promise<string> {
		let res: string;
		if ((res = Perfil.validar(p)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update perfil set nome = ? where id = ?", [p.nome, p.id]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O perfil ${p.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from perfil where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};
