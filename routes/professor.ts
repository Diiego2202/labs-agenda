import express = require("express");
import wrap = require("express-async-error-wrapper");
import Professor = require("../models/professor");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("professor/alterar", { titulo: "Cadastrar Professor", usuario: u, item: null });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id_prof"] as string);
		let item: Professor = null;
		if (isNaN(id) || !(item = await Professor.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("professor/alterar", {
				titulo: "Editar Professor",
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
		res.render("professor/listar", { titulo: "Gerenciar Professores", usuario: u, lista: JSON.stringify(await Professor.listar()) });
}));


export = router;
