# CONTRATO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\references\ovrtx-render-service\README.md
**SHA:** 047bbb45fdac5fe0
**Timestamp:** 2026-08-26T18:31:34.576416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- This reference follows the current `nvidia-omniverse/content-agents` `main` OVRTX rendering API contract: encode local USD as a data URI in the `/render` request `url` field, pass render settings, and

### Ouro Bruto (primeiros 5000 chars)
```
# Render USD

## When to Use

Use this reference to create a visual preview of a USD asset after conversion, validation, material assignment, or SimReady packaging. The reference's `scripts/run.py` inspects the stage with OpenUSD mesh traversal when the local Python environment provides `pxr`, then sends the USD to an OVRTX renderer.

Do not use VTK or other local triangle preview renderers. This reference always
sends the stage to an OVRTX rendering service. The service endpoint can be:

- a preflight-managed local OVRTX service through `OVRTX_RENDER_ENDPOINT`,
  `OVRTX_RENDER_BASE_URL`, `RENDER_ENDPOINT`, or the preflight manifest
- a provided OVRTX service through `--endpoint`, `RENDER_ENDPOINT`, or
  `CONTENT_AGENTS_RENDER_BASE_URL`
- an NVCF invocation endpoint through `NVCF_RENDER_ENDPOINT`, or a constructed
  invocation URL from `NVCF_RENDER_FUNCTION_ID` / `RENDER_FUNCTION_ID`

Use `--token` only when environment or file-backed token injection is
impossible. The wrapper sends available renderer tokens automatically and only
requires a token before the request for known protected NVCF endpoints.

If neither renderer path is configured or the renderer cannot produce a PNG, stop with the command report. Do not silently substitute a non-OVRTX preview. Material Agent or Physics Agent HTML report images, generated service thumbnails, viewport screenshots, or earlier conversion thumbnails are useful diagnostics, but they are not valid `ovrtx-render-service` outputs and must not be reported as final renders from this skill.

Prefer a ready `PHYSICAL_AI_PREFLIGHT_MANIFEST` from the `preflight`
reference. The wrapper consumes a prepared OVRTX endpoint from that manifest
before falling back to renderer environment variables. When
`PHYSICAL_AI_REQUIRE_PREFLIGHT=1` is set, missing renderer readiness blocks at
the preflight guardrail.

## Upstream Reference

This reference follows the current `nvidia-omniverse/content-agents` `main` OVRTX rendering API contract: encode local USD as a data URI in the `/render` request `url` field, pass render settings, and decode returned image bytes from the response `images` map. Its stage-preparation behavior mirrors the useful parts of the earlier render-usd proof of concept from `https://github.com/NVIDIA-dev/content-claw/tree/main/.claude/skills/render-usd`: compute render bounds, author a camera from those bounds, preserve the source stage lighting state by default, and bundle local MDL/texture sidecars. The source asset is not modified.

OVRTX service deployment belongs to NVIDIA Omniverse Content Agents: `https://github.com/nvidia-omniverse/content-agents` on branch `main`. When a render task requires provisioning, starting, or troubleshooting a local OVRTX render endpoint, use the installed `deploy-content-agents` skill, which points to `https://github.com/nvidia-omniverse/content-agents/blob/main/.codex/skills/deploy-ovrtx-docker/SKILL.md`. Do not copy Docker Compose or OVRTX deployment instructions into this reference.

## Stage Preparation

Before calling `/render`, `scripts/run.py` prepares a render stage with OpenUSD
when `pxr` is available:

- Preserve the composed source stage by default. This keeps renderer-visible
  MaterialX/OpenPBR material graphs intact; flattened render payloads can cause
  OVRTX to show red fallback/error materials on some Material Agent outputs.
- Use `--flatten` only as an explicit diagnostic or packaging fallback when the
  unflattened source composition cannot be sent to the renderer.
- Compute a world-space bounding sphere from the default prim or first
  xformable root prim.
- Generate a fit-to-bounds camera when `--camera` is not supplied; this avoids
  fixed-camera misses on meter-normalized assets with root scale opinions.
- Do not author default lights by default; this keeps final renders on the
  renderer's clean black background without adding a DomeLight. Use
  `--default-lights` only as an explicit debugging override.
- Export a temporary `main.usda` and bundle referenced local MDL/texture files
  into the data-URI payload, rewriting asset paths to the bundle.
- Inspect the returned PNG for blank/uniform pixels and record the result in the
  JSON report. Use `--fail-on-uniform` when a blank render should fail the
  command rather than produce a warning.

