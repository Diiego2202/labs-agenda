import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Professor = require("../../models/professor");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Professor;
	jsonRes(res, 400, p ? await Professor.criar(p) : "Dados inválidos");
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Professor.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id_prof"] as string);
	res.json(isNaN(id) ? null : await Professor.obter(id));
}));


router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Professor;
	if (p)
		p.id_prof = parseInt(req.body.id_prof);
	jsonRes(res, 400, (p && !isNaN(p.id_prof)) ? await Professor.alterar(p) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id_prof"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Professor.excluir(id));
}));



export = router;
