# CentralDark Instinto Superior — Inventário para OS Agêntico e Kernel Próprio

**Estado:** RASCUNHO / PROTÓTIPO FUTURO  
**Branch:** `prototype/centraldark-instinto-superior-os`  
**Base:** `main`  
**Regra:** `ONE_SYSTEM_ONLY=true` · `REUSE_BEFORE_CREATE=true` · `UNKNOWN != PASS` · `SOURCE != RUNTIME` · `DOCUMENTED != EXECUTED`

## 1. Intenção

Construir a linha de pesquisa e protótipo para o **CentralDark Instinto Superior** como sistema agêntico de presença dupla:

1. **CentralDark Desktop** — aplicativo empacotável que roda no Windows/macOS/Linux, usando a base existente.
2. **CentralDark OS Edition** — imagem bootável instalável em HD/SSD/notebook, inicialmente sobre substrato Linux/bootc/imutável.
3. **CentralDark Native Kernel** — trilha longa de kernel próprio, sem declarar runtime pronto antes de boot, drivers, rede, UI e update/rollback comprovados.

O objetivo não é copiar estado bruto de usuário nem chamar um app de OS. O objetivo é inventariar o que já existe, separar o que falta e impedir falso-verde.

## 2. Princípio de arquitetura

```text
UM CÉREBRO / DOIS TARGETS

CentralDark Core
  ├─ Desktop/App Target
  └─ OS Bootable Target

Kernel/Substrato é camada de execução.
CentralDark Core é contrato, política, memória, agentes, tools, receipts e Reality Judge.
```

Não criar V2/V3/V4. A versão OS deve reaproveitar o mesmo core, mesmos contratos, mesmos owners e mesmos receipts.

## 3. Inventário do que já existe

### 3.1 Core lógico e gates

| Setor | Evidência existente | Estado |
|---|---|---|
| TLC23 / Horn / Fixed Point | Método lógico canônico usado como gate | PROVADO CONCEITUALMENTE |
| Meta-Lupa | Owner de visão, interpretação e coerência | EXISTE |
| Multibússola | Eixos forward/reverse/round-trip/adversarial | EXISTE |
| Reality Judge | Regra de prova material | EXISTE |
| Claim Seals / Receipts | Amarra claim a prova, SHA e escopo | EXISTE |
| Master Cycle | Existe, mas pode divergir da cadeia universal completa | GAP DE BINDING |

### 3.2 Desktop / App / Electron

| Setor | Caminho/forma | Estado |
|---|---|---|
| Aplicação Desktop | `apps/modulos/Bolt/source` | EXISTE |
| Stack | Remix + React + Vite + Electron | EXISTE |
| Electron main/preload/renderer | `apps/modulos/Bolt/source/electron/*` | EXISTE |
| Build Windows | scripts `electron:build:win` / `centraldark:build:win` | EXISTE |
| Build Linux/macOS | scripts Electron correspondentes | EXISTE |
| Teste de contrato Desktop | `scripts/centraldark-desktop-contract.test.mjs` | EXISTE |
| Saída instalável | `dist/` / setup conforme build | RUNTIME A MEDIR |

### 3.3 Remote Tray / Remote Bridge

| Setor | Evidência/uso | Estado |
|---|---|---|
| Remote Desktop Commander | device auth, `/device/verify`, código, sessão persistida | PARCIALMENTE PROVADO |
| Tray local | pacote `CentralDark-Remote-Tray-PACOTAO-FINAL` | EXISTE COMO PACOTE |
| Menu operacional | estado, login, log, receipt, reconectar | EXISTE |
| Go EXE | `CentralDark-Remote-Tray.exe` e build Go | EXISTE HISTÓRICO |
| Multi-conta | perfis isolados exigidos | PARCIAL / A MEDIR |
| VPS persistente | systemd/watchdog desejado | A MEDIR |

### 3.4 Hermes / Runtime de execução

| Setor | Estado |
|---|---|
| Hermes como executor | CANÔNICO |
| `apps/modulos/HERMES-CORE` | EXISTE |
| Gateway local/VPS | EXISTE / A REMEDIR |
| Health Hermes | A MEDIR NO RUNTIME ATUAL |
| Hermes empacotado dentro do Desktop/OS | UNKNOWN |
| Provider/model bindings | A MEDIR |

### 3.5 MCP / Gateway / Hub

| Setor | Estado |
|---|---|
| MCP CentralDark | EXISTE |
| Admin/HUB | EXISTE |
| OAuth CentralDark | EXISTE / A MEDIR |
| Catálogo de tools | EXISTE HISTÓRICO |
| Webhooks / cron / systemd / PM2 | EXISTEM COMO PEÇAS |
| Uma API / um MCP / um site / uma intenção | REGRA CANÔNICA |

### 3.6 Screenpipe / visão local

| Setor | Estado |
|---|---|
| Screenpipe como sensor local | EXISTE |
| Browser bridge/extensão | EXISTE HISTÓRICO |
| Captura/contexto | A MEDIR |
| Papel no OS | sensor opcional local, não fonte canônica sozinho |

### 3.7 VPS / Deploy / Operação

| Setor | Estado |
|---|---|
| VPS `/root/CentralDark` | EXISTE |
| SSH alias `segredo-vpss` | PROVADO NA TELA DO CHEFE |
| Fallback Tailscale | ROTA CONHECIDA |
| `scripts/vps/centraldark-deploy.sh` | EXISTE |
| Deploy repo-wide com guards | EXISTE |
| Runtime total após deploy | NÃO PROVADO |
| Site público atualizado | UNKNOWN |

