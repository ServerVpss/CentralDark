import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QueryRequest {
  queryType: string;
  queryInput: string;
  provider?: string;
  estado?: string;
}

// =============== VEICULOS API PROVIDER ===============
const VEICULOS_API_BASE = "https://veiculosapi.com/api/proxy";

// Map internal query types to VeiculosAPI module names
const veiculosModuleMap: Record<string, string> = {
  // Pessoa
  cpf: "cpffull",
  nome: "nomefull",
  rg: "rg",
  titulo: "titulo",
  parentes: "parentes",
  mae: "mae",
  // Documentos alternativos
  cnh: "cnh",
  pis: "pis",
  // Contato
  telefone: "telefonefull",
  email: "emailfull",
  cep: "cepfull",
  endereco: "endereco",
  // Financeiro
  pix: "pix",
  score: "score",
  renda: "renda",
  credilink: "credilink",
  cpf_spc: "cpf-spc",
  poderaquisitivo: "poderaquisitivo",
  // Veículos
  placa: "placa",
  placa_completa: "placa-serpro",
  placa_simples: "placa-simples",
  placa_sesp: "placa-sesp",
  chassi: "chassi",
  renavam: "renavam",
  motor: "motor",
  // Empresa
  cnpj: "cnpj-cred",
  // Justiça
  processos: "processos",
  bnmp: "bnmp-lc",
  siel: "siel",
  // TSE
  tse: "tse-3",
  // SUS
  cpfsus: "cpfsus",
  // Alternativas (variantes -3)
  rg3: "rg-3",
  pis3: "pis-3",
  cep3: "cep-3",
  email3: "email-3",
  nome3: "nome-3",
  score3: "score-3",
  parentes3: "parentes-3",
  telefone3: "telefone-3",
  // CPF variantes
  cpf_isk: "cpf-isk",
  cpf_basico: "cpf",
  // Foto por estado
  fotomg: "fotomg",
  fotosp: "fotosp",
  fotorj: "fotorj",
  fotoba: "fotoba",
  fotoce: "fotoce",
  fotogo: "fotogo",
  fotopr: "fotopr",
  fotors: "fotors",
  fotope: "fotope",
  fotoma: "fotoma",
  fotoes: "fotoes",
  fotodf: "fotodf",
  fototo: "fototo",
};

// Foto state map for national search
const fotoStateModules: Record<string, string> = {
  MG: "fotomg", SP: "fotosp", RJ: "fotorj", BA: "fotoba",
  CE: "fotoce", GO: "fotogo", PR: "fotopr", RS: "fotors",
  PE: "fotope", MA: "fotoma", ES: "fotoes", DF: "fotodf",
  TO: "fototo",
};

// Priority order for national photo search
const fotoStatePriority = ["SP", "RJ", "MG", "BA", "PR", "RS", "PE", "CE", "GO", "MA", "ES", "DF", "TO"];


// All supported query types for GET help
const allSupportedTypes = Object.keys(veiculosModuleMap).concat(["foto", "nacional"]);

// Dynamic module loading from DB
interface DbModule {
  module_key: string;
  enabled: boolean;
  base_url: string;
  port: number;
  endpoint: string;
  query_param: string;
  provider: string;
}

let cachedModules: DbModule[] | null = null;
let cacheTimestamp = 0;
const MODULE_CACHE_TTL = 60_000;

async function getModules(supabase: ReturnType<typeof createClient>): Promise<DbModule[]> {
  const now = Date.now();
  if (cachedModules && (now - cacheTimestamp) < MODULE_CACHE_TTL) {
    return cachedModules;
  }
  try {
    const { data, error } = await supabase
      .from("query_modules")
      .select("module_key, enabled, base_url, port, endpoint, query_param, provider");
    if (error) {
      // Table may not exist — silently use empty/cached list
      return cachedModules || [];
    }
    cachedModules = (data || []) as DbModule[];
    cacheTimestamp = now;
    return cachedModules;
  } catch {
    return cachedModules || [];
  }
}


// Módulos que demoram mais e precisam de timeout estendido (2 min)
const slowModules = [
  "placa", "placa-serpro", "placa-simples", "placa-sesp",
  "processos", "bnmp-lc", "siel", "credilink", "cpf-spc",
  "fotomg", "fotosp", "fotorj", "fotoba", "fotoce", "fotogo",
  "fotopr", "fotors", "fotope", "fotoma", "fotoes", "fotodf", "fototo",
  "score", "score-3", "tse-3", "poderaquisitivo",
];

function getModuleTimeout(modulo: string): number {
  return slowModules.includes(modulo) ? 120_000 : 45_000;
}

