import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

// =============== TYPES ===============
interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  is_bot?: boolean;
}

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
  photo?: unknown[];
  video?: unknown;
  document?: unknown;
  caption?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  chat_member?: unknown;
}

interface BotData {
  id: string;
  token: string;
  bot_username: string;
  user_id: string;
  bot_security_settings?: Array<{
    anti_link_enabled: boolean;
    anti_link_action: string;
    anti_spam_enabled: boolean;
    anti_spam_max_messages: number;
    anti_spam_interval_seconds: number;
    anti_spam_action: string;
    welcome_message_enabled: boolean;
    welcome_message: string;
  }>;
}

interface BotSettings {
  owner_ids: number[];
  group_chat_id: number | null;
  group_url: string | null;
  terms_text: string;
  terms_enabled: boolean;
  mute_new_members: boolean;
  announce_payments: boolean;
}

interface Plan {
  id: string;
  code: string;
  name: string;
  title: string;
  price: number;
  days: number;
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_days: number;
  value: number;
  started_at: string;
  expires_at: string;
  txid: string;
}

interface PendingPayment {
  id: string;
  txid: string;
  plan_name: string;
  plan_code: string;
  plan_days: number;
  plan_id: string;
  value: number;
  created_at: string;
  telegram_message_id?: number;
}

type InlineButton = { text: string; callback_data?: string; url?: string };

// =============== API PROVIDERS ===============
interface ApiProvider {
  baseUrl: string;
  port: number;
}

const providers: Record<string, ApiProvider> = {
  nexfuture: { baseUrl: "http://nxf-2.nexfuture.com.br", port: 25589 },
  tconect_score: { baseUrl: "http://node.tconect.xyz", port: 3029 },
  tconect_foto: { baseUrl: "http://node.tconect.xyz", port: 3030 },
};

const nexfutureEndpoints: Record<string, string> = {
  cpf: "/cpf", cnpj: "/cnpj", placa: "/placa", telefone: "/telefone",
  rg: "/rg", cns: "/cns", cnh: "/cnh", nome: "/nome", parentes: "/parentes",
  empregos: "/empregos", email: "/email", cep: "/cep", pix: "/pix",
  chassi: "/chassi", renavam: "/renavam", motor: "/motor", frota: "/frota", bin: "/bin",
};

const queryTypeLabels: Record<string, string> = {
  cpf: "👤 CPF", cnpj: "🏢 CNPJ", placa: "🚗 Placa", placa_completa: "🚗 Placa Completa",
  telefone: "📞 Telefone", email: "📧 Email", cep: "📍 CEP", nome: "📝 Nome",
  score: "📊 Score", foto: "📸 Foto", nacional: "🇧🇷 Foto Nacional",
  rg: "🪪 RG", cnh: "🪪 CNH", pix: "💳 PIX",
};

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// =============== HELPERS ===============
function btn(text: string, callback_data: string): InlineButton {
  return { text, callback_data };
}

function btnUrl(text: string, url: string): InlineButton {
  return { text, url };
}

function keyboard(...rows: InlineButton[][]) {
  return { inline_keyboard: rows };
}

async function telegramRequest(token: string, method: string, body?: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const url = `${TELEGRAM_API}${token}/${method}`;
  console.log(`Telegram API: ${method}`);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Telegram API error:`, error);
    return { ok: false, description: (error as Error).message };
  }
}

async function sendMessage(token: string, chatId: number, text: string, replyMarkup?: unknown) {
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  });
}

async function editMessage(token: string, chatId: number, messageId: number, text: string, replyMarkup?: unknown) {
  return telegramRequest(token, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  });
}

async function answerCallback(token: string, callbackId: string, text?: string) {
  return telegramRequest(token, "answerCallbackQuery", {
    callback_query_id: callbackId,
    text,
  });
}

async function deleteMessage(token: string, chatId: number, messageId: number) {
  return telegramRequest(token, "deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// Link detection
const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /t\.me\/[^\s]+/gi,
];

function containsLink(text: string): boolean {
  return LINK_PATTERNS.some(pattern => pattern.test(text));
}

// =============== API QUERY FUNCTIONS ===============
async function fetchFromProvider(
  provider: ApiProvider,
  endpoint: string,
  queryParam: string,
  queryValue: string,
  additionalParams?: Record<string, string>
): Promise<Record<string, unknown>> {
  const url = new URL(`${provider.baseUrl}:${provider.port}${endpoint}`);
  url.searchParams.set(queryParam, queryValue);
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  console.log(`Fetching from: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return { error: `Erro na API: ${response.status}`, status: response.status };
    }

    const data = await response.json();
    console.log(`Response received:`, JSON.stringify(data).substring(0, 200));
    return data;
  } catch (err) {
    const error = err as Error;
    console.error(`Fetch error:`, error);
    return { error: `Falha na conexão: ${error.message}` };
  }
}

async function executeQuery(queryType: string, queryInput: string, estado?: string): Promise<Record<string, unknown>> {
  const normalizedType = queryType.toLowerCase();
  const cleanInput = queryInput.replace(/[^\w@.-]/g, "").trim();

  console.log(`Processing query: type=${normalizedType}, input=${cleanInput}`);

  // NexFuture queries
  if (nexfutureEndpoints[normalizedType]) {
    const endpoint = nexfutureEndpoints[normalizedType];
    return await fetchFromProvider(providers.nexfuture, endpoint, normalizedType, cleanInput);
  }

  // TConect Score
  if (normalizedType === "score") {
    return await fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput);
  }

  // TConect Placa Completa
  if (normalizedType === "placa_completa" || normalizedType === "placa2") {
    return await fetchFromProvider(providers.tconect_score, "/placa1", "placa", cleanInput);
  }

  // TConect Foto (single state)
  if (normalizedType === "foto" && estado) {
    return await fetchFromProvider(
      providers.tconect_foto,
      "/foto",
      "cpf",
      cleanInput,
      { estado: estado.toUpperCase() }
    );
  }

  // TConect Nacional (search all states for photo)
  if (normalizedType === "nacional") {
    console.log("Starting national photo search across all states...");
    const results: Record<string, unknown> = {};
    
    const batchSize = 5;
    for (let i = 0; i < brazilianStates.length; i += batchSize) {
      const batch = brazilianStates.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (state) => {
          const result = await fetchFromProvider(
            providers.tconect_foto,
            "/foto",
            "cpf",
            cleanInput,
            { estado: state }
          );
          return { state, result };
        })
      );
      
      batchResults.forEach(({ state, result }) => {
        if (result && !result.error && result.foto) {
          results[state] = result;
        }
      });
    }
    
    return {
      cpf: cleanInput,
      estados_encontrados: Object.keys(results),
      total_fotos: Object.keys(results).length,
      resultados: results,
    };
  }

  return { error: `Tipo de consulta não suportado: ${queryType}` };
}

function formatQueryResult(queryType: string, data: Record<string, unknown>): string {
  if (data.error) {
    return `❌ <b>Erro:</b> ${data.error}`;
  }

  const label = queryTypeLabels[queryType] || queryType.toUpperCase();
  let text = `✅ <b>${label} - Resultado</b>\n\n`;

  const formatValue = (obj: unknown, indent = ""): string => {
    if (obj === null || obj === undefined) return "";
    if (typeof obj !== "object") return String(obj);
    
    let result = "";
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === "foto" && typeof value === "string" && value.startsWith("http")) {
        continue; // Skip foto URL in text, will be sent separately
      }
      if (typeof value === "object" && value !== null) {
        result += `${indent}📂 <b>${key}:</b>\n${formatValue(value, indent + "  ")}`;
      } else if (value !== null && value !== undefined && value !== "") {
        result += `${indent}• <b>${key}:</b> <code>${value}</code>\n`;
      }
    }
    return result;
  };

  text += formatValue(data);
  
  // Limit length for Telegram
  if (text.length > 4000) {
    text = text.substring(0, 3900) + "\n\n<i>... resultado truncado</i>";
  }

  return text;
}

