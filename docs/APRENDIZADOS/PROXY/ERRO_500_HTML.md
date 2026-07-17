> **OBSOLETO:** o proxy antigo foi removido. Use somente o Gateway CentralDark em `https://api.centralldark.com/v1` com `CENTRALDARK_GATEWAY_KEY`.\n\n# 🚨 REGISTRO DE FALHA: Proxy Web vs API

### O Diagnóstico
O erro "Only HTML requests are supported here" (Status 500) ocorre quando tentamos conectar o Cline (um bot) em um Proxy que só aceita navegação via navegador (HTML).

### A Lição
1. O api.centralldark.com NÃO é um endpoint de API, é uma interface web.
2. Não perca tempo tentando ajustar headers de proxy que não servem para API.
3. Se o curl retornar HTML em vez de JSON, o Cline não vai conectar.
