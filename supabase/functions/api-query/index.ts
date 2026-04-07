import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============== WHITELIST EXATA DOS MÓDULOS ===============
// Cada nome é enviado EXATAMENTE como está para a API externa.
const MODULE_WHITELIST = new Set([
  // Pessoa
  "cpf", "cpffull", "cpf-isk", "nome", "nomefull", "rg", "titulo",
  "parentes", "mae", "maefull", "cnh", "pis",
  // Contato
  "telefone", "telefonefull", "email", "emailfull",
  "cep", "cepfull", "endereco",
  // Financeiro
  "pix", "score", "renda", "credilink", "cpf-spc", "poderaquisitivo",
  // Veículos
  "placa", "placa-serpro", "placa-simples", "placa-sesp",
  "chassi", "renavam", "motor",
  // Empresa
  "cnpj-cred",
  // Justiça
  "processos", "bnmp-lc", "siel",
  // TSE
  "tse-3",
  // SUS
  "cpfsus",
  // Variantes -3
  "rg-3", "pis-3", "cep-3", "email-3", "nome-3",
  "score-3", "parentes-3", "telefone-3",
  // Foto por estado (12 estados VeiculosAPI)
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  // ===== MÓDULOS EXCLUSIVOS ISEEK =====
  // Pessoa/Família
  "pai", "nasc", "nis", "obito", "registro", "nomeabreviadofiltros",
  // Documentos
  "cnham", "cnhrs", "cnhrr", "cnhnc", "oab", "advogadooab", "advogadocpf", "advogadooabuf",
  "catcpf", "catnumero",
  // Financeiro
  "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
  // Governo/Saúde
  "vacinas", "beneficios", "faculdades", "func", "matricula",
  // Justiça
  "mandado", "certidoes", "processo",
  // Trabalho
  "rais",
  // Veículos por CPF
  "veiculos", "crlvto", "crlvmt",
  // Fotos extras iSeek
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
  // ===== MÓDULOS SOBREPOSTOS ISEEK (sufixo -isk) =====
  "cnpj-isk", "rg-isk", "mae-isk", "telefone-isk", "titulo-isk",
  "cnh-isk", "processos-isk", "placa-isk", "renavam-isk", "chassi-isk",
  "motor-isk", "email-isk", "pix-isk", "cep-isk", "parentes-isk",
  "score-isk",
  // Fotos iSeek -isk
  "fotoma-isk", "fotoes-isk", "fototo-isk", "fotorj-isk", "fotosp-isk",
  "fotoce-isk", "fotoms-isk", "fotoro-isk", "fotopr-isk", "fotopi-isk",
  "fotodf-isk", "fotogo-isk",
  "crlvto-foto", "crlvmt-foto",
]);

