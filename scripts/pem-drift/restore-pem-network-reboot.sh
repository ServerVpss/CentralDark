#!/usr/bin/env bash
# RESTORE-PEM-NETWORK-REBOOT — Restaura capacidade de reinicialização via rede
# Corrige o problema de scripts de recuperação não terem acesso a credenciais PEM/token
# ONE_WRITER_PER_SCOPE: pivete/work/pem-drift-rootcause

set -euo pipefail

echo "============================================================"
echo "PEM-NETWORK-REBOOT RESTORE"
echo "Data: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"
echo ""

# 1. Diagnóstico: identificar todos os scripts que precisam de rede
echo ">>> [1] IDENTIFICANDO SCRIPTS QUE PRECISAM DE CREDENCIAIS DE REDE"
echo "------------------------------------------------------------"
SCRIPTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

echo "Repo root: $REPO_ROOT"
echo ""

# Mapear scripts que usam PM2 restart, docker restart, ou chamadas de rede
echo "Scripts com comandos de reinicialização (PM2/docker/rede):"
grep -rln "pm2 restart\|docker restart\|curl\|wget\|ssh \|scp \|rsync\|nc \|netcat\|telnet" "$REPO_ROOT/scripts/" 2>/dev/null | grep -v node_modules | grep -v '.min.' || echo "  (nenhum encontrado ou sem acesso)"
echo ""

# 2. Verificar quais scripts de recuperação existentes
echo ">>> [2] SCRIPTS DE RECUPERAÇÃO EXISTENTES"
echo "------------------------------------------------------------"
RECOVERY_SCRIPTS=$(find "$REPO_ROOT/scripts/" -name "*restart*" -o -name "*recover*" -o -name "*restore*" -o -name "*fix*" -o -name "*emergencia*" -o -name "*socorro*" 2>/dev/null | grep -v node_modules | grep -v '.min.')
if [ -n "$RECOVERY_SCRIPTS" ]; then
    echo "Scripts de recuperação encontrados:"
    echo "$RECOVERY_SCRIPTS" | while read -r f; do
        echo "  • $f"
        echo "    Tamanho: $(wc -c < "$f" 2>/dev/null || echo '?') bytes"
        echo "    Permissões: $(stat -c '%a' "$f" 2>/dev/null || stat -f '%Lp' "$f" 2>/dev/null || echo '?')"
        echo "    Executável: $(test -x "$f" && echo 'sim' || echo 'não')"
        # Mostrar linhas relevantes
        grep -n "pm2\|docker\|restart\|credential\|token\|pem\|key\|ssh" "$f" 2>/dev/null | head -10 || echo "    (sem referências relevantes)"
        echo ""
    done
else
    echo "Nenhum script de recuperação encontrado"
fi
echo ""

# 3. Verificar acesso a credenciais (simulação)
echo ">>> [3] CHECK DE ACESSO A CREDENCIAIS (SIMULAÇÃO)"
echo "------------------------------------------------------------"
echo "Esta seção simula a checagem de acesso para scripts de recuperação."
echo ""
echo "Para cada script de recuperação, verificar se ele tem acesso a:"
echo "  a) ~/.ssh/id_rsa ou ~/.ssh/id_ed25519 (chave PEM/SSH)"
echo "  b) ~/.calisto/credentials.env (tokens/API keys)"
echo "  c) ~/.calisto/session.token (sessão ativa)"
echo ""

# Verificar existência das credenciais
if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ]; then
    echo "✓ Chaves SSH encontradas:"
    ls -la ~/.ssh/id_* 2>/dev/null | grep -v authorized_keys || true
else
    echo "✗ Chaves SSH não encontradas em ~/.ssh/"
fi
echo ""

if [ -d ~/.calisto ]; then
    if [ -f ~/.calisto/credentials.env ]; then
        echo "✓ ~/.calisto/credentials.env existe"
        echo "  Permissões: $(stat -c '%a' ~/.calisto/credentials.env 2>/dev/null || stat -f '%Lp' ~/.calisto/credentials.env 2>/dev/null || echo '?')"
    else
        echo "✗ ~/.calisto/credentials.env NÃO existe"
    fi
    if [ -f ~/.calisto/session.token ]; then
        echo "✓ ~/.calisto/session.token existe"
        echo "  Permissões: $(stat -c '%a' ~/.calisto/session.token 2>/dev/null || stat -f '%Lp' ~/.calisto/session.token 2>/dev/null || echo '?')"
    else
        echo "✗ ~/.calisto/session.token NÃO existe"
    fi
else
    echo "✗ ~/.calisto/ não existe — credenciais indisponíveis"
