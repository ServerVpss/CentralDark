# CONTRATO - package.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\package.json
**SHA:** 6e97136e03a9b71d
**Timestamp:** 2026-08-28T02:56:09.981905
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "start:windows": "wrangler pages dev ./build/client",
- "start:unix": "bindings=$(./bindings.sh) && wrangler pages dev ./build/client $bindings",
- "start": "node -e \"const { spawn } = require('child_process'); const isWindows = process.platform === 'win32'; const cmd = isWindows ? 'npm run start:windows' : 'npm run start:unix'; const child = sp

### Ouro Bruto (primeiros 5000 chars)
```
{
  "name": "centraldark-desktop",
  "description": "CentralDark — uma Casa, Hermes por baixo, SOL por cima e bancada de código compartilhada.",
  "private": true,
  "license": "MIT",
  "sideEffects": false,
  "type": "module",
  "version": "1.0.0",
  "author": {
    "name": "CentralDark",
    "email": "segredounlock@users.noreply.github.com"
  },
  "scripts": {
    "deploy": "npm run build && wrangler pages deploy",
    "build": "remix vite:build",
    "dev": "node pre-start.cjs  && remix vite:dev",
    "test": "vitest --run",
    "test:watch": "vitest",
    "lint": "eslint --cache --cache-location ./node_modules/.cache/eslint app",
    "lint:fix": "npm run lint -- --fix && prettier app --write",
    "start:windows": "wrangler pages dev ./build/client",
    "start:unix": "bindings=$(./bindings.sh) && wrangler pages dev ./build/client $bindings",
    "start": "node -e \"const { spawn } = require('child_process'); const isWindows = process.platform === 'win32'; const cmd = isWindows ? 'npm run start:windows' : 'npm run start:unix'; const child = spawn(cmd, { shell: true, stdio: 'inherit' }); child.on('exit', code => process.exit(code));\"",
    "dockerstart": "bindings=$(./bindings.sh) && wrangler pages dev ./build/client $bindings --ip 0.0.0.0 --port 5173 --no-show-interactive-dev-session",
    "dockerrun": "docker run -it -d --name bolt-ai-live -p 5173:5173 --env-file .env.local bolt-ai",
    "dockerbuild:prod": "docker build -t bolt-ai:production -t bolt-ai:latest --target bolt-ai-production .",
    "dockerbuild": "docker build -t bolt-ai:development -t bolt-ai:latest --target development .",
    "typecheck": "tsc",
    "typegen": "wrangler types",
    "preview": "pnpm run build && pnpm run start",
    "prepare": "husky",
    "clean": "node scripts/clean.js",
    "electron:dev": "node scripts/electron-dev.mjs",
    "electron:dev:inspect": "NODE_ENV=development electron --inspect=9229 build/electron/main/index.mjs",
    "electron:build:deps": "concurrently \"pnpm electron:build:main\" \"pnpm electron:build:preload\" --kill-others-on-fail",
    "electron:build:main": "vite build --config ./electron/main/vite.config.ts",
    "electron:build:preload": "vite build --config ./electron/preload/vite.config.ts",
    "electron:build:renderer": "remix vite:build --config vite-electron.config.js",
    "electron:build:unpack": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --dir",
    "electron:build:mac": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --mac",
    "electron:build:win": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --win",
    "electron:build:linux": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --linux",
    "electron:build:dist": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --mwl",
    "test:centraldark-desktop": "node --test scripts/centraldark-desktop-contract.test.mjs",
    "centraldark:dev": "node scripts/electron-dev.mjs",
    "centraldark:build:win": "node scripts/clean-electron-output.mjs && pnpm electron:build:renderer && pnpm electron:build:deps && electron-builder --win"
  },
  "engines": {
    "node": ">=18.18.0"
  },
  "dependencies": {
    "@ai-sdk/amazon-bedrock": "1.0.6",
    "@ai-sdk/anthropic": "0.0.39",
    "@ai-sdk/cerebras": "^0.2.16",
    "@ai-sdk/cohere": "1.0.3",
    "@ai-sdk/deepseek": "0.1.3",
    "@ai-sdk/fireworks": "^0.2.16",
    "@ai-sdk/google": "0.0.52",
    "@ai-sdk/mistral": "0.0.43",
    "@ai-sdk/openai": "1.1.2",
    "@ai-sdk/react": "^1.2.12",
    "@ai-sdk/ui-utils": "^1.2.11",
    "@codemirror/autocomplete": "^6.18.3",
    "@codemirror/commands": "^6.7.1",
    "@codemirror/lang-cpp": "^6.0.2",
    "@codemirror/lang-css": "^6.3.1",
    "@codemirror/lang-html": "^6.4.9",
    "@codemirror/lang-javascript": "^6.2.2",
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/lang-markdown": "^6.3.1",
    "@codemirror/lang-python": "^6.1.6",
    "@codemirror/lang-sass": "^6.0.2",
    "@codemirror/lang-vue": "^0.1.3",
    "@codemirror/lang-wast": "^6.0.2",
    "@codemirror/language": "^6.10.6",
    "@codemirror/search": "^6.5.8",
    "@codemirror/state": "^6.4.1",
    "@codemirror/view": "^6.35.0",
    "@headlessui/react": "^2.2.0",
    "@heroicons/react": "^2.2.0",
    "@iconify-json/svg-spinners": "^1.2.1",
    "@lezer/highlight": "^1.2.1",
    "@modelcontextprotocol/sdk": "^1.30.0",
    "@nanostores/react": "^0.7.3",
    "@octokit/rest": "^21.0.2",
    "@octokit/types": "^13.6.2",
    "@openrouter/ai-sdk-provider": "^0.0.5",
    "@phosphor-icons/react": "^2.1.7",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.2.2",
    "@radix-ui
```