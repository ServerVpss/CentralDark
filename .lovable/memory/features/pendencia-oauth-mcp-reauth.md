---
name: Pendência — Fluxo guiado de reautorização OAuth do MCP CentralDark
description: Quando MCP der 401, painel deve tentar conector Lovable → secrets/ da VPS → só então mostrar passo manual. Aguardando definição de UI (card em /status vs página dedicada vs toast global) e se a edge function pode escrever sozinha em secrets/ da VPS.
type: feature
---

# Pendência aberta

**Contexto:** o MCP CentralDark tá retornando 401 porque o OAuth App (`gho_...`) foi revogado. A própria tool `pendencias_add` falha por esse mesmo motivo, então registro essa pendência aqui localmente.

## O que falta decidir (perguntas abertas)
1. **Ordem do fallback:**
   - Conector Lovable → secrets/ da VPS → passo manual
   - secrets/ da VPS → conector → passo manual (preferência provável, já que o MCP lê da VPS)
   - Só conector

2. **Onde aparece:** card em `/status`, página dedicada `/mcp/reautorizar` ou toast/modal global automático.

3. **Escrita na VPS:** edge function pode gravar token novo em `/root/CentralDark/secrets/` sozinha (via `vps_write_file_safe`) ou só mostrar comando SSH pronto pra colar?

## Hipótese padrão (se Pivete não responder)
- Ordem: **secrets/ da VPS → conector → passo manual** (alinha com Core memory "Fallback token quando conector falhar")
- Onde: **card no `/status`** (página já existe, baixo custo)
- Escrita: **edge function grava direto** (autonomia absoluta de secrets já concedida)

## Próximo passo quando retomar
Confirmar 3 perguntas acima com Pivete → criar:
- `src/apps/modulos/telepainel/components/devops/CardReautorizarMCP.tsx`
- `supabase/functions/mcp-reautorizar-token/index.ts` (testa cadeia + grava novo)
- Hook `useMcpReauthStatus` espelhando `useMcpStatus`
