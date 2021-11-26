import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Calendario = require("../../models/calendario");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	
	let p = req.body as Calendario;
	jsonRes(res, 400, p ? await Calendario.criar(p) : "Dados inválidos");
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	res.json(await Calendario.listar());
}));

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res);
	if (!u)
		return;
	let id = parseInt(req.query["id_calendario"] as string);
	res.json(isNaN(id) ? null : await Calendario.obter(id));
}));


router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let p = req.body as Calendario;
	if (p)
		p.id_calendario = parseInt(req.body.id_calendario);
	jsonRes(res, 400, (p && !isNaN(p.id_calendario)) ? await Calendario.alterar(p) : "Dados inválidos");
}));

router.get("/excluir", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let id = parseInt(req.query["id_calendario"] as string);
	jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Calendario.excluir(id));
}));




export = router;
