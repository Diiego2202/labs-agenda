import express = require("express");
import wrap = require("express-async-error-wrapper");
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("turma/alterar", { titulo: "Criar Turma", usuario: u, item: null });
}));


router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id_turma"] as string);
		let item: Turma = null;
		if (isNaN(id) || !(item = await Turma.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("turma/alterar", {
				titulo: "Editar Turma",
				usuario: u,
				item: item
			});
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("turma/listar", { titulo: "Gerenciar Turmas", usuario: u, lista: JSON.stringify(await Turma.listar()) });
}));


export = router;
