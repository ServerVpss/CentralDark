# CONTRATO - nvidia-runtime.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\references\dependencies\nvidia-runtime.md
**SHA:** 3b49c2a9ebf51680
**Timestamp:** 2026-08-26T18:39:42.132982
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- `ovstream` WebRTC browser client example as the reference pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# NVIDIA Runtime Dependency Source Of Truth

This file is the single source of truth for NVIDIA runtime dependency
acquisition in this skill package. Downstream skills may name the runtime they use
and document API behavior, but they should not repeat package URLs, release
URLs, workflow artifact links, registry paths, or fallback install locations.

## Primary NVIDIA Dependencies

| Dependency | Acquisition path | Used by | Guidance |
|---|---|---|---|
| `ovrtx` | NVIDIA Python package index | Local and streaming RTX USD rendering | Resolve the latest available package from this location. |
| `ovui` | PyPI package | Native local UI and server-side/headless overlay UI | Resolve the latest available package from this location. |
| `ovstream` | PyPI package | WebRTC and SHM streaming server/runtime | Resolve the latest available package from this location. |
| `ov-web-rtc client` (`@nvidia/ov-web-rtc`) | NVIDIA npm package | Browser-side WebRTC client for standalone `ovstream` Direct connections | Use the package guidance below. |

## Version Selection Rule

For new generated viewer apps, install the latest available `ovrtx`, `ovui`, and
`ovstream` packages from the acquisition locations in this file. Do not copy a
resolved version number into downstream skills, templates, or setup recipes.

If the host project already has a manifest or lockfile with an explicit runtime
pin, respect that pin unless the user asks to update it. If compatibility
requires a pin, keep it in the project manifest with a short reason rather than
in this dependency source of truth.

## Supplemental Dependency Documentation

These links centralize dependency documentation and examples. Use them for
dependency-specific API behavior that is not covered by the selected viewer
skills.

| Dependency | Current documentation pointer | Use for |
|---|---|---|
| `ovrtx` | <https://github.com/nvidia-omniverse/ovrtx> | Renderer API behavior, Python/C API notes, stage composition, render-var/AOV behavior, picking/selection behavior, and release notes. |
| `ovui` | <https://github.com/NVIDIA-Omniverse/ovui> | Widget behavior, `ovwidgets`, `omni.ui`, headless overlay behavior, and native UI conventions. |
| `ovstream` | <https://github.com/NVIDIA-Omniverse/ovstream> | Library-specific `skills/`, sample servers, WebRTC lifecycle, SHM/client behavior, native input, examples, and package release notes. |

Use this table only as supplemental documentation when the selected references do
not contain enough detail for dependency-specific API behavior.

For `ovstream`, always check the supplemental repository when the task needs
library-specific behavior, newer transport examples, native input details, or
implementation patterns beyond this viewer skill package. That repository owns
additional `skills/` and samples for the streaming library itself.

## Package-Index Dependencies

### ovrtx

Use the NVIDIA Python package index for `ovrtx`.

Current supplemental repository pointer:
<https://github.com/nvidia-omniverse/ovrtx>

```bash
python3 -m pip install --upgrade ovrtx --index-url https://pypi.nvidia.com --extra-index-url https://pypi.org/simple
```

If a project provides `server/requirements.txt`, prefer that project manifest
over an ad hoc direct install. Preserve existing pins in that manifest unless the
user asks to update them.

For ovrtx API behavior, renderer configuration, render vars, picking, selection,
stage composition, or release-specific behavior not covered in this skill package,
use the supplemental documentation pointer above.

### ov-web-rtc client

Use the released `@nvidia/ov-web-rtc` package for the browser client that
connects to standalone `ovstream` WebRTC servers in Direct mode. This skill
package targets `ovstream` plus `ovrtx` viewer services. Those services may be
containerized and launched by OKAS, Kubernetes, or another GPU session
orchestrator. Do not use Kit, OVC, NVCF, or GFN client connection profiles as
the browser WebRTC configuration; after orchestration resolves an endpoint, the
frontend still uses Direct mode against the exposed `ovstream` signaling host
and port.

Use the current released package. Do not copy resolved client version numbers
into skills, templates, or setup recipes:

```text
registry=https://registry.npmjs.org/
@nvidia:registry=https://edge.urm.nvidia.com/artifactory/api/npm/omniverse-client-npm/
```

```bash
npm install @nvidia/ov-web-rtc
```

For the `ovstream`-compatible Direct connection shape, use the current
`ovstream` WebRTC browser client example as the reference pattern:
<https://github.com/NVIDIA-Omniverse/ovstream/tree/main/examples/webrtc_client>

Use `@nvidia/ov-web-rtc` for new browser clients. Do not document alternate
browser streaming package names, legacy package names, or Kit/OVC/NVCF/GFN
client connection profiles for generated Omniverse Realtime Viewer apps.

## Centralized Dependencies

### GitHub Asset Retrieval

Use the package URLs and release selectors listed below. If direc
```