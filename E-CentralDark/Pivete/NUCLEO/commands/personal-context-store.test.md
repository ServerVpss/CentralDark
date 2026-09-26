# COMANDO - personal-context-store.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\lib\personal-context-store.test.mjs
**SHA:** 69377b78413ced59
**Timestamp:** 2026-08-28T02:54:46.822947
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = renderPersonalContextForPrompt({

### Ouro Bruto (primeiros 5000 chars)
```
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import {
  personalContextStats,
  readPersonalContextLedger,
  rememberPersonalContext,
  renderPersonalContextForPrompt,
  searchPersonalContext,
} from "./personal-context-store.js";

const execFileAsync = promisify(execFile);

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-personal-context-"));
  return {
    dir,
    storePath: path.join(dir, "personal-context.jsonl"),
    cleanup() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

function memory(overrides = {}) {
  return {
    source: "test:chat",
    source_class: "USER_MESSAGE",
    channel: "test",
    conversation_id: "conversation-a",
    session_id: "session-a",
    message_id: "message-a",
    role: "user",
    memory_kind: "decision",
    content: "A decisão canônica é reutilizar o owner existente de memória.",
    trust: "USER_STATED",
    confidence: 0.99,
    tags: ["memoria", "owner"],
    ...overrides,
  };
}

test("test_memoria_persiste_em_novo_processo", async () => {
  const f = fixture();
  try {
    const stored = await rememberPersonalContext(memory(), { storePath: f.storePath, ownerId: "chefe" });
    assert.equal(stored.stored, true);

    const moduleUrl = pathToFileURL(path.resolve("apps/modulos/mcp/src/lib/personal-context-store.js")).href;
    const script = `
      const mod = await import(${JSON.stringify(moduleUrl)});
      const result = await mod.searchPersonalContext("owner existente", {
        storePath: process.env.TEST_CONTEXT_STORE,
        ownerId: "chefe",
        sessionId: "session-b",
      });
      process.stdout.write(JSON.stringify(result));
    `;
    const { stdout } = await execFileAsync(process.execPath, ["--input-type=module", "-e", script], {
      env: { ...process.env, TEST_CONTEXT_STORE: f.storePath },
      cwd: path.resolve("."),
    });
    const recalled = JSON.parse(stdout);
    assert.equal(recalled.integrity, "VERIFIED");
    assert.equal(recalled.selected_count, 1);
    assert.equal(recalled.selected[0].session_id, "session-a");
    assert.match(recalled.selected[0].evidence_ref, /^personal-context:[a-f0-9]{64}$/);
  } finally {
    f.cleanup();
  }
});

test("exclui a sessão atual, preserva proveniência e confiança", async () => {
  const f = fixture();
  try {
    await rememberPersonalContext(memory(), { storePath: f.storePath, ownerId: "chefe" });
    const sameSession = await searchPersonalContext("memória", {
      storePath: f.storePath,
      ownerId: "chefe",
      sessionId: "session-a",
    });
    assert.equal(sameSession.selected_count, 0);

    const otherSession = await searchPersonalContext("memória", {
      storePath: f.storePath,
      ownerId: "chefe",
      sessionId: "session-b",
    });
    assert.equal(otherSession.selected[0].source, "test:chat");
    assert.equal(otherSession.selected[0].trust, "USER_STATED");
    assert.equal(otherSession.selected[0].confidence, 0.99);
  } finally {
    f.cleanup();
  }
});

test("pedido curto de continuidade recupera contexto recente sem palavra exata", async () => {
  const f = fixture();
  try {
    await rememberPersonalContext(memory(), { storePath: f.storePath, ownerId: "chefe" });
    const recalled = await searchPersonalContext("continua de onde paramos", {
      storePath: f.storePath,
      ownerId: "chefe",
      sessionId: "session-b",
    });
    assert.equal(recalled.selected_count, 1);
    assert.equal(recalled.selected[0].why_selected.continuity_fallback, true);
  } finally {
    f.cleanup();
  }
});

test("cruza telefone, computador e Hub quando usam o mesmo store", async () => {
  const f = fixture();
  try {
    await rememberPersonalContext(memory({
      source: "hermes:phone",
      channel: "mobile",
      conversation_id: "phone-conversation",
      session_id: "phone-session",
      message_id: "phone-message",
      content: "No telefone, a VPN Zero Trust precisa manter continuidade fora de casa.",
    }), { storePath: f.storePath, ownerId: "chefe" });
    await rememberPersonalContext(memory({
      source: "hermes:desktop",
      channel: "desktop",
      conversation_id: "desktop-conversation",
      session_id: "desktop-session",
      message_id: "desktop-message",
      content: "No computador, a mesma VPN Zero Trust deve reutilizar o owner canônico.",
    }), { storePath: f.storePath, ownerId: "chefe" });

    const recalled = await searchPersonalContext("VPN Zero Trust", {
      storePath: f.storePath,
      ownerId: "chefe",
      sessionId: "telegram-hub-session",
    });
    assert.deepEqual(
      new Set(recalled.selected.map((item) => item.source)),
      new Set(["hermes:phone", "hermes:desktop"]),
    );
    assert.equal(recalled.selected_count, 2);

```