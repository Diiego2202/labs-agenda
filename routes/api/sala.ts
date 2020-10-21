import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Sala = require("../../models/sala");
import Usuario = require("../../models/usuario");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req, res, true);
	if (!u)
		return;
	let s = req.body as Sala;
	jsonRes(res, 400, s ? await Sala.criar(s) : "Dados inválidos");
}));



export = router;