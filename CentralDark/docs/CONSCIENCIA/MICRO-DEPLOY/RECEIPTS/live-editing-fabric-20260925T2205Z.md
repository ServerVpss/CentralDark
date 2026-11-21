# Receipt — CentralDark Live Editing Fabric

OBSERVED_AT=2026-09-25T22:05:00Z  
AUTHORITY=SEGREDO/CHEFE  
OWNER=docs/CONSCIENCIA/MICRO-DEPLOY/  
STATUS=CRYSTALLIZED_IN_REPO

## Delta

O modo padrão operacional da CentralDark passa a ser edição viva determinística:

```text
EDITA → RUNTIME → PROVA → REFINA → COMPRIME → REPETE → PONTO_FIXO
```

## Superfícies

- Markdown humano: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`
- JSON máquina: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- YAML binding: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- Skill: `.agents/skills/centraldark-live-editing-fabric/SKILL.md`
- Hook existente reforçado: `scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh`
- Bot binding: `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- Trigger Fabric binding: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`

## Secret transit

Valores temporários são trânsito operacional: usar no owner solicitado, não ecoar, não commitar, não registrar valor em receipt, limpar logs controlados e descartar/rotacionar.

SECRET_VALUE_RECORDED=false  
SECRET_EXPOSED_IN_REPO=false

## Próximo cursor

Reusar a skill `centraldark-live-editing-fabric` como padrão quando o CHEFE pedir edição/refino vivo; usar CI profundo somente quando a intenção pedir prensa/ponto fixo prolongado.
