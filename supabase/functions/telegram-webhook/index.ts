import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

// Efeitos visuais do Telegram (IDs oficiais válidos)
const MESSAGE_EFFECTS: Record<string, string> = {
  fire: '5104841245755180586',   // 🔥
  like: '5107584321108051014',   // 👍
  heart: '5159385139981059251',  // ❤️
  party: '5046509860389126442',  // 🎉
  none: '',                       // Sem efeito
};

// Função para obter o effect_id baseado na configuração
function getMessageEffectId(effectType: string | null | undefined): string | undefined {
  if (!effectType || effectType === 'none') return undefined;
  return MESSAGE_EFFECTS[effectType] || MESSAGE_EFFECTS.party;
}

// =============== TYPES ===============
interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  is_bot?: boolean;
  can_manage_bots?: boolean;
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
  sender_tag?: string;
  managed_bot_created?: unknown;
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
  // Configurações de reações
  react_to_messages: boolean;
  reaction_mode: string | null; // 'fixed' ou 'random'
  fixed_emoji: string | null;
  custom_emojis: string[] | null;
  // Efeito visual nas mensagens
  message_effect: string | null; // 'fire', 'like', 'heart', 'party', 'none'
  // Modo manutenção
  maintenance_mode: boolean;
  maintenance_message: string;
  // Custom emoji IDs para botões
  button_emoji_ids: Record<string, string>;
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
  context?: string;
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

// =============== QUERY STATUS MAP (from DB with cache) ===============
let cachedModuleStatus: Record<string, boolean> | null = null;
let moduleCacheTime = 0;
const MODULE_CACHE_TTL = 60_000; // 60 seconds

async function loadModuleStatus(supabase: SupabaseClient): Promise<Record<string, boolean>> {
  const now = Date.now();
  if (cachedModuleStatus && (now - moduleCacheTime) < MODULE_CACHE_TTL) {
    return cachedModuleStatus;
  }

  try {
    const { data, error } = await supabase
      .from("query_modules")
      .select("module_key, enabled");

    if (error || !data) {
      console.warn("[query_modules] Erro ao carregar:", error?.message);
      // Fallback: tudo habilitado
      return cachedModuleStatus || {};
    }

    const status: Record<string, boolean> = {};
    for (const row of data) {
      status[row.module_key] = row.enabled ?? true;
    }
    cachedModuleStatus = status;
    moduleCacheTime = now;
    return status;
  } catch (e) {
    console.warn("[query_modules] Exception:", e);
    return cachedModuleStatus || {};
  }
}

// queryTypeAliases mapeia comandos de atalho para o module_key exato na tabela query_modules.
// Esses nomes são os mesmos enviados à API — sem tradução ou remapeamento.
const queryTypeAliases: Record<string, string> = {
  tel: "telefone",
  telefone: "telefone",
  placa2: "placa-serpro",
  placasimples: "placa-simples",
  placasesp: "placa-sesp",
  titulo: "titulo",
  endereco: "endereco",
  renda: "renda",
  processos: "processos",
  bnmp: "bnmp-lc",
  siel: "siel",
  tse: "tse-3",
  mae: "mae",
  credilink: "credilink",
  spc: "cpf-spc",
  poder: "poderaquisitivo",
  sus: "cpfsus",
  cnpj: "cnpj-cred",
  cpfisk: "cpf-isk",
  rg3: "rg-3", pis3: "pis-3", cep3: "cep-3", email3: "email-3",
  nome3: "nome-3", score3: "score-3", parentes3: "parentes-3", telefone3: "telefone-3",
};

function normalizeQueryType(queryType: string): string {
  return queryTypeAliases[queryType] || queryType;
}

async function isQueryTypeEnabled(queryType: string, supabase: SupabaseClient): Promise<boolean> {
  const normalizedType = normalizeQueryType(queryType);
  const status = await loadModuleStatus(supabase);

  // Se o módulo não existe na tabela, considerar habilitado (fallback seguro)
  if (!(normalizedType in status)) return true;

  return status[normalizedType] === true;
}

const queryTypeLabels: Record<string, string> = {
  cpf: "👤 CPF", cpffull: "👤 CPF Full", "cpf-isk": "👤 CPF ISK",
  "cnpj-cred": "🏢 CNPJ",
  placa: "🚗 Placa", "placa-serpro": "🚗 Placa SERPRO", "placa-simples": "🚗 Placa Simples", "placa-sesp": "🚗 Placa SESP",
  telefone: "📞 Telefone", telefonefull: "📞 Telefone Full", "telefone-3": "📞 Telefone v3",
  email: "📧 Email", emailfull: "📧 Email Full", "email-3": "📧 Email v3",
  cep: "📍 CEP", cepfull: "📍 CEP Full", "cep-3": "📍 CEP v3",
  nome: "📝 Nome", nomefull: "📝 Nome Full", "nome-3": "📝 Nome v3",
  score: "📊 Score", "score-3": "📊 Score v3",
  fotosp: "📸 Foto SP", fotorj: "📸 Foto RJ", fotomg: "📸 Foto MG",
  fotopr: "📸 Foto PR", fotoce: "📸 Foto CE", fotoma: "📸 Foto MA",
  fotoes: "📸 Foto ES", fotodf: "📸 Foto DF", fototo: "📸 Foto TO",
  fotoms: "📸 Foto MS", fotoro: "📸 Foto RO", fotopi: "📸 Foto PI",
  rg: "🪪 RG", "rg-3": "🪪 RG v3", cnh: "🪪 CNH", pis: "📋 PIS", "pis-3": "📋 PIS v3",
  pix: "💳 PIX",
  titulo: "📜 Título Eleitor", endereco: "📍 Endereço", renda: "💰 Renda",
  processos: "⚖️ Processos", "bnmp-lc": "🔍 BNMP", siel: "🔎 SIEL",
  "tse-3": "🗳️ TSE", mae: "👩 Mãe", maefull: "👩 Mãe Full",
  credilink: "📊 Credilink", "cpf-spc": "📋 SPC",
  poderaquisitivo: "💎 Poder Aquisitivo", cpfsus: "🏥 SUS",
  parentes: "👨‍👩‍👧‍👦 Parentes", "parentes-3": "👨‍👩‍👧‍👦 Parentes v3",
  chassi: "🔧 Chassi", renavam: "📋 RENAVAM", motor: "⚙️ Motor",
};

const brazilianStates = [
  "SP", "RJ", "MG", "PR", "CE", "MA", "ES", "DF", "TO",
  "MS", "RO", "PI"
];

// Mapa de UF para módulo de foto (apenas estados disponíveis na API)
const ufToFotoModule: Record<string, string> = {
  SP: "fotosp", RJ: "fotorj", MG: "fotomg", PR: "fotopr",
  CE: "fotoce", MA: "fotoma", ES: "fotoes", DF: "fotodf",
  TO: "fototo", MS: "fotoms", RO: "fotoro", PI: "fotopi",
};

const stateNameToUf: Record<string, string> = {
  ACRE: "AC",
  ALAGOAS: "AL",
  AMAPA: "AP",
  AMAZONAS: "AM",
  BAHIA: "BA",
  CEARA: "CE",
  "DISTRITO FEDERAL": "DF",
  "ESPIRITO SANTO": "ES",
  GOIAS: "GO",
  MARANHAO: "MA",
  "MATO GROSSO": "MT",
  "MATO GROSSO DO SUL": "MS",
  "MINAS GERAIS": "MG",
  PARA: "PA",
  PARAIBA: "PB",
  PARANA: "PR",
  PERNAMBUCO: "PE",
  PIAUI: "PI",
  "RIO DE JANEIRO": "RJ",
  "RIO GRANDE DO NORTE": "RN",
  "RIO GRANDE DO SUL": "RS",
  RONDONIA: "RO",
  RORAIMA: "RR",
  "SANTA CATARINA": "SC",
  "SAO PAULO": "SP",
  SERGIPE: "SE",
  TOCANTINS: "TO",
};

function normalizeStateToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase();
}

function normalizeUf(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = normalizeStateToken(value);
  if (!normalized) return null;
  if (normalized in ufToFotoModule) return normalized;
  if (normalized in stateNameToUf) return stateNameToUf[normalized];

  const ufMatch = normalized.match(/\b([A-Z]{2})\b/);
  if (ufMatch && ufMatch[1] in ufToFotoModule) {
    return ufMatch[1];
  }

  return null;
}

function extractUfFromString(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.length <= 3) {
    return normalizeUf(trimmed);
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const found = extractUfFromResult(parsed);
      if (found) return found;
    } catch {
      // ignore malformed JSON strings
    }
  }

  const patterns = [
    /"(?:uf|estado|uf_nascimento|uf_endereco|sg_uf)"\s*:\s*"([^"]+)"/i,
    /\bUF[:=\s-]+([A-Z]{2})\b/i,
    /\bESTADO[:=\s-]+([A-Z]{2}|[A-ZÀ-Ü\s]+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const found = normalizeUf(match[1]);
      if (found) return found;
    }
  }

  return null;
}

// Extrair UF do resultado da consulta (busca profunda)
function extractUfFromResult(data: unknown, depth = 0, seen = new WeakSet<object>()): string | null {
  if (depth > 8 || data === null || data === undefined) return null;

  if (typeof data === 'string') {
    return extractUfFromString(data);
  }

  if (typeof data !== 'object') {
    return null;
  }

  const target = data as object;
  if (seen.has(target)) return null;
  seen.add(target);

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractUfFromResult(item, depth + 1, seen);
      if (found) return found;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;
  const ufFields = ['uf', 'estado', 'UF', 'Estado', 'uf_nascimento', 'uf_endereco', 'estado_nascimento', 'sg_uf'];

  for (const field of ufFields) {
    const found = normalizeUf(obj[field]);
    if (found) return found;
  }

  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = normalizeStateToken(key).toLowerCase();

    if (normalizedKey.includes('uf') || normalizedKey.includes('estado')) {
      const direct = normalizeUf(value);
      if (direct) return direct;
    }

    if (typeof value === 'string') {
      const found = extractUfFromString(value);
      if (found) return found;
      continue;
    }

    const found = extractUfFromResult(value, depth + 1, seen);
    if (found) return found;
  }

  return null;
}

// =============== HELPERS ===============
function btn(text: string, callback_data: string, style?: string, iconCustomEmojiId?: string): InlineButton {
  const b: any = { text, callback_data };
  if (style) b.style = style;
  if (iconCustomEmojiId) b.icon_custom_emoji_id = iconCustomEmojiId;
  return b;
}

function btnUrl(text: string, url: string, style?: string, iconCustomEmojiId?: string): InlineButton {
  const b: any = { text, url };
  if (style) b.style = style;
  if (iconCustomEmojiId) b.icon_custom_emoji_id = iconCustomEmojiId;
  return b;
}


// Premium Custom Emoji IDs (Telegram API 9.4)
const EMOJI = {
  SEARCH: "5368324170671202286",    // 🔍
  DIAMOND: "5471952986970267163",   // 💎
  CHART: "5357506110857498821",     // 📊
  LIGHTNING: "5253959696498104346",  // ⚡
  CHECK: "5370547013043468854",     // ✅
  HOME: "5237699328843200968",      // 🏠
  MEGAPHONE: "5424972541023694017", // 📢
  LIST: "5384162698092301384",      // 📋
  MONEY: "5271604874513397103",     // 💰
  DOOR: "5386654873785498449",      // 🚪
  CART: "5368324170671202286",      // 🛒
  STAR: "5368324170671202286",      // ⭐
  TRASH: "5386399931108030284",     // 🗑️
  PDF: "5386399931108030284",       // 📄
  PHOTO: "5386654873785498449",     // 📸
  BACK: "5237699328843200968",      // 🔙
  USERS: "5384162698092301384",     // 👥
  PENCIL: "5368324170671202286",    // ✏️
  PLUS: "5370547013043468854",      // ➕
  REFRESH: "5253959696498104346",   // 🔄
};

function keyboard(...rows: InlineButton[][]) {
  return { inline_keyboard: rows };
}

// Queue a failed message for later retry
async function queueForRetry(token: string, method: string, body: Record<string, unknown> | undefined, retryAfterSec: number) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to find bot_id from token
    const { data: botData } = await supabase
      .from("telegram_bots")
      .select("id")
      .eq("token", token)
      .maybeSingle();
    
    const retryAt = new Date(Date.now() + retryAfterSec * 1000).toISOString();
    
    await supabase.from("telegram_message_queue").insert({
      bot_id: botData?.id || null,
      method,
      payload: { token_hash: token.slice(-8), body: body || {} },
      retry_after: retryAt,
      status: "pending",
    });
    
    console.log(`[QUEUE] Queued ${method} for retry after ${retryAfterSec}s`);
  } catch (e) {
    console.error("[QUEUE] Failed to queue message:", e);
  }
}

async function telegramRequest(token: string, method: string, body?: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; description?: string; queued?: boolean }> {
  const url = `${TELEGRAM_API}${token}/${method}`;
  console.log(`Telegram API: ${method}`);

  const stripMessageEffect = (payload?: Record<string, unknown>) => {
    if (!payload) return payload;
    if (payload.message_effect_id === undefined) return payload;
    const { message_effect_id: _ignored, ...rest } = payload;
    return rest;
  };

  const shouldRetryWithoutEffect = (data: any) => {
    const desc = String(data?.description || "");
    return (
      desc.includes("EFFECT_ID_INVALID") ||
      desc.includes("can't use message effects") ||
      desc.includes("can't use message effect")
    );
  };

  // Helper to handle 429 rate limit
  const handle429 = async (response: Response, data: any, currentBody?: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; description?: string; queued?: boolean } | null> => {
    if (response.status !== 429) return null;
    
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterBody = data?.parameters?.retry_after;
    const retryAfterSec = parseInt(retryAfterHeader || "") || retryAfterBody || 5;
    
    console.warn(`[429] Rate limited on ${method}, retry_after=${retryAfterSec}s`);
    
    // If short delay (<=5s), retry locally
    if (retryAfterSec <= 5) {
      console.log(`[429] Short delay, retrying locally after ${retryAfterSec}s`);
      await new Promise(r => setTimeout(r, retryAfterSec * 1000));
      
      const retryRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentBody),
      });
      const retryData = await retryRes.json();
      
      if (retryRes.status === 429) {
        // Still rate limited, queue it
        const newRetryAfter = retryData?.parameters?.retry_after || 10;
        await queueForRetry(token, method, currentBody, newRetryAfter);
        return { ok: true, queued: true, description: "Queued for retry" };
      }
      
      return retryData;
    }
    
    // Long delay, queue for later
    await queueForRetry(token, method, currentBody, retryAfterSec);
    return { ok: true, queued: true, description: "Queued for retry" };
  };
  
  try {
    // Telegram não aceita dataURL (data:image/...base64) em JSON no sendPhoto.
    if (method === "sendPhoto" && body && typeof body.photo === "string" && body.photo.startsWith("data:image/")) {
      const dataUrl = body.photo;
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        return { ok: false, description: "Invalid data URL for photo" };
      }

      const mime = match[1];
      const b64 = match[2];
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bin], { type: mime });

      const form = new FormData();
      if (body.chat_id !== undefined) form.set("chat_id", String(body.chat_id));
      if (body.caption !== undefined) form.set("caption", String(body.caption));
      if (body.parse_mode !== undefined) form.set("parse_mode", String(body.parse_mode));
      if (body.reply_markup !== undefined) form.set("reply_markup", JSON.stringify(body.reply_markup));

      const ext = mime.split("/")[1] || "png";
      form.set("photo", new File([blob], `qrcode.${ext}`, { type: mime }));

      const response = await fetch(url, { method: "POST", body: form });
      const data = await response.json();
      
      // Handle 429 for photo uploads
      const queueResult = await handle429(response, data, body);
      if (queueResult) return queueResult;
      
      return data;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    // Handle 429 rate limit
    const queueResult = await handle429(response, data, body);
    if (queueResult) return queueResult;

    // Fallback: se o efeito não for suportado/for inválido, reenviar sem message_effect_id
    if (!data.ok && body?.message_effect_id !== undefined && shouldRetryWithoutEffect(data)) {
      console.warn(`Telegram effect failed (${data?.description}); retrying without message_effect_id`);
      const retryBody = stripMessageEffect(body);
      const retryRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retryBody),
      });
      const retryData = await retryRes.json();
      if (!retryData.ok) {
        console.error(`Telegram API error for ${method} (retry):`, JSON.stringify(retryData));
      }
      return retryData;
    }

    // Fallback: se parse_mode HTML falhou, reenviar como texto puro
    if (!data.ok && method === "sendMessage" && body?.parse_mode === "HTML") {
      const desc = String(data?.description || "");
      if (desc.includes("can't parse entities")) {
        console.warn(`HTML parse failed, retrying as plain text`);
        const plainText = String(body.text || "")
          .replace(/<pre>/g, "").replace(/<\/pre>/g, "")
          .replace(/<b>/g, "").replace(/<\/b>/g, "")
          .replace(/<i>/g, "").replace(/<\/i>/g, "")
          .replace(/<code>/g, "").replace(/<\/code>/g, "")
          .replace(/<a[^>]*>/g, "").replace(/<\/a>/g, "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        const retryBody = { ...body, text: plainText };
        delete retryBody.parse_mode;
        const retryRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(retryBody),
        });
        const retryData = await retryRes.json();
        if (!retryData.ok) {
          console.error(`Telegram API error for ${method} (plain retry):`, JSON.stringify(retryData));
        }
        return retryData;
      }
    }

    if (!data.ok) {
      console.error(`Telegram API error for ${method}:`, JSON.stringify(data));
    }
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

// Função para dividir texto em páginas
function splitIntoPages(text: string, maxLength: number = 3800): string[] {
  // Strip outer <pre> tags before splitting, then re-add per page
  let content = text;
  let wrapPre = false;
  if (content.startsWith('<pre>') && content.endsWith('</pre>')) {
    content = content.slice(5, -6);
    wrapPre = true;
    // Adjust maxLength to account for <pre></pre> tags (11 chars)
    maxLength = maxLength - 11;
  }

  const pages: string[] = [];
  let remaining = content;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      pages.push(wrapPre ? `<pre>${remaining}</pre>` : remaining);
      break;
    }
    
    // Tentar quebrar em uma linha
    let breakPoint = remaining.lastIndexOf('\n', maxLength);
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf(' ', maxLength);
    }
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = maxLength;
    }
    
    let pageContent = remaining.substring(0, breakPoint);
    
    // Sanitizar HTML: fechar tags abertas e remover tags de fechamento órfãs
    pageContent = sanitizeHtmlPage(pageContent);
    
    pages.push(wrapPre ? `<pre>${pageContent}</pre>` : pageContent);
    remaining = remaining.substring(breakPoint).trim();
  }
  
  return pages;
}

// Sanitiza página HTML para evitar tags mal formadas
function sanitizeHtmlPage(html: string): string {
  // Tags HTML que o Telegram suporta
  const supportedTags = ['b', 'i', 'u', 's', 'code', 'pre', 'a', 'em', 'strong'];
  
  // Contar tags abertas e fechadas
  for (const tag of supportedTags) {
    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');
    const openCount = (html.match(openRegex) || []).length;
    const closeCount = (html.match(closeRegex) || []).length;
    
    // Se há mais tags abertas que fechadas, fechar as que faltam
    if (openCount > closeCount) {
      for (let i = 0; i < openCount - closeCount; i++) {
        html += `</${tag}>`;
      }
    }
    // Se há mais tags de fechamento que abertas, remover as extras do início
    if (closeCount > openCount) {
      let excess = closeCount - openCount;
      html = html.replace(new RegExp(`</${tag}>`, 'gi'), (match) => {
        if (excess > 0) {
          excess--;
          return '';
        }
        return match;
      });
    }
  }
  
  return html;
}

// =============== GERADOR DE TXT COMPLETO ===============
interface TxtFieldLabels {
  [key: string]: string;
}

const txtFieldLabels: TxtFieldLabels = {
  nome: "Nome",
  cpf: "CPF",
  nascimento: "Data de Nascimento",
  data_nascimento: "Data de Nascimento",
  data_de_nascimento: "Data de Nascimento",
  sexo: "Sexo",
  idade: "Idade",
  mae: "Nome da Mãe",
  nome_mae: "Nome da Mãe",
  nome_da_mae: "Nome da Mãe",
  pai: "Nome do Pai",
  nome_pai: "Nome do Pai",
  nome_do_pai: "Nome do Pai",
  rg: "RG",
  cnh: "CNH",
  pis: "PIS",
  nis: "NIS",
  cns: "CNS",
  titulo_eleitor: "Título de Eleitor",
  titulo: "Título de Eleitor",
  zona: "Zona Eleitoral",
  secao: "Seção",
  email: "E-mail",
  telefone: "Telefone",
  celular: "Celular",
  endereco: "Endereço",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  estado: "Estado",
  cep: "CEP",
  renda: "Renda Estimada",
  score: "Score",
  classe_social: "Classe Social",
  estado_civil: "Estado Civil",
  profissao: "Profissão",
  escolaridade: "Escolaridade",
  naturalidade: "Naturalidade",
  nacionalidade: "Nacionalidade",
  tipo_sanguineo: "Tipo Sanguíneo",
  obito: "Óbito",
  status_receita: "Status na Receita",
  placa: "Placa",
  chassi: "Chassi",
  renavam: "RENAVAM",
  marca: "Marca",
  modelo: "Modelo",
  ano: "Ano",
  cor: "Cor",
  cnpj: "CNPJ",
  razao_social: "Razão Social",
  nome_fantasia: "Nome Fantasia",
  raca: "Raça",
  signo: "Signo",
};

const txtCategories: Record<string, string[]> = {
  "DADOS PESSOAIS": ["nome", "cpf", "nascimento", "data_nascimento", "data_de_nascimento", "sexo", "idade", "naturalidade", "nacionalidade", "raca", "tipo_sanguineo", "estado_civil", "obito", "status_receita", "signo"],
  "DOCUMENTOS": ["rg", "cnh", "pis", "nis", "cns", "titulo_eleitor", "titulo", "zona", "secao", "ctps"],
  "CONTATO": ["email", "emails", "telefone", "telefones", "celular", "whatsapp", "ddd"],
  "ENDEREÇO": ["endereco", "logradouro", "numero", "complemento", "bairro", "cidade", "uf", "estado", "cep", "municipio"],
  "FINANCEIRO": ["renda", "score", "classe_social", "classe", "poder_aquisitivo", "bancos"],
  "FAMÍLIA": ["mae", "nome_mae", "nome_da_mae", "pai", "nome_pai", "nome_do_pai", "parentes", "conjuge", "filhos"],
  "PROFISSIONAL": ["profissao", "escolaridade", "emprego", "empregos", "cargo", "empresa"],
  "VEÍCULO": ["placa", "chassi", "renavam", "marca", "modelo", "ano", "cor", "combustivel", "tipo_veiculo"],
  "EMPRESA": ["cnpj", "razao_social", "nome_fantasia", "capital_social", "atividade", "porte"],
};

const txtCategoryOrder = [
  "DADOS PESSOAIS",
  "DOCUMENTOS", 
  "CONTATO",
  "ENDEREÇO",
  "FINANCEIRO",
  "FAMÍLIA",
  "PROFISSIONAL",
  "VEÍCULO",
  "EMPRESA",
  "OUTROS"
];

function getTxtCategory(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  for (const [category, fields] of Object.entries(txtCategories)) {
    if (fields.some(f => keyLower.includes(f) || keyLower === f)) {
      return category;
    }
  }
  return "OUTROS";
}

