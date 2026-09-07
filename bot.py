from config import CLINICA, SERVICOS, POLITICA, SERVICO_KEYWORDS

SYSTEM_PROMPT = f"""Você é a recepcionista virtual da {CLINICA['nome']}.
Seja acolhedora, natural e use linguagem simples. Responda de forma curta e simpática.

SOBRE A CLÍNICA:
- Horário: {CLINICA['horario']}
- Local: {CLINICA['localizacao']}
- Especialidade: {CLINICA['especialidade']}

SERVIÇOS:
{chr(10).join([f"- {s['nome']}: {s['descricao']}" for s in SERVICOS])}

POLÍTICA:
- {POLITICA['antecedencia']}
- {POLITICA['confirmacao']}
- {POLITICA['cancelamento']}

REGRAS:
- Nunca invente preço, disponibilidade ou informação não listada. Se perguntarem algo fora da lista, responda: "Vou confirmar e retorno pra você com a informação certinha! 💛"
- Para agendamento, lembre das regras de antecedência e confirmação.
- Se receber áudio: transcreva mentalmente e responda normalmente.
- Se receber imagem: analise e relacione com os serviços disponíveis.
- REGRA CRÍTICA DE WHATSAPP: Envie APENAS a resposta final em linguagem natural. NUNCA exponha raciocínio interno, ferramentas ou processamento.
"""

def formatar_servicos():
    linhas = []
    for s in SERVICOS:
        linhas.append(f"• {s['nome']}: {s['descricao']}")
    return "\n".join(linhas)

def buscar_servico_por_termo(texto: str):
    texto = texto.lower()
    for nome, keywords in SERVICO_KEYWORDS.items():
        for kw in keywords:
            if kw in texto:
                return next((s for s in SERVICOS if s['nome'].lower() == nome), None)
    # busca direta por nome (parcial: qualquer palavra do nome com 4+ letras)
    for s in SERVICOS:
        nome_lower = s['nome'].lower()
        if nome_lower in texto:
            return s
        palavras = [p for p in nome_lower.split() if len(p) >= 4]
        for p in palavras:
            if p in texto:
                return s
    return None

