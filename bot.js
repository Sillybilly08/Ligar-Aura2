// Funil completo Bianca Velmora - Sem erros anteriores, robusto e anti-loop

const historicoPorUsuario = new Map();

function limparTexto(txt) {
  if (!txt) return "";
  return txt
    .replace(/[*_#`~]/g, "") // Remove markdown
    .trim();
}

function processarMensagem(userId, textoBruto) {
  const texto = limparTexto(textoBruto).toLowerCase();
  
  if (!historicoPorUsuario.has(userId)) {
    historicoPorUsuario.set(userId, {
      estado: 0,
      nome: null,
      objetivo: null,
      ofertaPrestada: false,
      objecoes: [],
      contagemLoop: 0,
      ultimaEntrada: null,
      ultimaResposta: null
    });
  }

  const st = historicoPorUsuario.get(userId);

  // Anti-loop por repetição exata
  if (st.ultimaEntrada === texto) {
    st.contagemLoop++;
  } else {
    st.contagemLoop = 0;
    st.ultimaEntrada = texto;
  }

  if (st.contagemLoop >= 3) {
    return formatarResposta(
      "Notei que estamos girando em torno do mesmo ponto 😊\n" +
      "Para que eu possa te ajudar melhor e tirar todas as suas dúvidas direto com nossa equipe, vou te encaminhar para um atendimento humano especializado. Um momento!"
    );
  }

  let resposta = "";

  // Detecção de saudação isolada se já iniciou
  if ((texto === "oi" || texto === "olá" || texto === "boa noite" || texto === "bom dia" || texto === "boa tarde") && st.estado > 0) {
    if (st.estado === 1) {
      resposta = `Oi novamente${st.nome ? ", " + st.nome : ""}! Para continuarmos, me conta qual é o seu principal objetivo com a linha Velmora? 😊`;
    } else if (st.estado >= 2) {
      resposta = `Oi${st.nome ? ", " + st.nome : ""}! Lembra que conversamos sobre o combo Velmo Black Drink e Cápsulas? Tem alguma dúvida sobre ele? 📸`;
    } else {
      resposta = `Oi! Estou por aqui. Como posso te ajudar hoje? 😊`;
    }
    st.ultimaResposta = resposta;
    return formatarResposta(resposta);
  }

  // Máquina de Estados
  switch (st.estado) {
    case 0: // Abertura e Captura de Nome
      st.nome = extrairNome(textoBruto);
      st.estado = 1;
      resposta = `Olá${st.nome ? " " + st.nome : ""}! Sou a Bianca, consultora oficial da Velmora 😊\n` +
                 `Trabalhamos com o Velmo Black Drink e as Cápsulas para quem busca emagrecimento saudável e energia.\n` +
                 `Qual é o seu principal objetivo hoje? Perder peso, dar gás no treino ou os dois? 📸`;
      break;

    case 1: // Qualificação de Objetivo
      st.objetivo = texto;
      st.estado = 2;
      resposta = `Entendi perfeitamente! Para o seu caso, o ideal é o nosso Combo Completo: o Velmo Black Drink pela manhã e as Cápsulas à tarde 😊\n` +
                 `Ele acelera o metabolismo e controla a ansiedade sem causar insônia.\n` +
                 `Posso te passar os valores e condições de envio para a sua região? 📸`;
      break;

    case 2: // Apresentação da Oferta
      if (texto.includes("sim") || texto.includes("quanto") || texto.includes("valor") || texto.includes("preço") || texto.includes("manda") || texto.includes("pode")) {
        st.oferta_prestada = true;
        st.estado = 3;
        resposta = `O nosso Combo Velmo Black (Drink + Cápsulas) sai com frete grátis e desconto especial para hoje 😊\n` +
                   `Muitas clientes já eliminam até 4kg nas primeiras semanas de uso.\n` +
                   `Você prefere pagamento via Pix com desconto extra ou cartão parcelado? 📸`;
      } else {
        resposta = `O combo une o Drink para energia imediata e as Cápsulas para queima contínua 😊\n` +
                   `Quer conferir os valores promocionais para fecharmos hoje?`;
      }
      break;

    case 3: // Fechamento / Pagamento
      if (texto.includes("pix") || texto.includes("cartao") || texto.includes("cartão") || texto.includes("quero") || texto.includes("fechar")) {
        st.estado = 4;
        resposta = `Excelente escolha! Para garantir o seu pedido com frete grátis, por favor me envie:\n` +
                   `1. Nome completo\n` +
                   `2. Endereço completo com CEP\n` +
                   `3. CPF para a nota fiscal 😊`;
      } else {
        resposta = `Me diga se prefere Pix ou cartão para eu gerar o seu link de atendimento seguro agora mesmo 😊`;
      }
      break;

    case 4: // Coleta de Dados / Finalização
      st.estado = 5;
      resposta = `Perfeito, dados anotados! Nossa equipe de logística já vai preparar o seu kit Velmo Black com carinho 📸\n` +
                 `Assim que o envio for feito, te mando o código de rastreio por aqui. Muito obrigado pela confiança! 😊`;
      break;

    default: // Estado 5 - Pós-venda / Suporte
      resposta = `Seu pedido já está em andamento com nossa equipe 😊 Se tiver qualquer dúvida sobre o uso do Velmo Black, é só chamar!`;
      break;
  }

  st.ultimaResposta = resposta;
  return formatarResposta(resposta);
}

function extrairNome(texto) {
  if (!texto) return null;
  const limpo = texto.trim();
  const palavras = limpo.split(/\s+/);
  
  // Ignora palavras comuns que não são nomes
  const ignorados = ["oi", "ola", "boa", "bom", "dia", "tarde", "noite", "quero", "vim", "preciso", "tudo", "sim", "nao", "não"];
  
  if (palavras.length === 1 && palavras[0].length > 2 && !ignorados.includes(palavras[0].toLowerCase())) {
    return palavras[0].charAt(0).toUpperCase() + palavras[0].slice(1).toLowerCase();
  }
  
  // Se disse "meu nome é X" ou "sou o X"
  const match = limpo.match(/(?:meu nome é|sou o|sou a|me chamo)\s+([a-zA-ZÀ-ÿ]+)/i);
  if (match && match[1]) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  }
  
  return null;
}

function formatarResposta(texto) {
  // Garante que não há markdown e respeita limite de linhas/emojis
  let limpo = limparTexto(texto);
  const linhas = limpo.split("\n");
  
  // Limite máximo de 5 linhas
  if (linhas.length > 5) {
    limpo = linhas.slice(0, 5).join("\n");
  }
  
  return limpo;
}

module.exports = { processarMensagem };
