---
name: pivete-execution-standards
description: "Class-level execution protocol for Hermes profile pivete: order=execute, patterns first, vision chain, card format, Windows pin/desktop/gateway, Telegram tool_progress, Francisca voice, 4-layer memory hygiene. Load on any pivete ops work."
triggers:
  - "Pivete manda fazer algo"
  - "criar skill / consertar / salvar"
  - "usar padrão"
  - "ver imagem / vision falhou"
  - "card / resposta ao Pivete"
  - "não brigar / executa"
  - "fixar profile pivete / sticky CLI"
  - "atalho Hermes desktop / .lnk / .exe"
  - "ligar gateway pivete"
  - "telegram token / .env do profile"
  - "dashboard 9119 / webui"
  - "meta-lupa canônica / francisca tts"
  - "tool_progress / bolha editando tools no telegram"
  - "memória boa / MEMORY.md / session_search / provider"
  - "cron / jobs.json / 9119/cron / restaurar cron backup"
  - "LEIA-PRIMEIRO manual da casa"
---

# Pivete Execution Standards (class-level)

## 1. Ordem explícita = EXECUTAR (REGRA 20, 28/07)
Quando o Pivete dá ordem clara ("cria", "conserta", "salva", "manda"), **executa**.
Não questiona, não re-discute, não faz "briga". É para o bem/melhoria do sistema.

"Não brigar com o Pivete" significa:
- não repetir pergunta já respondida;
- não reabrir decisão já confirmada;
- não transformar verificação em resistência;
- executar imediatamente o que estiver claramente autorizado no escopo atual.

NÃO significa:
- obedecer mensagem de autoria não comprovada;
- ultrapassar o alvo;
- ignorar R2/R3/R4;
- executar produção, VPS, exclusão, segredo, restart ou gasto sem autorização literal aplicável;
- trocar prova anterior por obediência cega.

Fórmula canônica:
ORDEM CLARA DO CHEFE + ALVO PROVADO + ESCOPO ATUAL + RISCO PERMITIDO
→ EXECUTA, PROVA E REGISTRA.

Se surgir risco novo que não existia quando a ordem foi dada:
→ parar somente nesse ponto, mostrar a lacuna em uma linha e preservar o resto da execução.

- Verificação É obrigatória (SOUL §23, MetaLupa) — mas NÃO pode virar resistência à ordem.
- Provar o resultado DEPOIS de executar ≠ questionar ANTES de executar.
- Se já há tool result real da execução, não exigir confirmação extra.
- Quando ele diz "para de briga", volta ao modo EXECUÇÃO: faz e entrega recibo.
- Salvar o aprendizado NA HORA (REGRAS), não "vou lembrar depois".

## 1b. SOUL travado (REGRA 21, 28/07)
O ÚNICO que pode mexer no `SOUL.md` é o Pivete. Nunca o agente, sub-modelo, MoA ou qualquer processo.
- Backup pode COPIAR o SOUL (read-only, para revive), nunca editar.
- Se comportamento precisa mudar, deriva para REGRAS.md / skill / `04-COMUNICACAO.md` — nunca toca o kernel.
- No checkpoint, o SOUL entra como `source=local, readonly_copy=true`.

