import express = require("express");
import wrap = require("express-async-error-wrapper");
import DataUtil = require("../utils/dataUtil");
import Aula = require("../models/aula");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");
import Turma = require("../models/turma");
import Professor = require("../models/professor");
import Sala = require("../models/sala");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/login");
	} else {
		let lista = await Aula.listar();

		let opcoes = {
			titulo: "Dashboard",
			usuario: u,
			lista: lista,
			hoje: DataUtil.hojeISO(),
			turmas: await Turma.listar(),
			prof: await Professor.listar(),
			sala: await Sala.listar()
		};

		res.render("home/dashboard", opcoes);
	}
}));

router.all("/login", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		const token = req.query["token"] as string;

		if (token) {
			const [mensagem, u] = await Usuario.efetuarLogin(token, res);
			if (mensagem)
				res.render("home/login", { layout: "layout-externo", mensagem: mensagem, ssoRedir: appsettings.ssoRedir });
			else
				res.redirect(appsettings.root + "/");
		} else {
			res.render("home/login", { layout: "layout-externo", mensagem: null, ssoRedir: appsettings.ssoRedir });
		}
	} else {
		res.redirect(appsettings.root + "/");
	}
}));

router.get("/acesso", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/login");
	else
		res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
}));

router.get("/perfil", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/");
	else
		res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
}));

router.get("/logout", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (u)
		await u.efetuarLogout(res);
	res.redirect(appsettings.root + "/");
}));

export = router;
