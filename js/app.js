// ==========================================
// CONFIGURAÇÕES GERAIS E ESTADO DA APLICAÇÃO
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycby5LqbrVC1udTsWiQxoay2Igda3NFFpbomBJ8d_-FjGPS6H5J42BrIQxsSwzVUZruCD/exec"; 
let instanciasSortable = [];
let modoEdicao = false;
let dadosGlobaisAfastados = [];

document.addEventListener("DOMContentLoaded", () => { 
    criarEstruturaToasts();
    carregarMapa();
    configurarAtualizacaoAutomatica();
});

// Exibe indicador visual de carregamento nas tabelas (Melhoria 1)
function mostrarLoading() {
    document.querySelectorAll(".lista-militares").forEach(div => {
        div.innerHTML = '<p class="carregando">🔄 Sincronizando com o Sheets...</p>';
    });
}

// Configura atualização automática em tempo real a cada 60 segundos (Melhoria 2)
function configurarAtualizacaoAutomatica() {
    setInterval(() => {
        if (!modoEdicao) {
            carregarMapa();
        }
    }, 3600000);
}

async function carregarMapa() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const dados = await response.json();

        gerenciarAlertaConexao(false);

        dadosGlobaisAfastados = dados.afastados_geral || [];

        renderizarListaMenuAdmin();

        const blocos = [
            { d: dados.radiopatrulha.A, id: "dados-A", s: "RP", c: "cont-A" },
            { d: dados.radiopatrulha.B, id: "dados-B", s: "RP", c: "cont-B" },
            { d: dados.radiopatrulha.C, id: "dados-C", s: "RP", c: "cont-C" },
            { d: dados.radiopatrulha.D, id: "dados-D", s: "RP", c: "cont-D" },
            { d: dados.radiopatrulha.E, id: "dados-E", s: "RP", c: "cont-E" },

            { d: dados.guarda.A, id: "dados-guarda-A", s: "GUARDA", c: "cont-guarda-A" },
            { d: dados.guarda.B, id: "dados-guarda-B", s: "GUARDA", c: "cont-guarda-B" },
            { d: dados.guarda.C, id: "dados-guarda-C", s: "GUARDA", c: "cont-guarda-C" },
            { d: dados.guarda.D, id: "dados-guarda-D", s: "GUARDA", c: "cont-guarda-D" },
            { d: dados.guarda.E, id: "dados-guarda-E", s: "GUARDA", c: "cont-guarda-E" }
        ];

        for (const bloco of blocos) {
            renderizarEquipe(bloco.d, bloco.id, bloco.s);
            atualizarContadoresIndividuais(bloco.id, bloco.c);
        }

    } catch (erro) {

        console.error("Erro ao carregar dados:", erro);

        gerenciarAlertaConexao(true);

    }
}




// Renderiza o esqueleto de cada equipe (Melhoria 5)
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

        fragment.appendChild(linha);

    });

    container.appendChild(fragment);

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
// CONTROLES DE INTERAÇÃO (MODO EDIÇÃO)
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

// Transições de estados textuais e desativação do botão de salvar (Melhoria 4)
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
                    document.querySelectorAll(".lista-militares").forEach(c => {
                        atualizarContadoresIndividuais(c.id, c.getAttribute("data-cont-id"));
                    });
                }
            }));
        });
    } else {
        btn.innerText = "⏳ Salvando...";
        btn.disabled = true;
        processarMudancasDeEquipe();
    }
}

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

    const sucesso = await enviarDadosAPI(payload);
    const btn = document.getElementById("btn-editar");
    
    if (sucesso) {
        btn.innerText = "✓ Salvo";
        setTimeout(() => {
            btn.innerText = "⚙️ Ativar Edição";
            btn.disabled = false;
            btn.classList.remove("modo-ativo");
            document.body.classList.remove("modo-edicao-ativo");
        }, 2000);
    } else {
        btn.innerText = "⚙️ Ativar Edição";
        btn.disabled = false;
    }

    instanciasSortable.forEach(i => i.destroy());
    instanciasSortable = [];
}

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

// Gerenciador central POST que renderiza Toasts elegantes (Melhoria 3)
async function enviarDadosAPI(payload) {

    try {

        lancarToast("Processando solicitação...", "info");

        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        lancarToast("Operação enviada com sucesso!", "sucesso");

        setTimeout(carregarMapa, 1200);

        return true;

    } catch (erro) {

        console.error("Erro ao enviar dados:", erro);

        lancarToast(
            "Não foi possível comunicar com o servidor.",
            "erro"
        );

        return false;

    }

}

// ==========================================
// CENTRAL DE COMPONENTES DE INTERFACE (TOASTS)
// ==========================================
function criarEstruturaToasts() {
    if(!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    if(!document.getElementById("alerta-conexao")) {
        const alerta = document.createElement("div");
        alerta.id = "alerta-conexao";
        alerta.innerText = "⚠️ Não foi possível sincronizar com o Google Sheets. Monitorando rede...";
        document.body.insertBefore(alerta, document.body.firstChild);
    }
}

function lancarToast(mensagem, tipo = "sucesso") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensagem;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("mostrar"), 100);

    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function gerenciarAlertaConexao(exibir) {
    const alerta = document.getElementById("alerta-conexao");
    if(alerta) {
        alerta.style.display = exibir ? "block" : "none";
    }
}

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
