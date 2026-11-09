# DELTA-CONTINUO — CentralDark

<!-- CENTRALDARK_SECRET_MVP_POLICY_V1 -->
## 🔐 Secrets — regra global
Owner: `docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md`

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE=true
DO_NOT_COMMIT_SECRET_VALUE=true
AUTHORIZED_RUNTIME_MAY_USE_SECRET=true
AUTHORIZED_VAULT_MAY_PRESERVE_SECRET=true
ACCIDENTAL_EXPOSURE_ACTION=ROTATE_POST_ONLINE
LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER
BLOCKER_MUST_NAME_EXACT_TOOL_OR_LAYER=true
AUTHORIZED_ALTERNATE_ROUTE_BEFORE_HUMAN_BLOCKER=true
```
<!-- /CENTRALDARK_SECRET_MVP_POLICY_V1 -->

<!-- CENTRALDARK_SYNC_RECONCILIATION_CURRENT_20261109 -->
## 🧭 DELTA CONTÍNUO — preservação e reconciliação Casa ↔ main (2026-11-09)

**Status:** `ACTIVE_DELTA / CHECKOUT_UNSYNCED / PRESERVATION_REQUIRED`.
**FIO DA MISSÃO:** preservar a Casa, inventariar os 17.721 arquivos não rastreados e os 116 caminhos rastreados alterados, identificar a origem da divergência e preparar reconciliação sem perda.

**PRÓXIMO PASSO:** gerar inventário NUL-safe com caminhos e SHA-256; classificar sobreposições; reconciliar cada escopo com seu owner, sem alterar o checkout até haver plano e prova de preservação.

**PONTO DE CONTINUIDADE:**
`NEXT_CURSOR=preservar e inventariar os 17.721 arquivos, identificar a origem da divergência e preparar uma reconciliação sem perda.`

### CURRENT medido — Casa Windows `F:\CentralDark`

`MEASURED_AT=2026-11-09T01:59:37-03:00`
`LOCAL_BRANCH=main`
`LOCAL_HEAD=b71963ffaacbca2847364517487bb232f611acdb`
`REMOTE_MAIN=4d97ddadda74aaed3ebd17056170718a86a5ec7e`
`MERGE_BASE=4d2af54c746c827e01c47778a4ce9f4165c39eee`
`LOCAL_ONLY_COMMITS=1`
`REMOTE_ONLY_COMMITS=67`
`PORCELAIN_TOTAL=17837`
`UNTRACKED=17721`
`TRACKED_DIRTY=116`
`TRACKED_DIRTY_REMOTE_OVERLAP=35`
`UNTRACKED_MAIN_TREE_COLLISIONS=16`
`CHECKOUT_SYNCED=false`

**Readback remoto:** a leitura atual de `git ls-remote origin refs/heads/main` coincide com `origin/main`. O `fetch origin main` havia concluído no passo anterior. Isso atualizou referências Git, não o conteúdo do checkout.

### Origem comprovada da divergência

O único commit exclusivo local é:

`b71963ffaacbca2847364517487bb232f611acdb` — `fix(remote-bridge): restore canonical Windows build`.

Arquivos do commit:
1. `scripts/remote-bridge/Build-Remote-Bridge.ps1`
2. `scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md`
3. `scripts/remote-bridge/canonical/Build-Remote-Bridge.ps1`

Os três caminhos também foram modificados no remoto depois da base comum. A simulação de três vias marcou `scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md` como `changed in both`. Portanto, o commit local não deve ser reaplicado automaticamente.

### Colisões de arquivos não rastreados com o tree remoto

Os 16 caminhos abaixo estão não rastreados no checkout local e já existem como caminhos rastreados em `origin/main`:

- `.agents/skills/centraldark-operational-method/Skills/centraldark-builder-destop/SKILL.md`
- `docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/Boas-praticas-para-pastas-e-arquivos-digitais.md`
- `scripts/remote-bridge/ui/.gitignore`
- `scripts/remote-bridge/ui/assets/client-config.json`
- `scripts/remote-bridge/ui/assets/tray.ico`
- `scripts/remote-bridge/ui/assets/tray.png`
- `scripts/remote-bridge/ui/electron/main.cjs`
- `scripts/remote-bridge/ui/electron/preload.cjs`
- `scripts/remote-bridge/ui/index.html`
- `scripts/remote-bridge/ui/package-lock.json`
- `scripts/remote-bridge/ui/package.json`
- `scripts/remote-bridge/ui/src/App.jsx`
- `scripts/remote-bridge/ui/src/main.jsx`
- `scripts/remote-bridge/ui/src/styles.css`
- `scripts/remote-bridge/ui/vite.config.mjs`
- `skills/vs-code-restore/media/centraldark-activity.svg`

**Observação de inventário:** a distribuição por pasta ainda não é declarada; a leitura PowerShell com caminhos escapados não é suficiente para essa classificação. Usar saída NUL-safe (`git status --porcelain -z`) antes de produzir contagens por raiz. O manifesto completo de caminhos e hashes permanece pendente.

### Padrão oficial SOL aplicado ao mesmo fio

- Resultado primeiro, PT-BR direto, sem repetição desnecessária; até quatro linhas por padrão.
- Diferenciar conversa, pergunta, correção, ensino e ordem.
- Em gatilhos explícitos, recuperar protocolo, intenção vigente, CURRENT, owner, checkpoint, receipt e `NEXT_CURSOR`; reconhecer o gatilho não prova que o executor esteja disponível.
- Ciclo: intenção → contexto → CURRENT → owner/writer/escopo → reutilizar → menor delta → executar → observar/testar → contraprova → readback → receipt → `FIXED_POINT` ou continuidade.
- Manter separados **FIO DA MISSÃO**, **PRÓXIMO PASSO** e **PONTO DE CONTINUIDADE**. A nova mensagem é delta da mesma missão, não reinício.
- `ONE_SYSTEM_ONLY=true`, `ONE_WRITER_PER_SCOPE=true`, `REUSE_BEFORE_CREATE=true`, `CURRENT_OVER_HISTORY=true`, `UNKNOWN != PASS`, `ACTION != PROOF`, `DOCUMENTED != EXECUTED`, `MERGED != DEPLOYED`, `REALITY = JUDGE`.
- Fechamento documental usa: Feito, Evidência, Pendência, Próximo passo, Qual BOOT usar, Fio da missão e Ponto de continuidade.

### Preservação e gates

`NO_MERGE=true`
`NO_REBASE=true`
`NO_RESET=true`
`NO_STASH=true`
`NO_CLEAN=true`
`NO_FORCE_PUSH=true`
`LOCAL_CHECKOUT_MUTATED_BY_THIS_DELTA=false`
`INVENTORY_MANIFEST=NOT_CREATED`
`FIXED_POINT=false`

Não concluir sync por fetch, merge ou atualização de handoff. A reconciliação exige inventário completo, owner por escopo, resolução explícita das colisões, preservação dos dados e readback no mesmo SHA.

<!-- /CENTRALDARK_SYNC_RECONCILIATION_CURRENT_20261109 -->



> **Owner canônico:** SEGREDO/CHEFE
> **Status:** ATIVO
> **MISSÃO:** Shared Reconciliation — `!CENTRALDARK SHARED`
> **Regra FIXED-POINT-SHARED:** FIRST_WRITER_WINS, ONE_WRITER_PER_SCOPE

---

## 🧭 COMMIT_COMPASS — coordenação multi-writer pelo próprio Git

```text
COMMIT_IS_COORDINATION_PRIMITIVE=true
COMMENTS_ARE_RECEIPTS_NOT_COORDINATION_AUTHORITY=true
MULTI_WRITER_REQUIRES_COMMIT_TRAILERS=true
TWO_WRITERS_SAME_PATH=false
FINALIZER_ONE=true
PR_MOTHER_IS_RENDEZVOUS_NOT_WRITER=true
PDF_GATE_TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

