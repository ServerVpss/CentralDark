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

// API Provider configurations
const providers: Record<string, ApiProvider> = {
  nexfuture: {
    baseUrl: "http://nxf-2.nexfuture.com.br",
    port: 25589,
  },
  tconect_score: {
    baseUrl: "http://node.tconect.xyz",
    port: 3041, // Porta correta para score
  },
  tconect_placa: {
    baseUrl: "http://node.tconect.xyz",
    port: 3041, // Porta correta para placa completa
  },
  tconect_foto: {
    baseUrl: "http://node.tconect.xyz",
    port: 3030, // Porta correta para fotos (igual telegram-api-query)
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

    // Handle 404 as "not found" instead of error
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
    return await fetchFromProvider(providers.nexfuture, endpoint, normalizedType, cleanInput);
  }

  // TConect Score
  if (normalizedType === "score") {
    return await fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput);
  }

  // TConect Placa Completa - usa porta 3041
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

  // TConect Nacional (search all states for photo)
  if (normalizedType === "nacional") {
    console.log("Starting national photo search across all states...");
    const results: Record<string, unknown> = {};
    
    // Search all states in parallel (in batches to avoid overwhelming the API)
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

    // Suporte GET via query params
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
      // POST - comportamento original
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
    const result = await handleQuery(queryRequest);
    const duration = Date.now() - startTime;

    console.log(`Query completed in ${duration}ms`);

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

      await supabase.from("api_usage_logs").insert({
        user_id: userId,
        query_type: queryRequest.queryType,
        credits_used: 1,
      });
    }

    // Determine if it's a real error or just "not found"
    const isNotFound = result.notFound === true;
    const isError = result.error && !isNotFound;

    return new Response(
      JSON.stringify({
        success: !isError,
        data: result,
        duration_ms: duration,
      }),
      {
        status: isError ? 400 : 200,
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
