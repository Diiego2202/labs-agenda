import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Sala = require("../../models/sala");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let s = req.body as Sala;
	jsonRes(res, 400, s ? await Sala.criar(s) : "Dados inválidos");
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Sala.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id_sala"] as string);
	res.json(isNaN(id) ? null : await Sala.obter(id));
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let s = req.body as Sala;
	if (s)
		s.id_sala = parseInt(req.body.id_sala);
	jsonRes(res, 400, (s && !isNaN(s.id_sala)) ? await Sala.alterar(s) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id_sala"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Sala.excluir(id));
}));




export = router;