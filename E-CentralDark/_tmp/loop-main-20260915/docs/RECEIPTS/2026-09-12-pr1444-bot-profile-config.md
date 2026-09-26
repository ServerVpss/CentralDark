# Receipt — PR #1444 · Bot Profile = View, não processo

- PR-mãe: `#1444`
- Branch owner: `reconcile/garimpo-one-site-one-mcp-admin-20260906`
- HEAD observado antes do delta: `f78e19b5acd7b749723a7f65314a1c9090731437`
- Owner estendido: `.agents/skills/centraldark-operational-method/SKILL.md`
- Arquitetura paralela criada: `NÃO`

## Delta cristalizado

`PROFILE != PROCESS != PID != OWNER != GOVERNANCE`.

Bot Profile passa a ser configuração: nome/rótulo/persona + especialização + capabilities + skills + tools + routines, sempre sobre owners/workers existentes.

Runtime: `BOT_PROFILE -> CAPABILITY_ROUTER -> OWNER_EXISTENTE -> WORKER_POOL_EXISTENTE -> ONE_WRITER_PER_SCOPE -> EVIDENCE -> REALITY_JUDGE`.

Processo/PID novo só é admissível se uma capability realmente exigir isolamento/runtime próprio e a ausência de owner/worker equivalente for provada.

## Prova esperada

- `git diff --check` = PASS
- regra localizada no owner existente = PASS
- nenhum novo router/skill/daemon = PASS
- push deve atualizar diretamente o HEAD do PR #1444
