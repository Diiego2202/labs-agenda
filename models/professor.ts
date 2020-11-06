import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");

export = class Professor {
	public id_prof: number;
	public nome_prof: string;
	
	public static  validar(professor: Professor): string{
		if(!professor){
			return "Dados inválidos";
		}
		if(!professor.nome_prof || professor.nome_prof.length>45){
			return "Nome inválido";
		}
		
		return null;
	}

	public static async listar(): Promise<Professor[]>{
        let lista: Professor[] = null;
        await Sql.conectar(async (sql) =>{
            lista = await sql.query("select id_prof, nome_prof from professor");
        });
        return lista;
	}

	public static async criar(professor: Professor): Promise<string>{
        let erro: string = Professor.validar(professor);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("insert into professor (nome_prof) values (?)",[professor.nome_prof]);
        });

        return erro;
    } 

	public static async obter(id_prof:number): Promise<Professor>{
        let professor: Professor = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("select id_prof, nome_prof from professor where id_prof=?",[id_prof]);
         
            if(lista && lista.length){
                professor = lista[0];
            }
        });

        return professor;

    }

	public static async alterar(professor: Professor): Promise<string>{
        let erro: string = Professor.validar(professor);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("update professor set nome_prof = ? where id_prof = ?",[professor.nome_prof, professor.id_prof]);
        });

        return erro;
    }

	public static async excluir(id_prof:number): Promise<string>{
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("delete from professor where id_prof=?;",[id_prof]);
         
            if(!sql.linhasAfetadas){
                erro = 'Professor não encontrado';
            }
        });
        return erro;

    }
}