### 3.8 Memória / GitHub / Obsidian / Drive

| Setor | Estado |
|---|---|
| GitHub como fonte/proveniência | CANÔNICO |
| Obsidian/Drive como espelho/memória | EXISTE / REQUER HASH |
| Sincronização bidirecional perfeita | NÃO PROVADA |
| `.codex`, `.claude`, `.hermes`, caches locais | NÃO COPIAR BRUTO COMO OS |
| Estado portátil sanitizado | A DEFINIR |

## 4. Kernel próprio: inventário real de camadas ausentes

Para um **kernel nativo próprio**, ainda faltam camadas fundamentais:

| Camada | Estado atual |
|---|---|
| UEFI / bootloader | MISSING |
| Inicialização de CPU / interrupções | MISSING |
| Gerenciamento de memória física | MISSING |
| Memória virtual / paginação | MISSING |
| Scheduler | MISSING |
| Processos / threads | MISSING |
| Syscalls | MISSING |
| IPC | MISSING |
| Filesystem | MISSING |
| Storage / NVMe / SATA / USB storage | MISSING |
| PCIe / USB | MISSING |
| Rede / Wi-Fi | MISSING |
| Áudio | MISSING |
| Input: teclado/mouse/touch | MISSING |
| Display / GPU / compositor | MISSING |
| Segurança / permissões / isolamento | MISSING |
| Loader de userspace | MISSING |
| Package/update manager | MISSING |
| Installer para HD/SSD | MISSING |
| Recovery / rollback | MISSING |
| Matriz de hardware real | MISSING |

Conclusão: **kernel próprio é trilha de pesquisa longa**, não bootstrap imediato.

## 5. Caminho profissional sem falso-verde

### Fase A — Desktop/App empacotável

```text
CentralDark Core + Electron + Hermes/MCP/Tray/Sensor
→ build local
→ teste
→ receipt
→ instalador
```

### Fase B — OS Edition bootável com substrato Linux

```text
CentralDark Core
→ imagem bootável Linux/bootc/imutável
→ QEMU boot PASS
→ install-to-disk virtual PASS
→ reboot PASS
→ UI PASS
→ Hermes/MCP health PASS
→ update PASS
→ rollback PASS
```

### Fase C — Native Kernel

```text
kernel skeleton
→ boot em QEMU
→ serial log
→ memória
→ interrupções
→ scheduler
→ userspace mínimo
→ filesystem
→ rede
→ compositor
→ CentralDark runtime portado
```

## 6. Gates TLC23 para declarar PASS

```text
PDF/TLC23_GATE_PASS
+ SOURCE_TREE_MEASURED
+ BUILD_PASS
+ BOOT_PASS
+ UI_VISIBLE
+ HERMES_HEALTH_PASS
+ MCP_HEALTH_PASS
+ REMOTE_OR_LOCAL_CONTROL_PASS
+ UPDATE_PASS
+ ROLLBACK_PASS
+ RECEIPT_SHA_MATCH
=> CENTRALDARK_OS_MVP_PASS
```

Sem todos os fatos materiais, o estado permanece `EVIDENCIA_FALTANTE`.

## 7. O que não entra como prova

```text
PR bonito != prova
Prompt matemático != runtime
Zip de perfil de usuário != OS
Copiar .codex bruto != produto portátil
EXE_EXISTS != DEVICE_ONLINE
BUILD_SUCCESS != BOOT_SUCCESS
BOOT_SUCCESS != DAILY_DRIVER
SOURCE != RUNTIME
UNKNOWN != PASS
```

## 8. Slogan técnico

**CENTRALDARK INSTINTO SUPERIOR — EXPANSÃO DE DOMÍNIOS**

Sistema agêntico de presença dupla: aplicativo quando convém, ambiente bootável quando precisa dominar a máquina inteira, sempre com um único core e Reality Judge.

## 9. Vault Cofre e Bootstrap — Capacidade Operacional

**Adicionado:** 2026-09-30 | **Owner:** `scripts/vps/` | **PR-mãe:** #1562

### 9.1 Conceito

```text
GitHub = cérebro canônico (código, contratos, skills, receipts)
VPS    = corpo vivo (runtime, PM2, secrets espalhados, MCP, processos)
Vault  = pacote separado (snapshot de estado VPS, dedupado, sem lixo)
Bootstrap = instalador/restaurador (usa install.sh + vault para reerguer)
Instinto Superior = painel-mãe futuro (inventário, rotação, restore, provedores)
```

### 9.2 Scripts criados

| Script | Função | Modo |
|---|---|---|
| `scripts/vps/centraldark-vault-bootstrap-inventory.sh` | Varredura VPS → vault empacotado `.tar.gz` | Executável, nunca apaga origem, nunca imprime segredo |
| `scripts/vps/centraldark-os-bootstrap-restore.sh` | Valida vault + canonical files, restaura se autorizado | READONLY por padrão, APPLY via env var |

### 9.3 Vault gera

```text
/root/Vault-Cofre-CentralDark-<UTC>/
├── raw/                    (arquivos com secret pattern, dedupados por SHA256)
├── process-env/            (env vars de processos relevantes filtrados)
├── inventory/              (secret-map sources se existentes)
├── MANIFEST.tsv            (idx, sha256, kind, source, dest, bytes)
├── SHA256SUMS.txt          (checksum de todos os arquivos do vault)
├── DEDUP_SHA_COUNTS.txt    (contagem de duplicatas por SHA)
├── BOOTSTRAP-NEXT.env      (config para restauração)
└── README.txt              (metadados da geração)
→ empacota em .tar.gz + .tar.gz.sha256
```

