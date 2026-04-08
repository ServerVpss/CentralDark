import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============== WHITELIST EXATA DOS 75 MÓDULOS ===============
const MODULE_WHITELIST = new Set([
  // Pessoa
  "cpf", "nome", "rg", "titulo", "parentes", "mae", "cnh", "pis",
  "pai", "nasc", "nis", "obito", "registro", "nomeabreviadofiltros",
  // Documentos
  "cnham", "cnhrs", "cnhrr", "cnhnc", "oab",
  "advogadooab", "advogadocpf", "advogadooabuf",
  "catcpf", "catnumero",
  // Contato
  "telefone", "email", "cep", "endereco",
  // Financeiro
  "pix", "score", "renda", "credilink", "poderaquisitivo",
  "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
  // Veículos
  "placa", "chassi", "renavam", "motor",
  "veiculos", "crlvto", "crlvmt", "crlvto-foto", "crlvmt-foto",
  // Empresa
  "cnpj",
  // Justiça
  "processos", "siel", "mandado", "certidoes", "processo",
  // Governo
  "vacinas", "beneficios", "faculdades", "func", "matricula",
  // Trabalho
  "rais",
  // SUS
  // TSE
  "tse-3",
  // Fotos por estado
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
]);

// Mapeamento de módulo interno → nome real na VeiculosAPI
// Todos os 75 módulos passam pela mesma API com nomes iseek-*
const MODULE_API_NAME: Record<string, string> = {
  // Pessoa
  "cpf": "iseek-cpf",
  "nome": "iseek-dados---nome",
  "rg": "iseek-dados---rg",
  "titulo": "iseek-dados---titulo",
  "parentes": "iseek-dados---parentes",
  "mae": "iseek-dados---mae",
  "cnh": "iseek-dados---cnh",
  "pis": "iseek-dados---pis",
  "pai": "iseek-dados---pai",
  "nasc": "iseek-dados---nasc",
  "nis": "iseek-dados---nis",
  "obito": "iseek-dados---obito",
  "registro": "iseek-dados---registro",
  "nomeabreviadofiltros": "iseek-dados---nomeabreviadofiltros",
  // Documentos
  "cnham": "iseek-dados---cnham",
  "cnhrs": "iseek-dados---cnhrs",
  "cnhrr": "iseek-dados---cnhrr",
  "cnhnc": "iseek-dados---cnhnc",
  "oab": "iseek-dados---oab",
  "advogadooab": "iseek-dados---advogadooab",
  "advogadocpf": "iseek-dados---advogadocpf",
  "advogadooabuf": "iseek-dados---advogadooabuf",
  "catcpf": "iseek-dados---catcpf",
  "catnumero": "iseek-dados---catnumero",
  // Contato
  "telefone": "iseek-dados---telefone",
  "email": "iseek-dados---email",
  "cep": "iseek-dados---cep",
  "endereco": "iseek-dados---endereco",
  // Financeiro
  "pix": "iseek-dados---pix",
  "score": "iseek-dados---score",
  "renda": "iseek-dados---renda",
  "credilink": "iseek-dados---credilink",
  "poderaquisitivo": "iseek-dados---poderaquisitivo",
  "dividas": "iseek-dados---dividas",
  "bens": "iseek-dados---bens",
  "irpf": "iseek-dados---irpf",
  "score2": "iseek-dados---score2",
  "cheque": "iseek-dados---cheque",
  "assessoria": "iseek-dados---assessoria",
  "iptu": "iseek-dados---iptu",
  // Veículos
  "placa": "iseek-dados---placa",
  "chassi": "iseek-dados---chassi",
  "renavam": "iseek-dados---renavam",
  "motor": "iseek-dados---motor",
  "veiculos": "iseek-dados---veiculos",
  "crlvto": "iseek-dados---crlvto",
  "crlvmt": "iseek-dados---crlvmt",
  "crlvto-foto": "iseek-fotos---crlvto",
  "crlvmt-foto": "iseek-fotos---crlvmt",
  // Empresa
  "cnpj": "iseek-dados---cnpj",
  // Justiça
  "processos": "iseek-dados---processos",
  "siel": "iseek-dados---siel",
  "mandado": "iseek-dados---mandado",
  "certidoes": "iseek-dados---certidoes",
  "processo": "iseek-dados---processo",
  // Governo
  "vacinas": "iseek-dados---vacinas",
  "beneficios": "iseek-dados---beneficios",
  "faculdades": "iseek-dados---faculdades",
  "func": "iseek-dados---func",
  "matricula": "iseek-dados---matricula",
  // Trabalho
  "rais": "iseek-dados---rais",
  // TSE
  "tse-3": "iseek-dados---tse-3",
  // Fotos por estado
  "fotomg": "iseek-fotos---fotomg",
  "fotosp": "iseek-fotos---fotosp",
  "fotorj": "iseek-fotos---fotorj",
  "fotoce": "iseek-fotos---fotoce",
  "fotopr": "iseek-fotos---fotopr",
  "fotoma": "iseek-fotos---fotoma",
  "fotoes": "iseek-fotos---fotoes",
  "fotodf": "iseek-fotos---fotodf",
  "fototo": "iseek-fotos---fototo",
  "fotoms": "iseek-fotos---fotoms",
  "fotoro": "iseek-fotos---fotoro",
  "fotopi": "iseek-fotos---fotopi",
  "fotoal": "iseek-fotos---fotoal",
  "fotogo": "iseek-fotos---fotogo",
  "fotopb": "iseek-fotos---fotopb",
  "fotope": "iseek-fotos---fotope",
  "fotorn": "iseek-fotos---fotorn",
  "fotonc": "iseek-fotos---fotonc",
  "fotocnh": "iseek-fotos---fotocnh",
  "fotodetran": "iseek-dados---fotodetran",
  "fotomapresos": "iseek-fotos---fotomapresos",
};

