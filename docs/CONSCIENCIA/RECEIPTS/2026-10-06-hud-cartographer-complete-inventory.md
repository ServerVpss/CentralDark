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

## Delta integrado — runtime oficial + HUD local Obsidian

```text
PROVEN_RUNTIME_AFFECTING_DELTA → MAIN → DEPLOY_CAUSAL → RUNTIME_READBACK → /heartbeat → HUD
PROVEN_CANONICAL_KNOWLEDGE → MACHINE_INVENTORY → /heartbeat PROJECTION → HUD
SEALED_BASELINE_PRESERVED=true
SEAL_IS_NOT_LIVE=true
HUD_REALTIME_REFRESH_MS=5000
LOCAL_OBSIDIAN_HUD_IS_PROJECTION_NOT_AUTHORITY=true
ACTIVE_RENDEZVOUS=RESOLVE_FROM_CURRENT
```

Medição Casa/Windows desta rodada:
- vault alvo: `C:\Users\Administrador\Documents\Obsidian Vault\🪬Centraldark -HUD🪬`;
- `obsidian-git`, `dataview` e `obsidian-excalidraw-plugin` estavam presentes;
- o vault não era repositório Git e o `obsidian-git` tinha intervalos automáticos zerados, portanto `PLUGIN_PRESENT != LIVE_GIT_TRANSPORT`;
- o plugin canônico `centraldark-grafo-vivo` não estava materializado nesse vault;
- o mesmo plugin existente foi copiado do CURRENT e habilitado no `community-plugins.json`;
- hashes locais após readback: `main.js=a8f6f00f8a86fd7213f1216f29a034b8b7ff57f680d88d7be37741564b0edf29`, `manifest.json=0db30d1fcbe6bc931106c2187a36e7f415befa785ce68df28fcf915f057734bb`, `styles.css=d797d77552f5788846bbb3228b0b9145b21bb6d4a6832f1592b32f93aaa5f043`;
- `OBSIDIAN_PLUGIN_FILES_AND_ENABLE_CONFIG=PASS`;
- `OBSIDIAN_PLUGIN_RUNTIME_LOADED=UNKNOWN_UNTIL_OBSIDIAN_APP_READBACK`.

O vault continua projeção local; não criar `.git` paralelo nele.
