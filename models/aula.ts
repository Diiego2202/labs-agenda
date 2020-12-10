import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");


export = class Aula {
	public id_aula: number;
	public nome_aula: string;
	public desc_aula: string;
	public inicio_aula: string;
	public termino_aula: string;
	public id_prof:number;
	public id_turma:number;
	public id_sala:number;


	public static async listarHoje(): Promise<Aula[]> {
		let inicioDiaHoje = DataUtil.hojeISOInicioDoDia();
		let fimDiaHoje = DataUtil.hojeISOFimDoDia();

		let lista: Aula[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_aula, nome_aula, desc_aula, date_format(inicio_aula, '%Y-%m-%dT%T') inicio_aula, date_format(termino_aula, '%Y-%m-%dT%T') termino_aula from aula where inicio_aula <= ? and termino_aula >= ?", [fimDiaHoje, inicioDiaHoje])) as Aula[];
		
		});

		//if (lista !== null) {
		//	return lista;
		//} else {
		//	return [];
		//}

	
		return lista || [];
	}

	public static  validar(aula: Aula): string{
		
		if(!aula){
			return "Dados inválidos";
		}

		aula.nome_aula = (aula.nome_aula || "").normalize().trim();
		if(!aula.nome_aula || aula.nome_aula.length>50){
			return "Nome inválido";
		}
		aula.desc_aula = (aula.desc_aula || "").normalize().trim();
		if(!aula.desc_aula || aula.desc_aula.length>50){
			return "Descrição Inválida";
		}
		aula.inicio_aula = DataUtil.converterDataISO(aula.inicio_aula);
		if(!aula.inicio_aula) {
			//validação de data será aqui?
			return "Data de Início inválida"
		}
		aula.termino_aula = DataUtil.converterDataISO(aula.termino_aula);
		if(!aula.termino_aula) {
			//validação de data será aqui?
			return "Data de Término inválida"
		}
		aula.id_prof = parseInt(aula.id_prof as any);
		if (isNaN(aula.id_prof)) {
			return "Professor inválido";
		}
		aula.id_turma = parseInt(aula.id_turma as any);
		if (isNaN(aula.id_turma)) {
			return "Turma inválida";
		}
		aula.id_sala = parseInt(aula.id_sala as any);
		if (isNaN(aula.id_sala)) {
			return "Sala inválida";
		}
		return null;
	}

	public static async listar(id_turma?: number, id_sala?: number, ano?: number, mes?: number, dia?: number): Promise<Aula[]>{
        let lista: Aula[] = null;
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
				let inicio: string, fim: string;
				if (mes >= 1 && mes <= 12) {
					if (dia >= 1 && dia <= 31) {
						inicio = DataUtil.formatar(ano, mes, dia);
						const dateInicial = new Date(ano, mes - 1, dia),
							dateFinal = new Date(dateInicial.getTime() + 100800000);
						fim = DataUtil.formatar(dateFinal.getFullYear(), dateFinal.getMonth() + 1, dateFinal.getDate());
					} else {
						inicio = DataUtil.formatar(ano, mes, 1);
						mes++;
						if (mes > 12) {
							mes = 1;
							ano++;
						}
						fim = DataUtil.formatar(ano, mes, 1);
					}
				} else {
					inicio = DataUtil.formatar(ano, 1, 1);
					fim = DataUtil.formatar(ano + 1, 1, 1);
				}
				where += " e.inicio_aula < ? and e.termino_aula >= ?";
				parametros.push(fim, inicio);
			}

			lista = await sql.query(`select e.id_aula, e.nome_aula, e.desc_aula, date_format(e.inicio_aula, '%d/%m/%Y %H:%i') inicio_aula, date_format(e.termino_aula, '%d/%m/%Y %H:%i') termino_aula, ep.id_prof, p.nome_prof, et.id_turma, t.desc_turma, es.id_sala, s.desc_sala from aula e 
inner join aula_prof ep on ep.id_aula = e.id_aula
inner join aula_turma et on et.id_aula = e.id_aula
inner join aula_sala es on es.id_aula = e.id_aula
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

	public static async criar(aula: Aula): Promise<string>{

		let res: string;
		if ((res = Aula.validar(aula)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("insert into aula (nome_aula, desc_aula, inicio_aula, termino_aula) values (?,?,?,?)",[aula.nome_aula, aula.desc_aula, aula.inicio_aula, aula.termino_aula]);
				const id_aula = await sql.scalar("select last_insert_id()") as number;
				await sql.query(" insert into aula_prof(id_prof, id_aula) values (?, ?)", [aula.id_prof, id_aula]);
				await sql.query(" insert into aula_turma(id_turma, id_aula) values (?, ?)", [aula.id_turma, id_aula]);
				await sql.query(" insert into aula_sala(id_sala, id_aula) values (?, ?)", [aula.id_sala, id_aula]);

				await sql.commit();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `A aula ${aula.nome_aula} já existe`; // aula.nome que está no alterar.ejs
				else
					throw e;
			}
		});

		return res;


    } 

	public static async obter(id_aula:number): Promise<Aula>{
        let aula: Aula = null;

        await Sql.conectar(async(sql)=>{
			let lista = await sql.query("select e.id_aula, e.nome_aula, e.desc_aula, date_format(e.inicio_aula, '%Y-%m-%dT%H:%i') inicio_aula, date_format(e.termino_aula, '%Y-%m-%dT%H:%i') termino_aula, ep.id_prof, et.id_turma, es.id_sala from aula e inner join aula_prof ep on ep.id_aula = e.id_aula inner join aula_turma et on et.id_aula = e.id_aula inner join aula_sala es on es.id_aula = e.id_aula where e.id_aula = ?",[id_aula]);
         
            if(lista && lista.length){
                aula = lista[0];
            }
        });

        return aula;

    }

	public static async alterar(aula: Aula): Promise<string>{
        let erro: string = Aula.validar(aula);
        if(erro){
            return erro;
        }
        await Sql.conectar(async(sql)=>{
			await sql.beginTransaction();

			await sql.query("update aula set nome_aula = ?, desc_aula = ?, inicio_aula = ?,  termino_aula = ? where id_aula = ?",[aula.nome_aula, aula.desc_aula, aula.inicio_aula, aula.termino_aula, aula.id_aula]);
            if(!sql.linhasAfetadas){
				erro = 'Aula não encontrada';
				return;
            }

			await sql.query(" update aula_prof set id_prof = ? where id_aula = ?", [aula.id_prof, aula.id_aula]);
			await sql.query(" update aula_turma set id_turma = ? where id_aula = ?", [aula.id_turma, aula.id_aula]);
			await sql.query(" update aula_sala set id_sala = ? where id_aula = ?", [aula.id_sala, aula.id_aula]);

			await sql.commit();
        });

        return erro;
    }

	public static async excluir(id_aula:number): Promise<string>{
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("delete from aula where id_aula=?;",[id_aula]);
         
            if(!sql.linhasAfetadas){
                erro = 'Aula não encontrada';
            }
        });

        return erro;

	}
	
	public static async importar(arquivo: any) : Promise<string> {
		if (!arquivo)
			return "CSV faltando";
	
		if (!arquivo.buffer || !arquivo.size)
			return "CSV inválido";
	
		if (arquivo.size > (4 * 1024 * 1024))
			return "CSV muito grande";
	
		const buffer = arquivo.buffer as Buffer;
		let csv = buffer.toString("utf-8");
		csv = csv.replace(/\r/g, "");
		let linhas = csv.split("\n");
		linhas.splice(0, 1);
		// Excluir linhas vazias
		for (let i = linhas.length - 1; i >= 0; i--) {
			if (linhas[i]) {
				linhas[i] = linhas[i].trim();
				if (!linhas[i])
					linhas.splice(i, 1);
			} else {
				linhas.splice(i, 1);
			}
		}

		if (!linhas.length)
			return "CSV vazio";

		const registros: string[][] = new Array(linhas.length);
		for (let i = 0; i < linhas.length; i++) {
			const registro = linhas[i].split(";");
			if (registro.length !== 7)
				return `Linha ${(i + 2)} não contém 7 campos`;
			for (let c = 0; c < registro.length; c++) {
				registro[c] = registro[c].normalize().trim();
				if (!registro[c])
					return `Linha ${(i + 2)}, coluna ${(c + 1)} em branco`;
			}
			// Nome;Descrição;Turma;Sala;Professor;Início;Término
			registro[5] = DataUtil.converterDataISO(registro[5]);
			if (!registro[5])
				return `Coluna 6 (data e hora de início) da linha ${(i + 2)} inválida`;
			registro[6] = DataUtil.converterDataISO(registro[5]);
			if (!registro[6])
				return `Coluna 7 (data e hora de término) da linha ${(i + 2)} inválida`;
			registros[i] = registro;
		}

		let erro: string = null;

		await Sql.conectar(async(sql : Sql) => {

			for (let i = 0; i < registros.length; i++) {
				// Nome;Descrição;Turma;Sala;Professor;Início;Término
				let temp = registros[i][2];
				registros[i][2] = await sql.scalar("select id_turma from turma where desc_turma = ?", [temp]);
				if (!registros[i][2]) {
					erro = `Turma "${temp}", da linha ${(i + 2)}, não encontrada`;
					return;
				}
				temp = registros[i][3];
				registros[i][3] = await sql.scalar("select id_sala from sala where desc_sala = ?", [temp]);
				if (!registros[i][3]) {
					erro = `Sala "${temp}", da linha ${(i + 2)}, não encontrada`;
					return;
				}
				temp = registros[i][4];
				registros[i][4] = await sql.scalar("select id_prof from professor where nome_prof = ?", [temp]);
				if (!registros[i][4]) {
					erro = `Professor "${temp}", da linha ${(i + 2)}, não encontrado`;
					return;
				}
			}
	
			await sql.beginTransaction();

			for (let i = 0; i < registros.length; i++) {
				// Nome;Descrição;Turma;Sala;Professor;Início;Término
				await sql.query("insert into aula (nome_aula, desc_aula, inicio_aula, termino_aula) values (?,?,?,?)", [registros[i][0], registros[i][1], registros[i][5], registros[i][6]]);
				const id_aula = await sql.scalar("select last_insert_id()") as number;
				await sql.query(" insert into aula_turma(id_turma, id_aula) values (?, ?)", [registros[i][2], id_aula]);
				await sql.query(" insert into aula_sala(id_sala, id_aula) values (?, ?)", [registros[i][3], id_aula]);
				await sql.query(" insert into aula_prof(id_prof, id_aula) values (?, ?)", [registros[i][4], id_aula]);
			}

			await sql.commit();
		})

		return erro;
	}
}
