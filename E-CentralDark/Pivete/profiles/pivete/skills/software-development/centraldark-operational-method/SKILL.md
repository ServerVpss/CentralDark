---
name: centraldark-operational-method
description: Operar no CentralDark com metodo Pivete/Hermes.
trigger: Quando executar missões no repositório ServerVpss/CentralDark sob a metodologia Pivete/Hermes, incluindo reconciliação, classificação de rastro, operação com travas materiais e cognitivas, e preservação de deltas provados.
---

## PRINCÍPIOS OPERACIONAIS (INVARIANTES DESTA SESSÃO)

### 1. ARQUITETURA E SISTEMA
- **NÃO INVENTAR NOVA ARQUITETURA**: Hermes minera/reconcilia/comprime inteligência histórica existente, sem criar arquitetura nova
- **REUSE_BEFORE_CREATE**: Sempre buscar owner/skill/pasta existente antes de criar; estender canônico quando possível; só criar quando houver gap real provado
- **ONE_SYSTEM_ONLY**: Não criar sistema paralelo; não duplicar owner, skill, pipeline, painel ou dispatcher
- **NÃO CRIAR SISTEMA NOVO**: Proibir API nova, VPS bridge, daemon, webhook, bot, IPNAMES-V2, MEMORY-V2, duplicação de owner, sistema de notificação
- **MENOR MOVIMENTO EFICAZ**: Sempre identificar o caminho com menor movimento que resolve o problema; executar esse caminho; mostrar o resultado; não apresentar como escolha ou pedir confirmação desnecessária; reconsiderar apenas se houver nova evidência que invalide o resultado (correção crítica da sessão 2026-09-01)

### 2. CLASSIFICAÇÃO E VALOR
- **HISTORICAL ≠ CURRENT**: Histórico é proveniência/linhagem, não verdade atual. Juiz final é o que foi observável agora no local.
- **UNKNOWN ≠ PASS**: Ausência de evidência não vira aprovação. Sinal ausente, leitura vazia ou medição sem resposta permanece UNKNOWN.
- **DOCUMENTED ≠ EXECUTED**: Ter algo documentado não significa executado/comprovado.
- **NOTEPAD_STATE ≠ CANONICAL_TRUTH**: Estado do Notepad (abas/rascunhos) não é fonte de verdade canônica.
- **UNSAVED_TAB ≠ SAFE_TO_PERSIST**: Aba não salva não é segura para persistir como conhecimento.
- **SECRET_DETECTED → SENSITIVE_QUARANTINE**: Segredos detectados vão para quarentena sensível, nunca expostos.
- **RAW_LOCALSTATE → DO_NOT_COMMIT**: Estado local bruto não deve ser commitado.
- **OLD_GREEN ≠ CURRENT_GREEN**: Verde antigo (resultado histórico) não é verde atual (medição corrente).
- **PERSISTED_RECEIPT ≠ LIVE_RUNTIME**: Receipt persistido não é runtime vivo em execução.
- **CURRENT_GREEN_PROVEN + RUNTIME_LOCAL_PROVEN = REAL GREEN**: Só verde atual com prova de runtime local conta como verdadeiro.

### 3. AUTORIDADE E ESCRITA
- **ONE_WRITER_PER_SCOPE**: Um único Writer por escopo mutável. Nunca assumir escritor sem declaração; não duplicar atuação; não mudar posse silenciosamente.
- **CHEFE/SECRETO decide**: Apenas o humano (SEGREDO/CHEFE) decide o que só ele pode decidir (merge, deploy, produção, VPS, gasto, destruição).
- **Hermes prepara inteligência**: O agente prepara, mas o CHEFE entrega ao ChatGPT quando quiser.
- **Consumidor final**: Conversa ChatGPT do CHEFE (não serviço externo, não sistema de notificação).

### 4. EXECUÇÃO
- **LOCAL_REALITY = JUDGE**: O observável local (estado, runtime, rastro, git, health, logs, serviço) é juiz final — não narrativa, garantia ou relato.
- **MEDIR_AGORA**: Sempre medir estado atual antes de agir; não depender de histórico sem verificação.
- **CONTRA-PROVAR**: Derrubar cada conclusão antes de finalizar — tentar falsificar ativamente.
- **FLUXO OPERACIONAL**: RECUPERAR → RECONSTRUIR → DEDUPLICAR → CLASSIFICAR → RECONCILIAR → RESOLVER PENDÊNCIAS → CONTRAPROVAR → REMEDIR
- **CONDICIÃO DE PARADA**: Fim quando HANDOFF fechado/reproduzível ou NO_NEW_INFORMATION → NO_CHANGE ou bloqueio real explícito.

### 5. DAEMON ROBUSTO (»Was obligatoire para processos de longa duração)
Signal handlers + health check endpoint + auto-restart watchdog + PID file management + persistent logging + graceful shutdown = IMORTAL
- Processos de longa duração devem implementar: 
  1. Signal handlers (SIGTERM, SIGINT, SIGHUP)
  2. Health check endpoint HTTP
  3. Auto-restart watchdog (ex: verificar observer.is_alive() a cada 30s)
  4. PID file management (escrita atômica + atexit cleanup)
  5. Logging persistente (arquivo + stdout)
  6. Shutdown gracioso

### 6. IPNAMES (APENAS ENRIQUECIMENTO)
- **EXTERNAL_FEED ≠ NETWORK_TRUTH**: Feed externo não é verdade de rede.
- **IP_PRESENTE_NO_FEED ≠ SERVICO_AUTENTICADO**: IP no feed não prova serviço autenticado.
- **IP_AUSENTE_DO_FEED ≠ MALICIOSO**: Ausência de IP no feed não indica malícia.
- **FQDN_ASSOCIADO ≠ CAUSALIDADE**: FQDN associado não implica causalidade.
- **LOCAL_REALITY = JUDGE**: Sempre remeter ao juiz local observável.
- Se usado: registrar upstream repo + commit SHA + timestamp.
- Nunca copiar/vendorizar sem licença explicitamente comprovada.
- Nunca alterar automaticamente firewall/VPN/DNS/rotas.

### 7. OPERAÇÃO PARALELA
- **PARALELIZE_PERCEPCAO**: Percepção/read-only pode ser paralela quando útil (sem criar sistema novo nem duplicar owner).
- **SERIALIZE_MUTACAO**: Mutação deve ser serial e sincronizada no escopo correto (sem escrita concorrente nem criar parallelismo novo).

### 8. HANDOFF E CRISTALIZAÇÃO
- Usar owner existente; extender, não criar paralelo.
- Um delta útil = 1 PR canônico, dono existente, sem V2/V3/arquivo paralelo.
- **Handoff formato obrigatório**:
  ```
  === HANDOFF CHATGPT ===
  MEASURED_AT: [timestamp ISO 8601]
  CENTRALDARK_BRANCH: [branch name]
  CENTRALDARK_HEAD: [commit SHA]
  ACTIVE_PR: [PR number or NONE]
  WRITER_SCOPE: [escopo de escrita autorizado]
  NOTEPAD: [estado do Notepad LocalState]
  DEDUPED_ITEMS: [contagem ou referência]
  SENSITIVE_QUARANTINED: [contagem de itens sensitives]
  HISTORICAL_ITEMS: [contagem de itens históricos]
  CURRENT_CANDIDATES: [contagem de candidatos atuais]
  FORMAT_VERIFIED: [sim/não]
  CURRENT_FACTS: [fatos medidos agora]
  SUPERSEDED_HISTORY: [o que foi histórico e agora é supersedido]
  OPEN_GAPS: [gaps identificados]
  CONTRADICTIONS: [contradições encontradas]
  IPNAMES_DELTA: [mudanças em IPnames]
  NEXT_SAFE_ACTION: [próxima ação segura autorizada]
  === END HANDOFF ===
  ```

