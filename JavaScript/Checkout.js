const CUPOM_VALIDO = "ROLICEDIVINA";
const DESCONTO_CUPOM = 0.10;
const FRETE_GRATIS_A_PARTIR = 77.7;
const FRETES = {
    padrao: { nome: "Padrão (25 a 30 dias úteis)", valor: 7.7 },
    rapida: { nome: "A pé (em até 15 dias)", valor: 17.7 }
};

const areaCheckout = document.querySelector(".checkout");
const carrinhoVazio = document.querySelector(".carrinho-vazio");
const listaItens = document.querySelector(".resumo-itens");
const formCheckout = document.querySelector(".checkout-form");
const formCupom = document.querySelector(".cupom");
const campoCupom = document.querySelector("#cupom");
const mensagemCupom = document.querySelector(".cupom-mensagem");
const camposCartao = document.querySelector(".cartao-campos");

let cupomAplicado = false;

function arredondar(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function freteEscolhido() {
    const selecionado = formCheckout?.querySelector('input[name="frete"]:checked');
    return selecionado ? selecionado.value : "padrao";
}

function valorDoFrete(tipo, subtotal) {
    if (!FRETES[tipo]) return 0;
    if (tipo === "padrao" && subtotal >= FRETE_GRATIS_A_PARTIR) return 0;
    return FRETES[tipo].valor;
}

function calcularTotais() {
    const itens = itensDoCarrinho();
    const subtotal = arredondar(itens.reduce((soma, item) => soma + item.total, 0));
    const desconto = cupomAplicado ? arredondar(subtotal * DESCONTO_CUPOM) : 0;
    const tipoFrete = freteEscolhido();
    const frete = valorDoFrete(tipoFrete, subtotal);
    const total = arredondar(Math.max(0, subtotal - desconto + frete));

    return {
        itens,
        subtotal,
        desconto,
        tipoFrete,
        frete,
        total
    };
}

function mostrarItens(itens) {
    if (!listaItens) return;

    listaItens.innerHTML = itens
        .map((item) => {
            const p = item.produto;
            const nomeSeguro = escaparHTML(p.nome);
            const idSeguro = escaparHTML(String(p.id));
            const imgSegura = escaparHTML(p.imagem);

            return `
        <li class="resumo-item">
        <img src="${imgSegura}" alt="">
        <div class="resumo-item-info">
            <a href="Produto.html?id=${encodeURIComponent(p.id)}">${nomeSeguro}</a>
            <div class="quantidade" aria-label="Quantidade de ${nomeSeguro}">
            <button type="button" data-id="${idSeguro}" data-mudar="-1" aria-label="Diminuir">−</button>
            <span>${item.qtd}</span>
            <button type="button" data-id="${idSeguro}" data-mudar="1" aria-label="Aumentar">+</button>
            </div>
        </div>
        <div class="resumo-item-lado">
            <strong>${formatarPreco(item.total)}</strong>
            <button type="button" class="resumo-remover" data-id="${idSeguro}">Remover</button>
        </div>
        </li>
    `;
        })
        .join("");
}

function atualizarTela() {
    if (!areaCheckout || !carrinhoVazio) return;

    const totais = calcularTotais();

    if (totais.itens.length === 0) {
        areaCheckout.hidden = true;
        carrinhoVazio.hidden = false;
        return;
    }

    areaCheckout.hidden = false;
    carrinhoVazio.hidden = true;

    mostrarItens(totais.itens);

    const setTexto = (seletor, texto) => {
        const el = document.querySelector(seletor);
        if (el) el.textContent = texto;
    };

    setTexto(".total-subtotal", formatarPreco(totais.subtotal));
    setTexto(
        ".total-desconto",
        totais.desconto > 0 ? "− " + formatarPreco(totais.desconto) : formatarPreco(0)
    );
    setTexto(".total-frete", totais.frete === 0 ? "Grátis" : formatarPreco(totais.frete));
    setTexto(".total-geral", formatarPreco(totais.total));

    Object.keys(FRETES).forEach((tipo) => {
        const valor = valorDoFrete(tipo, totais.subtotal);
        setTexto(`[data-frete="${tipo}"]`, valor === 0 ? "Grátis" : formatarPreco(valor));
    });
}

listaItens?.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button");
    if (!botao) return;

    const idBotao = botao.dataset.id;
    const item = lerCarrinho().find((i) => String(i.id) === idBotao);
    if (!item) return;

    if (botao.dataset.mudar) {
        const novaQtd = Math.min(item.qtd + Number(botao.dataset.mudar), 10);
        alterarQuantidade(item.id, novaQtd);
    } else {
        alterarQuantidade(item.id, 0);
    }

    atualizarTela();
});

