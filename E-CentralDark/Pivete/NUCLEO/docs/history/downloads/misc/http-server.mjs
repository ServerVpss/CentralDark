import http from "node:http";
import crypto from "node:crypto";
import { parseInvocation } from "./command-parser.mjs";
import { executeInvocation } from "./orchestrator.mjs";
import { sanitizeText } from "./sanitize.mjs";

/**
 * LEIGO: lê um JSON pequeno enviado para a API e rejeita corpo gigante.
 * PROFISSIONAL: faz buffering com limite e parse JSON fail-closed.
 */
async function readJsonBody(request, maxBytes = 1_000_000) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) throw new Error("REQUEST_BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

/**
 * LEIGO: confere a senha da API somente quando você configurou uma.
 * PROFISSIONAL: aplica Bearer token opcional com comparação temporal constante.
 */
function authorized(request, token) {
  if (!token) return true;
  const actual = Buffer.from(String(request.headers.authorization || ""));
  const expected = Buffer.from(`Bearer ${token}`);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/**
 * LEIGO: cria a API local com /health e /v1/universal/execute.
 * PROFISSIONAL: retorna servidor HTTP sem CORS, bind local padrão e o mesmo motor da CLI.
 */
export function createServer(options = {}) {
  const apiToken = options.apiToken ?? process.env.UNIVERSAL_API_TOKEN ?? "";
  return http.createServer(async (request, response) => {
    response.setHeader("content-type", "application/json; charset=utf-8");
    try {
      if (request.method === "GET" && request.url === "/health") {
        response.end(JSON.stringify({ status: "OK" })); return;
      }
      if (request.method !== "POST" || request.url !== "/v1/universal/execute") {
        response.statusCode = 404; response.end(JSON.stringify({ status: "NOT_FOUND" })); return;
      }
      if (!authorized(request, apiToken)) {
        response.statusCode = 401; response.end(JSON.stringify({ status: "UNAUTHORIZED" })); return;
      }
      const body = await readJsonBody(request);
      const argv = [body.command, ...(body.target ? [body.target] : [])];
      if (body.provider) argv.push("--provider", body.provider);
      if (body.model) argv.push("--model", body.model);
      if (body.instruction) argv.push("--instrucao", body.instruction);
      if (body.allowReusedJudge === true) argv.push("--allow-reused-judge", "true");
      const invocation = parseInvocation(argv);
      const result = await executeInvocation(invocation, options);
      response.end(JSON.stringify(result));
    } catch (error) {
      response.statusCode = 400;
      response.end(JSON.stringify({ status: "BLOCKED", error: sanitizeText(error.message, 1000) }));
    }
  });
}