### 9. MENSAGEM CORTA
- Se mensagem for cortada, confirmar recebimento e repetir o final.
- NÃO inventar conteúdo faltante.

### 10. SE SEGREDO APARECER
- **NUNCA** exibir, nunca persistir, nunca logar, nunca commitar, nunca incluir em quarentena expandida ou saída.
- Tratamento: PRESENCA=SIM|NAO, PERMISSAO=SUFICIENTE|INSUFICIENTE|UNKNOWN, VALOR=<NAO_LER>

### PREFERÊNCIAS DE COMUNICAÇÃO (CORREÇÕES DO SEGREDO/CHEFE)

### NO "PRÓXIMO PASSO" — PROSSIGA ATÉ FIXED POINT
- Quando usuário disser "NAO TEM PROXIMO PASSO", "PROSIGA ATE O PONTO FIXO", "NAO TEM PROXIMO", "CONTINUA ATE TER O PONTO FIXO E ESTADO APROVADO E LIBERADO PARA USO", " /GOAL!":
  - NÃO ofereça "próximo passo", "next", "agora faça X".
  - Execute o trabalho, prove (rode, mostre output, Screenpipe, git, reality).
  - Continue até os critérios do fixed point estarem atingidos (aprovado, liberado, provado, usável).
  - Só declare "Ponto fixo atingido. Estado aprovado e liberado para uso." quando realmente estiver.
  - Pitfall: "atrapalha" = oferecer caminho quando usuário quer execução contínua até o fim.
- "FAÇA O COMMIT NA MAIN DEIXANDO RASTRO REPETINDO TUDO": Quando pedido, commit direto na main com mensagem longa que repete o processo completo (procura, execução, provas, integração, fixed point). Deixar rastro explícito no git log.

### MICROPACOTES DE COMMITS NA MAIN (SEGUINDO INTENÇÃO)
- Trabalhe em micro-deltas (1 mudança pequena + prova por commit).
- Respeite regras da intenção: REUSE_BEFORE_CREATE, ONE_SYSTEM_ONLY, ONE_WRITER_PER_SCOPE, medir realidade primeiro, provar (rode você mesmo), integrar no existente (PEGATUDO, elite-gateway, omni-router, SOUL).
- Quando tiver quantidade suficiente de micros (pacote lógico que avança o fixed point pedido/apontado):
  - Commita na main (se já estiver na main) ou prepara o batch.
  - Continua no próximo micro.
- "Burocracia de tantos comandos e nada acontece": Cada micro deve entregar artefato visível rápido (arquivo, output, commit, uso no modelo via dropdown CENTRAL DARK GATEWAY).
- "Ninguém bota no ar": Priorize comandos que deixem o sistema usável agora (ex: rode mock, mostre JSON, instrua selecionar o gateway no dropdown e colar).
- Sempre "VOCÊ MESMO USA": Rode o agente/comando você, mostre o resultado real.

### APRESENTAÇÃO EM BAIANÊS + EMOJIS CANÔNICOS
- Respostas em baianês ultra-conciso quando usuário pedir ou em contexto de análise completa.
- Use emojis **exclusivamente** do padrão canônico (🔥 🧭 💎 ⚡ ✅ etc.). 1 emoji = 1 gatilho.
- Quando usuário pedir "APRENSETE PRA MIM COM EMOGIS E CONTANTO HISTORAI EM BAIANES": Conte a história completa cruzando VPS, main casa, GitHub remoto, todas as docs (SOUL, AGENTS, BRAIN, TRIGGER-FABRIC, status, ecosystem), sem deixar passar nada. Estrutura: história em baianês + emojis + cruzamento de camadas.

### CRUZAMENTO COMPLETO DO SISTEMA (VPS + MAIN CASA + GITHUB + DOCS)
- Sempre que pedido análise completa ("ANALISA COMPLETO PRA GENTE ESCAVA O SISTEMA INTEIRO"):
  1. Git: branch, HEAD local vs origin/main, status, commits recentes.
  2. Local casa: paths (E:\CentralDark\Pivete\CentralDark), arquivos Zendrive (test-local), Screenpipe :3030.
  3. VPS: PM2 CentralDark-EliteHTTP (gateway real com zendriver, porta ~8082), status "online".
  4. GitHub remoto: ServerVpss/CentralDark, PRs (1381, 1408 etc.), main como canônico.
  5. Docs: SOUL-SOL (regras), AGENTS (boot + medir), BRAIN/GRAFO (mapas), TRIGGER-FABRIC (PEGATUDO), status/infra-vivo (EliteHTTP), ecosystem (PM2), MAPA-DE-ROTAS-VPS.
  6. Zendrive: mock local (teste simples) + real VPS (EliteHTTP). Saída 1 local (zendrive_*_capture.json). Integrado como gateway_feed pro omni-router/PEGATUDO F4.
  7. Modelo/Hermes: Dropdown CENTRAL DARK GATEWAY / Arsenal Router Med = forma de "usar no modelo aqui".
- Apresente cruzado com emojis e história em baianês.

