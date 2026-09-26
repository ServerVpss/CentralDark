# OUTRO - add-block.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\hyperframes-registry\examples\add-block.md
**SHA:** 0e3353755c4ef55e
**Timestamp:** 2026-08-26T18:31:41.987589
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- data-start="0"
- data-start="5"

### Ouro Bruto (primeiros 5000 chars)
```
# Worked Example: Adding a Block

## Scenario

User has an existing HyperFrames project and wants to add an animated chart alongside their video content.

## Steps

### 1. Install the block

```bash
hyperframes add data-chart
```

### 2. Wire into index.html

```html
<div id="stage" data-composition-id="main" data-width="1920" data-height="1080" data-duration="30">
  <video
    id="speaker"
    src="speaker.mp4"
    data-start="0"
    data-duration="30"
    data-track-index="0"
    style="position: absolute; width: 60%; height: 100%; left: 0; top: 0; object-fit: cover;"
  ></video>

  <!-- Data chart appears at 5s in the right 40% of the screen -->
  <div
    data-composition-id="data-chart"
    data-composition-src="compositions/data-chart.html"
    data-start="5"
    data-duration="15"
    data-track-index="1"
    data-width="1920"
    data-height="1080"
    style="position: absolute; right: 0; top: 0; width: 40%; height: 100%;"
  ></div>
</div>
```

### 3. Lint and preview

```bash
hyperframes lint
hyperframes preview
```

### 4. Customize (optional)

Edit `compositions/data-chart.html` — data arrays are at the top of the script, colors are in the CSS rules scoped under `[data-composition-id="data-chart"]`.

```