import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseFigmaTarget } from "../src/tools/integrations.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");

test("parseFigmaTarget aceita FigJam board e normaliza node-id", () => {
  const out = parseFigmaTarget("https://www.figma.com/board/eE4FS10ymxxlXDJAgWavCh/CentralDark-Microdeploy-Deterministic-Route?node-id=0-1&t=abc");
  assert.equal(out.fileKey, "eE4FS10ymxxlXDJAgWavCh");
  assert.equal(out.nodeId, "0:1");
  assert.equal(out.kind, "board");
});

test("parseFigmaTarget aceita embed.figma.com", () => {
  const out = parseFigmaTarget("https://embed.figma.com/board/eE4FS10ymxxlXDJAgWavCh/CentralDark?node-id=1-21&embed-host=share");
  assert.equal(out.fileKey, "eE4FS10ymxxlXDJAgWavCh");
  assert.equal(out.nodeId, "1:21");
  assert.equal(out.kind, "board");
});

test("parseFigmaTarget rejeita host externo", () => {
  assert.throws(
    () => parseFigmaTarget("https://evil.example/board/eE4FS10ymxxlXDJAgWavCh/X?node-id=0-1"),
    /host não permitido/,
  );
});

test("HUB e MCP registram Figma sem criar segundo router ou MCP", () => {
  const hub = fs.readFileSync(
    path.join(repoRoot, "apps/modulos/Bolt/source/app/components/centraldark/centraldark-hub-inventory.ts"),
    "utf8",
  );
  const seed = fs.readFileSync(
    path.join(repoRoot, "apps/modulos/oauth-broker/seed-providers.mjs"),
    "utf8",
  );
  const broker = fs.readFileSync(
    path.join(repoRoot, "apps/modulos/oauth-broker/server.mjs"),
    "utf8",
  );
  const integrations = fs.readFileSync(
    path.join(repoRoot, "apps/modulos/mcp/src/tools/integrations.js"),
    "utf8",
  );

  assert.match(hub, /id: 'FIGMA'/);
  assert.match(hub, /owner: 'apps\/modulos\/mcp\/src\/tools\/integrations\.js \+ apps\/modulos\/oauth-broker'/);
  assert.match(seed, /id: "figma"/);
  assert.match(broker, /https:\/\/api\.figma\.com\/v1\/me/);
  assert.match(integrations, /name: "figma_status"/);
  assert.match(integrations, /name: "figma_ler_arquivo"/);
  assert.match(integrations, /name: "figma_ler_node"/);
  assert.doesNotMatch(integrations, /CENTRALDARK_FIGMA_ROUTER/);
});

test("conector Figma é read-only e segredo fica fora da resposta", () => {
  const integrations = fs.readFileSync(
    path.join(repoRoot, "apps/modulos/mcp/src/tools/integrations.js"),
    "utf8",
  );
  const figmaBlock = integrations.slice(integrations.indexOf("// FIGMA / FIGJAM"));
  assert.match(figmaBlock, /annotations: \{ \.\.\.READ/);
  assert.doesNotMatch(figmaBlock, /annotations: \{ \.\.\.WRITE/);
  assert.match(figmaBlock, /FIGMA_ACCESS_TOKEN/);
  assert.doesNotMatch(figmaBlock, /text: token/);
});
