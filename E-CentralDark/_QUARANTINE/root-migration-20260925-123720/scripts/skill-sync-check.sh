#!/usr/bin/env bash
set -euo pipefail
LOG_FILE="/tmp/skill-sync-check-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date -Iseconds)] Iniciando verificação de sincronização de skills..."

# Configuração
REPO="ServerVpss/CentralDark"
PR_NUMBER=1562
SKILLS_PATH="docs/CONSCIENCIA/HERMES-SKILLS"

# 1. Obter lista de skills canônicas do repositório
echo "Buscando skills canônicas em $REPO/$SKILLS_PATH..."
CANONICAL_SKILLS=$(gh api -H "Accept: application/vnd.github.v3+json" "repos/$REPO/contents/$SKILLS_PATH?ref=main" --jq '.[].name' 2>/dev/null || true)

if [ -z "$CANONICAL_SKILLS" ]; then
    echo "ERRO: Falha ao buscar lista de skills canônicas"
    exit 1
fi

# 2. Obter lista de skills locais (Hermes Desktop)
# Caminho padrão do Hermes Agent no Windows
LOCAL_SKILLS_DIR="${USERPROFILE}/AppData/Local/hermes/skills"
if [ ! -d "$LOCAL_SKILLS_DIR" ]; then
    # Tentativa para Linux/WSL (fallback)
    LOCAL_SKILLS_DIR="${HOME}/.hermes/skills"
fi

if [ ! -d "$LOCAL_SKILLS_DIR" ]; then
    echo "ERRO: Diretório de skills local não encontrado em:"
    echo "  - $LOCAL_SKILLS_DIR (Windows)"
    echo "  - $HOME/.hermes/skills (Linux/WSL)"
    exit 1
fi

LOCAL_SKILLS=$(ls -1 "$LOCAL_SKILLS_DIR" 2>/dev/null || true)

# 3. Comparar e gerar relatório
echo ""
echo "=== RELATÓRIO DE SINCRONIZAÇÃO DE SKILLS ==="
echo "Data/Hora: $(date -Iseconds)"
echo "Repositório: $REPO"
echo "PR-Magazine: #$PR_NUMBER"
echo ""
echo "Skills canônicas ($SKILLS_PATH):"
echo "$CANONICAL_SKILLS" | sort
echo ""
echo "Skills locais:"
echo "$LOCAL_SKILLS" | sort
echo ""

# Skills que estão no canônico mas faltam localmente
MISSING_LOCALLY=$(comm -23 <(echo "$CANONICAL_SKILLS" | sort) <(echo "$LOCAL_SKILLS" | sort) || true)
# Skills que estão localmente mas não no canônico (potencial trabalho local em progresso)
EXTRA_LOCALLY=$(comm -13 <(echo "$CANONICAL_SKILLS" | sort) <(echo "$LOCAL_SKILLS" | sort) || true)

# 4. Se houver diferenças, comentar no PR-magazine
if [ -n "$MISSING_LOCALLY" ] || [ -n "$EXTRA_LOCALLY" ]; then
    echo "📝 Diferenças encontradas. Postando relatório no PR-magazine #$PR_NUMBER..."
    
    # Construir comentário formatado
    COMMENT=$(cat <<'EOF'
## 🔄 Verificação Automática de Sincronização de Skills - $(date -Iseconds)

*Este é um relatório diário de verificação. **Nenhuma alteração foi aplicada automaticamente.** Todas as decisões devem seguir o fluxo: trabalho local → PR-magazine #$PR_NUMBER → revisão → merge.*

### 📊 Resumo
- Skills canônicas: $(echo "$CANONICAL_SKILLS" | wc -l)
- Skills locais: $(echo "$LOCAL_SKILLS" | wc -l)

### 🔍 Detalhes

**❌ Skills canônicas faltando localmente**  
*(Estas skills existem no repositório mas não estão instaladas no Hermes Agent local)*  
$(if [ -n "$MISSING_LOCALLY" ]; then echo "$MISSING_LOCALLY" | sed 's/^/- /'; else echo "_Nenhum_"; fi)

**⚠️ Skills locais extras**  
*(Estas skills existem localmente mas não estão no repositório canônico - podem ser trabalho local em progresso ou habilidades obsoletas)*  
$(if [ -n "$EXTRA_LOCALLY" ]; then echo "$EXTRA_LOCALLY" | sed 's/^/- /'; else echo "_Nenhum_"; fi)

### 🛠️ Próximos passos recomendados
1. **Para skills canônicas faltando localmente:**  
   Considere instalar/atualizar via:  
   `skill_manage create --name <skill> --content <conteúdo canônico>`  
   (Use o conteúdo exato do arquivo no repositório em $SKILLS_PATH/$skill)

2. **Para skills locais extras:**  
   Verifique se este é trabalho local válido que deveria ser proposto como nova skill via PR.  
   Se for trabalho concluído, siga o fluxo: branch → PR → comentário no #$PR_NUMBER → merge.

3. **Para skills com conteúdo divergente:**  
   Este script não verifica diferenças de conteúdo — apenas presença/ausência.  
   Para verificar conteúdo, use:  
   `diff -u <canonical_path> <local_path>`

*Este relatório foi gerado automaticamente. Nenhuma ação foi tomada por este script.*
EOF
)

    # Postar comentário no PR-magazine
    gh api -X POST "repos/$REPO/issues/$PR_NUMBER/comments"         -f body="$(echo "$COMMENT")" > /dev/null

    echo "✅ Relatório postado com sucesso no PR-magazine #$PR_NUMBER"
else
    echo "✅ Todas as skills estão sincronizadas. Nenhuma ação necessária."
fi

echo "[$(date -Iseconds)] Verificação concluída."
exit 0
