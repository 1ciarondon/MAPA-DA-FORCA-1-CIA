// ==========================================
// CONFIGURAÇÕES GERAIS E SESSÃO DE DADOS
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby5LqbrVC1udTsWiQxoay2Igda3NFFpbomBJ8d_-FjGPS6H5J42BrIQxsSwzVUZruCD/exec"; 
let instanciasSortable = [];
let modoEdicao = false;
let dadosGlobaisAfastados = []; // Guarda a lista em memória para o menu lateral

document.addEventListener("DOMContentLoaded", () => { carregarMapa(); });

// Carrega os dados da API (Google Sheets) e distribui nos blocos correspondentes
async function carregarMapa() {
    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        
        // Salva os afastados mapeados para uso no menu admin
        dadosGlobaisAfastados = dados.afastados_geral || [];
        renderizarListaMenuAdmin();

        const blocos = [
            {d: dados.radiopatrulha.A, id: "dados-A", s: "RP", c: "cont-A"},
            {d: dados.radiopatrulha.B, id: "dados-B", s: "RP", c: "cont-B"},
            {d: dados.radiopatrulha.C, id: "dados-C", s: "RP", c: "cont-C"},
            {d: dados.radiopatrulha.D, id: "dados-D", s: "RP", c: "cont-D"},
            {d: dados.radiopatrulha.E, id: "dados-E", s: "RP", c: "cont-E"},
            {d: dados.guarda.A, id: "dados-guarda-A", s: "GUARDA", c: "cont-guarda-A"},
            {d: dados.guarda.B, id: "dados-guarda-B", s: "GUARDA", c: "cont-guarda-B"},
            {d: dados.guarda.C, id: "dados-guarda-C", s: "GUARDA", c: "cont-guarda-C"},
            {d: dados.guarda.D, id: "dados-guarda-D", s: "GUARDA", c: "cont-guarda-D"},
            {d: dados.guarda.E, id: "dados-guarda-E", s: "GUARDA", c: "cont-guarda-E"}
        ];

        blocos.forEach(b => {
            renderizarEquipe(b.d, b.id, b.s);
            atualizarContadoresIndividuais(b.id, b.c);
        });
    } catch (erro) { 
        console.error("Erro ao carregar dados:", erro); 
    }
}

// ==========================================
// RENDERIZAÇÃO DA INTERFACE (EQUADRAMENTO E TAGS)
// ==========================================
function renderizarEquipe(militares, elementId, tipoServico) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = "";
    container.setAttribute("data-servico", tipoServico);
    container.setAttribute("data-cont-id", elementId.replace("dados-", "cont-").replace("guarda-", "guarda-"));

    militares.forEach(militar => {
        const div = document.createElement("div");
        div.className = "linha-militar";
        div.setAttribute("data-militar-bruto", militar.texto);
        div.setAttribute("data-prontidao-inicial", militar.prontidao);
        
        if (militar.prontidao === "INDISPONÍVEL") {
            div.style.textDecoration = "line-through";
            div.style.color = "#a0a0a0";
            div.style.backgroundColor = "#f2f2f2";
        }

        const textoBruto = militar.texto;
        const regexMatricula = /(1000\d{4,5})\s+(.+)/;
        let textoFormatado = "";

        if (regexMatricula.test(textoBruto)) {
            textoFormatado = textoBruto.replace(regexMatricula, function(match, matricula, resto) {
                const indiceMatricula = textoBruto.indexOf(matricula);
                return `<span>${textoBruto.substring(0, indiceMatricula)}${matricula} </span><strong>${resto}</strong>`;
            });
        } else {
            const partes = textoBruto.split(" ");
            const uNome = partes.pop();
            textoFormatado = `<span>${partes.join(" ")} </span><strong>${uNome}</strong>`;
        }
        
        let htmlTags = "";
        militar.afastamentos.forEach(af => {
            if (af.ativo) {
                htmlTags += `<span class="tag-obs tag-${af.tipo.toLowerCase()}">${af.tipo === 'FÉRIAS' ? 'Férias. Pronto dia: ' + af.retorno : af.tipo + ' até ' + af.retorno}</span>`;
            } else if (af.tipo === "PREVISÃO FÉRIAS" && af.mes) {
                htmlTags += `<span class="tag-obs tag-prev-ferias">Prev. Férias: ${af.mes}</span>`;
            }
        });

        militar.observacoes.forEach(ob => { 
            htmlTags += `<span class="tag-obs tag-texto-obs">⚠️ ${ob}</span>`; 
        });

        div.innerHTML = `
            <div class="militar-identidade">${textoFormatado}</div>
            <div class="bloco-observacoes">${htmlTags || '<span style="color:#999;font-style:italic;">Sem observações</span>'}</div>
        `;
        container.appendChild(div);
    });
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

