import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Turma = require("../../models/turma");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let t = req.body as Turma;
	jsonRes(res, 400, t ? await Turma.criar(t) : "Dados inválidos");
}));


router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Turma.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id_turma"] as string);
	res.json(isNaN(id) ? null : await Turma.obter(id));
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let t = req.body as Turma;
	if (t)
		t.id_turma = parseInt(req.body.id);
	jsonRes(res, 400, (t && !isNaN(t.id_turma)) ? await Turma.alterar(t) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id_turma"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Turma.excluir(id));
}));



export = router;