### 9.4 Restore valida

```text
1. Localiza vault (path explícito ou BOOTSTRAP-NEXT.env ou mais recente)
2. Valida SHA256 do archive
3. Valida presença de canonical files (install.sh, CENTRALDARK_AI_BOOT.yaml, LEIA-ME-IA.md, AGENTS.md)
4. BOOTSTRAP_APPLY=1 → roda install.sh --check
5. RESTORE_APPLY=1 → restauração futura (não implementada, requer validação manual)
6. Emite receipt sem segredo
```

### 9.5 Painel Instinto Superior — mesmo ciclo, owner administrativo mãe

O **Instinto Superior** entra no mesmo ciclo do bootstrap/rebuild. Não é pendência futura separada. Ele é a superfície administrativa mãe que consolida as capacidades já existentes por API/MCP, sem duplicar owners.

Capacidades obrigatórias no mesmo plano:

- inventário de Vault/Cofre e estado do bootstrap;
- CPU, RAM, disco, processos, PM2, portas e health;
- estado dos agentes, filas, missions e receipts;
- Contabo via provider owner existente: instância, snapshots, rollback/reinstall e estado;
- Cloudflare via provider owner existente: zona, DNS, estado e rotação/control plane;
- credenciais por nome/owner, sem exibir valor bruto por padrão;
- ações de rotação/rebind/restauração com confirmação e receipt;
- status GitHub/main/PR/deploy;
- CentralDark-OS: versão, build, boot, update e rollback;
- acesso local e remoto pela mesma superfície administrativa.

```text
PAINEL_INSTINTO_SUPERIOR_UI=SAME_CYCLE_REQUIRED
PRIMARY_ADMIN_SURFACE=INSTINTO_SUPERIOR
CONTABO_DIRECT_PANEL_REQUIRED_FOR_DAILY_OPERATION=false
CLOUDFLARE_DIRECT_PANEL_REQUIRED_FOR_DAILY_OPERATION=false
PROVIDER_ACTIONS_ROUTE=CentralDark_API_MCP_ADMIN
VAULT_INVENTORY_ROUTE=INSTINTO_SUPERIOR
RUNTIME_TELEMETRY_ROUTE=INSTINTO_SUPERIOR
CREDENTIAL_ROTATION_ROUTE=INSTINTO_SUPERIOR
ONE_SYSTEM_ONLY=true
```

## 10. Plano de execução completo — mesmo ciclo

```text
GATE_A_VAULT
→ sincronizar scripts já promovidos em main para a VPS sem apagar dirty tree
→ executar centraldark-vault-bootstrap-inventory.sh
→ validar archive + SHA256 + manifest

GATE_B_PROVIDERS
→ Contabo READ
→ Cloudflare READ
→ CentralDark Admin/MCP READ
→ GitHub READ
→ registrar capabilities e bindings

GATE_C_RECOVERY
→ confirmar snapshot atual
→ confirmar rota de rollback
→ registrar receipt antes de qualquer reinstalação

GATE_D_VPS_RECONCILIATION
→ preservar dirty tree atual
→ separar runtime útil de lixo/caches/backups antigos
→ não fazer git reset/clean cego
→ costurar somente o delta necessário

GATE_E_CENTRALDARK_OS_INSTALL
→ usar openKylin como substrato técnico
→ instalar/reinstalar CentralDark-OS
→ retirar branding/nome/logo/splash/wallpaper/tema openKylin da superfície visível
→ preservar proveniência técnica interna quando necessária
→ instalar CentralDark core pelo install.sh/owners existentes

GATE_F_VAULT_RESTORE
→ restaurar somente ouro inventariado
→ rebind providers, bots, MCP, runtime e integrações
→ dedupe por owner/hash
→ testar autenticação sem imprimir valores

GATE_G_INSTINTO_SUPERIOR
→ habilitar painel mãe no mesmo ciclo
→ inventário Vault/Bootstrap
→ CPU/RAM/disco/processos/PM2/ports
→ agentes/missions/receipts
→ Contabo API
→ Cloudflare API
→ credenciais/rotação
→ snapshots/rollback/reinstall
→ GitHub/deploy/runtime health
→ CentralDark-OS status

GATE_H_FIXED_POINT
→ boot PASS
→ rede PASS
→ MCP PASS
→ Hermes/agents PASS
→ Instinto Superior PASS
→ provider ping-pong PASS
→ restore/readback PASS
→ rollback route PASS
→ receipt no PR #1713
→ âncora no PR-mãe #1562
```

Regra de continuidade:

```text
NO_WAIT_FOR_SEPARATE_FUTURE_PHASE=true
DIRTY_TREE=PRESERVE_AND_RECONCILE
NO_BLIND_RESET=true
NO_BLIND_CLEAN=true
MAIN_SCRIPT_EXISTS != VPS_SCRIPT_PRESENT
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
UNKNOWN != PASS
```

Estado material atual:

- scripts Vault/Bootstrap já existem em `main`;
- VPS ainda está atrás da `main` e com dirty tree material, portanto pull/reset cego é proibido;
- Gate B está provado para providers conforme receipt atual do PR;
- snapshot existe; rollback precisa ser provado pelo caminho de recuperação antes da reinstalação;
- Instinto Superior é parte do mesmo ciclo, não backlog futuro.


