"use strict";

function getMatricules(){
    let request = new XMLHttpRequest();
    let params = JSON.stringify({accio:"read", matricula:'all'});
    request.open("POST", "http://localhost:8080", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(params);
    // $.ajax({
    //     url: "http://localhost:8080",
    //     data: params,
    //     dataType: "json",
    //     type: "POST"
    // }).done(printMatricules(response)
    // ).fail(function() {
    //     alert("Error al fer la petició al servidor");
    // });
}

function printMatricules(matricules){

}