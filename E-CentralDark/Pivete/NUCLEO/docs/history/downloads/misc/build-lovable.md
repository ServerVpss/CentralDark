# OUTRO - build-lovable.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\build-lovable.mjs
**SHA:** 5c2c454cb73a206b
**Timestamp:** 2026-08-26T19:32:50.335469
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = (command, args, cwd) => {

### Ouro Bruto (primeiros 5000 chars)
```
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const appDir = resolve(rootDir, "apps/bot");
const appDistDir = resolve(appDir, "dist");
const rootDistDir = resolve(rootDir, "dist");

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("bun", ["install"], appDir);
run("bun", ["run", "build"], appDir);

if (!existsSync(appDistDir)) {
  console.error("Build concluído, mas apps/bot/dist não foi gerado.");
  process.exit(1);
}

rmSync(rootDistDir, { recursive: true, force: true });
mkdirSync(rootDistDir, { recursive: true });
cpSync(appDistDir, rootDistDir, { recursive: true });

if (!existsSync(resolve(rootDistDir, "index.html"))) {
  console.error("A pasta dist da raiz foi criada sem index.html.");
  process.exit(1);
}

console.log("Build final pronto em /dist.");
```