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

interface ApiProvider {
  baseUrl: string;
  port: number;
}

// TTL configurations per query type (in hours)
const cacheTTL: Record<string, number> = {
  cpf: 24,
  cnpj: 24,
  placa: 12,
  placa_completa: 12,
  placa2: 12,
  score: 6,
  foto: 168, // 7 days
  nacional: 168, // 7 days
  telefone: 24,
  email: 24,
  cep: 720, // 30 days
  nome: 24,
  rg: 24,
  cnh: 24,
  pix: 24,
  parentes: 24,
  empregos: 24,
  chassi: 24,
  renavam: 24,
  motor: 24,
  frota: 24,
  bin: 24,
  cns: 24,
};

// API Provider configurations
const providers: Record<string, ApiProvider> = {
  nexfuture: {
    baseUrl: "http://nxf-2.nexfuture.com.br",
    port: 25589,
  },
  nexfuture_cpf: {
    baseUrl: "http://nxf-2.nexfuture.com.br",
    port: 25594,
  },
  tconect_score: {
    baseUrl: "http://node.tconect.xyz",
    port: 3036,
  },
  tconect_placa: {
    baseUrl: "http://node.tconect.xyz",
    port: 3041,
  },
  tconect_foto: {
    baseUrl: "http://node.tconect.xyz",
    port: 3030,
  },
};

// NexFuture endpoints
const nexfutureEndpoints: Record<string, string> = {
  cpf: "/cpf",
  cnpj: "/cnpj",
  placa: "/placa",
  telefone: "/telefone",
  rg: "/rg",
  cns: "/cns",
  cnh: "/cnh",
  nome: "/nome",
  parentes: "/parentes",
  empregos: "/empregos",
  email: "/email",
  cep: "/cep",
  pix: "/pix",
  chassi: "/chassi",
  renavam: "/renavam",
  motor: "/motor",
  frota: "/frota",
  bin: "/bin",
};

