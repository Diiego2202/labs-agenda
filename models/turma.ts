import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");

export = class Turma {
	public id_turma: number;
	public desc_turma: string;
	
	public static  validar(turma: Turma): string{
		// if(!turma){
		// 	return "Dados inválidos";
		// }
		// if(!turma.desc_turma || turma.desc_turma.length>45){
		// 	return "Descrição inválida";
		// }
		
		
		 return null;
	}

	public static async listar(): Promise<Turma[]>{
        let lista: Turma[] = null;
        await Sql.conectar(async (sql) =>{
            lista = await sql.query("select id_turma, desc_turma from turma");
        });
        return lista;
	}

	public static async criar(turma: Turma): Promise<string>{
        let erro: string = Turma.validar(turma);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("insert into turma (desc_turma) values (?)",[turma.desc_turma]);
        });

        return erro;
    } 

	public static async obter(id_turma:number): Promise<Turma>{
        let turma: Turma = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("select id_turma, desc_turma from turma where id_turma = ?",[id_turma]);
         
            if(lista && lista.length){
                turma = lista[0];
            }
        });

        return turma;

    }

	public static async alterar(turma: Turma): Promise<string>{
        let erro: string = Turma.validar(turma);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("update turma set desc_turma = ? where id_turma = ?",[turma.desc_turma, turma.id_turma]);
        });

        return erro;
    }

	public static async excluir(id_turma:number): Promise<string>{
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("delete from turma where id_turma=?;",[id_turma]);
         
            if(!sql.linhasAfetadas){
                erro = 'Turma não encontrada';
            }
        });
        return erro;

    }
}
