const API_URL = "https://script.google.com/macros/s/AKfycby5LqbrVC1udTsWiQxoay2Igda3NFFpbomBJ8d_-FjGPS6H5J42BrIQxsSwzVUZruCD/exec"; // Garanta que o seu link está aqui!
let instanciasSortable = [];
let modoEdicao = false;
let modoOlho = false;

document.addEventListener("DOMContentLoaded", () => { carregarMapa(); });

async function carregarMapa() {
    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        
        const blocos = [
            {d: dados.radiopatrulha.A, id: "dados-A", s: "RP"},
            {d: dados.radiopatrulha.B, id: "dados-B", s: "RP"},
            {d: dados.radiopatrulha.C, id: "dados-C", s: "RP"},
            {d: dados.radiopatrulha.D, id: "dados-D", s: "RP"},
            {d: dados.radiopatrulha.E, id: "dados-E", s: "RP"},
            {d: dados.guarda.A, id: "dados-guarda-A", s: "GUARDA"},
            {d: dados.guarda.B, id: "dados-guarda-B", s: "GUARDA"},
            {d: dados.guarda.C, id: "dados-guarda-C", s: "GUARDA"},
            {d: dados.guarda.D, id: "dados-guarda-D", s: "GUARDA"},
            {d: dados.guarda.E, id: "dados-guarda-E", s: "GUARDA"}
        ];

        blocos.forEach(b => renderizarEquipe(b.d, b.id, b.s));
    } catch (erro) { console.error("Erro ao carregar dados:", erro); }
}

function renderizarEquipe(militares, elementId, tipoServico) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    
    container.setAttribute("data-servico", tipoServico);
    container.setAttribute("data-equipe", elementId.replace("dados-", "").replace("guarda-", ""));

    militares.forEach(militar => {
        const div = document.createElement("div");
        div.className = "linha-militar";
        div.setAttribute("data-militar-bruto", militar.texto);
        
        if (militar.prontidao === "INDISPONÍVEL") {
            div.style.textDecoration = "line-through";
            div.style.color = "#a0a0a0";
            div.style.backgroundColor = "#f2f2f2";
        }

        const partes = militar.texto.split(" ");
        const nomeGuerra = partes.pop();
        const postoMatricula = partes.join(" ");
        
        // --- CONSTRUTOR DO OLHO MÁGICO (DADOS EXTRAS) ---
        let htmlTags = "";
        
        militar.afastamentos.forEach(af => {
            if (af.ativo) {
                if (af.tipo === "FÉRIAS") {
                    htmlTags += `<span class="tag-obs tag-ferias">Férias. Pronto dia: ${af.retorno}</span>`;
                } else if (af.tipo === "MISSÃO") {
                    htmlTags += `<span class="tag-obs tag-missao">Missão até ${af.retorno}</span>`;
                } else if (af.tipo === "LTS") {
                    htmlTags += `<span class="tag-obs tag-lts">LTS: ${af.periodo}</span>`;
                } else {
                    htmlTags += `<span class="tag-obs tag-dispensa">${af.tipo}: ${af.periodo}</span>`;
                }
            } else if (af.tipo === "PREVISÃO FÉRIAS" && af.mes) {
                htmlTags += `<span class="tag-obs tag-prev-ferias">Prev. Férias: ${af.mes}</span>`;
            }
        });

        militar.observacoes.forEach(ob => {
            htmlTags += `<span class="tag-obs tag-texto-obs">⚠️ ${ob}</span>`;
        });

        div.innerHTML = `
            <div><span>${postoMatricula} </span><strong>${nomeGuerra}</strong></div>
            <div class="bloco-observacoes">${htmlTags || '<span style="color:#999;font-style:italic;">Sem observações</span>'}</div>
        `;
        
        container.appendChild(div);
    });
}

function alternarOlhoMagico() {
    const btn = document.getElementById("btn-olho");
    modoOlho = !modoOlho;
    
    if (modoOlho) {
        btn.innerText = "👁️ Ocultar Observações";
        btn.classList.add("olho-indigo");
        document.body.classList.add("olho-magico-ativo");
    } else {
        btn.innerText = "👁️ Mostrar Observações";
        btn.classList.remove("olho-indigo");
        document.body.classList.remove("olho-magico-ativo");
    }
}

function alternarModoEdicao() {
    const btn = document.getElementById("btn-editar");
    modoEdicao = !modoEdicao;
    if (modoEdicao) {
        btn.innerText = "💾 Salvar Alterações";
        btn.classList.add("modo-ativo");
        document.body.classList.add("modo-edicao-ativo");
        document.querySelectorAll('.lista-militares').forEach(el => {
            instanciasSortable.push(new Sortable(el, { group: el.parentNode.parentNode.className.includes('radiopatrulha') ? 'RP' : 'GUARDA', animation: 150 }));
        });
    } else {
        btn.innerText = "⚙️ Ativar Edição";
        btn.classList.remove("modo-ativo");
        document.body.classList.remove("modo-edicao-ativo");
        instanciasSortable.forEach(i => i.destroy());
        instanciasSortable = [];
    }
}
