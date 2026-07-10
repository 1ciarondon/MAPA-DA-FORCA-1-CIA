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
        div.innerHTML = '<p class="carregando">🔄 Sincronizando com o banco de dados...</p>';
    });
}

// Configura atualização automática em tempo real a cada hora (Melhoria 2)
function configurarAtualizacaoAutomatica() {
    setInterval(() => {
        if (!modoEdicao) {
            carregarMapa();
        }
    }, 3600000);
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
