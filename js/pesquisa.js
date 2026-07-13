let timeoutPesquisa = null;

document.addEventListener("DOMContentLoaded", iniciarPesquisa);

function iniciarPesquisa(){

    const campo = document.getElementById("pesquisa-militar");

    if(!campo) return;

    campo.addEventListener("input",()=>{

        clearTimeout(timeoutPesquisa);

        timeoutPesquisa = setTimeout(filtrarMilitares,80);

    });

}

function filtrarMilitares(){

    const texto = document
        .getElementById("pesquisa-militar")
        .value
        .trim()
        .toUpperCase();

    const militares =
        document.querySelectorAll(".linha-militar");

    let encontrados = 0;

    let primeiro = null;

    militares.forEach(linha=>{

        linha.classList.remove("resultado-pesquisa");

        if(texto==="")
            return;

        if(linha.dataset.pesquisa.includes(texto)){

            encontrados++;

            linha.classList.add("resultado-pesquisa");

            if(!primeiro)
                primeiro = linha;

        }

    });

    atualizarContadorPesquisa(encontrados);

    if(primeiro){

        primeiro.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    }

}

function atualizarContadorPesquisa(qtd){

    let contador =
        document.getElementById("contador-pesquisa");

    if(!contador){

        contador=document.createElement("span");

        contador.id="contador-pesquisa";

        document
            .getElementById("barra-pesquisa")
            .appendChild(contador);

    }

    if(document.getElementById("pesquisa-militar").value===""){

        contador.innerHTML="";

        return;

    }

    contador.innerHTML=
        qtd+" militar(es) encontrado(s)";

}
