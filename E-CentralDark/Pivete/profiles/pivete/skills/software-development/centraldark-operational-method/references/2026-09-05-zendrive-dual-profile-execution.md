# Zendrive Dual-Profile Execution (2026-09-05 continuous delta + UI recovery)

## Summary
Zendrive for "minha contra GPT" using two real Chrome profiles in CentralDark under SOUL.

- Segredo (Profile 15, controlled/lock) → capture → feed to Fulano (Profile 14, live/contra) → reconcile.
- Share extensions (robocopy + junctions to same local dir) or export.
- Absorb delta into existing elite-gateway (no new V2, reuse before create).
- Dump JSON ([{role, text}]) → gateway/proxy for CentralDark API (behind the scenes).
- Screenpipe for UI observation when needed.
- Reanchor with SOUL, consume full context (Caracol HTML for session convos on profiles/extensions/linking/contra/PEGATUDO/10 frentes).
- Honest traffic lights in all status/HUD/cartaz: only 🟢 on real proof.

## Profiles (measured)
- Segredo (Cobra Conta): C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15 (contacobra3467@gmail.com)
- Fulano: C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14 (sonasmarcas@gmail.com)
- Base dir: C:\Users\danda\AppData\Local\Google\Chrome\User Data

**Script support** (local_send_dump.py):
```python
REAL_PROFILES = {
    "segredo": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15",
    "fulano": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14",
}
PROFILE_NAME = os.getenv("ZENDRIVER_PROFILE", "segredo").lower()
PROFILE = REAL_PROFILES.get(PROFILE_NAME, REAL_PROFILES["segredo"])
```
- Run with env var for switching.
- HEADLESS env: set HEADLESS=false for visible (critical for first real E2E).

## Extensions
- robocopy Profile 14/15 Extensions to SharedExtensions.
- mklink /J in both profiles to shared dir.
- 5 extensions shared. Close Chrome before/after.

## Script Improvements (this session + prior)
- Launch args: `--disable-session-restore --no-first-run --disable-features=Translate,ChromeLabs`
- Force navigation: target_url = "https://chatgpt.com/"
- Detect wrong pages (images, pricing, /pt-BR/pricing) and `page.goto("https://chatgpt.com/")`
- ensure_chat_input (aggressive, 40s):
  - Check div[contenteditable="true"] || textarea
  - Broad textContent search for "novo chat" / "new chat" (any element)
  - Dismiss modals: click elements with "cancelar", "fechar", "x", "close"
  - Click logo/header, sidebar first item
  - Multiple attempts + logging action taken
- Inject: re-find broadly (div or textarea), set innerText or .value, dispatch input
- Both / contra mode: `python local_send_dump.py both "prompt"`
  - Runs segredo first.
  - Captures assistant.
  - Runs fulano with "Como contra ou reconcile usando a resposta anterior: [text]".
  - Saves reconciled_both.json with both sides.
- Capture loop: looks for [data-message-author-role="assistant"], saves full msgs + last_messages.json.
- Fallback page_state.txt on failure.

## Runs & Current Proof (honest, post user "CROME FEXEI")
- Real profiles launch + user_data_dir correct: 🟢
- Disable restore + force chat URL + broad clicks: 🟢 (attempts logged)
- Input field detection (loose check): sometimes 🟢 ("found after 0s")
- Real assistant response in DOM (E2E): 🟡 (mechanism ready; runs hit images/modal "Conclua a criação da sua imagem" + restore popup; input not stable in main chat)
- Dual flow + reconcile: 🟡 (logic in place)
- Dump to gateway: 🟡 (ready to wire)

**Key pitfall fixed this session**: Restore popup + images/pricing/modal state from unclean close → --disable-session-restore + force goto + aggressive modal dismiss + broad "novo chat" + user manual assist.

**User signal "FALAT IR JA COM A CONTA LOGADA"**: Profile is logged (avatar shows), but UI state (images generator modal) blocks text chat input. Account login is there; navigation/state recovery is the blocker.

## Exact Checklist to Make Everything Green (user asked "OQUE FALAT AGOAR PRA GENTE TESTAR TUDO E FICA ATUDO VERDE" + "RODA AGORA TODA AS PENDENCIAS")
1. Close Chrome GUI completely for both Profile 14 and 15 (clean close, no restore).
2. Run with real prompt (visible):
   ```
   cd .../test-local
   ZENDRIVER_PROFILE=segredo HEADLESS=false .venv/Scripts/python.exe local_send_dump.py both "SEU PROMPT EXATO DA MINHA CONTRA GPT AQUI (ex: Você é minha contra GPT...)"
   ```
3. When browser opens (visible window):
   - If on images/pricing/modal "Conclua a criação da sua imagem" or restore popup → **manually click "Novo chat" in left sidebar** (top button).
   - Wait for main chat text input box to appear.
