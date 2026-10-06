# Lembrança — HUD Cartographer: genealogia, metabolismo, determinismo e superfícies

Data: 2026-10-06
Learning: #170
Status: SESSION_CRYSTAL
Owner executável: `.agents/skills/centraldark-capability-hud/SKILL.md`
Gerador: `scripts/hud/generate-hud-inventory.mjs`
Inventário: `docs/HUD/CENTRALDARK-HUD-INVENTORY.json`
Consumers: `docs/HUD/HUD.html` + `.github/workflows/selo-fabric.yml` + Inventário da Casa

## Ferida

O HUD já mostrava lugares selados e o GitHub Entry Gate já contava sinais, mas ainda existiam três lacunas:
- contagem ampla de UI não era mapa elemento→owner→setor→superfície;
- SELO histórico podia ser visualmente confundido com estado LIVE;
- genealogia, claims, receipts, receitas, determinismo, skills, workflows, agentes e rotas não tinham uma projeção única machine-consumable.

## Solução no owner existente

A skill `centraldark-capability-hud` foi evoluída para expor o agente **CentralDark HUD Cartographer**. Não nasceu segundo cérebro, router ou inventário autoritativo.

```text
CURRENT → GITHUB_ENTRY_HUD → GENERATE_MACHINE_INVENTORY
→ GENEALOGY → METABOLISM → DETERMINISM
→ AGENTS/SKILLS/WORKFLOWS/ROUTES
→ UI OWNER+LINE+SECTOR+SURFACE
→ SEAL/LIVE SPLIT → SELECT PERTINENT OWNER CONE
→ RUNTIME PROBE WHEN NEEDED → HUD/PR_MOTHER → RECEIPT/NEXT_CURSOR
```

## Semântica do cadeado

```text
SELO = última prova válida + fingerprint + rollback
LIVE = medição atual + timestamp + fonte
SELO != LIVE
SEALED_BASELINE + LIVE_UNKNOWN = baseline preservada, runtime não confirmado
SEALED_BASELINE + LIVE_FAIL = reparar mesmo owner/receita ou fallback autorizado
```

O inventário nunca promove presença documental para runtime PASS.

## Genealogia

O gerador consome a projeção NeuroLink e demais arquivos de lineage. Números identificam aprendizado; arestas preservam continuidade, não causalidade. Esta sessão reconcilia os headings #168/#169 ao formato reconhecido pelo compilador antes de adicionar #170.

## Metabolismo e determinismo

O mesmo inventário indexa claims provados, receipts, receitas/Trigger Fabric, deterministic locks/verifiers, rotas MCP e cadeados do HUD.

Fingerprint do contrato do cartógrafo: `d4d3ceda8e7c842e067af04cb8aeb52b88b787a47078257a24f6055903c7736c`.

## UI

Botões, abas, navegação e seções recebem `OWNER + LINE + SECTOR + SURFACE + KIND + LABEL + PROOF_SOURCE + SEAL_STATE + LIVE_STATE`.

A contagem antiga de sinais amplos continua história. A nova contagem é outro denominador: elementos UI enumerados, não hits textuais.

## Regra de carga

`CATALOG_BIG != LOAD_ALL`. O JSON serve como índice. O agente consulta o índice, escolhe o cone pertinente e só então abre owners/probes necessários.

## NEXT_CURSOR

`FINAL_REGENERATE → LINEAGE_REBUILD → VERIFY_FIXED_POINT → PROMOTE → PR_MOTHER_READBACK → RUNTIME_LIVE_PROBES_ON_DEMAND`

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