formCupom?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const codigo = campoCupom.value.trim().toUpperCase();

    if (codigo === CUPOM_VALIDO) {
        cupomAplicado = true;
        mensagemCupom.textContent = "Cupom aplicado: 10% de desconto!";
        mensagemCupom.className = "cupom-mensagem cupom-ok";
    } else {
        cupomAplicado = false;
        mensagemCupom.textContent = codigo ? "Cupom inválido." : "Digite um cupom.";
        mensagemCupom.className = "cupom-mensagem cupom-erro";
    }

    atualizarTela();
});

formCheckout?.addEventListener("change", (evento) => {
    if (evento.target.name === "frete") atualizarTela();
    if (evento.target.name === "pagamento" && camposCartao) {
        camposCartao.hidden = evento.target.value !== "cartao";
    }
});

function soNumeros(texto) {
    return String(texto || "").replace(/\D/g, "");
}

function mascarar(seletor, formatar) {
    const campo = document.querySelector(seletor);
    if (!campo) return;
    campo.addEventListener("input", () => {
        campo.value = formatar(soNumeros(campo.value));
    });
}

mascarar("#cep", (n) => {
    n = n.slice(0, 8);
    return n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
});

mascarar("#telefone", (n) => {
    n = n.slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
});

mascarar("#cartao-numero", (n) => n.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "));

mascarar("#cartao-validade", (n) => {
    n = n.slice(0, 4);
    return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
});

mascarar("#cartao-cvv", (n) => n.slice(0, 4));

const campoCep = document.querySelector("#cep");
const infoCep = campoCep?.parentElement.querySelector(".campo-info");
let cepConsultado = "";
let cepNaoEncontrado = false;

async function buscarCep(cep) {
    cepConsultado = cep;
    cepNaoEncontrado = false;
    if (infoCep) infoCep.textContent = "Buscando endereço...";

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!resposta.ok) throw new Error("Falha na requisição");
        const dados = await resposta.json();

        if (cep !== cepConsultado) return;

        if (dados.erro) {
            cepNaoEncontrado = true;
            if (infoCep) infoCep.textContent = "";
            validarCampo(campoCep);
            return;
        }

        const endereco = document.querySelector("#endereco");
        const cidade = document.querySelector("#cidade");

        if (endereco) {
            endereco.value = [dados.logradouro, dados.bairro].filter(Boolean).join(", ");
        }
        if (cidade) {
            cidade.value = `${dados.localidade} / ${dados.uf}`;
        }
        if (infoCep) infoCep.textContent = "Endereço encontrado ✓";

        validarCampo(campoCep);
        if (cidade) validarCampo(cidade);
        if (endereco?.value) {
            validarCampo(endereco);
            document.querySelector("#numero")?.focus();
        } else {
            endereco?.focus();
        }
    } catch {
        if (infoCep) {
            infoCep.textContent = "Não foi possível buscar o CEP agora. Preencha o endereço manualmente.";
        }
    }
}

campoCep?.addEventListener("input", () => {
    const cep = soNumeros(campoCep.value);

    if (cep.length === 8 && cep !== cepConsultado) {
        buscarCep(cep);
    } else if (cep.length < 8) {
        cepConsultado = "";
        cepNaoEncontrado = false;
        if (infoCep) infoCep.textContent = "";
    }
});

