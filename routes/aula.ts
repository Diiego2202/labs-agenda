import express = require("express");
import wrap = require("express-async-error-wrapper");
import multer = require("multer");
import Aula = require("../models/aula");
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
		res.render("aula/alterar", {
			titulo: "Criar Aula",
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
		let id = parseInt(req.query["id_aula"] as string);
		let item: Aula = null;
		if (isNaN(id) || !(item = await Aula.obter(id)))
			res.render("home/nao-encontrado", { usuario: u });
		else
			res.render("aula/alterar", {
				titulo: "Editar Aula",
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
		const hoje = new Date(),
			anoAtual = hoje.getFullYear(),
			mesAtual = hoje.getMonth() + 1;
		res.render("aula/listar", {
			titulo: "Gerenciar Aulas",
			usuario: u,
			anoAtual: anoAtual,
			mesAtual: mesAtual,
			lista: JSON.stringify(await Aula.listar(0, 0, anoAtual, mesAtual)),
			turmas: await Turma.listar(),
			salas: await Sala.listar()
		});
	}
		
		
}));
router.all("/upload", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else{

		res.render("aula/upload", {
			titulo: "Upload de Aulas",
			usuario: u
		});
		
	}

}));
router.all("/download", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/acesso");
	else{
		const hoje = new Date(),
		anoAtual = hoje.getFullYear();
		
		res.render("aula/download", {
			layout: "layout-vazio",
			titulo: "Plano de Aulas",
			usuario: u,
			anoAtual: anoAtual,
			lista: await Aula.listar(0, 0, anoAtual),
			turmas: await Turma.listar()
		});	
	}
}));

router.post('/importar', multer().single("arquivoCSV"), wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;

	const erro = await Aula.importar(req["file"]);
	if (erro){
		res.status(400).json(erro);
	}else
		res.json(true);
}));

export = router;
