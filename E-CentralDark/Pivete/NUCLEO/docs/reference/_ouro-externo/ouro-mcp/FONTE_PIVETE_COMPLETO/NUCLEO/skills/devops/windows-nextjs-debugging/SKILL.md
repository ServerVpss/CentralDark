---
name: windows-nextjs-debugging
description: Debug Windows Next.js TurboPack FTS5 SQLite NODE_ENV issues.
version: 1.0.0
metadata:
  hermes:
    tags: [windows, nextjs, turbopack, sqlite, debugging, devops]
    related_skills: [systematic-debugging, debug-realtime-cirurgico]
---

# Windows Next.js/TurboPack Debugging Patterns

Capturado na sessão 07/08/2026 durante investigação do OmniRoute (Painel 747).

## 1. TurboPack Cache Corruption (Windows)

**Sintoma:** `FATAL: An unexpected Turbopack error occurred. A panic log has been written... Failed to open SST file... os error 3`

**Causa:** Bug upstream do TurboPack no Windows (mmap de arquivo SST falha, "paging file too small").

**Solução:** Desabilitar TurboPack, usar Webpack.
```bash
OMNIROUTE_USE_TURBOPACK=0 npm run dev
```
No `next.config.mjs` ou script de dev, forçar `turbopack: false` e `webpack: true`.

**Referência:** `scripts/dev/run-next.mjs` já tem lógica de auto-heal (`purgeAllTurbopackCaches`), mas nem sempre intercepta.

## 2. FTS5 Module Missing (better-sqlite3)

**Sintoma:** `Migration FAILED: 117_proxy_pool_rotation — error in trigger memory_fts_ai: no such module: fts5`

**Causa:** `better-sqlite3` compilado sem suporte a FTS5 (build padrão pode omitir).

**Solução:** Rebuild nativo.
```bash
npm rebuild better-sqlite3
# ou
npm install --force --ignore-scripts better-sqlite3
```

**Validação:**
```bash
node -e "const db = require('better-sqlite3')(':memory:'); db.exec('CREATE VIRTUAL TABLE t USING fts5(x)'); console.log('FTS5 OK')"
```

## 3. SQLite Database Locked / Corrupted

**Sintoma:** `Compaction failed: Another write batch or compaction is already active` + `Unable to open SST file`

**Causa:** Processo anterior não fechou DB corretamente, arquivos `-wal`/`-shm` órfãos.

**Solução:** Remover arquivos de lock e reiniciar.
```bash
rm -rf ~/.config/omniroute/storage.sqlite*
# ou caminho customizado: C:\Users\<user>\AppData\Roaming\omniroute\
```

## 4. NODE_ENV Mismatch (Next.js Programmatic)

**Sintoma:** CSS `@import "tailwindcss"` falha com `Module parse failed: Unexpected character '@'`

**Causa:** `next()` programático lê `NODE_ENV` do `.env` (production), mas roda em modo `dev`. Webpack CSS pipeline espera `development`.

**Solução:** Forçar `NODE_ENV` no script de bootstrap antes de criar `next()`.
```js
process.env.NODE_ENV = dev ? "development" : "production";
```

## 5. Checklist de Diagnóstico Rápido

| Sintoma | Provável Causa | Comando de Verificação |
|---------|----------------|------------------------|
| TurboPack panic / SST missing | Cache corrompido | `rm -rf .build/next && OMNIROUTE_USE_TURBOPACK=0 npm run dev` |
| FTS5 no such module | better-sqlite3 sem FTS5 | `node -e "require('better-sqlite3')(':memory:').exec('CREATE VIRTUAL TABLE t USING fts5(x)')"` |
| CSS @import parse failed | NODE_ENV=production em dev | `echo $NODE_ENV` / verificar script de dev |
| Compaction failed / SST open error | DB locked / arquivos órfãos | `rm -rf <data_dir>/storage.sqlite*` |
| better-sqlite3 cannot find module | Native binding quebrado | `npm rebuild better-sqlite3` |

## 6. Padrão de Correção Segura

1. **Identificar** erro exato (log completo, não resumo)
2. **Isolar** variável (desabilitar TurboPack, rebuild native, limpar cache)
3. **Testar** validação mínima (FTS5 check, health check endpoint)
4. **Registrar** no caderno de incidentes
5. **Não** reiniciar gateway/serviços sem evidência de falha neles

---

## 7. Apagar/Reinstalar Projeto Next Grande no Windows — Recuperação de Lock NTFS

**Sintoma:** `rm -rf projeto/node_modules` (3-4 GB, 100k+ arquivos: typespec, azure-sdk, playwright, electron) trava ou falha com `Device or resource busy`. Timeout de 5min no shell **mata o rm** mas ele continua rodando em background. Tentativa de `mv` subsequente também trava por hold do NTFS MFT.

**Causa:** Cada arquivo no NTFS passa por file handle close + recycle bin check + ACL + metadata update + delete. Em node_modules gigante isso demora muito. Handles órfãos de processos Node/Electron/Playwright mantêm pasta travada.

**Recuperação (sequência testada em OmniRoute 07/08/2026):**

```bash
# 1. Backup do .env (se houver config valiosa) — não pular
cp projeto/.env /tmp/backup-env.txt

# 2. Matar qualquer rm pendurado em background
tasklist | grep rm.exe
taskkill /F /PID <pid>

# 3. Confirmar que pasta ficou vazia (pode esvaziar mesmo se "rm" reportar erro)
ls projeto/node_modules/  # vazio = rm funcionou, só ficou o diretório vazio

# 4. Não tentar rm/mv na pasta raiz bloqueada — usar estratégia de path:
mkdir -p /tmp/trash
mv projeto /tmp/trash/projeto-old    # se travar: pasta já está vazia, mover o filho direto
mv projeto/* /tmp/trash/              # funciona mesmo se o pai travar
rmdir projeto                         # finalmente some
```

