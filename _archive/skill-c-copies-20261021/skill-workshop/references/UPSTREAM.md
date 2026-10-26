# Upstream — alirezarezvani/claude-skills

Fonte externa pinada para mineração da `skill-workshop`.

```text
repository=alirezarezvani/claude-skills
commit=aa8d778811a557a2c28ccadda4cf3d0bd028a4cc
license=MIT
index=.codex/skills-index.json
```

## O que a fonte declara

No README do commit pinado, o projeto se apresenta como biblioteca multi-tool para Claude Code, OpenAI Codex, Gemini CLI, Hermes Agent, Mistral Vibe, Cursor, Aider, Windsurf e outros. O README declara 362 skills, 102 agents, 116 commands, 644 scripts Python e 741 arquivos de referência, distribuídos por 18 domínios principais.

O `.codex/skills-index.json` do mesmo commit declara `total_skills: 360`. A CentralDark preserva essa diferença como `SOURCE_METADATA_DISAGREEMENT`; não escolhe um dos dois números como verdade universal nem usa isso como placar.

## Domínios publicados no README

- Engineering — Core
- Engineering — POWERFUL
- Product
- Marketing
- Productivity
- Research (academic)
- Research Operations
- Project Management
- Regulatory & QM
- Compliance OS
- C-Level Advisory
- Business & Growth
- Business Operations
- Commercial
- Finance
- Loop Library
- Markdown → HTML
- Marketing top-level / landing

## Capacidade que interessa à Casa

A fonte já oferece um índice com `name`, `source`, `category` e `description`. Isso permite descoberta progressiva sem copiar centenas de pastas. A `skill-workshop` usa esse índice para localizar a peça candidata e só então abre o `SKILL.md` correspondente.

O próprio upstream recomenda progressive disclosure em `write-a-skill`: descrição com trigger claro, `SKILL.md` conciso e scripts apenas para operações determinísticas/repetidas. Esse padrão foi absorvido na forma da `skill-workshop`, sem transformar a fonte em autoridade da Casa.

## Fronteiras

```text
UPSTREAM_CONTENT=EXTERNAL_INPUT
UPSTREAM_LICENSE=MIT
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
SAFE_TO_INSPECT != SAFE_TO_EXECUTE
PERSONA != HOUSE_IDENTITY
FOREIGN_AGENT_PROTOCOL != HOUSE_GOVERNANCE
COPY_MATERIAL_BYTES -> PRESERVE_LICENSE_AND_ATTRIBUTION
LEARNED_PATTERN -> ABSORB_MINIMAL_PROVEN_DELTA
```

A atualização do pin é uma mudança de dependência: deve medir o novo commit, comparar índice/estrutura, procurar regressão e só então trocar o SHA.
