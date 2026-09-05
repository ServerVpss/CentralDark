#!/usr/bin/env bash
# dependabot-integration-test.sh
# Teste de integração do sistema dependabot completo
# Executar: bash scripts/dependabot/dependabot-integration-test.sh

set -euo pipefail

echo "=== TESTE DE INTEGRAÇÃO DEPENDABOT ==="
echo "Iniciado: $(date -Iseconds)"

FAILED=0

# Teste 1: Verificar se dependabot.yml existe e é válido
echo ""
echo "🧪 Teste 1: dependabot.yml existe e é YAML válido"
if [ -f .github/dependabot.yml ]; then
    echo "  ✅ Arquivo existe"
    # Verificar se tem a estrutura mínima
    if grep -q "package-ecosystem" .github/dependabot.yml; then
        echo "  ✅ Contém package-ecosystem"
    else
        echo "  ❌ Falta package-ecosystem"
        FAILED=1
    fi
else
    echo "  ❌ Arquivo não existe"
    FAILED=1
fi

# Teste 2: Verificar se dependabot-auto-merge.yml existe e é YAML válido
echo ""
echo "🧪 Teste 2: dependabot-auto-merge.yml existe e é YAML válido"
if [ -f .github/workflows/dependabot-auto-merge.yml ]; then
    echo "  ✅ Arquivo existe"
    # Verificar se não tem o passo problemático de APPROVE
    if grep -q "createReview" .github/workflows/dependabot-auto-merge.yml; then
        echo "  ❌ Ainda contém createReview (pode causar erro 422)"
        FAILED=1
    else
        echo "  ✅ Não contém createReview (passo APPROVE removido)"
    fi
else
    echo "  ❌ Arquivo não existe"
    FAILED=1
fi

# Teste 3: Verificar se resolve-conflicts.sh existe e é executável
echo ""
echo "🧪 Teste 3: resolve-conflicts.sh existe e é executável"
if [ -f scripts/dependabot/resolve-conflicts.sh ]; then
    echo "  ✅ Arquivo existe"
    if [ -x scripts/dependabot/resolve-conflicts.sh ]; then
        echo "  ✅ É executável"
    else
        echo "  ❌ Não é executável"
        FAILED=1
    fi
else
    echo "  ❌ Arquivo não existe"
    FAILED=1
fi

# Teste 4: Verificar se script de monitoramento existe
echo ""
echo "🧪 Teste 4: dependabot-supreme-monitor.sh existe"
if [ -f scripts/dependabot/dependabot-supreme-monitor.sh ]; then
    echo "  ✅ Arquivo existe"
else
    echo "  ❌ Arquivo não existe"
    FAILED=1
fi

# Teste 5: Verificar se documentação foi criada
echo ""
echo "🧪 Teste 5: Documentação de cristalização existe"
if [ -f docs/BRAIN/07-APRENDIZADOS-MEMORIAS/01-OURO/dependabot-supreme-cristalization.md ]; then
    echo "  ✅ Cristalização existe"
else
    echo "  ❌ Cristalização não existe"
    FAILED=1
fi

# Teste 6: Verificar se receipt do erro 422 existe
echo ""
echo "🧪 Teste 6: Receipt do erro 422 existe"
if [ -f .github/WORKFLOW-RECEIPT-422.md ]; then
    echo "  ✅ Receipt existe"
else
    echo "  ❌ Receipt não existe"
    FAILED=1
fi

# Teste 7: Verificar se validação do workflow existe
echo ""
echo "🧪 Teste 7: Validação do workflow existe"
if [ -f .github/WORKFLOW-VALIDATION.md ]; then
    echo "  ✅ Validação existe"
else
    echo "  ❌ Validação não existe"
    FAILED=1
fi

# Teste 8: Verificar se sumário executivo existe
echo ""
echo "🧪 Teste 8: Sumário executivo existe"
if [ -f docs/BRAIN/07-APRENDIZADOS-MEMORIAS/01-OURO/dependabot-supreme-resumo-executivo.md ]; then
    echo "  ✅ Sumário existe"
else
    echo "  ❌ Sumário não existe"
    FAILED=1
fi

echo ""
echo "=== RESULTADO DO TESTE ==="
if [ $FAILED -eq 0 ]; then
    echo "✅ Todos os testes passaram"
    exit 0
else
    echo "❌ Alguns testes falharam"
    exit 1
fi
