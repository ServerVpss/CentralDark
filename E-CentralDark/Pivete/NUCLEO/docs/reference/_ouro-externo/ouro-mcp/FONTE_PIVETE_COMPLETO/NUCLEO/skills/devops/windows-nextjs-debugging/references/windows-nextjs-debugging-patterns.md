# Windows Next.js/TurboPack Debugging Patterns (Detailed)

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

*Adicionado em 07/08/2026 — sessão de debugging OmniRoute Painel 747*