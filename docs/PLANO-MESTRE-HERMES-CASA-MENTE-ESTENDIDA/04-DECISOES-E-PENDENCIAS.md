# 04 — DECISÕES E PENDÊNCIAS

## 1. Como usar este arquivo

Este é o ledger humano do programa. Decisão aceita não é reescrita silenciosamente. Mudança futura cria nova entrada, cita a anterior e explica a evidência.

Estados:

```text
PROPOSTA
ACEITA_PARA_PLANO
PROVADA_EM_LAB
PROMOVIDA
REJEITADA
SUPERADA
```

## 2. Decisões iniciais

### ADR-001 — manter um PR-mãe draft e PRs-filhos atômicos

```yaml
status: ACEITA_PARA_PLANO
motivo: preservar um fio fixo sem misturar meses de código e múltiplos escritores
consequencia:
  - o PR-mãe recebe mapa, deltas, decisões e links
  - mudanças técnicas entram por PR-filho
  - merge do PR-mãe só ocorre quando a arquitetura documental estiver madura
```

### ADR-002 — não reinstalar nem mover Hermes antes do inventário

```yaml
status: ACEITA_PARA_PLANO
motivo: runtime, perfis, bancos, gateway, Desktop e consumidores ainda não foram mapeados no estado atual
bloqueia:
  - desinstalacao
  - mudanca de HERMES_HOME
  - mudanca de PATH
  - junction
  - exclusao de perfil
  - copia de banco vivo
```

### ADR-003 — Hermes Agent é motor; Hermes One é interface

```yaml
status: ACEITA_PARA_PLANO
base: documentacao oficial upstream
regra: usar os dois somente quando apontarem para o mesmo backend, HERMES_HOME e perfil provados
proibido: dois runtimes concorrentes sem ownership explícito
```

### ADR-004 — preservar o perfil `sol` existente

```yaml
status: ACEITA_PARA_PLANO
base: captura do Pivete mostra profiles/sol
acao: inventariar antes de criar, clonar, renomear ou substituir
```

### ADR-005 — memória comum não compartilha SQLite vivo diretamente

```yaml
status: ACEITA_PARA_PLANO
motivo: perfis Hermes isolam estado; DB/WAL compartilhados por processos podem corromper ou vazar contexto
alvo:
  - memoria canonica em arquivos/ledger
  - single writer
  - adaptador ou servico local
  - SQL/vetor em fase posterior com locks e migracoes
```

### ADR-006 — `03-memoria` é candidata a memória canônica

```yaml
status: ACEITA_PARA_PLANO
path: E:\CentralDark\Pivete\NUCLEO\motor\03-memoria
condicao: inventariar consumidores, schemas, writers, backups e integracao Obsidian
```

### ADR-007 — não renomear `Pivete` e `Sol` agora

```yaml
status: ACEITA_PARA_PLANO
motivo: caminhos podem ter consumidores e atalhos; organização numérica começa dentro das raízes existentes
futuro: reavaliar top-level após mapa de dependências
```

### ADR-008 — worktrees ficam em TEMP com lifecycle

```yaml
status: ACEITA_PARA_PLANO
alvo: E:\CentralDark\<Perfil>\TEMP\worktrees\<repo>\<mission-id>
regra: após merge, retenção curta, prova de alcance remoto e limpeza controlada
```

### ADR-009 — uma superfície Web por função

```yaml
status: ACEITA_PARA_PLANO
ui.centralldark.com: operar
builder.centralldark.com: criar, visualizar, publicar e voltar
status.centralldark.com: observar disponibilidade e incidentes
regra: não criar quarta superfície sem função nova comprovada
```

### ADR-010 — Telegram só é verde com prova end-to-end

```yaml
status: ACEITA_PARA_PLANO
prova:
  - doctor
  - chat CLI
  - gateway status
  - logs atuais
  - resposta real no destino exato
nao_prova:
  - dashboard carregou
  - getMe respondeu
  - processo aparece como running
```

### ADR-011 — upstream Hermes é radar, não atualização automática

```yaml
status: ACEITA_PARA_PLANO
regra: release ou commit relevante passa por leitura, laboratório, backup, regressão e promoção
```

### ADR-012 — Casa guarda memória pessoal; VPS recebe mínimo necessário

```yaml
status: ACEITA_PARA_PLANO
motivo: reduzir exposição e impedir segundo Jarvis concorrente
futuro: replicação seletiva, criptografada e reversível
```

