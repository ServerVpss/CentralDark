---
title: "TUTORIAL — Segundo Cérebro para o Pivete"
date: 2026-06-29
tags: ["tutorial", "obsidian", "leigo", "fluxo", "documentacao"]
---

# TUTORIAL — Segundo Cérebro para o Pivete

> **Para ler quando esquecer como usa ou quiser ensinar alguém.**
> Linguagem simples. Sem enrolação.

---

## O que é esse negócio todo?

Imagina que você tem um **assistente que nunca dorme, nunca esquece e organiza tudo que você falar.**

É isso. Você fala (ou digita), a IA anota, organiza e joga aqui no Obsidian. Você abre e tá tudo lá, bonitinho, com ligações entre os assuntos.

```
Você tem uma ideia
       ↓
Fala pro bot no Telegram
       ↓
A IA organiza e salva no GitHub
       ↓
Obsidian puxa automático (≤10 min)
       ↓
Você abre aqui e vê tudo conectado
```

---

## Como gravar uma ideia — do jeito mais fácil

### Pelo Telegram (na rua, no trabalho, qualquer hora)

Abre o bot **@srver1bot** e fala do jeito que você fala mesmo:

| O que você fala | O que a IA faz |
|----------------|----------------|
| *"grava aí que eu prefiro verificar tudo antes de fazer"* | Cria nota de filosofia de trabalho |
| *"anota isso: ideia de novo módulo pra VPS"* | Cria nota em pendências |
| *"registra aqui que o PM2 precisa de atenção"* | Adiciona à lista de pendências |
| *"salva isso: aprendi que sparse-checkout economiza GB"* | Cria nota de aprendizado |
| *"lembra de mim: sempre fazer pm2 save depois de mudar processo"* | Cria nota de regra pessoal |

**Frases mágicas que a IA entende:**
- `"grava aí que..."`
- `"anota isso:"`
- `"registra que..."`
- `"salva isso:"`
- `"não deixa eu esquecer que..."`

A IA entende o contexto e organiza na pasta certa. Você não precisa saber onde vai parar.

### Pelo Obsidian (na frente do PC)

1. Aperta `Ctrl + O` — abre qualquer nota
2. Aperta `Ctrl + N` — cria nota nova
3. Escreve do jeito que quiser — a IA não julga
4. Para linkar outra nota, digita `[[` e o nome

---

## Plugins que você tem (e para que servem)

| Plugin | Para que serve | Como usar |
|--------|---------------|-----------|
| **Git** | Sincroniza com o GitHub | Automático. `Ctrl+P` → "Git: Pull" para forçar |
| **Dataview** | Faz tabelas dinâmicas das notas | Automático nas notas que usam |
| **Templater** | Templates prontos para notas | `Ctrl+P` → "Templater: Insert Template" |
| **Style Settings** | Muda cores e visual do Obsidian | Settings → Style Settings |
| **Iconize** | Coloca ícones nas pastas | Botão direito na pasta → "Change icon" |
| **Omnisearch** | Busca inteligente em tudo | `Ctrl+Shift+O` |
| **Tasks** | Gerencia tarefas com checklist | Escreve `- [ ] tarefa` em qualquer nota |

---

## O Graph View — o mapa do seu cérebro

O ícone de grafo na barra lateral (parece uma teia de aranha) mostra **todas as notas conectadas pelos [[links]]**.

### Como deixar bonito com cores

1. Abre o Graph View (`Ctrl+G`)
2. Clica em **Grupos** (painel da direita)
3. Clica em **+**
4. No filtro, digita o nome da nota ou pasta
5. Escolhe uma cor

**Sugestão de grupos:**

| Filtro | Cor | Representa |
|--------|-----|-----------|
| `path:BRAIN` | Azul | Nota central |
| `path:01-PENDENCIAS` | Vermelho | O que falta fazer |
| `path:00-MAPA` | Amarelo | Mapa do sistema |
| `path:02-ARQUITETURA` | Verde | Como tudo funciona |
| `path:TUTORIAL` | Roxo | Documentação |
| `path:POSTURA` | Laranja | Sua filosofia |

---

