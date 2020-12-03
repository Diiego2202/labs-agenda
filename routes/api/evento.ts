import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Evento = require("../../models/evento");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Evento.listar(
		parseInt(req.query["id_turma"] as string),
		parseInt(req.query["id_sala"] as string),
		parseInt(req.query["ano"] as string)
	));
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id_evento = parseInt(req.query["id_evento"] as string);
	res.json(isNaN(id_evento) ? null : await Evento.obter(id_evento));
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Evento;
	jsonRes(res, 400, p ? await Evento.criar(p) : "Dados inválidos");
}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let e = req.body as Evento;
	if (e)
		e.id_evento = parseInt(req.body.id_evento);
	jsonRes(res, 400, (e && !isNaN(e.id_evento)) ? await Evento.alterar(e) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id_evento = parseInt(req.query["id_evento"] as string);
	jsonRes(res, 400, isNaN(id_evento) ? "Dados inválidos" : await Evento.excluir(id_evento));
}));

export = router;
