import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Turma = require("../../models/turma");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let t = req.body as Turma;
	jsonRes(res, 400, t ? await Turma.criar(t) : "Dados inválidos");
}));


export = router;