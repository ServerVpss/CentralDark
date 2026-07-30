# 01 — MAPA ATUAL E LACUNAS

## 1. Leitura executiva

O sistema não está vazio nem começando do zero. Já existem identidade, memória em três temperaturas, perfis Hermes, observabilidade, cápsulas de sessão, WebUI, Builder, status público, automações no GitHub e documentação extensa.

O problema principal é outro:

```text
MUITAS PEÇAS ÚTEIS
+ CAMINHOS HISTÓRICOS
+ PERFIS E RUNTIMES EM LOCAIS DIFERENTES
+ TEMP/WORKTREES SEM CICLO ÚNICO
+ ESTADO LOCAL NÃO INVENTARIADO ATUALMENTE
= DIFICULDADE DE VER A DIREÇÃO E RISCO DE DUPLICIDADE
```

## 2. Territórios observados na Casa

### 2.1 Memória do NÚCLEO

**Fonte:** `OBSERVADO_PIVETE` + `CAPSULA_20260729`

```text
E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\
├── dados\
├── memoria\
├── schemas\
├── destilar-3-temp.sh
└── MEMORIA.md
```

Função pretendida: memória canônica compartilhada, com quente/morna/fria e artefatos legíveis por humano e máquina.

Lacunas a confirmar:

- consumidores reais de cada pasta;
- formatos e schemas ativos;
- qual processo escreve;
- existência de locks;
- existência de duplicatas em perfis Hermes;
- política de retenção e backup;
- compatibilidade Windows do `destilar-3-temp.sh`;
- integração atual com Obsidian, banco SQL ou vetor.

### 2.2 Observabilidade e cápsulas

