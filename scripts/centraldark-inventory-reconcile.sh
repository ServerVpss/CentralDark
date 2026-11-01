#!/usr/bin/env bash
# CentralDark owner unico: inventario, scan, diff, pulse. Um JSON canonico.

# CENTRALDARK_KYLIN_MENU_INCREMENTAL_20261101
# @last_updated: 2026-11-01T02:47:46.131Z
# @evidencia_visual_2026_11_01: UKUI 3.0 huanghe, hostname CentralDark-OS, kernel 7.0.0-3-generic, CPU i5-10400F, RAM 16GB, armazenamento reportado 480GB.
# @evidencia_visual_2026_11_01: UKUI System Monitor aberto com abas Processo/Servico/Disco; processo Xiao K = /usr/bin/kylin-aiassistant; System Monitor = /usr/bin/ukui-system-monitor.
# @evidencia_visual_2026_11_01: Xiao K -> No available AI model detected; lista GUI Models vazia; providers disponíveis na tela Add Model.
# @evidencia_visual_2026_11_01: KART AI Subsystem v1.3.0.0-ok0.4, categorias Cloud Model/Local Model/Custom Model; sem provar modelo conversacional.
# @evidencia_visual_2026_11_01: CENTRALDARK_KART_GUI_PREFERENCIAS_CAPTURA_20261101: KART Cloud/Local/Custom switches azuis; prioridade Cloud Model First (Kylin Certification); carregamento automático do modelo de fala no boot desligado; Cloud/Custom=Configure, Local=Install.
# @evidencia_visual_2026_11_01: CENTRALDARK_KART_CLOUD_CATALOG_GUI_20261101: Cloud First selecionado entre Cloud/Local/Custom First; Cloud Model Configuration lista DeepSeek-R1/DeepSeek-V3/Qwen-Plus (testes), Qwen-Plus com indicador azul; disclaimer de Local File Retrieval; Software Store com categoria IA.
# @estado_da_prova: inventário visual, não comprova modelo acessível, autenticação, chamada de API ou Hermes/gateway instalados; teste de conversa Xiao K continua PENDENTE.
# @evidencia_visual_2026_11_01: CENTRALDARK_KYLINBOT_ONBOARD_SINGLE_WORKSPACE_20261101: kylin-bot onboard etapa Workspace, caminho /home/CentralDark-OS/.kylinbot/workspace, pergunta multi-workspace profiles 'enabled [No]'. A captura prova default No, nao confirmacao ou gravacao da escolha.
# @direcao_operacional: uma CentralDark/workspace por padrao. Para manter single-workspace, confirmar No com Enter no proprio wizard. Nao criar perfis/agents paralelos; isolamentos futuros exigem decisao especifica. Nenhuma chave/segredo em recibos.
# @evidencia_visual_2026_11_01: CENTRALDARK_KYLINBOT_PROVIDER_FILTER_20261101: onboarding KylinBot > Providers > Provider filter com muitos provedores, incluindo GitHub Copilot, Claude Code CLI, Gemini CLI, LM Studio, llama.cpp, vLLM, SGLang, NVIDIA NIM e endpoint custom OpenAI-compatible; selecionador destacado "Done". Catalogação != autenticação ou modelo ativo.
# @evidencia_visual_2026_11_01: CENTRALDARK_KYLINBOT_CODEX_OAUTH_SELECTED_GUI_20261101: no KylinBot Onboard > Providers > OpenAI Codex (OAuth) > Authentication, menu Provider filter mostra OpenAI Codex (OAuth) [active], enquanto foco azul está em OpenAI (API). Active é estado de seleção do provedor, não prova login ou chamada. Não registrar chaves nem tokens.
# @evidencia_visual_2026_11_01: CENTRALDARK_OPENKYLIN_MCP_MULTIMODAL_CHANNELS_20261101: KylinBot Onboard > Channels mostra telegram, gmail, discord, slack, whatsapp, mqtt, webhook, voice-call; Done selecionado; lista não comprova canal configurado.
# @pesquisa_oficial_2026_11_01: https://www.openkylin.top/news/4099-en.html (3.0 agentes/MCP); https://www.openkylin.top/news/3449-cn.html (AI SDK/Runtime texto, imagem, áudio); https://www.openkylin.top/news/4168-en.html (KART acesso multimodal). Vídeo e LLM local não comprovados como READY.
# @prova_da_opcao13: usa consultas de leitura, sem credenciais, separa modelo listado de READY e execução MCP.
# @evidencia_visual_2026_11_01: CENTRALDARK_KYLINBOT_TUNNEL_PROFILES_ISOLATION_20261101: wizard Tunnel apresenta Public tunnel provider none; Workspace profiles workspaces-dir /home/CentralDark-OS/.kylinbot/workspaces; isolate-memory Yes em foco. Perfil isolado => brain.db por perfil; sem evidência de gravação definitiva. Single-workspace pretendido => configurar enabled No na etapa inicial, em vez de presumir que isolate-memory troca número de perfis.
# @prova_2026_11_01: CENTRALDARK_FORJA_CONNECTED_VPS_SAME_CORE_20261101: canal remoto autenticado no openKylin CentralDark-OS ONLINE, shell PID 14759 completou UTC=2026-11-01T03:28:21Z; /data=/dev/sda6 ext4; git/node/kylin-bot/ssh no PATH; gh/hermes ausentes do PATH; checkout não encontrado nos 3 candidatos.
# @governanca_forja_vps: Forja Linux é único core; GitHub main é fonte canônica; VPS espelha o MESMO SHA aprovado apenas quando CHEFE ordenar. Igualmente lógico != kernel/estado VPS idênticos. Histórico: scripts/remote-bridge/README-HUMANO-BRIDGE-TAILSCALE-OAUTH.md (commit c272a5df3ded119bea5caf66fba14ad0a1ccc5df).
# @next_cursor_forja: LOCALIZAR_SOURCE_LINUX → GH_HERMES_GATEWAY_LINUX → EXECUCAO_E_TESTES → SAME_SHA_VPS_QUANDO_AUTORIZADO → READBACK.
# @prova_viva_2026_11_01: CENTRALDARK_KYLINBOT_OAUTH_INFERENCE_PROVEN_20261101: no openKylin, 'kylin-bot auth status' mostrou perfil OAuth openai-codex:default autenticado (sem coleta de token); PID OAuth encerrado e porta temporaria 1455 desligada, comportamento normal apos callback. Teste -p openai-codex --model gpt-5.3-codex retornou 400/model_not_found (nao suportado nessa conta). Teste -p openai-codex --model gpt-5.6-sol respondeu FORJA_OK/exit 0. 'kylin-bot models set' nao fixou default (teste sem flags ainda tentou anthropic/claude-sonnet-4/exit 1). Corrigido no MESMO ~/.kylinbot/config.toml: providers.models.openai-codex.model=gpt-5.6-sol; readback PASS; 'kylin-bot agent -m' sem parametros de provider/model devolveu CENTRALDARK_FORJA_OK/exit 0 em 2026-11-01T03:55:14Z. A prova e restrita ao KylinBot na Forja, nao comprova Hermes, gateway, clone VPS, nem as integracoes do cockpit; não gravar URL OAuth nem credenciais.
# @prova_viva_2026_11_01: CENTRALDARK_KYLINBOT_REAL_MODEL_PROBE_20261101: Remote Desktop Commander em openKylin confirmou kylin-bot 0.7.5 e status native; fallback nvidia inválido corrigido via kylin-bot config set para openai-codex; workspace.enabled True corrigido para False; readback config TOML PASS. Auth status/list zerados; agent --provider openai-codex exit 1 (auth profile not found). Modelo padrão resolvido durante teste = anthropic/claude-sonnet-4, incompatível com Codex; não considerar modelo operacional. OAuth device-code em KylinBot retornou 404, fallback browser/paste iniciado, navegador da Forja solicitado por xdg-open RC0, autorização ainda PENDING. Tokens/URL OAuth não registrados.
# @evidencia_terminal_anterior: KyTensor /v2/health/ready HTTP 200; tts_melo, ensemble-tts_melo e model_bank READY; KylinBot OpenRouter sem API key no teste, conversa falhou.
# @limite_prova: capturas do CHEFE = observação histórica; opções 11/12 realizam medição sob demanda no Linux; não houve execução desta mudança na Forja.
#OBSERVACOES#
# @owner: scripts/centraldark-inventory-reconcile.sh
# @doc_ref: docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md
# @last_updated: 2026-11-01T02:16:10.695Z
# @escopo: menu read-only incremental no owner unico, sem alterar pulse/inventory
# @estado: diagnosticos de IA nativa; conversa somente sob escolha explicita
# @next_cursor: instalar checkout na Forja; executar o mesmo owner sem caminhos fixos de usuario/host
# @intent: PORTABILIDADE_LINUX_FORJA_VPS_20261101 — owner preservado, estado portavel, nenhum segundo reconciliador
CD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
CD_REPO_DIR="${CENTRALDARK_REPO:-${CENTRALDARK_ROOT:-$(cd "$CD_SCRIPT_DIR/.." && pwd -P)}}"
CD_STATE_DIR="${CENTRALDARK_INVENTORY_STATE_DIR:-${CENTRALDARK_STATE_DIR:-}}"
if [[ -z "$CD_STATE_DIR" ]]; then
  if [[ -w /var/lib/centraldark/inventory-reconcile ]] || { [[ ! -e /var/lib/centraldark/inventory-reconcile ]] && [[ -w /var/lib/centraldark ]]; }; then
    CD_STATE_DIR=/var/lib/centraldark/inventory-reconcile
  else
    CD_STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/centraldark/inventory-reconcile"
  fi
