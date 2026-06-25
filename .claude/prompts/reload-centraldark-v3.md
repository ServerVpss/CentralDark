# RELOAD CENTRALDARK — AUDITORIA E PLANO (v3)

> Prompt consolidado pronto pra colar no Claude (ou em qualquer IA externa).
> Última atualização: 25/06/2026

---

## MODO DE OPERAÇÃO

**MODO: AUDITORIA E PLANO SOMENTE.**

- NÃO executar migração ainda.
- NÃO apagar arquivos.
- NÃO fazer merge.
- NÃO fazer deploy.
- NÃO mexer em produção.
- NÃO tocar no `CentralDark1VPS` (legado intocável).
- NÃO alterar `CLAUDE.md`, Notion, VPS ou GitHub sem autorização explícita.

Toda saída deve seguir o **template de relatório** no final deste prompt.

---

## CONTEXTO OBRIGATÓRIO (leia antes de qualquer ação)

### Identidade
- Projeto: **TelePanel (frontend) + CentralDark (infra/microsserviços)**
- Stack: React 18 + Vite 5 + Tailwind v3 + TS 5
- Backend: Lovable Cloud (Supabase gerenciado)
- Repos: `ServerVpss/CentralDark` (fonte da verdade) e `ServerVpss/CentralDark1VPS` (legado, intocável)

### Sincronia 4-Point (regra vigente)
Os quatro pontos devem permanecer espelhados a cada alteração:
1. **Lovable** (editor / preview)
2. **GitHub** (sync bidirecional)
3. **VPS** (`/root/CentralDark/`, PM2 com `pm2 save` obrigatório)
4. **Cérebro Vivo** (`cerebro/` + `.claude/`)

Nenhuma mudança estrutural é "concluída" enquanto os 4 pontos não refletirem o mesmo estado.

### Hierarquia de Repositórios
- `CentralDark` → única fonte da verdade para novos desenvolvimentos.
- `CentralDark1VPS` → servidor ativo legado. Zero alteração sem instrução explícita de "Migração de Automação".

---

## TAREFA DESTA RODADA

Fazer **auditoria completa** das memórias, docs e contextos espalhados (Lovable, GitHub, Notion, Mega Painel, VPS, `cerebro/`, `.claude/`) e produzir o **PLANO DE CONSOLIDAÇÃO** seguindo o template no final.

Adicionalmente, preparar (no plano, **sem executar**) a atualização do documento **"Arquitetura CentralDark — Fonte da Verdade"** em `docs/ARQUITETURA/FONTE-DA-VERDADE.md` incluindo a nova seção **Ferramentas Cognitivas** descrita abaixo.

---

## NOVA SEÇÃO A INCLUIR NO DOC: "Ferramentas Cognitivas"

Explicar em linguagem leiga, com tabela curta: **o que faz** / **como usar no CentralDark** / **quando NÃO usar**.

### 1. `browse_page`
- **O que faz:** a IA lê direto qualquer página (Notion, GitHub, Mega Painel, VPS web, links externos), sem você precisar copiar e colar texto.
- **Como usar no CentralDark:** puxar conteúdo de páginas Notion da fonte da verdade, ler READMEs e arquivos de repos no GitHub, abrir status pages e dashboards da VPS.
- **Quando NÃO usar:** páginas atrás de login que a IA não tem sessão; nesses casos pedir export ou usar conector específico.

### 2. `code_execution`
- **O que faz:** roda Python de verdade pra analisar arquivos em massa — comparar `.md`, detectar duplicatas, achar conflitos, organizar pastas, gerar relatórios.
- **Como usar no CentralDark:** auditar memórias e docs do `cerebro/`, encontrar arquivos duplicados/desatualizados, gerar mapas de consolidação, calcular estatísticas.
- **Quando NÃO usar:** mudanças destrutivas (delete em massa, merge) sem aprovação; análise simples que cabe em 1 leitura manual.

### 3. `conversation_search`
- **O que faz:** busca em todas as conversas antigas pelo **significado** do que foi falado, não por palavra exata.
- **Como usar no CentralDark:** recuperar regras antigas, decisões já tomadas, promessas feitas, padrões de comportamento, contexto perdido entre sessões.
- **Quando NÃO usar:** quando o usuário já trouxe o contexto na mensagem atual; quando precisa de fonte oficial (aí vai pro Notion/cerebro).

### Regra de ouro (inserir junto da tabela)
- Antes de **pedir pro usuário copiar texto** → tentar `browse_page` primeiro.
- Antes de dizer **"não me lembro / não tenho contexto"** → tentar `conversation_search`.
- Antes de **abrir 30 arquivos manualmente** → usar `code_execution`.

---

## TEMPLATE DE SAÍDA OBRIGATÓRIO

Responder exatamente nesta estrutura, em PT-BR, tom direto:

```
DUPLICADOS ENCONTRADOS:

DESATUALIZADOS ENCONTRADOS:

CONFLITOS ENCONTRADOS:

CONTEÚDO QUE DEVE SER CONSOLIDADO:

CONTEÚDO QUE DEVE SER ARQUIVADO:

CONTEÚDO QUE NÃO DEVE SER MIGRADO:

RISCO:

O QUE NÃO FOI TOCADO:

PLANO DE CONSOLIDAÇÃO:

PLANO PARA NOTION:

PLANO PARA MEGA PAINEL:

PLANO PARA O DOC "FONTE DA VERDADE" (incluindo nova seção Ferramentas Cognitivas):

PRÓXIMO PASSO SEGURO:

MENSAGEM VALIDADA PARA A PRÓXIMA IA:

PROMPT PRONTO PARA A PRÓXIMA IA:
```

Fechar **obrigatoriamente** com:

```
APROVADO PARA EXECUTAR: NÃO — ESTA FASE É SOMENTE AUDITORIA E PLANO.
```
