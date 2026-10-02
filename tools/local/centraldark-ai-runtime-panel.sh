#!/usr/bin/env bash

# CENTRALDARK-OS AI Runtime Panel
# Read-only inventory and local runtime navigator.
# This script intentionally does not print secrets or token values.

set -u

RUNTIME_DIR="/opt/centraldark"
REPORT_FILE="/home/CENTRAKDARK-OS/Área de Trabalho/inventario-ia-local-centraldark-os.txt"
KYLINBOT_CONFIG="/home/CENTRAKDARK-OS/.kylinbot/config.toml"
KYLINBOT_SOCKET="/home/CENTRAKDARK-OS/.kylinbot/gateway.sock"
MODEL_REPO="/usr/share/kylin-ai/model-repository"
CODEX_CONFIG="/home/CENTRAKDARK-OS/.codex/config.toml"
CLAUDE_MCP_LOGS="/home/CENTRAKDARK-OS/.cache/claude-cli-nodejs/-home-CENTRAKDARK-OS"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

mask() {
    sed -E 's/(token|api[_-]?key|secret|password|authorization|access_token|refresh_token)[^[:space:]\",}]*/\1=<SECRET_PRESENT>/Ig'
}

line() {
    printf '%b\n' "${DIM}----------------------------------------------------------------------------${NC}"
}

pause() {
    echo
    read -r -p "ENTER para voltar ao menu " _
}

ok_missing() {
    local name="$1"
    if command -v "$name" >/dev/null 2>&1; then
        printf "%-18s ${GREEN}OK${NC} %s\n" "$name" "$(command -v "$name")"
    else
        printf "%-18s ${RED}MISSING${NC}\n" "$name"
    fi
}

cmd_version() {
    local label="$1"
    shift
    printf "%-18s " "$label"
    if command -v "$1" >/dev/null 2>&1; then
        "$@" 2>&1 | head -n 1 | mask
    else
        echo "MISSING"
    fi
}

banner() {
    clear
    echo -e "${CYAN}"
    echo "========================================================================"
    echo "                     CENTRALDARK AI CLI RUNTIME"
    echo "              openKylin 3.0 + Kylin AI + KylinBot + MCP"
    echo "                     $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================================================"
    echo -e "${NC}"
    echo -e "${DIM}Modo: inventario e controle local somente-leitura. Tokens nunca sao exibidos.${NC}"
}

menu() {
    echo
    echo -e "${BOLD}${YELLOW}MENU PRINCIPAL${NC}"
    line
    echo -e "  ${GREEN}1${NC}) Dashboard rapido"
    echo -e "  ${GREEN}2${NC}) Sistema, hardware, rede"
    echo -e "  ${GREEN}3${NC}) Agentes e CLIs instalados"
    echo -e "  ${GREEN}4${NC}) KylinBot: status, doctor, gateway, memoria"
    echo -e "  ${GREEN}5${NC}) Kylin AI local: modelos ONNX/Triton/embeddings/audio/imagem"
    echo -e "  ${GREEN}6${NC}) Processos, servicos e portas"
    echo -e "  ${GREEN}7${NC}) MCP, conectores e integracoes"
    echo -e "  ${GREEN}8${NC}) Rotas/endpoints locais e health"
    echo -e "  ${GREEN}9${NC}) Skills, SOPs, cron e memoria"
    echo -e "  ${GREEN}10${NC}) Tokens: onde gerar e como configurar"
    echo -e "  ${GREEN}11${NC}) Abrir CLIs: Codex, Claude, Gemini, KylinBot"
    echo -e "  ${GREEN}12${NC}) Relatorio salvo na Area de Trabalho"
    echo -e "  ${GREEN}13${NC}) Notas openKylin 3.0 / AI OS"
    echo -e "  ${GREEN}0${NC}) Sair"
    echo
    read -r -p "[CENTRALDARK-RUNTIME] Escolha: " choice
}