## 3. Fontes registradas

### Repositório CentralDark

- `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/`
- `LEIA-ME-IA.md`
- `mapa-canonico.json`

### Pacote fornecido pelo Pivete

- `SOL-SESSION-CAPSULE-20260729`
- `FIO-DA-MISSAO.md`
- `ESTADO-ATUAL.json`
- `COOPERACAO-PARALELA.md`
- `ARQUITETURA-COGNITIVA.md`
- `PADROES-ADQUIRIDOS.md`

### Upstream oficial

- `https://github.com/NousResearch/hermes-agent`
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/profiles.md`
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/configuration.md`
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/desktop.md`
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/telegram.md`
- `https://hermes-agent.ai/blog/hermes-agent-gateway-troubleshooting`
- `https://hermesone.org/docs`
- `https://github.com/NousResearch/hermes-agent/actions`

## 4. Pendências que exigem Casa

| ID | Pergunta | Instrumento | Mutação permitida? |
|---|---|---|---|
| P01 | Qual é o `HERMES_HOME` real de cada processo? | inventário de processo/env sanitizado | não |
| P02 | Qual runtime Hermes One resolve? | logs/backend resolution | não |
| P03 | Qual perfil possui o gateway Telegram? | status/process/config presence | não |
| P04 | Há dois gateways usando o mesmo token? | locks/processos/getWebhookInfo local | não |
| P05 | Quem escreve `03-memoria` hoje? | handles, scripts, cron, timestamps | não |
| P06 | Quais DBs estão abertos? | process handles + WAL/SHM | não |
| P07 | Quais worktrees estão ativas ou sujas? | git worktree list + status | não |
| P08 | O perfil `sol` é utilizável ou experimental? | doctor/chat/read-only diff | não |
| P09 | Obsidian aponta para qual vault e quais plugins? | config e mapa de vault | não |
| P10 | Quais itens soltos na raiz têm consumidor? | hash, links, atalhos e busca | não |

## 5. Pendências que exigem GitHub

| ID | Ação | Resultado esperado |
|---|---|---|
| G01 | criar contrato/schema do inventário sanitizado | saída reproduzível |
| G02 | adicionar validador de redação | bloquear segredo |
| G03 | criar formato de `PROGRAM_DELTA` | atualizações curtas |
| G04 | mapear módulos UI/Builder/Status | dedupe de páginas |
| G05 | criar radar upstream Hermes | relatório sem atualização automática |
| G06 | ligar PRs-filhos a este PR-mãe | rastreabilidade |

## 6. Pendências que exigem VPS

| ID | Pergunta | Regra |
|---|---|---|
| V01 | quais serviços Hermes/Builder estão ativos? | leitura de PM2/systemd/docker |
| V02 | qual commit está implantado? | comparar GitHub↔VPS |
| V03 | quais endpoints alimentam UI/Builder/Status? | mapa de rotas e ownership |
| V04 | onde ficam logs e artifacts? | não criar terceira fonte |
| V05 | há memória pessoal na VPS? | classificar e reduzir se existir |

## 7. Riscos que bloqueiam execução

```yaml
BLOCKERS:
  - id: B01
    risk: segredo ou conteúdo pessoal em inventário
    mitigation: redactor fail-closed
  - id: B02
    risk: banco vivo movido com processo aberto
    mitigation: ownership + shutdown controlado + backup + restore
  - id: B03
    risk: token Telegram usado por dois gateways
    mitigation: lock e ownership por perfil
  - id: B04
    risk: Hermes One e CLI em runtimes diferentes
    mitigation: backend resolution evidence
  - id: B05
    risk: worktree com commit único apagada
    mitigation: reachability/bundle gate
  - id: B06
    risk: nuvem sincronizando WAL/DB vivo
    mitigation: export/snapshot, nunca sync bruto
  - id: B07
    risk: memória compartilhada virar memória concorrente
    mitigation: single writer + ledger + ACL
  - id: B08
    risk: PR-mãe virar branch de produção eterna
    mitigation: docs-only; execução em PRs-filhos
```

## 8. Próxima decisão permitida

A única decisão técnica necessária depois deste PR é definir o contrato do inventário read-only. Nenhuma escolha sobre mover Hermes, criar banco vetorial, limpar arquivos ou trocar gateway deve ser tomada antes do resultado da Fase 1.