### ESTELO
- **EXECUTE PRIMEIRO, RELATE DEPOIS**: Execute a ação solicitada primeiro e apenas então relate o resultado. Não explique, não justifique, não antecipe — apenas faça e depois relate o que aconteceu. (correção crítica da sessão 2026-09-03)
- **EVITE REPETIR INFORMAÇÃO JA DITA**: Se o usuário já forneceu um dado (ex.: caminho, comando, resultado), não peça novamente o mesmo item a menos que haja mudança real no estado. (correção crítica da sessão 2026-09-03)
- **BAIANÊS ULTRA-CONCISO**: "menos é mais", "APENAS FAÇA NÃO PERGUNTE"
- **EVITE EXPLICAR DEPOIS**: Padrão é executar → reportar resultado, não explicar → perguntar (correção crítica da sessão 2026-09-01)
- **EVITE MONTES DE TEXTO**: "voce ta mandando monte de texte" = exercício; resposta concisa é regra (correção crítica da sessão 2026-09-01)
- **OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA**: Ao apresentar 2-3 caminhos, pegar o de menor movimento, executar, mostrar resultado — não perguntar "A ou B?" (correção crítica da sessão 2026-09-01)
- **PROTOCOLO DORMIR/ACORDAR PARA OPÇÕES**: Se o fluxo exigir pedir opção ou decisão ao usuário, NUNCA pergunte diretamente ("qual opção?", "A ou B?"). Use o comando exato do usuário: envie "> /CENTRALDARK DORMIR" para pausar, depois "ACORDAR !CENTRALDARK" para retomar. (correção explícita 2026-09-05)
- **RE-ASK DE AUTORIZAÇÃO JÁ DADA = WASTED TURN**: Se autorização já foi dada, não reconfimar a cada turno (correção crítica da sessão 2026-09-01)
- **"Fable loop até o ponto fixo" = agente mede, age, salva acerto, repete, sem reconfirmar autorização** (correção crítica da sessão 2026-09-01)
- **SE HOUVER MAIS DE UM CAMINHO, PREFERIR O DE MENOR MOVIMENTO E MOSTRAR O RESULTADO**, não apresentar como escolha (correção crítica da sessão 2026-09-01)
- **SEMPRE QUE O USUÁRIO CORRIGIR ESTILO/VERBOSITY, INCORPORAR NA SKILL IMEDIATAMENTE, NÃO SÓ NA MEMÓRIA** (correção crítica da sessão 2026-09-01)
- **EMOJIS CANÔNICOS OBRIGATÓRIOS**: Sempre carregar primeiro `docs/CONSCIENCIA/PADRAO-EMOJIS.md`. Usar **exclusivamente** emojis da tabela canônica (🔥 para #ACORDAR/medição, 🧭 para !CALIBRAR, 💎 para SOL, ⚡ para Hermes, ✅ sucesso, ⚠️ atenção, ❌ erro, etc.). 1 emoji = 1 gatilho/ação/status específico. Sem repetição, sem decorativos, sem emojis casuais excessivos (ex: 😎🧠🔥😂 em massa). (correção explícita sessão 2026-09-05: "C TA USANDO OS EMOGIS ? QUE EU ESEMPRE PESSO ?")
- **RECUPERAÇÃO DE INFORMAÇÕES DETERMINADAS PELO CHEFE**: Priorizar e preservar fatos que o usuário determina (ex: setups Zendrive multi-perfil para acesso local unificado a Drives sonasmarcas + segredo via dumps, unified surface strategy, topologia específica). Começar sempre com reanchor (carregar LEIA-ME-IA + SOUL-SOL + AGENTS + FREQUENCIAS + CONTRATO-RECONCILIACAO + PADRAO-EMOJIS). Usar memória + owners canônicos. Não perder em respostas verbosas ou casuais. Tratar arquivos legacy/garimpo (ex: claude-legacy-memory.md) como matéria candidata: mapear contra invariantes SOUL atuais, absorver apenas deltas compatíveis, marcar histórico como provenance. (out-of-band + correções 2026-09-05: "VERIFICA POR QUE STA PERDENDO ESSA INFORMAÇOES E MELHORE ! A RECUPERÇAO DE INFORMAÇOSE QUE EU DETERMINO !")
- **VOZ EM PT-BR: Edge com pt-BR-FranciscaNeural** - Configure TTS para português do Brasil usando Edge e a voz FranciscaNeural quando o usuário solicitar áudio em português ou corrigir que o áudio está em inglês (correção crítica da sessão 2026-09-03)
### PROVIDER DISPONIBILIDADE**: Antes de assumir que um provider (ex: centraldark-router) está disponível, verifique se o serviço está em execução (ex: omni-router na porta 8099). Se não estiver, inicie o serviço existente (ex: centraldark_omni_router.py) em vez de criar um novo. (aprendizado da sessão 2026-09-05)
- **EVITE REINVENTAR O JÁ EXISTENTE**: Se já houver um serviço ou mecanismo que resolva o problema (ex: omni-router para provider centraldark-router), reutilize-o em vez de criar duplicata. (princípio ONE_SYSTEM_ONLY)
- **OMNI ROUTER FALLBACK CHAIN JÁ EXISTE** (descoberto 2026-09-05): `DEFAULT_FALLBACK_CHAIN = "nous,hermes,google,claude-code,xai,abacus,openai"` em `centraldark_omni_router.py:32` + `execute_with_failover` tenta cada provider na ordem, pulando não configurados. `CENTRALDARK_AUTO_FALLBACK` default `True`. Não criar outro fallback.
- **CADEIA DE AUTENTICAÇÃO EXISTENTE (2026-09-05)**: 
  - **Nous token** → lido dinamicamente do `E:\CentralDark\Pivete\auth.json` pelo Omni Router (`centraldark_omni_router.py:146`)
  - **Omni Router ativo** → porta 8099 respondendo; engine `nous` com modelos free; fallback `centraldark-router` no config.yaml
  - **MCP_CENTRALDARK_TOKEN** → definido no `ecosystem.config.cjs` (linha 72) mas **vazio localmente** — vem do ambiente VPS (`process.env.MCP_CENTRALDARK_TOKEN`), sincronizado via `sync-mcp-password.sh` do vault `/root/CentralDark/secrets/mcp-admin.password`
  - **Hermes profile** → `centraldark-router` como provider, base_url `http://127.0.0.1:8099/v1`
  - **O que falta**: `OPENAI_API_KEY` (OpenRouter), `HERMES_AUTH_TOKEN` (se usar Hermes local), trust do workspace no Claude Code (`projects["E:/CentralDark/Pivete/CentralDark"].hasTrustDialogAccepted: true`)
- **WINDOWS CLI / SUBPROCESS (WinError 206)**: Limite de linha de comando do Windows excedido em workspace grande. Mitigação: usar CLI pinning/tools (`hermes sessions pin`), limpar untracked antes de trabalho pesado com claude, preferir temp files para prompts longos. Distinguir "session deleted" de "spawn failed for length".
- **VISUALIZAÇÃO / LAYOUT RECONCILIATION**: Antes de criar demo standalone para efeitos visuais (ex: caracol/spiral para MAPA DO CEREBRO), busque primeiro "CARACOL", "spiral_traversal", "graph-panel". O CARACOL integrado (overlay em graph-panel/public/graph.js + verifier em scripts/trigger-fabric/spiral_traversal.py) é o owner canônico — demo é apenas ilustração. Sempre reconciliar com implementação existente; limpar edges inválidas (IDs inexistentes); TRAVERSAL ≠ SEMANTIC_EDGE. (aprendizado reanchor 2026-09-05)

### CARACOL rodando em background até horário + anotação visível
Sinal do usuário: "CARACOL RODANDO ATE AS HH:MM HORAS DA MANHA DATA DE HOJE !" ou "BOTA EM BRACKGROUDN E DEIXA ANOTADO PRA TODOS SABER COMIAT NA MAIN!"

- Atualize o artefato canônico Reconciliation Watch.html (docs/BRAIN/08-ARTEFATOS-VISUAIS/CentralDark_Reconciliation_Watch.html) com banner visível proeminente:
  ```html
  <div class="caracol-banner">
  <strong>🌀 CARACOL RODANDO EM BACKGROUND ATÉ 09:00 05/09/2026</strong><br>
  Processo ativo via Zendrive/background. Verifier executado. Commit na main. TODOS SAIBAM: CARACOL consolidado e rodando até 9h da manhã de hoje.
  </div>
  ```
- Mantenha/adicione seção de Audio Mapping com arquivos originais + `<audio controls src="original_*.mp3">` + **USAR O MESMO AUDIO ORIGINAL QUANDO APERTA PLAY!**
- Inicie background (Zendrive): terminal(background=true) executando o verifier CARACOL + echo do note + sleep até o horário (date -d "09:00").
- Commit na main imediatamente (git add html; commit com o note; pull --rebase; push).
- Confirme: process poll (rodando + PASS), grep banner no HTML, git log no main.
- "DEIXA ANOTADO PRA TODOS SABER": watch.html é o artefato visível canônico; banner + commit main garante acesso a todos.
- Batch (update + bg + commit) + report ultra-conciso uma vez. Execute primeiro.

Protocolo completo + pitfalls em `references/2026-09-05-caracol-rodando-background-9am.md`. Estende sem-loping + zendrive bg + caracol reanchor. Sempre absorver no watch + CARACOL integrado existente.
- **EVITE REPETIR SOLICITAÇÕES DE AJUDA**: Quando o usuário já forneceu orientação ou autorização explícita, não peça confirmação repetida a menos que haja mudança material no cenário ou risco. (aprendizado da sessão 2026-09-05)
- **EXTERNAL FRONT + AGENT OWNS GIT/REPO ACTIONS**: User uses GPT/ChatGPT as frontmeira to prepare bootstrap and governance files. User clicks "Permitir uma vez" in connectors. Agent must immediately take ownership: instruct the one-time permission, wait for user notification ("terminou"), then fetch, diff vs local (resolve UU with house standard), compare to main, execute git steps. Never hand "which button" or options back to user. User explicitly requires "VOC MESMO RODA E VOCE MESMO COMPARA".
- **SCREENPIPE COMO VISÃO PRINCIPAL (BOOT NO MOTOR)**: Screenpipe (:3030) é a camada de visão principal da Casa para presente (live frames + OCR + UI recorder), passado (histórico de frames, accessibility walks, deduped eventos) e futuro (usar estado observado para planejar próximos passos no CARACOL).
  - Sempre que usuário disser "usa o screenpipe", "ver a tela" ou equivalente: query imediatamente screenpipe em vez de pedir print ou imagem colada.
  - Query padrão: health primeiro, depois search por termos relevantes (GitHub, Permitir, .claude, Update file, bootstrap etc.) + frames recentes.
  - Auth: usar `screenpipe auth token` ou SCREENPIPE_API_KEY. Se bloquear, reportar uma vez e pedir token.
  - Integração com fluxo: GPT como frontmeira prepara → usuário "Permitir uma vez" → eu query screenpipe para confirmar o que está na tela real + medir git reality (local HEAD vs remoto/main) + executar menor ação segura.
  - Reanchor: observação visual vira parte do estado vivo (junto com git, runtime).
  - CARACOL: metadata inclui frame visual; dedupe visual; nucleus usa contexto observado.
  - Travas: UNKNOWN visual = marcar UNKNOWN, não inventar. Sem segredos. Auth bloqueio = pedir token.
  - Este padrão é principal: carregar em toda missão com UI, diálogos ou observação. Boot no motor operacional.

- **EXTERNAL FRONT + AGENT OWNS REALITY**: GPT/ChatGPT como frontmeira. Usuário dá permissão uma vez. Agent (eu) toma posse: usa screenpipe para ver, compara realidade local vs remoto, roda git, decide e executa. Usuário só notifica "terminou".

### HERMES DESKTOP SESSION PINNING (CRITICAL SESSIONS)
- Desktop sidebar (Shift-click to pin) is **visual/UI only** and has documented persistence bugs (often drops after restart, uses fragile local state; see GitHub issues on pinned sessions unpinned post-restart).
- Session object itself stays alive (message_count increases, searchable).
- For sessions that "must fica fixa" (SOL Orquestradora, main CHEFE interface): **use CLI for durable flag**.
  - `hermes sessions pin <id-or-prefix>`
  - Verify: `hermes sessions pinned`
- Live test workflow (user pattern): user pins → "PINADO!" → you respond (execute first) → **you confer** via tools (session_search <id> for liveness) + report "ainda viva" + "olha o sidebar" → user confirms UI pin.
- After response in pinned session: always check tool liveness (not just assume), report facts, ask for visual confirmation.
- Pitfall: assuming desktop PINNED section = reliable/durable. It isn't. CLI + tool verification + user visual double-check.
- When user says "ME PROVA", "CONFERE PRA VE SE ELA SAIU", "AVISA": execute the check with tools, report exactly (session alive? CLI pinned? ), note desktop may differ.
- Reference: `references/hermes-desktop-pinning-persistence.md`

### WINDOWS CLI / SUBPROCESS (WinError 206 "filename or extension too long")
- Recurring in this large CentralDark workspace (high untracked count in BRAIN/docs, long paths under E:\CentralDark\Pivete\..., heavy prompts).
- Hits claude_cli_start and similar spawns: HTTP 502 with detail containing [WinError 206].
- Root: Windows CreateProcess arg/command line length limit exceeded.
- Not related to session removal/pinning.
- Mitigations: use CLI pinning/tools where possible (`hermes sessions pin`), clean untracked before claude-heavy work, note that integrations should prefer temp files for long prompts (env-specific).
- In tests: always distinguish "session deleted" from "spawn failed for length".

### FORMATO
- **RESPOSTA EM PT-BR PARA TTS**: Inglês não tolerado para saída de áudio/voz
- **EVITAR JARGÃO DESNECESSÁRIO**: Usar termos técnicos somente quando preciso para precisão
- **ESTRUTURA DE RESPOSTA**: Ação direta → resultado provado → próximo passo somente se houver ação real necessária
- **EMOJIS E STATUS**: Usar **exclusivamente** conforme `docs/CONSCIENCIA/PADRAO-EMOJIS.md` (tabela canônica apenas: 🔥 🧭 💎 ⚡ ✅ ⚠️ ❌ etc.; 1 emoji = 1 gatilho/ação). Ver `references/emoji-enforcement-and-user-info-recovery.md` para regras completas de enforcement e protocolo de recuperação de fatos determinados pelo CHEFE. Nunca marcar verde sem prova runtime real (REALITY=JUDGE). Quando usuário pedir "o que falta pra tudo verde", entregar checklist numerado + comandos exatos.

### BOT ECOSYSTEM MAPEADO (2026-09-05)
- **GitHub Bot Controller** (`scripts/github-bot-controller.mjs` + `github-bot-controller.yml`): Fecha PRs superseded com receipt `Lineage-Absorption: #N@HEAD=PROVEN`; modes: `workflow_dispatch` + `pull_request.closed` + `schedule`
- **VPS HealthCheck** (`scripts/bots/vps-healthcheck.mjs` + `vps-healthcheck.yml`): 10 checks read-only (PM2, portas, disco, inodes, memória, load, Caddy, git, grok-worktrees, uptime); `schedule 6h` + `workflow_dispatch`
- **WuzAPI Sessions Monitor** (`scripts/bots/wuzapi-sessions-monitor.mjs`): Monitora sessões MultiZap/WuzAPI, sanitiza JIDs, abre/atualiza Issue dedup; `~15min`
- **Dispatcher Bots** (`dispatcher-bots.yml`): Roteia Issues/PRs por label `🧠 AGENTE-*` → posta briefing idempotente; `issues.labeled/opened` + `pull_request_target.labeled/opened`
- **Bot-Server Validate** (`bot-server-validate.yml`): 9 validadores offline (Lotes 2–10) p/ `bot-server/**`; `pull_request` + `push` + `workflow_dispatch`
- **Bots Labels Seed** (`bots-labels-seed.yml`): Reconcilia catálogo canônico de labels, migra aliases, remove obsoletas; `workflow_dispatch` + `schedule mensal` + `push main`
- **Lib compartilhada**: `scripts/bots/lib/gh.mjs` — helpers GitHub (findBotIssue, createIssue, updateIssue, repo)

### NOUS FREE MODELS VALIDADOS (2026-09-05)
- Token lido dinamicamente do `E:\CentralDark\Pivete\auth.json` pelo Omni Router (`centraldark_omni_router.py:146`)
- Modelos gratuitos funcionando no endpoint `https://inference-api.nousresearch.com/v1`:
  - `nous/poolside/laguna-xs-2.1:free` — 3.4s
  - `nous/stepfun/step-3.7-flash:free` — 43s (lento)
  - `nous/inclusionai/ling-3.0-flash-sante:free` — 2.9s
- Modelos pagos exigem créditos (ex: `meta-llama/llama-3.1-70b-instruct` → 404 insufficient_credits)
- Rota `nous/auto` → 404 "Model 'auto' not found" — precisa modelo explícito

### PR #1381 FIXED POINT — COMMITS APLICADOS (2026-09-05)
- `1ee31ea24eeb76b842f5b963ab1bb9e4fe5d122f`: MASTER_INGRESS_ALIASES + master_funnel + !CENTRALUTIL + anti-recursão/reentry guard + negação fail-closed
- `5ce6e667ec02818f18ed7dca84fc18b53ed59477`: contraprovas/testes do funil
- HEAD: `5ce6e667ec02818f18ed7dca84fc18b53ed59477` | BASE: `0542cee586e55be5334ba1e8d369d3b040ee1178` | STATE: OPEN | MERGEABLE: false
- CI remoto: `statuses=[]` (ainda não provado)
- Gatilho interno durante sessão ativa não reentra no master (evita loop `!CENTRALDARK → #ACORDAR → !CENTRALDARK`)

### CADEIA DE AUTENTICAÇÃO EXISTENTE (2026-09-05 — ATUALIZADA)
- **Nous token** → lido dinamicamente do `E:\CentralDark\Pivete\auth.json` pelo Omni Router (`centraldark_omni_router.py:146`)
- **Omni Router ativo** → porta 8099 respondendo; engine `nous` com modelos free; fallback `centraldark-router` no config.yaml
- **MCP_CENTRALDARK_TOKEN** → definido no `ecosystem.config.cjs` (linha 72) mas **vazio localmente** — vem do ambiente VPS (`process.env.MCP_CENTRALDARK_TOKEN`), sincronizado via `sync-mcp-password.sh` do vault `/root/CentralDark/secrets/mcp-admin.password`
- **Hermes profile** → `centraldark-router` como provider, base_url `http://127.0.0.1:8099/v1`
- **O que falta para cadeia completa**:
  - `OPENAI_API_KEY` (OpenRouter) no ambiente
  - `HERMES_AUTH_TOKEN` (se usar Hermes local)
  - Trust do workspace no Claude Code (`projects["E:/CentralDark/Pivete/CentralDark"].hasTrustDialogAccepted: true` no `~/.claude.json`)
  - `MCP_CENTRALDARK_TOKEN` sincronizado do vault VPS (`sync-mcp-password.sh`)

### GITHUB ACTIONS FAILURE PATTERN — SUBMODULE GHOST + COMMENT/REACTION PERMISSIONS (2026-09-05)
- Sintaxe YAML pode estar OK, mas ainda assim falhar por:
  1) checkout de caminho que já foi removido/alterado localmente e é referenciado como se fosse submodule (`worktrees/pr1393-porta-tokens`)
  2) operações de comment/reaction usando token que não tem permissão no contexto do runner (`GITHUB_TOKEN` sem acesso para criar comentário/reaction)
