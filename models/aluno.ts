import Sql = require("../infra/sql");
import DataUtil = require("../utils/dataUtil");

export = class Aluno {
	public id_aluno: number;
	public nome_aluno: string;
	public email_aluno: string;
	public RA_aluno: number;
	public id_turma: number;
	
	public static  validar(aluno: Aluno): string{
		if(!aluno){
			return "Dados inválidos";
		}
		if(!aluno.nome_aluno || aluno.nome_aluno.length>45){
			return "Nome inválido";
		}
		if(!aluno.email_aluno || aluno.email_aluno.length>45){
			return "E-mail inválido inválido";
		}
		if(!aluno.RA_aluno){
			return "RA inválido";
		}
		
		return null;
	}

	public static async listar(): Promise<Aluno[]>{
        let lista: Aluno[] = null;
        await Sql.conectar(async (sql) =>{
            lista = await sql.query("select id_aluno, nome_aluno, email_aluno, RA_aluno from aluno");
        });
        return lista;
	}

	public static async criar(aluno: Aluno): Promise<string>{
        let erro: string = Aluno.validar(aluno);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("insert into aluno (nome_aluno, RA_aluno, email_aluno, id_turma) values (?, ?, ?, ?)",[aluno.nome_aluno, aluno.RA_aluno, aluno.email_aluno, aluno.id_turma]);
        });

        return erro;
    } 

	public static async obter(id_aluno:number): Promise<Aluno>{
        let aluno: Aluno = null;

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("select  id_aluno, nome_aluno, email_aluno, RA_aluno from aluno where id_aluno=?",[id_aluno]);
         
            if(lista && lista.length){
                aluno = lista[0];
            }
        });

        return aluno;

    }

	public static async alterar(aluno: Aluno): Promise<string>{
        let erro: string = Aluno.validar(aluno);

        if(erro){
            return erro;
        }

        await Sql.conectar(async(sql)=>{
            let lista = await sql.query("update aluno set nome_aluno = ?, email_aluno = ?, RA_aluno = ?, id_turma where id_aluno = ?",[aluno.nome_aluno,aluno.email_aluno, aluno.RA_aluno, aluno.id_turma, aluno.id_aluno]);
        });

        return erro;
    }

	public static async excluir(id_aluno:number): Promise<string>{
       
        let erro: string = null;

        await Sql.conectar(async(sql)=>{
			await sql.beginTransaction();
			await sql.query("delete from aluno where id_aluno=?;",[id_aluno]);
			// await sql.query("delete from aula_aluno where id_aluno=?;",[id_aluno]);
			
            let lista = await sql.query("delete from aluno where id_aluno=?;",[id_aluno]);
           
            
            if(lista.length == 0){ // não reconhece o !sql.linhasAfetadas quando é uma transação incompleta, então joga o erro
                erro = 'Aluno não encontrado';
			}
			
            await sql.commit();
			

        });

        return erro;

    }
}
