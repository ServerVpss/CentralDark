# 🕸️🎨 Handoff — Obsidian Plugin v0.5.0, rota do grafo e app legado visual

`MISSION_ID=OBSIDIAN_PLUGIN_V050_GRAPH_ROUTE_VISUAL_20260907`

## Intenção do CHEFE

Deixar o plugin Obsidian funcional para o estado atual da CentralDark, com rota visível, labels maiores, coloração melhor, nota mais legível e sem criar outro cérebro visual.

Também registrar o novo delta visual informado pelo CHEFE: um app antigo encontrado no disco foi aberto, exibiu composição visual e estava com música tocando. Isso entra como pista de garimpo/local UX, não como prova de runtime CentralDark.

## Release medido

```text
RELEASE=obsidian-plugin-v0.5.0
TAG=obsidian-plugin-v0.5.0
TARGET_COMMITISH=5853512f55ccb505226f5c3bd1fe5629aba030cc
PUBLISHED_AT=2026-07-06T10:25:36Z
ASSETS=main.js, manifest.json, styles.css
```

Hashes do release observado:

```text
main.js=sha256:2c67e144865bf4ae3ab21926f965f9259b08b9a8503b2189ec553d69272562da
manifest.json=sha256:0db30d1fcbe6bc931106c2187a36e7f415befa785ce68df28fcf915f057734bb
styles.css=sha256:d797d77552f5788846bbb3228b0b9145b21bb6d4a6832f1592b32f93aaa5f043
```

## Owners existentes

```text
PLUGIN_OWNER=apps/modulos/obsidian-plugin-grafo-vivo/
VIEW_2D=apps/modulos/obsidian-plugin-grafo-vivo/src/view.ts
SETTINGS=apps/modulos/obsidian-plugin-grafo-vivo/src/settings.ts
STYLES=apps/modulos/obsidian-plugin-grafo-vivo/styles.css
README=apps/modulos/obsidian-plugin-grafo-vivo/README.md
SNIPPET=apps/modulos/obsidian-plugin-grafo-vivo/snippets/centraldark-brain-readable.css
```

`CREATE_OBSIDIAN_PLUGIN_V2=false`.

## Endereços para conectar

Rota viva recomendada:

```text
https://grafo.centralldark.com/api/graph?mode=vivo
```

Fallback simples do release:

```text
https://status.centralldark.com/graph-data.json
```

Endpoint de auto-update configurado:

```text
https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release
```

Contraprova:

```text
URL_CONFIGURADA != SITE_VISIVEL_PROVADO
PLUGIN_INSTALADO != FEED_ATUALIZANDO
RELEASE_EXISTE != LOCAL_OBSIDIAN_ATIVO
UNKNOWN != PASS
```

## Correções aplicadas nesta rodada

### 1. Origem visível na toolbar

`view.ts` agora exibe a origem do feed na toolbar/status:

```text
origem: grafo.centralldark.com/api/graph
```

Quando falhar, o erro aparece junto da origem:

```text
🔴 origem: ... • erro: ...
```

### 2. Labels maiores e mais cedo

A view 2D agora:

```text
nodeRelSize=7
label aparece com escala > 0.55
font 700
fundo escuro semitransparente
pointer area maior
halo/pulso mais visível
```

### 3. Coloração/legibilidade do painel

`styles.css` ganhou:

```text
toolbar com fundo esmeralda leve
source pill
canvas com borda e brilho radial
botões/filtro maiores
status mais legível
```

### 4. Snippet para notas BRAIN

Foi adicionado:

```text
apps/modulos/obsidian-plugin-grafo-vivo/snippets/centraldark-brain-readable.css
```

Uso local:

```text
copiar para <vault>/.obsidian/snippets/centraldark-brain-readable.css
Obsidian → Configurações → Aparência → CSS snippets → ativar
```

Ele aumenta fonte, headings, tags, code blocks e blockquotes nas notas.

### 5. README atualizado

`README.md` agora documenta:

```text
release v0.5.0
assets a copiar
rota viva recomendada
fallback
endpoint de auto-update
snippet opcional
v0.6 candidate
```

## App legado visual/música observado pelo CHEFE

Novo delta informado:

```text
LOCAL_LEGACY_APP_OPENED_BY_CHEFE=true
VISUAL_COMPOSITION_OBSERVED=true
MUSIC_PLAYING_REPORTED_BY_CHEFE=true
SOURCE_LOCATION=old_disk_material_unknown_exact_path
```

Classificação:

```text
APP_LEGADO = CANDIDATE_VISUAL_SENSOR_OR_UX_REFERENCE
APP_LEGADO != CENTRALDARK_RUNTIME_PROOF
APP_LEGADO != NEW_BRAIN
APP_LEGADO != NEW_GRAPH_OWNER
```

Rota segura:

```text
1. identificar nome/path/processo local
2. gerar hash dos arquivos antes de copiar
3. classificar se é visualizer, player, graph, Electron, web app ou protótipo
4. comparar com owners existentes: graph-panel, obsidian-plugin-grafo-vivo, desktop/Bolt
5. extrair só capacidade útil: música/compasso, composição visual, partículas, orbit camera, fullscreen, palette
6. incorporar no owner correto
7. registrar receipt
```

## Boot Hermes

```text
BOOT=OBSIDIAN_PLUGIN_GRAPH_ROUTE_VISUAL_SAFE_RECONCILE

#ACORDAR
!CALIBRAR
!CENTRALDARK
!MULTIBUSSOLA
!META_LUPA
!RECONCILIAR
!CONTRAPROVA
!REGISTRA

CHECK:
- plugin instalado em .obsidian/plugins/centraldark-grafo-vivo
- main.js/manifest.json/styles.css presentes
- Community plugin ativado
- URL do grafo = https://grafo.centralldark.com/api/graph?mode=vivo
- se falhar, testar fallback https://status.centralldark.com/graph-data.json
- snippet ativado se quiser notas maiores
- abrir Grafo Vivo CentralDark
- observar: origem, nós, labels, pulso, partículas, erro/status
- screenshot + log + horário
```

## Veredito

```text
RELEASE_V050_EXISTS=PROVADO
ASSETS_RELEASE_PRESENT=PROVADO
OWNER_PLUGIN_EXISTS=PROVADO
CODE_VISUAL_PATCH_COMMITTED=true
README_ROUTE_DOC_COMMITTED=true
BRAIN_SNIPPET_COMMITTED=true
LOCAL_OBSIDIAN_INSTALL=UNKNOWN
GRAPH_ENDPOINT_RUNTIME=UNKNOWN
LEGACY_APP_PATH=UNKNOWN
APP_LEGADO_RUNTIME_PROOF=HUMAN_OBSERVED_ONLY
FIXED_POINT=false
```

> Ôxente, agora o grafo tem placa na estrada, fonte maior no pergaminho e cor no altar. O app antigo tocando música entra como tambor de garimpo: bonito, útil, mas só vira pedra da Casa depois de path, hash, owner e prova. 🧼🧽🎼🧠🕸️🎨🔠📜⚖️