// Foto state modules for national search
const FOTO_STATE_MODULES: Record<string, string> = {
  SP: "fotosp", RJ: "fotorj", MG: "fotomg",
  CE: "fotoce", PR: "fotopr", MA: "fotoma",
  ES: "fotoes", DF: "fotodf", TO: "fototo",
  MS: "fotoms", RO: "fotoro", PI: "fotopi",
};
const FOTO_STATE_PRIORITY = ["SP", "RJ", "MG", "PR", "CE", "MA", "ES", "DF", "TO", "MS", "RO", "PI"];

// Módulos virtuais que não vão direto para a API (são compostos)
const VIRTUAL_MODULES = new Set(["foto", "nacional"]);

// =============== TIMEOUT POR MÓDULO ===============
const SLOW_MODULES = new Set([
  "placa", "processos", "siel", "credilink",
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
  "score", "tse-3", "poderaquisitivo",
  "certidoes", "mandado", "veiculos", "rais",
  "processo", "crlvto", "crlvmt", "crlvto-foto", "crlvmt-foto",
]);

function getModuleTimeout(modulo: string): number {
  return SLOW_MODULES.has(modulo) ? 60_000 : 30_000;
}

// =============== VALIDAÇÃO DE ENTRADA ===============
const TEXT_MODULES = new Set([
  "nome", "mae", "endereco", "email", "pix", "nomeabreviadofiltros",
]);

const NUMERIC_MODULES = new Set([
  "cpf", "rg", "titulo", "cnh", "pis",
  "telefone", "cep",
  "score", "renda", "credilink", "poderaquisitivo",
  "parentes", "renavam",
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  "pai", "nasc", "nis", "obito", "registro",
  "cnham", "cnhrs", "cnhrr", "cnhnc", "oab", "advogadooab", "advogadocpf",
  "advogadooabuf", "catcpf", "catnumero",
  "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
  "vacinas", "beneficios", "faculdades", "func", "matricula",
  "mandado", "certidoes", "rais", "veiculos", "processo",
  "crlvto", "crlvmt",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
  "crlvto-foto", "crlvmt-foto",
]);

function cleanQueryValue(modulo: string, input: string): string {
  if (TEXT_MODULES.has(modulo)) return input.trim();
  if (NUMERIC_MODULES.has(modulo)) return input.replace(/\D/g, "").trim();
  return input.replace(/[^\w]/g, "").trim();
}

// =============== FILTRO DE METADADOS ADMIN ===============
const ADMIN_FIELD_PATTERNS = new Set([
  "requests_used", "requests_remaining", "daily_limit", "fallback_provider",
  "requestsused", "requestsremaining", "dailylimit", "fallbackprovider",
  "modulo", "modulo_consultado", "tipo_consultado", "api_version",
  "token_used", "token_status", "credits_used", "credits_remaining",
  "apikey", "api_key", "key_status",
]);

function isAdminKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (ADMIN_FIELD_PATTERNS.has(lower)) return true;
  if (lower.endsWith("_consultada") || lower.endsWith("_consultado")) return true;
  return false;
}

