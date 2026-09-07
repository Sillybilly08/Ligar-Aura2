// Clínica Lena - Configuração Oficial
// Nunca invente valores fora daqui. Se não estiver listado: "Vou confirmar e retorno."

export const CLINICA = {
  nome: "Clínica Lena de Estética",
  horario: "segunda a sábado, das 9h às 19h",
  localizacao: "centro da cidade",
  especialidade: "procedimentos faciais e corporais não invasivos",
  whatsapp: "5591920029187"
};

export const SERVICOS = [
  { nome: "Limpeza de pele profunda", valor: 180, duracao: "1h", descricao: "R$ 180 (1h)" },
  { nome: "Limpeza de pele + extração", valor: 220, duracao: "1h15", descricao: "R$ 220 (1h15)" },
  { nome: "Microagulhamento facial", valor: 350, pacote: "4 sessões por R$ 1.200", descricao: "R$ 350 (sessão) ou pacote de 4 sessões por R$ 1.200" },
  { nome: "Peeling químico facial", valor: 280, descricao: "R$ 280" },
  { nome: "Massagem modeladora corporal", valor: 150, pacote: "8 sessões por R$ 1.000", descricao: "R$ 150 (sessão) ou pacote de 8 sessões por R$ 1.000" },
  { nome: "Drenagem linfática", valor: 130, descricao: "R$ 130 (sessão)" },
  { nome: "Avaliação inicial gratuita", valor: 0, duracao: "30 min", descricao: "30 min, sem custo" },
];

export const POLITICA = {
  antecedencia: "Agendamento com no mínimo 24h de antecedência",
  confirmacao: "Confirmação de presença até 2h antes",
  cancelamento: "Cancelamento com aviso de 4h",
};

export const SERVICO_KEYWORDS = {
  "limpeza de pele profunda": ["cravo", "espinha", "poro", "oleosidade", "limpeza simples"],
  "limpeza de pele + extração": ["cravo", "extração", "limpeza com extração"],
  "microagulhamento facial": ["mancha", "cicatriz", "acne", "ruga", "poro aberto", "rejuvenescimento"],
  "peeling químico facial": ["mancha", "melasma", "textura", "clareamento", "peeling"],
  "massagem modeladora corporal": ["gordura localizada", "celulite", "modelar", "corpo", "medida"],
  "drenagem linfática": ["inchaço", "retenção", "pós-operatório", "leveza", "drenagem"],
  "avaliação inicial gratuita": ["avaliação", "conhecer", "primeira vez", "qual procedimento", "dúvida"],
};
