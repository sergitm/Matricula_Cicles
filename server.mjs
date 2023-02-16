import { createServer } from 'http';
import * as fs from 'fs';
import * as qs from 'querystring';
import { ifError } from 'assert';

function onRequest(request, response){
    // 'url' de la petició
		const base = 'http://' + request.headers.host + '/';
		const url = new URL(request.url, base);

        if (request.method == 'POST') {
            let matricules = '';
            request.on('data', function (data){
                let post = JSON.parse(data);
                switch (post.accio) {
                    case 'create':
                        break;
                    case 'read':
                        try{    
                            matricules = readMatricules(post.matricula);
                            response.setHeader("Content-Type", "application/json");
                            response.writeHead(200);
                            response.end(JSON.stringify(matricules));
                        } catch (e){
                            console.log(e);
                        }
                        break;
                    case 'update':
                        break;
                    case 'delete':
                        let matricula = post.matricula;
                        try{
                            let a = deleteMatricula(matricula);
                            response.setHeader("Content-Type", "text/plain");
                            response.writeHead(200);
                            console.log(a);
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
            request.on('end', function (){
            })
        } else {

            let filename = "." + url.pathname;
            if (filename == "./") filename += "index.html";
            fs.readFile(filename, function(err, dades) {
                response.end(dades);
            });
        }
}

// Llegim les matricules i comprovem si les hem de retornar totes o només una
function readMatricules(matricula){
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
            throw new Error("No s'ha trobat cap matrícula");
        }
    }
}

function updateMatricula(){

}

// Eliminem una matrícula
function deleteMatricula(id){
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
function writeJSON(dades){
    fs.writeFile('data/matricules.json', JSON.stringify(dades), function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

// Llegim el fitxer amb les matricules i les retornem
function readJSON(){
    let matricules = fs.readFileSync('data/matricules.json');
    let dades = JSON.parse(matricules);
    return dades;
}

const server = createServer();
server.on('request', onRequest);

server.listen(8080);	
console.log("Servidor escoltant en http://localhost:8080");