// Módulos que vão DIRETAMENTE ao iSeek (não passam pelo VeiculosAPI)
const ISEEK_DIRECT_MODULES: Record<string, string> = {
  // Exclusivos iSeek (sem equivalente VeiculosAPI)
  "pai": "iseek-dados---pai",
  "nasc": "iseek-dados---nasc",
  "nis": "iseek-dados---nis",
  "obito": "iseek-dados---obito",
  "registro": "iseek-dados---registro",
  "nomeabreviadofiltros": "iseek-dados---nomeabreviadofiltros",
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
  "dividas": "iseek-dados---dividas",
  "bens": "iseek-dados---bens",
  "irpf": "iseek-dados---irpf",
  "score2": "iseek-dados---score2",
  "cheque": "iseek-dados---cheque",
  "assessoria": "iseek-dados---assessoria",
  "iptu": "iseek-dados---iptu",
  "vacinas": "iseek-dados---vacinas",
  "beneficios": "iseek-dados---beneficios",
  "faculdades": "iseek-dados---faculdades",
  "func": "iseek-dados---func",
  "matricula": "iseek-dados---matricula",
  "mandado": "iseek-dados---mandado",
  "certidoes": "iseek-dados---certidoes",
  "processo": "iseek-dados---processo",
  "rais": "iseek-dados---rais",
  "veiculos": "iseek-dados---veiculos",
  "crlvto": "iseek-dados---crlvto",
  "crlvmt": "iseek-dados---crlvmt",
  "fotoal": "iseek-fotos---fotoal",
  "fotogo": "iseek-fotos---fotogo",
  "fotopb": "iseek-fotos---fotopb",
  "fotope": "iseek-fotos---fotope",
  "fotorn": "iseek-fotos---fotorn",
  "fotonc": "iseek-fotos---fotonc",
  "fotocnh": "iseek-fotos---fotocnh",
  "fotodetran": "iseek-dados---fotodetran",
  "fotomapresos": "iseek-fotos---fotomapresos",
  // Sobrepostos com sufixo -isk (vão direto ao iSeek)
  "cpf-isk": "iseek-cpf",
  "cnpj-isk": "iseek-dados---cnpj",
  "rg-isk": "iseek-dados---rg",
  "mae-isk": "iseek-dados---mae",
  "telefone-isk": "iseek-dados---telefone",
  "titulo-isk": "iseek-dados---titulo",
  "cnh-isk": "iseek-dados---cnh",
  "processos-isk": "iseek-dados---processos",
  "placa-isk": "iseek-dados---placa",
  "renavam-isk": "iseek-dados---renavam",
  "chassi-isk": "iseek-dados---chassi",
  "motor-isk": "iseek-dados---motor",
  "email-isk": "iseek-dados---email",
  "pix-isk": "iseek-dados---pix",
  "cep-isk": "iseek-dados---cep",
  "parentes-isk": "iseek-dados---parentes",
  "score-isk": "iseek-dados---score",
  "fotoma-isk": "iseek-fotos---fotoma",
  "fotoes-isk": "iseek-fotos---fotoes",
  "fototo-isk": "iseek-fotos---fototo",
  "fotorj-isk": "iseek-fotos---fotorj",
  "fotosp-isk": "iseek-fotos---fotosp",
  "fotoce-isk": "iseek-fotos---fotoce",
  "fotoms-isk": "iseek-fotos---fotoms",
  "fotoro-isk": "iseek-fotos---fotoro",
  "fotopr-isk": "iseek-fotos---fotopr",
  "fotopi-isk": "iseek-fotos---fotopi",
  "fotodf-isk": "iseek-fotos---fotodf",
  "fotogo-isk": "iseek-fotos---fotogo",
  "crlvto-foto": "iseek-fotos---crlvto",
  "crlvmt-foto": "iseek-fotos---crlvmt",
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
  "placa", "placa-serpro", "placa-simples", "placa-sesp",
  "processos", "bnmp-lc", "siel", "credilink", "cpf-spc",
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
  "score", "score-3", "tse-3", "poderaquisitivo",
  "certidoes", "mandado", "veiculos", "rais",
  "processo", "crlvto", "crlvmt",
  // iSeek -isk fotos
  "fotoma-isk", "fotoes-isk", "fototo-isk", "fotorj-isk", "fotosp-isk",
  "fotoce-isk", "fotoms-isk", "fotoro-isk", "fotopr-isk", "fotopi-isk",
  "fotodf-isk", "fotogo-isk", "crlvto-foto", "crlvmt-foto",
]);

function getModuleTimeout(modulo: string): number {
  return SLOW_MODULES.has(modulo) ? 60_000 : 30_000;
}

// =============== VALIDAÇÃO DE ENTRADA ===============
const TEXT_MODULES = new Set([
  "nome", "nomefull", "nome-3", "mae", "maefull", "endereco",
  "email", "emailfull", "email-3", "pix",
  "nomeabreviadofiltros", "mae-isk", "email-isk", "pix-isk",
]);

