// hermes_delegar_tarefa — ponte de delegação para A2A/Hermes já publicado
// sem criar outro executor, servidor ou pipeline de mensageria.
//
// Regra de borda: esta tool NÃO executa destrutivamente. Ela só prepara e
// expede o envento de delegação. Se a rota A2A não estiver alcanc¸avel
// neste runtime, retorna "OUTBOUND_PENDING", nunca falha fechada.
import { z } from "zod";
import { randomUUID } from "node:crypto";

const A2A_SEND_PATH = (() => {
  const raw = process.env.A2A_SEND_PATH?.trim();
  if (!raw) return "/a2a/";
  return raw.replace(/^\/+/, "/");
})();

const A2A_TIMEOUT_MS = Number(process.env.A2A_TIMEOUT_MS ?? 20000);

// Valida somente a estrutura da URL de delegação. O token de autenticacao
// é consumido pelo servidor da CentralDark e nunca aqui.
function a2aBase() {
  const raw = process.env.A2A_PUBLIC_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.username || u.password || u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

async function a2aSend(method, params) {
  const base = a2aBase();
  if (!base) {
    return { ok: false, state: "A2A_CONFIG_UNAVAILABLE", value: null };
  }
  const target = new URL(A2A_SEND_PATH, base);
  const body = {
    jsonrpc: "2.0",
    id: randomUUID(),
    method,
    params: { ...params },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), A2A_TIMEOUT_MS);
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { ok: false, state: "A2A_RESPONSE_NOT_JSON", http: res.status, raw: rawText.slice(0, 300) };
    }
    return { ok: res.ok, state: res.ok ? "A2A_DELEGATION_SEND_OK" : "A2A_DELEGATION_SEND_REJECTED", value: data, http: res.status };
  } catch (error) {
    return {
      ok: false,
      state: error?.name === "AbortError" ? "A2A_DELEGATION_TIMEOUT" : "A2A_DELEGATION_NET_FAIL",
      reason: String((error?.cause?.code || error?.code || error?.message || error).slice(0, 300)),
    };
  } finally {
    clearTimeout(timer);
  }
}

const objetivo = z.string().min(1).max(6000);
const identificador = z.string().max(160).regex(/^[A-Za-z0-9._:@-]+$/).optional();
const tarefa = z.string().max(12000).optional();
const requisitos = z
    .array(z.string().max(500))
    .refine((v) => v == null || v.length <= 40, { message: "requisitos deve ter no máximo 40 itens" });
const contexto = z
    .record(z.string(), z.unknown())
    .refine((v) => v == null || Object.keys(v).length <= 4000, { message: "contexto deve ter no máximo 4000 chaves" });
const entregarEm = z.string().url().max(500).optional();
const autorizacoes = z
    .array(z.string().max(200))
    .refine((v) => v == null || v.length <= 30, { message: "autorizacoes deve ter no máximo 30 itens" });

const DELEGATION_A2A_TOOL = {
  name: "hermes_delegar_tarefa",
  description:
    "Recupera autenticacao e roteia uma tarefa para A2A/Hermes publicado. Não executa destrutivamente; somente prepara e delega. Confirme a entrega com o recibo de volta.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    title: "Delegar tarefa para A2A/Hermes",
  },
  inputSchema: z.object({
    objetivo: objetivo,
    tarefa: tarefa,
    identificador: identificador,
    contexto: contexto,
    requisitos: requisitos,
    entregarEm: entregarEm,
    autorizacoes: autorizacoes,
  }),
  handler: async (input) => {
    const payload = {
      objetivo: input.objetivo,
      tarefa: input.tarefa ?? null,
      identificador: input.identificador ?? null,
      contexto: input.contexto ?? null,
      requisitos: input.requisitos ?? null,
      entregarEm: input.entregarEm ?? null,
      autorizacoes: input.autorizacoes ?? null,
    };
    const outbound = await a2aSend("tasks/create", payload);
    return {
      ok: true,
      tool: "hermes_delegar_tarefa",
      status: outbound.state === "A2A_DELEGATION_SEND_OK" ? "DELEGADO_ENVIADO" : "DELEGADO_OUTBOUND_PENDING",
      handler: "hermes_delegar_tarefa",
      proof: "TOOL_REGISTERED_READ_ONLY_DELEGATION",
      payload,
      outbound,
      configuracao: {
        a2aPublicUrl: process.env.A2A_PUBLIC_URL ? "definida" : "NAO_DEFINIDA",
        a2aSendPath: A2A_SEND_PATH,
      },
      readbackRequired: true,
      auditIdempotency: input.identificador ?? null,
    };
  },
};

export { DELEGATION_A2A_TOOL };
