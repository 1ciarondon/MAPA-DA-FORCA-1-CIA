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



async function carregarCaveirinhas(){

    const lista =
        document.getElementById("lista-caveirinhas-atual");

    if(!lista) return;

    lista.innerHTML =
        "<div class='carregando'>Carregando...</div>";

    try{

        const resposta =
            await buscarDadosAPI({
                acao:"LISTAR_CAVEIRINHAS"
            });

        renderizarListaCaveirinhas(resposta);

    }catch(e){

        lista.innerHTML =
            "<div class='erro'>Erro ao carregar.</div>";

        console.error(e);

    }

}

function renderizarListaCaveirinhas(lista){

    const container =
        document.getElementById("lista-caveirinhas-atual");

    if(!container) return;

    if(!lista.length){

        container.innerHTML =
            "<div class='vazio'>Nenhum débito.</div>";

        return;

    }

    container.innerHTML = "";

    lista.forEach(item=>{

        const card=document.createElement("div");

        card.className="item-caveirinha";

        card.innerHTML=`

            <strong>${item.nome}</strong>

            <div>${item.motivo}</div>

            <small>

                Folga:
                ${item.dataFolga}

            </small>

            <small>

                Pagamento:
                ${item.dataPagamento}

            </small>

            <button
                onclick="quitarDebitoCaveirinha(${item.linha})">

                ✔ Quitar

            </button>

        `;

        container.appendChild(card);

    });

}
