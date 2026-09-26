# VPS Incidente 2026-08-27 — Crash-loop PM2 (condensado)

Contexto: VPS /root/CentralDark em rebase duplo travado (REBASE_MERGE + REBASE_APPLY),
HEAD detached, 1869+ arqs mexidos, 5 arquivos com chattr +i. Snapshot 8,5GB feito
antes de mutar. CHEFE mandou `pm2 restart all` sabendo do risco.

## Cadeia de diagnóstico (não repetir o engano)

1. Sintoma visto: `CentralDark-MCP` crash-loop, `EADDRINUSE 127.0.0.1:9100`.
2. Primeira hipótese (ERRADA): processo órfão na 9100 (PID 2863311) segurando a porta.
   Contraprova: matar órfão não resolveu → loop continuou (858→860 restarts/15s).
3. Causa real: BUG DE CÓDIGO — `ReferenceError: Cannot access 'mcpAdminTools'
   before initialization` em `apps/modulos/mcp/src/tools/core/mcp-diagnostics.js:33`.
   Import circular ESM: tools-catalog.js → mcp-diagnostics.js → mcp-admin.js (TDZ).
   EADDRINUSE era SINTOMA (restart tão rápido que a porta não solta).
4. Bug agravado por rebase: mcp-admin.js e tools-catalog.js estavam SUJOS na árvore
   (parte do rebase quebrado); mcp-diagnostics.js limpo. pm2 roda dist/index.js (build),
   não src/ → restaurar src/ não basta, precisa rebuildar.
5. Outro serviço: `CentralDark-WebhookDeploy` (porta 9300) é INTENCIONALMENTE offline
   por política. restart all religou contra a intenção → parar de volta (sem bug).
6. FALSO ALARME: ArsenalProxy/EliteHTTP/GraphPanel pareciam em loop subindo, mas eram
   só cauda do restart all; medição dupla 25s depois mostrou estáveis.
7. RAIZ DO "PARAR NÃO COLA": `CentralDark-HermesVerificador` (watchdog 24h, 15857
   restarts, ele mesmo em loop) revivia tudo que era parado. Parar ele = pré-requisito
   pra manter MCP/WebhookDeploy parados de verdade.

## Veredito final
- MCP: stopped (bug código, não restart). Fix = restaurar mcp-admin.js/tools-catalog.js
  do origin/main + rebuildar dist (bloqueado por rebase/chattr na VPS).
- WebhookDeploy: stopped (política 9300).
- HermesVerificador: stopped (parado de propósito p/ não brigar).
- Resto (14 processos): online normal.
- ANTHROPIC_AUTH_TOKEN vazou em pm2 jlist bruto → rotacionar + nunca usar jlist bruto.

## Regra extraída
Sintoma (porta/loop) ≠ causa (bug de import). Matar órfão é contraprova, não fix.
Watchdog automático pode competir com stop manual — parar o watchdog primeiro.
