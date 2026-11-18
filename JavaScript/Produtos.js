const PRODUTOS = [
    {
        id: "abraco-rolico",
        nome: "O Abraço Roliço (Pelúcia Mágica)",
        categoria: "Bem-estar",
        regra: "Rola morro abaixo",
        descricao: "Um abraço quentinho materializado em forma de um ser de pelúcia fofo, gordinho e cilíndrico.",
        detalhes: [
            "Enchimento de nuvem prensada",
            "Nunca solta antes da hora",
            "Lavável apenas com carinho"
        ],
        preco: 99.90,
        precoAntigo: 129.90,
        imagem: "Img/produtos/abraço-roliço.jpg"
    },
    {
        id: "tempestade-rolica",
        nome: "Tempestade Roliça (Engarrafada)",
        categoria: "Decoração",
        regra: "Sem quina nem dó",
        descricao: "Uma mini tempestade de verdade capturada dentro de um frasco de vidro roliço.",
        detalhes: [
            "Relâmpagos 100% inofensivos",
            "Som de chuva relaxante incluso",
            "Não abrir em dias de piquenique"
        ],
        preco: 129.90,
        precoAntigo: 177.70,
        imagem: "Img/produtos/tempestade-roliça.jpg"
    },
    {
        id: "relogio-do-tempo",
        nome: "Relógio do Tempo",
        categoria: "Decoração",
        regra: "Parece um erro de fabricação",
        descricao: "Um relógio cilíndrico em estilo steampunk que não mede as horas comuns, mas sim o clima da tua rotina.",
        detalhes: [
            "Engrenagens movidas a força de vontade",
            "Nuvens indicadoras de pausa",
            "Não atrasa nem adianta, apenas observa"
        ],
        preco: 294.90,
        precoAntigo: 319.90,
        imagem: "Img/produtos/relógio-do-tempo.jpg"
    },
    {
        id: "sopro-de-brisa",
        nome: "Sopro de Brisa",
        categoria: "Bem-estar",
        regra: "Leve como uma pena",
        descricao: "Um gerador de ar fresco portátil em formato de cápsula roliça que libera uma brisa acompanhada de pequenas nuvens e pétalas aromáticas.",
        detalhes: [
            "Brisa de manhã de primavera engarrafada",
            "Acompanha pétalas flutuantes infinitas",
            "Zero ruído, 100% frescor"
        ],
        preco: 159.90,
        precoAntigo: 189.90,
        imagem: "Img/produtos/sopro-de-brisa.jpg"
    },
    {
        id: "som-da-floresta",
        nome: "Som da Floresta",
        categoria: "Bem-estar",
        regra: "Não precisa de tomada",
        descricao: "Uma caixa de som acústica feita a partir de um tronco roliço coberto por musgo vivo que transforma qualquer áudio em melodias orgânicas.",
        detalhes: [
            "Musgo que cresce conforme o volume",
            "Emite notas musicais e folhas reais",
            "Não precisa regar (apenas colocar boa música)"
        ],
        preco: 199.90,
        precoAntigo: 229.90,
        imagem: "Img/produtos/som-da-floresta.jpg"
    },
    {
        id: "feitico-de-luz",
        nome: "Feitiço de Luz",
        categoria: "Decoração",
        regra: "Brilha no escuro",
        descricao: "Uma luminária cilíndrica de vidro que aprisiona uma pequena galáxia em seu interior, projetando um arco-íris estrelado pelo quarto.",
        detalhes: [
            "Contém três planetas anões e uma nebulosa",
            "Gira em órbita própria durante a noite",
            "Ajuda a desacelerar a mente antes de dormir"
        ],
        preco: 239.90,
        precoAntigo: 269.90,
        imagem: "Img/produtos/feitiço-de-luz.jpg"
    },
];

const RAIZ = location.pathname.includes("/pages/") ? "../" : "";
PRODUTOS.forEach((produto) => {
    if (!produto.imagem.startsWith("../") && !produto.imagem.startsWith("http")) {
        produto.imagem = RAIZ + produto.imagem;
    }
});

const CATEGORIAS = {
    "Todos": { icone: "🥔", cor: "#eb9418" },
    "Bem-estar": { icone: "🛞", cor: "#1b75bb" },
    "Decoração": { icone: "🦔", cor: "#0b2e59" },
    "Mais pesado que parece": { icone: "🍉", cor: "#d97706" },
    "Cores de salgadinho": { icone: "🟡", cor: "#2563eb" },
    "Parece um erro de fabricação": { icone: "🧩", cor: "#0f766e" }
};

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function formatarPreco(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buscarProduto(id) {
    if (!id) return undefined;
    return PRODUTOS.find((produto) => String(produto.id) === String(id));
}

function criarCard(produto, caminhoProduto = "Produto.html") {
    const link = `${caminhoProduto}?id=${encodeURIComponent(produto.id)}`;
    const cor = CATEGORIAS[produto.categoria]?.cor || "#1b75bb";
    const temDesconto = produto.precoAntigo && produto.precoAntigo > produto.preco;
    const desconto = temDesconto
        ? Math.round((1 - produto.preco / produto.precoAntigo) * 100)
        : 0;

    const nomeSeguro = escaparHTML(produto.nome);
    const categoriaSegura = escaparHTML(produto.categoria);
    const descricaoSegura = escaparHTML(produto.descricao);

    return `
    <article class="card" style="--cor: ${escaparHTML(cor)}">
    <a class="card-imagem" href="${link}">
        <img src="${escaparHTML(produto.imagem)}" alt="${nomeSeguro}" style="object-position: ${escaparHTML(produto.foco || "center")}">
        ${temDesconto ? `<span class="card-selo">-${desconto}%</span>` : ""}
    </a>
    <p class="card-categoria">${categoriaSegura}</p>
    <h3 class="card-titulo"><a href="${link}">${nomeSeguro}</a></h3>
    <p class="card-descricao">${descricaoSegura}</p>
    <div class="card-compra">
        <p class="card-preco">
        <strong>${formatarPreco(produto.preco)}</strong>
        ${temDesconto ? `<s>${formatarPreco(produto.precoAntigo)}</s>` : ""}
        </p>
        <button class="card-botao" type="button" data-id="${escaparHTML(produto.id)}" aria-label="Adicionar ${nomeSeguro} ao carrinho">+ Carrinho</button>
    </div>
    </article>
`;
}

function ativarBotoesDosCards(lista) {
    if (!lista || lista.dataset.botoesAtivos === "true") return;
    lista.dataset.botoesAtivos = "true";

    lista.addEventListener("click", (evento) => {
        const botao = evento.target.closest(".card-botao");
        if (!botao || botao.disabled) return;

        if (typeof adicionarAoCarrinho === "function") {
            adicionarAoCarrinho(botao.dataset.id, 1);
        }

        botao.textContent = "Adicionado ✓";
        botao.disabled = true;

        setTimeout(() => {
            botao.textContent = "+ Carrinho";
            botao.disabled = false;
        }, 1500);
    });
}