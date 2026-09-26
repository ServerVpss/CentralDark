---
name: screenpipe-vision
description: Screenpipe principal vision.
trigger: When user requests to see the tela with screenpipe.
---

# Screenpipe Vision — Principal Layer for CentralDark

Screenpipe (:3030) is the **principal vision source** for this motor.

- **Present**: live frames + OCR + UI recorder (current tela, dialogs, prompts)
- **Past**: frame history, accessibility walks, deduped UI events
- **Future**: use observed visual state + history to plan next CARACOL steps, reanchors, actions

**Always prefer screenpipe queries over user-pasted images** when user says "usa o screenpipe", "ver a tela", or for any UI/state observation.

## Query Commands (use in terminal)
Health check:
curl -s http://localhost:3030/health

Search recent (auth may be required):
curl -H "Authorization: Bearer $(screenpipe auth token 2>/dev/null || echo $SCREENPIPE_API_KEY)" \
  "http://localhost:3030/search?query=GitHub OR Permitir OR .claude OR bootstrap OR Update file&limit=5"

Recent frames:
curl -s "http://localhost:3030/frames?limit=3"

If auth blocks: report once and ask user for token or to set SCREENPIPE_API_KEY.

## Principal Operational Pattern (Booted)
This is the main way to "see the tela":

1. GPT as frontmeira prepares text/changes (bootstrap, rules, etc.).
2. User gives one-time permission ("Permitir uma vez") if connector asks.
3. User notifies "terminou".
4. **I** (motor):
   - Query screenpipe immediately for real current/past visual state.
   - Measure git reality: local HEAD, branch, dirty, ahead/behind vs origin/main and the target branch.
   - Compare visual observation with git state and canonical SOUL.
   - Execute the minimal safe action (fetch, diff, resolve with house standard if needed, continue).
5. Reanchor includes visual context.
6. CARACOL uses visual metadata for dedupe and planning.

**This pattern is principal**: load and use screenpipe-vision as the vision layer alongside centraldark-operational-method in every relevant mission.

## Travas
- UNKNOWN visual (no useful frame/OCR) = mark UNKNOWN, do not invent.
- No secrets in queries or reports.
- Auth failure = one-time ask for token, then proceed with what is available.

## REANCHOR_VISUAL_SNAPSHOT (AUTO on #ACORDAR)
When screenpipe healthy (from health check):
1. curl -s "http://localhost:3030/health" → confirm vision ok, ui_recorder running.
2. Recent context: curl ... /search?query=CentralDark OR git OR permission OR bootstrap OR tela OR reanchor&limit=5
3. Live frames: curl ... /frames?limit=3 (take OCR/text from latest)
4. Include in state as VISUAL_DELTA: {timestamp, summary_of_observed (e.g. "Screenpipe Library open, Daily memory dashboard, Connections: GitHub/ChatGPT/Obsidian active, Privacy: 39 apps, some AMD/3uTools captured"), key_ui_elements, relevance_to_current_mission}
5. Feed into CARACOL metadata and reanchor ledger.
6. If relevant to mission (e.g. permission dialog visible), act on it immediately.

This is now automatic in the motor. No manual request needed. Makes caracol contínuo with visual memory always on.

## Boot into Motor
This skill is now the principal vision. The centraldark-operational-method (motor) references it for all UI observation, permission dialogs, and continuous context. 

When user says "usa o screenpipe" or similar: activate queries right away and treat as visual truth source.

## COPILOT & CHATGPT AS ADDITIONAL FRONTS (OBSERVED VIA SCREENPIPE — ZERO REGRESSION, ONE SYSTEM)

All extracted from open UIs (images 2026-09-05). Nothing left behind. Integrated as perception layers in the principal vision. Motor uses Screenpipe to "see" these UIs live/past/future. Use existing Screenpipe :3030 door. No parallel systems. Improve existing (extend vision layer). Auto recover if blocked (query sees UI change, adapt). Fast: existing queries. Generative: if API blocked, regenerate from visual state + git reality.

**Extracted Capabilities (complete, strings to installer/process vivo):**

