// Renderiza o esqueleto de cada equipe (Melhoria 5)

function criarLinhaMilitar(militar) {

    const linha = document.createElement("div");

    linha.className = "linha-militar";

    linha.dataset.militarBruto = militar.texto;
    linha.dataset.prontidaoInicial = militar.prontidao;

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

// Renderiza o cabeçalho informativo/espelho vindo das primeiras linhas da planilha
function renderizarEspelhoCabecalho(linhasCabecalho) {
    const tabela = document.getElementById("tabela-espelho-sheets");
    const wrapper = document.getElementById("wrapper-cabecalho-sheets");
    
    if (!tabela) return;

    // Se não vierem dados de cabeçalho, esconde o contêiner para não ficar um bloco vazio
    if (!linhasCabecalho || linhasCabecalho.length === 0) {
        if (wrapper) wrapper.style.display = "none";
        return;
    }

    if (wrapper) wrapper.style.display = "block";
    tabela.innerHTML = "";

    const fragment = document.createDocumentFragment();

    linhasCabecalho.forEach((linha, index) => {
        const tr = document.createElement("tr");
        
        // Estilização básica: se for a primeira linha, trata como cabeçalho (th)
        linha.forEach(celula => {
            const td = document.createElement(index === 0 ? "th" : "td");
            td.innerText = celula || "";
            
            // Estilização cirúrgica via JS para manter o padrão militar limpo
            td.style.padding = "6px 10px";
            td.style.border = "1px solid #d6dde6";
            if (index === 0) {
                td.style.background = "#f1f5f9";
                td.style.fontWeight = "bold";
                td.style.color = "#1e293b";
            } else {
                td.style.color = "#334155";
            }
            
            tr.appendChild(td);
        });
        
        fragment.appendChild(tr);
    });

    tabela.appendChild(fragment);
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

    console.log(militar.texto);

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