fi
CD_MAIN_PULSE_DIR="${CENTRALDARK_MAIN_PULSE_DIR:-$HOME/.centraldark/main-pulse}"
if [[ "$CD_REPO_DIR" != /* || "$CD_STATE_DIR" != /* ]]; then
  echo 'BLOCKED: repositorio e estado precisam de caminhos absolutos' >&2
  exit 64
fi
if [[ "${1:-}" == "--menu" || "${1:-}" == "--kylin-menu" ]]; then
  set -u
  if [[ -t 1 ]]; then
    _cd_reset=$'\033[0m'; _cd_green=$'\033[32m'; _cd_cyan=$'\033[36m'; _cd_bold=$'\033[1m'
  else
    _cd_reset=''; _cd_green=''; _cd_cyan=''; _cd_bold=''
  fi
  _cd_title() { printf '\n%s%s%s\n' "${_cd_bold}${_cd_cyan}" "$1" "$_cd_reset"; }
  _cd_have() { command -v "$1" >/dev/null 2>&1; }
  _cd_status() { printf '%s\n' "$1"; }
  _cd_section() {
    case "$1" in
      1)
        _cd_title '🐧 SISTEMA LINUX'
        uname -srmo
        if [[ -r /etc/os-release ]]; then grep -E '^(NAME|VERSION|PRETTY_NAME)=' /etc/os-release; fi
        printf '📂 Raiz: '; findmnt -no SOURCE,FSTYPE / 2>/dev/null || _cd_status 'INDETERMINADO'
        ;;
      2)
        _cd_title '🔐 SSH / CONECTIVIDADE'
        if _cd_have systemctl; then
          printf 'SSH: '; systemctl is-active ssh 2>/dev/null || _cd_status 'INATIVO/SEM ACESSO'
        else _cd_status 'systemctl indisponivel'; fi
        if _cd_have ip; then ip -brief -4 address show 2>/dev/null || true; fi
        ;;
      3)
        _cd_title '🧠 IA NATIVA INSTALADA'
        if _cd_have dpkg-query; then
          dpkg-query -W kylin-bot kylin-ai-runtime kylin-aiassistant kytensor-server kytensor-llm 2>/dev/null || _cd_status 'Alguns pacotes nao encontrados'
        else _cd_status 'dpkg-query indisponivel'; fi
        ;;
      4)
        _cd_title '⚙️ MOTORES EM EXECUCAO'
        if _cd_have pgrep; then
          pgrep -af '(^|/)(kytensor|kylin-ai-runtime|kylin-bot)( |$)' || _cd_status 'Nenhum processo correspondente encontrado'
        else _cd_status 'pgrep indisponivel'; fi
        ;;
      5)
        _cd_title '🤖 KYTENSOR — API E MODELOS READY'
        if _cd_have curl; then
          _cd_code="$(curl -sS --max-time 4 -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/v2/health/ready 2>/dev/null)"
          [[ "$_cd_code" == '200' ]] && _cd_status '🟢 API READY HTTP 200' || _cd_status "🟡 API nao READY (HTTP ${_cd_code:-000})"
          printf 'Modelos READY: '
          _cd_json="$(curl -fsS --max-time 6 -X POST -H 'Content-Type: application/json' -d '{"ready":true}' http://127.0.0.1:8000/v2/repository/index 2>/dev/null)" || _cd_json=''
          if [[ -n "$_cd_json" ]]; then
            if _cd_have python3; then printf '%s' "$_cd_json" | python3 -c 'import json,sys; a=json.load(sys.stdin); print(", ".join(x.get("name","?") for x in a) or "nenhum")' 2>/dev/null || printf '%s\n' "$_cd_json"
            else printf '%s\n' "$_cd_json"; fi
          else _cd_status 'SEM RESPOSTA DE INVENTARIO'; fi
        else _cd_status 'curl indisponivel'; fi
        ;;
      6)
        _cd_title '🦀 KYLINBOT — STATUS'
        if _cd_have kylin-bot; then
          if _cd_have timeout; then timeout 8s kylin-bot status 2>&1 || _cd_status 'Status nao concluido'
          else kylin-bot status 2>&1 || _cd_status 'Status nao concluido'; fi
        else _cd_status 'kylin-bot nao encontrado'; fi
        # CENTRALDARK_KYLINBOT_ONBOARD_SINGLE_WORKSPACE_20261101 — captura do assistente onboard, sem reler dados sensiveis.
        _cd_status '📂 ONBOARD_WORKSPACE_CAPTURA=/home/CentralDark-OS/.kylinbot/workspace'
        _cd_status '🪬 MULTI_WORKSPACE_PERGUNTA_CAPTURA=enabled [No] (padrao; confirmacao ainda nao observada)'
        # CENTRALDARK_KYLINBOT_REAL_MODEL_PROBE_20261101 — prova viva pela Forja via terminal remoto, sem coletar auth data.
        _cd_status '🐧 PROVA_LINUX_2026_11_01=KylinBot 0.7.5; provider fallback corrigido de nvidia inválido para openai-codex'
        _cd_status '📂 READBACK_WORKSPACE_ENABLED=false; workspace principal ~/.kylinbot/workspace'
        _cd_status '🔴 AUTH_PROFILE_EM_03_31Z=nenhum perfil OAuth; login iniciado, autorização no navegador pendente'
        _cd_status '🔴 AGENT_TEST_03_32Z=exit 1; OpenAI Codex auth profile not found'
        _cd_status '🟡 MODEL_NA_TENTATIVA=anthropic/claude-sonnet-4 (default antigo); resolver nome suportado só após autenticação'
        _cd_status '🍒 NEXT=autorizar login no navegador da Forja; testar inferência; registrar provider/modelo real sem expor tokens'
        _cd_status '🔧 DIRECAO=workspace unico CentralDark: confirmar No usando Enter no wizard, sem presumir configuracao aplicada'
        # CENTRALDARK_KYLINBOT_TUNNEL_PROFILES_ISOLATION_20261101 — apenas estado visual do wizard, não confirma opção salva.
        _cd_status '🌐 TUNNEL_PUBLICO_GUI=none selecionado na captura; tunnel público não necessário para SSH local'
        _cd_status '📂 WORKSPACES_DIR_GUI=/home/CentralDark-OS/.kylinbot/workspaces (diretório de perfis; não é o mesmo que workspace único)'
        _cd_status '🧠 ISOLATE_MEMORY_GUI=Yes destacado; cada perfil recebe brain.db próprio quando a opção estiver habilitada'
        _cd_status '🎯 SINGLE_WORKSPACE=retornar a enabled [No] se o objetivo for um único workspace; a opção isolate-memory não substitui esse ajuste'
        _cd_status '🔐 ESTADO_APLICADO=UNKNOWN: as capturas mostram opções apresentadas, não a conclusão do onboarding'
        # CENTRALDARK_KYLINBOT_PROVIDER_FILTER_20261101 — seleção visual de provedores disponíveis no assistente, não autenticação ou inferência.
        _cd_status '🧩 PROVIDER_FILTER_GUI=GitHub Copilot, Claude Code (CLI), Gemini CLI, LM Studio, llama.cpp server, SGLang, vLLM, NVIDIA NIM e Custom OpenAI-compatible endpoint'
        _cd_status '🔎 CATALOGO_GUI=outras opções visíveis: Cohere, KiloCLI, Hugging Face, DeepInfra, SiliconFlow, OpenAI-compatible; lista não equivale a provedor instalado/configurado'
        _cd_status '⚪ CAPTURA_ANTERIOR_PROVEDOR=UNKNOWN; o cursor estava em Done, sem prova de autenticação'
        # CENTRALDARK_KYLINBOT_CODEX_OAUTH_SELECTED_GUI_20261101 — evidência visual mais recente, sem credenciais ou operação de autenticação.
        _cd_status '🧿 ONBOARD_PROVIDER_GUI=OpenAI Codex (OAuth) [active] exibido no seletor; foco azul em OpenAI (API), não confundir os dois'
        _cd_status '🔒 OAUTH_STATUS=UNKNOWN: [active] na lista não comprova token válido nem resposta da IA'
        _cd_status '➡️ ACAO_GUI=manter OpenAI Codex (OAuth) se esse é o provedor desejado; não selecionar OpenAI (API key) por engano'
        _cd_status '🍒 NEXT=confirmar o filtro → escolher provedor existente/permitido → configurar autenticação local → testar primeira resposta, sem expor segredos'
        ;;
      7)
        _cd_title '💬 TESTAR CONVERSA (ACAO EXPLICITA)'
        if ! _cd_have kylin-bot; then _cd_status 'kylin-bot nao instalado'; return; fi
        printf 'Modelo/provedor pode ser remoto. Enviar pergunta? [s/N]: '
        local approval=''
        IFS= read -r approval || return
        [[ "${approval,,}" == 's' ]] || { _cd_status 'Teste cancelado'; return; }
        printf 'Pergunta: '
        local question=''
        IFS= read -r question || return
        [[ -n "${question//[[:space:]]/}" ]] || { _cd_status 'Pergunta vazia'; return; }
        if _cd_have timeout; then timeout 45s kylin-bot agent -m "$question" || _cd_status 'SEM RESPOSTA: conferir provedor e autenticacao (nao exibir chaves)'
        else kylin-bot agent -m "$question" || _cd_status 'SEM RESPOSTA: conferir provedor e autenticacao'; fi
        ;;
      8)
        _cd_title '📊 DIAGNOSTICO DE LEITURA'
        local n
        for n in 1 2 3 4 5 6 9 10 11 12; do _cd_section "$n"; done
        ;;
      9)
        _cd_title '📝 RECIBOS EXISTENTES'
        local p="$CD_STATE_DIR/centraldark-inventory-reconcile.json"
        if [[ -r "$p" && -s "$p" ]] && _cd_have python3; then
          python3 - "$p" <<'PY'
import json,sys
try:
 with open(sys.argv[1],encoding='utf-8') as f:d=json.load(f)
 print('schema:',d.get('schema','UNKNOWN'))
 print('utc:',d.get('utc','UNKNOWN'))
 print('delta:',(d.get('delta') or {}).get('changed','UNKNOWN'))
 print('pulse:',(d.get('pulse') or {}).get('sha','UNKNOWN'))
except (OSError,ValueError,TypeError) as exc:
 print('SEM_READBACK:',type(exc).__name__)
PY
        else _cd_status 'SEM RECIBO LOCAL — NAO E ERRO DE RUNTIME'; fi
        ;;
      10)
        # CENTRALDARK_FORJA_SOURCE_GIT_GH_MENU10 — somente inventário da Forja Linux.
        _cd_title '🍒 10 SOURCE / GIT / GH DA FORJA LINUX'
        # CENTRALDARK_FORJA_CONNECTED_VPS_SAME_CORE_20261101 — a conexão de 2026-11-01 é prova histórica, não o estado vivo de outros hosts.
        _cd_status '🪬 ARQUITETURA=ONE_CORE_LINUX_FORJA -> GITHUB_MAIN -> VPS_SAME_APPROVED_SHA_ONLY_ON_CHEFE_ORDER'
        _cd_status '🎯 FORJA_REMOTE_SHELL=HISTORICAL_PASS_2026-11-01T03:28:21Z; VPS_SHA_PARITY=NOT_TESTED'
        if _cd_have findmnt; then
          printf 'Disco de dados: '
          findmnt -no TARGET,SOURCE,FSTYPE /data 2>/dev/null || _cd_status 'UNKNOWN: /data sem montagem confirmada'
        fi
        if ! _cd_have git; then
          _cd_status 'UNKNOWN: git indisponivel no Linux'
          return 0
        fi
        local _cd_candidate='' _cd_repo=''
        for _cd_candidate in "${CENTRALDARK_REPO:-}" "$HOME/CentralDark" /data/CentralDark /opt/CentralDark; do
          [[ -n "$_cd_candidate" && -d "$_cd_candidate" ]] || continue
          if git -C "$_cd_candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            _cd_repo="$(git -C "$_cd_candidate" rev-parse --show-toplevel 2>/dev/null)" || _cd_repo=''
            [[ -n "$_cd_repo" ]] && break
          fi
        done
        if [[ -n "$_cd_repo" ]]; then
          printf '📂 WORKSPACE=%s\n' "$_cd_repo"
          printf '🔐 HEAD='; git -C "$_cd_repo" rev-parse --short HEAD 2>/dev/null || _cd_status 'UNKNOWN'
          printf '🌿 BRANCH='; git -C "$_cd_repo" branch --show-current 2>/dev/null || _cd_status 'UNKNOWN'
          printf '📝 ALTERACOES_TRACKED='
          git -C "$_cd_repo" status --porcelain --untracked-files=no 2>/dev/null | awk 'END {print NR}'
        else
          _cd_status 'SOURCE=UNKNOWN: checkout nao localizado nos caminhos candidatos; sem criar ou copiar nada'
        fi
        if _cd_have gh; then
          if gh auth status >/dev/null 2>&1; then
            _cd_status '🟢 GH_LINUX=AUTH_OK'
          else
            _cd_status 'GH_LINUX=SEM_AUTENTICACAO_CONFIRMADA'
          fi
        else
          _cd_status 'GH_LINUX=CLI_NAO_ENCONTRADA'
        fi
        if _cd_have hermes; then _cd_status '🦀 HERMES_LINUX=CLI_NO_PATH (execucao ainda nao comprovada)'
        else _cd_status 'HERMES_LINUX=CLI_NAO_ENCONTRADA_NO_PATH'; fi
        _cd_status 'WINDOWS_NAO_E_EXECUTOR | VPS_SOMENTE_SOB_ORDEM | STATUS_READ_ONLY'
        ;;

      11)
        # CENTRALDARK_UKUI_MONITOR_XIAOK_KART_20261101 — monitor existente, nao um segundo HUD.
        _cd_title '📊 11 MONITOR UKUI / SISTEMA E SERVICOS'
        printf '🖥️ HOST='; hostname 2>/dev/null || _cd_status 'UNKNOWN'
        printf '🐧 KERNEL='; uname -r 2>/dev/null || _cd_status 'UNKNOWN'
        if [[ -r /etc/os-release ]]; then
          ( . /etc/os-release; printf '🐧 SISTEMA=%s\n' "${PRETTY_NAME:-UNKNOWN}" )
        fi
        if [[ -r /proc/cpuinfo ]]; then
          awk -F: '/^model name[[:space:]]*:/ {gsub(/^[[:space:]]+/, "", $2); print "⚙️ CPU=" $2; exit}' /proc/cpuinfo
        fi
        if _cd_have free; then printf '🧠 MEMORIA:\n'; free -h; else _cd_status 'MEMORIA=UNKNOWN'; fi
        printf '💾 DISCO:\n'
        if _cd_have df; then df -hT / /data 2>/dev/null || df -hT / 2>/dev/null || _cd_status 'DISCO=UNKNOWN'; fi
        if _cd_have ps; then
          printf '📈 PROCESSOS TOP CPU (AMOSTRA VIVA):\n'
          ps -eo pid,comm,%cpu,%mem --sort=-%cpu 2>/dev/null | sed -n '1,13p'
        else _cd_status 'PROCESSOS=UNKNOWN'; fi
        if _cd_have systemctl; then
          printf '🧩 SERVICOS ATIVOS (AMOSTRA):\n'
          systemctl list-units --type=service --state=running --plain --no-pager --no-legend 2>/dev/null | sed -n '1,16p'
        else _cd_status 'SERVICOS=UNKNOWN'; fi
        printf '🖥️ UKUI_SYSTEM_MONITOR='
        if _cd_have ukui-system-monitor; then command -v ukui-system-monitor
        else _cd_status 'NAO_LOCALIZADO_NO_PATH'; fi
        ;;
      12)
        _cd_title '🧿 12 XIAO K / KART / MODELOS GUI'
        printf '🦀 KYLIN_AIASSISTANT='
        if _cd_have kylin-aiassistant; then command -v kylin-aiassistant
        else _cd_status 'NAO_LOCALIZADO_NO_PATH'; fi
        if _cd_have dpkg-query; then
          dpkg-query -W -f='${binary:Package} ${Version}\n' \
            kylin-ai-subsystem kylin-aiassistant kylin-bot kylin-ai-runtime 2>/dev/null ||
            _cd_status 'UNKNOWN: alguns pacotes nao constam'
        fi
        if _cd_have pgrep; then
          local _cd_proc
          for _cd_proc in kylin-aiassistant kylin-ai-runtime kylin-bot kytensor; do
            if pgrep -f "(^|/)$_cd_proc([[:space:]]|$)" >/dev/null 2>&1; then
              printf '🟢 PROCESSO_OBSERVADO=%s (nao prova modelo configurado)\n' "$_cd_proc"
            else
              printf '⚪ PROCESSO_NAO_OBSERVADO=%s\n' "$_cd_proc"
            fi
          done
        else _cd_status 'PROCESSOS_IA=UNKNOWN'; fi
        printf '📷 CAPTURA_HISTORICA=UKUI 3.0 huanghe; KART 1.3.0.0-ok0.4; Xiao K sem modelo na interface de Chat\n'
        # CENTRALDARK_KART_GUI_PREFERENCIAS_CAPTURA_20261101: observação visual, não leitura viva das preferências.
        printf '🧿 KART_GUI_CAPTURA=Cloud Model, Local Model e Custom Model: controles azuis/ligados na imagem\n'
        printf '☁️ PRIORIDADE_GUI_CAPTURA=Cloud Model First (Kylin Certification)\n'
        printf '🗣️ VOZ_GUI_CAPTURA=Automatically loading local speech model on system boot: desligado (cinza)\n'
        printf '🔧 ACOES_GUI_CAPTURA=Cloud/Custom: Configure; Local: Install\n'

        # CENTRALDARK_KART_CLOUD_CATALOG_GUI_20261101 — inventário observado na GUI, não teste de inferência.
        printf '🧿 PRIORIDADES_GUI=Cloud Model First, Local Model First, Custom Model First; Cloud First selecionado na captura\n'
        printf '☁️ CATALOGO_CLOUD_GUI=DeepSeek-R1 (trial), DeepSeek-V3 (trial), Qwen-Plus (trial)\n'
        printf '🔵 SELECAO_CLOUD_GUI=Qwen-Plus (indicador azul); não equivale a autenticação, disponibilidade ou resposta da IA\n'
        printf '📂 AVISO_RETRIEVAL_GUI=Disclaimer for Local File Retrieval; interface informa que busca em arquivos exige cuidado com dados sensíveis\n'
        printf '🛍️ LOJA_UKUI_GUI=Software Store visível com categorias, incluindo inteligência artificial; isso não atesta instalação de novos modelos\n'
        printf '🔴 CONVERSA_XIAO_K=anteriormente sem modelo disponível; testar mensagem de ponta a ponta após configuração, sem presumir PASS\n'
        printf '🎯 ESTADO_MODELO_CONVERSACIONAL=sem modelo configurado no Xiao K na captura anterior; controles habilitados nao sao modelo pronto\n'
        printf '📌 PROVENIENCIA=captura enviada pelo CHEFE; configurações atuais devem ser lidas na GUI antes de afirmar mudança\n'
        printf '🔍 MODELO_CONVERSACIONAL_GUI_ATUAL=NAO_MEDIDO; ver modelos na GUI e opção 05 para KyTensor\n'
        printf '🔎 KylinBot CLI e Xiao K são componentes distintos; status de um não prova o outro\n'
        ;;

      13)
        # CENTRALDARK_OPENKYLIN_MCP_MULTIMODAL_CHANNELS_20261101
        # Docs: https://www.openkylin.top/news/4099-en.html (MCP e KylinBot)
        # Docs: https://www.openkylin.top/news/3449-cn.html (AI SDK + Runtime)
        _cd_title '🪬 13 KART / MCP / MULTIMODAL / CHANNELS'
        _cd_status '📚 OFICIAL=AI SDK/Runtime, KyTensor, agentes; openKylin 3.0 anuncia ferramentas MCP desktop'
        if _cd_have dpkg-query; then
          printf '🧠 PACOTES_RUNTIME_INSTALADOS:\n'
          dpkg-query -W -f='${binary:Package} ${Version}\n' \
            kylin-ai-runtime kylin-ai-subsystem kylin-ai-vector-engine \
            kytensor-server kytensor-llm kylin-aiassistant kylin-bot 2>/dev/null ||
            _cd_status 'UNKNOWN: algum pacote nao localizado'
        else _cd_status 'UNKNOWN: dpkg-query ausente'; fi
        if _cd_have kylin-bot; then
          printf '🦀 CLI_INTERFACES:\n'
          kylin-bot --help 2>&1 | grep -Ei '^  (agent|gateway|acp|channel|integrations|skills|models|providers|memory|cron)[[:space:]]' || true
          _cd_status '⚪ ACP e protocolo distinto de MCP; interface CLI nao comprova servidor MCP ativo'
        else _cd_status 'UNKNOWN: kylin-bot ausente'; fi
        if _cd_have curl && _cd_have python3; then
          local _cd_models=''
          _cd_models="$(curl -fsS --max-time 6 -X POST \
            -H 'Content-Type: application/json' -d '{}' \
            http://127.0.0.1:8000/v2/repository/index 2>/dev/null)" || _cd_models=''
          if [[ -n "$_cd_models" ]]; then
            printf '%s' "$_cd_models" | python3 -c '
import json,sys
try:
 models=json.load(sys.stdin)
 groups={"VOZ_ASR_TTS":[],"EMBEDDINGS":[],"IMAGEM_OCR":[],"OUTROS":[]}
 for m in models:
  name=str(m.get("name",""))
  state=str(m.get("state","SEM_STATUS_READY"))
  display=name+" ["+state+"]"
  if name.startswith(("asr","tts","ensemble-asr","ensemble-tts","punc","ensemble-punc")): groups["VOZ_ASR_TTS"].append(display)
  elif name.startswith(("embd","ensemble-embd","tokenizer")): groups["EMBEDDINGS"].append(display)
  elif name.startswith(("ocr","seg","matting")): groups["IMAGEM_OCR"].append(display)
  else: groups["OUTROS"].append(display)
 for k,items in groups.items():
  print("  "+k+" count="+str(len(items))+" | "+", ".join(items))
 print("  VIDEO_READY=NAO_COMPROVADO_NESTE_ENDPOINT")
 print("  LLM_CHAT_READY=NAO_COMPROVADO_NESTE_ENDPOINT")
 print("  CATALOGO != READY != RESPOSTA_GERADA")
except (ValueError,TypeError):
 print("MODELOS=JSON_INVALIDO")
' || _cd_status 'UNKNOWN: falha ao classificar o inventario'
          else _cd_status 'UNKNOWN: KyTensor sem resposta do repositorio'; fi
        else _cd_status 'UNKNOWN: python3 ou curl ausentes'; fi
        _cd_status '📱 CHANNELS_GUI_CAPTURA=telegram, gmail, discord, slack, whatsapp, mqtt, webhook, voice-call e outros'
        _cd_status '⚪ CANAL_AUTENTICADO=UNKNOWN (menu de opcoes nao significa canal ativo)'
        _cd_status '⚪ MCP_DESKTOP_RUNTIME=UNKNOWN (suporte documentado nao equivale a servico provado)'
        _cd_status '🔒 READ_ONLY, SEM_SEGREDOS, SEM_NOVO_MOTOR, SEM_INSTALACAO'
        ;;
    esac
  }
  while :; do
    printf '\n%s%s╔══════════════════════════════════════╗%s\n' "$_cd_bold" "$_cd_cyan" "$_cd_reset"
    printf '%s║  👑🪬 CENTRALDARK — USINA OPENKYLIN   ║%s\n' "$_cd_cyan" "$_cd_reset"
    printf '%s╠══════════════════════════════════════╣%s\n' "$_cd_cyan" "$_cd_reset"
    printf '║ 🐧 01 SISTEMA   🔐 02 SSH           ║\n'
    printf '║ 🧠 03 IA NATIVA ⚙️ 04 MOTORES       ║\n'
    printf '║ 🤖 05 KYTENSOR 🦀 06 KYLINBOT      ║\n'
    printf '║ 💬 07 CONVERSA 📊 08 DIAGNOSTICO   ║\n'
    printf '║ 📝 09 RECIBOS  🚪 00 SAIR           ║\n'
    printf '║ 🍒 10 SOURCE / GIT / GH DA FORJA   ║\n'
    printf '║ 📊 11 MONITOR     🧿 12 XIAO K/KART ║\n'    printf '║ 🪬 13 MCP / MULTIMODAL / CHANNELS  ║\n'


    printf '%s╚══════════════════════════════════════╝%s\n' "$_cd_cyan" "$_cd_reset"
    printf '%s🍒 Escolha: %s' "$_cd_green" "$_cd_reset"
    IFS= read -r _cd_choice || exit 0
    case "$_cd_choice" in
      0|00|q|Q) exit 0 ;;
      1|01|2|02|3|03|4|04|5|05|6|06|7|07|8|08|9|09|10|11|12|13) _cd_section "$((10#$_cd_choice))" ;;
      *) _cd_status 'Opcao invalida' ;;
    esac
  done
fi

set -Eeuo pipefail
if [[ "${1:-}" == "--pulse" ]]; then
  shift
  if [[ "${1:-}" == "--plan" ]]; then
    echo "PULSE_PLAN=READ_ONLY"
    printf "HEAD="; git -C "$CD_REPO_DIR" rev-parse HEAD
    printf "ORIGIN_MAIN="; git -C "$CD_REPO_DIR" rev-parse origin/main
    exit 0
  fi
  umask 077
  _json="$CD_STATE_DIR/centraldark-inventory-reconcile.json"
  _pulse_state="$CD_STATE_DIR/.pulse-$$"
  mkdir -p "$CD_STATE_DIR"
  _saved="$(python3 - "$_json" <<'PY'
import json,sys
try:
 with open(sys.argv[1]) as f:d=json.load(f)
 print((d.get("pulse") or {}).get("sha") or "")
except (OSError,ValueError,TypeError):print("")
PY
)"
  if [[ -z "$_saved" && -s "$CD_MAIN_PULSE_DIR/last-seen-sha" ]]; then _saved="$(tr -d "[:space:]" <"$CD_MAIN_PULSE_DIR/last-seen-sha")"; fi
  if [[ "$_saved" =~ ^[a-f0-9]{40}$ ]]; then printf "%s\n" "$_saved" >"$_pulse_state"; fi
  _receipt() {
    local code="$1"
    trap - EXIT
    python3 - "$_json" "$_pulse_state" "$code" <<'PY'
import json,os,sys,pathlib,datetime
p=pathlib.Path(sys.argv[1]);f=pathlib.Path(sys.argv[2]);rc=int(sys.argv[3])
try:d=json.loads(p.read_text())
except (OSError,ValueError):d={"schema":"centraldark.reconcile.v1","sources":{},"owners":{}}
v=d.get("pulse") or {}
if rc==0 and f.is_file():
 x=f.read_text().strip()
 if len(x)==40 and all(c in "abcdef0123456789" for c in x):v["sha"]=x
v["exit_code"]=rc
v["utc"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
v["exit_zero_is_not_deploy_proof"]=True
d["pulse"]=v
tmp=p.with_suffix(".pulse-tmp");tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n");os.replace(tmp,p)
PY
    rm -f -- "$_pulse_state"
    return "$code"
  }
REPO="$CD_REPO_DIR"
STATE_DIR="$CD_STATE_DIR"
STATE_FILE="$STATE_DIR/.pulse-$$"
LOG_FILE="$CD_MAIN_PULSE_DIR/pulse.log"
LOCK="$STATE_DIR/.lock"
MICRODEPLOY="${CENTRALDARK_MAIN_PINNED_MICRODEPLOY:-$REPO/scripts/vps/main-pinned-microdeploy.sh}"
HERMES_INBOX="${CENTRALDARK_HERMES_INBOX:-$REPO/apps/modulos/HERMES-CORE/missions/pendente}"
HERMES_ANDAMENTO="${CENTRALDARK_HERMES_ANDAMENTO:-$REPO/apps/modulos/HERMES-CORE/missions/em-andamento}"
HERMES_CONCLUIDAS="${CENTRALDARK_HERMES_CONCLUIDAS:-$REPO/apps/modulos/HERMES-CORE/missions/concluidas}"
SOURCE=""
TRIGGER="timer"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="${2:-}"; shift 2 ;;
    --trigger) TRIGGER="${2:-timer}"; shift 2 ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

mkdir -p "$STATE_DIR" "$CD_MAIN_PULSE_DIR"
touch "$LOG_FILE"
chmod 700 "$STATE_DIR"
chmod 600 "$LOG_FILE" 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_FILE"
}

exec 9>"$LOCK"
flock -n 9 || { log "PULSE_SKIP=LOCK_HELD trigger=$TRIGGER"; rm -f -- "$_pulse_state"; exit 75; }
trap '_receipt "$?"' EXIT

[[ -d "$REPO/.git" ]] || { log "PULSE_FAIL=REPO_MISSING repo=$REPO"; exit 10; }
[[ -x "$MICRODEPLOY" ]] || { log "PULSE_FAIL=MICRODEPLOY_MISSING path=$MICRODEPLOY"; exit 11; }

export GIT_TERMINAL_PROMPT=0
if [[ -x "$REPO/secrets/github-read-askpass.sh" ]]; then
  export GIT_ASKPASS="$REPO/secrets/github-read-askpass.sh"
fi
export CENTRALDARK_GITHUB_TOKEN_FILE="${CENTRALDARK_GITHUB_TOKEN_FILE:-$HOME/secrets/GITHUB_TOKEN}"

git -C "$REPO" fetch --prune origin main --quiet || { log "PULSE_FAIL=FETCH"; exit 12; }
MAIN_SHA="$(git -C "$REPO" rev-parse origin/main)"
[[ "$MAIN_SHA" =~ ^[0-9a-f]{40}$ ]] || { log "PULSE_FAIL=MAIN_SHA_INVALID"; exit 13; }

# O checkout vivo pode conter trabalho local legítimo. O reconciliador não
# move HEAD nem apaga tracked dirty; a convergência material é feita por owner,
# com backup/rollback no microdeploy isolado. CURRENT continua explicitamente medido.
LIVE_HEAD="$(git -C "$REPO" rev-parse HEAD)"
if [[ "$LIVE_HEAD" == "$MAIN_SHA" ]]; then
  log "PULSE_LIVE_HEAD=CONVERGED head=$LIVE_HEAD main=$MAIN_SHA"
else
  tracked_dirty=0
  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    tracked_dirty=1
  fi
  log "PULSE_LIVE_HEAD=DRIFT head=$LIVE_HEAD main=$MAIN_SHA tracked_dirty=$tracked_dirty note=owner_scoped_microdeploy_handles_convergence"
fi

if [[ -n "$SOURCE" && "$SOURCE" =~ ^[0-9a-f]{40}$ && "$SOURCE" != "$MAIN_SHA" ]]; then
  if git -C "$REPO" merge-base --is-ancestor "$SOURCE" "$MAIN_SHA" 2>/dev/null; then
    log "PULSE_SOURCE_ADVANCED requested=$SOURCE current=$MAIN_SHA"
  else
    log "PULSE_FAIL=SOURCE_NOT_IN_CURRENT_MAIN source=$SOURCE main=$MAIN_SHA"
    exit 14
  fi
fi

if [[ ! -s "$STATE_FILE" ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
  log "PULSE_INIT=PASS baseline=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi

LAST_SHA="$(tr -d '[:space:]' < "$STATE_FILE")"
if [[ "$LAST_SHA" == "$MAIN_SHA" ]]; then
  log "PULSE_NO_CHANGE=1 main=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi
git -C "$REPO" cat-file -e "$LAST_SHA^{commit}" 2>/dev/null || {
  log "PULSE_FAIL=LAST_SHA_NOT_MATERIALIZED last=$LAST_SHA"
  exit 15
}
git -C "$REPO" merge-base --is-ancestor "$LAST_SHA" "$MAIN_SHA" 2>/dev/null || {
  log "PULSE_FAIL=NON_FAST_FORWARD last=$LAST_SHA main=$MAIN_SHA"
  exit 16
}

mapfile -t CHANGED < <(git -C "$REPO" diff --name-only "$LAST_SHA..$MAIN_SHA")
if [[ "${#CHANGED[@]}" -eq 0 ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  log "PULSE_EMPTY_DELTA=PASS last=$LAST_SHA main=$MAIN_SHA"
  exit 0
fi

declare -a MCP_FILES=() HUB_FILES=() HERMES_FILES=() OAUTH_FILES=() UNHANDLED=()
for rel in "${CHANGED[@]}"; do
  case "$rel" in
    apps/modulos/mcp/*) MCP_FILES+=("$rel") ;;
    apps/bot-telegram/*) HUB_FILES+=("$rel") ;;
    apps/modulos/HERMES-CORE/*|docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/*|.agents/skills/centraldark-operational-method/*) HERMES_FILES+=("$rel") ;;
    apps/modulos/oauth-broker/*) OAUTH_FILES+=("$rel") ;;
    *) UNHANDLED+=("$rel") ;;
  esac
done

deploy_owner() {
  local owner="$1"; shift
  local -a files=("$@")
  [[ "${#files[@]}" -gt 0 ]] || return 0
  local -a args=(--owner "$owner" --source "$MAIN_SHA")
  local f
  for f in "${files[@]}"; do args+=(--file "$f"); done
  log "MICRODEPLOY_BEGIN owner=$owner files=${#files[@]} main=$MAIN_SHA trigger=$TRIGGER"
  "$MICRODEPLOY" "${args[@]}" >>"$LOG_FILE" 2>&1
  log "MICRODEPLOY_PASS owner=$owner files=${#files[@]} main=$MAIN_SHA"
}

# HERMES-CORE pode ser dependência importada pelo MCP. Promove o provider
# antes do consumidor para evitar janela de incompatibilidade entre owners.
deploy_owner hermes "${HERMES_FILES[@]}"
deploy_owner mcp "${MCP_FILES[@]}"
deploy_owner hub_bot "${HUB_FILES[@]}"
if [[ "${#OAUTH_FILES[@]}" -gt 0 ]]; then
  if systemctl is-active --quiet centraldark-oauth-broker.service; then
    deploy_owner oauth_broker "${OAUTH_FILES[@]}"
  else
    log "OAUTH_BROKER_DEPLOY_SKIPPED=1 reason=RUNTIME_NOT_ACTIVE human_frontier=VAULT_KEY_OR_CONFIG_PENDING changed_files=${#OAUTH_FILES[@]} main=$MAIN_SHA"
  fi
fi

if [[ "${#UNHANDLED[@]}" -gt 0 ]]; then
  # HERMES-CORE exige o contrato de continuidade antes de retomar uma missão.
  # Para deltas sem owner conhecido, o pulso cria diretamente uma órfã JSON
  # validável em em-andamento; o Core absorve esse JSON no mesmo executor.
  mkdir -p "$HERMES_ANDAMENTO" "$HERMES_CONCLUIDAS"
  MISSION_ID="main-pulse-${MAIN_SHA:0:12}"
  MISSION="$HERMES_ANDAMENTO/$MISSION_ID.json"
  MISSION_DIR="$HERMES_ANDAMENTO/$MISSION_ID"
  DONE_DIR="$HERMES_CONCLUIDAS/$MISSION_ID"

  if [[ ! -e "$MISSION" && ! -d "$MISSION_DIR" && ! -d "$DONE_DIR" ]]; then
    python3 - "$MISSION" "$MISSION_ID" "$LAST_SHA" "$MAIN_SHA" "$TRIGGER" "${UNHANDLED[@]}" <<'PY'
import json
import sys
from pathlib import Path

mission_path, mission_id, from_sha, to_sha, trigger, *files = sys.argv[1:]
mission_text = (
    "Classificar o delta da main fora dos owners de microdeploy conhecidos. "
    "Identificar owner existente e a menor rota segura de continuidade/deploy. "
    "Não aprovar, promover, inventar owner ou transformar UNKNOWN em PASS sem prova. "
    f"TRIGGER={trigger}; FROM_SHA={from_sha}; TO_SHA={to_sha}; "
    "ARQUIVOS=" + ", ".join(files)
)

state = {
    "objetivo": "Classificar delta da main sem owner de microdeploy conhecido e identificar owner existente/menor rota segura.",
    "autoridade": "SEGREDO/CHEFE",
    "coordenador": "SOL",
    "escritor": "HERMES",
    "escopo": {
        "tipo": "DELTA_MAIN_UNHANDLED",
        "arquivos": files,
        "from_sha": from_sha,
        "to_sha": to_sha,
    },
    "ambiente": "VPS",
    "classe_de_acao": "READ_ONLY_CLASSIFICATION",
    "baseline": {
        "head_sha": to_sha,
        "from_sha": from_sha,
        "fonte": "origin/main",
    },
    "backup": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_NO_BACKUP_REQUIRED",
    },
    "rollback": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_CLASSIFICATION_ONLY",
    },
    "receipt": {
        "head_sha": to_sha,
        "expected": "HERMES_FINALIZATION_CRITIC",
        "mission_id": mission_id,
    },
    "head_sha": to_sha,
    "terminal_state": "RUNNING",
    "historico": [],
    "retomadas": 0,
    "missao": mission_text,
}

payload = {
    "titulo": mission_id,
    "missao": mission_text,
    "descricao": mission_text,
    "state": state,
}
Path(mission_path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
    chmod 600 "$MISSION" 2>/dev/null || true
    log "HERMES_CLASSIFY_QUEUED=1 contract=continuity-v1 file=$MISSION count=${#UNHANDLED[@]}"
  else
    log "HERMES_CLASSIFY_ALREADY_QUEUED=1 mission=$MISSION_ID"
  fi
fi

TMP="$STATE_FILE.tmp.$$"
printf '%s\n' "$MAIN_SHA" > "$TMP"
chmod 600 "$TMP"
mv "$TMP" "$STATE_FILE"
log "PULSE_PASS from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} mcp=${#MCP_FILES[@]} hub=${#HUB_FILES[@]} hermes=${#HERMES_FILES[@]} oauth=${#OAUTH_FILES[@]} unhandled=${#UNHANDLED[@]} trigger=$TRIGGER"

  exit 0
fi
# CentralDark ONE_ENTRY inventory/diff; no passwords, no destructive repairs.
set -Eeuo pipefail
export LC_ALL=C
ROOT="$CD_REPO_DIR"
STATE="$CD_STATE_DIR"
MODE="--inventory"
if [ "$#" -gt 0 ];then MODE="$1";fi
case "$MODE" in --inventory|--diff|--scan) ;; --help) echo 'Uso: centraldark-inventory-reconcile.sh [--menu|--kylin-menu|--inventory|--diff|--scan|--pulse --plan]';exit 0;; *) echo 'BLOCKED: repair requer owner e receita autorizada'; exit 64;; esac
for x in git python3 flock timeout; do command -v "$x" >/dev/null || { echo "BLOCKED: missing $x";exit 2; }; done
git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo 'BLOCKED: repo absent';exit 2; }
umask 077
mkdir -p "$STATE"
exec 9>"$STATE/.lock"
flock -n 9 || { echo 'BLOCKED: another inventory run';exit 75; }
export CD_ROOT="$ROOT" CD_STATE="$STATE"
python3 - <<'PY'
import subprocess,json,os,pathlib,datetime,hashlib
root=pathlib.Path(os.environ['CD_ROOT']);state=pathlib.Path(os.environ['CD_STATE']);repo='ServerVpss/CentralDark'
def call(args,timeout=12):
 try:
  p=subprocess.run(args,cwd=root,text=True,capture_output=True,timeout=timeout)
  return (p.returncode,p.stdout.strip())
 except (OSError,subprocess.TimeoutExpired):return (124,'')
def sector(code):return 'CONNECTED' if code==0 else 'SEM_ACESSO'
v={'schema':'centraldark.reconcile.v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sources':{},'owners':{}}
s=v['sources']
for field,cmd in [('vps_head',['git','rev-parse','HEAD']),('vps_origin_main',['git','rev-parse','origin/main']),('dirty',['git','status','--porcelain','-uno'])]:
 c,o=call(cmd);s[field]={'status':sector(c),'value':o if field!='dirty' and c==0 else None,'changed_count':len(o.splitlines()) if field=='dirty' and c==0 else None}
c,_=call(['gh','auth','status'],6);s['gh_auth']={'status':sector(c)}
if c==0:
 for field,cmd in [('github_main',['gh','api','repos/ServerVpss/CentralDark/branches/main','--jq','.commit.sha']),('prs',['gh','pr','list','-R',repo,'--state','open','--limit','100','--json','number,headRefOid']),('issues',['gh','issue','list','-R',repo,'--state','open','--limit','100','--json','number']),('workflows',['gh','workflow','list','-R',repo,'--json','id,state'])]:
  k,o=call(cmd,17)
  if field=='github_main':s[field]={'status':sector(k),'sha':o if k==0 and len(o)==40 else None}
  else:
   try:items=json.loads(o) if k==0 else []; assert isinstance(items,list)
   except (ValueError,AssertionError):k=1;items=[]
   s[field]={'status':sector(k),'count':len(items) if k==0 else None,'items':items if field=='prs' and k==0 else []}
else:
 for field in ('github_main','prs','issues','workflows'):s[field]={'status':'SEM_ACESSO'}
c,o=call(['df','-B1','--output=avail','/'],4)
try:free=int(o.splitlines()[-1])
except (ValueError,IndexError):free=None
s['disk']={'status':sector(c),'free_bytes':free}
for service in ('centraldark-instinto-superior-web.service','centraldark-oauth-broker.service','centraldark-native-mcp-http.service'):
 k,o=call(['systemctl','is-active',service],4)
 s.setdefault('systemd',{})[service]={'status':'HEALTHY' if k==0 and o=='active' else 'UNKNOWN','active':o=='active'}
for rel in ('scripts/centraldark-inventory-reconcile.sh','scripts/vps/centraldark-vault-bootstrap-inventory.sh','scripts/trigger-fabric/verify_repo_contract.py','scripts/limpeza-autonoma.sh','apps/instinto-superior/src/lib/conexoes.functions.ts','docs/ARQUITETURA/PORTA-HUB-RUBY-CEREBRO.md'):
 p=root/rel
 try:sha=hashlib.sha256(p.read_bytes()).hexdigest()
 except (OSError,PermissionError):sha=None
 v['owners'][rel]={'status':'EXISTS' if sha else 'UNKNOWN','sha256':sha}
s['gmail']={'status':'SEM_ACESSO','reason':'Gmail is an external authorized connector, not an env to scrape'}

import collections,re,time
from zoneinfo import ZoneInfo
started=time.monotonic()
roots=[pathlib.Path(x) for x in ('/root','/opt','/srv','/home','/usr/local','/var/opt')]
skip={'.git','node_modules','.ssh','.cache','.npm','secrets','private','__pycache__','.venv','venv','build','dist'}
ext={'.sh','.bash','.py','.mjs','.cjs','.js','.ts','.ps1','.bat','.cmd','.rb'}
discovered=[];folders=[];seen=set();excluded=collections.Counter()
for base in roots:
 if not base.is_dir():continue
 for here,subdirs,names in os.walk(base,followlinks=False):
  if len(seen)>40000 or time.monotonic()-started>30:excluded['bounded_scan']+=1;break
  subdirs[:]=[d for d in subdirs if d not in skip]
  try:canonical=str(pathlib.Path(here).resolve())
  except OSError:excluded['directory_error']+=1;continue
  if canonical in seen:subdirs[:]=[];continue
  seen.add(canonical)
  if pathlib.Path(here).name!='scripts':continue
  folders.append(here)
  for name in names:
   file=pathlib.Path(here)/name
   if file.suffix.lower() not in ext:continue
   if len(discovered)>12000:excluded['files_limit']+=1;break
   try:
    if file.is_symlink() or file.stat().st_size>250000:excluded['link_or_large']+=1;continue
    data=file.read_bytes()
    if b'\x00' in data:excluded['binary']+=1;continue
    src=data.decode('utf-8','replace')
   except OSError:excluded['file_error']+=1;continue
   sha=hashlib.sha256(data).hexdigest()
   clean=re.sub(r'\s+', '', re.sub(r'(?m)^\s*(?:#|//).*' + chr(36), '', src)).lower()
   normalized=hashlib.sha256(clean.encode()).hexdigest()
   discovered.append((str(file),sha,normalized))
same=collections.defaultdict(list);norm=collections.defaultdict(list);names=collections.defaultdict(list)
for file,sha,n in discovered:
 same[sha].append(file);norm[n].append((file,sha))
 stem=re.sub(r'(?i)(backup|old|copy|temp|[-_.]v[0-9]+)','',pathlib.Path(file).stem.lower())
 names[stem].append(file)
equal=[sorted(group) for group in same.values() if len(group)>1]
normalized=[sorted(file for file,sha in group) for group in norm.values() if len({sha for file,sha in group})>1]
candidates=[sorted(group) for group in names.values() if len(group)>1]
fp=hashlib.sha256('\n'.join(file+' '+sha for file,sha,n in discovered).encode()).hexdigest()
v['brasilia']=datetime.datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%Y-%m-%dT%H:%M:%S%z')
v['duplicates']={'policy':'NEVER_DELETE_AUTOMATICALLY','scanned_scripts_folders':len(folders),'scanned_script_files':len(discovered),
'exact_bytes_count':len(equal),'normalized_content_count':len(normalized),'name_candidates_count':len(candidates),
'exact_bytes':equal[:100],'normalized_content':normalized[:100],'name_candidates_not_proven':candidates[:100],
'folders':folders[:200],'scan_roots':[str(x) for x in roots],'fingerprint':fp,
'partial':bool(excluded or len(equal)>100 or len(normalized)>100 or len(candidates)>100),
'skipped':dict(excluded),'seconds':round(time.monotonic()-started,2)}

latest=state/'centraldark-inventory-reconcile.json'
try:old=json.loads(latest.read_text())
except (OSError,ValueError):
 try:old=json.loads((state/'latest.json').read_text())
 except (OSError,ValueError):old={}
v['pulse']=old.get('pulse') or {'status':'UNKNOWN'}
# The replay state-machine shares this JSON. Inventory must never erase events.
# Preserve accumulated experience byte-for-byte as a JSON value, not a summary.
if isinstance(old.get('replay'), dict):
 v['replay']=old['replay']
changes={k:{'old':old.get(k),'new':v.get(k)} for k in ('sources','owners') if old.get(k)!=v.get(k)}
def atomic(p,payload):
 temp=p.with_suffix('.tmp');temp.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+'\n');temp.replace(p)
if old.get('duplicates',{}).get('fingerprint')!=v['duplicates']['fingerprint']:
 changes['duplicates']={'old_fingerprint':old.get('duplicates',{}).get('fingerprint'),'new_fingerprint':v['duplicates']['fingerprint']}
v['delta']={'at':v['utc'],'changed':bool(changes),'sections':changes}
atomic(latest,v)
print('INTENTION=ONE_ENTRY_INCREMENTAL_INVENTORY')
print('RESULT='+('DELTA' if changes else 'NOOP'))
print('📅 BRASILIA='+v['brasilia'])
print('📂 PASTAS_SCRIPTS='+str(v['duplicates']['scanned_scripts_folders']))
print('🔎 ARQUIVOS_SCRIPTS='+str(v['duplicates']['scanned_script_files']))
print('♻️ MESMOS_BYTES='+str(v['duplicates']['exact_bytes_count'])+' NORMALIZADOS='+str(v['duplicates']['normalized_content_count'])+' CANDIDATOS='+str(v['duplicates']['name_candidates_count']))
for k,x in s.items():print('SECTOR='+k+' STATUS='+x.get('status','MIXED'))
print('OWNER_SCRIPTS_DISCOVERED='+str(sum(x['status']=='EXISTS' for x in v['owners'].values())))
print('RECEIPT='+str(latest))
print('🟡 SCAN_PARTIAL='+str(v['duplicates']['partial']).upper()+' SKIPPED='+json.dumps(v['duplicates']['skipped'],sort_keys=True))
print('NO_RUNTIME_REPAIR=TRUE; RECEIPT_UPDATED=TRUE; NO_NEW_GH=TRUE; NO_AUTO_CREDENTIAL_SEARCH=TRUE')
PY
