import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { adminProviderControlTools, providerCredentialStatus } from "../src/modes/admin/tools/admin-provider-control.js";
import { allCredentialMetadata, credentialMetadata, fingerprintOf } from "../src/lib/credential-metadata.js";
import { sanitizeOutgoingDeep } from "../src/lib/sanitize.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "..", "scripts", "inspect-credential-local.mjs");

// Segredo 100% sintetico, longo o bastante para ter fingerprint. Nao e credencial real.
const SYNTH = "SYNTH-ZXQ7-9fLm2KdP4wRtV8nBc3Hj6YsA1eU";
const SYNTH_SHORT = "synth-short-1";

function leaks(material, value = SYNTH) {
  const hay = typeof material === "string" ? material : JSON.stringify(material);
  const forms = [
    value,
    Buffer.from(value).toString("base64"),
    Buffer.from(value).toString("hex"),
    encodeURIComponent(value),
    [...value].reverse().join(""),
  ];
  if (forms.some((f) => hay.includes(f))) return true;
  for (let i = 0; i + 10 <= value.length; i++) if (hay.includes(value.slice(i, i + 10))) return true;
  return false;
}

const envWith = (extra) => ({ CLOUDFLARE_API_TOKEN: SYNTH, CONTABO_CLIENT_ID: SYNTH_SHORT, ...extra });

test("detector de vazamento (contraprova): acusa exposicao sintetica deliberada", () => {
  assert.equal(leaks({ valor: SYNTH }), true);
  assert.equal(leaks({ valor: Buffer.from(SYNTH).toString("base64") }), true);
  assert.equal(leaks({ valor: SYNTH.slice(5, 20) }), true);
  assert.equal(leaks({ fingerprint: fingerprintOf(SYNTH) }), false);
});

test("metadados: existencia, origem, tamanho, idade e fingerprint parcial; sem valor", () => {
  const meta = allCredentialMetadata(envWith({}));
  const cf = meta.find((m) => m.name === "CLOUDFLARE_API_TOKEN");
  assert.equal(cf.configured, true);
  assert.equal(cf.origin, "env:CLOUDFLARE_API_TOKEN");
  assert.equal(cf.length, SYNTH.length);
  assert.match(cf.fingerprint, /^sha256:[0-9a-f]{8}$/);
  assert.equal(cf.ageDays, "NAO_MEDIDO");
  assert.deepEqual(Object.keys(cf).sort(), ["ageDays", "configured", "fingerprint", "length", "name", "origin", "provider"]);
  assert.equal(leaks(meta), false);
});

test("valor curto: fingerprint omitido (hash curto seria atacavel)", () => {
  const meta = allCredentialMetadata(envWith({}));
  const cid = meta.find((m) => m.name === "CONTABO_CLIENT_ID");
  assert.equal(cid.configured, true);
  assert.equal(cid.fingerprint, "OMITIDO_VALOR_CURTO");
  assert.equal(leaks(meta, SYNTH_SHORT), false);
});

test("alias legado e ausente: origem real do alias, AUSENTE sem fingerprint", () => {
  const m = credentialMetadata({ provider: "cloudflare", name: "CLOUDFLARE_API_TOKEN", aliases: ["CLOUDFLARE_API_TOKEN", "CF_API_TOKEN"] }, { CF_API_TOKEN: SYNTH });
  assert.equal(m.origin, "env:CF_API_TOKEN");
  const none = credentialMetadata({ provider: "x", name: "N", aliases: ["NOPE"] }, {});
  assert.equal(none.configured, false);
  assert.equal(none.fingerprint, null);
});

test("providerCredentialStatus mantem o contrato CONFIGURED/MISSING", () => {
  const st = providerCredentialStatus({ CLOUDFLARE_API_TOKEN: SYNTH });
  assert.equal(st.cloudflare.CLOUDFLARE_API_TOKEN, "CONFIGURED");
  assert.equal(st.contabo.CONTABO_CLIENT_SECRET, "MISSING");
  assert.equal(st.tailscale.TAILSCALE_API_KEY, "MISSING");
  assert.equal(st.buildkite.BUILDKITE_API_TOKEN, "MISSING");
  assert.equal(leaks(st), false);
});

