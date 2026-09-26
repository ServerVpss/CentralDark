# 04 — RASTRO MEDIDO

```text
OBSERVED_AT   = 2026-08-24T22:01:34-03:00
REPO          = ServerVpss/CentralDark
MEDIDO_POR    = gh api (conta segredounlock, scopes: repo, workflow, read:org, gist)
CLASSE        = LIVE_STATE, medido agora — não é histórico, não é screenshot
```

Tudo abaixo foi **medido**, não narrado. Comando ao lado de cada número.

---

## 1. Integridade do pacote canônico — 🟢 PROVEN

```bash
sha256sum -c SHA256SUMS.txt
```

```text
RESULTADO = 18 OK / 0 FAILED
VEREDITO  = PACKAGE_INTEGRITY_PROVEN
```

O ZIP `CENTRALDARK_ARQUITETURA_CANONICA_2026-08-24.zip` (5.046.758 bytes, 19 arquivos)
prova a própria integridade. Todos os 18 hashes do `SHA256SUMS.txt` batem.

⚠️ Com o limite que o próprio pacote declara:

```text
PACKAGE_HASH_MATCH != SEMANTIC_RUNTIME_PROOF
```

---

## 2. O DELTA — 🟡 o pacote virou HISTÓRICO

Este é o achado principal.

| | SHA | Quando |
|---|---|---|
| `main` **selada no ZIP** | `53ba5d5f4704a57305702ed3ccb681f64d714848` | 2026-08-24 20:45 -03 |
| `main` **agora** | `01135a7eca5ed6375860e35578a6db23deed34f9` | 2026-08-24 21:40 -03 |

```text
status = ahead   ahead_by = 2   behind_by = 0   files_changed = 4
```

### Os 2 commits do delta

| SHA | Mensagem |
|---|---|
| `c00d5e84` | 🕊️ **CRISTAL** — estabilidade sob perturbação e liberdade com fronteira |
| `01135a7e` | 🛡️ **CASCO VIVO** — resiliência adaptativa contraprovada |

### Veredito pela lei temporal

```text
RECEIPT_HEAD_SHA (53ba5d5) != CURRENT_HEAD_SHA (01135a7)
→ RECEIPT_BECOMES_HISTORY   ✅ aplicado
→ REMEASURE                 ✅ feito aqui
→ NEW_RECEIPT               ✅ este documento
```

🟢 **Isto não é falha. É a arquitetura funcionando.** A `main` avançou 55 minutos
depois do empacotamento e o recibo antigo se declarou histórico sozinho, como projetado.
O `NEXT_CURSOR` do próprio pacote já mandava: `REMEASURE_LIVE_STATE_BEFORE_ANY_MUTATION`.

### Bônus — o delta prova os Olhos

Os 2 commits que a `main` ganhou são, literalmente, os dois Olhos de [02](02-OS-DOIS-OLHOS.md):

| Commit na main | Olho |
|---|---|
| "estabilidade **sob perturbação**" | 🌩️ Eye of the Storm |
| "resiliência adaptativa **contraprovada**" | 🛡️ casco — a fronteira de [03](03-CONTROLE-DE-FRONTEIRA.md) |

A casa implementou antes de nomear. Este pacote só nomeia.

---

## 3. PRs abertos agora — 5

```bash
gh pr list --repo ServerVpss/CentralDark --state open
```

Todos de autoria `segredounlock`. Base `main` em todos.

| PR | Título | Mergeable | Estado | Diff | Arquivos tocados |
|---:|---|---|---|---|---|
| **#1152** | 👁️ CRISTALIZAR OLHO BIÔNICO ANTI-FLASH NA TRIGGER FABRIC | 🟢 MERGEABLE | 🟡 UNSTABLE | +353/-1 | `ARCHITECTURE.mmd` · `OLHO-BIONICO-ANTI-FLASH.md` (+318) · `SOURCES.json` · `scripts/trigger-fabric/verify_package.py` |
| **#1151** | 👑 PERFIL SEGREDO — banner canônico da porta pública | 🟢 MERGEABLE | 🟡 UNSTABLE | +68/-0 | `docs/RELATORIOS/2026-08-24-PERFIL-SEGREDO-BANNER-CANONICO.md` |
| **#1150** | 🕊️ SOL — contraprova independente do CASCO VIVO | 🟢 MERGEABLE | 🟡 UNSTABLE | +114/-0 | `docs/ARQUITETURA/…/SOL-CONTRAPROVA-PAPAGAIO-CASCO-VIVO.md` |
| **#1149** | 🔐 PRENDER CASCO VIVO AO GATE CANÔNICO | 🟢 MERGEABLE | 🟡 UNSTABLE | +15/-0 | `scripts/trigger-fabric/verify_repo_contract.py` |
| **#1116** | 🗓️ RASCUNHO — AGENTES POR DIAS DA SEMANA | 🟢 MERGEABLE | 📝 **DRAFT** | — | — |

