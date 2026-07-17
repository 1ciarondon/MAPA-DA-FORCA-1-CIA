function formatarCabecalhoAnotacao(dataISO){

    const partes = dataISO.split("-");

    const data = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    const diasSemana = [
        "DOMINGO",
        "SEGUNDA-FEIRA",
        "TERÇA-FEIRA",
        "QUARTA-FEIRA",
        "QUINTA-FEIRA",
        "SEXTA-FEIRA",
        "SÁBADO"
    ];

    const diaSemana = diasSemana[data.getDay()];

    const horaAtual = new Date();

    const hora = String(horaAtual.getHours()).padStart(2,"0");

    const minuto = String(horaAtual.getMinutes()).padStart(2,"0");

     return `${diasSemana[data.getDay()]} | ${dia}/${mes}/${ano} | ${String(agora.getHours()).padStart(2,"0")}h${String(agora.getMinutes()).padStart(2,"0")}min`;
}


// ==========================================
// ANOTAÇÕES DO CALENDÁRIO
// ==========================================

function abrirJanelaAnotacao(data) {

    let modal = document.getElementById("modal-anotacao");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "modal-anotacao";

        modal.className = "modal-anotacao";

        modal.innerHTML = `

<div class="janela-anotacao">

    <div class="cabecalho-anotacao">

        <div>

            <h2>📅 Nova Anotação</h2>

            <small id="data-anotacao"></small>

        </div>

        <button
            class="btn-fechar-anotacao"
            onclick="fecharJanelaAnotacao()">

            ✕

        </button>

    </div>

    <div class="corpo-anotacao">

        <input
            id="titulo-anotacao"
            type="text"
            maxlength="80"
            placeholder="Título">

        <textarea
            id="texto-anotacao"
            rows="8"
            placeholder="Descreva o evento..."></textarea>

    </div>

    <div class="rodape-anotacao">

        <button
            class="btn-secundario"
            onclick="fecharJanelaAnotacao()">

            Cancelar

        </button>

        <button
            class="btn-principal"
            onclick="salvarAnotacao()">

            💾 Salvar

        </button>

    </div>

</div>

`;

        document.body.appendChild(modal);

    }

   modal.style.display = "flex";

document.getElementById("data-anotacao").innerText =
    formatarCabecalhoAnotacao(data);


// Carrega anotação existente
const anotacaoSalva = localStorage.getItem("anotacao_" + data);

if (anotacaoSalva) {

    const anotacao = JSON.parse(anotacaoSalva);

    document.getElementById("titulo-anotacao").value = anotacao.titulo || "";

    document.getElementById("texto-anotacao").value = anotacao.texto || "";

} else {

    document.getElementById("titulo-anotacao").value = "";

    document.getElementById("texto-anotacao").value = "";

}

}

function fecharJanelaAnotacao(){

    document.getElementById("modal-anotacao").style.display="none";

}

function salvarAnotacao(){

    const data = document.getElementById("data-anotacao").innerText;
    const titulo = document.getElementById("titulo-anotacao").value.trim();
    const texto = document.getElementById("texto-anotacao").value.trim();

    if (!titulo && !texto) {
        alert("Digite uma anotação antes de salvar.");
        return;
    }

    const anotacao = {
        data: data,
        titulo: titulo,
        texto: texto
    };

    localStorage.setItem(
        "anotacao_" + data,
        JSON.stringify(anotacao)
    );

    alert("Anotação salva!");

    fecharJanelaAnotacao();
}
