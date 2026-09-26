# Turbopack Windows Workarounds — Registro Canônico

**Origem:** Sessão 06/08/2026 — OmniRoute (Next.js 16.2.12 + Turbopack) na porta 20128 falhou 4x.

**Erros encontrados:**

| Tentativa | Erro | Causa | Solução aplicada |
|-----------|------|-------|------------------|
| 1 | `An unexpected Turbopack error` / `globals.css` exit code 0xc0000142 | Turbopack + PostCSS/Tailwind v4 no Windows = cache corruption / native process crash | `rm -rf .next` + `rm -rf node_modules/.cache` |
| 2 | Mesmo erro após limpeza | Cache persistente em `.build/next/dev/cache/turbopack` | `rm -rf .build/next` |
| 3 | `no such module: fts5` (SQLite) | `better-sqlite3` sem FTS5 nativo no Windows | `npm rebuild better-sqlite3` → FTS5 OK |
| 3 (retry) | Mesmo FTS5 error | DB lock em `%APPDATA%/omniroute/storage.sqlite` | `rm -rf %APPDATA%/omniroute` + rebuild |
| 4 | `OMNIROUTE_USE_TURBOPACK=0` (webpack) | Webpack subiu mas `/login` = Internal Server Error + FTS5 persistindo | `npm install --force better-sqlite3` + rebuild → FTS5 OK |

**Workarounds validados:**

1. **Escape hatch oficial:** `OMNIROUTE_USE_TURBOPACK=0 npm run dev` — usa webpack em vez de Turbopack (definido em `scripts/dev/run-next.mjs`)

2. **Cache limpo completo:**
```bash
rm -rf .next
rm -rf .build/next
rm -rf node_modules/.cache
rm -rf %APPDATA%/omniroute
```

3. **better-sqlite3 com FTS5 no Windows:**
```bash
npm rebuild better-sqlite3
# testar:
node -e "const db = require('better-sqlite3')(':memory:'); db.exec('CREATE VIRTUAL TABLE t USING fts5(x)'); console.log('FTS5 OK')"
```

4. **Se rebuild falhar (lock/EPERM):**
```bash
npm install --force --ignore-scripts better-sqlite3
npm rebuild better-sqlite3
```

**Checklist para Next.js + Turbopack no Windows:**
- [ ] Verificar se `OMNIROUTE_USE_TURBOPACK=0` resolve (webpack escape hatch)
- [ ] Limpar TODOS os caches: `.next`, `.build/next`, `node_modules/.cache`, `%APPDATA%/project`
- [ ] Rebuild native modules: `npm rebuild better-sqlite3`
- [ ] Testar FTS5 antes de subir servidor
- [ ] Verificar lock de DB (`storage.sqlite` busy = processo anterior não morreu)

**Arquivos-chave do OmniRoute:**
- `scripts/dev/run-next.mjs` — detecta `OMNIROUTE_USE_TURBOPACK`, faz self-heal de cache Turbopack
- `postcss.config.mjs` — `@tailwindcss/postcss` (Tailwind v4)
- `next.config.mjs` — `turbopack: { resolveAlias, ignoreIssue }`