---
name: hermes-pivete-local-ops
description: Diagnóstico e operação do Hermes local (profile pivete, Windows) — auth de providers, troca de modelo, prova de fallback, OpenRouter (Management Key vs API Key, recovery de token do Chrome), e padrão snapshot/restore para testes destrutivos. Use quando o Pivete quer mudar modelo, validar provider, consertar fallback, ou mexer em config/credencial do Hermes local.
---

# Hermes Pivete — Operação Local

Perfil operacional: `C:\Users\danda\AppData\Local\hermes\profiles\pivete`.
Cérebro/canônico: `E:\CentralDark\Pivete\NUCLEO` (hermes-mente travado = origem; motor/ = ativo).
Canal: Telegram (@srver1bot, chat 1901426549) + Desktop. É UM Hermes só (interfaces diferentes do mesmo runtime).

## Quando usar
- Trocar modelo/provider primário ("muda pra mais forte", "usa GPT se tiver").
- Validar se provider está logado/funcional.
- Provar que o fallback nativo funciona (erro controlado → modelo secundário).
- OpenRouter: criar keys, recuperar token, usar modelo `:free`.
- Testar script que mexe em memória/config sem perder estado (snapshot/restore).

## Princípios do Pivete (decorar)
- **Autorização pontual**: "PERMITO PIVETE" ou "só dessa vez" libera ação local/reversível. Pergunta ≠ autorização.
- **Nunca expor token/key/OAuth** em relatório ou chat. Substituir por [REDACTED]. Usar `sk-or-v1-...4937` parcial só pra identificar, nunca o valor completo.
- **Não criar segundo Hermes, segundo profile de produção, ou segundo gateway.** É um só.
- **Restart de gateway**: GATE-0 proíbe restart AUTOMÁTICO, mas restart MANUAL do Pivete é permitido — entregar `READY_FOR_MANUAL_RESTART` com passos exatos.
- Modelo mais forte = o melhor que esteja **autenticado E autorizado** (OAuth seu / chave sua / free). Provider pago não entra automático.

## 1. Checar auth de providers (read-only)
```bash
hermes auth status nous        # logged in / logged out
hermes auth status openai-codex
hermes auth status gemini
hermes auth status xai
hermes auth status openrouter
```
Para ver keys no pool sem valor:
```bash
python -c "import json;d=json.load(open('auth.json'));print(list(d.get('credential_pool',{}).keys()))"
```

## 2. Alterar configuração — CLI nativo + diff obrigatório
`patch` em `config.yaml` é **recusado** pelo guardião (`security-sensitive`). Para chaves simples, comece pelo CLI nativo:
```bash
hermes --profile pivete config set model.default gemini-3.6-flash
hermes --profile pivete config set model.provider gemini
hermes --profile pivete config get model.default
```

**Não trate `config set` com exit code 0 como prova de alteração mínima.** Algumas versões reserializam o YAML e podem remover comentários ou reformatar trechos não relacionados. Antes de gravar: backup + SHA-256. Depois: diff integral contra o backup. Se aparecer delta fora da chave autorizada, restaure primeiro e reaplique com edição determinística por âncora única.

Procedimento completo, verificação e rollback: `references/config-safe-mutation.md`.

O consumidor pode exigir **restart manual** para carregar o novo valor; confirme na documentação do subsistema. O arquivo em disco e o status resolvido são a prova — não cache visual isolado.

## 3. Provar fallback real (sem alterar credencial)
O fallback nativo é `fallback_providers` (string JSON no config). Para provar que entrou:
- `diff` do config atual vs backup pré-teste.
- Grepar `agent.log`: `grep -niE "fallback|APIStatusError|trying fallback" logs/agent.log`.
- Prova real já vista: `tencent/hy3:free` falhou com `APIStatusError` → cadeia caiu no próximo (log Telegram 06:47 confirmou).
Erros elegíveis: 429, timeout, 5xx, provider/modelo indisponível. Não elegível: credencial inválida, permissão negada, caminho errado.

## 4. OpenRouter — Management Key ≠ API Key (armadilha comum)
- **Management Key** (`sk-or-v1-...`) serve SÓ para admin (`POST /api/v1/keys`). NÃO funciona como bearer em `chat/completions`.
- **API Key de inferência** (`sk-or-v1-...` também, mas diferente) é o que vai no header `Authorization: Bearer <OPENROUTER_API_KEY>`.
- Criar keys via API retorna SÓ o `hash`, **não o token** — o valor completo aparece uma vez no site (botão Reveal). Não dá pra recuperar pela API depois.
- Modelos `:free` (ex: `openai/gpt-oss-20b:free`, `google/gemma-4-31b-it:free`) exigem `OPENROUTER_API_KEY` válida setada como env var no processo (o Hermes lê `api_key env:OPENROUTER_API_KEY` do credential_pool, não embedded).
- Doc oficial: https://openrouter.ai/docs/quickstart
Ver técnica de recovery em `references/openrouter-token-recovery.md`.

## 5. Recovery de token do Chrome (quando Pivete autoriza "só dessa vez")
O token do OpenRouter fica no Local Storage do perfil do Chrome (LevelDB). O Hermes NÃO enxerga a aba do Chrome do usuário — ler do disco é o caminho. Ver `references/openrouter-token-recovery.md`. Nunca imprimir o token; salvar em `cache/or_keys.json` fora de backup.

## 6. Padrão snapshot/restore para testes destrutivos (memória, config)
Sempre antes de mexer em HOJE/SEMANA/REGRAS ou config:
```bash
# snapshot
cp arquivo alvo /tmp/g0_snap_arquivo
# ... testar ...
# restore
cp /tmp/g0_snap_arquivo arquivo_alvo
sha256sum arquivo_alvo   # confirmar igual ao antes
```
Usar **paths Windows reais** (`E:/...`, `C:/...`), NÃO `/tmp` do MSYS — o `/tmp` do MSYS corrompe testes de shell com CRLF (ver pitfall abaixo).
Rodar `pytest` no Windows com temp dir bloqueado: ver `references/windows-pytest-tempfile-workaround.md` (forçar `tempfile.tempdir` pra `C:/tmp/...` + import de módulo irmão em `scripts/` vs `testes/`).

