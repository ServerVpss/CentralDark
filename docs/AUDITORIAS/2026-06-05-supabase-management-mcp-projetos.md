# Auditoria — Supabase Management no MCP CentralDark

Data base: 2026-06-05 BRT.

Escopo: validar acesso de leitura da API de gestão Supabase para o conector MCP CentralDark, sem registrar valores privados.

---

## Resultado validado

A chamada de listagem de projetos Supabase retornou sucesso:

```txt
HTTP: 200
projects_count: 2
```

Projetos encontrados:

```txt
PUXADAS
- project_ref: otifzcjioyjmwmgtxbtj
- region: us-west-2
- status: ACTIVE_HEALTHY

multizap
- project_ref: lyoigsqluyktoclwdaft
- region: sa-east-1
- status: ACTIVE_HEALTHY
```

Projeto provável para o MultiZap atual:

```txt
multizap
project_ref: lyoigsqluyktoclwdaft
region: sa-east-1
```

Motivo: identificadores do frontend/logs anteriores apontam para `lyoigsqluyktoclwdaft`.

---

## Local operacional na VPS

O valor privado de acesso fica somente em arquivo local protegido na VPS:

```txt
/root/Multizap/secrets/supabase-mcp.env
```

Não registrar o valor em repo, chat, logs ou auditorias.

---

## Tools MCP planejadas/implementadas

```txt
supabase_projects
supabase_project_status
supabase_schema_check
supabase_contacts_check
```

Regras:

- saída sempre sanitizada;
- apenas leitura por padrão;
- nenhuma alteração de banco sem confirmação explícita;
- contatos privados podem ir para `contacts`;
- grupos/participantes ficam apenas como visualização via WuzAPI.
