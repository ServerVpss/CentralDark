# CentralDark Micro Deploy por PASS comprovado

Regra canônica operacional:

`QUALQUER_PASS_COMPROVADO → MICRO_DEPLOY_DO_ESCOPO_AFETADO → HEALTH/PROVA_RUNTIME → RECEIPT → NEXT_TIK_TAK`

## O que conta como PASS

- Health real retornando 200 no runtime medido.
- Socket/serviço vivo quando o escopo declarado é socket/serviço.
- Systemd/PM2 ativo com owner conhecido quando o escopo declarado é processo supervisionado.
- Receipt local ou GitHub com timestamp, rota, head e resultado.

## O que não conta como PASS

- Badge visual isolado.
- `action_required`.
- PR aberto sem promoção.
- Source alterado sem runtime medido.
- UNKNOWN.

## Cadeado

Micro-deploy é por escopo afetado. Falha em rota separada, como `:8099`, não bloqueia rotas independentes já provadas, mas também não vira verde.

## Padrão oficial — CENTRALDARK LIVE EDITING FABRIC

O modo normal da CentralDark é editar, colocar vivo, medir, refinar, comprimir e repetir até ponto fixo.

- humano: `CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- skill: `.agents/skills/centraldark-live-editing-fabric/SKILL.md`
- hook: `scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh`

Regra: `MVP_FAST_LOOP` é padrão de trabalho. CI profundo é prensa/contraprova prolongada quando o CHEFE mandar, não freio padrão para colocar delta vivo.

## Fallback oficial — MAIN-PINNED RUNTIME FAST-PATH

Quando o deploy canônico estiver `FAIL` ou `BLOCKED` antes da promoção, usar a receita já provada:

- humano: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md`
- máquina: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json`
- binding: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml`
- skill: `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`
- hook: `scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh`

Regra: mesmo SHA da main, owner exato, fileset causal, teste aplicável, restart isolado, health/prova runtime e receipt #1562.