function stripAdminFields(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripAdminFields);
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isAdminKey(k)) continue;
    clean[k] = (v && typeof v === "object") ? stripAdminFields(v) : v;
  }
  return clean;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateInput(modulo: string, value: string): ValidationResult {
  const clean = cleanQueryValue(modulo, value);
  if (!clean || clean.length === 0) {
    return { valid: false, error: "Valor não pode ser vazio." };
  }

  const CPF_MODULES = [
    "cpf", "score", "renda",
    "credilink", "poderaquisitivo", "parentes", "processos",
    "siel", "tse-3", "titulo", "mae",
    "pai", "nasc", "nis", "obito", "registro", "nomeabreviadofiltros",
    "cnham", "cnhrs", "cnhrr", "cnhnc", "oab", "advogadooab", "advogadocpf",
    "advogadooabuf", "catcpf", "catnumero",
    "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
    "vacinas", "beneficios", "faculdades", "func", "matricula",
    "mandado", "certidoes", "rais", "veiculos", "processo",
    "crlvto", "crlvmt",
  ];
  if (CPF_MODULES.includes(modulo) || modulo.startsWith("foto")) {
    if (!/^\d{11}$/.test(clean)) {
      return { valid: false, error: "CPF deve conter exatamente 11 dígitos." };
    }
  }

  if (modulo === "cnpj") {
    if (!/^\d{14}$/.test(clean)) {
      return { valid: false, error: "CNPJ deve conter exatamente 14 dígitos." };
    }
  }

  if (modulo === "placa") {
    if (!/^[A-Z0-9]{7}$/i.test(clean)) {
      return { valid: false, error: "Placa deve conter 7 caracteres alfanuméricos." };
    }
  }

  if (modulo === "cep") {
    if (!/^\d{8}$/.test(clean)) {
      return { valid: false, error: "CEP deve conter exatamente 8 dígitos." };
    }
  }

  if (modulo === "telefone") {
    if (!/^\d{10,11}$/.test(clean)) {
      return { valid: false, error: "Telefone deve conter 10 ou 11 dígitos (DDD + número)." };
    }
  }

  if (modulo === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { valid: false, error: "Formato de email inválido." };
    }
  }

  if (modulo === "nome") {
    if (clean.length < 3) {
      return { valid: false, error: "Nome deve ter pelo menos 3 caracteres." };
    }
  }

  if (modulo === "rg") {
    if (!/^\d{5,12}$/.test(clean)) {
      return { valid: false, error: "RG deve conter entre 5 e 12 dígitos." };
    }
  }

  if (modulo === "pis") {
    if (!/^\d{11}$/.test(clean)) {
      return { valid: false, error: "PIS deve conter 11 dígitos." };
    }
  }

  if (modulo === "cnh") {
    if (!/^\d{11}$/.test(clean)) {
      return { valid: false, error: "CNH deve conter 11 dígitos." };
    }
  }

  if (modulo === "renavam") {
    if (!/^\d{9,11}$/.test(clean)) {
      return { valid: false, error: "RENAVAM deve conter entre 9 e 11 dígitos." };
    }
  }

  return { valid: true };
}

// =============== LOG HELPER ===============
function logData(tag: string, obj: Record<string, unknown>) {
  const truncate = (val: unknown, maxLen = 200): unknown => {
    if (typeof val === "string" && val.length > maxLen) {
      return val.substring(0, maxLen) + `...[${val.length} chars]`;
    }
    if (Array.isArray(val)) return val.slice(0, 5).map(v => truncate(v, maxLen));
    if (val && typeof val === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        out[k] = truncate(v, maxLen);
      }
      return out;
    }
    return val;
  };
  console.log(JSON.stringify({ tag, ...truncate(obj) as Record<string, unknown> }));
}

// =============== VEÍCULOS API ===============
const VEICULOS_API_BASE = "https://veiculosapi.com/api/proxy";

interface ProviderResult {
  data: Record<string, unknown>;
  provider_duration_ms: number;
  retried: boolean;
}

