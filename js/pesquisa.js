let timeoutPesquisa = null;

document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("pesquisa-militar");

    if (!campo) return;

    campo.addEventListener("input", () => {

        clearTimeout(timeoutPesquisa);

        timeoutPesquisa = setTimeout(filtrarMilitares, 120);

    });

    const botaoLimpar = document.getElementById("btn-limpar-pesquisa");

if (botaoLimpar) {
    botaoLimpar.addEventListener("click", limparPesquisa);
}

});

function filtrarMilitares() {

    const texto = document
        .getElementById("pesquisa-militar")
        .value
        .trim()
        .toUpperCase();

    let primeiroResultado = null;

    document
        .querySelectorAll(".linha-militar")
        .forEach(linha => {

            const encontrado =
                linha.dataset.pesquisa.includes(texto);

            if (texto === "") {

                linha.style.display = "";

                linha.classList.remove("resultado-pesquisa");

                return;

            }

            if (encontrado) {

                linha.style.display = "";

                linha.classList.add("resultado-pesquisa");

                if (!primeiroResultado)
                    primeiroResultado = linha;

            } else {

                linha.style.display = "none";

                linha.classList.remove("resultado-pesquisa");

            }

        });

    if (primeiroResultado) {

        primeiroResultado.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }

}

function limparPesquisa() {

    document.getElementById("pesquisa-militar").value = "";

    filtrarMilitares();

}
