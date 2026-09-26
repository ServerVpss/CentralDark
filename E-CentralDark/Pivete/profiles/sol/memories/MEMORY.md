User style — baianês ultra-conciso (CORTANTE): "sempr que for falar algo explica fala em baianes", "voce ta mandando monte de texte" = execício. Default mode: execute then report, NOT explain then ask. **OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA** (reforço 30/08, Fable Loop): quando elencar 2-3 caminhos, NÃO apresentar como "A ou B?". Pegar o de menor movimento, executar, mostrar resultado. "Fable loop até o ponto fixo" = o agente mede, age, salva acerto, repete, sem reconfirmar autorização a cada turno. Re-ask de autorização já dada = WASTED TURN. Pivete proíbe restart do WebUI/Hermes principal — sub-serviços da cadeia free (8099/8788/3030) SÃO autorizados a reciclar via watchdog.
§
PLACAR fixo salvo em E:\CentralDark\Pivete\PLACAR-CI.md (tabela 🟢🟡🔴 de CI + consolidação Casa). Ao pedir 'PLACAR'/'TABELA', reler arquivo, medir estado fresco (gh run / node --test / git) e mandar atualizado. Não reexplicar contexto, só o placar com bolinhas.
§
Convenção .env: ao lidar com arquivos .env nesta máquina, abrir direto no Notepad.exe na tela do usuário (cmd //c start notepad "C:\caminho\.env") em vez de ler/ecoar conteúdo via terminal. Usuário quer ver o conteúdo .env ele mesmo — economiza ida-e-volta. Vale para qualquer .env (hermes-webui, gateway, etc).
§
Lições operacionais duras (30-31/08): FABLE LOOP (opção→estrada, NÃO pergunta; MEDIR antes de perguntar mensurável; NÃO inventar trabalho; checkpoint FIXED_POINT por rodada). MULTI-WRITER no clone (checkout móvel: HEAD pula entre commits; ancorar em SHA imutável, não HEAD). NON-INVENTION (não criar V2/V3/V4/segundo motor; reutilizar owners existentes). AUTO-MEDIDA antes de perguntar; prova ≥ narrativa; história ≠ atual; prova visual = HISTORICAL até captura funcional.
§
FABLE LOOP disciplina (ordem rei 31/08): a cada rodada SALVAR acertos + checkpoint FIXED_POINT e REPETIR pra não se perder; prosseguir até PONTO_FIXO completado. Executar passo a passo + skill 17 Respirações (kimetsu). Não fabricar trabalho só pra parecer ocupado (LESS_IS_MORE).
§
GOVERNANÇA DELTA CASA (ordem rei 31/08): 'obrigação um delta contínuo canônico basta! mesmo padrão! usar os PR pra comunicação clara da Casa!' → delta útil = 1 PR canônico, dono existente (REUSE_BEFORE_CREATE), sem V2/V3/arquivo paralelo. DELTA 4 exemplo real: PR #1382 → DELTA-CONTINUO.md. NUNCA criar DELTAUNIFICADOCENTRALDARK.md (recibo inexistente em git/disco — confirmado PASS_NO_DELTAUNIFICADOCENTRALDARK).
§
GIT_BASH_FOR_SH: health_check.sh precisa do git-bash nativo (C:\Program Files\Git\usr\bin\bash.exe) para executar binários Windows (tasklist, wmic). Bash do WSL/cygwin falha no execvpe. Monitor screenpipe-hermes-live-monitor.py já detecta isso. (Descoberto 2026-09-01)
§
SCREENPIPE_WRITER_ATTRIBUTION: Screenpipe captura e atribui escritas a window IDs (ex: window:15016 como escritor do health_check.sh durante colisão). Útil para forensics de writer collision — consultar logs/traços do Screenpipe ANTES de criar mecanismos novos. (Descoberto 2026-09-01)
§
Refinamentos operacionais confirmados 2026-09-01: PARALLELIZE_PERCEPTION — percepção/read-only pode ser paralela, sem criar sistema novo; SERIALIZE_MUTATION — mutação serial e sincronizada no escopo correto; FQDN_ASSOCIADO != CAUSALIDADE; não copiar/vendorizar dataset/código sem licença explícita comprovada; não alterar firewall/VPN/DNS/rotas automaticamente; se ipnames usado: registrar upstream repo+commit SHA+timestamp, cruzar só com DNS/conexão/trace local observado; MetaLupa/Advogado: se resposta invalidar claim → rebaixar para UNKNOWN/HISTORICAL/SUPERSEDED; Fixed Point = seção final de validação do handoff.
§
PR #1381: não está ativo no remoto/branch; worktree `pr-1381-safety` estava corrompido/abandonado. Fonte de verdade atual para CI/GitHub é o remoto; não insistir em worktree inexistente.
§
Drive reconciliação — regras confirmadas pelo CHEFE (2026-09-01):

1. ZERO REGRESSÃO: não apaga no Drive (remoto) sem confirmação explícita; se não tem certeza absoluta do que está apagando: não apaga, move para _CONFLICTS/ com timestamp e motivo, registra no receipt, entrega ao humano para decisão; UNKNOWN sobre o que está sendo apagado = _CONFLICTS/ não DELETE.

2. HISTORICAL ≠ CURRENT: arquivo velho no Drive fica quieto; não assume que é atual só por existir; não baixa automaticamente só porque existe; não apaga automaticamente só porque é velho; cruza com o que existe local antes de qualquer decisão; Drive é repositório, não fonte absoluta; sem cross-check local, sem decisão.

Ambas foram implementadas no script drive_reconcile.py e na skill centraldark-drive-reconciliation (FABLE LOOP FRONT 3: DRIVE_DOCS).
§
CHEFE/SEGREDO: human authority, ultra-concise baianês, prefers execute-then-report, evidence-based (UNKNOWN≠PASS, ACTION≠PROOF, HISTORICAL≠CURRENT, DOCUMENTED≠EXECUTED). Multiple Hermes windows. Skills baked in config, mandatory in PRs. Investigation before creation. CentralDark project (ServerVpss/CentralDark). Kimetsu 17 respirações, Fable Loop, Meta Lupa. Handoffs to ChatGPT. Zero regression, reuse before create, one writer per scope.
§
Regra CORTANTE — `COMITE_NO_PR_NAO_NO_CHAT` (cristalização GARIMPO 2026-09-02): quando o CHEFE define canal de comunicação via `#ACORDAR` com `COMITE_NO_PR_NAO_NO_CHAT`, o registro de delta/reconciliação/cristalização vai no BRANCH do PR (`feat/fixed-point-fabric-proof-20260831` / #1381), NÃO no chat. O chat só confirma ordem e entrega link do commit/branch; a escrita material fica no `DELTA-CONTINUO.md` (owner canônico) ou no branch do PR. Nenhuma alteração destrutiva no repo; `NOT_PROVEN` preservado; nenhuma V2/V3; `PARCIAL` quando ZIP integridade não testada (`unzip -t`); `HISTORICAL` quando imagens (`clip_20260902_152942_1` / `...946_2`) não verificadas visualmente (`cua-driver` indisponível). Modelo real: `thinkingmachines/inkling:free` (OpenRouter) — preservado independente do motor.
§
Cristalizacao GARIMPO 2026-09-02 (pivete): arquivo original (SHA 8c75d24, 1.15MB) -> cristalize.html (904c979, 5.6KB) + receipt (3b43c27, 7.1KB). ZIP .z01/.z02 presentes; unzip -t N/A; imagens HISTORICAL (cua-drv indisponivel). 10 frentes delegadas; FRENTE 1 (skills) OK; 3-4 (multibussola/meta-lupa) sem contraprova; PR #1381 nao alterado/DIVERGED; NOT_PROVEN preservado; sem V2/V3; sem Hermes Agent fingido; modelo real=inkling:free/OpenRouter.
§
OpenRouter billing: HTTP 402 when credits low. TTS Desktop lock separate: edge + pt-BR-FranciscaNeural (not gemini/FRANCISCA).
§
Hermes CLI state verification pattern: session id via HERMES_UI_SESSION_ID env var; cronjob health via `hermes cron list` (3 failure modes: script missing, path mismatch, config drift); gateway off = cronjobs don't fire; VS Code parallel agents are external to Hermes CLI — not visible via CLI tools.
§
User pwsh terminal PID 26436 for VSCode integration (current shell when requesting ACP setup)
§
User demands terminal-only Google OAuth2/API flow for CentralDark web hub. No cua-driver/browser automation. Preferred path: Python terminal flow using Google OAuth2 device code or local redirect, saving tokens to google_token.json, then wiring GOOGLE_API_KEY or OAuth access/refresh into router/config.
§
Lupa drift guard: use current path `scripts/lupa/detectar_drift.py`; old name `detector_drift.py` is stale. Reuse this when invoking the drift guard skill.
§
PR #1381 STATUS: não é PR ativo no remoto; branch remota `pr-1381` não encontrada; worktree `pr-1381-safety` estava corrompido/abandonado (gitdir apontando para pasta inexistente, index.lock presente). Não perder tempo com ele; seguir para frentes vivas.
§
Google OAuth token local (`google_token.json`) expirado em 2026-09-02T01:46:59Z. Necessário refresh/reauth antes de qualquer chamada Google/Gemini funcional.