1. Medir `main` atual e owners existentes.
2. Transformar este inventário em matriz viva JSON.
3. Executar vault inventory na VPS (`sudo bash scripts/vps/centraldark-vault-bootstrap-inventory.sh`).
4. Validar vault com restore readonly.
5. Criar launcher de preview Desktop sem declarar OS.
6. Criar plano OS Edition bootável em QEMU.
7. Só abrir trilha Native Kernel após PASS da OS Edition mínima.

```text
KERNEL_PROPRIO=TRILHA_FUTURA
OS_BOOTABLE_MVP=PROXIMO_ALVO_REALISTA
DESKTOP_PACKAGING=ALVO_IMEDIATO
VAULT_COFRE=SCRIPTS_CRIADOS_EXECUCAO_PENDENTE
BOOTSTRAP_RESTORE=READONLY_VALIDADOR_PRONTO
ONE_SYSTEM_ONLY=true
REALIDADE=JUIZ
```


## 11. Identidade de produto — base openKylin sem vínculo visual

**Decisão do CHEFE:** openKylin pode permanecer como substrato/base técnica durante a transformação, mas não é a identidade exibida do produto final.

```text
BASE_TECHNICAL_SUBSTRATE=openKylin
USER_VISIBLE_OS_NAME=CentralDark-OS
PRIMARY_PRODUCT_SURFACE=Instinto Superior
OPENKYLIN_USER_VISIBLE_BRANDING=REMOVE
OPENKYLIN_USER_VISIBLE_NAME=REMOVE
OPENKYLIN_LOGOS_THEMES_WALLPAPERS_SPLASH=REPLACE
UPSTREAM_PROVENANCE_MAY_REMAIN_IN_INTERNAL_TECHNICAL_METADATA=true
ONE_SYSTEM_ONLY=true
```

Na fase de instalação/empacotamento:

- substituir nome, logo, splash, wallpaper, tema, launcher, metadados visuais e textos apresentados ao usuário por identidade CentralDark;
- não declarar que o kernel/base técnica deixou de ser openKylin enquanto isso não tiver sido materialmente substituído;
- preservar apenas a proveniência técnica necessária internamente;
- o usuário final deve ver **CentralDark-OS / Instinto Superior**, não openKylin;
- qualquer renomeação deve ser seguida por boot/readback para garantir que serviços e dependências não quebrem.

```text
OPENKYLIN_BASE != OPENKYLIN_PRODUCT_IDENTITY
SUBSTRATE_PRESERVED_WHILE_USEFUL
PRODUCT_IDENTITY=CENTRALDARK
DOCUMENTED_REBRAND != RUNTIME_REBRAND
```


## 12. Plano completo de execução — FASE 2 CentralDark-OS

**Estado de entrada medido em 2026-09-30:** PR #1713 aberto/draft, HEAD `275695d83d14abce9fa2a77354f69bfb8a953388`, base `main@90e2849ec3b84c9f4f7154e0043fc0ce9425c4a7`, mergeable=true. Falhas CI conhecidas/reproduzidas na base não devem ser confundidas com regressão deste escopo.

### 12.1 Objetivo

Transformar a VPS atual em **CentralDark-OS / Instinto Superior**, reaproveitando openKylin apenas como substrato técnico inicial, preservando o cérebro canônico no GitHub, restaurando somente o ouro operacional necessário e eliminando dependência de lixo/backups/caches antigos.

```text
CURRENT_VPS
→ VAULT_PROVADO
→ PROVIDERS_PROVADOS
→ SNAPSHOT_ROLLBACK_GATE
→ CENTRALDARK_OS_IMAGE_OR_INSTALL_PATH
→ REBRAND_USER_VISIBLE
→ CLEAN_INSTALL
→ RESTORE_GOLD_ONLY
→ HYDRATE_PROVIDERS
→ START_RUNTIME
→ PING_PONG
→ INSTINTO_SUPERIOR
→ COUNTERPROOF
→ RECEIPTS
→ FIXED_POINT
```

### 12.2 Fase A — Vault atual

1. Executar `scripts/vps/centraldark-vault-bootstrap-inventory.sh` na VPS.
2. Gerar `Vault-Cofre-CentralDark-<UTC>.tar.gz` + SHA256 + MANIFEST.
3. Confirmar dedupe por SHA256.
4. Confirmar que caches, backups repetidos, node_modules, logs e artefatos históricos não entram como ouro.
5. Fazer readback de contagem, tamanho, hash e caminhos; não imprimir valores.
6. Copiar o pacote para uma segunda superfície autorizada quando disponível (PC/Drive), sem transformar espelho em source of truth.

**Gate A:** `VAULT_READY=1 + SHA256_MATCH + MANIFEST_READBACK`.

### 12.3 Fase B — Providers e controle externo

Medir pelos owners existentes, sem criar cliente paralelo:

- CentralDark Admin API / MCP Admin;
- Contabo: autenticação, instance identity, snapshots, reinstall/custom image, VNC, rescue, rollback;
- Cloudflare: token válido, zone/account atual, DNS/tunnel necessários;
- GitHub: repo/main/current child;
- Tailscale/SSH como rota adicional quando existir.

Reusar:
- `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js`
- `apps/modulos/oauth-broker/server.mjs`
- `scripts/vps/hydrate-provider-secrets.sh`
- `scripts/cloudflare/cf-sync.sh`
- `install.sh`

**Gate B:** acesso ao provider provado + VPS/instance exata provada + Cloudflare readback provado.