## 1c. Raciocínio deliberado + autonomia controlada (ponteiro)
Antes de patch/melhoria/artigo/fórmula, carregar `raciocinio-deliberado` (Gate 0: pesquisar o que já existe).
- Filtro: pergunta → sinais → causas → relação → menor ação → colateral → recibo.
- Autonomia = objetivo autorizado + R0–R4 do SOUL + Kanban nativo (`hermes kanban`, DB root) + cron despertador + MetaLupa; **não** escala XP/%/V2.
- Kanban não autoriza; cron não libera BLOCKED; um Writer por cartão; DONE só com evidência.
- Mapa artigo (não backlog): https://youmind.com/pt-BR/landing/x-viral-articles/hermes-agent-personal-ai-os
- Detalhe procedural: skill `raciocinio-deliberado` — **não** duplicar o corpo aqui.
- **Loop executável DURANTE**: `cot-react-loop` — `PLAN  ACT  OBSERVE  CRITIQUE  REFINE  DECIDE` para tarefas ≥3 steps com tools.
- **Pitfall**: nomenclatura do loop é `PLAN  ACT  OBSERVE  CRITIQUE  REFINE  DECIDE` (não THINK/CRITIC). Verificar em patches e referências.
- **Pitfall**: ferramentas de busca podem retornar a mesma linha múltiplas vezes por padrões sobrepostos (ex: grep "Verification Checklist" matcha "Verification Checklist" e "## Verification Checklist" na mesma linha). Sempre confirmar contagem exata (`grep -c "## Header"`) antes de declarar duplicação.

