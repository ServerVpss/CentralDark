# Catálogo global de capacidades externas

Owner operacional: `.agents/skills/skill-workshop/`.

Este arquivo descreve o contrato do catálogo; o denominador executável vive em `sources.json`.

| source_id | upstream pinado | modo | uso principal |
|---|---|---|---|
| `claude-skills` | `alirezarezvani/claude-skills@aa8d778811a557a2c28ccadda4cf3d0bd028a4cc` | `index-json` | biblioteca ampla de skills |
| `claude-code-settings` | `feiskyer/claude-code-settings@6e19e61753435cf7b6550bd0f2c4382f24740059` | `skill-tree` | skills de pesquisa, GitHub, imagem, handoff, criação e revisão |
| `anthropic-frontend-design` | `anthropics/claude-code@0fa8c19d50f70f9f383fb6ff5ce5209575267d21` | `skill-tree` | frontend design |
| `reverse-skill` | `zhaoxuya520/reverse-skill@ea582f30d53e4d616881df06a8e0f7e9f661ea21` | `skill-tree` | roteamento e capacidades de segurança/reversing dentro de escopo autorizado |
| `skills-manage` | `iamzhihuix/skills-manage@467d0423beaf71a31c520d4e3795ec88acae5ab2` | `capability-doc` | gestão, descoberta, coleção e importação de skills |
| `repowise` | `repowise-dev/repowise@0c746bd2c44d6329bf565d6e3397fc85ace47d70` | `capability-doc` | inteligência de codebase, risco, testes e destilação de contexto |

## Consumidores

```text
CONSUMER = qualquer IA/agente/modelo da CentralDark
MODEL_LOCK = false
LOAD_POLICY = metadata-first → selected-document → references only if needed
AUTHORITY = unchanged
```

## Recibo mínimo de uso

Quando uma capacidade externa produzir delta material reutilizável, preserve:

```text
source_id
repository
commit
document_path
classification = REUSE_EXISTING | STITCH_DELTA | NEW_GAP | REJECT
test_or_counterproof
result
```

O catálogo mede capacidade disponível; não declara que uma capacidade foi executada só porque apareceu na fonte.
