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

export = router;