## Camera Handling

Use `--camera` when the asset already has a specific camera prim that should drive the preview. Without `--camera`, `scripts/run.py` authors `/Camera` in the temporary render stage using bounds-derived distance, aperture, clipping range, and elevation. The authored camera path and construction parameters are reported under `stage_construction.camera`.

## Turntable Rendering

Use `scripts/turntable.py` when a single view is blank, ambiguous, or not enough
for visual inspection. It renders multiple OVRTX frames from bounds-fit
turntable stages and writes a frame-by-frame report containing camera placement,
stage bounds, local asset bundling, pixel checks, and
```

---

# CONTRATO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\references\simready-conform-profile\references\FET_005_SIMULATE_GRASP_PHYSICS\README.md
**SHA:** 6f04dfdab61920f1
**Timestamp:** 2026-08-26T18:38:04.987571
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- existing report contract:

### Ouro Bruto (primeiros 5000 chars)
```
# SimReady FET005 Grasp Physics Local Helper

## Upstream Skill

Source of truth:

```text
https://github.com/NVIDIA/simready-foundation/blob/main/skills/simready-foundation-conform-fet-005-simulate-grasp-physics/SKILL.md
```

Use an authenticated local checkout at
`$SIMREADY_FOUNDATION_ROOT/skills/simready-foundation-conform-fet-005-simulate-grasp-physics/SKILL.md`
or
`$PHYSICAL_AI_SKILL_HUB_UPSTREAM_ROOT/simready-foundation/skills/simready-foundation-conform-fet-005-simulate-grasp-physics/SKILL.md`
when browser access is unavailable.

Do not copy FET005 requirement summaries, visual policy, or repair policy into
this repo.

## Local Helper

This directory only keeps a legacy Skill Hub helper script for deterministic
grasp-line authoring and JSON reports. Prefer the upstream Foundation script when
it is available:

```bash
uv run --python 3.12 python "$SIMREADY_FOUNDATION_ROOT/skills/simready-foundation-conform-fet-005-simulate-grasp-physics/scripts/author_grasp_line.py" <usd-asset> \
  --output <staged-output-usd> \
  --point=-0.05,0,0 \
  --point=0.05,0,0 \
  --visual-evidence <render-or-screenshot> \
  --rationale "vision-reviewed graspable region" \
  --report <output-root>/author-grasp-line.json
```

Use the local helper only when the installed Skill Hub workflow needs its
existing report contract:

```bash
python3 scripts/author_grasp_line.py <usd-asset> \
  --output <staged-output-usd> \
  --point=-0.05,0,0 \
  --point=0.05,0,0 \
  --visual-evidence <render-or-screenshot> \
  --rationale "vision-reviewed graspable region" \
  --report <output-root>/author-grasp-line.json
```

Read the upstream Foundation skill before using either script. Treat the upstream
skill as authoritative when its instructions differ from this local wrapper.

## Next Step

After grasp-line authoring, rerun `simready-validate` with the same Foundation
checkout.

```

---

# CONTRATO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\references\local-viewer\README.md
**SHA:** ca8d091fff3eb158
**Timestamp:** 2026-08-26T18:39:44.228215
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- drag_start = {

### Contratos
- local app, prefer this contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Local Omniverse Realtime Viewer Shell

## Triggers

Use this skill for ovui window shell, standalone viewport shell, simple ovui app, `ImageBridge`, image display, resize handling, mouse capture surfaces, or requests that should avoid the full ovui editor shell.

For a complete local desktop viewer, read `ovui-local-viewer-recipe` first and use
this as the focused shell/display skill. Use this for a small single-window
viewer: header, RTX viewport, optional sidebar, and inline controls. Do not use
`ovui.app.Application`; that starts the full OvGear editor with docking, menus,
property panels, transform gizmos, and status bars.

For mouse button normalization, click-vs-drag handling, and dispatch to camera
or selection controllers, read `viewer-input-routing`.

For header/sidebar controls, toolbar actions, render settings widgets,
sliders, and destructive confirmations, read `viewer-control-patterns` and
translate its client-agnostic control guidance into native `ovui` widgets.

For ovui widget APIs or native UI behavior not covered here, read
`references/dependencies` for acquisition guidance and supplemental dependency
documentation.

For ovrtx renderer setup, frame extraction, or release-specific behavior not
covered here, read `references/dependencies` for acquisition guidance and
supplemental dependency documentation.

## Runtime Setup

Install and activate the selected `ovui` package through `references/dependencies`
before imports. The lightweight local path imports `pxr` before direct `ovrtx`
use; other server paths may construct `ovrtx.Renderer` first. Keep the chosen
import discipline consistent in one process.

```python
import asyncio
import os
os.environ.setdefault("OVRTX_SKIP_USD_CHECK", "1")

