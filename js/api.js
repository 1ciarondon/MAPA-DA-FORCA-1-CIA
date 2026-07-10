const API_URL = CONFIG.API_URL;

async function carregarMapa() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const dados = await response.json();

        gerenciarAlertaConexao(false);

        renderizarEspelhoCabecalho(dados.cabecalho_info || []);

        dadosGlobaisAfastados = dados.afastados_geral || [];

        renderizarListaMenuAdmin();

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
            renderizarEquipe(bloco.d, bloco.id, bloco.s);
            atualizarContadoresIndividuais(bloco.id, bloco.c);
        });

    } catch (erro) {

        console.error("Erro ao carregar dados:", erro);

        gerenciarAlertaConexao(true);

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

