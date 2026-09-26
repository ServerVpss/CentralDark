# COMANDO - DECISOES_TECNICAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\docs\DECISOES_TECNICAS.md
**SHA:** f7387956d45f5bb7
**Timestamp:** 2026-08-26T19:31:30.043710
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Decisão:** manter sem migration nesta frente. No frontend, detectar grupo por `channelType='group'`, nome/foto de grupo e fallback `@g.us`; o botão lateral “Grupos” apenas ativa o filtro da lista. “
- **Decisão:** manter o endpoint novo `/api/public/wuzapi/webhook` e adicionar compatibilidade para o endpoint antigo `/api/public/wuzapi.webhook`, ambos usando o mesmo handler autenticado por `X-Gatewa
- **Decisão:** manter o build com heap maior (`NODE_OPTIONS=--max-old-space-size=4096`) e excluir `src/routeTree.gen.ts` + `src/integrations/supabase` do `@source` do Tailwind. Isso reduz varredura sem 
- Decisão: toda operação que cria/remove usuário ou altera role/permissão usa fail-closed no rate limit. Update de profile comum e resend de convite seguem fail-open por não serem destrutivos.
- Decisão: manter status colors semânticos (emerald-500 dot, amber warning, red error) hardcoded. Só neutralizar CTAs e banners que competem visualmente com o tema. Motivo: cor semântica é informação, n
- Decisão: manter **dois** componentes raiz no tema NexChat:
- Decisão: aplicar `feature-matrix.ts` direto no header do chat (botões Phone/Video) via `data-disabled`, em vez de esconder os botões. Motivo: manter o **visual** fiel ao template mesmo quando o canal 
- Decisão: Quando o GitHub main não reflete mudanças do Lovable (sync travado), alterar a linha 2 (comentário VERSION) força um diff garantido que dispara o push bidirecional.
- Decisão: Em conexões WhatsApp QR MultiZap, "Reconectar" executa fluxo destrutivo (logout+DELETE no Gateway+tombstone+remove local+abre QR novo), não tenta reuso da sessão.
- Decisão: remover uma conexão QR não pode depender de um único ID. O fluxo agora considera `session_data.gateway_connection_id`, `baileys_session_id` e `phone_number_id` como IDs equivalentes da mesma 

### Padroes
- Regra: antes do DELETE, todos os IDs são marcados em `removed_qr_connections`; depois a limpeza local remove qualquer linha QR que aponte para qualquer um desses IDs. Falha do Gateway é tolerada, limp

### Riscos
- **Risco:** se um ticket legado não tiver última mensagem marcada como grupo nem identificador de grupo, seguirá como privado até saneamento/backfill futuro. Mitigação: tratar backfill em frente separa
- **Risco:** baixo; não altera parser, banco, Gateway, WuzAPI, Meta ou envio. Mitigação: depois do deploy, testar GET nos dois endereços e enviar mensagem real via QR.
- **Risco:** baixo; se algum dia uma classe visual for colocada nesses arquivos gerados, ela não será incluída no CSS. Mitigação: não colocar UI/classes Tailwind em arquivos gerados ou de integração.
- Risco: nenhum (linha é comentário). Status: ativo.
- Risco: usuário pode apagar conexão funcional achando que era "reiniciar". Mitigação: toast claro avisando "Sessão antiga apagada...". Status: ativo.
- Risco: baixo — escopo limitado a `wuzapi_gateway`/`multizap_qr`. Status: ativo.
- **Risco:** baixo — `pg` é lazy, sem `WUZAPI_DB_URL` o caminho não executa; identificação pelo token da sessão (não há userID hardcoded); connection string nunca chega ao frontend nem ao log.
- **Risco:** baixo — só afeta provider `wuzapi_gateway`/`multizap_qr`.
- **Risco:** baixo — outras rotas seguem capadas; 413 é respondido na hora com log sanitizado.

### Ouro Bruto (primeiros 5000 chars)
```
# Decisões técnicas — MultiZap deploy

## 26. `/app/chat` separa grupos visualmente sem migration
**Motivo:** todos os tickets atuais ainda estavam com `tickets.channel_type='private'`, mas mensagens recentes de grupo chegam em `ticket_messages.channel_type='group'`. A aba “Grupos” ficava vazia/errada quando a UI confiava só no campo legado ou quando o botão lateral abria painel de recurso.
**Decisão:** manter sem migration nesta frente. No frontend, detectar grupo por `channelType='group'`, nome/foto de grupo e fallback `@g.us`; o botão lateral “Grupos” apenas ativa o filtro da lista. “Todas”, “Não lidas” e “Canais” excluem grupos.
**Risco:** se um ticket legado não tiver última mensagem marcada como grupo nem identificador de grupo, seguirá como privado até saneamento/backfill futuro. Mitigação: tratar backfill em frente separada, com autorização explícita.