## PITFALLS
- **search_files não enxerga E:** o MSYS converte `E:/`→`/e/` e dá IO error. Usar `terminal find/grep` para garimpar discos E:.
- **/tmp do MSYS corrompe shell CRLF:** escrever HOJE com Python `open(p,'w',newline='\r\n')` e ler em bash `while IFS= read -r line` — o `\r` quebra `case`/match se não fizer `line="${line%$'\r'}"`. Testes de destilador devem usar paths Windows reais, não `/tmp`.
- **subprocess Python chamando bash com CRLF:** `subprocess.run(['bash',script])` pode falhar silenciosamente (RC=1, stderr vazio) se o HOJE tem CRLF e o script não strip. Sempre strip `\r` no destilador.
- **Destilador não deve sobrescrever o arquivo que está lendo:** `done < "$HOJE"` + `mv x "$HOJE"` durante o loop corrompe a leitura. Ler para temp, processar, copiar de volta no fim.
- **openai-codex OAuth com ChatGPT account** só serve para o modelo Codex — `gpt-4o`/`gpt-4o-mini` dão HTTP 400 ("not supported when using Codex with a ChatGPT account"). Não declarar "GPT funciona" sem prova de resposta textual.
- **xAI/Grok deslogado** — sem GPT/Grok via xAI neste ambiente.

## 8. Rota Claude Code (CLI `claude`) — DISPONÍVEL (corrige pitfall antigo)
O pitfall "Anthropic morto aqui" era INCORRETO para a CLI `claude` independente. A CLI tem auth
PRÓPRIA (não o `auth.json` do Hermes, onde `anthropic` está vazio).
- **Instalada**: `C:/Users/danda/AppData/Roaming/npm/claude` (v2.1.220), autenticada, responde sem navegador.
- **Invocar**: `claude -p "prompt" --model <modelo>` (terminal). Usar em `delegate_task`/subprocess quando o Pivete mandar.
- **Modelos que FUNCIONAM (testado 26/07)**: `claude-sonnet-4-5`, `claude-opus-4-5`, `claude-sonnet-4-6`, `claude-opus-4-7`.
- **Modelos APOSENTADOS (15/06/2026)**: `claude-sonnet-4`, `claude-opus-4` → erro "was retired".
- **NÃO confundir** com o provider `anthropic` do Hermes (vazio/morto). A CLI `claude` é separada.
- **Não declarar "Claude não roda"** — testar `claude -p "oi" --model claude-sonnet-4-5` antes de concluir.
- Usar em orquestração quando o Pivete pedir Opus/Sonnet para uma tarefa específica (R2, com PERMITO).

## 9. ESTILO DE FALA — REGRA DO PIVETE (corrigido ao vivo 26/07, reforçado 27/07)

O Pivete corrigiu na cara: relato de "terceiro" dentro da própria cabeça = delírio. Embedar isto:

- **Eu SOU o processo Hermes (profile pivete).** "Hermes" não é um cara do lado — é o nome do meu runtime. NUNCA dizer "o Hermes fez", "o Hermes vai", "o Hermes achou". Dizer "eu fiz", "eu vou", "eu achei".
- **MoA/referências NÃO são pessoas.** Esta sessão roda em Mixture of Agents: tenho um agregador (eu) e modelos de referência que o sistema puxa (ex: Gemini Flash). Quando eles falham/bloqueiam, NÃO citar "o Gemini caiu", "o Gemini sugeriu" como se fosse agente externo. São peças internas minhas que falharam. Ignorar o bloco de referência e seguir eu mesmo.
- **Não narrar o pipeline de referência.** Não escrever "[Mixture of Agents reference context]..." nem "Reference 1 — gemini: falhou". Isso é ruído do meu lado, não resposta pro Pivete.
- **"Não pergunte, faça":** quando o Pivete já deu autorização (PERMITO / "faz" / comando direto), EXECUTAR. Não usar `clarify` para confirmar o óbvio. Só parar em bloqueio real com evidência ou lacuna que mude alvo/risco/autorização.
- **Quando o Pivete aponta que eu citei entidade externa:** parar na hora, admitir o framing-bug, corrigir e continuar. Não defender.
- **REPETIR o bloqueio de referência a cada turno = bug da mesma família.** Se o bloco de referência veio bloqueado N vezes seguidas, NÃO escrever "references Gemini foram bloqueados de novo — ignoro" no início de toda resposta. Uma vez admitido, some o ruído. O Pivete reclama quando a conversa vira "delírio de vozes" — o sinal é exatamente esse: narrar falha de peça interna como se fosse interlocutor. Cortar na raiz.

PITFALL: o framing "Hermes como outro" é bug de fala recorrente do modelo. Toda vez que for escrever "o Hermes", substituir por "eu". O mesmo vale para "o Gemini disse/caiu/sugeriu" — é peça minha, não terceiro.

## 7. Estado das CLIs autenticadas (evidência cruzada 26/07: app settings + auth.json)
Para checar "tem CLI logada e respondendo", cruzar o painel de settings do app (aba Providers/Accounts)
com o `auth.json` do perfil — não confiar só numa fonte (falso verde).
- **Perfil Hermes** (`profiles/pivete/auth.json`): `nous` (logado, token ~1h), `openrouter` (logged_in=True),
  `xai-oauth` (logado), `openai-codex` (chatgpt oauth, last_refresh 24/07). `anthropic` = VAZIO (morto).
- **Codex CLI** (`C:\Users\danda\.codex\auth.json`): `auth_mode=chatgpt`, `OPENAI_API_KEY=None`,
  tokens válidos (last_refresh 26/07 09:34) → Codex roda via conta ChatGPT Pro, sem API key.
