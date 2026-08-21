import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./hub-adm.cjs", import.meta.url), "utf8");

test("Hub recupera contexto antes do LLM e persiste o turno depois", () => {
  const recall = source.indexOf("await recallPersonalContext(chatId, text, sess)");
  const call = source.indexOf("await callLLM(sess.history, systemPrompt)");
  const remember = source.indexOf("await rememberTurn(chatId, sess, text, response)");
  assert.ok(recall >= 0, "recall não conectado");
  assert.ok(call > recall, "LLM deve receber contexto recuperado");
  assert.ok(remember > call, "turno deve ser persistido após a resposta");
});

test("Hub não grava chat_id cru e rotaciona sessão sem apagar memória longitudinal", () => {
  assert.match(source, /createHash\('sha256'\)\.update\(String\(chatId\)\)/);
  assert.match(source, /function rotateSession\(sess\)/);
  assert.match(source, /Memória longitudinal preservada/);
  assert.doesNotMatch(source, /conversation_id:\s*String\(chatId\)/);
});

