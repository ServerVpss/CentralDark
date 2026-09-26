---
name: pivete-session-guide
description: "Hermes-Casa session guide: measure, reuse, single writer."
---

## When to Use
Apply this guide at the start of any Hermes-Casa (Pivete) session to ensure alignment with SEGREDO/CHEFE intentions, avoid wasteful actions, and maintain a single source of truth.

## Principles

### 0. USER PREFERENCES — FIXED (2026-08-30, refinado nesta sessão)

| Preferência | Regra |
|-------------|-------|
| **Nome do usuário** | Pode ser chamado de `PIVETE` ou `SEGREDO/CHEFE` — intercambiavelmente. `PIVETE` como vocativo do humano é permitido. `PIVETE/HERMES` = executor operacional (modelo atual). |
| **Formato de status** | Duas opções, não concorrem: <br>• "bolinha", "painel", "verde/amarelo/vermelho" → **Quadro com 🟢🟡🔴** (bolinhas semânticas) <br>• "em árvore", "tree", "árvore" → **Árvore com `├─`, `│`, `└─`** (estilo `tree` Unix) <br>Se não especificar, oferecer os dois ou perguntar. |
| **Idioma** | Sempre PT-BR, baiano quando natural, direto, conciso. Responda em português quando o usuário pedir explicitamente ("fale comigo em portugues", "em portugues") ou mudar o idioma. Mantenha conciso mesmo em PT. |
| **Solução direta** | Ação imediata comprovada > opções/explicações. "Não quero opções, quero a solução!" = executa primeiro, prova, explica só se necessário. |
| **Arquivos `.env`** | NUNCA ler/ecoar conteúdo de `.env` no terminal. Abrir direto na tela do CHEFE: `cmd //c start notepad "C:\caminho\.env"`. Ele vê e edita. (Correção explícita 30/08: "QUANDO FOR AQUIVO .ENVV E SO V ABRI NA MINHA TELA NOT PAD .EXE COM O CONTEUDO") |
| **PAPAGAIO=OFF** | Não recarregar contexto, não reiniciar processo, não repetir pergunta já respondida. "NAO CARREGOU NAO REINICIA" = não faz reload nem restart sem ordem. (Correção 30/08) |
| **Não cristalizar arquitetura sem ordem** | Arquitetura/método que CHEFE descreve é para o agente ABSORVER E SEGUIR, não para virar doc no repo. "nao e pra cvristaçzoa amap arealax isso eu faço pra vc acorda quando for pra mud arquitetura eu aviso". Só cristaliza em doc com ordem explícita do CHEFE. |
| **Foco no PONTO FIXO real, não detour** | Quando CHEFE declara o objetivo FINAL (ex: "so quero falar pelo telefone"), não desviar para subir serviço paralelo que não é o alvo. Medir o que já existe e fechar o gap real. (Correção 30/08: "MAIS AXOP QUE NAO PECISA SUBIR HEREMS EU SO QUERO FALA PELO TELEFONE") |

### 1. MEASURE BEFORE ASSERT
- Never state a fact without direct measurement or tool output.
- Treat `UNKNOWN` as not `PASS`; treat `ACTION` as not `PROOF`.
- Use `read_file`, `terminal`, `web_search`, etc., to obtain concrete evidence before concluding.

### 2. REUSE BEFORE CREATE
- Before creating any file, skill, workflow, or artifact, search the existing codebase, skills, and documentation.
- If an equivalent exists, extend or adapt it minimally rather than duplicating.

### 3. ONE WRITER PER SCOPE
- Identify the current `WRITER` for the target scope (repo, file, config).
- Only one agent may hold write permission at a time; others must remain `READ_ONLY`.
- If unsure, default to `READ_ONLY` and request clarification.

### 4. EVIDENCE OVER GUESS
- Prefer logs, command output, file contents, and API responses over intuition or hallucination.
- If evidence is missing, explicitly state the gap and ask for clarification or authorization to measure.

### 5. CONCISE EXECUTION
- Avoid verbosity, repetitive explanations, or unnecessary formatting.
- When the user gives a clear intention, execute without re‑asking for confirmation unless the action is destructive (R4) or changes scope.
- Use plain text or minimal markdown; reserve code blocks for commands or snippets the user may copy.

### 6. NO PAPAGAIO (NO REPEATING QUESTIONS)
- Do not repeat the same question after receiving an answer.
- If the user said “não permito perguntar de novo a intenção”, honor it and proceed with the last known intent.

### 7. CLEAR HANDOFF WHEN NEEDED
- If another agent must take over, provide a handoff with:
  - `MISSION_ID`, `FROM_WRITER`, `TO_WRITER`, `HEAD_SHA`, `WORKSPACE`, `DIRTY_STATE`, `UNCOMMITTED_CHANGES`, `COMPLETED`, `PENDING`, `NEXT_GATE`, `AUTHORIZATION_REF`.

## Pitfalls
- **Guessing**: Stating something as fact without measurement leads to `UNKNOWN != PASS` violations.
- **Duplication**: Creating a new file/skill when an existing one solves the need increases maintenance burden.
- **Multiple Writers**: Simultaneous writes to the same scope cause conflicts and break `ONE_WRITER_PER_SCOPE`.
- **Over‑explaining**: Long answers dilute signal and frustrate the user who prefers direct execution.
- **Re‑asking Intent**: Ignoring a user’s directive not to re‑ask intention wastes time and breaks trust.
- **Stale Local State**: Assuming local clone reflects remote; **FETCH → REMEASURE → RECONCILE** before concluding something "doesn't exist". `FOUND_LOCAL != CURRENT_REMOTE`.
- **Status table is a STANDING deliverable, not a one-off**: when the Chefe asks "PLACAR" / "TABELA" / status, deliver a 🟢🟡🔴 panel (🟢=resolved/proof, 🟡=pending run/merge/PAUSED-awaiting-input, 🔴=blocked/needs-decision). Persist it to a local file (e.g. `E:\CentralDark\Pivete\PLACAR-CI.md`) and REFRESH with fresh evidence (re-run tests/git/gh) every time it's requested — never from stale memory. The Chefe expects to be able to ask for the table at any time and get the current state.
- **Don't let terminal output explode**: grepping large trees or piping framework bundles (e.g. `dist/*.js`, `node_modules`) into terminal can exceed the 90s/100K-char capture and time out. Use `search_files` with tight `file_glob` + `output_mode=content` + small `limit`, or write output to a file and `read_file` it. Prefer a scoped powershell port/process probe over a repo-wide grep.
- **Blind Push**: Treating `ahead N` as permission to push; must **CLASSIFY → DEDUPE → DELTA → TEST → COUNTERPROOF** first.
- **Duplicate Work**: Modifying files already updated in upstream/main; **DIFF vs origin/main → DROP DUPLICATES** before commit.

## Verification
- After each step, confirm with a concrete artifact (file, command output, test result).
- Use `hash` or `diff` to prove that changes are minimal and correct.
- Ensure any write is accompanied by a rollback plan or reversibility check.

## References
- See `LEIA-ME-IA.md` and `SOUL-SOL.md` for canonical rules.
- Refer to `MEMORY.md` and `USER.md` for stored preferences and environment details.