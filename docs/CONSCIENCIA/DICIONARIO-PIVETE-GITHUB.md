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

### Deployments
→ **Ordem e histórico de publicação**

**O que faz:** cria e consulta objetos de deployment e seus status (`pending`, `in_progress`, `success`, `failure`), além de agir em deployments pendentes quando autorizado.

**Quando usar:**
- **Read** = observar o que foi ou será publicado.
- **Write** = criar deployment, atualizar status ou operar aprovação pendente pela API.

**Regra do Pivete:** liberar **Write** somente para o promotor/deployer canônico; revisor e juiz ficam em **Read**.

---

### Dependabot alerts
→ **Avisos de dependência vulnerável**

**O que faz:** consulta alertas do Dependabot e, com Write, altera o estado permitido desses alertas.

**Quando usar:**
- **Read** = auditoria de vulnerabilidades nas dependências.
- **Write** = tratar ou dispensar alerta conforme política aprovada.

**Regra do Pivete:** auditoria pode usar **Read**; automação nunca dispensa alerta silenciosamente.

---

### Dependabot secrets
→ **Cofre particular do Dependabot**

**O que faz:** administra secrets usados pelo Dependabot para acessar registros ou dependências privadas. O valor secreto não é retornado pela API.

**Quando usar:** somente em missão específica de dependências privadas.

**Regra do Pivete:** deixar **No access** no token geral.

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

### PROMOTION_TOKEN
→ **Chave do promotor autônomo**

Nome válido do secret que entrega ao promotor a identidade separada usada para atualizar branch e mergear sem reutilizar o `GITHUB_TOKEN` do workflow.

**Regra:** secrets do Actions não podem começar com `GITHUB_`; por isso `GITHUB_PAT_PERFIL` é inválido. Validar somente a presença e as permissões. Nunca imprimir, copiar ou registrar o valor.

### action_required
→ **GitHub pedindo identidade**

O check fica amarelo pedindo “identidade que o GitHub aceita”. Acontece quando o commit foi feito com token/usuário que o workflow não confia. Solução: commit com a identidade certa (token do dono ou bot autorizado).

### Workflow / GitHub Actions
→ **Robô automático**

Script YAML que roda sozinho (teste, deploy, notificação) quando algo acontece (push, PR, cron).

### Secrets (Actions)
→ **Segredo guardado pro robô**

Variável escondida que só a Action vê (token, chave API). Nunca vai pro código.

### Environment
→ **Sala com regra própria**

Camada de proteção para um destino como `production`: pode ter reviewers obrigatórios, secrets, variables e regras de publicação próprias.

### Deployment
→ **Tentativa registrada de publicar**

Registro que liga commit/ref, ambiente e estado da publicação. Não é sinônimo de deploy concluído.

### GitHub Pages
→ **Hospedagem do próprio GitHub**

Site estático servido a partir do repositório ou de uma Action configurada para Pages.

### Dependabot
→ **Vigia das dependências**

Robô do GitHub que procura versões desatualizadas e vulnerabilidades e pode abrir PRs de atualização conforme a configuração.

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
| Pull requests        | Pedido de mudança      | Write  |
| Issues               | Chamado                | Write se comentar/etiquetar |
| Workflows            | Robôs (editar YAML)    | Write só se editar workflow |
| Actions              | Painel dos robôs       | Read (ou Write se re-disparar) |
| Deployments          | Ordem/histórico de publicação | No access; Write só para deployer |
| Environments         | Salas protegidas       | No access; liberar por missão |
| Pages                | Site do GitHub          | No access se não usar Pages |
| Dependabot alerts    | Avisos vulneráveis     | Read para auditoria |
| Dependabot secrets   | Cofre do Dependabot    | No access |
| Administration       | Chave do dono          | No access |
| Secrets              | Cofre                   | No access (salvo tarefa específica) |

Repo access: **Only select repositories** → só o CentralDark (ou os que SEGREDO/CHEFE autorizar).

### Perfil mínimo do promotor autônomo atual

Para o secret `PROMOTION_TOKEN`, o mínimo operacional do desenho atual é:

| Permissão | Nível | Motivo |
|---|---:|---|
| Contents | Write | concluir merge no repositório |
| Pull requests | Write | atualizar branch e operar PR |
| Issues | Write | aplicar label/comentário de diagnóstico quando necessário |
| Actions | Read | revalidar runs exigidas |
| Metadata | Read | obrigatório pelo GitHub |

Não adicionar `Administration`, `Secrets`, `Environments`, `Pages`, `Deployments` ou `Workflows` sem uma rota concreta que exija isso.

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

- Porta universal e boot obrigatório: `LEIA-ME-IA.md`
- Jeito de trabalho: `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`
- Glossário de funções da API (código): `docs/GLOSSARIO_TECNICO_LEIGO.md`
- Este arquivo = **só GitHub + permissões de token**

**Última atualização:** 2026-07-31 — Environments, Pages, Deployments, Dependabot, perfil mínimo do promotor autônomo e nome válido `PROMOTION_TOKEN`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