// =============== VEICULOS API FETCH ===============
async function fetchFromVeiculosApi(modulo: string, valor: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("CONSULTAS_API_KEY");
  if (!apiKey) {
    console.error("CONSULTAS_API_KEY not configured!");
    return { error: "⚠️ Chave de API não configurada. Contate o administrador." };
  }

  const timeoutMs = getModuleTimeout(modulo);
  const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(modulo)}&string=${encodeURIComponent(valor)}`;
  console.log(`[VeiculosAPI] Fetching: modulo=${modulo}, valor=${valor}, timeout=${timeoutMs / 1000}s`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      console.log(`[VeiculosAPI] Not found (404) for modulo=${modulo}`);
      return { notFound: true, message: "Dados não encontrados" };
    }

    if (!response.ok) {
      console.error(`[VeiculosAPI] HTTP error: ${response.status}`);
      return { error: `Erro na API: ${response.status}` };
    }

    const contentType = response.headers.get("content-type") || "";
    
    // If response is text/html or plain text, return as data string
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { notFound: true, message: "Dados não encontrados" };
      }
      return { data: text, modulo };
    }

    const data = await response.json();
    
    // Check for empty/error responses
    if (data === null || data === undefined) {
      return { notFound: true, message: "Dados não encontrados" };
    }
    
    // Some modules return { error: ... } or { status: "error" }
    if (data.error || data.status === "error") {
      return { notFound: true, message: data.error || data.message || "Dados não encontrados" };
    }

    return { ...data, modulo };
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    console.error(`[VeiculosAPI] Error:`, error.message);
    if (error.name === "AbortError") {
      return { error: "⏱️ Tempo limite excedido. Tente novamente." };
    }
    return { error: "⚠️ Erro de conexão. Tente novamente." };
  }
}

// =============== LEGACY PROVIDER FETCH (fallback) ===============
interface ApiProvider {
  baseUrl: string;
  port: number;
}

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

  console.log(`[Legacy] Fetching from: ${url.toString()}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });

    if (response.status === 404) return { notFound: true, message: "Dados não encontrados" };
    if (!response.ok) return { error: `Erro na API: ${response.status}`, status: response.status };

    const data = await response.json();
    clearTimeout(timeoutId);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    if (error.name === "AbortError") return { error: "⏱️ Tempo limite excedido." };
    if (error.message.includes('Connection refused') || error.message.includes('connect error') || error.message.includes('tcp connect')) {
      return { error: "⚠️ Servidor temporariamente indisponível." };
    }
    return { error: "⚠️ Erro de conexão." };
  }
}

// Text-based modules that accept letters and spaces
const textBasedModules = ["nome", "nomefull", "mae", "maefull", "endereco", "email", "emailfull", "pix"];

function cleanQueryValue(queryType: string, input: string): string {
  const normalizedType = queryType.toLowerCase();
  // For text modules, only trim — preserve letters and spaces
  if (textBasedModules.includes(normalizedType)) {
    return input.trim();
  }
  // For everything else, remove special chars but keep alphanumeric, @, ., -
  return input.replace(/[^\w@.-]/g, "").trim();
}

