﻿import express = require("express");
import wrap = require("express-async-error-wrapper");
import DataUtil = require("../utils/dataUtil");
import Aula = require("../models/aula");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");
import Turma = require("../models/turma");
import Sala = require("../models/sala");
import Calendario = require("../models/calendario");
import Aluno = require("../models/aluno");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/login");
	} else {
		const hoje = new Date(),
			anoAtual = hoje.getFullYear(),
			mesAtual = hoje.getMonth() + 1,
			lista = await Aula.listarOcorrencias(0, 0, anoAtual, mesAtual);

		let opcoes = {
			titulo: "Dashboard",
			usuario: u,
			anoAtual: anoAtual,
			mesAtual: mesAtual,
			lista: lista,
			hoje: DataUtil.hojeISO(),
			turmas: await Turma.listar(),
			salas: await Sala.listar()
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

router.all("/loginAluno", wrap(async (req: express.Request, res: express.Response) => {
	res.render("home/login-aluno", { titulo: "Login de Aluno",layout: "layout-externo", anoAtual: (new Date()).getFullYear() })
}));


router.all("/calendario/:ano/:id_turma", wrap(async (req: express.Request, res: express.Response) => {
	const hoje = new Date(),
	anoAtual = parseInt(req.params["ano"]) || hoje.getFullYear(),
	id_turma = parseInt(req.params["id_turma"]);

	res.render("aula/download", {
		layout: "layout-vazio",
		titulo: "Plano de Aulas",
		anoAtual: anoAtual,
		id_turma: id_turma,
		lista: await Aula.listarOcorrencias(id_turma, 0, anoAtual),
		turmas: await Turma.listar()
	});	
}));

export = router;
