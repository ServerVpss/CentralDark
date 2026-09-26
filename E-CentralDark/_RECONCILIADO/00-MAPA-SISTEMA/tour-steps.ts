// Roteiro do tour guiado de primeiro acesso (14 passos).
// `target` é o seletor CSS do elemento destacado. Use null pra centralizar (boas-vindas/final).
// `route` (opcional) navega pra essa rota antes de mostrar o passo.

export type TourStep = {
  id: string;
  target: string | null;
  title: string;
  body: string;
  route?: string;
  placement?: "right" | "bottom" | "left" | "top" | "center";
};

// Versão mobile do tour: sem target de sidebar (que fica escondida no celular).
// Cada passo NAVEGA pra uma rota real, então a tela muda atrás do overlay e
// o usuário sente o progresso a cada toque em "Próximo".
export const TOUR_STEPS_MOBILE: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Bem-vindo ao MultiZap! 👋",
    body: "Em 30 segundos eu te mostro o que dá pra fazer aqui no celular. Pode pular quando quiser.",
    placement: "center",
  },
  {
    id: "home",
    target: null,
    title: "Início",
    body: "Esta é a sua visão geral: métricas do dia, atalhos e o que precisa de atenção agora.",
    route: "/app",
    placement: "center",
  },
  {
    id: "chat",
    target: null,
    title: "Chat (Atendimento)",
    body: "Aqui você conversa com seus clientes do WhatsApp em tempo real.",
    route: "/app/chat",
    placement: "center",
  },
  {
    id: "kanban",
    target: null,
    title: "Kanban",
    body: "Acompanhe o status dos atendimentos em quadros visuais. Arraste pra mover de etapa.",
    route: "/app/tickets-kanban",
    placement: "center",
  },
  {
    id: "contatos",
    target: null,
    title: "Contatos",
    body: "Sua agenda completa de clientes — com histórico, tags e responsáveis.",
    route: "/app/contatos",
    placement: "center",
  },
  {
    id: "chatbot",
    target: null,
    title: "ChatBot",
    body: "Crie fluxos automáticos pra responder sozinho 24h por dia.",
    route: "/app/chatbot",
    placement: "center",
  },
  {
    id: "notificacoes",
    target: null,
    title: "Notificações",
    body: "Tudo que acontece no atendimento aparece aqui em tempo real.",
    route: "/app/notificacoes",
    placement: "center",
  },
  {
    id: "canais",
    target: null,
    title: "Canais & Configurações",
    body: "Em Canais, Setores, Usuários, Relatórios e Personalização você ajusta tudo do jeito que quiser.",
    route: "/app/canais",
    placement: "center",
  },
  {
    id: "done",
    target: null,
    title: "Pronto! 🚀",
    body: "Você pode refazer o tour quando quiser em Configurações → Refazer tour guiado.",
    placement: "center",
  },
];

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Bem-vindo ao MultiZap! 👋",
    body: "Em 1 minuto eu te mostro tudo que dá pra fazer aqui. Pode pular quando quiser.",
    placement: "center",
  },
  {
    id: "home",
    target: '[data-tour="nav-home"]',
    title: "Início",
    body: "Sua visão geral: métricas do dia, atalhos e o que precisa de atenção agora.",
    route: "/app",
    placement: "right",
  },
  {
    id: "chat",
    target: '[data-tour="nav-chat"]',
    title: "Chat (Atendimento)",
    body: "Onde você conversa com os clientes do WhatsApp em tempo real.",
    placement: "right",
  },
  {
    id: "kanban",
    target: '[data-tour="nav-kanban"]',
    title: "Kanban",
    body: "Acompanhe o status dos atendimentos em quadros visuais. Arraste pra mover etapa.",
    placement: "right",
  },
  {
    id: "contatos",
    target: '[data-tour="nav-contatos"]',
    title: "Contatos",
    body: "Sua agenda completa de clientes — com histórico, tags e responsáveis.",
    placement: "right",
  },
  {
    id: "chatbot",
    target: '[data-tour="nav-chatbot"]',
    title: "ChatBot",
    body: "Crie fluxos automáticos pra responder sozinho 24h por dia.",
    placement: "right",
  },
  {
    id: "notificacoes",
    target: '[data-tour="nav-notificacoes"]',
    title: "Notificações",
    body: "Tudo que acontece (mensagens novas, transferências, avisos) aparece aqui.",
    placement: "right",
  },
  {
    id: "configuracoes",
    target: '[data-tour="nav-configuracoes"]',
    title: "Configurações",
    body: "Aqui dentro ficam Canais, Setores, Usuários, Relatórios, Personalização e mais.",
    placement: "right",
  },
  {
    id: "topbar-bell",
    target: '[data-tour="topbar-bell"]',
    title: "Central de notificações",
    body: "O sininho no topo mostra conversas novas em tempo real, mesmo de outras telas.",
    placement: "bottom",
  },
  {
    id: "topbar-profile",
    target: '[data-tour="topbar-profile"]',
    title: "Seu perfil",
    body: "Foto, status e acesso ao menu da sua conta. Clique aqui pra abrir.",
    placement: "bottom",
  },
  {
    id: "sidebar-pin",
    target: '[data-tour="sidebar-pin"]',
    title: "Fixar ou recolher menu",
    body: "Recolha o menu pra ter mais espaço — ele abre sozinho ao passar o mouse.",
    placement: "right",
  },
  {
    id: "master",
    target: '[data-tour="nav-master"]',
    title: "Painel Master (opcional)",
    body: "Se você for Super Admin, gerencia todos os workspaces, planos e IA por aqui.",
    placement: "right",
  },
  {
    id: "done",
    target: null,
    title: "Pronto! 🚀",
    body: "Você pode refazer este tour a qualquer momento em Configurações → Refazer tour guiado.",
    placement: "center",
  },
];
