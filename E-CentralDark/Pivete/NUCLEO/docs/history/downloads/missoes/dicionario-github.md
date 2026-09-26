# DICIONÁRIO PIVETE — GITHUB — REFERÊNCIA

Fonte: `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md` (canônico)

## Permissões do token (tela Repository permissions)

| Permissão (tela) | Seu jeito | O que faz | Quando usar |
|------------------|-----------|-----------|-------------|
| Contents | Arquivos do projeto | Lê/escreve código, commits, branches, tags, releases, merges | Read = só olhar; Write = commit/push |
| Metadata | Cartão de visita do repo | Lê nome, descrição, visibilidade, topics | Sempre (Read-only, automático) |
| Pull requests | Pedido de mudança (PR) | Abre, comenta, aprova, rejeita, mergeia PR | Write se agente abre/comenta/mergeia |
| Issues | Chamado / ticket | Cria, fecha, comenta, etiqueta Issues | Write se agente abre/fecha |
| Workflows | Robôs automáticos (editar YAML) | Altera arquivos de workflow | Write só se editar workflow |
| Actions | Painel dos robôs | Vê runs, logs, artifacts; cancela/re-dispara | Read = ver; Write = cancelar/re-disparar |
| Administration | Chave do dono | Settings, collaborators, branch protection, delete repo | No access no token de automação |
| Secrets | Cofre do GitHub | Cria/atualiza/remove secrets do repo | No access (salvo tarefa específica) |
| Commit statuses | Sinalzinho do check | Grava status do check no commit/PR | Write se agente reporta status de CI |
| Environments | Salas protegidas de publicação | Administra environments (dev, staging, prod) | No access no token geral |
| Pages | Site publicado pelo GitHub | Configuração/origem de publicação do Pages | No access se não usar Pages |
| Deployments | Ordem/histórico de publicação | Cria/consulta deployments e status | Write só para deployer canônico |
| Dependabot alerts | Avisos de dependência vulnerável | Consulta/altera alertas | Read para auditoria |
| Dependabot secrets | Cofre particular do Dependabot | Secrets do Dependabot | No access no token geral |

## Config rápida — token de agente (commit automático sem action_required)

| Permissão | Nível |
|-----------|-------|
| Contents | Write |
| Metadata | Read |
| Pull requests | Write |
| Issues | Write (se comentar/etiquetar) |
| Workflows | Write só se editar workflow |
| Actions | Read (ou Write se re-disparar) |
| Deployments | No access; Write só para deployer |
| Environments | No access; liberar por missão |
| Pages | No access se não usar Pages |
| Dependabot alerts | Read para auditoria |
| Dependabot secrets | No access |
| Administration | No access |
| Secrets | No access (salvo tarefa específica) |

Repo access: **Only select repositories** → só o CentralDark (ou os que SEGREDO/CHEFE autorizar).

## Perfil mínimo do promotor autônomo (PROMOTION_TOKEN)

| Permissão | Nível | Motivo |
|-----------|-------|--------|
| Contents | Write | concluir merge no repositório |
| Pull requests | Write | atualizar branch e operar PR |
| Issues | Write | aplicar label/comentário de diagnóstico |
| Actions | Read | revalidar runs exigidas |
| Metadata | Read | obrigatório pelo GitHub |

Não adicionar `Administration`, `Secrets`, `Environments`, `Pages`, `Deployments` ou `Workflows` sem rota concreta.

## Termos do dia a dia

- **PAT** → Chave pessoal
- **Fine-grained token** → Chave com trava por gaveta
- **Classic token** → Chave antiga (larga) — evitar
- **PROMOTION_TOKEN** → Chave do promotor autônomo (nome válido do secret)
- **action_required** → GitHub pedindo identidade
- **Workflow/Actions** → Robô automático
- **Secrets (Actions)** → Segredo guardado pro robô
- **Environment** → Sala com regra própria
- **Deployment** → Tentativa registrada de publicar
- **GitHub Pages** → Hospedagem do próprio GitHub
- **Dependabot** → Vigia das dependências
- **Branch protection** → Trava da branch
- **Merge** → Juntar a mudança
- **Fork** → Cópia pra brincar
- **Review** → Olhada de alguém
- **Label** → Etiqueta
- **Assignee** → Responsável
- **Milestone** → Marco
- **Release** → Pacote oficial
- **Artifact** → Arquivo que o robô gerou

## Como evoluir este dicionário

Apareceu termo novo na tela? Manda print ou o nome técnico. Adiciona embaixo no **mesmo arquivo**, mesmo formato. Nunca criar `DICIONARIO-PIVETE-GITHUB-v2.md`.