// =============== BOT HANDLER CLASS ===============
class BotHandler {
  // deno-lint-ignore no-explicit-any
  private supabase: SupabaseClient<any>;
  private bot: BotData;
  private settings: BotSettings;
  private update: TelegramUpdate;

  constructor(
    // deno-lint-ignore no-explicit-any
    supabase: SupabaseClient<any>,
    bot: BotData,
    settings: BotSettings,
    update: TelegramUpdate
  ) {
    this.supabase = supabase;
    this.bot = bot;
    this.settings = settings;
    this.update = update;
  }

  private get token() {
    return this.bot.token;
  }

  private isOwner(userId: number): boolean {
    return this.settings.owner_ids?.includes(userId) || false;
  }

  // =============== TERMS ===============
  async getTermsStatus(telegramUserId: number): Promise<boolean> {
    const { data } = await this.supabase
      .from("telegram_user_terms")
      .select("accepted")
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id)
      .single();
    return (data as { accepted: boolean } | null)?.accepted || false;
  }

  async setTermsStatus(telegramUserId: number, accepted: boolean) {
    await this.supabase.from("telegram_user_terms").upsert({
      telegram_user_id: telegramUserId,
      bot_id: this.bot.id,
      accepted,
      accepted_at: accepted ? new Date().toISOString() : null,
    }, { onConflict: "telegram_user_id,bot_id" });
  }

  // =============== SUBSCRIPTION ===============
  async getSubscription(telegramUserId: number): Promise<Subscription | null> {
    const { data } = await this.supabase
      .from("telegram_subscriptions")
      .select("*")
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();
    return data as Subscription | null;
  }

  async isSubscriptionActive(telegramUserId: number): Promise<boolean> {
    const sub = await this.getSubscription(telegramUserId);
    return sub ? !isExpired(sub.expires_at) : false;
  }

  // =============== PLANS ===============
  async getPlans(): Promise<Plan[]> {
    const { data } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .eq("user_id", this.bot.user_id)
      .order("price", { ascending: true });
    return (data || []) as Plan[];
  }

  async getAllPlans(): Promise<Plan[]> {
    const { data } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .eq("user_id", this.bot.user_id)
      .order("price", { ascending: true });
    return (data || []) as Plan[];
  }

  // =============== PENDING PAYMENTS ===============
  async getPendingPayments(telegramUserId: number): Promise<PendingPayment[]> {
    const { data } = await this.supabase
      .from("pending_payments")
      .select("*")
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    return (data || []) as PendingPayment[];
  }

  // =============== CONVERSATION STATE ===============
  async getConversationState(telegramUserId: number, stateType: string) {
    const { data } = await this.supabase
      .from("bot_conversation_states")
      .select("*")
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id)
      .eq("state_type", stateType)
      .single();
    return data as { state_data: Record<string, unknown> } | null;
  }

  async setConversationState(telegramUserId: number, stateType: string, stateData: Record<string, unknown>) {
    await this.supabase.from("bot_conversation_states").upsert({
      telegram_user_id: telegramUserId,
      bot_id: this.bot.id,
      state_type: stateType,
      state_data: stateData,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }, { onConflict: "telegram_user_id,bot_id,state_type" });
  }

  async clearConversationState(telegramUserId: number, stateType?: string) {
    let query = this.supabase
      .from("bot_conversation_states")
      .delete()
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id);
    
    if (stateType) {
      query = query.eq("state_type", stateType);
    }
    
    await query;
  }

  // =============== LOG QUERY ===============
  async logQuery(telegramUserId: number, queryType: string, queryInput: string, result: Record<string, unknown>) {
    await this.supabase.from("query_history").insert({
      user_id: this.bot.user_id,
      query_type: queryType,
      query_input: queryInput,
      query_result: result,
      status: result.error ? "error" : "success",
    });

    await this.supabase.from("api_usage_logs").insert({
      user_id: this.bot.user_id,
      query_type: queryType,
      credits_used: 1,
    });
  }

  // =============== MENUS ===============
  async showTerms(chatId: number) {
    const text = this.settings.terms_text || "📄 <b>Termos de Uso</b>\n\nAceite os termos para continuar.";
    await sendMessage(this.token, chatId, text, keyboard(
      [btn("✅ Aceitar Termos", "terms:accept")],
      [btn("❌ Recusar", "terms:decline")]
    ));
  }

  async showMainMenu(chatId: number, telegramUserId: number, messageId?: number) {
    const sub = await this.getSubscription(telegramUserId);
    const isActive = sub && !isExpired(sub.expires_at);
    
    let statusText = "";
    if (isActive) {
      const days = daysLeft(sub.expires_at);
      statusText = `\n\n✅ <b>Assinatura Ativa</b>\nPlano: ${sub.plan_name}\nExpira em: ${formatDate(sub.expires_at)}\nDias restantes: ${days}`;
    } else {
      statusText = `\n\n⚠️ <b>Sem assinatura ativa</b>\nAssine um plano para fazer consultas.`;
    }

    const buttons: InlineButton[][] = [];
    
    // If active subscription, show query menu
    if (isActive) {
      buttons.push([btn("🔍 Fazer Consulta", "menu:query")]);
    }
    
    buttons.push([btn("💳 Assinar / Renovar", "menu:plans")]);
    buttons.push([btn("📊 Minha Assinatura", "menu:subscription")]);
    buttons.push([btn("💰 Pagamentos Pendentes", "menu:pending")]);

    if (this.isOwner(telegramUserId)) {
      buttons.push([btn("⚙️ Painel Admin", "admin:menu")]);
    }

    if (this.settings.group_url) {
      buttons.push([btnUrl("🚪 Entrar no Grupo", this.settings.group_url)]);
    }

    const text = `🏠 <b>Menu Principal</b>${statusText}`;

    if (messageId) {
      await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
    } else {
      await sendMessage(this.token, chatId, text, keyboard(...buttons));
    }
  }

  async showQueryMenu(chatId: number, messageId: number) {
    const text = `🔍 <b>Consultas Disponíveis</b>\n\nEscolha o tipo de consulta:`;

    const buttons: InlineButton[][] = [
      [btn("👤 CPF", "query:cpf"), btn("🏢 CNPJ", "query:cnpj")],
      [btn("🚗 Placa", "query:placa"), btn("🚗 Placa Completa", "query:placa_completa")],
      [btn("📞 Telefone", "query:telefone"), btn("📧 Email", "query:email")],
      [btn("📍 CEP", "query:cep"), btn("📝 Nome", "query:nome")],
      [btn("📊 Score", "query:score"), btn("💳 PIX", "query:pix")],
      [btn("🪪 RG", "query:rg"), btn("🪪 CNH", "query:cnh")],
      [btn("📸 Foto por Estado", "query:foto")],
      [btn("🇧🇷 Foto Nacional", "query:nacional")],
      [btn("🔙 Voltar", "menu:main")],
    ];

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  async showStateSelection(chatId: number, messageId: number) {
    const text = `📸 <b>Foto por Estado</b>\n\nSelecione o estado:`;

    const stateButtons: InlineButton[][] = [];
    for (let i = 0; i < brazilianStates.length; i += 4) {
      const row = brazilianStates.slice(i, i + 4).map(s => btn(s, `state:${s}`));
      stateButtons.push(row);
    }
    stateButtons.push([btn("🔙 Voltar", "menu:query")]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...stateButtons));
  }

  async requestQueryInput(chatId: number, telegramUserId: number, queryType: string, estado?: string) {
    const label = queryTypeLabels[queryType] || queryType.toUpperCase();
    
    await this.setConversationState(telegramUserId, "query", { 
      queryType, 
      estado: estado || null 
    });

    let placeholder = "";
    switch (queryType) {
      case "cpf": placeholder = "Digite o CPF (11 dígitos):"; break;
      case "cnpj": placeholder = "Digite o CNPJ (14 dígitos):"; break;
      case "placa": case "placa_completa": placeholder = "Digite a placa (ABC1234 ou ABC1D23):"; break;
      case "telefone": placeholder = "Digite o telefone (DDD + número):"; break;
      case "email": placeholder = "Digite o email:"; break;
      case "cep": placeholder = "Digite o CEP (8 dígitos):"; break;
      case "nome": placeholder = "Digite o nome completo:"; break;
      case "score": placeholder = "Digite o CPF para consultar score:"; break;
      case "pix": placeholder = "Digite a chave PIX:"; break;
      case "rg": placeholder = "Digite o RG:"; break;
      case "cnh": placeholder = "Digite o número da CNH:"; break;
      case "foto": case "nacional": placeholder = "Digite o CPF:"; break;
      default: placeholder = "Digite o valor para consultar:";
    }

    await sendMessage(this.token, chatId, 
      `${label}\n\n${placeholder}\n\nEnvie /cancelar para cancelar.`,
      keyboard([btn("❌ Cancelar", "menu:query")])
    );
  }

  async processQuery(chatId: number, telegramUserId: number, queryType: string, queryInput: string, estado?: string) {
    // Check subscription
    const isActive = await this.isSubscriptionActive(telegramUserId);
    if (!isActive && !this.isOwner(telegramUserId)) {
      await sendMessage(this.token, chatId,
        "⚠️ <b>Assinatura necessária</b>\n\nVocê precisa de uma assinatura ativa para fazer consultas.",
        keyboard([btn("💳 Ver Planos", "menu:plans"), btn("🏠 Menu", "menu:main")])
      );
      return;
    }

    await sendMessage(this.token, chatId, `⏳ <b>Consultando ${queryTypeLabels[queryType] || queryType}...</b>\n\nAguarde um momento.`);

    try {
      const result = await executeQuery(queryType, queryInput, estado);
      
      // Log query
      await this.logQuery(telegramUserId, queryType, queryInput, result);

      // Format and send result
      const formattedResult = formatQueryResult(queryType, result);
      
      // Check for photo
      if (result.foto && typeof result.foto === "string" && (result.foto as string).startsWith("http")) {
        await telegramRequest(this.token, "sendPhoto", {
          chat_id: chatId,
          photo: result.foto,
          caption: formattedResult.substring(0, 1024),
          parse_mode: "HTML",
          reply_markup: keyboard([btn("🔍 Nova Consulta", "menu:query"), btn("🏠 Menu", "menu:main")]),
        });
      } else {
        await sendMessage(this.token, chatId, formattedResult,
          keyboard([btn("🔍 Nova Consulta", "menu:query"), btn("🏠 Menu", "menu:main")])
        );
      }

    } catch (error) {
      console.error("Query error:", error);
      await sendMessage(this.token, chatId,
        "❌ <b>Erro na consulta</b>\n\nOcorreu um erro ao processar sua consulta. Tente novamente.",
        keyboard([btn("🔍 Tentar Novamente", "menu:query"), btn("🏠 Menu", "menu:main")])
      );
    }
  }

  async showPlansMenu(chatId: number, messageId: number) {
    const plans = await this.getPlans();

    const text = plans.length === 0
      ? "⚠️ <b>Nenhum plano disponível no momento.</b>"
      : "📋 <b>Planos Disponíveis</b>\n\nEscolha um plano:";

    const buttons: InlineButton[][] = plans.map(p => [
      btn(`${p.title} - R$ ${p.price.toFixed(2)} (${p.days} dias)`, `plan:${p.code}`)
    ]);
    buttons.push([btn("🔙 Voltar", "menu:main")]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  async showSubscriptionMenu(chatId: number, telegramUserId: number, messageId: number) {
    const sub = await this.getSubscription(telegramUserId);

    if (!sub || isExpired(sub.expires_at)) {
      await editMessage(this.token, chatId, messageId,
        "⚠️ <b>Você não tem assinatura ativa</b>\n\nUse o botão abaixo para assinar um plano.",
        keyboard(
          [btn("💳 Ver Planos", "menu:plans")],
          [btn("🔙 Voltar", "menu:main")]
        )
      );
      return;
    }

    const days = daysLeft(sub.expires_at);
    const hours = Math.floor((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60));

    await editMessage(this.token, chatId, messageId,
      `✅ <b>Assinatura Ativa</b>\n\n` +
      `📦 Plano: <b>${sub.plan_name}</b>\n` +
      `💰 Valor pago: <b>R$ ${Number(sub.value).toFixed(2)}</b>\n` +
      `📅 Iniciada em: <b>${formatDate(sub.started_at)}</b>\n` +
      `⏰ Expira em: <b>${formatDate(sub.expires_at)}</b>\n` +
      `⏳ Tempo restante: <b>${days} dias (${hours}h)</b>\n\n` +
      `🎫 TXID: <code>${sub.txid}</code>`,
      keyboard(
        [btn("🔄 Renovar", "menu:plans")],
        [btn("🔙 Voltar", "menu:main")]
      )
    );
  }

  async showPendingMenu(chatId: number, telegramUserId: number, messageId: number) {
    const pending = await this.getPendingPayments(telegramUserId);

    if (pending.length === 0) {
      await editMessage(this.token, chatId, messageId,
        "ℹ️ <b>Sem pagamentos pendentes</b>\n\nVocê não tem pagamentos aguardando confirmação.",
        keyboard([btn("🔙 Voltar", "menu:main")])
      );
      return;
    }

    let text = "💰 <b>Pagamentos Pendentes</b>\n\n";
    const buttons: InlineButton[][] = [];

    pending.forEach((p, i) => {
      const createdAt = new Date(p.created_at);
      const ageMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
      text += `${i + 1}. <b>${p.plan_name}</b> - R$ ${Number(p.value).toFixed(2)}\n`;
      text += `   TXID: <code>${p.txid}</code>\n`;
      text += `   Criado há: ${ageMinutes} minutos\n\n`;

      buttons.push([btn(`✅ Verificar #${i + 1}`, `chk_${p.txid}`)]);
    });

    buttons.push([btn("🔙 Voltar", "menu:main")]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  // =============== ADMIN MENUS ===============
  async showAdminMenu(chatId: number, messageId: number) {
    await editMessage(this.token, chatId, messageId,
      "⚙️ <b>Painel Administrativo</b>\n\nEscolha uma opção:",
      keyboard(
        [btn("📋 Gerenciar Planos", "admin:plans")],
        [btn("👥 Usuários Ativos", "admin:users")],
        [btn("📊 Estatísticas", "admin:stats")],
        [btn("📢 Broadcast", "admin:broadcast")],
        [btn("🔙 Voltar", "menu:main")]
      )
    );
  }

  async showPlansManagement(chatId: number, messageId: number) {
    const plans = await this.getAllPlans();

    let text = "📋 <b>Gerenciamento de Planos</b>\n\n";
    const buttons: InlineButton[][] = [];

    plans.forEach((p, i) => {
      const status = p.is_active ? "✅" : "❌";
      text += `${i + 1}. ${status} <b>${p.name}</b>\n`;
      text += `   R$ ${p.price.toFixed(2)} - ${p.days} dias\n`;
      text += `   Código: <code>${p.code}</code>\n\n`;
      buttons.push([btn(`✏️ Editar ${p.name}`, `admin:edit_plan:${p.id}`)]);
    });

    buttons.push([btn("➕ Novo Plano", "admin:new_plan")]);
    buttons.push([btn("🔙 Voltar", "admin:menu")]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  async showEditPlan(chatId: number, messageId: number, planId: string) {
    const { data } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    const plan = data as Plan | null;

    if (!plan) {
      await editMessage(this.token, chatId, messageId, "❌ Plano não encontrado.",
        keyboard([btn("🔙 Voltar", "admin:plans")]));
      return;
    }

    const status = plan.is_active ? "✅ Ativo" : "❌ Inativo";

    await editMessage(this.token, chatId, messageId,
      `✏️ <b>Editar Plano</b>\n\n` +
      `📦 Nome: <b>${plan.name}</b>\n` +
      `💰 Preço: <b>R$ ${plan.price.toFixed(2)}</b>\n` +
      `📅 Dias: <b>${plan.days}</b>\n` +
      `📊 Status: <b>${status}</b>\n` +
      `🔑 Código: <code>${plan.code}</code>`,
      keyboard(
        [btn("💰 Alterar Preço", `admin:change_price:${planId}`)],
        [btn("📅 Alterar Dias", `admin:change_days:${planId}`)],
        [btn("📝 Alterar Nome", `admin:change_name:${planId}`)],
        [btn(plan.is_active ? "❌ Desativar" : "✅ Ativar", `admin:toggle_plan:${planId}`)],
        [btn("🗑️ Deletar", `admin:delete_plan:${planId}`)],
        [btn("🔙 Voltar", "admin:plans")]
      )
    );
  }

  async showActiveUsers(chatId: number, messageId: number) {
    const { data: subs } = await this.supabase
      .from("telegram_subscriptions")
      .select("*")
      .eq("bot_id", this.bot.id)
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true });

    const subscriptions = (subs || []) as Array<{ telegram_user_id: number; plan_name: string; expires_at: string }>;

    let text = "👥 <b>Usuários com Assinatura Ativa</b>\n\n";

    if (subscriptions.length === 0) {
      text += "Nenhum usuário com assinatura ativa.";
    } else {
      text += `Total: <b>${subscriptions.length}</b> usuários\n\n`;
      subscriptions.slice(0, 20).forEach((s, i) => {
        const days = daysLeft(s.expires_at);
        text += `${i + 1}. ID: <code>${s.telegram_user_id}</code>\n`;
        text += `   Plano: ${s.plan_name} - ${days} dias restantes\n\n`;
      });
      if (subscriptions.length > 20) {
        text += `... e mais ${subscriptions.length - 20} usuários`;
      }
    }

    await editMessage(this.token, chatId, messageId, text,
      keyboard([btn("🔙 Voltar", "admin:menu")])
    );
  }

  async showStats(chatId: number, messageId: number) {
    const { count: totalSubs } = await this.supabase
      .from("telegram_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("bot_id", this.bot.id);

    const { count: activeSubs } = await this.supabase
      .from("telegram_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("bot_id", this.bot.id)
      .gte("expires_at", new Date().toISOString());

    const { count: pendingPayments } = await this.supabase
      .from("pending_payments")
      .select("*", { count: "exact", head: true })
      .eq("bot_id", this.bot.id)
      .eq("status", "PENDING");

    const today = new Date().toISOString().split("T")[0];
    const { data: todaySubs } = await this.supabase
      .from("telegram_subscriptions")
      .select("value")
      .eq("bot_id", this.bot.id)
      .gte("created_at", today);

    const subsData = (todaySubs || []) as Array<{ value: number }>;
    const todayRevenue = subsData.reduce((acc, s) => acc + Number(s.value), 0);

    const { count: totalQueries } = await this.supabase
      .from("query_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", this.bot.user_id)
      .gte("created_at", today);

    await editMessage(this.token, chatId, messageId,
      `📊 <b>Estatísticas</b>\n\n` +
      `👥 Total de assinaturas: <b>${totalSubs || 0}</b>\n` +
      `✅ Assinaturas ativas: <b>${activeSubs || 0}</b>\n` +
      `⏳ Pagamentos pendentes: <b>${pendingPayments || 0}</b>\n\n` +
      `💰 Receita hoje: <b>R$ ${todayRevenue.toFixed(2)}</b>\n` +
      `🔍 Consultas hoje: <b>${totalQueries || 0}</b>`,
      keyboard([btn("🔙 Voltar", "admin:menu")])
    );
  }

  async showBroadcastMenu(chatId: number, messageId: number) {
    await editMessage(this.token, chatId, messageId,
      "📢 <b>Broadcast</b>\n\nEscolha o público-alvo:",
      keyboard(
        [btn("📢 Todos os Usuários", "broadcast:all")],
        [btn("✅ Apenas Ativos", "broadcast:active")],
        [btn("❌ Apenas Expirados", "broadcast:expired")],
        [btn("🔙 Voltar", "admin:menu")]
      )
    );
  }

  // =============== PIX PAYMENT ===============
  async generatePixPayment(chatId: number, telegramUserId: number, planCode: string) {
    const plans = await this.getPlans();
    const plan = plans.find(p => p.code === planCode);

    if (!plan) {
      await sendMessage(this.token, chatId, "❌ Plano não encontrado.");
      return;
    }

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const response = await fetch(`${supabaseUrl}/functions/v1/efi-generate-pix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          amount: plan.price,
          user_id: this.bot.user_id,
          telegram_user_id: telegramUserId,
          bot_id: this.bot.id,
          plan_name: plan.name,
          plan_code: plan.code,
          plan_days: plan.days,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("PIX creation failed:", result);
        await sendMessage(this.token, chatId, "❌ Erro ao gerar PIX. Tente novamente em instantes.");
        return;
      }

      const { txid, qr_code, qr_code_image } = result.data;

      // Also save to pending_payments for compatibility
      await this.supabase.from("pending_payments").insert({
        user_id: this.bot.user_id,
        bot_id: this.bot.id,
        telegram_user_id: telegramUserId,
        telegram_chat_id: chatId,
        txid,
        value: plan.price,
        plan_id: plan.id,
        plan_code: plan.code,
        plan_name: plan.name,
        plan_days: plan.days,
        pix_copy_paste: qr_code,
        pix_qrcode: qr_code_image,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        status: "PENDING",
      });

      if (qr_code_image) {
        const sentMsg = await telegramRequest(this.token, "sendPhoto", {
          chat_id: chatId,
          photo: qr_code_image,
          caption:
            `💳 <b>PIX Gerado!</b>\n\n` +
            `📦 Plano: <b>${plan.name}</b>\n` +
            `💰 Valor: <b>R$ ${plan.price.toFixed(2)}</b>\n` +
            `📅 Validade: <b>${plan.days} dias</b>\n` +
            `⏰ Expira em: <b>10 minutos</b>\n\n` +
            `🎫 TXID: <code>${txid}</code>\n\n` +
            `🔹 <b>Pix Copia e Cola:</b>\n<pre>${qr_code}</pre>`,
          parse_mode: "HTML",
          reply_markup: keyboard(
            [btn("✅ Já Paguei - Confirmar", `chk_${txid}`)],
            [btnUrl("🏦 Abrir App do Banco", "https://www.bcb.gov.br/estabilidadefinanceira/pix")],
            [btn("🔙 Voltar", "menu:plans")]
          ),
        });

        if (sentMsg.ok && sentMsg.result) {
          const msgResult = sentMsg.result as { message_id: number };
          await this.supabase
            .from("pending_payments")
            .update({ telegram_message_id: msgResult.message_id })
            .eq("txid", txid);
        }
      } else {
        await sendMessage(this.token, chatId,
          `💳 <b>PIX Gerado!</b>\n\n` +
          `📦 Plano: <b>${plan.name}</b>\n` +
          `💰 Valor: <b>R$ ${plan.price.toFixed(2)}</b>\n` +
          `📅 Validade: <b>${plan.days} dias</b>\n` +
          `⏰ Expira em: <b>10 minutos</b>\n\n` +
          `🎫 TXID: <code>${txid}</code>\n\n` +
          `🔹 <b>Pix Copia e Cola:</b>\n<pre>${qr_code}</pre>`,
          keyboard(
            [btn("✅ Já Paguei - Confirmar", `chk_${txid}`)],
            [btn("🔙 Voltar", "menu:plans")]
          )
        );
      }

      console.log(`PIX generated: User ${telegramUserId}, Plan ${planCode}, TXID ${txid}`);

    } catch (error) {
      console.error("PIX generation error:", error);
      await sendMessage(this.token, chatId, "❌ Erro ao gerar PIX. Tente novamente em instantes.");
    }
  }

  async checkPayment(chatId: number, telegramUserId: number, txid: string) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const response = await fetch(`${supabaseUrl}/functions/v1/efi-check-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ txid }),
      });

      const result = await response.json();
      const status = result.status?.toUpperCase();

      if (status === "CONCLUIDA") {
        const { data } = await this.supabase
          .from("pending_payments")
          .select("*")
          .eq("txid", txid)
          .single();

        const payment = data as PendingPayment | null;

        if (payment) {
          await this.confirmPayment(payment, chatId, telegramUserId);
        }
      } else {
        await sendMessage(this.token, chatId,
          `⏳ <b>Pagamento Pendente</b>\n\n` +
          `Status atual: <code>${status || "EM_ABERTO"}</code>\n\n` +
          `O pagamento ainda não foi confirmado.\n` +
          `Aguarde alguns instantes e tente novamente.`,
          keyboard([btn("🔙 Voltar", "menu:pending")])
        );
      }
    } catch (error) {
      console.error("Payment check error:", error);
      await sendMessage(this.token, chatId, "❌ Erro ao consultar pagamento. Tente novamente.");
    }
  }

  async confirmPayment(payment: PendingPayment, chatId: number, telegramUserId: number) {
    const { plan_days: planDays, plan_name: planName, value, txid, plan_id, plan_code } = payment;

    await this.supabase
      .from("pending_payments")
      .update({ status: "CONCLUIDA" })
      .eq("txid", txid);

    const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();
    await this.supabase.from("telegram_subscriptions").insert({
      telegram_user_id: telegramUserId,
      bot_id: this.bot.id,
      plan_id,
      plan_code,
      plan_name: planName,
      plan_days: planDays,
      value,
      txid,
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    console.log(`Payment confirmed: User ${telegramUserId}, TXID ${txid}`);

    if (this.settings.group_chat_id) {
      try {
        await telegramRequest(this.token, "restrictChatMember", {
          chat_id: this.settings.group_chat_id,
          user_id: telegramUserId,
          permissions: {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true,
          },
        });
        console.log(`User ${telegramUserId} unmuted in group`);
      } catch (e) {
        console.error("Failed to unmute user:", e);
      }
    }

    const msgId = payment.telegram_message_id;
    if (msgId) {
      try {
        await deleteMessage(this.token, chatId, msgId);
      } catch (e) {
        console.error("Failed to delete QR message:", e);
      }
    }

    const buttons: InlineButton[][] = [];
    if (this.settings.group_url) {
      buttons.push([btnUrl("🚪 Entrar no Grupo", this.settings.group_url)]);
    }
    buttons.push([btn("🔍 Fazer Consulta", "menu:query")]);
    buttons.push([btn("🏠 Menu Principal", "menu:main")]);

    await sendMessage(this.token, chatId,
      `🎉 <b>PAGAMENTO CONFIRMADO!</b>\n\n` +
      `📦 Plano: <b>${planName}</b>\n` +
      `💰 Valor: <b>R$ ${Number(value).toFixed(2)}</b>\n` +
      `📅 Válido até: <b>${formatDate(expiresAt)}</b>\n\n` +
      `🎫 TXID: <code>${txid}</code>\n\n` +
      `${this.settings.group_chat_id ? "🚪 <b>Seu acesso foi liberado no grupo!</b>" : "✅ <b>Assinatura ativada com sucesso!</b>"}`,
      keyboard(...buttons)
    );

    if (this.settings.group_chat_id && this.settings.announce_payments) {
      try {
        let display = `ID: ${telegramUserId}`;
        try {
          const userInfo = await telegramRequest(this.token, "getChat", { chat_id: telegramUserId });
          if (userInfo.ok && userInfo.result) {
            const user = userInfo.result as { username?: string; first_name?: string };
            if (user.username) display = `@${user.username}`;
            else if (user.first_name) display = user.first_name;
          }
        } catch (_e) { /* ignore */ }

        await sendMessage(this.token, this.settings.group_chat_id,
          `🔥 <b>FISCAL</b>\n` +
          `🎉 <b>NOVA ASSINATURA ATIVADA!</b>\n\n` +
          `👤 <b>Usuário:</b> ${display}\n` +
          `📦 <b>Plano:</b> ${planName}\n` +
          `⏰ <b>Duração:</b> ${planDays} dia(s)\n` +
          `💵 <b>Valor:</b> R$ ${Number(value).toFixed(2)}\n` +
          `🆔 <b>ID:</b> <code>${txid}</code>\n\n` +
          `🎊 <b>Bem-vindo(a) ao grupo!</b>`,
          keyboard([btnUrl("🛒 COMPRAR CONSULTAS", `https://t.me/${this.bot.bot_username}?start=assinar`)])
        );
      } catch (e) {
        console.error("Failed to announce in group:", e);
      }
    }
  }

  // =============== BROADCAST ===============
  async executeBroadcast(telegramUserId: number, filter: string, message: TelegramMessage) {
    let query = this.supabase
      .from("telegram_subscriptions")
      .select("telegram_user_id")
      .eq("bot_id", this.bot.id);

    if (filter === "active") {
      query = query.gte("expires_at", new Date().toISOString());
    } else if (filter === "expired") {
      query = query.lt("expires_at", new Date().toISOString());
    }

    const { data: subs } = await query;
    const subscriptions = (subs || []) as Array<{ telegram_user_id: number }>;

    if (subscriptions.length === 0) {
      await sendMessage(this.token, message.chat.id, "❌ Nenhum usuário encontrado para o broadcast.");
      return;
    }

    const userIds = [...new Set(subscriptions.map(s => s.telegram_user_id))];

    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        if (message.photo || message.video || message.document) {
          await telegramRequest(this.token, "copyMessage", {
            chat_id: userId,
            from_chat_id: message.chat.id,
            message_id: message.message_id,
          });
        } else if (message.text) {
          await sendMessage(this.token, userId, message.text);
        }
        sent++;
      } catch (_e) {
        failed++;
      }

      if (sent % 20 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await sendMessage(this.token, message.chat.id,
      `📢 <b>Broadcast Concluído!</b>\n\n` +
      `✅ Enviados: <b>${sent}</b>\n` +
      `❌ Falhas: <b>${failed}</b>\n` +
      `📊 Total: <b>${userIds.length}</b>`,
      keyboard([btn("🔙 Voltar", "admin:menu")])
    );
  }

  // =============== GROUP GUARD ===============
  async handleNewMember(member: TelegramUser, chatId: number) {
    if (member.is_bot) return;

    const isActive = await this.isSubscriptionActive(member.id);

    if (!isActive && this.settings.mute_new_members) {
      await telegramRequest(this.token, "restrictChatMember", {
        chat_id: chatId,
        user_id: member.id,
        permissions: { can_send_messages: false },
      });

      const display = member.username ? `@${member.username}` : member.first_name || "Usuário";
      await sendMessage(this.token, chatId,
        `👋 Olá ${display}!\n\n` +
        `Para participar do grupo, você precisa ter uma assinatura ativa.\n\n` +
        `Clique no botão abaixo para assinar:`,
        keyboard([btnUrl("🛒 Assinar Agora", `https://t.me/${this.bot.bot_username}?start=assinar`)])
      );
    }
  }

  async guardMessage(message: TelegramMessage) {
    const securitySettings = this.bot.bot_security_settings?.[0];
    if (!securitySettings || !message.from) return;

    let isBlocked = false;
    let blockedReason = "";

    if (securitySettings.anti_link_enabled && message.text && containsLink(message.text)) {
      if (!this.isOwner(message.from.id)) {
        isBlocked = true;
        blockedReason = "link_detected";

        if (securitySettings.anti_link_action === "delete") {
          await deleteMessage(this.token, message.chat.id, message.message_id);
        }
      }
    }

    if (securitySettings.anti_spam_enabled && message.from.id) {
      const intervalAgo = new Date(Date.now() - securitySettings.anti_spam_interval_seconds * 1000).toISOString();

      const { count } = await this.supabase
        .from("telegram_messages")
        .select("*", { count: "exact", head: true })
        .eq("bot_id", this.bot.id)
        .eq("from_user_id", message.from.id)
        .gte("created_at", intervalAgo);

      if ((count || 0) >= securitySettings.anti_spam_max_messages) {
        isBlocked = true;
        blockedReason = "spam_detected";

        if (securitySettings.anti_spam_action === "mute") {
          await telegramRequest(this.token, "restrictChatMember", {
            chat_id: message.chat.id,
            user_id: message.from.id,
            permissions: { can_send_messages: false },
            until_date: Math.floor(Date.now() / 1000) + 3600,
          });
        }
      }
    }

    await this.supabase.from("telegram_messages").insert({
      bot_id: this.bot.id,
      telegram_message_id: message.message_id,
      chat_id: message.chat.id,
      chat_type: message.chat.type,
      from_user_id: message.from?.id,
      from_username: message.from?.username,
      from_first_name: message.from?.first_name,
      message_text: message.text,
      message_type: message.text ? "text" : "other",
      raw_data: this.update,
      is_blocked: isBlocked,
      blocked_reason: blockedReason || null,
    });

    await this.supabase.from("bot_analytics").upsert({
      bot_id: this.bot.id,
      date: new Date().toISOString().split("T")[0],
      messages_received: 1,
      blocked_messages: isBlocked ? 1 : 0,
      links_blocked: blockedReason === "link_detected" ? 1 : 0,
      spam_detected: blockedReason === "spam_detected" ? 1 : 0,
    }, { onConflict: "bot_id,date" });
  }

  // =============== MAIN HANDLER ===============
  async handleUpdate() {
    const { update } = this;

    if (update.callback_query) {
      await this.handleCallback(update.callback_query);
      return;
    }

    const message = update.message || update.edited_message || update.channel_post;
    if (message) {
      await this.handleMessage(message);
    }

    await this.supabase
      .from("telegram_bots")
      .update({
        health_status: "online",
        last_health_check: new Date().toISOString(),
      })
      .eq("id", this.bot.id);
  }

  async handleMessage(message: TelegramMessage) {
    const chatId = message.chat.id;
    const telegramUserId = message.from?.id;

    if (!telegramUserId) return;

    const text = message.text || "";

    // Handle group messages
    if (message.chat.type !== "private") {
      if (message.new_chat_members) {
        for (const member of message.new_chat_members) {
          await this.handleNewMember(member, chatId);
        }
      }

      // FISCAL DE GRUPO: Check if user can send messages in configured group
      const isConfiguredGroup = this.settings.group_chat_id && chatId === this.settings.group_chat_id;
      const isOwner = this.isOwner(telegramUserId);
      
      if (isConfiguredGroup && this.settings.mute_new_members && !isOwner) {
        const isActive = await this.isSubscriptionActive(telegramUserId);
        
        if (!isActive) {
          // Mute user who doesn't have active subscription
          await telegramRequest(this.token, "restrictChatMember", {
            chat_id: chatId,
            user_id: telegramUserId,
            permissions: { can_send_messages: false },
          });
          
          // Delete their message
          await deleteMessage(this.token, chatId, message.message_id);
          
          // Notify user
          const display = message.from?.username ? `@${message.from.username}` : message.from?.first_name || "Usuário";
          await sendMessage(this.token, chatId,
            `🚫 <b>FISCAL</b>\n\n` +
            `${display}, você foi mutado por não ter assinatura ativa.\n\n` +
            `Clique no botão abaixo para assinar e liberar seu acesso:`,
            keyboard([btnUrl("🛒 Assinar Agora", `https://t.me/${this.bot.bot_username}?start=assinar`)])
          );
          
          console.log(`FISCAL: User ${telegramUserId} muted for not having active subscription`);
          return;
        }
      }

      // Process commands in group for owners and subscribers
      if (text.startsWith("/")) {
        const isActive = await this.isSubscriptionActive(telegramUserId);
        const canQuery = isOwner || isActive;

        if (canQuery) {
          await this.handleGroupCommand(message, text);
          return;
        }
      }

      await this.guardMessage(message);
      return;
    }

    // Private chat handling

    // Check for broadcast state
    const broadcastState = await this.getConversationState(telegramUserId, "broadcast");
    if (broadcastState && this.isOwner(telegramUserId)) {
      const filter = (broadcastState.state_data as { filter: string }).filter;
      await this.clearConversationState(telegramUserId, "broadcast");
      await this.executeBroadcast(telegramUserId, filter, message);
      return;
    }

    // Check for query state
    const queryState = await this.getConversationState(telegramUserId, "query");
    if (queryState) {
      const { queryType, estado } = queryState.state_data as { queryType: string; estado?: string };
      await this.clearConversationState(telegramUserId, "query");
      await this.processQuery(chatId, telegramUserId, queryType, text, estado);
      return;
    }

    // Check for admin conversation states
    const conversationState = await this.getConversationState(telegramUserId, "admin");
    if (conversationState && this.isOwner(telegramUserId)) {
      await this.handleAdminConversation(message, conversationState);
      return;
    }

    // Handle commands
    if (text.startsWith("/start")) {
      if (this.settings.terms_enabled) {
        const accepted = await this.getTermsStatus(telegramUserId);
        if (!accepted) {
          await this.showTerms(chatId);
          return;
        }
      }
      await this.showMainMenu(chatId, telegramUserId);
      return;
    }

    if (text === "/cancelar") {
      await this.clearConversationState(telegramUserId);
      await sendMessage(this.token, chatId, "❌ Operação cancelada.",
        keyboard([btn("🔙 Menu Principal", "menu:main")]));
      return;
    }

    // Default: show main menu
    if (this.settings.terms_enabled) {
      const accepted = await this.getTermsStatus(telegramUserId);
      if (!accepted) {
        await this.showTerms(chatId);
        return;
      }
    }
    await this.showMainMenu(chatId, telegramUserId);
  }

  // =============== GROUP COMMAND HANDLER ===============
  async handleGroupCommand(message: TelegramMessage, text: string) {
    const chatId = message.chat.id;
    const telegramUserId = message.from!.id;
    const replyToId = message.message_id;

    // Parse command: /cpf 12345678900 or /cpf
    const parts = text.trim().split(/\s+/);
    const command = parts[0].toLowerCase().replace("/", "").split("@")[0]; // Remove @botusername
    const queryInput = parts.slice(1).join(" ");

    // Map commands to query types
    const commandMap: Record<string, string> = {
      cpf: "cpf", cnpj: "cnpj", placa: "placa", placa2: "placa_completa",
      telefone: "telefone", tel: "telefone", email: "email",
      cep: "cep", nome: "nome", score: "score",
      rg: "rg", cnh: "cnh", pix: "pix",
      foto: "foto", nacional: "nacional",
    };

    const queryType = commandMap[command];

    if (!queryType) {
      // Not a query command, ignore
      return;
    }

    // If no input provided, show usage
    if (!queryInput) {
      const examples: Record<string, string> = {
        cpf: "/cpf 12345678900",
        cnpj: "/cnpj 12345678000100",
        placa: "/placa ABC1234",
        placa_completa: "/placa2 ABC1234",
        telefone: "/telefone 11999998888",
        email: "/email exemplo@email.com",
        cep: "/cep 01310100",
        nome: "/nome João Silva",
        score: "/score 12345678900",
        rg: "/rg MG12345678",
        cnh: "/cnh 12345678900",
        pix: "/pix chave@pix.com",
        foto: "/foto 12345678900 SP",
        nacional: "/nacional 12345678900",
      };

      await telegramRequest(this.token, "sendMessage", {
        chat_id: chatId,
        text: `⚠️ <b>Você deve preencher os dados corretamente</b>\n\nExemplo: <code>${examples[queryType] || `/${command} valor`}</code>`,
        parse_mode: "HTML",
        reply_to_message_id: replyToId,
      });
      return;
    }

    // For foto, check if state is provided
    let estado: string | undefined;
    if (queryType === "foto") {
      const inputParts = queryInput.split(/\s+/);
      if (inputParts.length >= 2) {
        estado = inputParts[inputParts.length - 1].toUpperCase();
        if (estado.length === 2) {
          // Valid state code
        } else {
          estado = undefined;
        }
      }
      if (!estado) {
        await telegramRequest(this.token, "sendMessage", {
          chat_id: chatId,
          text: `⚠️ <b>Para foto, informe o estado</b>\n\nExemplo: <code>/foto 12345678900 SP</code>`,
          parse_mode: "HTML",
          reply_to_message_id: replyToId,
        });
        return;
      }
    }

    // Send processing message
    const processingMsg = await telegramRequest(this.token, "sendMessage", {
      chat_id: chatId,
      text: `⏳ <b>Consultando ${queryTypeLabels[queryType] || queryType}...</b>`,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
    });

    try {
      const result = await executeQuery(queryType, queryInput, estado);
      
      // Log query
      await this.logQuery(telegramUserId, queryType, queryInput, result);

      // Delete processing message
      if (processingMsg.ok && processingMsg.result) {
        const msgResult = processingMsg.result as { message_id: number };
        try {
          await deleteMessage(this.token, chatId, msgResult.message_id);
        } catch (_e) { /* ignore */ }
      }

      // Format and send result
      const formattedResult = formatQueryResult(queryType, result);

      // Check for photo
      if (result.foto && typeof result.foto === "string" && (result.foto as string).startsWith("http")) {
        await telegramRequest(this.token, "sendPhoto", {
          chat_id: chatId,
          photo: result.foto,
          caption: formattedResult.substring(0, 1024),
          parse_mode: "HTML",
          reply_to_message_id: replyToId,
        });
      } else {
        await telegramRequest(this.token, "sendMessage", {
          chat_id: chatId,
          text: formattedResult,
          parse_mode: "HTML",
          reply_to_message_id: replyToId,
        });
      }

    } catch (error) {
      console.error("Group query error:", error);
      await telegramRequest(this.token, "sendMessage", {
        chat_id: chatId,
        text: "❌ <b>Erro na consulta</b>\n\nTente novamente.",
        parse_mode: "HTML",
        reply_to_message_id: replyToId,
      });
    }
  }

  async handleCallback(callback: TelegramCallbackQuery) {
    const chatId = callback.message?.chat.id;
    const messageId = callback.message?.message_id;
    const telegramUserId = callback.from.id;
    const data = callback.data || "";

    if (!chatId || !messageId) return;

    await answerCallback(this.token, callback.id);

    // Terms handling
    if (data === "terms:accept") {
      await this.setTermsStatus(telegramUserId, true);
      try {
        await deleteMessage(this.token, chatId, messageId);
      } catch (_e) { /* ignore */ }
      await this.showMainMenu(chatId, telegramUserId);
      return;
    }

    if (data === "terms:decline") {
      await this.setTermsStatus(telegramUserId, false);
      await sendMessage(this.token, chatId, "❌ Você precisa aceitar os termos para usar o bot.\nEnvie /start quando estiver pronto.");
      return;
    }

    // Menu navigation
    if (data === "menu:main") {
      await this.showMainMenu(chatId, telegramUserId, messageId);
      return;
    }

    if (data === "menu:query") {
      // Check subscription first
      const isActive = await this.isSubscriptionActive(telegramUserId);
      if (!isActive && !this.isOwner(telegramUserId)) {
        await editMessage(this.token, chatId, messageId,
          "⚠️ <b>Assinatura necessária</b>\n\nVocê precisa de uma assinatura ativa para fazer consultas.",
          keyboard([btn("💳 Ver Planos", "menu:plans"), btn("🏠 Voltar", "menu:main")])
        );
        return;
      }
      await this.showQueryMenu(chatId, messageId);
      return;
    }

    if (data === "menu:plans") {
      await this.showPlansMenu(chatId, messageId);
      return;
    }

    if (data === "menu:subscription") {
      await this.showSubscriptionMenu(chatId, telegramUserId, messageId);
      return;
    }

    if (data === "menu:pending") {
      await this.showPendingMenu(chatId, telegramUserId, messageId);
      return;
    }

    // Query type selection
    if (data.startsWith("query:")) {
      const queryType = data.replace("query:", "");
      if (queryType === "foto") {
        await this.showStateSelection(chatId, messageId);
      } else {
        await this.requestQueryInput(chatId, telegramUserId, queryType);
      }
      return;
    }

    // State selection for foto
    if (data.startsWith("state:")) {
      const estado = data.replace("state:", "");
      await this.requestQueryInput(chatId, telegramUserId, "foto", estado);
      return;
    }

    // Plan selection
    if (data.startsWith("plan:")) {
      const planCode = data.replace("plan:", "");
      await this.generatePixPayment(chatId, telegramUserId, planCode);
      return;
    }

    // Payment check
    if (data.startsWith("chk_")) {
      const txid = data.replace("chk_", "");
      await this.checkPayment(chatId, telegramUserId, txid);
      return;
    }

    // Admin menu
    if (data === "admin:menu") {
      if (!this.isOwner(telegramUserId)) {
        await editMessage(this.token, chatId, messageId, "❌ Acesso negado. Apenas administradores.",
          keyboard([btn("🔙 Voltar", "menu:main")]));
        return;
      }
      await this.showAdminMenu(chatId, messageId);
      return;
    }

    if (data === "admin:plans") {
      if (!this.isOwner(telegramUserId)) return;
      await this.showPlansManagement(chatId, messageId);
      return;
    }

    if (data === "admin:users") {
      if (!this.isOwner(telegramUserId)) return;
      await this.showActiveUsers(chatId, messageId);
      return;
    }

    if (data === "admin:stats") {
      if (!this.isOwner(telegramUserId)) return;
      await this.showStats(chatId, messageId);
      return;
    }

    if (data === "admin:broadcast") {
      if (!this.isOwner(telegramUserId)) return;
      await this.showBroadcastMenu(chatId, messageId);
      return;
    }

    // Broadcast filter selection
    if (data.startsWith("broadcast:")) {
      if (!this.isOwner(telegramUserId)) return;
      const filter = data.replace("broadcast:", "");
      if (filter === "cancel") {
        await this.clearConversationState(telegramUserId, "broadcast");
        await this.showAdminMenu(chatId, messageId);
        return;
      }
      await this.setConversationState(telegramUserId, "broadcast", { filter });
      const filterText: Record<string, string> = {
        "all": "todos os usuários",
        "active": "usuários com plano ativo",
        "expired": "usuários com plano expirado",
      };
      await sendMessage(this.token, chatId,
        `📢 <b>BROADCAST</b>\n\n` +
        `🎯 <b>Público:</b> ${filterText[filter]}\n\n` +
        `📝 Agora envie a mensagem que deseja transmitir.\n\n` +
        `💡 <b>Você pode enviar:</b>\n` +
        `• Texto (com formatação)\n` +
        `• Foto com legenda\n` +
        `• Vídeo com legenda\n` +
        `• Documento\n\n` +
        `Use /cancelar para cancelar.`,
        keyboard([btn("❌ Cancelar", "broadcast:cancel")])
      );
      return;
    }

    // Edit plan
    if (data.startsWith("admin:edit_plan:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:edit_plan:", "");
      await this.showEditPlan(chatId, messageId, planId);
      return;
    }

    // Toggle plan
    if (data.startsWith("admin:toggle_plan:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:toggle_plan:", "");
      const { data: planData } = await this.supabase
        .from("subscription_plans")
        .select("is_active")
        .eq("id", planId)
        .single();
      
      const plan = planData as { is_active: boolean } | null;
      
      await this.supabase
        .from("subscription_plans")
        .update({ is_active: !plan?.is_active })
        .eq("id", planId);
      
      await this.showEditPlan(chatId, messageId, planId);
      return;
    }

    // Delete plan
    if (data.startsWith("admin:delete_plan:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:delete_plan:", "");
      await this.supabase.from("subscription_plans").delete().eq("id", planId);
      await this.showPlansManagement(chatId, messageId);
      return;
    }

    // Change plan properties
    if (data.startsWith("admin:change_price:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:change_price:", "");
      await this.setConversationState(telegramUserId, "admin", { action: "change_price", planId });
      await sendMessage(this.token, chatId, "💰 Digite o novo preço (ex: 10.50):\n\nEnvie /cancelar para cancelar.");
      return;
    }

    if (data.startsWith("admin:change_days:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:change_days:", "");
      await this.setConversationState(telegramUserId, "admin", { action: "change_days", planId });
      await sendMessage(this.token, chatId, "📅 Digite a nova quantidade de dias (ex: 30):\n\nEnvie /cancelar para cancelar.");
      return;
    }

    if (data.startsWith("admin:change_name:")) {
      if (!this.isOwner(telegramUserId)) return;
      const planId = data.replace("admin:change_name:", "");
      await this.setConversationState(telegramUserId, "admin", { action: "change_name", planId });
      await sendMessage(this.token, chatId, "📝 Digite o novo nome do plano (ex: Mensal):\n\nEnvie /cancelar para cancelar.");
      return;
    }

    if (data === "admin:new_plan") {
      if (!this.isOwner(telegramUserId)) return;
      await this.setConversationState(telegramUserId, "admin", { action: "new_plan", step: "name" });
      await sendMessage(this.token, chatId, "📝 Digite o nome do novo plano (ex: Trimestral):\n\nEnvie /cancelar para cancelar.");
      return;
    }
  }

  async handleAdminConversation(message: TelegramMessage, state: { state_data: Record<string, unknown> }) {
    const chatId = message.chat.id;
    const telegramUserId = message.from!.id;
    const text = message.text || "";
    const stateData = state.state_data as { action: string; planId?: string; step?: string; name?: string; days?: number };

    if (stateData.action === "change_price") {
      const price = parseFloat(text);
      if (isNaN(price) || price <= 0) {
        await sendMessage(this.token, chatId, "❌ Preço inválido. Digite novamente:");
        return;
      }
      await this.supabase
        .from("subscription_plans")
        .update({ price })
        .eq("id", stateData.planId);
      await this.clearConversationState(telegramUserId, "admin");
      await sendMessage(this.token, chatId, `✅ Preço atualizado para R$ ${price.toFixed(2)}!`,
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans")]));
      return;
    }

    if (stateData.action === "change_days") {
      const days = parseInt(text);
      if (isNaN(days) || days <= 0) {
        await sendMessage(this.token, chatId, "❌ Número inválido. Digite novamente:");
        return;
      }
      await this.supabase
        .from("subscription_plans")
        .update({ days })
        .eq("id", stateData.planId);
      await this.clearConversationState(telegramUserId, "admin");
      await sendMessage(this.token, chatId, `✅ Dias atualizados para ${days}!`,
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans")]));
      return;
    }

    if (stateData.action === "change_name") {
      await this.supabase
        .from("subscription_plans")
        .update({ name: text, title: text })
        .eq("id", stateData.planId);
      await this.clearConversationState(telegramUserId, "admin");
      await sendMessage(this.token, chatId, `✅ Nome atualizado para "${text}"!`,
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans")]));
      return;
    }

    if (stateData.action === "new_plan") {
      if (stateData.step === "name") {
        await this.setConversationState(telegramUserId, "admin", {
          action: "new_plan",
          step: "days",
          name: text,
        });
        await sendMessage(this.token, chatId, "📅 Digite a quantidade de dias (ex: 90):\n\nEnvie /cancelar para cancelar.");
        return;
      }

      if (stateData.step === "days") {
        const days = parseInt(text);
        if (isNaN(days) || days <= 0) {
          await sendMessage(this.token, chatId, "❌ Número inválido. Digite novamente:");
          return;
        }
        await this.setConversationState(telegramUserId, "admin", {
          action: "new_plan",
          step: "price",
          name: stateData.name,
          days,
        });
        await sendMessage(this.token, chatId, "💰 Digite o preço (ex: 25.00):\n\nEnvie /cancelar para cancelar.");
        return;
      }

      if (stateData.step === "price") {
        const price = parseFloat(text);
        if (isNaN(price) || price <= 0) {
          await sendMessage(this.token, chatId, "❌ Preço inválido. Digite novamente:");
          return;
        }

        const name = stateData.name!;
        const days = stateData.days!;
        const code = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();

        await this.supabase.from("subscription_plans").insert({
          user_id: this.bot.user_id,
          code,
          name,
          title: name,
          days,
          price,
          is_active: true,
        });

        await this.clearConversationState(telegramUserId, "admin");
        await sendMessage(this.token, chatId,
          `✅ <b>Plano criado com sucesso!</b>\n\n` +
          `📦 Nome: ${name}\n` +
          `📅 Dias: ${days}\n` +
          `💰 Preço: R$ ${price.toFixed(2)}\n` +
          `📋 Código: ${code}`,
          keyboard([btn("🔙 Voltar aos Planos", "admin:plans")])
        );
        return;
      }
    }
  }
}

// =============== MAIN HANDLER ===============
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    if (!botId) {
      console.error("No botId provided");
      return new Response("OK", { status: 200 });
    }

    const { data: bot } = await supabase
      .from("telegram_bots")
      .select("*, bot_security_settings(*)")
      .eq("id", botId)
      .single();

    if (!bot) {
      console.error("Bot not found:", botId);
      return new Response("OK", { status: 200 });
    }

    const { data: settings } = await supabase
      .from("bot_settings")
      .select("*")
      .eq("bot_id", botId)
      .single();

    const botSettings: BotSettings = (settings as BotSettings | null) || {
      owner_ids: [],
      group_chat_id: null,
      group_url: null,
      terms_text: "",
      terms_enabled: false,
      mute_new_members: false,
      announce_payments: true,
    };

    const update: TelegramUpdate = await req.json();
    console.log("Received update:", JSON.stringify(update).substring(0, 500));

    const handler = new BotHandler(supabase, bot as BotData, botSettings, update);
    await handler.handleUpdate();

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