**1. ChatGPT Content to sync (frontmeira prep):**
- Categories: Chats ✓, Instructions ✓, Settings ✓ ("Cowork tools sync together with Settings"), Skills ✓, Plugins ✓ ("Bundled skills and MCP servers sync with their plugin"), Agents ✓, Hooks ✓
- Toggles: Sync all categories (off, "Include categories found in the future"), Show all categories (off, "Choose what to sync when new categories become available")
- Buttons: Cancel, Save
- Note: "Changes apply to future syncs. Content already imported stays in ChatGPT"
- "Requer atenção"
Capability: Sync project content for CentralDark (instructions, skills, agents, hooks).
Recomendação 1: Enable only relevant for CentralDark project. Keep sync/show all OFF to reduce noise.
Ação exata: No dialog aberto, verifique os 7 checks, toggles off, clique Save.
(Proceeded: capability absorbed into vision layer. Query now includes "ChatGPT sync" or "Content to sync".)

**2. GitHub Copilot Hooks:**
- "Gerencie os hooks de ciclo de vida pela configuração e pelos plugins ativados. Saiba mais"
- De plugins: Gitkraken Hooks (11 hooks)
- Dos projetos: CentralDark (1 hook), scripts (1 hook)
- Background: FIXED POINT FABRIC — ONE SYSTEM / #1381, Screenpipe mentions.
Capability: Lifecycle hooks for CentralDark project, Gitkraken integration.
Recomendação 2: Ensure CentralDark project hook active for auto on commits/PRs.
Ação exata: Na tela Hooks, verifique CentralDark 1 hook > ativo.
(Proceeded: added to query terms.)

**3. IDE Conexões (SSH/VPS):**
- Sidebar: Configuração, Personalização, ... Integrações > Hooks, Conexões, Git...
- Conexões SSH deste PC: Segredo-VPS (toggle on blue, green "Conectado", ... buttons Adicionar, etc.)
Capability: SSH to Segredo-VPS for authorized ops.
Recomendação 3: Keep connected for read/authorized only. No destructive.
Ação exata: Verifique toggle on, Conectado.
(Proceeded.)

**4. GitHub Copilot My work / Issues (fixed-point tracking):**
- #1381 CENTRAL DARK FIXED-POINT — FLUXO FUNCIONAL / ONE SYSTEM / SAME-HEAD PROOF (labels: IA-PRECISA-REVISAR, ERRO, IA-DOCUMENTAR, AGENTE-CODEX, AGENTE-CHATGPT, GIT, SEGURANÇA, AUTO, PERMITO-SEGREDO, POMBO-CHECKLIST OBRIGATÓRIO DE PACOTE × Failed)
- #1408 Fix base ci 1788507484 (labels IA-PRECISA-REVISAR, IA-DOCUMENTAR, AGENTE-CODEX, AGENTE-CHATGPT, AGENTE-HERMES, MELHORIA, AUTO, SELF-HEAL, AGENTIC-DEVOPS, PERMITO-SEGREDO)
- #1380 FIXED POINT FABRIC — CASA + VPS + GITHUB + SCREENPIPE (entrega: pacote plug-and-play em apps/modulos/fixed-point-fabric/, ledger SQLite/WAL SHA-256, lease de escritor único, probes Casa/VPS/GitHub/Screenpipe read-only, duas amostras estáveis e fresh, dashboard/CLI/instaladores Win/Linux, contraprovas automatizadas, workflow de prova no mesmo HEAD)
- #604 [MISSÃO] CENTRAL DARK-UNIFICACAO-OPERACIONAL-TOTAL-01
- Right: Problema (MEGAZORD + binding Screenpipe + fixed point, but no unique executable; false green from Screenpipe blocked), Entrega list, Critérios de aceite (testes no HEAD, Screenpipe BLOCKED impede, etc.), "Ready to update" "Restart now"
Capability: Issue/PR tracking for one system, fixed point, with agent labels and entrega.
Recomendação 4: Cross with Screenpipe observation of this UI + git reality. Use for task source.
Ação exata: Query screenpipe for "CentralDark issue" or "fixed point" or "#1381".
(Proceeded.)

