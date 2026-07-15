function renderizarEspelhoCabecalho(calendario) {
    const tabela = document.getElementById("tabela-espelho-sheets");
    const wrapper = document.getElementById("wrapper-cabecalho-sheets");
    
    if (!tabela) {
        console.error("Erro Crítico: Não foi encontrada uma tag com id='tabela-espelho-sheets' no seu HTML.");
        return;
    }

    // 1. LIMPA O "Carregando calendário..." IMEDIATAMENTE
    tabela.innerHTML = "";

    if (!calendario || !calendario.dados || calendario.dados.length === 0) {
        console.warn("Aviso: Dados do calendário vieram vazios ou nulos da API.");
        if (wrapper) wrapper.style.display = "none";
        tabela.innerHTML = "<tr><td style='padding:10px; color:red;'>Nenhum dado de calendário encontrado na planilha.</td></tr>";
        return;
    }

    if (wrapper) wrapper.style.display = "block";

    const linhasCabecalho = calendario.dados;
    const coresCabecalho = calendario.cores;
    const eventosGlobais = window.dadosGlobaisEventos || {}; 

    // Remove linhas totalmente vazias
    const linhasValidas = linhasCabecalho.filter(linha => 
        linha && linha.some(celula => celula !== null && String(celula).trim() !== "")
    );

    const dataHoje = new Date();
    const diaHojeStr = String(dataHoje.getDate()).trim(); 
    const mesAtualNum = dataHoje.getMonth(); 
    const anoAtualNum = dataHoje.getFullYear();

    // Localiza a linha dos dias (onde tem 1, 2, 3...)
    let indexLinhaDias = -1;
    for (let i = 0; i < linhasValidas.length; i++) {
        let temDiasValidos = linhasValidas[i].some(c => {
            let n = parseInt(c, 10);
            return !isNaN(n) && n >= 1 && n <= 31;
        });
        if (temDiasValidos) {
            indexLinhaDias = i;
            break;
        }
    }

    const fragment = document.createDocumentFragment();

    linhasValidas.forEach((linha, indexLinha) => {
        const tr = document.createElement("tr");
        
        // Se for a primeira linha (Título do Mês)
        if (indexLinha === 0) {
            const thMes = document.createElement("th");
            const nomeMes = linha.find(c => c && String(c).trim() !== "") || "MAPA DE SERVIÇO";
            
            thMes.innerText = nomeMes.toUpperCase();
            thMes.setAttribute("colspan", linha ? linha.length : 1);
            
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

        linha.forEach((celula, indexColuna) => {
            const td = document.createElement("td");
            td.style.position = "relative"; 
            td.innerText = (celula !== null && celula !== undefined) ? celula : "";
            td.dataset.valor = celula;
            
            td.style.padding = "6px 4px";
            td.style.border = "1px solid #cbd5e1";
            td.style.fontSize = "11px";
            td.style.fontWeight = "600";
            td.style.minWidth = "28px";
            td.style.textAlign = "center";

            // Cores vindas do Sheets
            let corFundoOriginal = (coresCabecalho && coresCabecalho[indexLinha]) ? coresCabecalho[indexLinha][indexColuna] : "#ffffff";
            if (corFundoOriginal === "#ffffff" || corFundoOriginal === "transparent") {
                corFundoOriginal = "";
            }

            if (corFundoOriginal) {
                td.style.background = corFundoOriginal;
                td.style.color = (corFundoOriginal === "#424242" || corFundoOriginal === "#000000") ? "#ffffff" : "#1e293b";
            } else {
                td.style.background = "#ffffff";
                td.style.color = "#1e293b";
            }

            // Destaque do Dia de Hoje
            if (indexLinhaDias !== -1 && linhasValidas[indexLinhaDias]) {
                const valorDiaNaColuna = String(linhasValidas[indexLinhaDias][indexColuna]).trim();
                if (valorDiaNaColuna && valorDiaNaColuna === diaHojeStr) {
                    td.style.borderLeft = "2px solid #2563eb";
                    td.style.borderRight = "2px solid #2563eb";
                    if (indexLinha === indexLinhaDias) {
                        td.style.background = "#2563eb"; 
                        td.style.color = "#ffffff";
                    } else {
                        td.style.background = "#eff6ff"; 
                    }
                }
            }

            // Marcador de Eventos da Agenda
            if (indexLinha === indexLinhaDias && celula) {
                const diaNumero = parseInt(celula, 10);
                if (!isNaN(diaNumero)) {
                    const mesTexto = String(linhasValidas[0].find(c => c && c.trim() !== "")).toUpperCase();
                    const mesesMap = { JANEIRO:0, FEVEREIRO:1, MARÇO:2, ABRIL:3, MAIO:4, JUNHO:5, JULHO:6, AGOSTO:7, SETEMBRO:8, OUTUBRO:9, NOVEMBRO:10, DEZEMBRO:11 };
                    
                    let mesIndex = mesAtualNum;
                    for (let m in mesesMap) {
                        if (mesTexto.includes(m)) {
                            mesIndex = mesesMap[m];
                            break;
                        }
                    }

                    const dataCelulaStr = `${anoAtualNum}-${String(mesIndex + 1).padStart(2, '0')}-${String(diaNumero).padStart(2, '0')}`;

                    if (eventosGlobais[dataCelulaStr]) {
                        const ponto = document.createElement("span");
                        ponto.className = "ponto-evento";
                        ponto.title = eventosGlobais[dataCelulaStr].map(ev => `• ${ev.descricao}`).join("\n");
                        ponto.style.position = "absolute";
                        ponto.style.bottom = "2px";
                        ponto.style.left = "50%";
                        ponto.style.transform = "translateX(-50%)";
                        ponto.style.width = "5px";
                        ponto.style.height = "5px";
                        ponto.style.borderRadius = "50%";
                        ponto.style.background = "#f43f5e"; 
                        td.appendChild(ponto);
                    }
                }
            }
            // Apenas os dias do mês podem ser clicados
if(indexLinha === 2 && celula){

    td.style.cursor = "pointer";

    td.onclick = () => {

        abrirJanelaAnotacao(dataCelulaStr);

    };

}
            tr.appendChild(td);
        });
        fragment.appendChild(tr);
    });

    tabela.appendChild(fragment);
}

function renderizarCalendarioAtual() {
    // Busca a variável de forma segura na janela global
    const listaCalendarios = window.calendarios || (typeof calendarios !== 'undefined' ? calendarios : null);

    if (!listaCalendarios || !listaCalendarios.length) {
        console.warn("Aviso: Variável 'calendarios' ainda não está pronta ou está vazia.");
        return;
    }

    // Garante que o index atual é válido
    const index = window.calendarioAtual !== undefined ? window.calendarioAtual : (typeof calendarioAtual !== 'undefined' ? calendarioAtual : 0);
    const calendario = listaCalendarios[index];

    if (!calendario) {
        console.error("Erro: Calendário não encontrado para o índice:", index);
        return;
    }

    renderizarEspelhoCabecalho(calendario);
    atualizarTituloCalendario();
    atualizarBotoesCalendario();
}

function atualizarTituloCalendario() {
    const listaCalendarios = window.calendarios || (typeof calendarios !== 'undefined' ? calendarios : null);
    const index = window.calendarioAtual !== undefined ? window.calendarioAtual : (typeof calendarioAtual !== 'undefined' ? calendarioAtual : 0);

    if (!listaCalendarios || !listaCalendarios[index]) return;

    const titulo = document.getElementById("titulo-calendario");
    if (!titulo) return;

    const dadosCalendario = listaCalendarios[index].dados;
    if (dadosCalendario && dadosCalendario[0]) {
        const nomeMes = dadosCalendario[0].find(c => c && String(c).trim() !== "");
        titulo.innerText = nomeMes || "";
    }
}

function atualizarBotoesCalendario() {
    const listaCalendarios = window.calendarios || (typeof calendarios !== 'undefined' ? calendarios : null);
    const index = window.calendarioAtual !== undefined ? window.calendarioAtual : (typeof calendarioAtual !== 'undefined' ? calendarioAtual : 0);

    const btnAnterior = document.getElementById("btn-mes-anterior");
    const btnProximo = document.getElementById("btn-proximo-mes");

    if (!listaCalendarios) return;

    if (btnAnterior) {
        btnAnterior.disabled = index === 0;
    }

    if (btnProximo) {
        btnProximo.disabled = index >= listaCalendarios.length - 1;
    }
}

function proximoMes() {
    const listaCalendarios = window.calendarios || (typeof calendarios !== 'undefined' ? calendarios : null);
    let index = window.calendarioAtual !== undefined ? window.calendarioAtual : (typeof calendarioAtual !== 'undefined' ? calendarioAtual : 0);

    if (!listaCalendarios || index >= listaCalendarios.length - 1) return;

    index++;
    if (window.calendarioAtual !== undefined) window.calendarioAtual = index;
    if (typeof calendarioAtual !== 'undefined') calendarioAtual = index;

    renderizarCalendarioAtual();
}

function mesAnterior() {
    let index = window.calendarioAtual !== undefined ? window.calendarioAtual : (typeof calendarioAtual !== 'undefined' ? calendarioAtual : 0);

    if (index <= 0) return;

    index--;
    if (window.calendarioAtual !== undefined) window.calendarioAtual = index;
    if (typeof calendarioAtual !== 'undefined') calendarioAtual = index;

    renderizarCalendarioAtual();

    
