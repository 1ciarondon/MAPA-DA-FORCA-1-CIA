// ==========================================
// CENTRAL DE COMPONENTES DE INTERFACE (TOASTS)
// ==========================================
function criarEstruturaToasts() {
    if(!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    if(!document.getElementById("alerta-conexao")) {
        const alerta = document.createElement("div");
        alerta.id = "alerta-conexao";
        alerta.innerText = "⚠️ Não foi possível sincronizar com o Google Sheets. Monitorando rede...";
        document.body.insertBefore(alerta, document.body.firstChild);
    }
}

function lancarToast(mensagem, tipo = "sucesso") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensagem;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("mostrar"), 100);

    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function gerenciarAlertaConexao(exibir) {
    const alerta = document.getElementById("alerta-conexao");
    if(alerta) {
        alerta.style.display = exibir ? "block" : "none";
    }
}
