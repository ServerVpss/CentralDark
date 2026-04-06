

# Remover Sistema de Cache

## Contexto
A API do provedor já possui cache interno. O sistema local de cache (`query_cache`) não está sendo usado no fluxo de consultas (conforme decisão anterior) e o componente `CacheStats` não é renderizado em nenhuma página. A remoção simplifica o código.

## Passos

### 1. Migração — Dropar tabela `query_cache`
- `DROP TABLE IF EXISTS public.query_cache;`

### 2. Remover componente `CacheStats`
- Deletar `src/components/consultation/CacheStats.tsx`

### 3. Limpar referências no Backup
- **`src/hooks/useBackup.ts`** — remover `query_cache` do tipo, mapeamento de nomes, array de tabelas e objeto de dados
- **`src/components/backup/BackupManager.tsx`** — remover `query_cache` do mapeamento de labels

### 4. Resultado
- Tabela removida do banco
- Código frontend limpo sem referências ao cache
- Tipos serão atualizados automaticamente após a migração

