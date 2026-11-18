const listaProdutos = document.querySelector(".produtos");
const areaFiltros = document.querySelector(".filtros");
const mensagemVazia = document.querySelector(".catalogo-vazio");
const contagem = document.querySelector(".catalogo-contagem");
const formBusca = document.querySelector(".busca");
const campoBusca = document.querySelector("#busca");

let categoriaAtual = "Todos";

function normalizar(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function mostrarProdutos() {
    if (!listaProdutos || typeof PRODUTOS === "undefined") return;

    const termo = normalizar(campoBusca?.value.trim());

    const filtrados = PRODUTOS.filter((produto) => {
        const naCategoria =
            categoriaAtual === "Todos" ||
            normalizar(produto.categoria) === normalizar(categoriaAtual);

        const textoDoProduto = normalizar(
            [produto.nome, produto.descricao, produto.categoria, produto.regra]
                .filter(Boolean)
                .join(" ")
        );

        return naCategoria && textoDoProduto.includes(termo);
    });

    listaProdutos.innerHTML = filtrados
        .map((produto) => criarCard(produto, "pages/Produto.html"))
        .join("");

    if (mensagemVazia) mensagemVazia.hidden = filtrados.length > 0;
    if (contagem) {
        contagem.textContent =
            filtrados.length === 1 ? "1 produto" : `${filtrados.length} produtos`;
    }
}

function criarFiltros() {
    if (!areaFiltros || typeof PRODUTOS === "undefined") return;

    const categorias = ["Todos"];
    PRODUTOS.forEach((produto) => {
        if (produto.categoria && !categorias.includes(produto.categoria)) {
            categorias.push(produto.categoria);
        }
    });

    const mapaCategorias = typeof CATEGORIAS !== "undefined" ? CATEGORIAS : {};

    areaFiltros.innerHTML = categorias
        .map((categoria) => {
            const ativo = categoria === categoriaAtual;
            const info = mapaCategorias[categoria] || { cor: "#1b75bb", icone: "✨" };
            const qtd =
                categoria === "Todos"
                    ? PRODUTOS.length
                    : PRODUTOS.filter((p) => p.categoria === categoria).length;

            const categoriaSegura = escaparHTML(categoria);

            return `
        <button type="button" class="filtro" data-categoria="${categoriaSegura}" aria-pressed="${ativo}" style="--cor: ${escaparHTML(info.cor)}">
        <span class="filtro-icone" aria-hidden="true">${info.icone}</span>
        <strong>${categoriaSegura}</strong>
        <span class="filtro-qtd">${qtd} ${qtd === 1 ? "produto" : "produtos"}</span>
        </button>
    `;
        })
        .join("");
}

function escolherCategoria(categoria) {
    categoriaAtual = categoria;

    areaFiltros?.querySelectorAll(".filtro").forEach((botao) => {
        botao.setAttribute("aria-pressed", String(botao.dataset.categoria === categoria));
    });

    mostrarProdutos();
}

areaFiltros?.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".filtro");
    if (!botao) return;
    escolherCategoria(botao.dataset.categoria);
});

const formNovidades = document.querySelector(".novidades-form");
formNovidades?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const email = formNovidades.querySelector("input");
    const mensagem = formNovidades.querySelector(".novidades-mensagem");

    if (!email || !mensagem) return;

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        mensagem.textContent = "Pronto! Você vai receber nossas ofertas roliças imperdíveis.";
        email.value = "";
    } else {
        mensagem.textContent = "Digite um e-mail válido.";
    }
});

formBusca?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarProdutos();
    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
});

campoBusca?.addEventListener("input", mostrarProdutos);

function inicializarCatalogo() {
    const buscaDaUrl = new URLSearchParams(location.search).get("busca");
    if (buscaDaUrl && campoBusca) {
        campoBusca.value = buscaDaUrl;
    }

    criarFiltros();
    mostrarProdutos();

    if (typeof ativarBotoesDosCards === "function" && listaProdutos) {
        ativarBotoesDosCards(listaProdutos);
    }

    if (buscaDaUrl) {
        document.querySelector("#catalogo")?.scrollIntoView();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarCatalogo);
} else {
    inicializarCatalogo();
}