fi
echo ""

# 4. Criar wrapper de credenciais para scripts de recuperação
echo ">>> [4] CRIANDO WRAPPER DE CREDENCIAIS PARA SCRIPTS DE RECUPERAÇÃO"
echo "------------------------------------------------------------"
WRAPPER_DIR="${REPO_ROOT}/scripts/pem-drift"
mkdir -p "$WRAPPER_DIR"

cat > "${WRAPPER_DIR}/with-pem-credentials.sh" << 'WRAPPER_EOF'
#!/usr/bin/env bash
# WITH-PEM-CREDENTIALS — Wrapper que injeta credenciais de rede para scripts de recuperação
# Uso: with-pem-credentials.sh <script> [args...]
# ONE_WRITER_PER_SCOPE: pivete/work/pem-drift-rootcause

set -euo pipefail

SCRIPT_TO_RUN="$1"
shift || true

if [ ! -f "$SCRIPT_TO_RUN" ]; then
    echo "ERROR: Script '$SCRIPT_TO_RUN' não encontrado" >&2
    exit 1
fi

if [ ! -x "$SCRIPT_TO_RUN" ]; then
    echo "ERROR: Script '$SCRIPT_TO_RUN' não é executável" >&2
    exit 1
fi

# Exportar variáveis de credencial
if [ -f ~/.ssh/id_rsa ]; then
    export SSH_KEY_PATH="$HOME/.ssh/id_rsa"
    export SSH_KEY_TYPE="rsa"
elif [ -f ~/.ssh/id_ed25519 ]; then
    export SSH_KEY_PATH="$HOME/.ssh/id_ed25519"
    export SSH_KEY_TYPE="ed25519"
fi

if [ -f ~/.calisto/credentials.env ]; then
    set -a
    source ~/.calisto/credentials.env
    set +a
fi

if [ -f ~/.calisto/session.token ]; then
    export CALISTO_SESSION_TOKEN="$(cat ~/.calisto/session.token)"
fi

# Executar script com credenciais
exec "$SCRIPT_TO_RUN" "$@"
WRAPPER_EOF

chmod +x "${WRAPPER_DIR}/with-pem-credentials.sh"
echo "✓ Wrapper criado: ${WRAPPER_DIR}/with-pem-credentials.sh"
echo ""

# 5. Criar script de reboot de serviço via rede
echo ">>> [5] CRIANDO SCRIPT DE REBOOT VIA REDE"
echo "------------------------------------------------------------"

cat > "${WRAPPER_DIR}/pem-network-reboot.sh" << 'REBOOT_EOF'
#!/usr/bin/env bash
# PEM-NETWORK-REBOOT — Reinicia serviços PEM/Calisto com acesso a credenciais de rede
# Uso: pem-network-reboot.sh [--dry-run] [--service <nome>]
# ONE_WRITER_PER_SCOPE: pivete/work/pem-drift-rootcause

set -euo pipefail

DRY_RUN="${1:-}"
SERVICE_NAME="${2:-}"

if [ "$DRY_RUN" = "--dry-run" ]; then
    DRY_RUN=true
    shift
else
    DRY_RUN=false
fi

if [ "$SERVICE_NAME" = "--service" ]; then
    shift
    SERVICE_NAME="${1:-}"
fi

echo "Pem-Network-Reboot: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "=== MODO DRY-RUN — NENHUMA ACÇÃO SERÁ EXECUTADA ==="
    echo ""
fi

# 1. Validar que credenciais estão disponíveis
echo "[1/5] Validando credenciais..."
CREDENTIALS_OK=true

