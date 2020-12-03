import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");


export = class Evento {
	public id_evento: number;
	public nome_evento: string;
	public desc_evento: string;
	public inicio_evento: string;
	public termino_evento: string;
	public id_prof:number;
	public id_turma:number;
	public id_sala:number;


	public static async listarHoje(): Promise<Evento[]> {
		let inicioDiaHoje = DataUtil.hojeISOInicioDoDia();
		let fimDiaHoje = DataUtil.hojeISOFimDoDia();

		let lista: Evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_evento, nome_evento, desc_evento, date_format(inicio_evento, '%Y-%m-%dT%T') inicio_evento, date_format(termino_evento, '%Y-%m-%dT%T') termino_evento from evento where inicio_evento <= ? and termino_evento >= ?", [fimDiaHoje, inicioDiaHoje])) as Evento[];
		
		});

		//if (lista !== null) {
		//	return lista;
		//} else {
		//	return [];
		//}

	
		return lista || [];
	}

	public static  validar(evento: Evento): string{
		
		if(!evento){
			return "Dados inválidos";
		}

		evento.nome_evento = (evento.nome_evento || "").normalize().trim();
		if(!evento.nome_evento || evento.nome_evento.length>50){
			return "Nome inválido";
		}
		evento.desc_evento = (evento.desc_evento || "").normalize().trim();
		if(!evento.desc_evento || evento.desc_evento.length>50){
			return "Descrição Inválida";
		}
		evento.inicio_evento = DataUtil.converterDataISO(evento.inicio_evento);
		if(!evento.inicio_evento) {
			//validação de data será aqui?
			return "Data de Início inválida"
		}
		evento.termino_evento = DataUtil.converterDataISO(evento.termino_evento);
		if(!evento.termino_evento) {
			//validação de data será aqui?
			return "Data de Término inválida"
		}
		evento.id_prof = parseInt(evento.id_prof as any);
		if (isNaN(evento.id_prof)) {
			return "Professor inválido";
		}
		evento.id_turma = parseInt(evento.id_turma as any);
		if (isNaN(evento.id_turma)) {
			return "Turma inválida";
		}
		evento.id_sala = parseInt(evento.id_sala as any);
		if (isNaN(evento.id_sala)) {
			return "Sala inválida";
		}
		return null;
	}

	public static async listar(id_turma?: number, id_sala?: number, ano?: number): Promise<Evento[]>{
        let lista: Evento[] = null;
        await Sql.conectar(async (sql) => {
			let where = "";
			let parametros: any[] = [];

			if (id_turma > 0) {
				if (where)
					where += " and ";
				where += " et.id_turma = ? ";
				parametros.push(id_turma);
			}

			if (id_sala > 0) {
				if (where)
					where += " and ";
				where += " es.id_sala = ? ";
				parametros.push(id_sala);
			}

			if (ano > 0) {
				if (where)
					where += " and ";
				const inicio = DataUtil.formatar(ano, 1, 1);
				const fim = DataUtil.formatar(ano + 1, 1, 1);
				where += " e.inicio_evento < ? and e.termino_evento >= ?";
				parametros.push(fim, inicio);
			}

			lista = await sql.query(`select e.id_evento, e.nome_evento, e.desc_evento, date_format(e.inicio_evento, '%d/%m/%Y %H:%i') inicio_evento, date_format(e.termino_evento, '%d/%m/%Y %H:%i') termino_evento, ep.id_prof, p.nome_prof, et.id_turma, t.desc_turma, es.id_sala, s.desc_sala from evento e 
inner join evento_prof ep on ep.id_evento = e.id_evento
inner join evento_turma et on et.id_evento = e.id_evento
inner join evento_sala es on es.id_evento = e.id_evento
inner join professor p on p.id_prof = ep.id_prof
inner join turma t on t.id_turma = et.id_turma
inner join sala s on s.id_sala = es.id_sala ` +
				(where ?
					(" where " + where) :
					""
				), parametros);
        });
        return lista;
	}

	public static async criar(evento: Evento): Promise<string>{

		let res: string;
		if ((res = Evento.validar(evento)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("insert into evento (nome_evento, desc_evento, inicio_evento, termino_evento) values (?,?,?,?)",[evento.nome_evento, evento.desc_evento, evento.inicio_evento, evento.termino_evento]);
				const id_evento = await sql.scalar("select last_insert_id()") as number;
				await sql.query(" insert into evento_prof(id_prof, id_evento) values (?, ?)", [evento.id_prof, id_evento]);
				await sql.query(" insert into evento_turma(id_turma, id_evento) values (?, ?)", [evento.id_turma, id_evento]);
				await sql.query(" insert into evento_sala(id_sala, id_evento) values (?, ?)", [evento.id_sala, id_evento]);

				await sql.commit();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O evento ${evento.nome_evento} já existe`; // evento.nome que está no alterar.ejs
				else
					throw e;
			}
		});

		return res;


    } 

	public static async obter(id_evento:number): Promise<Evento>{
        let evento: Evento = null;

        await Sql.conectar(async(sql)=>{
			let lista = await sql.query("select e.id_evento, e.nome_evento, e.desc_evento, date_format(e.inicio_evento, '%Y-%m-%dT%H:%i') inicio_evento, date_format(e.termino_evento, '%Y-%m-%dT%H:%i') termino_evento, ep.id_prof, et.id_turma, es.id_sala from evento e inner join evento_prof ep on ep.id_evento = e.id_evento inner join evento_turma et on et.id_evento = e.id_evento inner join evento_sala es on es.id_evento = e.id_evento where e.id_evento = ?",[id_evento]);
         
            if(lista && lista.length){
                evento = lista[0];
            }
        });

        return evento;

    }

	public static async alterar(evento: Evento): Promise<string>{
        let erro: string = Evento.validar(evento);
        if(erro){
            return erro;
        }
        await Sql.conectar(async(sql)=>{
			await sql.beginTransaction();

			await sql.query("update evento set nome_evento = ?, desc_evento = ?, inicio_evento = ?,  termino_evento = ? where id_evento = ?",[evento.nome_evento, evento.desc_evento, evento.inicio_evento, evento.termino_evento, evento.id_evento]);
            if(!sql.linhasAfetadas){
				erro = 'Evento não encontrado';
				return;
            }

			await sql.query(" update evento_prof set id_prof = ? where id_evento = ?", [evento.id_prof, evento.id_evento]);
			await sql.query(" update evento_turma set id_turma = ? where id_evento = ?", [evento.id_turma, evento.id_evento]);
			await sql.query(" update evento_sala set id_sala = ? where id_evento = ?", [evento.id_sala, evento.id_evento]);

			await sql.commit();
        });

        return erro;
    }

	public static async excluir(id_evento:number): Promise<string>{
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("delete from evento where id_evento=?;",[id_evento]);
         
            if(!sql.linhasAfetadas){
                erro = 'Evento não encontrado';
            }
        });

        return erro;

	}
	
	public static async importar(evento: Evento) : Promise<Evento[]> {
		let res : any;

		await Sql.conectar(async(sql : Sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("insert into evento (nome_evento, desc_evento, inicio_evento, termino_evento) values (?,?,?,?)",[evento.nome_evento, evento.desc_evento, evento.inicio_evento, evento.termino_evento]);
				const id_evento = await sql.scalar("select last_insert_id()") as number;
				await sql.query(" insert into evento_prof(id_prof, id_evento) values (?, ?)", [evento.id_prof, id_evento]);
				await sql.query(" insert into evento_turma(id_turma, id_evento) values (?, ?)", [evento.id_turma, id_evento]);
				await sql.query(" insert into evento_sala(id_sala, id_evento) values (?, ?)", [evento.id_sala, id_evento]);
			} catch(err) {
				if (err.code && err.code === "ER_DUP_ENTRY") {
					res = `O evento ${evento.nome_evento} já existe`;
				} else {
					throw err;
				}
			}
		})

		return res;
	}
}
