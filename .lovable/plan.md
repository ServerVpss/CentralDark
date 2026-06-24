## Objetivo

Criar a fundação vazia do "Cérebro Vivo" na raiz do projeto (`/dev-server/`), que espelha `/root/CentralDark/` na VPS. Tudo versionado via Git.

## Verificação de integridade (feita)

- `CLAUDE.md` — não existe
- `.claude/` — não existe
- `cerebro/` — não existe

Caminho livre, zero risco de sobrescrever.

## O que será criado

1. **`CLAUDE.md`** (arquivo na raiz)
   - Criado vazio (apenas um título placeholder `# CLAUDE.md` para o Git não ignorar)
   - Reservado para a constituição L0 — conteúdo entra no próximo passo

2. **`.claude/`** (diretório na raiz)
   - Criado com um `.gitkeep` dentro (necessário porque Git não versiona pasta vazia)
   - Reservado para `rules/`, `skills/` e `agents/` do Claude

3. **`cerebro/`** (diretório na raiz)
   - Criado com um `.gitkeep` dentro
   - Reservado para o Obsidian Vault

## Detalhes técnicos

- Nenhum código de aplicação é tocado (sem mexer em `src/`, `supabase/`, configs, etc.)
- Nenhuma dependência instalada, nenhum build disparado
- Apenas 3 itens novos na raiz, todos rastreáveis pelo Git
- Conteúdo interno (constituição, rules, vault) fica para passos seguintes, conforme você pediu