### 3.1 — 👁️ PR #1152 apareceu durante esta medição

`criado_em = 2026-08-25T00:55:50Z` — **4 minutos depois** da primeira listagem desta sessão,
que devolveu só 4 PRs. Prova viva de `HISTORY_IS_NOT_CURRENT_STATE`:
uma listagem de 4 minutos atrás já estava errada.

O #1152 cristaliza **"OLHO BIÔNICO ANTI-FLASH"** na Trigger Fabric — o mesmo território
desta arquitetura. Ele é o **owner existente** do assunto.
`REUSE_BEFORE_CREATE=true` → este pacote **não compete** com o #1152, se subordina a ele.

### 3.2 — Análise de conflito: 🟢 ZERO

```text
#1149 → scripts/trigger-fabric/verify_repo_contract.py
#1152 → scripts/trigger-fabric/verify_package.py
```

Arquivos **diferentes**, apesar de vizinhos na mesma pasta. Conferido um a um:
**nenhum arquivo aparece em dois PRs.** Todos aditivos (`-0`, exceto 1 linha no `SOURCES.json` do #1152).

```text
CONFLITO_ENTRE_PRs = NENHUM
ORDEM_DE_MERGE     = INDIFERENTE tecnicamente
```

---

## 4. Estado dos checks — 🔴 BLOQUEADOR

```bash
gh api repos/ServerVpss/CentralDark/commits/<headRefOid>/check-runs
```

Nos **três** PRs ativos, o resultado é idêntico:

```text
queued  = 15 checks   (incluindo 2x "Porta, identidade e governança canônica estão íntegras?")
skipped =  6 checks
passed  =  0 checks   ← ZERO
failed  =  0 checks
```

Checks na fila incluem, entre outros:

```text
Juiz determinístico — intenção + estado + segurança
Porta, identidade e governança canônica estão íntegras?   (x2)
Validate canonical map and consolidated areas
Cartazes canônicos — hashes e elos semânticos
Validate MCP admin guard and runtime build
drift-guard · guard · validate-title · build-counterproof-package
```

### Veredito

```text
CHECKS_GREEN = 0
ESTADO       = ⚫ UNKNOWN / NOT_PROVEN
UNKNOWN_IS_NOT_PASS = true
```

🔴 **Mergear agora seria produzir o falso-verde que a casa inteira existe pra impedir.**
O "Juiz determinístico" e o gate "Porta, identidade e governança canônica" ainda **não rodaram**.
Passar por cima deles é `ACTION_IS_NOT_PROOF` na prática.

Nota: `UNSTABLE` no GitHub = mergeable, mas com check pendente ou não-requerido falhando.
Não é verde. Não é vermelho. É **preto** pela máquina de estados da casa.

### 4.1 — 🔴 CAUSA RAIZ ENCONTRADA: fila saturada, 1 runner só

Não é falha de código. É **gargalo de capacidade**.

```bash
gh api repos/ServerVpss/CentralDark/actions/runners
gh run list --limit 100
```

```text
RUNNERS_SELF_HOSTED = 1
  vmi3256920-centraldark | status=online | busy=TRUE   ← ocupado

FILA DE EXECUÇÕES
  queued    = 70
  pending   =  9
  completed = 21
```

**70 execuções na fila para 1 único runner ocupado.**

Vários workflows exigem `runner self-hosted` explicitamente
("Gates determinísticos em runner self-hosted", "Provar gerador no HEAD do PR").
Com um runner só e 79 jobs esperando, os checks dos 4 PRs ficam `queued`
por tempo indeterminado — e **não vão virar verdes sozinhos tão cedo**.

```text
DIAGNÓSTICO = THROUGHPUT_BOTTLENECK, não FAILURE
ESTADO      = ⚫ NOT_PROVEN por indisponibilidade de medição
NÃO É       = 🔴 FAILED
NÃO É       = 🟢 PASS
```

⚠️ **A tentação exata que a casa proíbe:** "os checks nunca ficam verdes, então merga assim mesmo."
Isso é converter ⚫ em 🟢 por cansaço — a definição literal de `UNKNOWN_IS_NOT_PASS`.

Saídas legítimas, em ordem de preferência:

1. 🟢 **Esperar** a fila drenar e os checks fecharem de verdade.
2. 🟡 **Aumentar capacidade** — subir um segundo runner self-hosted.
3. 🟡 **Cancelar runs órfãos** da fila pra liberar o runner pros 4 PRs.
4. 🔒 **Ordem explícita do CHEFE** assumindo o `NOT_PROVEN` por escrito, registrada no recibo.

A saída 4 é permitida — `AUTHORITY_FINAL_IS_CHEFE=true` — mas **não pode ser silenciosa**.

---

## 5. Política de merge do repositório — medida

```bash
gh api repos/ServerVpss/CentralDark
```

```text
allow_squash_merge      = true
allow_merge_commit      = true   ← usar este
allow_rebase_merge      = true
delete_branch_on_merge  = false
default_branch          = main
```

🟢 **Os três métodos estão habilitados.** Squash, merge commit e rebase — todos disponíveis.

### ⚠️ Correção registrada (CHEFE, 2026-08-24)

> *"a regra da CentralDark não impede squash, cuidado com o que tu faz"*

Correção aceita. Eu havia escrito "não é squash" como se fosse **invariante da casa**. **Não é.**

```text
SQUASH_PROIBIDO_POR_INVARIANTE = FALSE   ← não existe tal regra
```

Varredura feita em `contracts/INVARIANTS.md`, `CORE_CONTRACT.yml`, `POMBO_HANDOFF.md`
e `EPISTEMIC_STATE_MACHINE.md`: **nenhum invariante menciona método de merge.**
A casa governa *prova*, *writer único* e *rastro* — não a forma do commit.

O que de fato vale:

```text
MÉTODO_DE_MERGE = DECISÃO_DO_CHEFE, por rodada
                ≠ INVARIANTE
                ≠ padrão que eu possa presumir
```

O que os invariantes exigem, **independente do método escolhido**:

| Exigência | Squash preserva? | Merge commit preserva? |
|---|---|---|
| `PROOF_MUST_REACH_DESTINATION` | 🟢 sim | 🟢 sim |
| `RECEIPT_IS_HEAD_SCOPED` | 🟢 sim (novo SHA) | 🟢 sim (novo SHA) |
| rastro do PR de origem | 🟢 sim (nº do PR na mensagem) | 🟢 sim |
| SHAs individuais dos commits da branch | 🟡 colapsados | 🟢 preservados |

Único ponto real de atenção: squash **colapsa os SHAs intermediários**.
Se algum recibo já emitido apontar pra um SHA de dentro da branch, esse ponteiro
morre no squash. Não é proibição — é uma verificação a fazer antes.

**Nenhum método está pré-selecionado por mim. O CHEFE escolhe.**

`branch protection` da `main`: **não legível** — `HTTP 403, "Upgrade to GitHub Pro
or make this repository public"`. Repo privado em plano Free.

```text
BRANCH_PROTECTION_MAIN = ⚫ UNKNOWN (não mensurável neste plano)
```

Consequência honesta: **não há gate de plataforma protegendo a `main`.**
A proteção é toda cultural/CI. Isso torna respeitar os checks *mais* crítico, não menos.

---

## 6. 🔴 Clone local quebrado — achado não solicitado

```bash
cd /e/CentralDark/Pivete/CentralDark && git status
```

```text
remote  = https://github.com/ServerVpss/CentralDark.git   ✅ é o repo certo
branch  = feat/gatilhos-execucao-reversivel-remediacao
posição = ahead 3, behind 76        🔴
HEAD    = 51e3cd4c (2026-08-22 19:23) "crystal: delta-cadeado-trancado skill + receipt"
```

### Problema 1 — merge conflict parado no meio

```text
UU package.json
UU package-lock.json
```

`UU` = *both modified*, conflito **não resolvido**. O working tree está travado
num merge incompleto desde ~22/08. 21 arquivos sujos no total.

### Problema 2 — nomes de arquivo corrompidos

Cinco entradas untracked com o caminho colado como nome literal:

```text
"E:CentralDark_RECONCILIATIONOUROPR_1144CONTRACT.yml"
"E:CentralDark_RECONCILIATIONOUROPR_1144MATERIAL-INGEST.md"
"E:CentralDark_RECONCILIATIONOUROPR_1144verify_repo_contract.py"
"E:CentralDark_RECONCILIATIONOUROLOCALskills 2/"
"E:CentralDark_RECONCILIATIONOUROPASTA_TRANCADA 2"
```

Assinatura clássica de redirect/cópia no Windows onde `\` foi perdido.
São **cópias de arquivos do PR #1144** derramadas na raiz do clone.

### Veredito

```text
CLONE_LOCAL = 🔒 LOCKED — não tocar sem ordem do CHEFE
MOTIVO      = merge conflict não resolvido + 3 commits locais não publicados
RISCO       = qualquer reset/clean destrói os 3 commits ahead
AÇÃO_AGORA  = nenhuma. Preservado como está.
```

⚠️ Os 3 commits `ahead` podem conter trabalho não publicado. **Não limpei nada.**
A rodada de PRs (seção 3) roda 100% pelo `gh`, sem depender deste clone.

---

## 7. Fronteira honesta — o que continua ⚫ NOT_PROVEN

Herdado do pacote canônico e **revalidado**: nada disto foi provado nesta sessão.

```text
WINDOWS_E_CENTRALDARK_SAME_HERMES_CORE_ACTIVE = NOT_PROVEN
VECTOR_MEMORY_RUNTIME                         = NOT_PROVEN
SESSION_END_HOOK_PHYSICAL_WIRING              = NOT_PROVEN
VPS_RUNTIME                                   = NOT_PROVEN
EXTERNAL_CHAT_SESSION_INHERITANCE             = NOT_PROVEN
BRANCH_PROTECTION_MAIN                        = NOT_PROVEN (403)
CHECKS_DOS_PRs_1149_1150_1151                 = NOT_PROVEN (queued)
ATRIBUTOS_EXATOS_DOS_DOIS_OLHOS               = PARCIAL (wikis 403/402)
```

```text
IMPLEMENTED_ON_MAIN != RUNNING_NOW
CONTRACT_IN_GIT     != UNIVERSAL_RUNTIME_PROOF
```

---

## 8. NOVO RECIBO

```text
RECEIPT_ID          = ANTI_FLASH_ARCH_2026-08-24T22:01:34-03:00
DESTINATION_LOCK    = E:\CentralDark\_RECONCILIATION\ARQUITETURA-ANTI-FLASH-2026-08-25\
REPO                = ServerVpss/CentralDark
MAIN_HEAD_MEDIDO    = 01135a7eca5ed6375860e35578a6db23deed34f9
PACOTE_ANTERIOR     = 53ba5d5f... → HISTÓRICO (delta de 2 commits)
PACKAGE_INTEGRITY   = PROVEN (18/18)
PRs_ABERTOS         = 1149, 1150, 1151, 1152 (+1116 draft)
CHECKS_VERDES       = 0  (causa: 1 runner, 79 jobs na fila)
CONFLITO_ENTRE_PRs  = NENHUM
MÉTODO_DE_MERGE     = ⚫ NÃO DECIDIDO — escolha do CHEFE, sem padrão presumido
PAPAGAIO_MODE       = OFF
POMBO_MODE          = CHECKSUM_ON
ACTION_IS_PROOF     = false
MUTAÇÃO_EXECUTADA   = NENHUMA
CORREÇÃO_APLICADA   = "squash não é proibido por invariante" (CHEFE, 2026-08-24)
NEXT_CURSOR         = DRENAR_FILA → CHECKS_VERDES → CHEFE_ESCOLHE_MÉTODO → MERGE
```

→ Plano de execução em [05 — PLANO DE LANÇAMENTO](05-PLANO-DE-LANCAMENTO-PR.md)
