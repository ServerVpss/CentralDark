# Auditoria — Supabase contacts/schema

Data base: 2026-06-05 BRT  
Escopo: mapear por que a tela `/contatos` não carrega os contatos vindos do WuzAPI.

Relatório local gerado na VPS:

```txt
/root/Multizap/revisoes/20260605-202020/auditoria-supabase-contatos-schema
```

> Segurança: esta auditoria não registra tokens, senhas, chaves, cookies, arquivos de sessão nem connection strings.

---

## Contexto

A tela `/contatos` existe no projeto e usa:

```txt
apps/bot/src/pages/Contacts.tsx
apps/bot/src/services/contactService.ts
```

O `contactService` consulta a tabela Supabase `contacts` filtrando por `workspace_id`.

A auditoria anterior confirmou que o WuzAPI retorna contatos corretamente:

```txt
WhatsApp Principal
/user/contacts HTTP 200
contatos normalizados: 3001
```

---

## Resultado da auditoria Supabase

Fonte Supabase testada:

```txt
/root/whatsapp-server/console/.env
```

Resultado:

```txt
openapi_http: 200
openapi_tables_count: 153
openapi_tem_contacts: False
contacts_http: 404
profiles_http: 200
chat_messages_http: 200
workspaces_http: 404
whatsapp_connections_http: 404
```

Erro relevante no `contacts`:

```txt
PGRST205
Could not find table public.contacts
```

---

## Conclusão técnica

O Supabase testado está ativo e responde OpenAPI, mas não possui/expõe as tabelas que o frontend `/contatos` espera:

```txt
contacts             → 404
workspaces           → 404
whatsapp_connections → 404
```

Por outro lado, possui tabelas de chat/base já expostas:

```txt
profiles      → 200
chat_messages → 200
```

Conclusão direta:

```txt
O problema não é WuzAPI.
O problema não é a UI de contatos.
O problema é divergência de schema/projeto Supabase:
contactService espera public.contacts, mas o Supabase atual não tem essa tabela exposta.
```

---

## Próximo passo seguro

Antes de inserir os 3001 contatos, decidir uma das opções:

```txt
A) criar tabela contacts compatível com o contactService
B) apontar frontend para tabela existente
C) encontrar Supabase correto onde contacts já exista
```

Regra de domínio já confirmada:

```txt
Contatos privados → podem ser persistidos em contacts.
Grupos/participantes de grupo → apenas visualização via WuzAPI; não persistir em contacts.
```
