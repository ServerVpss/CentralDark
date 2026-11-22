# 🧿 CENTRAL DE NOTIFICAÇÕES · CENTRALDARK — 2026-09-25

> **Este documento é a central de notificações do dia.**
> PR-mãe de referência: **#1562** (`PERMANENT_RENDEZVOUS_DO_NOT_MERGE` — ledger, não writer).
> HEAD da main no momento desta postagem: `2f3ef85b9ef415a610e58f7ace1ae9bd37ff5e0a`
> Regra que atravessa tudo: **UNKNOWN != PASS · ACTION != PROOF · DOCUMENTED != EXECUTED**

## ✅ NOVIDADE FRESCA — o que entrou na main agora

**`2f3ef85b` · 17:24 · 🧿 FIX(DEPLOY): TLC23 FAIL-CLOSED EM TODA ROTA CANÔNICA (#1565)**

O gate TLC23 deixou de ser seletivo e passou a ser **fail-closed em toda rota canônica**:

- gate **exato por SHA** — target SHA velho é rejeitado
- `fail-closed` **antes do fetch e depois do always-gate**
- bypass do gate canônico virou **falha determinística** (testado)
- rotas travadas: Caddy canônico · MCP · webhook · legado VPS · desktop remoto · TelePainel · HUB remoto · site direto · serviço de deploy
- Notion sync (best-effort) saiu do runner crítico da VPS
- jobs de produção ganharam prioridade

**Traduzindo:** corpo incompleto não fabrica cabeça PASS — nem por atalho. É o TLC23 virando cinto de segurança em cada saída de porta.

## 📌 COMMITS ANCORADOS NO DIA

| Commit | O que é |
|---|---|
| `2f3ef85b` | FIX(DEPLOY) TLC23 fail-closed em toda rota (#1565) |
| `8f1eac9c` | docs(mapa) diagrama Mermaid com nós ancorados |
| `45387c34` | docs(arquitetura) diagrama + PDF medidos · sem segredo |
| `46c161cd` | fix(telegram) corrigir medição do perfil GuardiaoCasa |
| `b8730182` | fix(bot) GuardiaoCasa lê `GUARDA_PRINCIPAL_BOT_TOKEN` |
| `2737ba14` | CRYSTAL(COCKPIT) intenção devolvida + loop mestre (#1662) |

## ✅ PROVAS DO DIA

| Item | Evidência |
|---|---|
| Bot da porta | `MEASURED GuardiaoCasa = @Guardiaodopivete_bot` (id 8884831955) |
| Perfil aplicado | `APPLIED short_description=ok` · `description=ok` · `RECEIPT ok` |
| Canal bancada → Telegram | `message_id 11489`, `11490`, `11492` entregues |
| Gate TLC23/Horn | `PDF_GATE` exit 0 · `PROBE_PASS` · `final_pass_claimed TRUE` · promovido |
| Identidade do PDF | SHA256 `b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1` · 206674 bytes · 8 páginas |
| Contraprova de adulteração | 5 passed · 0 failed · alteração → `BYTE_IDENTITY_MISMATCH` |
| Corrente exigida | `TLC23/HORN → PDF_GATE → COUNTERPROOF → PASS` |

## ⚠️ CONFLITO ABERTO — NÃO RESOLVIDO AQUI

| Alegação | Fonte | Estado |
|---|---|---|
| `#1662` **mergeado** | commit `2737ba14` presente na main | MEDIDO |
| `#1662` **aberto e mergeable** (head `6d022b9e`) | relatórios colhidos na varredura | REPORTADO |
| `#1662` MERGED (head `239f20dd`) | sessão de terceiro, **JSON de parse quebrado** (linha 2518) | **REFUTADO — não usar** |
| `6d022b9e` | commit **órfão** segundo a varredura | ABERTO |

**Não escolho lado.** As fontes discordam e uma delas veio de parse corrompido. Regra da Casa: `SEARCHED != VERIFIED`. Fecha-se batendo `git log` da main contra `gh pr view 1662` no mesmo instante.

## 🔴 PENDÊNCIAS ABERTAS

**A. Setores em falha (exit 90)**
`SYSTEM_SENTINEL` e `UNIFIED_BUILD` — `PROBE_FAIL_OR_UNKNOWN`. Causa não medida.

**B. Elo bot → missão NÃO LIGADO**
O bot reconhece o admin em ciclo (`Admin reconhecido: 1901426549`), mas **não enfileira trabalho**. O botão `Criar missão` existe; a ligação com `hub_missions` não.
Falta ler: `skills/core/consciousness.cjs` · `hub-mission-consumer` · `orchestrator.mjs`.

**C. Dependabot bloqueado**
19 PRs same-repo abertos · 15 bloqueados · 0 reconciliados. Radar falha no mesmo HEAD.

**D. PM2 — sensores discordam**
`deploy_status` disse `pm2: []` · `admin_pm2list` disse 20 processos (2 com erro) · outro recibo disse 18/20 online. **Sem reconciliação, não é PASS.**

**E. Sessão da VPS**
Recibo de 18/09 registra `vmi3256920` como `OFFLINE`. Sessão antiga não é prova atual.

**F. Binário no Drive**
O conector cria arquivo de texto; não sobe PDF. O binário sai por link, o CHEFE arrasta pra pasta `CentralDark`.

## 🎯 PRÓXIMO PASSO

1. Bater `#1662` (git log × pr view) no mesmo instante e fechar o conflito
2. Ler o log do `SYSTEM_SENTINEL` e matar o `exit 90`
3. Ligar `Criar missão → hub_missions → Hermes`
4. Reconciliação PM2: um sensor só, medido duas vezes

## 🔒 SEGURANÇA

Nenhum valor de token, `api_id`/`api_hash` ou credencial de VPS consta neste documento.
Regra: `docs/RELATORIOS/RECONCILIACAO-CASA/00-CADERNETA-ROTAS.md` item 3.

---

**CENTRAL DE NOTIFICAÇÕES** · PR-mãe **#1562** (ledger) · promovido pela main, não pelo PR
MCP: https://mcp.centralldark.com · Painel: https://status.centralldark.com
