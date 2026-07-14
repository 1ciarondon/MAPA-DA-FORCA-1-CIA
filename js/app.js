// ==========================================
// CONFIGURAÇÕES GERAIS E ESTADO DA APLICAÇÃO
// ==========================================
let instanciasSortable = [];
let modoEdicao = false;
let dadosGlobaisAfastados = [];
let calendarioAtual = 0;
let calendarios = [];

document.addEventListener("DOMContentLoaded", () => {

    criarEstruturaToasts();

    carregarMapa();

    configurarAtualizacaoAutomatica();

    document
        .getElementById("btn-mes-anterior")
        ?.addEventListener("click", mesAnterior);

    document
        .getElementById("btn-proximo-mes")
        ?.addEventListener("click", proximoMes);

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

// Adicione estas duas funções ao final do seu js/app.js para dar vida ao Caveirinha no front:

async function lancarDebitoCaveirinha(nome, dataFolga, motivo, dataPagamento) {
    const payload = {
        acao: "LANÇAR_DEBITO_CAVEIRINHA",
        data: {
            nome: nome.toUpperCase().trim(),
            dataFolga: dataFolga,
            motivo: motivo.trim(),
            dataPagamento: dataPagamento
        }
    };
    return await enviarDadosAPI(payload);
}

async function quitarDebitoCaveirinha(linhaPlanilha) {
    if (confirm("Deseja dar baixa e quitar este débito do Caveirinha?")) {
        const payload = {
            acao: "QUITAR_DEBITO_CAVEIRINHA",
            data: { linha: linhaPlanilha }
        };
        return await enviarDadosAPI(payload);
    }
}
