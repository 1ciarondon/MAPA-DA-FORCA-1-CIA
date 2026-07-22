/* ==========================================================
   RENDERIZAÇÃO DO MAPA DA FORÇA
========================================================== */


/* ==========================================================
   CRIA LINHA DO MILITAR
========================================================== */

function criarLinhaMilitar(militar){

    const linha = document.createElement("div");

    linha.className = "linha-militar";


    linha.dataset.nome = militar.texto;

    linha.dataset.prontidao = militar.prontidao;


    linha.dataset.pesquisa = [

        militar.texto,

        militar.prontidao,

        ...(militar.observacoes || []),

        ...(militar.afastamentos || [])
            .map(a => a.tipo)

    ]

    .join(" ")

    .toUpperCase();



    if(militar.prontidao === "INDISPONÍVEL"){

        linha.classList.add(
            "militar-indisponivel"
        );

    }



    linha.innerHTML = `

        <div class="militar-identidade">

            ${formatarNomeMilitar(militar.texto)}

        </div>


        <div class="bloco-observacoes">

            ${montarTags(
                militar.afastamentos,
                militar.observacoes
            )}

        </div>

    `;


    return linha;

}




/* ==========================================================
   RENDERIZA UMA EQUIPE
========================================================== */

function renderizarEquipe(
    militares,
    elementId,
    tipoServico
){

    const container =
        document.getElementById(elementId);


    if(!container){

        console.warn(
            "Container não encontrado:",
            elementId
        );

        return;

    }



    container.innerHTML = "";


    container.dataset.servico =
        tipoServico;



    container.classList.remove(
        "olho-aberto"
    );



    const fragment =
        document.createDocumentFragment();



    militares.forEach(militar => {


        fragment.appendChild(

            criarLinhaMilitar(militar)

        );


    });



    container.appendChild(fragment);



    atualizarContadoresIndividuais(

        elementId,

        elementId
            .replace(
                "dados-",
                "cont-"
            )

    );


}




/* ==========================================================
   LISTA DE AFASTADOS NO MENU
========================================================== */

function renderizarListaMenuAdmin(){


    const lista =
        document.getElementById(
            "lista-afastados-atual"
        );



    if(!lista) return;



    if(
        !dadosGlobaisAfastados ||
        dadosGlobaisAfastados.length === 0
    ){

        lista.innerHTML =
            "<em>Ninguém afastado hoje</em>";

        return;

    }



    lista.innerHTML =

    dadosGlobaisAfastados.map(a => `


        <div class="item-lista-afastado">


            <div>

                <strong>
                    ${a.nome}
                </strong>

                (${a.tipo})

                <br>

                <small>
                    Retorno:
                    ${a.retorno}
                </small>

            </div>



            <button

                class="btn-dar-pronto"

                onclick="
                darProntoMilitar(${a.linha})
                "

            >

                Pronto

            </button>


        </div>


    `).join("");

}





/* ==========================================================
   CONTADORES
========================================================== */


function atualizarContadoresIndividuais(

    containerId,

    contadorId

){


    const container =
        document.getElementById(
            containerId
        );


    const contador =
        document.getElementById(
            contadorId
        );



    if(
        !container ||
        !contador
    ) return;



    let prontos = 0;

    let indisponiveis = 0;



    container
    .querySelectorAll(".linha-militar")
    .forEach(linha => {


        if(
            linha.dataset.prontidao ===
            "INDISPONÍVEL"
        ){

            indisponiveis++;

        }

        else{

            prontos++;

        }


    });



    contador.innerHTML = `

        Prontos:
        <strong>${prontos}</strong>

        |

        Indisp:
        <strong>${indisponiveis}</strong>

    `;


}