const REGRAS = {
    nome: (v) => (v.trim().split(/\s+/).length >= 2 ? "" : "Digite nome e sobrenome."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Digite um e-mail válido."),
    telefone: (v) => {
        const n = soNumeros(v);
        return n.length === 0 || n.length >= 10 ? "" : "Telefone incompleto.";
    },
    cep: (v) => {
        if (soNumeros(v).length !== 8) return "O CEP tem 8 números.";
        return cepNaoEncontrado ? "CEP não encontrado." : "";
    },
    cidade: (v) => (v.trim().length >= 2 ? "" : "Informe a cidade."),
    endereco: (v) => (v.trim().length >= 3 ? "" : "Informe o endereço."),
    numero: (v) => (v.trim() ? "" : "Informe o número."),
    "cartao-numero": (v) => (soNumeros(v).length === 16 ? "" : "O cartão tem 16 números."),
    "cartao-validade": (v) => {
        if (!/^\d{2}\/\d{2}$/.test(v)) return "Use o formato MM/AA.";
        const [mesStr, anoStr] = v.split("/");
        const mes = Number(mesStr);
        const ano = 2000 + Number(anoStr);
        if (mes < 1 || mes > 12) return "Mês inválido.";

        const hoje = new Date();
        const vencido =
            ano < hoje.getFullYear() || (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1);
        return vencido ? "Cartão vencido." : "";
    },
    "cartao-cvv": (v) => {
        const len = soNumeros(v).length;
        return len === 3 || len === 4 ? "" : "O CVV tem 3 ou 4 números.";
    }
};

function validarCampo(campo) {
    if (!campo) return true;
    const regra = REGRAS[campo.id];
    if (!regra) return true;

    const erro = regra(campo.value);
    const caixaErro = campo.parentElement?.querySelector(".campo-erro");

    if (caixaErro) caixaErro.textContent = erro;
    if (erro) {
        campo.setAttribute("aria-invalid", "true");
    } else {
        campo.removeAttribute("aria-invalid");
    }
    return !erro;
}

function camposParaValidar() {
    const ids = ["nome", "email", "telefone", "cep", "cidade", "endereco", "numero"];
    if (camposCartao && !camposCartao.hidden) {
        ids.push("cartao-numero", "cartao-validade", "cartao-cvv");
    }
    return ids.map((id) => document.getElementById(id)).filter(Boolean);
}

formCheckout?.addEventListener("focusout", (evento) => {
    if (evento.target.matches("input:not([type=radio])")) validarCampo(evento.target);
});

formCheckout?.addEventListener("input", (evento) => {
    if (evento.target.getAttribute("aria-invalid")) validarCampo(evento.target);
});

const NOMES_PAGAMENTO = { pix: "Pix", cartao: "Cartão de crédito", boleto: "Boleto" };

formCheckout?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const campos = camposParaValidar();
    const resultados = campos.map(validarCampo);
    const primeiroErro = campos[resultados.indexOf(false)];

    if (primeiroErro) {
        primeiroErro.focus();
        return;
    }

    const totais = calcularTotais();
    if (totais.itens.length === 0) return;

    const dados = new FormData(formCheckout);
    const pagamento = dados.get("pagamento");

    const pedido = {
        numero: "LI-" + Date.now().toString().slice(-6),
        data: new Date().toISOString(),
        nome: String(dados.get("nome") || "").trim(),
        email: String(dados.get("email") || "").trim(),
        endereco: `${String(dados.get("endereco") || "").trim()}, ${String(dados.get("numero") || "").trim()} – ${String(dados.get("cidade") || "").trim()} – CEP ${dados.get("cep")}`,
        entrega: FRETES[totais.tipoFrete]?.nome || "Padrão",
        pagamento,
        pagamentoNome: NOMES_PAGAMENTO[pagamento] || pagamento,
        finalCartao: pagamento === "cartao" ? soNumeros(dados.get("cartao-numero")).slice(-4) : "",
        itens: totais.itens.map((item) => ({
            nome: item.produto.nome,
            imagem: item.produto.imagem,
            qtd: item.qtd,
            total: item.total
        })),
        subtotal: totais.subtotal,
        desconto: totais.desconto,
        frete: totais.frete,
        total: totais.total
    };

    sessionStorage.setItem("pedido", JSON.stringify(pedido));
    esvaziarCarrinho();
    location.href = "Sucesso.html";
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", atualizarTela);
} else {
    atualizarTela();
}