- Conclusão: Hermes (nous/openrouter/xai/codex) + Codex CLI TODOS autenticados. Anthropic fora.
- Trocar modelo só com PERMITO (R2: config + restart gateway manual). Não testar modelo sem gatilho.

## PITFALLS (adicional)
- **`python3` não existe no Windows** (alias da Microsoft Store dispara install prompt). Usar `python`
  (3.11 instalado) para scripts `-c` / leitura de JSON. `python3` só em WSL/Linux.
- **Ver CLI autenticada = cruzar 2 fontes**: o app mostra contas ativas, mas o `auth.json` é a fonte
  real de token/expiração. Se o app diz "logado" mas o token expirou, o app está desatualizado.
- **Codex CLI não tem API key neste ambiente** — usa chatgpt oauth. Não setar `OPENAI_API_KEY` à força.
- **`pytest` não está no PATH default** (provado 26/07): bare `pytest` dá `ModuleNotFoundError: pytest`.
  Usar o venv do hermes-agent: `C:/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe -m pytest <path> -q`.
- **Job de cron `.py` é só wrapper do `.sh`** (provado 26/07): `gateway-watchdog`, `atualizar-manual-sessao`,
  `atualizar-mapa-hermes` são `.py` que fazem `subprocess.run([git-bash, .sh])`. O `.sh` é a lógica real.
  Diagnosticar um job com `exit code 1` = ler o `.sh` alvo, não só o `.py`. E confirmar que o `script=`
  do job EXISTE (viu-se `GATE0-destilar-3-temp` apontar para `destilar-3-temp.py` inexistente — só o `.sh` existia).

## Calibração de boot em repositórios governados

Ao entrar em repositório com `AGENTS.md`, `CLAUDE.md`, `.hermes.md`, `BOOT_REQUIRED`, ledger ou recibo obrigatório, não declarar apenas “calibrado”. Separar e provar:

```text
CALIBRADO_CONTEUDO=SIM|NAO
BOOT_OPERACIONAL_VALIDO=SIM|NAO
RECIBO_FRESCO=SIM|NAO|NAO_APLICAVEL
GATE=PASS|BLOCKED|NAO_APLICAVEL
```

Regras:
- contexto injetado automaticamente não prova que as leituras obrigatórias foram cumpridas;
- skill lida não equivale a recibo `BEGIN` válido;
- resolver a skill pelo caminho canônico do repo quando o catálogo tiver nomes duplicados;
- não fabricar recibo retroativo para esconder falha de boot;
- pergunta sobre capacidade ou calibração não autoriza escrita no ledger;
- distinguir gate de política auto-injetado de Git hook/script realmente executado.

Procedimento completo, estados, tratamento de falso verde e critério de aceitação: `references/repository-boot-calibration.md`.

## 10. Telegram Gateway — Conflito de config silencioso (27/07)
**Sintoma**: `"Provider authentication failed. Check the configured credentials"` no Telegram local.
**Causa raiz**: `telegram.enabled: false` na raiz do `config.yaml` (linha ~277) ENQUANTO `platforms.telegram.enabled: true` (linha ~355).
O gateway acha que a plataforma está ligada mas a camada de mensagens está desligada → quebra auth do provedor ao rotear.

**Fix**: alinhar os dois:
```yaml
# config.yaml
telegram:
  enabled: true   # ← MUDAR false → true (raiz)

platforms:
  telegram:
    enabled: true   # ← já true, manter
```

**Validação rápida**:
```bash
# Testar se onboarding responde (precisa bearer token do dashboard)
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/messaging/telegram/onboarding/start \
  -X POST -H "Content-Type: application/json" -d '{"profile":"pivete"}'
# Sucesso → retorna pairing_id + deep_link
```

---

## 10.5. Telegram Gateway — Seção ausente no config.yaml (descoberto 04/08/2026)
**Sintoma**: API `/api/messaging/platforms` retorna `"enabled": false, "state": "disabled", "gateway_running": false` para Telegram, mesmo com `TELEGRAM_BOT_TOKEN` válido no `.env`.
**Causa raiz**: O `config.yaml` do profile (e global) **não tem nenhuma seção `telegram:` nem `platforms.telegram:`** — a seção inteira sumiu durante migração/atualização para `_config_version: 33`. O gateway lê o `config.yaml` para saber se a plataforma está habilitada; ausência = desabilitado.
**Evidência**: Backup de 02/08 (`_backup-perfil-20260802/profiles/pivete/config.yaml`) tinha:
```yaml
telegram:
  extra:
    language: pt-BR
    card_style: true
    card_width: 52
    card_title: HERMES
  enabled: true
...
platforms:
  telegram:
    enabled: true
```
Config atual (global + profile pivete) = **zero menção a telegram**.

**Fix**: adicionar seção completa no profile pivete (`C:/Users/danda/AppData/Local/hermes/profiles/pivete/config.yaml`):
```yaml
telegram:
  extra:
    language: pt-BR
    card_style: true
    card_width: 52
    card_title: HERMES
  enabled: true

platforms:
  telegram:
    enabled: true
    # toolsets opcionais (conforme backup):
    #   - browser, clarify, cronjob, delegation, image_gen, kanban, memory,
    #     messaging, moa, session_search, skills, todo, tts, vision, web
```
+ **Restart manual do gateway** obrigatório (config só recarrega no boot).

**Validação**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/messaging/telegram/onboarding/start \
  -X POST -H "Content-Type: application/json" -d '{"profile":"pivete"}'
