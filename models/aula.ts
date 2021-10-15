import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");


export = class Aula {
	public id_aula: number;
	public nome_aula: string;
	public desc_aula: string;
	public inicio_aula: string;
	public termino_aula: string;
	public carga_horaria: number;
	public id_prof:number;
	public id_turma:number;
	public id_sala:number;
	public ocorrencias: string[];

	public static async listarHoje(): Promise<Aula[]> {
		let inicioDiaHoje = DataUtil.hojeISOInicioDoDia();
		let fimDiaHoje = DataUtil.hojeISOFimDoDia();

		let lista: Aula[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id_aula, nome_aula, desc_aula, date_format(inicio_aula, '%Y-%m-%dT%T') inicio_aula, date_format(termino_aula, '%Y-%m-%dT%T') termino_aula, carga_horaria from aula where inicio_aula <= ? and termino_aula >= ?", [fimDiaHoje, inicioDiaHoje])) as Aula[];
		
		});

		//if (lista !== null) {
		//	return lista;
		//} else {
		//	return [];
		//}

	
		return lista || [];
	}

	public static validar(aula: Aula): string {
		
		if(!aula){
			return "Dados inválidos";
		}

		aula.nome_aula = (aula.nome_aula || "").normalize().trim();
		if(!aula.nome_aula || aula.nome_aula.length>100){
			return "Nome inválido";
		}
		aula.desc_aula = (aula.desc_aula || "").normalize().trim();
		if(!aula.desc_aula || aula.desc_aula.length>100){
			return "Descrição Inválida";
		}
		aula.inicio_aula = DataUtil.converterDataISO(aula.inicio_aula);
		if(!aula.inicio_aula) {
			//validação de data será aqui?
			return "Data de Início inválida";
		}
		aula.termino_aula = DataUtil.converterDataISO(aula.termino_aula);
		if(!aula.termino_aula) {
			//validação de data será aqui?
			return "Data de Término inválida";
		}

		const regexp = /[\/\-\:\s]/g,
			inicio = parseInt(aula.inicio_aula.replace(regexp, "")),
			termino = parseInt(aula.termino_aula.replace(regexp, ""));
		if (inicio > termino)
			return "Data de Início deve ser anterior à Data de Término";

		aula.carga_horaria = parseInt(aula.carga_horaria as any);
		if (isNaN(aula.carga_horaria)){
			return "Carga horária inválida";
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
		if (!aula.ocorrencias) {
			aula.ocorrencias = [];
		} else {
			if (!Array.isArray(aula.ocorrencias))
				aula.ocorrencias = [ aula.ocorrencias as any ];

			for (let i = aula.ocorrencias.length - 1; i >= 0; i--) {
				if (!(aula.ocorrencias[i] = DataUtil.converterDataISO(aula.ocorrencias[i])))
					return "Data da ocorrência inválida";
				const ocorrencia = parseInt(aula.ocorrencias[i].replace(regexp, ""));
				if (ocorrencia < inicio)
					return "Data da ocorrência anterior ao início da aula";
				if (ocorrencia > termino)
					return "Data da ocorrência posterior ao término da aula";
			}

			aula.ocorrencias.sort();

			for (let i = aula.ocorrencias.length - 1; i > 0; i--) {
				if (aula.ocorrencias[i] === aula.ocorrencias[i - 1])
					return "Data da ocorrência repetida";
			}
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

			lista = await sql.query(`select e.id_aula, e.nome_aula, e.desc_aula, date_format(e.inicio_aula, '%d/%m/%Y') inicio_aula, date_format(e.termino_aula, '%d/%m/%Y') termino_aula, e.carga_horaria, ep.id_prof, p.nome_prof, et.id_turma, t.desc_turma, es.id_sala, s.desc_sala from aula e 
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

	public static async listarOcorrencias(id_turma?: number, id_sala?: number, ano?: number, mes?: number, dia?: number): Promise<Aula[]>{
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
				where += " eo.inicio_ocorrencia >= ? and eo.inicio_ocorrencia < ?";
				parametros.push(inicio,fim);
			}

			lista = await sql.query(`select e.id_aula, e.nome_aula, e.desc_aula, date_format(e.inicio_aula, '%d/%m/%Y') inicio_aula, date_format(e.termino_aula, '%d/%m/%Y') termino_aula, date_format(eo.inicio_ocorrencia, '%d/%m/%Y') inicio_ocorrencia, e.carga_horaria, ep.id_prof, p.nome_prof, et.id_turma, t.desc_turma, es.id_sala, s.desc_sala from aula e 
			inner join aula_prof ep on ep.id_aula = e.id_aula
			inner join aula_turma et on et.id_aula = e.id_aula
			inner join aula_sala es on es.id_aula = e.id_aula
			inner join professor p on p.id_prof = ep.id_prof
			inner join turma t on t.id_turma = et.id_turma
			inner join sala s on s.id_sala = es.id_sala
			inner join aula_ocorrencia eo on eo.id_aula = e.id_aula ` +
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

				await sql.query("insert into aula (nome_aula, desc_aula, inicio_aula, termino_aula, carga_horaria) values (?,?,?,?,?)",[aula.nome_aula, aula.desc_aula, aula.inicio_aula, aula.termino_aula, aula.carga_horaria]);
				const id_aula = await sql.scalar("select last_insert_id()") as number;
				await sql.query(" insert into aula_prof(id_prof, id_aula) values (?, ?)", [aula.id_prof, id_aula]);
				await sql.query(" insert into aula_turma(id_turma, id_aula) values (?, ?)", [aula.id_turma, id_aula]);
				await sql.query(" insert into aula_sala(id_sala, id_aula) values (?, ?)", [aula.id_sala, id_aula]);

				for (let i = 0; i < aula.ocorrencias.length; i++)
					await sql.query("insert into aula_ocorrencia (id_aula, inicio_ocorrencia) values (?, ?)", [id_aula, aula.ocorrencias[i]]);

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
			let lista = await sql.query("select e.id_aula, e.nome_aula, e.desc_aula, date_format(e.inicio_aula, '%Y-%m-%d') inicio_aula, date_format(e.termino_aula, '%Y-%m-%d') termino_aula, e.carga_horaria, ep.id_prof, et.id_turma, es.id_sala from aula e inner join aula_prof ep on ep.id_aula = e.id_aula inner join aula_turma et on et.id_aula = e.id_aula inner join aula_sala es on es.id_aula = e.id_aula where e.id_aula = ?",[id_aula]);
         
            if(lista && lista.length){
                aula = lista[0];

				let ocorrencias = await sql.query("select date_format(inicio_ocorrencia, '%Y-%m-%d') inicio_ocorrencia from aula_ocorrencia where id_aula = ?",[id_aula]);
				aula.ocorrencias = new Array(ocorrencias.length);
				for (let i = ocorrencias.length - 1; i >= 0; i--)
					aula.ocorrencias[i] = ocorrencias[i].inicio_ocorrencia;
				aula.ocorrencias.sort();
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

			await sql.query("update aula set nome_aula = ?, desc_aula = ?, inicio_aula = ?,  termino_aula = ?, carga_horaria = ? where id_aula = ?",[aula.nome_aula, aula.desc_aula, aula.inicio_aula, aula.termino_aula, aula.carga_horaria, aula.id_aula]);
            if(!sql.linhasAfetadas){
				erro = 'Aula não encontrada';
				return;
            }

			await sql.query(" update aula_prof set id_prof = ? where id_aula = ?", [aula.id_prof, aula.id_aula]);
			await sql.query(" update aula_turma set id_turma = ? where id_aula = ?", [aula.id_turma, aula.id_aula]);
			await sql.query(" update aula_sala set id_sala = ? where id_aula = ?", [aula.id_sala, aula.id_aula]);

			let novasOcorrencias = aula.ocorrencias;
			let ocorrenciasAntigas: { id_ocorrencia: number, inicio_ocorrencia: string }[] = await sql.query("select id_ocorrencia, date_format(inicio_ocorrencia, '%Y-%m-%d') inicio_ocorrencia from aula_ocorrencia where id_aula = ?", [aula.id_aula]);

			for (let i = ocorrenciasAntigas.length - 1; i >= 0; i--) {
				const inicio_ocorrencia = ocorrenciasAntigas[i].inicio_ocorrencia;

				for (let j = novasOcorrencias.length - 1; j >= 0; j--) {
					if (novasOcorrencias[j] === inicio_ocorrencia) {
						ocorrenciasAntigas.splice(i, 1);
						novasOcorrencias.splice(j, 1);
						break;
					}
				}
			}

			for (let i = ocorrenciasAntigas.length - 1; i >= 0; i--)
				await sql.query("delete from aula_ocorrencia where id_ocorrencia = ? and id_aula = ?", [ocorrenciasAntigas[i].id_ocorrencia, aula.id_aula]);

			for (let i = novasOcorrencias.length - 1; i >= 0; i--)
				await sql.query("insert into aula_ocorrencia (id_aula, inicio_ocorrencia) values (?, ?)", [aula.id_aula, novasOcorrencias[i]]);

			await sql.commit();
        });

        return erro;
    }

	public static async excluir(id_aula:number): Promise<string>{
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
			await sql.beginTransaction();
			await sql.query("delete from aula_turma where id_aula=?;",[id_aula]);
			await sql.query("delete from aula_sala where id_aula=?;",[id_aula]);
			await sql.query("delete from aula_prof where id_aula=?;",[id_aula]);
			await sql.query("delete from aula_ocorrencia where id_aula=?;",[id_aula]);

            let lista = await sql.query("delete from aula where id_aula=?;",[id_aula]);

            if(!sql.linhasAfetadas){
                erro = 'Aula não encontrada';
			}
			
			await sql.commit();

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
		const dias_ocorrencias: string[][] = new Array(linhas.length);
		const regexp = /[\/\-\:\s]/g;

		for (let i = 0; i < linhas.length; i++) {
			const registro = linhas[i].split(";");
			if (registro.length !== 9)
				return `Linha ${(i + 2)} não contém 9 campos`;

			for (let c = 0; c < registro.length; c++) {
				registro[c] = registro[c].normalize().trim();
				if (!registro[c])
					return `Linha ${(i + 2)}, coluna ${(c + 1)} em branco`;
			}

			// Nome;Descrição;Carga Horária;Turma;Sala;Professor;Início;Término; Ocorrências
			registro[6] = DataUtil.converterDataISO(registro[6]);
			if (!registro[6])
				return `Coluna 7 (data de início) da linha ${(i + 2)} inválida`;

			let espaco = registro[6].indexOf("T");
			if (espaco > 0)
				registro[6] = registro[6].substr(0, espaco);

			registro[7] = DataUtil.converterDataISO(registro[7]);
			if (!registro[7])
				return `Coluna 8 (data de término) da linha ${(i + 2)} inválida`;

			espaco = registro[7].indexOf("T");
			if (espaco > 0)
				registro[7] = registro[7].substr(0, espaco);

			const carga_horaria = parseInt(registro[2]);
			if (isNaN(carga_horaria) || carga_horaria <= 0)
				return `Coluna 3 (carga horária) da linha ${(i + 2)} inválida`;
			registro[2] = carga_horaria.toString();

			const inicio = parseInt(registro[6].replace(regexp, "")),
				termino = parseInt(registro[7].replace(regexp, ""));
			if (inicio > termino)
				return `Data de início deve ser anterior à data de término na linha ${(i + 2)}`;

			//separando as ocorrencias
			const ano = "/" + registro[6].substr(0, registro[6].indexOf("-"));
			const ocorrencias = registro[8].split(",");
			//inserção de cada ocorrência
			for(let o = 0; o < ocorrencias.length; o++) {
				let ocorrencia = ocorrencias[o].normalize().trim();

				const partes = ocorrencia.split("/");
				if (partes.length < 2 || partes.length > 3)
					return `Data da ocorrência inválida "${ocorrencia}" (linha ${i + 2})`;

				if (partes.length === 2)
					ocorrencia += ano;

				ocorrencias[o] = DataUtil.converterDataISO(ocorrencia);
				if (!ocorrencias[o])
					return `Ocorrência inválida na linha ${(i + 2)}`;

				const ocorrenciaNum = parseInt(ocorrencias[o].replace(regexp, ""));
				if (ocorrenciaNum < inicio)
					return `Data da ocorrência anterior ao início da aula (linha ${i + 2})`;
				if (ocorrenciaNum > termino)
					return `Data da ocorrência posterior ao término da aula (linha ${i + 2})`;
			}

			ocorrencias.sort();
			for (let l = ocorrencias.length - 1; l > 0; l--) {
				if (ocorrencias[l] === ocorrencias[l-1])
					return `Data da ocorrência repetida (linha ${i + 2})`;
			}

			registros[i] = registro;
			dias_ocorrencias[i] = ocorrencias;
		}

		let erro: string = null;
		
		await Sql.conectar(async(sql : Sql) => {
			
			//validações sala, turma e prof existentes
			for (let i = 0; i < registros.length; i++) {
				// Nome;Descrição;Carga Horária;Turma;Sala;Professor;Início;Término; Ocorrências
				let temp = registros[i][3];
				registros[i][3] = await sql.scalar("select id_turma from turma where desc_turma = ?", [temp]);
				if (!registros[i][3]) {
					erro = `Turma "${temp}", da linha ${(i + 2)}, não encontrada`;
					return;
				}
				temp = registros[i][4];
				registros[i][4] = await sql.scalar("select id_sala from sala where desc_sala = ?", [temp]);
				if (!registros[i][4]) {
					erro = `Sala "${temp}", da linha ${(i + 2)}, não encontrada`;
					return;
				}
				temp = registros[i][5];
				registros[i][5] = await sql.scalar("select id_prof from professor where nome_prof = ?", [temp]);
				if (!registros[i][5]) {
					erro = `Professor "${temp}", da linha ${(i + 2)}, não encontrado`;
					return;
				}
			}
		
				await sql.beginTransaction();
			
				for (let i = 0; i < registros.length; i++) {
					// Nome;Descrição;Carga Horária;Turma;Sala;Professor;Início;Término; Ocorrências
					try{
						await sql.query("insert into aula (nome_aula, desc_aula, inicio_aula, termino_aula, carga_horaria) values (?,?,?,?,?)",[registros[i][0], registros[i][1], registros[i][6], registros[i][7], registros[i][2]]);
						const id_aula = await sql.scalar("select last_insert_id()") as number;
						await sql.query(" insert into aula_turma(id_turma, id_aula) values (?, ?)", [registros[i][3], id_aula]);
						await sql.query(" insert into aula_sala(id_sala, id_aula) values (?, ?)", [registros[i][4], id_aula]);
						await sql.query(" insert into aula_prof(id_prof, id_aula) values (?, ?)", [registros[i][5], id_aula]);

						for (let o = 0; o < dias_ocorrencias[i].length; o++)
							await sql.query("insert into aula_ocorrencia (id_aula, inicio_ocorrencia) values (?, ?)", [id_aula, dias_ocorrencias[i][o]]);
							
						await sql.commit();
					} catch (e) {
						if (e.code && e.code === "ER_DUP_ENTRY")
							erro = `A aula ${registros[i][0]} já existe`; 
						else
							throw e;
					}
				}

		}) // fim sql conectar

		return erro;
	}
}
