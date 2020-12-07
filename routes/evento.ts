import express = require("express");
import wrap = require("express-async-error-wrapper");
import multer = require("multer");
import Evento = require("../models/evento");
import Professor = require("../models/professor");
import Sala = require("../models/sala");
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else
		res.render("evento/alterar", {
			titulo: "Criar Evento",
			usuario: u,
			professores: await Professor.listar(),
			salas: await Sala.listar(),
			turmas: await Turma.listar(),
			item: null
		});
}));

router.all("/alterar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin) {
		res.redirect(appsettings.root + "/acesso");
	} else {
		let id = parseInt(req.query["id_evento"] as string);
		let item: Evento = null;
		if (isNaN(id) || !(item = await Evento.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("evento/alterar", {
				titulo: "Editar Evento",
				usuario: u,
				professores: await Professor.listar(),
				salas: await Sala.listar(),
				turmas: await Turma.listar(),
				item: item
			});
	}
}));

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else{
		const anoAtual = (new Date()).getFullYear();
		res.render("evento/listar", {
			titulo: "Gerenciar Aulas",
			usuario: u,
			anoAtual: anoAtual,
			lista: JSON.stringify(await Evento.listar(0, 0, anoAtual)),
			turmas: await Turma.listar(),
			salas: await Sala.listar()
		});
	}
		
		
}));

router.post('/importar', multer().single("arquivoCSV"), wrap(async (req: express.Request, res: express.Response) => {
	debugger;

	let arquivo = req["file"];

	if (!arquivo) {
		res.status(400).json("CSV faltando");
		return;
	}

	if (!arquivo.buffer || !arquivo.size) {
		res.status(400).json("CSV inválido");
		return;
	}

	if (arquivo.size > (1024 * 1024)) {
		res.status(400).json("CSV muito grande");
		return;
	}

	const buffer = arquivo.buffer as Buffer;
	let csv = buffer.toString("utf-8");
	csv = csv.replace(/\r/g, "");
	let linhas = csv.split("\n");

	debugger;

	await Evento.importar(arquivo);

	res.json(true);
}));

export = router;
