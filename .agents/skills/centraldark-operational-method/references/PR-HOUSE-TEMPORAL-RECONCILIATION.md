# PR ↔ Casa — Reconciliação Temporal Obrigatória

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`

Este arquivo é uma **reference do owner existente**. Não cria nova skill, novo cérebro, novo workflow ou nova autoridade.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
HOUSE_POLICY > PROFILE_POLICY
UNKNOWN != PASS
HISTORY != CURRENT_STATE
FUTURE != CURRENT_STATE
```

## 1. Gatilho automático obrigatório

A skill `centraldark-operational-method` é obrigatória quando ocorrer qualquer um dos eventos abaixo:

- abrir, editar, revisar, sincronizar, reabrir ou preparar merge de qualquer PR de `ServerVpss/CentralDark`;
- executar missão local da Casa que toque código, Git, GitHub, MCP, Hermes, Screenpipe, runtime, memória, agentes, jobs, workflows ou arquitetura CentralDark;
- receber no Hermes local uma missão derivada de PR/commit/issue do repositório;
- detectar no repositório uma mudança que altere owner, contrato, skill, trigger, runtime esperado ou continuidade da Casa.

A ativação é bidirecional:

```text
PR / REPO
  ↓
LOAD centraldark-operational-method
  ↓
RECONCILE COM CASA LOCAL

CASA LOCAL
  ↓
LOAD centraldark-operational-method
  ↓
RECONCILE COM REPO / PR VIVO
```

Não é permitido profile, modelo ou interface substituir o owner canônico.

## 2. Lente temporal: passado, presente e futuro

A skill deve olhar os três tempos **sem misturá-los**.

### PASSADO — preservado, nunca soberano

Medir/consultar quando material:

- ancestry Git;
- commits anteriores;
- PRs mergeados e fechados sem merge;
- receipts, ledgers e aprendizados;
- histórico local da Casa;
- Dream Review / Memory Dream;
- deltas já provados ou rejeitados.

Classificação mínima:

```text
CURRENT
ABSORBED
SUPERSEDED
REJECTED
HISTORICAL
UNKNOWN
```

`PASSADO != PRESENTE`.

### PRESENTE — sempre medido

Antes de governar qualquer ação:

```text
repo
branch
HEAD
base/main
PR
worktree
writer
PIDs/ports quando runtime importar
owners
skills disponíveis
credenciais apenas como PRESENTE|AUSENTE, nunca valor
```

`ESTADO_VIVO_RECENTE vence narrativa histórica para claims de estado atual.`

### FUTURO — condicionado, nunca adivinhado

“Ver o futuro” significa mapear **consequências e próximos estados condicionais**, não declarar previsão como fato.

Pode usar:

- PRs/branches ainda não promovidos;
- jobs e schedules realmente registrados;
- próximos passos do receipt;
- dependências e efeitos previstos por contrato;
- cenários adversariais;
- rollback;
- `NEXT_CURSOR`;
- estado desejado formalizado.

Classificar como:

```text
PLANNED
CONDITIONAL
PENDING_PROOF
BLOCKED
UNKNOWN
```

`FUTURO != PRESENTE` e `PREVISÃO != PROVA`.

## 3. Control Loop obrigatório

Delta útil reconciliado das referências históricas da Casa:

```text
CURRENT_STATE
→ DESIRED_STATE
→ DELTA_MÍNIMO
→ ACT
→ OBSERVE
→ COUNTERPROVE
→ RECUR_CONDITION
→ CONTINUE | HUMAN_FRONTIER | FIXED_POINT
```

Não usar Raw Loop em legado/produção quando a malha de controle resolve melhor.

Antes de chamar modelos caros ou abrir fan-out, preferir prova determinística disponível: Git, schema, AST/parser, lint, tests, hashes, process table e APIs de estado.

## 4. Personas são capacidades, não autoridades

Quando úteis, o orquestrador pode distribuir percepção por funções equivalentes a:

- **Construtor** — implementa o menor delta e prova;
- **Guardião** — procura regressão, segurança e tenta reprovar;
- **Estrategista** — sintetiza, mede convergência e preserva o fio.

As personas podem mudar de motor/modelo. A autoridade não muda.

```text
CHEFE = intenção e fronteira humana
SOL = coordenação quando presente
HERMES/PIVETE = execução/preservação/continuidade
REALITY_JUDGE = evidência observável
```

## 5. Memória evolutiva sem transformar memória em realidade

O delta útil de Memory Dream/Dream Review é:

```text
ORIENTAR
→ COMPARAR MEMÓRIA x EVENTOS
→ PROPOR DELTAS COM PROVENIÊNCIA
→ APLICAR APENAS BAIXO RISCO/OWNER CORRETO
→ TESTAR
→ CONTRAPROVAR
→ PROMOVER OU REJEITAR
```

GraphRAG, memória, índices e painéis são superfícies derivadas. Não substituem o estado vivo.