// Brazilian states for national photo search
const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Generate a simple hash for cache key
async function generateHash(queryType: string, queryInput: string): Promise<string> {
  const text = `${queryType.toLowerCase()}:${queryInput}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Get TTL for query type
function getTTLHours(queryType: string): number {
  return cacheTTL[queryType.toLowerCase()] || 24;
}

// Check cache for existing result
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

  if (error || !data) {
    return { hit: false };
  }

  // Update hit count and last accessed
  await supabase
    .from("query_cache")
    .update({ 
      hit_count: (data.hit_count || 0) + 1, 
      last_accessed: new Date().toISOString() 
    })
    .eq("id", data.id);

  return { hit: true, data: data.cached_result as Record<string, unknown> };
}

// Save result to cache
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
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.status === 404) {
      console.log(`Data not found (404) for: ${url.toString()}`);
      return { notFound: true, message: "Dados não encontrados" };
    }

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

async function handleQuery(req: QueryRequest): Promise<Record<string, unknown>> {
  const { queryType, queryInput, estado } = req;
  const normalizedType = queryType.toLowerCase();
  const cleanInput = queryInput.replace(/[^\w@.-]/g, "").trim();

  console.log(`Processing query: type=${normalizedType}, input=${cleanInput}`);

  // NexFuture queries
  if (nexfutureEndpoints[normalizedType]) {
    const endpoint = nexfutureEndpoints[normalizedType];
    // CPF usa provider específico com porta 25594
    const provider = normalizedType === "cpf" ? providers.nexfuture_cpf : providers.nexfuture;
    return await fetchFromProvider(provider, endpoint, normalizedType, cleanInput);
  }

  // TConect Score - enriquecido com dados do CPF
  if (normalizedType === "score") {
    // Primeiro verificar se já temos cache de CPF para este input
    const cpfCacheKey = `cpf:${cleanInput}`;
    const cpfCacheHash = await generateHash(cpfCacheKey, "");
    const cpfCacheResult = await checkCache(
      createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      ),
      cpfCacheHash
    );

    // Buscar Score (sempre necessário)
    const scoreResult = await fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput);
    
    // Extrair nome e nascimento do cache de CPF ou buscar da API
    let nome: string | null = null;
    let nascimento: string | null = null;
    
    let cpfData: string | null = null;
    
    if (cpfCacheResult.hit && cpfCacheResult.data) {
      // Usar dados do cache de CPF
      console.log("Using CPF data from cache for score enrichment");
      cpfData = typeof cpfCacheResult.data.data === "string" 
        ? cpfCacheResult.data.data 
        : JSON.stringify(cpfCacheResult.data);
    } else {
      // Buscar da API de CPF (usando provider específico com porta 25594)
      console.log("Fetching CPF data for score enrichment...");
      const cpfResult = await fetchFromProvider(providers.nexfuture_cpf, "/cpf", "cpf", cleanInput);
      
      if (cpfResult && !cpfResult.error) {
        cpfData = typeof cpfResult.data === "string" 
          ? cpfResult.data 
          : JSON.stringify(cpfResult);
      }
    }
    
    if (cpfData) {
      // Extrair NOME (suporta diferentes separadores)
      const nomeMatch = cpfData.match(/NOME\s*[⎯\-:]\s*([^\n]+)/i);
      if (nomeMatch) nome = nomeMatch[1].trim();
      
      // Extrair NASCIMENTO
      const nascMatch = cpfData.match(/NASCIMENTO\s*[⎯\-:]\s*([^\n]+)/i);
      if (nascMatch) nascimento = nascMatch[1].trim();
    }
    
    // Mesclar Score com dados pessoais
    return {
      ...scoreResult,
      cpf: cleanInput,
      nome: nome || undefined,
      nascimento: nascimento || undefined,
      consulta_tipo: "score_enriquecido"
    };
  }

  // TConect Placa Completa
  if (normalizedType === "placa_completa" || normalizedType === "placa2") {
    return await fetchFromProvider(providers.tconect_placa, "/placa1", "placa", cleanInput);
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

  // TConect Nacional (search all states for photo) - also handles /foto without estado
  if (normalizedType === "nacional" || (normalizedType === "foto" && !estado)) {
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

    // Support GET via query params
    if (req.method === "GET") {
      const url = new URL(req.url);
      const tipo = url.searchParams.get("tipo");
      const valor = url.searchParams.get("valor");
      const estado = url.searchParams.get("estado");

      if (!tipo || !valor) {
        return new Response(
          JSON.stringify({ 
            error: "Parâmetros 'tipo' e 'valor' são obrigatórios",
            exemplo: "?tipo=telefone&valor=11999999999",
            tipos_disponiveis: Object.keys(nexfutureEndpoints).concat(["score", "foto", "nacional", "placa_completa"])
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      queryRequest = {
        queryType: tipo,
        queryInput: valor,
        estado: estado || undefined
      };
      console.log("GET request params:", JSON.stringify(queryRequest));
    } else {
      queryRequest = await req.json();
      console.log("POST request body:", JSON.stringify(queryRequest));
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
    
    // Generate cache key (include estado for foto queries)
    const cacheKey = normalizedType === "foto" && queryRequest.estado 
      ? `${normalizedType}:${cleanInput}:${queryRequest.estado.toUpperCase()}`
      : `${normalizedType}:${cleanInput}`;
    const queryHash = await generateHash(cacheKey, "");

    // Check cache first
    const cacheResult = await checkCache(supabase, queryHash);
    
    let result: Record<string, unknown>;
    let fromCache = false;

    if (cacheResult.hit && cacheResult.data) {
      // CACHE HIT
      console.log(`Cache HIT for hash: ${queryHash.substring(0, 16)}...`);
      result = cacheResult.data;
      fromCache = true;
    } else {
      // CACHE MISS - fetch from external API
      console.log(`Cache MISS for hash: ${queryHash.substring(0, 16)}...`);
      result = await handleQuery(queryRequest);
      
      // Only cache successful results (not errors or not found)
      if (!result.error && !result.notFound) {
        await saveToCache(supabase, normalizedType, cleanInput, queryHash, result);
        console.log(`Saved to cache with TTL: ${getTTLHours(normalizedType)}h`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Query completed in ${duration}ms (fromCache: ${fromCache})`);

    // Log query for authenticated users
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    if (userId) {
      await supabase.from("query_history").insert({
        user_id: userId,
        query_type: queryRequest.queryType,
        query_input: queryRequest.queryInput,
        query_result: result,
        status: result.error ? "error" : "success",
      });

      // Only count credits for non-cached results
      if (!fromCache) {
        await supabase.from("api_usage_logs").insert({
          user_id: userId,
          query_type: queryRequest.queryType,
          credits_used: 1,
        });
      }
    }

    const isNotFound = result.notFound === true;
    const isError = result.error && !isNotFound;

    // Always return 200 to allow the bot to process the response
    // The error information is in the response body
    return new Response(
      JSON.stringify({
        success: !isError,
        data: result,
        duration_ms: duration,
        fromCache,
        error: isError ? result.error : undefined,
      }),
      {
        status: 200, // Always 200 so callers can process the response
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
