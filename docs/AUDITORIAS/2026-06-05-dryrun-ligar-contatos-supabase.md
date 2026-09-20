# Auditoria — Dry-run ligar contatos WuzAPI ao Supabase

Data base: 2026-06-05 BRT  
Escopo: verificar, sem gravar no banco, a ponte necessária para popular a tela `/contatos` com contatos vindos do WuzAPI.

Relatório local gerado na VPS:

```txt
/root/Multizap/revisoes/20260605-200951/auditoria-ligar-contatos-supabase
```

> Segurança: esta auditoria não registra tokens, senhas, chaves, cookies, arquivos de sessão nem connection strings.

---

## Resultado do dry-run

Modo executado:

```txt
SOMENTE LEITURA
não grava banco
não altera sessão
não reinicia serviço
```

Resumo retornado:

```txt
WuzAPI: http://127.0.0.1:8081
Supabase URL carregada: SIM
Supabase key carregada: SIM
WuzAPI admin token carregado: SIM
admin_users_http: 200
instancia_usada: WhatsApp Principal | id: 10b1c03c
wuzapi_contacts_http: 200
wuzapi_contacts_normalizados: 3001
workspace_id: 468167fc-8e84-4795-ab56-4e066b4f0f4f
supabase_contacts_http: 404
supabase_contacts_existentes: 0
would_insert: 3001
would_update_name: 0
```

---

## Conclusão técnica

A parte WuzAPI está OK:

```txt
/admin/users → 200
WhatsApp Principal → loggedIn=true
/user/contacts → 200
contatos normalizados → 3001
```

A parte Supabase `contacts` ainda não estava pronta/acessível no REST testado:

```txt
contacts via REST → 404
```

Por isso a tela `/contatos` fica vazia mesmo com contatos disponíveis no WuzAPI.

---

## Regra de domínio confirmada

```txt
Contatos privados → podem ser persistidos em contacts.
Grupos/participantes de grupo → apenas visualização via WuzAPI; não persistir em contacts.
```

---

## Próximo passo seguro

Antes de gravar os 3001 contatos, mapear o Supabase correto e confirmar/criar a tabela `contacts` compatível com o `contactService`.
