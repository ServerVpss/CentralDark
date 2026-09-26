# **Kanban Hermes: Guia Completo + Skill `kanban-inventory`**
*Arquivo Legível para Compartilhamento com ChatGPT ou Outras IAs*

---

## **📌 Índice**
1. [Contexto e Objetivo](#contexto-e-objetivo)
2. [O que é o Kanban do Hermes](#o-que-é-o-kanban-do-hermes)
3. [Comandos CLI do Kanban](#comandos-cli-do-kanban)
4. [Fluxo de Uso Prático](#fluxo-de-uso-prático)
5. [Skill `kanban-inventory` - Definição Completa](#skill-kanban-inventory---definição-completa)
6. [Próximos Passos](#próximos-passos)

---

## **🎯 Contexto e Objetivo**

**Objetivo:**
Criar um **guia claro e preciso** para uso do **Kanban do Hermes**, incluindo:
- Definições oficiais (extraídas da documentação).
- Comandos CLI e seu funcionamento.
- Fluxo de uso prático (como mover cards entre colunas).
- **Skill `kanban-inventory`**: Procedimento reutilizável para listar, filtrar e gerenciar cards **somente com autorização explícita** (`PERMITO PIVETE`).

**Regras de Segurança:**
- **Nenhuma ação de escrita** (criar, mover, bloquear, etc.) é executada sem **autorização explícita** do Pivete.
- Todo comando que modifica o Kanban exige **`--apply`** ou variável de ambiente **`PERMITO_PIVETE=true`**.
- A skill **`kanban-inventory`** é **somente leitura** por padrão.

---

## **📜 O que é o Kanban do Hermes**

### **1. Banco de Dados**
- **Localização:** `~/.hermes/kanban.db` (padrão) ou `~/.hermes/kanban/boards/<slug>/kanban.db`.
- **Função:** Banco único lido/escrito pelo **Dashboard**, **CLI** e **Workers** (sincronizado em tempo real).

### **2. Colunas do Fluxo**
| Coluna | Descrição | Status no CLI |
|--------|------------|----------------|
| Triage | Cartões recém-criados, aguardando triagem. | `triage` |
| Todo | Cartões prontos para serem priorizados. | `todo` |
| Ready | Cartões prontos para execução. | `ready` |
| In Progress | Cartões em andamento. | `in progress` |
| Blocked | Cartões com impedimentos. | `blocked` |
| Done | Cartões concluídos. | `done` |

### **3. Campos de um Cartão (Card)**
| Campo | Descrição | Exemplo |
|-------|------------|---------|
| `id` | Identificador único. | `t_6c3d5e16` |
| `status` | Coluna atual. | `blocked` |
| `assignee` | Responsável. | `pivete` |
| `description` | Descrição do cartão. | "Registrar Gate Determinístico" |
| `created_at` | Data de criação. | `2026-08-05T12:00:00Z` |
| `updated_at` | Última atualização. | `2026-08-05T14:30:00Z` |
| `tags` | Tags para categorização. | `[kanban, skill]` |
| `parent_id` | ID do cartão pai (se sub-tarefa). | `t_123abc` |

### **4. Integração com Workers**
- **Como funciona:** Workers **não veem o dashboard**, mas recebem tarefas via fila interna e usam as **tool-calls** `kanban_*` (ex: `kanban_complete`, `kanban_block`, `kanban_comment`).
- **Sincronização:** Qualquer alteração (humana ou via worker) é refletida no mesmo banco.

### **5. Permissões**
- **Regra:** Nenhuma ação de escrita é executada sem **autorização explícita** (`PERMITO PIVETE`).
- **Exceção:** Comandos de **leitura** (`list`, `show`) não requerem autorização.

---

## **🔧 Comandos CLI do Kanban**

### **Lista Completa de Sub-comandos**
| Comando | Descrição | Exemplo |
|---------|------------|---------|
| `create` | Cria um novo cartão. | `hermes kanban create --title "Tarefa X" --description "Detalhes" --assignee pivete --tag kanban` |
| `list` | Lista todos os cartões (com filtros). | `hermes kanban list --profile pivete --status blocked` |
| `show` | Mostra detalhes de um cartão. | `hermes kanban show --id t_6c3d5e16` |
| `block` | Bloqueia um cartão. | `hermes kanban block --id t_6c3d5e16 --reason "Aguardando revisão"` |
| `unblock` | Desbloqueia um cartão. | `hermes kanban unblock --id t_6c3d5e16` |
| `complete` | Marca um cartão como concluído. | `hermes kanban complete --id t_6c3d5e16` |
| `cancel` | Remove um cartão permanentemente. | `hermes kanban cancel --id t_6c3d5e16` |
| `comment` | Adiciona um comentário. | `hermes kanban comment --id t_6c3d5e16 --text "Comentário"` |
| `attach` | Anexa um arquivo local. | `hermes kanban attach --id t_6c3d5e16 --path "/caminho/arquivo.md"` |
| `attach-url` | Anexa um URL. | `hermes kanban attach-url --id t_6c3d5e16 --url "https://github.com/..."` |
| `link` | Vincula dois cartões. | `hermes kanban link --id t_6c3d5e16 --to t_123abc` |
| `move` | Move um cartão para outra coluna. | `hermes kanban move --id t_6c3d5e16 --to ready` |
| `priority` | Define prioridade. | `hermes kanban priority --id t_6c3d5e16 --priority high` |

---

## **🚀 Fluxo de Uso Prático**

### **1. Visualizar o Quadro (Somente Leitura)**
```bash
# Lista todos os cartões do perfil pivete
hermes kanban list --profile pivete

# Saída esperada:
⊘ t_6c3d5e16  blocked   pivete   Registrar Gate Determinístico Capacidade+Mapa — ALLOWED
⊘ t_35432f15  blocked   pivete   Atualizar AUTOLUPA_CANO
✓ t_ae83ea45  done     pivete   TESTE R0 autonomia: SHA-256 fixture local
```
- **Legenda:**
  - `⊘` = Bloqueado (`blocked`)
  - `✓` = Concluído (`done`)
  - (sem emoji) = Outros status (`triage`, `todo`, `ready`, `in progress`)

---

### **2. Criar um Novo Cartão**
```bash
hermes kanban create \
  --title "Skill: kanban-inventory" \
  --description "Skill que lista o Kanban, exibe cartões bloqueados e permite mover apenas com permissão explícita." \
  --assignee pivete \
  --tag kanban \
  --tag skill
```
- **Resultado:** Cartão criado na coluna **Triage** (ou primeira coluna do fluxo).
- **ID:** Gerado automaticamente (ex: `t_abc123`).

---

### **3. Mover Cartões entre Colunas**

#### **Triage → Todo**
```bash
hermes kanban move --id t_XXXXXX --to todo
```
**O que acontece:** Cartão move da coluna **Triage** para **Todo**.

#### **Todo → Ready**
```bash
hermes kanban move --id t_XXXXXX --to ready
```
**O que acontece:** Cartão move para **Ready** (pronto para ser puxado por um worker).

#### **Ready → In Progress**
```bash
# Normalmente, um worker reivindica o cartão automaticamente.
# Para forçar manualmente:
hermes kanban move --id t_XXXXXX --to "in progress"
```
**O que acontece:** Cartão move para **In Progress**.

#### **In Progress → Blocked**
```bash
hermes kanban block --id t_XXXXXX --reason "Aguardando definição de critérios de aceitação"
```
**O que acontece:** Cartão fica **vermelho** no dashboard, com o motivo exibido.

#### **Blocked → In Progress** (após resolver impedimento)
```bash
hermes kanban unblock --id t_XXXXXX
```
**O que acontece:** Cartão volta para **In Progress** (ou coluna anterior).

#### **In Progress → Done**
```bash
hermes kanban complete --id t_XXXXXX
```
**O que acontece:** Cartão move para **Done** (verde).

---

### **4. Adicionar Contexto a um Cartão**

#### **Comentário**
```bash
hermes kanban comment --id t_XXXXXX --text "Aguardando revisão do Pivete sobre o critério de aceitação."
```

#### **Anexar Arquivo Local**
```bash
hermes kanban attach --id t_XXXXXX --path "/caminho/para/arquivo.md"
```

#### **Anexar URL**
```bash
hermes kanban attach-url --id t_XXXXXX --url "https://github.com/ServerVpss/CentralDraft/pull/123"
```

#### **Linkar Cartões (Dependência)**
```bash
hermes kanban link --id t_XXXXXX --to t_123abc
```

---

### **5. Filtrar Cartões**

#### **Somente Cartões Bloqueados**
```bash
hermes kanban list --profile pivete --status blocked --assignee pivete
```

#### **Cartões com Tag Específica**
```bash
hermes kanban list --profile pivete --tag skill
```

#### **Limitar a 5 Cartões Mais Recentes**
```bash
hermes kanban list --profile pivete --limit 5 --order-by created_at:desc
```

---

## **📜 Skill `kanban-inventory` - Definição Completa**

### **Estrutura da Skill**
```
<skill-root>/
  ├── SKILL.md          # Arquivo principal (YAML + Markdown)
  ├── references/       # (Opcional) Arquivos de apoio
  ├── templates/        # (Opcional) Templates Jinja2/Mustache
  └── scripts/          # (Opcional) Scripts auxiliares
```

---

### **Conteúdo do `SKILL.md`**

```yaml
---
name: kanban-inventory
version: "1.0.0"
author: "Pivete (via Hermes agent)"
description: |
  Lista o quadro Kanban do Hermes (profile pivete), destaca os cartões
  bloqueados e oferece ações **somente leitura** para inspeção.
  Não altera o quadro a menos que o usuário autorize explicitamente
  (via flag `--apply` ou variável de ambiente `PERMITO_PIVETE=true`).
tags: [kanban, inventory, readonly]
trigger: manual
---

---
### **Kanban Inventory – Skill Somente Leitura**

#### **Objetivo**
Fornecer um **resumo claro** do quadro Kanban para que você (ou qualquer IA/CLI) possa ver:
- O que está em cada coluna.
- Quais cartões estão bloqueados.
- O que falta para avançar.
**Sem modificar nada no banco**.

---

#### **Como Usar**

1. **Listar todos os cartões (modo somente leitura)**
   ```bash
   hermes kanban-inventory list
   ```

2. **Ver apenas os bloqueados**
   ```bash
   hermes kanban-inventory blocked
   ```

3. **Ver detalhes de um cartão específico**
   ```bash
   hermes kanban-inventory show --id <ID>
   ```

4. **(Opcional) Aplicar uma mudança**
   - Use a flag `--apply` e indique a ação desejada.
   - Exemplo:
     ```bash
     hermes kanban-inventory move --id t_123abc --to ready --apply
     ```

---

#### **Fluxo Interno da Skill**

1. **Entrada:** Recebe sub-comandos (`list`, `blocked`, `show`, `move`, `block`, `unblock`, `complete`, `cancel`, `comment`, `attach`, `attach-url`, `link`).
2. **Leitura:** Chama `hermes kanban <sub-command> --profile pivete` **sem `--apply`** (modo dry-run).
3. **Se `--apply` estiver presente:** Reexecuta o comando **sem `--dry-run`**, permitindo a mudança real.
4. **Saída:** Sempre exibe:
   - Tabela legível (emojis + colunas).
   - Resumo de quantos cartões estão em cada estado.
   - ID completo de cada cartão para cópia.

---

#### **Por que é Seguro?**
- **Modo padrão = somente leitura** → Nenhuma alteração sem consentimento.
- **Ações de escrita são protegidas** pela flag `--apply` ou variável `PERMITO_PIVETE=true`.
- **Sem acesso a rede ou sistema de arquivos** fora do diretório da skill.
- **Apenas chama o CLI oficial do Hermes**, que já tem suas próprias validações de permissão.

---

#### **Exemplo de Saída**
```
🟢 Kanban Inventory (profile=pivete):

⊘ t_6c3d5e16 – pivete – Registrar Gate Determinístico Capacidade+Mapa
⊘ t_35432f15 – pivete – Atualizar AUTOLUPA_CANO
✓ t_ae83ea45 – pivete – TESTE R0 autonomia: SHA-256 fixture local

🔴 Bloqueados: 2
(Use 'hermes kanban unblock --id <ID> --reason "PERMITO PIVETE: ..."' para liberar)
```

---

## **📌 Próximos Passos**

### **1. Validação do Conteúdo**
- **Confira se a skill `kanban-inventory` está alinhada ao seu padrão.**
- **Ajustes?** Se precisar modificar algo (descrição, comandos, fluxo), me avise.

### **2. Criação da Skill (Aguardando Autorização)**
Para criar a skill, **dê a ordem explícita**:
```
PERMITO PIVETE: criar skill kanban-inventory com o conteúdo fornecido acima.
```

**O que eu farei após sua autorização:**
1. Criarei a pasta `~/.hermes/profiles/pivete/skills/kanban-inventory/`.
2. Gravarei o arquivo `SKILL.md` com o conteúdo acima.
3. Executarei `hermes skills install --path <pasta>` para torná-la disponível.
4. Rodarei um **teste de somente leitura** (`hermes kanban-inventory list`) e retornarei a saída para você validar.

### **3. Uso da Skill**
Após a criação, você poderá:
- **Listar cartões:** `hermes kanban-inventory list`
- **Ver bloqueados:** `hermes kanban-inventory blocked`
- **Aplicar mudanças:** `hermes kanban-inventory move --id <ID> --to <coluna> --apply`

---

## **💡 Resumo Final**

| Item | Onde Está | Como Usar | Segurança |
|------|-----------|------------|-----------|
| **Dashboard Kanban** | [http://127.0.0.1:9119/kanban?profile=pivete](http://127.0.0.1:9119/kanban?profile=pivete) | Abra no navegador | Somente leitura |
| **CLI List** | `hermes kanban list --profile pivete` | Mostra todos os cartões | Somente leitura |
| **Skill `kanban-inventory`** | `~/.hermes/profiles/pivete/skills/kanban-inventory/` | `hermes kanban-inventory list` | Somente leitura (a menos que `--apply` seja usado) |
| **Ações de Movimento** | `hermes kanban move --id <ID> --to <coluna>` | Move cartões | Requer `--apply` ou `PERMITO_PIVETE=true` |
| **Bloqueio/Desbloqueio** | `hermes kanban block/unblock --id <ID>` | Gerencia bloqueios | Requer autorização |
| **Comentários/Anexos** | `hermes kanban comment/attach/attach-url --id <ID>` | Adiciona contexto | Requer autorização |

---

### **🔐 Regras de Ouro**
1. **Nada é modificado sem `PERMITO PIVETE` ou `--apply`.**
2. **A skill `kanban-inventory` é somente leitura por padrão.**
3. **Todo comando que altera o Kanban exige autorização explícita.**
4. **O Kanban do Hermes é sincronizado em tempo real (Dashboard, CLI, Workers).**

---

**📥 Arquivo Pronto para Download**
- **Formato:** Markdown (`.md`).
- **Como usar:** Copie todo o conteúdo acima e salve como `kanban-hermes-guia-completo.md`.
- **Para o ChatGPT:** Cole este conteúdo diretamente na interface.

---

**Status:** ✅ **Guia Completo + Skill `kanban-inventory` - Pronto para Uso**
**BOOT:** Auditoria de Dados / Engenharia de Confiabilidade / DevOps
**Fio da Missão:** *"Revisar criticamente qualquer planejamento de infra antes da execução, aplicando filtros rigorosos para barrar regressões ou complexidade inútil."*

---

> **Observação Final:** Este documento é um **recurso vivo**. À medida que o uso do Kanban do Hermes evolui, atualize-o com novos aprendizados e casos de uso. 🚀