import { createServer } from 'http';
import { readFile, readFileSync } from 'fs';
import * as qs from 'querystring';
import { send } from 'process';

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
                        matricules += readMatricules(post.matricula);
                        break;
                    case 'update':
                        break;
                    case 'delete':
                        break;
                    default:
                        break;
                }
            });
            request.on('end', function (){
                request.end(matricules);
            })
        }
        let filename = "." + url.pathname;
		if (filename == "./") filename += "index.html";
        readFile(filename, function(err, dades) {
			response.end(dades);
        });
}

function readMatricules(matricula){
    let matricules = readFileSync('data/matricules.json');
    let dades = JSON.parse(matricules);
    if (matricula == 'all') {
        return dades.matricules;
    } else {
        dades.matricules.forEach(element => {
           if (element.id === matricula) return element;
        });
        // Si la iteració acaba del tot sense retornar cap element, vol dir que la matrícula que es busca no existeix.
        throw new Error("No s'ha trobat cap matrícula");
    }
}

function updateMatricula(){

}

function deleteMatricula(){

}

const server = createServer();
server.on('request', onRequest);

server.listen(8080);	
console.log("Servidor escoltant en http://localhost:8080");
