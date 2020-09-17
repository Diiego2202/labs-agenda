import express = require("express");
import wrap = require("express-async-error-wrapper");
import Assunto = require("../models/assunto");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("assunto/alterar", { titulo: "Criar Assunto", usuario: u, item: null });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id"] as string);
		let item: Assunto = null;
		if (isNaN(id) || !(item = await Assunto.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("assunto/alterar", { titulo: "Editar Assunto", usuario: u, item: item });
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("assunto/listar", { titulo: "Gerenciar Assuntos", usuario: u, lista: JSON.stringify(await Assunto.listar()) });
}));

export = router;
