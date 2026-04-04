

# Persistir Estado dos Módulos de Consulta

## Problema Atual
- O painel web (`QueryModulesManager`) só gerencia estado local em memória — ao recarregar, reseta
- A tabela `query_modules` não existe no banco de dados
- O bot Telegram usa um mapa hardcoded `enabledQueryTypes` — não consulta o banco
- Resultado: ligar/desligar módulos no painel não tem efeito real

## Solução

### 1. Criar tabela `query_modules` no banco
```sql
CREATE TABLE public.query_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text UNIQUE NOT NULL,
  label text NOT NULL,
  icon text DEFAULT '📋',
  category text DEFAULT 'outros',
  enabled boolean DEFAULT true,
  provider text DEFAULT 'VeiculosAPI',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```
- Inserir todos os ~30 módulos com dados iniciais (todos habilitados)
- RLS: leitura pública, escrita apenas para admin/authenticated
- A `api-query` já tenta ler dessa tabela — vai funcionar automaticamente

### 2. Atualizar `QueryModulesManager` (painel web)
- Ao montar, carregar módulos do banco (`query_modules`)
- Ao clicar no switch, fazer UPDATE direto no banco (`enabled = true/false`)
- Remover o estado local hardcoded `initialModules`
- Manter categorias e layout visual atuais

### 3. Atualizar `telegram-webhook`
- Remover o mapa hardcoded `enabledQueryTypes`
- Na função `isQueryEnabled()`, consultar a tabela `query_modules` via Supabase (com cache de 60s, igual ao `api-query`)
- Se o módulo não existir na tabela, tratar como habilitado (fallback seguro)

### 4. Resultado Esperado
- Admin desliga "CPF" no painel → bot para de responder `/cpf` imediatamente (após cache expirar em 60s)
- Admin liga "CPF" → bot volta a responder
- Página web de consultas também respeita o estado (já implementado via `api-query`)
- Tudo persistido no banco, sobrevive a reload e deploy

## Arquivos Modificados
1. **Migration SQL** — criar tabela + seed dos módulos
2. **`src/components/bots/QueryModulesManager.tsx`** — ler/escrever do banco
3. **`supabase/functions/telegram-webhook/index.ts`** — remover hardcode, ler do banco

