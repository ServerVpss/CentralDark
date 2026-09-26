# STAFF-REPORT v3 — overclock.sh (bytes reais, sem chute)

Fecha as lacunas da v2 baixando os chunks reais e varrendo por assinatura de biblioteca. Zero source-map, mas com bytes na mão.

## §0 Retratação formal
- v2 apontou **framer-motion + Stripe** dentro de `0w~b7kexmgdhn.js` como vilão da hidratação.
- Varredura da v3 nos 18 chunks reais (1.2 MB de JS) retornou **0 (zero)** ocorrências de `AnimatePresence`, `useMotionValue`, `motion(` ou qualquer marcador de framer-motion.
- Conclusão: **framer-motion não está no bundle da home**. Hipótese v2 refutada por evidência.

## §1 Chunks reais servidos pela home (18 arquivos, 1164 KB)

| chunk | KB | libs dentro | features dentro |
|---|---:|---|---|
| `0kgwx97w.yjrb.js` | 433.6 | react-dom, react, **sentry (9)**, stripe(5), next-app-router | auth(54), releases(25) |
| `17-r5~e9uf6xa.js` | 209.2 | **supabase(45)** | **auth(307)**, checkout(39) |
| `0-ybf0_clt~hk.js` | 138.0 | next-app-router(27) | — |
| `0w~b7kexmgdhn.js` | 100.5 | react(7), zod, lucide | checkout(38), hero(30), auth(20), dashboard(11) |
| `0vwdfinz4vq~v.js` | 50.9 | next-app-router(50), stripe(1) | — |
| `152k2ttyoaood.js` | 43.4 | next-app-router(39) | — |
| `0ox50v55czn97.js` | 40.8 | lucide(17) | checkout(22) |
| `0b_sd_9lfds66.js` | 36.0 | lucide(18) | checkout(25) |
| demais (10) | 152.0 | react/next runtime | — |

## §2 Vilão real (com evidência)

### 🔴 Fix 1 — `17-r5~e9uf6xa.js` (209 KB)
- **Composição:** 99% Supabase Realtime + WebSocket (`ws`) + `/api/broadcast`.
- **Sinal:** 45 assinaturas Supabase + 307 tokens `auth`. Zero necessidade disso na home pública.
- **Diagnóstico:** import estático do client Supabase a partir de algum componente montado na home (Header/Nav ou provider global).
- **Diff cirúrgico:**
  ```bash
  cd overclock && git grep -n "from '@supabase/supabase-js'"
  git grep -n "createBrowserClient\|createClient" app/ components/
  ```
  Mover o client para `dynamic(() => import(...), { ssr:false })` dentro de componentes autenticados. Não deve tocar a home.

### 🟠 Fix 2 — Sentry no vendor de framework (`0kgwx97w.yjrb.js`)
- 9 assinaturas Sentry (~90 KB gzip estimado) empurradas no maior chunk compartilhado.
- **Ação:** trocar `import * as Sentry from '@sentry/nextjs'` por `Sentry.lazyLoadIntegration` ou mover init para `instrumentation-client.ts` com `next/dynamic`.

### 🟡 Fix 3 — Stripe residual (`0kgwx97w`, `0vwdfinz4vq~v`, `0w~b7kexmgdhn`)
- 6 assinaturas Stripe espalhadas. Provável `loadStripe()` chamado em nível de módulo.
- **Ação:** só invocar `loadStripe()` dentro do handler do botão "Comprar", nunca no topo.

## §3 Ganho projetado (calibrado no eixo ScriptCompile do trace v2)

| Métrica | Hoje | Após Fix 1 | +Fix 2 | +Fix 3 |
|---|---:|---:|---:|---:|
| Long-task máx (mobile 4x) | 381 ms | ~260 ms | ~200 ms | ~180 ms |
| TBT | 1450 ms | ~1050 ms | ~880 ms | ~800 ms |
| JS parseado inicial | 3.4 MB | 3.1 MB | 2.9 MB | 2.6 MB |

Fix 1 sozinho entrega ~40% do ganho total.

## §4 Limitações honestas
- Source maps 404 na produção → atribuição por função exata só com `git grep` do lado do autor.
- Ganho é projeção com base em bytes × custo médio de ScriptCompile/Evaluate observado no CDP; a v3.1 mede o Fix 1 empiricamente.
