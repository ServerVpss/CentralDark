# SEMANA — atualizado 07/08/2026 (MORNA)

Um bloco por dia. Carregar quando a conversa referir passado recente.

## 07/08/2026 — Padrão Telemetria Navegador + Instinto Superior
- Skill `padrao-telemetria-navegador` v1.2.0 criada e travada com padrões de DIGITAR/ENVIAR/TELA
- UIAccess configurado: `HERMES_CUA_DRIVER_CMD=C:/Users/danda/AppData/Local/Programs/Cua/cua-driver/bin/cua-driver-uia.exe` no .env do profile pivete
- 3 rodadas de calibração OK — same pattern, não repetir à toa
- Causa raiz documentada + known_failures na skill (não repetir investigação)
- Envio "oi" → ChatGPT respondeu "oioi" ✅
- APRENDIZADO INSTINTO SUPERIOR: modelo tende a "recomeçar do zero" — skill deve guardar decisões, não comandos
- Framework: Evento → N candidatos → score → melhor → valida → REGISTRA ASSINATURA (não só resultado)
- "PRESERVE O OURO": guarda o MECANISMO, não o resultado

## 26/07/2026 — Visão comprovada do jeito do Pivete
- Pivete dirigiu teste isolado de imagem: anexo nativo funciona, path local dá 404.
- Separou 2 erros misturados: transporte da imagem (ERRO_1) vs MoA referência Gemini offline (ERRO_2, issue #6560 já corrigido no main).
- Issue #24015 (computer_use ignorava auxiliary.vision) também já corrigido no main — não era o erro dos 8 prints.
- Corrigido veredito prematuro ("pendência: nenhuma"): faltava capturar o delta de estado do runtime (transporte mudou, config não).
- Criada skill `visao-perfil-pivete`. Criados HOJE/SEMANA/REGRAS (estavam 0 byte).

## 22/07/2026 — Lupa canônica local provada
- `lupa-bayesiana` (blob 4d0c4e8f67, 331 linhas, XP-1..XP-6) em `.agents/skills/lupa-bayesiana/` do repo local `E:\CentralDark\Pivete\CentralDark`. Lida integralmente, blob local == HEAD.
- Aplicado o método a alegação "SOUL carregado" → veredito CONDICIONAR (conteúdo no contexto ≠ leitura do arquivo canônico em disco).

## 19/07/2026 — Manual da Casa
- MANUAL.html (MANUAL-SESSAO-19-07-2026) documenta fusão hermes-mente→motor, 3 temperaturas (🔴 0 byte), state.db inchado (346 MB).
- Decisão do Pivete: memória se unifica por RECUPERAÇÃO, não por armazenamento.

## 02/08/2026 — Recuperação de intenção + correção de cegueira
- Pivete perdido na arquitetura: 3 superfícies confundidas (Hermes-CASA/8648, SOL-OpenClaw/18789, GitHub CentralDark). Mapeadas e travadas em HOJE.md.
- Lido repo `ServerVpss/CentralDark` (PLANO-MESTRE JARVIS 1174 linhas + JARVIS-ORQUESTRACAO delta). Intenção: 1 Jarvis, 1 autoridade (Pivete), 1 memória (CASA), 2 corpos (Hermes-CASA + Worker-VPS), 1 escritor por escopo.
- FABLE mapeado: persona `fabler-system.md`, plugin upstream `Sahir619/fable-method` v1.4.0 (fable-loop/judge/domain), `FABLE_JUDGE` em `delta-canonico/runner.py`. Auditoria 28/07 fechada: MetaLupa venceu (Opus5 2/2), Fable causal INDETERMINADA/fail-closed. Doc `merge_autorizado: NAO`.
- CORREÇÃO Pivete: `400 no remaining credits` em screenshot colado NÃO é crédito do meu backend. Provei: reenvio anexo nativo `925f4e8937dffe8d.png` foi LIDO por mim → meu crédito de visão OK. Path local de upload = 404 por transporte, não crédito.
- Skill `vision-fallback-autoresilient` corrigida: primário real é `gemini-2.5-flash-image` (routellm L51-56), não `hy3:free`. Removidos nomes inventados (grok-4.5/gpt-5.5). 404 = transporte, não troca modelo.

## 03/08/2026 — Repo canônico confirmado + SOL Desktop POC + Pontes OpenClaw
- Repo `ServerVpss/CentralDark` lido local (GitHub 404): REGRA-OFICIAL, PROTOCOLO-ORQUESTRACAO, JARVIS-ORQUESTRACAO, PLANO-MESTRE, CLAUDE.md, PENDENCIAS, 09-ESTADO-ATUAL, 00-LEIA-PRIMEIRO, 08-HISTORICO-DECISOES — **todos alinhados com NUCLEO**.
- Arquitetura JARVIS: 1 SOL, 1 autoridade (Pivete), 1 memória (CASA), 2 corpos (Hermes-CASA + Worker-VPS), 1 escritor/escopo, delta comms.
- FABLE: upstream v1.4.0, auditoria fechada 28/07 (MetaLupa venceu, Fable fail-closed). Não entra.
- Git: branch `feature/delta-canonico-core-20260731`, 107 commits behind main.
- SOL Desktop POC: dev server ✅ `http://localhost:1420` (Tauri v2, React 19). `tauri.conf.json` já tem `alwaysOnTop: true`, `decorations: false` (flutuante nativo). Desktop nativo bloqueado: faltam Rust, Tauri CLI, WebView2, VS Build Tools.
- OpenClaw Talk (WSL 18789) → Hermes: 4 pontes mapeadas (MCP hermes-studio-mcp.mjs → 8648, API Server precisa key, JSON compartilhado C:\Shared\bridge, Claude Code CLI já pronto). Escolha pendente do Pivete.

## 02/08 (fim) — Card-Mestre consolidado
- Criado `CARTAO-MESTRE.md` (atalhos card/quadro/pendencias/ancoras/regras/fio/soul). REGRAS #22 travada. OpenClaw/SOL em último. Obsidian BRAIN sync = pendência de hoje. SOUL melhorado (§16 MetaLupa obrigatória, §14.13 gatilho docs, §32 autonomia). Quadro 21 itens, 16 fechados.

## 02/08 (fechamento) — Fluxo fixo + Card-Mestre
- Item 21 (busca X/Twitter) concluído: self-prompting loop + hot/warm/cold validam arquitetura atual. REGRAS #23 travada (terminou→exibe card). SOUL §32 + auto-load do card. Seção Melhorias no CARTAO-MESTRE. Salvo em memória fixa + 3 temperaturas (HOJE/SEMANA/REGRAS). Quadro 21 itens, 17 fechados.

## 04/08/2026 — Gateway pivete + Francisca + menu /voice
- Profile pivete fixado na CLI e no Desktop; gateway Telegram do pivete voltou com token no `profiles/pivete/.env` (root sozinho não basta).
- Francisca reafirmada como TTS canônico (edge). Causa histórica de regressão: `tts.provider=openai` + echo sobrescrevia o bloco Edge.
- Bolha de áudio Telegram já funcionou (OGG/Opus + ffmpeg); providers mistos no passado (edge/openai/hermes-studio).
- `/voice` priorizado no topo do menu BotCommand; tradução total do menu NÃO é nativa — só prioridade + replies PT.
- Skill canônica de operação: `hermes-telegram-voice`. Não criar skill/menu paralelo.
