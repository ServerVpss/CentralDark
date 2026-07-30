# 02 — ARQUITETURA-ALVO

## 1. Princípio central

```text
UMA AUTORIDADE
→ PIVETE

UMA IDENTIDADE OPERACIONAL VISÍVEL
→ SOL / JARVIS

UM CORPO LOCAL
→ HERMES AGENT

UMA INTERFACE GRÁFICA LOCAL
→ HERMES ONE, QUANDO LIGADO AO MESMO MOTOR

UMA MEMÓRIA PESSOAL CANÔNICA
→ E:\CentralDark\Pivete\NUCLEO\motor\03-memoria

MÚLTIPLOS PERFIS E MODELOS
→ PAPÉIS ESPECIALIZADOS, NÃO MENTES CONCORRENTES
```

## 2. Separação correta das camadas

| Camada | Dono | Função | Pode ser descartada? |
|---|---|---|---|
| intenção | Pivete | direção e decisão | não |
| identidade/SOUL | Pivete + contrato aprovado | voz, valores, invariantes | não |
| memória canônica | Casa | fatos, decisões, padrões e retomada | não |
| perfil Hermes | Hermes | config, sessão, tools, gateways e estado do papel | somente com export/restore |
| runtime Hermes Agent | instalação | código e venv do motor | sim, se reinstalação provada |
| Hermes One | aplicação | GUI para o motor | sim, se dados estiverem fora da aplicação |
| workspace/worktree | missão | escrita isolada e testes | sim, depois de merge/arquivamento |
| cache | runtime | aceleração | sim |
| evidência | observabilidade/GitHub | prova e diagnóstico | por retenção definida |
| backup | recuperação | retorno comprovado | somente após expiração e teste |

## 3. Estrutura-alvo local

A estrutura abaixo é **candidata**. Ela não autoriza rename nem move. Os nomes existentes `Pivete` e `Sol` são preservados para evitar quebra prematura.

```text
E:\CentralDark\
├── Pivete\
│   ├── NUCLEO\
│   │   └── motor\
│   │       ├── 01-identidade\
│   │       ├── 02-governanca\
│   │       ├── 03-memoria\
│   │       ├── 04-comunicacao\
│   │       ├── 05-planejamento\
│   │       ├── 06-integracoes\
│   │       ├── 07-automacoes\
│   │       ├── 08-seguranca\
│   │       ├── 09-recuperacao\
│   │       └── 10-observabilidade\
│   ├── PROJETOS\
│   ├── BACKUPS\
│   ├── QUARENTENA\
│   └── TEMP\
│       ├── worktrees\
│       ├── downloads\
│       ├── exports\
│       └── scratch\
├── Sol\
│   ├── 01-identidade\
│   ├── 02-configuracao\
│   ├── 03-adaptadores\
│   ├── 04-estado-operacional\
│   ├── 05-prompts-e-contratos\
│   ├── 06-observabilidade\
│   └── TEMP\
├── Hermes\
│   ├── 01-agent-runtime\
│   ├── 02-hermes-one\
│   ├── 03-root-de-dados\
│   ├── 04-perfis\
│   ├── 05-gateway\
│   ├── 06-logs\
│   └── 07-cache\
├── Apps\
├── Vault\
└── Arquivo\
```

### Regra de compatibilidade

Se caminhos atuais forem consumidos por aplicações, scripts, atalhos ou serviços, a migração deve ocorrer assim:

```text
MAPEAR CONSUMIDORES
→ ESCOLHER UMA UNIDADE
→ EXPORTAR/ESPELHAR
→ TESTAR NO NOVO CAMINHO
→ TROCAR UM CONSUMIDOR
→ REGRESSÃO
→ ROLLBACK
→ SÓ DEPOIS REMOVER ORIGEM
```

Junction só pode ser usada no limite de uma unidade gerenciada e após provar que o produto suporta o caminho. É proibido criar junction para cada subpasta.

## 4. Hermes Agent + Hermes One

### Decisão arquitetural

