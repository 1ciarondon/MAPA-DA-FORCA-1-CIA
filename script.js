// LINK DO SEU WEB APP (Vamos gerar no Apps Script no próximo passo)
const API_URL = "https://script.google.com/macros/s/AKfycby5LqbrVC1udTsWiQxoay2Igda3NFFpbomBJ8d_-FjGPS6H5J42BrIQxsSwzVUZruCD/exec"; 

// Função que roda assim que o site abre
document.addEventListener("DOMContentLoaded", () => {
    carregarMapa();
});

async function carregarMapa() {
    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        
        // Limpa os textos de "Sincronizando..."
        renderizarEquipe(dados.radiopatrulha.A, "dados-A");
        renderizarEquipe(dados.radiopatrulha.B, "dados-B");
        renderizarEquipe(dados.radiopatrulha.C, "dados-C");
        renderizarEquipe(dados.radiopatrulha.D, "dados-D");
        renderizarEquipe(dados.radiopatrulha.E, "dados-E");
        
        renderizarEquipe(dados.guarda.A, "dados-guarda-A");
        renderizarEquipe(dados.guarda.B, "dados-guarda-B");
        renderizarEquipe(dados.guarda.C, "dados-guarda-C");
        renderizarEquipe(dados.guarda.D, "dados-guarda-D");
        renderizarEquipe(dados.guarda.E, "dados-guarda-E");

    } catch (erro) {
        console.error("Erro ao puxar dados da planilha:", erro);
    }
}

function renderizarEquipe(militares, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = ""; // Limpa o container
    
    if (militares.length === 0) {
        container.innerHTML = `<div class="linha-militar vazio">Nenhum militar alocado</div>`;
        return;
    }
    
    militares.forEach(militar => {
        const div = document.createElement("div");
        div.className = "linha-militar";
        
        // Adiciona atributo para o Drag & Drop (Requisito 1) futuramente
        div.setAttribute("draggable", "true"); 
        
        // REQUISITO 2: Se o militar estiver indisponível (Férias, Missão, etc)
        if (militar.prontidao === "INDISPONÍVEL") {
            div.style.textDecoration = "line-through";
            div.style.color = "#a0a0a0";
            div.style.backgroundColor = "#f2f2f2";
        }
        
        // REQUISITO 3: Hover com dados extras (Tooltip nativo por enquanto)
        if (militar.status && militar.status !== "Disponível") {
            div.title = `Status: ${militar.status}\nMotivo: ${militar.afastamento || 'Não especificado'}`;
        } else {
            div.title = "Pronto para o serviço";
        }
        
        // Separa o texto para negritar APENAS o nome de guerra
        const partes = militar.texto.split(" ");
        const nomeGuerra = partes.pop(); // Pega a última palavra (Nome)
        const postoMatricula = partes.join(" "); // O resto (Posto + PM + Matrícula)
        
        div.innerHTML = `<span>${postoMatricula} </span><strong>${nomeGuerra}</strong>`;
        container.appendChild(div);
    });
}
