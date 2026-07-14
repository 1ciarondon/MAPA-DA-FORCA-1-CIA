function renderizarEspelhoCabecalho(calendario) {
    const linhasCabecalho = calendario.dados;
    const coresCabecalho = calendario.cores;
    
    // Obtém os eventos enviados pela API (salvos no estado global)
    const eventosGlobais = window.dadosGlobaisEventos || {}; 
    const tabela = document.getElementById("tabela-espelho-sheets");
    const wrapper = document.getElementById("wrapper-cabecalho-sheets");
    
    if (!tabela) return;

    if (!linhasCabecalho || linhasCabecalho.length === 0) {
        if (wrapper) wrapper.style.display = "none";
        return;
    }

    if (wrapper) wrapper.style.display = "block";
    tabela.innerHTML = "";

    const linhasValidas = linhasCabecalho.filter(linha => 
        linha.some(celula => celula !== null && String(celula).trim() !== "")
    );

    const fragment = document.createDocumentFragment();
    const dataHoje = new Date();
    const diaAtualStr = String(dataHoje.getDate()); 
    const mesAtualNum = dataHoje.getMonth(); // 0-11
    const anoAtualNum = dataHoje.getFullYear();

    linhasValidas.forEach((linha, indexLinha) => {
        const tr = document.createElement("tr");
        
        if (indexLinha === 0) {
            const thMes = document.createElement("th");
            const nomeMes = linha.find(c => c && String(c).trim() !== "") || "MAPA DE SERVIÇO";
            
            thMes.innerText = nomeMes.toUpperCase();
            thMes.setAttribute("colspan", linha.length);
            
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
            td.style.position = "relative"; // Permite posicionar o ponto indicador absolutamente
            td.innerText = celula || "";
            
            td.style.padding = "6px 4px";
            td.style.border = "1px solid #cbd5e1";
            td.style.fontSize = "11px";
            td.style.fontWeight = "600";
            td.style.minWidth = "28px";
            td.style.textAlign = "center";

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

            // MARCAÇÃO DO DIA DE HOJE
            const valorLinhaDias = linhasValidas[2] ? linhasValidas[2][indexColuna] : "";
            
            if (String(valorLinhaDias).trim() === diaAtualStr) {
                td.style.borderLeft = "2px solid #2563eb";
                td.style.borderRight = "2px solid #2563eb";
                
                if (indexLinha === 1 || indexLinha === 2) {
                    td.style.background = "#2563eb"; 
                    td.style.color = "#ffffff";
                    td.style.fontWeight = "bold";
                } else {
                    td.style.background = "#eff6ff"; 
                }
            }

            // ==========================================
            // MARCAÇÃO DA AGENDA (PONTO INDICADOR)
            // ==========================================
            // Identifica se a célula atual representa o número do dia (indexLinha === 2)
            if (indexLinha === 2 && celula) {
                const diaNumero = parseInt(celula, 10);
                if (!isNaN(diaNumero)) {
                    // Descobre o mês corrente com base no título do calendário (index 0)
                    const mesTexto = String(linhasValidas[0].find(c => c && c.trim() !== "")).toUpperCase();
                    const mesesMap = { JANEIRO:0, FEVEREIRO:1, MARÇO:2, ABRIL:3, MAIO:4, JUNHO:5, JULHO:6, AGOSTO:7, SETEMBRO:8, OUTUBRO:9, NOVEMBRO:10, DEZEMBRO:11 };
                    
                    let mesIndex = mesAtualNum;
                    for (let m in mesesMap) {
                        if (mesTexto.includes(m)) {
                            mesIndex = mesesMap[m];
                            break;
                        }
                    }

                    // Monta a data da célula para verificar se há eventos futuros cadastrados
                    const dataCelula = new Date(anoAtualNum, mesIndex, diaNumero);
                    const dataCelulaStr = Utilities_formatarDataISO(dataCelula);

                    if (eventosGlobais[dataCelulaStr]) {
                        // Cria o ponto indicador (dot)
                        const ponto = document.createElement("span");
                        ponto.className = "ponto-evento";
                        
                        // Tooltip descritiva para passar o mouse e ler os eventos
                        const resumoEventos = eventosGlobais[dataCelulaStr].map(ev => `• ${ev.descricao}`).join("\n");
                        ponto.title = resumoEventos; 

                        // Estilos táticos para o ponto indicador
                        ponto.style.position = "absolute";
                        ponto.style.bottom = "2px";
                        ponto.style.left = "50%";
                        ponto.style.transform = "translateX(-50%)";
                        ponto.style.width = "5px";
                        ponto.style.height = "5px";
                        ponto.style.borderRadius = "50%";
                        ponto.style.background = "#f43f5e"; // Rosa/Vermelho vibrante de atenção
                        
                        td.appendChild(ponto);
                    }
                }
            }
            
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tabela.appendChild(fragment);
}

// Função utilitária para converter Date para String YYYY-MM-DD localmente
function Utilities_formatarDataISO(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function renderizarCalendarioAtual() {

    if (!calendarios.length) return;

    const calendario = calendarios[calendarioAtual];

    renderizarEspelhoCabecalho(calendario);

    atualizarTituloCalendario();

    atualizarBotoesCalendario();

}


function atualizarTituloCalendario() {

    if (!calendarios.length) return;

    const titulo = document.getElementById("titulo-calendario");

    if (!titulo) return;

    const nomeMes =
        calendarios[calendarioAtual].dados[0]
            .find(c => c && c.trim() !== "");

    titulo.innerText = nomeMes || "";

}


function atualizarBotoesCalendario() {

    const btnAnterior = document.getElementById("btn-mes-anterior");

    const btnProximo = document.getElementById("btn-proximo-mes");

    if (btnAnterior)
        btnAnterior.disabled = calendarioAtual === 0;

    if (btnProximo)
        btnProximo.disabled =
            calendarioAtual >= calendarios.length - 1;

}


function proximoMes() {

    if (calendarioAtual >= calendarios.length - 1)
        return;

    calendarioAtual++;

    renderizarCalendarioAtual();

}


function mesAnterior() {

    if (calendarioAtual <= 0)
        return;

    calendarioAtual--;

    renderizarCalendarioAtual();

}
