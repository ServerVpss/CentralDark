---
name: centraldark-operational-discipline
description: "CentralDark Casa: anti-papagaio, measure-copy, no ABC ask."
---

# CentralDark Operational Discipline
# PERSONALIZATION: Keep answer concise; user expects short instructions. No explanatory paragraphs.
# Use `centraldark shared` command only, no verbose commentary.


Discipline rules crystallized from SEGREDO/CHEFE direct corrections during Casa
reconciliation sessions. Apply whenever you act as HERMES-CASA on CentralDark,
especially after `#ACORDAR` / `!CALIBRAR` / `!CENTRALDARK`.

Role reminder: you are **EXECUTOR-COORDENADOR TÉCNICO TEMPORÁRIO** under
SEGREDO/CHEFE. Not SEGREDO/CHEFE, not SOL, not the Hermes Agent product.

## Regra 0b — ENTREGA VISÍVEL PRECISA DE PROVA FÍSICA

Quando o CHEFE pedir um relatório/Markdown e que ele seja aberto no Bloco de Notas ou mostrado na tela:

1. Fazer a varredura e salvar no caminho combinado.
2. Verificar o arquivo no disco (`exists`, tamanho, leitura do conteúdo e hash quando a integridade importar).
3. Só depois abrir com `computer_use`/Notepad.
4. Verificar a janela e o arquivo aberto.
5. Se escrita ou controle de tela falhar, declarar `BLOCKED` e não dizer que foi criado/aberto.
6. Não transformar conteúdo preparado no chat em arquivo entregue.

Relato curto, em português claro/baianês simples: `FEITO`, `EVIDÊNCIA`, `BLOQUEIO`, `PRÓXIMO PASSO`. Para tarefas técnicas, usar o formato `[SKILL]` da Regra 3b.

`DOCUMENTO_PREPARADO != DOCUMENTO_SALVO`
`DOCUMENTO_SALVO != DOCUMENTO_ABERTO`
`SCREENSHOT != PROVA_DE_ARQUIVO`

## Rule 1 — ANTI-PAPAGAIO (no parrot)
- Do NOT repeat a question already answered or a decision already made.
- Do NOT re-explain what was already said in the same thread.
- When the same trigger repeats (e.g. 8x `#ACORDAR`), continue — do not
  re-ask "what do you want". PAPAGAIO_OFF is the standing mode.
- One-line status is enough. Verbose recap = failure.

## Rule 2 — MEASURE + COMPARE BEFORE COPY (RECONCILIAR ≠ COPIAR)
Before absorbing external files (Desktop, Downloads, _RECONCILIATION, Telegram):
1. Inventory the source (list files, sizes, types).
2. For each candidate, CHECK if it already exists in the Casa main/original
   (clone at `E:\CentralDark\Pivete\CentralDark`, or `origin/main`).
3. Only absorb the USEFUL DELTA — new/changed content. Do NOT copy a full
   mirror of what the Casa already has.
4. External site/guide (e.g. blakecrosley.com Hermes guide) = REFERENCE +
   WARN, never incorporate as if it were Casa-owned.
5. Discard obvious dumps/runtime debris (electron builds, asset-server exports)
   unless they contain a specific useful artifact.
