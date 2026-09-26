#!/bin/bash
set -euo pipefail

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
NC="\033[0m"

echo -e "${CYAN}=================================================="
echo -e "     COMPARADOR DE PASTAS 'apps' - CentralDark"
echo -e "==================================================${NC}\n"

GITHUB_REPO="ServerVpss/CentralDark"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# ==================== BUSCA MELHORADA ====================
find_github_token() {
    local token=""

    # Busca em todas as pastas secrets
    for dir in /root/CentralDark/secrets /root/Multizap/secrets; do
        if [ -d "$dir" ]; then
            for envfile in "$dir"/*; do
                if [ -f "$envfile" ]; then
                    # Procura qualquer linha que tenha github_pat_ ou ghp_
                    val=$(grep -oE 'github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9_]+' "$envfile" 2>/dev/null | head -1)
                    
                    if [ -n "$val" ]; then
                        token="$val"
                        echo -e "${GREEN}✅ Token encontrado!${NC}"
                        echo -e "   Arquivo: ${YELLOW}$envfile${NC}"
                        echo -e "   Token parcial: ${token:0:12}...${token: -6}"
                        echo ""
                        return 0
                    fi
                fi
            done
        fi
    done

    echo "$token"
}

# ==================== INÍCIO ====================
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}Procurando token automaticamente...${NC}"
    GITHUB_TOKEN=$(find_github_token)
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Token não encontrado automaticamente.${NC}"
    read -p "Cole seu GitHub Token completo (github_pat_...): " GITHUB_TOKEN
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Token é obrigatório. Saindo...${NC}"
    exit 1
fi

echo -e "${GREEN}Token configurado com sucesso.${NC}\n"

# ==================== RESTO DO SCRIPT ====================
REPORT_DIR="/root/CentralDark/revisoes/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

VPS_FOLDERS="$REPORT_DIR/vps-apps-folders.txt"
FINAL_REPORT="$REPORT_DIR/03-final-report.txt"

echo -e "${CYAN}>>> FASE 1 - Buscando pastas 'apps' na VPS${NC}"
find /root -maxdepth 3 -type d -name "apps" ! -path "/root/CentralDark/apps" 2>/dev/null | sort > "$VPS_FOLDERS"

echo -e "\n${YELLOW}Pastas 'apps' encontradas na VPS:${NC}"
cat "$VPS_FOLDERS"

echo -e "\n${CYAN}>>> FASE 2 - Consultando GitHub${NC}"
curl -s -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/$GITHUB_REPO/contents/apps" \
     | jq -r '.[].name' 2>/dev/null > "$REPORT_DIR/github-apps-content.txt"

echo -e "${YELLOW}Conteúdo da pasta apps no GitHub:${NC}"
cat "$REPORT_DIR/github-apps-content.txt"

echo -e "\n${CYAN}>>> FASE 3 - Relatório Final${NC}"
echo "=== RELATÓRIO FINAL ===" > "$FINAL_REPORT"
echo "Data: $(date)" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "## Pastas 'apps' na VPS:" >> "$FINAL_REPORT"
cat "$VPS_FOLDERS" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "## Pasta 'apps' no GitHub:" >> "$FINAL_REPORT"
cat "$REPORT_DIR/github-apps-content.txt" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "## Resumo:" >> "$FINAL_REPORT"
echo "- Pastas apps na VPS: $(wc -l < "$VPS_FOLDERS")" >> "$FINAL_REPORT"
echo "- Itens na pasta apps do GitHub: $(wc -l < "$REPORT_DIR/github-apps-content.txt")" >> "$FINAL_REPORT"

echo -e "\n${GREEN}=================================================="
echo -e " RELATÓRIO CONCLUÍDO"
echo -e "==================================================${NC}"
echo ""
echo "Relatórios gerados em: $REPORT_DIR"