**Alternativa rápida** (quando `rm -rf` é lento mas funcional):
```bash
rm -rf projeto > /tmp/rm.log 2>&1 &
# continua checando: ls projeto; se vazio, rm terminou mas log ainda está sendo flush
```

**Padrão de "clonar do zero"** quando path de destino já existe:
```bash
# ERRADO — clone cria SUBPASTA (cwd pode ter pulado o cd):
cd /e/CentralDark/MOTOR-TESTE
git clone https://github.com/foo/bar.git MOTOR-TESTE  # cria MOTOR-TESTE/MOTOR-TESTE/

# CERTO — verificar cwd antes:
cd /e/CentralDark && pwd && rm -rf MOTOR-TESTE_NEW MOTOR-TESTE_TMP
git clone https://github.com/foo/bar.git MOTOR-TESTE  # se MOTOR-TESTE não existe, vai pro lugar
```

**Verificação pós-cleanup:**
```bash
ls projeto/ | wc -l          # esperado: número de arquivos do repo (~11k pra OmniRoute)
node projeto/scripts/check-supported-node-runtime.ts  # se existir
```

**Pitfall:** `rm -rf` rodando em background pode ser morto por timeout do shell mas o processo continua (PID visível em `tasklist`). Matar PID órfão deixa o estado **parcial** — sempre verificar `ls` antes de prosseguir.

---

## 8. Next.js 15 + Tailwind v3 — CSS Directives & PostCSS Config (Sessão 07/08/2026)

**Contexto:** Setup do Painel 747 (aiox-core/ui) — Next.js 15.5, Tailwind 3.4.17, next-intl 4.3.

### 8.1 CSS Directives: v3 vs v4

| Versão | Diretiva Correta | Erro se errado |
|--------|------------------|----------------|
| **Tailwind v3** | `@tailwind base; @tailwind components; @tailwind utilities;` | `@layer base` → `The \`border-border\` class does not exist` |
| **Tailwind v4** | `@import "tailwindcss";` | v3 directives → parse error / não compila |

**Fix aplicado:** Removido `@import "tailwindcss"` + `@import "shadcn/tailwind.css"`; adicionado trio v3 no topo do `globals.css`.

### 8.2 PostCSS Config: CommonJS Obrigatório

**Erro:** `ReferenceError: module is not defined in ES module scope` ao usar `postcss.config.mjs` com `export default`.

**Causa:** Next.js carrega PostCSS via `require()` / `jiti` que espera CommonJS.

**Fix:**
```js
// postcss.config.cjs (renomeado de .mjs)
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 8.3 Tailwind Config: CommonJS Obrigatório

**Erro:** `SyntaxError: Unexpected token, expected \";\"` ao usar `export default` em `tailwind.config.js`.

**Fix:**
```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
```

### 8.4 Server vs Client Components — Event Handlers

**Erro:** `Event handlers cannot be passed to Client Component props` em `onMouseEnter`/`onMouseLeave` num `<a>`.

**Causa:** Página era Server Component (padrão no App Router); handlers não serializam.

**Fix:** Adicionar `"use client";` no topo do arquivo da página.

```tsx
"use client";

import { useState } from "react";
// ... componente com onMouseEnter/onMouseLeave
```

### 8.5 Large node_modules Cleanup on Windows NTFS

**Sintoma:** `rm -rf node_modules` (3-4 GB, 100k+ arquivos) trava / timeout / `Device or resource busy`.

**Causa:** NTFS handle close + ACL + metadata por arquivo; handles órfãos de Node/Electron/Playwright.

**Sequência testada:**
```bash
# 1. Backup .env
cp projeto/.env /tmp/backup-env.txt

# 2. Matar processos Node órfãos
tasklist | findstr node
taskkill /F /PID <pids>

# 3. rm -rf em background + monitorar
rm -rf projeto/node_modules > /tmp/rm.log 2>&1 &
# checar: ls projeto/node_modules/ — vazio = ok mesmo se log ainda escrevendo

# 4. Se pasta raiz travar, mover filhos direto:
mkdir -p /tmp/trash
mv projeto/* /tmp/trash/
rmdir projeto
```

---

## 9. Preferência de Entrega (Pivete) — Comando Copy-Paste Único

Quando a missão termina em "instalar e subir o projeto", o Pivete prefere **um bloco copy-paste** ao final da resposta, não narrativa. Formato:

```bash
cd <path>
<comando 1> && <comando 2> && ...
```

Camada leiga logo abaixo explicando **por quê** esses passos (REGRAS §24 do NUCLEO), separando sintoma / causa / fix. Tom direto, sem jargão denso.

**Anti-padrão:** entregar o resultado como "agora rode X, depois Y, talvez Z" — Pivete já corrigiu antes (incidente over-execution: executou além do pedido). Limite-se ao escopo literal.

---

*Adicionado em 07/08/2026 — sessão de debugging OmniRoute Painel 747
Atualizado 07/08/2026 — seção 7 (recuperação lock NTFS) + seção 8 (preferência comando copy-paste)
Atualizado 07/08/2026 (fim) — seções 8.1-8.5: Next.js 15 + Tailwind v3 CSS/PostCSS/Server-Client patterns + NTFS cleanup*