// Gateway local minimo para a SOL Desktop POC.
// Zero dependencia. Node 18+. Escuta em 127.0.0.1:8787.
//
//   node scripts/sol-gateway-local.mjs
//
// Responde { text, receipt } no formato que src/lib/gateway.ts espera.
// READ-ONLY por contrato: nunca executa mutacao. Acao critica sai BLOCKED.

import { createServer } from "node:http";

const PORT = Number(process.env.SOL_GATEWAY_PORT ?? 8787);
const PATH = "/v1/sol/respond";
const CRITICAL = ["write", "delete", "merge", "deploy", "restart", "production"];

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-api-key",
  "access-control-max-age": "86400",
};

function responder({ message = "", intent = "UNKNOWN", risk = "UNKNOWN", request_id = "" }) {
  const receipt = {
    request_id,
    intent,
    risk,
    mode: "GATEWAY_LOCAL",
    mutation: false,
    observed_at: new Date().toISOString(),
  };

  if (CRITICAL.some((a) => message.toLowerCase().includes(a))) {
    return {
      text: "Acao critica detectada. Verde tecnico nao autoriza execucao: preciso da sua autorizacao explicita para esta acao neste alvo.",
      receipt: { ...receipt, status: "BLOCKED_AUTHORIZATION" },
    };
  }

  if (intent === "STATUS_READONLY") {
    return {
      text: `Gateway local no ar na porta ${PORT}. Modo read-only, nenhuma mutacao possivel por este caminho. Conecte o gateway CentralDark para estado real de branch, HEAD e testes.`,
      receipt: { ...receipt, status: "PASS", anchored: false },
    };
  }

  if (intent === "OPEN_MODULE") {
    return {
      text: "Abrindo a superficie pedida. Este gateway nao executa mutacao.",
      receipt: { ...receipt, status: "PASS" },
    };
  }

  return {
    text: `Recebi pelo gateway: "${message}". Cadeia SEGREDO -> SOL -> gateway fechada. Falta ligar PIVETE/HERMES e as tools reais.`,
    receipt: { ...receipt, status: "UNKNOWN" },
  };
}

createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }
  if (req.method !== "POST" || !req.url?.startsWith(PATH)) {
    res.writeHead(404, { ...cors, "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "use POST " + PATH }));
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1e6) req.destroy();
  });
  req.on("end", () => {
    let body = {};
    try {
      body = JSON.parse(raw || "{}");
    } catch {
      res.writeHead(400, { ...cors, "content-type": "application/json" });
      return res.end(JSON.stringify({ error: "json invalido" }));
    }
    const reply = responder(body);
    console.log(`[${new Date().toISOString()}] ${body.intent ?? "?"} <- ${String(body.message ?? "").slice(0, 60)}`);
    res.writeHead(200, { ...cors, "content-type": "application/json" });
    res.end(JSON.stringify(reply));
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`SOL gateway local em http://127.0.0.1:${PORT}${PATH}`);
  console.log("read-only · nenhuma mutacao · Ctrl+C para parar");
});
