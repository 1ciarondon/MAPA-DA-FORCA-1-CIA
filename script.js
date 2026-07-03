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

        // REQUISITO 4: Negritar tudo após o número que começa com 1000
        const textoBruto = militar.texto;
        const regexMatricula = /(1000\d{4,5})\s+(.+)/;
        let textoFormatado = textoBruto;

        if (regexMatricula.test(textoBruto)) {
            textoFormatado = textoBruto.replace(regexMatricula, function(match, matricula, resto) {
                // Acha onde a matrícula está no texto original para cortar certinho
                const indiceMatricula = textoBruto.indexOf(matricula);
                const postoGrad = textoBruto.substring(0, indiceMatricula);
                return `<span>${postoGrad}${matricula} </span><strong>${resto}</strong>`;
            });
        } else {
            // Fallback caso alguma linha não tenha o padrão de matrícula
            const partes = textoBruto.split(" ");
            const uNome = partes.pop();
            textoFormatado = `<span>${partes.join(" ")} </span><strong>${uNome}</strong>`;
        }
        
        // CONSTRUTOR DO OLHO MÁGICO
        let htmlTags = "";
        militar.afastamentos.forEach(af => {
            if (af.ativo) {
                if (af.tipo === "FÉRIAS") htmlTags += `<span class="tag-obs tag-ferias">Férias. Pronto dia: ${af.retorno}</span>`;
                else if (af.tipo === "MISSÃO") htmlTags += `<span class="tag-obs tag-missao">Missão até ${af.retorno}</span>`;
                else if (af.tipo === "LTS") htmlTags += `<span class="tag-obs tag-lts">LTS: ${af.periodo}</span>`;
                else htmlTags += `<span class="tag-obs tag-dispensa">${af.tipo}: ${af.periodo}</span>`;
            } else if (af.tipo === "PREVISÃO FÉRIAS" && af.mes) {
                htmlTags += `<span class="tag-obs tag-prev-ferias">Prev. Férias: ${af.mes}</span>`;
            }
        });

        militar.observacoes.forEach(ob => {
            htmlTags += `<span class="tag-obs tag-texto-obs">⚠️ ${ob}</span>`;
        });

        div.innerHTML = `
            <div class="militar-identidade">${textoFormatado}</div>
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
        btn.classList.add("olho-ativo");
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
            const grupoNome = el.getAttribute("data-servico");
            instanciasSortable.push(new Sortable(el, { group: grupoNome, animation: 150 }));
        });
    } else {
        btn.innerText = "⌛ Salvando no Sheets...";
        btn.disabled = true;
        processarMudancasDeEquipe();
    }
}

// REQUISITO 2: Mapeia a nova estrutura e envia para o Google Sheets
async function processarMudancasDeEquipe() {
    const payload = { radiopatrulha: {}, guarda: {} };
    const colunas = ["A", "B", "C", "D", "E"];
    
    colunas.forEach(eq => {
        payload.radiopatrulha[eq] = [];
        document.querySelectorAll(`#dados-${eq} .linha-militar`).forEach(el => {
            payload.radiopatrulha[eq].push(el.getAttribute("data-militar-bruto"));
        });
        
        payload.guarda[eq] = [];
        document.querySelectorAll(`#dados-guarda-${eq} .linha-militar`).forEach(el => {
            payload.guarda[eq].push(el.getAttribute("data-militar-bruto"));
        });
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", // Necessário para evitar bloqueio CORS do Apps Script do Google
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        alert("Escala atualizada com sucesso no Google Sheets!");
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        alert("Erro ao salvar comunicações.");
    }

    // Restaura o botão e recarrega para atualizar o painel de forma limpa
    const btn = document.getElementById("btn-editar");
    btn.innerText = "⚙️ Ativar Edição";
    btn.disabled = false;
    btn.classList.remove("modo-ativo");
    document.body.classList.remove("modo-edicao-ativo");
    instanciasSortable.forEach(i => i.destroy());
    instanciasSortable = [];
    carregarMapa();
}