dashboard() {
    banner
    echo -e "${BOLD}DASHBOARD RAPIDO${NC}"
    line
    echo "Hostname: $(hostname 2>/dev/null)"
    echo "Usuario:  $(whoami 2>/dev/null)"
    if [ -r /etc/os-release ]; then
        . /etc/os-release
        echo "Sistema:  ${PRETTY_NAME:-UNKNOWN}"
    fi
    echo "Kernel:   $(uname -r 2>/dev/null)"
    echo "Sessao:   ${XDG_SESSION_TYPE:-UNKNOWN} / ${XDG_CURRENT_DESKTOP:-UNKNOWN}"
    echo "Runtime:  $RUNTIME_DIR"
    echo
    echo -e "${BOLD}Estado provado nesta maquina${NC}"
    echo "KylinBot daemon:       $(pgrep -af 'kylin-bot daemon' >/dev/null && echo OK || echo MISSING)"
    echo "Kylin AI runtime:      $(pgrep -af 'kylin-ai-runtime' >/dev/null && echo OK || echo MISSING)"
    echo "kytensor/Triton:       $(pgrep -af 'kytensor' >/dev/null && echo OK || echo MISSING)"
    echo "Codex app-server:      $(pgrep -af 'codex app-server' >/dev/null && echo OK || echo MISSING)"
    echo "Remote Commander:      $(pgrep -af 'desktop-commander' >/dev/null && echo OK || echo MISSING)"
    echo "KylinBot Unix socket:  $([ -S "$KYLINBOT_SOCKET" ] && echo OK || echo MISSING)"
    echo "KylinBot TCP 42617:    $(timeout 2s bash -c '</dev/tcp/127.0.0.1/42617' >/dev/null 2>&1 && echo OPEN || echo CLOSED)"
    echo
    echo -e "${BOLD}Resumo${NC}"
    echo "- IA local real: Kylin AI ONNX/Triton para ASR, TTS, OCR, embeddings, segmentacao."
    echo "- Agente local: KylinBot 0.7.5 rodando via daemon/socket Unix."
    echo "- Coding/agent remoto: Codex, Claude e Gemini instalados."
    echo "- LLM local tipo Ollama/llama.cpp/vLLM/LocalAI/LM Studio: nao provado."
    pause
}

system_info() {
    banner
    echo -e "${BOLD}SISTEMA, HARDWARE E REDE${NC}"
    line
    hostname
    whoami
    uname -a
    echo
    [ -r /etc/os-release ] && cat /etc/os-release
    echo
    lscpu 2>/dev/null | sed -n '1,40p'
    echo
    free -h
    echo
    lsblk -o NAME,FSTYPE,SIZE,FSUSED,FSAVAIL,FSUSE%,MOUNTPOINTS 2>/dev/null
    echo
    echo "GPU:"
    lspci 2>/dev/null | grep -Ei 'vga|3d|display|nvidia|amd|radeon|intel' || true
    nvidia-smi --query-gpu=name,memory.total,memory.used,driver_version --format=csv,noheader 2>/dev/null || true
    echo
    echo "Sessao grafica:"
    printf 'XDG_SESSION_TYPE=%s\nWAYLAND_DISPLAY=%s\nDISPLAY=%s\nDESKTOP_SESSION=%s\nXDG_CURRENT_DESKTOP=%s\n' \
        "${XDG_SESSION_TYPE:-}" "${WAYLAND_DISPLAY:-}" "${DISPLAY:-}" "${DESKTOP_SESSION:-}" "${XDG_CURRENT_DESKTOP:-}"
    echo
    echo "Rede:"
    ip -brief addr 2>/dev/null | mask
    ip route 2>/dev/null | sed -n '1,40p' | mask
    pause
}