from pxr import Usd, UsdGeom, Sdf
import ovrtx
import omni.ui as ui
```

Run with a real display from the activated environment:

```bash
DISPLAY=:99 OVRTX_SKIP_USD_CHECK=1 python3 -m local_app
```

If `renderer.step()` hangs after a crash, use `nvidia-smi` and kill only stale Python Omniverse Realtime Viewer processes that still hold CUDA/RTX state.

## ovui Window Shell

Use `fill_app_window=True`; without it the GLFW window can resize while the UI frame remains stuck at the initial dimensions.

```python
ui.init("Omniverse Realtime Viewer", width=1280, height=720, max_fps=60)
window = ui.Window("Omniverse Realtime Viewer", width=1280, height=720, fill_app_window=True, flags=ui.WINDOW_FLAGS_NO_TITLE_BAR)
with window.frame:
    with ui.ZStack(style_type_name_override="Local.Root"):
        ui.Rectangle(style_type_name_override="Local.Root")
        with ui.VStack(spacing=0):
            build_header(height=50)
            with ui.HStack(spacing=0, height=ui.Fraction(1)):
                with ui.Frame(width=ui.Fraction(1)):
                    viewport.build()
                with ui.Frame(width=ui.Pixel(280)):
                    sidebar.build()

async def render_loop():
    while True:
        app.step_and_present()
        await asyncio.sleep(0)

ui.run(render_loop())
```

Keep the surface focused: black header, large viewport, white/sidebar utility area, green `#76b900` accents. Avoid editor-only affordances unless requested.

`omni.ui.standalone.run()` expects an awaitable coroutine, not a plain callback. Returning from the coroutine ends the app, so long-running viewers should yield with `await asyncio.sleep(0)` after each render/UI tick.

## Header And Load Controls

Keep scene loading boring and reliable. For lightweight local viewers, default
to one path field plus one `LOAD` button that calls the same serialized scene
load path used by command-line startup. Do not add a separate `OPEN` button or
native file dialog unless it is implemented and validated under the same
display/session environment as the viewer. A broken dialog next to a working
path loader creates needless ambiguity.

```python
path_model = ui.SimpleStringModel(str(initial_stage))
ui.StringField(model=path_model, height=30)
ui.Button("LOAD", clicked_fn=lambda: runtime.load(path_model.get_value_as_string()))
```

If a native file dialog is explicitly requested, keep it secondary and test it
with the target display stack (`DISPLAY`, Xvfb/VNC, Wayland/X11, container
permissions). On failure, report the dialog failure in the status bar and leave
the path-field loader usable.

## Image Display

Use the app's local image bridge helper when a plain image widget is enough.
For projects using the `ovwidgets` helper, import
`ovwidgets.viewport.image_bridge.ImageBridge`; otherwise use
`ui.ByteImageProvider` directly. The renderer may stay at fixed resolution while
`ImageWithProvider` stretches with preserve-aspect letterboxing.

```python
bridge = ImageBridge(render_width, render_height)
image = ui.ImageWithProvider(bridge.provider, fill_policy=ui.IwpFillPolicy.IWP_PRESERVE_ASPECT_FIT)
bridge.update(frame_rgba_uint8)
```

For a direct provider path:

```python
provider = ui.ByteImageProvider()
image = ui.ImageWithProvider(provider, fill_po
```

---

# CONTRATO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\references\viewer-backend-interface\README.md
**SHA:** 4cd16a267eaa8ea5
**Timestamp:** 2026-08-26T18:39:52.636211
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Use the hook-per-transport pattern:
- Resolver pattern:

### Contratos
- Method contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Viewer Backend Interface

## Triggers

Use this skill for `ViewerBackend`, local shared UI, backend-agnostic React
viewer UI, reusable viewer components, viewer interface adapters, or
cross-transport UI.

Use this when a frontend should share the same panels, inspectors, selection controls, asset list, and viewer widgets across WebRTC streaming, Electron SHM, Tauri SHM/native IPC, or a future transport.

## Purpose

The local viewer UI module is generated React component code plus a TypeScript
interface contract. The contract lets UI components depend on one
`ViewerBackend` object instead of transport-specific APIs such as AppStreamer
messages, Electron preload calls, Tauri commands, or future IPC layers.

