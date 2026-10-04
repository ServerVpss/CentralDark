# 2026-10-04 — Porta de Entrada — reconciliação dos erros observados

## Fonte da falha

Run observado na porta de entrada:

```text
workflow: ⚙️ porta-de-entrada
run medido: 37226933949
head medido: 81eae8bb22
```

Falhas materiais observadas:

```text
GLOBAL_LEARNING_LINEAGE=FAIL
APRENDIZADOS_GLOBAL_LINEAGE_PROJECTION_DRIFT
LINEAGE_MANIFEST_DRIFT
159:NEXT_EXPECTED_160
161:NEXT_EXPECTED_162
162:NEXT_EXPECTED_163
SOUL_STALE: AGENTS.md
SOUL_STALE: LEIA-ME-IA.md
```

O mesmo run também reportou mapa canônico desatualizado para a frente do PR-Agent e um caminho duplicado de skill:

```text
.agents/skills/skills/devops/sdlc-review/SKILL.md
```

## Correções aplicadas no CURRENT

- Reconciliação das âncoras `SOUL_SYNC_ANCHOR` com os blobs atuais de `AGENTS.md`, `LEIA-ME-IA.md` e `CLAUDE.md`.
- Registro explícito dos tokens `AI_UNIVERSAL_ENTRYPOINT`, contrato JARVIS e `CENTRALDARK_AI_BOOT` nos consumidores `AGENTS.md` e `CLAUDE.md`.
- Remoção da cópia duplicada idêntica `.agents/skills/skills/devops/sdlc-review/SKILL.md`; o owner canônico permanece `.agents/skills/devops/sdlc-review/SKILL.md`.
- A projeção/manifesto de linhagem e os backlinks numéricos foram rechecados no estado atual.

## Provas locais após o delta

```text
verify_repo_contract.py: PASS
REPO_CONTRACT_VERIFY=PASS
GLOBAL_LEARNING_LINEAGE=PASS sections=163 genesis=L000
validar-mapa.mjs: PASS
map errors: 0
git diff --check: PASS
```

A prova local não substitui o run remoto; o workflow precisa consumir o novo HEAD.

## Commit

```text
44b441ffa3d712fe56d771cc80b5f7f4025a65d2
```

`origin/main` foi confirmado nesse SHA.

## Modelo/worker invariants

```text
MODEL_IS_ENGINE=true
MODEL_IS_NOT_IDENTITY=true
ORCHESTRATOR=HERMES_CURRENT_SELECTED_MODEL
LOCAL_WORKER=CENTRALDARK_CURRENT_LOCAL_MODEL
RESOLVE_BINDINGS_AT_START_OF_EACH_LOTE=true
CONSUMERS_MUST_NOT_HARDCODE_MODEL_NAMES=true
HERMES_IS_EXECUTION_PLANE=true
LOCAL_AI_IS_COGNITIVE_WORKER=true
REALITY_IS_JUDGE=true
```

## Next cursor

`medir novo run porta-de-entrada no HEAD 44b441ff → confirmar REPO_CONTRACT/PASS e mapa PASS → medir autonomia-promocao sem fila falsa → retomar PR-Agent local → Self-Evolution`
