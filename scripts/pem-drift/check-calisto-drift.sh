#!/usr/bin/env bash
# CHECK-CALISTO-DRIFT — Verifica drift de configuração do Calisto
# Detecta modificações não autorizadas em ~/.calisto/
# ONE_WRITER_PER_SCOPE: pivete/work/pem-drift-rootcause

set -euo pipefail

CALISTO_DIR="${HOME}/.calisto"
STATE_FILE="${CALISTO_DIR}/state.json"
CHECKSUM_FILE="${CALISTO_DIR}/.checksum-baseline"
DRIFT_REPORT="${HOME}/.calisto-drift-report-$(date +%Y%m%d-%H%M%S).txt"

echo "============================================================"
echo "CALISTO-DRIFT CHECK"
echo "Data: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"
echo ""

# 0. Checar existência do diretório
echo ">>> [0] EXISTÊNCIA DO DIRETÓRIO CALISTO"
echo "------------------------------------------------------------"
if [ -d "$CALISTO_DIR" ]; then
    echo "✓ ~/.calisto/ existe"
    echo "Conteúdo:"
    ls -la "$CALISTO_DIR" 2>/dev/null || echo "(sem leitura)"
else
    echo "✗ ~/.calisto/ NÃO existe"
    echo "→ Nenhum drift possível (diretório inexistente)"
    exit 0
fi
echo ""

# 1. Checklist de arquivos esperados
echo ">>> [1] CHECKLIST DE ARQUIVOS ESPERADOS"
echo "------------------------------------------------------------"
EXPECTED_FILES=(
    "state.json"
    "config.yaml"
    "credentials.env"
    "session.token"
)

for f in "${EXPECTED_FILES[@]}"; do
    if [ -f "${CALISTO_DIR}/${f}" ]; then
        echo "✓ ${f} existe"
    else
        echo "✗ ${f} MISSING"
    fi
done
echo ""

# 2. Checar integridade de checksum (se baseline existe)
echo ">>> [2] INTEGRIDADE DE CHECKSUM"
echo "------------------------------------------------------------"
if [ -f "$CHECKSUM_FILE" ]; then
    echo "Baseline de checksum encontrado: $CHECKSUM_FILE"
    echo "Conteúdo do baseline:"
    cat "$CHECKSUM_FILE" 2>/dev/null || echo "(sem leitura)"
    echo ""
    echo "Calculando checksums atuais..."
    CURRENT_MD5=$(find "$CALISTO_DIR" -type f ! -name '.checksum-baseline' -exec md5sum {} \; 2>/dev/null | md5sum | cut -d' ' -f1)
    BASELINE_MD5=$(cat "$CHECKSUM_FILE" 2>/dev/null | cut -d' ' -f1)
    if [ "$CURRENT_MD5" = "$BASELINE_MD5" ]; then
        echo "✓ Checksum OK — sem drift detectado"
    else
        echo "✗ DRIFT DETECTADO!"
        echo "  Baseline: $BASELINE_MD5"
        echo "  Atual:    $CURRENT_MD5"
    fi
else
    echo "✗ Sem baseline de checksum (~/.calisto/.checksum-baseline não existe)"
    echo "  → Não é possível detectar drift sem baseline"
    echo "  → Recomendação: gerar baseline com: check-calisto-drift.sh --save-baseline"
fi
echo ""

# 3. Detecção de arquivos recém-modificados (últimas 24h)
echo ">>> [3] ARQUIVOS MODIFICADOS NAS ÚLTIMAS 24H"
echo "------------------------------------------------------------"
RECENTLY_MODIFIED=$(find "$CALISTO_DIR" -type f -mtime -1 2>/dev/null)
if [ -n "$RECENTLY_MODIFIED" ]; then
    echo "Arquivos modificados nas últimas 24h:"
    echo "$RECENTLY_MODIFIED" | while read -r f; do
        echo "  • $f"
        ls -la "$f" 2>/dev/null
        echo "  Últimas 20 linhas:"
        tail -20 "$f" 2>/dev/null || true
        echo ""
    done
else
    echo "Nenhum arquivo modificado nas últimas 24h"
fi
echo ""

# 4. Detecção de arquivos com permissões incorretas
echo ">>> [4] PERMISSÕES DOS ARQUIVOS"
echo "------------------------------------------------------------"
echo "Arquivos sensíveis (devem ser 600 ou 400):"
for f in credentials.env session.token state.json config.yaml; do
    if [ -f "${CALISTO_DIR}/${f}" ]; then
        PERMS=$(stat -c '%a' "${CALISTO_DIR}/${f}" 2>/dev/null || stat -f '%Lp' "${CALISTO_DIR}/${f}" 2>/dev/null || echo "unknown")
        echo "  ${f}: $PERMS"
        if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
            echo "    ⚠ Permissão não segura — considere chmod 600"
        fi
    fi
done
echo ""

