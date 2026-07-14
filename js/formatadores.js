// ==========================================
// FUNÇÕES DE FORMATAR E GERAR ELEMENTOS (SUBFUNÇÕES)
// ==========================================

// Trata e isola a estilização visual de nomes e matrículas (Melhoria 7)
function formatarNomeMilitar(textoBruto) {

    if (!textoBruto) return "";

    // Remove espaços duplicados
    textoBruto = textoBruto
        .trim()
        .replace(/\s+/g, " ");

    // Procura a matrícula (1000xxxxx)
    const m = textoBruto.match(/^(.*?)\s(1000\d+)\s(.+)$/);

    if (!m) {
        return `<strong>${textoBruto}</strong>`;
    }

    let graduacao = m[1].trim();
    const matricula = m[2].trim();
    const nome = m[3].trim();

    // Remove qualquer graduação repetida no início
    {
        graduacao = graduacao.replace(graduacao + " ", "");
    }

    // Remove repetições como:
    // CB PM CB PM
    // 3º SGT PM 3º SGT PM
    // CAP PM CAP PM
    graduacao = graduacao.replace(
        /^(.+?)\s+\1$/i,
        "$1"
    );

       
    return `
        <span>${graduacao} ${matricula}</span>
        <strong>${nome}</strong>
    `;
}

// Monta o bloco de tags usando Arrays e validação cronológica (Melhoria 6, 8 e 10)
function montarTags(afastamentos, observacoes) {
    const tags = []; 
    const meses = { JANEIRO:1, FEVEREIRO:2, MARÇO:3, ABRIL:4, MAIO:5, JUNHO:6, JULHO:7, AGOSTO:8, SETEMBRO:9, OUTUBRO:10, NOVEMBRO:11, DEZEMBRO:12 };
    const mesAtual = new Date().getMonth() + 1;

    afastamentos.forEach(af => {
        if (af.ativo) {
            tags.push(`<span class="tag-obs tag-${af.tipo.toLowerCase()}">${af.tipo === 'FÉRIAS' ? 'Férias. Pronto dia: ' + af.retorno : af.tipo + ' até ' + af.retorno}</span>`);
        } else if (af.tipo === "PREVISÃO FÉRIAS" && af.mes) {
            // Regra inteligente (Melhoria 10): oculta a previsão caso o mês já tenha chegado ou passado
            if (meses[af.mes.toUpperCase()] >= mesAtual) {
                tags.push(`<span class="tag-obs tag-prev-ferias">Prev. Férias: ${af.mes}</span>`);
            }
        }
    });

    observacoes.forEach(ob => { 
        tags.push(`<span class="tag-obs tag-texto-obs">⚠️ ${ob}</span>`); 
    });

    return tags.length > 0 ? tags.join("") : '<span style="color:#999;font-style:italic;">Sem observações</span>';
}
