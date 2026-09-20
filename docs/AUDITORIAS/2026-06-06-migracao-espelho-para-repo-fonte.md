# Auditoria — Migração do espelho para repo fonte

Data base: 2026-06-06 BRT.

Escopo: corrigir arquivos que foram gravados por engano no espelho `segredounlock/clone-deck` e migrar para o repo fonte correto `ServerVpss/clone-deck`.

---

## Repo fonte confirmado

```txt
ServerVpss/clone-deck
```

O owner correto possui dois `s` no final: `ServerVpss`.

O antigo `segredounlock/clone-deck` deve ser tratado como espelho/destino de sync, não como fonte de escrita operacional.

---

## Arquivos migrados para o repo fonte

```txt
CentralDark/apps/mcp/src/tools/supabase.ts
CentralDark/apps/mcp/src/tools-catalog.ts
skills/centraldark-consciencia/supabase-mcp.md
docs/AUDITORIAS/2026-06-05-dryrun-ligar-contatos-supabase.md
docs/AUDITORIAS/2026-06-05-auditoria-supabase-contatos-schema.md
docs/AUDITORIAS/2026-06-05-supabase-management-mcp-projetos.md
```

---

## Commits principais no repo fonte

```txt
edb483a feat(mcp): adicionar tools Supabase seguras
418b919 feat(mcp): publicar tools Supabase no catalogo
3549957 docs: migrar auditoria contatos Supabase para repo fonte
30e50a6 docs: migrar auditoria schema contatos para repo fonte
90fc16a docs: migrar auditoria Supabase Management MCP para repo fonte
eaf3c16 docs(skill): migrar referência Supabase MCP para repo fonte
```

---

## Regra operacional corrigida

```txt
Escrita principal sempre em ServerVpss/clone-deck.
Espelho/sync pode refletir depois para segredounlock/clone-deck.
Não usar segredounlock como fonte de escrita, salvo tarefa explícita de espelho.
```

---

## Estado funcional migrado

Tools Supabase no MCP:

```txt
supabase_projects
supabase_project_status
supabase_schema_check
supabase_contacts_check
```

Regras preservadas:

```txt
- tools Supabase são somente leitura por padrão;
- saída sempre sanitizada;
- valores privados ficam apenas na VPS/secrets;
- contatos privados podem ser persistidos em contacts;
- grupos/participantes ficam apenas como visualização via WuzAPI;
- nenhuma alteração de banco sem confirmação explícita.
```

---

## Próximo passo

Validar workflow/deploy do repo fonte e conferir se o catálogo MCP publicado inclui as tools Supabase.