## 25. Webhook QR aceita endpoint antigo e novo
**Motivo:** os logs da VPS mostraram chamadas WuzAPI chegando ao Gateway às 21:16/21:17, mas o teste do endereço antigo `/api/public/wuzapi.webhook` retornou 404 no domínio final. Se `MULTIZAP_WEBHOOK_URL` ainda apontar para esse endereço, o Gateway recebe a mensagem e perde no encaminhamento ao CRM.
**Decisão:** manter o endpoint novo `/api/public/wuzapi/webhook` e adicionar compatibilidade para o endpoint antigo `/api/public/wuzapi.webhook`, ambos usando o mesmo handler autenticado por `X-Gateway-Secret`.
**Risco:** baixo; não altera parser, banco, Gateway, WuzAPI, Meta ou envio. Mitigação: depois do deploy, testar GET nos dois endereços e enviar mensagem real via QR.

## 24. Build de produção exclui arquivos gerados grandes da varredura Tailwind
**Motivo:** o build abortou com SIGABRT em `RegExpImpl::IrregexpExec`/`String::SlowFlatten`, padrão de falta de memória ao processar strings grandes por regex. `routeTree.gen.ts` e os tipos gerados do backend ficam em `src`, mas não têm classes visuais necessárias para o CSS final.
**Decisão:** manter o build com heap maior (`NODE_OPTIONS=--max-old-space-size=4096`) e excluir `src/routeTree.gen.ts` + `src/integrations/supabase` do `@source` do Tailwind. Isso reduz varredura sem alterar runtime.
**Risco:** baixo; se algum dia uma classe visual for colocada nesses arquivos gerados, ela não será incluída no CSS. Mitigação: não colocar UI/classes Tailwind em arquivos gerados ou de integração.

## 23. Rollback da WuzAPI é offline e isolado ao container
**Motivo**: na Fase 4.5 do centro de atualização precisávamos garantir que um rollback automático não pudesse derrubar Recargas Brasil, o Gateway inteiro, nem depender de internet pra `docker pull`.
**Decisão**: `POST /api/system/wuzapi-rollback` só aceita imagens que JÁ estão em cache local (`docker image inspect` antes de qualquer ação). Faz retag local + `docker compose up -d --no-deps wuzapi`. Nunca `-v`, nunca `pm2 restart all`, nunca toca `/root/whatsapp-server` ou porta 3000. Suporta `dry_run` pra validação prévia.
**Risco**: se a imagem anterior não estiver mais em cache (limpeza manual de Docker), o rollback falha — painel mostra erro claro `image_not_local`. Mitigação documentada em `docs/WUZAPI_WHATSMEOW_UPDATE_CENTER.md` com procedimento de rollback manual.


## 22. Correção crítica do normalizador WuzAPI deve existir no GitHub main
**Motivo**: a VPS puxa somente do GitHub main. Se a correção existir apenas no ambiente Lovable, o deploy automático mantém `normalizeService.js` antigo e os eventos WuzAPI voltam como `unknown:no_event` ou não viram `message.received`.
**Decisão**: quando a validação da VPS mostrar `grep` = 0 para `jsonData|ChatPresence|HistorySync|ReadReceipt`, gravar o normalizador diretamente no branch `main` do GitHub via integração segura do painel master, sem expor token. Os dois pacotes devem ficar alinhados: `multizap-gateway-deploy` e `atendimento-whatsapp-gateway-deploy`.
**Risco**: commit direto em produção exige validação imediata na VPS. Mitigação: mudança restrita aos dois normalizadores, rollback por revert do commit novo, sem tocar Recargas Brasil, `/root/whatsapp-server`, portas 3000/9001, PIX, Meta Cloud ou RLS.

## 21. Remover WhatsApp QR nunca pode iniciar conexão nova
**Motivo**: o fluxo anterior misturava abrir modal, criar conexão, gerar QR e reconectar. Após remover uma sessão QR, efeitos/polling ainda podiam disparar `POST /connections`, `POST /session/connect` e `GET /session/qr`, recriando a sessão apagada.
**Decisão**: remover limpa timers, estado local, QR e `connection_id`; fecha o modal e não chama criação/QR. Abrir modal só checa Gateway. Criar conexão e gerar QR ficam restritos a clique explícito em “Conectar WhatsApp” ou “Gerar novo QR”. Desconectar faz apenas logout e mantém o cadastro como `disconnected` para reconexão manual.
**Risco**: menos automação “mágica”, mas o comportamento fica previsível e seguro. Rollback: reverter os arquivos do fluxo QR/app canais e voltar ao modal anterior.

## 20. Frontend nunca fala direto com o Gateway (`MULTIZAP_GATEWAY_T
```