- Diagnóstico: `gh run view <run_id>` mostra annotations específicas; mensagens do tipo `Resource not accessible by integration` indicam permissão; `no submodule mapping found in .gitmodules` indica checkout fantasma.
- Fix mínimo preferencial:
  - remover referência a worktree inexistente do fluxo de checkout OU ajustar workflow para não operar em paths inexistentes
  - evitar etapas que dependam de permissões além de `pull-requests: read`/`contents: read` quando o token for `GITHUB_TOKEN`
- Regra derivada: **YAML_OK ≠ GREEN**. Workflow pode parsear e ainda assim ser BLOCKED no runtime por permissão ou estado do repo.

## ZENDRIVE DUAL PROFILE (E2E PROOF DISCIPLINE)
- Perfis reais + extensões shared + both/contra mode para "minha contra GPT".
- Script: REAL_PROFILES map via env, ensure_chat_input (new chat trigger), HEADLESS=false para visible E2E, both mode com reconcile em reconciled_both.json.
- Para virar tudo verde: fechar GUI Chrome → visible run both com prompt real → verificar texto assistant real nos dumps → wire dump ao gateway existente (elite-gateway) → atualizar cartaz só com 🟢 provados.
- Detalhes + checklist completo: `references/2026-09-05-zendrive-dual-profile-execution.md`
- Launchers diretos para sessão já aberta (autenticada): `.bat` wrapper + `.ps1` com detecção pwsh (PowerShell 7), `ZENDRIVER_PROFILE=segredo`, `HEADLESS=false`, uso do user-data-dir logado. Double-click para execução imediata sem re-digitar comandos. Ver `references/zendrive-launchers-direct-authenticated-session.md`.
- **Crystallization to fixed point (2026-09-05)**: Use ALL 17 Respirações (kimetsu-legacy-breathing) to structure launcher code, process, and verification. Sophisticated professional version with breathing-section comments in .ps1, CDP attach for truly open logged session (remote-debugging-port + no new uc.start to avoid lock), commit to main with full SOUL/breathing references. 
  - New support: `references/2026-09-05-zendrive-sophisticated-professional-launcher-crystallization-with-17-respiracoes.md`
