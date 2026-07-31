---
title: "Dicionário Pivete — GitHub"
status: "CANÔNICO"
scope: "Tradução papo reto das permissões e termos do GitHub (token fine-grained + tela de permissões)"
source_of_truth: "Este arquivo"
versioning_rule: "Evoluir no mesmo artefato; adicionar termo novo embaixo, nunca criar cópia"
---

# DICIONÁRIO PIVETE — GITHUB

Objetivo: você abre a tela de permissões do token (ou qualquer jargão do GitHub) e já sabe o que é, o que faz e quando liga — no seu jeito.

Agentes e IAs do CentralDark: usar **só** estes nomes quando falar com o Pivete. Jargão técnico só se ele pedir.

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
- **Write** = criar PR, comentar, pedir review, mergear.

**Regra do Pivete:** se o agente abre PR ou comenta em PR → Write.

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
- **Write** = cancelar run, re-rodar, baixar artifact.

---

### Administration
→ **Chave do dono**

**O que faz:** configurações pesadas do repo: settings, collaborators, branch protection, delete repo, etc.

**Quando usar:** quase nunca no token de agente. Só se o Pivete autorizar explicitamente (“PERMITO PIVETE”) e for tarefa de admin.

**Regra do Pivete:** deixar **No access** no token de automação.

---

### Secrets
→ **Cofre do GitHub**

**O que faz:** ler ou gravar secrets do repositório (os que as Actions usam).

**Quando usar:** só se o agente precisa **criar/atualizar** secret. Só **usar** secret na Action não precisa dessa permissão no token do usuário.

---

### Commit statuses
→ **Sinalzinho do check**

**O que faz:** grava o status do check (passou / falhou / pending) no commit/PR.

**Quando usar:** se o agente/reporta status de CI → Write.

---

## 2. TERMOS QUE APARECEM NO DIA A DIA

### Personal Access Token (PAT)
→ **Chave pessoal**

Senha longa que o GitHub aceita no lugar da sua senha. Fine-grained = você escolhe repo + permissão uma a uma (mais seguro).

### Fine-grained token
→ **Chave com trava por gaveta**

Você escolhe: quais repos + quais permissões. Preferido no CentralDark.

### Classic token
→ **Chave antiga (larga)**

Uma permissão grossa (`repo`) libera quase tudo. Evitar.

### action_required
→ **GitHub pedindo identidade**

O check fica amarelo pedindo “identidade que o GitHub aceita”. Acontece quando o commit foi feito com token/usuário que o workflow não confia. Solução: commit com a identidade certa (token do dono ou bot autorizado).

### Workflow / GitHub Actions
→ **Robô automático**

Script YAML que roda sozinho (teste, deploy, notificação) quando algo acontece (push, PR, cron).

### Secrets (Actions)
→ **Segredo guardado pro robô**

Variável escondida que só a Action vê (token, chave API). Nunca vai pro código.

### Branch protection
→ **Trava da branch**

Regra que impede push direto na main (exige PR + checks verdes).

### Merge
→ **Juntar a mudança**

Aceitar o PR e colocar o código na branch alvo.

### Fork
→ **Cópia pra brincar**

Cópia do repo na sua conta pra testar sem sujar o original.

### Review
→ **Olhada de alguém**

Pedido pra outra pessoa (ou bot) aprovar o PR.

### Label
→ **Etiqueta**

Tag colorida em issue/PR (bug, enhancement, etc.).

### Assignee
→ **Responsável**

Quem está com a bola na issue/PR.

### Milestone
→ **Marco**

Agrupa issues/PRs por prazo ou versão.

### Release
→ **Pacote oficial**

Versão marcada (v1.2.3) com notas e arquivos baixáveis.

### Artifact
→ **Arquivo que o robô gerou**

Log, build, relatório que a Action salva pra você baixar depois.

---

## 3. CONFIG RÁPIDA — TOKEN DE AGENTE (commit automático sem action_required)

No token fine-grained do agente/bot:

| Permissão (tela)     | Seu jeito              | Nível  |
|----------------------|------------------------|--------|
| Contents             | Arquivos do projeto    | Write  |
| Metadata             | Cartão de visita       | Read   |
| Pull requests         | Pedido de mudança      | Write  |
| Issues               | Chamado                | Write  |
| Workflows            | Robôs (editar YAML)    | Write só se for editar workflow |
| Actions              | Painel dos robôs       | Read (ou Write se re-disparar) |
| Administration       | Chave do dono          | No access |
| Secrets              | Cofre                  | No access (salvo tarefa específica) |

Repo access: **Only select repositories** → só o CentralDark (ou os que o Pivete autorizar).

---

## 4. COMO EVOLUIR ESTE DICIONÁRIO

Apareceu termo novo na tela? Manda print ou o nome técnico.

Eu (ou qualquer agente calibrado) adiciona embaixo no **mesmo arquivo**, no mesmo formato:

```text
### Nome técnico
→ Seu jeito
O que faz
Quando usar
```

Nunca criar `DICIONARIO-PIVETE-GITHUB-v2.md`.

---

## 5. LINK COM O RESTO

- Jeito de trabalho: `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`
- Glossário de funções da API (código): `docs/GLOSSARIO_TECNICO_LEIGO.md`
- Este arquivo = **só GitHub + permissões de token**

**Última atualização:** 2026-07-31 — permissões da tela de fine-grained token + termos do dia a dia.
