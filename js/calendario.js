function descobrirMesCalendario(calendario){

    if(
        !calendario ||
        !calendario.dados ||
        !calendario.dados[0]
    ){
        return -1;
    }

    const titulo = String(
        calendario.dados[0][0]
    ).toUpperCase();

    const meses = [
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

    return meses.findIndex(mes => titulo.includes(mes));

}

function obterAnoMesDoCalendario(calendario){

    const nomeMes = String(
        calendario.dados[0].find(
            c => c && String(c).trim() !== ""
        )
    ).toUpperCase();


    const meses = [
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


    const mes = meses.findIndex(
        m => nomeMes.includes(m)
    );


    return {
        ano: 2026,
        mes: mes
    };

}

// ==========================================================
// GERADOR AUTOMÁTICO DE CALENDÁRIO DE ESCALA
// Base da sequência: 01/03/2026
// ==========================================================

function gerarCalendariosAutomaticos(){

    const hoje = new Date();

    const lista = [];

    // Remove horário para evitar erro de comparação
    hoje.setHours(0,0,0,0);


    for(let i = 0; i <= 5; i++){

        const dataMes = new Date(
            hoje.getFullYear(),
            hoje.getMonth() + i,
            1
        );


        lista.push(
            gerarMesEscala(
                dataMes.getFullYear(),
                dataMes.getMonth()
            )
        );

    }


    return lista;

}



function gerarMesEscala(ano, mes){

    const nomesMeses = [
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


    const primeiroDia = new Date(ano, mes, 1);

    const ultimoDia = new Date(
        ano,
        mes + 1,
        0
    ).getDate();



    const linhaMes = [
    `${nomesMeses[mes]} / ${ano}`
];


    const linhaDias = [];
    const linhaPrimeiroTurno = [];
    const linhaSegundoTurno = [];



    for(let dia = 1; dia <= ultimoDia; dia++){


        linhaDias.push(dia);


        const dataAtual = new Date(
            ano,
            mes,
            dia
        );


        const referencia = new Date(
    2026,
    2,
    1
);

referencia.setHours(0,0,0,0);
dataAtual.setHours(0,0,0,0);


        const diferenca =
            Math.floor(
                (dataAtual - referencia)
                /
                (1000 * 60 * 60 * 24)
            );


        const ciclo =
            ((diferenca % 5) + 5) % 5;



        // Primeiro turno
        const turno1 = [
            "B",
            "A",
            "E",
            "C",
            "D"
        ][ciclo];



        // Segundo turno
        const turno2 = [
            "D",
            "B",
            "A",
            "E",
            "C"
        ][ciclo];



        linhaPrimeiroTurno.push(turno1);

        linhaSegundoTurno.push(turno2);


    }



    return {

        dados:[
            linhaMes,
            linhaDias,
            linhaPrimeiroTurno,
            linhaSegundoTurno
        ],

        cores:[]

    };


}

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

const diaHoje = dataHoje.getDate();
const mesHoje = dataHoje.getMonth();
const anoHoje = dataHoje.getFullYear();

const mesSistema = mesHoje;
const anoSistema = anoHoje;


// mês que o calendário aberto representa
const nomeMesTela = String(
    linhasValidas[0].find(c => c && String(c).trim() !== "")
).toUpperCase();


const mapaMeses = {
    JANEIRO:0,
    FEVEREIRO:1,
    MARÇO:2,
    ABRIL:3,
    MAIO:4,
    JUNHO:5,
    JULHO:6,
    AGOSTO:7,
    SETEMBRO:8,
    OUTUBRO:9,
    NOVEMBRO:10,
    DEZEMBRO:11
};


let mesCalendario = mesSistema;


for(const mes in mapaMeses){

    if(nomeMesTela.includes(mes)){
        mesCalendario = mapaMeses[mes];
        break;
    }

}


const anoCalendario = 2026;

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
        if (indexLinha === 0){
    return;
            
}
        linha.forEach((celula, indexColuna) => {
            const td = document.createElement("td");
            // Destaque real do dia atual
if(indexLinha === indexLinhaDias){

    const diaCelula = parseInt(celula,10);

    if(!isNaN(diaCelula)){

        const mesDoCalendario = descobrirMesCalendario(calendario);


        const dataCelula = new Date(
            anoCalendario,
            mesDoCalendario,
            diaCelula
        );


        if(
            dataCelula.getDate() === diaHoje &&
            dataCelula.getMonth() === mesHoje &&
            dataCelula.getFullYear() === anoHoje
        ){

            td.classList.add("dia-hoje");

        }

    }

}
            td.style.position = "relative"; 
            td.innerText = (celula !== null && celula !== undefined) ? celula : "";
            td.dataset.valor = celula;
            
           td.style.padding = "8px 5px";
td.style.border = "1px solid #d1d5db";
td.style.fontSize = "12px";
td.style.fontWeight = "700";
td.style.minWidth = "38px";
td.style.height = "35px";
td.style.textAlign = "center";
            // Marca finais de semana

if(indexLinha === indexLinhaDias && celula){

    const dia = Number(celula);

    const data = new Date(
        anoCalendario,
        mesCalendario,
        dia
    );


    const semana = data.getDay();


    // Domingo
   if (semana === 0) {
    td.classList.add("domingo");
}



    // Sábado
   if (semana === 6) {
    td.classList.add("sabado");
}

}
td.style.verticalAlign = "middle";

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

                // Estilo automático do calendário

           }

           

            // Marcador de Eventos da Agenda
            if (indexLinha === indexLinhaDias && celula) {
                const diaNumero = parseInt(celula, 10);
                if (!isNaN(diaNumero)) {
                    const mesIndex = descobrirMesCalendario(calendario);

                    const dataCelulaStr = `${anoCalendario}-${String(mesIndex + 1).padStart(2, '0')}-${String(diaNumero).padStart(2, '0')}`;
                    
                    // Verifica se existe anotação salva para este dia
const anotacaoSalva = localStorage.getItem("anotacao_" + dataCelulaStr);

if (anotacaoSalva) {

    const pontoAnotacao = document.createElement("span");

    pontoAnotacao.className = "ponto-anotacao";

    pontoAnotacao.title = "Existe anotação neste dia";

    pontoAnotacao.style.position = "absolute";
    pontoAnotacao.style.bottom = "2px";
    pontoAnotacao.style.left = "50%";
    pontoAnotacao.style.transform = "translateX(-50%)";
    pontoAnotacao.style.width = "7px";
    pontoAnotacao.style.height = "7px";
    pontoAnotacao.style.borderRadius = "50%";
    pontoAnotacao.style.background = "#dc2626";

    td.appendChild(pontoAnotacao);

}

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
if(indexLinha === indexLinhaDias && celula){

    const diaNumeroClique = parseInt(celula, 10);

    if(!isNaN(diaNumeroClique)){

        const mesIndexClique = descobrirMesCalendario(calendario);

        const dataClique = `${anoCalendario}-${String(mesIndexClique + 1).padStart(2,'0')}-${String(diaNumeroClique).padStart(2,'0')}`;

        td.style.cursor = "pointer";

        td.onclick = () => {

            abrirJanelaAnotacao(dataClique);

        };

    }

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

    console.log(
    "CALENDÁRIO ATUAL:",
    index,
    calendario.dados[0][0]
);

    if (!calendario) {
        console.error("Erro: Calendário não encontrado para o índice:", index);
        return;
    }

    renderizarEspelhoCabecalho(calendario);
    atualizarBotoesCalendario();
    atualizarTituloCalendario();
}

function atualizarTituloCalendario(){

    const titulo = document.getElementById("titulo-calendario");

    if(!titulo) return;

    const lista = window.calendarios;

    if(!lista || !lista.length) return;

    titulo.innerText =
        lista[window.calendarioAtual].dados[0][0];

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
