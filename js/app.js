// ==========================================
// CONFIGURAÇÕES GERAIS E ESTADO DA APLICAÇÃO
// ==========================================
let instanciasSortable = [];
let modoEdicao = false;
let dadosGlobaisAfastados = [];
window.calendarioAtual = 0;
window.calendarios = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializa a estrutura de Toasts de forma segura
    if (typeof criarEstruturaToasts === "function") {
        criarEstruturaToasts();
    } else {
        console.warn("Aviso: Função 'criarEstruturaToasts' não encontrada no escopo global.");
    }

    // 2. Dispara a carga de dados inicial do sistema
    if (typeof carregarMapa === "function") {
        carregarMapa();
    }

    // 3. Configura a atualização em segundo plano (Polling)
    if (typeof configurarAtualizacaoAutomatica === "function") {
        configurarAtualizacaoAutomatica();
    }
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

    if (!alvo) return;

    alvo.classList.toggle("olho-aberto");

    elementoIcone.textContent =
        alvo.classList.contains("olho-aberto")
            ? "📖"
            : "📘";

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

    const payload = {
        acao: "SALVAR_EQUIPES",
        data: {
            radiopatrulha: {},
            guarda: {}
        }
    };

    CONFIG.EQUIPES.forEach(equipe => {

        payload.data.radiopatrulha[equipe] = [];

        document
            .querySelectorAll(`#dados-${equipe} .linha-militar`)
            .forEach(el => {
                payload.data.radiopatrulha[equipe].push(
                    el.dataset.militarBruto
                );
            });

        payload.data.guarda[equipe] = [];

        document
            .querySelectorAll(`#dados-guarda-${equipe} .linha-militar`)
            .forEach(el => {
                payload.data.guarda[equipe].push(
                    el.dataset.militarBruto
                );
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

    instanciasSortable.forEach(instancia => instancia.destroy());
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

function pesquisarMilitar(texto){

    texto = texto
        .trim()
        .toUpperCase();

    document
        .querySelectorAll(".linha-militar")
        .forEach(linha=>{

            linha.classList.remove("militar-encontrado");

            if(texto==="") return;

            if(linha.dataset.pesquisa.includes(texto)){

                linha.classList.add("militar-encontrado");

            }

        });

}

function abrirModalImpedimentos(){

    const modal =
        document.getElementById("modal-impedimentos");

    if(modal){

        modal.style.display="flex";

    }

}


function fecharModalImpedimentos(){

    const modal =
        document.getElementById("modal-impedimentos");

    if(modal){

        modal.style.display="none";

    }

}

window.calendarioAtual = calendarioAtual;
window.calendarios = calendarios;