### 12.4 Fase C — Snapshot / rollback antes da mutação destrutiva

Antes de reinstalar:

1. listar snapshot/backup CURRENT;
2. criar snapshot novo se a rota permitir;
3. reler snapshot por ID/status;
4. provar rota de recuperação: snapshot restore/rollback disponível e VNC/rescue acessíveis;
5. registrar LAST_GOOD_STATE e receipt.

```text
NO_PROVEN_RECOVERY → NO_REINSTALL
WRONG_INSTANCE_UNKNOWN → NO_REINSTALL
VAULT_HASH_FAIL → NO_REINSTALL
```

**Gate C:** snapshot recuperável + rota VNC/rescue + instance exact match + Vault Gate A.

### 12.5 Fase D — Completar bootstrap/restore antes da instalação

Evoluir `scripts/vps/centraldark-os-bootstrap-restore.sh` no mesmo owner:

- manter READONLY como default;
- implementar restauração real somente com `CENTRALDARK_RESTORE_APPLY=1`;
- restaurar por inventário/allowlist, nunca copiar vault bruto inteiro para o sistema;
- reaproveitar `hydrate-provider-secrets.sh` para hidratação de providers;
- reaproveitar `install.sh` como instalador central;
- adicionar receipts por etapa;
- rollback local para cada etapa reversível.

**Gate D:** dry-run/readonly PASS + restore logic testada em ambiente não destrutivo.

### 12.6 Fase E — Preparar identidade CentralDark-OS

Base técnica inicial: openKylin.

Antes do rollout final, substituir superfície visível:
- nome do SO;
- logos;
- splash/boot visual;
- wallpapers;
- tema;
- launcher/menu;
- textos de produto;
- identidade do painel.

```text
USER_VISIBLE_OS_NAME=CentralDark-OS
PRIMARY_PRODUCT_SURFACE=Instinto Superior
OPENKYLIN_USER_VISIBLE_BRANDING=REMOVE
UPSTREAM_PROVENANCE_INTERNAL=KEEP_WHILE_TRUE
```

Nunca falsificar a base técnica: enquanto kernel/substrato ainda derivar de openKylin, isso permanece como provenance interna.

### 12.7 Fase F — Prova em ambiente não destrutivo

Usar CENTRALDARK-OS convidado/lab ou outra superfície isolada quando disponível:

1. instalar/bootstrap;
2. reboot;
3. login/controle remoto;
4. MCP health;
5. Hermes health;
6. Instinto Superior acessível;
7. providers read-only;
8. restore de amostra/estrutura;
9. rebrand visível;
10. reboot novamente.

**Gate F:** boot + runtime + providers + UI + second reboot PASS.

### 12.8 Fase G — Reinstalação limpa da VPS

Somente após Gates A–F aplicáveis verdes:

1. congelar receipt do estado anterior;
2. confirmar novamente instance exata;
3. iniciar reinstalação pelo provider/Contabo;
4. usar imagem/rota CentralDark-OS preparada;
5. acompanhar por provider/VNC;
6. confirmar boot novo;
7. não copiar árvore antiga inteira.

O CHEFE já autorizou a transformação/reinstalação deste alvo; não re-perguntar por micro-etapas quando os gates acima estiverem provados. Se algum gate divergir, parar apenas no ponto causal e manter o resto preparado.

### 12.9 Fase H — Restaurar somente o ouro

Depois do boot novo:

- clonar/sincronizar `ServerVpss/CentralDark@main`;
- carregar owners canônicos;
- instalar via `install.sh`;
- restaurar Vault por allowlist;
- hidratar providers por owner existente;
- restaurar apenas configurações/runtime realmente usados;
- não restaurar caches, backups antigos, worktrees velhas, logs históricos, `node_modules`, builds e lixo de diagnóstico.

### 12.10 Fase I — Subir runtime

Subir e medir:

- CentralDark MCP/Admin;
- OAuth broker;
- Hermes;
- PM2/systemd owners;
- bots necessários;
- memória/knowledge services;
- Cloudflare;
- Tailscale/SSH quando aplicável;
- Instinto Superior.

```text
EXISTS != RUNNING
RUNNING != HEALTHY
HTTP_200 != WHOLE_SYSTEM_PASS
```

### 12.11 Fase J — Ping-pong e contraprova

Provar ida e volta:

- GitHub → VPS;
- VPS → GitHub receipt;
- Casa → VPS quando Casa estiver disponível;
- CentralDark API → provider;
- provider → readback;
- Cloudflare DNS/tunnel → endpoint;
- Instinto Superior → owner → runtime → receipt.

Contraprovas mínimas:
- reiniciar serviço crítico e conferir recovery;
- reboot da VPS e conferir autostart;
- confirmar que openKylin não aparece como identidade visível;
- confirmar que secrets não foram parar em GitHub/logs;
- confirmar que Vault não virou segundo source of truth.

### 12.12 Fase K — Instinto Superior como painel-mãe

Evoluir owner existente do painel/admin para expor, inicialmente read-only:

- Inventário;
- Vault;
- Bootstrap;
- Providers;
- Contabo;
- Cloudflare;
- GitHub;
- Runtime/PM2;
- Rotação de credenciais;
- Backup/snapshot;
- Receipts.

Não criar painel paralelo. Reusar a superfície Instinto Superior existente.

### 12.13 Fase L — Rotação pós-online

Depois de CentralDark-OS ONLINE e painel funcional:

