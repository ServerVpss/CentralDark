import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============== VEICULOS API PROVIDER ===============
const VEICULOS_API_BASE = "https://veiculosapi.com/api/proxy";

// Map internal query types to VeiculosAPI module names
const veiculosModuleMap: Record<string, string> = {
  cpf: "cpffull", nome: "nomefull", rg: "rg", titulo: "titulo",
  parentes: "parentes", mae: "maefull", cnh: "cnh", pis: "pis",
  telefone: "telefonefull", email: "emailfull", cep: "cepfull", endereco: "endereco",
  pix: "pix", score: "score", renda: "renda", credilink: "credilink",
  cpf_spc: "cpf-spc", poderaquisitivo: "poderaquisitivo",
  placa: "placa", placa_completa: "placa-serpro", chassi: "chassi",
  renavam: "renavam", motor: "motor",
  cnpj: "cnpj-cred", processos: "processos", bnmp: "bnmp-lc", siel: "siel",
  tse: "tse-3", cpfsus: "cpfsus", placa_sesp: "placa-sesp",
};

// Foto state modules
const fotoStateModules: Record<string, string> = {
  MG: "fotomg", SP: "fotosp", RJ: "fotorj", BA: "fotoba",
  CE: "fotoce", GO: "fotogo", PR: "fotopr", RS: "fotors",
  PE: "fotope", MA: "fotoma", ES: "fotoes", DF: "fotodf", TO: "fototo",
};
const fotoStatePriority = ["SP", "RJ", "MG", "BA", "PR", "RS", "PE", "CE", "GO", "MA", "ES", "DF", "TO"];

// =============== HELPERS ===============
function validateInput(queryType: string, input: string): boolean {
  const cleanInput = input.replace(/[^\w@.]/g, "");
  switch (queryType) {
    case "cpf": case "score": case "foto": case "nacional":
    case "titulo": case "renda": case "mae": case "processos":
    case "bnmp": case "siel": case "tse": case "credilink":
    case "cpf_spc": case "poderaquisitivo": case "cpfsus": case "pis":
    case "parentes": case "endereco":
      return /^\d{11}$/.test(cleanInput);
    case "cnpj":
      return /^\d{14}$/.test(cleanInput);
    case "placa": case "placa_completa":
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

async function fetchFromVeiculosApi(modulo: string, valor: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get("CONSULTAS_API_KEY");
  if (!apiKey) {
    return { error: "⚠️ Chave de API não configurada." };
  }

  const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(modulo)}&string=${encodeURIComponent(valor)}`;
  console.log(`[VeiculosAPI] Fetching: modulo=${modulo}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
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

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { notFound: true, error: "Dados não encontrados" };
      }
      return { data: text, modulo };
    }

    const data = await response.json();
    if (!data || data.error || data.status === "error") {
      return { notFound: true, error: data?.error || "Dados não encontrados" };
    }
    return { ...data, modulo };
  } catch (error) {
    clearTimeout(timeoutId);
    const err = error as Error;
    if (err.name === "AbortError") {
      return { error: "⏱️ Tempo limite excedido. Tente novamente." };
    }
    return { error: "⚠️ Erro de conexão. Tente novamente." };
  }
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

// =============== EXECUTE QUERY ===============
async function executeQuery(queryType: string, queryInput: string, estado?: string): Promise<Record<string, unknown>> {
  const cleanInput = queryInput.replace(/[^\w@.]/g, "");
  const normalizedType = queryType.toLowerCase();

  if (!validateInput(normalizedType, cleanInput)) {
    return { error: `Formato inválido para ${queryType}` };
  }

  // Foto nacional (search all states)
  if (normalizedType === "nacional" || (normalizedType === "foto" && !estado)) {
    for (const state of fotoStatePriority) {
      const modulo = fotoStateModules[state];
      if (!modulo) continue;
      const result = await fetchFromVeiculosApi(modulo, cleanInput);
      if (result && !result.error && !result.notFound) {
        const fotoData = findPhotoInResponse(result);
        if (fotoData) {
          return { ...result, foto: fotoData, cpf: cleanInput, estado_encontrado: state };
        }
        // No actual photo found — continue to next state
        console.log(`[Foto Nacional] ${state}: no photo found, trying next...`);
      }
    }
    return { cpf: cleanInput, foto: null, message: "Foto não encontrada nos estados pesquisados" };
  }

  // Foto specific state
  if (normalizedType === "foto" && estado) {
    const modulo = fotoStateModules[estado.toUpperCase()];
    if (modulo) {
      const result = await fetchFromVeiculosApi(modulo, cleanInput);
      if (result && !result.error && !result.notFound) {
        const fotoData = findPhotoInResponse(result);
        if (fotoData) {
          return { ...result, foto: fotoData, cpf: cleanInput, estado_encontrado: estado.toUpperCase() };
        }
      }
      return { error: `📸 Foto não encontrada no estado ${estado.toUpperCase()}`, notFound: true };
    }
    return { error: `Estado ${estado.toUpperCase()} não disponível.`, notFound: true };
  }

  // Standard queries via VeiculosAPI
  const modulo = veiculosModuleMap[normalizedType];
  if (modulo) {
    return await fetchFromVeiculosApi(modulo, cleanInput);
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