async function fetchFromProvider(modulo: string, valor: string, retry = false): Promise<ProviderResult> {
  // Resolve o nome do módulo na API (alguns módulos usam nomes internos diferentes)
  const apiModuleName = MODULE_API_NAME[modulo] || modulo;

  // Chave única para todos os módulos (VeiculosAPI)
  const apiKey = Deno.env.get("ISEEK_API_KEY") || Deno.env.get("CONSULTAS_API_KEY");

  if (!apiKey) {
    return {
      data: { error: "⚠️ Chave de API não configurada. Contate o administrador." },
      provider_duration_ms: 0,
      retried: false,
    };
  }

  const timeoutMs = getModuleTimeout(modulo);
  const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(apiModuleName)}&string=${encodeURIComponent(valor)}`;
  console.log(`[Provider] modulo=${modulo} → api=${apiModuleName}, timeout=${timeoutMs / 1000}s${retry ? " (retry)" : ""}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const providerStart = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const provider_duration_ms = Date.now() - providerStart;

    if (response.status === 404) {
      return { data: { notFound: true, message: "Dados não encontrados" }, provider_duration_ms, retried: retry };
    }

    if (!response.ok) {
      if (!retry && response.status >= 500) {
        console.log(`[Provider] 5xx (${response.status}), retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        return fetchFromProvider(modulo, valor, true);
      }
      return { data: { error: `Erro na API: ${response.status}` }, provider_duration_ms, retried: retry };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { data: { notFound: true, message: "Dados não encontrados" }, provider_duration_ms, retried: retry };
      }
      return { data: { data: text, modulo }, provider_duration_ms, retried: retry };
    }

    const data = await response.json();
    logData("PROVIDER_RAW", { modulo, apiModuleName, duration_ms: provider_duration_ms, retried: retry, keys: data ? Object.keys(data) : [], data });

    if (data === null || data === undefined) {
      return { data: { notFound: true, message: "Dados não encontrados" }, provider_duration_ms, retried: retry };
    }
    if (data.error || data.status === "error") {
      logData("PROVIDER_ERROR", { modulo, error: data.error || data.message });
      return { data: { notFound: true, message: data.error || data.message || "Dados não encontrados" }, provider_duration_ms, retried: retry };
    }

    // Para módulos que retornam formato com wrapper { status, data }, extrair dados internos
    if (MODULE_API_NAME[modulo] && data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      const innerData = data.data;
      if (innerData.error || innerData.status === "error") {
        return { data: { notFound: true, message: innerData.error || innerData.message || "Dados não encontrados" }, provider_duration_ms, retried: retry };
      }
      return { data: { ...stripAdminFields(innerData), modulo }, provider_duration_ms, retried: retry };
    }

    return { data: { ...stripAdminFields(data), modulo }, provider_duration_ms, retried: retry };
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    const provider_duration_ms = Date.now() - providerStart;

    if (error.name === "AbortError") {
      if (!retry) {
        console.log(`[Provider] Timeout, retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        return fetchFromProvider(modulo, valor, true);
      }
      return { data: { error: "⏱️ Tempo limite excedido. Tente novamente." }, provider_duration_ms, retried: true };
    }

    if (error.message?.includes("Connection refused") || error.message?.includes("connect error") || error.message?.includes("tcp connect")) {
      return { data: { error: "⚠️ Servidor temporariamente indisponível." }, provider_duration_ms, retried: retry };
    }

    return { data: { error: "⚠️ Erro de conexão. Tente novamente." }, provider_duration_ms, retried: retry };
  }
}

