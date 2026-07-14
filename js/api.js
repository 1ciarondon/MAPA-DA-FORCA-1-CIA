const API_URL = CONFIG.API_URL;

// =========================================================================
// DECLARAÇÃO FORÇADA DE ESCOPO GLOBAL (Para garantir visibilidade entre scripts)
// =========================================================================
window.calendarios = window.calendarios || [];
window.calendarioAtual = window.calendarioAtual || 0;
window.dadosGlobaisAfastados = window.dadosGlobaisAfastados || [];
window.dadosGlobaisEventos = window.dadosGlobaisEventos || {};

async function carregarMapa() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const dados = await response.json();

        gerenciarAlertaConexao(false);

        // ==========================================
        // EVENTOS DA AGENDA (SALVAMENTO GLOBAL)
        // ==========================================
        window.dadosGlobaisEventos = dados.eventos || {};

        // ==========================================
        // CALENDÁRIOS (ATRIBUÍDOS DIRETAMENTE AO WINDOW)
        // ==========================================
        window.calendarios = dados.calendarios || [];
        window.calendarioAtual = 0;

        // Força a atualização local das variáveis caso o outro arquivo precise delas diretamente
        if (typeof calendarios !== 'undefined') {
            calendarios = window.calendarios;
            calendarioAtual = window.calendarioAtual;
        }

        if (window.calendarios.length > 0) {
            renderizarCalendarioAtual();
        }

        // ==========================================
        // DADOS GERAIS
        // ==========================================
        window.dadosGlobaisAfastados = dados.afastados_geral || [];
        if (typeof dadosGlobaisAfastados !== 'undefined') {
            dadosGlobaisAfastados = window.dadosGlobaisAfastados;
        }

        if (typeof renderizarListaCaveirinhas === "function") {
            renderizarListaCaveirinhas(
                dados.caveirinhas || []
            );
        }

        renderizarListaMenuAdmin();

        // ==========================================
        // EQUIPES
        // ==========================================
        const blocos = [];

        CONFIG.EQUIPES.forEach(equipe => {
            blocos.push({
                d: dados.radiopatrulha[equipe],
                id: `dados-${equipe}`,
                s: "RP",
                c: `cont-${equipe}`
            });

            blocos.push({
                d: dados.guarda[equipe],
                id: `dados-guarda-${equipe}`,
                s: "GUARDA",
                c: `cont-guarda-${equipe}`
            });
        });

        blocos.forEach(bloco => {
            renderizarEquipe(
                bloco.d,
                bloco.id,
                bloco.s
            );

            atualizarContadoresIndividuais(
                bloco.id,
                bloco.c
            );
        });

    }
    catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        gerenciarAlertaConexao(true);
    }
}

// ==========================================
// POST
// ==========================================

async function enviarDadosAPI(payload) {
    try {
        lancarToast("Processando solicitação...", "info");

        // Usar fetch com tratamento adequado para o comportamento do GAS redirecionado
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", // Necessário para evitar bloqueios de CORS pré-flight no GAS
            cache: "no-cache",
            headers: {
                "Content-Type": "text/plain" // Evita o pré-flight do CORS que o GAS rejeita
            },
            body: JSON.stringify(payload)
        });

        // Como o modo é "no-cors", a resposta é opaca e não podemos ler o JSON de retorno.
        // Assumimos sucesso caso a promessa de fetch não dispare erro de rede (catch)
        lancarToast("Operação enviada com sucesso!", "sucesso");
        
        setTimeout(carregarMapa, 1200);
        return true;
    }
    catch (erro) {
        console.error("Erro na comunicação com a API:", erro);
        lancarToast("Não foi possível comunicar com o servidor.", "erro");
        return false;
    }
}
