import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");

export = class Evento {
	public id_evento: number;
	public nome_evento: string;
	public desc_evento: string;
	public inicio_evento: string;
	public termino_evento: string;

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
		// if(!evento){
		// 	return "Dados inválidos";
		// }
		// if(!evento.nome_evento || evento.nome_evento.length>50){
		// 	return "Nome inválido";
		// }
		// if(!evento.desc_evento || evento.desc_evento.length>50){
		// 	return "Descrição Inválida";
		// }
		// if(!evento.inicio_evento ){
		// 	//validação de data será aqui?
		// 	return "Data de Início inválida"
		// }
		// if(!evento.termino_evento ){
		// 	//validação de data será aqui?
		// 	return "Data de Término inválida"
		// }
		
		return null;
	}

	public static async listar(): Promise<Evento[]>{
        let lista: Evento[] = null;
        await Sql.conectar(async (sql) =>{
            lista = await sql.query("select id_evento, nome_evento, desc_evento, inicio_evento, termino_evento from evento");
        });
        return lista;
	}

	public static async criar(evento: Evento): Promise<string>{

		let res: string;
		if ((res = Evento.validar(evento)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				console.log(typeof evento.inicio_evento);
				console.log(evento.inicio_evento);
				await sql.query("insert into evento (nome_evento, desc_evento, inicio_evento, termino_evento) values (?,'descricao',?,'2020-11-02T17:00')",[evento.nome_evento, evento.desc_evento, evento.inicio_evento, evento.termino_evento]);
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
            let lista = await sql.query("select id_evento, nome_evento, desc_evento, inicio_evento, termino_evento from evento where id_evento = ?",[evento.id_evento]);
         
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
            let lista = await sql.query("update evento set nome_evento = ?, desc_evento = ?, inicio_evento = ?,  termino_evento = ? where id_evento = ?",[evento.nome_evento, evento.id_evento]);
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
}
