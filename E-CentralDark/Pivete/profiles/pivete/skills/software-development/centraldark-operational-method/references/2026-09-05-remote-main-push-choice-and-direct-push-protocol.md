# Remote Main Push Choice and Direct-to-Live Protocol (2026-09-05)

## User Desire Signal (Class Level)
- "mais deveria ir direto pra main pro remoto pq nesse caso e o meu desejo"
- "ai tem qeu ter a opçao de escolher sim u nao ou quer continua so olocal ou quer manda logo pro ao vivo  pro remeto main !"
- "quero sim" + "ENTREGUE PRONTO" + "NÃO PRECISA FALA" + "manda logo pro ao vivo"
- Context: After local commit (rastro), link gave 404 on GitHub preview because not pushed. User connected GPT + GitHub in UI, wants persistent ("fica salvo pra mi so desloga se qu quizer em algum botao").

## Required Behavior
When the above signals appear in context of promotion to main (Zendrive, fixed point, rastro, gateway feed):

1. Recognize as explicit desire for remote main ("ao vivo").
2. Do NOT present options unless user explicitly asks for choice.
3. Execute "manda logo":
   - Commit current package (Zendrive/elite-gateway/test-local relevant files + JSON) as micro with clear message including "desejo do Chefe: direto pro ao vivo".
   - If unstaged changes block (e.g. other M files): commit the package first, or stash non-package.
   - git fetch
   - If behind: git pull --rebase (after clean)
   - git push origin main
4. Report ultra-concise: "Push: old..new main -> main. Agora no remoto main. Link: https://github.com/ServerVpss/CentralDark/commits/main"
5. The user 's logged GPT + GitHub connection stays saved; the capture uses the open session ID (20260905_010608_8c07f9 in this case).
6. "Entregue pronto": No "próximo passo", no extra explanation. Show the JSON, the push result, the usage (dropdown CENTRAL DARK GATEWAY + paste).

## Choice Presentation (Only When Explicitly Requested)
If user says "tem que ter a opção de escolher":
- Present exactly:
  1. Só local (continua aqui)
  2. Manda pro remoto main agora (ao vivo)
- Execute the chosen without further talk.
- Default when "quero sim" or "meu desejo" is path 2.

## Example from Session (Successful Path)
- Local state: ahead 2, behind 1, unstaged M files.
- Committed Zendrive package micro.
- Later committed remaining deltas.
- pull --rebase succeeded (rebased 4).
- push succeeded: b527cf2f1..1878a45fc main -> main.
- Result: rastro now visible on remote (no more 404 for future links).

## Pitfalls
- 404 on preview: commit was local only. Always push when desire is remote.
- Divergence (behind): must pull --rebase after committing package. Force is forbidden.
- Unstaged blocking pull: commit the relevant package first.
- Verbose explanation: forbidden when "quero sim" or "entregue pronto". Execute + show result only.
- Typing instructions in terminal (e.g. "NÃO CORRIJA NADA." at PS prompt): PowerShell treats Portuguese as command. Advise full path commands or use the chat for instructions.

## Integration with Existing
- Extends "MICROPACOTES DE COMMITS NA MAIN" and "FAÇA O COMMIT NA MAIN DEIXANDO RASTRO REPETINDO TUDO".
- Uses "EXECUTE PRIMEIRO, RELATE DEPOIS".
- "VOCÊ MESMO USA": the push and run mock were executed in tools.
- Absorb into existing (no new skill).

## Verification
- After push: git log --oneline -1 on main shows the micro.
- Remote link works.
- User can select dropdown and paste the JSON from logs/zendrive_capture.json.
- Connection (GPT logged + GitHub) persists until user logs out via button.

This protocol ensures when the Chefe wants "direto pro remoto main" or "ao vivo", it happens immediately with the option available when requested.