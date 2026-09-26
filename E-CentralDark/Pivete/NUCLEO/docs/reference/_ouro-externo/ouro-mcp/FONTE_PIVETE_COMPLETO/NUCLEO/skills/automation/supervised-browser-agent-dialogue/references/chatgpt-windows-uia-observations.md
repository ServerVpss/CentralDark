# ChatGPT on Windows via UIA — validated observations

## Scope

Session-specific evidence from a supervised exchange with an AI in an already-authenticated ChatGPT tab on Windows. These observations explain the durable workflow in the parent skill; they are not universal guarantees for every browser build.

## Observed target shape

- Native browser window and conversation document were distinguishable by PID, window ID, title, selected tab, and conversation URL.
- The retained conversation produced more than one thousand accessibility elements.
- A deeper bounded walk was needed to reach the newest response and composer.
- Printing the entire accessibility result exposed unrelated retained content and browser chrome. Future probes must filter inside the script and emit only target evidence.

## Composer labels observed

```text
Edit: Converse com o ChatGPT
Empty value exposed as: Pergunte ao ChatGPT
placeholder: Pergunte alguma coisa
Send button: Enviar prompt
Generating button: Parar de responder
Completed response action: Copiar resposta
```

Treat the placeholder value as empty only after confirming the control is the expected ChatGPT composer.

## Validated send sequence

```text
1. Snapshot and validate window, document, conversation marker, and composer.
2. Read the composer twice if a real draft exists.
3. Set the exact message.
4. Snapshot again and verify the exact composer value.
5. If the send button is absent, poll briefly instead of failing immediately.
6. Bind the send button from the newest snapshot.
7. Click once in background mode.
8. If the click effect is unverifiable, inspect state rather than retrying.
9. Confirm that the message appears in the transcript and the composer clears.
10. Wait for generation to stop and for the response action bar after the sent marker.
```

## Framework-latency observation

The accessibility value changed before the web application exposed the send button. An immediate post-write check falsely reported that the send button was missing. A later snapshot showed both the exact draft and the enabled send button.
Durable lesson: separate `value confirmed` from `send control ready`; poll the second condition with a short bound.

## Unverifiable click observation

The background click returned an `unverifiable` effect, but the next snapshot proved all of the following:

- the sent text was present in the transcript;
- the composer returned to its placeholder;
- the generating control appeared.

Durable lesson: an unverifiable transport receipt is not a failed send. Verify the application state before any retry.

## Draft-preservation observation

A pre-existing user draft was detected during the first inspection. It changed before the automated turn began, proving that draft state is live and can race with the user.
For later turns, a test phrase was intentionally left unsent while a metrics report had to be sent. The workflow temporarily replaced the phrase, sent only the report, then restored and verified the unsent phrase.
Durable lesson: the composer is user state. Preserve, restore, and verify it; never treat it as disposable automation scratch space.

## Completion boundary

The response was considered complete only when:
```text
sent-message marker exists
AND no generating/stop button is visible
AND the first Copiar resposta action after that marker exists
```
Older action bars before the marker do not prove that the current turn completed.

## Baseline measurement

One measured locate-and-arm cycle produced:
```text
TEMPO_TOTAL=3.890s
BUSCAS=2
ROLAGENS=0
CLIQUES=0
VALIDACOES_COMPLETAS=0
VALIDACOES_CURTAS=2
MAIOR_GARGALO=long UIA conversation scan
```
The exact numbers are historical evidence, not future performance targets. Preserve the counters and compare like-for-like cycles.

## Nova sessão 07/08/2026 — list_windows + UIAccess gate

**Elementos estáveis observados (ChatGPT, Windows, 125 chrome.exe):**
```text
App:         chrome.exe  PID 1740
window_id:   12391728
HWND:        0xbd1530
title:       "Explicação do Hermes - Google Chrome"
campo:       contenteditable, aria-label="Converse com o ChatGPT"
placeholder: "Pergunte alguma coisa"
element_id:  2186 (estável entre capturas na mesma sessão)
```

**Erro UIAccess (recorrente, dead-end confirmado):**
```
SetForegroundWindow(0xbd1530) → REJECTED
actual foreground = HWND 0x21c08f0
"daemon is not at UIAccess integrity"
```
- `foreground` delivery mesmo após `focus_app` → recusado
- `SendKeys` → keystrokes vão pra janela ativa (PowerShell/terminal), não pro Chrome
- `focus_app` (sem raise) → funciona para input routing, mas NÃO para foreground swap

**Grafico temporal (Pivete method):** não refazer o mapa a cada rodada. Reusar PID + window_id + element_id da primeira captura bem-sucedida. Só re-mapear se processo morreu, URL mudou, ou janela fechou.

**Telementria 07/08 (meta 10 rodadas):**
```text
RODADA 1: T0=03:05:00, captura_ok=2s, campo_achado=2186, SEM_DIGITAR
RODADA 2: focus_app_ok, captura_ok, elemento_ok, GATE_UIA=bloqueou
```

**Compositor ChatGPT (HTML real — 07/08/2026):
```html
<div contenteditable="true" id="prompt-textarea"
     aria-label="Converse com o ChatGPT"
     data-virtualkeyboard="true" role="textbox" aria-multiline="true">
  <p data-placeholder="Pergunte alguma coisa" class="placeholder"><br></p>
</div>
<!-- textarea real tem style="display:none" -->
```
Selector certo: `#prompt-textarea` ou `aria-label="Converse com o ChatGPT"`.

## Validation depth rule learned during the dialogue

```text
before click, tab change, focus change, process change, or navigation
→ full validation

after only scrolling or read-only polling
→ short validation: window + recent conversation marker + expected state
```
This reduced repeated work without weakening target certainty.

## Background waiting

A bounded background monitor kept the local chat responsive while waiting. It emitted only:

- sent-marker status;
- generating status;
- action-bar status;
- filtered response text;
- timeout or completion receipt.

Do not emit raw accessibility trees from long personal browser sessions.
