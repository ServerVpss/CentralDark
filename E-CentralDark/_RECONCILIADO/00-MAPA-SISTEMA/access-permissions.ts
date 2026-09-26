// Catálogo de permissões — exibido na tela de Grupos de Acesso.
// Cada chave é estável (snake_case) e pode ser referenciada futuramente
// no backend pra autorizar ações específicas.

export type PermissionItem = {
  key: string;
  label: string;
  description: string;
};

export type PermissionGroup = {
  key: string;
  label: string;
  description: string;
  items: PermissionItem[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "agendamentos",
    label: "Agendamentos",
    description: "Grupo de permissões relacionadas a agendamentos",
    items: [
      { key: "agendamento.update", label: "Atualizar Agendamento", description: "Permite atualizar informações de agendamentos existentes" },
      { key: "agendamento.create", label: "Criar Agendamento", description: "Permite criar novos agendamentos" },
      { key: "agendamento.delete", label: "Excluir Agendamento", description: "Permite excluir agendamentos do sistema" },
      { key: "agendamento.view", label: "Visualizar Agendamento", description: "Permite visualizar, listar e buscar informações detalhadas de agendamentos" },
    ],
  },
  {
    key: "agentes_ia",
    label: "Agente de IA",
    description: "Grupo de permissões relacionadas a agentes de IA",
    items: [
      { key: "ia.update", label: "Atualizar Agente de IA", description: "Permite atualizar informações de agentes de IA existentes" },
      { key: "ia.create", label: "Criar Agente de IA", description: "Permite criar novos agentes de IA" },
      { key: "ia.delete", label: "Excluir Agente de IA", description: "Permite excluir agentes de IA do sistema" },
      { key: "ia.view", label: "Visualizar Agente de IA", description: "Permite visualizar, listar e buscar informações detalhadas de agentes de IA" },
    ],
  },
  {
    key: "canais",
    label: "Canais",
    description: "Grupo de permissões relacionadas a canais",
    items: [
      { key: "canais.logs", label: "Visualizar Logs do Canal", description: "Permite visualizar logs de conexão e atividades dos canais" },
    ],
  },
  {
    key: "chat_interno",
    label: "Chat Interno",
    description: "Grupo de permissões relacionadas ao chat interno",
    items: [
      { key: "chat_interno.access", label: "Acessar Chat Interno", description: "Permite acessar e interagir com o chat interno da conta." },
      { key: "chat_interno.create_group", label: "Criar Grupos Internos", description: "Permite criar grupos de chat interno." },
      { key: "chat_interno.edit_group", label: "Editar Grupos Internos", description: "Permite editar dados de grupos do chat interno." },
      { key: "chat_interno.manage_members", label: "Gerenciar membros de grupos internos", description: "Permite adicionar e remover membros dos grupos internos." },
      { key: "chat_interno.group", label: "Grupo Chat Interno", description: "Permissão de agrupamento para funcionalidades do chat interno." },
      { key: "chat_interno.transfer_leader", label: "Transferir liderança de grupo interno", description: "Permite transferir a liderança de grupos internos." },
    ],
  },
  {
    key: "chatbot",
    label: "Chatbot",
    description: "Grupo de permissões relacionadas a chatbot",
    items: [
      { key: "chatbot.access", label: "Acesso a chatbot", description: "Permite acesso completo a todas as funcionalidades de chatbot" },
      { key: "chatbot.view_messages", label: "Visualizar mensagens do chatbot", description: "Permite visualizar as mensagens que estão na etapa de chatbot (URA), sem assumir o atendimento." },
    ],
  },
  {
    key: "chats",
    label: "Chats",
    description: "Grupo de permissões relacionadas a chats",
    items: [
      { key: "chat.access", label: "Acesso a Chat", description: "Permite acesso completo a todas as funcionalidades de chat" },
      { key: "chat.change_presence", label: "Atualizar status do próprio usuário no chat", description: "Permite alterar manualmente o próprio status de presença no chat (online, ocupado, não perturbe, ausente e offline)." },
      { key: "chat.disable_finish_msg", label: "Desabilitar mensagem ao finalizar atendimento", description: "Permite desabilitar o envio de mensagem automática ao finalizar atendimento" },
      { key: "chat.disable_transfer_msg", label: "Desabilitar mensagem ao transferir atendimento", description: "Permite desabilitar o envio de mensagem automática ao transferir atendimento" },
      { key: "chat.outbound_bot", label: "Encaminhar para o Chatbot de Saída", description: "Permissão para ativar ou inativar o encaminhamento para o chatbot de saída" },
      { key: "chat.close_without_answer", label: "Encerrar atendimento sem atender", description: "Permite encerrar atendimento sem precisar atender o chat" },
      { key: "chat.pick_from_queue", label: "Escolher Chat da Fila", description: "Permite escolher e selecionar chats da fila de atendimento" },
      { key: "chat.manage_in_progress", label: "Gerenciar ciclo do atendimento em andamento", description: "Permite transferir e encerrar atendimentos em andamento sem ser o atendente primário." },
      { key: "chat.history", label: "Histórico de atendimento", description: "Permissão para acessar o histórico de atendimento" },
      { key: "chat.kanban", label: "Kanban de Chat", description: "Permite visualizar o kanban de chats por status" },
      { key: "chat.list_all", label: "Listar todas as conversas", description: "Permite listar todas as conversas sem limite ao setor" },
      { key: "chat.list_sector", label: "Listar todas as conversas do setor", description: "Permite listar todas as conversas limitado ao setor" },
      { key: "chat.closing_reason", label: "Motivo do encerramento", description: "Permite ativar ou desativar o preenchimento do motivo ao encerrar o atendimento na própria tela." },
      { key: "chat.preview", label: "Pré-visualizar Chat", description: "Permite pré-visualizar informações de chats" },
      { key: "chat.reopen", label: "Reabrir atendimento", description: "Permissão para reabrir uma conversa" },
      { key: "chat.view_agents", label: "Visualizar informações dos atendentes", description: "Permite visualizar os atendentes primário e secundários do atendimento, incluindo horário de entrada." },
    ],
  },
  {
    key: "contas",
    label: "Contas",
    description: "Grupo de permissões relacionadas a contas",
    items: [
      { key: "conta.customize", label: "Personalizar Conta", description: "Permite personalizar informações de contas existentes" },
    ],
  },
  {
    key: "contatos",
    label: "Contatos",
    description: "Grupo de permissões relacionadas a contatos",
    items: [
      { key: "contato.update", label: "Atualizar Contato", description: "Permite atualizar informações de contatos existentes" },
      { key: "contato.create", label: "Criar Contato", description: "Permite criar novos contatos" },
      { key: "contato.delete", label: "Excluir Contato", description: "Permite excluir contatos do sistema" },
      { key: "contato.view", label: "Visualizar Contato", description: "Permite visualizar, listar e buscar informações detalhadas de contatos" },
      { key: "contato.view_phone", label: "Visualizar número de telefone", description: "Permite visualizar o número completo de telefone de contatos (desmascarar)" },
    ],
  },
  {
    key: "grupos_acesso",
    label: "Grupos de Acesso",
    description: "Grupo de permissões que define e controla o nível de acesso do usuário às funcionalidades do sistema",
    items: [
      { key: "grupo_acesso.update", label: "Atualizar Grupo de Acesso", description: "Permite atualizar Grupo de Acesso" },
      { key: "grupo_acesso.create", label: "Criar Grupo de Acesso", description: "Permite criar novos Grupo de Acesso com permissões específicas" },
      { key: "grupo_acesso.delete", label: "Excluir Grupo de Acesso", description: "Permite excluir Grupo de Acesso do sistema" },
      { key: "grupo_acesso.view", label: "Visualizar Grupo de Acesso", description: "Permite visualizar, listar e buscar informações de Grupo de Acesso" },
    ],
  },
  {
    key: "grupos_contatos",
    label: "Grupos de Contatos",
    description: "Grupo de permissões relacionadas a grupos de contatos",
    items: [
      { key: "grupo_contato.update", label: "Atualizar Grupo de Contatos", description: "Permite atualizar grupos de contatos existentes" },
      { key: "grupo_contato.create", label: "Criar Grupo de Contatos", description: "Permite criar novos grupos de contatos" },
      { key: "grupo_contato.delete", label: "Excluir Grupo de Contatos", description: "Permite excluir grupos de contatos" },
      { key: "grupo_contato.view", label: "Visualizar Grupo de Contatos", description: "Permite visualizar, listar e buscar informações de grupos de contatos" },
    ],
  },
  {
    key: "home",
    label: "Home",
    description: "Grupo de permissões relacionadas à página inicial",
    items: [
      { key: "home.view", label: "Visualização de Dashboard", description: "Permite visualizar cards, gráficos e estatísticas da página inicial." },
    ],
  },
  {
    key: "informativos",
    label: "Informativos",
    description: "Grupo de permissões relacionadas a informativos",
    items: [
      { key: "informativo.update", label: "Atualizar Informativo", description: "Permite atualizar informações de informativos existentes" },
      { key: "informativo.create", label: "Criar Informativo", description: "Permite criar novos informativos" },
      { key: "informativo.delete", label: "Excluir Informativo", description: "Permite excluir informativos do sistema" },
      { key: "informativo.view", label: "Visualizar Informativo", description: "Permite visualizar, listar e buscar informações detalhadas de informativos" },
    ],
  },
  {
    key: "integracoes",
    label: "Integrações",
    description: "Grupo de permissões relacionadas a integrações",
    items: [
      { key: "integracao.access", label: "Acesso a Integrações", description: "Permite acesso completo ao grupo de integrações" },
      { key: "integracao.update_status", label: "Atualizar Status de Integração", description: "Permite atualizar o status de integrações" },
      { key: "integracao.generate_key", label: "Gerar Chave de Integração", description: "Permite gerar novas chaves para integrações" },
    ],
  },
  {
    key: "mensagens_aleatorias",
    label: "Mensagens Aleatórias",
    description: "Grupo de permissões relacionadas a mensagens aleatórias",
    items: [
      { key: "msg_aleatoria.update", label: "Atualizar Mensagens Aleatórias", description: "Permite atualizar mensagens aleatórias e seus itens" },
      { key: "msg_aleatoria.create", label: "Criar Mensagens Aleatórias", description: "Permite criar mensagens aleatórias e seus itens" },
      { key: "msg_aleatoria.delete", label: "Excluir Mensagens Aleatórias", description: "Permite excluir mensagens aleatórias e seus itens" },
      { key: "msg_aleatoria.view", label: "Visualizar Mensagens Aleatórias", description: "Permite visualizar, listar e buscar mensagens aleatórias" },
    ],
  },
  {
    key: "permissoes",
    label: "Permissões",
    description: "Grupo de permissões relacionadas a permissões",
    items: [
      { key: "permissao.edit", label: "Editar Permissões", description: "Permite editar e atualizar permissões de cargos" },
      { key: "permissao.view", label: "Visualizar Permissões", description: "Permite visualizar e listar grupos de permissão e suas permissões" },
    ],
  },
  {
    key: "planos",
    label: "Planos",
    description: "Grupo de permissões relacionadas a planos",
    items: [
      { key: "plano.billing", label: "Faturamento de Planos", description: "Permissão ao fluxo completo de planos" },
    ],
  },
  {
    key: "relatorios",
    label: "Relatórios",
    description: "Grupo de permissões relacionadas a relatórios de histórico de conversas e atendimentos",
    items: [
      { key: "relatorio.conversas", label: "Visualizar Histórico de Conversas", description: "Permite visualizar e acessar relatórios de histórico de conversas com informações de chats, mensagens, atendentes e filas" },
      { key: "relatorio.satisfacao", label: "Visualizar Relatório de Satisfação", description: "Permite visualizar e acessar relatórios de satisfação com as respostas dos clientes aos fluxos de chatbot" },
      { key: "relatorio.atendimentos", label: "Visualizar Relatórios de Atendimentos", description: "Permite visualizar e acessar relatórios de atendimentos com informações de filas, analistas e métricas de atendimento" },
    ],
  },
  {
    key: "setores",
    label: "Setores",
    description: "Grupo de permissões relacionadas a setores",
    items: [
      { key: "setor.update", label: "Atualizar Setor", description: "Permite atualizar informações de setores existentes" },
      { key: "setor.create", label: "Criar Setor", description: "Permite criar novos setores" },
      { key: "setor.delete", label: "Excluir Setor", description: "Permite excluir setores" },
      { key: "setor.view", label: "Visualizar Setor", description: "Permite visualizar, listar e buscar informações de setores" },
    ],
  },
  {
    key: "templates_etiqueta",
    label: "Templates de Etiqueta",
    description: "Grupo de permissões relacionadas a templates de etiquetas",
    items: [
      { key: "tpl_etiqueta.update", label: "Atualizar Template de Etiqueta", description: "Permite atualizar templates de etiquetas existentes" },
      { key: "tpl_etiqueta.create", label: "Criar Template de Etiqueta", description: "Permite criar novos templates de etiquetas" },
      { key: "tpl_etiqueta.delete", label: "Excluir Template de Etiqueta", description: "Permite excluir templates de etiquetas" },
      { key: "tpl_etiqueta.view", label: "Visualizar Template de Etiqueta", description: "Permite visualizar, listar e buscar templates de etiquetas" },
    ],
  },
  {
    key: "templates_mensagem",
    label: "Templates de Mensagem",
    description: "Grupo de permissões relacionadas a templates de mensagens",
    items: [
      { key: "tpl_msg.update", label: "Atualizar Template de Mensagem", description: "Permite atualizar templates de mensagens existentes" },
      { key: "tpl_msg.create", label: "Criar Template de Mensagem", description: "Permite criar novos templates de mensagens" },
      { key: "tpl_msg.delete", label: "Excluir Template de Mensagem", description: "Permite excluir templates de mensagens" },
      { key: "tpl_msg.view", label: "Visualizar Template de Mensagem", description: "Permite visualizar, listar e buscar templates de mensagens" },
    ],
  },
  {
    key: "usuarios",
    label: "Usuários",
    description: "Grupo de permissões relacionadas a usuários",
    items: [
      { key: "usuario.update", label: "Atualizar Usuário", description: "Permite atualizar informações de usuários existentes" },
      { key: "usuario.create", label: "Criar Usuário", description: "Permite criar novos usuários" },
      { key: "usuario.delete", label: "Excluir Usuário", description: "Permite excluir usuários" },
      { key: "usuario.view", label: "Visualizar Usuário", description: "Permite visualizar informações de usuários" },
    ],
  },
];

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export function isValidPermissionKey(key: string): boolean {
  return ALL_PERMISSION_KEYS.includes(key);
}
