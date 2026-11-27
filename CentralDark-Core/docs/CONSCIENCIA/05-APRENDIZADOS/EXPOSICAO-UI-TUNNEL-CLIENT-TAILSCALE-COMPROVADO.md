---
title: "A UI do tunnel-client da OpenAI já está exposta via Tailscale Serve — verifique antes de dizer que não há exposição"
status: CANONICAL_MEMORY
updated: 2026-11-19
authority: SEGREDO/CHEFE
owner: docs/CONSCIENCIA/05-APRENDIZADOS/
truth_rule: REALIDADE_IS_JUDGE
---

# Exposição da UI do tunnel-client: Tailscale Serve, não Cloudflare

Aprendizado cristalizado de uma correção do CHEFE. A hipótese anterior estava errada: a UI local do `tunnel-client` da OpenAI foi declarada "sem exposição pública" com base somente no `ingress:` do `cloudflared`. A exposição já existia na rota Tailscale.

```text
REUSE_BEFORE_CREATE
→ NÃO declarar "não exposto" sem ler todas as camadas de exposição
→ cloudflared ingress != tailscale serve != funnel público
→ MEDIR → RETRATAR → REGISTRAR NO OWNER CORRETO
```

## Estado comprovado

| Item | Medição | Resultado |
|---|---|---|
| Processo | `tunnel-client run --profile centraldark-mcp --profile-dir /data/.hermes/runtime/openai-tunnel-client` | PID 370, ativo ~18h |
| Config | `/data/.hermes/runtime/openai-tunnel-client/centraldark-mcp.yaml` | `health.listen_addr: 127.0.0.1:39531`, `admin_ui.open_browser: false` |
| UI local | `curl http://127.0.0.1:39531/ui` | `200`, `<title>tunnel-client</title>` |
| Health local | `/healthz`, `/readyz`, `/metrics` | `200`, `200`, `200` |
| Rota existente | `tailscale serve status` (socket `ts-state2/tailscaled.sock`) | `/` → `http://127.0.0.1:39531` |
| URL da UI | `curl --socks5-hostname 127.0.0.1:1055 https://hermes-hostinger.tail89b909.ts.net/` | `200`, `<title>tunnel-client` |
| URL `/ui` | mesmo host, `/ui` | `200` |
| Escopo | `tailscale serve status` | `(tailnet only)` — `segredounlock@`, não internet aberta |
| MCP público | config `mcp.server_urls` | `https://mcp.centralldark.com/api/mcp` |
| Cloudflared | `/data/.cloudflared/config.yml` | `gateway.centralldark.com`→`18787`, `centralldark.com`→`18080`, catch-all 404 — sem 39531 |

`https://gateway.centralldark.com/ui` não é a UI do tunnel-client. É o dashboard do Hermes em `127.0.0.1:18787`, com `302` para `/auth/login?provider=nous&next=%2Fui`. O `/ui` ali é rota SPA do dashboard.

Rotas Tailscale já existentes, reutilizadas sem criação:

```text
https://hermes-hostinger.tail89b909.ts.net/
├── /                 → 127.0.0.1:39531   (UI do tunnel-client OpenAI)
├── /hermes           → 127.0.0.1:18787   (dashboard Hermes)
├── /hermes-api       → 127.0.0.1:8642
└── /centraldark-mcp  → 127.0.0.1:9100
https://0886c2779b0c.tail89b909.ts.net/ → 127.0.0.1:18788 (status exposto; 000 no probe via SOCKS — UNKNOWN)
```

## O que corrigiu

- Impede falsa conclusão de "sem exposição" quando a única fonte consultada é o `ingress:` do Cloudflare.
- Impede criar ingress, funnel, proxy ou porta nova para algo que já existe.
- Preserva `REUSE_BEFORE_CREATE` e `ONE_SYSTEM_ONLY`.
- Preserva o ubuntu de uma única origem por hostname: Cloudflare cobre `centralldark.com`/`gateway.*`; Tailscale cobre a UI administrativa local.
- Evita confundir `gateway.centralldark.com/ui` (dashboard Hermes, login Nous) com a UI do tunnel-client.

## Regras que ficam

1. Antes de afirmar que uma UI local não está exposta, ler `tailscale serve status` **e** `tailscale funnel status`, além do ingress do Cloudflare.
2. Usar o socket vivo do tailscaled userspace: `--socket=/data/cache/scratch/ts-state2/tailscaled.sock`.
3. Dentro do container userspace, `getent`/`curl` direto para `*.ts.net` falha com `code=000`: o DNS mágico não entra em `/etc/resolv.conf`. Provar com `curl --socks5-hostname 127.0.0.1:1055`.
4. `tailnet only` não é internet pública. Reportar o escopo com precisão.
5. `UNKNOWN != PASS`: não promover o que não foi medido.
6. Se uma hipótese anterior estiver errada, retratá-la explicitamente antes de seguir.

## Relação de owners

| Conteúdo | Owner | Destino |
|---|---|---|
| Procedimento/pitfall reutilizável | skill `centraldark-web-deploy` | "Armadilhas comprovadas" — patch aplicado nesta rodada |
| Contrato canônico CentralDark | repositório | este arquivo |

A regra operacional vive na skill; este documento é o registro canônico da fonte da verdade. Não criar terceira cópia em memória do agente.

## Pendências honestas

```text
AUTH_INITIALIZE = UNKNOWN   (/readyz: "mcp initialize requires auth: Unauthorized")
HOSTNAME_LEMBRADO = tail6d7aa4.ts.net   (sem registro no estado atual; hostname real: hermes-hostinger.tail89b909.ts.net)
HOST_0886 = UNKNOWN          (aparece no serve status; 000 no probe via SOCKS)
NENHUMA MUTACAO DE INFRA = PASS (somente leitura: status, /proc, curl de prova)
```

## Frase curta

> A rota já existia. Reutilize antes de criar. Meça o Tailscale antes de dizer que não há exposição.
