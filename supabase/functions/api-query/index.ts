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
  mae: "maefull",
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

// TTL configurations per query type (in hours)
const cacheTTL: Record<string, number> = {
  cpf: 24, cnpj: 24, placa: 12, placa_completa: 12, placa_simples: 12, placa_sesp: 12,
  score: 6, foto: 168, nacional: 168,
  telefone: 24, email: 24, cep: 720, nome: 24,
  rg: 24, cnh: 24, pix: 24, parentes: 24,
  chassi: 24, renavam: 24, motor: 24,
  titulo: 24, endereco: 24, renda: 24,
  processos: 24, bnmp: 24, siel: 24, tse: 24,
  credilink: 24, cpf_spc: 24, poderaquisitivo: 24,
  mae: 24, pis: 24, cpfsus: 24, cpf_isk: 24,
};

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

// =============== CACHE HELPERS ===============
async function generateHash(queryType: string, queryInput: string): Promise<string> {
  const text = `${queryType.toLowerCase()}:${queryInput}`;
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getTTLHours(queryType: string): number {
  return cacheTTL[queryType.toLowerCase()] || 24;
}

async function checkCache(
  supabase: ReturnType<typeof createClient>,
  queryHash: string
): Promise<{ hit: boolean; data?: Record<string, unknown> }> {
  const { data, error } = await supabase
    .from("query_cache")
    .select("id, cached_result, hit_count")
    .eq("query_hash", queryHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return { hit: false };

  supabase
    .from("query_cache")
    .update({ hit_count: (data.hit_count || 0) + 1, last_accessed: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});

  return { hit: true, data: data.cached_result as Record<string, unknown> };
}

async function saveToCache(
  supabase: ReturnType<typeof createClient>,
  queryType: string,
  queryInput: string,
  queryHash: string,
  result: Record<string, unknown>
): Promise<void> {
  const ttlHours = getTTLHours(queryType);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  await supabase
    .from("query_cache")
    .upsert({
      query_type: queryType.toLowerCase(),
      query_input: queryInput,
      query_hash: queryHash,
      cached_result: result,
      expires_at: expiresAt,
      hit_count: 0,
      last_accessed: new Date().toISOString(),
    }, { onConflict: "query_hash" });
}

// =============== VEICULOS API FETCH ===============
async function fetchFromVeiculosApi(modulo: string, valor: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("CONSULTAS_API_KEY");
  if (!apiKey) {
    console.error("CONSULTAS_API_KEY not configured!");
    return { error: "⚠️ Chave de API não configurada. Contate o administrador." };
  }

  const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(modulo)}&string=${encodeURIComponent(valor)}`;
  console.log(`[VeiculosAPI] Fetching: modulo=${modulo}, valor=${valor}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

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

// =============== HANDLE QUERY ===============
async function handleQuery(req: QueryRequest, supabase: ReturnType<typeof createClient>): Promise<Record<string, unknown>> {
  const { queryType, queryInput, estado } = req;
  const normalizedType = queryType.toLowerCase();
  const cleanInput = queryInput.replace(/[^\w@.-]/g, "").trim();

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

  // ---- FOTO: national search across state-specific modules ----
  if (normalizedType === "nacional" || (normalizedType === "foto" && !estado)) {
    console.log("[Foto] Starting national photo search via VeiculosAPI...");

    for (const state of fotoStatePriority) {
      const fotoModulo = fotoStateModules[state];
      if (!fotoModulo) continue;

      const result = await fetchFromVeiculosApi(fotoModulo, cleanInput);
      
      // Check if we got valid photo data
      const hasFoto = result && !result.error && !result.notFound;
      if (hasFoto) {
        // Try to extract foto field
        let fotoData = result.foto || result.image || result.url || result.photo || result.fotoBase64 || result.base64;
        if (fotoData && typeof fotoData === 'string') {
          if (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR')) {
            fotoData = `data:image/jpeg;base64,${fotoData}`;
          }
          return { ...result, foto: fotoData, cpf: cleanInput, estado_encontrado: state };
        }
        // Even without explicit foto field, the result may contain data
        if (result.data || Object.keys(result).length > 2) {
          return { ...result, cpf: cleanInput, estado_encontrado: state };
        }
      }
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
        let fotoData = result.foto || result.image || result.url || result.photo || result.fotoBase64 || result.base64;
        if (fotoData && typeof fotoData === 'string' && (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR'))) {
          fotoData = `data:image/jpeg;base64,${fotoData}`;
        }
        return { ...result, foto: fotoData || null, cpf: cleanInput, estado_encontrado: stateUpper };
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
    const normalizedType = queryRequest.queryType.toLowerCase();
    const cleanInput = queryRequest.queryInput.replace(/[^\w@.-]/g, "").trim();

    const cacheKey = normalizedType === "foto" && queryRequest.estado
      ? `${normalizedType}:${cleanInput}:${queryRequest.estado.toUpperCase()}`
      : `${normalizedType}:${cleanInput}`;
    const queryHash = await generateHash(cacheKey, "");

    const cacheResult = await checkCache(supabase, queryHash);

    let result: Record<string, unknown>;
    let fromCache = false;

    if (cacheResult.hit && cacheResult.data) {
      console.log(`Cache HIT for hash: ${queryHash.substring(0, 16)}...`);
      result = cacheResult.data;
      fromCache = true;
    } else {
      console.log(`Cache MISS for hash: ${queryHash.substring(0, 16)}...`);
      result = await handleQuery(queryRequest, supabase);

      if (!result.error && !result.notFound && !result.module_disabled) {
        await saveToCache(supabase, normalizedType, cleanInput, queryHash, result);
        console.log(`Saved to cache with TTL: ${getTTLHours(normalizedType)}h`);
      }
    }

    const duration = Date.now() - startTime;

    // Log query for authenticated users
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    if (userId) {
      const isDisabled = result.module_disabled === true;
      await supabase.from("query_history").insert({
        user_id: userId,
        query_type: queryRequest.queryType,
        query_input: queryRequest.queryInput,
        query_result: result,
        status: result.error ? "error" : isDisabled ? "disabled" : "success",
      });

      if (!fromCache) {
        await supabase.from("api_usage_logs").insert({
          user_id: userId,
          query_type: queryRequest.queryType,
          credits_used: isDisabled ? 0 : 1,
        });
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
        fromCache,
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
