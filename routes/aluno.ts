import express = require("express");
import wrap = require("express-async-error-wrapper");
import Aluno = require("../models/aluno");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();
router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("aluno/alterar", { titulo: "Cadastrar Aluno", usuario: u, item: null });
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id_aluno"] as string);
		let item: Aluno = null;
		if (isNaN(id) || !(item = await Aluno.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("aluno/alterar", {
				titulo: "Editar Aluno",
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
		res.render("aluno/listar", { titulo: "Gerenciar Alunos", usuario: u, lista: JSON.stringify(await Aluno.listar()) });
}));


export = router;