**Fonte:** `OBSERVADO_PIVETE`

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO\
└── HERMES-SESSION-CAPSULE-20260729\
```

Também foi entregue a cápsula `SOL-SESSION-CAPSULE-20260729`, contendo missão, SOUL, protocolos, máquina de estados, segurança, métricas, padrões e manifesto SHA-256.

Achado importante da cápsula:

```text
PASTA_ATUAL=NENHUMA
SYMLINK_CRIADO=NAO
JUNCTION_CRIADA=NAO
PROFILE_CONFIG_CHANGED=NAO
HOME_WINDOWS_CHANGED=NAO
HERMES_UPDATED=NAO
FILES_DELETED=0
```

Conclusão: existe planejamento e evidência, mas a migração do perfil não foi concluída naquele estado.

### 2.3 Raiz Pivete

**Fonte:** `OBSERVADO_PIVETE`

```text
E:\CentralDark\Pivete\
├── _quarantine\
├── BACKUPS\
├── cache\
├── CentralDark\
├── config\
├── imagens\
├── inbox\
├── logs\
├── MARKDOWN\
├── NUCLEO\
├── scripts\
├── TEMP\
└── worktrees\
```

Lacuna: `TEMP` e `worktrees` coexistem; é preciso classificar o que é workspace ativo, cache, saída, backup ou lixo antes de consolidar.

### 2.4 Raiz CentralDark

**Fonte:** `OBSERVADO_PIVETE`

Foram observados:

- `.claude`;
- `Pivete`;
- `Sol`;
- `vault`;
- `obsidian-app`;
- `backups`;
- múltiplos `.md`, `.txt`, `.zip`, screenshots, instaladores e artefatos históricos soltos na raiz;
- `worktrees` dentro de `Pivete` e referências a worktrees em outras rotas.

Classificação provisória:

| Classe | Exemplos | Destino futuro |
|---|---|---|
| canônico | `Pivete`, `Sol`, `vault` | preservar e mapear |
| aplicativo/runtime | instaladores, Open Lovable, Hermes | `Hermes` ou `Apps` após inventário |
| pacote de recuperação | ZIPs consolidados | `BACKUPS` com manifesto |
| evidência | screenshots e relatórios | observabilidade/arquivo |
| temporário | worktrees, clones de missão, saídas intermediárias | TEMP com TTL |
| desconhecido | arquivos sem consumidor identificado | quarentena, nunca exclusão direta |

## 3. Hermes local observado

### 3.1 Raiz do Hermes

**Fonte:** `OBSERVADO_PIVETE`

```text
C:\Users\danda\AppData\Local\hermes\
```

Foram observados arquivos e bancos como:

- `config.yaml`;
- `desktop.json`;
- `gateway_state.json`;
- `model-definitions.json`;
- `models.json`;
- `projects.db`;
- `state.db`, `state.db-shm`, `state.db-wal`;
- `verification_evidence.db`;
- `SOUL.md`;
- runtime/instalador do Hermes.

Nenhum banco deve ser movido ou compartilhado antes de identificar processo proprietário, modo WAL, shutdown limpo, compatibilidade de versão e rollback.

### 3.2 Perfis

**Fonte:** `OBSERVADO_PIVETE`

```text
C:\Users\danda\AppData\Local\hermes\profiles\
├── claude\
├── pivete\
├── sol\
└── teste\
```

O perfil `sol` já existe. Portanto:

```text
CRIAR_NOVO_PERFIL_SOL=NAO
INVENTARIAR_PERFIL_SOL_EXISTENTE=SIM
```

No perfil `sol` foram observados diretórios de cache, cron, gateway, home, hooks, logs, memories, sessions, skills, state, workspace e arquivos de auth/config. Isso indica perfil funcional ou parcialmente configurado, mas não prova que está ativo, saudável ou alinhado ao perfil `pivete`.

### 3.3 Estado registrado na cápsula

**Fonte:** `CAPSULA_20260729`

```text
PROFILE_NAME=pivete
PROFILE_HOME=C:\Users\danda\AppData\Local\hermes\profiles\pivete
HERMES_VERSION=0.19.0
HERMES_BUILD_DATE=2026.7.20
GATEWAY_AT_PROOF=running
SKILLS_AT_PROOF=106
```

Esses dados eram válidos no instante da captura e precisam ser reconfirmados.

## 4. Hermes Agent e Hermes One

### Hermes Agent

**Fonte:** `OFICIAL_UPSTREAM`

É o motor Python que executa modelos, ferramentas, memória, sessões, skills, cron e gateways.

### Hermes One

**Fonte:** `OFICIAL_UPSTREAM`

É uma aplicação Electron/React que usa Hermes Agent como backend local ou remoto. A documentação oficial informa que a GUI trabalha sobre o mesmo layout `HERMES_HOME` e não substitui o motor.

Decisão provisória:

```text
HERMES_AGENT=MOTOR
HERMES_ONE=INTERFACE
USAR_OS_DOIS=SIM_SE_MESMO_RUNTIME_E_MESMO_PERFIL_FOREM_PROVADOS
INSTALAR_DOIS_MOTORES_CONCORRENTES=NAO
```

## 5. Telegram e gateway

### O que o repositório já tem

**Fonte:** `CONFIRMADO_REPO`

- árvore `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/`;
- rotas e aprendizados de Telegram;
- módulos de notificação, WebUI, MCP, Hub e bridge Hermes;
- regra de status que distingue canal privado do admin e canal público.

### Falhas que precisam ser testadas na Casa

**Fonte:** `OFICIAL_UPSTREAM` + relato do Pivete

1. CLI funciona no perfil correto?
2. Gateway ativo pertence ao mesmo perfil editado?
3. Existe polling duplicado usando o mesmo token?
4. `allowed_users`, `allowed_chats`, privacy mode, mention e topic/thread estão coerentes?
5. O provider responde ou está sem crédito/rate limit?
6. Logs atuais são do processo atual ou arquivo antigo?
7. Uma mensagem real no destino exato recebe resposta?

A prova mínima de correção será:

```text
hermes doctor
+ hermes chat -q "reply ok"
+ hermes gateway status
+ logs sem erro atual
+ mensagem real no Telegram respondida no chat/tópico exato
```

Dashboard verde ou `getMe` isolado não encerra incidente.

## 6. Superfícies Web já observadas

**Fonte:** `OBSERVADO_PIVETE`

| Superfície | Papel pretendido | Estado relatado |
|---|---|---|
| `ui.centralldark.com` | portal/hub operacional | online; precisa acertos |
| `builder.centralldark.com` | fábrica e edição visual de sites | online; precisa aprimorar |
| `status.centralldark.com` | status e observabilidade externa | manter; resolver depois |

Regra de deduplicação:

```text
UI=OPERAR
BUILDER=CRIAR_E_PUBLICAR
STATUS=OBSERVAR
```

Não criar nova página para uma função que cabe claramente em uma dessas três.

## 7. GitHub e VPS

**Fonte:** `CONFIRMADO_REPO`

O repositório já contém:

- plano mestre Casa/VPS/Builder;
- boot universal de IAs;
- contrato Jarvis em delta e escritor único;
- Sentinela com comparação GitHub↔VPS;
- Hub, WebUI, Builder, módulos Hermes, MCP e observabilidade;
- CI e gates determinísticos.

Lacunas:

- estado local da Casa não é automaticamente conhecido pelo GitHub;
- o próximo inventário local precisa gerar artefato sanitizado, não dump de segredos;
- upstream Hermes muda rapidamente e não deve ser incorporado por atualização automática cega;
- VPS, Casa e GitHub precisam usar o mesmo identificador de missão e versão de contrato.

## 8. Lacunas prioritárias

| ID | Lacuna | Risco | Primeira prova |
|---|---|---|---|
| L01 | inventário local atual incompleto | mover consumidor vivo | coletor read-only sanitizado |
| L02 | raízes Hermes espalhadas | estado dividido | mapa de `HERMES_HOME`, runtime e processos |
| L03 | perfil `pivete` e `sol` sem relação formal | memória divergente | diff de config/consumidores, sem segredos |
| L04 | desejo de memória comum vs bancos isolados | corrupção/conflito | contrato de memória com escritor único |
| L05 | worktrees e TEMP sem lifecycle único | lixo e confusão | inventário por idade, branch e dirty state |
| L06 | Telegram pode parecer conectado sem responder | falso verde | smoke end-to-end no destino exato |
| L07 | Hermes Agent/Hermes One podem resolver runtimes diferentes | comportamento inconsistente | prova de executável/backend/HERMES_HOME |
| L08 | páginas e módulos podem duplicar função | manutenção tripla | mapa de capacidades UI/Builder/Status |
| L09 | memória futura SQL/vetorial sem esquema canônico | lock-in e duplicidade | ADR + schema + migração reversível |
| L10 | nuvem antes da estabilidade local | perda de controle | backup/restore e operação offline provados |

## 9. O que não será feito na Fase 0

- desinstalar Hermes;
- reinstalar Hermes Agent ou Hermes One;
- mudar `HERMES_HOME`;
- mover `%LOCALAPPDATA%`;
- criar junction/symlink;
- copiar `state.db` entre perfis;
- apagar worktree;
- rotacionar token Telegram;
- reiniciar gateway;
- alterar PM2/VPS;
- disparar atualização upstream;
- promover arquivo observado a canônico sem revisão.
