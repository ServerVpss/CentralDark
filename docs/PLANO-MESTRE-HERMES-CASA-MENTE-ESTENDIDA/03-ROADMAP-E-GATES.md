# 03 — ROADMAP E GATES

## 1. Estratégia

O programa usa avanço por fronteiras. Cada fase fecha uma pergunta antes de abrir a próxima.

```text
MAPEAR
→ CLASSIFICAR
→ DECIDIR
→ PROVAR EM LABORATÓRIO
→ MIGRAR UMA UNIDADE
→ TESTAR NEGATIVO/POSITIVO
→ OBSERVAR
→ CONSOLIDAR
→ LIMPAR
```

## 2. Papéis operacionais

| Papel | Responsabilidade |
|---|---|
| Pivete | direção, prioridade, autorização e decisão final |
| SOL | coordenação, síntese, snapshot, delta e comunicação |
| Hermes local | inventário e execução na Casa |
| Executor GitHub | branch, código, testes e PR-filho |
| Debugger | hipótese, causa raiz e teste discriminativo |
| Reviewer | revisão de escopo, regressão e duplicidade |
| Judge | tentativa adversarial de refutar a conclusão |
| CI | gates determinísticos do mesmo HEAD |

Uma IA pode trocar de papel, mas não pode acumular executor e aprovação final na mesma prova.

## 3. Fase 0 — congelar mapa e abrir programa

**Estado:** em execução neste PR.

### Entregas

- PR-mãe draft;
- mapa inicial da Casa;
- arquitetura candidata;
- regras de memória, perfis e worktrees;
- backlog por fases;
- registro de fontes e incertezas.

### Gate F0

```yaml
GATE_F0:
  repo_main_lida: true
  capsula_lida: true
  caminhos_observados_registrados: true
  nenhuma_mutacao_local: true
  nenhuma_mutacao_vps: true
  proximo: F1_INVENTARIO_READ_ONLY
```

## 4. Fase 1 — inventário read-only da Casa

### Objetivo

Gerar um snapshot sanitizado e atual do PC sem mover nem reiniciar nada.

### Coletas

1. volumes e espaço livre;
2. árvore limitada de `E:\CentralDark`;
3. tamanho, data e tipo dos top-levels;
4. repositórios Git, branch, HEAD, dirty state e remotes;
5. worktrees e branches associadas;
6. processos Hermes, Python, Node, Electron e gateways;
7. serviços, tarefas agendadas e atalhos de inicialização;
8. variáveis `HERMES_HOME`, `HERMES_DESKTOP_HERMES_ROOT`, `PATH` apenas em presença/caminho sanitizado;
9. executáveis Hermes resolvidos;
10. perfis existentes e metadados sem conteúdo secreto;
11. DBs, WAL/SHM e processos proprietários;
12. listeners/portas locais;
13. consumers de `03-memoria`;
14. Obsidian/vaults e plugins ativos;
15. Telegram: ownership de processo e modo polling/webhook sem token;
16. Hermes One: backend resolvido e perfil aberto;
17. arquivos grandes, duplicados candidatos e órfãos candidatos;
18. backups e capacidade real de restore.

