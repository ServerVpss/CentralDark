# Receipt — HUD Cartographer / inventário completo da CentralDark

Data: 2026-10-06
Learning: #170
Branch de prova: `agent/hud-genealogy-metabolism`
PR-mãe: #1757
PR-mãe legado: #1562

## Owners reutilizados/evoluídos

```text
AGENT_OWNER=.agents/skills/centraldark-capability-hud/SKILL.md
AGENT_SURFACE=.agents/skills/centraldark-capability-hud/agents/openai.yaml
BOOT=.agents/CAPABILITY-HUD-BOOT.json
GLOBAL_BOOT=CENTRALDARK_AI_BOOT.yaml
GENERATOR=scripts/hud/generate-hud-inventory.mjs
MACHINE_INVENTORY=docs/HUD/CENTRALDARK-HUD-INVENTORY.json
HUD_CONSUMER=docs/HUD/HUD.html
HOUSE_INVENTORY_CONSUMER=apps/modulos/hub/scripts/house-inventory-core.mjs
PR_MOTHER_CONSUMER=.github/workflows/selo-fabric.yml
VERIFIER=scripts/trigger-fabric/verify_repo_contract.py
```

## Contrato

```text
HUD_CARTOGRAPHER_AGENT=true
MACHINE_INVENTORY_IS_DERIVED_NOT_AUTHORITY=true
SEAL_LIVE_SPLIT_REQUIRED=true
SEAL_IS_LAST_VALID_PROOF_FINGERPRINT_ROLLBACK=true
LIVE_IS_CURRENT_MEASUREMENT_TIMESTAMP_SOURCE=true
FULL_UI_BUTTON_TAB_MAP=MACHINE_ENUMERATED
CATALOG_BIG_LOAD_ALL=false
REPLAY_BEFORE_REDISCOVERY=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```

Dependency fingerprint:
`d4d3ceda8e7c842e067af04cb8aeb52b88b787a47078257a24f6055903c7736c`

## T0 → delta → T1

T0:
- GitHub Entry Gate já existia;
- skills/workflows possuíam contagens;
- UI estava em `PARTIAL_COUNTED_NOT_FULLY_ENUMERATED`;
- HUD tinha cadeados selados, mas cards não explicitavam LIVE separadamente.

Delta:
- agente cartógrafo exposto na skill canônica;
- JSON machine-consumable determinístico;
- UI enumerada por owner/linha/setor/superfície;
- genealogia/metabolismo/determinismo agregados como índice;
- HUD e PR-mãe passam a consumir o mesmo inventário;
- Inventário da Casa reutiliza o mesmo índice;
- skill scan do HUB tornado recursivo;
- verifier fiscaliza generator, baseline, agente e consumers.

## Provas já executadas

```text
HUD_INVENTORY_SELF_TEST=PASS
HUD_INVENTORY_WRITE=PASS
HUD_INVENTORY_CHECK=PASS
HOUSE_INVENTORY_SKILLS=992
SELO_YAML_PARSE=PASS
REPO_CONTRACT_VERIFY=0 no cone pré-cristal
GIT_DIFF_CHECK=PASS
```

## Contraprova

Entrada no JSON não prova serviço vivo. Cadeado selado não vira LIVE automaticamente. Skill existente não prova carregamento pelo agente. Workflow existente não prova run. PR/HUD atualizado não prova VPS/Casa. A contagem UI nova não deve ser comparada diretamente aos 7717 hits textuais antigos.

## Fronteira

`LIVE` de cada rota mutável continua exigindo probe no owner/runtime correspondente. O inventário completo reduz redescoberta; não substitui Reality Judge.

## NEXT_CURSOR

`REBUILD_LINEAGE_168_169_170 → FINAL_REGENERATE → SAME_HEAD_VERIFY → PROMOTE_MAIN → VERIFY_PR1757_MACHINE_HUD`