Hermes One é interface; Hermes Agent é motor. O alvo é um único backend e uma única raiz de dados por instância ativa.

```text
HERMES_ONE
→ resolve backend
→ inicia ou conecta em hermes serve
→ seleciona perfil
→ mostra chat, memória, skills, cron e gateways

HERMES_AGENT
→ executa modelo, ferramentas, memória, sessões e gateway
```

### Critério para usar juntos

Antes de consolidar:

1. registrar executável do CLI;
2. registrar backend resolvido pelo Desktop/Hermes One;
3. registrar `HERMES_HOME` do processo;
4. registrar perfil ativo;
5. provar que ambos leem o mesmo SOUL/config sem duplicar processo de gateway;
6. provar restart e recuperação;
7. provar que uma atualização não substitui dados do perfil.

### Instalação em `E:`

O upstream suporta diretório de instalação e `HERMES_HOME` customizados, mas a versão instalada na Casa deve ser testada antes.

Destino candidato:

```text
HERMES_INSTALL_DIR=E:\CentralDark\Hermes\01-agent-runtime
HERMES_HOME=E:\CentralDark\Hermes\03-root-de-dados
HERMES_DESKTOP_HERMES_ROOT=E:\CentralDark\Hermes\01-agent-runtime
```

Esses valores não entram em produção até um laboratório isolado provar:

- profile list/use/create;
- Desktop boot;
- CLI chat;
- memory/session persistence;
- skills;
- gateway Telegram;
- atualização;
- export/import;
- rollback para `%LOCALAPPDATA%`.

## 5. Perfis e identidade

### Perfis observados

```text
claude
pivete
sol
teste
```

### Papel-alvo

| Perfil | Papel | Memória pessoal própria? |
|---|---|---|
| `pivete` | corpo principal da Casa, voz e contexto cotidiano | usa memória canônica do Pivete |
| `sol` | coordenadora de alto nível, síntese e revisão | não cria outra memória pessoal |
| `claude` | especialista/execução técnica quando selecionado | somente estado operacional necessário |
| `teste` | laboratório descartável | dados sintéticos; nunca credencial de produção |

O SOUL pode ser adaptado por perfil, mas deve apontar para a mesma autoridade e para a memória canônica. Um perfil não pode reescrever a história do Pivete como sua própria história.

## 6. Memória compartilhada sem corrupção

O desejo é correto: uma rede de pensamento distribuída. O mecanismo precisa respeitar concorrência.

### O que não fazer

```text
NÃO
→ apontar vários perfis diretamente para o mesmo state.db
→ compartilhar arquivos WAL/SHM entre processos
→ copiar memory_store.db enquanto está aberto
→ deixar qualquer agente editar memória fria
→ sincronizar banco vivo por OneDrive/Drive
```

### Arquitetura de memória em três estágios

#### Estágio A — arquivos canônicos + índice

```text
03-memoria\
├── quente\
├── morna\
├── fria\
├── ledger\
├── schemas\
├── indices\
└── exports\
```

- Markdown/JSON legível;
- ledger append-only;
- um escritor de memória por turno;
- leitores paralelos;
- promoção quente→morna→fria por evidência;
- Obsidian aponta para essa árvore como visão, sem copiar conteúdo.

#### Estágio B — serviço local de memória

- API local autenticada;
- fila de escrita;
- dedupe e proveniência;
- busca lexical e FTS;
- snapshots;
- healthcheck;
- export para Markdown.

#### Estágio C — SQL + vetor

- banco relacional para fatos, decisões, relações e ACL;
- vetor para recuperação semântica;
- objetos grandes fora do banco;
- migrações versionadas;
- backup e restore testados;
- opção de replicação para VPS/nuvem, sem expor memória pessoal completa.

### Regra de escrita

```text
PIVETE OBSERVA OU DECIDE
→ SOL CLASSIFICA
→ HERMES REGISTRA EM QUENTE
→ REVISOR VALIDA PROVENIÊNCIA
→ DESTILADOR PROPÕE PROMOÇÃO
→ GATE APROVA MORNA/FRIA
```