Quando a sessão multi-writer é aberta por `CentralDark-Compass-Start: true`, cada commit seguinte até o finalizer fechar o compasso deve carregar:

```text
CentralDark-Compass: v1
CentralDark-Writer: <writer-id>
CentralDark-Scope: <path-exato-ou-prefix/**>;<outro-path>
CentralDark-Parent: <primeiro-pai-real-do-commit>
CentralDark-PR-Mother: <numero>
CentralDark-PR-Child: <numero>
CentralDark-Finalizer: ONE
CentralDark-PDF-Gate: PASS:<sha256-do-TLC23>
CentralDark-Next: <gate-ou-next-cursor>
```

O Git é o bastão entre os writers:

1. o próximo writer lê HEAD + mensagem + paths do commit anterior;
2. confirma que seu setor não colide com o setor já declarado;
3. escreve somente no próprio setor;
4. publica novo commit com o HEAD anterior em `CentralDark-Parent`;
5. o gate confere mensagem, pai real e paths modificados;
6. somente um finalizer fecha o ciclo depois dos gates do mesmo HEAD.

`CentralDark-Scope` aceita caminho exato ou prefixo terminado em `/**`. Um path modificado fora do scope declarado bloqueia o compasso.


### Reconciliação de commit paralelo já em voo

Se um writer publicar um commit sem trailers imediatamente após o compasso ter sido aberto, o histórico não é reescrito e não há force-push. Um commit posterior compatível pode adotar aquele SHA:

```text
CentralDark-Adopt-Commit: <sha-exato>
CentralDark-Adopt-Writer: <writer-id>
CentralDark-Adopt-Scope: <path-exato-ou-prefix/**>
```

A adoção só passa se:

- o SHA adotado estiver dentro da sessão aberta pelo `CentralDark-Compass-Start`;
- o commit adotante vier depois do commit adotado;
- os paths reais do commit adotado couberem integralmente em `CentralDark-Adopt-Scope`;
- o setor adotado não colidir com path já escrito por outro writer;
- o commit adotante também obedecer aos trailers normais do compasso.

`ADOPTION != REWRITE` e `ADOPTION != PROOF_OF_CORRECTNESS`: adoção resolve coordenação/autoria de escopo; testes e Reality Judge continuam decidindo a qualidade.

Para encerrar a sessão, o finalizer usa `CentralDark-Compass-End: true` no commit final, mantendo os trailers de prova e o mesmo princípio: **commit é coordenação; comentário é receipt**.

---

## STATE VIVO (medido 2026-09-05)

| Campo | Valor |
|---|---|
| HEAD_LOCAL | `400afde4d` |
| REMOTO_MAIN | `4ee1c2d9b` |
| BEHIND/AHEAD | 100 behind / 6 ahead |
| BRANCH_ATUAL | `release/local-owner-test-20260905` |
| PR_1416 | OPEN (segredounlock) |
| PR_1414 | OPEN (segredounlock) |
| PR_1415 | OPEN (dependabot) |
| CI_MAIN | 🔴 Autonomia promoção segura + porta-de-entrada |

## RECONCILIAÇÃO REALIZADA

### PR #1416 — CANDIDATO ÚNICO PARA TESTE LOCAL DO DONO
- **Autor:** SEGREDO/CHEFE (segredounlock)
- **Branch:** `release/local-owner-test-20260905`
- **HEAD:** `400afde4d`
- **Merge-base com main:** `a9382b439`
- **Delta:** 5 files, 194 insertions, 130 deletions
- **Arquivos modificados:**
  - `.github/dependabot.yml`
  - `.github/workflows/dependabot-auto-merge.yml`
  - `.github/workflows/painel-auto-update.yml`
  - `docs/RELATORIOS/2026-09-05-OWNER-LOCAL-TEST-CANDIDATE.md`
  - `docs/RELATORIOS/2026-09-05-PROVA-FUNCIONAL-PR-1416.md`
- **Status:** ✅ PROVA FUNCIONAL REGISTRADA

### CI RED — DIAGNÓSTICO
- Workflow `Autonomia — promoção segura` falha em `main` HEAD
- Workflow `porta-de-entrada` falha em `main` HEAD
- **CLASSIFICAÇÃO:** BASE FAILURE — NÃO DELTA FAILURE
- Prova: PR #1382 (DELTA-CONTINUO) já foi mergeado via squash
- O vermelho é da base, não do delta do PR #1416
- **AÇÃO:** Não bloquear PR #1416 por CI vermelho de base