- Verification protocol after ANY edit (even shell launchers): 1. Run `npm run build`, `npm run lint`, `npm run test`. 2. Read failure. 3. Repair (e.g. CSS @import order, component resolution). 4. Re-verify. 5. Summarize what passed. Always fresh run; stale evidence invalid.
- Sempre feche Chrome GUI antes para evitar lock de user-data-dir.
- Sempre consumir contexto completo (Caracol HTML, imagens) para perfis, extensões, linking, PEGATUDO, 10 frentes.
- Absorver todo delta no existente (elite-gateway + esta skill). Sem V2.

## COMPONENTES TÉCNicos VALIDADOS

### TRVAS DE CONSOLIDAÇÃO (PR #1381)
- **TRAVA MATERIAL (CADEADO MATERIAL)**:
  ```
  CONSOLIDOU
  → gera CONSOLIDATION-SEAL
  → SHA-256 de cada arquivo + lista de arquivos
  → verify-seal remede depois
  → arquivo mudou      = FAIL
  → arquivo sumiu      = FAIL
  → arquivo apareceu   = FAIL
  → manifesto adulterado = FAIL
  ```
  - Contrato do PR chama isso de `consolidation_seal` com `tamper_evident: true` e `fail_closed: true`
  - Teste do PR confirma: 
    - Alterar arquivo depois do selo → confirma reprovação
    - Adicionar arquivo depois do selo → confirma reprovação
  - Descrição explícita: "**selar caminhos consolidados e acusar qualquer alteração ou remoção**"
  - **GAP IDENTIFICADO**: O #1381 detecta violação, mas **não transforma automaticamente a pasta do Windows em read-only** nem intercepta toda tentativa de escrita antes dela acontecer. Para realmente impedir promoção, `verify-seal` precisa estar ligado ao gate de entrada + ruleset/CODEOWNERS. O documento é explícito: não promete "imutabilidade absoluta de administrador".