const NUMERIC_MODULES = new Set([
  "cpf", "cpffull", "cpf-isk", "cpf-spc", "cpfsus",
  "rg", "rg-3", "titulo", "cnh", "pis", "pis-3",
  "telefone", "telefonefull", "telefone-3",
  "cep", "cepfull", "cep-3",
  "score", "score-3", "renda", "credilink", "poderaquisitivo",
  "parentes", "parentes-3",
  "renavam", "cnpj-cred",
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  // iSeek exclusivos (CPF-based)
  "pai", "nasc", "nis", "obito", "registro",
  "cnham", "cnhrs", "cnhrr", "cnhnc", "oab", "advogadooab", "advogadocpf",
  "advogadooabuf", "catcpf", "catnumero",
  "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
  "vacinas", "beneficios", "faculdades", "func", "matricula",
  "mandado", "certidoes", "rais", "veiculos", "processo",
  "crlvto", "crlvmt",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
  // iSeek -isk (CPF-based)
  "rg-isk", "titulo-isk", "cnh-isk", "telefone-isk",
  "cep-isk", "parentes-isk", "score-isk", "processos-isk",
  "cnpj-isk", "renavam-isk",
  // Fotos -isk
  "fotoma-isk", "fotoes-isk", "fototo-isk", "fotorj-isk", "fotosp-isk",
  "fotoce-isk", "fotoms-isk", "fotoro-isk", "fotopr-isk", "fotopi-isk",
  "fotodf-isk", "fotogo-isk", "crlvto-foto", "crlvmt-foto",
]);

