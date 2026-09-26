# COMANDO - COVERAGE.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\COVERAGE.md
**SHA:** 62c26ba90219e10b
**Timestamp:** 2026-08-23T14:15:53.494196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | chat-new-chat-first-message-ux.spec.ts | macos | chat-ai, real-ui-e2e | chat, chat-first-message-ux, chat-turn-status | medium | partial | real-user-flow | 1 | Real + new chat through the first assi

### Ouro Bruto (primeiros 5000 chars)
```
# E2E Coverage Map

This is a behavioral coverage dashboard for the Tauri/WebDriver E2E suite.
It is not line or branch coverage. A spec contributes coverage to each platform
and layer declared in the manifest, weighted by confidence and criticality.

- Manifest: `e2e/coverage-map.json`
- Specs directory: `e2e/specs`
- Mapped specs: 120
- Declared test blocks: 351
- Weighted coverage points: 275.5

Confidence weights: strong=1.0, partial=0.7, conditional=0.4, smoke=0.3.
Criticality weights: high=1.0, medium=0.7, low=0.4.
Declared test blocks are counted statically from source, so parameterized specs
can execute more runtime cases than this number shows.

## Platform Summary

| Platform | Specs | Declared tests | Weighted points | Layers | Features | Critical score |
| --- | --- | --- | --- | --- | --- | --- |
| windows | 91 | 301 | 245.9 | 15 | 97 | 92% |
| macos | 116 | 313 | 245.3 | 17 | 104 | 90% |
| linux | 80 | 259 | 215.3 | 14 | 94 | 88% |

## Runtime Results

No runtime result directory was supplied. Run with
`--results-dir e2e/results` after WDIO emits runtime JSON to include actual
pass/fail/skip counts.

## Layer Matrix

| Layer | windows | macos | linux |
| --- | --- | --- | --- |
| audio-device | 4 specs / 32 tests / 21.8 pts | 4 specs / 6 tests / 2.9 pts | - |
| auth | - | 1 specs / 1 tests / 1.0 pts | - |
| billing | 4 specs / 6 tests / 5.7 pts | 4 specs / 6 tests / 5.7 pts | 4 specs / 6 tests / 5.7 pts |
| capture-ocr | 2 specs / 16 tests / 6.4 pts | 8 specs / 12 tests / 4.8 pts | 1 specs / 3 tests / 1.2 pts |
| chat-ai | 26 specs / 57 tests / 43.1 pts | 38 specs / 79 tests / 57.2 pts | 25 specs / 56 tests / 42.6 pts |
| entitlement | - | 1 specs / 1 tests / 1.0 pts | - |
| local-api | 25 specs / 114 tests / 95.0 pts | 33 specs / 104 tests / 87.5 pts | 20 specs / 82 tests / 73.2 pts |
| notifications | 4 specs / 26 tests / 17.3 pts | 3 specs / 5 tests / 3.4 pts | 2 specs / 4 tests / 3.1 pts |
| onboarding | 9 specs / 37 tests / 32.8 pts | 11 specs / 39 tests / 34.2 pts | 9 specs / 37 tests / 32.8 pts |
| os-integration | 7 specs / 30 tests / 25.5 pts | 14 specs / 27 tests / 16.0 pts | 2 specs / 13 tests / 9.4 pts |
| performance | 2 specs / 44 tests / 44.0 pts | 4 specs / 34 tests / 30.5 pts | 1 specs / 29 tests / 29.0 pts |
| pipes | 6 specs / 19 tests / 19.0 pts | 8 specs / 25 tests / 25.0 pts | 6 specs / 19 tests / 19.0 pts |
| real-ui-e2e | 65 specs / 202 tests / 166.5 pts | 79 specs / 210 tests / 172.4 pts | 60 specs / 178 tests / 152.6 pts |
| settings | 14 specs / 40 tests / 37.0 pts | 16 specs / 34 tests / 29.7 pts | 13 specs / 31 tests / 28.0 pts |
| storage-privacy | 9 specs / 42 tests / 33.3 pts | 9 specs / 27 tests / 26.1 pts | 6 specs / 20 tests / 19.1 pts |
| tauri-command | 19 specs / 52 tests / 40.1 pts | 27 specs / 64 tests / 48.3 pts | 18 specs / 53 tests / 40.9 pts |
| window-lifecycle | 19 specs / 66 tests / 55.0 pts | 19 specs / 46 tests / 32.4 pts | 13 specs / 39 tests / 29.9 pts |

## Critical Feature Matrix

| Feature | Required layers | windows | macos | linux |
| --- | --- | --- | --- | --- |
| App launch and Home shell | real-ui-e2e | covered (strong; app-lifecycle, onboarding-redirect) | covered (strong; app-lifecycle, onboarding-redirect) | covered (strong; app-lifecycle, onboarding-redirect) |
| Home to floating Search | real-ui-e2e | covered (strong; windows-user-journey, tray-search) | covered (partial; tray-search, search-request-priority) | covered (partial; tray-search, search-request-priority) |
| Timeline navigation and frames | real-ui-e2e | covered (strong; windows-user-journey, windows-core-recording) | covered (strong; timeline, home-window) | covered (strong; timeline, home-window) |
| Real capture, OCR, and indexing | capture-ocr | weak (conditional; windows-core-recording, timeline) | weak (conditional; capture-stall-recovery, timeline) | weak (conditional; timeline) |
| Local API auth enforcement | local-api | covered (strong; api-search-stress, windows-system-integration) | covered (strong; api-search-stress, api) | covered (strong; api-search-stress, api) |
| Local API search stability | local-api | covered (strong; api-search-stress, windows-core-recording) | covered (strong; api-search-stress, search-request-priority) | covered (strong; api-search-stress, search-request-priority) |
| Database hard-fault fail-closed containment | local-api, tauri-command | covered (strong; db-hard-fault-fail-closed) | covered (strong; db-hard-fault-fail-closed) | covered (strong; db-hard-fault-fail-closed) |
| Screen and audio settings UX | settings | covered (strong; settings-sections, windows-user-journey) | covered (strong; settings-sections, meeting-apps-picker) | covered (strong; settings-sections, meeting-apps-picker) |
| Screen-share window privacy preference | settings, tauri-command | covered (strong; settings-sections, windows-user-journey) | covered (strong; settings-sections) | - |
| AI presets and preferences UX | settings | covered (strong; setting
```

