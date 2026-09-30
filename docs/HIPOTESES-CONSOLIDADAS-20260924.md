# 👑🪬 CENTRALDARK — HIPÓTESES CONSOLIDADAS · 2026-09-24

> Origem: sessão UseAI (bancada externa) + medição viva do repo e do runtime.
> Regra que atravessa tudo: **UNKNOWN != PASS · ACTION != PROOF · DOCUMENTED != EXECUTED**

## 1. Diagrama medido

![Arquitetura](centraldark-arquitetura.svg)

PDF: [`centraldark-arquitetura.pdf`](centraldark-arquitetura.pdf)

## 2. Estado provado (o que PASSOU)

| Item | Evidência |
|---|---|
| Bot da porta | `MEASURED GuardiaoCasa = @Guardiaodopivete_bot` (id 8884831955) |
| Perfil aplicado | `APPLIED short_description=ok` · `APPLIED description=ok` · `RECEIPT getMyDescription=ok` |
| Binding corrigido | commit `b873018` — `GuardiaoCasa` lê `GUARDA_PRINCIPAL_BOT_TOKEN` |
| Gate TLC23/Horn | `PDF_GATE` exit 0 · `PROBE_PASS` · `final_pass_claimed TRUE` · promoted |
| Identidade do PDF | SHA256 `b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1` · 206674 bytes · 8 páginas |
| Contraprova de adulteração | 5 passed; 0 failed · arquivo alterado → `BYTE_IDENTITY_MISMATCH` |
| Corrente exigida | `TLC23/HORN → PDF_GATE → COUNTERPROOF → PASS` |
| Canal UseAI→Telegram | `message_id 11489`, `11490` entregues no chat privado |

## 3. Pendências medidas (o que NÃO passou)

| Setor | exit | probe | promovido |
|---|---|---|---|
| `PDF_GATE` | 0 | PROBE_PASS | **true** |
| `REMOTE_BRIDGE` | 0 | PROBE_PASS | false |
| `SCREENPIPE_CRYSTAL` | 0 | PROBE_PASS | false |
| `SYSTEM_SENTINEL` | **90** | PROBE_FAIL_OR_UNKNOWN | false |
| `UNIFIED_BUILD` | **90** | PROBE_FAIL_OR_UNKNOWN | false |

- Elo `bot → hub_missions → consumer → Hermes` **não ligado**: o bot registra "Admin reconhecido" em ciclo, sem enfileirar trabalho.
- Arquivos do elo não lidos: `skills/config/skills.json`, `skills/core/consciousness.cjs`.
- Sessão da VPS registrada em recibo de 18/09 como `OFFLINE` — `HISTORY != CURRENT_STATE`.

## 4. Hipóteses abertas

| # | Hipótese | Estado | Como fechar |
|---|---|---|---|
| H1 | O botão `Criar missão` existe, mas não está ligado ao `hub-mission-consumer` | ABERTA | ler `consciousness.cjs` + `hub-mission-consumer` + `orchestrator.mjs` |
| H2 | `exit 90` em `SYSTEM_SENTINEL`/`UNIFIED_BUILD` tem causa comum | ABERTA | ler `SYSTEM_SENTINEL-20260924-114002.log` |
| H3 | Ponte UseAI entra só em `FAIL/UNKNOWN/BLOCKED` como consulta | PROPOSTA — **não instalada** | escrever `useai-bridge.cjs` |
| H4 | UseAI não possui endpoint público — o CHEFE é o transporte | MEDIDA | docs da UseAI (se existir API com chave, vira H4-b) |
| H5 | Label/binding do perfil apontava para bot errado (notify) | **FECHADA — corrigida** | commit `b873018` |
| H6 | Token/api_hash de conta Telegram circulou em texto claro | ABERTA | rotação pelo CHEFE (decisão dele: revogar tudo no fim) |

## 5. O que este documento NÃO contém (e por quê)

Nenhum valor de segredo — token de bot, `api_id`/`api_hash`, token de VPS — foi
inserido, copiado ou registrado aqui. A regra da Casa
(`docs/RELATORIOS/RECONCILIACAO-CASA/00-CADERNETA-ROTAS.md`, item 3 —
"não abrir/imprimir segredo") prevalece sobre conveniência.

## 6. LEI DA CASA

```text
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
EXISTS != RUNNING
SEARCHED != VERIFIED
TESTED != PROVEN_COMPLETE
PATCHED != ROOT_CAUSE_FIXED
```

MCP: https://mcp.centralldark.com · Painel: https://status.centralldark.com
