# 🪬 Tool Call Lens — Handoff entre MCP, Desktop Commander e Instinto Superior

**Data:** 2026-10-17 · **PR visual:** #1838 · **PR backend:** #1842 · **Status:** SOURCE_COMMITTED / RUNTIME_READBACK_PENDING.

## Intenção preservada

O Harness próprio do CHEFE envolve as ferramentas; Claude Code delega, Hermes executa sob escopo, MCP CentralDark audita seu próprio canal e o Cockpit mostra eventos como capacidades nativas. Um só Cockpit, um só ledger por responsabilidade; não recriar shell, conector ou gateway.

## Donos e rotas

| Seção | Source owner | Dados | Interação |
|---|---|---|---|
| Tool Call Lens no Cockpit | `src/components/central/ObservabilidadeCentralDark.tsx` | `GET https://api.centralldark.com/admin/api/logs?q=mcp_tool_call&limit=100` (cookie de sessão Admin) | Ao vivo 5s, pausa, rever/atualizar, recolher, filtro PASS/FAIL |
| Tool Call Lens no Admin MCP | `apps/modulos/mcp/src/admin.js` (#1842) | `subscribeAuditEvents` → `pushAdminLog` → `/admin/logs/stream` e `/admin/api/logs` | SSE, pausar visão, rever memória, filtro PASS/FAIL |
| Origem | `apps/modulos/mcp/src/audit-logger.js` | `centraldark.mcp.tool-call.v1` | auditado e sanitizado |
| Notificações | `src/components/central/CentralNotificacoes.tsx` + `src/hooks/useNotificationsLog.ts` | Supabase `notifications_log` | não recebe automaticamente os logs do Desktop Commander |
| Desktop Commander | Conector externo e perfis declarados em `infra/systemd` | `start_process → read_process_output`, com PID de processo-filho | **não atravessa automaticamente** o audit da CentralDark |

## Receita do visual (read-only)

1. Abrir a mesma área do **Instinto Superior → Admin CentralDark → Observabilidade**, que já é renderizada pelo `PainelAdminCentralDark` / `CockpitShell`.
2. Confirmar que o backend **#1842** está publicado e a conta MCP Admin está autorizada no navegador. Sem sessão ou configuração CORS, o widget exibe `AUTH_REQUIRED` ou erro de leitura; não altera o estado dos serviços.
3. Com uma chamada inofensiva a uma ferramenta **do MCP CentralDark**, procurar linha com `source=MCP_AUDIT`, `toolName`, `call_id`, `correlation_id`, `status`, `durationMs` e opcional `exitCode`.
4. Verificar botões: **Ao vivo/Pausar** (controle do polling, não do processo), **Rever/Atualizar** (GET de logs existentes), **Expandir/Recolher**, filtro **Todos/PASS/FAIL**. Testar funcionamento com zero resultados e com HTTP 401.
5. Não exibir `input`, `result`, transcript cru, cookies ou chaves. `mcp_host_pid` é PID do MCP; não confundir com `PID 16424` mostrado pelo Device Agent em captura histórica.
6. Concluir com readback visual desktop e mobile nas quatro peles; conferir sem alteração indevida nas outras abas/HUD/Gram/Goals/Design Center.

## Checklist de QA do owner visual

| Cód. | Prova pedida | Estado no registro |
|---|---|---|
| UI01 | Componente incluído no owner existente | SOURCE_COMMITTED (#1838) |
| UI02 | Sem outro coletor/gateway/shell | INSPEÇÃO DE SOURCE |
| UI03 | Botões ao vivo / pausa / replay / recolher / filtros | SOURCE_COMMITTED |
| UI04 | Endpoint administrativo autentica e aceita origin | DEPENDE_BACKEND_#1842 |
| UI05 | Um evento real aparece no MCP Admin e Cockpit | PENDENTE_READBACK |
| UI06 | Build / TypeScript / teste em HEAD atual | PENDENTE_CI |
| UI07 | Quatro peles + responsividade e acessibilidade | PENDENTE_TESTE_VISUAL |
| UI08 | Chamadas diretamente via Desktop Commander | ADAPTADOR_CLIENTE_AINDA_NÃO_INTEGRADO |
| UI09 | Histórico integral anterior a reinícios e offset | NÃO É ESCOPO DO BUFFER_ATUAL |

**Teste de contrato UI sem build completo:** `node --test scripts/verify-tool-call-lens.mjs` (a partir de `apps/instinto-superior`). **Build:** `npm run verify:hud && npm run build` somente no ambiente de build do projeto, sem publicar.

## Handoff para o PR de backend

Receita integral e matriz de processos/perfis/serviços em [2026-10-17-TOOL-CALL-LENS-DESKTOP-COMMANDER-RECEITA.md](https://github.com/ServerVpss/CentralDark/blob/feat/zendrive-native-ssh-mcp-route-20261017/docs/CONSCIENCIA/RECEIPTS/2026-10-17-TOOL-CALL-LENS-DESKTOP-COMMANDER-RECEITA.md).

**Ordem causal:** MCP PR #1842 → testes/autorizações/readback → UI PR #1838 → render dos quatro temas → evidência do mesmo `call_id`. Cada PR mantém seu owner e não requer merge automático do outro.

**FIXED POINT DESTA ETAPA:** `DOC_RECORDED + SOURCE_COMMITTED`; sem inferir `MCP_DEPLOYED` ou `HARNESSES_ALL_INTEGRATED`.