## Como colorir as pastas na barra lateral

Com o plugin **Iconize** instalado:
1. Clique com **botão direito** em qualquer pasta
2. Clique em **"Change icon"**
3. Escolhe o ícone (tem centenas)

Sugestões:
- `00 - Mapa do Sistema` → 🗺️ map
- `01 - Pendências` → 📋 clipboard
- `02 - Arquitetura` → 🏗️ building
- `05 - Documentação` → 📚 books
- `06 - Decisões` → ⚖️ scales
- `07 - Reuniões` → 💡 lightbulb

---

## Sincronização — o que você precisa saber

| O que | Como funciona |
|-------|--------------|
| **Pull automático** | A cada 10 min — Obsidian puxa as notas novas |
| **Push manual** | Você NÃO faz push. A IA faz pela VPS. |
| **Forçar atualização** | `Ctrl+P` → "Git: Pull" |
| **Ver status** | Ícone do Git na barra lateral (setinhas) |

**Regra de ouro:** O Obsidian no seu PC é **leitura**. A IA é quem escreve pela VPS. Você não precisa se preocupar com conflitos.

---

## Atalhos essenciais

| Atalho | O que faz |
|--------|-----------|
| `Ctrl + P` | Paleta de comandos (o mais importante) |
| `Ctrl + O` | Abrir nota pelo nome |
| `Ctrl + N` | Nova nota |
| `Ctrl + G` | Graph View (mapa visual) |
| `Ctrl + E` | Editar / Visualizar |
| `Ctrl + Shift + O` | Omnisearch (busca tudo) |
| `[[` | Criar link para outra nota |

---

## A IA aprende com você

Quanto mais você usa, mais a IA entende seu jeito. Algumas coisas que ajudam:

1. **Fala do jeito que pensa** — não precisa ser formal. "grava aí que..." já funciona.
2. **Quando errar, corrige em voz alta** — "não, muda isso, a ideia era..."
3. **Pede confirmação** — "o que você gravou aí?" e a IA mostra antes de salvar.
4. **A IA pergunta se você já fez** — quando você voltar a um assunto, ela vai lembrar.

---

## Onde fica cada tipo de nota

| Tipo de nota | Pasta |
|-------------|-------|
| Ideias e projetos novos | `07 - Reuniões & Notas` |
| O que precisa ser feito | `01 - Pendências` |
| Como o sistema funciona | `02 - Arquitetura` |
| Decisões tomadas | `06 - Decisões` |
| Coisas que aprendeu | `05 - Documentação` |
| Mapa geral | `00 - Mapa do Sistema` |

---

## Vídeos para aprender mais

Busque no YouTube (em português):
- `"Obsidian tutorial completo PT-BR"`
- `"Obsidian Zettelkasten iniciantes"`
- `"segundo cérebro digital obsidian"`
- `"Obsidian para leigos"`

Em inglês (os melhores do mundo):
- `"Linking Your Thinking Nick Milo"` — método Zettelkasten
- `"Obsidian Git sync tutorial"`

---

---

## ⚠️ Erro "Pull failed (merge)" — como resolver e evitar

**O que é:** o Obsidian tentou puxar do GitHub mas você tinha mudanças locais não commitadas no mesmo arquivo. O Git se recusou a sobrescrever.

**Solução rápida (quando acontecer):**
1. `Ctrl+P` → `Git: CAUTION: Discard all changes`
2. Na confirmação: clique **"Discard all X tracked files"** (nunca o "all 56 files" — esse apaga arquivos novos não commitados)
3. `Ctrl+P` → `Git: Pull`

**Proteção permanente (configurar uma vez):**
- Configurações → Git → seção **Pull** → **"Merge strategy on conflicts"** → selecionar **"Their changes"**
- Com isso, qualquer conflito é resolvido automaticamente favorecendo o GitHub (fonte da verdade)

> Aprendido em 29/06/2026 — configurado com sucesso.

---

*Tutorial criado pelo [[CentralDark]] para o Pivete — atualizado sempre que você aprender algo novo.*
*Skill: [[Obsidian-Writer]] | Vault: [[BRAIN]]*

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
