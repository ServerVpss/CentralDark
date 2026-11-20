---
title: "Notas de Sessão — 2026-09-25 · Bancada Externa (UseAI) × Hermes"
status: "LIVE_SESSION_NOTES"
date: 2026-09-25
surface: "BANCADA_EXTERNA"
operator: "SEGREDO/CHEFE"
truth_rule: "REALIDADE_IS_JUDGE"
---

# Notas de Sessão — 2026-09-25

Registro durável da conversa entre o CHEFE e a bancada externa (UseAI Instant).
Aqui ficam **notas, decisões, importâncias e porcentagem honesta**. Não é ata bonita:
é linha de ledger.

## 1. Decisões tomadas nesta sessão

| # | Decisão | Estado | Prova |
|---|---|---|---|
| D1 | `@Guardiaodopivete_bot` (GuardiaoCasa · id 8884831955) é a **porta oficial** | FECHADA | `MEASURED` + `TELEGRAM_GET_ME` |
| D2 | O perfil 👑🪬 vai nesse bot, lendo `GUARDA_PRINCIPAL_BOT_TOKEN` | FECHADA | commit `b873018` + `APPLIED`/`RECEIPT` |
| D3 | Não revogar token em pré-produção — revogar tudo no fim | FECHADA | ordem verbal do CHEFE |
| D4 | Toda ação da bancada gera recibo no Telegram, no mesmo turno | FECHADA | messages `11489`–`11498` |
| D5 | Estilo de fala virou contrato: Auréola + baianês + % honesta | FECHADA | commit `0760448e` |
| D6 | Emoji rico com gramática limpa, paleta fechada, sem poluição | FECHADA | commit `ecf52ab9` |
| D7 | Inventário do sistema precisa ser amarrado a cada mudança | ABERTA | falta decidir casa e gatilho |
| D8 | Hermes passa a notificar sem o CHEFE abrir o chat | ABERTA | desenho aprovado, não implementado |

## 2. O que ficou provado (com fonte)

| O que | Prova | % |
|---|---|---|
| Bot da porta = GuardiaoCasa | `getMe` + print | 100% |
| Perfil aplicado no bot certo | `APPLIED` + `RECEIPT` do terminal | 100% |
| Canal bancada → Telegram | messages `11489` a `11498` | 100% |
| Gate TLC23 é executado, não documentado | `agent-call.mjs` bloqueia sem PASS | 100% |
| Identidade do PDF do gate | SHA256 `b4e2a065…` · 206674 B · 8 págs | 100% |
| Contraprova de adulteração do gate | 5 passed; 0 failed | 100% |
| `launch_omni_router.py` é cristal | leitura direta do arquivo | 95% |
| `drift-1789*.json` é lixo | 30 arquivos, 227–441 B, loop | 90% |
| `#1662` foi mergeado | commit `2737ba14` na main | 70% |
| Elo bot → missão está ligado | bot reconhece admin, não enfileira | 30% |

## 3. Correções de nome (evitam deletar o errado)

```text
drift-1790*            → real é drift-1789*
BRAIN/06 - Devedores   → real é 05-DEVEDORES-CONTATOS
BRAIN/07 - Reuniões    → real é 06-REUNIOES-NOTAS
ARSENAL/.../2026-09-24 → pasta NÃO existe no repo; os .erro são locais da VPS
```

## 4. Achados novos

- **Pastas gêmeas no BRAIN:** `00 - Mapa do Sistema` e `00-MAPA-SISTEMA` — possível duplicação de estrutura.
- **Buraco do inventário:** busca por `inventory cristal registry` → **0 resultados**.
  Não existe script que varra e classifique o sistema. **A esteira existe**
  (`.github/workflows/` com dezenas de jobs); falta só o vagão.
- **Silêncio do `status.centralldark.com`:** responde **HTTP 403** — não é público.

## 5. Pendências vivas

```text
A. SYSTEM_SENTINEL e UNIFIED_BUILD em exit 90 — causa não medida
B. Elo bot → hub_missions → Hermes não ligado
C. VPS_DIRTY_65 — limpeza parada por queda do canal RDC (NO_BLIND_DELETE respeitado)
D. GIT_SYNC_ROUTE_VPS = BLOCKED — espelho local manual, não volta sozinho
E. OMNI_ROUTER_8099 = FAIL/OFFLINE
F. Segredo circulou em texto claro — revogação no fim, decisão do CHEFE
G. Inventário sem casa e sem gatilho definidos
```

## 6. Importância relativa (para priorizar)

| Item | Importância | Por quê |
|---|---|---|
| Elo bot→missão | **ALTA** | é o que faz a Casa responder sozinha |
| OMNI_ROUTER_8099 offline | **ALTA** | único serviço vermelho no quadro |
| GIT_SYNC_ROUTE_VPS bloqueada | **MÉDIA-ALTA** | trava a VPS de receber mudança por Git |
| Setores em exit 90 | **MÉDIA** | falha medida, escopo isolado |
| Inventário amarrado | **MÉDIA** | evita cristal virar lixo esquecido |
| Pastas gêmeas do BRAIN | **BAIXA** | organização, não serviço |

## 7. Regra da sessão

> Toda conversa rende nota. Toda nota tem porcentagem honesta. Nada de 100%
> inventado, nada de PASS sem prova.

`sources:`
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-ESTILO-DE-FALA-AUREOLA.md`
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-EMOJI-RICO-GRAMATICA-LIMPA.md`
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-PREPRODUCAO-MCP-MAO-NA-MASSA.md`
- `docs/CENTRAL-DE-NOTIFICACOES-20260925.md`