// =============== FOTO: BUSCA PROFUNDA ===============
function findPhotoInResponse(obj: unknown, depth = 0): string | null {
  if (!obj || typeof obj !== "object" || depth > 8) return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findPhotoInResponse(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = obj as Record<string, unknown>;
  const errVal = record.err || record.error;
  if (errVal && typeof errVal === "string" && /n[aã]o encontrad/i.test(errVal)) return null;

  const photoKeys = ["foto", "image", "photo", "fotoBase64", "base64"];
  for (const key of photoKeys) {
    const val = record[key];
    if (val && typeof val === "string" && val.length > 100) {
      if (val.startsWith("/9j/") || val.startsWith("iVBOR")) return `data:image/jpeg;base64,${val}`;
      if (val.startsWith("data:image/") || val.startsWith("http")) return val;
      return `data:image/jpeg;base64,${val}`;
    }
    if (val && typeof val === "object") {
      const found = findPhotoInResponse(val, depth + 1);
      if (found) return found;
    }
  }

  for (const [key, val] of Object.entries(record)) {
    if (photoKeys.includes(key)) continue;
    if (val && typeof val === "object") {
      const found = findPhotoInResponse(val, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

// =============== MODULE STATUS (DB) ===============
let cachedModuleStatus: Record<string, boolean> | null = null;
let moduleCacheTime = 0;
const MODULE_CACHE_TTL = 60_000;

async function isModuleEnabled(modulo: string, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const now = Date.now();
  if (!cachedModuleStatus || (now - moduleCacheTime) >= MODULE_CACHE_TTL) {
    try {
      const { data } = await supabase.from("query_modules").select("module_key, enabled");
      if (data) {
        cachedModuleStatus = {};
        for (const row of data) {
          cachedModuleStatus[row.module_key] = row.enabled ?? true;
        }
        moduleCacheTime = now;
      }
    } catch {
      // fallback: allow if can't check
    }
  }
  if (!cachedModuleStatus) return true;
  if (!(modulo in cachedModuleStatus)) return true;
  return cachedModuleStatus[modulo] === true;
}

// =============== INTERFACE ===============
interface QueryRequest {
  queryType: string;
  queryInput: string;
  estado?: string;
  channel?: string;
}

interface StandardResponse {
  success: boolean;
  data: Record<string, unknown>;
  meta: {
    request_id: string;
    modulo: string;
    channel: string;
    duration_ms: number;
    provider_duration_ms: number;
    internal_duration_ms: number;
    status: string;
  };
  errors: string[];
}

// =============== HANDLE QUERY ===============
async function handleQuery(
  req: QueryRequest,
  supabase: ReturnType<typeof createClient>,
  requestId: string,
): Promise<StandardResponse> {
  const startTime = Date.now();
  const { queryType, queryInput, estado, channel } = req;
  const modulo = queryType.toLowerCase().trim();
  const channelName = channel || "unknown";

  const buildMeta = (status: string, providerMs = 0) => {
    const now = Date.now();
    return {
      request_id: requestId,
      modulo,
      channel: channelName,
      duration_ms: now - startTime,
      provider_duration_ms: providerMs,
      internal_duration_ms: (now - startTime) - providerMs,
      status,
    };
  };

  // 1. Whitelist check
  const isVirtual = VIRTUAL_MODULES.has(modulo);
  if (!isVirtual && !MODULE_WHITELIST.has(modulo)) {
    console.warn(`[Blocked] Module not in whitelist: ${modulo}`);
    return {
      success: false,
      data: {},
      meta: buildMeta("blocked"),
      errors: [`Módulo "${modulo}" não é suportado. Verifique os módulos disponíveis.`],
    };
  }

  // 2. DB enable/disable check
  if (!isVirtual) {
    const enabled = await isModuleEnabled(modulo, supabase);
    if (!enabled) {
      return {
        success: false,
        data: { module_disabled: true },
        meta: buildMeta("disabled"),
        errors: [`Módulo "${modulo}" temporariamente desativado.`],
      };
    }
  }

  // 3. Clean input
  const cleanInput = isVirtual
    ? queryInput.replace(/\D/g, "").trim()
    : cleanQueryValue(modulo, queryInput);

  // 4. Validate input
  if (!isVirtual) {
    const validation = validateInput(modulo, cleanInput);
    if (!validation.valid) {
      return {
        success: false,
        data: {},
        meta: buildMeta("validation_error"),
        errors: [validation.error || "Entrada inválida."],
      };
    }
  } else {
    if (!/^\d{11}$/.test(cleanInput)) {
      return {
        success: false,
        data: {},
        meta: buildMeta("validation_error"),
        errors: ["CPF deve conter exatamente 11 dígitos."],
      };
    }
  }

  // 5. Execute query

  // ---- FOTO NACIONAL (paralelo) ----
  if (modulo === "nacional" || (modulo === "foto" && !estado)) {
    console.log(`[Foto Nacional] Buscando em ${FOTO_STATE_PRIORITY.length} estados...`);
    let totalProviderMs = 0;

    const promises = FOTO_STATE_PRIORITY.map(async (state) => {
      const fotoModulo = FOTO_STATE_MODULES[state];
      if (!fotoModulo) return null;
      const result = await fetchFromProvider(fotoModulo, cleanInput);
      totalProviderMs = Math.max(totalProviderMs, result.provider_duration_ms);
      if (result.data && !result.data.error && !result.data.notFound) {
        const fotoData = findPhotoInResponse(result.data);
        if (fotoData) {
          return { ...result.data, foto: fotoData, cpf: cleanInput, estado_encontrado: state };
        }
      }
      return null;
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) {
        return {
          success: true,
          data: r,
          meta: buildMeta("success", totalProviderMs),
          errors: [],
        };
      }
    }

    return {
      success: true,
      data: { cpf: cleanInput, foto: null, message: "Foto não encontrada nos estados pesquisados", notFound: true },
      meta: buildMeta("not_found", totalProviderMs),
      errors: [],
    };
  }

  // ---- FOTO POR ESTADO ----
  if (modulo === "foto" && estado) {
    const stateUpper = estado.toUpperCase();
    const fotoModulo = FOTO_STATE_MODULES[stateUpper];
    if (!fotoModulo) {
      return {
        success: false,
        data: {},
        meta: buildMeta("validation_error"),
        errors: [`Estado "${stateUpper}" não disponível para consulta de foto.`],
      };
    }

    const result = await fetchFromProvider(fotoModulo, cleanInput);
    if (result.data && !result.data.error && !result.data.notFound) {
      const fotoData = findPhotoInResponse(result.data);
      if (fotoData) {
        return {
          success: true,
          data: { ...result.data, foto: fotoData, cpf: cleanInput, estado_encontrado: stateUpper },
          meta: buildMeta("success", result.provider_duration_ms),
          errors: [],
        };
      }
    }
    return {
      success: true,
      data: { cpf: cleanInput, foto: null, estado: stateUpper, notFound: true },
      meta: buildMeta("not_found", result.provider_duration_ms),
      errors: [`Foto não encontrada no estado ${stateUpper}`],
    };
  }

  // ---- MÓDULO PADRÃO ----
  const result = await fetchFromProvider(modulo, cleanInput);

  if (result.data.error) {
    return {
      success: false,
      data: result.data,
      meta: buildMeta("error", result.provider_duration_ms),
      errors: [String(result.data.error)],
    };
  }

  if (result.data.notFound) {
    return {
      success: true,
      data: result.data,
      meta: buildMeta("not_found", result.provider_duration_ms),
      errors: [],
    };
  }

  return {
    success: true,
    data: result.data,
    meta: buildMeta("success", result.provider_duration_ms),
    errors: [],
  };
}

// =============== MAIN HANDLER ===============
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let queryRequest: QueryRequest;

    if (req.method === "GET") {
      const url = new URL(req.url);
      const tipo = url.searchParams.get("tipo");
      const valor = url.searchParams.get("valor");
      const estado = url.searchParams.get("estado");
      const channel = url.searchParams.get("channel");

      if (!tipo || !valor) {
        return new Response(
          JSON.stringify({
            success: false,
            errors: ["Parâmetros 'tipo' e 'valor' são obrigatórios"],
            exemplo: "?tipo=cpf&valor=12345678900",
            modulos_disponiveis: [...MODULE_WHITELIST].sort(),
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      queryRequest = {
        queryType: tipo,
        queryInput: valor,
        estado: estado || undefined,
        channel: channel || "direct",
      };
    } else {
      const body = await req.json();
      queryRequest = {
        queryType: body.queryType,
        queryInput: body.queryInput,
        estado: body.estado,
        channel: body.channel || "unknown",
      };
    }

    if (!queryRequest.queryType || !queryRequest.queryInput) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: ["queryType e queryInput são obrigatórios"],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await handleQuery(queryRequest, supabase, requestId);

    // Log query for audit
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) {
          supabase.from("query_history").insert({
            user_id: user.id,
            query_type: queryRequest.queryType,
            query_input: queryRequest.queryInput,
            query_result: response.data,
            status: response.meta.status,
          }).then(() => {});
        }
      } catch {
        // Auth check failed — skip logging
      }
    }

    logData("QUERY_RESULT", {
      request_id: requestId,
      channel: response.meta.channel,
      modulo: response.meta.modulo,
      input: queryRequest.queryInput,
      status: response.meta.status,
      duration_ms: response.meta.duration_ms,
      provider_duration_ms: response.meta.provider_duration_ms,
      internal_duration_ms: response.meta.internal_duration_ms,
      has_errors: response.errors.length > 0,
      errors: response.errors,
      response_data: response.data,
    });

    response.data = stripAdminFields(response.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err as Error;
    console.error(`[Fatal] request_id=${requestId}`, error);
    return new Response(
      JSON.stringify({
        success: false,
        data: {},
        meta: {
          request_id: requestId,
          modulo: "unknown",
          channel: "unknown",
          duration_ms: 0,
          provider_duration_ms: 0,
          internal_duration_ms: 0,
          status: "internal_error",
        },
        errors: ["Erro interno do servidor."],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
