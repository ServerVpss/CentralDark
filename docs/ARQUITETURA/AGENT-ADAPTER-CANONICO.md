# Agent Adapter Canônico — muitos motores, uma Casa

Status: CANDIDATE
Owner: JARVIS / orquestração canônica
Intenção: SEGREDO/CHEFE

## Objetivo

Absorver capacidades úteis de agentes externos sem instalar um segundo cérebro, segundo promotor, segunda fila ou nova autoridade.

```text
EXTERNAL_AGENT
→ ADAPTER
→ CENTRALDARK_BOOT
→ READ/TEST/PROPOSE
→ EVIDENCE_ENVELOPE
→ DEDUPE
→ OWNER + WRITER_SCOPE
→ SINGLE_WRITER
→ SAME_TARGET_PROOF
→ AUTONOMIA_PROMOCAO
→ MAIN
```

## Fontes mineradas

- OpenHands: SDK composável, execução local/remota, workspaces efêmeros e escala multiagente.
- Aider: mapa do codebase, Git nativo, lint/test após edição e commits pequenos.
- SWE-agent: issue → investigação → edição → teste em ambiente isolado, configuração explícita e agente-computer interface.

Essas fontes são proveniência de capacidade, não autoridade da Casa.

## Ouro absorvido

```text
AGENT_IS_ENGINE_NOT_AUTHORITY=true
EXTERNAL_PERSONA_IGNORED=true
CENTRALDARK_BOOT_REQUIRED=true
REUSE_BEFORE_CREATE=true
EPHEMERAL_WORKSPACE_PREFERRED=true
REPO_MAP_BEFORE_EDIT=true
ISSUE_OR_CLAIM_BOUND_TASK=true
TEST_AFTER_MUTATION=true
LINT_WHEN_APPLICABLE=true
SMALL_DIFF_PREFERRED=true
EVIDENCE_ENVELOPE_REQUIRED=true
PARALLEL_PERCEPTION_ALLOWED=true
PARALLEL_MUTATION_SAME_SCOPE=false
ONE_WRITER_PER_SCOPE=true
MODEL_VOTE_FORBIDDEN=true
REALITY_IS_JUDGE=true
NO_DIRECT_MAIN_FROM_AGENT=true
NO_DEPLOY_WITHOUT_SCOPE_AUTHORIZATION=true
NO_SECRET_EXFILTRATION=true
CANONICAL_PROMOTION_ONLY=true
```

## Contrato do adapter

Qualquer OpenHands, Aider, SWE-agent, Codex, Claude Code, Gemini, Copilot ou motor futuro deve entrar por este contrato lógico:

1. carregar `LEIA-ME-IA.md` e owners exigidos;
2. medir repo, branch, HEAD, PR, runtime e tools reais;
3. declarar `ROLE`, `WRITER`, `WRITER_SCOPE` e `TARGET`;
4. se outro Writer possuir o escopo, operar `READ_ONLY` e produzir somente evidência/delta;
5. trabalhar em workspace/branch isolado quando for Writer autorizado;
6. antes de editar, mapear arquivos/consumidores/testes e reutilizar owners existentes;
7. depois de editar, executar testes/lint/build aplicáveis no mesmo HEAD;
8. emitir envelope mínimo de evidência;
9. publicar delta no GitHub para consumo dos demais braços;
10. promoção somente pelo fluxo canônico `.github/workflows/autonomia-promocao.yml`.

## Envelope mínimo

```text
ENGINE=
ROLE=
TARGET=
OPERATIONAL_SCOPE=
WRITER=
WRITER_SCOPE=
BASE_SHA=
HEAD_SHA=
CLAIM=
EVIDENCE_REF=
TESTS=
CLASS=FACT|INFERENCE|HYPOTHESIS|UNKNOWN
DELTA_FINGERPRINT=
```

## Anti-caos

Mais agentes aumentam percepção, não autoridade nem quantidade de canetas.

```text
N_AGENTS
→ N_HYPOTHESES
→ N_TESTS
→ NORMALIZE
→ DEDUPE
→ CONTRAPROVA
→ DELTA_MATERIAL
→ ONE_WRITER
```

Mesma ferida reformulada não cria missão nova. Resultado de agente só vira entrada canônica após evidência. `PENDING|SKIPPED|UNKNOWN != PASS`.

## Critério de adoção de um motor

Um motor novo só merece integração física quando provar ganho sobre capacidades existentes em pelo menos uma dimensão aplicável: cobertura, latência, custo, isolamento, qualidade de patch, taxa de regressão ou capacidade de ferramenta. Sem ganho provado, usar como braço eventual/manual e não aumentar a superfície operacional.

## Não fazer

- não copiar arquitetura externa inteira;
- não instalar OpenHands/Aider/SWE-agent só porque existem;
- não dar token amplo ou segredo ao browser/agente;
- não permitir push direto na main;
- não criar outro auto-merge/promotor;
- não permitir dois Writers no mesmo escopo;
- não transformar quantidade de agentes em votação de verdade.

## Fixed point

```text
CAPACIDADE_EXTERNA
→ REUSE_EXISTING | STITCH_DELTA | NEW_GAP
→ TESTE
→ PROVA
→ ABSORVER_NO_OWNER_CANONICO | NO_CHANGE
```
