# Hermes Proof Plan — AIOS/AIOX Gold Assay

Este plano não manda Hermes importar AIOS. Ele manda Hermes tentar derrubar cada candidato contra a CentralDark viva.

```text
BOOT=CENTRALDARK_AI_BOOT
SOURCE_CLASS=CANDIDATE_EXTERNAL_LEARNING
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## Fase 0 — reancorar

Antes de qualquer conclusão:

1. remedir `main` e registrar `CURRENT_HEAD`;
2. abrir `LEIA-ME-IA.md`, owners aplicáveis e consumidores reais;
3. verificar PRs/writers concorrentes nos mesmos owners;
4. considerar este pacote histórico se o HEAD já tiver avançado;
5. não escrever nesta fase.

## Prova A — Dependency Impact

Alvo: provar se existe GAP_REAL sobre o House Inventory/grafo/Trigger Fabric.

Fixture mínima:

1. escolher um arquivo/módulo CentralDark com consumidores conhecidos;
2. obter dependências diretas e reversas usando capacidades atuais;
3. propagar consumidores transitivos;
4. resolver owners e gates materialmente afetados;
5. comparar com o comportamento conceitual observado no AIOS.

Saída:

`REUSE_EXISTING | EXTEND_EXISTING | GAP_REAL | REJECT`.

PASS exige que o delta acrescente informação operacional verificável, não apenas uma árvore bonita.

## Prova B — Design Pipeline / DTCG

Owner inicial: `.agents/skills/visual-design-method/`.

1. procurar token extraction, DTCG export e atomic classification já existentes;
2. escolher uma superfície real CentralDark;
3. provar tokens contra fonte canônica;
4. verificar se export DTCG acrescentaria interoperabilidade real;
5. testar classificação de componentes sem substituir a taxonomia/governo atual;
6. mapear WCAG/quality checks para gates existentes.

Bloquear criação de novo Design System, nova persona ou workflow paralelo.

## Prova C — IDE/Copilot Projection

1. inventariar views atuais de Copilot/Claude/Cursor/Windsurf/Hermes;
2. localizar a fonte canônica que cada view deveria refletir;
3. medir drift semântico entre canônico e views;
4. provar se um gerador determinístico reduziria drift;
5. se houver GAP, desenhar uma única projeção subordinada ao canônico.

Contraprova obrigatória:

`GENERATED_VIEW_IS_AUTHORITY=false`.

## Prova D — Session Digest

Owners candidatos: session-intelligence-harvester + memory-linker/continuidade.

1. abrir schemas/receipts atuais;
2. comparar campos úteis: correções humanas, padrões, aprendizado, snapshot, arquivos modificados, comandos/eventos;
3. rejeitar duplicação e conversa/raciocínio bruto;
4. provar consumidor real do delta antes de acrescentar campo;
5. preservar temporalidade: digest antigo não vira estado atual.

## Prova E — Migration/Orphan Inventory

1. escolher fixture controlada contendo arquivo/capacidade órfã conhecida;
2. medir se House Inventory/arqueologia já detectam;
3. exigir origem, consumidores, owner e decisão `KEEP|REVALIDATE|ABSORB|DROP_CANDIDATE`;
4. gerar plano de rollback sem executar migração;
5. provar que `STALE != DELETE`.

## Prova F — Dynamic Gate Selection

1. selecionar três deltas reais de naturezas distintas;
2. listar gates obrigatórios atuais;
3. derivar gates materiais pela superfície/owner/impacto;
4. garantir que seleção dinâmica nunca suprima gate obrigatório;
5. comparar custo e cobertura.

PASS somente se reduzir ritual sem reduzir prova.

## Prova G — Health Registry

1. inventariar validadores/checks atuais da Casa;
2. verificar se já existe registro/descoberta suficiente;
3. identificar duplicatas e checks sem owner/consumer;
4. provar ganho material de metadados comuns como `id/domain/severity/target/test`;
5. não criar segundo health engine.

## Contraprova da fonte

Hermes também deve reproduzir, se possuir os bytes-fonte locais autorizados:

```text
ZIP_SHA256=fd4eebcb50259a198ca4d68a63fc1a9c4445042f47b48e64a036f597c63dd411
FILES_EXCLUDING_NODE_MODULES=3420
DEVELOPMENT_AGENTS=27
DEVELOPMENT_TASKS=197
DEVELOPMENT_WORKFLOWS=15
```

E confirmar:

- caminho `source-tree-guardian/index.js` declarado no package não materializado no ZIP medido;
- bug `_content` versus `content` em `test-quality-assessment.js`;
- licença composta observada no arquivo `LICENSE`.

Se os bytes não estiverem disponíveis no ambiente Hermes, classificar `SOURCE_BYTES_UNAVAILABLE`, nunca fabricar PASS.

## Receipt obrigatório

```text
CURRENT_HEAD=
SOURCE_ARCHIVE_SHA256=
SOURCE_BYTES_AVAILABLE=YES|NO
OWNERS_OPENED=
CONSUMERS_OPENED=

DEPENDENCY_IMPACT=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
DESIGN_PIPELINE=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
IDE_PROJECTION=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
SESSION_DIGEST=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
MIGRATION_ORPHAN=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
DYNAMIC_GATES=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN
HEALTH_REGISTRY=REUSE|EXTEND|GAP_REAL|REJECT|UNKNOWN

SECOND_SYSTEM_CREATED=NO
RAW_AI0S_CODE_COPIED=NO
THIRD_PARTY_CONNECTION=NO
RED_TEAM_IMPORTED=NO
COUNTERPROOF=
UNKNOWN=
RECOMMENDED_MINIMUM_DELTA=
FIXED_POINT=
```

`FIXED_POINT=TRUE` apenas quando todos os candidatos materiais tiverem classificação provada e UNKNOWN material for zero. Isso não autoriza implementação ou merge por si só.
