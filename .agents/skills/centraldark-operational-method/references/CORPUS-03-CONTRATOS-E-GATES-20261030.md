## Comunicação com o Chefe

- Vocativo Pivete permitido quando natural
- Em resenha/exploracao: responder ao que foi dito, nao converter automaticamente em skill/memoria/PR
- Em técnico copiável: bloco de código, PT-BR, comando completo
- Em explicação: duas camadas (SIGNIFICA → NA PRÁTICA → NOME TÉCNICO → PROVA → PRÓXIMO PASSO)

## Skills absorvidas via Kimetsu/17 Respirações (2026-09-22)

Esta seção registra o delta de absorção de skills locais (`K:\skills\`) na biblioteca canônica via `regenerative-self-refinement-engine.md` / método Kimetsu/17 Respirações. Regra de ouro: NÃO copiar pasta inteira por nome — comparar, absorver somente o delta útil, manter owner canônico existente.

### `screenpipe-hermes-integration` → `screenpipe-live-observer` (status: ABSORVIDO)
- Classe: UNIQUE_DELTA (canônico cobre sensor/OCR/handoff; local traz procedimento prático de integração Screenpipe+Hermes via Omni Router não coberto pelo canônico)
- O que foi absorvido: gatilhos de ativação, pré-requisitos, 6 passos de configuração do Omni Router + Screenpipe Provider, pitfalls, monitoração in-the-job, investigação forense (READ_ONLY/zero-mutation), status codes, leis não-negociáveis, o que não prova, Hermes Screenpipe Tool Gap
- Onde: nova seção "Integração prática com Screenpipe + Hermes via Omni Router" inserida antes de "# Screenpipe Live Observer — sensor global da Casa" no presente arquivo
- Proveniência preservada: skill local permanece em `K:\skills\screenpipe-hermes-integration\` como registro histórico; não deletado, não promovido a owner separado
- Regra aplicada: ZERO_BLIND_COPY=true; SAME_NAME != SAME_ENTITY; delta checado antes de absorver

### Delta materializado da captura Hermes Desktop → Capability HUD (status: ABSORVIDO)
- Capacidades únicas absorvidas sem criar owner paralelo: `CAP_SCREEN_CONTEXT_CAPTURE`, `CAP_SCREENSHOTS_TIMELINE`, `CAP_ALL_MONITORS`, `CAP_CAPTURE_FREQUENCY_1S`, `CAP_MATERIALIZE_DESKTOP_CAPTURE`, `CAP_SCREENPIPE_LOCAL_API_3030`, `CAP_COCKPIT_READBACK`, `CAP_SUPABASE_REALTIME_COCKPIT`.
- Rota canônica: Hermes Desktop autenticado → `computer_use.capture(app=screen)` → captura materializada/readback; Screenpipe `127.0.0.1:3030` → health/inventário/freshness; Cockpit → owner Supabase Realtime existente → readback Hermes.
- Estados preservados: `CONFIGURED != ACTIVE != FRESH != SUPABASE_REALTIME_PROVEN`; HTTP 200 em `3030` é somente alcance.
- Owner de catálogo: `catalogo/skills-integradas/centraldark-capability-hud/SKILL.md`; não duplicar em outra skill.

### `fable-loop` → `fable-loop` canônico (status: NÃO_ABSORVIDO — deixar local)
- Classe: DUPLICATE_DIVERGED (same name + same archetype, conteúdo paralelo não-overlapping: local = contract de autoload SKILL.md coreano/inglês; canônico = método centraldark de calibração contínua PT-BR, experimental, READ_ONLY)
- Decisão: NÃO fundir. Manter ambos. Canônico mantém owner SEGREDO/CHEFE e status experimental-read-only. Local permanece em `K:\skills\fable-loop\` como referência de autoload alternativo. Documentar divergência, não criar espaço paralelo.

### `brain-vault-watcher` → `brain-memory` canônico (status: NÃO_ABSORVIDO — GAP_NAO_PROVADO)
- Classe: NOVEL + GAP_A_PROVEAR (local = watcher de sync de MOCs/indexes do Obsidian vault, com triggers, deduplicação, cron; canônico = layer de prefs via `brain_feedback` + `apply-evidence`, read-only, owner SEGREDO/CHEFE)
- Gap a provar antes de absorver: demonstrar que o canônico `brain-memory` NÃO cobre sync de índices/MOCs do vault. Enquanto não provado: NÃO criar memory owner paralelo, NÃO duplicar.
- Decisão: deixar local com documentação cruzada. Se no futuro a Casa precisar de watcher de vault, escrever no dono canônico existente ou no novo owner apropriado — não importar skill inteira.

### `operational/*` (6 sub-skills) → `centraldark-operational-method` canônico (status: PARTIAL — deltas absorvidos abaixo)
- Classe MIXTA após leitura:
  - `absolute-lock-protection-protocol`: NOVEL/delta (procedimento de lock de arquivo compartilhado com trap, sleep antes de unlock, falha se stale > 30s)
  - `autonomous-execution-mode`: DELTA_MENOR (subcomando autocontido para container; canônico já cobre "execução integral autocontida")
  - `hermes-platform-access-control`: NOVEL (conexão autenticada Hermes Desktop + resultado final escondido)
  - `intention-driven-workflow`: DELTA_MENOR (2 clocks, clock registra, outro executa; já coberto pelo canônico)
  - `multi-agent-rendezvous`: DELTA_MENOR (rendezvous, results.txt, post-run merge)
  - `operational-incident-response`: DELTA_MENOR (PASS/FAIL/UNKNOWN triage, SQLite audit, 1 file < 100 lines)
- Decisão: absorver content DOIS content de operational no canônico existente (não criar skill separado); deixar local com docs cruzadas
- Regra aplicada: REUSE_BEFORE_CREATE=true; ONE_OWNER_PER_CAPABILITY=true

## Referências

- references/jeito-correto-pivete.md — metodo completo
- references/padrao-resposta.md — formato de resposta
- references/dicionario-github.md — vocabulário GitHub
- references/prompt-mestre-issues.md — missao issues V-REALTIME
- references/modo-operacional-loop.md — LOOP evidencia primeiro
- references/meta-lupa-summary.md — resumo da MetaLupa
- references/boot-receipt.yaml — template do recibo de boot
- references/pr-decomposition-method.md — método de decomposição determinística de PR histórico
- references/regenerative-self-refinement-engine.md — motor regenerativo Hermes
- references/kimetsu-legacy-architecture.md — arquitetura Respirações
- references/kimetsu-legacy-fixed-point-predicate.md — predicado Fixed Point corrigido
- references/fix-cyan-color.md — configuração terminal/editor
- references/hermes-regenerative-runtime.md — runtime regenerativo preso ao profile
- references/tri-root-inventory-legacy-freeze.md — metodologia tri-root + freeze legado + ownership Obsidian + identidade SOUL
- references/mcp-local-bootstrap.md — procedimento validado para subir MCP CentralDark localmente (health, status.json, 110 tools)
- references/soul-config-divergence-runtime-block.md — padrão de divergência SOUL/config quando runtime lê de UserProfile (AppData) vs canônico
- references/soul-hermes-casa-local-adapter-only.md — SOUL HERMES-CASA/pivete existe só como adaptador local, não no GitHub canônico
- references/git-push-sequence.md — sequência obrigatória de publicação (fetch, merge, test, push, PR-mãe)

## !CENTRALDARK Gate Oficial

Quando o CHEFE invocar `!CENTRALDARK`, `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`
ou variantes evidentes, a Casa nao pode pegar ferramenta material antes do gate:

```text
CHEFE_INPUT
-> DESTINATION_LOCK
-> #ACORDAR
-> !CALIBRAR
-> !MULTIBUSSOLA
-> !META_LUPA
-> MENOS_E_MAIS
-> OWNER_EXISTENTE
-> WRITER_SCOPE
-> EVIDENCE_BOUND
-> TOOL_CALL
-> RECEIPT
```

`!META_LUPA` nao e enfeite de relatorio. Em escopo tecnico da CentralDark ela e
precondicao operacional para evitar que o agente entre em ruas aleatorias.

Microetapas obrigatorias por agente:

```text
A       -> declarar claim/objetivo exato
CORPO   -> fotografar estado vivo e owner
SOMBRA  -> procurar contradicao/falso-verde/regressao
ALMA    -> extrair aprendizado reutilizavel
VOLTA   -> refazer menor no owner correto
```

Se um agente corrigiu um erro simples uma vez, a próxima execução deve procurar o
mesmo padrão primeiro, antes de redesenhar a arquitetura. Isso é aprendizado
operacional, não memória decorativa.

### 43. EXECUTION_OVER_EXPLANATION — User Values Doing over Talking
**Correção direta do Chefe (2026-09-11):** "so conversa bonita nao serve", "vc so ta falando no caht nao to vendo aprendizado nem cristalziaçao congnitivo nem mental nem motora nem nad"

**Regra cristalizada:** Quando usuário pede "ler repo integramente e continuar a história", NÃO responder em fragmentos Q&A. Ler de fato, integralmente, e continuar a história de forma conectada. O usuário não quer confirmation step a cada pedaço — quer a tarefa feita.

**Regra de continuidade do mesmo escopo:** Se a correção já está autorizada, é reversível e pertence ao mesmo owner/escopo, executar diretamente: separar somente o delta, testar, commitar e publicar pela rota segura. Não criar novo motor, skill, workflow ou parada de confirmação para cada variação da mesma classe. Reabrir só com intenção nova, escopo novo, risco material, contradição ou bloqueio real.

**Regra de commit limpo:** Commit não é mecanismo para limpar `git status`. Só commitar delta intencional, classificado, pertencente ao owner correto e provado por teste/checagem aplicável. Runtime gerado, painel/status, `.next_run`, drift, segredo, desconhecido e alterações sem relação ficam preservados e fora do commit. Um commit registra a mudança; push publica; merge integra; deploy altera runtime; cada etapa exige sua própria prova.

**Publicação segura sob demanda do motor:** quando uma alteração importante já estiver autorizada no mesmo escopo, o writer canônico pode usar `AUTO_DISCOVER=1` + `AUTO_DISCOVER_SCOPE=<prefixos-do-owner>` para selecionar somente arquivos rastreados, modificados e não deletados dentro do owner indicado. Ele exclui segredos, dependências, builds, logs, status, missões e estado gerado; roda primeiro com `DRY_RUN=1` quando a seleção precisar ser inspecionada; publica somente pela worktree limpa baseada na `origin/main`, sem `git add -A`, merge cego ou force-push. Ausência de delta elegível é `NO_CHANGE`, não motivo para pedir ao Chefe uma triagem mecânica.

**Regra de botão e prova do alvo:** Trate screenshot, árvore visual, status do botão e mensagem de sucesso como evidência de interface, não como prova do caminho/runtime. Antes de confirmar, medir no host ativo `pwd`, `realpath`, processo/CWD, caminho exato e arquivo consumidor; quando a imagem estiver borrada, rebaixar o texto para hipótese e não transformar OCR em fato. Se o painel exigir login, não adivinhar credencial: parar a ação visual e usar somente uma rota equivalente já autorizada, com o mesmo escopo e os mesmos gates.

**Regra de publicação sem duplicata:** Para publicar local divergente, construir worktree limpa em `origin/main`, selecionar apenas commits/deltas seguros e provar equivalência antes do push. `cherry-pick empty` significa `ALREADY_CANONICAL` e deve ser pulado sem commit vazio. Conflito que, ao resolver, removeria conteúdo canônico é bloqueio: abortar/descartar apenas a worktree temporária e não usar `--theirs`/`--ours` como atalho sem classificar o owner e o gate aplicável. Gate de porta, segredo, órfão canônico ou contradição bloqueia o push; não mascarar como sucesso.

**Sinais:** "vc ta pegintando por que?", "pq vc diz que vai fazre e nao faz?", "cocnerter o motor critalize no motor"

**Ação correta:**
- Ler documentos completos, não apenas cabeçalhos
- Ler git log integralmente, não apenas últimos 5 commits
- Compreender contexto antes de responder às perguntas do usuário
- Executar o que foi prometido, não prometer e não executar
- Quando usuário dizer "pare de falar e faça", parar de narrar e executar

**Pitfall:** fragmentar uma leitura integral em múltiplas perguntas pontuais. Isso é o erro exato que o Chefe corrigiu.

### 44. LINGUISTIC_CALIBRATION — Bahia Expression Accuracy
**Correção direta do Chefe (2026-09-11):** "visse nao e ad bahia naoi disgraça pega o dicionario baianes ai no google e ingloobal em voec"

**Regra cristalizada:** Expressões baianas devem ser usadas com precisão, não como decoração. "Visse" é pernambucano/recifense, não baiano. "Meu rei" é estereótipo criticado localmente.

**Expressões genuínas da Bahia/Salvador:** oxe, oxente, massa, barril, barril dobrado, laranjada, se plante, se pique, pega a visão, armengue, largou o doce, é niuma, ó paí, vumbora, mainha.

**Regra:** usar quando contexto combina, não jogar em toda frase. Menos caricatura, mais naturalidade. Pesquisa confirmatória antes de assumir origem regional de expressão.

### 45. WEBUI_ADMIN_HUB — Localhost:8787 as CentralAdmin Surface
**Contexto (2026-09-11):** WebUI em `/tmp/hermes-webui/` rodando em `127.0.0.1:8787` (PID 286195, launcher `ctl.sh` de nesquena/webui) converteu-se em painel administrativo central da CentralDark.

**Regra:** O painel admin (`admin.centralldark.com` ou local `8787`) é a casca única administrativa. Toda capacidade aparece como nó na árvore do admin, não como painel separado.

**Árvore do admin:**
```
admin.centralldark.com
→ 🏠 Visão geral
→ 🔌 MCP (OAuth, tools, capabilities)
→ 🧠 Hub (memória, eventos, consumers)
→ 📊 Observabilidade (Grafana embutido, métricas, logs, traces)
→ ☁️ Cloudflare (builds, bindings, observability)
→ 🖥️ VPS (PM2, deploy, health)
→ 👁️ Screenpipe (local, via MCP, captura ON/OFF)
→ 🤖 IA/Providers (catálogo, ativação sob demanda)
→ 🔐 Segurança (Basic Auth, OAuth Admin, sessões, auditoria)
```

**Botão não abre outro painel — abre a árvore daquela capacidade dentro do próprio Admin.** Grafana, Cloudflare, Screenpipe etc. são apresentados dentro do admin, mesmo que por trás sejam serviços reais.

### 46. ONE_SYSTEM_ONLY_ENFORCEMENT — User's Operational Maxim
**Declaração explícita do Chefe (2026-09-11):** "ONE_SYSTEM_ONLY=true UNKNOWN_IS_NOT_PASS=***"

**Regra cristalizada:** O usuário opera com ONE_SYSTEM_ONLY=true como maxim explícita. Não criar segunda arquitetura, segundo MCP, outro hub, outra ponte. Tudo flui pelo MCP CentralDark autenticado.

**Decisões cristalizadas no PR-mãe (#1381, comentários 5641853866 e 5641904907):**
- `SUBDOMAIN != NEW_SYSTEM`
- `CAPABILITY != NEW_PORT`
- `ADMIN_AUTH != VPS_ROOT_AUTH`
- `ONE_SYSTEM_ONLY=true`

**Consequência prática:** quando usuário dropa arquivo grande (zip, paste), processar e cristalizar ouro no owner canônico existente, não criar estrutura paralela.

### 47. LARGE_FILE_INTEGRATION — Process Droped Files, Don't Just Acknowledge
**Contexto (2026-09-11):** Usuário dropou `CentralDark-OneShot-Integrated.zip` (275MB) em `/root/CentralDark/apps/modulos/mcp-admin-ui/`.

**Regra:** Quando usuário fornece arquivo grande para integração:
1. Descompactar e ler conteúdo integralmente
2. Extrair ouro: componentes, arquitetura, fluxos, decisões
3. Classificar: CANONICAL | OPERATIONAL | CANDIDATE | PROGRAM_ONLY | HISTORICAL | UNKNOWN
4. Indexar na caderneta de reconciliação ou documentar onde está
5. Não apenas ack — processar e registar

**O que foi feito com o OneShot:** desCompactado em /tmp, lidos ARCHITECTURE.md, INTEGRATION-RECEIPT.md, RECEIPT.md, RECEIPT-FIX-NPX-ATUAL.md, REGRA-ZERO.md, README.txt, ARQUITETURA.md — ouro extraído e pronto para cristalização.

### 48. CONTEXT_COMPACTION_HANDOFF — Treat as Reference, Not Instructions
**Regra (do sistema):** O resumo de contexto compaction é referência, não instrução ativa. Responder apenas à mensagem mais recente do usuário que aparece APÓS o resumo. Não continuar trabalho do snapshot histórico a menos que a mensagem mais recente explicitamente peça.

**Aplicação prática:** se o resumo mostra tarefa incompleta, mas a mensagem mais recente é nova/incompatível/para, parar o trabalho antigo e seguir a nova direção. O mais recente vence.

### 49. AUREOLA_PERMANENTE — Aprendizado não fica preso à sessão
**Correção direta do Chefe:** "não adianta ficar fazendo só em uma sessão", "tudo que a gente aprende tem que ser integrado", "só melhor o que já existe".

**Regra cristalizada no motor:** uma sessão, print, resposta, contexto carregado ou intenção lembrada não constitui aprendizado permanente por si só. O aprendizado só sobe para a Casa quando o delta é destilado no owner canônico existente, sobrevive a teste/contraprova e fica recuperável no próximo boot. O motor deve reutilizar esse cristal automaticamente e melhorar somente o delta que a nova evidência invalidar.

```text
SESSAO|PRINT|CONVERSA|CONTEXTO
→ EVIDENCIA
→ DELTA_REUTILIZAVEL
→ OWNER_CANONICO_EXISTENTE
→ TESTE + CONTRAPROVA
→ GIT/REGISTRO_CANONICO
→ PROXIMO_BOOT_RECARREGA
→ REUTILIZA_SEM_REENSINO
```

```text
SESSION_MEMORY_ONLY=NAO_E_CRISTAL
CANONICAL_OWNER_REQUIRED=true
NEXT_BOOT_MUST_RELOAD_CRYSTAL=true
REMEASURE_LIVE_STATE_AT_BOOT=true
NEW_EVIDENCE_INVALIDATES_ONLY_AFFECTED_ROUTE=true
IMPROVE_EXISTING_DELTA=true
NO_NEW_SYSTEM_FOR_LEARNING=true
```

**Critério de prova:** para afirmar que a Aureola está amarrada, medir o owner no repositório, confirmar o mecanismo consumidor e executar a validação aplicável. Se o runtime futuro não recarregar o owner ou exigir que o Chefe reensine a mesma regra, classificar como `REGRESSION`, não como memória permanente.

### 50. GIT_SEQUENCE_COMMIT_PUSH — Fetch Before Push, Never Reset
**Cenário (2026-09-12):** Tentativa de `git push origin main` falhou porque o remote já tinha commits mais novos. Reset hard para commit antigo destruiu trabalho em `fix/writer-canonical-40`. `gh pr create` falhou porque branch não existia remotamente. Forçou branch a partir de `main` local (stale).

**Regra cristalizada — sequência de publicação obrigatória:**
```text
ANTES DE QUALQUER PUSH/PULL/MERGE:
  1. git fetch --no-tags origin refs/heads/main  (atualiza remote-tracking)
  2. git status --short --branch                  (verifica ahead/behind)
  3. git rev-parse HEAD && git ls-remote origin refs/heads/main  (compara SHAs)

SE LOCAL == REMOTE:
  → git add + git commit --amend + git push origin main

SE LOCAL BEHIND REMOTE:
  → git merge origin/main --strategy=recursive --strategy-option=theirs
  → resolver conflitos se houver
  → git diff --check
  → node --check + node --test
  → git add + git commit --amend + git push origin main

SE AHEAD DO REMOTO (branch próprio):
  → git push origin <branch> (sem -f)
  → se rejeitado: git pull --rebase origin <branch> ou git push -f (com prova)
  → nunca reset --hard a menos que o branch inteiro seja descartado

NUNCA:
  → git reset --hard <commit-antigo>  (destrói trabalho não publicado)
  → git push -f origin <branch> sem verificar se remote tem commits novos
  → criar branch a partir de main local sem primeiro merge origin/main
  → git push origin main sem antes verificar se remote está atrasado
```

**Para criar PR-mãe:**
```text
1. git fetch origin main
2. git merge origin/main --no-edit --strategy=recursive --strategy-option=theirs
3. git diff --check + node --check + node --test (42/42)
4. git add -A files-changes
5. git commit --amend --no-edit
6. git branch -f fix/writer-canonical-40 HEAD
7. git push -f origin fix/writer-canonical-40
8. gh pr create --base main --head fix/writer-canonical-40
```

**Pitfall crítico:** `main` local pode estar AHEAD de `origin/main` se o push anterior subiu o commit. O branch `fix/writer-canonical-40` criado a partir de `main` local inclui o commit já publicado, fazendo com que `origin/main` esteja AHEAD do branch. Solução: sempre criar branch a partir de `origin/main`, não de `main` local. Ou, se o commit já está em `origin/main`, o branch não precisa existir — o trabalho já está publicado.

**Regra de publicação segura sob demanda do motor:** quando uma alteração importante já estiver autorizada no mesmo escopo, o writer canônico pode usar `AUTO_DISCOVER=1` + `AUTO_DISCOVER_SCOPE=<prefixos-do-owner>` para selecionar somente arquivos rastreados, modificados e não deletados dentro do owner indicado. Ele exclui segredos, dependências, builds, logs, status, missões e estado gerado; roda primeiro com `DRY_RUN=1` quando a seleção precisar ser inspecionada; publica somente pela worktree limpa baseada na `origin/main`, sem `git add -A`, merge cego ou force-push. Ausência de delta elegível é `NO_CHANGE`, não motivo para pedir ao Chefe uma triagem mecânica.

**Sinais:** "faz comit main", "pr mãe", "tá comit", "merge"

**Ação correta:**
- Sempre `git fetch` antes de qualquer operação de push/pull/merge
- Sempre comparar `HEAD` local vs `origin/main` antes de commit/push
- Se branch precisa existir: `git branch <name> origin/main` (não `main` local)
- Se trabalho já está em `origin/main`: não criar branch, deletar branch local
- Testar (node --check, node --test) antes de publicar
- Commit `--amend --no-edit` para consolidar no HEAD atual
- Verificar `git status --porcelain | wc -l` para confirmar estado limpo

**Pitfall:** assumir que `git pull --ff-only` atualiza tudo. Quando o branch local está atrás, o ff-only não funciona e o merge é necessário. Quando o branch local está à frente, o ff-only não aplica e o push pode rejeitar. Sempre medir antes.

### 51. SEGRET_REDOACTION — Redaction and Scope-Limiting Instructions
**Correção direta do Chefe (2026-09-11):** "permito segredo" — valores nunca exibidos ou preservados; substituir por `[REDACTED]`.

**Regra cristalizada:** Nunca exibir, logar, copiar ou preservar em output, artifact, diff, comentario, receipt ou arquivo qualquer valor que seja segredo, token, senha, API key, credential ou connection string. Substituir por `[REDACTED]`. Isso inclui screenshots que contenham valores sensíveis — borrar ou omitir antes de descrever.

```text
QUALQUER_VALOR_SECRETO → [REDACTED]
NUNCA_EXIBIR = true
NUNCA_PRESERVAR_EM_ARQUIVO = true
NUNCA_LOGAR = true
```

**Escopo:** todos os canais — chat, terminal, arquivos, screenshots, receipts, PRs, commments, logs.

**Scope-limiting (`mira somente lá`):** quando o Chefe limita a busca a um diretório ou escopo específico, obedecer rigorosamente. Não expandir a busca para outros diretórios, repositórios ou sistemas sem autorização explícita. Isso aplica-se a todas as classes de tarefa — busca de arquivos, investigação de erros, descoberta de capacidades.

```text
MIRA_SOMENTE_LA = escopo_exato_do_CHEFE
NAO_EXPANDIR_SEM_AUTORIZACAO = true
```

### 52. SAFE_OPERATIONAL_PREFLIGHT — Evidence Before Mutation
**Correção direta do Chefe (2026-09-11):** preflight de segurança com leitura-only primeiro, evidência concreta, depois a menor mutação autorizada, depois verificar.

**Regra cristalizada:** Para mudanças operacionais que afetam estado (deploy, merge, config, runtime), a sequência obrigatória é:

```text
PASSO 1 — READ-ONLY PREFLIGHT
  → medir estado atual (HEAD, branch, runtime, portas, processos)
  → confirmar que o alvo existe e está acessível
  → classificar risco e escopo

PASSO 2 — EVIDÊNCIA CONCRETA
  → prova do estado antes da mutação
  → baseline medido, não presumido
  → se screenshot/imagem: OCR é HIPÓTESE, não FATO — rebaixar para hipótese se borrado

PASSO 3 — MENOR MUTAÇÃO AUTORIZADA
  → delta mínimo que resolve a causa comprovada
  → testar local antes de publicar
  → node --check + node --test (42/42) antes de qualquer push

PASSO 4 — VERIFICAR DEPOIS
  → medir estado pós-mutação
  → confirmar que o runtime responde ao esperado
  → registrar SHA, testes, evidence

REGRA: se a direção se perder, TRAVAR ANTES DE MUTAR NO ESCURO, recarregar SOUL + intenção + estado vivo, reconciliar e continuar.
```

**Pitfall:** executar mutação sem preflight de leitura. Cada mutação sem baseline medido é um tiro no escuro — mesmo que funcione, não há prova de que o efeito foi o pretendido.

---

Ferramentas, webhooks e bots que queiram executar acao CentralDark podem declarar
`centraldark_gate_required=true` e anexar `centraldark_gate` com os fatos do gate.
Sem os fatos obrigatorios, o receptor deve falhar fechado.

## Gatilho REGISTRA — sequência completa, não anotação

`REGISTRA` é comando operacional do CHEFE, não pedido para apenas escrever documentação.

```text
REGISTRA_MEANS_COMMIT_PUSH_PR_SQUASH_MAIN=true
REGISTRA
→ medir CURRENT_MAIN_SHA/HEAD
→ dedupe + owner existente
→ menor MVP útil
→ teste aplicável + contraprova
→ commit
→ push em branch filha somente quando PR for materialmente necessária
→ abrir/reusar PR filha por OWNER+SCOPE+CAPABILITY sem vínculo obrigatório com PR-MÃE
→ remeasure live
→ blocker técnico recuperável: continuar até HUMAN_FRONTIER real
→ conflito: usar git-conflict-resolve-house-standard
→ SAME_HEAD gates fechados no HEAD atual
→ SQUASH_CHILD_ONLY com expected_head_sha
→ readback da main + novo CURRENT_MAIN_SHA
→ DEPLOY_CAUSAL somente se o delta exigir runtime
→ T1 quando houver deploy causal
→ receipt no repositório e no PR filho quando aplicável
→ HUD_CURRENT_READBACK
→ fixed point do delta
```

`#1562` e `#1757` são provenance histórica preservada. A superfície operacional
CURRENT é o HUD existente; nenhuma nova PR-MÃE nasce para rendezvous/checklist.

### Lapidação progressiva

Não esperar somente “ouro/diamante”. Toda peça útil pode entrar como candidato e melhorar por iteração:

```text
IDEIA_UTIL
→ MVP_MINIMO
→ EXECUTAR/ABRIR
→ TESTAR
→ MEDIR
→ ERRO? APRENDER + CORRIGIR
→ SOBREVIVEU? PROMOVER
→ REPETIR
```

Metáfora permitida: pepita, bronze, prata, ouro, diamante, qualquer “joia” = nível de maturidade. Nenhum rótulo substitui prova.

```text
USEFUL_BEATS_PERFECT_WAITING=true
MVP_FIRST=true
ITERATIVE_LAPIDATION=true
ERROR_IS_LEARNING_ONLY_WITH_EVIDENCE=true
FAILED_GATE_STAYS_OFF_MAIN=true
CHEFE_SEES_MATERIAL_DECISION_OR_RESULT=true
```

O sistema deve construir sem paralisia, mas não baixar gates de segurança, segredo, produção, destruição ou falso-verde.

### 53. PROVEN_PATH_REPLAY_LOCK — caminho provado vira receita reutilizável

**Regra cristalizada:** quando uma sequência já produziu resultado reproduzível,
sobreviveu à contraprova e foi selada, o próximo executor não redesenha a solução
do zero. Ele reutiliza a mesma receita e adapta apenas os bindings inevitáveis do
ambiente.

```text
CAMINHO_JA_PROVADO
→ SELAR_RECEITA_EXECUTAVEL
→ GUARDAR_FINGERPRINT
→ PROXIMO_EXECUTOR_CARREGA_RECEITA
→ ADAPTAR_SOMENTE_AMBIENTE
→ EXECUTAR_MESMA_SEQUENCIA
→ RODAR_MESMA_PROVA
→ COMPARAR_RESULTADO
→ DIVERGIU? DELTA_NOVO + REVALIDAR_CONE_AFETADO
→ NAO_DIVERGIU? REUTILIZAR_CRISTAL
```

```text
PROVEN_PATH_REPLAY_LOCK=true
PROVEN_PATH_MUST_NOT_BE_REINTERPRETED_FROM_ZERO=true
SAME_FINGERPRINT_REUSES_PROVEN_RECIPE=true
ENVIRONMENT_ADAPTATION_MUST_NOT_CHANGE_GOAL=true
ENVIRONMENT_ADAPTATION_MUST_NOT_CHANGE_PROOF_LOGIC=true
RAW_OUTPUT_BYTE_EQUALITY_REQUIRED=false
RESULT_SCHEMA_AND_EXPECTED_EFFECT_MUST_MATCH=true
HUMAN_RETEACH_REQUIRED_FOR_SAME_PROVEN_PATH=false
NO_NEW_SYSTEM_FOR_PROVEN_PATH_REUSE=true
```

Owner existente:
`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml`.

Runtime consumidor:
`scripts/trigger-fabric/centraldark_full_trigger_boot.py`.

Isso estende `REUSE_BEFORE_CREATE`, `REUSE_PROOF_NO_REPEAT` e
`REUSE_CRYSTAL_NOT_RETHINK`; não cria segunda memória, segundo método ou
segundo cérebro.



## Runtime preflight obrigatório

Antes de qualquer probe/comando de runtime que possa gerar fato operacional, validar primeiro o wrapper, shell, host-mode, paths requeridos e evidência de ownership quando aplicável pelo consumer canônico `scripts/trigger-fabric/centraldark_full_trigger_boot.py preflight-lint`.

```text
WRAPPER_PREFLIGHT
→ PASS
→ EXECUTE_TARGET_PROBE
→ OBSERVE_TARGET
→ PROOF
→ COUNTERPROOF
→ REALITY_JUDGE

WRAPPER_PREFLIGHT_FAIL
→ TARGET_NOT_EXECUTED
→ INVALIDATED_PROBE
→ FIX_PREFLIGHT_AND_RETRY
```

`PREFLIGHT_PASS != RUNTIME_PASS`.
`WRAPPER_PARSE_FAIL != TARGET_FAIL`.
`INVALID_PROBE_MUST_NOT_BECOME_FACT=true`.
`BRIDGE_OWNERSHIP_CLAIM_REQUIRES_COMPLETE_EVIDENCE=true`.

Este preflight é extensão do método existente, não segundo gate/owner. Falha do wrapper impede promover conclusão sobre o alvo; PASS do wrapper apenas autoriza executar a prova real.

### Reality Judge não é permissão de execução

`REALITY_IS_JUDGE` limita falso-verde e valida o efeito observado. Não é porteiro antes da ação, não reduz a autoridade do CHEFE e não autoriza revalidar tudo quando há rota determinística e fingerprint preservado.

```text
REALITY_JUDGE_AFTER_EFFECT=true
REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM=true
REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true
DETERMINISTIC_ROUTE_FIRST=true
CHEFE_AUTHORITY_IS_NOT_REDUCED_BY_SENSOR=true
OBSERVED_REALITY_CAN_BE_WRONG_OR_PARTIAL=true
```

Se a observação contradiz o comando, medir sensor/cache/cone/timestamp, corrigir o menor gate causal e continuar. Não transformar prudência em bloqueio.

## HEREDITARY_CRITERION_DNA — Goal/intent fractal no owner existente

### Aprendizado #176 — critérios autoselecionados carregam a intenção

**Lição do CHEFE (2026-10-13):** quando o executor é eficiente usando critérios que ele mesmo escolheu, **usar essa eficiência em favor do desejo humano**, não desqualificá-la. Os `10/10 PASS` documentais anteriores podem ter sido satisfatórios ao CHEFE; o próprio agente não tem autoridade para presumir insatisfação. Não transformar uma dificuldade de operação em burocracia inevitável.

```text
INTENCAO_DO_CHEFE -> MOTOR_DEFINE_CRITERIOS_MINIMOS_RELEVANTES
-> EXECUCAO_AUTORIZADA_EM_LOTE -> CHECKS_PROPORCIONAIS
-> RESULTADO_UTIL_PARA_O_CHEFE -> PONTO_SUFICIENTE_OU_NEXT_CURSOR
LEARNING_REF=L176
AGENT_SELECTED_CRITERIA_ALLOWED=true
CHIEF_INTENT_MUST_BE_CARRIED_BY_EACH_CRITERION=true
MICROAPPROVAL_WHEN_INTENT_ALREADY_AUTHORIZES=false
RECHECK_WITHOUT_MATERIAL_DELTA=false
ADVERSARIAL_AUDIT_IS_NOT_RITUAL=true
PRETTY_ALL_GREEN_IS_NOT_REQUIREMENT=true
SELF_SELECTED_CHECKS_MAY_BE_SATISFACTORY=true
LOCAL_CHECK_PASS_IS_NOT_UNIVERSAL_DEPLOY_PASS=true
REAL_SAFETY_AND_AUTHORIZATION_BOUNDARIES_REMAIN=true
```

**No próximo trabalho:** resolver o pedido simples diretamente, com um conjunto pequeno de critérios que o próprio agente propõe e testa, sem pedir aprovação passo a passo. Revalidar somente o que mudou. Encerrar quando o CHEFE considerar suficiente para o objetivo atual, ou persistir `NEXT_CURSOR` com a primeira diferença material. Evidenciar `L176` e qual etapa redundante foi evitada, sem criar novo motor, novo gate ou checklist enorme.

O mesmo Criterion/intent nasce no `GOAL` e é herdado, sem virar lista rígida de passos,
por toda a árvore `GOAL → SUBGOAL → LOTE/BATCH → SUBAGENT/SUBSUBGOAL`. Este é o
contrato aditivo do owner operacional/TLC23 existente; não cria segundo criterion
engine, scheduler, goal system, memory engine ou arquitetura.

```text
HEREDITARY_CRITERION_DNA=true
CRITERION_ENGINE_OWNER=.agents/skills/centraldark-operational-method
GOAL → SUBGOAL → LOTE/BATCH → SUBAGENT/SUBSUBGOAL

INHERIT:
  WHY/INTENTION/OBJECTIVE + SUCCESS_PREDICATE_TERMINAL_INDIVISIBLE
  CURRENT/BASELINE + OWNER/SCOPE + PROOF_DESTINATION
  REUSE_BEFORE_CREATE
  PARALLEL_PERCEPTION_AS_LENSES_OR_CAPABILITIES
  ONE_WRITER_PER_SCOPE
  COUNTERPROOF + REALITY_JUDGE
  REMEDIATION_AFTER_STATE_CHANGE
  RECEIPT + NEXT_CURSOR

REFINE_WITHOUT_WEAKENING:
  CHILD_CAN_REFINE_CRITERION=true
  CHILD_CANNOT_WEAKEN_PARENT_CRITERION=true
  LOCAL_DONE != PARENT_DONE
  EVIDENCE_RETURNS_TO_PARENT=true
  INTELLIGENCE_LIVES_IN_PROCESS_AND_INHERITANCE=true

DO_NOT_INHERIT_AS_RIGID_SCRIPT:
  STEPS
  COMMIT/PUSH/PR/MERGE/QUEUED/GREEN/DEPLOY_TRIGGERED

DONE_ONLY:
  FIXED_POINT | HUMAN_ONLY_BLOCKER
```

Regras de composição: o descendente preserva intenção e predicate terminal, pode
estreitar o escopo, mas mede novamente `CURRENT/BASELINE` e reatacha `OWNER/SCOPE`.
Lentes só observam; toda mutação é serializada no escopo. Mudança de estado expira
a prova dependente e exige remediação, nova contraprova, readback e receipt próprio.
Cada nó continua até `FIXED_POINT` ou até um `HUMAN_ONLY_BLOCKER` exato; etapas de
entrega e deploy são intermediários, nunca `DONE`.

### Teste e proveniência

A formulação executável vive em `contracts/TLC23-RUNTIME-GATE.yml` sob
`hereditary_criterion_dna`, ligada à PR-mãe `#1562` pelo contrato TLC23 existente.
O teste `scripts/test_goal_criterion_inheritance.py` verifica as quatro escalas,
o DNA herdado, a ausência de lista de passos herdada e a fronteira terminal.

## Padrão aprendido do CHEFE — transformação de sistemas por invariantes

Este delta é global ao método e não depende de uma UI, modelo ou runtime específico.

```text
SYSTEM_TRANSFORMATION_BY_INVARIANTS=true
INTENT_OWNER=SEGREDO/CHEFE
NO_MIND_READING=true
MANIFEST_PATTERN_CAN_BE_GENERALIZED=true
UNSTATED_MENTAL_CONTRACT=UNKNOWN
REUSE_BEFORE_CREATE_AT_SYSTEM_SCALE=true
CAPABILITY_NE_INTERFACE=true
OWNER_NE_BUTTON=true
ENGINE_NE_IDENTITY=true
TRANSPORT_NE_PRODUCT=true
LEGACY_CAN_BE_DONOR=true
DONOR_IS_NOT_SOURCE_OF_TRUTH=true
BIG_CATALOG_SELECT_DISCRIMINANT_FEW=true
SEMANTIC_TOKEN_EXPANDS_TO_OWNER_CONTRACT_RECIPE_GATES=true
APPLICABLE_EVIDENCE_REUSE=true
REDUNDANT_REPROOF_WITHOUT_INFORMATION_GAIN=FORBIDDEN
NEW_MATERIAL_CHANGE_OR_DRIFT_OR_CONTRADICTION=REMEASURE
PAPAGAIO_MODE=OFF
```

Algoritmo operacional:

```text
INTENÇÃO
→ INVENTARIAR
→ IDENTIFICAR CAPABILITIES E INVARIANTES
→ SEPARAR CASCA DE FUNÇÃO
→ DEDUPE
→ LOCALIZAR OWNER
→ REUSE | REBIND | EXTEND
→ SELECIONAR POUCAS CAPACIDADES DISCRIMINANTES
→ PARALELIZAR PERCEPÇÃO
→ SERIALIZAR MUTAÇÃO
→ MENOR DELTA COMPLETO
→ EFEITO
→ EVIDÊNCIA APLICÁVEL
→ CONTRAPROVA QUANDO DISCRIMINANTE
→ READBACK
→ RECEITA
→ PRÓXIMA EXECUÇÃO COMEÇA MAIS ALTO
```

Falha de método: reduzir esse padrão a "usar IA", a uma ferramenta específica, ao repo atual ou ao texto literal do CHEFE. A resposta precisa integrar a consequência operacional do que ele ensinou.


## Roteamento por setor antes da ferramenta

### Skills sob demanda — antes da ação, aprendizado depois do efeito

Owner do catálogo: `.agents/skills/`. Owner da seleção por capability:
`.agents/skills/capability-contract-router/SKILL.md`. Skills locais/Hermes são
fontes candidatas; reconciliar com a main atual antes de importar ou substituir.
Agente é executor, skill é receita/capacidade; um não substitui o outro.

```text
SKILL_NEED_EVALUATED_BEFORE_MATERIAL_ACTION=true
SKILL_SELECTION_BY_INTENT_SECTOR_OWNER=true
EXISTING_SKILL_REUSE_BEFORE_CREATE=true
LOADED_SKILL_REUSED_WHILE_CONTEXT_AND_VERSION_APPLY=true
RELOAD_ON_NEED_CONTEXT_OR_VERSION_CHANGE=true
POST_ACTION_SKILL_DELTA_REQUIRES_EVIDENCE=true
NO_NEW_REUSABLE_DELTA=NO_CHANGE
UNPROVEN_RECIPE=CANDIDATE
PARTIAL_EFFECT_IS_NOT_COMPLETE_RECIPE=true
ONE_SKILL_PER_COMMAND_REQUIRED=false
FULL_CATALOG_LOAD_REQUIRED=false
```

```text
INTENÇÃO → SETOR → OWNER → BUSCAR CAPACIDADE EXISTENTE
→ SELECIONAR MENOR CONJUNTO DISCRIMINANTE → CARREGAR SE NECESSÁRIO
→ REUTILIZAR RECEITA APLICÁVEL → EXECUTAR → MEDIR EFEITO
→ DESTILAR CONCLUSÃO + EVIDÊNCIA + LIMITES + FINGERPRINT + ROLLBACK
→ NO_CHANGE | UPDATE_EXISTING | CREATE_IF_GAP_PROVEN
→ TESTE APLICÁVEL → MAIN_READBACK → RECEIPT → PRÓXIMO EXECUTOR HERDA
```

Não recarregar a mesma skill a cada comando nem fabricar uma por ação. Falha útil
pode ser preservada como contraprova; não vira receita de sucesso. Criar exige
gap comprovado e ausência de owner equivalente. Receitas de acesso remoto e seus
limites ficam no owner existente `docs/CONSCIENCIA/05-SSH-VPS.md`.

O método deve aprender **onde cada capacidade mora** e usar o mapa canônico antes de escolher ferramenta, host ou superfície.

```text
SECTOR_ROUTER_REQUIRED=true
SECTOR_ROUTER_OWNER=docs/CONSCIENCIA/MAPA-DO-CEREBRO.md
ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true
ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true
SECTOR_OWNER_UNKNOWN_STAYS_UNKNOWN=true
ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE=true
MULTI_PATH_FAILOVER_BEFORE_GLOBAL_BLOCKED=true
```

Algoritmo:

```text
INTENÇÃO
→ SETOR
→ OWNER CANÔNICO
→ SUPERFÍCIE/RUNTIME ATUAL
→ ROTA VIVA
→ FALLBACK DO MESMO SETOR
→ MENOR DELTA
→ PROVA
```

Exemplos de semântica obrigatória:

```text
"quero ver e mexer na tela"
→ setor REMOTE_INTERACTIVE_GUI
→ AnyDesk se vivo
→ fallback: VNC/Rescue para visual fora de banda
→ SSH/Tailscale podem reparar a GUI, mas não são a própria GUI

"entra na VPS e corrige serviço"
→ setor CONTROL_PLANE
→ SSH/Tailscale SSH
→ AnyDesk é fallback somente se a GUI estiver viva e puder reparar o shell

"máquina sumiu"
→ NÃO concluir MACHINE_DOWN por falha de uma superfície
→ testar PRIVATE_SPINE / CONTROL_PLANE / GUI / OUT_OF_BAND conforme material

"onde fica X?"
→ consultar MAPA-DO-CEREBRO
→ responder owner + superfície + estado, separando canônico de runtime
```

O mapa não congela runtime. IP, PID, sessão, porta e serviço observados entram como receipt invalidável; owner/capability estáveis permanecem no mapa.


