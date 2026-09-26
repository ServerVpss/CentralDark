# Relatório de Auditoria: Fluxo QR WuzAPI/Gateway (Prevenção de 401)
**Data:** $(date '+%Y-%m-%d %H:%M:%S')

### Diagnóstico 
O diagnóstico apontou um **Split-Brain Problem** (Cérebros divididos).
1. O Frontend cria o contato no Banco Supabase (`whatsapp_connections`).
2. O Worker em Node (`supabase-sync.js`) escuta isso, vai até a porta `8081` (WuzAPI) usando `AdminToken` e gera o Token Exclusivo da Instância (O user ID go-lang).
3. O Worker salva o Token novo no Supabase e dorme.
4. O Usuário aperta "Reconectar / Gerar QR". A tela faz um \`fetch()\` nativo para o Gateway Proxy (\`https://proxy.multizap.dev/connections/ID/qr\`).
5. O Gateway olha no \`connections.json\` dele (disco local), não acha a senha (Token) da instância que o Worker gerou, manda um request falso pro WuzAPI, e a WuzAPI devolve \`401 Unauthorized\`.

### Correções Cirúrgicas Executadas (Bridge & Gateway)
1. **Obliteração da Desconexão:** O `apps/bot/server/src/bridge/supabase-sync.js` foi codado para, assim que resgatar o Token gerado do GoLang, escrever via Node `fs.writeFileSync` diretamente no arquivo de configuração do Express Gateway (`/root/Multizap/gateway/data/connections.json`).
2. **Propagação de Estado (Gateway):** O Gateway `connectionService.js` teve sua função `getQr` reforçada. Caso ele caia na rejeição de status 401 Auth do Golang, ele engole o erro e faz um trigger de `invalid_token` no estado visual da aplicação, abortando a carga morta e instruindo o UI a reagir e forçar logout.

### Consideração
Toda a base técnica da WuzAPI Proxy foi unificada. O *token de autenticação isolado* passará limpo.
