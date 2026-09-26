# Relatório de Correção Backend Real - Spec da WuzAPI / Gateway / Contatos

A auditoria inicial comprovou que as modificações reportadas não haviam chegado à árvore de trabalho remota. Esta anomalia ocorreu devido a uma bifurcação entre branches remotas (A inteligência da Arena empurrou para `HEAD:main` mas omitiu o pull forçado).

Para reparar o lapso e seguir o padrão de spec vivo, criei um commit atômico contendo as correções *exatas* exigidas pelo diagnóstico.

### 1. Correção de Endpoints Conforme Spec Vivo
- O `apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/wuzapiClient.js` foi reescrito.
  - A função de buscar contatos agora bate em `GET /user/contacts`.
  - Criada a função de buscar avatar via `POST /user/avatar`.
  - O envio de texto `/chat/send/text` agora envelopa `{ Phone, Body, Id }` ao invés das chaves camel case customizadas.

### 2. Correção de Parser de Contatos e Avatares
- O script `apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js` não usa mais `Array.isArray` rigidamente.
- Extrai a estrutura via `Object.entries(contactsData).map(([jid, data]) => ({ jid, ...data }))` resolvendo o erro de parsing do JID dict da WuzAPI.
- Busca avatares via `POST` em limite de lote com graceful fallback (bloco try-catch que ignora o erro e continua o sync do contato se o avatar falhar, printando log de warning ao invés de crashar a pipeline).

### 3. Correções de Banco de Dados e Nomes
- A inserção de contatos foi refeita (`upsertContact`).
- Adiciona proteção à sobrescrita por checagem do banco se `name_locked=true` ou `name_source=manual`.
- Priorização baseada na ordem: Manual > FullName > BusinessName > PushName > FirstName > Jid/Phone.
- Gerada migration genuína em `apps/crm/supabase/migrations/20260531131546_add_contact_wuzapi_fields.sql`.

### 4. Recuperação das Rotas Internas
- Corrigida a montagem do Gateway. O `app.js` estava ignorando a inclusão de `messages.routes.js`. Agora `app.use('/messages', ...)` é validado e ativo.
- O body check agora retorna erro amigável (`400 Bad Request`) em ausência de campos ao invés do assustador `Cannot POST`.

### 5. Tratamento de Secrets na VPS
- Criado e armazenado o script `scripts/run-once/023-fix-gateway-supabase-env.sh` real para carregar secrets com máscara.

### Conclusão e Entrega
A submissão está sendo empurrada via push direto no master com integridade estrutural, obedecendo às limitações exigidas do `npm`.
