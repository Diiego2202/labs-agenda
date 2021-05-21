import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import lru = require("lru-cache");
import Sql = require("../infra/sql");
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");
import JSONRequest = require("../infra/jsonRequest");
import emailValido = require("../utils/emailValido");

export = class Usuario {

	private static readonly IdAdmin = 1;
	private static readonly IdPerfilAdmin = 1;

	public id: number;
	public login: string;
	public nome: string;
	public email: string;
	public idperfil: number;
	public criacao: string;

	// Utilizados apenas através do cookie
	public admin: boolean;

	// Não estamos utilizando Usuario.cookie como middleware, porque existem muitas requests
	// que não precisam validar o usuário logado, e agora, é assíncrono...
	// http://expressjs.com/pt-br/guide/writing-middleware.html
	//public static cookie(req: express.Request, res: express.Response, next: Function): void {
	public static async cookie(req: express.Request, res: express.Response = null, admin: boolean = false): Promise<Usuario> {
		let cookieStr = req.cookies[appsettings.cookie] as string;
		if (!cookieStr || cookieStr.length !== 48) {
			if (res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return null;
		} else {
			let id = parseInt(cookieStr.substr(0, 8), 16) ^ appsettings.usuarioHashId;
			let usuario: Usuario = null;

			await Sql.conectar(async (sql: Sql) => {
				let rows = await sql.query("select id, login, nome, email, idperfil, token from usuario where id = ?", [id]);
				let row: any;

				if (!rows || !rows.length || !(row = rows[0]))
					return;

				let token = cookieStr.substring(16);

				if (!row.token || token !== (row.token as string))
					return;

				let u = new Usuario();
				u.id = id;
				u.login = row.login as string;
				u.nome = row.nome as string;
				u.email = row.email as string;
				u.idperfil = row.idperfil as number;
				u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

				usuario = u;
			});

			if (admin && usuario && usuario.idperfil !== Usuario.IdPerfilAdmin)
				usuario = null;
			if (!usuario && res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return usuario;
		}
	}

	private static gerarTokenCookie(id: number): [string, string] {
		let idStr = intToHex(id ^ appsettings.usuarioHashId);
		let idExtra = intToHex(0);
		let token = randomBytes(16).toString("hex");
		let cookieStr = idStr + idExtra + token;
		return [token, cookieStr];
	}

	public static async efetuarLogin(token: string, res: express.Response): Promise<[string, Usuario]> {
		let r: string = null;
		let u: Usuario = null;

		try {
			const resposta = await JSONRequest.get(appsettings.ssoToken + encodeURIComponent(token));
			if (!resposta.sucesso)
				return [resposta.erro || (resposta.resultado && resposta.resultado.toString()) || "Erro de comunicação de rede", null];
			
			const json = resposta.resultado;
			if (json.erro)
				return [json.erro, null];

			await Sql.conectar(async (sql: Sql) => {

				let rows = await sql.query("select id, login, nome, email, idperfil from usuario where login = ?", [json.dados.user]);
				let row: any;
				let ok: boolean;
	
				if (!rows || !rows.length || !(row = rows[0])) {
					r = "Usuário não está cadastrado. Por favor, entre em contato com o administrador do sistema.";
					return;
				}
	
				let [token, cookieStr] = Usuario.gerarTokenCookie(row.id);
	
				await sql.query("update usuario set token = ? where id = ?", [token, row.id]);
	
				u = new Usuario();
				u.id = row.id;
				u.login = json.dados.user;
				u.nome = row.nome as string;
				u.email = row.email as string;
				u.idperfil = row.idperfil as number;
				u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

				if (json.dados.nome && u.nome !== json.dados.nome) {
					u.nome = json.dados.nome;
					await sql.query("update usuario set nome = ? where id = ?", [json.dados.nome, u.id]);
				}

				if (json.dados.email && u.email !== json.dados.email) {
					u.email = json.dados.email;
					await sql.query("update usuario set email = ? where id = ?", [json.dados.email, u.id]);
				}
	
				res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
			});
		} catch (ex) {
			return [ex.message || ex.toString(), null];
		}

		return [r, u];
	}

	public async efetuarLogout(res: express.Response): Promise<void> {
		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update usuario set token = null where id = ?", [this.id]);

			res.cookie(appsettings.cookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});
	}

	private static validar(u: Usuario): string {
		if (!u)
			return "Dados inválidos";

		u.idperfil = parseInt(u.idperfil as any);
		if (isNaN(u.idperfil))
			return "Perfil inválido";

		return null;
	}

	public static async listar(): Promise<Usuario[]> {
		let lista: Usuario[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, u.email, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Usuario[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Usuario> {
		let lista: Usuario[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = await sql.query("select id, login, nome, email, idperfil, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Usuario[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validar(u)))
			return res;

		u.login = (u.login || "").normalize().trim().toLowerCase();
		if (u.login.length < 3 || u.login.length > 100)
			return "Login inválido";

		u.nome = (u.nome || "").normalize().trim();
		if (u.nome.length < 3 || u.nome.length > 100)
			return "Nome inválido";

		u.email = (u.email || "").normalize().trim();
		if (u.email.length < 3 || u.email.length > 100 || !emailValido(u.email))
			return "E-mail inválido";

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into usuario (login, nome, email, idperfil, criacao) values (?, ?, ?, ?, now())", [u.login, u.nome, u.email, u.idperfil]);
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							res = `O login ${u.login} já está em uso`;
							break;
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Perfil não encontrado";
							break;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});

		return res;
	}

	public static async alterar(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validar(u)))
			return res;

		if (u.id === Usuario.IdAdmin)
			return "Não é possível editar o usuário administrador principal";

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update usuario set idperfil = ? where id = ?", [u.idperfil, u.id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		if (id === Usuario.IdAdmin)
			return "Não é possível excluir o usuário administrador principal";

		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from usuario where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
}
