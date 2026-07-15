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

}

function fecharJanelaAnotacao(){

    document.getElementById("modal-anotacao").style.display="none";

}

function salvarAnotacao(){

    alert("Depois vamos salvar no Google Sheets.");

}