The shared UI does not render USD or 3D content. All USD rendering still uses `ovrtx` in the appropriate server or native process. The UI displays a video, canvas, or pixel surface owned by the transport and overlays reusable React controls that call `ViewerBackend`.

## Read These Skills

| Need | Read |
|---|---|
| Browser/WebRTC transport | `streaming-client`, `streaming-messages`, `streaming-lifecycle` |
| Electron + SHM local transport | `electron-shm-viewer`, `webgl-shm-transport` |
| Tauri/native desktop transport | `tauri-local-viewer` |
| Camera input behavior | `viewer-input-routing`, `camera-controls` |
| Picking and selection | `viewer-input-routing`, `object-selection`, `selection-feedback` |
| Hierarchy and property data | `stage-hierarchy`, `stage-attribute-reads` |
| AOV and render settings messages | `aov-switching`, `render-settings` |

## Local Module Setup

Generate these files inside the frontend app unless the user requests a
different local structure:

```text
frontend/src/viewer-ui/
  ViewerBackend.ts
  types.ts
  StageTree.tsx
  PropertyPanel.tsx
  Inspector.tsx
  PrimIconSprite.tsx
  USDAsset.tsx
  index.ts
```

Use `index.ts` as the local barrel export. Do not add an external package
dependency for shared viewer UI.

Import components and types from the local module:

```typescript
import {
  Inspector,
  PrimIconSprite,
  PropertyPanel,
  StageTree,
  USDAsset,
  type FrameData,
  type PrimNode,
  type PrimProperty,
  type USDAssetItem,
  type ViewerBackend,
} from './viewer-ui';
```

The local `index.ts` exports `Inspector`, `InspectorProps`, `PrimIconSprite`,
`PropertyPanel`, `StageTree`, `StageTreeProps`, `USDAsset`, and all shared
viewer types.

## ViewerBackend Interface

Implement this interface at the transport boundary. Components should call this interface, not raw WebRTC, Electron, Tauri, or server-message APIs.

```typescript
export interface ViewerBackend {
  connect(): Promise<void>;
  disconnect(): void;
  loadStage(path: string): Promise<void>;
  resize?(width: number, height: number): Promise<void>;
  sendRenderScale?(scale: number): Promise<void>;
  setCamera(params: CameraParams): Promise<void>;
  cameraMouseButton(input: PointerInput): Promise<boolean>;
  cameraMouseMove(x: number, y: number): Promise<void>;
  cameraWheel(delta: number): Promise<void>;
  onFrame(callback: (frame: FrameData) => void): () => void;
  onStats?(callback: (stats: FrameBudgetStats) => void): () => void;
  onLoadProgress?(callback: (progress: LoadProgressEvent) => void): () => void;
  onAOVStateChanged?(callback: (active: string, available: string[]) => void): () => void;
  changeAOV?(aov: string): Promise<void>;
  onSelectionChanged(callback: (paths: string[]) => void): () => void;
  pick(x: number, y: number): Promise<string | null>;
  getStageTree(rootPath?: string): Promise<PrimNode[]>;
  selectPrims(paths: string[]): Promise<void>;
  getProperties(path: string): Promise<PrimProperty[]>;
}
```

Method contract:

| Method | Contract |
|---|---|
| `connect()` | Establish the transport, register event/frame listeners, and resolve when commands can be sent. Guard duplicate calls from React remounts. |
| `disconnect()` | Remove listeners, stop frame pumps, close transport handles, and reject or clear pending resolvers. Make cleanup safe to call more than once. |
| `loadStage(path)` | Ask the backend to load a USD stage by URL/path. Clear stale tree, property, selection, progress, AOV, and pending-pick state. Resolve after the backend accepts or completes the load according to that transport's normal semantics. |
| `resize?(width, height)` | Resize a backend-owned dynamic render target when supported. Fixed-resolution video and fixed render-product transports should implement a no-op or omit this method. |
| `sendRenderScale?(scale)` | Request a render-scale change when the backend supports adaptive scaling. Clamp to supported values and publish the effective scale through frame or stats updates when possible. |
| `setCamera(params)` | Set camera state directly for backends that own explicit camera parameters. Native-input transports may resolve without action if camera motion is driven by pointer messages. |
| `cameraMouseButton(input)` | Send a button press/release to the camera co
```

---

# CONTRATO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\README.md
**SHA:** 79d02cee5a2ae6d2
**Timestamp:** 2026-08-28T02:24:07.910925
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- oldStart: 1, oldLines: 3, newStart: 1, newLines: 3,

### Ouro Bruto (primeiros 5000 chars)
```
# jsdiff