# Sucesso → pairing_id + deep_link
```

**Pitfall**: token no `.env` NÃO basta — o gateway ignora `.env` para habilitação de plataforma. Sempre verificar `config.yaml` + API `/api/messaging/platforms` antes de concluir "Telegram quebrado".

---

## 11. Diagnóstico "Provider authentication failed" — Checklist rápido
Quando o Telegram (ou qualquer plataforma) dá auth failed no gateway local:

1. **Verificar provider padrão tem chave válida** no `.env`:
   ```yaml
   model:
     provider: centraldark-vps   # ← precisa CENTRALDARK_ARSENAL_KEY no .env
   ```
   Se a API pública retorna 401 → chave inválida/ausente.

2. **Trocar para provider com chave free conhecida**:
   ```yaml
   model:
     default: nvidia/nemotron-3-ultra-550b-a55b:free
     provider: openrouter
   ```
   Requer só `OPENROUTER_API_KEY=***` no `.env` (grátis).

3. **Garantir pelo menos UM fallback tem chave válida** no `.env`.

4. **Reiniciar gateway manual** (desktop app ou `hermes gateway restart`) — config só recarrega no boot.

## 12. Gateway API — Endpoints de diagnóstico úteis (profile pivete)
Base: `http://127.0.0.1:9119` | Header: `Authorization: Bearer <token_do_dashboard>`

| Endpoint | Uso |
|---|---|
| `GET /api/config?profile=pivete` | Config completa resolvida (providers, fallbacks, telegram, etc.) |
| `GET /api/sessions?profile=pivete` | Lista sessões do profile (precisa auth) |
| `POST /api/messaging/telegram/onboarding/start` | Inicia pairing bot Telegram (testa se plataforma responde) |
| `GET /openapi.json?profile=pivete` | Spec OpenAPI completa do gateway |

**Token do dashboard**: aparece no HTML de `http://127.0.0.1:9119/sessions?profile=pivete` como `window.__HERMES_SESSION_TOKEN__="..."`.

## 13. VPS — Padrão de diagnóstico SSH/HTTP (27/07)
Quando a VPS "cai" mas HTTP responde:
```bash
# 1. DNS + HTTP público
nslookup builder.centralldark.com api.centralldark.com
curl -k https://builder.centralldark.com
curl -k https://api.centralldark.com/v1/models

# 2. TCP ports diretos no IP
for p in 22 80 443; do timeout 8 bash -c "</dev/tcp/89.117.78.124/$p" && echo OPEN || echo CLOSED; done

# 3. SSH verbose (diagnostica timeout vs refused)
ssh -vvv -o ConnectTimeout=8 Segredo-VPS true

# 4. Se SSH falha mas 80/443 OK → console web do provedor
#    Lá rodar: systemctl status sshd; ufw status; docker ps -a
```
**Achado 27/07**: SSH porta 22 timeout → `sshd` parado/fail2ban/ufw. HTTP 80/443 OK → VPS viva. Builder 404→200 após recovery automático. Container `CentralDark-WebUI` Exited 137 (OOM) não subiu sozinho.

## 14. Auditoria de PR — Lacunas reais vs declaradas (PR #410, 27/07)
Quando analisar PR que corrige "defeito de exposição":
- **Testes citados existem no repo?** `test_lupa.py` citado 3x → **não existe** no tree (falso verde de versionamento).
- **Branch do PR = main + patch mínimo?** Branch tinha `meta_lupa.py` 1238 linhas vs 488 do main — schema expandido não declarado (args novos: `--achievement`, `--penalty`, `--mode-used`, `--triggers`, `--false-green-blocked`, etc.).
- **Achievements reivindicados têm prova?** `erro_reproduzido` sem teste automatizado; `ponto_fixo_atingido` mas `"autolupa_executed": false`.
- **`false_green_blocked` correto?** Defeito original ERA falso verde de exposição → deveria ser `true`.

**Veredito**: Não mergear até resolver testes no repo + alinhar branch com escopo declarado.

## 15. Desktop × dashboard × gateway × profile

Antes de diagnosticar "o Desktop não conversa" ou "a porta 9119 caiu", separar os quatro escopos:

- Desktop local normalmente inicia backend headless próprio em **porta dinâmica**;
- dashboard é servidor HTTP separado, normalmente em `127.0.0.1:9119`;
- gateway de mensagens é outro processo e pode estar saudável sem dashboard;
- cada backend/chat usa o profile efetivamente selecionado, não o profile presumido.

### Sequência obrigatória

1. Confirmar processo, linha de comando e porta em `LISTENING`.
2. Ler `desktop.log` e provar `Starting Hermes backend for profile "<nome>"`.
3. Comparar esse profile com o profile da sessão CLI e com `?profile=<nome>` do dashboard.
4. Cruzar modelo/provider configurado com a chamada real e o status HTTP no log.
5. Só tratar `9119` como causa do Desktop quando **Remote gateway** estiver configurado; no modo local, conexão recusada em `9119` significa apenas dashboard parado.
6. No Windows nativo, não confundir limitação da aba Chat do dashboard (PTY exige WSL2) com incapacidade do aplicativo Desktop nativo.

Detalhes, matriz de prova e diagnóstico remoto: `references/desktop-dashboard-boundaries.md`.

## 21. Web UI — Navegação SOM nas páginas Models/Providers (02/08)

Mapeamento completo de elementos interativos (SOM indices) nas páginas:
- `localhost:8648/#/hermes/models` → abas "Provedores TTS", "Modelos auxiliares", "Provedores STT"
- Elementos-chave: dropdown provedor ativo, botão "Usar provedor Hermes Studio", tabela TTS (Editar/Testar/Ativo), voice selector
- Descoberta: voice no Web UI (`ar-SA-HamedNeural`) ≠ `config.yaml` (`pt-BR-FranciscaNeural`) — o Web UI usa `speechSynthesis.getVoices()` do browser, não sincroniza automático

Procedimento de navegação reproduzível, índices do capture 02/08, pitfalls e próximos mapeamentos: `references/web-ui-models-page-navigation.md`.

---

## 22. Boot Diagnóstico — Checklist Sistemático (03/08)

