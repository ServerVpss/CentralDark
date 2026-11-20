# root-file-contract-router

Skill reutilizável por qualquer agente para descobrir, validar e rotear uso dos arquivos na raiz do CentralDark.

## Quando usar

- Antes de criar arquivo novo na raiz
- Para descobrir qual arquivo raiz cumpre determinada função
- Para validar que um model router aponta para LEIA-ME-IA.md
- Para verificar se um arquivo está registrado no contrato

## Fontes canônicas

```text
REGISTRY_JSON=ROOT-FILE-REGISTRY.json
REGISTRY_MD=ROOT-FILE-REGISTRY.md
YAML_BINDING=root-file-binding.yaml
LIBRARY_INDEX=.agents/library-index.json
GIT_HOOK=.githooks/pre-commit-root-contract.sh
```

## Categorias de arquivos raiz

```text
core             → Boot obrigatório. LEIA-ME-IA.md, AGENTS.md, CLAUDE.md, etc.
model_routers    → Adaptadores por engine. CHATGPT.md, CODEX.md, GEMINI.md, GROK.md, etc.
operational_docs → Handoff, contingência, fluxos, instalação.
security_scripts → Varredura, recon, leak detection.
monitoring_scripts → Monitores, visualizadores de logs.
utility_scripts  → Análise, scheduling, testes, probes.
build_config     → Node/Vite/PM2 padrão. Registro simples.
ide_config       → VSCode, CodeRabbit, Graphify.
legacy_backup    → Backups e configs antigos. Não recebem código novo.
```

## Fluxo: criar arquivo novo na raiz

```text
1. VERIFICAR se já existe arquivo com mesma função → REUSE_BEFORE_CREATE
2. ESCOLHER categoria → consultar ROOT-FILE-REGISTRY.json
3. ADICIONAR entrada no ROOT-FILE-REGISTRY.json na categoria correta
4. ADICIONAR entrada correspondente no ROOT-FILE-REGISTRY.md
5. SE model_router → DEVE apontar para LEIA-ME-IA.md como core
6. SE core → requer aprovação do SEGREDO/CHEFE
7. COMMIT → pre-commit hook valida registro
```

## Fluxo: descobrir arquivo por função

```text
1. LER ROOT-FILE-REGISTRY.json
2. BUSCAR por role ou categoria
3. SE encontrado → usar path do registro
4. SE não encontrado → arquivo não existe no contrato
   → NÃO criar fora do contrato
   → REGISTRAR primeiro, depois criar
```

## Fluxo: validar model router

```text
1. LER conteúdo do .md
2. VERIFICAR referência a LEIA-ME-IA.md
3. VERIFICAR que NÃO define: identidade, autoridade, merge policy, memória
4. FLAGS esperadas:
   CANONICAL_AGENT_CORE=LEIA-ME-IA.md
   ADAPTER_ROLE=AUTOLOAD_POINTER_ONLY
   DO_NOT_DUPLICATE_GOVERNANCE=true
```

## Regras invariantes

```text
REUSE_BEFORE_CREATE=true
NEW_ROOT_FILE_REQUIRES_REGISTRY=true
MODEL_ROUTER_MUST_POINT_TO_CORE=true
CORE_IMMUTABLE_WITHOUT_CHEFE=true
LEGACY_NO_NEW_CODE=true
ONE_REGISTRY_ONLY=true (não criar segundo registro paralelo)
```

## Integração com library-index.json

O `library-index.json` em `.agents/` referencia este skill e o ROOT-FILE-REGISTRY.json como canonical_source. Qualquer extensão do registro deve ser refletida em ambos.

## Gate mensurável das 5 superfícies

Exigir antes de declarar íntegro:

ROOT_FILE_REGISTRY_MD=PASS
ROOT_FILE_REGISTRY_JSON=PASS
ROOT_FILE_BINDING_YAML=PASS
ROOT_FILE_ROUTER_SKILL=PASS
ROOT_FILE_PRECOMMIT_HOOK=PASS
LIBRARY_INDEX_V1_2_0=PASS

Falhou qualquer linha: corrigir a própria superfície; não criar registro paralelo; ONE_REGISTRY_ONLY=true.
