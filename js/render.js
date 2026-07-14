// Renderiza o esqueleto de cada equipe (Melhoria 5)

function criarLinhaMilitar(militar) {

    const linha = document.createElement("div");

    linha.className = "linha-militar";

    linha.dataset.militarBruto = militar.texto;

linha.dataset.prontidaoInicial = militar.prontidao;

linha.dataset.pesquisa = [
    militar.texto,
    militar.prontidao,
    ...(militar.observacoes || []),
    ...(militar.afastamentos || []).map(a => a.tipo)
]
.join(" ")
.toUpperCase();
    if (militar.prontidao === "INDISPONÍVEL") {
        linha.classList.add("militar-indisponivel");
    }

    linha.innerHTML = `
        <div class="militar-identidade">
            ${formatarNomeMilitar(militar.texto)}
        </div>

        <div class="bloco-observacoes">
            ${montarTags(militar.afastamentos, militar.observacoes)}
        </div>
    `;

    return linha;

}


function renderizarEquipe(militares, elementId, tipoServico) {

    const container = document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";

    container.dataset.servico = tipoServico;
    container.dataset.contId = elementId
        .replace("dados-", "cont-")
        .replace("guarda-", "guarda-");

    const fragment = document.createDocumentFragment();

    militares.forEach(militar => {

   fragment.appendChild(
    criarLinhaMilitar(militar)
);

    });

    container.appendChild(fragment);

}

function renderizarListaMenuAdmin() {

    const div = document.getElementById("lista-afastados-atual");

    if (!div) return;

    if (dadosGlobaisAfastados.length === 0) {
        div.innerHTML = "<em>Ninguém afastado hoje</em>";
        return;
    }

    div.innerHTML = dadosGlobaisAfastados.map(a => `
        <div class="item-lista-afastado">
            <div>
                <strong>${a.nome}</strong> (${a.tipo})<br>
                <small>Retorno: ${a.retorno}</small>
            </div>

            <button
                class="btn-dar-pronto"
                onclick="darProntoMilitar(${a.linha})">

                Pronto

            </button>
        </div>
    `).join("");

}

// Atualizador Matemático de Prontos por Coluna
function atualizarContadoresIndividuais(containerId, contadorId) {
    const container = document.getElementById(containerId);
    const painelContador = document.getElementById(contadorId);
    if (!container || !painelContador) return;

    const totalMilitares = container.querySelectorAll(".linha-militar");
    let prontos = 0;
    let indisp = 0;

    totalMilitares.forEach(el => {
        if (el.getAttribute("data-prontidao-inicial") === "INDISPONÍVEL") indisp++;
        else prontos++;
    });

    painelContador.innerText = `Prontos: ${prontos} | Indisp: ${indisp}`;
}