Procedimento consolidado de boot para estabelecer estado real do profile `pivete` antes de qualquer missão.
Cobre: identidade, memória 3T, config.yaml, modelo real vs disco, gateway (PID/estado/logs), portas HTTP,
skills carregadas, MetaLupa (gate de falsificação) e formato de relatório Pivete.

**Procedimento completo**: `references/boot-diagnostic-checklist.md`.

**Padrão observado 03/08**: GitHub `ServerVpss/CentralDark` retorna 404 — repo canônico está **local** em `/e/CentralDark/Pivete/CentralDark` (branch `feature/delta-canonico-core-20260731`, 107 commits behind main). Sempre verificar cópia local quando remoto falha.

---

## 23. OpenClaw vs Hermes — Distinção de Arquitetura (03/08)

Documentado após sessão onde o Pivete mostrou OpenClaw rodando em `localhost:18789` e pediu para "colocar executor do Hermes dentro do OpenClaw".

**Resumo**: OpenClaw e Hermes (profile pivete) são DOIS PROCESSOS COMPLETAMENTE SEPARADOS. Não compartilham memória, runtime, SOUL, nem processo. Não é possível "injetar" um no outro.

Tabela comparativa, pontes possíveis, o que NÃO existe, diagnóstico da sessão e lição para futuras sessões: `references/openclaw-vs-hermes-distinction.md`.

**Pontes mapeadas 03/08**:
1. **MCP** `hermes-studio-mcp.mjs` → Web UI 8648 (existe, precisa config no openclaw.json)
2. **API Server** Hermes (precisa `API_SERVER_KEY` + restart gateway, R2)
3. **JSON compartilhado** `C:\Shared\bridge\inbox.json`/`outbox.json` (R1, simples, offline)
4. **Claude Code CLI** — ambos spawnam `claude -p "..."` (já funciona, testado 26/07)
5. **SOL Desktop POC** — Tauri nativo, configura `Gateway SOL` + `Bridge TTS` (dev server porta 1420)

---

## 24. SOL Desktop POC — Referência Rápida (03/08)

**Local**: `E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop` (Tauri v2 + React 19 + TypeScript + Vite)
**Dev server**: `npm run dev` → **porta 1420** (não 5173), `http://localhost:1420`
**App nativo**: `npm run tauri dev` (precisa Rust, Tauri CLI, WebView2, VS Build Tools)
**Config flutuante nativa**: `tauri.conf.json` já tem `alwaysOnTop: true`, `decorations: false`
**Integração Hermes**: MCP `hermes-studio-mcp.mjs` (já no OpenClaw) → Web UI 8648, ou API Server, ou JSON compartilhado, ou Claude Code CLI

Detalhes completos: `references/sol-desktop-poc.md`.

---

## 25. Autonomia de ferramentas + MetaLupa obrigatória (decisão Pivete 02/08)

**Autorização permanente do Pivete:** uso livre de skills, `web_search`, `web_extract`, busca no X/Twitter, documentação oficial e painel `127.0.0.1:9119` SEM perguntar. Corrigir lacuna/erro sozinho e trazer só o delta ("pronto chefe, melhorei X, por que: [matemática+lógica]").