4. Script will auto-inject prompt, send, wait for assistant.
5. Verify:
   - last_messages.json and reconciled_both.json contain real "assistant" text >10 chars.
   - No persistent "contenteditable not found" after manual assist.
6. Wire dump to existing gateway (elite-gateway / :8099 / omni-router): read reconciled_both or last_messages, serve as OpenAI-compat response (model "zendrive/contra").
7. Test API call returns the contra response.
8. Update cartaz/HUD only with new 🟢 (use traffic lights 🟢🟡🔴⚪).
9. Absorb improved script + checklist into elite-gateway owner.
10. Reanchor + consume Caracol HTML/images for continuity.
11. Same-head test + PR.

**Never mark green until real runtime proof (REALITY=JUDGE).** "Tudo verde" only after E2E real text + reconcile + gateway wire.

## Honest Status Discipline (from cartaz review this session)
- Cartaz/HUD is architecture view + current state.
- Review all claims: "Dump JSON pronto" → "FORMATO pronto 🟡 real response aguardando".
- "Fluxo entre perfis" → "Definido 🟡 E2E real pendente".
- "100% PONTO FIXO" → "Alvo 🟡 NEXT: E2E".
- RESULTADO FINAL → "ALVO DO FIXED POINT" with current lights.
- Always table or lights in status. No false green.

## Gateway Integration
Dump/reconciled JSON is the source.
Absorb into existing openai_http_gateway.py or elite scripts:
- Read last_messages or reconciled.
- Return as messages in /v1/chat/completions.
- Model tag: "zendrive/contra" or similar.

## Pitfalls (add to all Zendrive work)
- Profile in use → close GUI Chrome first.
- Restore popup + previous tabs (images/pricing) → --disable-session-restore + force URL + manual "Novo chat" assist first run.
- Images generator modal ("Conclua a criação") blocks text input → dismiss attempts + sidebar click.
- Welcome/login page → ensure_chat_input + new chat trigger (or manual first login).
- Headless may not trigger real backend reply → use visible for proof runs.
- No cookie sync between accounts (separate logins).
- Incognito loses persistence.
- Always reanchor SOUL before work.
- Consume full context (HTML + images) for profiles, extensions, contra, PEGATUDO.
- One system: everything into elite-gateway + centraldark-operational-method.
- Input finder mismatch (ensure loose vs inject strict) → keep selectors in sync (div[contenteditable] || textarea).
- User direct style: respond with numbered checklist + exact commands when asked "o que falta" or "roda agora".

## Workflow (minimal effective)
1. Map + confirm real profiles (python parse Local State).
2. Share extensions (robocopy + junctions).
3. Update script with map + disable-restore args + force chat + aggressive ensure + both mode + HEADLESS support.
4. Close GUI → visible run both with real contra prompt.
5. If stuck on images/modal: manual "Novo chat" in sidebar.
6. Verify real text in dumps.
7. Reconcile + save combined.
8. Wire to existing gateway.
9. Update HUD/cartaz with honest lights.
10. Absorb delta (no V2).
11. Reanchor + handoff.

Proven deltas this session: disable-session-restore launch, force navigation + wrong-page recovery, aggressive ensure with modal dismiss + broad text search + textarea support, sync between ensure/inject finders, practical "manual assist 1x" protocol for image-generator state, direct checklist format for user "RODA AGORA" / "FICA TUDO VERDE" requests.

Related:
- dual-chrome-profiles-zendrive.md
- zendrive-agent-integration.md
- screenpipe-vision
- centraldark-operational-method (main)

Update for future: always prioritize real E2E proof before claiming green. Delta continuo. One system. Nothing left behind. REALITY=JUDGE.

## User Preference Reinforced (embed in all CentralDark ops)
- Direct "what's missing" numbered checklists + exact commands.
- Ultra-concise when asking "OQUE FALAT AGOAR" or "RODA AGORA".
- No over-optimism in status (honest 🟡).
- Execute the test first (visible run), report lights.
- "FALAT IR JA COM A CONTA LOGADA" → assume logged profile; focus on UI state recovery (images vs text chat).
- When user shows screenshot of exact browser state (pricing/images/modal), treat as ground truth for next action (force navigation, manual click guidance).
- "TUDO FEXADO ! CROME FEXEI" → acknowledge clean close, then run immediately with visible + recovery logic.

## Execution Notes from Latest Run (user closed Chrome)
- Command executed with visible + fixes.
- Multiple "Attempted to start new chat / go to chat".
- "Chat input found after 0s" (loose check passed).
- Then strict inject check failed → ERR (UI still in images state).
- page_state confirmed image-viewer / conversation data + modal context.
- Lesson: Even with aggressive logic, first visible run after images-heavy session may require the 1-click "Novo chat" from user. Script recovers after that.

Always deliver the run + immediate verification command + "if stuck, click X" guidance.