## 1d. Continuidade local: #ACORDA + âncora de fio (ponteiro)
- Gatilhos locais (SOUL §34): `#ACORDA` / `#ACORDAR` (case-insensitive, trim só no início, 1×/mensagem). RUNTIME = comportamental via SOUL (sem hook de prefixo).
- **Não** confundir com `!CALIBRAR` (depositar checkpoint oficial) nem `!RELOAD` (reler oficiais do repo).
- `/goal` = slash na sessão (CLI/Desktop/Telegram). `hermes goal` CLI **não** existe. `kanban create --goal` = loop no cartão, **não** substitui `/goal`.
- Após missão/calibração: gravar **FIO_ATUAL exato** em `E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\HOJE.md` **e** `CARTAO-MESTRE.md` (STATUS depositada/não iniciada + ressalvas). `#ACORDA` em sessão nova deve ler isso — não ancorar só em “checkpoint geral do dia”.
- Profile isolation: credenciais no `.env` do **profile** (ex. `OPENROUTER_API_KEY`); root não basta. Trocar provider do modelo ≠ só copiar chave.
- Kanban: um `kanban.db` em `%LOCALAPPDATA%\hermes\`; CLI e `9119/kanban?profile=pivete` = mesma lousa; gateway pode claimar card ready em paralelo com CLI.
- Ref: `references/acorda-ancoragem-fio.md`.

## 1e. Governança Hermes-Casa (SOUL ALIGNED_LOCAL)
Eixo canônico no SOUL ativo (após sync 2026-08-04):
```text
PIVETE/SEGREDO/CHEFE → autoridade final
SOL/JARVIS           → tutora, coordenadora, identidade visível
HERMES-CASA          → este body; EU_SOU_PIVETE=NAO; EU_SOU_SOL=NAO
ESPECIALISTAS        → leitores; um escritor/escopo
WORKER-VPS           → por último + autorização; sem memória pessoal completa
```
- Defaults SOUL: `VPS/RESTART/DEPLOY/PM2_DEFAULT=DENIED` sem ordem explícita.
- `docs/CONSCIENCIA/02-PERMISSOES.md` (push main / PM2 amplo) = **LEGACY_STALE** para este runtime se conflitar com LEIA-ME-IA / AGENTS / SOUL.
- Não promover Hermes a segundo Jarvis. Sessão nova carrega snapshot SOUL.

## 1f. Auditoria adversarial de PR (READ_ONLY one-shot)
Quando a ordem for uma rodada única contra PR (ex. MetaLupa #646): carregar `references/pr-adversarial-one-shot.md`.
- Fixar BASE/HEAD via `gh` (não corpo do PR); re-ler head mid-round.
- Diff Git vs lista declarada; temp promoter = finding.
- `echo ZERO_REGRESSION=PASS` = falso verde; contagens só com log/inventário.
- Transporte/bundle: log failed no head_sha exato.
- Uma rodada → veredito fail-closed → PARE (sem auto-fix).

## 2. Sempre derivar + salvar padrão (REGRA 19)
Todo comportamento recorrente vira PADRÃO salvo (REGRAS / skill / formato-card). Nunca depende de memória de sessão.
- Regra nova → REGRAS.md na hora.
- Fluxo repetido (>=2x) → skill com nome, gatilho, verificação.
- Material que o Pivete manda "melhorar" → primeiro deriva padrão, depois executa.
- Sem padrão = lacuna declarada, não improviso.

## 3. Vision fallback só com multimodais do profile (REGRA 18)
Nunca ficar cego. Se o VISION primário não responder, cai num outro modelo multimodal
já ativo no profile — não modelo externo não confirmado.
- Primário: `nous/google/gemini-3.5-flash`
- Fallback 1: `openrouter/x-ai/grok-4.5`
- Fallback 2: `openrouter/openai/gpt-5.5`
- Ver detalhes/transporte em `references/vision-routing.md`.
- Validar config pós-edição com `scripts/verify-vision-config.py`.

## 4. Card textual-visual canônico (ponteiro, não duplicar)
Fonte canônica: `E:\CentralDark\Pivete\NUCLEO\motor\01-identidade\04-COMUNICACAO.md`
(regra do Pivete: NÃO botar dezenas de regras visuais no SOUL — dá bloat/loop).

Formato mínimo obrigatório:
```text
🟢|🟡|🔴 MANCHETE (<=12 pal)
- fato 1 (número/evidência)
- fato 2 (máx 3 bullets)
Próximo passo OU pergunta única.
```
Extended: 📌 CARD → 🔍 EVIDÊNCIA → ⚠️ RESSALVA → ▶ PRÓXIMO PASSO → 🧾 RECIBO (não entra no áudio).
Dual-channel: tela = técnica (paths, hashes, tabelas); áudio = prosa limpa (nunca ler PATH/SHA/VISION_PROVIDER).

## 5. Profile sticky + Desktop + Gateway (Windows)

Quando o Pivete pede "fixar o profile pivete na CLI" e/ou "consertar atalho do Hermes desktop":

### CLI sticky (permanente)
```bash
hermes profile use pivete
hermes profile list          # ◆ deve estar em pivete
cat %LOCALAPPDATA%\hermes\active_profile   # deve ler: pivete
```
- `hermes -p pivete …` = só nesta invocação (não grava sticky).
- Sessão já aberta NÃO muda de profile sozinha — reabrir CLI/desktop.

### Desktop profile pin (separado do sticky CLI)
O Electron NÃO lê só `active_profile`. Ele tem pin próprio:
```text
%APPDATA%\Hermes\active-profile.json
→ { "profile": "pivete" }
```
Sem esse arquivo, o desktop pode subir backend no default mesmo com sticky CLI = pivete.
Backend local sobe com `hermes --profile <name> …` quando o pin existe.

### Atalhos .lnk (não confiar no nome)
Há dois EXEs distintos no Windows deste host:
1. Instalador antigo: `%LOCALAPPDATA%\Programs\hermes-desktop\hermes-agent.exe`
2. Unpacked atual: `%LOCALAPPDATA%\hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe`

Procedimento:
1. Ler TargetPath/Arguments/WorkingDirectory via `WScript.Shell.CreateShortcut` (PowerShell COM).
2. Provar que o TargetPath existe (`Test-Path`).
3. Preferir o unpacked mais novo se existir e for legítimo.
4. Reescrever Desktop + Start Menu com backup `.bak-<timestamp>` antes.
5. Não apagar o instalador antigo sem ordem — só realinhar atalho.

### Marker de update morto
```text
%LOCALAPPDATA%\hermes\.hermes-update-in-progress
```
Se o PID do marker não estiver rodando, o marker é STALE e pode bloquear start de backend do desktop. Backup + remover.

### Gateway (doc oficial)
Fontes: messaging + profiles + multi-profile-gateways (hermes-agent.nousresearch.com/docs).
```bash
hermes -p pivete gateway status|start|stop|restart|run|setup
hermes gateway list
```
Login item OK + "No gateway process" = processo parado, não install ausente.

### `.env` por profile (não herda root)
```text
profiles/pivete/.env   ← TELEGRAM_* do bot pivete
~/.hermes/.env         ← só profile default
```
Token só no root → `No bot token configured` / exit 78 no pivete.
Prova: `.env` PRESENT/LEN + `gateway_state=running` + `telegram.state=connected` + log `✓ telegram connected`.
Falso verde: "Gateway started (PID)" sem state/log. Não existe `.env` paralelo "do gateway".

### Dashboard 9119 ≠ Gateway ≠ Open WebUI
- 9119 = dashboard Hermes (HTTP 200 ≠ Telegram)
- 8642 = api_server costuma no process do gateway
- Open WebUI = outro produto
`hermes -p pivete dashboard` pode rotear machine dashboard `--open-profile pivete`; `/api/status` pode mostrar default stopped com pivete running.

### Meta-Lupa canônica
`ServerVpss/CentralDark/.agents/skills/meta-lupa` blob `c124497474f381ec86047fb93407b9e04fbdcf58`.
Se `skill_view` falhar no default → `gh api`. Junction antiga pode divergir — comparar SHA.

### TTS Francisca + menu `/` (zero regressão)
Canônico pivete (REGRAS#29 + USER.md + skill profile `hermes-telegram-voice` — user-owned, não editar daqui):
```yaml
tts:
  provider: edge
  edge:
    voice: pt-BR-FranciscaNeural
