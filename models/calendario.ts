import Sql = require("../infra/sql");
export = class Calendario {

  id_calendario: number;
  id_turma: number;
  url_calendario: number;

  public static async listar(): Promise<Calendario[]>{
    let lista: Calendario[] = null;
    await Sql.conectar(async (sql) =>{
        lista = await sql.query("select id_calendario, id_turma, url_calendario from calendario");
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
  public static async alterar(calendario: Calendario): Promise<string>{
    let erro: string = Calendario.validar(calendario);

    if(erro){
        return erro;
    }

    await Sql.conectar(async(sql)=>{
        let lista = await sql.query("update calendario set id_turma = ?, url_calendario = ? where id_calendario = ?",[calendario.id_turma,calendario.url_calendario]);
    });

    return erro;
}

public static async excluir(id_calendario:number): Promise<string>{
   
    let erro: string = null;

    await Sql.conectar(async(sql)=>{
  await sql.beginTransaction();
  await sql.query("delete from calendario where id_calendario=?;",[id_calendario]);
  // await sql.query("delete from aula_calendario where id_calendario=?;",[id_calendario]);
  
        let lista = await sql.query("delete from calendario where id_calendario=?;",[id_calendario]);
       
        
        if(lista.length == 0){ // não reconhece o !sql.linhasAfetadas quando é uma transação incompleta, então joga o erro
            erro = 'Calendario não encontrado';
  }
  
        await sql.commit();
  

    });

    return erro;

}
}