function getTxtLabel(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  if (txtFieldLabels[keyLower]) return txtFieldLabels[keyLower];
  for (const [field, label] of Object.entries(txtFieldLabels)) {
    if (keyLower.includes(field)) return label;
  }
  return key
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Deep extract photo from nested API response (handles dados.data.foto.base64, etc.)
function deepExtractPhoto(obj: unknown, depth = 0): string | null {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;
  const record = obj as Record<string, unknown>;
  
  // Check direct photo fields
  const photoKeys = ['foto', 'image', 'photo', 'fotoBase64', 'base64', 'url'];
  for (const key of photoKeys) {
    const val = record[key];
    if (val && typeof val === 'string' && val.length > 100) {
      // Likely base64 or URL
      if (val.startsWith('/9j/') || val.startsWith('iVBOR')) {
        return `data:image/jpeg;base64,${val}`;
      }
      if (val.startsWith('data:image/') || val.startsWith('http')) {
        return val;
      }
    }
    // foto could be an object like {base64: "..."} 
    if (val && typeof val === 'object') {
      const nested = val as Record<string, unknown>;
      if (nested.base64 && typeof nested.base64 === 'string' && nested.base64.length > 100) {
        const b64 = nested.base64;
        if (b64.startsWith('/9j/') || b64.startsWith('iVBOR')) {
          return `data:image/jpeg;base64,${b64}`;
        }
        if (b64.startsWith('data:image/')) return b64;
        // Assume JPEG if raw base64
        return `data:image/jpeg;base64,${b64}`;
      }
    }
  }
  
  // Recurse into nested objects (dados, data, etc.)
  const recurseKeys = ['dados', 'data', 'result', 'resultado', 'resposta', 'response'];
  for (const key of recurseKeys) {
    if (record[key] && typeof record[key] === 'object') {
      const found = deepExtractPhoto(record[key], depth + 1);
      if (found) return found;
    }
  }
  
  return null;
}

const txtIgnoredKeys = [
  "comando", "error", "fotobase64", "foto", "image", "photo", "base64",
  "raw", "status", "success", "notfound",
  "sucesso", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario",
  "reset_em", "tipo", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "ddd", "classificacao", "modulo",
  "conta", "saldo", "tempo_segundos", "temposegundos", "cache", "cached_at",
  "expiracao", "duration_ms", "limites", "plano"
];

// Bot references to filter out in TXT
const txtBotReferences = [
  "@querybuscasbot", "querybuscasbot", "t.me/querybuscas", 
  "https://t.me/querybuscas", "@QueryBuscasBot", "querybuscas"
];

// Lines to skip entirely in TXT
const txtSkipPatterns = [
  /^@querybuscasbot$/i,
  /^https?:\/\/t\.me\/querybuscas$/i,
  /^resultados encontrados/i,
  /^base \d+$/i,
  /^\( \d+ - encontrados?\)$/i,
  /^empresas:/i,
  /^emails:/i,
  /^telefones:/i,
  /^parentes:/i,
  /^endereços:/i,
];

function shouldIgnoreTxtKey(key: string): boolean {
  const keyLower = key.toLowerCase();
  if (txtIgnoredKeys.some(ik => keyLower === ik || keyLower.endsWith('.' + ik))) return true;
  if (keyLower.endsWith('_consultada')) return true;
  return false;
}

function shouldIgnoreTxtSingleValue(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "N/A" || trimmed === "null" || trimmed === "undefined") {
    return true;
  }
  // Skip base64 image data
  if (trimmed.startsWith("/9j/") || trimmed.startsWith("iVBOR") || trimmed.startsWith("data:image")) {
    return true;
  }
  // Skip lines that are just bot references
  const valueLower = trimmed.toLowerCase();
  if (valueLower === "@querybuscasbot" || valueLower === "https://t.me/querybuscas" || valueLower === "querybuscas") {
    return true;
  }
  return false;
}

