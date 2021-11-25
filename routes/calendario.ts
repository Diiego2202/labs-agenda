import express = require("express");
import wrap = require("express-async-error-wrapper");
import Calendario = require("../models/calendario");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("calendario/alterar", { titulo: "Cadastrar Calendario", usuario: u, item: null });
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
				item: item
			});
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("calendario/listar", { titulo: "Gerenciar Calendarioes", usuario: u, lista: JSON.stringify(await Calendario.listar()) });
}));


export = router;
