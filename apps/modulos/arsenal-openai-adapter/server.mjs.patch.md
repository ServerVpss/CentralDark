# Patch mínimo aplicado em `server.mjs` (SHADOW-safe)

Duas mudanças cirúrgicas:

1. **Import no topo** (após demais imports):
   ```js
   import { authenticate, shouldBlock, audit, newRequestId, enforceMode } from './auth-audit.mjs';
   ```

2. **Substituição do bloco `req.method === 'OPTIONS'` → fim do handler** por um wrapper que:
   - gera `request_id`
   - roda `authenticate(req)` sempre
   - em `AUTH_ENFORCE=enforce`, bloqueia decisões `!== 'ok'`
   - preserva o `AUTH_KEY` legado como fallback (compat com cliente atual da VPS)
   - loga sucesso/erro em `api.audit_log_api` no fim (com latência real)

Ver `server.mjs` — bloco marcado `// === PR#2 shadow-audit wrapper ===`.

## Rollback

```bash
cp server.mjs.bak.pr2 server.mjs
pm2 reload CentralDark-ArsenalAdapter
```
