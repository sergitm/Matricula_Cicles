"use strict";

function setRequest(){
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080", true);
    request.setRequestHeader("Content-Type", "application/json");

    return request;
}

function getMatricules(){
    let params = JSON.stringify({accio:"read", matricula:'all'});
    let request = setRequest();

    try {
        request.send(params);
    } catch(error){
        console.log(error);
    }

    request.onload = function() {
        if (request.status != 200) {
            alert(`Error ${request.status}: ${request.statusText}`);
        } else {
            let response = JSON.parse(request.responseText);
            printMatricules(response);
        }
    }
}

function printMatricules(matricules){
    $('#taulaMatricules').empty();
    $('#taulaMatricules').append(`
        <thead>
            <tr>
                <th>Id. Matrícula</th>
                <th>NIF</th>
                <th>Cognoms, Nom</th>
                <th>Data Naixement</th>
                <th>Curs matriculat</th>
                <th>Preu de la matrícula</th>
                <th>Pagat</th>
                <th>Accions</th>
            </tr>
        </thead>
        <tbody></tbody>`);
    
    matricules.forEach(matricula => {
        let pagat = (matricula.pagat) ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';

        $('tbody').append(`
        <tr>
            <td>${matricula.id}</td>
            <td>${matricula.nif}</td>
            <td>${matricula.cognom1} ${matricula.cognom2}, ${matricula.nom}</td>
            <td>${matricula.data_naixament}</td>
            <td>${matricula.curs}</td>
            <td>${matricula.preu}</td>
            <td>${pagat}</td>
            <td>
                <button class="btn btn-dark" onclick="editarMatricula('${matricula.id}')"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>
                <button class="btn btn-dark" onclick="eliminarMatricula('${matricula.id}')"><i class="fa fa-trash" aria-hidden="true"></i></button>
            </td>
        </tr>`);
    });
}

function editarMatricula(id){
    console.log(id);
}

function eliminarMatricula(id){
    var confirm = window.confirm(`Estàs segur que vols eliminar l'alumne: ${id}?`);
    if (confirm) {
        
        let params = JSON.stringify({accio:"delete", matricula: `${id}`});
        let request = setRequest();
        
        try {
            request.send(params);
        } catch(error){
            console.log(error);
        }
        
        request.onload = function() {
            if (request.status != 200) {
                alert(`Error ${request.status}: ${request.statusText}`);
            } else {
                let response = request.responseText;
                alert(response);
                getMatricules();
            }
        }
    }
}

setInterval(() => {getMatricules()}, "15000");