- inventariar credenciais ativas;
- identificar duplicatas/obsoletas;
- rotacionar provider por provider;
- atualizar o Vault canônico;
- invalidar credenciais antigas;
- receipt sem valor de segredo.

### 12.14 Fixed Point

```text
VAULT_PROVEN
+ RECOVERY_PROVEN
+ CLEAN_INSTALL_PROVEN
+ CENTRALDARK_OS_BOOT_PROVEN
+ USER_VISIBLE_REBRAND_PROVEN
+ CORE_RUNTIME_PROVEN
+ PROVIDERS_PROVEN
+ INSTINTO_SUPERIOR_PROVEN
+ REBOOT_RECOVERY_PROVEN
+ NO_SECRET_IN_GIT_PROVEN
+ RECEIPT_1713
+ RECEIPT_1562
=> CENTRALDARK_OS_MVP_FIXED_POINT
```

### 12.15 Execução contínua do agente cloud

O agente que acompanha PR #1713 deve tratar novos commits/receipts compatíveis como continuação deste mesmo fio.

```text
MONITOR_1713
→ READ_CURRENT_HEAD
→ READ_THIS_PLAN
→ EXECUTE_NEXT_UNPROVEN_PHASE
→ TEST
→ COUNTERPROVE
→ COMMIT_MINIMUM_DELTA
→ RECEIPT_1713
→ ANCHOR_1562
→ CONTINUE
```

Não repetir trabalho já provado. Não transformar CI base preexistente em blocker deste escopo sem nexo causal. Não declarar formato/reinstalação concluídos antes da prova material do provider/runtime.


## 13. Medição Fase B — Providers e controle externo

**Medido em:** 2026-09-30T09:42Z | **Superfície:** Claude Code Remote via MCP Admin | **HEAD:** `e6b7fd70a9`

### 13.1 Credenciais — status por provider

| Provider | Credencial | Status |
|---|---|---|
| Cloudflare | `CLOUDFLARE_API_TOKEN` | CONFIGURED |
| Contabo | `CONTABO_CLIENT_ID` | PROVEN (auth via Casa PowerShell) |
| Contabo | `CONTABO_CLIENT_SECRET` | PROVEN (auth via Casa PowerShell) |
| Contabo | `CONTABO_API_USER` | PROVEN (auth via Casa PowerShell) |
| Contabo | `CONTABO_API_PASSWORD` | PROVEN (auth via Casa PowerShell) |
| Tailscale | `TAILSCALE_API_KEY` | CONFIGURED |
| Buildkite | `BUILDKITE_API_TOKEN` | CONFIGURED |

### 13.2 Cloudflare — readback provado

```text
ZONE=centralldark.com
ZONE_ID=6986cded70ab6bec23a765496807b614
STATUS=active
PLAN=Free Website
NAMESERVERS=cruz.ns.cloudflare.com, isaac.ns.cloudflare.com
ACCOUNT_ID=07710ec11bbd46fad5c16513e45ccbd9
REGISTRAR=INWX GmbH (id: 1420)
PERMISSIONS=zone:read, zone_settings:read, dns_records:edit, dns_records:read
CREATED=2026-06-03
DNS_RECORDS_COUNT=16
ALL_PROXIED=true
HTTP_STATUS=200
PROVIDER_READ=PASS
```

DNS records medidos (16 A records, todos proxied via Cloudflare):

| Subdomínio | Tipo | Proxied | Criado |
|---|---|---|---|
| `centralldark.com` | A | sim | 2026-06-03 |
| `*.centralldark.com` | A | sim | 2026-06-03 |
| `www` | A | sim | 2026-06-03 |
| `api` | A | sim | 2026-06-05 |
| `app` | A | sim | 2026-06-05 |
| `bot` | A | sim | 2026-06-05 |
| `crm` | A | sim | 2026-06-05 |
| `gateway` | A | sim | 2026-06-05 |
| `install` | A | sim | 2026-06-05 |
| `mcp` | A | sim | 2026-06-05 |
| `status` | A | sim | 2026-06-05 |
| `webhook` | A | sim | 2026-06-05 |
| `deploy` | A | sim | 2026-06-24 |
| `telepainel` | A | sim | 2026-06-24 |
| `grafo` | A | sim | 2026-07-04 |
| `admin` | A | sim | 2026-09-25 |

### 13.3 Tailscale — readback provado

```text
TAILNET=tail6d7aa4.ts.net
DEVICES_COUNT=4
HTTP_STATUS=200
PROVIDER_READ=PASS
```

| Device | OS | Hostname | Connected | Last Seen | Key Expiry |
|---|---|---|---|---|---|
| `vmi3256920` | linux | VPS | true | 2026-09-30T09:43Z | disabled (never expires) |
| `centraldark-os` | linux | centraldark-os | true | 2026-09-30T09:43Z | 2027-03-28 |
| `SEGREDO` | windows | Casa | true | 2026-09-30T09:43Z | 2027-03-24 |
| `celular-segredo-iphone` | iOS | iPhone | false | 2026-09-30T09:43Z | 2027-02-26 |

VPS (`vmi3256920`) tem `keyExpiryDisabled=true` — rota Tailscale permanente confirmada.

### 13.4 Buildkite — readback provado

```text
USER=SegredoiDev
USER_ID=01a0b190-337e-4f32-a08c-b32ef8a68a2f
ORG=segredoidev
HTTP_STATUS=200
PROVIDER_READ=PASS
```

### 13.5 Contabo — readback provado