A JavaScript text differencing implementation. Try it out in the **[online demo](https://kpdecker.github.io/jsdiff)**.

Based on the algorithm proposed in
["An O(ND) Difference Algorithm and its Variations" (Myers, 1986)](http://www.xmailserver.org/diff2.pdf).

## Installation
```bash
npm install diff --save
```

## Getting started

### Imports

In an environment where you can use imports, everything you need can be imported directly from `diff`. e.g.

ESM:

```
import {diffChars, createPatch} from 'diff';
```

CommonJS

```
const {diffChars, createPatch} = require('diff');
```

If you want to serve jsdiff to a web page without using a module system, you can use `dist/diff.js` or `dist/diff.min.js`. These create a global called `Diff` that contains the entire JsDiff API as its properties.

### Usage

jsdiff's diff functions all take an old text and a new text and perform three steps:

1. Split both texts into arrays of "tokens". What constitutes a token varies; in `diffChars`, each character is a token, while in `diffLines`, each line is a token.

2. Find the smallest set of single-token *insertions* and *deletions* needed to transform the first array of tokens into the second.

   This step depends upon having some notion of a token from the old array being "equal" to one from the new array, and this notion of equality affects the results. Usually two tokens are equal if `===` considers them equal, but some of the diff functions use an alternative notion of equality or have options to configure it. For instance, by default `diffChars("Foo", "FOOD")` will require two deletions (`o`, `o`) and three insertions (`O`, `O`, `D`), but `diffChars("Foo", "FOOD", {ignoreCase: true})` will require just one insertion (of a `D`), since `ignoreCase` causes `o` and `O` to be considered equal.

3. Return an array representing the transformation computed in the previous step as a series of [change objects](#change-objects). The array is ordered from the start of the input to the end, and each change object represents *inserting* one or more tokens, *deleting* one or more tokens, or *keeping* one or more tokens.

## API

* `diffChars(oldStr, newStr[, options])` - diffs two blocks of text, treating each character as a token.

    ("Characters" here means Unicode code points - the elements you get when you loop over a string with a `for ... of ...` loop.)

    Returns a list of [change objects](#change-objects).

    Options
    * `ignoreCase`: If `true`, the uppercase and lowercase forms of a character are considered equal. Defaults to `false`.

* `diffWords(oldStr, newStr[, options])` - diffs two blocks of text, treating each word and each punctuation mark as a token. Whitespace is ignored when computing the diff (but preserved as far as possible in the final change objects).

    Returns a list of [change objects](#change-objects).

    Options
    * `ignoreCase`: Same as in `diffChars`. Defaults to false.
    * `intlSegmenter`: An optional [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) object (which must have a `granularity` of `'word'`) for `diffWords` to use to split the text into words.

      By default, `diffWords` does not use an `Intl.Segmenter`, just some regexes for splitting text into words. This will tend to give worse results than `Intl.Segmenter` would, but ensures the results are consistent across environments; `Intl.Segmenter` behaviour is only loosely specced and the implementations in browsers could in principle change dramatically in future. If you want to use `diffWords` with an `Intl.Segmenter` but ensure it behaves the same whatever environment you run it in, use an `Intl.Segmenter` polyfill instead of the JavaScript engine's native `Intl.Segmenter` implementation.

      Using an `Intl.Segmenter` should allow better word-level diffing of non-English text than the default behaviour. For instance, `Intl.Segmenter`s can generally identify via built-in dictionaries which sequences of adjacent Chinese characters form words, allowing word-level diffing of Chinese. By specifying a language when instantiating the segmenter (e.g. `new Intl.Segmenter('sv', {granularity: 'word'})`) you can also support language-specific rules, like treating Swedish's colon separated contractions (like *k:a* for *kyrka*) as single words; by default this would be seen as two words separated by a colon.

* `diffWordsWithSpace(oldStr, newStr[, options])` - diffs two blocks of text, treating each word, punctuation mark, newline, or run of (non-newline) whitespace as a token.

* `diffLines(oldStr, newStr[, options])` - diffs two blocks of text, treating each line as a token.

    Options
    * `ignoreWhitespace`: `true` to ignore leading and trailing whitespace characters when checking if two lines are equal. Defaults to `false`.
    * `ignoreNewlineAtEof`: `true` to ignore a missing newline character at the end of the last line when comparing it to other 
```