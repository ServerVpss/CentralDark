# 05 — PLANO DE LANÇAMENTO

```text
ESTADO         = PLANO. Nada executado.
MUTAÇÃO_FEITA  = NENHUMA
BLOQUEADOR     = checks 0/verde (fila de 79 jobs em 1 runner)
DECISÃO_PENDENTE = método de merge (CHEFE)
```

---

## 1. O que vai pra `main`

| PR | Título | Diff | Conflito |
|---:|---|---|---|
| #1149 | 🔐 PRENDER CASCO VIVO AO GATE CANÔNICO | +15/-0 | 🟢 nenhum |
| #1150 | 🕊️ SOL — contraprova independente do CASCO VIVO | +114/-0 | 🟢 nenhum |
| #1151 | 👑 PERFIL SEGREDO — banner canônico da porta pública | +68/-0 | 🟢 nenhum |
| #1152 | 👁️ CRISTALIZAR OLHO BIÔNICO ANTI-FLASH | +353/-1 | 🟢 nenhum |
| ~~#1116~~ | 🗓️ RASCUNHO — agentes por dias da semana | — | 📝 **fora** (draft) |

**Total:** 4 PRs, +550/-1, 7 arquivos distintos, **zero sobreposição**.

---

## 2. Ordem sugerida — e por que ela importa mesmo sem conflito

Tecnicamente a ordem é indiferente. Semanticamente não é:

```text
1º  #1149  🔐 prende o CASCO VIVO ao gate       → o gate passa a valer
2º  #1150  🕊️ contraprova independente do CASCO → alguém de fora confirma
3º  #1152  👁️ cristaliza o OLHO na Trigger Fabric → a percepção entra amarrada
4º  #1151  👑 registra o banner da porta pública → a fachada, por último
```

A lógica: **primeiro o gate, depois a contraprova, depois a percepção, por último a vitrine.**
Publicar o banner (#1151) antes do gate (#1149) seria anunciar porta que ainda não fecha.

`EXECUTOR_CANNOT_SELF_APPROVE` — por isso #1150 vem separado de #1149 e logo depois:
a contraprova do CASCO não pode viajar no mesmo PR que constrói o CASCO.

---

## 3. 🔴 O bloqueador

```text
runner self-hosted = 1 (online, BUSY)
fila               = 70 queued + 9 pending
checks verdes      = 0 em todos os 4 PRs
```

Vários gates exigem runner self-hosted. Com 79 jobs e 1 executor, os checks
não fecham em tempo previsível.

```text
UNKNOWN_IS_NOT_PASS = true
```

Mergear com tudo `queued` é **fabricar verde**. É exatamente o Flash que a
camada 1 de [01](01-ARQUITETURA-ANTI-FLASH.md) existe pra bloquear.

### Destravar — três caminhos

**A) Drenar a fila** — cancelar runs órfãos e liberar o runner:

```bash
gh run list --repo ServerVpss/CentralDark --status queued --limit 100 --json databaseId --jq '.[].databaseId' | xargs -I{} gh run cancel {} --repo ServerVpss/CentralDark
```

⚠️ Isso cancela **toda** a fila, inclusive jobs dos 4 PRs. Depois é preciso reenfileirar só os 4.

**B) Segundo runner** — resolve a causa raiz, não o sintoma. Exige acesso à VPS.

**C) Auto-merge** — o GitHub segura e merga sozinho quando ficar verde:

```bash
gh pr merge 1149 --repo ServerVpss/CentralDark --auto --<método>
```

🟢 **Recomendo o C.** É o único que respeita `UNKNOWN_IS_NOT_PASS` sem exigir que
alguém fique olhando a fila. O merge só acontece com verde real.

---

## 4. Decisão pendente — método de merge

**Não presumi nada.** Depois da correção do CHEFE, fica registrado:

```text
SQUASH_PROIBIDO_POR_INVARIANTE = FALSE
MÉTODO = ESCOLHA_DO_CHEFE
```

| Método | Flag | A favor | Contra |
|---|---|---|---|
| **Squash** | `--squash` | 1 commit limpo por PR na `main`; histórico legível | colapsa SHAs intermediários da branch |
| **Merge commit** | `--merge` | preserva todo SHA da branch | `main` fica com mais ruído |
| **Rebase** | `--rebase` | linear, sem commit de merge | reescreve SHAs; perde o ponto de junção |

Verificação a fazer se escolher squash: nenhum recibo já emitido pode apontar
pra um SHA **de dentro** de uma das 4 branches (só pros `HEAD` delas).
Não medi isso ainda — se o CHEFE for de squash, eu checo antes.

---

## 5. Comandos — prontos, NÃO executados

Trocar `<MÉTODO>` por `--squash`, `--merge` ou `--rebase`.

### Opção recomendada — auto-merge (espera o verde sozinho)

```bash
for pr in 1149 1150 1152 1151; do gh pr merge $pr --repo ServerVpss/CentralDark --auto <MÉTODO>; done
```

### Se os checks já estiverem verdes — merge direto, na ordem

```bash
gh pr merge 1149 --repo ServerVpss/CentralDark <MÉTODO>
```

```bash
gh pr merge 1150 --repo ServerVpss/CentralDark <MÉTODO>
```

```bash
gh pr merge 1152 --repo ServerVpss/CentralDark <MÉTODO>
```

```bash
gh pr merge 1151 --repo ServerVpss/CentralDark <MÉTODO>
```

### 🔴 O que NÃO vou fazer sem ordem escrita

```text
gh pr merge --admin        ← atropela os checks. É o Flash. Não uso.
git push --force           ← nunca
merge do #1116 (draft)     ← fora da rodada
qualquer coisa no clone local quebrado (ver 04 §6)
```

---

## 6. Pós-merge — fechar o loop

```bash
gh api repos/ServerVpss/CentralDark/commits/main --jq '.sha + " | " + (.commit.message|split("\n")[0])'
```

Novo recibo a emitir depois:

```text
RECEIPT_ID       = POS_MERGE_<timestamp>
MAIN_HEAD_ANTES  = 01135a7eca5ed6375860e35578a6db23deed34f9
MAIN_HEAD_DEPOIS = <medir>
PRs_MERGEADOS    = 1149, 1150, 1152, 1151
MÉTODO_USADO     = <o que o CHEFE escolheu>
CHECKS_NO_MERGE  = <verde real | NOT_PROVEN assumido pelo CHEFE>
UNKNOWN_RESIDUAL = VPS_RUNTIME, VECTOR_MEMORY, SESSION_HOOK, BRANCH_PROTECTION
NEXT_CURSOR      = REMEASURE_LIVE_STATE
```

E o recibo deste pacote ([04](04-RASTRO-MEDIDO.md)) vira histórico no mesmo instante —
`RECEIPT_HEAD_SHA != CURRENT_HEAD_SHA`. Como tem que ser.

---

## 7. Aguardando do CHEFE

1. **Método de merge?** squash · merge commit · rebase
2. **Auto-merge (espera verde) ou esperar a fila drenar na mão?**
3. **Cancelo a fila de 70 runs** pra liberar o runner, ou deixo drenar?

Sem resposta, nada é mergeado. `AUTHORITY_FINAL_IS_CHEFE=true`.