- **PROTEÇÃO CONTRA ESCRITORES SIMULTÂNEOS**:
  ```
  writer_lease
  → um Writer segura o escopo
  → segundo Writer tenta entrar
  → RuntimeError
  ```

### TRVA COGNITIVA (PR #1393)
- **DECISÃO PROVADA NÃO É RECONSIDERADA SEM NOVA EVIDÊNCIA**:
  ```
  DECISION_PROVEN
  + CURRENT_FINGERPRINT_MATCH
  + NO_NEW_MATERIAL_EVIDENCE
  → REUSE_DECISION
  → DO_NOT_REDELIBERATE
  → CONTINUE
  ```
  - Declarado explicitamente: `DO_NOT_REOPEN_PROVEN_DECISIONS_WITHOUT_NEW_EVIDENCE=true`

### ARQUITETURA DE TRAVAS VALIDADA
- **#1381 — CADEADO MATERIAL**: 
  - Arquivo/área consolidada → selo criptográfico → alteração detectada → FAIL_CLOSED
- **#1393 — CADEADO COGNITIVO**: 
  - Decisão já provada → fingerprint ainda bate → nada material mudou → NÃO REABRIR
- **SEPARAÇÃO CORRETA VALIDADA**: 
  - A arquitetura já separa corretamente:
    - **"não mexer porque consolidou"** (trava material)
    - de **"pode reabrir porque o runtime/fingerprint realmente mudou"** (trava cognitiva)
  - Isso evita que a IA fique "cavando de novo onde já virou chão firme"

## PROVEN DELTAS QUE NÃO PODEM SER PERDIDOS
*(Confirmado na sessão: PROVEN_DELTA_MUST_NOT_BE_LOST)*

### 1. CLASSIFICAÇÃO DO RASTRO
- Arquivo: `_RECONCILIADO/rastro_classificacao_summary.json` 
- Conteúdo provado (mesmo com arquivo atualmente indisponível - exit 49):
  - 14.252 linhas
  - 8.790 SHAs únicos  
  - 2.875 grupos duplicados
  - 8.337 linhas DUPLICATE
  - 62 sensitives
  - 5.877 históricos
- Hash: `514d4ce7ae4cd2a07c26fe910f1efa52122f6000da181d07c464e48716da2483`
- **SIGNIFICADO**: Resultado é fato provado mesmo que o arquivo esteja temporariamente inacessível

### 2. MATERIAL QUARENTENA
- Arquivo: `_RECONCILIADO/quarantine_sensitive_candidates.json`
- Conteúdo: 62 itens sensitives com SHA, timestamp, veredito CRISTAL
- Timestamps provados:
  - 2026-08-23T14:15:5x
  - 2026-08-23T23:43:5x
  - 2026-08-26T18:39:3x, 18:46:4x, 18:48:0x, 19:3x
- **REGRA DE SEGREDO RESPEITADA**: Nunca expor conteúdo bruto dos sensitives

### 3. PROTOCOLO SESSION-INTELLIGENCE-HARVESTER
- Arquivo: Lido diretamente nesta sessão (228 linhas)
- Fluxo operacional: 
  ```
  Ingest → Segment → Classify → Extract → Countercheck → Dedupe → Crystallize → Remeasure
  ```
- Esquema de classificação:
  - CURRENT_CANDIDATE
  - HISTORICAL_REFERENCE  
  - DUPLICATE
  - SENSITIVE_QUARANTINE
  - DISCARD
- Regras fundamentais embutidas:
  - HISTORICAL ≠ CURRENT
  - SOURCE_IS_PROVENANCE_NOT_AUTHORITY (fonte é proveniência, não autoridade)
  - NOTEPAD_STATE ≠ CANONICAL_TRUTH (estado do Notepad não é verdade canônica)

### 4. REGRAS OPERACIONAIS CONFIRMADAS NESTA SESSÃO
- UNKNOWN != PASS
- HISTORICAL != CURRENT  
- DOCUMENTED != EXECUTED
- NOTEPAD_STATE != CANONICAL_TRUTH
- UNSAVED_TAB != SAFE_TO_PERSIST
- SECRET_DETECTED → SENSITIVE_QUARANTINE
- RAW_LOCALSTATE → DO_NOT_COMMIT
- OLD_GREEN != CURRENT_GREEN
- PERSISTED_RECEIPT != LIVE_RUNTIME
- CURRENT_GREEN_PROVEN + RUNTIME_LOCAL_PROVEN = REAL GREEN
- CHAT_STATEMENT != CANONICAL_STATE
- ACTION != PROOF

### 5. GAPS IDENTIFICADOS (DESCOBERTAS QUE NÃO PODEM SER PERDIDOS)
- CURRENT_CANDIDATE = 0 porque critério não declarado (falha na declaração de o que é "atual")
- Classificador marcou tudo DESCONHECIDO (devido a falha de parse, não por falta de material)
- Handoff local (datado 2026-08-28) desatualizado vs HEAD atual (7059ac3ef)
- Notepad LocalState indisponível nesse ambiente específico de execução
- _RECONCILIADO/rastro_classificacao_summary.json corrompido/inacessível agora (exit 49)
- **SIGNIFICADO**: Esses gaps devem ser documentados para referência futura, não ignorados ou superestimados

### 6. ESTADO VIVO PROVADO (MEDIDO AGORA NESTA SESSÃO)
- HEAD = 7059ac3ef (branch: pivete/work/pem-drift-rootcause)
- PRs abertos: #1393 (OPEN/UNSTABLE) + #1381 (OPEN/DIRTY)
- Screenpipe :3030 = HTTP 200 (medição direta agora)
- Omni Router :8099 = indisponível (medição direta agora)
- Notepad LocalState = NÃO_EXISTE (medição direta nesse ambiente)
- **SIGNIFICADO**: Só o que foi medido agora conta como CURRENT_STATE; histórico ou claims de sessões passadas não substituem medição atual

