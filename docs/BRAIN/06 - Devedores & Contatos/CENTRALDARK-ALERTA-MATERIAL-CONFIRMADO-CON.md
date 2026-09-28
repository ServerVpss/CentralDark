---
title: "CENTRALDARK  ALERTA MATERIAL CONFIRMADO

 CON"
date: 2026-09-24
tags: ["devedores-&-contatos"]
---

## 24/09/2026

👑🪬 !CENTRALDARK — ALERTA MATERIAL CONFIRMADO

### CONFIRMED FACTS

A main avançou para **6fce1850bce9889955b6a1a803815730a1d18ef0, commit #1671 — “squash determinístico de todo PR 100% verde”. Isso é mudança material porque altera o comportamento de promoção/squash automático.

O gate desse HEAD ainda não pode ser chamado de verde**: a leitura de status está pending, e a leitura independente de check-runs mostra 611 checks, incluindo job de autonomia ainda queued; vários outros estão skipped. Portanto, CURRENT_HEAD != PROVEN_GREEN.

Na [[VPS]] vmi3256920, o sensor Remote Desktop respondeu pong e o runtime está vivo. Foram observados processos [[CentralDark]]/HERMES/[[MCP]] ativos, incluindo MCP principal, [[Guardião]], runner [[GitHub]] e HERMES.

⚠️ Mudança crítica de ownership: há simultaneamente processos Desktop Commander remotos para **conta1 e conta2**. Cada perfil observado tem sua própria cadeia login → npm desktop-commander remote → node desktop-commander; não encontrei evidência suficiente nesta rodada de duplicidade dentro do mesmo perfil, então ONE_REMOTE_PROCESS_PER_PROFILE permanece não violado pela prova disponível, mas precisa continuar sob vigilância.

Também há múltiplos runtimes HERMES/MCP gateway simultâneos (hermes gateway, hermes acp, hermes serve, sessão CLI e gateways Docker). Isso é real, mas não vou classificá-los como duplicidade indevida sem provar seus owners/perfis/escopos.

### UNKNOWN / BLOCKED

O sensor Windows SEGREDO está offline nesta medição; último last_seen do registro mais recente foi 22/09/2026 23:38 UTC. Logo WebAuthn/passkey, Screenpipe e estado Windows atual ficam UNKNOWN, não FAIL.

A tentativa de obter fingerprint Git/boot diretamente por shell foi bloqueada pelo sensor de execução. Mantive a rota saudável: GitHub mediu a main e Desktop Commander mediu processos/conectividade. Não fiz restart, merge, deploy, rebase ou alteração de auth.

HYPOTHESIS: a multiplicidade de HERMES/gateways pode ser intencional por sessão/ACP/cron/SSH. Falta o teste discriminante de owner/profile antes de qualquer conclusão ou self-heal.

### NEXT_CURSOR

**Reconciliar 6fce1850 somente quando os checks terminarem; depois medir VPS_HEAD == MAIN_HEAD, health/deep-health e mapear PID→profile/session dos HERMES/MCP gateways. Windows continua sensor independente UNKNOWN até voltar online.

Pendência crítica atual:** MAIN_HEAD=6fce1850 + CI ainda não provado verde → nenhuma promoção adicional deve ser inferida como segura.

---
*Registrado via bot — 24/09/2026*