function cleanQueryValue(modulo: string, input: string): string {
  if (TEXT_MODULES.has(modulo)) return input.trim();
  if (NUMERIC_MODULES.has(modulo)) return input.replace(/\D/g, "").trim();
  // placa, chassi, motor — alfanumérico
  return input.replace(/[^\w]/g, "").trim();
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

  // CPF variants (11 digits)
  const CPF_MODULES = ["cpf", "cpffull", "cpf-isk", "cpf-spc", "cpfsus", "score", "score-3", "renda",
       "credilink", "poderaquisitivo", "parentes", "parentes-3", "processos",
       "bnmp-lc", "siel", "tse-3", "titulo", "mae", "maefull",
       // iSeek exclusivos CPF-based
       "pai", "nasc", "nis", "obito", "registro", "nomeabreviadofiltros",
       "cnham", "cnhrs", "cnhrr", "cnhnc", "oab", "advogadooab", "advogadocpf",
       "advogadooabuf", "catcpf", "catnumero",
       "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
       "vacinas", "beneficios", "faculdades", "func", "matricula",
       "mandado", "certidoes", "rais", "veiculos", "processo",
       "crlvto", "crlvmt",
       // iSeek -isk CPF-based
       "parentes-isk", "score-isk", "processos-isk",
       "titulo-isk", "cnh-isk", "rg-isk", "telefone-isk", "cep-isk"];
  if (CPF_MODULES.includes(modulo) || modulo.startsWith("foto")) {
    if (!/^\d{11}$/.test(clean)) {
      return { valid: false, error: "CPF deve conter exatamente 11 dígitos." };
    }
  }

  if (["cnpj-cred", "cnpj-isk"].includes(modulo)) {
    if (!/^\d{14}$/.test(clean)) {
      return { valid: false, error: "CNPJ deve conter exatamente 14 dígitos." };
    }
  }

  if (["placa", "placa-serpro", "placa-simples", "placa-sesp", "placa-isk"].includes(modulo)) {
    if (!/^[A-Z0-9]{7}$/i.test(clean)) {
      return { valid: false, error: "Placa deve conter 7 caracteres alfanuméricos." };
    }
  }

  if (["cep", "cepfull", "cep-3"].includes(modulo)) {
    if (!/^\d{8}$/.test(clean)) {
      return { valid: false, error: "CEP deve conter exatamente 8 dígitos." };
    }
  }

  if (["telefone", "telefonefull", "telefone-3"].includes(modulo)) {
    if (!/^\d{10,11}$/.test(clean)) {
      return { valid: false, error: "Telefone deve conter 10 ou 11 dígitos (DDD + número)." };
    }
  }

  if (["email", "emailfull", "email-3"].includes(modulo)) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return { valid: false, error: "Formato de email inválido." };
    }
  }

  if (["nome", "nomefull", "nome-3"].includes(modulo)) {
    if (clean.length < 3) {
      return { valid: false, error: "Nome deve ter pelo menos 3 caracteres." };
    }
  }

  if (["rg", "rg-3"].includes(modulo)) {
    if (!/^\d{5,12}$/.test(clean)) {
      return { valid: false, error: "RG deve conter entre 5 e 12 dígitos." };
    }
  }

  if (["pis", "pis-3"].includes(modulo)) {
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
  // Trunca valores longos (base64, fotos) mas preserva estrutura
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
  const apiKey = Deno.env.get("CONSULTAS_API_KEY");
  if (!apiKey) {
    return {
      data: { error: "⚠️ Chave de API não configurada. Contate o administrador." },
      provider_duration_ms: 0,
      retried: false,
    };
  }

  const timeoutMs = getModuleTimeout(modulo);
  const url = `${VEICULOS_API_BASE}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(modulo)}&string=${encodeURIComponent(valor)}`;
  console.log(`[Provider] modulo=${modulo}, timeout=${timeoutMs / 1000}s${retry ? " (retry)" : ""}`);

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
      // Retry for 5xx
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
    logData("PROVIDER_RAW", { modulo, provider: "veiculosapi", duration_ms: provider_duration_ms, retried: retry, keys: data ? Object.keys(data) : [], data });

    if (data === null || data === undefined) {
      return { data: { notFound: true, message: "Dados não encontrados" }, provider_duration_ms, retried: retry };
    }
    if (data.error || data.status === "error") {
      logData("PROVIDER_ERROR", { modulo, error: data.error || data.message });
      return { data: { notFound: true, message: data.error || data.message || "Dados não encontrados" }, provider_duration_ms, retried: retry };
    }

    return { data: { ...data, modulo }, provider_duration_ms, retried: retry };
  } catch (err) {
    clearTimeout(timeoutId);
    const error = err as Error;
    const provider_duration_ms = Date.now() - providerStart;

    if (error.name === "AbortError") {
      // Retry once for timeout
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

// =============== ISEEK FALLBACK ===============
// Mapeamento: módulo VeiculosAPI → módulo equivalente no iSeek
const ISEEK_FALLBACK_MODULES: Record<string, string> = {
  // CPF / Pessoa
  "cpf": "iseek-cpf",
  "cpffull": "iseek-cpf",
  "cpf-isk": "iseek-cpf",
  "cpfsus": "iseek-cpf",
  // Nome
  "nome": "iseek-dados---nomeabreviadofiltros",
  "nomefull": "iseek-dados---nomeabreviadofiltros",
  "nome-3": "iseek-dados---nomeabreviadofiltros",
  // Família
  "parentes": "iseek-dados---parentes",
  "parentes-3": "iseek-dados---parentes",
  "mae": "iseek-dados---mae",
  "maefull": "iseek-dados---mae",
  // Documentos
  "rg": "iseek-dados---rg",
  "rg-3": "iseek-dados---rg",
  "titulo": "iseek-dados---titulo",
  "cnh": "iseek-dados---cnh",
  "pis": "iseek-dados---nis",
  "pis-3": "iseek-dados---nis",
  // Contato
  "telefone": "iseek-dados---telefone",
  "telefonefull": "iseek-dados---telefone",
  "telefone-3": "iseek-dados---telefone",
  "email": "iseek-dados---email",
  "emailfull": "iseek-dados---email",
  "email-3": "iseek-dados---email",
  "cep": "iseek-dados---cep",
  "cepfull": "iseek-dados---cep",
  "cep-3": "iseek-dados---cep",
  // Financeiro
  "pix": "iseek-dados---pix",
  "score": "iseek-dados---score",
  "score-3": "iseek-dados---score",
  "renda": "iseek-dados---score2",
  "credilink": "iseek-dados---score2",
  "cpf-spc": "iseek-dados---dividas",
  "poderaquisitivo": "iseek-dados---score2",
  // Veículos
  "placa": "iseek-dados---placa",
  "placa-serpro": "iseek-dados---placa",
  "placa-sesp": "iseek-dados---placa",
  "chassi": "iseek-dados---chassi",
  "renavam": "iseek-dados---renavam",
  "motor": "iseek-dados---motor",
  // Empresa
  "cnpj-cred": "iseek-dados---cnpj",
  // Justiça
  "processos": "iseek-dados---processos",
  "bnmp-lc": "iseek-dados---mandado",
  // Foto por estado
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
};

async function fetchFromIseek(iseekModulo: string, valor: string): Promise<ProviderResult> {
  const apiBase = Deno.env.get("ISEEK_API_BASE");
  const apiKey = Deno.env.get("ISEEK_API_KEY");
  if (!apiBase || !apiKey) {
    return { data: { error: "iSeek não configurado" }, provider_duration_ms: 0, retried: false };
  }

  const url = `${apiBase}?apikey=${encodeURIComponent(apiKey)}&modulo=${encodeURIComponent(iseekModulo)}&string=${encodeURIComponent(valor)}`;
  console.log(`[iSeek] modulo=${iseekModulo}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    if (!response.ok) {
      return { data: { error: `iSeek erro: ${response.status}` }, provider_duration_ms: duration, retried: false };
    }

    const raw = await response.json();
    logData("ISEEK_RAW", { modulo: iseekModulo, provider: "iseek", duration_ms: duration, rawKeys: raw ? Object.keys(raw) : [], raw });

    // iSeek retorna { status: 200, data: { ... } }
    const innerData = (raw && typeof raw === "object" && raw.data && typeof raw.data === "object")
      ? raw.data
      : raw;

    logData("ISEEK_PARSED", { modulo: iseekModulo, innerKeys: innerData ? Object.keys(innerData) : [], hasError: !!(innerData?.error), innerData });

    if (!innerData || innerData.error || innerData.status === "error") {
      logData("ISEEK_NOT_FOUND", { modulo: iseekModulo, error: innerData?.error, message: innerData?.message });
      return { data: { notFound: true, message: innerData?.error || innerData?.message || "Dados não encontrados" }, provider_duration_ms: duration, retried: false };
    }

    return { data: { ...stripAdminFields(innerData), modulo: iseekModulo, fallback_provider: "iseek" }, provider_duration_ms: duration, retried: false };
  } catch (err) {
    clearTimeout(timeoutId);
    const duration = Date.now() - start;
    const error = err as Error;
    if (error.name === "AbortError") {
      return { data: { error: "iSeek timeout" }, provider_duration_ms: duration, retried: false };
    }
    return { data: { error: "iSeek conexão falhou" }, provider_duration_ms: duration, retried: false };
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

// Mapa reverso: module_key VeiculosAPI → module_key iSeek equivalente no banco
const ISEEK_ALT_KEYS: Record<string, string> = {
  cpf: "cpf-isk", cpffull: "cpf-isk",
  "cnpj-cred": "cnpj-isk",
  placa: "placa-isk", "placa-serpro": "placa-isk", "placa-sesp": "placa-isk",
  telefone: "telefone-isk", telefonefull: "telefone-isk", "telefone-3": "telefone-isk",
  email: "email-isk", emailfull: "email-isk", "email-3": "email-isk",
  cep: "cep-isk", cepfull: "cep-isk", "cep-3": "cep-isk",
  score: "score-isk", "score-3": "score-isk",
  rg: "rg-isk", "rg-3": "rg-isk",
  cnh: "cnh-isk",
  pix: "pix-isk",
  mae: "mae-isk", maefull: "mae-isk",
  titulo: "titulo-isk",
  processos: "processos-isk",
  "parentes-3": "parentes-isk",
  fotosp: "fotosp-isk", fotorj: "fotorj-isk", fotopr: "fotopr-isk",
  fotoce: "fotoce-isk", fotoma: "fotoma-isk", fotoes: "fotoes-isk",
  fotodf: "fotodf-isk", fototo: "fototo-isk", fotoms: "fotoms-isk",
  fotoro: "fotoro-isk", fotopi: "fotopi-isk", fotogo: "fotogo-isk",
  renavam: "renavam-isk", chassi: "chassi-isk", motor: "motor-isk",
};

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

  // Se o módulo primário está ativo, liberar
  if (cachedModuleStatus[modulo] === true) return true;

  // Se desativado, verificar se o fallback iSeek está ativo
  const altKey = ISEEK_ALT_KEYS[modulo];
  if (altKey && cachedModuleStatus[altKey] === true) {
    console.log(`[ModuleCheck] ${modulo} desativado, mas ${altKey} (iSeek) está ativo — liberando`);
    return true;
  }

  return false;
}

// =============== INTERFACE ===============
interface QueryRequest {
  queryType: string;
  queryInput: string;
  estado?: string;
  channel?: string; // "telegram" | "admin_panel"
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
  const errors: string[] = [];

  // Build standard meta helper
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

  // 2. DB enable/disable check (for non-virtual modules)
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
    // Virtual module (foto/nacional) — basic CPF validation
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

  // ---- MÓDULO DIRETO ISEEK (exclusivos) ----
  if (ISEEK_DIRECT_MODULES[modulo]) {
    const iseekModulo = ISEEK_DIRECT_MODULES[modulo];
    console.log(`[iSeek Direct] modulo=${modulo} → ${iseekModulo}`);
    const iseekResult = await fetchFromIseek(iseekModulo, cleanInput);

    if (iseekResult.data.error) {
      return {
        success: false,
        data: iseekResult.data,
        meta: buildMeta("error", iseekResult.provider_duration_ms),
        errors: [String(iseekResult.data.error)],
      };
    }

    if (iseekResult.data.notFound) {
      return {
        success: true,
        data: iseekResult.data,
        meta: buildMeta("not_found", iseekResult.provider_duration_ms),
        errors: [],
      };
    }

    return {
      success: true,
      data: iseekResult.data,
      meta: { ...buildMeta("success", iseekResult.provider_duration_ms), provider: "iseek" } as any,
      errors: [],
    };
  }

  // ---- MÓDULO PADRÃO (VeiculosAPI + fallback iSeek) ----

  // Se o módulo VeiculosAPI está DESATIVADO no banco mas o iSeek equivalente está ativo,
  // pular direto ao iSeek sem perder tempo com VeiculosAPI (evita timeout de 60s+)
  const primaryDisabledInDb = cachedModuleStatus && modulo in cachedModuleStatus && cachedModuleStatus[modulo] === false;
  const iseekFallbackModulo = ISEEK_FALLBACK_MODULES[modulo];

  if (primaryDisabledInDb && iseekFallbackModulo) {
    console.log(`[SmartRoute] ${modulo} desativado no banco, indo direto ao iSeek (${iseekFallbackModulo})`);
    const iseekResult = await fetchFromIseek(iseekFallbackModulo, cleanInput);

    if (!iseekResult.data.error && !iseekResult.data.notFound) {
      return {
        success: true,
        data: iseekResult.data,
        meta: { ...buildMeta("success", iseekResult.provider_duration_ms), provider: "iseek" } as any,
        errors: [],
      };
    }

    // iSeek também falhou
    if (iseekResult.data.error) {
      return {
        success: false,
        data: iseekResult.data,
        meta: buildMeta("error", iseekResult.provider_duration_ms),
        errors: [String(iseekResult.data.error)],
      };
    }
    return {
      success: true,
      data: iseekResult.data,
      meta: buildMeta("not_found", iseekResult.provider_duration_ms),
      errors: [],
    };
  }

  const result = await fetchFromProvider(modulo, cleanInput);
  const primaryFailed = !!(result.data.error || result.data.notFound);

  // Tentar fallback iSeek se o provedor primário falhou
  if (primaryFailed && iseekFallbackModulo) {
    console.log(`[Fallback] Primário falhou para ${modulo}, tentando iSeek (${iseekFallbackModulo})...`);
    const fallbackResult = await fetchFromIseek(iseekFallbackModulo, cleanInput);

    if (!fallbackResult.data.error && !fallbackResult.data.notFound) {
      const totalProviderMs = result.provider_duration_ms + fallbackResult.provider_duration_ms;
      console.log(`[Fallback] iSeek retornou dados com sucesso para ${modulo}`);
      return {
        success: true,
        data: fallbackResult.data,
        meta: { ...buildMeta("success", totalProviderMs), fallback_provider: "iseek" } as any,
        errors: [],
      };
    }
    console.log(`[Fallback] iSeek também falhou para ${modulo}`);
  }

  // Retornar resultado original
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

    // Structured log with full response data
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
