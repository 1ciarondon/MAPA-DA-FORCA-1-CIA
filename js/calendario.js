// ==========================================================
// DESCOBRE O MÊS E ANO DO CALENDÁRIO
// ==========================================================
const NOMES_MESES = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO"
];

function descobrirMesCalendario(calendario){

    if(
        !calendario ||
        !calendario.dados ||
        !calendario.dados.length
    ){
        return -1;
    }

    const titulo = String(
        calendario.dados[0].find(
            c => c && String(c).trim() !== ""
        ) || ""
    ).toUpperCase();

    return NOMES_MESES.findIndex(
        mes => titulo.includes(mes)
    );

}

function obterAnoMesDoCalendario(calendario){

    if(
        !calendario ||
        !calendario.dados ||
        !calendario.dados.length
    ){
        return {
            ano: new Date().getFullYear(),
            mes: -1
        };
    }

    const titulo = String(
        calendario.dados[0].find(
            c => c && String(c).trim() !== ""
        ) || ""
    ).toUpperCase();

    const mes = descobrirMesCalendario(calendario);

    // Procura um ano de quatro dígitos
    const anoEncontrado = titulo.match(/\b20\d{2}\b/);

    return {
        ano: anoEncontrado
            ? Number(anoEncontrado[0])
            : new Date().getFullYear(),
        mes: mes
    };

}

// ==========================================================
// GERADOR AUTOMÁTICO DE CALENDÁRIOS
// Base da escala: 01/03/2026
// ==========================================================

const DATA_BASE_ESCALA = new Date(2026, 2, 1);
DATA_BASE_ESCALA.setHours(0, 0, 0, 0);

const EQUIPES_PRIMEIRO_TURNO = ["B", "A", "E", "C", "D"];
const EQUIPES_SEGUNDO_TURNO = ["D", "B", "A", "E", "C"];

function gerarCalendariosAutomaticos() {

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    const lista = [];

    for (let i = 0; i < 6; i++) {

        const data = new Date(
            hoje.getFullYear(),
            hoje.getMonth() + i,
            1
        );

        lista.push(
            gerarMesEscala(
                data.getFullYear(),
                data.getMonth()
            )
        );

    }

    return lista;

}

function gerarMesEscala(ano, mes) {

    const nomesDias = [
        "DOM",
        "SEG",
        "TER",
        "QUA",
        "QUI",
        "SEX",
        "SAB"
    ];

    const ultimoDia = new Date(
        ano,
        mes + 1,
        0
    ).getDate();

    const linhaMes = [
        `${NOMES_MESES[mes]} / ${ano}`
    ];

    const linhaSemana = [];
    const linhaDias = [];
    const linhaPrimeiroTurno = [];
    const linhaSegundoTurno = [];

    for (let dia = 1; dia <= ultimoDia; dia++) {

        const dataAtual = new Date(
            ano,
            mes,
            dia
        );

        dataAtual.setHours(0,0,0,0);

        linhaSemana.push(
            nomesDias[dataAtual.getDay()]
        );

        linhaDias.push(dia);

        const diferencaDias = Math.floor(
            (dataAtual - DATA_BASE_ESCALA) / 86400000
        );

        const ciclo =
            ((diferencaDias % 5) + 5) % 5;

        linhaPrimeiroTurno.push(
            EQUIPES_PRIMEIRO_TURNO[ciclo]
        );

        linhaSegundoTurno.push(
            EQUIPES_SEGUNDO_TURNO[ciclo]
        );

    }

    return {

        dados: [
            linhaMes,
            linhaSemana,
            linhaDias,
            linhaPrimeiroTurno,
            linhaSegundoTurno
        ],

        cores: []

    };

}