// ==========================================
// CONTROLES DE INTERAÇÃO (MODO EDIÇÃO E COMPORTAMENTO)
// ==========================================
function toggleMenuLateral() { 
    document.getElementById("menu-lateral").classList.toggle("aberto"); 
}

function alternarOlhoEquipe(containerId, elementoIcone) {
    const alvo = document.getElementById(containerId);
    if (alvo) {
        alvo.classList.toggle("olho-aberto");
        elementoIcone.classList.toggle("ativo");
    }
}

function alternarModoEdicao() {
    const btn = document.getElementById("btn-editar");
    modoEdicao = !modoEdicao;
    if (modoEdicao) {
        btn.innerText = "💾 Salvar Alterações";
        btn.classList.add("modo-ativo");
        document.body.classList.add("modo-edicao-ativo");
        document.querySelectorAll('.lista-militares').forEach(el => {
            instanciasSortable.push(new Sortable(el, { 
                group: el.getAttribute("data-servico"), 
                animation: 150,
                onEnd: () => {
                    // Recalcula os contadores dinamicamente ao soltar o militar em outra coluna
                    document.querySelectorAll(".lista-militares").forEach(c => {
                        atualizarContadoresIndividuais(c.id, c.getAttribute("data-cont-id"));
                    });
                }
            }));
        });
    } else {
        btn.innerText = "⌛ Salvando no Sheets...";
        btn.disabled = true;
        processarMudancasDeEquipe();
    }
}

// ==========================================
// PROCESSAMENTO E ENVIO DE DADOS (POST / GOOGLE SHEETS)
// ==========================================
async function processarMudancasDeEquipe() {
    const payload = { acao: "SALVAR_EQUIPES", data: { radiopatrulha: {}, guarda: {} } };
    const colunas = ["A", "B", "C", "D", "E"];
    
    colunas.forEach(eq => {
        payload.data.radiopatrulha[eq] = [];
        document.querySelectorAll(`#dados-${eq} .linha-militar`).forEach(el => { 
            payload.data.radiopatrulha[eq].push(el.getAttribute("data-militar-bruto")); 
        });
        
        payload.data.guarda[eq] = [];
        document.querySelectorAll(`#dados-guarda-${eq} .linha-militar`).forEach(el => { 
            payload.data.guarda[eq].push(el.getAttribute("data-militar-bruto")); 
        });
    });

    await enviarDadosAPI(payload);
    
    // Reseta estados visuais de edição pós envio
    const btn = document.getElementById("btn-editar");
    btn.innerText = "⚙️ Ativar Edição";
    btn.disabled = false;
    btn.classList.remove("modo-ativo");
    document.body.classList.remove("modo-edicao-ativo");
    instanciasSortable.forEach(i => i.destroy());
    instanciasSortable = [];
}

// Gatilho de Envio do Formulário da Barra Lateral Administrativa
async function salvarAfastamento(event) {
    event.preventDefault();
    const payload = {
        acao: "LANÇAR_AFASTAMENTO",
        data: {
            nome: document.getElementById("afast-nome").value.toUpperCase().trim(),
            tipo: document.getElementById("afast-tipo").value,
            inicio: document.getElementById("afast-inicio").value,
            dias: document.getElementById("afast-dias").value,
            obs: document.getElementById("afast-obs").value.trim()
        }
    };
    await enviarDadosAPI(payload);
    document.getElementById("form-afastamento").reset();
}

async function darProntoMilitar(linhaPlanilha) {
    if(confirm("Deseja encerrar este afastamento e dar pronto para o militar?")) {
        await enviarDadosAPI({ acao: "DAR_PRONTO", data: { linha: linhaPlanilha } });
    }
}

// Gerenciador central de requisições POST com tratamento de barreira CORS (no-cors)
async function enviarDadosAPI(payload) {
    try {
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        alert("Operação enviada com sucesso!");
        setTimeout(() => { carregarMapa(); }, 1500);
    } catch (e) { 
        alert("Erro de conexão ao enviar comandos."); 
    }
}

// Renderiza a lista de quem está impedido no dia dentro da Barra Lateral Admin
function renderizarListaMenuAdmin() {
    const div = document.getElementById("lista-afastados-atual");
    if(!div) return;
    
    if(dadosGlobaisAfastados.length === 0) { 
        div.innerHTML = "<em>Ninguém afastado hoje</em>"; 
        return; 
    }
    
    div.innerHTML = "";
    dadosGlobaisAfastados.forEach(a => {
        div.innerHTML += `
            <div class="item-lista-afastado">
                <div><strong>${a.nome}</strong> (${a.tipo})<br><small>Retorno: ${a.retorno}</small></div>
                <button class="btn-dar-pronto" onclick="darProntoMilitar(${a.linha})">Pronto</button>
            </div>
        `;
    });
}
