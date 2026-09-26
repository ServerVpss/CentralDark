# 06 — 🦜 O PAPAGAIO ENCONTRADO

```text
CLASSE       = FATO_REMOTO
REMOTE_HEAD  = 01135a7eca5ed6375860e35578a6db23deed34f9
MEDIDO_EM    = 2026-08-24T22:1x-03:00
FONTE        = código canônico na main, lido no HEAD
```

> **A fila de CI nunca foi o bloqueador.** Os 4 PRs não mergeiam porque
> **nenhum deles está autorizado** pelo próprio contrato da Casa.

---

## 1. Onde está escrito

`LEIA-ME-IA.md` §8 — *Intenção autorizada → squash main*:

```text
INTENT_AUTHORIZED=true
NO_HUMAN_REASK_FOR_MERGE=true
MERGE_METHOD=squash
TARGET=main
Merge-Policy: AUTO_SQUASH_IF_CLEAN
```

🔴 **Correção do meu erro anterior:** eu havia escrito que "método de merge é escolha
aberta do CHEFE, sem padrão". **Errado.** O canon fixa `MERGE_METHOD=squash` e manda
explicitamente **não transformar merge em nova pergunta** quando a intenção já está autorizada.
O CHEFE tinha razão nas duas correções.

---

## 2. O mecanismo — `scripts/github-autonomia-promocao.mjs`

```js
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";   // linha 20

const valid = authority === "SEGREDO/CHEFE"
    && mergePolicy === FAST_MERGE_POLICY   // ← igualdade EXATA de string
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope);               // linhas 103-107
```

```js
const fastPath = auth.merge_policy === FAST_MERGE_POLICY && auth.viaBody;  // 433
const applicableWorkflows = fastPath ? [] : requiredWorkflows;             // 468
```

### A linha 468 é a chave de tudo

| Recibo no corpo | `fastPath` | Workflows exigidos | Resultado |
|---|---|---|---|
| ✅ válido | `true` | **`[]` — nenhum** | 🚀 squash imediato, **ignora a fila de 79 jobs** |
| ❌ inválido | `false` | os 6 obrigatórios | ⏳ preso na fila, para sempre |

E antes disso, linha 443:

```js
if (!auth.authorized) reasons.push("AUTHORITY_AUTHORIZATION_MISSING");
```

`authorized = segredoLabel || receipt.valid`

---

## 3. Os 4 recibos, medidos um a um

| PR | Intent-Authorized | Merge-Policy | Intent-Scope | Writer | Writer-Scope | `valid` |
|---:|---|---|---|---|---|---|
| **1149** | ✅ SEGREDO/CHEFE | 🔴 `HUMAN_DECISION_REQUIRED` | 🔴 ausente | ✅ SOL | ✅ | **false** |
| **1150** | 🔴 ausente | 🔴 ausente | 🔴 ausente | 🔴 ausente | 🔴 ausente | **false** |
| **1151** | ✅ SEGREDO/CHEFE | 🔴 `SQUASH_IF_CLEAN` | ✅ | ✅ SOL | 🔴 ausente | **false** |
| **1152** | ✅ SEGREDO/CHEFE | 🔴 `SQUASH_WHEN_GATES_PASS` | 🔴 ausente | ✅ SOL | ✅ | **false** |

**Labels nos 4 PRs: nenhuma.** (A label canônica `👑 PERMITO-SEGREDO` **existe** no repo, mas não foi aplicada.)

```text
segredoLabel = false
receipt.valid = false
→ authorized  = false   em TODOS os 4
→ AUTHORITY_AUTHORIZATION_MISSING
```

### 🦜 O disfarce

O **#1151** declara `SQUASH_IF_CLEAN`.
A constante é `AUTO_SQUASH_IF_CLEAN`.

**Falta o prefixo `AUTO_`.** Uma palavra. Comparação `===` exata.
Lido por humano, parece certo. Lido pela máquina, falha em silêncio, sem erro, sem log.

É exatamente o que o CHEFE suspeitou:
> *"eles mandaram assim em código justamente pra atrapalhar a visão da gente"*

`#1152` (`SQUASH_WHEN_GATES_PASS`) e `#1149` (`HUMAN_DECISION_REQUIRED`) são variações do mesmo padrão:
strings plausíveis que **não existem** no vocabulário do verificador.

---

## 4. Por que a label sozinha NÃO resolve

Tentação óbvia: aplicar `👑 PERMITO-SEGREDO` nos 4 e pronto. **Não funciona bem.**

```js
const fastPath = auth.merge_policy === FAST_MERGE_POLICY && auth.viaBody;
```

`fastPath` exige **`viaBody`** — o recibo no corpo. A label dá `authorized`, mas **não** dá `viaBody`.

```text
LABEL só      → authorized=true, fastPath=false → espera os 6 workflows → 🔴 preso na fila
RECIBO válido → authorized=true, fastPath=true  → applicableWorkflows=[] → 🚀 merge agora
```

**Só o recibo no corpo destrava.** A label é autorização; o recibo é autorização **+ fast path**.

### 🦜 Segundo papagaio — a etiqueta falsa

