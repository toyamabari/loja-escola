const CHAVE_CARRINHO = "carrinho";

function lerCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContador();
}

function adicionarAoCarrinho(id, qtd = 1) {
    const quantidade = Number(qtd);
    if (!Number.isFinite(quantidade) || quantidade <= 0) return;

    const carrinho = lerCarrinho();
    const item = carrinho.find((i) => i.id === id);

    if (item) {
        item.qtd += quantidade;
    } else {
        carrinho.push({ id, qtd: quantidade });
    }

    salvarCarrinho(carrinho);
}

function alterarQuantidade(id, qtd) {
    const quantidade = Number(qtd);
    if (!Number.isFinite(quantidade)) return;

    let carrinho = lerCarrinho();

    if (quantidade <= 0) {
        carrinho = carrinho.filter((i) => i.id !== id);
    } else {
        const item = carrinho.find((i) => i.id === id);
        if (item) item.qtd = quantidade;
    }

    salvarCarrinho(carrinho);
}

function removerDoCarrinho(id) {
    alterarQuantidade(id, 0);
}

function esvaziarCarrinho() {
    localStorage.removeItem(CHAVE_CARRINHO);
    atualizarContador();
}

function itensDoCarrinho() {
    if (typeof buscarProduto !== "function") {
        console.warn("A função 'buscarProduto(id)' não foi definida.");
        return [];
    }

    return lerCarrinho()
        .map((item) => {
            const produto = buscarProduto(item.id);
            if (!produto) return null;

            const total = Number((produto.preco * item.qtd).toFixed(2));
            return { produto, qtd: item.qtd, total };
        })
        .filter(Boolean);
}

function atualizarContador() {
    const total = lerCarrinho().reduce((soma, item) => soma + Number(item.qtd || 0), 0);

    document.querySelectorAll(".carrinho-contador").forEach((contador) => {
        contador.textContent = total;
        contador.hidden = total === 0;
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", atualizarContador);
} else {
    atualizarContador();
}