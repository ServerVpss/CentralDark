# Supabase MCP — referência da Skill CentralDark

Data base: 2026-06-05 BRT.

Este arquivo complementa a `centraldark-consciencia` instalada via `skil.sh`, MCP ou SSH.

## Estado atual

O MCP CentralDark ganhou suporte Supabase em modo seguro e somente leitura.

Tools publicadas no catálogo MCP:

```txt
supabase_projects
supabase_project_status
supabase_schema_check
supabase_contacts_check
```

## Credenciais

Credenciais reais não ficam no repo e não devem aparecer em chat, log ou auditoria.

Local operacional privado na VPS:

```txt
/root/Multizap/secrets/supabase-mcp.env
```

O arquivo local privado deve guardar o acesso de gestão Supabase e o project ref padrão.

Project ref padrão do MultiZap:

```txt
lyoigsqluyktoclwdaft
```

## Projetos Supabase mapeados

```txt
PUXADAS
project_ref: otifzcjioyjmwmgtxbtj
region: us-west-2
status: ACTIVE_HEALTHY

multizap
project_ref: lyoigsqluyktoclwdaft
region: sa-east-1
status: ACTIVE_HEALTHY
```

Projeto provável do MultiZap:

```txt
multizap
project_ref: lyoigsqluyktoclwdaft
```

## Regras de segurança

- Nunca retornar credencial, senha, chave, cookie ou connection string.
- Tools Supabase são somente leitura por padrão.
- Não aplicar SQL sem confirmação explícita.
- Não importar contatos sem confirmação explícita.
- Saída sempre sanitizada.

## Regra de contatos

```txt
Contatos privados -> podem ser persistidos em contacts.
Grupos/participantes de grupo -> apenas visualização via WuzAPI; não persistir em contacts.
```

## Estado do módulo /contatos

Auditorias confirmaram:

```txt
WuzAPI /user/contacts -> HTTP 200
contatos normalizados -> 3001
Supabase public.contacts -> ausente/404 no REST anterior
```

Antes do import real:

1. Confirmar projeto Supabase correto pelo MCP.
2. Checar schema com `supabase_schema_check`.
3. Criar/validar `public.contacts` no projeto correto.
4. Importar somente contatos privados.
5. Manter grupos somente como visualização via WuzAPI.
