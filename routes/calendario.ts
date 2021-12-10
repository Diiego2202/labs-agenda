import express = require("express");
import wrap = require("express-async-error-wrapper");
import Calendario = require("../models/calendario");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");
import Turma = require("../models/turma");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("calendario/alterar", { titulo: "Cadastrar Calendario", usuario: u, item: null, turma: await Turma.listar() });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id_calendario"] as string);
		let item: Calendario = null;
		if (isNaN(id) || !(item = await Calendario.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("calendario/alterar", {
				titulo: "Editar Calendario",
				usuario: u,
				item: item,
				turma: await Turma.listar()
			});
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("calendario/listar", { titulo: "Gerenciar Calendarios", usuario: u, lista: JSON.stringify(await Calendario.listar()) });
}));

router.get("/listar/:idturma", wrap(async (req: express.Request, res: express.Response) => {
	let id = parseInt(req.query["id_turma"] as string);
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("calendario/listar", {	layout: "layout-vazio", titulo: "Calendarios", usuario: u, lista: JSON.stringify(await Calendario.listarDeTurma(parseInt(req.params["idturma"]))) });
}));


export = router;