---

# COMANDO - COVERAGE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\COVERAGE.md
**SHA:** 62c26ba90219e10b82c30706631613ab6b68f7c86506d176bbd10f15446e5a3f
**Timestamp:** 2026-08-23T23:43:14.074032
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | chat-new-chat-first-message-ux.spec.ts | macos | chat-ai, real-ui-e2e | chat, chat-first-message-ux, chat-turn-status | medium | partial | real-user-flow | 1 | Real + new chat through the first assi

### Ouro Bruto (primeiros 5000 chars)
```
# E2E Coverage Map

This is a behavioral coverage dashboard for the Tauri/WebDriver E2E suite.
It is not line or branch coverage. A spec contributes coverage to each platform
and layer declared in the manifest, weighted by confidence and criticality.

- Manifest: `e2e/coverage-map.json`
- Specs directory: `e2e/specs`
- Mapped specs: 120
- Declared test blocks: 351
- Weighted coverage points: 275.5

Confidence weights: strong=1.0, partial=0.7, conditional=0.4, smoke=0.3.
Criticality weights: high=1.0, medium=0.7, low=0.4.
Declared test blocks are counted statically from source, so parameterized specs
can execute more runtime cases than this number shows.

## Platform Summary

| Platform | Specs | Declared tests | Weighted points | Layers | Features | Critical score |
| --- | --- | --- | --- | --- | --- | --- |
| windows | 91 | 301 | 245.9 | 15 | 97 | 92% |
| macos | 116 | 313 | 245.3 | 17 | 104 | 90% |
| linux | 80 | 259 | 215.3 | 14 | 94 | 88% |

## Runtime Results

No runtime result directory was supplied. Run with
`--results-dir e2e/results` after WDIO emits runtime JSON to include actual
pass/fail/skip counts.

## Layer Matrix

| Layer | windows | macos | linux |
| --- | --- | --- | --- |
| audio-device | 4 specs / 32 tests / 21.8 pts | 4 specs / 6 tests / 2.9 pts | - |
| auth | - | 1 specs / 1 tests / 1.0 pts | - |
| billing | 4 specs / 6 tests / 5.7 pts | 4 specs / 6 tests / 5.7 pts | 4 specs / 6 tests / 5.7 pts |
| capture-ocr | 2 specs / 16 tests / 6.4 pts | 8 specs / 12 tests / 4.8 pts | 1 specs / 3 tests / 1.2 pts |
| chat-ai | 26 specs / 57 tests / 43.1 pts | 38 specs / 79 tests / 57.2 pts | 25 specs / 56 tests / 42.6 pts |
| entitlement | - | 1 specs / 1 tests / 1.0 pts | - |
| local-api | 25 specs / 114 tests / 95.0 pts | 33 specs / 104 tests / 87.5 pts | 20 specs / 82 tests / 73.2 pts |
| notifications | 4 specs / 26 tests / 17.3 pts | 3 specs / 5 tests / 3.4 pts | 2 specs / 4 tests / 3.1 pts |
| onboarding | 9 specs / 37 tests / 32.8 pts | 11 specs / 39 tests / 34.2 pts | 9 specs / 37 tests / 32.8 pts |
| os-integration | 7 specs / 30 tests / 25.5 pts | 14 specs / 27 tests / 16.0 pts | 2 specs / 13 tests / 9.4 pts |
| performance | 2 specs / 44 tests / 44.0 pts | 4 specs / 34 tests / 30.5 pts | 1 specs / 29 tests / 29.0 pts |
| pipes | 6 specs / 19 tests / 19.0 pts | 8 specs / 25 tests / 25.0 pts | 6 specs / 19 tests / 19.0 pts |
| real-ui-e2e | 65 specs / 202 tests / 166.5 pts | 79 specs / 210 tests / 172.4 pts | 60 specs / 178 tests / 152.6 pts |
| settings | 14 specs / 40 tests / 37.0 pts | 16 specs / 34 tests / 29.7 pts | 13 specs / 31 tests / 28.0 pts |
| storage-privacy | 9 specs / 42 tests / 33.3 pts | 9 specs / 27 tests / 26.1 pts | 6 specs / 20 tests / 19.1 pts |
| tauri-command | 19 specs / 52 tests / 40.1 pts | 27 specs / 64 tests / 48.3 pts | 18 specs / 53 tests / 40.9 pts |
| window-lifecycle | 19 specs / 66 tests / 55.0 pts | 19 specs / 46 tests / 32.4 pts | 13 specs / 39 tests / 29.9 pts |

## Critical Feature Matrix

| Feature | Required layers | windows | macos | linux |
| --- | --- | --- | --- | --- |
| App launch and Home shell | real-ui-e2e | covered (strong; app-lifecycle, onboarding-redirect) | covered (strong; app-lifecycle, onboarding-redirect) | covered (strong; app-lifecycle, onboarding-redirect) |
| Home to floating Search | real-ui-e2e | covered (strong; windows-user-journey, tray-search) | covered (partial; tray-search, search-request-priority) | covered (partial; tray-search, search-request-priority) |
| Timeline navigation and frames | real-ui-e2e | covered (strong; windows-user-journey, windows-core-recording) | covered (strong; timeline, home-window) | covered (strong; timeline, home-window) |
| Real capture, OCR, and indexing | capture-ocr | weak (conditional; windows-core-recording, timeline) | weak (conditional; capture-stall-recovery, timeline) | weak (conditional; timeline) |
| Local API auth enforcement | local-api | covered (strong; api-search-stress, windows-system-integration) | covered (strong; api-search-stress, api) | covered (strong; api-search-stress, api) |
| Local API search stability | local-api | covered (strong; api-search-stress, windows-core-recording) | covered (strong; api-search-stress, search-request-priority) | covered (strong; api-search-stress, search-request-priority) |
| Database hard-fault fail-closed containment | local-api, tauri-command | covered (strong; db-hard-fault-fail-closed) | covered (strong; db-hard-fault-fail-closed) | covered (strong; db-hard-fault-fail-closed) |
| Screen and audio settings UX | settings | covered (strong; settings-sections, windows-user-journey) | covered (strong; settings-sections, meeting-apps-picker) | covered (strong; settings-sections, meeting-apps-picker) |
| Screen-share window privacy preference | settings, tauri-command | covered (strong; settings-sections, windows-user-journey) | covered (strong; settings-sections) | - |
| AI presets and preferences UX | settings | covered (strong; setting
```