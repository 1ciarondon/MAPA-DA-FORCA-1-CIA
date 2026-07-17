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

    const modal = document.getElementById(
        "modal-caveirinha"
    );

    if(modal){

        modal.style.display="flex";

    }


    carregarCaveirinhas();

}



function fecharModalCaveirinha(){

    const modal = document.getElementById(
        "modal-caveirinha"
    );

    if(modal){

        modal.style.display="none";

    }

}



// Temporário até ligar na API

function carregarCaveirinhas(){

    const lista =
        document.getElementById(
            "lista-caveirinhas-atual"
        );


    if(!lista) return;


    lista.innerHTML =
    `
        <div style="
            padding:10px;
            color:#777;
            font-size:13px;
            text-align:center;
        ">
            Nenhum débito carregado.
        </div>
    `;

}
