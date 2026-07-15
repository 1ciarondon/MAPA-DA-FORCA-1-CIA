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

                <h2>Anotação</h2>

                <p id="data-anotacao"></p>

                <input
                    id="titulo-anotacao"
                    type="text"
                    placeholder="Título">

                <textarea
                    id="texto-anotacao"
                    rows="8"
                    placeholder="Digite a anotação..."></textarea>

                <div class="botoes-anotacao">

                    <button onclick="fecharJanelaAnotacao()">

                        Cancelar

                    </button>

                    <button onclick="salvarAnotacao()">

                        Salvar

                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(modal);

    }

   modal.style.display = "flex";

document.getElementById("data-anotacao").innerText = data;


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
