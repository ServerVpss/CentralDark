# Relatório Diagnóstico (Pré-implementação)

### 1. Qual é o arquivo/tela exata do chat no `apps/bot`?
De acordo com os logs de pesquisa local, as telas do bot responsáveis pela inbox ficam em:
- `apps/bot/src/components/chat/ChatSidebar.tsx`
- `apps/bot/src/components/chat/ChatWindow.tsx`
- `apps/bot/src/pages/Chats.tsx`

### 2. Qual hook/store carrega mensagens?
O arquivo `apps/bot/src/pages/Chats.tsx` possui chamadas nativas de `supabase.channel("chat-${selectedContact.id}")` lendo diretamente via subscription.

### 3. Qual tabela do Supabase está sendo lida?
No contexto do CRM e dos Bots (que dividem os mesmos tipos), a tabela canônica que o Gateway alimenta e o frontend deve ler é a `ticket_messages`.

### 4. Qual campo identifica a conversa?
O campo `ticket_id` (que atua como thread_id/chat_id) cruza a mensagem com a sessão ativa. No Supabase Realtime, o filtro `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: \`ticket_id=eq.\${ticket_id}\` })`.

### 5. Qual campo identifica workspace/tenant/conexão?
Os campos `workspace_id` e `connection_id` garantem a propriedade do dado na RLS da tabela `ticket_messages`. O Payload salvo na nuvem armazena essa tríade.

### 6. A tela já usa Supabase Realtime ou só busca inicial/polling?
A tela `Chats.tsx` no Bot **JÁ TENTA USAR** Supabase Realtime. Encontramos a evidência:
`const channel = supabase.channel('chat-...').on('postgres_changes', ...).subscribe();`
Porém, é necessário avaliar a tipagem, tratamento de duplicatas, e ausência de memory leaks durante o unmount (se o `removeChannel` está imune a concorrência).

### 7. As mensagens que o Gateway salva estão na mesma tabela que o frontend lê?
**Sim.** O Gateway insere as mensagens recebidas pela *WuzAPI* na rota `/wuzapi` (invocando `supabaseService.saveMessage`), que internamente direciona para o pool do PostgREST.

### 🔴 CHECK DE SEGURANÇA E RISCO
A tabela `ticket_messages` contém dados primários de PII (Informações Pessoalmente Identificáveis - telefones, arquivos, áudios).

O Hook que implementaremos **precisa** garantir as seguintes amarras:
- Instanciar a `anon key` nativa do Vite.
- O Token JWT do usuário ditará a RLS no Websocket.
- A query de Initial Fetch deve conter `.eq('workspace_id', userWorkspaceId)`.