agents_cli() {
    banner
    echo -e "${BOLD}AGENTES E CLIS INSTALADOS${NC}"
    line
    for c in codex claude gemini kylin-bot ollama llama-server llama-cli llamafile vllm local-ai lmstudio docker podman python3 node npm npx rustc cargo; do
        ok_missing "$c"
    done
    echo
    echo -e "${BOLD}Versoes${NC}"
    cmd_version "kylin-bot" kylin-bot --version
    cmd_version "claude" claude --version
    cmd_version "gemini" gemini --version
    cmd_version "codex" codex --version
    cmd_version "node" node --version
    cmd_version "npm" npm --version
    cmd_version "python3" python3 --version
    cmd_version "pip3" pip3 --version
    echo
    echo "Nao encontrados na auditoria: ollama, llama.cpp, vLLM, LocalAI, LM Studio, Docker/Podman."
    pause
}

kylinbot_panel() {
    banner
    echo -e "${BOLD}KYLINBOT${NC}"
    line
    echo "Config:    $KYLINBOT_CONFIG"
    echo "Workspace: /home/CENTRAKDARK-OS/.kylinbot/workspace"
    echo "Socket:    $KYLINBOT_SOCKET"
    echo
    echo -e "${BOLD}Status${NC}"
    kylin-bot status 2>&1 | mask | sed -n '1,120p'
    echo
    echo -e "${BOLD}Doctor${NC}"
    kylin-bot doctor 2>&1 | mask | sed -n '1,160p'
    echo
    echo -e "${BOLD}Gateway Unix socket${NC}"
    ls -l "$KYLINBOT_SOCKET" 2>/dev/null || true
    timeout 5s curl --unix-socket "$KYLINBOT_SOCKET" -sS -o /tmp/kylinbot_panel_sock -w 'HTTP %{http_code} ERR %{errormsg}\n' http://localhost/ 2>&1 | mask
    head -c 500 /tmp/kylinbot_panel_sock 2>/dev/null | mask
    echo
    pause
}