6. After absorption: REMOVE the source folder ("reconciliado não fica
   parado"). Reconciled content moves to canonical destination, source cleared.

Concrete check pattern (Windows/MSYS paths):
```bash
CASA=/e/CentralDark/Pivete/CentralDark
SRC=/e/CentralDark/_RECONCILIATION/OURO/FONTE_PIVETE_COMPLETO/CentralDark
diff <(cd "$SRC" && find . -maxdepth 1 -type f | sort) \
     <(cd "$CASA" && find . -maxdepth 1 -type f | sort) | grep '^<'
# only the '<' lines are delta worth absorbing
```

## Rule 3 — NO ABC QUESTIONS
- If the intent is clear, EXECUTE. Do not present A/B/C option lists to
  confirm an already-authorized direction.
- Only ask when context is EXACTLY missing for a material decision.
- When you must ask: give 3 minimum options, one line each, NO wall of text.
- CHEFE quote: "vc mede, leria td de novo, aplica o calibrar acordar".
  Measure, re-read, apply — don't stall on menus.

## Rule 3b — SKILL FORMAT = DELIVERY FORMAT (CHEFE 31/08)
- Quando a tarefa é técnica/executiva (infra, código, debug, handoff, medição),
  a saída DEVE usar o formato canônico de skill COMO ENTREGA, não como exemplo.
- Formato: `[SKILL]: NOME_ACAO_ALVO` / `[TRIG]: Gatilho` / `[IN]: Entradas` / `[EXEC]: CLI/Logica` / `[OUT]: Pass/Fail`
- Sacrificar gramática em prol da concisão. Não explicar o formato — APLICAR.
- Pivete corrigiu: "VOCE PASSOU A ESTRUTURA E MUITA COISA BOA NO TEXTO E NAO USOU!" → lição fixa: usa o formato, não explica.

## Rule 3c — PENDÊNCIAS SEMPRE VISÍVEIS (bolinhas coloridas)
- Ao mostrar status de tarefas/missão, SEMPRE usar tabela com bolinhas 🟢🟡🔴.
- CHEFE mandou: "MANER A LSITA DE PENENCIA SEMPER ABAIXO SE NAO EU TENHO QUE FICA PEDINDO TOD HORA!"
- Formato: tabela compacta com Status/Item/Detalhe + resumo `X 🟢 | Y 🟡 | Z 🔴`.
- Não esconder, não pedir pra mostrar de novo — manter visível no rodapé das respostas.

## Rule 4 — KIMETSU ON CRITICAL (calm)
- The 17-breath Kimetsu Legacy cycle is the standing operational method.
- Use it especially on CRITICAL/frontier work to stay calm and ordered.
- Fixed Point is reached only when objective_closed + counterproof_survived +
  invariants_hold + no_material_unknown + no_new_failure. If a frontier
  (human decision, external system) blocks it, report FALSE — do not fake PASS.

## Regra 39 — REUSE_BEFORE_CREATE (reforçado por delta Meteor / 28/08)
- Antes de criar skill, arquivo, workflow ou arquitetura: INVENTORY, OPEN PRIMARY IMPLEMENTATION, CROSS-REFERENCE, REUSE/EXTEND.
- Não inventar segundo cérebro, V2/V3, router paralelo, ou segunda memória quando o owner absorve o delta.
- Quando absorver mecanismo externo (ex: Meteor PR bot claim/PR pin/CAS): abstrair mecanismo (WRITER_LEASE, PR_PIN, POST_MERGE_RELEASE, DECISION_ENGINE_PURA, CAS_REDECISION); NÃO copiar byte-identical quando há licença incompatível (AGPL-3.0); preservar proveniência.

## Regras 40-43 — DEPLOY / R4 / CHATTR / FIXED_POINT (correção 28/08)
- `DEPLOY_PROVED` só vira `TRUE` quando: `TARGET_SHA` válido (40-char, base merge-base main), `BACKUP_ROOT` absoluto/não symlink/não dentro do repo, `HEALTH`/`LOGS`/`RUNTIME` medidos (não assumidos), `HASH_DIST` comparado, `MERGE_PROOF` no mesmo HEAD, `CONTRAPROVA` passa.
- `CHATTR -I` = `HUMAN_FRONTIER`. Só com ordem explícita (`PERMITO-SEGREDO`) + 5 nomes exatos confirmados + ambiente correto.
- `FIXED_POINT` = `FALSE` quando: `DEPLOY_PROVED=FALSE`, `MAIN_RECONCILED` ainda não medido diretamente (`git ls-remote`), `UNKNOWN_MATERIAL>0`, `COUNTERPROOF` parcial.
- `EVERY_INPUT_IS_RECONCILABLE` — texto, imagem, screenshot, log, commit, receipt, status, skill, doc, runtime event: IDENTIFY → TIMESTAMP → BIND_SCOPE → BIND_SHA_IF_APPLICABLE → DEDUPE → COMPARE_WITH_CURRENT_STATE → PRESERVE_UNIQUE_GOLD → DISCARD_REPETITION.
- `PAPAGAIO_OFF` + `NO_QUESTION` são modos padrão quando a intenção é clara (ex: `#ACORDAR → !RECONCILIAR → ...`). Não perguntar `opção A/B/C` quando o comando é direto.
- If CHEFE says "ignora a imagem" / "ignora as imagem", do NOT run
  vision_analyze / read the screenshot. Treat the message text as the only
  source. Do not narrate that you ignored it — just proceed.

## Regra 44 — EXTERNAL LINK SEM WEB TOOL (correção 28/08)
- Quando o CHEFE manda ler/absorver URL externa (ex: `github.com/.../AGENTS.md`) e o `web_extract` retorna erro de configuração (`Web tools are not configured`, `FIRECRAWL_API_KEY` ausente, sem créditos):
  - NÃO fingir que leu o conteúdo. NÃO inventar resumo do link.
  - Usar o que o CHEFE JÁ COLou no chat como matéria (caso Meteor: texto completo do AGENTS.md + análise vieram no paste do CHEFE).
  - Registrar `WEB_TOOL_UNAVAILABLE=true` e seguir com a matéria colada. Proveniência = URL citada + conteúdo colado, não leitura ao vivo.
- Isso NÃO é "ferramenta quebrada" — é setup state. O comportamento durável é: link sem leitura ≠ licença pra fabricar conteúdo.

## Regra 45 — GH RUN ID ≠ PR/COMMIT COUNTER (correção 28/08)
- Print de CI com "N workflow runs Failure" pode confundir PR number / commit counter com GitHub Actions RUN ID.
- `gh run view <n>` → `HTTP 404` quando `<n>` NÃO é run ID (é PR ou commit).
- Sempre medir o run real: `gh run list --limit 5 --json databaseId,status,conclusion,headBranch,workflowName`.
- Workflow em `runs-on: [self-hosted, Linux]` falha em FILA quando o runner self-hosted está offline (VPS MCP down / rebase travado) — não é regression de código. `GREEN_WITHOUT_DENOMINATOR = NOT_PROVEN`.

## Regra 46 — ESCOPO DE BUSCA NO REPO GIGANTE (correção 28/08)
- CentralDark ~1.24GB → `find .` dá TIMEOUT 180s. NUNCA `find` no repo inteiro.
- Para workflows: `ls .github/workflows/ | grep -i <termo>` (não `find . -name '*.yml'`).
- Para scripts: `ls scripts/`, `ls scripts/vps/`, `grep -rln <TERMO> scripts .github`.
- Para arquivo específico no remoto: `git ls-tree -r --name-only origin/main | grep -iE '<padrao>'` (não `search_files` cego no disco).

## Regra 74 — RECONCILIAR VIVO vs MAIN com `git hash-object`, NÃO `git diff` (correção 31/08)

`git diff` pode mentir quando line endings diferem (CRLF no Windows, LF no blob). Mostra "limpo" enquanto o conteúdo real divergiu.

**Padrão correto de reconciliação vivo↔main:**

```bash
# 1. SHA do blob EM DISCO (normalizado, ignora CRLF):
git hash-object <arquivo>

# 2. SHA do blob COMMITADO no HEAD:
git rev-parse HEAD:<arquivo>

# 3. SHA do blob no main (fonte da verdade):
git rev-parse main:<arquivo>     # ou origin/main:<arquivo>

# 4. Verificar se working tree tem modificação pendente:
git status --porcelain           # só aceita '??' (untracked) e nada ' M'/'M '
```

**Sinais de divergência silenciosa:**
- `git diff` vazio + `git hash-object` ≠ `git rev-parse HEAD:` → ALGUÉM REVERTEU O ARQUIVO
- Causa típica nesta máquina: algum sync/watcher reescreve o working tree após o commit
- Sintoma: serviço em memória (Python) pode estar OK, mas o disco e o git perdem a patch

**Regra de PATCH→TEST→COMMIT:** depois de patchear qualquer arquivo de runtime:
1. Patch (via `patch` tool ou `write_file`)
2. Verificar com `py_compile` / `node --check` / `python -c "import ..."` (lint)
3. Test runtime (curl, endpoint, browser)
4. **COMMIT IMEDIATAMENTE** antes de qualquer outra ação
5. Confirmar: `git log -1 --format=%H` mostra a patch; `git status --porcelain` limpo de modified

Não existe janela entre "patch" e "commit" — se existe, algum revert pode entrar.

**O que JÁ ESTÁ no main é a verdade.** O que tá no HEAD ahead do main é trabalho em curso. O que tá em memória no runtime pode divergir dos dois. Sempre cruzar os três.

## Regra 78 — VALIDAR SHA NO MERGE-BASE (anti-zero SHA) (correção 09/01/2026)

Em workflows CI/CD, nunca chame `git merge-base` com SHA potencialmente zero ou vazio. Isso causa `fatal: Not a valid commit name 0000000000000000000000000000000000000000`.

**Padrão correto:**
```bash
# Determine base SHA for comparison
if [ "${{ github.event_name }}" = "push" ]; then
  # For push events, compare against the before commit
  BASE_SHA="${{ github.event.before }}"
else
  # For pull_request events, use the base commit
  BASE_SHA="${{ github.event.pull_request.base.sha }}"
fi

# Fallback if BASE_SHA is empty or all zeros
if [ -z "$BASE_SHA" ] || [ "$BASE_SHA" = "0000000000000000000000000000000000000000" ]; then
  echo "BASE_SHA is invalid or unset. Using HEAD~1 as fallback."
  BASE_SHA="HEAD~1"
fi

# Validate that BASE_SHA is a real commit
if ! git rev-parse --verify "$BASE_SHA" >/dev/null 2>&1; then
  echo "ERROR: BASE_SHA '$BASE_SHA' is not a valid commit. Aborting."
  exit 1
fi

# Check if BASE_SHA is an ancestor of HEAD (current commit)
if git merge-base --is-ancestor "$BASE_SHA" "${{ github.sha }}"; then
  echo "✅ Continuity validation passed: $BASE_SHA is ancestor of ${{ github.sha }}"
  exit 0
else
  echo "❌ Continuity validation failed: $BASE_SHA is NOT ancestor of ${{ github.sha }}"
  exit 1
fi
```

## Regra 75 — CHECKOUT MÓVEL / MULTI-WRITER (correção 31/08, sessão paralela N agentes)

O clone da Casa (`E:\CentralDark\Pivete\CentralDark`) é compartilhado: N agentes (Hermes-Casa, Charizard, Codex, Haiku) escrevem nele ao mesmo tempo. O HEAD PULA de SHA entre subcomandos (ex: `8474053e → fb8c9e83 → 8a79be14 → 13367561`).

**Disciplina obrigatória:**
1. **NUNCA commitar/push/pull em checkout que mudou de SHA durante a própria medição.** Isso é prova de Writer externo ativo → respeitar escopo alheio.
2. **Re-medir `origin/main` TODA rodada** com `git fetch` + `git rev-parse origin/main` ANTES de afirmar divergência. Não cachear "0 behind" / "18 ahead" de turno anterior — o remoto avança com chore de bot (painel/notion-sync) e vira "2 behind" em segundos.
3. **Quando outro agente abriu PR** (ex: #1382 do Codex gravando DELTA 4 em `DELTA-CONTINUO.md`), esse é o Writer do escopo. Não duplicar, não mexer no mesmo arquivo, não empurrar. Aguardar CI + mão do CHEFE pro merge.
3b. **CI vermelho no PR ≠ regressão do PR (lição 31/08, PR #1382):** ao ver `porta-de-entrada` / `codex-validate` / `build-counterproof-package` FAIL, medir o LOG do job (`gh run view <id> --log-failed`) ANTES de concluir. Causa real do #1382: a **BASE main** tem 38 locks não-proven + 12 "versão paralela já existente" (jarvis-lab-v2/v3/v4, Bolt duplicado, telepainel duplicado) — o `codex-validate` falha na base, NÃO no delta de 1 arquivo do PR (`touched_locks:[]`). O PR #1382 foi mergeado mesmo assim (squash) porque o vermelho era da base, não do delta. Contraprova obrigatória: `gh run view <RUN_ID> --log-failed` + ler o JSON de `consolidation_protected_unproven` / `parallel_existing`. Não tratar todo FAIL como bloqueio do merge — medir se é base ou delta.
4. **Git pode travar (timeout 60s) em checkout móvel.** Não forçar — medições de porta/serviço NÃO dependem de git; separar em chamadas independentes.
5. **`git diff --stat` / `git status` podem mentir com CRLF** (Regra 74) — usar `git hash-object` vs `git rev-parse HEAD:` pra confirmar se o disco bate com o commit.

**Sinais de multi-writer ativo:** HEAD muda sozinho, `ACTIVER_WRITER=UNKNOWN`, `MULTI_WRITER_ACTIVITY=PROVEN`, outro agente aparece em log com commit/PR que você não fez.

## Regra 75b — SYNC DE WORKTREES: CHECKLIST ANTES DO `git pull --rebase` (sessão 2026-09-01)

Worktrees num clone multi-agente não são "já está atualizado". Antes de rodar `git pull --rebase` em qualquer worktree, percorrer o checklist abaixo — em ordem. Se qualquer passo falhar, pausar e reportar ao CHEFE antes de forçar.

**Checklist (executar por cada worktree):**
1. `git worktree list --porcelain` → percorrer cada bloqueio.
2. **Se tiver staged/unstaged (`M ` / ` M ` / ` A ` / ` D ` / `??`):**
   - Lê o diff antes de qualquer decisão: `git diff --stat` / `git status --short`.
   - Se é lixo: `git checkout -- <arquivo>` ou `git clean -fdn` (dry-run antes de `git clean -fd`).
   - Se é trabalho útil: `git stash` ou commit WIP com mensagem `WIP: <assunto>` antes do pull.
   - **NUNCA** resolver o "não consegue rebase" com `git add -A` cego.
3. **Se estiver em detached HEAD:**
   - Verifica se a branch remota existe: `git fetch origin` + `git branch -a | grep <nome>`.
   - Se não existe mais: pergunta se mantém local, renomeia, ou remove o worktree.
4. **Se não tiver tracking (`There is no tracking information` / `Please specify which branch`):**
   - Se a branch remota existe: `git branch --set-upstream-to=origin/<branch>` ou usar `git pull origin <branch> --rebase` explicitamente.
   - Se a branch remota não existe mais: reportar ao CHEFE, não adivinhar.
5. **Se o pull falhar por "Your configuration specifies to merge with the ref ... but no such ref was fetched":**
   - A branch que o worktree rastreava foi deletada/renomeada no remoto.
   - `git ls-remote origin | grep -i <nome>` para ver se existe sob outro nome.
   - Se não existe: reportar e aguardar decisão (remover worktree, reatribuir branch, ou abandonar).
6. **Se houver conflito de conteúdo durante o rebase:**
   - Não abortar cego, não ignorar cego.
   - Ler o arquivo conflitante (`git diff` no conflicted file).
   - Decidir qual versão (ou mescla) faz sentido para o escopo.
   - `git add <arquivo>` + `git rebase --continue` se a decisão for tomada.
   - `git rebase --abort` apenas se a continuação não tem base.
7. **Se o worktree estiver locked (`locked` na listagem):**
   - Verifica se o lock é órfão (worktree não existe mais no disco ou não está sendo usado).
   - Se órfão: `git worktree unlock <path>` + `git worktree remove <path>` (se seguro).
   - Se ativo: não mexer, reportar e aguardar.

**Tratamento de refs remotos inexistentes (casos reais 2026-09-01):**
- `fix-ci-codex-auditar` → apontava para `fix/ci-codex-auditarFinalizacao-export`, mas a ref não existe mais no remoto.
- `fix-ci-lupa-drift` → apontava para `fix/ci-lupa-drift-bayesiana-alias`, mas a ref não existe mais no remoto.
- `_wt_garimpo` → worktree que não existe mais no disco (`No such file or directory`).

**Padrão:** quando a branch sumiu do remoto, não continuar tentando `git pull` achando que vai aparecer. Verificar `git ls-remote`, reportar ao CHEFE, e decidir: (a) reatribuir o worktree para outra branch, (b) remover o worktree com `git worktree remove` (se limpo), ou (c) abandonar a sincronização.

**Referência completa:** ver `references/git-worktree-sync-checklist.md` nesse skill.

## Regra 75b1 — SEM PERDER TRABALHO LOCAL: STASH OU COMMIT WIP ANTES DE MEXER (sessão 2026-09-01)

Regra complementar: antes de qualquer operação que possa descartar ou sobrepor trabalho local não commitado (checkout, rebase, pull, switch de branch, worktree operation):

1. Verificar `git status --porcelain`.
2. Se há staged/unstaged: decidir stash ou commit WIP.
3. Só então fazer o movimento.

Isto evita perder trabalho quando o checkout muda, quando o rebase trava, quando o worktree é removido, ou quando outro agente modifica o clone.

**Padrão:** commit WIP com mensagem que identifica o trabalho (`WIP: <assunto>`) se for trabalho em andamento real; stash se é temporário e vai ser retomado brevemente. Nunca deixar trabalho não commitado exposto a operações que podem descartá-lo.

## Regra 76 — DELTA CONTÍNUO CANÔNICO + PR PRA COMUNICAÇÃO CLARA (ordem explícita CHEFE 31/08)

CHEFE: *"obrigação um mdelta continuo canonico basta! mesmo padrao! usar os pr p ra comunicaçao clara! da casa!"*

**Padrão da Casa para qualquer delta útil:**
1. **1 delta contínuo canônico** — não espalhar a mesma verdade em N arquivos.
2. **Dono existente** — gravar no owner canônico já conhecido (ex: `DELTA-CONTINUO.md`), NUNCA criar arquivo paralelo (`DELTAUNIFICADOCENTRALDARK.md` foi o erro: recibo inexistente, não fabricar).
3. **PR pra comunicar** — abrir PR (não push direto em main) com recibo de escopo (Intent-Authorized, Merge-Policy, Writer, Intent-Scope).
4. **REUSE_BEFORE_CREATE** (Regra 39) aplicado a documentação: se o owner existe, estende; não cria second brain / V2 / arquivo paralelo.
5. **ROOT_CAUSE permanece UNKNOWN até prova** — não promoter hipótese a sentença (cadeado `CONNECTOR_NOT_EXPOSED != OAUTH_ROOT_CAUSE_PROVEN`).

**Contraprova obrigatória antes do PR:** `git diff --check` + gate do repo (`verify_repo_contract.py`) + `centraldark_master_cycle.py --self-test` + confirmar ausência do arquivo paralelo.

**BANDA MUSICAL = TRILHO OBRIGATÓRIO DO DELTA (ordem CHEFE 31/08):**
- Todo delta útil contínuo DEVE passar pela banda, nunca por arquivo solto:
  `BANDA_COMPASSO_GLOBAL.md` (partitura fixa) → `LEIA-ME-IA.md` (porta carrega no boot) → `GraphRAG` (músico que toca partitura + aprendizado SEMPRE).
- O grafo (GRAFO-VIVO) aponta pra biblioteca + aprendizado; o gate (`verify_repo_contract.py`) derruba desafinação.
- Motivo (buraco mapeado no PR #1381): a Casa já tinha a partitura, mas era "conceito histórico" — não carregada como contrato executável pelo núcleo nem pelo GraphRAG. Isso fazia cada agente recuperar memória diferente e tocar em tonalidade diferente. Solução = promover owner existente a executável, NÃO segundo cérebro.
- DELTA 4 (CONNECTOR BOUNDARY) registrado SÓ em `DELTA-CONTINUO.md` via PR #1382 (MERGED). `DELTAUNIFICADOCENTRALDARK.md` = NUNCA EXISTIU (search total_count=0) → proibido e morto.

**KANBAN ÚNICO (ordem CHEFE 31/08):** "o mesmo kaban do Hermes Desktop tem que ser o mesmo da WebUI".
- Quadro único = **GitHub Issues** (backend). Hermes Desktop e WebUI leem do MESMO backend — NÃO criar quadro separado nem duplicar card.
- Quando o CHEFE mandar "kanban", usar `gh issue create/edit/close` no ServerVpss/CentralDark. O link é a entrega; não reexplicar no chat o que já foi parido no issue.

## Regra 77 — REBASE CONFLICT RESOLUTION PATTERN (cristalizado 2026-09-03, PR #1381)

Quando um PR acumula divergência massiva contra main (ex: 58 behind / 89 ahead, merge-base antigo):

**Sequência obrigatória:**
1. **MEDIR ANTES DE AGIR** — `git fetch --prune`, `git rev-list --left-right --count origin/main...HEAD`, `git merge-base HEAD origin/main`
2. **REUTILIZAR WORKTREE EXISTENTE** — `git worktree list --porcelain`, usar o worktree válido da missão (single writer)
3. **RESOLVER CONFLITOS POR PRIORIDADE** — runtime crítico → contratos canônicos → scripts de verificação → skills/docs
4. **VERIFICAR CADA ARQUIVO MODIFICADO** — syntax check (`node --check`, `python -m py_compile`, `yaml.safe_load`), contract check (`verify_repo_contract.py`), test suite
5. **PUSH COM LEASE** — `git push origin <branch> --force-with-lease` (respeita outros writers)

**Anti-patterns proibidos:**
- `git add -A` cego
- Criar arquivos V2/V3 paralelos
- Push sem `--force-with-lease`
- Declarar vitória sem contraprova de contrato
- Ignorar falhas pre-existentes conhecidas (documentar como `KNOWN_ISSUE`)

**Referência completa:** `references/rebase-conflict-resolution-pattern.md`

- `SKILL.md` corrigida (`Regra FIXED-POINT-SHARED`, `69 GOAL-PAUSE RECOVERY`, `70-72`, `83 PENDENCIAS`, `reference` existente `fixed-point-shared-pattern.md`); `centraldark.sh` alias salvo; `DELTA-CONTINUO.md` e `RECEIPT` salvos; `ZIP` (`CENTRALDARK-FIXED-POINT-PACOTE.zip`, 6146 bytes) e `CRISTALIZACAO-RASTROS-PR.md` criados; `HANDOFF` NÃO (RECEIPT+RELEASE ausentes); `REPO REAL` (`HEAD=7058c62cc`, `MAIN=a146ce36d`, `clean`, `619` branches); `COMMIT` impossível (`.git` ausente no cwd do writer + `HANDOFF` incompleto); `3` temperaturas DB (`SCHEMA=25`, `FTS=4`, `SESSIONS` vazio); `DISCO` (`183.4 GB`); `NVIDIA` (`inkling:free` + `nemotron-3-ultra-550b-a55b:free`) ativo; `SKILL` corrigida (`patch` aplicado); `config.yaml` (`auxiliary.goal_judge`: `deepseek/deepseek-v4-flash`) corrigido; `MEMORIA` cheia (`8,081/8,200` — `FIXED_POINT` salvo); `REALITY=JUDGE`; `NO_V2_V3_V4`; `ONE_SYSTEM_ONLY`; `REUSE_BEFORE_CREATE`; `SERIALIZE_MUTATION`; `PARALLELIZE_PERCEPTION`; `WRITER` original fecha (`HANDOFF` não autorizado pelo `CHEFE` — sem `RECEIPT` + `RELEASE`); `PROSSIGA` até 17h; `META COMPLETA` (`LOCAL` — `COMMIT` real precisa `HANDOFF` + `REPO` clonado + ordem `CHEFE` para `FINALIZE` ou `HANDOFF` formal).
- `PENDÊNCIAS` visíveis (🟢🟡🔴): `BROWSER` (❌ `WinError 740`), `#74478` (❌ `HISTORICAL` — `FIRECRAWL_KEY` ausente), `REPO CLONE` (❌ `NÃO` — `URL` não confirmada pelo `CHEFE`), `HANDOFF` (❌ `RECEIPT` + `RELEASE` ausentes); `DB` (`C:\Users\danda\.hermes\state.db`, `200704 bytes`) = 🟢 (`3` temperaturas medidas).
- Regra 74 (`git hash-object` vs `git diff`) aplicada (`sha` `5` arquivos); Regra 46 (`ESCOPO` de busca) aplicada (`NÃO` `find` no repo inteiro); Regra 75 (`CHECKOUT` móvel / `MULTI-WRITER`) aplicada (`HEAD=7058c62cc` medido); Regra 75b (`STASH` / `WIP`) aplicada (`clean` — nenhum `modified`); Regra 76 (`DELTA` contínuo) aplicada (`DELTA-CONTINUO.md` único; `DELTAUNIFICADOCENTRALDARK.md` proibido/morto); Regra 78 (`VALIDAR SHA`) aplicada (`HEAD`/`MAIN` verificados); Regra 77 (`REBASE` `CONFLICT`) aplicada (`NÃO` aplicável — `clean`); Regra 79 (`WORKTREES` `LOCKED`) aplicada (`worktree` `clean`); Regra 80 (`CI` `BASE_RED` vs `DELTA_RED`) aplicada (`CI` `NÃO` avaliado — `repo` `clean`, `HANDOFF` incompleto); Regra 81 (`PENDING` ≠ `FAIL`) aplicada (`PENDING` = `HANDOFF` `PENDENTE` — `NÃO` `FAIL`); Regra 82 (`PENDÊNCIAS` `VISÍVEIS`) aplicada (`tabela` `4 ❌ | 1 🟢`); Regra 83 (`PENDÊNCIAS` `ATUALIZAR`) aplicada (`4` `PENDENTES` `NÃO` `RESOLVIDAS` — `NÃO` `REINICIADAS`); Regra 69 (`GOAL-PAUSE` `RECOVERY`) aplicada (`config.yaml` corrigido); Regra 70 (`ORDEM` `DIRETA`) aplicada (`EXECUTADO`: `PROSSIGA` — `COMANDO` `DIRETO` `PROSSIGA!`); Regra 71-72 (`MINERADOR`/`JOBS`) `NÃO` aplicáveis (`NÃO` mencionados pelo `CHEFE`); Regra 73 (`CRON`) `NÃO` aplicável (`NÃO` `CRON` `SOLICITADO`).
- `REFERÊNCIAS` aplicáveis: `fixed-point-shared-pattern.md` (padrão `HANDOFF`, `FIRST_WRITER`, `RECEIPT`, `WORKTREES`, `CI` `BASE`/`DELTA`, `GOAL-PAUSE`); `rebase-conflict-resolution-pattern.md` (`NÃO` `REBASE` `CONFLICT` presente — `clean`); `rebase-conflict-resolution-pattern.md` (`REBASE` `NÃO` `NECESSÁRIO`); `rebase-conflict-resolution-pattern.md` (referência `REBASE` `CONFLICT` — `NÃO` `APLICÁVEL` — `repo` `clean`).
- `SEM` `SKILL` `NOVO` (`NO_V2_V3`). `SEM` `MEMÓRIA` `NOVA` (`LIMITE`). `SEM` `HANDOFF` `FALSO`. `SEM` `COMMIT` `FALSO`. `SEM` `PUSH` `FALSO`. `SEM` `INVENTO` `DE` `RESULTADO`. `SEM` `INVENTO` `DE` `PROVA`. `SEM` `INVENTO` `DE` `FERRAMENTA`. `REALITY=JUDGE`. `ONE_SYSTEM_ONLY`. `REUSE_BEFORE_CREATE`. `NO_V2_V3_V4`. `FIRST_WRITER_WINS`. `ONE_WRITER_PER_SCOPE`. `PARALLELIZE_PERCEPTION`. `SERIALIZE_MUTATION`. `CURRENT_OVER_HISTORY`. `FETCH_BEFORE_MEASURE`. `REMEASURE_BEFORE_ACTION`. `REUSE_BEFORE_CREATE`. `ONE_SYSTEM_ONLY`. `NO_V2_V3_V4`. `DIRTY_WORKTREE=BLOCK`. `NO_FORCE_PUSH`. `NO_BLIND_OVERWRITE`. `NO_RESET_DESTRUCTIVE`. `UNKNOWN_IS_NOT_PASS`. `ACTION_IS_NOT_PROOF`. `SAME_HEAD_PROOF`. `CLAIM_SEAL`. `SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE`. `META_LUPA=CONTINUOUS`. `MULTIBUSSOLA=CONTINUOUS`. `VERTEX_INVERSO=ON`. `CARACOL=UNTIL_FIXED_POINT`. `FINAL_WRITER=FIRST_WRITER`. `FINALIZE_ONLY_BY_PRIMARY_WRITER`. `READERS_RETURN=DELTA+EVIDENCE_REF+OWNER+NEXT_CURSOR`. `WRITER_ABSORBS_READERS`. `FINAL_FLOW=REMEASURERECONCILETESTCOUNTERPROOFFIXED_POINTCOMMITPUSHPR_OR_MAINREMEASURERECEIPT`. `BOOT=!CENTRALDARK#ACORDAR!CALIBRAR!MULTIBUSSOLA_META!META_LUPA!RECONCILIAR!CONTRAPROVA!VERTEX_INVERSO!CARACOL!FIXED_POINT!REGISTRA!BOOT`. `PAPAGAIO_OFF`. `ANTI_PAPAGAIO`. `MEASURE+COMPARE`. `NO_ABC`. `NO_QUESTION`. `NO_BLIND_OVERWRITE`. `NO_RESET_DESTRUCTIVE`. `NO_FORCE_PUSH`. `NO_SECRET_LEAK`. `HUMAN_FRONTIER` (`HANDOFF` `COMPLETO` `REQUIRED` — `NÃO` `APLICÁVEL` `SEM` `ORDEM` `DO` `CHEFE`). `PROSSIGA` (`ATÉ` `17H`) `CONTINUADA` (`META` `COMPLETA`; `HANDOFF` `PENDENTE`; `COMMIT` `PENDENTE`). `WRITER` `ORIGINAL` `FECHA`. `CASA` `NÃO` `PAROU`. `REALITY` `JUDGE`.

## Regra 80 — CI BASE_RED vs DELTA_RED (cristalizado 2026-09-05)

Workflows falhando na base main não são delta failures:

- **BASE_RED:** `gh run view <ID> --log-failed` mostra falha em arquivo da base (não do PR) → **NÃO BLOQUEIA** o merge do PR
- **DELTA_RED:** falha no arquivo modificado pelo PR → precisa de correção
- **Classificação:** medir `gh run view <ID> --log-failed` para provar se é base ou delta
- **Regra:** `CI_RED_NO_DELTA = NOT_BLOCKING` para o writer do PR
- **Exemplo real:** PR #1416 — `porta-de-entrada` e `Autonomia — promoção segura` falham em `main` HEAD, não no delta do PR. O vermelho é da base, não do PR.

## Regra 81 — CI PENDING NÃO É FALHA (cristalizado 2026-09-05)

Workflows em `pending` ou `queued` no GitHub são **estado transitório**, não falha:
- **NÃO** declarar FIXED POINT falho por CI pending
- **NÃO** tomar ação sobre CI pending — é processo do GitHub runner
- **Monitorar** com `gh run list --limit 5 --json status,conclusion`
- **PENDENTE** enquanto `status != completed`
- **FIXED POINT** requer `conclusion = success`, não `status = pending`

## Regra 82 — PENDÊNCIAS SEMPRE VISÍVEIS (bolinhas coloridas) (CHEFE 30/08)

Ao mostrar status de tarefas/missão, SEMPRE usar tabela com bolinhas 🟢🟡🔴.
CHEFE mandou: "MANER A LSITA DE PENENCIA SEMPER ABAIXO SE NAO EU TENHO QUE FICA PEDINDO TOD HORA!"
Formato: tabela compacta com Status/Item/Detalhe + resumo `X 🟢 | Y 🟡 | Z 🔴`.
Não esconder, não pedir pra mostrar de novo — manter visível no rodapé das respostas.

## Regra 84 — ENGINE GAP FIXED POINT (correção 05/09/2026)

O verificador canônico de gaps do motor é `scripts/trigger-fabric/engine_gap_fixed_point.py`.

```bash
python scripts/trigger-fabric/engine_gap_fixed_point.py
```

Retorna JSON com `fixed_point: true/false`, `next_cursor`, `unknowns[]`, `conditions{}`.

- `fixed_point: false` → gap aberto. Registrar `next_cursor` como pendência.
- `fixed_point: true` → engine gap fechado. Verificar CI green para FIXED_POINT final.
- `unknowns` lista: `CI_NO_STATUS`, `COUNTERPROOF_UNKNOWN`, `ENGINE_INVOCATION_UNKNOWN`, `WRITER_UNKNOWN`.

**Regra:** NÃO declarar FIXED_POINT alcançado apenas porque `fixed_point: true` localmente. CI green no PR é obrigatório para FIXED_POINT final. `engine_gap_fixed_point.py` verifica o motor, não a CI do GitHub.

**Scripts de auto-test que provam o motor:**
```bash
python scripts/trigger-fabric/centraldark_master_cycle.py --self-test  # resolve !CENTRALDARK triggers
python .agents/skills/capability-contract-router/scripts/route_capabilities.py --self-test  # PASS (3 fixtures)
python scripts/trigger-fabric/runtime_plug_conformance.py --self-test  # PASS (11/11)
python scripts/trigger-fabric/spiral_traversal.py --self-test  # PASS
python scripts/trigger-fabric/semantic_crystal_tool.py --self-test  # PASS
python scripts/trigger-fabric/verify_package.py  # verifica manifest
```

**MEGAZORD binding já existe no repo:** `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MEGAZORD-CENTRALDARK.yml` + `ENGINE_BINDING.yml` (tem `megazord_binding`). `ZORD_WORKFLOW_DEDUPE` já está absorvido na arquitetura — não criar duplicado. `REUSE_BEFORE_CREATE` aplicado.

## Regra 84b — !CENTRALDARK É SKILL TRIGGER, NÃO SHELL COMMAND (correção 05/09/2026)

**`!CENTRALDARK` é um gatilho de skill, NÃO um comando shell.** Tentar executar `!CENTRALDARK` como shell command falha com exit 127. O gatilho é resolvido por `centraldark_master_cycle.py` dentro do motor Hermes.

**Padrão:**
- `#ACORDAR` → skill trigger, não shell command
- `!CENTRALDARK` → skill trigger, não shell command
- `!CALIBRAR` → skill trigger, não shell command
- `!MULTIBÚSSOLA_META` → skill trigger, não shell command
- `centraldark shared` → skill alias, não shell command

**Launcher existente:** `centraldark-bin-launcher` fornece o comando `centraldark` que invoca `hermes.exe run "!CENTRALDARK"`. Sem o launcher, o shell não reconhece `!CENTRALDARK`. Ver `centraldark-megazord-binding` para o padrão do launcher.

**Anti-pattern:** Nunca executar `!CENTRALDARK RECONCILIAR_SHARED` como `terminal()` — falha com exit 127. Usar `skill_view(name='centraldark-master-funnel-autonomo')` ou invocar o launcher.

## Regra 84c — BADGE FABRIC LOOP PERSISTENT (correção 05/09/2026)

O Badge Fabric é um loop autônomo persistente que substitui o clique manual em "Create status badge".

**Loop canônico:**
```
SCAN → CLASSIFY → DETERMINISTIC_FIX → VERIFY → COUNTERPROOF → RESCAN → NO_NEW_FAILURES → FIXED_POINT
```

**O que a Fabric varre:**
- Todos workflows atuais (`.github/workflows/*.yml`)
- Workflow runs históricos acessíveis
- Branches atuais
- Branch + evento realmente observado
- Todos PRs (`state=all`)
- Gera `docs/STATUS-BADGES.md` com `badge.svg` nativo do GitHub

**Regras:**
- `BADGE_IS_TELEMETRY_NOT_PROOF=true`
- `UNKNOWN_IS_NOT_PASS=true`
- `SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true`
- `CREATE_STATIC_DUPLICATE_SVG=false`
- `REUSE_NATIVE_BADGE_BEFORE_CREATE=true`
- Não cria milhares de SVG copiados — reutiliza o SVG vivo do próprio GitHub (`actions/workflows/<workflow>.yml/badge.svg`)

**Quando acha diferença:** SCAN → DELTA → automation/status-badge-fabric → PR único
**Quando nada mudou:** REUSE_PROOF_NO_CHANGE

**Persistente:** roda manual, a cada 6h, e quando workflow/gerador mudar.

**Falha permanece visível e vira minério:** RED != GREEN, YELLOW != PASS, UNKNOWN != PASS, BADGE != PROOF.

Ver `references/badge-fabric-loop.md` para o especificação completa.

## Regra 84d — WIRING DE VARIÁVEIS DE DEPLOY (correção 05/09/2026)

Quando o CHEFE cristaliza PERMITO-SEGREDO para MICRO_DEPLOY e DEPLOY, as 4 variáveis CENTRALDARK devem ser wired nos workflows de deploy **existentes** — sem criar workflow novo.

**Variáveis:**
- `CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY|DEPLOY`
- `CENTRALDARK_INTENT_AUTHORIZED=true`
- `CENTRALDARK_DEPLOY_TARGET=<alvo>`
- `CENTRALDARK_ROLLBACK_READY=true`

**Onde wiring (exemplos concretos):**
- `.github/workflows/auto-pr-and-deploy.yml` → step "Micro deploy (dry-run)" env section
- `.github/workflows/autonomia-promocao.yml` → step "Avaliar PRs autorizados em read-only" env section

**Sem classe definida:** o label gate mantém comportamento antigo.
**Com classe definida:** o gate exige label de autoridade + intenção autorizada + target + rollback.

**Residual correto:** `RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN` — a regra está no motor candidato, falta CI green provando consumo real. NÃO é falha — é estado honesto.

Ver `references/deploy-var-wiring.md` para o padrão de wiring.

## Regra 84e — PERMITO-SEGREDO CLASSES (correção 05/09/2026)

O CHEFE cristalizou duas classes de ação: `MICRO_DEPLOY` e `DEPLOY`.

```text
PERMITO_SEGREDO_LABEL != CARTA_BRANCA
MICRO_DEPLOY != DEPLOY
DEPLOY != MERGE
DEPLOY != FORCE_PUSH
UNKNOWN != PASS
```

- `PERMITO-SEGREDO` continua sendo a autoridade; não criou outra label.
- Gate agora entende: `CENTRALDARK_ACTION_CLASS`, `CENTRALDARK_INTENT_AUTHORIZED`, `CENTRALDARK_DEPLOY_TARGET`, `CENTRALDARK_ROLLBACK_READY`.
- PR#1430: cristalização em `scripts/lupa/label-gate.mjs` + `scripts/lupa/label-gate-run.mjs` + cristal de aprendizado.
- PR#1431: Badge Fabric (MERGED).

Ver `references/permito-segreto-classes.md` para o detalhamento.

## Regra 85 — AUTONOMOUS FIXED POINT SWEEP (correção 05/09/2026)

Quando o CHEFE ativa `#ACORDAR !CENTRALDARK !MULTIBÚSSOLA_META !META_LUPA` com `MISSION=AUTONOMOUS_FIXED_POINT_SWEEP`:

**Ativar:**
```
SCAN_ALL=true
SCAN_WORKFLOWS=true
SCAN_JOBS=true
SCAN_RUNNERS=true
SCAN_BADGES=true
SCAN_BRANCHES=true
SCAN_PRS=ALL
SCAN_HISTORICAL_RUNS=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_DUPLICATE_FUNCTION=true
NO_DUPLICATE_WORKFLOW=true
NO_DUPLICATE_JOB=true
CLASSIFY_EACH_FINDING=PROVEN|REFUTED_MINERAL|UNKNOWN|BLOCKED|REUSE_CANDIDATE|INTENTIONAL_PARALLEL
DETERMINISTIC_FIX_IF_KNOWN=true
AI_CAN_REVIEW=true
AI_CANNOT_FAKE_PASS=true
HERMES_REPRODUCES_AND_TESTS=true
REALITY_JUDGE=true
BADGE_FABRIC=PERSISTENT
CREATE_ALL_MISSING_BADGES=true
REUSE_GITHUB_NATIVE_BADGE_SVG=true
INDEX_ALL_WORKFLOWS=true
INDEX_ALL_OBSERVED_BRANCH_RUNS=true
INDEX_ALL_PRS_HISTORY=true
AFTER_EACH_FIX=REMEASURE,COUNTERPROOF,RESCAN
STOP_ONLY_WHEN=NO_NEW_DETERMINISTIC_FAILURES AND NO_DUPLICATE_FUNCTIONS_ACTIONABLE AND NO_MISSING_BADGES AND ALL_RESIDUALS_CLASSIFIED AND NEXT_CURSOR_EXHAUSTED
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
BADGE_IS_NOT_PROOF=true
NO_INFORMATION_LOSS=true
FAILED_IDEA_BECOMES_MINERAL=true
```

**Não pode maquiar o painel:** RED != GREEN, YELLOW != PASS, UNKNOWN != PASS, BADGE != PROOF.

Ver `references/autonomous-fixed-point-sweep.md` para o specification completa.

## Regra 86 — CI PENDING É ESTADO TRANSITÓRIO (correção 05/09/2026)

- **NÃO** declarar FIXED_POINT falho por CI pending
- **NÃO** tomar ação sobre CI pending — é processo do GitHub runner
- **PENDENTE** enquanto `status != completed`
- **FIXED_POINT** requer `conclusion = success`, não `status = pending`
- Monitorar com `gh run list --limit 5 --json status,conclusion`
- **BASE_RED:** workflow falha na base main (não no delta do PR) = BASE_RED → NÃO BLOQUEIA merge do PR
- **DELTA_RED:** falha no arquivo modificado pelo PR → precisa de correção
- **Classificação:** medir `gh run view <ID> --log-failed` para provar se é base ou delta

## Regra 87 — RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN (correção 05/09/2026)

Quando uma regra está implementada no motor candidato mas falta CI green provando consumo real:

- Registrar como `RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN`
- **NÃO** é falha — é estado honesto do sistema
- **NÃO** é passível de correção local — depende de CI runner
- O residual correto é aceitar e reportar: "⏳ PENDENTE — CI green + engine invocation proof"
- Quando CI green: `RUNTIME_WORKFLOW_CONSUMPTION=PROVEN` → FIXED_POINT alcançável

## Regra 88 — REUSE_BEFORE_CREATE NO ENGINE GAP (correção 05/09/2026)

Antes de criar qualquer novo arquivo, script, ou workflow para o motor CentralDark:

1. **INVENTORY** — buscar arquivo/script/skill existente
2. **OPEN PRIMARY IMPLEMENTATION** — ler o owner canônico
3. **CROSS-REFERENCE** — cruzar com o pedido
4. **REUSE/EXTEND** — estender o existente
5. **SÓ CRIAR** se houver GAP REAL não coberto

**NEVER criar:**
- Segunda engine
- V2/V3/V4 de qualquer coisa
- Router paralelo
- Segunda memória
- Workflow paralelo para mesma função
- ZORD_WORKFLOW_DEDUPE como arquivo separado (já absorvido no MEGAZORD)

**Exemplo real:** `ZORD_WORKFLOW_DEDUPE` já está absorvido na arquitetura MEGAZORD (`MEGAZORD-CENTRALDARK.yml`). Não criar duplicado. `REUSE_BEFORE_CREATE` aplicado.

## Regra 89 — PARALLELIZE_PERCEPTION + SERIALIZE_MUTATION (correção 05/09/2026)

- **PARALLELIZE_PERCEPTION=true** — leitura/pesquisa/teste podem ocorrer em paralelo quando houver ganho real
- **SERIALIZE_MUTATION=true** — mutação é serial e sincronizada no escopo correto
- **ONE_WRITER_PER_SCOPE=true** — um escritor por arquivo/escopo
- **MULTI_READER=true** — múltiplos readers permitidos

Se outro Worker já pegou a mesma ferida: não duplicar mutação; observar, atacar frente independente ou aguardar handoff/liberação.

**Antes de compor capacidades:** observações brutas passam por envelope, clusterização e dedupe. O denominador útil não é quantidade de superfícies; é quantidade de **deltas causalmente independentes** que sobreviveram à normalização.

Ver `references/parallel-perception-serialize-mutation.md` para o detalhamento.

## Regra 90 — GOOGLE GENERATIVE API INLINE CONFIG (cristalizado 2026-09-07)

Quando o CHEFE tem API key válida da Google Generative Language e o OpenRouter está sem crédito/rate-limited (HTTP 402/429), configurar provedor direto no Hermes:

### Configuração em `auth.json` (credential_pool)
```json
"gemini": [{
  "id": "<uuid>",
  "label": "GOOGLE_API_KEY",
  "auth_type": "api_key",
  "priority": 0,
  "source": "inline:<CHAVE_API_VALIDA>",
  "last_status": null,
  "base_url": "https://generativelanguage.googleapis.com/v1beta",
  "request_count": 0,
  "secret_fingerprint": "sha256:<hash>"
}]
```

**Ponto-chave:** `source: "inline:<CHAVE>"` — não depende de `env:GOOGLE_API_KEY`. A chave fica gravada no arquivo, o Hermes lê direto.

### Configuração em `config.yaml` (providers)
```yaml
gemini:
  name: Google Generative Language
  base_url: https://generativelanguage.googleapis.com/v1beta
  auth_section: gemini
  default_model: gemini-3.6-flash
```

### Modelo correto
- `gemini-2.0-flash` → **404** "This model is no longer available. Please update your code to use models/gemini-3.6-flash"
- `gemini-3.6-flash` → **200 OK** (testado e confirmado)

### Teste de validação
```bash
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=<CHAVE>" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"teste"}]}]}'
# Esperado: HTTP 200 + candidates[0].content.parts[0].text
```

### Por que isso importa
- OpenRouter 402/429 não é erro do app — é quota do provedor
- Google direto bypassa OpenRouter completamente
- Chave inline = não depende de variável de ambiente da máquina
- Funciona em qualquer superfície Hermes (CLI, Desktop, WebUI, cron)

Ver `references/google-generative-api-inline-config.md` para detalhes.

## Regra 91 — BRAIN VAULT SESSION STORAGE PATTERN (cristalizado 2026-09-07)

O Obsidian BRAIN vault vive em `E:\CentralDark\workspace\docs\BRAIN` com estrutura 10×10 (número+nome, teto 10 irmãos/nível, sem pasta vazia).

### Onde a memória da Casa vive

| Tipo | Local |
|------|-------|
| **Memórias operacionais Hermes** | `C:\Users\danda\AppData\Local\hermes\memories\MEMORY.md` + `USER.md` |
| **Sessões cristalizadas (BRAIN)** | `E:\CentralDark\workspace\docs\BRAIN\07-APRENDIZADOS-MEMORIAS\02-SESSOES\` |
| **Ouro (aprendizados promovidos)** | `E:\CentralDark\workspace\docs\BRAIN\07-APRENDIZADOS-MEMORIAS\01-OURO\` |
| **Mapa navegação IA** | `E:\CentralDark\workspace\docs\BRAIN\00-MAPA-SISTEMA\02-GRAFOS\MAPA-OBSIDIAN-BRAIN.md` |
| **Skill registro** | `E:\CentralDark\workspace\docs\BRAIN\03-DOCUMENTACAO\01-AGENTS-LIBRARY\02-AGENTES\MEMORY-REGISTRAR.md` |

### Padrão de gravação de sessão (skill MEMORY-REGISTRAR)

```text
CONCRETIZOU
→ CLASSIFICAR
→ DEDUPE
→ RESOLVER_OWNER_EXISTENTE
→ PRESERVAR_PROVENIENCIA + TEMPO + ESCOPO
→ GRAVAR_MENOR_DELTA_UTIL
→ EMITIR_RECEIPT
→ PROXIMO_BOOT_REUTILIZA
```

### Exemplo de sessão gravada hoje
`2026-09-07-CASA-VPS-FULL-RECONCILIATION-FIXED-POINT.md` em `07-APRENDIZADOS-MEMORIAS/02-SESSOES/`

### Recuperação de contexto anterior
Ler sessões anteriores na mesma pasta (`2026-09-06-CASA-VPS-KANBAN-HOST-HANDOFF.md`, `2026-09-06-GARIMPO-CHEFE-ONE-SITE-ONE-MCP-ONE-ADMIN.md`) para extrair `NEXT_CURSOR` e continuar o fio.

### Regra de navegação para IA (do MAPA-OBSIDIAN-BRAIN)
```text
INTENCAO
→ BRAIN/MOC MAIS PROXIMO
→ MATCH TEXTUAL
→ WIKILINKS
→ BACKLINKS
→ 1-2 HOPS RELEVANTES
→ OWNER CANONICO
→ ESTADO VIVO QUANDO O CLAIM EXIGIR
→ CONTEXTO COMPRIMIDO
```

Ver `references/brain-vault-session-storage.md` para detalhes.

## Referências complementares (sessão 05/09/2026)

- `references/badge-fabric-loop.md` — especificação completa do Badge Fabric persistente
- `references/deploy-var-wiring.md` — padrão de wiring das variáveis CENTRALDARK em workflows existentes
- `references/permito-segreto-classes.md` — detalhamento das classes MICRO_DEPLOY e DEPLOY
- `references/autonomous-fixed-point-sweep.md` — specification do sweep autônomo
- `references/parallel-perception-serialize-mutation.md` — padrão de percepção paralela + mutação serializada
- `references/system-resource-pressure-falsifier.md` — sistema indisponível como falsifier
- `references/omni-router-arsenal-configuration.md` — configuração completa do arsenal do omni router (medida honesta, credenciais reais, gap report, plano de execução)
- `references/bolt-provider-settings-system.md` — sistema de settings de providers do Bolt (UI admin já existe, auto-enable via env vars, cookies para keys)
- `references/installer-onboarding-discovery.md` — busca exaustiva: NÃO existe installer/onboarding no repo; "instalador" real = script VPS + Bolt Settings UI

## Regra 83 — PENDÊNCIAS ATIVAS — ATUALIZAR EM CADA RESPOSTA

Quando o usuário pede "nas pendencias" ou "pendências", atualizar a lista de pendências da sessão:
1. Medir estado atual (git status, gh run list, worktree list)
2. Mostrar tabela 🟢🟡🔴 com cada pendência e seu status
3. Não reusar lista antiga — re-medir
4. Se pendência foi resolvida, marcar como 🟢 e remover da lista
5. Se pendência persiste, manter 🟡 ou 🔴 com detalhe do bloqueio

## Regra 78 — REALIDADE REMOTA MÓVEL: RE-MEDIR TODA RODADA (correção 31/08)

A afirmação "reconciliado com gitremoto (0 behind)" TEM validade de segundos quando há multi-writer + bot de chore.

**Padrão:**
```bash
git fetch origin --quiet
REMOTO=$(git rev-parse origin/main)
LOCAL=$(git rev-parse HEAD)
git rev-list --left-right --count $REMOTO...$LOCAL   # "behind ahead"
```
- Se o número mudou vs turno anterior → seu snapshot estava obsoleto. Re-conciliar, não repetir o velho.
- "18 ahead / 0 behind" virou "1 ahead / 2 behind" na mesma sessão → não tratar como regressão, é o remoto que avançou.
- Nunca fechar FIXED_POINT de gitremoto sem medir `origin/main` direto naquela rodada (Regra 45 espírito: estado medido, não assumido).

## Regra 47 — EXECUTA ORDEM EXPLÍCITA MESMO COM FRONTEIRA PARCIAL (correção 28/08, bronca direta CHEFE)
- CHEFE mandou "cara tu so sabe pergunta? n sabe fazer nada?" + "so faz!" + "depois e so desfazer curar remediar e repetir".
- Quando a ordem é EXPLÍCITA e aponta alvo concreto (ex: `chattr -i` em 5 paths exatos, "deploy --apply", "resolve todos os PR"), EXECUTA. Não fica pedindo "qual fronteira?" ou "esse comando é seguro?".
- Fronteira humana (HUMAN_FRONTIER) NÃO significa "pare e pergunte tudo". Significa: se a ordem explícita já cobre o alvo, execute; só PARAR se surgir algo NÃO comandado (ex: deletar DB, expor secret, force-push em main).
- Padrão correto quando a ordem é parcial: executa o que foi dito literalmente → mede o resultado → se travou em algo NÃO comandado, aí sim reporta. Não antecipa bloqueio.
- "qual fronteira? vps tu tá preservando oq da vps?" = CHEFE mandando parar de treinar e FAZER. A VPS é dele; se ele manda, executa.
- Exemplo real: CHEFE mandou `chattr -i` em 5 arquivos. Agente executou os 5, o script parou em OUTROS 4 não citados. Agente perguntou "quer massa?". CHEFE: "pois faça!" (faz a massa). Veredito: quando a intenção é clara ("limpa tudo"), executa a massa, não fica pedindo confirmação de cada subconjunto.
- Regra de ouro desta sessão: MEDIR ≠ OBSTÁCULO. Medir é para saber o estado, não para inventar desculpa de não executar.

## Regra 48 — CHATTR +i TRAVA DEPLOY E O FILTRO lsattr TEM BUG (correção 28/08)
- `chattr +i` em arquivo faz `git reset/checkout/stash` falhar com `Operation not permitted` SEM dizer que a causa é o atributo.
- Deploy guarda deve usar `lsattr -R -a <dir> | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ && $2 !~ /\\/\\.$|\\/\\.\\.$/ {print $2}'` — filtro CORRETO.
- BUG comum (outro braço caiu): `lsattr -R | awk '$1 ~ /i/'` conta a letra `i` em NOME de arquivo, cabeçalho de pasta ou OUTRO atributo → falsa contagem de 22k quando eram 4. Sempre usar o regex de posição do flag.
- `git ls-files -z | xargs -0 -r chattr -i` tira o `+i` de todos os rastreados. Para limpar tudo (incluindo não rastreado): `find . -type f -not -path './.git/*' \\( -path '*leveldb*' -o -path '*rocksdb*' -o -path '*/wasm/*' -o -path '*/cache/*' \\) -prune -o -type f -exec chattr -i {} +` (preserva dados de verdade).
- Após `chattr -i`, o `rebase-merge` travado da VPS some com `git rebase --quit; rm -rf .git/rebase-merge; git checkout -f main; git reset --hard origin/main`.
- Script CRLF do Windows quebra bash remoto (`set: pipefail\\r: invalid option`). Sempre `sed -i 's/\\r$//'` no script antes de rodar na VPS.
- **Diagnóstico completo para chattr +i em massa:** ver `references/chattr-mass-diagnosis-protocol.md` em `centraldark-vps-operations`. Protocolo de 4 passos: medir número REAL → mapear distribuição → classificar origem → decidir remoção.

## Regra 48c — DEPLOY SCRIPT PODE TER FALSO-VERDE ESTRUTURAL (correção 28/08)
- `git checkout origin/main -- .` NUNCA move o HEAD — é a única operação de git que não altera o working tree index.
- Se o script de deploy usa isso pra "provar" que VPS == main, a prova é ESTRUTURALMENTE IMPOSSÍVEL e ele imprime DEPLOY_PROVADO mesmo assim.
- O revisor de código pegou isso: lei escrita no cabeçalho (`MERGED != DEPLOYED`) implementada de forma impossível no corpo.
- **LEI_ESCRITA_NO_CABECALHO != LEI_IMPLEMENTADA_NO_CORPO** — sempre verificar se a implementação real pode satisfazer a promessa.
- Outros defeitos de script de deploy capturados na mesma revisão:
  - `JA_SINCRONIZADO` nunca disparava → todo run reiniciava PM2 à toa
  - Árvore ficava com diff de 199 commits permanentemente staged
  - Regex de sujos ignorava `M staged` — justo o estado de hotfix manual
  - `AFRENTE>0` só avisava e sobrescrevia, contra `NO_BLIND_OVERWRITE`
  - Guarda de chattr varria untracked: um `chattr +i .env` bloquearia todo deploy pra sempre
  - Sem flock — podia colidir com script irmão na mesma árvore
  - `origin` nunca verificado
  - `awk` truncava caminho com espaço → comando de remédio apontava arquivo inexistente
  - `--apply` só valia como `$1`; typo virava dry-run silencioso com exit 0
  - Arquivo 100644 → `./script` dava exit 126

## Regra 48d — ARQUIVO CONGELADO NA VPS != ESTADO CANÔNICO (correção 28/08)
- `chattr +i` protege arquivos de corromperem — e no mesmo gesto os impede de evoluir.
- Colher "VPS dirty" de volta pra main traz o passado disfarçado de presente.
- Exemplo real: PR #1316 colheu VPS e tentou trazer Critic 287→77 linhas (−73%), GraphRAG 199 linhas (linhagem anterior, sem classificarCicloMestre/selfTest).
- **Maior não é mais novo** — 199 linhas eram de linhagem anterior à versão da main com 158.
- Sempre rodar `node --check` + teste funcional antes de aceitar PR que mexe em HERMES-CORE.

## Regra 48e — SINTOMA SUMIU != CAUSA RESOLVIDA (correção 28/08)
- Dependabot: `groups` sem `applies-to` cobre só `version-updates`. Os 201 alertos eram `security-updates` → passavam por fora do grupo e voltavam a abrir PRs.
- Sintoma sumiu (13→0 conflitos) mas a causa não foi resolvida → voltou com 15 conflitos.
- **Contraprova obrigatória:** medir o efeito real depois de cada "fix". Não parar no primeiro verde.

## Regra 48h — REBASE-MERGE ÓRFÃO E CHATTR SÃO INDEPENDENTES (correção 28/08)
- `.git/rebase-merge/` de processo anterior (data antiga) é resíduo, não operação viva.
- `chattr +i` em arquivos é proteção deliberada de rebase.
- **Um NÃO causa o outro:** o rebase-merge não bloqueia o deploy (git opera normalmente), o chattr sim.
- Diagnóstico: `git status` não mostra rebase em andamento, mas `ls -la .git/rebase-merge/` existe.
- Ação: `git rebase --abort` + `rm -rf .git/rebase-merge` (limpar resíduo) — mas o deploy só roda após `chattr -i`.
- **Ordem correta:** abortar rebase → limpar resíduo → remover chattr → deployar.

## Regra 48g — CRLF DO WINDOWS QUEBRA BASH REMOTO (correção 28/08)
- Script editado no Windows com CRLF (`\r\n`) falha na VPS com `set: pipefail\r: invalid option`.
- Sempre rodar `sed -i 's/\r$//'` no script antes de enviar pra VPS.
- Ou criar scripts direto no remoto (heredoc no SSH) pra evitar o problema.

## Regra 48b — "PERMITO" PRECISA DE ESCOPO PRECISO (correção 28/08)
- "permito segredo" autoriza AÇÃO pontual, mas NÃO é cheque em branco pra mutação em massa.
- Quando a ação é `chattr -i` em 30+ arquivos, "permito" precisa vir acompanhado do escopo exato:
  * (A) Tudo — arriscado sem causa conhecida, não sugerir.
  * (B) Só paths específicos que o CHEFE sabe que é seguro.
  * (C) Só num grupo diagnosticado como seguro.
- Na ausência de escopo explícito, diagnosticar e apresentar a alternativa mais cirúrgica.
- NUNCA rodar `git ls-files | xargs chattr -i` sem saber o que colocou o `+i`.

## Regra 49 — FLUXO DETERMINÍSTICO DE CONFLITO (correção 28/08)
- Padrão único Casa: `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` (no repo CentralDark).
- Motor: `dependabot-auto-merge.yml` + `scripts/dependabot/resolve-conflicts.sh` (aceita bump do PR pros lockfiles, mantém main pro core).
- "rebase não é merge squash" — CHEFE mandou explicitamente. Use `gh pr merge <n> --squash`, não rebase manual.
- "não espera workflow" — se CHEFE mandou mergear, faz squash mesmo com checks amarelos/verdes pendentes.
- BUG do resolver: `resolve-conflicts.sh` diz `NO_CONFLICT` mas NÃO empurra o branch atualizado. Se o GitHub ainda marca CONFLICTING após o script: `git merge --no-ff origin/main` no branch do PR + `git push --force-with-lease origin <branch>`.
- Comando manual se runner offline: `ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR>"`.
- Provar que o motor funciona: abrir PR de teste (bump fake) → rodar resolver → mergear → deletar PR. Feito em #1341/#1345 nesta sessão. NÃO deixar PR de teste sujando a Casa.

## Regra 48l — NUNCA SUGERIR DESTRUIÇÃO PARA PROBLEMA TRIVIAL (correção 28/08)

Se o problema é N commits de spam, a solução é `git reset --hard origin/main`, NUNCA "apaga tudo". Medir custo ANTES de sugerir. Ver `references/never-suggest-destruction-for-trivial-problem.md`.

## Regra 48n — "APAGA TUDO" NUNCA É A PRIMEIRA OPÇÃO (correção 28/08)

Quando o problema é N commits de spam na VPS, a solução é `git reset --hard origin/main`, NUNCA "apaga tudo e refaz". Medir o custo ANTES de sugerir destruição.

**Custo real de "apagar tudo" nesta sessão:**
- 132 arquivos .env (secrets que não existem no GitHub)
- 21 processos PM2 (parar tudo = derrubar a Casa)
- 15GB de disco (reclonar = reconfigurar do zero)
- O que foi construído ao longo de meses

**Solução proporcional:**
```bash
ssh Segredo-VPS "cd /root/CentralDark && git reset --hard origin/main && rm -rf .git/rebase-merge"
```

Intocados: `.env`, logs, 21 serviços PM2. Reversível pela âncora de rollback.

## Regra 60 — PROSSEGA PADRÃO — LOOP ATÉ 100% (correção 28/08)

Quando o CHEFE diz "prosiga padroes" ou "prossig em loop até ter 100%":

1. **Não pare** em gates artificiais (PR criado, commit feito, merge feito).
2. **Execute continuamente** até fixed point: PR → merge → deploy → health check → próximo PR.
3. **Reancorar** quando o estado mudar (main avançou, PR mergeou) e continuar.
4. **Squash merge imediato** quando `mergeable=true` + CHEFE autorizou ("prosiga"):
   ```bash
   gh pr ready <num>  # se draft
   gh pr merge <num> --squash --delete-branch
   ```
5. **Não esperar CI** se o CHEFE já mandou prosseguir. Checks pendentes não bloqueiam squash.
6. **Deploy após merge**: alinhar VPS com main + restart PM2 + health check.
7. **Loop**: enquanto houver PRs abertos ou trabalho pendente, continue.

Exemplo real (2026-08-28):
- PR #1335 (AIOS GOLD ASSAY) → ready → squash merge → b15ffe980
- PR #1336 (fix hermes-core) → já mergeado → c2e07f6ea
- VPS main alinhada → pm2 restart all → 19 online → MCP health ok
- Loop continua enquanto houver trabalho.

## Regra 61 — RECONHECER NARRATIVA COLADA vs INSTRUÇÃO ATIVA (correção 28/08)

Quando o usuário cola uma narrativa longa (ex: log de conversa de outro agente como Charizard), reconheça como contexto HISTÓRICO, não como instrução ativa.

**Sinais de que é uma narrativa colada:**
- Terceira pessoa ou pretérito do que aconteceu
- Contém timestamps, PIDs, receipts de sessões anteriores
- Citações do "Charizard" ou outros agentes
- O usuário não adicionou nenhuma instrução "faça X" — só dropou o log

**Ação correta:**
1. Reconhecer que leu ("Lido.")
2. Extrair qualquer delta útil (aprendizados, mudanças de estado, receipts)
3. NÃO tratar como uma missão ativa para executar
4. NÃO perguntar "o que você quer que eu faça com isso?" — só anotar a informação útil e esperar

**Exemplo:** Usuário colou uma conversa de 200 linhas do Charizard sobre deploy, chattr e Caddy. Em vez de lançar um novo ciclo de deploy, o agente disse "Lido" e extraiu os aprendizados úteis (porta elite 8080→8082, bug de filtro chattr, etc.).

## Regra 62 — CADDY CLEANUP FOI REVERTIDO — CASO DE ESTUDO (correção 28/08)

Ver `references/caddy-cleanup-reverted-for-zero-functional-benefit.md`. Resumo:

- **O que foi feito:** 7 declarações mortas removidas do Caddy (bridge, builder:5174, status:4189+8790+9400, gateway:3100, bot import)
- **Validação passou:** `caddy validate` → Valid configuration
- **Reload funcionou:** Caddy recarregado sem erro
- **CHEFE reverteu:** "apagar declaração é remoção, o oposto do que o fio exige. Benefício funcional zero. Reprovado."
- **Lição:** Sob o filtro "extensão segura, nunca substituição", remoção pura com ganho cosmético é reprovada. Rota morta não consome recurso, não degrada nada, não causa incidente.

## Regra 64 — 22K = FALSO POSITIVO DE FILTRO (correção 28/08)

Contar linhas com a letra "i" no `lsattr` não é medir atributo `+i`. O número real era 9 (trava cirúrgica de rebase antigo), não 22 mil. Filtro correto: `$1 ~ /^.*i-/`. Ver `references/chattr-false-positive-filter-bug.md`.

## Regra 65 — ELITE 8080 → 8082 (correção de número, não substituição) (correção 28/08)

O elite-anthropic-proxy (uvicorn) escuta :8082. O Caddy apontava pra :8080 (morto). Correção cirúrgica: `sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g'` no arquivo de config do elite. Validação: `caddy validate` → Valid configuration. Prova: `curl -H 'Host: elite.centralldark.com' http://localhost:80/` → 308 (backend vivo).

## Regra 66 — BUILDER É SITE ESTÁTICO (correção 28/08)

`builder.centralldark.com` é um site estático (`apps/web/dist/` com HTML/assets, sem package.json, sem vite.config). Não tem backend de produção. :5174 é porta de Vite dev-server (só existe com `npm run dev`). **NÃO inventar backend pro builder.** Se não tem processo, não aponta Caddy pra porta fantasma. Se o site é estático, usa `file_server` no Caddy.

## Regra 67 — DOMÍNIOS MORTOS POR NATUREZA (correção 28/08)

Alguns serviços são bots/bridges, NÃO servidores HTTP. Eles NUNCA vão abrir porta:
- `bot.centralldark.com` → GuardiaoBot (bot Telegram, sem porta HTTP)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, sem porta HTTP)

Essas NÃO são "rotas pra consertar" — são domínios configurados errado que deveriam ser removidos do Caddy (mas só com ordem explícita do CHEFE — filtro de infra).

## Regra 48p — LSATTR PERSPECTIVE DIFFERENCE (correção 28/08)

O `lsattr` rodado localmente (Windows/git-bash) sobre um path de rede/SSH mount pode mostrar atributos diferentes do `lsattr` rodado diretamente na VPS. Sintoma: o usuário mostra `----i---------e-------` (com i) mas o `lsattr` na VPS mostra `--------------e-------` (sem i).

**NÃO é contradição — é ponto de vista.** O filesystem local lê o atributo cru via mount/SSHFS; o remoto lê o ext4 diretamente.

Ação correta: SEMPRE rodar `lsattr` na VPS via SSH pra medir o estado real do filesystem remoto. O `lsattr` local é referência secundária, não prova. Se houver divergência entre as duas visões, a VPS vence.

## Regra 48q — RECONHECER ERRO E CORRIGIR SEM VERGONHA (correção 28/08)

Quando o agente percebe que sugeriu algo desproporcional, dizer "eu tava errado" e seguir. Não há penalidade por corrigir. O que não existe é insistir no erro.

Exemplo real: agente sugeriu "apagar tudo" pra resolver 2 commits de spam. Ao medir o custo (132 .env + 21 PM2 + 15GB), reconheceu que era desproporcional e seguiu com `git reset --hard origin/main`.

## Regra 48m — CADDY ROUTE TESTING (correção 28/08)

Quando testando rotas Caddy, `curl -H 'Host: ...' http://localhost:80/` retorna 308 (redirect pra HTTPS) — isso só prova que Caddy conhece o domínio, NÃO que o backend está vivo.

Padrão correto:
```bash
# 1. Testar backend direto na porta
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# 2. Testar se Caddy conhece o domínio (retorna 308 se configurado)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/

# 3. Testar cadeia completa via HTTPS (se Cloudflare proxy desligado)
curl -sk -o /dev/null -w '%{http_code}' https://<domain>/health
```

6 domínios sem backend vivo (2026-08-28): builder, ui, deploy, gateway, install, status, telepainel.

## Regra 48j — ZERAR SÓ O ESTADO GIT É SEGUO (correção 28/08)

Quando o problema é "VPS com commits fora da main", a solução segura é:
1. `git reset --hard origin/main` — descarta commits de bot, alinha com main
2. `rm -rf .git/rebase-merge` — limpa resíduo órfão

**Intocados:** `.env`, logs, 21 serviços PM2. Reversível pela âncora de rollback.

## Regra 48k — RECONHECER ERRO E CORRIGIR SEM VERGONHA (correção 28/08)

Quando o agente percebe que sugeriu algo desproporcional, dizer "eu tava errado" e seguir. Não há penalidade por corrigir. O que não existe é insistir no erro.

## Rule 6 — PARALLEL WINDOW PATTERN
CHEFE runs multiple CLI/panes in parallel generating mutation + fixes. To
replicate a window: load Hermes-Casa SOUL (profile pivete) + Kimetsu 17-breath
active + `#ACORDAR→!RECONCILIAR` as the continue-trigger. Same body, not a
second brain. No need to re-explain the pattern each spawn.

## Standard reconciliation sequence (external → Casa)
1. `#ACORDAR` → measure live state (runner, PRs, remote HEAD).
2. Inventory external source (Section 2 steps).
3. Diff against Casa original (Rule 2).
4. Copy only useful delta to `NUCLEO/docs/reference/_ouro-externo/` or
   canonical path.
5. Open PR if it changes the repo (contract diff, new law, skill expansion).
6. Remove the external source folder.
7. Report: what moved, what was discarded, what awaits human frontier.

## Regra 50 — RECONHECER NARRATIVA COLADA vs INSTRUÇÃO ATIVA (correção 28/08)

Quando o usuário cola uma narrativa longa (ex: log de conversa de outro agente como Charizard), reconheça como contexto HISTÓRICO, não como instrução ativa.

**Sinais de que é uma narrativa colada:**
- Terceira pessoa ou pretérito do que aconteceu
- Contém timestamps, PIDs, receipts de sessões anteriores
- Citações do "Charizard" ou outros agentes
- O usuário não adicionou nenhuma instrução "faça X" — só dropou o log

**Ação correta:**
1. Reconhecer que leu ("Lido.")
2. Extrair qualquer delta útil (aprendizados, mudanças de estado, receipts)
3. NÃO tratar como uma missão ativa para executar
4. NÃO perguntar "o que você quer que eu faça com isso?" — só anotar a informação útil e esperar

**Exemplo:** Usuário colou uma conversa de 200 linhas do Charizard sobre deploy, chattr e Caddy. Em vez de lançar um novo ciclo de deploy, o agente disse "Lido" e extraiu os aprendizados úteis (porta elite 8080→8082, bug de filtro chattr, etc.).

## Regra 57 — CADDY ROUTE TESTING: 308 ≠ BACKEND VIVO (2026-08-28)

Quando testando rotas Caddy, `curl -H 'Host: ...' http://localhost:80/` retorna 308 (redirect pra HTTPS) — isso só prova que Caddy conhece o domínio, NÃO que o backend está vivo.

Padrão correto:
```bash
# 1. Testar backend direto na porta
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# 2. Testar se Caddy conhece o domínio (retorna 308 se configurado)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/

# 3. Testar cadeia completa via HTTPS
curl -sk -o /dev/null -w '%{http_code}' https://<domain>/health
```

**Domínios mortos por natureza** (nunca vão funcionar, não adianta "ligar"):
- `bot.centralldark.com` → GuardiaoBot (bot Telegram, sem porta HTTP)
- `bridge.centralldark.com` → GuardiaoBridge (bridge, sem porta HTTP)

**Builder é site estático** (`apps/web/dist/` com HTML/assets, sem package.json, sem vite.config). Não tem backend de produção. :5174 é porta de Vite dev-server (só existe com `npm run dev`). **NÃO inventar backend pro builder.**

Ver `references/caddy-route-testing-pattern.md` em `centraldark-vps-operations` para o mapa completo e padrão de correção de porta errada (ex: elite 8080→8082).

## Regra 54 — BUILDER É SITE ESTÁTICO (correção 28/08)

`builder.centralldark.com` é um site estático (`apps/web/dist/` com HTML/assets, sem package.json, sem vite.config). Não tem backend de produção. :5174 é porta de Vite dev-server (só existe com `npm run dev`).

**NÃO inventar backend pro builder.** Se não tem processo, não aponta Caddy pra porta fantasma. Se o site é estático, usa `file_server` no Caddy.

## Regra 55 — DOMÍNIOS MORTOS POR NATUREZA (correção 28/08)

Alguns serviços são bots/bridges, NÃO servidores HTTP. Eles NUNCA vão abrir porta:

- `bot.centralldark.com` → GuardiaoBot (bot Telegram, sem porta HTTP)
- `bridge.centralldark.com` → GuardiaoBridge/LovableBridge (bridge, sem porta HTTP)

Essas NÃO são "rotas pra consertar" — são domínios configurados errado que deveriam ser removidos do Caddy (mas só com ordem explícita do CHEFE — Regra 51).

## Regra 56 — ELITE 8080 → 8082 (correção 28/08)

`elite.centralldark.com` apontava pra :8080 (morto). O proxy real (EliteHTTP/uvicorn) escuta :8082. Correção: `8080 → 8082`. Essa é a porta do `elite-anthropic-proxy` (uvicorn, PID variável).

Ver `references/vps-route-backend-map.md` em `centraldark-vps-operations` para o mapa completo.

## Regra 73 — CRON JOBS DE MONITORAMENTO LEVE (correção 28/08)

- Para tarefas de monitoramento leve que precisam rodar em intervalos curtos (ex: verificar PRs, checar logs, observar estado de processos), crie um cron job com schedule `* * * * *` (a cada minuto) que:
  - Rode um script simples que faz a verificação e grava o resultado em um log local.
  - Se autoregule por horário: pare automaticamente após 18:00 horário de Brasília (UTC-3) para não consumir recursos desnecessariamente após o expediente.
  - Entregue o resultado apenas localmente (`deliver=local`) — não notifique em can externos a menos que haja ordem explícita.
  - Seja idempotente e seguro para rodar a cada minuto (não crie processos em cascata, não deixe locks, não modifique estado permanente sem necessidade).
- Exemplo de implementação recente:
  - Script: `scripts/dependabot-monitor.sh` (verifica PRs Dependabot no remoto e loga)
  - Script: `scripts/screenpipe-monitor.sh` (verifica atividade do .screenpipe e loga)
  - Ambos criados com `cronjob(action='create', name='dependabot-monitor', schedule='* * * * *', script='scripts/dependabot-monitor.sh')` e equivalente para screenpipe.
  - Logs em: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/dependabot-monitor.log` e `.../screenpipe-monitor.log`
- Nunca deixar cron jobs de monitoramento rodando indefinidamente sem condição de parada — sempre inclua um horário de corte ou condição de saída baseada no estado real.
- Se o objetivo for apenas observar até um certo horário ou até um evento (ex: PR aberto), o cron job deve parar assim que a condição for atingida ou o horário passado.
- Após criar o cron job, verifique sua criação com `cronjob(action='list')` e confirme o próximo horário de execução.


## Hard gates (never cross without explicit CHEFE order)
- No force-push to main.
- No push of dirty main clone owned by another writer.
- No restart/destructive VPS action without order.
- No secret exposure.
- HUMAN_FRONTIER (chattr -i, rebase --abort VPS, remove immutable) = STOP + ASK.
- `permitio` = point authorization, does NOT rewrite standing law.

## Hard gates — PROHIBITED constructs (CHEFE accumulation, 01/09/2026)
As proibições abaixo são acumuladas pelo CHEFE durante sessão e não podem ser
relaxadas por inferência, contexto alternativo ou "talvez sirva":
- Criar API para ChatGPT ou consumidor externo qualquer.
- Criar API/VPS bridge nova.
- Criar daemon/somente para esta missão.
- Criar webhook.
- Criar bot/notificador.
- Criar IPNAMES-V2.
- Criar MEMORY-V2.
- Criar "segundo cérebro", V2/V3 de memória, roteador paralelo ou
  arquitetura concorrente sem ordem explícita.
- Inventar serviço residente, endpoint novo, sistema de notificação ou
  "notificador" que entregue a terceiro.
- Confundir skill com agente: um SKILL.md é roteiro/repertório; não é
  processo, bot, plugin ou executor próprio.
Quando o CHEFE listar proibições, registrá-las como LAW e não como
"preferência de estilo". Se uma ação futura entra em conflito com uma
destas, bloquear e reportar — não tentar justificar a contornar.

## Referências complementares (sessão 01/09/2026)

- `references/labels-provenance-vs-promotion.md` — separar labels de promoção, proveniência, comando e suporte; inclui contraprova e entrega visual verificada.

- `references/skill-write-timeout-workaround.md` — write_file pode timeout mas o
  arquivo pode ter sido escrito; verificar com cat + sha256sum antes de assumir
  falha; fallback via python ou writes menores.
- `references/git-worktree-sync-checklist.md` — checklist completo para sync de
  worktrees num clone multi-agente antes do git pull --rebase.
- `references/chattr-mass-diagnosis-protocol.md` — diagnóstico cirúrgico de
  chattr +i em massa.
- `references/proof-loop-prevention-user-called-out.md` — parar após 2 provas,
  não papagaiar.
- `references/never-suggest-destruction-for-trivial-problem.md` — nunca sugerir
  "apagar tudo" como primeira opção.
- `references/image-unavailable-pattern.md` — quando screenshot/imagem não está
  no disco, não fabricar prova.
- `references/measure-first-ask-once-then-execute.md` — padrão de descoberta
  própria sem ABC questions.
- `references/implicit-command-and-vps-remote-readonly.md` — leitura remota via
  SSH/rsync sem assumir estado local.
- `references/discover-alone-measure-dont-ask.md` — descobrir sozinho antes de
  perguntar.
- `references/evidencia-visual-reconciliao.md` — reconciliação de evidência
  visual.
- `references/casa-free-chain-watchdog-sync.md` — cadeia free tier viva.
- `references/caddy-cleanup-reverted-for-zero-functional-benefit.md` — remoção
  pura com ganho zero é reprovada.
- `references/vps-caddy-route-map-20260828.md` — mapa completo de domínios.
- `references/git-local-remote-workflow.md` — fluxo git local ↔ remoto.
- `references/caddy-route-testing-pattern.md` — teste de rotas Caddy.
- `references/vps-route-backend-map.md` — mapa de backends VPS.

## Session-authority self-conception (lição 01/09/2026)
A aparência de cargo/statuto no sistema não concede escrita nem identidade:
- Ser chamado/atado como SOL em uma sessão NÃO confere coordenação real.
- Estado de leitura/garimpo pode parecer "ativa autoridade" e ser apenas
  read-only sem writer.
- "Pensei que era refilado — era status do próprio sistema que via
  session-authority sem escrita."
Regra: nunca inferir poder, continuidade ou identidade a partir de um
rótulo, bot, painel, status ou referência textual. Sem writer + permissão
de host + escopo autorizado, o agente NÃO escreve e NÃO assume autoridade.
Read-first, role-check, writer-check — em maiúsculas cognitivas, não como
atalho.

## Vazio como sinal — não como conteúdo parseável (lição 01/09/2026)
Resposta vazia (model devolvendo output vazio ou sessão sem conteúdo):
- É SINAL de falha/corte, não conteúdo estruturado.
- NÃO tentar parsear `</role><role name="reasoning">` ou qualquer
  estrutura a partir de resposta vazia — isso gere loops de retry/parse.
- Conduta: tratar como "aguardando contexto/ajuste/ferramenta" e não
  como "conteúdo que faltou de ler".
- Se o vazio se repete em sequência, reportar e pedir direção antes de
  reaproveitar a mesma espera.

## Skill ≠ Agent (clarificação de termo, 01/09/2026)
- SKILL.md = roteiro, repertório, padrão de ação — não é agente, não é
  executor auto-ativável, não é serviço.
- Dizer "agente X" quando se refere a skill ou plug-in é erro de termo.
- "No wait staff table" ou arquivos de metadata sem dados reais:
  tratá-los como arquivo de dados é fabricar presença.
Regra: ao mencionar recurso, verificar se é skill/config/arquivo vazio
antes de atribuir comportamento ou "execução".

## Regra 51 — FILTRO DE INFRA: EXTENSÃO SEGURA, NUNCA SUBSTITUIÇÃO (correção 28/08)

Toda alteração de infraestrutura deve passar pelo filtro do CHEFE:

1. **Extensão segura** — atualiza e melhora o que já existe. Pode fazer.
2. **Substituição** — troca arquitetura, cria V2/V3/V4, reescreve do zero. NUNCA sem ordem explícita.
3. **Remoção pura** — apagar coisa que funciona (mesmo que "morto"). NÃO fazer sem ordem.

**Benefício funcional zero = reprovado.** Se a mudança é só cosmética (arrumar visual, remover declaração morta) e carrega risco não-zero, o ganho não justifica. Rota morta não consome recurso, não degrada nada, não causa incidente. Só incomoda a vista. **Não mexer.**

**Exemplo real (revertido):** Agente removeu 7 declarações mortas do Caddy (bridge, builder, status fantasmas, gateway). `caddy validate` passou, reload funcionou. CHEFE reverteu: "apagar declaração é remoção, o oposto do que o fio exige. Benefício funcional zero. Reprovado."

**Quando a remoção é justificada:**
- Serviço crashando sem conserto
- Segurança (vazamento, credencial exposta)
- Duplicação real causando comportamento errado
- Ordem explícita do CHEFE com escopo definido

## Regra 52 — DESCOBRIR SOZINHO — "VC TEM QUEM DESCUBRI SOZINHO" (correção 28/08)

CHEFE: "eu nao tenho rzao em nada vc tem quem descubri sozinho!" + "tu so sabe pergunta? n sabe fazer nada?"

Quando a direção é clara ou a lacuna é pesquisável:
- MEDIR em vez de perguntar
- ABRIR arquivos em vez de pedir confirmação
- EXECUTAR em vez de propor opções
- Só PARAR em fronteira humana real (HUMAN_FRONTIER)

Padrão: intenção dada → medir estado → executar menor delta → provar → continuar. Sem loop de confirmação.

## Regra FIXED-POINT-SHARED — FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE (cristalizada 2026-09-05) + GOAL-PAUSE RECOVERY
Ver `references/fixed-point-shared-pattern.md` (especificação completa: comando universal, roles, worktree cleanup, branch divergence recovery, CI base-red vs delta-red, receipt pattern, fixed point criteria, handoff protocol, goal-pause recovery, anti-patterns).
- Comando: `!CENTRALDARK SHARED` (alias `centraldark shared`).
- PRIMEIRA janela = WRITER_PRIMARY (única com commit/push/PR). OUTRAS = READER/SCOUT/REVIEWER. Mutação serializada (`SERIALIZE_MUTATION`); percepção paralela (`PARALLELIZE_PERCEPTION`).
- WORKTREES LOCKED: worktrees `locked initializing` residuais são órfãos se o diretório não existe mais. Remover com `rm -rf .git/worktrees/*` + `git worktree prune`.
- BRANCH DIVERGENCE: se branch divergiu muito do remoto, `git reset --hard origin/<branch>` reancora. Conflito com ambas versões idênticas → `git checkout --theirs`.
- CI BASE_RED: workflow falha na base main (não no delta do PR) = BASE_RED → NÃO BLOQUEIA. Classificar com `gh run view <ID> --log-failed` para provar se é base ou delta.
- HANDOFF só com RECEIPT + OLD_WRITER_RELEASE + NEW_WRITER_ACQUIRE. Sem RECEIPT + RELEASE: HANDOFF é INVÁLIDO — não inventar.
- Quando meta `COMPLETA` mas `HANDOFF` não feito: PARAR e declarar bloqueio real (não inventar HANDOFF, não inventar COMMIT sem repo, não inventar browser/login sem elevação, não inventar conteúdo de link sem web tool).
- Quando `goal` pausa (judge error, `goal_judge` ausente): corrigir `config.yaml` (`auxiliary.goal_judge: provider: deepseek, model: deepseek-v4-flash`); NÃO inventar V2/V3; NÃO declarar modelo quebrado — é setup state, não falha de capacidade.
- Prova: arquivos salvos em sessão (DELTA-CONTINUO.md, FIXED-POINT-RECEIPT.md, FIXED-POINT-FINAL.md, RECEIPT-CONTINUACAO.md, centraldark.sh); `REUSE_BEFORE_CREATE` respeitado; `NO_V2_V3_V4` respeitado; `ONE_SYSTEM_ONLY` respeitado; `SAME_HEAD_PROOF` respeitado.

## Regra 68 — MAPA DE ROTAS CADDY (correção 28/08)
- Quando `goal` pausa (judge error, setup state, missing `auxiliary.goal_judge`), adicionar `provider` + `model` sob `auxiliary` no `config.yaml`; NÃO criar segundo sistema; NÃO inventar V2/V3; NÃO declarar modelo quebrado quando o problema é setup do juiz (`deepseek-v4-flash` no caso 01/09/2026). Ver `references/goal-pause-resume-pattern.md`.

## Regra FIXED-POINT-SHARED (cristalizada 2026-09-05) — FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE
- Comando: `!CENTRALDARK SHARED` (alias `centraldark shared`).
- PRIMEIRA janela = WRITER_PRIMARY (única com commit/push/PR). OUTRAS = READER/SCOUT/REVIEWER.
- HANDOFF só com RECEIPT + OLD_WRITER_RELEASE + NEW_WRITER_ACQUIRE.
- Nenhum arquivo paralelo (ex: `DELTAUNIFICADOCENTRALDARK.md` = proibido, inexistente).
Ver `references/fixed-point-shared-pattern.md`.

## GOAL-PAUSE RECOVERY — Correção de Setup State

Quando `goal` pausa por causa de `goal_judge` ausente ou inválido em `config.yaml`:

1. **Identificar**: `auxiliary.goal_judge` não aponta para provider válido
2. **Corrigir**: adicionar `provider` + `model` sob `auxiliary.goal_judge` (ex: `deepseek`, `deepseek-v4-flash`)
3. **NÃO** declarar "modelo quebrado" — é setup state, não falha de capacidade
4. **NÃO** criar V2/V3/segundo sistema — é corrigir config, não reinventar
5. **NÃO** parar a missão — corrigir e continuar

### Padrão de Correção

```yaml
# antes (goal pausa)
auxiliary:
  goal_judge: {}

# depois (goal funciona)
auxiliary:
  goal_judge:
    provider: deepseek
    model: deepseek-v4-flash
```

### Verificação Rápida

```bash
cat config.yaml | grep -A5 "goal_judge"
```

## Regra 69 — GOAL-PAUSE RECOVERY

## Regra 70 — ORDEM DIRETA QUANDO INTENÇÃO É CLARA (BOTA PRA FUNCIONA)
- Quando o CHEFE emitir uma ordem direta e explícita (ex: "BOTA PRA FUNCIONA", "FAZ ISSO", "POE A CAS EM ORDEM"), execute a ação solicitada imediatamente, sem pedir confirmação ou apresentar opções, desde que a ação esteja dentro do escopo autorizado e não viole as portas duras (hard gates).
- Se a ordem incluir restrições específicas (ex: "não ligar o minerador"), respeite-as à risca.
- Após a execução, meça o resultado e provar que a ação foi concluída antes de continuar.

## Regra 71 — PROIBIÇÃO DE ATIVAÇÃO DE MINERADORES SEM ORDEM EXPLÍCITA
- Nunca inicie, execute ou ative processos de mineração (xmrig, garimpo, miner, etc.) sem ordem explícita e detalhada do CHEFE.
- Se o CHEFE mencionar uma pasta relacionada a garimpo ou minerador, verifique se há algum processo ativo usando `tasklist` e relate o estado real; não assuma que está ativo.
- Só proceed com ativação se receber ordem explícita com escopo definido (ex: "ligar o minerador na pasta X por 10 minutos").

## Regra 72 — ATENDER PEDIDOS DE LISTA DE JOBS EXISTENTES
- Quando o CHEFE pedir para verificar ou listar jobs existentes (ex: "PROCURA PELO JOBS QUE JA EXISTIA"), use `cronjob(action='list')` e apresente a lista resumida, sem pedir mais detalhes a menos que o CHEFE solicite.
- Não crie novos jobs a menos que seja solicitado explicitamente.

Ver `references/vps-caddy-route-map-20260828.md` para o mapa completo de domínios → backends. Resumo:

## Casa Free Chain (watchdog + multi-writer)

Para manter a cadeia free tier viva e reconciliar em clone compartilhado por N agentes,
ver `references/casa-free-chain-watchdog-sync.md` (portas, launcher, cron 10min, screenpipe-mcp workaround, padrão de resposta ao CHEFE).

**Vivos (6):** api→:8090, grafo→:3030, hub→:8098, centralldark→:3000, mcp→:9100, elite→:8082
**Mortos (4):** deploy, bot, bridge, gateway
**Sem backend (1):** builder (site estático)

**Elite 8080→8082:** proxy real escuta :8082, Caddy apontava pra :8080 (morto). Correção cirúrgica.

## Imagem não disponível no disco

Quando o CHEFE refere uma imagem (`image_N.jpg`, screenshot, etc.) que fundamenta um diagnóstico mas o arquivo não está no disco, não fabricar a prova a partir do relato. Medir o que há de independente no chão; cruzar com o relato; prosseguir se possível; se a imagem for essencial, pedir o path/entrega uma vez. Ver `references/image-unavailable-pattern.md` para o padrão completo.

## Loop de Prova — Parar Após 2 Provas

Quando o CHEFE pede prova de algo, prove com real tool output. Se já provou **duas vezes**, pare. Não ofereça provar novamente. Loop de "prova" é papagaio. Ver `references/proof-loop-prevention-user-called-out.md`.

## Chattr +i em massa — referência completa

Para diagnóstico de `chattr +i` em massa (distribuição, origem, protocolo de remoção), ver `references/chattr-mass-diagnosis-protocol.md` em `centraldark-vps-operations`. Regra resumida: nunca rodar `chattr -i` em massa sem diagnosticar a origem — "permito" genérico não cobre remoção de proteção deliberada sem diagnóstico.

## FOCO NO COMANDO — não desviar para kanban/integração quando a missão é clara

Quando o CHEFE emite um comando direto e específico (ex: "cria o job de respiração", "melhora a memória com X técnica"), executar NO ALVO DESIGNADO, sem desviar para:
- registrar no kanban quando o comando não pede;
- abrir PRs não solicitados;
- examinar "o que mais poderia ser feito" além do que foi pedido.

Se o site/endpoint mencionado (`http://127.0.0.1:8787/config`, `/chat`, `/kanban`, etc.) não estiver acessível, avisar conciso e perguntar a rota/caminho exato — mas NÃO transformar "não consigo acessar o site" em "vou procurar registros no kanban.db".

O comando do CHEFE é o norte. Não montar plano paralelo não solicitado.

## FOCO NO COMANDO — não desviar para kanban/integração quando a missão é clara

Quando o CHEFE emite um comando direto e específico (ex: "cria o job de respiração", "melhora a memória com X técnica"), executar NO ALVO DESIGNADO, sem desviar para:
- registrar no kanban quando o comando não pede;
- abrir PRs não solicitados;
- examinar "o que mais poderia ser feito" além do que foi pedido.

Se o site/endpoint mencionado (`http://127.0.0.1:8787/config`, `/chat`, `/kanban`, etc.) não estiver acessível, avisar conciso e perguntar a rota/caminho exato — mas NÃO transformar "não consigo acessar o site" em "vou procurar registros no kanban.db".

O comando do CHEFE é o norte. Não montar plano paralelo não solicitado.
