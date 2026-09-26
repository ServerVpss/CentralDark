# MISSAO - DICIONARIO-PIVETE-GITHUB.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\DICIONARIO-PIVETE-GITHUB.md
**SHA:** 36b0652792ef20da
**Timestamp:** 2026-08-28T02:56:48.498430
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** secrets do Actions não podem começar com `GITHUB_`; por isso `GITHUB_PAT_PERFIL` é inválido. Validar somente a presença e as permissões. Nunca imprimir, copiar ou registrar o valor.

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "Dicionário Pivete — GitHub"
status: "CANÔNICO"
scope: "Tradução papo reto das permissões e termos do GitHub (token fine-grained + tela de permissões)"
source_of_truth: "Este arquivo"
versioning_rule: "Evoluir no mesmo artefato; adicionar termo novo embaixo, nunca criar cópia"
boot_rule: "LEIA-ME-IA.md deve carregar este arquivo no boot universal"
---

# DICIONÁRIO PIVETE — GITHUB

Objetivo: você abre a tela de permissões do token (ou qualquer jargão do GitHub) e já sabe o que é, o que faz e quando liga — no seu jeito.

Agentes e IAs do CentralDark: ao falar com **SEGREDO/CHEFE**, usar primeiro os nomes traduzidos deste arquivo. Jargão técnico só quando necessário ou solicitado. **PIVETE/HERMES** preserva e aplica esse vocabulário operacional.

Regra de identidade: `SEGREDO/CHEFE = humano e autoridade final`; `PIVETE = Hermes treinado`; “pivete” informal continua sendo vocativo regional dependente do contexto.

Formato de cada termo:

```text
NOME TÉCNICO (o que aparece na tela)
→ SEU JEITO
O QUE FAZ
QUANDO USAR / NÍVEL
```

---

## 1. PERMISSÕES DO TOKEN (tela Repository permissions)

Essas são as que aparecem quando você cria ou edita um **Fine-grained personal access token**.

### Contents
→ **Arquivos do projeto**

**O que faz:** deixa o token ler e/ou escrever código, commits, branches, tags, releases e merges. É a chave pra empurrar arquivo pro repositório.

**Quando usar:**
- **Read** = só olhar (clone, pull, baixar).
- **Write** = pode commit/push (obrigatório se o bot/agente vai gravar arquivo no repo).

**Regra do Pivete:** se o agente precisa fazer commit automático, Contents = Write.

---

### Metadata
→ **Cartão de visita do repo**

**O que faz:** lê nome, descrição, visibilidade, topics. Sempre vem ligado (Read-only). Não dá pra desligar.

**Quando usar:** sempre. Não mexe. É automático.

---

### Pull requests
→ **Pedido de mudança (PR)**

**O que faz:** abre, comenta, aprova, rejeita e mergeia Pull Request. Também mexe em labels, assignees e milestones do PR.

**Quando usar:**
- **Read** = só ver PR e comentários.
- **Write** = criar PR, comentar, pedir review, atualizar branch e mergear.

**Regra do Pivete:** se o agente abre PR, comenta, atualiza branch ou mergeia → Write.

---

### Issues
→ **Chamado / ticket**

**O que faz:** cria, fecha, comenta e etiqueta Issues (os “chamados” do repo).

**Quando usar:**
- **Read** = só ler.
- **Write** = abrir, fechar, comentar, etiquetar.

**Regra do Pivete:** se o agente abre ou fecha issue → Write.

---

### Workflows
→ **Robôs automáticos (Actions)**

**O que faz:** permite **alterar** os arquivos de workflow (`.github/workflows/*.yml`). Só existe nível **Write** (não tem Read separado nessa tela).

**Quando usar:** só quando o token precisa **editar** o próprio robô (mudar YAML de Action). Só rodar Action não precisa disso — precisa de **Actions** (abaixo).

**Atenção:** Workflows = mexer no script do robô. Actions = ver/disparar o robô.

---

### Actions
→ **Painel dos robôs**

**O que faz:** vê runs, logs, artifacts e (com Write) pode cancelar/re-disparar workflows.

**Quando usar:**
- **Read** = ver se o robô passou ou falhou.
- **Write** = cancelar run, re-rodar ou administrar execução.

---

### Administration
→ **Chave do dono**

**O que faz:** configurações pesadas do repo: settings, collaborators, branch protection, delete repo, etc.

**Quando usar:** quase nunca no token de agente. Só se SEGREDO/CHEFE autorizar explicitamente e for tarefa de administração.

**Regra do Pivete:** deixar **No access** no token de automação.

---

### Secrets
→ **Cofre do GitHub**

**O que faz:** cria, atualiza ou remove secrets do repositório. A API não entrega o valor secreto de volta.

**Quando usar:** só se o agente precisa **administrar** secret. Só **usar** secret dentro da Action não exige essa permissão no token pessoal.

---

### Commit statuses
→ **Sinalzinho do check**

**O que faz:** grava o status do check (passou / falhou / pending) no commit/PR.

**Quando usar:** se o agente reporta status de CI → Write.

---

### Environments
→ **Salas protegidas de publicação**

**O que faz:** administra dados ligados aos ambientes como `development`, `staging` e `production`, inclusive secrets e variables do ambiente quando a rota usada exigir essa permissão.

**Quando usar:**
- **Read** = consultar configuração permitida do ambiente.
- **Write** = administrar secrets/variables e outras rotas autorizadas do ambiente.

**Regra do Pivete:** no token geral, deixar **No access**. Só liberar para uma missão que realmente administra environments.

---

### Pages
→ **Site publicado pelo GitHub**

**O que faz:** consulta ou administra o GitHub Pages do repositório: configuração, origem de publicação, builds e estado do site.

**Quando usar:**
- **Read** = verificar configuração e estado.
- **Write** = criar, alterar ou remover configuração/publicação do Pages.

**Regra do Pivete:** se o CentralDark não publica por GitHub Pages, deixar **No access**.

---
```