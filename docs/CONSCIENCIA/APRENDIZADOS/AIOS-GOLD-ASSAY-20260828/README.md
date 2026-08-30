# AIOS/AI-OX Gold Assay — pacote para prova do Hermes

Data: 2026-08-28

Status: `CANDIDATE_EXTERNAL_LEARNING`

```text
INTENT_AUTHORIZED=SEGREDO/CHEFE
MODE=ASSAY_AND_PROOF_PACKAGE
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
RAW_CODE_COPIED=false
EXTERNAL_RUNTIME_CONNECTION=false
THIRD_PARTY_CONTROL_PLANE=false
RED_TEAM_IMPORT=false
AIOS_ORCHESTRATOR_IMPORT=false
AIOS_MCP_IMPORT=false
```

## Destination lock

Garimpar o `ai-ox-core.zip` fornecido pelo SEGREDO/CHEFE e preservar somente deltas que possam reforçar owners já existentes da CentralDark.

O destino NÃO é instalar AIOS, conectar a runtime externo, importar personas/agentes, criar outro MCP, outro orquestrador, outra memória, outro Design System ou outro governo.

```text
AI-OX_RAW
→ INVENTORY
→ ASSAY
→ COUNTERPROOF
→ REUSE | EXTEND | GAP_CANDIDATE | REJECT
→ OWNER_CENTRALDARK_EXISTENTE
→ HERMES_PROVA
→ somente então delta mínimo elegível
```

## Baseline

```text
CENTRALDARK_REPO=ServerVpss/CentralDark
CENTRALDARK_BASE=269a943b9905b907cc421c1036951a4ca6495f01
SOURCE_ARCHIVE=ai-ox-core.zip
SOURCE_ARCHIVE_SIZE_BYTES=452524182
SOURCE_ARCHIVE_SHA256=fd4eebcb50259a198ca4d68a63fc1a9c4445042f47b48e64a036f597c63dd411
ZIP_ENTRIES=49136
ZIP_FILES=43569
FILES_EXCLUDING_NODE_MODULES=3420
DEVELOPMENT_AGENTS=27
DEVELOPMENT_TASKS=197
DEVELOPMENT_WORKFLOWS=15
```

## Ouro candidato

### 1. Dependency Impact Analysis

A fonte possui reverse dependency graph, propagação recursiva de impacto e projeção visual de risco.

A CentralDark já possui inventário/grafo/owners; o candidato não é novo engine. O teste material é verificar se os owners atuais conseguem responder deterministicamente:

`SE X MUDA → QUAIS CONSUMIDORES/OWNERS/GATES SÃO AFETADOS?`

Classificação inicial: `GAP_CANDIDATE_STRONG`, sujeito a dedupe pelo Hermes.

### 2. Design System execution pipeline

A fonte contém token extraction, W3C DTCG export, atomic-layer classification e workflow de build/documentação/qualidade/acessibilidade.

A CentralDark já possui o owner `.agents/skills/visual-design-method/` e design canônico. Portanto:

`AIOS_DESIGN_GOVERNANCE=REJECT`

`TOKEN_EXTRACTION+DTCG+ATOMIC_CLASSIFICATION+WCAG_AUTOMATION=EXTEND_CANDIDATE`

Nenhuma persona `design-chief`, `Brad`, `UX agent` ou governo externo entra.

### 3. IDE/Copilot projection

A fonte projeta definições para superfícies específicas como Claude/Cursor/Windsurf e possui regras para Copilot.

Na CentralDark, modelos/IDEs continuam views/motores substituíveis da mesma SOUL. O ouro candidato é apenas:

`CANONICAL_CENTRALDARK_RULES → GENERATED_IDE_VIEW`

Nunca `IDE_VIEW → AUTHORITY`.

### 4. Session digest pré-compactação

A fonte registra um digest estruturado antes de compactar contexto: sessão, correções do usuário, padrões, axiomas, snapshot, arquivos e comandos.

A CentralDark já possui continuidade, `session-intelligence-harvester`, memory-linker/Dream Review e boot de recuperação. Portanto é `REUSE_OR_EXTEND`, não segundo cérebro.

### 5. Codebase map + migration/orphan inventory

A fonte contém codebase map, path analysis e migration inventory. O ouro possível é reforçar House Inventory/arqueologia com detecção de órfãos, impacto e plano de rollback, sem importar executor de migração.

### 6. Dynamic gate selection

A fonte possui quality-gates e `focus-area-recommender`. CentralDark já possui MetaLupa/Trigger Fabric/gates. O delta útil possível é:

`CHANGE_IMPACT → MATERIAL_GATES_ONLY`

Sem criar novo Judge ou pipeline paralelo.

### 7. Health-check registry

A fonte registra checks por domínio/severidade. CentralDark já tem validadores especializados. O padrão pode servir para normalizar descoberta/registro dos checks existentes, nunca para criar segundo health system.

## Rejeições explícitas

```text
AIOS_ORCHESTRATOR=REJECT
AIOS_AGENT_GOVERNANCE=REJECT
AIOS_MCP_FRAMEWORK=REJECT
AIOS_MEMORY_AS_SECOND_BRAIN=REJECT
RED_TEAM_IMPORT=REJECT
SEMANTIC_MERGE_AS_WRITER=REJECT
THIRD_PARTY_RUNTIME_CONNECTION=REJECT
RAW_PACKAGE_VENDORING=REJECT
```

## Contraprovas encontradas na própria fonte

1. `package.json` declara `validate:structure` apontando para `.aios-core/infrastructure/scripts/source-tree-guardian/index.js`, mas esse caminho não foi encontrado no ZIP medido. `DECLARED != PRESENT`.
2. `test-quality-assessment.js` contém múltiplos métodos que recebem `_content` e referenciam `content`; portanto essa implementação não é ouro confiável sem correção independente.
3. `semantic-merge-engine.js` contém arquitetura de merge multiagente/AI. Isso não recebe caneta na CentralDark; conflito pode ser observado, mas mutação continua serializada.
4. O `LICENSE` do pacote combina Commons Clause Condition v1.0 com texto MIT, enquanto `package.json` declara MIT. Por prudência, nenhum código bruto é copiado.
5. Presença de implementação no ZIP não prova funcionamento, qualidade nem aderência à CentralDark.

## Owners candidatos já existentes

```text
DESIGN_PIPELINE
→ .agents/skills/visual-design-method/

SESSION_DIGEST
→ session-intelligence-harvester + memory-linker/continuidade

DEPENDENCY_IMPACT / MIGRATION_INVENTORY
→ House Inventory + grafo/arqueologia + Trigger Fabric (resolver owner exato antes de escrever)

DYNAMIC_GATE_SELECTION / HEALTH_REGISTRY
→ Trigger Fabric + gates/MetaLupa existentes

IDE_PROJECTION
→ boot/governança canônica como SOURCE; view generator somente se GAP_REAL for provado
```

## Regra de promoção

Nada desta pasta é autorização para implementar automaticamente.

```text
FOUND != ABSORBED
READ != PROVEN
CANDIDATE != GAP_PROVEN
PACKAGE_REGISTERED != IMPLEMENTED
HERMES_TEST_PASS != MERGE_AUTHORIZATION
```

O arquivo `HERMES-PROOF-PLAN.md` define as contraprovas necessárias para transformar cada candidato em `REUSE | EXTEND | GAP_REAL | REJECT`.
