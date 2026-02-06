import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============== API PROVIDERS ===============
interface ApiProvider {
  baseUrl: string;
  port: number;
}

const providers: Record<string, ApiProvider> = {
  nexfuture: { baseUrl: "http://nxf-2.nexfuture.com.br", port: 25589 },
  nexfuture_cpf: { baseUrl: "http://nxf-2.nexfuture.com.br", port: 25594 },
  tconect_score: { baseUrl: "http://node.tconect.xyz", port: 3029 },
  tconect_foto: { baseUrl: "http://node.tconect.xyz", port: 3030 },
};

const nexfutureEndpoints: Record<string, string> = {
  cpf: "/cpf", cnpj: "/cnpj", placa: "/placa", telefone: "/telefone",
  rg: "/rg", cns: "/cns", cnh: "/cnh", nome: "/nome", parentes: "/parentes",
  empregos: "/empregos", email: "/email", cep: "/cep", pix: "/pix",
  chassi: "/chassi", renavam: "/renavam", motor: "/motor", frota: "/frota", bin: "/bin",
};

const brazilianStates = ["RJ", "BA", "MA", "SP", "ES", "CE", "PI"];

// =============== HELPERS ===============
function validateInput(queryType: string, input: string): boolean {
  const cleanInput = input.replace(/[^\w@.]/g, "");
  switch (queryType) {
    case "cpf":
    case "score":
    case "foto":
    case "nacional":
      return /^\d{11}$/.test(cleanInput);
    case "cnpj":
      return /^\d{14}$/.test(cleanInput);
    case "placa":
    case "placa_completa":
      return /^[A-Z0-9]{7}$/i.test(cleanInput);
    case "cep":
      return /^\d{8}$/.test(cleanInput);
    case "telefone":
      return /^\d{10,11}$/.test(cleanInput);
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput);
    case "nome":
      return cleanInput.length >= 3;
    default:
      return cleanInput.length >= 1;
  }
}

async function fetchFromProvider(
  provider: ApiProvider,
  endpoint: string,
  paramName: string,
  paramValue: string,
  extraParams?: Record<string, string>
): Promise<Record<string, unknown>> {
  const url = new URL(`${provider.baseUrl}:${provider.port}${endpoint}`);
  url.searchParams.set(paramName, paramValue);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
  }

  console.log(`Fetching: ${url.toString()}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      return { notFound: true, error: "Dados não encontrados" };
    }

    if (!response.ok) {
      return { error: `Erro na API: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === "AbortError") {
      return { error: "Timeout na consulta" };
    }
    return { error: (error as Error).message };
  }
}

async function fetchFromProviderWithTimeout(
  provider: ApiProvider,
  endpoint: string,
  paramName: string,
  paramValue: string,
  extraParams?: Record<string, string>,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = new URL(`${provider.baseUrl}:${provider.port}${endpoint}`);
  url.searchParams.set(paramName, paramValue);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
  }

  console.log(`Fetching with timeout: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal,
    });

    if (response.status === 404) {
      return { notFound: true, error: "Dados não encontrados" };
    }

    if (!response.ok) {
      return { error: `Erro na API: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return { error: "Timeout na consulta" };
    }
    return { error: (error as Error).message };
  }
}

// =============== EXECUTE QUERY ===============
async function executeQuery(queryType: string, queryInput: string, estado?: string): Promise<Record<string, unknown>> {
  const cleanInput = queryInput.replace(/[^\w@.]/g, "");
  const normalizedType = queryType.toLowerCase();

  if (!validateInput(normalizedType, cleanInput)) {
    return { error: `Formato inválido para ${queryType}` };
  }

  // Score - TConect
  if (normalizedType === "score") {
    return await fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput);
  }

  // Placa completa - merge placa + renavam
  if (normalizedType === "placa_completa") {
    const [placaResult, renavamResult] = await Promise.all([
      fetchFromProvider(providers.nexfuture, "/placa", "placa", cleanInput),
      fetchFromProvider(providers.nexfuture, "/renavam", "placa", cleanInput),
    ]);

    return {
      ...placaResult,
      renavam_info: renavamResult,
      consulta_tipo: "placa_completa",
    };
  }

  // Standard NexFuture queries
  if (nexfutureEndpoints[normalizedType]) {
    const endpoint = nexfutureEndpoints[normalizedType];
    const paramName = normalizedType === "placa" ? "placa" : normalizedType;
    // CPF usa provider específico com porta 25594
    const provider = normalizedType === "cpf" ? providers.nexfuture_cpf : providers.nexfuture;
    return await fetchFromProvider(provider, endpoint, paramName, cleanInput);
  }

  // TConect Foto - with specific state
  if (normalizedType === "foto" && estado) {
    const result = await fetchFromProvider(
      providers.tconect_foto,
      "/foto",
      "cpf",
      cleanInput,
      { estado: estado.toUpperCase() }
    );

    if (result.notFound || result.status === 404) {
      return {
        error: `📸 Foto não encontrada no estado ${estado.toUpperCase()}\n\n💡 Dica: Use /foto ${cleanInput} (sem estado) para buscar em todos os estados.`,
        notFound: true
      };
    }
    return result;
  }

  // TConect Foto - search ALL states (nacional)
  if (normalizedType === "foto" || normalizedType === "nacional") {
    console.log(`Starting national photo search across all states...`);
    const results: Record<string, Record<string, unknown>> = {};
    let foundFoto: unknown = null;
    let foundEstado: string | null = null;

    for (const state of brazilianStates) {
      console.log(`Searching photo in ${state}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const result = await fetchFromProviderWithTimeout(
          providers.tconect_foto,
          "/foto",
          "cpf",
          cleanInput,
          { estado: state },
          controller.signal
        );
        clearTimeout(timeoutId);

        let fotoData = result?.foto || result?.image || result?.url || result?.photo || result?.fotoBase64 || result?.base64;

        if (fotoData && typeof fotoData === 'string') {
          if (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR')) {
            fotoData = `data:image/jpeg;base64,${fotoData}`;
          }
        }

        if (result && !result.error && !result.notFound && fotoData) {
          results[state] = { ...result, foto: fotoData };
          foundFoto = fotoData;
          foundEstado = state;
          console.log(`Photo found in ${state}! Stopping search.`);
          break;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.log(`Error for state ${state}:`, (err as Error).message);
      }
    }

    if (foundFoto && foundEstado && results[foundEstado]) {
      return {
        ...results[foundEstado],
        estado_encontrado: foundEstado,
        cpf: cleanInput
      };
    }

    return {
      cpf: cleanInput,
      estados_encontrados: Object.keys(results),
      total_fotos: Object.keys(results).length,
      foto: null,
      nome: null,
      message: "Foto não encontrada nos estados pesquisados",
      resultados: results,
    };
  }

  return { error: `Tipo de consulta não suportado: ${queryType}` };
}

// =============== MAIN HANDLER ===============
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { queryType, queryInput, estado } = body;

    if (!queryType || !queryInput) {
      return new Response(JSON.stringify({ error: 'Missing queryType or queryInput' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await executeQuery(queryType, queryInput, estado);

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Query error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