**Medido em:** 2026-09-30T10:20Z | **Superfície:** CHEFE executou `curl.exe` via PowerShell (Casa) direto na API Contabo | **Auth:** OAuth2 password grant

```text
CONTABO_AUTH=PASS (access_token obtido via /auth/realms/contabo/protocol/openid-connect/token)
CONTABO_INSTANCES_READ=PASS
CONTABO_SNAPSHOTS_READ=PASS
PROVIDER_READ=PASS
```

**Instance provada:**

| Campo | Valor |
|---|---|
| instanceId | 203256920 |
| name | vmi3256920 |
| displayName | CENTRALDARK-OS |
| ipv4 | 89.117.78.124 |
| ipv6 | 2605:a144:2325:6920::1 |
| vCpu | 8 cores |
| RAM | 24576 MB (24 GB) |
| Disk | 204800 MB (200 GB NVMe) |
| DC | United States (East) 1 |
| status | running |
| product | Cloud VPS 30 NVMe (V97) |
| created | 2026-04-25 |
| imageId | afecbb85-e2fc-46f0-9684-b46b1faf00bb |
| defaultUser | root |
| macAddress | 00:50:56:63:70:5d |

**Snapshot provado:**

| Campo | Valor |
|---|---|
| snapshotId | snap1790430960 |
| name | central |
| instanceId | 203256920 |
| created | 2026-09-26T11:56:00Z |
| autoDeleteDate | 2026-10-26T13:56:00Z |
| imageName | ubuntu-22.04 |
| daysRemaining | ~26 (medido 2026-09-30) |

**Nota:** Contabo exige OAuth2 password grant com 4 credenciais (client_id, client_secret, username, password) + header `x-request-id` com UUID4 válido. Snapshots endpoint é per-instance: `/v1/compute/instances/{instanceId}/snapshots`.

### 13.6 Gate B — veredicto PASS

```text
CLOUDFLARE_READ=PASS (zone + DNS + account provados)
TAILSCALE_READ=PASS (4 devices, VPS connected, key permanent)
BUILDKITE_READ=PASS (user + org provados)
CONTABO_READ=PASS (auth + instances + snapshots provados)
GITHUB_READ=PASS (repo/main/PR acessíveis via MCP)
VPS_INSTANCE_EXACT_MATCH=PASS (instanceId 203256920, displayName CENTRALDARK-OS, 89.117.78.124)
GATE_B=PASS (4/4 providers provados)
```

### 13.8 Gate C — snapshot parcial (medição read-only)

```text
SNAPSHOT_EXISTS=PASS (snap1790430960, name "central", created 2026-09-26)
SNAPSHOT_AUTO_DELETE=2026-10-26 (~26 dias restantes)
SNAPSHOT_BASE_IMAGE=ubuntu-22.04
ROLLBACK_API_PATH=POST /v1/compute/instances/203256920/snapshots/snap1790430960/rollback
ROLLBACK_TESTED=NO (read-only phase, endpoint identificado mas não invocado)
VNC_RESCUE_TESTED=NO (requer painel Contabo)
GATE_C=PARTIAL_PASS (snapshot existe e é recuperável via API; rollback e VNC não testados)
```

### 13.7 Fase A — Vault status

```text
VAULT_SCRIPT=scripts/vps/centraldark-vault-bootstrap-inventory.sh (existe no PR branch)
VPS_BRANCH=main@ab8fe2d80eb
VPS_HAS_VAULT_SCRIPT=NO (script está somente no branch claude/centraldark-os-kylin-ft1urg)
VPS_WORKING_TREE=DIRTY (9 modified, 11 untracked)
EXECUTION_SURFACE=VPS shell via rota autorizada existente
GATE_A=NOT_STARTED (script ainda não executado no VPS)
NEXT_ACTION=AGENTE deve sincronizar/transportar o menor delta até a VPS pela rota autorizada disponível e executar o vault; não aguardar microcomando do CHEFE se houver rota operacional
```


## 14. Plano único — Instinto Superior como painel-mãe operacional AGORA

**Decisão do CHEFE:** retirar "futuro" deste escopo. O painel Instinto Superior entra no mesmo ciclo do Vault + Bootstrap + CentralDark-OS e deve ser construído como superfície administrativa mãe, reutilizando owners já existentes.

```text
INSTINTO_SUPERIOR_SCOPE=NOW
INSTINTO_SUPERIOR_ROLE=ADMIN_MOTHER_PANEL
NO_PROVIDER_PANEL_REQUIRED_FOR_DAILY_OPERATION=true
CONTABO_UI_DIRECT_USE=OPTIONAL_FALLBACK
CLOUDFLARE_UI_DIRECT_USE=OPTIONAL_FALLBACK
ONE_SYSTEM_ONLY=true
REUSE_EXISTING_OWNERS=true
```

### 14.1 Capacidades obrigatórias no mesmo plano

O painel deve inventariar, exibir e operar, via owners/API existentes:

- **Sistema/VPS:** CPU, RAM, disco, load, uptime, portas, serviços, systemd, PM2, health e restart controlado.
- **Agentes:** lista de agentes/processos, estado, owner, modelo/provider quando conhecido, última ação, erro, health, fila e receipt.
- **CentralDark runtime:** MCP/Admin, OAuth broker, Hermes, bots necessários, memória/knowledge services, deploy e status de endpoints.
- **Vault/Cofre:** inventário, hashes, duplicatas, origem, consumer, estado ativo/obsoleto, restore e rotação.
- **Bootstrap/Restore:** geração do pacote, validação, dry-run, aplicação autorizada, receipt e rollback.
- **Contabo:** instance, status, CPU/RAM/disk contratados, snapshots, criar snapshot, rollback, reinstall/custom image quando suportado, VNC/rescue status e ações permitidas.
- **Cloudflare:** zone/account, DNS records, tunnels/endpoints, proxied state, criação/edição/remoção quando autorizada.
- **GitHub:** main/HEAD, PR filho, PR-mãe #1562, checks, deploy receipts e drift.
- **Tailscale/SSH:** peers, online/offline, rota VPS/Casa/CentralDark-OS.
- **Backups:** snapshots, vault archives, hashes, data de criação, validade e restore status.
- **Receipts/Auditoria:** PASS/FAIL/UNKNOWN/BLOCKED por ação, sem valor de segredo.

### 14.2 Owners a reutilizar

Não criar cliente/provider paralelo. Consumir owners existentes antes de adicionar rota nova:

- `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js`
- `apps/modulos/mcp/src/tools/core/mcp-admin.js`
- `apps/modulos/oauth-broker/server.mjs`
- `scripts/vps/hydrate-provider-secrets.sh`
- `scripts/cloudflare/cf-sync.sh`
- `install.sh`
- `scripts/vps/centraldark-vault-bootstrap-inventory.sh`
- `scripts/vps/centraldark-os-bootstrap-restore.sh`

Se a UI atual estiver em outro owner já existente, costurar nele; não abrir segundo painel.

### 14.3 Sequência única de execução

```text
CURRENT_HEAD
→ GATE_A_VAULT
→ GATE_B_PROVIDERS
→ GATE_C_RECOVERY
→ COMPLETE_RESTORE_LOGIC
→ IMPLEMENT_INSTINTO_SUPERIOR_ADMIN_SURFACE
→ PROVIDER_READBACK_IN_PANEL
→ PROVIDER_MUTATION_GATES
→ CENTRALDARK_OS_IMAGE/INSTALL_ROUTE
→ CLEAN_REINSTALL
→ RESTORE_ONLY_GOLD
→ START_RUNTIME
→ PANEL_HEALTH
→ REBOOT
→ PANEL_HEALTH_AGAIN
→ ROTATE_CREDENTIALS_POST_ONLINE
→ RECEIPT_1713
→ ANCHOR_1562
→ FIXED_POINT
```

O monitor do PR #1713 deve continuar para a próxima etapa comprovável automaticamente; não deixar item deste plano marcado como "futuro" apenas por pertencer à UI.

### 14.4 Gate do painel

```text
INSTINTO_PANEL_PASS =
SYSTEM_METRICS_READ
+ AGENT_STATE_READ
+ MCP_RUNTIME_READ
+ CONTABO_READ
+ CLOUDFLARE_READ
+ GITHUB_READ
+ VAULT_READ
+ SNAPSHOT_READ
+ RECEIPT_READ
+ AT_LEAST_ONE_SAFE_PROVIDER_ACTION_WITH_READBACK
+ REBOOT_SURVIVAL
```

Mutação de provider só pode aparecer verde depois do readback correspondente. Acesso direto aos painéis Contabo/Cloudflare fica como fallback; operação cotidiana deve passar pelo Instinto Superior quando a capability estiver implementada.

### 14.5 Estado atual conhecido

```text
GATE_B=PASS
CONTABO_READ=PASS
CLOUDFLARE_READ=PASS
TAILSCALE_READ=PASS
BUILDKITE_READ=PASS
SNAPSHOT_EXISTS=PASS
ROLLBACK_PATH_IDENTIFIED=PASS
GATE_A=NOT_STARTED
INSTINTO_SUPERIOR_FULL_ADMIN=NOT_IMPLEMENTED
CLEAN_REINSTALL=NOT_STARTED
```

Próximo delta do agente cloud: executar Gate A, completar restore real testável e começar a costura da superfície administrativa Instinto Superior no owner existente, sem esperar outro ciclo.


### 14.6 Regra de continuidade sem espera humana desnecessária

```text
HUMAN_SUPPLIES_GOAL_NOT_RUNBOOK=true
NO_MICROCOMMAND_WAIT_WHEN_AUTHORIZED_ROUTE_EXISTS=true
IF_BRANCH_ONLY_HAS_NEEDED_SCRIPT_THEN_AGENT_SYNCS_MINIMUM_DELTA=true
IF_VPS_MAIN_MUST_NOT_BE_SWITCHED_THEN_COPY_ONLY_REQUIRED_ARTIFACT=true
PRESERVE_VPS_DIRTY_STATE=true
NO_BLIND_CLEAN=true
EXECUTE_GATE_A_AFTER_DELTA_AVAILABLE=true
THEN_CONTINUE_TO_RESTORE_AND_INSTINTO=true
```

Para o Gate A atual:

1. medir HEAD remoto e estado da VPS;
2. preservar o working tree dirty atual;
3. não trocar branch inteira nem limpar arquivos locais cegamente;
4. transportar somente os scripts necessários do PR #1713 para a VPS, ou usar owner de deploy/sync já existente;
5. executar o vault;
6. validar SHA/manifest/archive;
7. executar restore em READONLY;
8. registrar receipt;
9. continuar para a costura do Instinto Superior no mesmo ciclo.

Se uma rota falhar, usar a próxima rota autorizada existente. Só retornar ao CHEFE quando houver uma fronteira humana real, não por conveniência do agente.
