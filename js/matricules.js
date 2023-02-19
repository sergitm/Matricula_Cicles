"use strict";

let matricules_array = [];

// Funció per crear una request genèrica
function setRequest(){
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080", true);
    request.setRequestHeader("Content-Type", "application/json");

    return request;
}

// Funció per llegir les totes les matrícules i que fa la crida a printMatricules()
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
            matricules_array = response;
            printMatricules(response);
        }
    }
}

// Funció que pobla la taula utilitzant les dades de les matrícules
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
        let data_naix = new Date(matricula.data_naixament);
        let dia = data_naix.getDate().toString().padStart(2, '0');
        let mes = (data_naix.getMonth() + 1).toString().padStart(2, '0');
        let any = data_naix.getFullYear();

        $('tbody').append(`
        <tr>
            <td>${matricula.id}</td>
            <td>${matricula.nif}</td>
            <td>${matricula.cognom1} ${matricula.cognom2}, ${matricula.nom}</td>
            <td>${dia}-${mes}-${any}</td>
            <td>${matricula.curs}</td>
            <td>${matricula.preu}</td>
            <td>${pagat}</td>
            <td>
                <button class="btn btn-dark" onclick="editarMatricula('${matricula.id}')">
                    <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                </button>
                <button class="btn btn-dark" onclick="eliminarMatricula('${matricula.id}')">
                    <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
            </td>
        </tr>`);
    });
}

// Funció per eliminar una matrícula
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
                location.reload("true");
            }
        }
    }
}

//Funció que s'executa amb el botó Editar a la taula de matrícules, redirigeix al formulari amb un paràmetre GET
function editarMatricula(id){
    window.location.href = `html/updateMatricula.html?id=${id}`;
}

// Funció que gestiona la vista de Matricules / Fotos, amagant el div contrari i canviant l'estil del botó
function changeVista(e){

    let matr = $('#btn_matricules');
    let fotos = $('#btn_fotos');
    let lbl_matr = $('#lbl_matricules');
    let lbl_fotos = $('#lbl_fotos');

    if (e.target.id === 'btn_fotos') {

        matr.attr('checked', false);
        fotos.attr('checked', true);

        lbl_fotos.addClass('active');
        lbl_matr.removeClass('active');

        $('#matricules').attr('hidden', true);
        $('#fotos').attr('hidden', false);

        getFotos();
    } else {

        matr.attr('checked', true);
        fotos.attr('checked', false);

        lbl_matr.addClass('active');
        lbl_fotos.removeClass('active');

        $('#matricules').attr('hidden', false);
        $('#fotos').attr('hidden', true);

        getMatricules();
    }
}

// Funció que pobla el div de fotos
function getFotos(){
    let div = $('#fotos');
    div.empty();
    matricules_array.forEach(matricula => {
        let imatge = (matricula.foto_alumne) ? matricula.foto_alumne : 'img/Blank-Avatar.jpg';

        div.append(`
        <div class="col-2 card m-1" style="width: 18rem;">
            <img src="${imatge}" class="card-img-top" alt="...">
            <div class="card-body">
                <p class="card-text">${matricula.cognom1} ${matricula.cognom2}, ${matricula.nom}</p>
                <button class="btn btn-dark" onclick="editarMatricula('${matricula.id}')">
                    <i class="fas fa-pen-to-square" aria-hidden="true"></i>
                </button>
                <button class="btn btn-dark" onclick="eliminarMatricula('${matricula.id}')">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            </div>
        </div>`);
    });
}

// Interval per refrescar la informació de la taula
setInterval(() => {getMatricules()}, "15000");