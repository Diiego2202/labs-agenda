import express = require("express");
import wrap = require("express-async-error-wrapper");
import Calendario = require("../models/calendario");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");
import Turma = require("../models/turma");
import { SIGTERM } from "constants";

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

router.get("/obter", wrap(async (req: express.Request, res: express.Response) => {
	let ano = parseInt(req.query["ano"] as string);
	let email = req.query["email"] as string;
	let ra = parseInt(req.query["matricula"] as string);

	if (!ano || (!email && !ra)) {
		res.render("shared/erro", { layout: "layout-externo", mensagem: "Por favor, forneça o ano e ou o e-mail ou a matrícula do aluno" });
	} else {
		let id_turma = await Calendario.obterTurma(ra, email);

		if (!id_turma)
			res.render("shared/erro", { layout: "layout-externo", mensagem: "Não foi possível encontrar a turma do aluno com os dados fornecidos" });
		else
			res.redirect(appsettings.root + "/calendario/" + ano + "/" + id_turma);
	}
}));

export = router;