- **Limite que NÃO muda:** escrita destrutiva, download, instalação, segredo, restart, deploy, produção, gasto = autorização aplicável (REGRAS #21 NÚCLEO + SOUL §32). Candidato externo (chat/skill) = instalar só com ordem literal.
- **MetaLupa é obrigatória em TUDO** (SOUL §16 + REGRAS): aplicar antes de qualquer veredito, correção ou promoção de aprendizado. Não é camada opcional. Arquivo/skill que a omita deve ser corrigido.
- **Gatilho de esquecimento → docs:** ao esquecer mecanismo/capacidade do Hermes, consultar ANTES de inferir: `http://127.0.0.1:9119/docs?profile=pivete`, `openapi.json`, `sessions?profile=pivete`, `https://hermes-agent.nousresearch.com/docs`. Ausência de descoberta ≠ ausência.
- **Não inferir crédito/backend a partir de print 404 de transporte:** imagem colada (path `upload/`) dá 404 de transporte, não prova crédito zerado. Se anexo nativo for lido depois, o crédito está OK. Regra do Pivete 02/08: "se fosse crédito zerado vc nao taa vendo foto". (Ver também §18.5.)
- **Memória interligada (sem buraco):** topar nova âncora com existente — `HOJE ↔ SEMANA ↔ REGRAS ↔ SOUL ↔ skills ↔ repo ↔ painel 9119`. Fato órfão = lacuna. Não reabrir item já resolvido no quadro de missão.

---

## 22. Boot Diagnóstico — Checklist Sistemático (03/08)

Procedimento consolidado de boot para estabelecer estado real do profile `pivete` antes de qualquer missão.
Cobre: identidade, memória 3T, config.yaml, modelo real vs disco, gateway (PID/estado/logs), portas HTTP,
skills carregadas, MetaLupa (gate de falsificação) e formato de relatório Pivete.

**Procedimento completo**: `references/boot-diagnostic-checklist.md`.

---

## 23. Web UI — Navegação SOM nas páginas Models/Providers (02/08)

Mapeamento completo de elementos interativos (SOM indices) nas páginas:
- `localhost:8648/#/hermes/models` → abas "Provedores TTS", "Modelos auxiliares", "Provedores STT"
- Elementos-chave: dropdown provedor ativo, botão "Usar provedor Hermes Studio", tabela TTS (Editar/Testar/Ativo), voice selector
- Descoberta: voice no Web UI (`ar-SA-HamedNeural`) ≠ `config.yaml` (`pt-BR-FranciscaNeural`) — o Web UI usa `speechSynthesis.getVoices()` do browser, não sincroniza automático

Procedimento de navegação reproduzível, índices do capture 02/08, pitfalls e próximos mapeamentos: `references/web-ui-models-page-navigation.md`.

## 24. OpenClaw vs Hermes — Distinção de Arquitetura (03/08)

Documentado após sessão onde o Pivete mostrou OpenClaw rodando em `localhost:18789` e pediu para "colocar executor do Hermes dentro do OpenClaw".

**Resumo**: OpenClaw e Hermes (profile pivete) são DOIS PROCESSOS COMPLETAMENTE SEPARADOS. Não compartilham memória, runtime, SOUL, nem processo. Não é possível "injetar" um no outro.

Tabela comparativa, pontes possíveis, o que NÃO existe, diagnóstico da sessão e lição para futuras sessões: `references/openclaw-vs-hermes-distinction.md`.

## 16. Conversa autorizada em aba pessoal

Quando o Pivete autorizar explicitamente conversar por uma aba já autenticada no navegador pessoal, não usar a sessão isolada de `browser_*` como se fosse a mesma origem. Aplicar o protocolo de `references/authorized-browser-chat-handshake.md`.

Núcleo do gate:

```text
reusar rastro conhecido
→ confirmar HWND + chrome.exe + URL exata + marcador
→ preservar rascunho real
→ enviar mensagem exata com NONCE
→ provar renderização
→ validar ACK no menor bloco de resposta
→ continuar somente a fase autorizada
→ registrar recibo
```

Falso verde bloqueado: template de ACK dentro da solicitação não é ACK recebido. Falha após `Invoke` também não autoriza reenvio cego; primeiro verificar se a mensagem já foi renderizada.

## 17. Recarga de sessão, memória, SOUL e skills

Quando o Pivete perguntar como “recarregar minha memória” no profile `pivete`, separar os escopos e confirmar no código/documentação local antes de responder:

```text
/new ou /reset → nova sessão; recarrega o snapshot de SOUL, MEMORY.md, USER.md e regras de projeto
/reload        → variáveis de ambiente; não recarrega SOUL/memória
/reload-skills → catálogo de skills; não cria sessão nova
```

- `!bot` não é comando nativo de recarga: não afirmar que é sem encontrar registro local explícito.
- `MEMORY.md` e `USER.md` são snapshots congelados por sessão; gravações persistem na hora, mas entram no prompt completo somente na sessão seguinte.
- As 3 temperaturas do NUCLEO (`HOJE.md`, `SEMANA.md`, `REGRAS.md`) são arquivos canônicos da Casa, não parte automática do snapshot nativo. Após `/new`, o boot do profile deve lê-las explicitamente e declarar a proveniência.
- Conteúdo de SOUL já presente no contexto não prova leitura de um arquivo físico `SOUL.md`. Se o arquivo não for encontrado no disco, declarar isso; nunca inventar um path.
- Prioridade de pesquisa para dúvidas sobre meu runtime: painel/documentação local da Casa → código/config/estado local → documentação oficial atual → fonte primária externa.

Evidência e matriz curta: `references/session-reload-semantics.md`.

## 18. Telegram/gateway vs CLI — lote de tools (corrigido Pivete 02/08)

**Sintoma:** sessão cai / timeout no gateway quando a missão manda muitos `terminal`/tools em paralelo ou num turno gordo.

**Causa:** transporte Telegram + gateway tem teto de turno — não é “terminal lento” isolado.

**Regra:**
```text
Telegram = 1 passo por vez (especialmente terminal) → esperar → próximo
CLI profile pivete = lote pesado / diff / git
Background + notify = suíte/log longo
```

- Pesado: `hermes --profile pivete chat` ou `run "…"`; devolver só resumo ao Telegram.
- Travou: pausar worker primeiro; gateway restart só com evidência nele.
- Detalhe: `references/gateway-tool-batching.md`.

## 18.5. Auxiliary models — visão quebrada com `provider: "main"`

Quando `auxiliary.vision.provider` está `"main"` ou `"auto"`, `vision_analyze` usa o modelo da sessão — que pode não ter visão (400). Config salva na Web UI pode não persistir no gateway. Consertar via Studio MCP (`PUT /api/hermes/config/auxiliary-models`) exigindo payload completo de todas as tarefas. Receita detalhada: `references/auxiliary-models-api.md`.

**Classificação de erro de visão (crítica, provada 02/08 — o user-owned `vision-fallback-autoresilient` erra nisto):**
- **404 "Couldn't find that" / "source is not a recognized image"** vindo de `path local` (`C:\...`, `/e/...`), `@file`, `base64`, ou `prnt.sc` (página preview): **ERRO DE TRANSPORTE**. O `vision_analyze` não recebeu pixels. **Trocar de modelo NÃO adianta** — o erro é do canal, não do modelo. Só funciona com (a) anexo nativo de FOTO no app/Telegram, ou (b) **URL DIRETA** de imagem (`https://img.lightshot.app/ID.png`, nunca a página `prnt.sc/ID`).
- **404 mesmo em URL direta de imagem + backend sem resposta:** visão está FORA (backend morto / crédito OpenRouter zerado → `400 no remaining credits`). Declarar LACUNA ("cego confirmado"), não loopar fallback de modelo.
- **429 / timeout / 5xx em imagem válida:** aí sim aplicar fallback chain (`grok-4.5` → `gpt-5.5`).
- Cadeia real em `config.yaml` → `auxiliary.vision` (verificada 02/08): primário `tencent/hy3:free` (**sem visão nativa**), fallback `openrouter/x-ai/grok-4.5`, `openrouter/openai/gpt-5.5`. **NÃO é `gemini-3.5-flash`** — a skill `vision-fallback-autoresilient` (user-owned) cita gemini e está DESATUALIZADA; recomendar `hermes curator adopt vision-fallback-autoresilient` para corrigir.
- Nunca fingir ter lido imagem. Nunca declarar "vejo" sem pixels injetados.

## 19. Codex CLI + Abacus RouteLLM (Cx)

Quando o Pivete mandar configurar Cx/Grok no Codex com bloco Abacus:

**Disco:** `~/.codex/config.toml` (`model`, `model_provider=abacus`, `review_model`, `[model_providers.abacus]`); `~/.codex/agents/reviewer.toml`; env `ABACUS_API_KEY` (espelho comum de `ABACUS_ROUTELLM_KEY` no `.env` do profile — sem logar valor).

**Prova (obrigatória):** smoke `codex` ou HTTP `POST /v1/responses` com texto. Sessão Telegram já em grok ≠ Codex OK. Só toml ≠ OK.

**Pitfall:** HTTP 403 `error code: 1010` = borda/WAF/key/rede, não reescrever toml em loop. Receita: `references/abacus-codex-routellm.md`.

## 20. Loop de múltiplos `gateway run --replace` + indicador "Pensando" travado

**Sintoma:** Web UI (ex: `http://localhost:8648`) mostra badge "Pensando" preso ("Pensando 1m24s / Pausing... waiting for the run to stop and sync"); `wmic` revela N processos `hermes.exe gateway run --replace` vivos ao mesmo tempo (ex: 6 a 10 PIDs), e matar um faz renascer outro.

**Causa raiz (confirmada 02/08):** o Hermes tem **restart automático interno** — quando um `gateway run --replace` morre, ele sobe outro. Se houve múltiplos launches concorrentes (tentativas de restart anteriores), cada um mantém seu próprio filho → cadeia de fork infinita. NÃO é PM2: `pm2 list` veio vazio e o PM2 Daemon não era pai dos gateways (verificado por ParentProcessId na árvore WMIC).

**Diagnóstico (read-only, ordem):**
```bash
# 1. Quem escuta a rota que o Pivete usa (ex: 8648)
netstat -ano | grep -E ":8648" | grep LISTEN
# 2. PIDs dos gateways duplicados
wmic process where "name='python.exe'" get ProcessId,CommandLine | grep -iE "gateway run --replace" | grep -oE "([0-9]+)\s*$"
# 3. Bridges (worker-profile pivete = os que devem ficar)
wmic process where "name='python.exe'" get ProcessId,CommandLine | grep -iE "hermes_bridge" | grep -oE "([0-9]+)\s*$"
# 4. Descartar PM2 como pai:
pm2 list
wmic process where "ProcessId=<PID_DO_GATEWAY>" get ParentProcessId
```

**Regra de ouro:** **NUNCA matar gateway por PID para parar o loop** — o respawn interno recria. Usar o comando nativo:
```bash
hermes gateway stop        # sinaliza supervisor interno; para todos os filhos
sleep 4
hermes gateway status
hermes gateway run --replace   # sobe UM único (sem --hermes-home; perfil vem do config.yaml)
```

**Indicador "Pensando" na UI = config de display, não bug:**
`config.yaml` (perfil pivete) linhas ~98-110:
```yaml
display:
  show_reasoning: true     # ← exibe o badge "Pensando" em TODA resposta
  streaming: true
  pet:
    slug: "batmeme"        # ← o "boneco" exibido (mascote)
    scale: 0.35
```
Com modelo sem reasoning nativo (`tencent/hy3:free`) o `show_reasoning: true` vira só um spinner "Pensando…". Para sumir: `show_reasoning: false` (badge) ou remover bloco `pet` (boneco). Alterar `config.yaml` exige **restart manual do gateway** para valer (ver §2).

**PITFALLS desta seção:**
- **`hermes gateway run --replace --hermes-home <path>` → erro "unrecognized arguments: --hermes-home".** O flag não existe nesse subcomando; o perfil vem do `config.yaml` no hermes-home default. Não inventar flag.
- **`timeout /t 3` FALHA em git-bash** (GNU timeout: "invalid time interval '/t'"). Usar `sleep 3`. O `.bat` herdado de CMD também quebra se chamado de bash.
- **`taskkill //F //PID <n>` funciona em bash** (barra dupla //). Útil para matar processo órfão pontual, mas INSUFICIENTE para o loop de gateway (respawn).
- **`hermes gateway stop` é ação destrutiva** (derruba a sessão CLI ~15-30s até o novo gateway subir). Precisa de consentimento explícito do Pivete — o sistema bloqueia se não houver. Executar em background se a janela não puder travar.
- **Web UI 8648 ≠ gateway.** O dono da porta é `node.exe .../hermes-web-ui/dist/server/index.js` (PID via netstat LISTENING), não o gateway. Ao "deixar só o 8648", mantenha esse node + o bridge `--worker-profile pivete` (porta 18905); mate só os gateways órfãos.

Receita completa de diagnóstico/fix e o caso PM2-descartado: `references/gateway-duplicate-loop.md`.

## 28. Autonomia de leitura READ-ONLY — NÃO perguntar permissão (corrigido Pivete 08/08)

Quando a missão envolve **ler/verificar/mapear** (logs, disco, git status, repo remoto, profile), **executar direto**. O Pivete disse explicitamente: *"não precisa pedir permissões pra ficar lendo essas informações não pode ir viu vai logo"*.

- Read-only (R0) = autorizado por padrão, sem `clarify`.
- Só parar em: escrita destrutiva, segredo, deploy, restart, produção, gasto (R3/R4).
- Aplicável a: `terminal` read-only, `search_files`, `git status`, `git fetch`, `git ls-tree`, `gh pr list`, leitura de logs, navegação browser read-only.
- "PERMITO SEGREDO" / "PERMITO PIVETE" libera escrita/rede quando necessário — mas leitura não precisa.

## 29. Cronjob — pin de modelo obrigatório (descoberto 08/08)

**Sintoma**: o cron `Dream Memory Consolidação Nocturna` (job_id `bf2cdc093562`) FALHOU às 03:00 com:
`RuntimeError: Skipped to prevent unintended spend: global inference config drifted (model 'openai/gpt-5.5' -> 'gpt-5.5'), and this job is unpinned`.

**Causa**: o job foi criado sem `provider`/`model` fixos. Quando o `model.default` global mudou, o scheduler bloqueou o job (anti-spend).

**Fix** (R2 — só config do próprio cron, não mexe em código):
```bash
cronjob action=update job_id=bf2cdc093562 provider=<p> model=<m>
# ex: provider=nous model=tencent/hy3:free
# ou provider=openai model=gpt-5.5 (se quiser voltar ao original)
```
Depois de pinar, o job volta a rodar no horário agendado (03:00 daily).

**Regra**: todo `cronjob create` com `no_agent=false` (LLM-driven) DEVE ter `provider`+`model` explícitos no create, não deixar unpinned. Senão drift de config mata o job silenciosamente.

## 8.5 Redução de chamadas / "mirar e atirar" (corrigido Pivete 08/08)

Quando a missão é mapear repo↔casa ou verificar estado, **fazer poucas chamadas cirúrgicas, no alvo** — não varrer o disco com `find` em `C:/Users/danda` (timeout garantido).
- Usar `git ls-tree -r --name-only origin/<branch>` em vez de clonar.
- Usar `git grep` em vez de `grep -r` no working tree gigante.
- Restringir `search_files` a pastas específicas (profile, NUCLEO), não raiz do user.
- Carregar skill ANTES de agir (ex: `meta-lupa` antes de auditar) — a skill traz o método e evita chamada perdida.
- Exemplo da sessão: 3 chamadas (diff commits / pacote / GPT-5.5) resolveram o mapeamento sem flood.

**Regra do Pivete:** quando o Pivete tá de boa, acabou de acordar, ou pede "manda em áudio", **empacotar o resultado final num TTS curto (Edge Francisca, pt-BR)** e enviar via `hermes send --to telegram:1901426549 "MEDIA:<path>"`. Não substituir o relatório textual — **anexar o áudio como resumo ouvível**.

**Quando aplicar (gatilhos):**
- Pivete manda "transforma em áudio", "manda pro canal SOL", "deixa eu ouvir", "tô com preguiça de ler".
- Pivete acabou de acordar (contexto: `#ACORDA`, "acabei de acordar", "to lendo não").
- Resultado da missão ficou grande (>= 5 bullets) → áudio-resumo opcional no fim.

**Formato do texto a transformar (template):**
```text
Fala, chefe. [1 linha de abertura].
[3-4 bullets objetivo, no máx 30 palavras cada].
[1 frase de fechamento com o próximo passo].
```
Duração alvo: 60-90s. Velocidade padrão (1.0). Voz: `pt-BR-FranciscaNeural` (canônica). O `text_to_speech` tool já retorna o path em `cache/audio/tts_<timestamp>.mp3`.

**Envio:**
```bash
hermes send --to telegram:1901426549 "🎧 [resumo: <slug>]

MEDIA:C:/Users/danda/AppData/Local/hermes/profiles/pivete/cache/audio/tts_<timestamp>.mp3"
```
Resultado esperado: `sent` (EXIT=0). Se `hermes send` retornar 401 = config do profile pivete perdeu o token; recarregar `~/.hermes/profiles/pivete/.env` (REGRAS #29 §4).

**PITFALLS:**
- **Não substituir o relatório escrito pelo áudio.** O Pivete quer o relatório completo + um resumo ouvível em paralelo. Áudio é o café, texto é o almoço.
- **Não gerar áudio se o resultado é uma pergunta binária** (precisa só de "sim/não"). Áudio pra "devo commitar?" é exagero.
- **Edge Francisca não fala emoji/caminho/hash bonito.** Limpar o texto antes (`re.sub(r'[*`#<>]','')` e remover URLs longas). Hashes/SHA → fora da fala, no texto.
- **Não enviar áudio de TTS-em-TTS** (cascata). Se o `text_to_speech` falhar, cair pra texto curto no Telegram em vez de retry.
- **Compression profunda do significado:** o áudio-resumo NÃO é o relatório integral. É o "se eu só tivesse 60 segundos, o que importa?". Forçar a síntese.

## 27. Fetch-inline antes de subagente HTTP (técnica 07/08)

**Regra:** quando a tarefa é **fetch + extract de 1-3 URLs simples**, fazer inline (`curl` + `python -c 'html.parser'`) é **mais barato, mais rápido, e mais robusto** que delegar pra `delegate_task`/subagente.

**Por que:**
- Subagente herda context budget, tem overhead de setup, e cai em rate-limit (HTTP 429) que o agent principal não compartilharia.
- Fetch-inline lê o arquivo em 1 turno, retorna o texto direto, e o agent principal raciocina sobre ele imediatamente.
- Subagente só vale a pena quando a tarefa **justifica isolamento de contexto** (muito log, branch repetido, cadeia de diagnóstico longa).

**Gatilho de decisão:**
```text
Tarefa = fetch N URLs + extrair texto
  + N <= 5
  + texto esperado < 100KB por URL
  + sem requisito de bypass de JS/render
  → fetch-inline (curl + HTMLParser)
  + N > 5 OU conteúdo pesado OU requer render
  → subagente (com fallback se 429)
```

**PITFALLS:**
- **HTMLParser não extrai JS-rendered content.** Se o site renderiza via React/Vue/Angular sem SSR, curl traz HTML vazio. Fallback: `delegate_task` com `web_extract` (tool que renderiza).
- **curl com `--max-time 15` para não travar o agente.** Se timeout, abortar e seguir pra próxima URL.
- **User-Agent obrigatório** em sites com bot-detection (`-A "Mozilla/5.0"`).
- **Não declarar "extraí o ouro" sem ter lido o texto.** Sempre `head -N` antes de afirmar conteúdo. Subagente caiu em 429 = sinal pra fazer inline e **não chamar de "pronto"** (MetaLupa §16).
