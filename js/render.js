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

// Renderiza o cabeçalho informativo/espelho vindo das primeiras linhas da planilha
function renderizarEspelhoCabecalho(linhasCabecalho, coresCabecalho) {
    const tabela = document.getElementById("tabela-espelho-sheets");
    const wrapper = document.getElementById("wrapper-cabecalho-sheets");
    
    if (!tabela) return;

    // Se não houver dados, esconde o contêiner
    if (!linhasCabecalho || linhasCabecalho.length === 0) {
        if (wrapper) wrapper.style.display = "none";
        return;
    }

    if (wrapper) wrapper.style.display = "block";
    tabela.innerHTML = "";

    // Filtra para eliminar possíveis linhas completamente vazias enviadas pelo intervalo do Sheets
    const linhasValidas = linhasCabecalho.filter(linha => 
        linha.some(celula => celula !== null && String(celula).trim() !== "")
    );

    const fragment = document.createDocumentFragment();

    // Captura a data atual do sistema para a marcação dinâmica do dia de hoje
    const dataHoje = new Date();
    const diaAtualStr = String(dataHoje.getDate()); 
    // Nota: O destaque do mês é validado pelo dia numérico na linha correspondente

    linhasValidas.forEach((linha, indexLinha) => {
        const tr = document.createElement("tr");
        
        // REGRA 1: TRATAMENTO DA PRIMEIRA LINHA (O MÊS - EX: JULHO)
        if (indexLinha === 0) {
            const thMes = document.createElement("th");
            // Filtra o nome do mês removendo células vazias adjacentes
            const nomeMes = linha.find(c => c && String(c).trim() !== "") || "MAPA DE SERVIÇO";
            
            thMes.innerText = nomeMes.toUpperCase();
            thMes.setAttribute("colspan", linha.length); // Mescla todas as colunas automaticamente
            
            // Estilização institucional de Comando para o Mês Centralizado
            thMes.style.background = "linear-gradient(90deg, #1e3a8a, #0f4c81)";
            thMes.style.color = "#ffffff";
            thMes.style.fontSize = "16px";
            thMes.style.fontWeight = "800";
            thMes.style.letterSpacing = "2px";
            thMes.style.padding = "10px";
            thMes.style.border = "2px solid #0f4c81";
            thMes.style.textAlign = "center";
            
            tr.appendChild(thMes);
            fragment.appendChild(tr);
            return; 
        }

        // REGRA 2: TRATAMENTO DAS DEMAIS LINHAS (DIAS DA SEMANA, DIAS DO MÊS, ESCALAS)
        linha.forEach((celula, indexColuna) => {
            const td = document.createElement("td");
            td.innerText = celula || "";
            
            // Estilo base de célula militar limpa
            td.style.padding = "6px 4px";
            td.style.border = "1px solid #cbd5e1";
            td.style.fontSize = "11px";
            td.style.fontWeight = "600";
            td.style.minWidth = "28px";
            td.style.textAlign = "center";

            // Recupera a cor de fundo original enviada pelo GAS se ela for válida
            let corFundoOriginal = (coresCabecalho && coresCabecalho[indexLinha]) ? coresCabecalho[indexLinha][indexColuna] : "#ffffff";
            
            // Padroniza células sem cor para transparente/branco
            if (corFundoOriginal === "#ffffff" || corFundoOriginal === "transparent") {
                corFundoOriginal = "";
            }

            // Aplica as cores de fim de semana baseadas na planilha ou na identificação de texto
            if (corFundoOriginal) {
                td.style.background = corFundoOriginal;
                // Ajusta o contraste do texto caso o fundo seja escuro
                td.style.color = (corFundoOriginal === "#424242" || corFundoOriginal === "#000000") ? "#ffffff" : "#1e293b";
            } else {
                td.style.background = "#ffffff";
                td.style.color = "#1e293b";
            }

            // REGRA 3: MARCAÇÃO DINÂMICA EM TEMPO REAL DO DIA DE HOJE
            // Localiza a linha dos dias (geralmente indexLinha = 2 na planilha limpa)
            const valorLinhaDias = linhasValidas[2] ? linhasValidas[2][indexColuna] : "";
            const valorLinhaSemana = linhasValidas[1] ? String(linhasValidas[1][indexColuna]).toUpperCase() : "";
            
            // Verifica se a coluna atual bate com o dia numérico de hoje
            if (String(valorLinhaDias).trim() === diaAtualStr) {
                td.style.borderLeft = "2px solid #2563eb";
                td.style.borderRight = "2px solid #2563eb";
                
                // Se for a própria célula do número ou do dia da semana, aplica o destaque tático azul
                if (indexLinha === 1 || indexLinha === 2) {
                    td.style.background = "#2563eb"; 
                    td.style.color = "#ffffff";
                    td.style.fontWeight = "bold";
                } else {
                    // Nas linhas de escala abaixo do dia de hoje, suaviza o fundo para manter a leitura legível
                    td.style.background = "#eff6ff"; 
                }
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

