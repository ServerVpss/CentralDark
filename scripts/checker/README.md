# 🔍 scripts/checker — Checker END-TO-END da CentralDark

Owner existente para validação do organismo. **Não criar Checker V2/V3.**

O checker agora começa pelo estado vivo (`00-state.sh`), executa os blocos funcionais e termina validando o próprio contrato (`14-checker-contract.sh`). O princípio é:

```text
[CHECKER] DELTA ÚTIL aplicado, fluxo anterior continua
CURRENT > HISTORY
UNKNOWN != PASS
ACTION != PROOF
```

## Como rodar

```bash
bash scripts/checker/run-all.sh
# ou via instalador:
./install.sh --check-final
```

Relatório vai para `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/checker-final/relatorio.md`.

## Códigos de saída

- `0` → STATUS FINAL = OK
- `1` → ALERTA, há estado a revisar
- `2` → ERRO, instalação/estado NÃO pode ser declarado concluído

## Blocos

| # | Arquivo | O que valida |
|---|---------|--------------|
| 00 | `00-state.sh` | Estado inicial, contratos do boot/master/delta/checker e HEAD quando observável |
| 01 | `01-estrutura.sh` | Estrutura canônica |
| 02 | `02-logs.sh` | Logs/revisões + anti-secret |
| 03 | `03-github-deploy.sh` | GitHub/deploy/webhook |
| 04 | `04-pm2.sh` | PM2/processos |
| 05 | `05-telegram-bot.sh` | Telegram |
| 06 | `06-supabase-sync.sh` | Supabase sync |
| 07 | `07-whatsapp-wuzapi.sh` | WhatsApp/WuzAPI, read-only |
| 08 | `08-chat-ao-vivo.sh` | Chat/gateway |
| 09 | `09-caddy.sh` | Caddy/domínios |
| 10 | `10-crm.sh` | CRM, read-only |
| 11 | `11-seguranca.sh` | Permissões/anti-secret |
| 12 | `12-wildcard-dns.sh` | DNS wildcard |
| 13 | `13-install-https.sh` | instalador público, backend, HTTPS e certificado |
| 14 | `14-checker-contract.sh` | wiring transversal, boot, installer, desktop e auto-update |

## Micro-checker reutilizável

```bash
node scripts/checker/step-checker.mjs \
  --step <owner.acao> \
  --phase PRE \
  -- <comando-de-prova>
```

Fases esperadas: `STATE`, `PRE`, `POST`, `CONSUMER`, `COUNTERPROOF`, `REMEASURE`.

O micro-checker gera um receipt com `step_id`, fase, estado, digest da evidência e as invariantes `ACTION_IS_NOT_PROOF` e `UNKNOWN_IS_NOT_PASS`. Opcionalmente, use `--receipt <arquivo.jsonl>` para persistir JSONL.

## Regra para instalador, dependências, gates e auto-update

```text
CHECK_CURRENT_STATE
→ PRECHECK
→ ACTION
→ POSTCHECK
→ CONSUMER_CHECK
→ COUNTERPROOF
→ REMEASURE
→ RECEIPT
→ NEXT_CURSOR
```

Se um checker de uma frente falhar, a frente dependente não recebe verde. Trabalho seguro e independente continua.

## Regras invioláveis

- **NUNCA** usar `UNKNOWN`, `queued`, `pending` ou `cancelled` como PASS.
- **NUNCA** considerar a ação em si como prova do efeito.
- **NUNCA** criar sistema paralelo quando este owner puder ser estendido.
- **NUNCA** expor segredo em receipt/log.
- **NUNCA** reiniciar serviço sensível por simples ausência de verde.
- Toda saída de shell passa por `sanitize_log` antes do relatório agregado.
- O contrato transversal vive em `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CHECKER-CONTRACT.yml`.
