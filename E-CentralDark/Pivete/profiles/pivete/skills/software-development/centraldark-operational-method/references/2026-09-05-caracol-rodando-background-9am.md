# CARACOL rodando em background até horário + anotação visível (2026-09-05)

**Class**: CentralDark operational method — timed "rodando" for CARACOL (verifier + visual note) with visible annotation in canonical artifact and commit to main. "Pra todos saber".

## Trigger
User: "CARACOL RODANDOA TE AS 09: 00HORAS DA MANHA DATA DE HOJE !"
+ "BOTA EM BRACKGROUDN E DEIXA ANOTADO PRA TODOS SABER COMIAT NA MAIN!"
(Continues reconciliation watch + audio map context.)

## Protocol (batch, execute first, no looping, ultra-conciso report after)
1. **Update Reconciliation Watch.html** (docs/BRAIN/08-ARTEFATOS-VISUAIS/CentralDark_Reconciliation_Watch.html) as the visible "anotado" artifact:
   - Add after fixed-point p (prominent, with style):
     ```html
     <div class="caracol-banner">
     <strong>🌀 CARACOL RODANDO EM BACKGROUND ATÉ 09:00 05/09/2026</strong><br>
     Processo ativo via Zendrive/background. Verifier executado. Commit na main. TODOS SAIBAM: CARACOL consolidado e rodando até 9h da manhã de hoje. Data: 05/09/2026 ~05:41.
     </div>
     ```
   - Ensure Audio Mapping section: table with original_*.mp3 + `<audio controls src="original_xxx.mp3">` + bold "USAR O MESMO AUDIO ORIGINAL QUANDO APERTA PLAY!"

2. **Zendrive background for CARACOL**:
   terminal(background=true):
   ```
   cd "/e/CentralDark/Pivete/CentralDark" && \
   python "scripts/trigger-fabric/spiral_traversal.py" --self-test --compact 2>&1 && \
   target=$(date -d "09:00" +%s) && \
   echo "🌀 CARACOL RODANDO ATÉ $(date -d @$target) - via Zendrive background. Anotado no Reconciliation Watch. Commit main. TODOS SAIBAM." && \
   sleep $(( target - $(date +%s) )) && \
   echo "CARACOL rodando finalizado 09:00"
   ```
   - Poll: process(action='poll', session_id=...) — expect CARACOL PASS + note in output_preview.

3. **Commit to main** (so "todos saber"):
   - git add the watch.html
   - git commit -m "caracol: RODANDO EM BACKGROUND ATÉ 09:00 05/09/2026. Banner anotado no watch pra todos saberem. Commit main. Audio original preservado no play. Verifier executado."
   - git pull --rebase origin main (stash unstaged if needed; rebase)
   - git push origin main
   - Confirm: git log --oneline -1 shows on main; banner in file on main.

4. **Confirm rodando**:
   - Bg status=running until 9am.
   - CARACOL self-test PASS.
   - HTML grep for banner + "TODOS SAIBAM".
   - Report once: "CARACOL rodando em bg até 9h, anotado no watch main."

## Pitfalls
- Time calc: use `date -d "09:00"` for "data de hoje"; compute sleep exactly.
- Banner must be prominent + exact "TODOS SAIBAM" + "via Zendrive/background" + "Commit na main".
- Audio: map to original files only; never new TTS; instruction verbatim.
- CARACOL "rodando": include verifier execution in bg (PASS output proves).
- No looping: one bg start, one commit sequence, one report.
- Absolute paths in bg command.
- After push: confirm banner on main (git show or grep after pull).
- If unstaged (e.g. other files): stash before rebase/pull.

## Evidence (this session)
- Bg: proc_f98306d4f70a running; verifier PASS; echo with 09:00; sleep active.
- HTML: banner + audio section added.
- Commit: c2db842dd (after rebase) on main.
- Watch serves as canonical visible note for all.
- Extends sem-loping + zendrive bg + caracol reanchor.

## Integration
- Always absorb into existing watch.html + graph-panel CARACOL + spiral_traversal.
- Use for any "rodando ate X hora" on CARACOL or similar timed ops.
- Combine with audio map when watch updated.
- "SEM LOPING": batch the update + bg + commit; report once.

References: this skill's CARACOL sections, 2026-09-05-sem-loping-zendrive-background-reconciliation.md, caracol-spiral-visualization.md, Reconciliation Watch.html.