### WORKTREES
- 4 worktrees com `locked initializing` (resíduo)
- `worktrees/pr1393-porta-tokens` DELETADO (branch removida)
- Worktrees restantes necessários para outros agents

### LIXO LIMPO
- `apps/modulos/elite-gateway/test-local/logs/` removido
- `worktrees/pr1393-porta-tokens` removido

---

## NEXT_CURSOR

1. **FIXED POINT:** Aguardar merge do PR #1416 + CI green on main
2. **DELTA-CONTINUO.md:** Criado como owner canônico — `!CENTRALDARK SHARED`
3. **WORKTREES LOCKED:** Investigar remoção forçada dos 4 residual
4. **CI BASE:** Reportar ao CHEFE — 2 workflows falham na base main, não em delta

---

## RECEIPT

## HANDO OFF (Handoff Contínuo)
| Campo | Valor |
|---|---|
| Owner | SEGREDO/CHEFE |
| Type | Continual Delta |
| Status | ATIVO |
| Aplica | !CENTRALDARK SHARED |


```text
MISSION_ID=SHARED_RECONCILIAR_20260905
TIMESTAMP=2026-09-05T18:30:00Z
WRITER=PRIMARY_1416
HEAD=400afde4d
MAIN=4ee1c2d9b
DELTA=PR#1416 (5 files, 194+/-130)
CI_BASE_FAILURES=2 (Autonomia+painel)
CI_STATUS=BASE_RED_NOT_DELTA_RED
UNKNOWN_WORKTREES_LOCKED=4
RECEIPT_PERSISTED=true
NEXT_CURSOR=FIXED_POINT_PENDING_MERGE
```


## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
ACTIVE_PR_MOTHER_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.

---

<!-- #OBSERVACOES# @owner: DELTA-CONTINUO.md @doc_ref: ROOT-FILE-REGISTRY.md @last_updated: 2026-10-19T16:55:10.000Z @escopo: Casa K:\\ ↔ VPS /root @estado: TRANSICAO_CONTROLADA @next_cursor: validar aliases, dependencias, SHA e consumer antes de mover origem -->
## 🪬 Lei transitória — migração Casa ↔ VPS por espelhos reversíveis (2026-10-19)

**Status: MIGRACAO_EM_ANDAMENTO, não concluída.** Esta seção **acrescenta** uma regra transitória ao owner de delta contínuo; não redefine a raiz Git nem revoga owners, regras, proteção de secrets ou publicação.

- **Forja da Casa:** checkout ativo na raiz `K:\\`; arquivos brutos e desenvolvimento ficam na Casa.
- **VPS:** checkout vivo e `.git` permanecem em `/root/CentralDark` até contraprova e autorização específica para qualquer relocação real. A raiz `/root` contém dados privados/sistema e não vira checkout Git.
- **Espelhos de compatibilidade:** links simbólicos exclusivamente para diretórios do projeto cujos nomes na raiz `/root` estejam desocupados, por exemplo `/root/scripts -> /root/CentralDark/scripts`. Links são *visões*, não cópias, sincronização, migração de dados ou segundo executor.
- **Nunca espelhar** `.git`, `secrets`, `.env`, `SEGURANCA`, arquivos de credenciais, backups, diretórios de usuário ou runtime privado. Não mover `/root/CentralDark`, não apagar originais.
- **A cada delta:** medir `K:\\`, `/root`, `/root/CentralDark` e consumidores → determinar owner e caminhos absolutos (systemd, cron, PM2, processos) → criar/verificar **um lote pequeno** de aliases se livre e seguro → executar contraprova de `readlink`/mesmo inode e leitura → registrar efeitos reais neste PR → só então migrar um consumidor identificado.
- **Consumidores existentes** continuam usando o caminho antigo até o delta específico ser validado, com backup e rollback. `MIGRATED` só depois de teste do mesmo SHA e readback do runtime afetado; `ALIAS_PRESENT != CONSUMER_MIGRATED`.
- **Rollback de alias:** remover apenas o link simbólico específico após conferir destino e uso; nunca apagar o diretório de destino. Reverter consumidor ao caminho antigo antes de remover alias necessário.
- **Fonte da verdade:** `ServerVpss/CentralDark@main` para código versionado; VPS é execução, Casa é forja. Sincronização usa fluxo Git/owners existente, não links entre máquinas.
- **Portões:** `ONE_WRITER_PER_SCOPE`, `CURRENT > HISTORY`, `UNKNOWN != PASS`, `REUSE_BEFORE_CREATE`, `MERGED != DEPLOYED`, sem mudanças fora do PR dedicado.
- **Observação inicial de 19/10:** leitura da VPS encontrou 9 processos cujo cwd está sob `/root/CentralDark`, 7 linhas de comando com o caminho e 2 referências no cron consultado. São contagens pontuais, não identidades nem dependências já migradas.
- **NEXT_CURSOR:** confirmar aliases existentes e consumidores, classificar cada referência nominalmente, migrar só o primeiro consumidor com contraprova e manter transição documentada até fixed point.


