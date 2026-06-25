# 🛠️ Ferramentas Cognitivas e Comandos

> Página de referência rápida do Cérebro Vivo do CentralDark.
> Última atualização: 25/06/2026

---

## O que são Ferramentas Cognitivas

São os "superpoderes" que damos pras IAs do CentralDark. Em vez da IA só conversar e adivinhar, ela ganha braços e olhos pra **agir de verdade**: ler páginas sozinha, rodar código pra analisar arquivos, e lembrar de conversas antigas pelo significado.

Pensa assim: antes a IA era um consultor de telefone. Agora ela é um consultor que entra no escritório, abre as gavetas, lê os documentos e volta com a resposta pronta.

---

## As 3 Ferramentas Ativas

### 1. 🌐 `browse_page` — A IA lê páginas sozinha

- **O que faz:** abre e lê qualquer link (Notion, GitHub, Mega Painel, sites, status pages) direto, sem você precisar copiar e colar nada.
- **Quando usar:** "dá uma olhada nessa página do Notion", "lê esse README do GitHub", "vê o status no Mega Painel".
- **Exemplo prático:** você manda o link de uma página do Notion da CentralDark e a IA lê tudo, resume, compara com o que já tem no `cerebro/`.

### 2. 🐍 `code_execution` — A IA roda código pra analisar em massa

- **O que faz:** executa Python de verdade pra mexer em vários arquivos ao mesmo tempo — comparar `.md`, achar duplicatas, organizar pastas, gerar relatórios.
- **Quando usar:** "tem arquivo duplicado no cerebro?", "compara essas 50 memórias e me diz o que tá repetido", "gera um mapa de tudo que tem na pasta X".
- **Exemplo prático:** auditar todas as memórias do `cerebro/` de uma vez, detectar conflitos entre o que tá no GitHub e na VPS.

### 3. 🔍 `conversation_search` — A IA lembra do que já foi falado

- **O que faz:** busca em **todas** as conversas antigas pelo **significado** do que foi dito, não só palavra exata.
- **Quando usar:** "o que a gente já decidiu sobre X?", "lembra daquela regra que eu falei semana passada?", "qual padrão a gente combinou pros bots?".
- **Exemplo prático:** antes de a IA dizer "não me lembro", ela busca no histórico e traz a decisão antiga já com contexto.

---

## Integração com o Ecossistema

| Ferramenta            | Notion         | Obsidian          | GitHub          | Mega Painel    | Cérebro Vivo (`cerebro/`) |
| --------------------- | -------------- | ----------------- | --------------- | -------------- | ------------------------- |
| `browse_page`         | ✅ lê páginas  | ❌ (local)        | ✅ lê arquivos  | ✅ lê status   | ✅ lê via repo            |
| `code_execution`      | ⚠️ via export | ✅ analisa `.md`  | ✅ varre repo   | ⚠️ via API    | ✅ varredura completa     |
| `conversation_search` | —              | —                 | —               | —              | ✅ casa com memórias      |

**Como usar em conjunto:**
1. `conversation_search` traz o contexto histórico.
2. `browse_page` busca o estado atual (Notion / GitHub / Mega Painel).
3. `code_execution` cruza tudo e gera o relatório.

---

## Regra de Ouro

- Antes de **pedir pro usuário copiar texto** → usar `browse_page`.
- Antes de dizer **"não me lembro / não tenho contexto"** → usar `conversation_search`.
- Antes de **abrir 30 arquivos manualmente** → usar `code_execution`.

---

## Comandos Principais

Gatilhos que o usuário usa pra invocar fluxos prontos. Sempre em PT-BR, tom direto.

| Comando                          | O que dispara                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| **RELOAD CENTRALDARK**           | Recarrega contexto completo do projeto (lê `CLAUDE.md` + `.claude/` + `cerebro/`).                  |
| **AUDITORIA DE MEMÓRIAS**        | Roda auditoria do `cerebro/` e memórias do Lovable. Saída no template do `reload-centraldark-v3`.   |
| **Sincronia 4-Point**            | Verifica se Lovable + GitHub + VPS + Cérebro Vivo estão espelhados.                                 |
| **audit-rls**                    | Skill obrigatória antes de qualquer publish, migration ou edge function nova.                       |
| **Swarm Mode**                   | Desdobra tarefa grande em sub-agentes (auditor / executor / validador) via `spawn_agent`.           |
| **APROVADO PARA EXECUTAR: SIM**  | Libera execução de plano que estava em modo "auditoria e plano somente".                            |
| **Modo Cérebro Vivo**            | IA só consulta `cerebro/` + `.claude/`, sem inventar contexto.                                      |

**Comandos do bot (raiz):** 75 módulos diretos (ex: `/cpf`, `/cnpj`...). Sem aliases numéricos. Resultado em `<pre>` com `┌├└` e `▓░`.

---

## Melhoria Contínua

Espaço aberto pra anotar **novas ferramentas** que forem chegando. Copia o template, preenche e sobe.

### Template

```
### [Nome da ferramenta]
- O que faz:
- Quando usar:
- Exemplo prático no CentralDark:
- Data de adição:
- Quem adicionou:
```

### Histórico

- **25/06/2026** — Ativadas oficialmente: `browse_page`, `code_execution`, `conversation_search`.

---

## Para a próxima IA

1. Esta página é **referência rápida**, não fonte de verdade técnica — pra detalhes de arquitetura, ver `CLAUDE.md` + `.claude/`.
2. Sempre que aparecer uma ferramenta nova, atualizar a seção **Melhoria Contínua** aqui antes de tudo.
3. Respeitar Sincronia 4-Point: mudança aqui → refletir no GitHub e (quando fizer sentido) no Notion.
