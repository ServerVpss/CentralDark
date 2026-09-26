/**
 * Traduz mensagens de erro técnicas (Meta / WhatsApp Cloud API)
 * para texto amigável em português, com sugestão de ação.
 */
export type FriendlyError = {
  title: string;      // 1 linha curta — o que aconteceu
  detail?: string;    // 1 linha — explicação
  action?: string;    // o que fazer agora
};

export function translateWhatsAppError(raw?: string | null): FriendlyError | null {
  if (!raw) return null;
  const s = raw.toLowerCase();

  // ---- Token / sessão Meta ----
  if (s.includes("session has expired") || s.includes("error validating access token")) {
    return {
      title: "🔑 A chave de acesso da Meta expirou",
      detail: "O token que liga este número à API do WhatsApp venceu.",
      action: "Vá em Canais → Reconectar para gerar uma nova chave. Leva 1 minuto.",
    };
  }
  if (
    s.includes("cannot parse access token") ||
    s.includes("malformed access token")
  ) {
    return {
      title: "🔑 Access Token mal formatado",
      detail:
        "A Meta não conseguiu ler esse token. Costuma ser cópia incompleta, espaço sobrando ou 'Bearer ' colado junto.",
      action:
        "Volte ao Meta Business → Usuários do sistema → Gerar token e cole o valor inteiro, sem espaços.",
    };
  }
  if (s.includes("invalid oauth access token") || s.includes("invalid access token")) {
    return {
      title: "🔑 Access Token inválido",
      detail:
        "A Meta não reconhece esse token. Pode ter expirado (tokens de teste duram 24h), ser de outro app, ou não ter as permissões whatsapp_business_messaging e whatsapp_business_management.",
      action:
        "Gere um token permanente em Business Settings → Usuários do sistema → Gerar token, marcando o app do WhatsApp.",
    };
  }
  if (s.includes("permission") && s.includes("denied")) {
    return {
      title: "🚫 Sem permissão na Meta",
      detail: "Sua conta do Facebook Business não tem permissão pra usar este número.",
      action: "Verifique no Meta Business se este número está liberado pra você.",
    };
  }

  // ---- PIN / verificação ----
  if (s.includes("verification code") && (s.includes("invalid") || s.includes("incorrect"))) {
    return {
      title: "❌ Código de 6 dígitos errado",
      detail: "O PIN que você digitou não confere com o que foi enviado.",
      action: "Confira o SMS e digite de novo, ou peça outro código.",
    };
  }
  if (s.includes("verification code") && s.includes("expired")) {
    return {
      title: "⏱ Código expirado",
      detail: "O PIN ficou parado mais de 10 minutos.",
      action: "Clique em Reenviar por SMS pra receber um novo.",
    };
  }
  if (s.includes("rate limit") || s.includes("too many requests")) {
    return {
      title: "⏳ Muitas tentativas seguidas",
      detail: "A Meta bloqueou novos pedidos por alguns minutos.",
      action: "Espere uns 5 minutos e tente de novo.",
    };
  }
  if (s.includes("phone number") && s.includes("already")) {
    return {
      title: "📵 Esse número já está em uso",
      detail: "Outra conta do WhatsApp Business está usando este telefone.",
      action: "Desative o WhatsApp do número no celular antes de cadastrar aqui.",
    };
  }

  // ---- Webhook / assinatura ----
  if (s.includes("signature") && (s.includes("invalid") || s.includes("inválida"))) {
    return {
      title: "🔐 Assinatura do webhook inválida",
      detail: "A Meta enviou uma mensagem mas a chave de segurança não bate.",
      action: "Confira o App Secret nas Configurações deste número.",
    };
  }

  // ---- Janela de 24h ----
  if (s.includes("re-engagement") || s.includes("24 hours") || s.includes("template")) {
    return {
      title: "⏰ Cliente fora da janela de 24h",
      detail: "Faz mais de 1 dia desde a última mensagem do cliente.",
      action: "Pra falar com ele agora, use um Template aprovado pela Meta.",
    };
  }

  // ---- Limites ----
  if (s.includes("messaging limit") || s.includes("tier")) {
    return {
      title: "📊 Limite diário da Meta atingido",
      detail: "Este número chegou no teto de envios do dia.",
      action: "Aguarde até amanhã ou peça aumento de tier no Meta Business.",
    };
  }

  // ---- Rede / timeout ----
  if (s.includes("timeout") || s.includes("network") || s.includes("etimedout")) {
    return {
      title: "🌐 Sem resposta da Meta",
      detail: "A conexão com o WhatsApp demorou demais.",
      action: "Tente de novo em alguns segundos.",
    };
  }

  // ---- Genérico ----
  return {
    title: "⚠ Algo deu errado com este número",
    detail: "A Meta retornou um erro que não conseguimos traduzir automaticamente.",
    action: "Veja os detalhes técnicos abaixo ou contate o suporte.",
  };
}

/** Versão curta para toast — 1 linha amigável em PT-BR. */
export function friendlyToastMessage(raw?: string | null): string {
  const f = translateWhatsAppError(raw);
  if (!f) return "Algo deu errado.";
  return f.action ? `${f.title} — ${f.action}` : f.title;
}