function cleanTxtBotReferences(str: string): string {
  if (!str) return str;
  // Remove bot reference lines but keep the data
  let result = str;
  for (const ref of txtBotReferences) {
    result = result.replace(new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  }
  return result;
}

function parseTxtDelimitedKey(key: string): { realKey: string; realValue: string } | null {
  const delimiters = [' ⎯ ', ' — ', ': '];
  for (const delim of delimiters) {
    const idx = key.indexOf(delim);
    if (idx > 0) {
      const realKey = key.substring(0, idx).trim()
        .replace(/^[•\-\s📛🆔👤📅🏠📍💰👨‍👩‍👧‍👦📞📧🔍📊🏢🚗📝]+/, '')
        .toLowerCase()
        .replace(/\s+/g, '_');
      const realValue = key.substring(idx + delim.length).trim();
      if (realKey && realValue && realValue !== '-' && realValue !== 'N/A') {
        return { realKey, realValue };
      }
    }
  }
  return null;
}

function parseTxtStringData(str: string): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  if (!str || typeof str !== "string") return items;
  
  // First clean bot references
  const cleanStr = cleanTxtBotReferences(str);
  const lines = cleanStr.split('\n');
  
  let currentSection = "";
  let sectionItems: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip lines that match skip patterns
    if (txtSkipPatterns.some(p => p.test(trimmedLine))) {
      // Check if it's a section header
      if (/^(empresas|emails|telefones|parentes|endereços):/i.test(trimmedLine)) {
        // Save previous section
        if (currentSection && sectionItems.length > 0) {
          items.push({ key: currentSection, value: sectionItems.join(" | ") });
        }
        currentSection = trimmedLine.replace(/:/g, '').toLowerCase().trim();
        sectionItems = [];
      }
      continue;
    }
    
    // Skip lines that are just separators or headers
    if (trimmedLine.match(/^[═─┌┐└┘├┤│]+$/) || trimmedLine.startsWith('═')) continue;
    
    // Check for bullet point items (part of a list)
    if (trimmedLine.startsWith('•')) {
      const itemValue = trimmedLine.substring(1).trim();
      if (itemValue && !shouldIgnoreTxtSingleValue(itemValue)) {
        sectionItems.push(itemValue);
      }
      continue;
    }
    
    // Try to parse as key-value pair
    const delimiters = [' ⎯ ', ' — ', ': '];
    let found = false;
    
    for (const delim of delimiters) {
      const idx = trimmedLine.indexOf(delim);
      if (idx > 0) {
        const key = trimmedLine.substring(0, idx).trim()
          .replace(/^[•\-\s📛🆔👤📅🏠📍💰👨‍👩‍👧‍👦📞📧🔍📊🏢🚗📝│├└┌`]+/, '')
          .toLowerCase()
          .replace(/\s+/g, '_');
        const value = trimmedLine.substring(idx + delim.length).trim();
        
        if (key && key.length > 1 && value && !shouldIgnoreTxtSingleValue(value)) {
          // Check if value is a count header like "( 2 - Encontrados)"
          const isCountHeader = /^\(?\s*\d+\s*-?\s*encontrados?\s*\)?$/i.test(value);
          
          if (isCountHeader) {
            // Save any pending section items
            if (currentSection && sectionItems.length > 0) {
              items.push({ key: currentSection, value: sectionItems.join(" | ") });
            }
            // Set as current section to collect following lines
            currentSection = key;
            sectionItems = [];
            // Also add the count as info
            items.push({ key, value });
            found = true;
          } else {
            // Save any pending section items
            if (currentSection && sectionItems.length > 0) {
              items.push({ key: currentSection, value: sectionItems.join(" | ") });
              currentSection = "";
              sectionItems = [];
            }
            items.push({ key, value });
            found = true;
          }
        }
        break;
      }
    }
    
    // If not a key-value pair and not empty, could be part of a list or section content
    if (!found && trimmedLine.length > 2 && !shouldIgnoreTxtSingleValue(trimmedLine)) {
      // If we have a current section, collect all non-empty lines as section items
      if (currentSection) {
        sectionItems.push(trimmedLine);
      } else if (/\d/.test(trimmedLine) || trimmedLine.includes(' - ')) {
        sectionItems.push(trimmedLine);
      }
    }
  }
  
  // Save last section if any
  if (currentSection && sectionItems.length > 0) {
    items.push({ key: currentSection, value: sectionItems.join(" | ") });
  }
  
  return items;
}

function extractAllTxtData(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  
  if (!obj || typeof obj !== "object") return items;
  
  const record = obj as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(record)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Skip only strict technical keys
    if (shouldIgnoreTxtKey(key)) continue;
    
    // Check if key contains embedded value (NexFuture format: "Nome ⎯ João Silva")
    const parsed = parseTxtDelimitedKey(key);
    if (parsed && !shouldIgnoreTxtSingleValue(parsed.realValue)) {
      items.push({ key: parsed.realKey, value: parsed.realValue });
      continue;
    }
    
    // Handle string values - always try to parse even if contains bot refs
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      
      // Skip completely empty or useless values
      if (!trimmedValue || trimmedValue === "-" || trimmedValue === "N/A") continue;
      
      // Skip base64 image data
      if (trimmedValue.startsWith("/9j/") || trimmedValue.startsWith("iVBOR") || trimmedValue.startsWith("data:image")) continue;
      
      // Check if it's multi-line formatted data (parse it line by line)
      if (trimmedValue.includes('\n')) {
        const parsedItems = parseTxtStringData(trimmedValue);
        
        if (parsedItems.length > 0) {
          for (const item of parsedItems) {
            if (!shouldIgnoreTxtKey(item.key) && !shouldIgnoreTxtSingleValue(item.value)) {
              items.push(item);
            }
          }
        } else {
          // If parsing fails, include raw text (but clean it)
          const cleanValue = cleanTxtBotReferences(trimmedValue)
            .replace(/[═─┌┐└┘├┤│]+/g, '')
            .replace(/\n+/g, ' ')
            .trim();
          if (cleanValue && cleanValue.length > 2 && !shouldIgnoreTxtSingleValue(cleanValue)) {
            items.push({ key: fullKey, value: cleanValue });
          }
        }
      } else {
        // Single-line value - add directly if not a bot reference
        if (!shouldIgnoreTxtSingleValue(trimmedValue)) {
          items.push({ key: fullKey, value: trimmedValue });
        }
      }
      continue;
    }
    
    // Handle nested objects
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      items.push(...extractAllTxtData(value, fullKey));
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      const validItems: string[] = [];
      for (const item of value) {
        if (typeof item === "string") {
          if (!shouldIgnoreTxtSingleValue(item)) {
            validItems.push(item);
          }
        } else if (typeof item === "object" && item !== null) {
          const subItems = extractAllTxtData(item, "");
          for (const subItem of subItems) {
            validItems.push(`${getTxtLabel(subItem.key)}: ${subItem.value}`);
          }
        } else if (item !== null && item !== undefined) {
          validItems.push(String(item));
        }
      }
      
      if (validItems.length > 0) {
        items.push({ key: fullKey, value: validItems.join(" | ") });
      }
      continue;
    }
    
    // Handle other primitives (numbers, booleans)
    if (value !== null && value !== undefined) {
      items.push({ key: fullKey, value: String(value) });
    }
  }
  
  return items;
}

function generateTxtContent(queryType: string, queryInput: string, data: Record<string, unknown>): string {
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  console.log("TXT Generation - Input data keys:", Object.keys(data));
  console.log("TXT Generation - Data preview:", JSON.stringify(data).substring(0, 1000));
  
  let txt = `════════════════════════════════════════════════════════════\n`;
  txt += `                  RELATÓRIO DE CONSULTA\n`;
  txt += `════════════════════════════════════════════════════════════\n\n`;
  txt += `Tipo: ${queryType.toUpperCase()}\n`;
  txt += `Consulta: ${queryInput}\n`;
  txt += `Gerado em: ${dateStr}\n\n`;
  txt += `════════════════════════════════════════════════════════════\n\n`;
  
  // Extract and organize data
  const items = extractAllTxtData(data);
  console.log("TXT Generation - Extracted items count:", items.length);
  
  if (items.length === 0) {
    // If no items were extracted, try to parse raw 'data' field directly
    const rawData = data.data || data.texto || data.text;
    if (typeof rawData === "string" && rawData.includes('\n')) {
      const parsedItems = parseTxtStringData(rawData);
      if (parsedItems.length > 0) {
        items.push(...parsedItems);
      }
    }
  }
  
  if (items.length === 0) {
    // If still no items, dump raw data
    txt += `┌─────────────────────────────────────────────────────────────\n`;
    txt += `│ DADOS BRUTOS\n`;
    txt += `├─────────────────────────────────────────────────────────────\n`;
    
    for (const [key, value] of Object.entries(data)) {
      if (shouldIgnoreTxtKey(key)) continue;
      
      const label = getTxtLabel(key);
      let displayValue: string;
      
      if (typeof value === "string") {
        displayValue = cleanTxtBotReferences(value).trim();
      } else if (typeof value === "object") {
        displayValue = JSON.stringify(value, null, 2)
          .replace(/[{}[\]"]/g, '')
          .replace(/,\n/g, '\n')
          .trim();
      } else {
        displayValue = String(value);
      }
      
      if (displayValue && displayValue.length > 2) {
        txt += `│ ${label}: ${displayValue}\n`;
      }
    }
    
    txt += `└─────────────────────────────────────────────────────────────\n\n`;
  } else {
    // Merge duplicates instead of dropping them
    const mergedMap = new Map<string, { key: string; values: string[] }>();
    for (const item of items) {
      const keyNorm = item.key.toLowerCase().replace(/[.\s]/g, '_');
      if (mergedMap.has(keyNorm)) {
        const existing = mergedMap.get(keyNorm)!;
        // Don't add duplicate values
        if (!existing.values.includes(item.value)) {
          existing.values.push(item.value);
        }
      } else {
        mergedMap.set(keyNorm, { key: item.key, values: [item.value] });
      }
    }
    const uniqueItems = Array.from(mergedMap.values()).map(entry => ({
      key: entry.key,
      value: entry.values.join(" | "),
    }));
    
    console.log("TXT Generation - Unique items count:", uniqueItems.length);
    
    // Group by category
    const grouped: Record<string, Array<{ key: string; value: string }>> = {};
    for (const item of uniqueItems) {
      const cat = getTxtCategory(item.key);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    
    // Write categories in order
    let hasContent = false;
    for (const category of txtCategoryOrder) {
      const catItems = grouped[category];
      if (!catItems || catItems.length === 0) continue;
      
      hasContent = true;
      txt += `┌─────────────────────────────────────────────────────────────\n`;
      txt += `│ ${category}\n`;
      txt += `├─────────────────────────────────────────────────────────────\n`;
      
      for (const item of catItems) {
        const label = getTxtLabel(item.key.split(".").pop() || item.key);
        // Word wrap long values
        const maxLineLength = 55;
        let value = item.value;
        if (value.length > maxLineLength) {
          const words = value.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          for (const word of words) {
            if (currentLine.length + word.length + 1 <= maxLineLength) {
              currentLine += (currentLine ? ' ' : '') + word;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          txt += `│ ${label}: ${lines[0]}\n`;
          for (let i = 1; i < lines.length; i++) {
            txt += `│   ${lines[i]}\n`;
          }
        } else {
          txt += `│ ${label}: ${value}\n`;
        }
      }
      
      txt += `└─────────────────────────────────────────────────────────────\n\n`;
    }
    
    if (!hasContent) {
      txt += `(Nenhum dado encontrado)\n\n`;
    }
  }
  
  txt += `════════════════════════════════════════════════════════════\n`;
  txt += `                  Documento Oficial\n`;
  txt += `                  Uso Restrito\n`;
  txt += `════════════════════════════════════════════════════════════\n`;
  
  return txt;
}

// Função para criar botões de paginação
function createPaginationKeyboard(
  paginationId: string,
  currentPage: number,
  totalPages: number,
  queryType?: string,
  queryInput?: string,
  extraButtons?: InlineButton[][]
) {
  const buttons: InlineButton[] = [];
  
  // Botão anterior
  if (currentPage > 0) {
    buttons.push({ text: "◀️ Anterior", callback_data: `page:${paginationId}:${currentPage - 1}` });
  }
  
  // Indicador de página
  buttons.push({ text: `${currentPage + 1}/${totalPages}`, callback_data: "noop" });
  
  // Botão próximo
  if (currentPage < totalPages - 1) {
    buttons.push({ text: "Próximo ▶️", callback_data: `page:${paginationId}:${currentPage + 1}` });
  }
  
  const keyboard: InlineButton[][] = [buttons];
  
  // Botões extras (ex: Consultar Foto) — aparecem primeiro, acima dos demais
  if (extraButtons && extraButtons.length > 0) {
    keyboard.push(...extraButtons);
  }

  // Botão de apagar
  keyboard.push([{ text: "🗑️ Apagar", callback_data: `page_delete:${paginationId}` }]);
  
  // Botões de download (PDF e TXT)
  if (queryType && queryInput) {
    const isPhotoQuery = queryType.toLowerCase() === 'foto' || queryType.toLowerCase() === 'nacional';
    keyboard.push([{ text: "📄 Baixar PDF", callback_data: `pdf:${queryType}:${queryInput}` }]);
    if (!isPhotoQuery) {
      keyboard.push([{ text: "📝 Ver TXT", callback_data: `txt:${queryType}:${queryInput}` }]);
    }
  }

  // Botão de comandos
  keyboard.push([{ text: "📋 Comandos", callback_data: "show_commands" }]);
  
  return { inline_keyboard: keyboard };
}

// Função para enviar mensagens longas com paginação por botões
async function sendLongMessagePaginated(
  token: string, 
  chatId: number, 
  text: string, 
  supabase: SupabaseClient,
  replyToId?: number,
  messageEffectId?: string,
  queryType?: string,
  queryInput?: string,
  extraButtons?: InlineButton[][]
) {
  const MAX_LENGTH = 3800;
  
  // Criar teclado com botões de PDF e TXT abaixo do Apagar
  const createKeyboard = (paginationId?: string) => {
    const buttons: InlineButton[][] = [];
    
    // Botões extras (ex: Consultar Foto) — aparecem primeiro, acima dos demais
    if (extraButtons && extraButtons.length > 0) {
      buttons.push(...extraButtons);
    }

    // Botão de apagar
    if (paginationId) {
      buttons.push([{ text: "🗑️ Apagar", callback_data: `page_delete:${paginationId}`, style: "danger" }]);
    } else {
      buttons.push([{ text: "🗑️ Apagar", callback_data: "delete_msg", style: "danger" }]);
    }
    
    // Botões de download (PDF e TXT)
    if (queryType && queryInput) {
      const isPhotoQuery = queryType.toLowerCase() === 'foto' || queryType.toLowerCase() === 'nacional';
      buttons.push([{ text: "📄 Baixar PDF", callback_data: `pdf:${queryType}:${queryInput}`, style: "success" }]);
      if (!isPhotoQuery) {
        buttons.push([{ text: "📝 Ver TXT", callback_data: `txt:${queryType}:${queryInput}` }]);
      }
    }
    // Botão de comandos
    buttons.push([{ text: "📋 Comandos", callback_data: "show_commands" }]);
    return { inline_keyboard: buttons };
  };
  
  // Se cabe em uma mensagem, enviar normalmente
  if (text.length <= MAX_LENGTH) {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
      reply_markup: createKeyboard(),
    };
    if (messageEffectId) {
      payload.message_effect_id = messageEffectId;
    }
    return telegramRequest(token, "sendMessage", payload);
  }
  
  // Dividir em páginas
  const pages = splitIntoPages(text, MAX_LENGTH);
  
  // Criar registro no banco com metadata para preservar botões ao paginar
  const paginationMetadata: Record<string, unknown> = {};
  if (queryType) paginationMetadata.queryType = queryType;
  if (queryInput) paginationMetadata.queryInput = queryInput;
  if (extraButtons && extraButtons.length > 0) paginationMetadata.extraButtons = extraButtons;

  const { data: paginationData, error } = await supabase
    .from("paginated_results")
    .insert({
      chat_id: chatId,
      pages: pages,
      current_page: 0,
      total_pages: pages.length,
      metadata: paginationMetadata,
    })
    .select("id")
    .single();
  
  if (error || !paginationData) {
    console.error("Failed to create pagination record:", error);
    // Fallback: enviar primeira página sem paginação
    return telegramRequest(token, "sendMessage", {
      chat_id: chatId,
      text: `📄 <b>Página 1/${pages.length}</b>\n\n${pages[0]}\n\n<i>⚠️ Paginação indisponível</i>`,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
      reply_markup: { inline_keyboard: [[{ text: "🗑️ Apagar", callback_data: "delete_msg" }]] },
    });
  }
  
  const paginationId = paginationData.id;
  const keyboard = createPaginationKeyboard(paginationId, 0, pages.length, queryType, queryInput, extraButtons);
  
  // Enviar primeira página
  const pageHeader = `📄 <b>Página 1/${pages.length}</b>\n\n`;
  const paginatedPayload: Record<string, unknown> = {
    chat_id: chatId,
    text: pageHeader + pages[0],
    parse_mode: "HTML",
    reply_to_message_id: replyToId,
    reply_markup: keyboard,
  };
  if (messageEffectId) {
    paginatedPayload.message_effect_id = messageEffectId;
  }
  const result = await telegramRequest(token, "sendMessage", paginatedPayload);
  
  // Atualizar message_id no banco
  if (result.ok && result.result) {
    const messageResult = result.result as { message_id?: number };
    if (messageResult.message_id) {
      await supabase
        .from("paginated_results")
        .update({ message_id: messageResult.message_id })
        .eq("id", paginationId);
    }
  }
  
  return result;
}

// Função legada para compatibilidade
async function sendLongMessage(token: string, chatId: number, text: string, replyToId?: number, includeDeleteButton = true) {
  const MAX_LENGTH = 4000;
  
  const deleteKeyboard = includeDeleteButton ? {
    inline_keyboard: [[{ text: "🗑️ Apagar", callback_data: "delete_msg" }]]
  } : undefined;
  
  if (text.length <= MAX_LENGTH) {
    return telegramRequest(token, "sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
      reply_markup: deleteKeyboard,
    });
  }
  
  const pages = splitIntoPages(text, MAX_LENGTH);
  
  for (let i = 0; i < pages.length; i++) {
    const partHeader = pages.length > 1 ? `📄 <b>Parte ${i + 1}/${pages.length}</b>\n\n` : '';
    const isLastPart = i === pages.length - 1;
    await telegramRequest(token, "sendMessage", {
      chat_id: chatId,
      text: partHeader + pages[i],
      parse_mode: "HTML",
      reply_to_message_id: i === 0 ? replyToId : undefined,
      reply_markup: isLastPart ? deleteKeyboard : undefined,
    });
  }
}

async function editMessage(token: string, chatId: number, messageId: number, text: string, replyMarkup?: unknown) {
  const result = await telegramRequest(token, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  });

  // Fallback: se HTML falhou, reenviar como texto puro
  if (!result.ok) {
    const desc = String(result.description || "");
    if (desc.includes("can't parse entities") || desc.includes("Unexpected end tag") || desc.includes("Unclosed tag")) {
      logCmd('WARN', 'EDIT_HTML_FAIL', { chatId, messageId, desc: desc.substring(0, 100) });
      const plainText = text
        .replace(/<pre>/g, "").replace(/<\/pre>/g, "")
        .replace(/<b>/g, "").replace(/<\/b>/g, "")
        .replace(/<i>/g, "").replace(/<\/i>/g, "")
        .replace(/<code>/g, "").replace(/<\/code>/g, "")
        .replace(/<a[^>]*>/g, "").replace(/<\/a>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      return telegramRequest(token, "editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: plainText,
        reply_markup: replyMarkup,
      });
    }
  }

  return result;
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

// Emojis garantidos como válidos pela API do Telegram
const SAFE_REACTION_EMOJIS = ['👍', '❤️', '🔥', '🎉', '👏', '⚡', '😎', '💯'];

// Função para enviar reação a uma mensagem com fallback
async function setMessageReaction(token: string, chatId: number, messageId: number, emoji: string) {
  try {
    return await telegramRequest(token, "setMessageReaction", {
      chat_id: chatId,
      message_id: messageId,
      reaction: [{ type: "emoji", emoji }],
      is_big: false,
    });
  } catch (err) {
    const errMsg = String(err);
    if (errMsg.includes('REACTION_INVALID') || errMsg.includes('Bad Request')) {
      console.log(`[Reaction] Emoji "${emoji}" inválido, usando fallback 👍`);
      try {
        return await telegramRequest(token, "setMessageReaction", {
          chat_id: chatId,
          message_id: messageId,
          reaction: [{ type: "emoji", emoji: "👍" }],
          is_big: false,
        });
      } catch (_fallbackErr) {
        console.log(`[Reaction] Fallback também falhou, ignorando reação`);
      }
    }
  }
}

// Função para escolher emoji de reação baseado nas configurações
function chooseReactionEmoji(settings: BotSettings): string {
  if (settings.reaction_mode === 'fixed' && settings.fixed_emoji) {
    return settings.fixed_emoji;
  }
  
  // Modo aleatório
  const emojis = settings.custom_emojis && settings.custom_emojis.length > 0 
    ? settings.custom_emojis 
    : ['👍', '❤️', '🔥', '🎉', '👏', '⚡', '✨', '💯'];
  
  return emojis[Math.floor(Math.random() * emojis.length)];
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
      // Tratamento especial para 404 - geralmente significa "não encontrado"
      if (response.status === 404) {
        return { error: "Dados não encontrados", status: 404, notFound: true };
      }
      return { error: `Erro na API: ${response.status}`, status: response.status };
    }

    const data = await response.json();
    console.log(`Response received:`, JSON.stringify(data).substring(0, 200));
    return data;
  } catch (err) {
    const error = err as Error;
    console.error(`Fetch error:`, error);
    // Mensagem amigável para o usuário
    if (error.message.includes('Connection refused') || error.message.includes('connect error')) {
      return { error: `⚠️ Servidor da API temporariamente indisponível. Tente novamente em alguns minutos.` };
    }
    return { error: `⚠️ Erro de conexão. Tente novamente.` };
  }
}

// Versão com suporte a AbortSignal para timeout
async function fetchFromProviderWithTimeout(
  provider: ApiProvider,
  endpoint: string,
  queryParam: string,
  queryValue: string,
  additionalParams?: Record<string, string>,
  signal?: AbortSignal
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
      signal,
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      if (response.status === 404) {
        return { error: "Dados não encontrados", status: 404, notFound: true };
      }
      return { error: `Erro na API: ${response.status}`, status: response.status };
    }

    const data = await response.json();
    console.log(`Response received:`, JSON.stringify(data).substring(0, 200));
    return data;
  } catch (err) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return { error: "⏱️ Tempo limite excedido. Tente novamente.", notFound: true };
    }
    console.error(`Fetch error:`, error);
    // Mensagem amigável para o usuário
    if (error.message.includes('Connection refused') || error.message.includes('connect error')) {
      return { error: `⚠️ Servidor da API temporariamente indisponível. Tente novamente em alguns minutos.` };
    }
    return { error: `⚠️ Erro de conexão. Tente novamente.` };
  }
}

// =============== CACHE-ENABLED QUERY ===============
// Chama o endpoint api-query que já possui sistema de cache integrado
async function executeQueryWithCache(
  queryType: string, 
  queryInput: string, 
  estado?: string
): Promise<{ data: Record<string, unknown>; fromCache: boolean }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  logCmd('INFO', 'API_CALL', { queryType, input: queryInput.substring(0, 20), estado: estado || null });
  
  const controller = new AbortController();
  const timeoutMs = 65_000; // 65s — slightly above api-query's own 60s max
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/api-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ queryType, queryInput, estado, channel: "telegram" }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      logCmd('ERROR', 'API_HTTP', { queryType, status: response.status });
      if (response.status === 504) {
        return { 
          data: { error: `⏱️ A consulta <b>${queryType}</b> demorou demais para responder.\n\n💡 <i>Isso pode acontecer em horários de pico. Tente novamente em alguns segundos.</i>` }, 
          fromCache: false 
        };
      }
      return { 
        data: { error: `Erro na consulta: ${response.status}` }, 
        fromCache: false 
      };
    }
    
    const result = await response.json();
    const fromCache = result.fromCache === true;
    const data = result.data || result;
    
    logCmd('INFO', 'API_RESULT', { queryType, fromCache, durationMs: result.duration_ms || null, hasError: !!data.error, notFound: !!data.notFound });
    
    return { data, fromCache };
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    logCmd('ERROR', 'API_EXCEPTION', { queryType, error: error.message });
    if (error.name === 'AbortError') {
      return { 
        data: { error: `⏱️ A consulta <b>${queryType}</b> excedeu o tempo limite.\n\n💡 <i>Tente novamente em alguns segundos.</i>` }, 
        fromCache: false 
      };
    }
    return { 
      data: { error: `⚠️ Erro de conexão. Tente novamente.` }, 
      fromCache: false 
    };
  }
}

// Legacy executeQuery - mantido para compatibilidade, mas delega para executeQueryWithCache
async function executeQuery(queryType: string, queryInput: string, estado?: string): Promise<Record<string, unknown>> {
  const { data } = await executeQueryWithCache(queryType, queryInput, estado);
  return data;
}

// =============== PARSE DATA STRING ===============
// Converte campo 'data' string (formato texto da API) em objeto estruturado
function parseDataString(dataStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Limpar referências ao bot antigo e URLs
  let cleaned = dataStr
    .replace(/@QueryBuscasBot/gi, '')
    .replace(/https?:\/\/t\.me\/querybuscas/gi, '')
    .replace(/QueryBuscasBot/gi, '')
    .replace(/querybuscas/gi, '')
    .replace(/https?:\/\/t\.me\/[^\s]+/gi, '')
    .trim();
  
  const lines = cleaned.split('\n');
  let currentListKey: string | null = null;
  let currentList: string[] = [];
  
  const saveCurrentList = () => {
    if (currentListKey && currentList.length > 0) {
      result[currentListKey] = currentList.join('\n');
      currentList = [];
    }
    currentListKey = null;
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Ignorar linhas de seção ou cabeçalho
    if (trimmed.match(/^(BASE \d+|RESULTADOS|---)/i)) {
      saveCurrentList();
      continue;
    }
    if (trimmed.match(/^[=\-_*]+$/)) continue;
    
    // Detectar linha de lista com marcador •
    if (trimmed.startsWith('•')) {
      const itemValue = trimmed.substring(1).trim();
      if (itemValue) {
        currentList.push(itemValue);
      }
      continue;
    }
    
    // Detectar linha de lista com marcador - (mas não linhas de separação)
    if (trimmed.startsWith('-') && !trimmed.match(/^-+$/)) {
      const itemValue = trimmed.substring(1).trim();
      
      // Verificar se é formato "Chave: Valor" (seção Interesses Pessoais)
      const keyValueMatch = itemValue.match(/^([^:]+):\s*(.+)$/);
      if (keyValueMatch) {
        const key = keyValueMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        const value = keyValueMatch[2].trim();
        if (value && value !== '-') {
          result[key] = value;
        }
      } else if (itemValue && !itemValue.match(/^[\-=_]+$/)) {
        currentList.push(itemValue);
      }
      continue;
    }
    
    // Tratar formato especial de parentes: TIPO ⎯ NOME ⎯ ou TIPO ⎯ NOME
    const parentMatch = trimmed.match(/^(MAE|PAI|CONJUGE|FILHO|FILHA|IRMAO|IRMA|IRMÃ|AVÔ|AVÓ|TIO|TIA|SOBRINHO|SOBRINHA|NETO|NETA)\s*[⎯—-]\s*([^⎯—-]+)/i);
    if (parentMatch) {
      const parentType = parentMatch[1].toUpperCase();
      const parentName = parentMatch[2].trim();
      if (parentName) {
        if (result.parentes === undefined) {
          result.parentes = [];
        }
        (result.parentes as string[]).push(`${parentType}: ${parentName}`);
      }
      continue;
    }
    
    // Extrair CHAVE: VALOR (aceita chaves com ou sem espaço antes do separador)
    const match = trimmed.match(/^([A-ZÀ-Úa-zà-ú\s_]+?)\s*(?::|⎯|—|-)\s*(.*)$/i);
    if (match) {
      saveCurrentList(); // Salvar lista anterior se houver
      
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      
      // Se o valor indica uma lista (ex: "( 5 - Encontrados)"), preparar para coletar itens
      if (value.match(/\(\s*\d+\s*-\s*Encontrados?\s*\)/i)) {
        currentListKey = key;
        currentList = [];
        continue;
      }
      
      // Ignorar valores vazios ou placeholders
      if (!value || value === '-' || value === '--') continue;
      
      // Se a chave já existe, converter para array ou adicionar
      if (result[key] !== undefined) {
        if (Array.isArray(result[key])) {
          (result[key] as string[]).push(value);
        } else {
          result[key] = [result[key] as string, value];
        }
      } else {
        result[key] = value;
      }
    }
  }
  
  // Salvar última lista pendente
  saveCurrentList();
  
  return result;
}

// =============== PARSE MULTIPLE PERSON RECORDS (CEP) ===============
interface PersonRecord {
  cpf?: string;
  nome?: string;
  nascimento?: string;
  email?: string;
  renda?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  sexo?: string;
  mae?: string;
  pai?: string;
  telefone?: string;
  [key: string]: string | undefined;
}

function parseMultiplePersonRecords(dataStr: string): PersonRecord[] {
  const records: PersonRecord[] = [];
  
  // Limpar a string
  const cleaned = dataStr
    .replace(/@\w+/g, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .trim();
  
  // Check if this contains "BASE X" sections (phone query format)
  const hasBaseSections = /BASE\s+\d+/i.test(cleaned);
  
  if (hasBaseSections) {
    // Split by BASE sections
    const baseSections = cleaned.split(/(?=BASE\s+\d+)/gi).filter(s => s.trim());
    
    for (const section of baseSections) {
      // Skip the header section (before first BASE)
      if (!section.match(/BASE\s+\d+/i)) continue;
      
      const person: PersonRecord = {};
      const lines = section.split(/\n/).map(l => l.trim()).filter(Boolean);
      
      for (const line of lines) {
        // Skip the "BASE X" header line itself
        if (line.match(/^BASE\s+\d+$/i)) continue;
        
        // Match patterns like "CPF: 12345" or "NOME: NAME" (colon format)
        const colonMatch = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\w\s_]+)[:\s]+[`]?(.+)$/i);
        if (colonMatch) {
          const key = colonMatch[1].trim().toUpperCase();
          let value = colonMatch[2].trim().replace(/^`/, ''); // Remove leading backtick
          
          // Skip empty or invalid values
          if (!value || value === '-' || value.toLowerCase().startsWith('não informad')) continue;
          
          // Skip header lines
          if (key.includes('RESULTADO') || key.includes('ENCONTRADO') || key.includes('BASE')) continue;
          
          // Map the key to our record structure
          const keyMap: Record<string, keyof PersonRecord> = {
            'CPF': 'cpf', 'CPF_CNPJ': 'cpf',
            'NOME': 'nome',
            'NASCIMENTO': 'nascimento', 'DATA_NASCIMENTO': 'nascimento',
            'EMAIL': 'email',
            'RENDA': 'renda',
            'BAIRRO': 'bairro',
            'CIDADE': 'cidade',
            'UF': 'uf',
            'CEP': 'cep',
            'SEXO': 'sexo',
            'MÃE': 'mae', 'MAE': 'mae', 'NOME_MAE': 'mae',
            'PAI': 'pai', 'NOME_PAI': 'pai',
            'LOGRADOURO': 'logradouro',
            'ENDEREÇO': 'endereco', 'ENDERECO': 'endereco',
            'COMPLEMENTO': 'complemento',
            'ESTADO': 'estado',
            'TELEFONE': 'telefone',
            'RG': 'rg',
          };
          
          const mappedKey = keyMap[key] || key.toLowerCase().replace(/\s+/g, '_');
          person[mappedKey] = value;
        }
      }
      
      // Only add if person has CPF or NOME
      if (person.cpf || person.nome) {
        records.push(person);
      }
    }
    
    if (records.length > 0) {
      return records;
    }
  }
  
  // Fallback: Parse by CPF entries with dash format (CEP query style)
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentRecord: PersonRecord = {};
  let hasData = false;
  
  for (const line of lines) {
    // Check for key — value format (with em-dash ⎯ or regular dash —)
    const dashMatch = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+)\s*[⎯—-]\s*(.*)$/i);
    // Also check for colon format
    const colonMatch = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\w\s_]+)[:\s]+[`]?(.+)$/i);
    
    const match = dashMatch || colonMatch;
    
    if (match) {
      const key = match[1].trim().toUpperCase();
      let value = match[2].trim().replace(/^`/, '');
      
      // Skip empty values
      if (!value || value === '-' || value.toLowerCase().startsWith('não informad')) {
        continue;
      }
      
      // Skip header lines
      if (key.includes('RESULTADO') || key.includes('ENCONTRADO') || key.includes('BASE')) continue;
      
      // If we find a new CPF and already have data, save current record and start new
      if (key === 'CPF' && hasData && currentRecord.cpf) {
        records.push({ ...currentRecord });
        currentRecord = {};
        hasData = false;
      }
      
      // Map the key to our record structure
      const keyMap: Record<string, keyof PersonRecord> = {
        'CPF': 'cpf', 'CPF_CNPJ': 'cpf',
        'NOME': 'nome',
        'NASCIMENTO': 'nascimento', 'DATA_NASCIMENTO': 'nascimento',
        'EMAIL': 'email',
        'RENDA': 'renda',
        'BAIRRO': 'bairro',
        'CIDADE': 'cidade',
        'UF': 'uf',
        'CEP': 'cep',
        'SEXO': 'sexo',
        'MÃE': 'mae', 'MAE': 'mae', 'NOME_MAE': 'mae',
        'PAI': 'pai', 'NOME_PAI': 'pai',
        'LOGRADOURO': 'logradouro',
        'ENDEREÇO': 'endereco', 'ENDERECO': 'endereco',
        'COMPLEMENTO': 'complemento',
        'ESTADO': 'estado',
        'TELEFONE': 'telefone',
        'RG': 'rg',
      };
      
      const mappedKey = keyMap[key] || key.toLowerCase().replace(/\s+/g, '_');
      currentRecord[mappedKey] = value;
      hasData = true;
    }
  }
  
  // Don't forget the last record
  if (hasData && Object.keys(currentRecord).length > 0) {
    records.push(currentRecord);
  }
  
  return records;
}

// Check if data looks like multiple person records (CEP or Telefone query result)
function isMultiPersonResult(dataStr: string): boolean {
  // Format 1: CPF with dash (CEP style) - CPF ⎯ or CPF — or CPF -
  const dashMatches = dataStr.match(/CPF\s*[⎯—-]/gi) || [];
  // Format 2: CPF with colon (Phone style) - CPF: 12345 or CPF: `12345
  const colonMatches = dataStr.match(/CPF[:\s`]+[\d.-]+/gi) || [];
  // Format 3: BASE X sections (indicates multiple records from phone API)
  const baseMatches = dataStr.match(/BASE\s+\d+/gi) || [];
  
  const cpfCount = Math.max(dashMatches.length, colonMatches.length);
  const hasMultipleBases = baseMatches.length > 1;
  
  return cpfCount > 1 || hasMultipleBases;
}

// Constantes para paginação de múltiplos registros
const RECORDS_PER_PAGE = 10;

// Format a single page of multiple person records for Telegram (MONOESPAÇADO)
function formatMultiPersonPage(
  records: PersonRecord[], 
  page: number, 
  totalPages: number,
  botUsername?: string, 
  telegramUserName?: string,
  queryType?: string,
  queryInput?: string
): string {
  const userName = telegramUserName || 'usuário';
  const botTag = botUsername ? `@${botUsername.replace('@', '')}` : '@SEGREDOPUXADASBOT';
  
  const startIdx = page * RECORDS_PER_PAGE;
  const endIdx = Math.min(startIdx + RECORDS_PER_PAGE, records.length);
  const pageRecords = records.slice(startIdx, endIdx);
  
  const lines: string[] = [];
  
  // Dynamic title based on query type
  const titleIcon = queryType === 'telefone' ? '📞' : '📍';
  const titleText = queryType === 'telefone' ? 'CONSULTA DE TELEFONE' : 'CONSULTA DE CEP';
  
  lines.push(`${titleIcon} ${titleText}`);
  if (queryInput) {
    lines.push(`🔍 ${queryInput}`);
  }
  lines.push(``);
  lines.push(`👋 Olá, ${userName}!`);
  lines.push(`👥 ${records.length} pessoas encontradas`);
  if (totalPages > 1) {
    lines.push(`📄 Página ${page + 1}/${totalPages} (${startIdx + 1}-${endIdx})`);
  }
  lines.push(``);
  
  pageRecords.forEach((record, index) => {
    const globalIndex = startIdx + index;
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 👤 PESSOA ${globalIndex + 1}`);
    lines.push(`├─────────────────────────────`);
    
    // Dados principais
    if (record.nome) {
      lines.push(`│ 📛 Nome: ${record.nome.toUpperCase()}`);
    }
    if (record.cpf) {
      lines.push(`│ 🆔 CPF: ${record.cpf}`);
    }
    if (record.nascimento) {
      lines.push(`│ 📅 Nasc: ${record.nascimento}`);
    }
    if (record.renda) {
      lines.push(`│ 💰 Renda: R$ ${record.renda}`);
    }
    
    // Contato
    if (record.email && record.email.toLowerCase() !== 'não informado') {
      lines.push(`│ 📧 Email: ${record.email.toUpperCase()}`);
    }
    if (record.telefone) {
      lines.push(`│ 📞 Tel: ${record.telefone}`);
    }
    
    // Endereço (compacto)
    const addressParts = [];
    if (record.bairro) addressParts.push(record.bairro);
    if (record.cidade) addressParts.push(record.cidade);
    if (record.uf) addressParts.push(record.uf);
    
    if (addressParts.length > 0) {
      lines.push(`│ 📍 Local: ${addressParts.join(' - ').toUpperCase()}`);
    }
    if (record.cep) {
      lines.push(`│ 📮 CEP: ${record.cep}`);
    }
    
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  });
  
  // Footer
  lines.push(`💡 Clique no CPF para consultar`);
  lines.push(`🤖 ${botTag}`);
  
  const escapeLine = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<pre>${lines.map(escapeLine).join('\n')}</pre>`;
}

// Create keyboard for multi-person result with CPF buttons and pagination
function createMultiPersonKeyboard(
  records: PersonRecord[], 
  page: number, 
  totalPages: number,
  paginationId?: string,
  queryType?: string,
  queryInput?: string
): { inline_keyboard: InlineButton[][] } {
  const keyboard: InlineButton[][] = [];
  
  const startIdx = page * RECORDS_PER_PAGE;
  const endIdx = Math.min(startIdx + RECORDS_PER_PAGE, records.length);
  const pageRecords = records.slice(startIdx, endIdx);
  
  // Botões de consulta CPF em linhas de 2
  for (let i = 0; i < pageRecords.length; i += 2) {
    const row: InlineButton[] = [];
    
    // Primeiro botão
    const record1 = pageRecords[i];
    if (record1.cpf) {
      const cleanCpf = record1.cpf.replace(/[^\d]/g, '');
      const shortName = record1.nome ? record1.nome.split(' ')[0].substring(0, 10) : `Pessoa ${startIdx + i + 1}`;
      row.push({ text: `🔍 ${shortName}`, callback_data: `qcpf:${cleanCpf}` });
    }
    
    // Segundo botão (se existir)
    if (i + 1 < pageRecords.length) {
      const record2 = pageRecords[i + 1];
      if (record2.cpf) {
        const cleanCpf = record2.cpf.replace(/[^\d]/g, '');
        const shortName = record2.nome ? record2.nome.split(' ')[0].substring(0, 10) : `Pessoa ${startIdx + i + 2}`;
        row.push({ text: `🔍 ${shortName}`, callback_data: `qcpf:${cleanCpf}` });
      }
    }
    
    if (row.length > 0) {
      keyboard.push(row);
    }
  }
  
  // Botões de navegação se houver mais de uma página
  if (totalPages > 1) {
    const navRow: InlineButton[] = [];
    
    // Use appropriate page callback based on query type
    const pagePrefix = queryType === 'telefone' ? 'tel_page' : 'cep_page';
    
    if (page > 0) {
      navRow.push({ text: "◀️ Anterior", callback_data: `${pagePrefix}:${paginationId}:${page - 1}` });
    }
    
    navRow.push({ text: `${page + 1}/${totalPages}`, callback_data: "noop" });
    
    if (page < totalPages - 1) {
      navRow.push({ text: "Próximo ▶️", callback_data: `${pagePrefix}:${paginationId}:${page + 1}` });
    }
    
    keyboard.push(navRow);
  }
  
  // Botão de apagar primeiro
  keyboard.push([{ text: "🗑️ Apagar", callback_data: paginationId ? `page_delete:${paginationId}` : "delete_msg" }]);
  
  // Determine PDF/TXT callback based on query type
  const pdfQueryType = queryType || 'cep';
  const pdfInput = queryInput || records[0]?.cep || '';
  
  // Botões de PDF e TXT abaixo do apagar
  keyboard.push([{ text: "📄 Baixar PDF", callback_data: `pdf:${pdfQueryType}:${pdfInput}` }]);
  keyboard.push([{ text: "📝 Ver TXT", callback_data: `txt:${pdfQueryType}:${pdfInput}` }]);
  
  return { inline_keyboard: keyboard };
}

// Format multiple person records for Telegram (legacy compatibility - single page)
function formatMultiPersonResult(records: PersonRecord[], botUsername?: string, telegramUserName?: string): string {
  return formatMultiPersonPage(records, 0, 1, botUsername, telegramUserName);
}

function formatQueryResult(queryType: string, data: Record<string, unknown>, botUsername?: string, telegramUserName?: string): string {
  if (data.module_disabled) {
    return `⚠️ <b>Módulo desativado:</b> A consulta <code>${queryType}</code> está temporariamente indisponível.\n\n💡 Os demais módulos continuam funcionando normalmente.`;
  }
  
  if (data.error) {
    return `❌ <b>Erro:</b> ${data.error}`;
  }

  // VERIFICAR SE É RESULTADO DE CEP OU TELEFONE COM MÚLTIPLOS REGISTROS
  // Nota: A formatação agora é tratada diretamente no handleQuery com paginação
  const rawDataStr = typeof data.data === 'string' ? data.data : '';
  if ((queryType === 'cep' || queryType === 'telefone') && rawDataStr && isMultiPersonResult(rawDataStr)) {
    console.log(`Detected multi-person ${queryType} result, using special formatting...`);
    const records = parseMultiplePersonRecords(rawDataStr);
    if (records.length > 1) {
      // Para resultados < 10 registros, usar formatação simples
      return formatMultiPersonPage(records, 0, 1, botUsername, telegramUserName, queryType);
    }
  }

  // PRÉ-PROCESSAMENTO: Se o campo 'data' é uma string, fazer parse
  if (typeof data.data === 'string') {
    console.log('Parsing data string field...');
    const parsedData = parseDataString(data.data);
    console.log('Parsed data:', JSON.stringify(parsedData).substring(0, 200));
    // Mesclar dados parseados com dados originais (exceto data, comando, valor)
    const { data: _dataField, comando: _cmd, valor: _val, ...rest } = data;
    data = { ...rest, ...parsedData };
  }

  // Campos a ignorar (referências a outros bots, links, etc.)
  const ignoredPatterns = [
    /@QueryBuscasBot/i,
    /QueryBuscasBot/i,
    /t\.me\/querybuscas/i,
    /querybuscas/i,
  ];

  const shouldIgnore = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    return ignoredPatterns.some(pattern => pattern.test(value));
  };

  // Função para escapar caracteres HTML
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  // Nome do usuário do Telegram para saudação (NÃO o nome da pessoa consultada)
  const userName = telegramUserName || 'usuário';
  const botTag = botUsername ? `@${botUsername.replace('@', '')}` : '@SEGREDOPUXADASBOT';

  // ============= FORMATAÇÃO ESPECÍFICA PARA CPF =============
  if (queryType === 'cpf') {
    return formatCpfResult(data, userName, botTag, escapeHtml, shouldIgnore);
  }

  // ============= FORMATAÇÃO GENÉRICA PARA OUTROS TIPOS =============
  return formatGenericResult(queryType, data, userName, botTag, escapeHtml, shouldIgnore);
}

// =============== FORMATAÇÃO ESPECÍFICA PARA CPF (MONOESPAÇADO) ===============
function formatCpfResult(
  data: Record<string, unknown>, 
  userName: string, 
  botTag: string, 
  escapeHtml: (str: string) => string,
  shouldIgnore: (value: unknown) => boolean
): string {
  // PRÉ-PROCESSAMENTO: achatar estrutura aninhada dados.cpf[0] ou dados.telefone[0]
  // A API retorna: { dados: { cpf: [{ dadosBasicos: {...}, ... }] } }
  // ou para telefonefull: { dados: { telefone: [{ dadosBasicos: {...}, dadosTelefone: {...} }] } }
  const dados = data.dados as Record<string, unknown> | undefined;
  if (dados && typeof dados === 'object') {
    // Tentar achatar qualquer chave que contenha array de objetos com dadosBasicos
    for (const rootKey of ['cpf', 'telefone', 'cnpj', 'nome']) {
      const arr = (dados as Record<string, unknown>)[rootKey] as unknown[];
      if (!Array.isArray(arr) || arr.length === 0) continue;
      
      const firstRecord = arr[0] as Record<string, unknown>;
      if (!firstRecord || typeof firstRecord !== 'object') continue;
      
      // Flatten dadosBasicos to top level
      const basicos = firstRecord.dadosBasicos as Record<string, unknown> | undefined;
      if (basicos && typeof basicos === 'object') {
        for (const [k, v] of Object.entries(basicos)) {
          if (v !== null && v !== undefined && v !== '') {
            data[k] = v;
          }
        }
      }
      
      // Flatten dadosTelefone (telefonefull) — extrair como array de telefones
      const dadosTel = firstRecord.dadosTelefone as Record<string, unknown> | undefined;
      if (dadosTel && typeof dadosTel === 'object') {
        // Converter o objeto único em array para extractTelefones processar
        data.telefones = [dadosTel];
      }
      
      // Se houver múltiplos registros com dadosTelefone, montar array completo
      if (arr.length > 1) {
        const allTels = arr
          .map((r: unknown) => (r as Record<string, unknown>).dadosTelefone)
          .filter(Boolean);
        if (allTels.length > 0) {
          data.telefones = allTels;
        }
      }
      
      // Flatten arrays (emails, enderecos, telefones, parentes, score, pis, tse)
      for (const arrKey of ['emails', 'enderecos', 'telefones', 'parentes', 'score', 'pis', 'tse']) {
        if (Array.isArray(firstRecord[arrKey]) && (firstRecord[arrKey] as unknown[]).length > 0) {
          data[arrKey] = firstRecord[arrKey];
        }
      }
      
      break; // Processar apenas a primeira chave encontrada
    }
  }

  // Extrair dados de forma segura
  const getValue = (keys: string[]): string | null => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      for (const [k, v] of Object.entries(data)) {
        if (k.toLowerCase() === lowerKey || k.toLowerCase().includes(lowerKey)) {
          if (v && typeof v === 'string' && v.trim() && v !== '-' && !shouldIgnore(v)) {
            return v.trim().toUpperCase();
          }
        }
      }
    }
    return null;
  };

  const getArray = (keys: string[]): string[] => {
    const results: string[] = [];
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      for (const [k, v] of Object.entries(data)) {
        if (k.toLowerCase() === lowerKey || k.toLowerCase().includes(lowerKey)) {
          if (Array.isArray(v)) {
            results.push(...v.map(item => {
              if (typeof item === 'object' && item !== null) {
                return Object.entries(item)
                  .filter(([, val]) => val !== null && val !== undefined && val !== '')
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(', ');
              }
              return String(item).trim().toUpperCase();
            }).filter(item => item && item !== '-'));
          } else if (v && typeof v === 'string' && v.trim() && v !== '-' && !shouldIgnore(v)) {
            const items = v.split(/[,\n]/).map(item => item.trim().toUpperCase()).filter(item => item && item !== '-');
            results.push(...items);
          }
        }
      }
    }
    return [...new Set(results)];
  };

  // Helper: extract telefones from structured objects
  const extractTelefones = (): string[] => {
    const tels = data.telefones as unknown[] | undefined;
    if (!Array.isArray(tels)) return getArray(['telefone', 'telefones', 'celular']);
    return tels.map((t: unknown) => {
      const tel = t as Record<string, unknown>;
      const ddd = tel.ddd || tel.DDD || '';
      const num = tel.telefone || tel.numero || tel.celular || '';
      const tipo = tel.tipoTelefone === 3 ? 'Celular' : tel.tipoTelefone === 1 ? 'Fixo' : '';
      const inclusao = tel.dataInclusao ? ` (${String(tel.dataInclusao).substring(0, 10)})` : '';
      return `(${ddd}) ${num}${tipo ? ' - ' + tipo : ''}${inclusao}`.trim().toUpperCase();
    }).filter(Boolean);
  };

  // Helper: extract enderecos from structured objects
  const extractEnderecos = (): string[] => {
    const ends = data.enderecos as unknown[] | undefined;
    if (!Array.isArray(ends)) return getArray(['endereco', 'enderecos', 'logradouro']);
    return ends.map((e: unknown) => {
      const end = e as Record<string, unknown>;
      const tipo = end.tipoLogradouro || '';
      const logradouro = end.nomeLogradouro || end.logradouro || '';
      const numero = end.numeroLogradouro || end.numero || '';
      const compl = end.complementoLogradouro || '';
      const bairro = end.bairro || '';
      const cidade = end.cidade || '';
      const uf = end.uf || '';
      const cep = end.cep || '';
      const inclusao = end.dataInclusao ? String(end.dataInclusao).substring(0, 10) : '';
      const parts = [`${tipo} ${logradouro}`.trim(), numero, compl, bairro, cidade, uf].filter(p => p && String(p).trim());
      return `${parts.join(', ')}${cep ? ' CEP: ' + cep : ''}${inclusao ? ' (' + inclusao + ')' : ''}`.trim().toUpperCase();
    }).filter(Boolean);
  };

  // Helper: extract parentes from structured objects
  const extractParentes = (): string[] => {
    const pars = data.parentes as unknown[] | undefined;
    if (!Array.isArray(pars)) return getArray(['parentes', 'conjuge', 'filhos', 'irmaos']);
    return pars.filter((p: unknown) => {
      const par = p as Record<string, unknown>;
      // Filter out non-person entries (e.g. score entries with numeric nome)
      return par.nomeVinculo && typeof par.nomeVinculo === 'string' && par.nomeVinculo.length > 2 && isNaN(Number(par.nomeVinculo));
    }).map((p: unknown) => {
      const par = p as Record<string, unknown>;
      const vinculo = par.vinculo || '';
      const nomeVinculo = par.nomeVinculo || '';
      return `${vinculo}: ${nomeVinculo}`.trim().toUpperCase();
    });
  };

  // Helper: extract emails from structured objects
  const extractEmails = (): string[] => {
    const ems = data.emails as unknown[] | undefined;
    if (!Array.isArray(ems)) return getArray(['email', 'emails']);
    return ems.map((e: unknown) => {
      const em = e as Record<string, unknown>;
      return String(em.email || '').trim();
    }).filter(e => e && e.includes('@'));
  };

  // Helper: extract score
  const extractScore = (): { csb8?: string; csba?: string; csb8Faixa?: string; csbaFaixa?: string } => {
    const scores = data.score as unknown[] | undefined;
    if (!Array.isArray(scores) || scores.length === 0) return {};
    const s = scores[0] as Record<string, unknown>;
    return {
      csb8: s.csb8 ? String(s.csb8) : undefined,
      csba: s.csba ? String(s.csba) : undefined,
      csb8Faixa: s.csb8Faixa ? String(s.csb8Faixa) : undefined,
      csbaFaixa: s.csbaFaixa ? String(s.csbaFaixa) : undefined,
    };
  };

  // Dados básicos
  const nome = getValue(['nome', 'nome_completo']);
  const cpf = getValue(['cpf']);
  const nascimento = getValue(['nascimento', 'data_nascimento', 'datanascimento', 'dataNascimento']);
  const sexo = getValue(['sexo']);
  const raca = getValue(['raca', 'raça', 'cor']);
  const obito = getValue(['obito', 'óbito', 'falecido', 'dataObito']);
  const statusReceita = getValue(['status_receita', 'statusreceita', 'situacao_cpf', 'codigoSituacaoCadastral']);
  
  // Documentos
  const rg = getValue(['rg']);
  const cns = getValue(['cns']);
  const tituloEleitor = getValue(['titulo_eleitor', 'tituloeleitor', 'titulo', 'tituloEleitor']);
  const zona = getValue(['zona']);
  const secao = getValue(['secao', 'seção']);
  
  // Contato
  const emails = extractEmails();
  const telefones = extractTelefones();
  
  // Endereços
  const enderecos = extractEnderecos();
  
  // Financeiro
  const renda = getValue(['renda', 'rendaestimada', 'renda_estimada']);
  const classeSocial = getValue(['classe_social', 'classesocial', 'classe', 'poder_aquisitivo']);
  const scoreData = extractScore();
  const csb8 = scoreData.csb8 || getValue(['csb8']);
  const csba = scoreData.csba || getValue(['csba']);
  const csb8Faixa = scoreData.csb8Faixa || getValue(['csb8_faixa', 'csb8faixa']);
  const csbaFaixa = scoreData.csbaFaixa || getValue(['csba_faixa', 'csbafaixa']);
  
  // Família
  const mae = getValue(['mae', 'mãe', 'nome_mae', 'nomemae', 'nomeMae']);
  const pai = getValue(['pai', 'nome_pai', 'nomepai', 'nomePai']);
  const parentes = extractParentes();

  // ============= CONSTRUIR MENSAGEM MONOESPAÇADA =============
  let lines: string[] = [];
  
  // Header
  lines.push(`👤 CONSULTA CPF`);
  lines.push(`/CPF ${cpf || ''}`);
  lines.push(``);

  // 👤 DADOS PESSOAIS
  let hasBasicData = nome || cpf || nascimento || sexo || raca || obito || statusReceita;
  if (hasBasicData) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 👤 DADOS PESSOAIS`);
    lines.push(`├─────────────────────────────`);
    if (nome) lines.push(`│ 👑 Nome: ${nome}`);
    if (cpf) lines.push(`│ 🆔 CPF: ${cpf}`);
    if (nascimento) lines.push(`│ 📅 Nascimento: ${nascimento}`);
    if (sexo) lines.push(`│ 👤 Sexo: ${sexo}`);
    if (raca) lines.push(`│ 🎨 Raça: ${raca}`);
    if (obito) lines.push(`│ ⚰️ Óbito: ${obito}`);
    if (statusReceita) lines.push(`│ 📊 Status Receita: ${statusReceita}`);
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // 📄 DOCUMENTOS
  let hasDocuments = rg || cns || tituloEleitor;
  if (hasDocuments) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 📄 DOCUMENTOS`);
    lines.push(`├─────────────────────────────`);
    if (rg) lines.push(`│ 🪪 RG: ${rg}`);
    if (cns) lines.push(`│ 🏥 CNS: ${cns}`);
    if (tituloEleitor) {
      let tituloLine = `│ 🗳️ Título: ${tituloEleitor}`;
      if (zona) tituloLine += ` ZONA: ${zona}`;
      if (secao) tituloLine += ` SEÇÃO: ${secao}`;
      lines.push(tituloLine);
    }
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // 📱 CONTATO
  if (telefones.length > 0) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 📱 CONTATO`);
    lines.push(`├─────────────────────────────`);
    lines.push(`│ 📞 Telefones:`);
    telefones.slice(0, 8).forEach(tel => {
      const hasWpp = tel.toLowerCase().includes('whatsapp') || tel.toLowerCase().includes('possui');
      const cleanTel = tel.replace(/\s*-?\s*(possui|não possui)?\s*whatsapp\s*/gi, '').trim();
      const wppIcon = hasWpp && tel.toLowerCase().includes('possui whatsapp') ? ' 💬' : '';
      lines.push(`│   • ${cleanTel}${wppIcon}`);
    });
    if (telefones.length > 8) lines.push(`│   ... e mais ${telefones.length - 8}`);
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // 📍 ENDEREÇOS
  if (enderecos.length > 0) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 📍 ENDEREÇOS`);
    lines.push(`├─────────────────────────────`);
    enderecos.slice(0, 10).forEach(endereco => {
      const cleanEndereco = endereco
        .replace(/^\[empty\]\s*/gi, '')
        .replace(/^enderecos?\s*:?\s*/gi, '')
        .trim();
      if (cleanEndereco && cleanEndereco.length > 5) {
        lines.push(`│ 🏠 ${cleanEndereco}`);
      }
    });
    if (enderecos.length > 10) lines.push(`│ ... e mais ${enderecos.length - 10}`);
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // 💰 FINANCEIRO
  let hasFinancial = renda || classeSocial || csb8 || csba || csb8Faixa || csbaFaixa;
  if (hasFinancial) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 💰 FINANCEIRO`);
    lines.push(`├─────────────────────────────`);
    if (renda) lines.push(`│ 💵 Renda: R$ ${renda}`);
    if (classeSocial) lines.push(`│ 📊 Poder Aquisitivo: ${classeSocial}`);
    if (csb8) lines.push(`│ 📈 CSB8: ${csb8}`);
    if (csb8Faixa) lines.push(`│ ⚠️ CSB8 Faixa de Risco: ${csb8Faixa}`);
    if (csba) lines.push(`│ 📈 CSBA: ${csba}`);
    if (csbaFaixa) lines.push(`│ ⚠️ CSBA Faixa de Risco: ${csbaFaixa}`);
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // 👨‍👩‍👧‍👦 FAMÍLIA
  if (mae || pai || parentes.length > 0) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 👨‍👩‍👧‍👦 FAMILIARES`);
    lines.push(`├─────────────────────────────`);
    if (mae) lines.push(`│ 👩 Mãe: ${mae}`);
    if (pai) lines.push(`│ 👨 Pai: ${pai}`);
    parentes.slice(0, 10).forEach(parente => {
      const parenteUpper = parente.toUpperCase();
      let icon = '👤';
      if (parenteUpper.includes('IRMA') || parenteUpper.includes('IRMÃ')) icon = '👧';
      if (parenteUpper.includes('IRMAO') || parenteUpper.includes('IRMÃO')) icon = '👦';
      if (parenteUpper.includes('FILHO')) icon = '👦';
      if (parenteUpper.includes('FILHA')) icon = '👧';
      if (parenteUpper.includes('CONJUGE') || parenteUpper.includes('CÔNJUGE')) icon = '💑';
      lines.push(`│ ${icon} ${parente}`);
    });
    if (parentes.length > 10) lines.push(`│ ... e mais ${parentes.length - 10}`);
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // Retornar como bloco <pre> monoespaçado (escapar HTML nos valores)
  const escaped = lines.map(l => escapeHtml(l));
  return `<pre>${escaped.join('\n')}</pre>`;
}

// =============== FORMATAÇÃO GENÉRICA PARA OUTROS TIPOS (MONOESPAÇADO) ===============
function formatGenericResult(
  queryType: string,
  data: Record<string, unknown>, 
  userName: string, 
  botTag: string, 
  escapeHtml: (str: string) => string,
  shouldIgnore: (value: unknown) => boolean
): string {
  // Categorização de campos com emojis únicos
  const categories: Record<string, { icon: string; label: string; fields: string[] }> = {
    basic: {
      icon: '👤',
      label: 'DADOS PESSOAIS',
      fields: ['nome', 'cpf', 'data_nascimento', 'dataNascimento', 'nascimento', 'rg', 'sexo', 'nome_mae', 'nome_pai', 
               'naturalidade', 'nacionalidade', 'idade', 'signo', 'obito', 'status', 'municipio_nascimento', 
               'raca', 'tipo_sanguineo', 'estado_civil', 'status_receita']
    },
    documents: {
      icon: '📄',
      label: 'DOCUMENTOS',
      fields: ['pis', 'nis', 'cns', 'titulo_eleitor', 'zona', 'secao', 'ctps', 'titulo']
    },
    contact: {
      icon: '📱',
      label: 'CONTATO',
      fields: ['telefone', 'telefones', 'celular', 'email', 'emails', 'data_inclusao', 'dataInclusao', 'whatsapp']
    },
    address: {
      icon: '📍',
      label: 'ENDEREÇO',
      fields: ['endereco', 'enderecos', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'estado', 'cep', 'municipio', 'pais', 'tipo_logradouro']
    },
    financial: {
      icon: '💰',
      label: 'FINANCEIRO',
      fields: ['renda', 'rendaEstimada', 'score', 'classe', 'classe_social', 'poder_aquisitivo', 'credito', 'situacao', 'situacao_cpf', 'situacao_cadastral', 'recebe_inss', 'bancos']
    },
    family: {
      icon: '👨‍👩‍👧‍👦',
      label: 'FAMÍLIA',
      fields: ['parentes', 'mae', 'pai', 'conjuge', 'filhos', 'irmaos']
    },
    vehicle: {
      icon: '🚗',
      label: 'VEÍCULO',
      fields: ['placa', 'veiculos', 'chassi', 'renavam', 'motor', 'marca', 'modelo', 'ano', 'anoModelo', 'anoFabricacao', 'cor', 'combustivel', 'potencia', 'cilindradas', 'tipo_veiculo', 'especie', 'categoria', 'proprietario']
    },
    work: {
      icon: '💼',
      label: 'PROFISSIONAL',
      fields: ['emprego', 'empregos', 'empresa', 'cargo', 'profissao', 'ocupacao', 'escolaridade', 'cnpj_empresa', 'cnpj_contratante', 'razao_social', 'admissao', 'demissao', 'salario']
    },
    interests: {
      icon: '🎯',
      label: 'INTERESSES',
      fields: ['interesses', 'turismo', 'luxo', 'internet', 'celular', 'cartao', 'seguro', 'investidor', 'apostador', 'viagens']
    },
    company: {
      icon: '🏢',
      label: 'EMPRESA',
      fields: ['cnpj', 'razao_social', 'nome_fantasia', 'capital_social', 'atividade', 'porte', 'natureza_juridica', 'data_abertura', 'socios', 'matriz', 'filial']
    }
  };

  // Organizar dados por categoria
  const categorizedData: Record<string, Array<{ key: string; value: unknown }>> = {};
  const uncategorized: Array<{ key: string; value: unknown }> = [];

  const flattenObject = (obj: unknown, prefix = ''): Array<{ key: string; value: unknown }> => {
    const items: Array<{ key: string; value: unknown }> = [];
    if (obj === null || obj === undefined) return items;
    if (typeof obj !== 'object') return items;

    // Campos de metadados a ignorar completamente
    const ignoredKeys = ['comando', 'valor', 'notfound', 'error', 'resultados', 'estados_encontrados', 'total_fotos', 'estado_encontrado', 'fotobase64', 'foto', 'image', 'photo', 'base64',
      'sucesso', 'protocolo', 'usuario', 'consumo_hoje', 'consumo', 'total_diario', 'reset_em', 'tipo', 'inicio_uso', 'vencimento', 'tempo_restante', 'tempo_restante_detalhado', 'dias_totais_restantes', 'dias_totais', 'ddd', 'classificacao', 'modulo',
      'conta', 'saldo', 'tempo_segundos', 'temposegundos', 'cache', 'cached_at', 'expiracao', 'duration_ms', 'limites', 'plano'];
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const keyLower = key.toLowerCase();
      
      if (ignoredKeys.includes(keyLower) || keyLower.endsWith('_consultada')) continue;
      if (typeof value === 'string' && value.length > 100 && !value.includes(' ') && (value.startsWith('/9j/') || value.startsWith('iVBOR') || value.startsWith('data:image'))) continue;
      if (typeof value === 'string' && (value.startsWith('http') && (keyLower.includes('foto') || keyLower.includes('image')))) continue;
      if (shouldIgnore(value)) continue;
      if (value === null || value === undefined || value === '') continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        items.push(...flattenObject(value, fullKey));
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          value.forEach((item, i) => {
            items.push(...flattenObject(item, `${fullKey}[${i}]`));
          });
        } else {
          items.push({ key: fullKey, value: value.filter(v => !shouldIgnore(v)).join(', ') });
        }
      } else {
        items.push({ key: fullKey, value });
      }
    }
    return items;
  };

  const allItems = flattenObject(data);

  // Categorizar cada item
  for (const item of allItems) {
    const keyLower = item.key.toLowerCase().split('.').pop() || item.key.toLowerCase();
    let found = false;

    for (const [catKey, catInfo] of Object.entries(categories)) {
      if (catInfo.fields.some(f => keyLower.includes(f.toLowerCase()))) {
        if (!categorizedData[catKey]) categorizedData[catKey] = [];
        categorizedData[catKey].push(item);
        found = true;
        break;
      }
    }

    if (!found) {
      uncategorized.push(item);
    }
  }

  const formatKey = (key: string): string => {
    const lastPart = key.split('.').pop() || key;
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\[(\d+)\]/g, ' $1')
      .trim()
      .toUpperCase();
  };

  // ============= CONSTRUIR MENSAGEM MONOESPAÇADA =============
  const typeLabel = queryTypeLabels[queryType]?.replace(/[^\w\s]/g, '').trim() || queryType.toUpperCase();
  const lines: string[] = [];
  
  lines.push(`${queryTypeLabels[queryType] || '📋'} ${typeLabel} RESULTADO`);
  lines.push(``);

  // Adicionar categorias com dados
  for (const [catKey, catInfo] of Object.entries(categories)) {
    const items = categorizedData[catKey];
    if (!items || items.length === 0) continue;

    lines.push(`┌─────────────────────────────`);
    lines.push(`│ ${catInfo.icon} ${catInfo.label}`);
    lines.push(`├─────────────────────────────`);
    
    for (const item of items) {
      const displayKey = formatKey(item.key);
      let displayValue: string;
      if (typeof item.value === 'object' && item.value !== null) {
        displayValue = escapeHtml(JSON.stringify(item.value, null, 0).replace(/[{}"]/g, '').toUpperCase());
      } else {
        displayValue = escapeHtml(String(item.value).toUpperCase());
      }
      if (!shouldIgnore(displayValue) && !displayValue.includes('[OBJECT OBJECT]')) {
        lines.push(`│ ▷ ${displayKey}: ${displayValue}`);
      }
    }
    
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // Adicionar itens não categorizados
  if (uncategorized.length > 0) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 📋 OUTROS DADOS`);
    lines.push(`├─────────────────────────────`);
    
    for (const item of uncategorized) {
      const displayKey = formatKey(item.key);
      let displayValue: string;
      if (typeof item.value === 'object' && item.value !== null) {
        displayValue = escapeHtml(JSON.stringify(item.value, null, 0).replace(/[{}"]/g, '').toUpperCase());
      } else {
        displayValue = escapeHtml(String(item.value).toUpperCase());
      }
      if (!shouldIgnore(displayValue) && !displayValue.includes('[OBJECT OBJECT]')) {
        lines.push(`│ ▷ ${displayKey}: ${displayValue}`);
      }
    }
    
    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  // Footer
  lines.push(`❤️ OBRIGADO POR USAR ❤️`);
  lines.push(`🤖 ${botTag}`);

  return `<pre>${lines.join('\n')}</pre>`;
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
  async getSubscription(telegramUserId: number, context?: string): Promise<Subscription | null> {
    let query = this.supabase
      .from("telegram_subscriptions")
      .select("*")
      .eq("telegram_user_id", telegramUserId)
      .eq("bot_id", this.bot.id);
    
    if (context) {
      query = query.eq("context", context);
    }
    
    const { data } = await query
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();
    return data as Subscription | null;
  }

  async isSubscriptionActive(telegramUserId: number, context?: string): Promise<boolean> {
    const sub = await this.getSubscription(telegramUserId, context);
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

   // =============== NEW USER TRACKING ===============
   async trackNewUser(telegramUserId: number) {
     try {
       // Check if user already has any interaction with this bot
       const { data: existingUser } = await this.supabase
         .from("telegram_subscriptions")
         .select("id")
         .eq("telegram_user_id", telegramUserId)
         .eq("bot_id", this.bot.id)
         .limit(1)
         .single();
 
       // Also check telegram_user_terms as fallback
       const { data: existingTerms } = await this.supabase
         .from("telegram_user_terms")
         .select("id")
         .eq("telegram_user_id", telegramUserId)
         .eq("bot_id", this.bot.id)
         .limit(1)
         .single();
 
       // If user is new (no subscription and no terms record), increment counter
       if (!existingUser && !existingTerms) {
         console.log(`New user detected: ${telegramUserId}`);
         await this.supabase.rpc("increment_bot_analytics", {
           p_bot_id: this.bot.id,
           p_new_users: 1,
         });
       }
     } catch (error) {
       // Log error but don't block the flow
       console.error("Error tracking new user:", error);
     }
   }
 
  // =============== LOG QUERY ===============
  // fromCache: se true, não conta crédito (já foi gerenciado pelo api-query)
  async logQuery(telegramUserId: number, queryType: string, queryInput: string, result: Record<string, unknown>, fromCache: boolean = false) {
    // Sempre registra no histórico
    await this.supabase.from("query_history").insert({
      user_id: this.bot.user_id,
      query_type: queryType,
      query_input: queryInput,
      query_result: result,
      status: result.error ? "error" : "success",
    });

    // Só conta crédito se não veio do cache (evita duplicação - api-query já gerencia)
    if (!fromCache) {
      await this.supabase.from("api_usage_logs").insert({
        user_id: this.bot.user_id,
        query_type: queryType,
        credits_used: 1,
      });
    }
  }

  // =============== MENUS ===============
  async showTerms(chatId: number) {
    const text = this.settings.terms_text || "📄 <b>Termos de Uso</b>\n\nAceite os termos para continuar.";
    await sendMessage(this.token, chatId, text, keyboard(
      [btn("✅ Aceitar Termos", "terms:accept", undefined, EMOJI.CHECK)],
      [btn("❌ Recusar", "terms:decline")]
    ));
  }

  // =============== SHOW AVAILABLE COMMANDS ===============
  async showAvailableCommands(chatId: number) {
    try {
      const { data: modules, error } = await this.supabase
        .from("query_modules")
        .select("module_key, label, icon, category, enabled")
        .eq("enabled", true)
        .order("category")
        .order("label");

      if (error || !modules || modules.length === 0) {
        await sendMessage(this.token, chatId, "⚠️ Nenhum módulo disponível no momento.");
        return;
      }

      // Command mapping (module_key -> telegram command)
      const moduleToCommand: Record<string, string> = {
        cpf: "/cpf", cpffull: "/cpffull", "cpf-isk": "/cpfisk",
        "cnpj-cred": "/cnpj", placa: "/placa", "placa-serpro": "/placa2",
        "placa-simples": "/placasimples", "placa-sesp": "/placasesp",
        telefone: "/telefone", telefonefull: "/telefonefull", "telefone-3": "/telefone3",
        email: "/email", emailfull: "/emailfull", "email-3": "/email3",
        cep: "/cep", cepfull: "/cepfull", "cep-3": "/cep3",
        nome: "/nome", nomefull: "/nomefull", "nome-3": "/nome3",
        score: "/score", "score-3": "/score3",
        rg: "/rg", "rg-3": "/rg3", cnh: "/cnh", pis: "/pis", "pis-3": "/pis3",
        pix: "/pix", titulo: "/titulo", endereco: "/endereco", renda: "/renda",
        processos: "/processos", "bnmp-lc": "/bnmp", siel: "/siel", "tse-3": "/tse",
        mae: "/mae", maefull: "/maefull", credilink: "/credilink", "cpf-spc": "/spc",
        poderaquisitivo: "/poder", cpfsus: "/sus",
        parentes: "/parentes", "parentes-3": "/parentes3",
        chassi: "/chassi", renavam: "/renavam", motor: "/motor",
        // Foto por estado (apenas 12 estados disponíveis na API)
        fotosp: "/fotosp", fotorj: "/fotorj", fotomg: "/fotomg",
        fotoce: "/fotoce", fotopr: "/fotopr", fotoma: "/fotoma",
        fotoes: "/fotoes", fotodf: "/fotodf", fototo: "/fototo",
        fotoms: "/fotoms", fotoro: "/fotoro", fotopi: "/fotopi",
      };

      const usageExamples: Record<string, string> = {
        cpf: "12345678900", cpffull: "12345678900", "cpf-isk": "12345678900",
        "cnpj-cred": "12345678000100",
        placa: "ABC1234", "placa-serpro": "ABC1234", "placa-simples": "ABC1234", "placa-sesp": "ABC1234",
        telefone: "11999998888", telefonefull: "11999998888", "telefone-3": "11999998888",
        email: "user@email.com", emailfull: "user@email.com", "email-3": "user@email.com",
        cep: "01310100", cepfull: "01310100", "cep-3": "01310100",
        nome: "João Silva", nomefull: "João Silva", "nome-3": "João Silva",
        score: "12345678900", "score-3": "12345678900",
        rg: "MG12345678", "rg-3": "MG12345678", cnh: "12345678900",
        pis: "12345678900", "pis-3": "12345678900", pix: "chave@pix.com",
        titulo: "12345678900", endereco: "12345678900", renda: "12345678900",
        processos: "12345678900", "bnmp-lc": "12345678900", siel: "12345678900", "tse-3": "12345678900",
        mae: "12345678900", maefull: "12345678900", credilink: "12345678900",
        "cpf-spc": "12345678900",
        poderaquisitivo: "12345678900", cpfsus: "12345678900",
        parentes: "12345678900", "parentes-3": "12345678900",
        chassi: "CHASSI123", renavam: "12345678900", motor: "MOTOR123",
        fotosp: "12345678900", fotorj: "12345678900", fotomg: "12345678900",
        fotoce: "12345678900", fotopr: "12345678900", fotoma: "12345678900",
        fotoes: "12345678900", fotodf: "12345678900", fototo: "12345678900",
        fotoms: "12345678900", fotoro: "12345678900", fotopi: "12345678900",
      };

      // Category labels
      const categoryLabels: Record<string, string> = {
        pessoa: "👤 PESSOA", documento: "📄 DOCUMENTOS", contato: "📱 CONTATO & ENDEREÇO",
        financeiro: "💰 FINANCEIRO", veiculo: "🚗 VEÍCULOS", empresa: "🏢 EMPRESA",
        justica: "⚖️ JUSTIÇA", governo: "🏛️ GOVERNO", foto: "📸 FOTO POR ESTADO", outros: "📋 OUTROS",
      };

      // Group by category
      const grouped: Record<string, typeof modules> = {};
      for (const mod of modules) {
        const cat = mod.category || "outros";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(mod);
      }

      const categoryOrder = ["pessoa", "documento", "contato", "financeiro", "veiculo", "empresa", "justica", "governo", "foto", "outros"];

      let text = "📋 <b>COMANDOS DISPONÍVEIS</b>\n";
      text += "━━━━━━━━━━━━━━━━━━━━━\n\n";

      for (const cat of categoryOrder) {
        const catModules = grouped[cat];
        if (!catModules || catModules.length === 0) continue;

        text += `${categoryLabels[cat] || cat.toUpperCase()}\n`;
        
        for (const mod of catModules) {
          const cmd = moduleToCommand[mod.module_key] || `/${mod.module_key}`;
          const example = usageExamples[mod.module_key] || "";
          text += `  ${mod.icon || "📋"} <code>${cmd} ${example}</code>\n`;
        }
        text += "\n";
      }

      text += "━━━━━━━━━━━━━━━━━━━━━\n";
      text += `✅ <b>${modules.length} módulos ativos</b>\n`;
      text += "💡 Envie até 5 consultas por mensagem!\n";
      text += "📸 Fotos: <code>/foto CPF</code> (todos) ou <code>/foto SP CPF</code>";

      await sendMessage(this.token, chatId, text);
    } catch (err) {
      console.error("[showAvailableCommands] Error:", err);
      await sendMessage(this.token, chatId, "⚠️ Erro ao carregar comandos.");
    }
  }

  async showMainMenu(chatId: number, telegramUserId: number, messageId?: number, chatType?: string) {
    // Determine context based on chat type
    const isPrivateChat = !chatType || chatType === 'private';
    const context = isPrivateChat ? 'private' : 'group';
    
    const sub = await this.getSubscription(telegramUserId, context);
    const isActive = sub && !isExpired(sub.expires_at);
    
    // Also check the other context for display
    const otherContext = isPrivateChat ? 'group' : 'private';
    const otherSub = await this.getSubscription(telegramUserId, otherContext);
    const otherActive = otherSub && !isExpired(otherSub.expires_at);
    
    let statusBlock = "";
    const contextLabel = isPrivateChat ? "Privado" : "Grupo";
    
    if (isActive) {
      const days = daysLeft(sub.expires_at);
      const hours = Math.floor((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60));
      const mins = Math.floor(((new Date(sub.expires_at).getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
      const timeLeft = days > 0 ? `${days}d ${hours % 24}h` : `${hours}h ${mins}m`;
      statusBlock = `\n\n✅ <b>Assinatura ${contextLabel} Ativa</b>\n` +
        `┌ 📦 Plano: <b>${sub.plan_name}</b>\n` +
        `├ ⏰ Expira: <b>${formatDate(sub.expires_at)}</b>\n` +
        `└ ⏳ Restante: <b>${timeLeft}</b>`;
    } else {
      statusBlock = `\n\n❌ <b>Sem assinatura ${contextLabel.toLowerCase()}</b>\n└ Assine um plano para usar no ${contextLabel.toLowerCase()}.`;
    }
    
    // Show other context status if active
    if (otherActive) {
      const otherLabel = isPrivateChat ? "Grupo" : "Privado";
      const otherDays = daysLeft(otherSub.expires_at);
      statusBlock += `\n\n✅ <i>Assinatura ${otherLabel}: ${otherSub.plan_name} (${otherDays}d restantes)</i>`;
    }

    const buttons: InlineButton[][] = [];
    
    if (isActive) {
      buttons.push([btn("🔍 Fazer Consulta", "menu:query", "success", EMOJI.SEARCH)]);
    }
    
    if (isPrivateChat) {
      buttons.push([btn("💳 Planos Privado", "menu:plans:private", "primary", EMOJI.DIAMOND)]);
      buttons.push([btn("👥 Planos Grupo", "menu:plans:group", "primary", EMOJI.DIAMOND)]);
    } else {
      buttons.push([btn("💳 Assinar / Renovar", "menu:plans:group", "primary", EMOJI.DIAMOND)]);
    }
    buttons.push([btn("📊 Minha Assinatura", "menu:subscription", undefined, EMOJI.CHART)]);
    buttons.push([btn("💰 Pagamentos Pendentes", "menu:pending", undefined, EMOJI.MONEY)]);
    buttons.push([btn("📋 Comandos", "show_commands", undefined, EMOJI.LIST)]);

    if (this.isOwner(telegramUserId)) {
      buttons.push([btn("⚙️ Painel Admin", "admin:menu", undefined, EMOJI.LIGHTNING)]);
    }

    if (this.settings.group_url) {
      buttons.push([btnUrl("🚪 Entrar no Grupo", this.settings.group_url, undefined, EMOJI.DOOR)]);
    }

    const botTag = this.bot.bot_username ? `@${this.bot.bot_username}` : '';
    const text = `🏠 <b>Menu Principal</b>${statusBlock}\n\n<i>${botTag}</i>`;

    if (messageId) {
      await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
    } else {
      await sendMessage(this.token, chatId, text, keyboard(...buttons));
    }
  }

  async showQueryMenu(chatId: number, messageId: number) {
    const text = `🔍 <b>Central de Consultas</b>\n\n<i>Selecione o tipo de pesquisa desejado:</i>`;

    // Only show enabled query types - hide disabled ones completely
    const qBtn = async (label: string, data: string): Promise<InlineButton | null> => {
      const qType = data.replace("query:", "");
      const isEnabled = await isQueryTypeEnabled(qType, this.supabase);
      if (!isEnabled) return null;
      return btn(label, data);
    };

    const allRowsPromises: Promise<InlineButton | null>[][] = [
      [qBtn("👤 CPF", "query:cpf"), qBtn("🏢 CNPJ", "query:cnpj")],
      [qBtn("🚗 Placa", "query:placa"), qBtn("🚗 Placa+", "query:placa_completa")],
      [qBtn("📞 Telefone", "query:telefone"), qBtn("📧 Email", "query:email")],
      [qBtn("📍 CEP", "query:cep"), qBtn("📝 Nome", "query:nome")],
      [qBtn("📊 Score", "query:score"), qBtn("💳 PIX", "query:pix")],
      [qBtn("🪪 RG", "query:rg"), qBtn("🪪 CNH", "query:cnh")],
      [qBtn("📜 Título", "query:titulo"), qBtn("📍 Endereço", "query:endereco")],
      [qBtn("💰 Renda", "query:renda"), qBtn("👩 Mãe", "query:mae")],
      [qBtn("⚖️ Processos", "query:processos"), qBtn("🔍 BNMP", "query:bnmp")],
      [qBtn("🗳️ TSE", "query:tse"), qBtn("📊 Credilink", "query:credilink")],
      [qBtn("💎 Poder Aquis.", "query:poderaquisitivo"), qBtn("📋 SPC", "query:cpf_spc")],
      [qBtn("🏥 SUS", "query:cpfsus"), qBtn("📋 PIS", "query:pis")],
      [qBtn("👨‍👩‍👧‍👦 Parentes", "query:parentes"), qBtn("🔎 SIEL", "query:siel")],
      [qBtn("🔧 Chassi", "query:chassi"), qBtn("📋 RENAVAM", "query:renavam")],
      [qBtn("⚙️ Motor", "query:motor")],
      [qBtn("📸 Foto Nacional", "query:nacional")],
      [qBtn("📸 Foto por Estado", "query:foto")],
    ];

    const allRows = await Promise.all(allRowsPromises.map(row => Promise.all(row)));

    // Filter out null buttons and empty rows
    const buttons: InlineButton[][] = allRows
      .map(row => row.filter((b): b is InlineButton => b !== null))
      .filter(row => row.length > 0);

    buttons.push([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]);

    const moduleStatus = await loadModuleStatus(this.supabase);
    const totalCount = Object.keys(moduleStatus).length;
    const enabledCount = Object.values(moduleStatus).filter(v => v).length;
    const note = enabledCount < totalCount ? `\n\n⚠️ <i>${totalCount - enabledCount} módulo(s) em manutenção</i>` : "";
    await editMessage(this.token, chatId, messageId, text + note, keyboard(...buttons));
  }

  async showStateSelection(chatId: number, messageId: number) {
    const text = `📸 <b>Foto por Estado</b>\n\nSelecione o estado:`;

    const stateButtons: InlineButton[][] = [];
    for (let i = 0; i < brazilianStates.length; i += 4) {
      const row = brazilianStates.slice(i, i + 4).map(s => btn(s, `state:${s}`));
      stateButtons.push(row);
    }
    stateButtons.push([btn("🔙 Voltar", "menu:query", undefined, EMOJI.BACK)]);

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
      case "titulo": placeholder = "Digite o CPF para consultar título de eleitor:"; break;
      case "endereco": placeholder = "Digite o CPF para consultar endereço:"; break;
      case "renda": placeholder = "Digite o CPF para consultar renda:"; break;
      case "processos": placeholder = "Digite o CPF para consultar processos:"; break;
      case "bnmp": placeholder = "Digite o CPF para consultar BNMP:"; break;
      case "siel": placeholder = "Digite o CPF para consultar SIEL:"; break;
      case "tse": placeholder = "Digite o CPF para consultar TSE:"; break;
      case "mae": placeholder = "Digite o CPF para consultar nome da mãe:"; break;
      case "credilink": placeholder = "Digite o CPF para consultar Credilink:"; break;
      case "cpf_spc": placeholder = "Digite o CPF para consultar SPC:"; break;
      case "poderaquisitivo": placeholder = "Digite o CPF para consultar poder aquisitivo:"; break;
      case "cpfsus": placeholder = "Digite o CPF para consultar SUS:"; break;
      case "pis": placeholder = "Digite o CPF para consultar PIS:"; break;
      case "parentes": placeholder = "Digite o CPF para consultar parentes:"; break;
      case "chassi": placeholder = "Digite o número do chassi:"; break;
      case "renavam": placeholder = "Digite a placa para consultar RENAVAM:"; break;
      case "motor": placeholder = "Digite o número do motor:"; break;
      default: placeholder = "Digite o valor para consultar:";
    }

    await sendMessage(this.token, chatId, 
      `${label}\n\n${placeholder}\n\nEnvie /cancelar para cancelar.`,
      keyboard([btn("❌ Cancelar", "menu:query")])
    );
  }

  async processQuery(chatId: number, telegramUserId: number, queryType: string, queryInput: string, estado?: string, telegramUserName?: string) {
    // Check maintenance mode - silently ignore so other bots can respond
    if (this.settings.maintenance_mode) {
      logCmd('INFO', 'CMD_BLOCKED', { reason: 'maintenance', queryType, chatId, userId: telegramUserId });
      return;
    }

    // Check subscription
    const isActive = await this.isSubscriptionActive(telegramUserId);
    if (!isActive && !this.isOwner(telegramUserId)) {
      await sendMessage(this.token, chatId,
        "⚠️ <b>Assinatura necessária</b>\n\nVocê precisa de uma assinatura ativa para fazer consultas.",
        keyboard([btn("💳 Ver Planos", "menu:plans", undefined, EMOJI.DIAMOND), btn("🏠 Menu", "menu:main", undefined, EMOJI.HOME)])
      );
      return;
    }

    // Check if query type is enabled - SILENTLY ignore if disabled
    // This prevents the bot from responding when module is off,
    // avoiding confusion with other bots no grupo
    if (!await isQueryTypeEnabled(queryType, this.supabase)) {
      logCmd('INFO', 'CMD_BLOCKED', { reason: 'disabled', queryType, chatId, userId: telegramUserId });
      return;
    }

    logCmd('INFO', 'QUERY_START', { queryType, input: queryInput.substring(0, 20), chatId, userId: telegramUserId, estado: estado || null });
    await sendMessage(this.token, chatId, `⏳ <b>Consultando ${queryTypeLabels[queryType] || queryType}...</b>\n\nAguarde um momento.`);

    try {
      const { data: result, fromCache } = await executeQueryWithCache(queryType, queryInput, estado);
      
      // Log query - passa fromCache para evitar duplicação de créditos
      await this.logQuery(telegramUserId, queryType, queryInput, result, fromCache);

      // Verificar se é resultado de CEP ou TELEFONE com múltiplos registros
      const rawDataStr = typeof result.data === 'string' ? result.data : '';
      if ((queryType === 'cep' || queryType === 'telefone') && rawDataStr && isMultiPersonResult(rawDataStr)) {
        const records = parseMultiplePersonRecords(rawDataStr);
        
        if (records.length > 1) {
          // Obter o efeito configurado para este bot
          const effectId = getMessageEffectId(this.settings.message_effect);
          const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);
          
          if (records.length > RECORDS_PER_PAGE) {
            // Precisa de paginação - salvar registros no banco
            const { data: paginationData, error } = await this.supabase
              .from("paginated_results")
              .insert({
                chat_id: chatId,
                pages: records, // Salvar registros como JSON
                current_page: 0,
                total_pages: totalPages,
              })
              .select("id")
              .single();
            
            if (error || !paginationData) {
              console.error(`Failed to create ${queryType} pagination record:`, error);
              // Fallback: enviar primeira página sem paginação
              const pageText = formatMultiPersonPage(records, 0, totalPages, this.bot.bot_username, telegramUserName, queryType, queryInput);
              await sendLongMessagePaginated(this.token, chatId, pageText, this.supabase, undefined, effectId, queryType, queryInput);
              return;
            }
            
            const paginationId = paginationData.id;
            const pageText = formatMultiPersonPage(records, 0, totalPages, this.bot.bot_username, telegramUserName, queryType, queryInput);
            const pageKeyboard = createMultiPersonKeyboard(records, 0, totalPages, paginationId, queryType, queryInput);
            
            const paginatedPayload: Record<string, unknown> = {
              chat_id: chatId,
              text: pageText,
              parse_mode: "HTML",
              reply_markup: pageKeyboard,
            };
            if (effectId) {
              paginatedPayload.message_effect_id = effectId;
            }
            
            const msgResult = await telegramRequest(this.token, "sendMessage", paginatedPayload);
            
            // Atualizar message_id no banco
            if (msgResult.ok && msgResult.result) {
              const resultMessage = msgResult.result as { message_id?: number };
              if (resultMessage.message_id) {
                await this.supabase
                  .from("paginated_results")
                  .update({ message_id: resultMessage.message_id })
                  .eq("id", paginationId);
              }
            }
          } else {
            // Menos de 10 registros - enviar sem paginação mas com botões de CPF
            const pageText = formatMultiPersonPage(records, 0, 1, this.bot.bot_username, telegramUserName, queryType, queryInput);
            const pageKeyboard = createMultiPersonKeyboard(records, 0, 1, undefined, queryType, queryInput);
            
            const payload: Record<string, unknown> = {
              chat_id: chatId,
              text: pageText,
              parse_mode: "HTML",
              reply_markup: pageKeyboard,
            };
            if (effectId) {
              payload.message_effect_id = effectId;
            }
            
            await telegramRequest(this.token, "sendMessage", payload);
          }
          
          return;
        }
      }

      // Format and send result - usar nome do usuário do Telegram
      const formattedResult = formatQueryResult(queryType, result, this.bot.bot_username, telegramUserName);
      
      // Check for photo - deep extraction from nested API response
      const fotoUrl = deepExtractPhoto(result);
      
      const isValidPhotoUrl = fotoUrl && typeof fotoUrl === 'string' && 
        (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));

      let resultMessageId: number | undefined;
      
      // Obter o efeito configurado para este bot
      const effectId = getMessageEffectId(this.settings.message_effect);

      // Detectar UF do resultado para botão "Consultar Foto"
      const isPhotoQuery = queryType.toLowerCase().startsWith('foto') || queryType.toLowerCase() === 'nacional';
      const detectedUf = !isPhotoQuery ? extractUfFromResult((result as Record<string, unknown>).data ?? result) : null;
      const isCpfBased = /^\d{11}$/.test(queryInput.replace(/\D/g, ''));
      const showFotoButton = detectedUf && isCpfBased && ufToFotoModule[detectedUf];

      if (isValidPhotoUrl) {
        const actionButtons: InlineButton[][] = [
          [btn("🔍 Nova Consulta", "menu:query", "success", EMOJI.SEARCH), btn("🏠 Menu", "menu:main", undefined, EMOJI.HOME)],
          [btn("🗑️ Apagar", "delete_msg", "danger")],
          [btn("📄 Baixar PDF", `pdf:${queryType}:${queryInput}`, "success")]
        ];
        if (!isPhotoQuery) {
          actionButtons.push([btn("📝 Ver TXT", `txt:${queryType}:${queryInput}`)]);
        }
        if (showFotoButton) {
          actionButtons.push([btn(`📸 Consultar Foto (${detectedUf})`, `foto_query:${detectedUf}:${queryInput.replace(/\D/g, '')}`, "primary")]);
        }
        
        const photoResult = await telegramRequest(this.token, "sendPhoto", {
          chat_id: chatId,
          photo: fotoUrl,
          caption: formattedResult.substring(0, 1024),
          parse_mode: "HTML",
          ...(effectId && { message_effect_id: effectId }),
          reply_markup: { inline_keyboard: actionButtons },
        });
        if (photoResult.ok && photoResult.result) {
          resultMessageId = (photoResult.result as { message_id?: number }).message_id;
        }
      } else {
        // Usar paginação por botões para resultados longos
        // Adicionar botão de foto se UF detectado
        const extraButtons: InlineButton[][] = [];
        if (showFotoButton) {
          extraButtons.push([btn(`📸 Consultar Foto (${detectedUf})`, `foto_query:${detectedUf}:${queryInput.replace(/\D/g, '')}`)]);
        }
        const paginatedResult = await sendLongMessagePaginated(this.token, chatId, formattedResult, this.supabase, undefined, effectId, queryType, queryInput, extraButtons);
        if (paginatedResult.ok && paginatedResult.result) {
          resultMessageId = (paginatedResult.result as { message_id?: number }).message_id;
        }
      }
      
      // Adicionar reação positiva ao resultado (se configurado)
      if (this.settings.react_to_messages && !result.error && !result.notFound) {
        try {
          const emoji = chooseReactionEmoji(this.settings);
          // Reagir na mensagem de resultado
          if (resultMessageId) {
            await setMessageReaction(this.token, chatId, resultMessageId, emoji);
          }
        } catch (reactionErr) {
          console.log("Could not add reaction:", reactionErr);
        }
      }
    } catch (error) {
      logCmd('ERROR', 'QUERY_FAIL', { queryType, input: queryInput.substring(0, 20), chatId, userId: telegramUserId, error: (error as Error).message, stack: (error as Error).stack?.substring(0, 200) });
      await sendMessage(this.token, chatId,
        "❌ <b>Erro na consulta</b>\n\nOcorreu um erro ao processar sua consulta. Tente novamente.",
        keyboard([btn("🔍 Tentar Novamente", "menu:query"), btn("🏠 Menu", "menu:main", undefined, EMOJI.HOME)])
      );
    }
  }

  async showPlansMenu(chatId: number, messageId: number, context: string = 'group') {
    const plans = await this.getPlans();
    const isPrivate = context === 'private';
    const PRIVATE_MARKUP = 3; // R$3 a mais para privado

    if (plans.length === 0) {
      await editMessage(this.token, chatId, messageId,
        "⚠️ <b>Nenhum plano disponível no momento.</b>\n\n<i>Volte mais tarde.</i>",
        keyboard([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)])
      );
      return;
    }

    const contextLabel = isPrivate ? "🔒 Privado" : "👥 Grupo";
    let text = `💎 <b>Planos Disponíveis — ${contextLabel}</b>\n\n`;
    plans.forEach((p, i) => {
      const popular = (p as any).is_popular ? " ⭐" : "";
      const price = isPrivate ? p.price + PRIVATE_MARKUP : p.price;
      text += `${i + 1}. <b>${p.title}</b>${popular}\n`;
      text += `   💰 R$ ${price.toFixed(2)} • ${p.days} dias\n\n`;
    });
    text += `<i>Selecione um plano para gerar o PIX:</i>`;

    const buttons: InlineButton[][] = plans.map(p => {
      const popular = (p as any).is_popular ? " ⭐" : "";
      const price = isPrivate ? p.price + PRIVATE_MARKUP : p.price;
      return [btn(`${p.title} — R$ ${price.toFixed(2)}${popular}`, `plan:${p.code}:${context}`)];
    });
    buttons.push([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  async showSubscriptionMenu(chatId: number, telegramUserId: number, messageId: number) {
    // Show both subscriptions
    const groupSub = await this.getSubscription(telegramUserId, 'group');
    const privateSub = await this.getSubscription(telegramUserId, 'private');
    
    const groupActive = groupSub && !isExpired(groupSub.expires_at);
    const privateActive = privateSub && !isExpired(privateSub.expires_at);
    
    if (!groupActive && !privateActive) {
      await editMessage(this.token, chatId, messageId,
        "📊 <b>Minhas Assinaturas</b>\n\n" +
        "❌ Nenhuma assinatura ativa encontrada.\n\n" +
        "<i>Adquira um plano para começar a consultar.</i>",
        keyboard(
          [btn("💎 Planos Grupo", "menu:plans:group", undefined, EMOJI.DIAMOND), btn("🔒 Planos Privado", "menu:plans:private", undefined, EMOJI.DIAMOND)],
          [btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]
        )
      );
      return;
    }

    let text = `📊 <b>Minhas Assinaturas</b>\n\n`;
    
    const formatSub = (sub: Subscription, label: string) => {
      const days = daysLeft(sub.expires_at);
      const hours = Math.floor((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60));
      const mins = Math.floor(((new Date(sub.expires_at).getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
      const timeLeft = days > 0 ? `${days}d ${hours % 24}h` : `${hours}h ${mins}m`;
      const totalHours = sub.plan_days * 24;
      const usedHours = totalHours - (days * 24 + (hours % 24));
      const progress = Math.min(Math.max(usedHours / totalHours, 0), 1);
      const barLength = 10;
      const filled = Math.round(progress * barLength);
      const bar = "▓".repeat(filled) + "░".repeat(barLength - filled);
      return `<b>${label}</b>\n` +
        `┌ 📦 Plano: <b>${sub.plan_name}</b>\n` +
        `├ 💰 Valor: <b>R$ ${Number(sub.value).toFixed(2)}</b>\n` +
        `├ 📅 Início: <b>${formatDate(sub.started_at)}</b>\n` +
        `├ ⏰ Expira: <b>${formatDate(sub.expires_at)}</b>\n` +
        `├ ⏳ Restante: <b>${timeLeft}</b>\n` +
        `├ 📊 [${bar}] ${Math.round((1 - progress) * 100)}%\n` +
        `└ 🎫 <code>${sub.txid}</code>`;
    };

    if (groupActive) {
      text += formatSub(groupSub, "👥 Assinatura Grupo") + "\n\n";
    }
    if (privateActive) {
      text += formatSub(privateSub, "🔒 Assinatura Privado") + "\n\n";
    }
    if (!groupActive) {
      text += "👥 <i>Sem assinatura de grupo ativa</i>\n\n";
    }
    if (!privateActive) {
      text += "🔒 <i>Sem assinatura de privado ativa</i>\n\n";
    }

    await editMessage(this.token, chatId, messageId, text,
      keyboard(
        [btn("🔄 Renovar Grupo", "menu:plans:group", undefined, EMOJI.REFRESH), btn("🔄 Renovar Privado", "menu:plans:private", undefined, EMOJI.REFRESH)],
        [btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]
      )
    );
  }

  async showPendingMenu(chatId: number, telegramUserId: number, messageId: number) {
    const pending = await this.getPendingPayments(telegramUserId);

    if (pending.length === 0) {
      await editMessage(this.token, chatId, messageId,
        "💰 <b>Pagamentos Pendentes</b>\n\n" +
        "✅ Nenhum pagamento pendente.\n\n" +
        "<i>Todos os seus pagamentos foram processados.</i>",
        keyboard([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)])
      );
      return;
    }

    let text = `💰 <b>Pagamentos Pendentes</b>\n\n`;
    text += `📋 ${pending.length} pagamento(s) aguardando:\n\n`;
    const buttons: InlineButton[][] = [];

    pending.forEach((p, i) => {
      const createdAt = new Date(p.created_at);
      const ageMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
      const ageText = ageMinutes < 60 ? `${ageMinutes}min` : `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}min`;
      text += `${i + 1}. <b>${p.plan_name}</b> — R$ ${Number(p.value).toFixed(2)}\n`;
      text += `   ⏱ Há ${ageText} • <code>${p.txid.substring(0, 12)}...</code>\n\n`;
      buttons.push([btn(`✅ Verificar "${p.plan_name}"`, `chk_${p.txid}`)]);
    });

    buttons.push([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]);

    await editMessage(this.token, chatId, messageId, text, keyboard(...buttons));
  }

  // =============== ADMIN MENUS ===============
  async showAdminMenu(chatId: number, messageId: number) {
    await editMessage(this.token, chatId, messageId,
      "⚙️ <b>Painel Administrativo</b>\n\n" +
      "<i>Gerencie seu bot a partir deste painel:</i>",
      keyboard(
        [btn("📋 Gerenciar Planos", "admin:plans", "primary", EMOJI.DIAMOND), btn("👥 Usuários", "admin:users", "primary", EMOJI.USERS)],
        [btn("📊 Estatísticas", "admin:stats", "success", EMOJI.CHART), btn("📢 Broadcast", "admin:broadcast", "danger", EMOJI.MEGAPHONE)],
        [btn("🔙 Voltar ao Menu", "menu:main", undefined, EMOJI.BACK)]
      )
    );
  }

  async showPlansManagement(chatId: number, messageId: number) {
    const plans = await this.getAllPlans();

    let text = "📋 <b>Gerenciamento de Planos</b>\n\n";
    
    if (plans.length === 0) {
      text += "<i>Nenhum plano criado ainda.</i>";
    } else {
      plans.forEach((p, i) => {
        const status = p.is_active ? "🟢" : "🔴";
        text += `${status} <b>${p.name}</b>\n`;
        text += `   💰 R$ ${p.price.toFixed(2)} • ${p.days} dias • <code>${p.code}</code>\n\n`;
      });
    }

    const buttons: InlineButton[][] = plans.map(p => [
      btn(`✏️ ${p.name}`, `admin:edit_plan:${p.id}`)
    ]);

    buttons.push([btn("➕ Novo Plano", "admin:new_plan", "success", EMOJI.PLUS)]);
    buttons.push([btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)]);

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
        keyboard([btn("🔙 Voltar", "admin:plans", undefined, EMOJI.BACK)]));
      return;
    }

    const status = plan.is_active ? "🟢 Ativo" : "🔴 Inativo";

    await editMessage(this.token, chatId, messageId,
      `✏️ <b>Editar Plano</b>\n\n` +
      `┌ 📦 Nome: <b>${plan.name}</b>\n` +
      `├ 💰 Preço: <b>R$ ${plan.price.toFixed(2)}</b>\n` +
      `├ 📅 Duração: <b>${plan.days} dias</b>\n` +
      `├ 📊 Status: <b>${status}</b>\n` +
      `└ 🔑 Código: <code>${plan.code}</code>`,
      keyboard(
        [btn("💰 Preço", `admin:change_price:${planId}`), btn("📅 Dias", `admin:change_days:${planId}`)],
        [btn("📝 Nome", `admin:change_name:${planId}`), btn(plan.is_active ? "🔴 Desativar" : "🟢 Ativar", `admin:toggle_plan:${planId}`)],
        [btn("🗑️ Deletar Plano", `admin:delete_plan:${planId}`)],
        [btn("🔙 Voltar", "admin:plans", undefined, EMOJI.BACK)]
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

    let text = "👥 <b>Usuários Ativos</b>\n\n";

    if (subscriptions.length === 0) {
      text += "<i>Nenhum usuário com assinatura ativa.</i>";
    } else {
      text += `📊 Total: <b>${subscriptions.length}</b>\n\n`;
      subscriptions.slice(0, 20).forEach((s, i) => {
        const days = daysLeft(s.expires_at);
        text += `${i + 1}. <code>${s.telegram_user_id}</code> • ${s.plan_name} • ${days}d\n`;
      });
      if (subscriptions.length > 20) {
        text += `\n<i>... e mais ${subscriptions.length - 20} usuários</i>`;
      }
    }

    await editMessage(this.token, chatId, messageId, text,
      keyboard([btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)])
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

    const rate = (totalSubs && totalSubs > 0) ? Math.round(((activeSubs || 0) / totalSubs) * 100) : 0;

    await editMessage(this.token, chatId, messageId,
      `📊 <b>Estatísticas do Bot</b>\n\n` +
      `<b>👥 ASSINATURAS</b>\n` +
      `┌ 📋 Total: <b>${totalSubs || 0}</b>\n` +
      `├ ✅ Ativas: <b>${activeSubs || 0}</b>\n` +
      `├ 📈 Taxa: <b>${rate}%</b>\n` +
      `└ ⏳ Pendentes: <b>${pendingPayments || 0}</b>\n\n` +
      `<b>💰 HOJE</b>\n` +
      `┌ 💵 Receita: <b>R$ ${todayRevenue.toFixed(2)}</b>\n` +
      `├ 🔍 Consultas: <b>${totalQueries || 0}</b>\n` +
      `└ 🆕 Vendas: <b>${subsData.length}</b>`,
      keyboard([btn("🔄 Atualizar", "admin:stats", "success", EMOJI.REFRESH), btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)])
    );
  }

  async showBroadcastMenu(chatId: number, messageId: number) {
    await editMessage(this.token, chatId, messageId,
      "📢 <b>Broadcast</b>\n\n<i>Selecione o público-alvo da mensagem:</i>",
      keyboard(
        [btn("📢 Todos", "broadcast:all", "primary", EMOJI.MEGAPHONE), btn("✅ Ativos", "broadcast:active", "success", EMOJI.CHECK)],
        [btn("❌ Expirados", "broadcast:expired", "danger")],
        [btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)]
      )
    );
  }

  // =============== PIX PAYMENT ===============
  async generatePixPayment(chatId: number, telegramUserId: number, planCode: string, context: string = 'group') {
    const plans = await this.getPlans();
    const plan = plans.find(p => p.code === planCode);
    const PRIVATE_MARKUP = 3; // R$3 a mais para privado
    const isPrivate = context === 'private';

    if (!plan) {
      await sendMessage(this.token, chatId, "❌ Plano não encontrado.");
      return;
    }

    const finalPrice = isPrivate ? plan.price + PRIVATE_MARKUP : plan.price;

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const response = await fetch(`${supabaseUrl}/functions/v1/efi-generate-pix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          amount: finalPrice,
          user_id: this.bot.user_id,
          telegram_user_id: telegramUserId,
          telegram_chat_id: chatId,
          bot_id: this.bot.id,
          plan_name: plan.name,
          plan_code: plan.code,
          plan_days: plan.days,
          context: context,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("PIX creation failed:", result);
        await sendMessage(this.token, chatId, "❌ Erro ao gerar PIX. Tente novamente em instantes.");
        return;
      }

      const { txid, qr_code, qr_code_image } = result.data;

      // INSERT removido - agora feito exclusivamente pelo efi-generate-pix

      const contextLabel = isPrivate ? "🔒 Privado" : "👥 Grupo";
       const pixText =
         `💳 <b>PIX Gerado!</b>\n\n` +
         `📦 Plano: <b>${plan.name}</b> (${contextLabel})\n` +
         `💰 Valor: <b>R$ ${finalPrice.toFixed(2)}</b>\n` +
         `📅 Validade: <b>${plan.days} dias</b>\n` +
         `⏰ Expira em: <b>10 minutos</b>\n\n` +
         `🎫 TXID: <code>${txid}</code>\n\n` +
         `🔹 <b>Pix Copia e Cola:</b>\n<pre>${qr_code}</pre>`;

       const pixKeyboard = keyboard(
         [btn("✅ Já Paguei - Confirmar", `chk_${txid}`)],
         [btnUrl("🏦 Abrir App do Banco", "https://www.bcb.gov.br/estabilidadefinanceira/pix")],
         [btn("🔙 Voltar", "menu:plans", undefined, EMOJI.BACK)]
       );

       // telegramRequest agora converte data:image/...base64 para multipart automaticamente
       if (qr_code_image) {
         const sentMsg = await telegramRequest(this.token, "sendPhoto", {
           chat_id: chatId,
           photo: qr_code_image,
           caption: pixText,
           parse_mode: "HTML",
           reply_markup: pixKeyboard,
         });

         if (!sentMsg.ok) {
           console.error("sendPhoto failed, falling back to sendMessage:", sentMsg);
           await sendMessage(this.token, chatId, pixText, pixKeyboard);
         } else if (sentMsg.result) {
           const msgResult = sentMsg.result as { message_id: number };
           await this.supabase
             .from("pending_payments")
             .update({ telegram_message_id: msgResult.message_id })
             .eq("txid", txid);
         }
       } else {
         await sendMessage(this.token, chatId, pixText, pixKeyboard);
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
      const isPaid = status === "CONCLUIDA" || status === "PAID" || result.isPaid === true;

      if (isPaid) {
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
          keyboard([btn("🔙 Voltar", "menu:pending", undefined, EMOJI.BACK)])
        );
      }
    } catch (error) {
      console.error("Payment check error:", error);
      await sendMessage(this.token, chatId, "❌ Erro ao consultar pagamento. Tente novamente.");
    }
  }

  async confirmPayment(payment: PendingPayment, chatId: number, telegramUserId: number) {
    const { plan_days: planDays, plan_name: planName, value, txid, plan_id, plan_code } = payment;
    const paymentContext = payment.context || 'group';

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
      context: paymentContext,
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    console.log(`Payment confirmed: User ${telegramUserId}, TXID ${txid}, Context: ${paymentContext}`);

    // Only unmute in group if it's a group subscription
    if (this.settings.group_chat_id && paymentContext === 'group') {
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

    const contextLabel = paymentContext === 'private' ? '🔒 Privado' : '👥 Grupo';
    const buttons: InlineButton[][] = [];
    if (this.settings.group_url && paymentContext === 'group') {
      buttons.push([btnUrl("🚪 Entrar no Grupo", this.settings.group_url, undefined, EMOJI.DOOR)]);
    }
    buttons.push([btn("🔍 Fazer Consulta", "menu:query", undefined, EMOJI.SEARCH)]);
    buttons.push([btn("🏠 Menu Principal", "menu:main", undefined, EMOJI.HOME)]);

    // Obter o efeito configurado para este bot
    const effectId = getMessageEffectId(this.settings.message_effect);

    // Enviar mensagem de confirmação com efeito visual
    const daysText = planDays === 1 ? "1 dia" : `${planDays} dias`;
    const accessMsg = paymentContext === 'group' && this.settings.group_chat_id 
      ? "🚪 <b>Acesso liberado no grupo!</b>" 
      : "✅ <b>Assinatura ativada!</b>";
    await telegramRequest(this.token, "sendMessage", {
      chat_id: chatId,
      text: `🎉 <b>PAGAMENTO CONFIRMADO!</b>\n\n` +
        `┌ 📦 Plano: <b>${planName}</b> (${contextLabel})\n` +
        `├ 💰 Valor: <b>R$ ${Number(value).toFixed(2)}</b>\n` +
        `├ ⏰ Duração: <b>${daysText}</b>\n` +
        `├ 📅 Válido até: <b>${formatDate(expiresAt)}</b>\n` +
        `└ 🎫 <code>${txid}</code>\n\n` +
        accessMsg,
      parse_mode: "HTML",
      ...(effectId && { message_effect_id: effectId }),
      reply_markup: keyboard(...buttons),
    });

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
          `🔥 <b>NOVA ASSINATURA!</b>\n\n` +
          `┌ 👤 ${display}\n` +
          `├ 📦 ${planName} • ${planDays}d\n` +
          `├ 💵 R$ ${Number(value).toFixed(2)}\n` +
          `└ 🆔 <code>${txid.substring(0, 16)}...</code>\n\n` +
          `🎊 <b>Bem-vindo(a)!</b>`,
          keyboard([btnUrl("🛒 ASSINAR", `https://t.me/${this.bot.bot_username}?start=assinar`)])
        );
      } catch (e) {
        console.error("Failed to announce in group:", e);
      }
    }
  }

  // =============== BROADCAST ===============
  async executeBroadcast(telegramUserId: number, filter: string, message: TelegramMessage) {
    const filterText: Record<string, string> = { all: "todos", active: "ativos", expired: "expirados" };
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
      await sendMessage(this.token, message.chat.id,
        `❌ Nenhum usuário encontrado para o filtro "<b>${filterText[filter] || filter}</b>".`,
        keyboard([btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)])
      );
      return;
    }

    const userIds = [...new Set(subscriptions.map(s => s.telegram_user_id))];
    const total = userIds.length;

    // Detect media type for status message
    const mediaType = message.photo ? "📷 Foto" :
      message.video ? "🎬 Vídeo" :
      message.audio ? "🎵 Áudio" :
      message.voice ? "🎙️ Voz" :
      message.animation ? "🎞️ GIF" :
      message.document ? "📎 Documento" :
      message.sticker ? "🏷️ Sticker" :
      message.video_note ? "⏺️ Vídeo circular" :
      "💬 Texto";

    // Send initial progress message
    const progressBar = (current: number, t: number) => {
      const pct = Math.round((current / t) * 100);
      const filled = Math.round(pct / 5);
      return "▓".repeat(filled) + "░".repeat(20 - filled) + ` ${pct}%`;
    };

    const statusMsg = await telegramRequest(this.token, "sendMessage", {
      chat_id: message.chat.id,
      text: `📡 <b>BROADCAST INICIADO</b>\n\n` +
        `${mediaType} → ${total} usuários (${filterText[filter] || filter})\n\n` +
        `${progressBar(0, total)}\n\n` +
        `⏳ Enviando...`,
      parse_mode: "HTML",
    });

    const statusMessageId = statusMsg?.result?.message_id;

    let sent = 0;
    let failed = 0;
    let blocked = 0;
    const startTime = Date.now();

    // Update progress every N users
    const UPDATE_INTERVAL = Math.max(5, Math.floor(total / 10));

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      try {
        if (message.photo || message.video || message.document || message.audio || message.voice || message.animation || message.video_note || message.sticker) {
          const result = await telegramRequest(this.token, "copyMessage", {
            chat_id: userId,
            from_chat_id: message.chat.id,
            message_id: message.message_id,
          });
          if (result?.ok) {
            sent++;
          } else {
            if (result?.description?.includes("blocked") || result?.description?.includes("deactivated")) {
              blocked++;
            }
            failed++;
          }
        } else if (message.text) {
          const result = await telegramRequest(this.token, "sendMessage", {
            chat_id: userId,
            text: message.text,
            parse_mode: "HTML",
          });
          if (result?.ok) {
            sent++;
          } else {
            if (result?.description?.includes("blocked") || result?.description?.includes("deactivated")) {
              blocked++;
            }
            failed++;
          }
        }
      } catch (_e) {
        failed++;
      }

      // Rate limit: pause every 25 messages
      if ((sent + failed) % 25 === 0 && i < userIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }

      // Update progress message periodically
      if (statusMessageId && ((sent + failed) % UPDATE_INTERVAL === 0 || i === userIds.length - 1)) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const processed = sent + failed;
        try {
          await telegramRequest(this.token, "editMessageText", {
            chat_id: message.chat.id,
            message_id: statusMessageId,
            text: `📡 <b>BROADCAST EM ANDAMENTO</b>\n\n` +
              `${mediaType} → ${filterText[filter] || filter}\n\n` +
              `${progressBar(processed, total)}\n\n` +
              `✅ Enviados: <b>${sent}</b>\n` +
              `❌ Falhas: <b>${failed}</b>${blocked > 0 ? ` (🚫 ${blocked} bloqueados)` : ""}\n` +
              `📊 Processados: <b>${processed}/${total}</b>\n` +
              `⏱️ Tempo: <b>${elapsed}s</b>`,
            parse_mode: "HTML",
          });
        } catch (_e) {
          // Ignore edit errors (e.g., message not modified)
        }
      }
    }

    // Final summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    const finalText = `📢 <b>BROADCAST CONCLUÍDO!</b>\n\n` +
      `┌ ${mediaType}\n` +
      `├ 🎯 Audiência: <b>${filterText[filter] || filter}</b>\n` +
      `├ ✅ Enviados: <b>${sent}</b>\n` +
      `├ ❌ Falhas: <b>${failed}</b>${blocked > 0 ? ` (🚫 ${blocked} bloqueados)` : ""}\n` +
      `├ 📊 Taxa: <b>${successRate}%</b>\n` +
      `└ ⏱️ Tempo: <b>${totalTime}s</b>\n\n` +
      `${progressBar(total, total)}`;

    if (statusMessageId) {
      try {
        await telegramRequest(this.token, "editMessageText", {
          chat_id: message.chat.id,
          message_id: statusMessageId,
          text: finalText,
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: [[{ text: "🔙 Voltar", callback_data: "admin:menu" }]] },
        });
      } catch (_e) {
        await sendMessage(this.token, message.chat.id, finalText,
          keyboard([btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)])
        );
      }
    } else {
      await sendMessage(this.token, message.chat.id, finalText,
        keyboard([btn("🔙 Voltar", "admin:menu", undefined, EMOJI.BACK)])
      );
    }
  }

  // =============== GROUP GUARD ===============
  async handleNewMember(member: TelegramUser, chatId: number) {
    if (member.is_bot) return;

     // Track new user for analytics
     await this.trackNewUser(member.id);
 
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

    // Track blocked messages only (message logging is in handleMessage now)
    if (isBlocked) {
      await this.supabase.rpc("increment_bot_analytics", {
        p_bot_id: this.bot.id,
        p_blocked_messages: 1,
        p_links_blocked: blockedReason === "link_detected" ? 1 : 0,
        p_spam_detected: blockedReason === "spam_detected" ? 1 : 0,
      });
    }
  }

  // =============== MAIN HANDLER ===============
  async handleUpdate() {
    const { update } = this;
    const updateId = update.update_id;

    // ========== PROTEÇÃO CONTRA DUPLICATAS ==========
    // Verifica se já processamos este update_id para evitar loops
    const { data: existing } = await this.supabase
      .from("processed_updates")
      .select("id")
      .eq("update_id", updateId)
      .eq("bot_id", this.bot.id)
      .single();

    if (existing) {
      console.log(`Update ${updateId} already processed, skipping duplicate`);
      return;
    }

    // Marcar como processado ANTES de executar (evita race conditions)
    await this.supabase.from("processed_updates").insert({
      update_id: updateId,
      bot_id: this.bot.id
    });
    // ================================================

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

    // ===== ANALYTICS: Track ALL incoming messages =====
    try {
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
        is_blocked: false,
        blocked_reason: null,
      });

      await this.supabase.rpc("increment_bot_analytics", {
        p_bot_id: this.bot.id,
        p_messages_received: 1,
      });

      console.log(`Analytics: Message tracked - bot ${this.bot.id}, chat ${message.chat.type}`);
    } catch (error) {
      console.error("Error tracking message:", error);
    }
    // ================================================

    const text = message.text || "";

    // Handle group messages
    if (message.chat.type !== "private") {
      if (message.new_chat_members) {
        for (const member of message.new_chat_members) {
          await this.handleNewMember(member, chatId);
        }
      }

      // AUTO-DETECT GROUP: If no group is configured yet and an owner sends a message, auto-configure
      const isOwner = this.isOwner(telegramUserId);
      
      if (!this.settings.group_chat_id && isOwner) {
        // Auto-configure this group
        const groupTitle = message.chat.title || "Grupo";
        const groupUsername = (message.chat as { username?: string }).username;
        const groupUrl = groupUsername ? `https://t.me/${groupUsername}` : null;
        
        // Try to get group photo
        let groupPhotoUrl: string | null = null;
        try {
          const chatInfo = await telegramRequest(this.token, "getChat", { chat_id: chatId });
          if (chatInfo.ok && (chatInfo.result as { photo?: { big_file_id?: string } })?.photo?.big_file_id) {
            const fileId = (chatInfo.result as { photo: { big_file_id: string } }).photo.big_file_id;
            const fileInfo = await telegramRequest(this.token, "getFile", { file_id: fileId });
            if (fileInfo.ok && (fileInfo.result as { file_path?: string })?.file_path) {
              const filePath = (fileInfo.result as { file_path: string }).file_path;
              groupPhotoUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
            }
          }
        } catch (e) {
          console.error("Error fetching group photo:", e);
        }
        
        await this.supabase
          .from("bot_settings")
          .update({ 
            group_chat_id: chatId,
            group_url: groupUrl,
            group_title: groupTitle,
            group_photo_url: groupPhotoUrl,
          })
          .eq("bot_id", this.bot.id);
        
        // Update local settings
        this.settings.group_chat_id = chatId;
        this.settings.group_url = groupUrl;
        
        console.log(`AUTO-DETECT: Group ${chatId} (${groupTitle}) configured automatically`);
        
        await sendMessage(this.token, chatId,
          `✅ <b>Grupo Detectado!</b>\n\n` +
          `📍 <b>Grupo:</b> ${groupTitle}\n` +
          `🆔 <b>ID:</b> <code>${chatId}</code>\n` +
          `🔗 <b>Link:</b> ${groupUrl || "Não disponível"}\n\n` +
          `O Fiscal de Grupo agora está ativo aqui!`
        );
      }

      // FISCAL DE GRUPO: Check if user can send messages in configured group
      const isConfiguredGroup = this.settings.group_chat_id && chatId === this.settings.group_chat_id;
      
      if (isConfiguredGroup && this.settings.mute_new_members && !isOwner) {
        const isActive = await this.isSubscriptionActive(telegramUserId, 'group');
        
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
        const isActive = await this.isSubscriptionActive(telegramUserId, 'group');
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
      if (!await isQueryTypeEnabled(queryType, this.supabase)) {
        console.log(`Stored query state blocked for disabled type "${queryType}". Ignoring silently.`);
        return;
      }
      const userFirstName = message.from?.first_name || 'usuário';
      await this.processQuery(chatId, telegramUserId, queryType, text, estado, userFirstName);
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
      await this.showMainMenu(chatId, telegramUserId, undefined, 'private');
      return;
    }

    if (text === "/cancelar") {
      await this.clearConversationState(telegramUserId);
      await sendMessage(this.token, chatId, "❌ Operação cancelada.",
        keyboard([btn("🔙 Menu Principal", "menu:main", undefined, EMOJI.HOME)]));
      return;
    }

    if (text.startsWith("/comandos")) {
      await this.showAvailableCommands(chatId);
      return;
    }

    // Handle query commands in private chat (e.g. /cpffull 12345678900)
    if (text.startsWith("/")) {
      const parsed = this.parseMultipleCommands(text);
      if (parsed.length > 0) {
        // Check subscription or owner
        const isOwner = this.isOwner(telegramUserId);
        const isActive = await this.isSubscriptionActive(telegramUserId, 'private');
        if (!isOwner && !isActive) {
          await sendMessage(this.token, chatId,
            "⚠️ <b>Você não possui uma assinatura ativa.</b>\n\nUse /start para ver os planos disponíveis.",
            undefined, { parse_mode: "HTML" });
          return;
        }
        await this.handleMultipleQueries(message, parsed);
        return;
      }

      // Single command without value — show usage hint
      const cmdMatch = text.match(/^\/(\w+)/);
      if (cmdMatch) {
        const cmd = cmdMatch[1].toLowerCase().split("@")[0];
        const commandMap: Record<string, string> = {
          cpf: "cpf", cpffull: "cpffull", cpfisk: "cpf-isk",
          cnpj: "cnpj-cred", placa: "placa", placa2: "placa-serpro",
          telefone: "telefone", telefonefull: "telefonefull", tel: "telefone",
          email: "email", emailfull: "emailfull",
          cep: "cep", cepfull: "cepfull", nome: "nome", nomefull: "nomefull",
          score: "score", rg: "rg", cnh: "cnh", pix: "pix",
          foto: "foto", nacional: "foto",
          titulo: "titulo", endereco: "endereco", renda: "renda",
          processos: "processos", bnmp: "bnmp-lc", siel: "siel",
          tse: "tse-3", mae: "mae", maefull: "maefull", credilink: "credilink",
          spc: "cpf-spc", poder: "poderaquisitivo", sus: "cpfsus", pis: "pis",
          parentes: "parentes", chassi: "chassi", renavam: "renavam", motor: "motor",
          rg3: "rg-3", pis3: "pis-3", cep3: "cep-3", email3: "email-3",
          nome3: "nome-3", score3: "score-3", parentes3: "parentes-3", telefone3: "telefone-3",
        };
        if (commandMap[cmd]) {
          await sendMessage(this.token, chatId,
            `⚠️ <b>Você deve preencher os dados corretamente</b>\n\nExemplo: <code>/${cmd} valor</code>`,
            undefined, { parse_mode: "HTML" });
          return;
        }
      }
    }

    // Default: show main menu
    if (this.settings.terms_enabled) {
      const accepted = await this.getTermsStatus(telegramUserId);
      if (!accepted) {
        await this.showTerms(chatId);
        return;
      }
    }
    await this.showMainMenu(chatId, telegramUserId, undefined, 'private');
  }

  // =============== PARSE MULTIPLE COMMANDS ===============
  private parseMultipleCommands(text: string): Array<{ command: string; queryType: string; queryInput: string }> {
    const commandMap: Record<string, string> = {
      cpf: "cpf", cpffull: "cpffull", cpfisk: "cpf-isk",
      cnpj: "cnpj-cred", placa: "placa", placa2: "placa-serpro",
      placasimples: "placa-simples", placasesp: "placa-sesp",
      telefone: "telefone", telefonefull: "telefonefull", tel: "telefone",
      email: "email", emailfull: "emailfull",
      cep: "cep", cepfull: "cepfull", nome: "nome", nomefull: "nomefull",
      score: "score", rg: "rg", cnh: "cnh", pix: "pix",
      foto: "foto", nacional: "foto",
      titulo: "titulo", endereco: "endereco", renda: "renda",
      processos: "processos", bnmp: "bnmp-lc", siel: "siel",
      tse: "tse-3", mae: "mae", maefull: "maefull", credilink: "credilink",
      spc: "cpf-spc", poder: "poderaquisitivo", sus: "cpfsus", pis: "pis",
      parentes: "parentes", chassi: "chassi", renavam: "renavam", motor: "motor",
      rg3: "rg-3", pis3: "pis-3", cep3: "cep-3", email3: "email-3",
      nome3: "nome-3", score3: "score-3", parentes3: "parentes-3", telefone3: "telefone-3",
    };
    
    const commands: Array<{ command: string; queryType: string; queryInput: string }> = [];
    
    const commandPattern = /(?:^|\s)(\/(?:cpf(?:full|isk|sus)?|cnpj|placa(?:2|simples|sesp)?|telefone(?:full|3)?|tel|email(?:full|3)?|cep(?:full|3)?|nome(?:full|3)?|score3?|rg3?|cnh|pis3?|pix|foto\w*|nacional|titulo|endereco|renda|processos|bnmp|siel|tse|mae(?:full)?|credilink|spc|poder|sus|parentes3?|chassi|renavam|motor)(?:@\w+)?)/gi;
    const matches = [...text.matchAll(commandPattern)];
    
    if (matches.length === 0) return commands;
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const fullCommand = match[1].trim();
      const commandStart = match.index! + (match[0].startsWith(' ') ? 1 : 0);
      
      // Find where this command's input ends (at the next command or end of string)
      const nextCommandStart = (i + 1 < matches.length) ? matches[i + 1].index! : text.length;
      
      // Extract the full segment for this command
      const segment = text.substring(commandStart, nextCommandStart).trim();
      const segmentParts = segment.split(/\s+/);
      
      const command = segmentParts[0].toLowerCase().replace("/", "").split("@")[0];
      const queryInput = segmentParts.slice(1).join(" ").trim();
      const queryType = commandMap[command];
      
      if (queryType && queryInput) {
        commands.push({ command, queryType, queryInput });
      }
    }
    
    return commands;
  }

  // =============== MAX CONCURRENT QUERIES ===============
  private readonly MAX_CONCURRENT_QUERIES = 5;

  // =============== HANDLE MULTIPLE QUERIES ===============
  private async handleMultipleQueries(
    message: TelegramMessage,
    commands: Array<{ command: string; queryType: string; queryInput: string }>
  ) {
    const chatId = message.chat.id;
    const telegramUserId = message.from!.id;
    const replyToId = message.message_id;
    const userFirstName = message.from?.first_name || 'Usuário';
    
    // Limit check message
    const isLimited = commands.length >= this.MAX_CONCURRENT_QUERIES;
    const processingText = `⏳ <b>Processando ${commands.length} consulta${commands.length > 1 ? 's' : ''} simultâneas...</b>` +
      (isLimited ? `\n\n⚠️ Limite de ${this.MAX_CONCURRENT_QUERIES} consultas por mensagem.` : '');
    
    const processingMsg = await telegramRequest(this.token, "sendMessage", {
      chat_id: chatId,
      text: processingText,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
    });
    
    logCmd('INFO', 'MULTI_QUERY', { userId: telegramUserId, count: commands.length, cmds: commands.map(c => `${c.queryType}:${c.queryInput.substring(0,15)}`).join(',') });
    
    // Execute all queries in parallel
    const queryPromises = commands.map(async (cmd, index) => {
      try {
        const { data: result, fromCache } = await executeQueryWithCache(cmd.queryType, cmd.queryInput);
        
        // Log query (respects cache)
        await this.logQuery(telegramUserId, cmd.queryType, cmd.queryInput, result, fromCache);
        
        return { index, success: true, result, cmd, fromCache };
      } catch (error) {
        logCmd('ERROR', 'MULTI_QUERY_ITEM', { index, queryType: cmd.queryType, input: cmd.queryInput.substring(0,15), error: (error as Error).message });
        return { index, success: false, error, cmd, fromCache: false };
      }
    });
    
    const results = await Promise.all(queryPromises);
    
    // Delete processing message
    if (processingMsg.ok && processingMsg.result) {
      const msgResult = processingMsg.result as { message_id: number };
      try {
        await deleteMessage(this.token, chatId, msgResult.message_id);
      } catch (_e) { /* ignore */ }
    }
    
    // Send results one by one (to avoid telegram limits)
    for (const r of results) {
      if (r.success && r.result) {
        const formattedResult = formatQueryResult(r.cmd.queryType, r.result, this.bot.bot_username, userFirstName);
        
        // Check for photo - deep extraction
        const fotoUrl = deepExtractPhoto(r.result);
        const isValidPhotoUrl = fotoUrl && typeof fotoUrl === 'string' && 
          (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));
        
        const cacheIndicator = r.fromCache ? ' ⚡' : '';
        const headerLabel = queryTypeLabels[r.cmd.queryType] || r.cmd.queryType.toUpperCase();
        const resultHeader = `📊 <b>${headerLabel}${cacheIndicator}</b>\n\n`;
        
        if (isValidPhotoUrl) {
          const caption = (resultHeader + formattedResult).substring(0, 1024);
          await telegramRequest(this.token, "sendPhoto", {
            chat_id: chatId,
            photo: fotoUrl,
            caption,
            parse_mode: "HTML",
            reply_markup: keyboard([btn("🗑️ Apagar", "delete_msg")]),
          });
        } else {
          await sendLongMessagePaginated(this.token, chatId, resultHeader + formattedResult, this.supabase, undefined, undefined, r.cmd.queryType, r.cmd.queryInput);
        }
      } else {
        await telegramRequest(this.token, "sendMessage", {
          chat_id: chatId,
          text: `❌ <b>Erro na consulta</b>\n\nTipo: ${r.cmd.queryType.toUpperCase()}\nValor: <code>${r.cmd.queryInput}</code>`,
          parse_mode: "HTML",
        });
      }
    }
  }

  // =============== GROUP COMMAND HANDLER ===============
  async handleGroupCommand(message: TelegramMessage, text: string) {
    const chatId = message.chat.id;
    const telegramUserId = message.from!.id;
    const replyToId = message.message_id;

    // Check maintenance mode - silently ignore all query commands
    if (this.settings.maintenance_mode) {
      logCmd('INFO', 'CMD_BLOCKED', { reason: 'maintenance', chatId, userId: telegramUserId, cmd: text.substring(0, 40) });
      return;
    }

    // /comandos in group
    const groupCommand = text.trim().split(/\s+/)[0].toLowerCase().replace("/", "").split("@")[0];
    if (groupCommand === "comandos") {
      await this.showAvailableCommands(chatId);
      return;
    }

    // Check for multiple commands in the same message
    const multipleCommands = this.parseMultipleCommands(text);
    
    if (multipleCommands.length > 1) {
      // Filter out disabled modules BEFORE processing
      const enabledChecks = await Promise.all(multipleCommands.map(async cmd => ({ cmd, enabled: await isQueryTypeEnabled(cmd.queryType, this.supabase) })));
      const enabledCommands = enabledChecks.filter(c => c.enabled).map(c => c.cmd);
      if (enabledCommands.length === 0) {
        console.log(`Group multi-query: all ${multipleCommands.length} modules disabled. Ignoring silently.`);
        return;
      }
      await this.handleMultipleQueries(message, enabledCommands.slice(0, this.MAX_CONCURRENT_QUERIES));
      return;
    }

    // Single command - original logic
    // Parse command: /cpf 12345678900 or /cpf
    const parts = text.trim().split(/\s+/);
    const command = parts[0].toLowerCase().replace("/", "").split("@")[0]; // Remove @botusername
    const queryInput = parts.slice(1).join(" ");

    // Map commands to query types
    // Map for state-specific foto commands: /fotosp, /fotorj, /fotomg, etc.
    const fotoStateCommandMap: Record<string, string> = {
      fotosp: "SP", fotorj: "RJ", fotomg: "MG", fotoba: "BA",
      fotoce: "CE", fotogo: "GO", fotopr: "PR", fotors: "RS",
      fotope: "PE", fotoma: "MA", fotoes: "ES", fotodf: "DF", fototo: "TO",
    };

    const commandMap: Record<string, string> = {
      cpf: "cpf", cpffull: "cpffull", cpfisk: "cpf-isk",
      cnpj: "cnpj-cred", placa: "placa", placa2: "placa-serpro",
      placasimples: "placa-simples", placasesp: "placa-sesp",
      telefone: "telefone", telefonefull: "telefonefull", tel: "telefone",
      email: "email", emailfull: "emailfull",
      cep: "cep", cepfull: "cepfull", nome: "nome", nomefull: "nomefull",
      score: "score", rg: "rg", cnh: "cnh", pix: "pix",
      foto: "foto", nacional: "foto",
      titulo: "titulo", endereco: "endereco", renda: "renda",
      processos: "processos", bnmp: "bnmp-lc", siel: "siel",
      tse: "tse-3", mae: "mae", maefull: "maefull", credilink: "credilink",
      spc: "cpf-spc", poder: "poderaquisitivo", sus: "cpfsus", pis: "pis",
      parentes: "parentes", chassi: "chassi", renavam: "renavam", motor: "motor",
      rg3: "rg-3", pis3: "pis-3", cep3: "cep-3", email3: "email-3",
      nome3: "nome-3", score3: "score-3", parentes3: "parentes-3", telefone3: "telefone-3",
      // State-specific foto shortcuts
      ...Object.fromEntries(Object.keys(fotoStateCommandMap).map(k => [k, "foto"])),
    };

    const queryType = commandMap[command];
    // If command is a state-specific foto shortcut, pre-set the state
    const fotoStateFromCommand = fotoStateCommandMap[command];

    if (!queryType) {
      // Not a query command, ignore
      return;
    }

    // Check if module is enabled FIRST - before any response
    if (!await isQueryTypeEnabled(queryType, this.supabase)) {
      logCmd('INFO', 'CMD_BLOCKED', { reason: 'disabled', queryType, chatId, userId: telegramUserId });
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
        foto: "/foto CPF ou /foto SP CPF ou /fotosp CPF",
        titulo: "/titulo 12345678900",
        endereco: "/endereco 12345678900",
        renda: "/renda 12345678900",
        processos: "/processos 12345678900",
        bnmp: "/bnmp 12345678900",
        siel: "/siel 12345678900",
        tse: "/tse 12345678900",
        mae: "/mae 12345678900",
        credilink: "/credilink 12345678900",
        cpf_spc: "/spc 12345678900",
        poderaquisitivo: "/poder 12345678900",
        cpfsus: "/sus 12345678900",
        pis: "/pis 12345678900",
        parentes: "/parentes 12345678900",
        chassi: "/chassi CHASSI123",
        renavam: "/renavam 12345678900",
        motor: "/motor MOTOR123",
      };

      await telegramRequest(this.token, "sendMessage", {
        chat_id: chatId,
        text: `⚠️ <b>Você deve preencher os dados corretamente</b>\n\nExemplo: <code>${examples[queryType] || `/${command} valor`}</code>`,
        parse_mode: "HTML",
        reply_to_message_id: replyToId,
      });
      return;
    }

    // For foto, check if state is provided (optional now)
    // Format: /foto 12345678900 (all states) or /foto SP 12345678900 (specific state)
    let estado: string | undefined = fotoStateFromCommand; // Pre-set from /fotosp, /fotorj, etc.
    let actualInput = queryInput;
    
    if (queryType === "foto" && !estado) {
      const inputParts = queryInput.split(/\s+/);
      
      // Check if first part is a state code (2 letters)
      if (inputParts.length >= 2 && inputParts[0].length === 2 && brazilianStates.includes(inputParts[0].toUpperCase())) {
        // Format: /foto SP 12345678900
        estado = inputParts[0].toUpperCase();
        actualInput = inputParts.slice(1).join(" ");
      } else if (inputParts.length >= 2 && inputParts[inputParts.length - 1].length === 2 && brazilianStates.includes(inputParts[inputParts.length - 1].toUpperCase())) {
        // Format: /foto 12345678900 SP
        estado = inputParts[inputParts.length - 1].toUpperCase();
        actualInput = inputParts.slice(0, -1).join(" ");
      }
      // If no state found, estado remains undefined - will search all states
    }

    // Use actualInput for foto queries (CPF extracted from format)
    const inputForQuery = queryType === "foto" ? actualInput : queryInput;

    // Send processing message - show if searching all states
    const searchingAllStates = queryType === "foto" && !estado;
    const processingMsg = await telegramRequest(this.token, "sendMessage", {
      chat_id: chatId,
      text: searchingAllStates 
        ? `⏳ <b>Buscando foto em todos os estados...</b>\n\nIsso pode levar alguns segundos.`
        : `⏳ <b>Consultando ${queryTypeLabels[queryType] || queryType}...</b>`,
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
    });

    try {
      const { data: result, fromCache } = await executeQueryWithCache(queryType, inputForQuery, estado);
      
      // Log query - passa fromCache para evitar duplicação de créditos
      await this.logQuery(telegramUserId, queryType, inputForQuery, result, fromCache);

      // Delete processing message
      if (processingMsg.ok && processingMsg.result) {
        const msgResult = processingMsg.result as { message_id: number };
        try {
          await deleteMessage(this.token, chatId, msgResult.message_id);
        } catch (_e) { /* ignore */ }
      }

      // Criar footer com informações da consulta
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const userInfo = message.from;
      const userName = userInfo?.first_name || 'Usuário';
      const userIdDisplay = userInfo?.id || telegramUserId;
      const userPhone = userInfo?.username ? `@${userInfo.username}` : `ID: ${userIdDisplay}`;
      
      const consultaFooter = `\n\n📋 <b>Consulta solicitada por:</b>\n├ 📝 @${userIdDisplay}\n├ 📞 ${userPhone}\n└ 🕐 ${dateStr}, ${timeStr}`;

      // VERIFICAR SE É RESULTADO DE CEP OU TELEFONE COM MÚLTIPLOS REGISTROS
      const rawDataStr = typeof result.data === 'string' ? result.data : '';
      if ((queryType === 'cep' || queryType === 'telefone') && rawDataStr && isMultiPersonResult(rawDataStr)) {
        const records = parseMultiplePersonRecords(rawDataStr);
        
        if (records.length > 1) {
          const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);
          
          if (records.length > RECORDS_PER_PAGE) {
            // Precisa de paginação - salvar registros no banco
            const { data: paginationData, error } = await this.supabase
              .from("paginated_results")
              .insert({
                chat_id: chatId,
                pages: records, // Salvar registros como JSON
                current_page: 0,
                total_pages: totalPages,
              })
              .select("id")
              .single();
            
            if (error || !paginationData) {
              console.error(`Failed to create ${queryType} pagination record:`, error);
              // Fallback: enviar primeira página sem paginação
              const pageText = formatMultiPersonPage(records, 0, totalPages, this.bot.bot_username, userName, queryType, queryInput) + consultaFooter;
              await sendLongMessagePaginated(this.token, chatId, pageText, this.supabase, replyToId, undefined, queryType, queryInput);
              return;
            }
            
            const paginationId = paginationData.id;
            const pageText = formatMultiPersonPage(records, 0, totalPages, this.bot.bot_username, userName, queryType, queryInput) + consultaFooter;
            const pageKeyboard = createMultiPersonKeyboard(records, 0, totalPages, paginationId, queryType, queryInput);
            
            const msgResult = await telegramRequest(this.token, "sendMessage", {
              chat_id: chatId,
              text: pageText,
              parse_mode: "HTML",
              reply_to_message_id: replyToId,
              reply_markup: pageKeyboard,
            });
            
            // Atualizar message_id no banco
            if (msgResult.ok && msgResult.result) {
              const resultMessage = msgResult.result as { message_id?: number };
              if (resultMessage.message_id) {
                await this.supabase
                  .from("paginated_results")
                  .update({ message_id: resultMessage.message_id })
                  .eq("id", paginationId);
              }
            }
          } else {
            // Menos de 10 registros - enviar sem paginação mas com botões de CPF
            const pageText = formatMultiPersonPage(records, 0, 1, this.bot.bot_username, userName, queryType, queryInput) + consultaFooter;
            const pageKeyboard = createMultiPersonKeyboard(records, 0, 1, undefined, queryType, queryInput);
            
            await telegramRequest(this.token, "sendMessage", {
              chat_id: chatId,
              text: pageText,
              parse_mode: "HTML",
              reply_to_message_id: replyToId,
              reply_markup: pageKeyboard,
            });
          }
          
          return;
        }
      }

      // Format and send result - usar nome do perfil do Telegram do usuário
      const formattedResult = formatQueryResult(queryType, result, this.bot.bot_username, userName);

      // Check for photo - deep extraction from nested API response
      const fotoUrl = deepExtractPhoto(result);
      
      const isValidPhotoUrl = fotoUrl && typeof fotoUrl === 'string' && 
        (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));

      // Detectar UF para botão de foto (igual ao processQuery)
      const isPhotoQuery = queryType === 'foto' || queryType.startsWith('foto');
      let detectedUf: string | null = null;
      let showFotoButton = false;
      if (!isPhotoQuery) {
        detectedUf = extractUfFromResult((result as Record<string, unknown>).data ?? result);
        if (detectedUf && detectedUf in ufToFotoModule) {
          showFotoButton = true;
          logCmd('INFO', 'UF_DETECTED_GROUP', { queryType, uf: detectedUf, input: inputForQuery.substring(0, 15) });
        }
      }

      // Montar botões extras (foto)
      const extraButtons: InlineButton[][] = [];
      if (showFotoButton && detectedUf) {
        extraButtons.push([btn(`📸 Consultar Foto (${detectedUf})`, `foto_query:${detectedUf}:${inputForQuery.replace(/\D/g, '')}`)]);
      }

      let resultMessageId: number | undefined;
      let photoMessageId: number | undefined;
      
      if (isValidPhotoUrl) {
        // Tentar enviar tudo em uma mensagem só (foto + dados + footer)
        const fullCaption = formattedResult + consultaFooter;
        
        // Montar botões para foto
        const photoButtons: InlineButton[][] = [
          [btn("🗑️ Apagar", "delete_msg")],
          [btn("📄 Baixar PDF", `pdf:${queryType}:${queryInput}`)],
        ];
        if (showFotoButton && detectedUf) {
          photoButtons.push([btn(`📸 Consultar Foto (${detectedUf})`, `foto_query:${detectedUf}:${inputForQuery.replace(/\D/g, '')}`)]);
        }
        
        if (fullCaption.length <= 1024) {
          const sentPhoto = await telegramRequest(this.token, "sendPhoto", {
            chat_id: chatId,
            photo: fotoUrl,
            caption: fullCaption,
            parse_mode: "HTML",
            reply_to_message_id: replyToId,
            reply_markup: keyboard(...photoButtons),
          });
          if (sentPhoto.ok && sentPhoto.result) {
            photoMessageId = (sentPhoto.result as { message_id?: number }).message_id;
          } else {
            console.error("sendPhoto failed for query result:", sentPhoto);
            const paginatedResult = await sendLongMessagePaginated(this.token, chatId, fullCaption, this.supabase, replyToId, undefined, queryType, queryInput, extraButtons);
            if (paginatedResult.ok && paginatedResult.result) {
              resultMessageId = (paginatedResult.result as { message_id?: number }).message_id;
            }
          }
        } else {
          const simpleCaption = `📷 <b>FOTO ENCONTRADA</b>\n\n✅ Consulta: ${queryType.toUpperCase()}\n\n<b>OBRIGADO POR UTILIZAR NOSSOS SERVIÇOS</b> ❤️\n@${this.bot.bot_username || 'SEGREDOPUXADASBOT'}${consultaFooter}`;
          
          const sentPhoto = await telegramRequest(this.token, "sendPhoto", {
            chat_id: chatId,
            photo: fotoUrl,
            caption: simpleCaption.substring(0, 1024),
            parse_mode: "HTML",
            reply_to_message_id: replyToId,
            reply_markup: keyboard(...photoButtons),
          });

          if (sentPhoto.ok && sentPhoto.result) {
            photoMessageId = (sentPhoto.result as { message_id?: number }).message_id;
          } else {
            console.error("sendPhoto failed for query result:", sentPhoto);
          }
          
          const paginatedResult = await sendLongMessagePaginated(this.token, chatId, formattedResult + consultaFooter, this.supabase, replyToId, undefined, queryType, queryInput, extraButtons);
          if (paginatedResult.ok && paginatedResult.result) {
            resultMessageId = (paginatedResult.result as { message_id?: number }).message_id;
          }
        }
      } else {
        // Sem foto - Enviar resultado com paginação e botão de foto se UF detectado
        const paginatedResult = await sendLongMessagePaginated(this.token, chatId, formattedResult + consultaFooter, this.supabase, replyToId, undefined, queryType, queryInput, extraButtons);
        if (paginatedResult.ok && paginatedResult.result) {
          resultMessageId = (paginatedResult.result as { message_id?: number }).message_id;
        }
      }
      
      // Adicionar reação positiva às mensagens de resultado (se configurado)
      if (this.settings.react_to_messages && !result.error && !result.notFound) {
        try {
          const emoji = chooseReactionEmoji(this.settings);
          // Reagir na foto (se houver)
          if (photoMessageId) {
            await setMessageReaction(this.token, chatId, photoMessageId, emoji);
          }
          // Reagir na mensagem de dados
          if (resultMessageId) {
            await setMessageReaction(this.token, chatId, resultMessageId, emoji);
          }
        } catch (reactionErr) {
          console.log("Could not add reaction to group message:", reactionErr);
        }
      }
    } catch (error) {
      logCmd('ERROR', 'GROUP_QUERY', { queryType, input: queryInput?.substring(0, 20), chatId, userId: telegramUserId, error: (error as Error).message, stack: (error as Error).stack?.substring(0, 200) });
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

    logCmd('INFO', 'CALLBACK', { userId: telegramUserId, chatId, data: data.substring(0, 60), username: callback.from.username });

    if (!chatId || !messageId) return;

    await answerCallback(this.token, callback.id);

    // Delete message button handler
    if (data === "delete_msg") {
      try {
        await deleteMessage(this.token, chatId, messageId);
      } catch (_e) { /* ignore */ }
      return;
    }

    // Show commands button handler
    if (data === "show_commands") {
      await this.showAvailableCommands(chatId);
      return;
    }

    // Pagination handlers
    if (data.startsWith("page:")) {
      const parts = data.split(":");
      if (parts.length === 3) {
        const paginationId = parts[1];
        const targetPage = parseInt(parts[2], 10);
        await this.handlePagination(chatId, messageId, paginationId, targetPage);
      }
      return;
    }

    if (data.startsWith("page_delete:")) {
      const paginationId = data.replace("page_delete:", "");
      // Deletar registro de paginação e mensagem
      await this.supabase.from("paginated_results").delete().eq("id", paginationId);
      try {
        await deleteMessage(this.token, chatId, messageId);
      } catch (_e) { /* ignore */ }
      return;
    }

    if (data === "noop") {
      // Botão de indicador de página - não faz nada
      return;
    }

    // CEP multi-person pagination
    if (data.startsWith("cep_page:")) {
      const parts = data.split(":");
      if (parts.length === 3) {
        const paginationId = parts[1];
        const targetPage = parseInt(parts[2], 10);
        await this.handleMultiPersonPagination(chatId, messageId, paginationId, targetPage, "cep");
      }
      return;
    }

    // Phone (telefone) multi-person pagination
    if (data.startsWith("tel_page:")) {
      const parts = data.split(":");
      if (parts.length === 3) {
        const paginationId = parts[1];
        const targetPage = parseInt(parts[2], 10);
        await this.handleMultiPersonPagination(chatId, messageId, paginationId, targetPage, "telefone");
      }
      return;
    }

    // Quick CPF query from CEP results
    if (data.startsWith("qcpf:")) {
      if (!await isQueryTypeEnabled("cpf", this.supabase)) {
        console.log(`Quick CPF callback blocked because module "cpf" is disabled.`);
        return;
      }

      const cpf = data.replace("qcpf:", "");
      const telegramUserName = callback.from?.first_name || 'usuário';
      
      // Send loading message
      await editMessage(this.token, chatId, messageId, 
        `⏳ <b>Consultando CPF...</b>\n\n<code>${cpf}</code>`,
        undefined
      );
      
      try {
        const { data: result, fromCache } = await executeQueryWithCache("cpf", cpf);
        
        // Log query - passa fromCache para evitar duplicação de créditos
        await this.logQuery(telegramUserId, "cpf", cpf, result, fromCache);
        
        // Format result
        const formattedResult = formatQueryResult("cpf", result, this.bot.bot_username, telegramUserName);
        
        // Send result with pagination
        await sendLongMessagePaginated(this.token, chatId, formattedResult, this.supabase, undefined, undefined, "cpf", cpf);
        
        // Delete the loading message
        try {
          await deleteMessage(this.token, chatId, messageId);
        } catch (_e) { /* ignore */ }
      } catch (error) {
        logCmd('ERROR', 'QUICK_CPF', { cpf: cpf.substring(0, 6) + '...', chatId, error: (error as Error).message });
        await editMessage(this.token, chatId, messageId,
          "❌ <b>Erro na consulta de CPF</b>\n\nTente novamente.",
          keyboard([btn("🗑️ Apagar", "delete_msg")])
        );
      }
      return;
    }

    // Quick Foto query from result buttons (📸 Consultar Foto)
    if (data.startsWith("foto_query:")) {
      const parts = data.replace("foto_query:", "").split(":");
      const uf = parts[0];
      const cpf = parts[1];
      
      if (!uf || !cpf) return;
      
      const fotoModule = ufToFotoModule[uf.toUpperCase()];
      if (!fotoModule) {
        await sendMessage(this.token, chatId, "❌ Estado não suportado para busca de foto.");
        return;
      }
      
      if (!await isQueryTypeEnabled(fotoModule, this.supabase)) {
        await sendMessage(this.token, chatId, `⚠️ Módulo <code>${fotoModule}</code> está desativado.`);
        return;
      }
      
      const telegramUserName = callback.from?.first_name || 'usuário';
      
      await sendMessage(this.token, chatId, `⏳ <b>Buscando foto (${uf})...</b>\n\n<code>${cpf}</code>`);
      
      try {
        const { data: result, fromCache } = await executeQueryWithCache(fotoModule, cpf);
        await this.logQuery(telegramUserId, fotoModule, cpf, result, fromCache);
        
        const fotoUrl = deepExtractPhoto(result);
        const isValidPhoto = fotoUrl && typeof fotoUrl === 'string' && 
          (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));
        
        if (isValidPhoto) {
          const actionButtons: InlineButton[][] = [
            [btn("🔍 Nova Consulta", "menu:query"), btn("🏠 Menu", "menu:main", undefined, EMOJI.HOME)],
            [btn("🗑️ Apagar", "delete_msg")],
            [btn("📄 Baixar PDF", `pdf:${fotoModule}:${cpf}`)]
          ];
          
          await telegramRequest(this.token, "sendPhoto", {
            chat_id: chatId,
            photo: fotoUrl,
            caption: `📸 <b>Foto encontrada (${uf})</b>\n\n👤 CPF: <code>${cpf}</code>`,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: actionButtons },
          });
        } else {
          await sendMessage(this.token, chatId,
            `📸 <b>Foto não encontrada (${uf})</b>\n\n👤 CPF: <code>${cpf}</code>\n\n💡 Tente a busca nacional: <code>/foto ${cpf}</code>`,
            keyboard([btn("🔍 Nova Consulta", "menu:query"), btn("🗑️ Apagar", "delete_msg")])
          );
        }
      } catch (error) {
        logCmd('ERROR', 'FOTO_QUERY', { uf, cpf: cpf.substring(0, 6) + '...', chatId, error: (error as Error).message });
        await sendMessage(this.token, chatId,
          "❌ <b>Erro ao buscar foto</b>\n\nTente novamente.",
          keyboard([btn("🗑️ Apagar", "delete_msg")])
        );
      }
      return;
    }

    // PDF Download handler
    if (data.startsWith("pdf:")) {
      const parts = data.replace("pdf:", "").split(":");
      const queryType = parts[0];
      const queryInput = parts.slice(1).join(":");
      
      if (!queryType || !queryInput) {
        await answerCallback(this.token, callback.id);
        return;
      }

      if (!await isQueryTypeEnabled(queryType, this.supabase)) {
        console.log(`PDF callback blocked because module "${queryType}" is disabled.`);
        return;
      }
      
      // Send loading message
      await editMessage(this.token, chatId, messageId, 
        `📄 <b>Gerando PDF...</b>\n\nAguarde um momento.`,
        undefined
      );
      
      try {
        // Re-execute query to get data for PDF (usa cache - não conta crédito)
        const { data: result } = await executeQueryWithCache(queryType, queryInput);
        
        // Call PDF generation function
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            queryType,
            queryInput,
            data: result,
            botName: this.bot.bot_username || "Telegram Bot",
          }),
        });
        
        const pdfResult = await response.json();
        
        if (pdfResult.success && pdfResult.pdf) {
          // Convert base64 to bytes and send as document
          const pdfBytes = Uint8Array.from(atob(pdfResult.pdf), c => c.charCodeAt(0));
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          // Create FormData for file upload
          const form = new FormData();
          form.set("chat_id", String(chatId));
          form.set("document", new File([blob], pdfResult.filename || `consulta_${queryType}.pdf`, { type: 'application/pdf' }));
          form.set("caption", `📄 <b>Relatório de Consulta</b>\n\n📊 Tipo: ${queryType.toUpperCase()}\n🔍 Consulta: <code>${queryInput}</code>\n\n🤖 @${this.bot.bot_username || 'bot'}`);
          form.set("parse_mode", "HTML");
          
          const sendDocResult = await fetch(`${TELEGRAM_API}${this.token}/sendDocument`, {
            method: "POST",
            body: form,
          });
          
          const docResponse = await sendDocResult.json();
          
          if (docResponse.ok) {
            // Delete loading message
            try {
              await deleteMessage(this.token, chatId, messageId);
            } catch (_e) { /* ignore */ }
          } else {
            console.error("Failed to send PDF document:", docResponse);
            await editMessage(this.token, chatId, messageId,
              "❌ <b>Erro ao enviar PDF</b>\n\nTente novamente.",
              keyboard([btn("🗑️ Apagar", "delete_msg")])
            );
          }
        } else {
          console.error("PDF generation failed:", pdfResult);
          await editMessage(this.token, chatId, messageId,
            "❌ <b>Erro ao gerar PDF</b>\n\nTente novamente.",
            keyboard([btn("🗑️ Apagar", "delete_msg")])
          );
        }
      } catch (error) {
        console.error("PDF generation error:", error);
        await editMessage(this.token, chatId, messageId,
          "❌ <b>Erro ao gerar PDF</b>\n\nTente novamente.",
          keyboard([btn("🗑️ Apagar", "delete_msg")])
        );
      }
      return;
    }

    // TXT Download handler
    if (data.startsWith("txt:")) {
      const parts = data.replace("txt:", "").split(":");
      const queryType = parts[0];
      const queryInput = parts.slice(1).join(":");
      
      if (!queryType || !queryInput) {
        await answerCallback(this.token, callback.id);
        return;
      }

      if (!await isQueryTypeEnabled(queryType, this.supabase)) {
        console.log(`TXT callback blocked because module "${queryType}" is disabled.`);
        return;
      }
      
      // Send loading message
      await editMessage(this.token, chatId, messageId, 
        `📝 <b>Gerando TXT...</b>\n\nAguarde um momento.`,
        undefined
      );
      
      try {
        // Re-execute query to get data for TXT (usa cache - não conta crédito)
        const { data: result } = await executeQueryWithCache(queryType, queryInput);
        
        // Generate TXT content
        const txtContent = generateTxtContent(queryType, queryInput, result as Record<string, unknown>);
        
        // Convert to blob and send as document
        const txtBytes = new TextEncoder().encode(txtContent);
        const blob = new Blob([txtBytes], { type: 'text/plain; charset=utf-8' });
        
        // Create FormData for file upload
        const form = new FormData();
        form.set("chat_id", String(chatId));
        form.set("document", new File([blob], `consulta_${queryType}_${queryInput}.txt`, { type: 'text/plain' }));
        form.set("caption", `📝 <b>Relatório Completo (TXT)</b>\n\n📊 Tipo: ${queryType.toUpperCase()}\n🔍 Consulta: <code>${queryInput}</code>\n\n✅ Todos os dados da consulta estão neste arquivo.`);
        form.set("parse_mode", "HTML");
        
        const sendDocResult = await fetch(`${TELEGRAM_API}${this.token}/sendDocument`, {
          method: "POST",
          body: form,
        });
        
        const docResponse = await sendDocResult.json();
        
        if (docResponse.ok) {
          // Delete loading message
          try {
            await deleteMessage(this.token, chatId, messageId);
          } catch (_e) { /* ignore */ }
        } else {
          console.error("Failed to send TXT document:", docResponse);
          await editMessage(this.token, chatId, messageId,
            "❌ <b>Erro ao enviar TXT</b>\n\nTente novamente.",
            keyboard([btn("🗑️ Apagar", "delete_msg")])
          );
        }
      } catch (error) {
        console.error("TXT generation error:", error);
        await editMessage(this.token, chatId, messageId,
          "❌ <b>Erro ao gerar TXT</b>\n\nTente novamente.",
          keyboard([btn("🗑️ Apagar", "delete_msg")])
        );
      }
      return;
    }

    if (data === "terms:accept") {
       // Track new user when accepting terms for the first time
       await this.trackNewUser(telegramUserId);
      await this.setTermsStatus(telegramUserId, true);
      try {
        await deleteMessage(this.token, chatId, messageId);
      } catch (_e) { /* ignore */ }
      await this.showMainMenu(chatId, telegramUserId, undefined, callback.message?.chat?.type);
      return;
    }

    if (data === "terms:decline") {
      await this.setTermsStatus(telegramUserId, false);
      await sendMessage(this.token, chatId, "❌ Você precisa aceitar os termos para usar o bot.\nEnvie /start quando estiver pronto.");
      return;
    }

    // Menu navigation
    if (data === "menu:main") {
      await this.showMainMenu(chatId, telegramUserId, messageId, callback.message?.chat?.type);
      return;
    }

    if (data === "menu:query") {
      // Check subscription first
      const chatType = callback.message?.chat?.type || 'private';
      const queryContext = chatType === 'private' ? 'private' : 'group';
      const isActive = await this.isSubscriptionActive(telegramUserId, queryContext);
      if (!isActive && !this.isOwner(telegramUserId)) {
        await editMessage(this.token, chatId, messageId,
          "⚠️ <b>Assinatura necessária</b>\n\nVocê precisa de uma assinatura ativa para fazer consultas.",
          keyboard([btn("💳 Ver Planos", "menu:plans", undefined, EMOJI.DIAMOND), btn("🏠 Voltar", "menu:main", undefined, EMOJI.HOME)])
        );
        return;
      }
      await this.showQueryMenu(chatId, messageId);
      return;
    }

    if (data === "menu:plans" || data.startsWith("menu:plans:")) {
      const planContext = data.includes(":") && data.split(":").length === 3 ? data.split(":")[2] : 'group';
      await this.showPlansMenu(chatId, messageId, planContext);
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
      // Block if maintenance mode is active
      if (this.settings.maintenance_mode) {
        await telegramRequest(this.token, "answerCallbackQuery", {
          callback_query_id: callback.id,
          text: this.settings.maintenance_message || "🔧 Bot em manutenção. Retornaremos em breve.",
          show_alert: true,
        });
        return;
      }
      // Block disabled modules even via callback
      if (!await isQueryTypeEnabled(queryType, this.supabase)) {
        await telegramRequest(this.token, "answerCallbackQuery", {
          callback_query_id: callback.id,
          text: "⚠️ Este módulo está em manutenção.",
          show_alert: true,
        });
        return;
      }
      if (queryType === "foto") {
        await this.showStateSelection(chatId, messageId);
      } else {
        await this.requestQueryInput(chatId, telegramUserId, queryType);
      }
      return;
    }

    // State selection for foto
    if (data.startsWith("state:")) {
      if (!await isQueryTypeEnabled("foto", this.supabase)) {
        console.log(`Photo state callback blocked because module "foto" is disabled.`);
        return;
      }
      const estado = data.replace("state:", "");
      await this.requestQueryInput(chatId, telegramUserId, "foto", estado);
      return;
    }

    // Plan selection — format: plan:code:context (e.g., plan:diaria:private)
    if (data.startsWith("plan:")) {
      const parts = data.split(":");
      const planCode = parts[1];
      const planContext = parts[2] || 'group';
      await this.generatePixPayment(chatId, telegramUserId, planCode, planContext);
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
          keyboard([btn("🔙 Voltar", "menu:main", undefined, EMOJI.BACK)]));
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
        `• Áudio / Voz\n` +
        `• GIF animado\n` +
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
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans", undefined, EMOJI.BACK)]));
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
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans", undefined, EMOJI.BACK)]));
      return;
    }

    if (stateData.action === "change_name") {
      await this.supabase
        .from("subscription_plans")
        .update({ name: text, title: text })
        .eq("id", stateData.planId);
      await this.clearConversationState(telegramUserId, "admin");
      await sendMessage(this.token, chatId, `✅ Nome atualizado para "${text}"!`,
        keyboard([btn("🔙 Voltar aos Planos", "admin:plans", undefined, EMOJI.BACK)]));
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
          keyboard([btn("🔙 Voltar aos Planos", "admin:plans", undefined, EMOJI.BACK)])
        );
        return;
      }
    }
  }

  // Handler para paginação por botões
  async handlePagination(chatId: number, messageId: number, paginationId: string, targetPage: number) {
    // Buscar dados de paginação
    const { data: paginationData, error } = await this.supabase
      .from("paginated_results")
      .select("*")
      .eq("id", paginationId)
      .maybeSingle();

    if (error || !paginationData) {
      console.error("Pagination data not found:", error);
      // Paginação expirou ou não existe
      await editMessage(this.token, chatId, messageId,
        "⚠️ <b>Sessão expirada</b>\n\nFaça uma nova consulta.",
        { inline_keyboard: [[{ text: "🗑️ Apagar", callback_data: "delete_msg" }]] }
      );
      return;
    }

    const pages = paginationData.pages as string[];
    const totalPages = paginationData.total_pages as number;

    // Validar página
    if (targetPage < 0 || targetPage >= totalPages) {
      return;
    }

    // Atualizar página atual no banco
    await this.supabase
      .from("paginated_results")
      .update({ current_page: targetPage })
      .eq("id", paginationId);

    // Recuperar metadata salvos (queryType, queryInput, extraButtons)
    const meta = (paginationData as Record<string, unknown>).metadata as Record<string, unknown> | null;
    const savedQueryType = meta?.queryType as string | undefined;
    const savedQueryInput = meta?.queryInput as string | undefined;
    const savedExtraButtons = meta?.extraButtons as InlineButton[][] | undefined;

    // Criar keyboard de navegação COM botões de PDF/TXT/Foto preservados
    const navKeyboard = createPaginationKeyboard(
      paginationId,
      targetPage,
      totalPages,
      savedQueryType,
      savedQueryInput,
      savedExtraButtons,
    );

    // Atualizar mensagem
    const pageHeader = `📄 <b>Página ${targetPage + 1}/${totalPages}</b>\n\n`;
    await editMessage(this.token, chatId, messageId, pageHeader + pages[targetPage], navKeyboard);
  }

  // Handler para paginação de múltiplos registros (CEP ou Telefone)
  async handleMultiPersonPagination(chatId: number, messageId: number, paginationId: string, targetPage: number, queryType: string = "cep") {
    // Buscar dados de paginação
    const { data: paginationData, error } = await this.supabase
      .from("paginated_results")
      .select("*")
      .eq("id", paginationId)
      .maybeSingle();

    if (error || !paginationData) {
      console.error(`${queryType} pagination data not found:`, error);
      const label = queryType === 'telefone' ? 'TELEFONE' : 'CEP';
      await editMessage(this.token, chatId, messageId,
        `⚠️ <b>Sessão expirada</b>\n\nFaça uma nova consulta de ${label}.`,
        { inline_keyboard: [[{ text: "🗑️ Apagar", callback_data: "delete_msg" }]] }
      );
      return;
    }

    // Pages contém os registros serializados como JSON
    const records = paginationData.pages as PersonRecord[];
    const totalPages = paginationData.total_pages as number;

    // Validar página
    if (targetPage < 0 || targetPage >= totalPages) {
      return;
    }

    // Atualizar página atual no banco
    await this.supabase
      .from("paginated_results")
      .update({ current_page: targetPage })
      .eq("id", paginationId);

    // Formatar página atual - passar queryType para título dinâmico
    const pageText = formatMultiPersonPage(records, targetPage, totalPages, this.bot.bot_username, undefined, queryType);
    const keyboard = createMultiPersonKeyboard(records, targetPage, totalPages, paginationId, queryType);

    // Atualizar mensagem
    await editMessage(this.token, chatId, messageId, pageText, keyboard);
  }
}

