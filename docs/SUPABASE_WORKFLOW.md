<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Supabase Migrations — Workflow Oficial


---

## Visão Geral

Alterações no schema do Supabase (DDL) são feitas via **migrations SQL** versionadas, aplicadas automaticamente pelo GitHub Actions.

```
IA cria arquivo SQL em supabase/migrations/
  → branch + PR
    → merge na main
      → GitHub Actions detecta alteração em supabase/migrations/**.sql
        → Workflow conecta ao banco via SUPABASE_DATABASE_URL (secret)
          → Aplica migrations pendentes em ordem cronológica
```

---

## Como criar uma migration

### 1. Criar arquivo SQL

```
supabase/migrations/YYYYMMDDHHMMSS_descricao.sql
```

Exemplo: `supabase/migrations/20260530020900_fix_handle_new_user.sql`

### 2. Regras do arquivo

- Nome começa com timestamp (garante ordem)
- Extensão `.sql`
- Deve ser **idempotente** quando possível (`IF NOT EXISTS`, `ON CONFLICT`, etc.)
- Nunca conter secrets, senhas ou tokens
- Comentário no topo explicando o que faz e por quê

### 3. Branch + PR

```bash
git checkout -b feat/migration-descricao
# criar arquivo SQL
git add supabase/migrations/
git commit -m "migration: descricao"
git push origin feat/migration-descricao
# abrir PR
```

### 4. Merge → Aplicação automática

Após merge na `main`, o GitHub Actions:
1. Detecta mudança em `supabase/migrations/**.sql`
2. Instala `psql`
3. Cria tabela `_schema_migrations` (se não existir)
4. Para cada `.sql` ordenado por nome:
   - Verifica se já foi aplicado (via `_schema_migrations.filename`)
   - Se não: aplica com `ON_ERROR_STOP=1`
   - Registra `filename`, `checksum` (SHA-256), `applied_at`
5. Se qualquer migration falhar → workflow falha, migrations seguintes não rodam

---

## Tabela de controle

```sql
public._schema_migrations
├── id          SERIAL PRIMARY KEY
├── filename    TEXT NOT NULL UNIQUE
├── checksum    TEXT NOT NULL        -- SHA-256 do arquivo
└── applied_at  TIMESTAMPTZ DEFAULT NOW()
```

---

## Trigger manual

O workflow também pode ser disparado manualmente:
**GitHub → Actions → Supabase Migrations → Run workflow**

---

## Segurança

| Item | Garantia |
|------|----------|
| `SUPABASE_DATABASE_URL` | GitHub Secret, nunca logado |
| Arquivos SQL | Não contêm secrets |
| `ON_ERROR_STOP=1` | Para na primeira falha |
| Checksum | Detecta se arquivo foi alterado após aplicação |
| Controle de duplicatas | `filename UNIQUE` impede reaplicação |

---

## Rollback

Para reverter uma migration:
1. Criar nova migration com o SQL reverso
2. Abrir PR
3. Merge → GitHub Actions aplica o rollback

**Nunca editar ou deletar uma migration já aplicada.**

---

## Regras para IAs

- ✅ Criar arquivos em `supabase/migrations/` com timestamp
- ✅ Abrir PR para revisão
- ❌ Nunca aplicar migration diretamente (é automático via GitHub Actions)
- ❌ Nunca commitar `SUPABASE_DATABASE_URL`
- ❌ Nunca pedir database password, service_role ou SSH
- ❌ Nunca editar migration já aplicada
