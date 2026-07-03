// LINK DO SEU WEB APP (Vamos gerar no Apps Script no próximo passo)
const API_URL = "https://script.google.com/macros/s/AKfycby5LqbrVC1udTsWiQxoay2Igda3NFFpbomBJ8d_-FjGPS6H5J42BrIQxsSwzVUZruCD/exec"; 

let instanciasSortable = [];
let modoEdicao = false;

document.addEventListener("DOMContentLoaded", () => {
    carregarMapa();
});

async function carregarMapa() {
    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        
        renderizarEquipe(dados.radiopatrulha.A, "dados-A", "RP");
        renderizarEquipe(dados.radiopatrulha.B, "dados-B", "RP");
        renderizarEquipe(dados.radiopatrulha.C, "dados-C", "RP");
        renderizarEquipe(dados.radiopatrulha.D, "dados-D", "RP");
        renderizarEquipe(dados.radiopatrulha.E, "dados-E", "RP");
        
        renderizarEquipe(dados.guarda.A, "dados-guarda-A", "GUARDA");
        renderizarEquipe(dados.guarda.B, "dados-guarda-B", "GUARDA");
        renderizarEquipe(dados.guarda.C, "dados-guarda-C", "GUARDA");
        renderizarEquipe(dados.guarda.D, "dados-guarda-D", "GUARDA");
        renderizarEquipe(dados.guarda.E, "dados-guarda-E", "GUARDA");

    } catch (erro) {
        console.error("Erro ao puxar dados da planilha:", erro);
    }
}

function renderizarEquipe(militares, elementId, tipoServico) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    
    // Adiciona atributos de identificação no container da equipe
    container.setAttribute("data-servico", tipoServico);
    container.setAttribute("data-equipe", elementId.replace("dados-", "").replace("guarda-", ""));

    militares.forEach(militar => {
        const div = document.createElement("div");
        div.className = "linha-militar";
        
        // Guarda o texto bruto do militar como ID de referência
        div.setAttribute("data-militar-bruto", militar.texto);
        
        if (militar.prontidao === "INDISPONÍVEL") {
            div.style.textDecoration = "line-through";
            div.style.color = "#a0a0a0";
            div.style.backgroundColor = "#f2f2f2";
        }
        
        if (militar.status && militar.status !== "Disponível") {
            div.title = `Status: ${militar.status}`;
        }
        
        const partes = militar.texto.split(" ");
        const nomeGuerra = partes.pop();
        const postoMatricula = partes.join(" ");
        
        div.innerHTML = `<span>${postoMatricula} </span><strong>${nomeGuerra}</strong>`;
        container.appendChild(div);
    });
}

// Liga e Desliga a permissão de arrastar os nomes
function alternarModoEdicao() {
    const btn = document.getElementById("btn-editar");
    modoEdicao = !modoEdicao;
    
    if (modoEdicao) {
        btn.innerText = "💾 Salvar Alterações";
        btn.classList.add("modo-ativo");
        document.body.classList.add("modo-edicao-ativo");
        ativarArrastabilidade();
    } else {
        btn.innerText = "⚙️ Ativar Edição";
        btn.classList.remove("modo-ativo");
        document.body.classList.remove("modo-edicao-ativo");
        desativarArrastabilidade();
        processarMudancasDeEquipe();
    }
}

function ativarArrastabilidade() {
    // Inicializa o arrastador tático para a Radiopatrulha (Grupo: RP)
    document.querySelectorAll('.painel-equipes:nth-of-type(1) .lista-militares').forEach(el => {
        instanciasSortable.push(new Sortable(el, { group: 'RP', animation: 150 }));
    });
    
    // Inicializa o arrastador tático para a Guarda (Grupo: GUARDA)
    document.querySelectorAll('.painel-equipes:nth-of-type(2) .lista-militares').forEach(el => {
        instanciasSortable.push(new Sortable(el, { group: 'GUARDA', animation: 150 }));
    });
}

function desativarArrastabilidade() {
    instanciasSortable.forEach(instancia => instancia.destroy());
    instanciasSortable = [];
}

// Função que mapeia onde cada militar foi solto para salvar depois
function processarMudancasDeEquipe() {
    console.log("Calculando novas posições para enviar ao Sheets...");
    // Próxima fase: disparar o envio para o Google Sheets!
}
