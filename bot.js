import { CLINICA, SERVICOS, SERVICO_KEYWORDS } from "./config.js";

function formatarServicos() {
  return SERVICOS.map(s => `• ${s.nome}: ${s.descricao}`).join("\n");
}

function buscarServicoPorTermo(texto) {
  const t = (texto || "").toLowerCase();
  for (const [nome, keywords] of Object.entries(SERVICO_KEYWORDS)) {
    for (const kw of keywords) {
      if (t.includes(kw)) {
        return SERVICOS.find(s => s.nome.toLowerCase() === nome);
      }
    }
  }
  for (const s of SERVICOS) {
    const nomeLower = s.nome.toLowerCase();
    if (t.includes(nomeLower)) return s;
    const palavras = nomeLower.split(" ").filter(p => p.length >= 4);
    for (const p of palavras) {
      if (t.includes(p)) return s;
    }
  }
  return null;
}

export function responder(mensagem, tipo = "texto") {
  const msg = (mensagem || "").toLowerCase().trim();

  // Imagem: análise acolhedora vinculada aos serviços (sem diagnóstico)
  if (tipo === "imagem") {
    const servico = buscarServicoPorTermo(msg);
    if (servico) {
      return `Obrigada por enviar a imagem! 💛 Pela sua descrição, o procedimento que pode te ajudar é ${servico.nome} (${servico.descricao}).\nMas o ideal é passar pela nossa avaliação gratuita de 30 min pra indicar com segurança o melhor pra você.\nQuer agendar?`;
    }
    return `Obrigada por enviar a imagem! 💛\nVou analisar com carinho e te indicar o melhor entre nossos serviços: limpeza de pele, microagulhamento, peeling, massagem modeladora e drenagem.\nO ideal é agendar nossa avaliação gratuita de 30 min pra te orientar com segurança. Quer agendar?`;
  }

  // Áudio: já vem transcrito como texto, responde normalmente
  // (se cair aqui com tipo audio sem transcrição, trata como texto genérico)
  if (tipo === "audio" && !msg) {
    return `Recebi seu áudio com carinho! 💛\nPosso te ajudar com valores, explicar nossos serviços ou agendar sua avaliação gratuita de 30 min.\nMe conta o que você gostaria de fazer?`;
  }

  // Cancelamento / reagendar - prioridade sobre horário
  if (["cancelar", "cancelamento", "desmarcar", "reagendar"].some(p => msg.includes(p))) {
    return `Sem problemas! Nossa política é cancelamento com aviso de 4h de antecedência 💛\nMe informa o dia/horário agendado que eu vou confirmar e retorno pra você!`;
  }
  if (["confirmação", "confirmacao", "confirmar presença"].some(p => msg.includes(p))) {
    return `Pedimos a confirmação até 2h antes do horário agendado, combinado? 😊\nMe confirma o nome e horário que eu já deixo tudo certinho!`;
  }

  // Saudação curta
  if (["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "oie"].some(p => msg.includes(p))) {
    if (msg.split(/\s+/).length <= 4) {
      return `Olá! Seja bem-vinda à ${CLINICA.nome} 💛\nEstamos no ${CLINICA.localizacao} e atendemos de ${CLINICA.horario}.\nComo posso te ajudar hoje? Posso te falar sobre nossos serviços e valores ou agendar sua avaliação gratuita de 30 min!`;
    }
  }

  // Horário / funcionamento
  if (["horário", "horario", "que horas", "funciona", "aberto", "fecha", "atende quando", "dias", "funcionamento"].some(p => msg.includes(p))) {
    return `Atendemos de ${CLINICA.horario} 😊\nFicamos no ${CLINICA.localizacao}, especializada em procedimentos faciais e corporais não invasivos.\nQuer agendar sua avaliação gratuita de 30 min?`;
  }
  if (["onde fica", "endereço", "endereco", "localização", "localizacao"].some(p => msg.includes(p))) {
    return `Ficamos no ${CLINICA.localizacao} 💛\nAtendemos de ${CLINICA.horario}.\nQuer que eu te envie mais detalhes para agendamento?`;
  }

  // Agendamento - nunca inventar disponibilidade
  if (["agendar", "agendamento", "marcar", "horário disponível", "horario disponivel", "vaga", "disponibilidade"].some(p => msg.includes(p))) {
    if (["hoje", "agora", "daqui a pouco", "em 1h", "em 2h"].some(p => msg.includes(p))) {
      return `Para agendamentos precisamos de no mínimo 24h de antecedência, tá? 💛\nTambém pedimos confirmação até 2h antes e, se precisar cancelar, avisar com 4h de antecedência.\nMe diz qual serviço te interessa e qual dia/horário você prefere que eu vou confirmar e retorno pra você com a informação certinha!`;
    }
    return `Claro! Agendamos com no mínimo 24h de antecedência 😊\nPedimos confirmação até 2h antes e cancelamento com 4h de aviso.\nMe conta qual serviço você gostaria e o melhor dia/horário pra você que eu vou confirmar e retorno!`;
  }

  // Valores / serviços - lista geral
  if (["valor", "valores", "preço", "preco", "quanto custa", "tabela", "serviços", "servicos", "procedimentos", "o que vocês fazem"].some(p => msg.includes(p))) {
    const servico = buscarServicoPorTermo(msg);
    if (servico) {
      const extra = servico.pacote ? ` E temos pacote: ${servico.pacote}` : "";
      return `${servico.nome}: ${servico.descricao}${extra} 💛\nTemos também avaliação inicial gratuita de 30 min pra te indicar o melhor procedimento.\nQuer agendar?`;
    }
    return `Claro! Nossos serviços e valores 💛\n${formatarServicos()}\n\nAtendemos de ${CLINICA.horario} e temos avaliação inicial gratuita de 30 min.\nMe diz qual te interessou que te explico melhor!`;
  }

  // Busca por serviço específico mesmo sem palavra "valor"
  const servico = buscarServicoPorTermo(msg);
  if (servico) {
    const extra = servico.pacote ? ` Temos também a opção de pacote: ${servico.pacote}.` : "";
    const duracao = servico.duracao || "aprox. 1h";
    return `Para ${servico.nome.toLowerCase()} o valor é ${servico.descricao}.${extra} 💛\nDura ${duracao} e fazemos de ${CLINICA.horario}.\nQuer agendar ou prefere passar pela nossa avaliação gratuita de 30 min primeiro?`;
  }

  // Serviços não listados - nunca inventar
  if (["botox", "preenchimento", "laser", "depilação", "depilacao", "cilios", "cílios", "unha", "sobrancelha"].some(p => msg.includes(p))) {
    return `Vou confirmar e retorno pra você com a informação certinha! 💛`;
  }

  // Fallback acolhedor
  return `Obrigada pelo contato! 💛\nPosso te ajudar com valores, explicar nossos serviços ou agendar sua avaliação gratuita de 30 min.\nMe conta o que você gostaria de fazer?`;
}
