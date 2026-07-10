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