test("ferramenta MCP real + sanitizador de saida: so metadados chegam ao cliente", async () => {
  const tool = adminProviderControlTools.find((t) => t.name === "provider_credentials_status");
  const saved = { ...process.env };
  process.env.CLOUDFLARE_API_TOKEN = SYNTH;
  process.env.BUILDKITE_API_TOKEN = SYNTH + "-bk";
  try {
    const raw = await tool.handler({});
    const text = raw.content[0].text;
    assert.equal(leaks(text), false, "resposta crua da ferramenta");
    assert.equal(leaks(text, SYNTH + "-bk"), false);
    const after = sanitizeOutgoingDeep(JSON.parse(text));
    assert.equal(leaks(after), false, "apos sanitizeOutgoingDeep (mcp-server.js)");
    const cf = after.metadata.find((m) => m.name === "CLOUDFLARE_API_TOKEN");
    assert.equal(cf.configured, true, "metadado sobrevive ao redator de chaves");
    assert.match(String(cf.fingerprint), /^sha256:/);
    assert.match(after.valuePolicy, /NUNCA_VIA_MCP/);
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
});

test("canal local: recusa sem TTY, nome desconhecido e nao ecoa o valor", () => {
  const env = { ...process.env, CLOUDFLARE_API_TOKEN: SYNTH, CENTRALDARK_LOCAL_AUDIT: path.join(os.tmpdir(), `cd-audit-${process.pid}-a.log`) };
  const piped = spawnSync(process.execPath, [SCRIPT, "CLOUDFLARE_API_TOKEN"], { env, encoding: "utf8" });
  assert.equal(piped.status, 3);
  assert.equal(leaks(piped.stdout + piped.stderr), false);
  assert.equal(fs.existsSync(env.CENTRALDARK_LOCAL_AUDIT), false, "recusa nao audita como inspecao");
  const unknown = spawnSync(process.execPath, [SCRIPT, "PATH"], { env, encoding: "utf8" });
  assert.equal(unknown.status, 2);
  assert.equal(leaks(unknown.stdout + unknown.stderr), false);
});

const hasScript = spawnSync("sh", ["-c", "command -v script"]).status === 0;
test("canal local com PTY: humano ve o valor no terminal; auditoria sem valor", { skip: !hasScript }, () => {
  const audit = path.join(os.tmpdir(), `cd-audit-${process.pid}-b.log`);
  fs.rmSync(audit, { force: true });
  const cmd = `${process.execPath} ${SCRIPT} CLOUDFLARE_API_TOKEN`;
  const r = spawnSync("script", ["-qec", cmd, "/dev/null"], {
    env: { ...process.env, CLOUDFLARE_API_TOKEN: SYNTH, CENTRALDARK_LOCAL_AUDIT: audit },
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes(SYNTH), "valor chega ao terminal interativo (canal humano)");
  const line = fs.readFileSync(audit, "utf8");
  assert.equal(leaks(line), false, "auditoria nao contem o valor");
  const rec = JSON.parse(line.trim());
  assert.equal(rec.name, "CLOUDFLARE_API_TOKEN");
  assert.equal(rec.length, SYNTH.length);
  assert.equal(rec.fingerprint, fingerprintOf(SYNTH));
  assert.equal(fs.statSync(audit).mode & 0o077, 0, "audit 0600");
});

test("nenhum modulo do servidor importa o canal local nem expoe valor bruto", () => {
  const root = path.join(HERE, "..", "src");
  const offenders = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".js") && /(from\s+|import\s*\(|require\s*\()\s*["'][^"']*inspect-credential-local/.test(fs.readFileSync(p, "utf8"))) {
        offenders.push(p);
      }
    }
  })(root);
  assert.deepEqual(offenders, []);
  const meta = fs.readFileSync(path.join(root, "lib", "credential-metadata.js"), "utf8");
  assert.equal(/\braw\b[^;\n]*:\s*found\.raw|value:\s*found/.test(meta), false);
});