kylin_ai_models() {
    banner
    echo -e "${BOLD}KYLIN AI LOCAL: MODELOS, EMBEDDINGS, AUDIO, IMAGEM${NC}"
    line
    echo "Model repo: $MODEL_REPO"
    echo
    echo -e "${BOLD}Diretorios de modelos${NC}"
    find "$MODEL_REPO" -maxdepth 2 -type d -printf '%p\n' 2>/dev/null | sort | sed -n '1,120p'
    echo
    echo -e "${BOLD}Tamanhos por modelo${NC}"
    du -sh "$MODEL_REPO"/* 2>/dev/null | sort -h
    echo
    echo -e "${BOLD}Maiores artefatos ONNX/Triton${NC}"
    find "$MODEL_REPO" -maxdepth 3 -type f -printf '%s\t%p\n' 2>/dev/null | sort -nr | head -n 50
    echo
    echo -e "${BOLD}Modelos carregados agora${NC}"
    ps -eo pid,ppid,stat,etime,comm,args 2>/dev/null | grep -Ei 'kytensor|triton_python|model-repository' | grep -v grep | mask || true
    pause
}

process_services_ports() {
    banner
    echo -e "${BOLD}PROCESSOS, SERVICOS E PORTAS${NC}"
    line
    echo -e "${BOLD}Processos IA/runtime${NC}"
    ps -eo pid,ppid,stat,etime,comm,args 2>/dev/null | grep -Ei 'kylin-bot|kylinbot|kylin-ai|aiassistant|codex|claude|gemini|ollama|llama|vllm|local-ai|node|python|mcp|agent|openai|anthropic|deepseek|qwen|triton|kytensor' | grep -v grep | mask || true
    echo
    echo -e "${BOLD}Servicos user relacionados${NC}"
    systemctl --user list-units --type=service --type=socket --type=timer --all --no-pager 2>/dev/null | grep -Ei 'ai|bot|codex|claude|gemini|kylin|ollama|llama|mcp|agent|openai|anthropic|deepseek|qwen' || true
    echo
    echo -e "${BOLD}Portas escutando${NC}"
    ss -ltnup 2>/dev/null | mask
    pause
}

mcp_integrations() {
    banner
    echo -e "${BOLD}MCP, CONECTORES E INTEGRACOES${NC}"
    line
    echo -e "${BOLD}Codex plugins/cache${NC}"
    find /home/CENTRAKDARK-OS/.codex/plugins/cache/openai-curated-remote -mindepth 1 -maxdepth 1 -type d -printf '%f\n' 2>/dev/null | sort
    echo
    echo -e "${BOLD}Claude MCP logs${NC}"
    find "$CLAUDE_MCP_LOGS" -maxdepth 1 -type d -name 'mcp-logs-*' -printf '%f\n' 2>/dev/null | sort
    echo
    echo -e "${BOLD}KylinBot MCP config${NC}"
    if [ -r "$KYLINBOT_CONFIG" ]; then
        grep -n '^\[mcp\]\|^enabled =\|^servers =' "$KYLINBOT_CONFIG" 2>/dev/null | mask
    fi
    echo
    echo -e "${BOLD}Remote Desktop Commander${NC}"
    ps -eo pid,ppid,stat,etime,comm,args 2>/dev/null | grep -Ei 'desktop-commander|mcp/server.mjs' | grep -v grep | mask || true
    pause
}

routes_health() {
    banner
    echo -e "${BOLD}ROTAS, ENDPOINTS E HEALTH LOCAL${NC}"
    line
    echo -e "${BOLD}Portas provadas${NC}"
    ss -ltnup 2>/dev/null | grep -E '(:8000|:8001|:8002|:42617|:9515|:8787)\b|Netid' | mask || true
    echo
    echo -e "${BOLD}Health probes conhecidos${NC}"
    for u in \
        http://127.0.0.1:42617/ \
        http://127.0.0.1:42617/health \
        http://127.0.0.1:42617/api/health \
        http://127.0.0.1:9515/status \
        http://127.0.0.1:8787/v1/actions \
        http://127.0.0.1:8000/ \
        http://127.0.0.1:8001/ \
        http://127.0.0.1:8002/; do
        echo "### $u"
        timeout 5s curl -sS -o /tmp/centraldark_ai_probe -w 'HTTP %{http_code} ERR %{errormsg}\n' "$u" 2>&1 | mask
        head -c 300 /tmp/centraldark_ai_probe 2>/dev/null | mask
        echo
    done
    echo "### unix://$KYLINBOT_SOCKET"
    timeout 5s curl --unix-socket "$KYLINBOT_SOCKET" -sS -o /tmp/centraldark_ai_sock -w 'HTTP %{http_code} ERR %{errormsg}\n' http://localhost/ 2>&1 | mask
    head -c 500 /tmp/centraldark_ai_sock 2>/dev/null | mask
    echo
    pause
}

skills_memory() {
    banner
    echo -e "${BOLD}SKILLS, SOPS, CRON E MEMORIA${NC}"
    line
    echo -e "${BOLD}KylinBot skills${NC}"
    kylin-bot skills list 2>&1 | mask
    echo
    echo -e "${BOLD}SOPs${NC}"
    kylin-bot sop list 2>&1 | mask
    echo
    echo -e "${BOLD}Cron${NC}"
    kylin-bot cron list 2>&1 | mask
    echo
    echo -e "${BOLD}Memory stats${NC}"
    kylin-bot memory stats 2>&1 | mask
    echo
    echo -e "${BOLD}SQLite tables${NC}"
    for db in \
        /home/CENTRAKDARK-OS/.kylinbot/workspace/memory/brain.db \
        /home/CENTRAKDARK-OS/.kylinbot/workspace/cron/jobs.db \
        /home/CENTRAKDARK-OS/.kylinbot/workspace/sessions/sessions.db \
        /home/CENTRAKDARK-OS/.config/kylin-aiassistant/knowledgeBase/knowledge_base.db; do
        echo "### $db"
        sqlite3 "$db" '.tables' 2>/dev/null || echo "sqlite read failed"
    done
    pause
}

tokens_help() {
    banner
    echo -e "${BOLD}TOKENS: ONDE GERAR E COMO USAR LOCALMENTE${NC}"
    line
    echo "Este painel nao mostra tokens salvos."
    echo "Gere token novo no provider e configure pelo fluxo oficial."
    echo
    echo "Providers comuns:"
    echo "- OpenRouter: https://openrouter.ai/settings/keys"
    echo "- OpenAI:     https://platform.openai.com/api-keys"
    echo "- Anthropic: https://console.anthropic.com/settings/keys"
    echo "- Gemini:    https://aistudio.google.com/app/apikey"
    echo
    echo "KylinBot:"
    echo "- Ver auth:              kylin-bot auth --help"
    echo "- Onboard provider:      kylin-bot onboard providers"
    echo "- Ver providers:         kylin-bot providers"
    echo "- Ver modelos/cache:     kylin-bot models --help"
    echo
    echo "Codex/Claude/Gemini:"
    echo "- Codex:  codex"
    echo "- Claude: claude"
    echo "- Gemini: gemini"
    echo
    echo "Nota: os modelos Kylin AI locais ONNX/Triton vistos aqui nao dependem de token externo para existir/carregar."
    pause
}

open_clis() {
    banner
    echo -e "${BOLD}ABRIR CLIS / AGENTES${NC}"
    line
    echo "1) Codex"
    echo "2) Claude"
    echo "3) Gemini"
    echo "4) KylinBot agent"
    echo "5) KylinBot providers"
    echo "6) KylinBot auth help"
    echo "0) Voltar"
    echo
    read -r -p "Escolha: " c
    case "$c" in
        1) command -v codex >/dev/null && codex || echo "codex nao encontrado" ;;
        2) command -v claude >/dev/null && claude || echo "claude nao encontrado" ;;
        3) command -v gemini >/dev/null && gemini || echo "gemini nao encontrado" ;;
        4) kylin-bot agent ;;
        5) kylin-bot providers ;;
        6) kylin-bot auth --help ;;
        0) return ;;
        *) echo "Opcao invalida" ;;
    esac
    pause
}

saved_report() {
    banner
    echo -e "${BOLD}RELATORIO SALVO${NC}"
    line
    echo "Arquivo: $REPORT_FILE"
    echo
    if [ -r "$REPORT_FILE" ]; then
        sed -n '1,220p' "$REPORT_FILE"
    else
        echo "Relatorio ainda nao existe."
    fi
    pause
}

openkylin_notes() {
    banner
    echo -e "${BOLD}NOTAS OPENKYLIN 3.0 / AI OS${NC}"
    line
    echo "Inventario local + pesquisa web feita nesta sessao:"
    echo
    echo "- Esta maquina roda openKylin 3.0 (huanghe), kernel Linux 7.0.0-2-generic."
    echo "- A release openKylin 3.0 e divulgada como 'AI native' / AI+OS, com KylinBot nativo."
    echo "- Fontes publicas citam UKUI 4.24, suporte a agentes de IA e integracao mais profunda entre desktop e IA."
    echo "- Nesta maquina isso aparece como KylinBot, Kylin AI runtime, kytensor/Triton e servicos Kylin AI."
    echo
    echo "Fontes pesquisadas:"
    echo "- openKylin oficial: https://www.openkylin.top/news/4099-en.html"
    echo "- OpenAtom: https://openatom.org/journalism/detail/K5Fe0TZfSWLH"
    echo "- ItsFOSS: https://itsfoss.com/news/openkylin-3-0-released/"
    echo
    echo "Cuidado: as fontes descrevem a release geral; o estado real desta maquina e o que o inventario local prova."
    pause
}

main() {
    while true; do
        banner
        menu
        case "${choice:-}" in
            1) dashboard ;;
            2) system_info ;;
            3) agents_cli ;;
            4) kylinbot_panel ;;
            5) kylin_ai_models ;;
            6) process_services_ports ;;
            7) mcp_integrations ;;
            8) routes_health ;;
            9) skills_memory ;;
            10) tokens_help ;;
            11) open_clis ;;
            12) saved_report ;;
            13) openkylin_notes ;;
            0) clear; echo "CENTRALDARK AI CLI Runtime encerrado."; exit 0 ;;
            *) echo "Opcao invalida"; sleep 1 ;;
        esac
    done
}

main "$@"