<!-- #OBSERVACOES# @owner: DELTA-CONTINUO.md @doc_ref: docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md @last_updated: 2026-10-19T17:06:23.000Z @escopo: PR1873 Screenpipe Casa/VPS + Windows runner + K root @estado: DIAGNOSTICO_MEDIDO @next_cursor: identificar owner runner e corrigir causa do STOPPED somente com autorizacao de servico -->
### 🫁 Contraprova do SPIKE Casa/VPS — 2026-10-19T17:06:23.000Z

**Objetivo:** incorporar as duas investigações ao **mesmo PR #1873**, sem alterar serviços, processos, runner ou material secreto. Medições obtidas via Desktop Commander, sessão autorizada em SEGREDO e CENTRALDARK-OS. `DOCUMENTED != FIXED`.

| Superfície | Medição atual | Veredito delimitado |
|---|---|---|
| Casa — raiz Git | `git -C K:\\ rev-parse --show-toplevel` = `K:/`; HEAD `16475832ad` | `K:\\` é checkout ativo; **não** criar `K:\\CentralDark` |
| Casa — `K:\\CentralDark` | `Test-Path` = False | Caminho não operacional nesta leitura |
| Casa — `K:\\_WORKER` | `Junction` para `F:\\_WORKER` | Reparse point presente; não copiar nem realocar |
| Casa — runner | `K:\\_WORKER\\CentralDark-Runners\\CASA-1\\.runner` presente; JSON parse PASS; `agentName=centraldark-casa-1` | Configuração existente, sem conteúdo sensível armazenado neste recibo |
| Casa — serviço runner | `actions.runner.ServerVpss-CentralDark.centraldark-casa-1` = `Stopped`, `StartMode=Auto`, `ProcessId=0`; nenhuma entrada `Runner.Listener`/ `Runner.Worker` foi retornada | Serviço **parado localmente**. Estado de registro online no GitHub ainda UNKNOWN |
| Casa — Screenpipe | porta TCP 3030 `Listen` em `0.0.0.0`, PID 21428 `screenpipe-app.exe`; `GET /health` = 200; `GET /api/health` sem auth = 403 | API local **ativa**, endpoint protegido/negando leitura anônima; token expirado **não comprovado** |
| VPS — Screenpipe | nenhum listener TCP local em 3030; requisições locais a `/health` e `/api/health` retornaram HTTP 000 | `3030` **não disponível localmente na VPS**; não implica falha do Screenpipe na Casa |
| VPS — raiz do projeto | `/root/CentralDark` ativo, HEAD `5844dde14`; aliases `/root/scripts` e `/root/apps` apontam para subpastas existentes | Espelhos do lote 01 preservados; nenhum consumidor migrado |

