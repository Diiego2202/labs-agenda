import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Aula = require("../../models/aula");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Aula.listar(
		parseInt(req.query["id_turma"] as string),
		parseInt(req.query["id_sala"] as string),
		parseInt(req.query["ano"] as string),
		parseInt(req.query["mes"] as string)
	));
}));

router.get("/listarOcorrencias", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Aula.listarOcorrencias(
		parseInt(req.query["id_turma"] as string),
		parseInt(req.query["id_sala"] as string),
		parseInt(req.query["ano"] as string),
		parseInt(req.query["mes"] as string)
	));
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id_aula = parseInt(req.query["id_aula"] as string);
	res.json(isNaN(id_aula) ? null : await Aula.obter(id_aula));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Aula;
	jsonRes(res, 400, p ? await Aula.criar(p) : "Dados inválidos");
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let e = req.body as Aula;
	if (e)
		e.id_aula = parseInt(req.body.id_aula);
	jsonRes(res, 400, (e && !isNaN(e.id_aula)) ? await Aula.alterar(e) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id_aula = parseInt(req.query["id_aula"] as string);
	jsonRes(res, 400, isNaN(id_aula) ? "Dados inválidos" : await Aula.excluir(id_aula));
}));


export = router;
