# Plano — Prompt Final "RELOAD CENTRALDARK" pronto pro Claude

## O que vai ser criado (3 arquivos, nenhuma edição em produção)

### 1. `.claude/prompts/reload-centraldark-v3.md`
O prompt completo, consolidado, pronto pra você colar no Claude. Inclui:
- Modo **AUDITORIA E PLANO SOMENTE** (não executa, não apaga, não faz merge, não deploya)
- Regras da Sincronia 4-Point (Lovable / GitHub / VPS / Cérebro Vivo)
- Instrução pra criar/atualizar `docs/ARQUITETURA/FONTE-DA-VERDADE.md` com:
  - Identidade do projeto
  - Sincronia 4-Point
  - Hierarquia de repos (CentralDark = fonte da verdade, CentralDark1VPS = legado intocável)
  - **Nova seção "Ferramentas Cognitivas"** com as 3 ferramentas em linguagem leiga:
    - `browse_page` — IA lê Notion/GitHub/Mega Painel direto, sem você copiar
    - `code_execution` — roda Python pra analisar `.md` em massa, achar duplicata, organizar
    - `conversation_search` — busca em conversas antigas por significado, não por palavra exata
  - Cada ferramenta com 3 linhas: **o que faz** / **como usar no CentralDark** / **quando NÃO usar**
- Template de saída obrigatório (DUPLICADOS, DESATUALIZADOS, CONFLITOS, RISCO, PLANO CONSOLIDAÇÃO, PLANO NOTION, PLANO MEGA PAINEL, PRÓXIMO PASSO SEGURO, etc.)
- Fecho obrigatório: `APROVADO PARA EXECUTAR: NÃO — ESTA FASE É SOMENTE AUDITORIA E PLANO`

### 2. `mem://architecture/ferramentas-cognitivas-ia.md`
Memória ativa do projeto (vira regra automática pra qualquer IA Lovable nesse projeto):
- Antes de pedir pro usuário copiar texto → tentar `browse_page`
- Antes de dizer "não lembro" → tentar `conversation_search`
- Pra análise/comparação de `.md` em massa → usar `code_execution`

### 3. Atualizar `mem://index.md`
Adicionar 1 linha na seção Memories apontando pro arquivo acima e 1 linha na Core resumindo a regra.

## O que NÃO vai ser feito agora
- Não cria `docs/ARQUITETURA/FONTE-DA-VERDADE.md` aqui no Lovable — isso é tarefa do Claude executar quando você mandar o prompt
- Não mexe em `CLAUDE.md`, Notion, VPS, GitHub
- Não roda audit-rls, não publica, não migra

## Fluxo de uso (depois que aprovar)
1. Eu salvo os 3 arquivos
2. Você abre o Claude, cola o conteúdo de `.claude/prompts/reload-centraldark-v3.md`
3. Claude faz auditoria + plano e devolve o relatório no template
4. Você revisa e só então autoriza execução numa próxima rodada

Aprova pra eu salvar?