## SIGNIFICADO DA REGRA PROVEN_DELTA_MUST_NOT_BE_LOST
Esta regra operacionaliza o princípio de preservar conhecimento ganho:
- **Não descartar trabalho já feito**: Se algo foi classificado, processado ou cristalizado, manter essa marca
- **Não recriar o que já foi provado**: Se um delta foi validado com prova, reutilizá-lo em vez de refazer
- **Preservar conhecimento ganho**: Manter rastro, classificações, decisões provadas como base para operações futuras
- **Se algo foi classificado/cristalizado, manter essa marca**: Não regredir para UNKNOWN quando há prova histórica de processamento
- **Se gap foi identificado, documentar para referência futura**: Anotar o que falta ou o que não foi verificado para informar próxima sessão
- **Se protocolo foi lido, não ignorar**: Incorporar imediatamente os aprendizados de protocolos lidos (como session-intelligence-harvester) ao comportamento operacional

## EXECUÇÃO DA MENOR MOVIMENTO EFICAZ
Quando houver múltiplos caminhos válidos:
1. Identificar o caminho com menor movimento que resolve o problema
2. Executar esse caminho
3. Mostrar o resultado obtido
4. Não apresentar como escolha ou pedir confirmação desnecessária
5. Só reconsiderar se houver nova evidência que invalide o resultado

## VERIFICAÇÃO DE CONSOLIDAÇÃO
Antes de considerar algo "chão firme" (pronto para não ser revisitado):
1. Confirmar que houve prova material (selo criptográfico, fingerprint bate, etc.)
2. Verificar que não há nova evidência material que contradiga
3. Aplicar DO_NOT_REOPEN_PROVEN_DECISIONS_WITHOUT_NEW_EVIDENCE=true
4. Só reabrir se houver:
   - Mudança no HEAD/fonte canônica relevante
   - Nova contradição materialmente relevante
   - Prova de que o teste anterior falhou sob condições diferentes
   - Sinal claro de que o contexto mudou de forma que afeta a conclusão

---

## HIERARQUIA DE PRECEDÊNCIA DE REALIDADE (2026-09-02)

A sessão cristalizou a precedência oficial entre fontes de verdade no ecossistema CentralDark. Ver arquivo de referência: `references/realidade-precedencia-hierarquia.md`.

**Resumo executivo:**

| Camada | Autoridade | Freshness | Status Medido |
|--------|------------|-----------|---------------|
| Intenção | CHEFE | LIVE | 100% |
| Código/Genealogia | GitHub + PR | LIVE | 100% |
| Runtime Local (Casa) | CentralDark MCP Local | LIVE | ~40% (parcial) |
| Runtime Deployado (VPS) | VPS | LAST_DEPLOY | ~20% |
| Documentação/Histórico | Drive/Registros | NON_CANONICAL | 100% |

**Regras imutáveis:**
- `LOCAL_RUNTIME_DOES_NOT_EQUAL_VPS_RUNTIME`
- `VPS_STATE_DOES_NOT_INVALIDATE_UNDEPLOYED_LOCAL_STATE`
- `GITHUB_CODE_DOES_NOT_PROVE_RUNTIME`
- `DOCUMENTATION_DOES_NOT_PROVE_EXECUTION`
- `NO_LIVE_MEASUREMENT_IS_UNKNOWN`

**Gaps críticos para fechar o ciclo Fixed Point ponta-a-ponta (0% hoje):**
1. Subir serviços down: Omni Router `:8099`, Hermes Desktop `:8787`, Gateway `:8080`, WebUI `:8788`
2. Implementar MCP `centraldark` que retorna envelope unificado `CENTRALDARK_REALITY`
3. Rodar ciclo completo end-to-end e gerar receipt ponta-a-ponta

---

## APRENDIZADOS DA SESSÃO 2026-09-02

### 1. Windows Ignore Patterns — Gap Real Identificado
Usuário forneceu lista de patterns de ignore. Análise do `.gitignore` raiz vs patterns propostos:

| Pattern Windows | Status no Repo | Ação |
|----------------|----------------|------|
| `Thumbs.db` | ❌ Ausente | Adicionar |
| `ehthumbs.db` | ❌ Ausente | Adicionar |
| `Desktop.ini` | ❌ Ausente | Adicionar |
| `$RECYCLE.BIN/` | ❌ Ausente | Adicionar |

**Veredito**: Pattern do usuário é mais completo para Windows. Repo ignora lixo de build mas **não ignora lixo do Windows Explorer**. Patch mínimo: adicionar 4 linhas ao `.gitignore` raiz.

### 2. Bolt = Único Owner de Criar Sites
- **Localização**: `apps/modulos/Bolt/` (Electron + Vite + Remix, fork bolt.diy)
- **Desktop**: `electron-builder.yml` → NSIS/DMG/AppImage
- **Web**: Docker → `builder.centralldark.com`
- **Integração Hermes**: ❌ NÃO EXISTE (README confirma)
- **Build .exe**: ❌ NÃO GERADO (sem node_modules/dist/artifact)
- **Outro motor**: NENHUM — Bolt é owner canônico único

### 3. CentralDark Status HTML — NÃO É PAINEL REAL
Arquivo `😈CentralDark Status😈.html` = **save do ChatGPT** (url `chatgpt.com/c/6a6a5c8a...`), não painel operacional. Contém conversa, não runtime. **NÃO USA COMO FONTE DE VERDADE.**

### 4. Fable Loop Aplicado — Respiração 0 Completa
```
MAPEAR → LER → ENTENDER → CRUZAR → CONTRADIÇÃO → TESTAR → CONSOLIDAR
```
Estado: MAPEAR✅ LER✅ ENTENDER✅ CRUZAR✅ CONTRADIÇÃO⚠️ TESTAR⏳ CONSOLIDAR⏳

### 5. Próximo Passo Mínimo (PR #1381)
1. Patch `.gitignore` (Windows patterns)
2. Build Bolt `.exe` (NSIS)
3. Commit no PR #1381 via RANDOLF

---

## ARQUITETURA DESKTOP APP vs AGENT RUNTIME (2026-09-02)

### Bolt Electron App (CentralDark Desktop)
- **Localização**: `apps/modulos/Bolt/source/`
- **electron-builder.yml**: `appId: com.centraldark.desktop`, `productName: CentralDark`
- **Targets**: Windows (NSIS), macOS (DMG), Linux (AppImage/deb)
- **Publish**: GitHub Releases (ServerVpss/CentralDark, private)
- **Entry point**: `build/electron/main/index.mjs`
- **Portas expostas**: 8080 (gateway), 8787 (desktop), 8099 (omni), 3030 (screenpipe)

### Overclock.exe History
- Múltiplos relatórios (2026-07-19 a 2026-07-24): "Removido overclock.exe (binário Windows) da raiz da VPS"
- Referência em `MVP-MAPA-VIVO-CENTRALDARK.md`: `/overclock-skill → mecânica multiagente inspirada em panes`
- Binário antigo removido/substituído — não existe mais no repo atual

### Separação Clara: Desktop App vs Agent Runtime
- **Desktop App (Bolt/CentralDark)**: roda **só no PC do usuário** como processo Electron nativo
- **Agente (Hermes/Pivete)**: roda **no ambiente Hermes** (container/venv separado)
- **Comunicação**: via rede local (localhost) — HTTP/WebSocket/MCP tools
- **Não precisam estar "no mesmo lugar"** — processos independentes que se comunicam

