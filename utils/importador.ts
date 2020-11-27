import Sql = require('../infra/sql');
import Evento = require('../models/evento');
const fs = require('fs');
const fastCSV = require('fast-csv');

let arquivo = fs.createReadStream('../uploads/Eventos.csv');

let arquivoCSV = [];


let importador = fastCSV.parse()
    .on('data', function(data) {
        arquivoCSV.push(data);
    })
    .on('end', function() {
        arquivoCSV.shift();

        Sql.conectar(async(sql : Sql) => {
            await sql.beginTransaction();

            /*try {
                Evento.importar();
            }*/
        });
    })