## 6. Sincronização autônoma Casa ↔ Repositório

### Repo → Casa

Ao iniciar missão local relacionada à CentralDark:

1. localizar clone/worktree canônico;
2. medir branch/HEAD;
3. resolver `.agents/skills/centraldark-operational-method/SKILL.md`;
4. registrar SHA observado da skill;
5. carregar esta reference quando a missão envolver PR, histórico, continuidade ou planejamento;
6. se a cópia local divergir, classificar `DRIFT` e reconciliar antes de tratá-la como canônica.

### Casa → Repo

Se a Casa aprender um delta reutilizável:

1. exigir erro/fato + causa + correção + teste/contraprova;
2. deduplicar contra o owner do repo;
3. produzir candidato no owner existente;
4. levar pelo PR/writer vigente;
5. nunca transformar aprendizado local em regra global apenas por memória.

### Após merge

Na próxima missão local:

```text
MAIN_HEAD_NEW
→ reload skill owner
→ compare previous skill SHA
→ apply only proven delta
→ preserve mission continuity
```

## 7. Gate mínimo para qualquer PR

Todo PR direcionado a `main` deve carregar no próprio contexto/receipt:

```yaml
CENTRALDARK_SKILL_GATE:
  owner: .agents/skills/centraldark-operational-method/SKILL.md
  required: true
  skill_sha_observed: <sha-ou-UNKNOWN>
  repo_head_observed: <sha>
  base_head_observed: <sha>
  past_reconciled: true|false|UNKNOWN
  present_measured: true|false
  future_classified: true|false|UNKNOWN
  house_repo_drift: NONE|DRIFT|UNKNOWN
  writer: <writer-ou-NONE>
  verdict: PASS|BLOCKED|UNKNOWN
```

`PASS` exige que o owner tenha sido localizado no HEAD analisado e que presente/HEAD tenham sido medidos. Declaração no body sozinha não prova execução.

## 8. Deltas úteis reconciliados das fontes históricas

### Autoevolução Mental do Pivete — Hermes e CentralDark

Preservar:

- CentralDark e Hermes como ambientes complementares;
- preservar/evoluir o existente antes de criar paralelo;
- `Construtor + Guardião + Estrategista` como divisão funcional enxuta;
- Técnica da Lupa: Zoom Out → Zoom In → Feynman → Autolupa;
- projetos inacabados entram em inventário/reconciliação, não descarte cego;
- erro só vira experiência com identidade, evidência, correção, contraprova e retenção;
- sem denominador, não inventar porcentagem.

### Curso Completo de Orquestração de Agentes com Hermes e Personas Especialistas

Preservar somente o delta compatível com a Casa atual:

- Control Loop de reconciliação de estado;
- especialistas sob demanda, não fan-out automático;
- AST/análise determinística antes de raciocínio caro quando aplicável;
- Memory Dream em orientação → comparação → proposta → aplicação segura;
- segurança por identidade/escopo e sandbox;
- Enxame Ômega apenas para complexidade material, com fan-out → crítica cruzada → consolidação/julgamento.

Não importar literalmente persona histórica, ferramenta externa ou afirmação de autoridade que conflite com a governança atual.

### Histórico MCP / Hermes local

Falhas históricas observadas servem como fixtures de contraprova, não como estado atual:

- URL MCP malformada (`hhttps`) já ocorreu historicamente;
- MCP pode estar configurado e ainda registrar `0 tool(s)`;
- conexão pode estacionar após retries;
- `MCP_CONFIGURED != MCP_TOOL_INVOCATION_PROVEN`;
- PATH/CLI e bindings de autenticação devem ser medidos na sessão atual;
- segredos nunca entram em PR, log, skill ou receipt em texto bruto.

O snapshot estrutural `CentralDark-Arvores.zip`, gerado em 2026-08-22, prova historicamente que `E:\CentralDark\hermes-mcp-centraldark-fixed.bat` existia naquele snapshot (aprox. 3,01 KiB, modificado em 2026-08-20 14:02:20). O ZIP não contém os bytes desse BAT, portanto:

```text
HISTORICAL_PATH_EXISTENCE=PROVEN
CURRENT_PATH_EXISTENCE=UNKNOWN
BAT_CONTENT=UNKNOWN
BAT_BEHAVIOR=UNKNOWN
```

O arquivo `hermes-mcp-centraldark-fixed(1).bat` continua não localizado nas fontes medidas desta rodada.

## 9. Delta útil dos pacotes de Casa / auditoria / cleanup

Os três ZIPs entregues nesta reconciliação são **fontes históricas**, não estado vivo. Seus SHA-256 de ingestão desta rodada são:

```text
CentralDark-Arvores.zip
SHA256=a7ae1466976733bc76e1906ce5958b267a0648d87b6af8195d740738ff413fdb

CentralDark-Cleanup-ProofDriven-20260824-114754.zip
SHA256=3ac861fa672aa065edc9a62bb53b96f2099f68dccfb3b95c740778aca2b94233

CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24.zip
SHA256=6b29c83c734cad95ef5a31484ed0d1bff24ee64eb38e5c461ac1ab87a42a9eb4
```

### 9.1 Árvore histórica = mapa de busca, não runtime atual

O snapshot `CentralDark-Arvores.zip` declara `ROOT=E:\CentralDark` e `GENERATED=2026-08-22 20:50:54`. Ele mostra que já existiam, naquela data, owners/matéria relacionados a:

- `centraldark-operational-method`;
- `hermes-regenerative-runtime.md`;
- `kimetsu-legacy-fixed-point-predicate.md`;
- `regenerative-self-refinement-engine.md`;
- `GraphRAG-Master`;
- `hermes-mcp-centraldark-fixed.bat`.

Consequência operacional:

```text
TREE_SNAPSHOT → SEARCH_HINT
TREE_SNAPSHOT != CURRENT_RUNTIME
TREE_SNAPSHOT != CURRENT_FILE_CONTENT
HISTORICAL_OWNER_FOUND → RECONCILE_BEFORE_CREATE
```

### 9.2 Fluxo bidirecional recuperado

O pacote recuperado de 2026-08-24 preserva uma regra que complementa esta reference:

```text
LOCAL_FIRST
→ READ_ONLY_DISCOVERY
→ CLASSIFY
→ FIND_REAL_OWNER
→ ABSORB_USEFUL_DELTA
→ COUNTERPROVE
→ RECONCILE_HOUSE_REPO
```

Durante descoberta local:

```text
PATH_FOUND != PATH_ACTIVE != DEVE_SER_MOVIDO
RECOVERY_PATH != MIGRATION_AUTHORIZATION
```

Portanto:

- `E:\CentralDark` é Casa/alvo de reconciliação, mas não licença para mover tudo para lá;
- estado obrigatório de aplicativo pode permanecer em AppData/perfil quando o consumidor real exigir;
- junction/symlink exige target provado antes de qualquer decisão;
- descoberta não inclui `git pull`, `git push`, `git reset`, deploy, move ou delete;
- mutação só começa depois de owner, consumidor, identidade/hash, rollback e Writer serem reconciliados.

O próprio pacote recuperado declara que **não é reconstrução byte-a-byte** do ZIP histórico de 2026-07-28. Logo:

```text
RECOVERED_CONTINUITY != BYTE_IDENTITY
HISTORICAL_SHA_REFERENCE != CURRENT_PACKAGE_IDENTITY
```

### 9.3 Cleanup proof-driven

O pacote de cleanup não deve ser importado como nova ferramenta paralela por padrão. O delta reutilizável é a política de segurança:

```text
SAME_NAME != DUPLICATE
AUDIT_HASH_ALONE != DELETE_AUTHORITY
LIVE_REPROOF_REQUIRED=true
ACTIVE_RUNTIME_DELETE=false
DIRTY_GIT_DELETE=false
UNKNOWN != PASS
```

Para material candidato a remoção:

```text
CANDIDATE
→ REPROVE SOURCE HASH
→ PROVE IDENTICAL HOUSE COPY
→ PROVE DESTINATION IS NOT BACKUP/QUARANTINE/TEMP/FORENSIC
→ PROVE NOT IN USE
→ PROVE NOT GIT/REPARSE/SENSITIVE
→ DELETE_SAFE | QUARANTINE_REVERSIBLE | PRESERVE | UNKNOWN
```

Quarentena só é admissível para material comprovadamente dormente; eliminação final de quarentena exige decisão explícita e ocorre depois de teste de estabilidade.

Números históricos de arquivos/bytes do audit de 2026-08-24 permanecem **HISTORICAL** e não podem governar cleanup atual sem nova medição.

### 9.4 Classificação mínima da Casa

Ao reconciliar artefatos físicos locais, usar pelo menos:

```text
ACTIVE
COMPATIBILITY
HISTORICAL
BACKUP
CANDIDATE
UNKNOWN
```

E preservar por default quando a prova ainda não fechou:

- owners canônicos;
- receipts e histórico Git;
- configs/runtime com consumidor ativo;
- junctions/symlinks sem target provado;
- material ainda não inventariado;
- qualquer item `UNKNOWN`.

## 10. Fixed Point

A reconciliação temporal desta skill encerra quando:

```text
PAST_MATERIAL_RECONCILED=true
PRESENT_MEASURED=true
FUTURE_NOT_PROMOTED_TO_FACT=true
HOUSE_REPO_DRIFT=NONE|PROVEN_HUMAN_FRONTIER
ONE_WRITER_PER_SCOPE=true
NO_USEFUL_DELTA_LEFT_BEHIND=true
NO_NEW_INFORMATION=true
```

Fixed point fecha a missão atual; não desliga aprendizado futuro.
