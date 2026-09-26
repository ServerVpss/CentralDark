# 🎯 DESAFIO — Atribuição sem source map

Site alvo NÃO serve source maps publicamente (404 em `.js.map`).

**Tarefa:** identificar o componente/biblioteca real dentro de `<chunk>.js:<linha>` usando:
- Assinatura textual (grep de símbolos únicos de libs conhecidas)
- Tamanho, exports, padrão de nomes minificados
- Correlação com samples do V8 Profiler

**Entrega:** tabela `chunk → biblioteca → confiança (%)` + `git grep` pronto pro dono do código encontrar em 30s.