if [ -z "${SSH_KEY_PATH:-}" ] && [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "  ⚠ Sem chave SSH encontrada — operações que exigem SSH podem falhar"
    CREDENTIALS_OK=false
else
    echo "  ✓ Chave SSH disponível"
fi

if [ -z "${CALISTO_SESSION_TOKEN:-}" ] && [ ! -f ~/.calisto/session.token ]; then
    echo "  ⚠ Sem token de sessão Calisto — operações que exigem autenticação podem falhar"
else
    echo "  ✓ Token de sessão disponível"
fi

if [ "$CREDENTIALS_OK" = false ]; then
    echo "  ⚠ Atenção: algumas operações podem falhar por falta de credenciais"
fi
echo ""

# 2. Detectar drift antes de reiniciar
echo "[2/5] Verificando drift de configuração..."
CALISTO_DIR="${HOME}/.calisto"
DRIFT=false

if [ -d "$CALISTO_DIR" ]; then
    if [ -f "$CALISTO_DIR/state.json" ]; then
        if ! python3 -c "import json; json.load(open('${CALISTO_DIR}/state.json'))" 2>/dev/null; then
            echo "  ✗ DRIFT DETECTADO: state.json inválido"
            DRIFT=true
        else
            echo "  ✓ state.json válido"
        fi
    fi
    
    # Verificar arquivos modificados recentemente
    RECENT=$(find "$CALISTO_DIR" -type f -mtime -1 2>/dev/null)
    if [ -n "$RECENT" ]; then
        echo "  ⚠ Arquivos modificados nas últimas 24h — possível drift em progresso"
        echo "     $(echo "$RECENT" | wc -l | tr -d ' ') arquivo(s)"
    fi
else
    echo "  ⚠ ~/.calisto/ não existe — estado pode estar inconsistente"
fi
echo ""

# 3. Parar serviços afetados com quote
echo "[3/5] Parando serviços afetados (com quote)..."
SERVICES_AFFECTED=("CentralDark-HubBot" "MCP-CentralDark" "CloneDeck-CRM")

for svc in "${SERVICES_AFFECTED[@]}"; do
    if command -v pm2 &>/dev/null; then
        if pm2 list 2>/dev/null | grep -q "$svc"; then
            if [ "$DRY_RUN" = true ]; then
                echo "  [DRY-RUN] pm2 stop $svc"
            else
                echo "  Parando $svc..."
                pm2 stop "$svc" 2>/dev/null || echo "    (pm2 stop falhou ou serviço não existe)"
            fi
        else
            echo "  $svc não está em execução (omitindo)"
        fi
    fi
done
echo ""

# 4. Restaurar configuração se drift detectado
if [ "$DRIFT" = true ]; then
    echo "[4/5] DRIFT DETECTADO — tentando restauração..."
    echo "  (Em implementação: restaurar state.json de backup ou re-sincronizar)"
    echo "  ⚠ Restauração automática não implementada — ação manual necessária"
else
    echo "[4/5] Sem drift — pulando restauração"
fi
echo ""

# 5. Reiniciar serviços
echo "[5/5] Reiniciando serviços..."
for svc in "${SERVICES_AFFECTED[@]}"; do
    if command -v pm2 &>/dev/null; then
        if [ "$DRY_RUN" = true ]; then
            echo "  [DRY-RUN] pm2 start $svc (ou pm2 resurrect)"
        else
            echo "  Iniciando $svc..."
            pm2 start "$svc" 2>/dev/null || pm2 resurrect 2>/dev/null || echo "    (pm2 start/resurrectfalhou)"
        fi
    fi
done
echo ""

# 6. Validar que serviços estão online
echo "Validação pós-reinicialização:"
sleep 3
if command -v pm2 &>/dev/null; then
    pm2 list 2>/dev/null | grep -E "online|stopped|errored" || echo "  (pm2 list falhou)"
fi
echo ""

echo "============================================================"
echo "PEM-NETWORK-REBOOT COMPLETO"
echo "============================================================"
REBOOT_EOF

chmod +x "${WRAPPER_DIR}/pem-network-reboot.sh"
echo "✓ Script criado: ${WRAPPER_DIR}/pem-network-reboot.sh"
echo ""

# 6. Criar sistema de checksum baseline para ~/.calisto
echo ">>> [6] INICIALIZANDO SISTEMA DE CHECKSUM PARA ~/.CALISTO"
echo "------------------------------------------------------------"
CALISTO_DIR="${HOME}/.calisto"
if [ -d "$CALISTO_DIR" ]; then
    BASELINE_FILE="${CALISTO_DIR}/.checksum-baseline"
    if [ ! -f "$BASELINE_FILE" ]; then
        find "$CALISTO_DIR" -type f ! -name '.checksum-baseline' -exec md5sum {} \; 2>/dev/null | md5sum | cut -d' ' -f1 > "$BASELINE_FILE"
        echo "✓ Baseline de checksum criado: $BASELINE_FILE"
        echo "   Conteúdo: $(cat $BASELINE_FILE)"
    else
        echo "✓ Baseline já existe: $BASELINE_FILE"
    fi
else
    echo "✗ ~/.calisto/ não existe — não é possível criar baseline"
fi
echo ""

echo "============================================================"
echo "RESTORE COMPLETO"
echo "Próximos passos:"
echo "  1. Executar: ${WRAPPER_DIR}/pem-network-reboot.sh"
echo "  2. Validar que serviços estão online"
echo "  3. Executar: ${WRAPPER_DIR}/check-calisto-drift.sh"
echo "============================================================"