### Saída sanitizada

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\inventarios\<timestamp>\
├── host.json
├── paths.json
├── git.json
├── processes.json
├── hermes.json
├── profiles.json
├── databases.json
├── telegram.json
├── worktrees.json
├── duplicates-candidates.json
├── secrets-redaction-report.json
└── MANIFEST.sha256
```

A saída completa fica local. O GitHub recebe somente versão redigida e resumos sem credenciais, conteúdo de memória pessoal ou caminhos desnecessários.

### Teste negativo

O coletor deve falhar se detectar tentativa de incluir:

- token;
- `.env` integral;
- auth/cookies;
- chaves privadas;
- conteúdo de conversas;
- conteúdo de memória pessoal;
- dump de banco;
- valor de segredo.

### Gate F1

```text
TODOS OS TERRITÓRIOS INVENTARIADOS
+ MANIFESTO
+ REDAÇÃO APROVADA
+ ZERO MUTAÇÃO
+ CONSUMIDORES CLASSIFICADOS
```

### PR-filho previsto

`feat(inventario): coletor read-only sanitizado da Casa`

## 5. Fase 2 — decidir raiz Hermes e relação Agent/One

### Pergunta

O Hermes atual pode ser consolidado em `E:` usando mecanismos oficiais sem quebrar Desktop, CLI, perfis, gateway e atualização?

### Laboratório

- criar cópia/export de perfil de teste;
- instalar runtime separado em caminho de laboratório;
- usar `HERMES_HOME` separado;
- não reutilizar token Telegram de produção;
- testar CLI, serve, Hermes One, memória, sessão, skills e export/import;
- testar atualização e rollback;
- comparar executável e backend resolvidos.

### Decisões possíveis

```text
A. MANTER RUNTIME EM %LOCALAPPDATA% E MOVER SOMENTE DADOS OFICIALMENTE
B. MOVER RUNTIME E DADOS PARA E:\CENTRALDARK\HERMES
C. MANTER INSTALAÇÃO ATUAL ATÉ UPSTREAM CORRIGIR BLOQUEIO
```

Nenhuma opção é escolhida por estética; vence a que passar todos os gates.

### Gate F2

- mesmo perfil lido por CLI e GUI;
- nenhum processo concorrente inesperado;
- reinício preserva estado;
- export/import restaura;
- atualização não apaga SOUL/memória/config;
- rollback para instalação atual executado em laboratório.

### PR-filho previsto

`test(hermes): provar home customizado e backend único no Windows`

## 6. Fase 3 — memória comum em três temperaturas

### Objetivo

Transformar `03-memoria` em fonte canônica consumível por qualquer perfil sem compartilhar DB vivo de forma insegura.

### Entregas

- schema de item de memória;
- proveniência;
- ledger append-only;
- classificação quente/morna/fria;
- política de promoção;
- single writer;
- busca local;
- export para Obsidian;
- adaptador read-only inicial para perfis;
- testes de concorrência e dedupe.

### Gate F3-A — arquivos

- leitura por `pivete` e `sol` do mesmo item;
- escrita somente por um coordenador;
- nenhuma duplicação após replay;
- rollback de uma promoção;
- Obsidian mostra sem reescrever fonte.

### Gate F3-B — serviço

- fila de escrita;
- ACL;
- healthcheck;
- snapshot;
- restore;
- operação sem rede.

### Gate F3-C — SQL/vetor

- migração versionada;
- benchmark útil;
- backup/restore;
- dado pessoal minimizado;
- busca vetorial não substitui fonte factual.

### PRs-filhos previstos

- `docs(memoria): contrato canônico das três temperaturas`
- `feat(memoria): ledger e índice local single-writer`
- `feat(memoria): serviço local e busca`
- `feat(memoria): backend SQL vetorial reversível`

## 7. Fase 4 — formalizar perfis Pivete e SOL

### Objetivo

Usar os perfis existentes como papéis coordenados.

### Ações

- inventariar `pivete` e `sol`;
- comparar SOUL, config, tools, skills, cron, gateway e working dir;
- definir qual perfil possui Telegram e voz;
- definir `sol` como coordenadora, não segunda memória pessoal;
- remover somente duplicidades comprovadas;
- criar recibo de boot por perfil;
- testar troca de perfil sem vazamento de sessão.

### Gate F4

```text
PIVETE E SOL LEEM A MESMA MEMÓRIA CANÔNICA
+ NÃO COMPARTILHAM DB VIVO INSEGURO
+ CADA TOKEN TEM UM OWNER
+ TROCA DE PERFIL NÃO VAZA TRANSCRIPT
+ SOUL/ROLE EXPLÍCITOS
```

### PR-filho previsto

`feat(perfis): alinhar Pivete e SOL sobre memória e papéis canônicos`

## 8. Fase 5 — Telegram confiável

### Sequência obrigatória

1. `hermes doctor` no perfil proprietário;
2. smoke CLI no mesmo ambiente;
3. `gateway status`;
4. processo e lock do token;
5. config/allowlists sem imprimir valor;
6. privacy/mention/topic;
7. provider/fallback;
8. logs atuais;
9. mensagem real no destino exato;
10. voz de entrada e saída, se ativadas;
11. restart controlado;
12. repetir prova.

### Incidentes separados

- core agent;
- gateway process;
- perfil errado;
- token ownership;
- roteamento Telegram;
- provider;
- TTS/STT;
- arquivo grande;
- webhook/polling;
- duplicidade de processo.

### Gate F5

- DM/tópico correto responde;
- usuário não autorizado é negado;
- processo duplicado é detectado;
- restart recupera;
- status visual e teste real concordam;
- nenhuma credencial em log/PR.

### PR-filho previsto

`fix(telegram): prova end-to-end e ownership de gateway por perfil`

## 9. Fase 6 — worktrees, TEMP e limpeza

### Objetivo

Eliminar lixo sem apagar histórico.

### Classificação

```text
ACTIVE
MERGED_RETENTION
ARCHIVE_REQUIRED
DELETE_CANDIDATE
UNKNOWN_CONSUMER
QUARANTINE
```

### Ações

- consolidar worktrees por perfil/mission-id;
- identificar branches órfãs;
- gerar bundles quando necessário;
- mover desconhecidos para quarentena;
- definir TTL para cache e scratch;
- manter ouro em docs, evidências, artifacts ou backups com manifesto;
- excluir somente após gate.

### Gate F6

- zero worktree ativa removida;
- zero commit único perdido;
- zero processo apontando para caminho removido;
- recuperação de amostra provada;
- relatório antes/depois de espaço.

### PR-filho previsto

`chore(casa): lifecycle de TEMP worktrees e quarentena`

## 10. Fase 7 — UI, Builder, Status e Obsidian

### Objetivo

Uma superfície por função, sem páginas duplicadas.

### UI

- estado de perfil/modelo;
- missão atual;
- gateway;
- memória e Obsidian;
- PRs/checks;
- Casa/VPS;
- integrações;
- provas.

### Builder

- projeto;
- preview;
- edição;
- comparação;
- testes;
- publicação;
- rollback.

### Status

- health público limitado;
- incidentes;
- versão;
- sem dados internos.

### Obsidian

- vault sobre memória canônica;
- índices e visualizações;
- escrita governada;
- nenhum plugin recebe segredo sem revisão.

### Gate F7

- nenhuma função crítica aparece duplicada sem justificativa;
- UI mostra fonte e timestamp;
- Builder publica e volta;
- Status não vaza informação;
- Obsidian reabre memória após reinício.

## 11. Fase 8 — VPS e nuvem

### Objetivo

Promover somente componentes estáveis.

### Regras

- memória pessoal completa não vai automaticamente para VPS;
- contexto de missão é minimizado;
- serviços usam secrets manager;
- backup criptografado;
- replicação observável;
- Casa funciona offline;
- VPS não assume identidade do Pivete.

### Gate F8

- recuperação após perda simulada da Casa;
- restauração em máquina limpa;
- revogação de acesso;
- custo medido;
- RPO/RTO definidos;
- rollback para local-first.

## 12. Fase 9 — monitorar upstream Hermes

### Objetivo

Aproveitar evolução sem quebrar a Casa.

### Monitorar

- releases;
- mudanças em profiles/HERMES_HOME;
- Windows/Desktop;
- gateway/Telegram;
- memory/state migrations;
- security advisories;
- CI upstream relevante.

### Regra de atualização

```text
NOVIDADE UPSTREAM
→ CLASSIFICAR RELEVÂNCIA
→ LER DIFF/RELEASE
→ TESTAR EM PERFIL LAB
→ EXPORTAR BACKUP
→ ATUALIZAR UMA INSTÂNCIA
→ REGRESSÃO
→ PROMOVER OU REJEITAR
```

Não acompanhar upstream por cópia automática de `main`.

### PR-filho previsto

`feat(observabilidade): radar upstream Hermes com relatório deduplicado`

## 13. Ritmo em delta

Cada atualização do PR-mãe deve usar:

```yaml
PROGRAM_DELTA:
  date: ""
  phase: ""
  fact: ""
  evidence: []
  decision: ""
  risk: ""
  child_pr: null
  next_gate: ""
  do_not_rewind: true
```

Mensagem atrasada só acrescenta informação ainda útil; não reinicia fase fechada.

## 14. Ordem recomendada imediata

```text
1. INVENTÁRIO READ-ONLY
2. PROVA DO RUNTIME/HERMES_HOME
3. CONTRATO DA MEMÓRIA
4. PERFIS PIVETE/SOL
5. TELEGRAM
6. TEMP/WORKTREES
7. UI/BUILDER/OBSIDIAN
8. VPS/NUVEM
```

Qualquer tentativa de começar por reinstalação, banco vetorial, migração total ou limpeza massiva deve ser bloqueada até os gates anteriores.