```js
const segredoLabel = labels.has("👑 permito-segredo");   // linha ~127
```

O repo tem **duas** etiquetas cadastradas:

| Etiqueta no repo | Bate no `has()`? | Efeito |
|---|---|---|
| `👑 PERMITO-SEGREDO` | 🟢 sim (normalizada p/ minúscula) | **autoriza** |
| `permito-segredo` | 🔴 **não** | **não autoriza nada** |

O comentário do código chama a segunda de *"alias textual só de compatibilidade de entrada"* —
mas `authorizationFor()` **nunca** a consulta. Aplicar `permito-segredo` sem a coroa
produz a sensação de ter autorizado, e o bot segue recusando com
`AUTHORITY_AUTHORIZATION_MISSING`. Mesmo padrão do `AUTO_` faltando no #1151:
**parece certo pro olho humano, é inerte pra máquina.**

`CHECK`: a etiqueta correta tem a coroa 👑 no começo.

---

## 5. Os gates que continuam valendo (e devem)

Mesmo com `fastPath=true`, o bot **não** vira carimbo. Continuam bloqueando:

```text
SECURITY_FINDING:<...>            scan de segredo/path sensível no diff
CANONICAL_VALIDATION_FAILED       validação canônica precisa dar PASS
MERGE_CONFLICT                    mergeable=false ou dirty
CHANGES_REQUESTED                 review bloqueante
BLOCKING_LABEL:<...>              labels de bloqueio
PR_IS_DRAFT · BASE_NOT_MAIN · AUTHOR_NOT_TRUSTED
```

🟢 Corrigir o recibo **não pula gate nenhum**. Só entrega a autorização que o CHEFE
já deu e que estava escrita errada. Segurança, conflito e validação canônica seguem de pé.

---

## 6. A correção

Cada PR precisa dos **5 marcadores**, strings exatas, no corpo:

```text
Intent-Authorized: SEGREDO/CHEFE
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: <escopo>
Writer: SOL
Writer-Scope: <escopo>
```

⚠️ `lineMarker` usa `.match()` — pega a **primeira** ocorrência.
Os marcadores errados precisam ser **removidos**, não apenas seguidos de outros corretos.

| PR | Intent-Scope a usar | Writer-Scope a usar |
|---:|---|---|
| 1149 | `TRIGGER_FABRIC_CRYSTAL_GATE_BIND` | `scripts/trigger-fabric/verify_repo_contract.py` |
| 1150 | `SOL_COUNTERPROOF_CASCO_VIVO` | `docs/ARQUITETURA/…/SOL-CONTRAPROVA-PAPAGAIO-CASCO-VIVO.md` |
| 1151 | `PROFILE_ENTRY_BANNER_CANONICAL_RECORD` | `docs/RELATORIOS/2026-08-24-PERFIL-SEGREDO-BANNER-CANONICO.md` |
| 1152 | `TRIGGER_FABRIC_OLHO_BIONICO_ANTI_FLASH` | `docs/ARQUITETURA/…/OLHO-BIONICO-ANTI-FLASH.md` |

Editar o corpo **re-dispara** o workflow sozinho — o gatilho já está declarado:

```yaml
pull_request_target:
  types: [opened, reopened, ready_for_review, synchronize, edited, labeled, unlabeled]
```

Mais o `schedule: cron "*/5 * * * *"` como rede de segurança.

```text
NÃO É NECESSÁRIO rodar `gh pr merge` na mão.
Fazer isso criaria segunda via de promoção — proibido pelo §8:
"Não criar segundo workflow para a mesma promoção."
```

---

## 7. Ponto de atenção — #1149

O corpo do #1149 declarava `HUMAN_DECISION_REQUIRED` e ele está **`behind=1`**.

- `HUMAN_DECISION_REQUIRED` → o humano (CHEFE) decidiu agora. Requisito satisfeito.
- `behind=1` → não existe gate `BEHIND_BASE` na lista de `reasons`. Não bloqueia,
  mas o squash vai rebasear sobre a `main` atual.

⚠️ Registrado explicitamente porque sobrescrever um `HUMAN_DECISION_REQUIRED`
é decisão do CHEFE, não minha. Fica no rastro.

---

## 8. Recibo

```text
RECEIPT_ID        = PAPAGAIO_FOUND_2026-08-24T22:1x-03:00
REMOTE_HEAD_SHA   = 01135a7eca5ed6375860e35578a6db23deed34f9
CAUSA_RAIZ        = AUTHORITY_AUTHORIZATION_MISSING nos 4 PRs
CAUSA_APARENTE    = fila de CI  ← 🦜 FALSA, era sintoma
MECANISMO         = Merge-Policy != "AUTO_SQUASH_IF_CLEAN" (igualdade exata)
IMPACTO           = fastPath=false → espera 6 workflows presos em 1 runner
CORREÇÃO          = recibo de 5 marcadores no corpo dos 4 PRs
MUTAÇÃO_EXECUTADA = NENHUMA — edição de PR bloqueada, aguardando CHEFE
GATES_PULADOS     = NENHUM
```