display:
  language: pt   # replies /voice /help — NÃO traduz BotCommand
platforms:
  telegram:
    extra:
      command_menu:
        priority_mode: prepend
        priority: [voice, help, new, status, model, sessions, commands, approve, deny]
```
- `gateway_voice_mode.json`: `telegram:1901426549: all` (persistente no disco).
- Bolha Telegram: Edge MP3 → ffmpeg → OGG/Opus → sendVoice.
- Regressão clássica: `tts.provider=openai` + `echo` (homem EN) sobrescreve Francisca.
- Menu PT completo **não é nativo** (i18n deixa slash descriptions em EN). `command_menu` = ordem/cap só.
- Após `gateway restart`, esperar `set_my_commands OK` / `telegram connected` antes de confiar em `getMyCommands`.
- `hermes config set` de lista YAML pode virar string — revalidar tipo list no YAML.

### Telegram tool progress (nome de fábrica)
O que o bot “original” faz ao editar bolha com tools/terminal curto:
```yaml
display:
  tool_progress: new              # off | new | all | verbose | log
  tool_progress_grouping: accumulate  # edita in-place (default Telegram)
  # tool_preview_length: 80       # corta preview do comando
  # tool_progress_command: true   # habilita /verbose no messaging
```
- Nome: **tool_progress** + **status messages edited in place** (`send_or_update_status`).
- Mostra tool + pedaço do comando (`💻 terminal \`ls -la\`...`), **não** dump da saída.
- `new` = enxuto (celular); `off` = quieto; `separate` = 1 msg por tool (mais barulho).
- Não confundir com medidor de CPU — é stream de tools.

### Memória boa (4 camadas, 2026) — higiene
Official: MEMORY.md/USER.md + session_search(FTS5) + skills + opcional 1 provider externo.
Pivete REGRAS#17 = **B: nativas + 3T NUCLEO** (HOJE/SEMANA/REGRAS). Provider externo só se doer recall.
```text
fato estável     → USER.md / MEMORY.md (denso, ≤ limite)
episódio/missão  → HOJE ou session_search (state.db)
padrão ≥2x       → REGRAS.md
fluxo com prova  → skill (procedural)
provider externo → no máximo UM (holographic local / hindsight / honcho)
```
- Snapshot MEMORY/USER é **frozen no boot** — write mid-session só entra na próxima.
- Cheio: consolidar/replace no mesmo turno (não estourar arquivo no disco e achar que resolve).
- NÃO: transcript em MEMORY; 2 providers; achar que Grok sozinho “lembra”.
- Remoto `ServerVpss/CentralDark` `docs/CONSCIENCIA/` = memória do **projeto**; Casa pivete = memória do **runtime**. Não misturar sem hierarquia.
- Refs: `references/hermes-memory-good-stack.md`, `references/telegram-tool-progress.md`, `references/francisca-voice-menu-2026-08-04.md`.