function renderizarEspelhoCabecalho(calendario) {

    const tabela = document.getElementById("tabela-espelho-sheets");
    const wrapper = document.getElementById("wrapper-cabecalho-sheets");

    if (!tabela) {
        console.error("Tabela do calendário não encontrada.");
        return;
    }

    tabela.innerHTML = "";

    if (
        !calendario ||
        !calendario.dados ||
        calendario.dados.length === 0
    ) {

        if (wrapper) {
            wrapper.style.display = "none";
        }

        tabela.innerHTML =
            "<tr><td style='padding:15px'>Nenhum calendário disponível.</td></tr>";

        return;
    }

    if (wrapper) {
        wrapper.style.display = "block";
    }

    const linhas = calendario.dados;
    const cores = calendario.cores || [];
    const eventosGlobais = window.dadosGlobaisEventos || {};

    const { ano, mes } = obterAnoMesDoCalendario(calendario);

    const hoje = new Date();

    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();

    const indexLinhaSemana = 1;
    const indexLinhaDias = 2;

    const fragment = document.createDocumentFragment();

    // =====================================================
    // Cabeçalho com navegação
    // =====================================================

    const trTitulo = document.createElement("tr");

    const tdTitulo = document.createElement("td");

    tdTitulo.colSpan = linhas[indexLinhaDias].length;

    tdTitulo.className = "cabecalho-calendario";

    tdTitulo.innerHTML = `
        <div class="barra-calendario">

            <button
                id="btn-mes-anterior"
                class="btn-cal-nav"
                onclick="mesAnterior()">
                ◀
            </button>

            <span class="titulo-calendario">
                ${linhas[0][0]}
            </span>

            <button
                id="btn-proximo-mes"
                class="btn-cal-nav"
                onclick="proximoMes()">
                ▶
            </button>

        </div>
    `;

    trTitulo.appendChild(tdTitulo);

    fragment.appendChild(trTitulo);

    // =====================================================
    // Renderização das linhas
    // =====================================================

    linhas.forEach((linha, indexLinha) => {

        // não desenha novamente a linha do título
        if (indexLinha === 0) return;

        const tr = document.createElement("tr");
                linha.forEach((celula, indexColuna) => {

            const td = document.createElement("td");

            td.innerText = celula ?? "";
            td.dataset.valor = celula ?? "";
            td.style.position = "relative";
            td.style.padding = "8px 5px";
            td.style.border = "1px solid #d1d5db";
            td.style.fontSize = "12px";
            td.style.fontWeight = "700";
            td.style.minWidth = "38px";
            td.style.height = "35px";
            td.style.textAlign = "center";
            td.style.verticalAlign = "middle";

            // =====================================
            // Cores vindas do Google Sheets
            // =====================================

            const cor =
                cores[indexLinha]?.[indexColuna];

            if (
                cor &&
                cor !== "#ffffff" &&
                cor !== "transparent"
            ) {

                td.style.background = cor;
                td.style.color =
                    (cor === "#000000" || cor === "#424242")
                        ? "#fff"
                        : "#1e293b";

            }

            // =====================================
            // Linha dos dias
            // =====================================

            if (
                indexLinha === indexLinhaDias &&
                !isNaN(Number(celula))
            ) {

                const dia = Number(celula);

                const data = new Date(
                    ano,
                    mes,
                    dia,
                    12
                );

                // Dia atual

                if (
                    data.getDate() === diaHoje &&
                    data.getMonth() === mesHoje &&
                    data.getFullYear() === anoHoje
                ) {

                    td.classList.add("dia-hoje");

                }

                // Domingo

                if (data.getDay() === 0) {
                    td.classList.add("domingo");
                }

                // Sábado

                if (data.getDay() === 6) {
                    td.classList.add("sabado");
                }

                // ==========================
                // Eventos
                // ==========================

                const dataISO =
                    `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

                if (localStorage.getItem("anotacao_" + dataISO)) {

                    const ponto = document.createElement("span");

                    ponto.className = "ponto-anotacao";

                    td.appendChild(ponto);

                }

                if (eventosGlobais[dataISO]) {

                    const ponto = document.createElement("span");

                    ponto.className = "ponto-evento";

                    ponto.title =
                        eventosGlobais[dataISO]
                            .map(e => "• " + e.descricao)
                            .join("\n");

                    td.appendChild(ponto);

                }

// ==========================================================
// CLIQUE NAS DATAS DA AGENDA
// BLOQUEIA DATAS ANTERIORES AO DIA ATUAL
// ==========================================================

td.style.cursor = "pointer";


const hoje = new Date();

hoje.setHours(0,0,0,0);


const dataSelecionada = new Date(dataISO);

dataSelecionada.setHours(0,0,0,0);



if(dataSelecionada < hoje){

    // Data passada
    td.style.cursor = "not-allowed";

    td.title = "Não é permitido lançar observações em datas anteriores";

    td.style.opacity = "0.65";

    td.onclick = () => {

        alert(
            "Não é permitido criar observações em datas anteriores."
        );

    };


}else{


    // Data atual ou futura
    td.onclick = () => {

        abrirJanelaAnotacao(dataISO);

    };


}



function renderizarCalendarioAtual() {

    if (!window.calendarios || !window.calendarios.length) {
        console.warn("Nenhum calendário disponível.");
        return;
    }

    const calendario = window.calendarios[window.calendarioAtual];

    if (!calendario) {
        console.error("Calendário inválido.");
        return;
    }

    renderizarEspelhoCabecalho(calendario);
    atualizarBotoesCalendario();

}

function atualizarBotoesCalendario(){

    const btnAnterior = document.getElementById("btn-mes-anterior");
    const btnProximo  = document.getElementById("btn-proximo-mes");

    if(!btnAnterior || !btnProximo) return;

    btnAnterior.disabled =
        window.calendarioAtual === 0;

    btnProximo.disabled =
        window.calendarioAtual >= window.calendarios.length - 1;

}

function proximoMes(){

    if(window.calendarioAtual >= window.calendarios.length - 1){
        return;
    }

    window.calendarioAtual++;

    renderizarCalendarioAtual();

}

function mesAnterior(){

    if(window.calendarioAtual <= 0){
        return;
    }

    window.calendarioAtual--;

    renderizarCalendarioAtual();

}