### CLI Tools Status (2026-09-02)
| Tool | Status | Version/Path |
|------|--------|--------------|
| `claude` | ✅ INSTALADO | 2.1.251 — `/c/Users/danda/AppData/Roaming/npm/claude` |
| `codex` | ❌ NÃO INSTALADO | — |
| `gemini` | ❌ NÃO INSTALADO | — |
| `opencode` | ❌ NÃO INSTALADO | — |

**Para usar Codex como motor**: precisa instalar (`npm i -g @openai/codex` ou installer oficial) + `codex auth login`

### Cron Jobs Structure (Root Level)
- **Localização**: `E:\CentralDark\Pivete\cron\jobs.json`
- **Perfil**: não é per-profile — é global do Hermes instance
- **Problemas comuns**:
  1. Scripts ausentes (`system-breathing.sh`, `CollectTelemetry.ps1`, `prs-open-commits-cycle.sh`, `cadeia-free-watchdog.py`, `webui-watchdog.py`)
  2. Config drift: provider/model alterados globalmente → `RuntimeError: Skipped to prevent unintended spend`
  3. Erros de conexão (health check scripts falhando)
- **Jobs ativos**: 12 jobs, maioria com `last_status: "error"`

---

**Nota de manutenção**: Esta skill contém os princípios operacionais consolidados até 2026-09-02. Aprendizados específicos de sessões estão em arquivos de referência vinculados. Para atualizar, seguir o mesmo padrão: identificar invariantes validados, comunicar preferências do SEGREDO/CHEFE, documentar componentes técnicos validados e registrar proven deltas que não podem ser perdidos.

---

## CASA TRUST MAP + CERCA EXTERNA (2026-09-03)

### O que é NOSSO (deixar / confiar após medição)
- **Omni Router `:8099`** = `centraldark-omni-router` em `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` — health `/health`, openapi `/openapi.json`
- **Perfil operacional** = `pivete` (HERMES-CASA). SOUL texto = Pivete; **ícone do arquivo ≠ identidade**
- **Fallback de modelo da Casa** = apontar para `centraldark-router` / `:8099` (Nous free). **Nunca pedir API key no chat**

### O que NÃO é Casa (candidato / cerca ON)
- **GARIMPO-CHEFE** = perfil/clone isolado + lixo de chat/HTML — **não** perfil canônico
- **AIOS → CentralDark Watch** / Synkra / BridgeMind / HTML de conversa = **EXTERNAL_CANDIDATE**, não autoridade
- **Skills Hermes hub cyber** (ex.: `building-adversary-infrastructure-tracking-system`) = bundled/hub de terceiros — **≠** core CentralDark; goal ativo disso **não** é missão Casa
- Contato externo: ouvir como delta → **sem** SOUL/mapa/secrets/Writer/PR

### Config Hermes (armadilha dual)
| Path | Papel |
|------|--------|
| `E:\CentralDark\Pivete\profiles\pivete\config.yaml` | config do **perfil pivete** (o que a sessão costuma usar) |
| `E:\CentralDark\Pivete\config.yaml` | config raiz (pode divergir) |
| `C:\Users\danda\AppData\Local\hermes\profiles\pivete\` | runtime AppData do mesmo perfil |

- Escrita direta em `config.yaml` pelo agente pode ser **bloqueada** (security-sensitive)
- Usar: `hermes config set <key> <value>` (grava no perfil ativo)
- Ex.: fallback Casa: `hermes config set fallback_providers '["centraldark-router"]'`

### Forense multi-frente (preferência do CHEFE)
Quando o CHEFE pede auditoria ampla (sessões, PIDs, paths, PRs, garimpo):
1. Medir em frentes paralelas (read-only)
2. Entregar **só tabela 🟢/🟡/🔴** + nota curta — **não** ensaio
3. Promover só o que for medido agora
4. Kill de `hermes.exe` leves (~5MB): pode falhar **sem Admin** (`taskkill` exit 1) — reportar PIDs + comando admin; **não** matar pesados (Desktop em uso)
5. Cache seguro de limpar: `hermes-agent/__pycache__`, `.pytest_cache` (não é source canônico)

### Voz (destino UX)
- TTS pt-BR: Edge `pt-BR-FranciscaNeural` (evitar OpenAI `ash` + chave `sk-or-` errada)
- Sync antes de build: estudar runtime Desktop/SOL (`:1420`) sem V2

---

### REFERÊNCIAS VINCULADAS (ATUALIZADO 2026-09-05)

- `references/2026-09-05-fable-loop-metalupa-10-frentes-crystallization.md` — **CRISTALIZAÇÃO COMPLETA:** FABLE LOOP + MetaLupa 3 temperaturas + Central de Habilidades + Caracol reverso 10 frentes + Omni Router fallback chain + SETUP.md corrigido + workflows alinhados + skills atualizadas + push main `5fee0dd55`
- `references/2026-09-05-omni-router-fallback-and-setup-correction.md`
- `references/2026-09-05-soul-sol-canonical-flow-and-bot-review.md`
- `references/2026-09-05-soul-sol-history-rendezvous-flux.md` — Novo fluxo operacional canônico: HISTORY RENDEZVOUS → CAPABILITY LINEAGE → DEDUPE/ABSORB → ONE SURVIVING DELTA → SOL coordena → MULTIBÚSSOLA+META LUPA → ONE WRITER → HERMES → CONTRAPROVA+REMEDIÇÃO → REALITY JUDGE → FIXED_POINT → REGISTRA → BOOT, com CARACOL REVERSO quando houver divergência
- `references/2026-09-05-bot-ecosystem-map-and-nous-free-models.md`

### DESTINO SUPERFÍCIE (2026-09-03 — ordem do CHEFE)
```text
Desliga app AI externo → trabalha no Sol Tauri
Motor = pivete/Hermes · Router = :8099 · gh = já auth
Sol pergunta conector GitHub → NÃO sem gap
```
Paths boot: `E:\CentralDark\Sol\BOOT-CASA.md` · `profiles/pivete/memories/SOL_TAURI_HANDOFF.md`

### LOCALIZAÇÃO SOL — SEMPRE PATH ABSOLUTO (correção CHEFE)
Nunca citar Sol sem path. EXE: `E:\CentralDark\sol-desktop-poc\BridgeMind One\bridgemind-one-rust.exe`
Ref: `references/2026-09-03-sol-app-absolute-paths.md`

### LIB CYBER EXTERNA (mukul975 etc.)
Famoso = lib OK; ≠ instalar tudo. Catálogo → 3–10 → gap → teste.
Ref: `references/2026-09-03-external-cyber-skills-library-policy.md`

### CLAUDE/COWORK ≠ APP CASA
Debug VS em cowork-svc ≠ produto próprio. Casa app = Sol+Hermes.
Ref: `references/2026-09-03-claude-code-cowork-vs-casa-app.md`

### FORMATO
Forense multi-path → tabela 🟢🟡🔴 só. App location → path + `start "" "..."`.