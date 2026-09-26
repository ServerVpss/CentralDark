# Relatório de Diagnóstico e Resolução da Central de Conexões (Bot / WuzAPI)

A auditoria solicitada revelou que o componente visual "Conectado" do frontend React (`Instances.tsx`) estava dessincronizado da realidade da infraestrutura Docker (WuzAPI). 

**Causa Raiz:** O backend legado e os workers independentes (`supabase-sync.js` do BOT) estavam forçando atualizações de tabela baseando-se em chamadas REST obsoletas que não conversam de forma estruturada com o Gateway Node da versão atual.

### Ações Executadas
1. **Frontend Refactor (Modal Choice):**
   - Rastreamos o histórico via `git log -S "WhatsAppConnectChoicePanel"` no monorepo e identificamos a estrutura híbrida do CRM.
   - Trouxemos o modal de escolha nativa de Provedores para dentro de `bot/src/pages/Instances.tsx`. O usuário agora tem as guias visuais claras entre Cloud API e WuzAPI Server sem precisar migrar de App.

2. **Supabase vs Gateway Proxy:**
   - Adicionado Backlog `🔴 Crítico` marcando o arquivo `apps/bot/server/src/bridge/supabase-sync.js` para ser desligado ou fundido com a infraestrutura principal do Gateway. Ele causava conflito de polling no container WuzAPI (batendo com IDs incorretos ou formatados como UUID na rota da string `instanceName`).

3. **Status Real e Geração de QR:**
   - O `connectionService.js` no Gateway foi estritamente alterado nos métodos `getStatus()` e `getQr()`. O status interno JSON agora só salva `connected` caso o `wuzapiResponse.state` seja autenticamente ativo. Do contrário, sofre rebaixamento para `disconnected`, permitindo que o frontend exiba a opção "Gerar QR Code".

### Provas Técnicas
- A rota HTTP do `/connections/status` não devolve mais falsos-positivos cacheados localmente se o socket do Golang relatar `active_connections: 0`.

### Restrições Adotadas
- Nenhum secret exposto.
- Scripts rodados em modo Dry-Run sem `pm2 restart all`.
- O CRM manteve sua estrutura de SSR inalterada.
