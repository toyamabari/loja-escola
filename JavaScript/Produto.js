const id = new URLSearchParams(location.search).get("id");
const produto = typeof buscarProduto === "function" ? buscarProduto(id) : null;

const areaProduto = document.querySelector(".produto");
const naoEncontrado = document.querySelector(".produto-nao-encontrado");
const formCompra = document.querySelector(".produto-compra");
const campoQuantidade = document.querySelector("#quantidade");
const aviso = document.querySelector(".produto-aviso");
const listaRelacionados = document.querySelector(".relacionados .produtos");

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function preencherProduto() {
    if (!produto || !areaProduto) return;

    document.title = `${produto.nome} | Loja Rolice`;

    const imagem = document.querySelector(".produto-imagem");
    if (imagem) {
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.style.objectPosition = produto.foco || "center";
    }

    const mapaCategorias = typeof CATEGORIAS !== "undefined" ? CATEGORIAS : {};
    const corCategoria = mapaCategorias[produto.categoria]?.cor || "#1b75bb";
    areaProduto.style.setProperty("--cor", corCategoria);

    const setTexto = (seletor, texto) => {
        const el = document.querySelector(seletor);
        if (el) el.textContent = texto ?? "";
    };

    setTexto(".trilha-atual", produto.nome);
    setTexto(".produto-categoria", produto.categoria);
    setTexto(".produto-nome", produto.nome);
    setTexto(".produto-regra strong", produto.regra);
    setTexto(".produto-descricao", produto.descricao);
    setTexto(".produto-preco strong", formatarPreco(produto.preco));
    setTexto(
        ".produto-parcelas",
        `ou 10x de ${formatarPreco(produto.preco / 10)} sem juros`
    );

    const elPrecoAntigo = document.querySelector(".produto-preco s");
    const elEconomia = document.querySelector(".produto-economia");
    const temDesconto = produto.precoAntigo && produto.precoAntigo > produto.preco;

    if (elPrecoAntigo) {
        elPrecoAntigo.hidden = !temDesconto;
        if (temDesconto) elPrecoAntigo.textContent = formatarPreco(produto.precoAntigo);
    }

    if (elEconomia) {
        elEconomia.hidden = !temDesconto;
        if (temDesconto) {
            const desconto = Math.round((1 - produto.preco / produto.precoAntigo) * 100);
            elEconomia.textContent = `${desconto}% OFF`;
        }
    }

    const listaDetalhes = document.querySelector(".produto-detalhes");
    if (listaDetalhes && Array.isArray(produto.detalhes)) {
        listaDetalhes.innerHTML = produto.detalhes
            .map((detalhe) => `<li>${escaparHTML(detalhe)}</li>`)
            .join("");
    }
}

function lerQuantidade() {
    const qtd = parseInt(campoQuantidade?.value, 10);
    if (Number.isNaN(qtd) || qtd < 1) return 1;
    return Math.min(qtd, 10);
}

function mostrarRelacionados() {
    if (!listaRelacionados || typeof PRODUTOS === "undefined") return;

    const outros = PRODUTOS.filter((p) => String(p.id) !== String(id));

    outros.sort((a, b) => {
        const aMesma = produto && a.categoria === produto.categoria ? 0 : 1;
        const bMesma = produto && b.categoria === produto.categoria ? 0 : 1;
        return aMesma - bMesma;
    });

    listaRelacionados.innerHTML = outros
        .slice(0, 4)
        .map((p) => criarCard(p, "Produto.html"))
        .join("");

    if (typeof ativarBotoesDosCards === "function") {
        ativarBotoesDosCards(listaRelacionados);
    }
}

function inicializarPaginaProduto() {
    if (produto) {
        preencherProduto();

        formCompra?.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const qtd = lerQuantidade();
            adicionarAoCarrinho(produto.id, qtd);

            if (aviso) {
                const textoQtd = qtd === 1 ? "1 item adicionado" : `${qtd} itens adicionados`;
                aviso.innerHTML = `${textoQtd} ao carrinho. <a href="Checkout.html">Ir para o carrinho</a>`;
            }
        });

        const btnComprar = document.querySelector('[data-acao="comprar"]');
        btnComprar?.addEventListener("click", () => {
            adicionarAoCarrinho(produto.id, lerQuantidade());
            location.href = "Checkout.html";
        });
    } else {
        if (areaProduto) areaProduto.hidden = true;
        if (naoEncontrado) naoEncontrado.hidden = false;
        const trilha = document.querySelector(".trilha-atual");
        if (trilha) trilha.textContent = "Não encontrado";
    }

    mostrarRelacionados();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarPaginaProduto);
} else {
    inicializarPaginaProduto();
}