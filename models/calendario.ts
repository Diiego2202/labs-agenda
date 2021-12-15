import Sql = require("../infra/sql");
export = class Calendario {

  id_calendario: number;
  id_turma: number;
  url_calendario: string;

  public static async listar(): Promise<Calendario[]>{
    let lista: Calendario[] = null;
    await Sql.conectar(async (sql) =>{
        lista = await sql.query("select c.id_calendario, c.id_turma, c.url_calendario, t.desc_turma from calendario c inner join turma t on t.id_turma = c.id_turma");
    });
    return lista;
}
  public static async listarDeTurma(id_turma?: number): Promise<Calendario[]>{
    let lista: Calendario[] = null;
    await Sql.conectar(async (sql) =>{
        lista = await sql.query("select id_calendario, id_turma, url_calendario from calendario where id_turma = ?"[id_turma]);
    });
    return lista;
}

public static async criar(calendario: Calendario): Promise<string>{
    let erro: string = Calendario.validar(calendario);

    if(erro){
        return erro;
    }

    await Sql.conectar(async(sql)=>{
        let lista = await sql.query("insert into calendario (id_turma, url_calendario) values (?, ?)",[calendario.id_turma, calendario.url_calendario]);
    });

    return erro;
} 

public static  validar(calendario: Calendario): string{
		if(!calendario){
			return "Dados inválidos";
	
		}
		if(!calendario.url_calendario || calendario.url_calendario.length>200){
			return "E-mail inválido inválido";
		}
		if(!(calendario.id_turma = parseInt(calendario.id_turma as any))){
			return "RA inválido";
		}
		return null;
  }
  
  public static async obter(id_calendario:number): Promise<Calendario>{
    let calendario: Calendario = null;

    await Sql.conectar(async(sql)=>{
        let lista = await sql.query("select  id_calendario, id_turma, url_calendario from calendario where id_calendario=?",[id_calendario]);
     
        if(lista && lista.length){
            calendario = lista[0];
        }
    });

    return calendario;

  }
  public static async obterTurma(ra:string): Promise<Calendario>{
    let calendario: Calendario = null;

      await Sql.conectar(async (sql) => {
        let aluno = await sql.query("select  id_turma from aluno where Ra_aluno=?",[ra])
        let lista = await sql.query("select  id_calendario, id_turma, url_calendario from calendario where id_turma=?",[aluno]);
     
        if(lista && lista.length){
            calendario = lista[0];
        }
    });

    return calendario;

  }
  public static async alterar(calendario: Calendario): Promise<string>{
    let erro: string = Calendario.validar(calendario);

    if(erro){
        return erro;
    }

    await Sql.conectar(async(sql)=>{
        await sql.query("update calendario set url_calendario = ?, id_turma = ?  where id_calendario = ?",[calendario.url_calendario, calendario.id_turma, calendario.id_calendario]);

        if(!sql.linhasAfetadas){
            erro = 'Calendário não encontrado';
        }
    });

    return erro;
}

public static async excluir(id_calendario:number): Promise<string>{
   
    let erro: string = null;

    await Sql.conectar(async(sql)=>{
        await sql.query("delete from calendario where id_calendario=?;",[id_calendario]);
        if(!sql.linhasAfetadas){
            erro = 'Calendario não encontrado';
        }
    });

    return erro;

}
}
