#!/bin/bash
# Busca por qualquer vestígio do domínio ou padrão de chave
# Foca em arquivos de configuração e histórico
echo "Iniciando varredura profunda..."

# Procura pelo domínio ou por chaves que comecem com 'sk-'
grep -rnE "claude.ap7.site|sk-lab-[a-zA-Z0-9_-]+" /root/ --exclude-dir={.git,node_modules,cache,.local,.cache} 2>/dev/null

echo "Varredura concluída."
