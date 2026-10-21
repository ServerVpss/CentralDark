import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { localHybridTools } from "../src/tools/local/local-compute.js";
import { mcpAdminTools, getDispatcherRuntimeTools } from "../src/tools/core/mcp-admin.js";
import { ALL_TOOLS, CATALOG_PROBLEMS } from "../src/tools/core/tools-catalog.js";
import { reconcileCatalogNames } from "../src/tools/core/mcp-diagnostics.js";

test("catalog reconciliation catches dispatcher tools missing from public surface", () => {
  const result = reconcileCatalogNames(["alpha", "beta"], ["alpha"], ["alpha"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.dispatcherMissingFromPublic, ["beta"]);
});

test("catalog reconciliation classifies known public-only diagnostic tools", () => {
  const result = reconcileCatalogNames(["alpha"], ["alpha", "mcp_catalog_diff"], ["alpha"]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.classifiedPublicOnly, ["mcp_catalog_diff"]);
  assert.deepEqual(result.unclassifiedPublicOnly, []);
});

test("catalog reconciliation fails on unclassified public-only tools and missing expectations", () => {
  const result = reconcileCatalogNames(["alpha"], ["alpha", "surprise"], ["alpha", "required"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.unclassifiedPublicOnly, ["surprise"]);
  assert.deepEqual(result.expectedMissingPublic, ["required"]);
});

test("catalog reconciliation detects duplicate names on either surface", () => {
  const result = reconcileCatalogNames(["alpha", "alpha"], ["alpha", "alpha"], ["alpha"]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.runtimeDuplicates, ["alpha"]);
  assert.deepEqual(result.publicDuplicates, ["alpha"]);
});


test("paired VS Code tools are surfaced in the existing MCP dispatcher, catalog and extension skill", async () => {
  const expected = [
    "vscode_remote_devices", "vscode_remote_echo",
    "vscode_remote_execute", "vscode_remote_terminals",
  ];
  const present = localHybridTools.filter(tool => tool.name.startsWith("vscode_remote_"));
  const advertised = ALL_TOOLS.filter(tool => tool.name.startsWith("vscode_remote_"));
  assert.deepEqual(advertised.map(tool => tool.name).sort(), expected,
    "the real public tools-catalog consumed by mcp-server must publish all four tools");
  assert.deepEqual(CATALOG_PROBLEMS.duplicateNames.filter(name => name.startsWith("vscode_remote_")), []);
  assert.deepEqual(CATALOG_PROBLEMS.invalidNames.filter(name => name.startsWith("vscode_remote_")), []);

  assert.deepEqual(present.map(tool => tool.name).sort(), expected);
  assert.equal(present.find(tool => tool.name === "vscode_remote_devices").annotations.readOnlyHint, true);
  assert.equal(present.find(tool => tool.name === "vscode_remote_execute").annotations.destructiveHint, true);

  const catalog = mcpAdminTools.find(tool => tool.name === "mcp_admin_catalog");
  assert.ok(catalog, "reuse the original CentralDark admin catalog");
  const readResult = JSON.parse((await catalog.handler({ filter: "vscode_remote_", includeDestructive: false })).content[0].text);
  assert.deepEqual(readResult.tools.map(tool => tool.name).sort(),
    expected.filter(name => name !== "vscode_remote_execute"));
  assert.equal(readResult.dispatcher, "mcp_admin_call");

  const routeResult = JSON.parse((await catalog.handler({ filter: "VSCODE_TERMINAL_PAIRED" })).content[0].text);
  assert.ok(routeResult.routes.some(route => route.id === "VSCODE_TERMINAL_PAIRED"));
  assert.ok(routeResult.routes.some(route => route.transport === "TAILSCALE_HTTPS"));

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
  const extension = JSON.parse(readFileSync(resolve(repoRoot, "skills/vs-code-restore/package.json"), "utf8"));
  const contributed = extension.contributes.commands.map(command => command.command);
  assert.equal(extension.version, "0.1.5");
  assert.ok(contributed.includes("centraldark.remoteTerminalPair"));
  assert.ok(contributed.includes("centraldark.remoteTerminalStatus"));
  assert.equal(extension.contributes.configuration.properties["centraldark.restore.remoteTerminalEnabled"].default, false);

  const skill = readFileSync(resolve(repoRoot, "skills/vs-code-restore/SKILL.md"), "utf8");
  for (const name of expected) assert.ok(skill.includes(name), "skill must document " + name);
  assert.ok(skill.includes("TOOL_NAO_ENCONTRADA"), "document source != runtime before promotion");
});


test("Hermes 9119 VS Code tunnel is localhost-only and uses the existing workspace", () => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
  const settings = JSON.parse(readFileSync(resolve(repoRoot, ".vscode/settings.json"), "utf8"));
  const port = settings["remote.portsAttributes"]?.["9119"];
  assert.deepEqual(port, {
    label: "Hermes Gateway original · privado (VPS)",
    onAutoForward: "silent",
    protocol: "http",
  });
  assert.equal(settings["remote.localPortHost"], "localhost");
  assert.equal(settings["remote.restoreForwardedPorts"], true);
  assert.equal(settings["remote.portsAttributes"]?.["8642"], undefined,
    "do not silently expose the separate Hermes API service");
  assert.ok(!JSON.stringify(settings).includes("0.0.0.0"),
    "workspace must not declare a public listener");
});

test("merged dispatcher retains diagnostic tools and paired VS Code without import cycle", async () => {
  const runtime = getDispatcherRuntimeTools();
  const names = runtime.map(tool => tool.name);
  for (const tool of ["mcp_catalog_diff", "deploy_validate_mcp_catalog",
    "mcp_policy_summary", "mcp_audit_recent_logs",
    "vscode_remote_devices", "vscode_remote_terminals"]) {
    assert.ok(names.includes(tool), "dispatcher missing " + tool);
  }
  assert.equal(new Set(names).size, names.length, "dispatcher must have no duplicates");
  const diff = runtime.find(tool => tool.name === "mcp_catalog_diff");
  const r = JSON.parse((await diff.handler({ expected: [
    "mcp_catalog_diff", "mcp_policy_summary", "vscode_remote_devices"
  ], filter: "vscode_remote" })).content[0].text);
  assert.equal(r.ok, true, "catalog diagnostic must work after initialization");
  assert.ok(r.filteredTools.includes("vscode_remote_devices"));
});
