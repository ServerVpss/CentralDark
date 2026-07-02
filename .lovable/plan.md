# Fase 5 — Ativar o HUB de verdade

## Situação atual (mapeada agora)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INFRA CENTRALDARK — mapa antes do swarm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🟢 Elite Gateway (fable)  http ok  29ms
  🟢 MCP admin              70 tools, 8 destrutivas
  🟢 Gemini                 chave presente
  🟢 47 edge functions      publicadas no HUB
  🟡 Secrets no HUB         ainda faltam ~30
  🟡 Webhooks               apontam pro projeto Lovable
  🟢 Frontend               já usa hub-client.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## O que vou fazer (swarm de 3 agentes em paralelo)

**Agente 1 — Auditor de Secrets** (Elite Gateway/Gemini)
- Varrer as 47 functions em `supabase/functions/*/index.ts`
- Extrair todo `Deno.env.get("...")` usado
- Cruzar com a lista de secrets da Lovable Cloud
- Gerar lista final: nome → valor a espelhar no HUB

**Agente 2 — Auditor de Webhooks**
- `getWebhookInfo` no Telegram (via connector gateway)
- Listar webhooks EFI e MistcPay ativos hoje
- Descobrir URLs velhas (`kagejpghnwdfymddwxuf...`) que precisam virar

**Agente 3 — Executor / Validator**
- Aguarda os dois primeiros
- Espelha as secrets pro HUB via Management API (`POST /v1/projects/lyoigsqluyktoclwdaft/secrets`) numa tacada
- Redireciona os 3 webhooks pros endpoints novos
- Smoke test: `health-check`, `ai-proxy`, `telegram-webhook` (getWebhookInfo), `efi-check-status`, `misticpay-verify`
- Devolve placar final

## O que muda no sistema

- HUB próprio passa a receber pagamentos EFI/MistcPay e updates do Telegram diretamente
- Projeto Lovable vira "reserva" — nada crítico depende mais dele
- Sem downtime: o flip é atômico, um endpoint por vez

## O que **não** vou fazer sem sua ordem

- Apagar/desativar as functions no projeto Lovable (fica de backup por 7 dias)
- Mudar DNS ou domínio custom
- Mexer no `whatsapp-server` (segue stopped, como combinado)

## Riscos e mitigação

- **Secret faltando** → Auditor 1 lista antes; se algum não estiver na Lovable, eu paro e peço
- **Webhook do Telegram cair** → uso `secret_token` derivado pra manter compatibilidade
- **EFI pedir re-registro com certificado** → se acontecer, marco como pendência e sigo com o resto

Manda "bora" que eu executo.