// =============== RATE LIMITING ===============
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // max 30 updates per user per minute

function isRateLimited(userId: number): boolean {
  const key = String(userId);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`Rate limited user ${userId}: ${entry.count} requests in window`);
    return true;
  }

  return false;
}

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 300_000);

// =============== STRUCTURED LOGGER ===============
function logCmd(level: 'INFO' | 'WARN' | 'ERROR', tag: string, data: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, tag, ...data };
  if (level === 'ERROR') console.error(JSON.stringify(entry));
  else if (level === 'WARN') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// =============== MAIN HANDLER ===============
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    if (!botId) {
      logCmd('ERROR', 'WEBHOOK', { msg: 'No botId provided', url: req.url });
      return new Response("OK", { status: 200 });
    }

    // Parse update early for rate limiting
    const update: TelegramUpdate = await req.json();
    
    // Rate limit check
    const senderId = update.message?.from?.id || update.callback_query?.from?.id;
    if (senderId && isRateLimited(senderId)) {
      logCmd('WARN', 'RATE_LIMIT', { userId: senderId, updateId: update.update_id });
      return new Response("OK", { status: 200 });
    }

    const chatType = update.message?.chat?.type || update.callback_query?.message?.chat?.type || 'unknown';
    const msgText = update.message?.text || update.callback_query?.data || '';
    
    logCmd('INFO', 'UPDATE_IN', {
      botId: botId.substring(0, 8),
      updateId: update.update_id,
      userId: senderId,
      chatType,
      chatId: update.message?.chat?.id || update.callback_query?.message?.chat?.id,
      text: msgText.substring(0, 80),
      hasCallback: !!update.callback_query,
      username: update.message?.from?.username || update.callback_query?.from?.username,
      ...(update.message?.sender_tag ? { senderTag: update.message.sender_tag } : {}),
      ...(update.message?.from?.can_manage_bots ? { canManageBots: true } : {}),
      ...(update.message?.managed_bot_created ? { managedBotCreated: true } : {}),
    });

    const { data: bot } = await supabase
      .from("telegram_bots")
      .select("*, bot_security_settings(*)")
      .eq("id", botId)
      .single();

    if (!bot) {
      logCmd('ERROR', 'BOT_NOT_FOUND', { botId });
      return new Response("OK", { status: 200 });
    }

    const { data: settings } = await supabase
      .from("bot_settings")
      .select("*")
      .eq("bot_id", botId)
      .single();

    const botSettings: BotSettings = {
      owner_ids: (settings as { owner_ids?: number[] } | null)?.owner_ids || [],
      group_chat_id: (settings as { group_chat_id?: number } | null)?.group_chat_id || null,
      group_url: (settings as { group_url?: string } | null)?.group_url || null,
      terms_text: (settings as { terms_text?: string } | null)?.terms_text || "",
      terms_enabled: (settings as { terms_enabled?: boolean } | null)?.terms_enabled || false,
      mute_new_members: (settings as { mute_new_members?: boolean } | null)?.mute_new_members || false,
      announce_payments: (settings as { announce_payments?: boolean } | null)?.announce_payments ?? true,
      react_to_messages: (settings as { react_to_messages?: boolean } | null)?.react_to_messages || false,
      reaction_mode: (settings as { reaction_mode?: string } | null)?.reaction_mode || 'random',
      fixed_emoji: (settings as { fixed_emoji?: string } | null)?.fixed_emoji || '👍',
      custom_emojis: (settings as { custom_emojis?: string[] } | null)?.custom_emojis || ['👍', '❤️', '🔥', '🎉', '👏'],
      message_effect: (settings as { message_effect?: string } | null)?.message_effect || 'party',
      maintenance_mode: (settings as { maintenance_mode?: boolean } | null)?.maintenance_mode || false,
      maintenance_message: (settings as { maintenance_message?: string } | null)?.maintenance_message || '🔧 Bot em manutenção. Retornaremos em breve.',
    };

    const handler = new BotHandler(supabase, bot as BotData, botSettings, update);
    
    // Fire-and-forget: process in background, respond immediately to Telegram
    const processingPromise = handler.handleUpdate().then(() => {
      const duration = Date.now() - startTime;
      logCmd(duration > 5000 ? 'WARN' : 'INFO', 'UPDATE_DONE', {
        updateId: update.update_id,
        userId: senderId,
        durationMs: duration,
        text: msgText.substring(0, 40),
      });
    }).catch(err => {
      const duration = Date.now() - startTime;
      logCmd('ERROR', 'UPDATE_FAIL', {
        updateId: update.update_id,
        userId: senderId,
        durationMs: duration,
        error: (err as Error).message,
        stack: (err as Error).stack?.substring(0, 300),
        text: msgText.substring(0, 40),
      });
    });

    // Keep the function alive until processing completes
    if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
      (globalThis as any).EdgeRuntime.waitUntil(processingPromise);
    }

    // Respond immediately so Telegram sends the next update without waiting
    return new Response("OK", { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logCmd('ERROR', 'WEBHOOK_CRASH', {
      durationMs: duration,
      error: (error as Error).message,
      stack: (error as Error).stack?.substring(0, 300),
    });
    // Always return 200 to Telegram to prevent retries
    return new Response("OK", { status: 200 });
  }
});
