"use strict";

// Funció que demana al servidor les matrícules per comprovar si una ID ja existeix.
function generarId(){
    let nomVal = $('#novaMatricula :input[name="nom"]').val().toLowerCase();
    let cognom1Val = $('#novaMatricula :input[name="cognom1"]').val().toLowerCase();

    let nom = noAccents(nomVal);
    let cognom1 = noAccents(cognom1Val);

    if (nom != '' && cognom1 != '') {
        let idTemp = `${nom.substring(0,1)}.${cognom1}`;

        let params =  JSON.stringify({accio:"read", matricula:`all`});
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
                let newNumber = checkMatricula(response, idTemp); 
                if (newNumber != false){
                    $('#novaMatricula :input[name="id"]').val(`${nom.substring(0,1)}.${cognom1}${newNumber}`)
                } else {
                    $('#novaMatricula :input[name="id"]').val(`${nom.substring(0,1)}.${cognom1}`)
                }
            }
        }
    }
}

// Funció que comprova si una ID ja existeix per afegir-li un número més alt.
function checkMatricula(matricules, idTemp){
    let coincidents = [];
    let higher;
    matricules.forEach(matricula => {
        var id_sense_numeros =  matricula.id.replace(/[^a-z]/g, '');
        var idTemp_sense_numeros = idTemp.replace(/[^a-z]/g, '');
        if (id_sense_numeros === idTemp_sense_numeros) {
            coincidents.push(matricula.id.replace(/[^0-9]/g, ''));
        }
    });
    higher = Math.max(...coincidents);
    let newNumber = parseInt(higher) + 1;

    if (coincidents.length > 0) {
        return newNumber 
    } 
    return false;
}

// Funció que carrega una imatge a l'element <img> per previsualitzar la foto
function carregarImatge(){
    if ($('#formFileSm').get(0).files.length != 0) {

        $('#foto').attr('src', URL.createObjectURL($('#formFileSm').get(0).files[0]));
    } 
}

// Funció que comprova que els camps rellevants no estiguin buits.
function formManager(e){
    e.preventDefault();

    var errors = 0;
    $("#novaMatricula :input").map(function(){
        if ($(this).attr('name') != $('#novaMatricula :input[name="upload_img"]').attr('name') 
            && $(this).attr('name') != $('#novaMatricula :input[name="pagat"]').attr('name')
            && $(this).attr('name') != $('#novaMatricula :input[name="cognom2"]').attr('name')
            && $(this).attr('name') != $('#novaMatricula :input[name="id"]').attr('name')) {
            
                if( !$(this).val() ) {
                     $(this).addClass('is-invalid');
                     errors++;
               } else if ($(this).val()) {
                     $(this).removeClass('is-invalid');
               }   
        }
    });
    if(errors > 0){
        $('#errorwarn').text("Sisplau, emplena els camps ressaltats.");
    } else {
        enviarFormulari(e);
    }
}

// Funció que envia les dades del formulari al servidor.
function enviarFormulari(e){
    const form = $("#novaMatricula").get(0);
    const fd = new FormData(form);
    let modificar = false;

    const request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080");

    if (e.submitter.attributes.name.value === 'modificar') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        fd.append('id_original', `${urlParams.get('id')}`);
        modificar = true;
    }

    try {
        request.send(fd);
    } catch(error){
        console.log(error);
    }

    request.onload = function() {
        if (request.status != 200) {
            alert(`Error ${request.status}: ${request.statusText}`);
        } else {
            let response = request.responseText;
            alert(response);
            (!modificar) ?
                $("#novaMatricula").trigger("reset") :
                location.reload(true);
            
        }
    }

}

// Funció que elimina accents i símbols de les lletres perquè no surtin a la ID
function noAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Funció que busca les dades d'una matrícula específica al servidor, executar carregarFormulari()
function buscarMatricula(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('id')) {
        let request = setRequest();
        let params = JSON.stringify({accio:"read", matricula:`${urlParams.get('id')}`});
        
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
                carregarFormulari(response);
            }
        }
    }
}

// Funció que carrega les dades de la matrícula conseguides per la funció buscarMatrícula() al formulari de MODIFICAR
function carregarFormulari(matricula){
    $('#id').val(matricula.id);
    $('#nif').val(matricula.nif);
    $('#cognom1').val(matricula.cognom1);
    $('#cognom2').val(matricula.cognom2);
    $('#nom').val(matricula.nom);
    $('#data_naixament').val(matricula.data_naixament);
    $('#curs').val(matricula.curs);
    $('#preu').val(matricula.preu);
    $('#pagat').attr('checked', matricula.pagat);

    if(matricula.foto_alumne != '') $('#foto').attr('src', `../${matricula.foto_alumne}`);
}