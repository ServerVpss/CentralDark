# 2026-10-04 — CentralDark Autonomia 24/7 — boot remedição

## CURRENT

- `origin/main`: `5b53e36a07d7e8fb05d4e02c28f37a3a783589b4`
- `/root/CentralDark`: mesmo SHA antes deste receipt
- VPS `/root/CentralDark`: mesmo SHA após sincronização automática
- `FULL`: `6f07136b9e24d55976125022ff878a24b2b7cb4a`, atrás da main; não foi usado como autoridade

## VPS / CENTRALDARK-OS

- Host: `CENTRALDARK-OS`
- Kernel: `7.0.0-2-generic`
- Uptime medido: aproximadamente 3 dias e 5 horas
- CPU: 8 vCPUs
- RAM: 23 GiB total; 14 GiB disponível
- Swap: 0
- Disco raiz: 196 GiB; 119 GiB livres; 37% usado
- IP público: `89.117.78.124`
- Tailscale: `100.90.199.124`

## Serviços provados

- Hermes `/health`: HTTP 200, `status=ok`, watchdog saudável
- Bridge Kylin `127.0.0.1:18435/health`: HTTP 200
- Bridge Kylin `/v1/models`: `kylin-deepseek-r1`
- Triton/Kytensor live: HTTP 200 em `127.0.0.1:8000/v2/health/live`
- Triton/Kytensor ready: HTTP 200 em `127.0.0.1:8000/v2/health/ready`
- AionCore principal: HTTP 200 em `127.0.0.1:34325/health`
- AionCore web: HTTP 200 em `127.0.0.1:36047/health`
- MCP HTTP: listener em `0.0.0.0:9119`; `/health` respondeu HTTP 302
- Runners self-hosted `centraldark-vps-1` a `centraldark-vps-4`: online e livres

## Inferência

- Slot A — Kylin native SDK / `kylin-deepseek-r1`: `INFERENCE_PROVEN=true`
- Canário: resposta observada a partir de prompt determinístico; o SDK normalizou o texto para `CentralDark_Local_Inference_Proof.`
- Slot B — AionCore principal: health provado; inferência não provada (`UNKNOWN`)
- Slot C — AionCore web: health provado; inferência não provada (`UNKNOWN`)

Não foram instalados novos motores.

## Scheduler / eventos

- Hermes Core está residente.
- Loop principal existente: 5 segundos.
- Retomada de órfãs: 45 segundos.
- Heartbeat/reconciliação: 5 minutos.
- Graph refresh: 30 minutos.
- GC destrutivo: 6 horas, ainda requer reconciliação de segurança.
- Nenhum segundo scheduler ou dispatcher foi criado.

## GitHub / PRs

- PRs abertos medidos: `#1562`, `#1742`, `#1743`, `#1748`.
- `#1562` permanece PR-mãe/ledger aberto; não mergear.
- Todos os quatro PRs estão na base `main` e com `mergeable_state=unstable`.
- Check observado nos heads: `Supabase Preview=skipped`; isso não é PASS de CI.

## Webhook / esteira

- `deploy.centralldark.com/webhook`: HTTP 521.
- `deploy.centralldark.com/health`: HTTP 521.
- Buildkite hook: último retorno HTTP 429.
- Não foi localizado serviço local de webhook/Caddy/Nginx correspondente na VPS.
- Runners estão saudáveis; a falha está na borda/owner do webhook.

## Estado

`PARTIAL`

## Próximo cursor

1. Reutilizar o owner existente para descobrir a rota/evento que substitui o webhook público.
2. Medir a inferência dos dois AionCore antes de promover três slots.
3. Confirmar o consumer real do cockpit AionUI/Instinto Superior.
4. Corrigir somente o caminho de evento comprovadamente quebrado.
5. Reexecutar checks e registrar contraprova.
