document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("pesquisa-militar");

    if (!campo) return;

    campo.addEventListener("input", pesquisarMilitar);

    document
        .getElementById("btn-limpar-pesquisa")
        .addEventListener("click", limparPesquisa);

});

function pesquisarMilitar() {

    const texto = document
        .getElementById("pesquisa-militar")
        .value
        .toUpperCase()
        .trim();

    document
        .querySelectorAll(".linha-militar")
        .forEach(linha => {

            const nome = linha.dataset.militarBruto.toUpperCase();

            if(nome.includes(texto)){

                linha.style.display="block";

                linha.style.background="#fff9c4";

            }else{

                linha.style.display=
                    texto===""
                    ? "block"
                    : "none";

            }

        });

}

function limparPesquisa(){

    document.getElementById("pesquisa-militar").value="";

    pesquisarMilitar();

}