def responder(mensagem: str, tipo: str = "texto") -> str:
    """
    Gera resposta natural da recepcionista.
    tipo: "texto" | "audio" | "imagem"
    No WhatsApp, envie APENAS o retorno desta função.
    """
    msg = mensagem.lower().strip() if mensagem else ""

    # Política de cancelamento/confirmação tem prioridade sobre detecção de horário
    if any(p in msg for p in ["cancelar", "cancelamento", "desmarcar", "reagendar"]):
        return (
            f"Sem problemas! Nossa política é cancelamento com aviso de 4h de antecedência 💛\n"
            f"Me informa o dia/horário agendado que eu vou confirmar e retorno pra você!"
        )

    if any(p in msg for p in ["confirmação", "confirmacao", "confirmar presença"]):
        return (
            f"Pedimos a confirmação até 2h antes do horário agendado, combinado? 😊\n"
            f"Me confirma o nome e horário que eu já deixo tudo certinho!"
        )

    # Saudações (só mensagem curta)
    if any(p in msg for p in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "oie"]):
        if len(msg.split()) <= 4:
            return (
                f"Olá! Seja bem-vinda à {CLINICA['nome']} 💛\n"
                f"Estamos no {CLINICA['localizacao']} e atendemos de {CLINICA['horario']}.\n"
                f"Como posso te ajudar hoje? Posso te falar sobre nossos serviços e valores ou agendar sua avaliação gratuita de 30 min!"
            )

    # Horário / onde fica / endereço
    if any(p in msg for p in ["horário", "horario", "que horas", "funciona", "aberto", "fecha", "atende quando", "dias", "funcionamento"]):
        return (
            f"Atendemos de {CLINICA['horario']} 😊\n"
            f"Ficamos no {CLINICA['localizacao']}, especializada em procedimentos faciais e corporais não invasivos.\n"
            f"Quer agendar sua avaliação gratuita de 30 min?"
        )

    if any(p in msg for p in ["onde fica", "endereço", "endereco", "localização", "localizacao"]):
        return (
            f"Ficamos no {CLINICA['localizacao']} 💛\n"
            f"Atendemos de {CLINICA['horario']}.\n"
            f"Quer que eu te envie mais detalhes para agendamento?"
        )

    # Política de agendamento
    if any(p in msg for p in ["agendar", "agendamento", "marcar", "horário disponível", "horario disponivel", "vaga", "disponibilidade"]):
        # Nunca inventar disponibilidade específica
        if any(p in msg for p in ["hoje", "agora", "daqui a pouco", "em 1h", "em 2h"]):
            return (
                f"Para agendamentos precisamos de no mínimo 24h de antecedência, tá? 💛\n"
                f"Também pedimos confirmação até 2h antes e, se precisar cancelar, avisar com 4h de antecedência.\n"
                f"Me diz qual serviço te interessa e qual dia/horário você prefere que eu vou confirmar e retorno pra você com a informação certinha!"
            )
        return (
            f"Claro! Agendamos com no mínimo 24h de antecedência 😊\n"
            f"Pedimos confirmação até 2h antes e cancelamento com 4h de aviso.\n"
            f"Me conta qual serviço você gostaria e o melhor dia/horário pra você que eu vou confirmar e retorno!"
        )

    # Valores / serviços - lista geral
    if any(p in msg for p in ["valor", "valores", "preço", "preco", "quanto custa", "tabela", "serviços", "servicos", "procedimentos", "o que vocês fazem"]):
        # Se perguntou de algo específico, responde específico
        servico = buscar_servico_por_termo(msg)
        if servico:
            extra = f" E temos pacote: {servico['pacote']}" if "pacote" in servico else ""
            return (
                f"{servico['nome']}: {servico['descricao']}{extra} 💛\n"
                f"Temos também avaliação inicial gratuita de 30 min pra te indicar o melhor procedimento.\n"
                f"Quer agendar?"
            )
        return (
            f"Claro! Nossos serviços e valores 💛\n"
            f"{formatar_servicos()}\n\n"
            f"Atendemos de {CLINICA['horario']} e temos avaliação inicial gratuita de 30 min.\n"
            f"Me diz qual te interessou que te explico melhor!"
        )

    # Busca por serviço específico mesmo sem palavra "valor"
    servico = buscar_servico_por_termo(msg)
    if servico:
        extra = f" Temos também a opção de pacote: {servico['pacote']}." if "pacote" in servico else ""
        return (
            f"Para {servico['nome'].lower()} o valor é {servico['descricao']}.{extra} 💛\n"
            f"Dura {servico.get('duracao', 'aprox. 1h')} e fazemos de {CLINICA['horario']}.\n"
            f"Quer agendar ou prefere passar pela nossa avaliação gratuita de 30 min primeiro?"
        )

    # Áudio
    if tipo == "audio":
        # Transcreve e responde normalmente (simulação)
        return responder(mensagem, tipo="texto") + "\n\n[áudio transcrito com carinho 💛]"

    # Imagem
    if tipo == "imagem":
        # Análise genérica sem inventar diagnóstico
        if not msg:
            mensagem = "imagem enviada"
            msg = mensagem
        servico = buscar_servico_por_termo(msg) if msg else None
        if servico:
            return (
                f"Obrigada por enviar a imagem! 💛 Pela sua descrição, o procedimento que pode te ajudar é {servico['nome']} ({servico['descricao']}).\n"
                f"Mas o ideal é passar pela nossa avaliação gratuita de 30 min pra indicar com segurança o melhor pra você.\n"
                f"Quer agendar?"
            )
        return (
            f"Obrigada por enviar a imagem! 💛\n"
            f"Vou analisar com carinho e te indicar o melhor entre nossos serviços: limpeza de pele, microagulhamento, peeling, massagem modeladora e drenagem.\n"
            f"O ideal é agendar nossa avaliação gratuita de 30 min pra te orientar com segurança. Quer agendar?"
        )

    # Fallback - não inventar
    if any(p in msg for p in ["botox", "preenchimento", "laser", "depilação", "depilacao", "cilios", "cílios", "unha", "sobrancelha"]):
        return "Vou confirmar e retorno pra você com a informação certinha! 💛"

    # Resposta padrão acolhedora
    return (
        f"Obrigada pelo contato! 💛\n"
        f"Posso te ajudar com valores, explicar nossos serviços ou agendar sua avaliação gratuita de 30 min.\n"
        f"Me conta o que você gostaria de fazer?"
    )


# Exemplos de uso / teste rápido
if __name__ == "__main__":
    testes = [
        "Oi",
        "Quanto custa limpeza de pele?",
        "Quero fazer microagulhamento, qual o valor do pacote?",
        "Vocês atendem que horas?",
        "Quero agendar para hoje à tarde",
        "Tenho muita mancha de acne",
        "Vocês fazem botox?",
        "Preciso cancelar meu horário",
    ]
    for t in testes:
        print(f">> Cliente: {t}")
        print(responder(t))
        print("-" * 60)