// Deep search for photo data in nested response
function findPhotoInResponse(obj: unknown, depth = 0): string | null {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;
  const record = obj as Record<string, unknown>;

  // Check for error indicators first
  const errVal = record.err || record.error;
  if (errVal && typeof errVal === 'string' && /n[aã]o encontrad/i.test(errVal)) return null;

  const photoKeys = ['foto', 'image', 'photo', 'fotoBase64', 'base64'];
  for (const key of photoKeys) {
    const val = record[key];
    if (val && typeof val === 'string' && val.length > 100) {
      if (val.startsWith('/9j/') || val.startsWith('iVBOR')) return `data:image/jpeg;base64,${val}`;
      if (val.startsWith('data:image/') || val.startsWith('http')) return val;
    }
    if (val && typeof val === 'object') {
      const nested = val as Record<string, unknown>;
      if (nested.base64 && typeof nested.base64 === 'string' && nested.base64.length > 100) {
        const b64 = nested.base64 as string;
        if (b64.startsWith('/9j/') || b64.startsWith('iVBOR')) return `data:image/jpeg;base64,${b64}`;
        if (b64.startsWith('data:image/')) return b64;
        return `data:image/jpeg;base64,${b64}`;
      }
    }
  }

  const recurseKeys = ['dados', 'data', 'result', 'resultado', 'resposta'];
  for (const key of recurseKeys) {
    if (record[key] && typeof record[key] === 'object') {
      const found = findPhotoInResponse(record[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// =============== HANDLE QUERY ===============
async function handleQuery(req: QueryRequest, supabase: ReturnType<typeof createClient>): Promise<Record<string, unknown>> {
  const { queryType, queryInput, estado } = req;
  const normalizedType = queryType.toLowerCase();
  const cleanInput = cleanQueryValue(normalizedType, queryInput);

  console.log(`Processing query: type=${normalizedType}, input=${cleanInput}`);

  // Load modules from DB for enable/disable check
  const modules = await getModules(supabase);
  const mod = modules.find(m => m.module_key === normalizedType);

  // Check if disabled in DB
  if (mod && !mod.enabled) {
    return {
      module_disabled: true,
      message: `🚫 Módulo "${normalizedType}" temporariamente desativado.`,
      queryType: normalizedType,
      queryInput: cleanInput,
    };
  }

  // ---- FOTO: national search across state-specific modules (PARALLEL) ----
  if (normalizedType === "nacional" || (normalizedType === "foto" && !estado)) {
    console.log(`[Foto] Starting parallel national photo search (${fotoStatePriority.length} states)...`);

    const promises = fotoStatePriority.map(async (state) => {
      const fotoModulo = fotoStateModules[state];
      if (!fotoModulo) return null;
      const result = await fetchFromVeiculosApi(fotoModulo, cleanInput);
      if (result && !result.error && !result.notFound) {
        const fotoData = findPhotoInResponse(result);
        if (fotoData) {
          console.log(`[Foto] ✅ Photo found in ${state}`);
          return { ...result, foto: fotoData, cpf: cleanInput, estado_encontrado: state };
        }
        console.log(`[Foto] ${state}: response OK but no photo data`);
      }
      return null;
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) return r;
    }

    return {
      cpf: cleanInput, estados_encontrados: [], total_fotos: 0,
      foto: null, message: "Foto não encontrada nos estados pesquisados",
    };
  }

  // ---- FOTO: specific state ----
  if (normalizedType === "foto" && estado) {
    const stateUpper = estado.toUpperCase();
    const fotoModulo = fotoStateModules[stateUpper];
    if (fotoModulo) {
      const result = await fetchFromVeiculosApi(fotoModulo, cleanInput);
      if (result && !result.error && !result.notFound) {
        const fotoData = findPhotoInResponse(result);
        if (fotoData) {
          return { ...result, foto: fotoData, cpf: cleanInput, estado_encontrado: stateUpper };
        }
      }
      return {
        error: `📸 Foto não encontrada no estado ${stateUpper}`,
        notFound: true,
      };
    }
    // State not available in VeiculosAPI, try legacy TConect
    const fotoMod = modules.find(m => m.module_key === "foto");
    if (fotoMod) {
      const provider: ApiProvider = { baseUrl: fotoMod.base_url, port: fotoMod.port };
      return await fetchFromProvider(provider, fotoMod.endpoint, fotoMod.query_param || "cpf", cleanInput, { estado: stateUpper });
    }
    return { error: `Estado ${stateUpper} não disponível para foto.`, notFound: true };
  }

  // ---- Standard queries via VeiculosAPI ----
  const veiculosModulo = veiculosModuleMap[normalizedType];
  if (veiculosModulo) {
    return await fetchFromVeiculosApi(veiculosModulo, cleanInput);
  }

  // ---- Fallback: try legacy DB-configured providers ----
  if (mod) {
    const provider: ApiProvider = { baseUrl: mod.base_url, port: mod.port };
    return await fetchFromProvider(provider, mod.endpoint, mod.query_param, cleanInput);
  }

  return { error: `Tipo de consulta não suportado: ${queryType}` };
}

// =============== MAIN HANDLER ===============
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let queryRequest: QueryRequest;

    if (req.method === "GET") {
      const url = new URL(req.url);
      const tipo = url.searchParams.get("tipo");
      const valor = url.searchParams.get("valor");
      const estado = url.searchParams.get("estado");

      if (!tipo || !valor) {
        return new Response(
          JSON.stringify({
            error: "Parâmetros 'tipo' e 'valor' são obrigatórios",
            exemplo: "?tipo=cpf&valor=12345678900",
            tipos_disponiveis: allSupportedTypes,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      queryRequest = { queryType: tipo, queryInput: valor, estado: estado || undefined };
    } else {
      queryRequest = await req.json();
    }

    if (!queryRequest.queryType || !queryRequest.queryInput) {
      return new Response(
        JSON.stringify({ error: "queryType e queryInput são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startTime = Date.now();

    const result = await handleQuery(queryRequest, supabase);

    const duration = Date.now() - startTime;

    // Log query for authenticated users (history only, no usage/credits)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) {
        supabase.from("query_history").insert({
          user_id: user.id,
          query_type: queryRequest.queryType,
          query_input: queryRequest.queryInput,
          query_result: result,
          status: result.error ? "error" : result.module_disabled ? "disabled" : "success",
        }).then(() => {});
      }
    }

    const isNotFound = result.notFound === true;
    const isDisabledModule = result.module_disabled === true;
    const isError = result.error && !isNotFound;

    return new Response(
      JSON.stringify({
        success: !isError,
        data: result,
        duration_ms: duration,
        module_disabled: isDisabledModule || undefined,
        error: isError ? result.error : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
