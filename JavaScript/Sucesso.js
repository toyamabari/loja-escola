function lerPedido() {
    try {
        const dados = JSON.parse(sessionStorage.getItem("pedido"));
        if (!dados || typeof dados !== "object" || !Array.isArray(dados.itens)) {
            return null;
        }
        return dados;
    } catch {
        return null;
    }
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function inicializarPaginaSucesso() {
    const pedido = lerPedido();
    const [areaPedido, areaVazia] = document.querySelectorAll(".sucesso");

    if (!areaPedido) return;

    function texto(seletor, valor) {
        const el = areaPedido.querySelector(seletor);
        if (el) el.textContent = valor ?? "";
    }

    function mostrarPagamento() {
        const area = areaPedido.querySelector(".sucesso-pagamento");
        if (!area) return;

        const numeroLimpo = escaparHTML(String(pedido.numero || "").replace("-", ""));
        const finalCartao = escaparHTML(String(pedido.finalCartao || "****"));

        if (pedido.pagamento === "pix") {
            area.innerHTML = `
        <p><strong>Pague com Pix</strong> — copie o código abaixo no app do seu banco:</p>
        <code>00020126ROLICE${numeroLimpo}5204000053039865802BR</code>
    `;
        } else if (pedido.pagamento === "boleto") {
            area.innerHTML = `
        <p><strong>Boleto gerado</strong> — vence em 3 dias úteis:</p>
        <code>34191.79001 01043.510047 91020.150008 1 ${numeroLimpo.slice(-6)}0000</code>
    `;
        } else {
            area.innerHTML = `<p><strong>Pago no cartão</strong> final ${finalCartao}. Aprovado!</p>`;
        }
    }

    if (pedido && pedido.itens.length > 0) {
        areaPedido.hidden = false;
        if (areaVazia) areaVazia.hidden = true;

        const primeiroNome = String(pedido.nome || "").trim().split(/\s+/)[0] || "Cliente";
        const dataFormatada = pedido.data
            ? new Date(pedido.data).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short"
            })
            : "";

        texto(".sucesso-nome", primeiroNome);
        texto(".sucesso-email", pedido.email);
        texto(".sucesso-numero", pedido.numero);
        texto(".sucesso-data", dataFormatada);
        texto(".sucesso-entrega", pedido.entrega);
        texto(".sucesso-endereco", pedido.endereco);

        mostrarPagamento();

        const listaItens = areaPedido.querySelector(".resumo-itens");
        if (listaItens) {
            listaItens.innerHTML = pedido.itens
                .map((item) => `
        <li class="resumo-item">
            <img src="${escaparHTML(item.imagem)}" alt="">
            <div class="resumo-item-info">
            <span>${escaparHTML(item.nome)}</span>
            <small>Quantidade: ${Number(item.qtd) || 1}</small>
            </div>
            <div class="resumo-item-lado">
            <strong>${formatarPreco(item.total)}</strong>
            </div>
        </li>
        `)
                .join("");
        }

        texto(".total-subtotal", formatarPreco(pedido.subtotal));
        texto(
            ".total-desconto",
            pedido.desconto > 0 ? "− " + formatarPreco(pedido.desconto) : formatarPreco(0)
        );
        texto(".total-frete", pedido.frete === 0 ? "Grátis" : formatarPreco(pedido.frete));
        texto(".total-geral", formatarPreco(pedido.total));
    } else {
        areaPedido.hidden = true;
        if (areaVazia) areaVazia.hidden = false;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarPaginaSucesso);
} else {
    inicializarPaginaSucesso();
}