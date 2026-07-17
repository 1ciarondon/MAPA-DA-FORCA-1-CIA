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

function abrirModalCaveirinha(){

    document.getElementById(
        "modal-caveirinha"
    ).style.display="flex";

    carregarCaveirinhas();

}



function fecharModalCaveirinha(){

    document.getElementById(
        "modal-caveirinha"
    ).style.display="none";

}
