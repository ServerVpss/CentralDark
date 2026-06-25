# Plano — Página "🛠️ Ferramentas Cognitivas e Comandos"

## Objetivo
Criar uma página de referência rápida no Cérebro Vivo do projeto, consolidando as 3 Ferramentas Cognitivas (browse_page, code_execution, conversation_search), os comandos principais e um espaço aberto para Melhoria Contínua. Também atualizar o prompt consolidado e a memória pra refletir esse novo contexto oficial.

## O que vai ser feito

### 1. Criar `cerebro/ferramentas-cognitivas-e-comandos.md`
Página principal de referência, em PT-BR, linguagem simples, dividida em:

- **O que são Ferramentas Cognitivas** — explicação curta, tipo "superpoderes que a IA usa pra agir, não só conversar".
- **As 3 Ferramentas Ativas** — cada uma com:
  - O que faz (em linguagem leiga)
  - Quando usar
  - Exemplo prático no contexto CentralDark (Notion, GitHub, Mega Painel, Obsidian)
- **Integração com o Ecossistema** — como elas conversam com Notion (painel), Obsidian (segundo cérebro), GitHub (versionado), Mega Painel (status).
- **Comandos Principais** — lista dos gatilhos que o usuário usa hoje (RELOAD CENTRALDARK, AUDITORIA DE MEMÓRIAS, Sincronia 4-Point, audit-rls, swarm mode, etc.).
- **Melhoria Contínua** — seção aberta, com template em branco pra anotar novas ferramentas no futuro (Nome / O que faz / Quando usar / Data de adição).

### 2. Atualizar `.claude/prompts/reload-centraldark-v3.md`
Adicionar referência à nova página do Cérebro Vivo como fonte oficial das Ferramentas Cognitivas, pra qualquer IA externa (Claude) saber onde consultar.

### 3. Atualizar `mem://index.md`
Adicionar 1 linha em Memories apontando pra nova página do Cérebro Vivo:
`- [Ferramentas Cognitivas e Comandos](cerebro/ferramentas-cognitivas-e-comandos.md) — Referência rápida + comandos + melhoria contínua`

## O que NÃO vai ser feito
- Nenhuma mudança em código de app, Edge Functions, migrations, deploy ou Notion remoto.
- Não toca em `CLAUDE.md` (a Sincronia 4-Point já cobre o cérebro vivo).
- Não cria página no Notion agora — só no Cérebro Vivo local (`cerebro/`). Se quiser espelhar no Notion depois, é outro passo.

## Resultado final
Você abre `cerebro/ferramentas-cognitivas-e-comandos.md` (ou pede pra qualquer IA ler) e tem o mapa completo: o que cada ferramenta faz, quando usar, seus comandos e um espaço pronto pra crescer.

**APROVADO PARA EXECUTAR: aguardando seu OK.**