**Regras incrementais (um PR, nenhum novo executor):**
1. Diferenciar `CASA_3030` de `VPS_3030`; `403 != DOWN`, `HTTP_200_HEALTH != AUTH_PROVEN`, `RUNNER_CONFIG_EXISTS != RUNNER_ONLINE`.
2. `RUNNER_STOPPED` é diagnóstico; não iniciar, reiniciar ou reconfigurar serviço sem delta executável autorizado e contraprova de impacto.
3. O `K:\\` e o `/root/CentralDark` continuam raízes Git **diferentes** durante migração: não realizar `mv`, `reset --hard`, `git clean`, cópia de secrets ou alteração de caminhos de serviço em lote.
4. Referências legadas a `K:\\CentralDark` devem ser corrigidas **por owner e consumidor**, sem recriar pasta. Espelhos VPS são compatibilidade, não prova de sincronização remota.
5. Próximo delta: localizar o owner existente do Windows runner, ler logs sanitizados de causa de parada, e decidir reparo mínimo com aprovação contextual; validar acesso ao Screenpipe protegido sem expor credenciais.
6. Manter este status no PR #1873; avanço exige mesmos SHAs, timestamp real, readback e prova negativa. Não declarar produção recuperada por documento.



<!-- #OBSERVACOES# @owner: DELTA-CONTINUO.md @code_ref: apps/instinto-superior/src/components/central/MapaOwners.tsx @escopo: memoria visual das tres camadas Claude e pipeline Forja-Apps-Main-VPS @estado: PR_CANDIDATE @next_cursor: validar TS/build e prova visual -->
### 🧬 Memória do Corpo Único — cristalização e três camadas Claude (19/10/2026)

**Intenção confirmada:** a Casa em \`K:\\\` é a Forja bruta; \`K:\\apps\` concentra os aplicativos cristalizados; GitHub \`main\` preserva o código aprovado; a VPS executa os scripts, serviços e receitas localmente disponíveis, inclusive sem modelo de IA quando a tarefa já tem algoritmo determinístico. \`SCRIPT_BEFORE_MODEL\` e \`DOCUMENTED != DEPLOYED\`.

**Três camadas distintas — não fundir sem análise:**
1. \`C:\\Users\\Administrador\\.claude\`: perfil global do aplicativo Claude; autenticação, sessões, projetos, estados e plugins. Nunca versionar segredos.
2. \`K:\\.claude\`: contratos e instruções da Forja; \`agents\`, \`commands\`, \`prompts\`, \`rules\`, \`skills\`. Manter dono existente.
3. \`K:\\apps\\instinto-superior\\.claude\`: instruções específicas do Cockpit, subordinadas aos contratos superiores; presença de pasta não prova execução de validações nem herança automática de toda configuração.

**Raio-X observado da Casa:** 12 diretórios sob \`C:\\Users\\Administrador\\.claude\\projects\`, 12 diretórios sob \`file-history\`; \`K:\\.claude\` existe, porém \`K:\\.claude\\projects\` não existia na leitura. Contagens de diretórios não são hashes nem comprovação de integridade. Não inspecionar valores de \`.credentials.json\` ou credenciais em arquivos de sessão.

**Prioridade de transferência futura:** \`projects\` → \`file-history\`/\`plans\` → \`sessions\`/\`uploads\`, por grupos separados, backup com hashes e Claude fechado quando necessário. Comparar \`plugins\`/\`skills\` antes de unir. \`cache\`/\`paste-cache\`, \`daemon\`/\`jobs\`/\`ide\`, \`session-env\`, \`state\`, \`shell-snapshots\` e \`chrome\` permanecem até classificação de dependências. Não substituir a pasta \`.claude\` global inteira por junction.

**Destino privado sugerido (ainda NÃO criado):** dados duráveis em pasta privada do disco K, fora do conjunto versionado/sincronizado; verificar exclusões Git e outros scanners antes de qualquer cópia. Junctions só depois de readback, sem apagar originais. \`JUNCTION_PLANNED != JUNCTION_CREATED\`.

**Integração visual:** seção aditiva no owner \`apps/instinto-superior/src/components/central/MapaOwners.tsx\` — 4 cartões do pipeline, 3 camadas Claude, aviso de migração e ligação com este PR. É um **snapshot estático**, não API viva, e ainda exige build TypeScript/CI e contraprova visual no mesmo SHA.

**NEXT_CURSOR:** validar TypeScript, PR checks no HEAD, exibição autenticada da seção existente; depois classificar e executar somente o primeiro lote de transferência privada com rollback.
