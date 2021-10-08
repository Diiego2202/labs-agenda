import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Aluno = require("../../models/aluno");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Aluno;
	jsonRes(res, 400, p ? await Aluno.criar(p) : "Dados inválidos");
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Aluno.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id_aluno"] as string);
	res.json(isNaN(id) ? null : await Aluno.obter(id));
}));


router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Aluno;
	if (p)
		p.id_aluno = parseInt(req.body.id_aluno);
	jsonRes(res, 400, (p && !isNaN(p.id_aluno)) ? await Aluno.alterar(p) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id_aluno"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Aluno.excluir(id));
}));




export = router;