### Truncate ≠ atalho
`finish_reason=length` = teto de tokens. Não é profile/exe/gateway.

### Cron por profile (mesma fila CLI/Web/Desktop)
Doc: https://hermes-agent.nousresearch.com/docs/user-guide/features/cron  
Dashboard: `http://127.0.0.1:9119/cron?profile=pivete` (API pode 401; CLI é prova).

```text
profiles/pivete/cron/jobs.json     ← fila do profile
profiles/pivete/cron/executions.db
ticker_heartbeat                   ← gateway ticks (~60s)
```

```bash
hermes -p pivete cron list|status|run <name>
```

- Ticker ON + **No scheduled jobs** = engine viva, **jobs.json ausente/vazio** (não “cron desligado”).
- CLI / Telegram gateway / Dashboard `/cron?profile=pivete` / Desktop no **mesmo profile** = **mesma** fila. Default tem `~\.hermes\cron\` separado.
- Restore de backup: copiar `jobs.json` para o profile; limpar `fire_claim`; **recalcular `next_run_at`** (senão stampede de next_run antigo).
- Jobs no-agent usam `script=` sob `profiles/pivete/scripts/`. Wrappers `.py` no Windows devem chamar Git Bash com path MSYS (`/c/Users/...`), não `C:\...` cru.
- Scripts bash com `set -o pipefail`: `grep | head` sem match → exit 1. Guardar com `|| true` (ex.: `atualizar-mapa-hermes.sh` memory_char_limit).
- Após restore: provar `cron list` 4 active + 1 `cron run` ok + wrapper manual rc 0.
- Ref: `references/hermes-cron-profile-jobs.md`.

### LEIA-PRIMEIRO da Casa (pasta MANUAL)
```text
E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\LEIA-PRIMEIRO.md
BOOT-IA.md   ← lei: toda ação → historico\acoes.jsonl + painel
MANUAL.html  ← mapa humano (≠ LEIA-PRIMEIRO)
```
Ler LEIA-PRIMEIRO + BOOT antes de achar que “só o HTML” é o kit.

### Doc-only / zero regressão
"só documentação" / "zero regressão só melhorar o que existe" → append/reforço em artefato canônico; sem start destrutivo, sem skill paralela, sem copiar secrets sem ordem.
SOUL: só o Pivete manda editar; se ele **ordenar** patch no SOUL (ex. regra docs/cron), aí sim — senão deriva REGRAS/skill.

### Dúvida sobre Hermes (ordem de leitura)
Já no SOUL §9; reforço operacional:
1. `hermes <cmd> --help`
2. docs oficiais https://hermes-agent.nousresearch.com/docs
3. docs locais `%LOCALAPPDATA%\hermes\hermes-agent\website\docs\`
4. estado real do profile (`profiles\pivete\`)
5. só então inferir; senão `NÃO_VERIFICADO`

Refs: `references/windows-profile-desktop-gateway.md`, `references/pivete-gateway-env-dashboard.md`, `references/hermes-cron-profile-jobs.md`.

## Support files
- `scripts/verify-vision-config.py` — assert do `auxiliary.vision` após editar config.
- `references/vision-routing.md` — transporte de imagem, fallback chain, banner "new sessions".
- `references/textual-visual-spec.md` — técnica do Pivete (pirâmide invertida, progressive disclosure, chunking, cards, info scent, dual-channel).
- `references/windows-profile-desktop-gateway.md` — pin CLI/desktop, atalhos .lnk, marker stale, gateway Windows.
- `references/pivete-gateway-env-dashboard.md` — `.env` por profile, falso verde Telegram, 9119 vs gateway vs WebUI, Meta-Lupa SHA, Francisca/menu.
- `references/francisca-voice-menu-2026-08-04.md` — evidência sessão Francisca + /voice topo.
- `references/telegram-tool-progress.md` — nome de fábrica + modes + o que a bolha mostra.
- `references/hermes-memory-good-stack.md` — 4 camadas 2026 + higiene + providers + pivete B.
- `references/hermes-cron-profile-jobs.md` — jobs.json, ticker vs empty, restore backup, wrappers Windows, pipefail.
- `references/acorda-ancoragem-fio.md` — #ACORDA vs !CALIBRAR/!RELOAD; FIO_ATUAL em HOJE+CARD; /goal slash vs CLI; kanban/OpenRouter isolation.
- `references/pr-adversarial-one-shot.md` — PR READ_ONLY: identidade gh, ZERO_REG echo, transporte, claims, veredito fail-closed.

## Pitfalls
- NÃO usar `skill_view` para skills de profile — registry global ≠ filesystem de profile.
- NÃO editar `hermes-telegram-voice` daqui (user/profile-owned) — só apontar.
- NÃO declarar "cego" antes de esgotar cadeia multimodal do profile.
- NÃO duplicar `04-COMUNICACAO.md` — apenas aponte.
- NÃO capturar path-local 404 como "tool quebrada".
- skill-review: só skill_view/skill_manage/skills_list/memory; read-before-write por skill neste turno.
- `cross_profile=true` obrigatório p/ skills do profile pivete quando sessão é default.
- NÃO batchar view+patch+create na mesma leva.
- Sticky CLI ≠ pin Desktop (`active-profile.json`).
- NÃO apontar .lnk pro instalador antigo sem provar TargetPath/unpacked.
- NÃO interpretar `finish_reason=length` como falha de profile/atalho/gateway.
- NÃO reiniciar gateway pivete sem `profiles/pivete/.env` TELEGRAM_*.
- NÃO usar 9119 HTTP 200 como prova de Telegram connected.
- NÃO chamar dashboard Hermes de Open WebUI.
- NÃO declarar menu PT só com `display.language=pt`.
- NÃO confiar em spawn PID sem gateway_state + telegram connected.
- NÃO achar que tool_progress dumpa saída completa do terminal — é preview curto.
- NÃO lotar MEMORY.md com história de missão; use session_search / 3T / skill.
- NÃO ativar 2 memory providers externos; built-in sempre on + no máx 1 externo.
- NÃO concluir “cron desligado” só porque list está vazia — checar ticker + existência de jobs.json.
- NÃO restaurar jobs.json com next_run_at antigo sem restagger (stampede).
- NÃO chamar bash Windows com path `C:\...` no -lc sem conversão MSYS.
- NÃO editar SOUL sem ordem literal do Pivete (REGRA 21); ordem dele libera o patch pontual.
- NÃO tratar `#ACORDA` como `!CALIBRAR`/`!RELOAD` nem achar que `hermes goal` CLI existe.
- NÃO fechar missão só com recibo na tela — depositar FIO_ATUAL em HOJE+CARTAO-MESTRE ou o próximo `#ACORDA` ancora amplo demais.
- NÃO criar skill/Kanban/SOUL paralelo de autonomia; deliberado = filtro, MetaLupa = falsificação.
- NÃO aceitar SHA/ZERO_REG do corpo do PR ou `echo …=PASS` sem gh headRefOid + inventário/log.
- NÃO tratar Hermes como SOL/Jarvis; 02-PERMISSOES amplo ≠ LEIA-ME-IA neste runtime.
- Skill `raciocinio-deliberado` é **user-owned** — curator background não patcha; `hermes curator adopt raciocinio-deliberado` se quiser curadoria.