# 5. Detecção de conteúdo corrompido (state.json)
echo ">>> [5] VALIDAÇÃO DE STATE.JSON"
echo "------------------------------------------------------------"
if [ -f "$STATE_FILE" ]; then
    echo "Validando JSON..."
    if python3 -c "import json; json.load(open('${STATE_FILE}'))" 2>/dev/null; then
        echo "✓ state.json é JSON válido"
        echo "Chaves principais:"
        python3 -c "import json; d=json.load(open('${STATE_FILE}')); print('\n'.join(f'  {k}: {type(v).__name__}' for k,v in d.items()))" 2>/dev/null || echo "  (não foi possível listar chaves)"
    else
        echo "✗ state.json é JSON INVÁLIDO — drift de conteúdo confirmado!"
        echo "Conteúdo corrompido:"
        cat "$STATE_FILE" 2>/dev/null | head -50 || echo "(sem leitura)"
    fi
else
    echo "state.json não encontrado (não critico se outros mecanismos de estado existem)"
fi
echo ""

# 6. Checar por arquivos temporários ou backup residuais
echo ">>> [6] ARQUIVOS TEMPORÁRIOS / BACKUP RESIDUAIS"
echo "------------------------------------------------------------"
echo "Arquivos .bak, .tmp, .swp, ~:"
find "$CALISTO_DIR" -type f \( -name '*.bak' -o -name '*.tmp' -o -name '*.swp' -o -name '*~' \) 2>/dev/null | while read -r f; do
    echo "  ⚠ $f"
done
if [ -z "$(find "$CALISTO_DIR" -type f \( -name '*.bak' -o -name '*.tmp' -o -name '*.swp' -o -name '*~' \) 2>/dev/null)" ]; then
    echo "  Nenhum arquivo residual encontrado"
fi
echo ""

# 7. Detecção de symlinks suspeitos
echo ">>> [7] SYMLINKS E ARMAZENAMENTO EXTERNO"
echo "------------------------------------------------------------"
SYMLINKS=$(find "$CALISTO_DIR" -type l 2>/dev/null)
if [ -n "$SYMLINKS" ]; then
    echo "Symlinks encontrados:"
    echo "$SYMLINKS" | while read -r link; do
        echo "  • $link → $(readlink -f "$link" 2>/dev/null || readlink "$link")"
    done
else
    echo "Nenhum symlink encontrado"
fi
echo ""

# 8. Relatório de drift
echo ">>> [8] RESUMO DE DRIFT"
echo "------------------------------------------------------------"
DRIFT_DETECTED=0

# Verificar se algum arquivo essencial está faltando
for f in "${EXPECTED_FILES[@]}"; do
    if [ ! -f "${CALISTO_DIR}/${f}" ]; then
        echo "✗ ARQUIVO ESSENCIAL FALTANDO: ${f}"
        DRIFT_DETECTED=1
    fi
done

# Verificar JSON inválido
if [ -f "$STATE_FILE" ]; then
    if ! python3 -c "import json; json.load(open('${STATE_FILE}'))" 2>/dev/null; then
        echo "✗ STATE.JSON INVÁLIDO"
        DRIFT_DETECTED=1
    fi
fi

if [ $DRIFT_DETECTED -eq 0 ]; then
    echo "✓ NENHUM DRIFT CRÍTICO DETECTADO"
else
    echo "✗ DRIFT CRÍTICO DETECTADO — ação de restauração necessária"
fi
echo ""

# 9. Salvar relatório
echo ">>> [9] RELATÓRIO SALVO EM: $DRIFT_REPORT"
echo "------------------------------------------------------------"
{
    echo "=== CALISTO-DRIFT REPORT ==="
    echo "Data: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    echo "Host: $(hostname 2>/dev/null || echo 'unknown')"
    echo ""
    echo "Diretório: $CALISTO_DIR"
    echo ""
    echo "--- Checklist ---"
    for f in "${EXPECTED_FILES[@]}"; do
        if [ -f "${CALISTO_DIR}/${f}" ]; then
            echo "✓ ${f}"
        else
            echo "✗ ${f} MISSING"
        fi
    done
    echo ""
    echo "--- Checksum ---"
    if [ -f "$CHECKSUM_FILE" ]; then
        echo "Baseline: $(cat $CHECKSUM_FILE)"
        echo "Atual:    $(find "$CALISTO_DIR" -type f ! -name '.checksum-baseline' -exec md5sum {} \; 2>/dev/null | md5sum | cut -d' ' -f1)"
    else
        echo "Sem baseline"
    fi
    echo ""
    echo "--- Arquivos recentes ---"
    find "$CALISTO_DIR" -type f -mtime -1 2>/dev/null || echo "Nenhum"
    echo ""
    echo "--- JSON Validação ---"
    if [ -f "$STATE_FILE" ]; then
        if python3 -c "import json; json.load(open('${STATE_FILE}'))" 2>/dev/null; then
            echo "✓ Válido"
        else
            echo "✗ Inválido"
        fi
    fi
} > "$DRIFT_REPORT"

echo "Relatório salvo em: $DRIFT_REPORT"
echo ""

# 10. Opção de gerar baseline
if [ "${1:-}" = "--save-baseline" ]; then
    echo ">>> [10] GERANDO BASELINE DE CHECKSUM..."
    echo "------------------------------------------------------------"
    find "$CALISTO_DIR" -type f ! -name '.checksum-baseline' -exec md5sum {} \; 2>/dev/null | md5sum | cut -d' ' -f1 > "$CHECKSUM_FILE"
    echo "✓ Baseline salvo em: $CHECKSUM_FILE"
    echo "   Conteúdo: $(cat $CHECKSUM_FILE)"
fi

exit 0
