import { createServer } from 'http';
import * as fs from 'fs';
import IncomingForm from 'formidable';
import { extname } from 'path';

function onRequest(request, response) {
    // 'url' de la petició
    const base = 'http://' + request.headers.host + '/';
    const url = new URL(request.url, base);

    const rhct = request.headers['content-type'];

    // Gestionem una petició que vingui d'un formulari
    if (rhct && rhct.includes("multipart/form-data")) {
        const form = IncomingForm();
        form.parse(request, function (err, fields, files) {
            let matricula;
            let index;
            let matricula_original;
            // Si les dades venen d'un formulari de MODIFICAR tindrán un camp 
            // amb la id original per comparar les dades originals amb les noves
            if (fields.id_original != undefined) {
                matricula_original = readMatricules(fields.id_original);
                matricula = {
                    id: fields.id ?? matricula_original.id,
                    nif: fields.nif ?? matricula_original.nif,
                    cognom1: fields.cognom1 ?? matricula_original.cognom1,
                    cognom2: fields.cognom2 ?? matricula_original.cognom2,
                    nom: fields.nom ?? matricula_original.nom,
                    data_naixament: fields.data_naixament ?? matricula_original.data_naixament,
                    curs: fields.curs ?? matricula_original.curs,
                    preu: fields.preu ?? matricula_original.preu,
                    pagat: (fields.pagat) ? true : false,
                    foto_alumne: matricula_original.foto_alumne
                };
            // Si no tenen el camp amb la id original, es perque es una nova matrícula
            } else {
                matricula = {
                    id: fields.id,
                    nif: fields.nif,
                    cognom1: fields.cognom1,
                    cognom2: fields.cognom2,
                    nom: fields.nom,
                    data_naixament: fields.data_naixament,
                    curs: fields.curs,
                    preu: fields.preu,
                    pagat: (fields.pagat) ? true : false,
                    foto_alumne: ""
                };
            }
            // Si hi ha un fitxer canviem la propietat a la nova imatge
            if (files.upload_img.originalFilename != '') {

                const extensio = extname(files.upload_img.originalFilename).replace(/\./g, '');
                const nom_foto = `${fields.id}.${extensio}`;
                const temporal = files.upload_img.filepath;
                const img_dir = 'img/' + nom_foto;

                fs.copyFileSync(temporal, img_dir);
                fs.unlinkSync(temporal);

                matricula.foto_alumne = img_dir;
            }

            let matricules_arr = readMatricules('all');
            // finalment, si la intenció es modificar, busquem la matrícula i la modifiquem
            if (fields.id_original != undefined) {
                index = matricules_arr.findIndex(function(item){
                    return item.id === matricula_original.id;
                });
                matricules_arr.splice(index, 1, matricula);
            // Si no, simplement l'afegim
            } else {
                matricules_arr.push(matricula);
            }

            let fitxer_complet = {
                matricules: matricules_arr
            };

            // Escrivim el fitxer per guardar les dades
            try {
                writeJSON(fitxer_complet);
                response.setHeader("Content-Type", "text/plain");
                response.writeHead(200);
                response.end("Operació completada satisfactòriament.");
            } catch (error) {
                response.setHeader("Content-Type", "text/plain");
                response.writeHead(400);
                response.end(error.toString());
            }
        });
    // Si les dades no venen d'un formulari, les gestionem d'un altre forma
    } else {
        // Si la petició es post:
        if (request.method == 'POST') {
            let matricules = '';
            request.on('data', function (data) {
                let post = JSON.parse(data);
                // Comprovarem quina és la intenció de la petició
                switch (post.accio) {
                    case 'read':
                        try {
                            matricules = readMatricules(post.matricula);
                            response.setHeader("Content-Type", "application/json");
                            response.writeHead(200);
                            response.end(JSON.stringify(matricules));
                        } catch (e) {
                            console.log(e);
                        }
                        break;
                    case 'delete':
                        let matricula = post.matricula;
                        try {
                            let a = deleteMatricula(matricula);
                            response.setHeader("Content-Type", "text/plain");
                            response.writeHead(200);
                            response.end(a);
                        } catch (error) {
                            console.log(error);
                            response.setHeader("Content-Type", "text/plain");
                            response.writeHead(400);
                            response.end(error.toString());
                        }
                        break;
                    default:
                        break;
                }
            });
            request.on('end', function () {
            });
        // Si la petició no és POST, retornem el fitxer index.html
        } else {

            let filename = "." + url.pathname;
            if (filename == "./") filename += "index.html";
            fs.readFile(filename, function (err, dades) {
                response.end(dades);
            });
        }
    }
}

// Llegim les matricules i comprovem si les hem de retornar totes o només una
function readMatricules(matricula) {
    let dades = readJSON();
    if (matricula === 'all') {
        return dades.matricules;
    } else {
        let alumne;
        dades.matricules.forEach(element => {
            if (element.id === matricula) alumne = element;
        });
        // Si alumne es undefined després de la iteració, vol dir que l'alumne no existeix.
        if (alumne != undefined) {
            return alumne;
        } else {
            return false;
        }
    }
}

// Eliminem una matrícula
function deleteMatricula(id) {
    let dades = readJSON();
    let msg;
    dades.matricules.forEach(matricula => {
        if (id === matricula.id) {
            let index = dades.matricules.indexOf(matricula);
            dades.matricules.splice(index, 1);
            try {
                writeJSON(dades);
                msg = `S'ha eliminat l'alumne ${id} satisfactòriament.`
            } catch (error) {
                msg = `Hi ha hagut un error amb l'eliminació de l'alumne: ${error}`;
            }
        };
    });
    if (msg != undefined) {
        return msg;
    } else {
        throw new Error("No s'ha trobat cap matrícula");
    }
}

// Funció per sobreescriure el fitxer JSON quan toqui
function writeJSON(dades) {
    fs.writeFile('data/matricules.json', JSON.stringify(dades), function (err) {
        if (err) {
            console.log(err);
        }
    });
}

// Llegim el fitxer amb les matricules i les retornem
function readJSON() {
    let matricules = fs.readFileSync('data/matricules.json');
    let dades = JSON.parse(matricules);
    return dades;
}


// Server data
const server = createServer();
server.on('request', onRequest);

server.listen(8080);
console.log("Servidor escoltant en http://localhost:8080");
