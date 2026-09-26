# OUTRO - scaffold_node_ext_apps.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\openai-developers\skills\build-chatgpt-app\scripts\scaffold_node_ext_apps.mjs
**SHA:** fb12086ca7e37ab7
**Timestamp:** 2026-08-26T18:42:42.353981
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: "tsx src/server.ts",
- "If the executable bit is unavailable, run:",

### Gaps
- gap: 12px;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync, readdirSync, lstatSync } from "node:fs";
import path from "node:path";

function toSlug(value) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "example-chatgpt-app";
}

function toToolName(value) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || "show_example";
}

function toTitle(value) {
  const parts = value.split(/[-_]+/).filter(Boolean);
  return parts.map((part) => part[0].toUpperCase() + part.slice(1)).join(" ") || "Example";
}

function fillTemplate(template, mapping) {
  let result = template;
  for (const [key, value] of Object.entries(mapping)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

function writeFile(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

function ensureTargetDir(targetPath, force) {
  if (existsSync(targetPath)) {
    if (!lstatSync(targetPath).isDirectory()) {
      throw new Error(`Output path exists and is not a directory: ${targetPath}`);
    }
    if (readdirSync(targetPath).length > 0 && !force) {
      throw new Error(
        `Refusing to write into non-empty directory: ${targetPath}\nRe-run with --force to overwrite generated files.`
      );
    }
  }

  mkdirSync(targetPath, { recursive: true });
}

function buildPackageJson(appSlug) {
  const packageJson = {
    name: appSlug,
    private: true,
    type: "module",
    scripts: {
      dev: "tsx watch src/server.ts",
      start: "tsx src/server.ts",
      check: "tsc --noEmit",
    },
    dependencies: {
      "@modelcontextprotocol/ext-apps": "^1.0.1",
      "@modelcontextprotocol/sdk": "^1.20.2",
      zod: "^3.25.76",
    },
    devDependencies: {
      "@types/node": "^24.3.0",
      tsx: "^4.19.4",
      typescript: "^5.9.2",
    },
  };

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function buildTsconfig() {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
`;
}

const WIDGET_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>__APP_TITLE__</title>
    <style>
      :root {
        color: #0b0f19;
        font-family: "Inter", system-ui, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        padding: 16px;
        background:
          radial-gradient(circle at top right, #d8f3ff 0, transparent 40%),
          linear-gradient(180deg, #f7fbff 0%, #edf3fb 100%);
      }

      main {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(11, 15, 25, 0.08);
        box-shadow: 0 14px 32px rgba(11, 15, 25, 0.08);
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #4f5d75;
      }

      h1 {
        margin: 0 0 10px;
        font-size: 24px;
        line-height: 1.15;
      }

      p {
        margin: 0;
        line-height: 1.5;
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        font-weight: 600;
        color: white;
        background: #0f62fe;
        cursor: pointer;
      }

      button[hidden] {
        display: none;
      }

      button.secondary {
        background: #0b0f19;
      }

      .meta {
        padding: 12px;
        border-radius: 14px;
        background: #f5f8fc;
        color: #4f5d75;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main class="stack">
      <p class="eyebrow">__APP_TITLE__ starter</p>
      <h1 id="headline">Waiting for tool output</h1>
      <p id="message">Call the __TOOL_NAME__ tool to hydrate this widget.</p>
      <button id="tool-button" type="button">Call __TOOL_NAME__ from the widget</button>
      <button id="follow-up-button" class="secondary" type="button">
        Ask the host to explain this app
      </button>
      <div class="meta" id="meta">
        This widget uses the MCP Apps bridge by default.
      </div>
    </main>

    <script type="module">
      const headlineEl = document.querySelector("#headline");
      const messageEl = document.querySelector("#message");
      const metaEl = document.querySelector("#meta");
      const toolButton
```