## 7. Worktrees e TEMP

### Convenção

```text
E:\CentralDark\<Perfil>\TEMP\worktrees\<repo>\<mission-id>\
```

Todo workspace precisa de:

```yaml
mission_id: ""
repository: ""
branch: ""
base_sha: ""
writer: ""
created_at: ""
last_activity_at: ""
dirty: false
pr: null
retention: ACTIVE|MERGED_24H|ARCHIVE|DELETE_CANDIDATE
```

### Limpeza

Uma worktree só vira `DELETE_CANDIDATE` quando:

1. PR mergeado ou missão cancelada registrada;
2. `git status` limpo;
3. commits alcançáveis no remoto ou bundle criado;
4. nenhuma referência ativa em scripts/processos;
5. artefatos úteis consolidados;
6. retenção mínima cumprida;
7. exclusão aprovada pelo Pivete ou política canônica aplicável.

## 8. Telegram

### Perfil único por token

Um token não pode ser consumido simultaneamente por dois gateways. Cada token deve ter ownership explícito:

```yaml
telegram_binding:
  bot_alias: ""
  profile: "pivete"
  mode: "polling|webhook"
  gateway_instance: ""
  allowed_users_source: ""
  allowed_chats_source: ""
  home_channel: ""
  thread_id: null
  last_e2e_proof: ""
```

### Fluxo de diagnóstico

```text
CLI DO MESMO PERFIL
→ GATEWAY DO MESMO PERFIL
→ CREDENCIAL PRESENTE SEM EXIBIR VALOR
→ ROTEAMENTO/ALLOWLIST
→ PROVIDER
→ LOG ATUAL
→ MENSAGEM REAL NO DESTINO EXATO
```

## 9. WebUI, Builder e Status

### `ui.centralldark.com`

Portal único para:

- chat operacional;
- perfis e modelos;
- estado da Casa/VPS;
- memória e Obsidian;
- Telegram/gateways;
- missões e PRs;
- observabilidade;
- autenticação e integrações.

### `builder.centralldark.com`

Fábrica visual para:

- projeto;
- chat de construção;
- preview ao vivo;
- alteração e comparação;
- teste;
- publicação;
- rollback.

### `status.centralldark.com`

Somente leitura pública/operacional limitada:

- disponibilidade;
- incidentes;
- versões publicadas;
- manutenção;
- nenhuma memória pessoal, segredo ou caminho interno.

## 10. Casa, GitHub e VPS

```text
CASA
→ identidade, memória pessoal, voz, telas, contexto e direção

GITHUB
→ código, decisões, contratos, PRs, checks e recuperação

VPS
→ serviços permanentes, Builder, APIs, workers, deploy e observabilidade empresarial
```

A VPS recebe somente o contexto mínimo da missão. Memória pessoal completa permanece na Casa, salvo decisão futura com criptografia, ACL, minimização e rollback.

## 11. Preparação para nuvem

Nuvem é fase posterior, não fuga da organização local.

Pré-requisitos:

- inventário fechado;
- estrutura local estável;
- backup/restore automatizado;
- criptografia em repouso e trânsito;
- ACL por classe de memória;
- sincronização sem conflito;
- operação offline;
- recuperação após perda de máquina;
- custo e retenção conhecidos.

## 12. Fórmula final

```text
PIVETE NO VOLANTE
+ SOL COMO COORDENADORA SUBSTITUÍVEL POR MODELO
+ HERMES AGENT COMO CORPO
+ HERMES ONE COMO JANELA
+ MEMÓRIA CANÔNICA COM ESCRITOR ÚNICO
+ PERFIS COMO PAPÉIS
+ TEMP DESCARTÁVEL
+ GITHUB COMO RASTRO
+ VPS COMO FÁBRICA
+ UI/BUILDER/STATUS SEM DUPLICIDADE
= MENTE ESTENDIDA CONTROLÁVEL E EVOLUTIVA
```
