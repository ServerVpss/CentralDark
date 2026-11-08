import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, "unified-bot.cjs"), "utf8");

test("/status usa topologia determinística sem LLM", () => {
  assert.match(source, /async function getExecutionTopologyStatus\(\)/);
  assert.match(source, /\/health\/deep/);
  assert.match(source, /operationalSnapshot\?\.executionTopology/);
  assert.match(source, /PROCESSO ≠ EXECUÇÃO PROVADA/);
  assert.match(source, /case '\/status':[\s\S]{0,300}getVPSStatus\(\)/);
});

test("status mantém UNKNOWN quando health deep não prova topologia", () => {
  assert.match(source, /EXECUÇÃO  UNKNOWN/);
  assert.match(source, /\/health\/deep indisponível/);
  assert.match(source, /BOT multiplicity=/);
});

test("painel preserva menus e expõe CentralDark e META-RSI sem duplicar a matriz", () => {
  assert.match(source, /callback_data: 'hub:centraldark'/);
  assert.match(source, /callback_data: 'hub:meta-rsi'/);
  assert.match(source, /40 capacidades catalogadas no owner canônico/);
  assert.match(source, /Avaliação runtime 40\/40: <b>UNKNOWN<\/b>/);
});

test("callbacks informativos não promovem runtime desconhecido", () => {
  assert.match(source, /Entrega de receipt nesta conversa: <b>UNKNOWN<\/b>/);
  assert.match(source, /Readback desta superfície: <b>UNKNOWN<\/b>/);
});
