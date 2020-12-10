export = class JSONResponse {
	public sucesso: boolean;
	public statusCode: number;
	public resultado: any;
	public erro: string;

	public constructor(sucesso: boolean, statusCode: number, resultado: any, erro: string) {
		this.sucesso = sucesso;
		this.statusCode = statusCode;
		this.resultado = resultado;
		this.erro = erro;
	}
}
