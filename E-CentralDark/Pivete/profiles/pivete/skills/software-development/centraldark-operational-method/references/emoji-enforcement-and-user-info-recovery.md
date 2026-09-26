# Emoji Enforcement and User-Determined Information Recovery

**Session signal (2026-09-05):** Multiple explicit corrections on response style, verbosity, emojis, and information loss.

## Emoji Rules (from user corrections + PADRAO-EMOJIS.md)
- Always load `docs/CONSCIENCIA/PADRAO-EMOJIS.md` before emitting any emoji.
- Use ONLY emojis from the canonical table:
  - Gatilhos: 🔥 (#ACORDAR), 🧭 (!CALIBRAR), 🎯 (!MULTIBUSSOLA), 🔍 (META LUPA)
  - Status: ✅ (sucesso), ⚠️ (atenção), ❌ (erro), 🔄 (em andamento), ⏳ (aguardando), 🔒 (protegido)
  - Agentes: 👑 (CHEFE), 💎 (SOL), ⚡ (Hermes), 🔧 (Pivete legado)
- 1 emoji = 1 specific gatilho/ação/status. No repetition across columns or decorative use.
- Never use free-form emojis (😎🧠🔥😂💎 excessive casual ones) or traffic-light circles outside the table unless explicitly in PADRAO.
- User signal: "C TA USANDO OS EMOGIS ? QUE EU ESEMPRE PESSO ?" — enforce the ones he determines via the doc.

## Information Recovery Protocol (user out-of-band + style corrections)
- "VERIFICA POR QUE STA PERDENDO ESSA INFORMAÇOES E MELHORE ! A RECUPERÇAO DE INFORMAÇOSE QUE EU DETERMINO !"
- Always start with reanchor: load LEIA-ME-IA.md, SOUL-SOL.md, AGENTS.md, FREQUENCIAS-OPERACIONAIS-SOL.md, CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json, PADRAO-EMOJIS.md.
- User-determined facts (e.g. Zendrive multi-profile setup for simultaneous local access to sonasmarcas@gmail.com + segredo accounts via dumps, unified surface strategy, specific Drive access topology) must be recovered and preserved — do not lose them in verbose or casual responses.
- Legacy/garimpo files (e.g. claude-legacy-memory.md): treat as candidate matéria.
  - Map against current SOUL invariants (ONE_SYSTEM, REUSE, NO_V1_V2, REALITY=JUDGE, SEGREDO_CHEFE authority, PIVETE as executor not human name).
  - Absorb only deltas that match (authority command, security rules, stack facts).
  - Mark historical/outdated as provenance (old PRs, "Pivete" as primary name, old multi-AI default, old emoji formats).
  - Never let legacy override current canonical.
- Use memory tool for durable user facts; update this skill immediately on style/verbosity corrections (per existing rule in this skill).
- Response structure priority: action direct → proven result → next (if needed). No explanatory fluff, no "vai pro sofá", no KKKK, no excessive narrative.

## Pitfalls to avoid (from this session)
- Falling back to previous verbose casual style with lots of emojis and filler when user shows screen/diagram or pastes history.
- Losing focus on technical verification (e.g. Drive access via local Zendrive vs cloud) by adding unrelated chat.
- Treating garimpo/legacy memory as authoritative instead of reconciling first.

Add to every operational response when relevant: confirm canonical emoji use and that user-determined info was recovered/preserved.