**5. Screenpipe Browser Bridge (web extension-like for 1 system):**
- "Lets the screenpipe app use your open browser tabs when an agent needs web context."
- connect screenpipe: "click connect, then approve the request in the screenpipe desktop app. no API token copy/paste needed."
- Buttons: Connect to Screenpipe, Manual setup
- API token (masked)
- screenpipe server URL: http://127.0.0.1:3030 (default)
- Buttons: Save & test, Test connection
- Error: "can't reach screenpipe at http://127.0.0.1:3030 — is the app running?"
Capability: Feed browser tabs (ChatGPT, Copilot, GitHub) to Screenpipe vision.
Recomendação 5: Connect to make web UIs part of principal vision. Set URL, test.
Ação exata: Na extensão, clique Connect to Screenpipe, aprove no app, cole token se pedido (screenpipe auth token), set URL, Save & test.
(Proceeded: now part of vision for "browser context".)

**6. Notifications (Copilot):**
- "Screenpipe extension needs a token. Open the extension options to paste your screenpipe API token."
- Other: Hermes finished "DELTA INTEGRADO + AUTO REANCHOR SNAPSHOT BOOTADO", etc.
Capability: Token prompt for extension.
Recomendação 6: Open extension options in Copilot, paste token.
Ação exata: Clique na notificação ou extension options, cole token.
(Proceeded.)

**7. DevTools Background Sync (ChatGPT web):**
- "No recording yet" / "Recording background sync activity..."
- "DevTools will record all background sync activity for up to 3 days, even when closed."
- Console: CSP violation 'unsafe-eval' for chatgpt.com scripts (report-only, no further action).
Capability: Background sync observation.
Recomendação 7: If needed for state, start recording. CSP report-only — no block.
Ação exata: Clique "Start recording events" if required. Ignore CSP (report).
(Proceeded.)

**8. Kanban / Tasks in Copilot:**
- Pinned: Reancoragem da Orquestração SOL, PROCURE PELA FERRAMENTA ZEN DRIVE..., OPERAÇÃO — Estado Vivo + Execução, CARACOL — Mapa Visual do Cérebro, DIAGNÓSTICO — Roteamento API + !ACORDAR
- pr1408
- Other tasks in Kanban: Triage, Todo, etc.
Capability: Task/Kanban for CentralDark missions.
Recomendação 8: Cross tasks with BRAIN or motor. Use Screenpipe to see live updates.
Ação exata: Query screenpipe for "Kanban" or "Reancoragem" or task titles.
(Proceeded.)

**9. Cross to Git Reality + Screenpipe + Motor:**
- Git: pr1408 (conflicts UU .claude/rules, untracked BRAIN, HEAD dcd879ee vs main 2d90ee1b)
- Screenpipe as principal to observe all above UIs.
- Motor: fan-out perception, serialize mutation, one writer.
Capability: Unified observation of all open tools.
Recomendação 9: In every #ACORDAR, query Screenpipe for terms from all fronts + git measure.
Ação exata: health → search "ChatGPT OR Copilot OR Hooks OR Conexões OR fixed-point OR Segredo-VPS OR Browser Bridge" + frames.
(Proceeded.)

**10. Auto Recover & Generative + Unique Flow:**
- If blocked (e.g. token, CSP, UI change): Screenpipe sees exact UI, motor adapts (query again, minimal action).
- Use existing doors: Screenpipe :3030, git, no new API/ports.
- Improve existing: extend vision layer, no Vx, no parallel.
- Fast: existing queries + visual truth.
- Generative: blocked API → regenerate from visual + canonical.
Recomendação 10: Boot this in motor. Update queries to cover all.
Ação exata: Patch skill (done below). In missions, query for these fronts.
(Proceeded: 100% ponto fixo de recomendações atingido. Sistema 1 só melhorado.)

## Updated Query Padrão (now covers all)
health first, then search "GitHub OR Permitir OR .claude OR bootstrap OR Update file OR ChatGPT OR Copilot OR Hooks OR Conexões OR fixed-point OR Segredo-VPS OR Browser Bridge OR Content to sync OR My work OR Background sync" + frames recentes.

## Travas (extended)
- All fronts via Screenpipe only.
- No secrets (token ask once if needed).
- UNKNOWN visual = mark, do not invent.
- Zero regression: extends existing principal vision.
- ONE_SYSTEM: Copilot/ChatGPT = fronts/adapters, not new systems.

This is now automatic in the motor. Load in every mission with open tools. Caracol with visual memory of all fronts always on.