# T0 — MEDIÇÃO COMPLETA FASE 1: CENTRALDARK-OS openKylin

**Data:** 2026-09-30T07:38Z (atualizado 2026-09-30T09:15Z — medição provider control plane)
**Sessão:** Claude Code Remote
**Objetivo:** medir estado completo antes de transformar openKylin 3.0 no corpo vivo da CentralDark
**Regra:** READ-ONLY / MEDIÇÃO — nenhuma mutação

---

## 1. GIT / CÓDIGO-FONTE

| Métrica | Valor | Estado |
|---|---|---|
| CURRENT_MAIN_SHA | `d7572defc7aaa34f970b9066798796c3d9d3f2f6` | CONFIRMADO (remedir = match referência) |
| VPS_HEAD | `ab8fe2d80eb` | CONFIRMADO |
| VPS_BEHIND | 23 commits | CONFIRMADO |
| VPS_BRANCH | main | CONFIRMADO |
| Último commit main | `aprendizado(#95): Letra trocada no nome da máquina derruba SSH...` (2026-09-29) | MEDIDO |
| Último commit VPS | `fix(loop): handoff antes de blocker local virar terminal` | MEDIDO |

---

## 2. SERVIÇOS / PROCESSOS (VPS)

| Métrica | Valor | Estado |
|---|---|---|
| PM2 total | 24 | MEDIDO |
| PM2 online | 24 | MEDIDO |
| PM2 stopped | 0 | MEDIDO |
| PM2 errored | 0 | MEDIDO |
| Hermes restarts | 43 | MEDIDO |
| MCP restarts | 12 | MEDIDO |
| MCP versão | v0.4.0 | MEDIDO |
| MCP tools | 132 | MEDIDO |
| MCP health | OK | MEDIDO |
| Fail2ban banned | 83 atualmente / 179 total | MEDIDO |
| GitHub Actions runner | RUNNING (pid 1042) | MEDIDO |
| Remote Desktop Commander | RUNNING (10 pids, 2 contas) | MEDIDO |
| Guardiao runtime | RUNNING (2 pids) | MEDIDO |
| Telegram bots | RUNNING (2 pids — WATCH_MULTIPLE) | MEDIDO |

### Processos PM2 detalhados

Todos 24 serviços online: CentralDark-Hermes, WebhookDeploy, GuardiaoConsciencia, GuardiaoAnalista, Respiracao, EvolucaoIAs, SyncDrive, GraphPanel, Zentinel, MultiZap, CloneDeck, EliteWS, EliteAnthropic, hermes-acp, ContasAdmin, MCP, HubBot-Srver1, HubBot-Guardiao, Memoria, HermesVerificador, mtproto-service, ArsenalAdapter, centraldark-omni-router, OAuthBroker.

---

## 3. VOLUMES / DISCO

| Métrica | Valor | Estado |
|---|---|---|
| Disco total | ~203 GB (203056560 blocos 1K) | MEDIDO |
| Disco usado | ~143 GB (71%) | MEDIDO |
| Disco disponível | ~57 GB (29%) | MEDIDO |
| Montagem | `/` | MEDIDO |
| Particionamento detalhado | UNKNOWN (sem acesso /proc/partitions) | **UNKNOWN** |
| Tipo de filesystem | UNKNOWN (sem acesso lsblk/blkid) | **UNKNOWN** |

---

## 4. CPU / RAM / ARQUITETURA

| Métrica | Valor | Estado |
|---|---|---|
| CPU | AMD EPYC (IBPB), family 23 model 1 | MEDIDO |
| Cores | 8 (1 socket, 1 thread/core) | MEDIDO |
| Arquitetura | x86_64 | MEDIDO |
| RAM total | 25.2 GB | MEDIDO |
| RAM usada | 7 GB (27.9%) | MEDIDO |
| RAM disponível | 17.5 GB | MEDIDO |
| Swap total | 2 GB | MEDIDO |
| Swap usado | ~1.96 GB (96%) | MEDIDO — **ALERTA: swap quase cheio** |
| GPU | NENHUMA | MEDIDO |
| Hypervisor | KVM (virtualização completa) | MEDIDO |
| Uptime | ~47.9 horas (172533 sec) | MEDIDO |
| Load avg | 10.64 / 12.26 / 13.25 | MEDIDO — **ALERTA: load > cores** |

---

## 5. VirtIO

| Métrica | Valor | Estado |
|---|---|---|
| Hypervisor KVM detectado | SIM (CPU flags) | MEDIDO |
| VirtIO drivers presentes | INFERIDO (KVM + Contabo = tipicamente VirtIO) | **INFERIDO** — sem lspci/lsmod |
| Block device driver | UNKNOWN (sem acesso local a lspci) | **UNKNOWN** |
| Network driver | UNKNOWN (sem acesso local a lspci) | **UNKNOWN** |
| API `instances.get` existe | SIM — retornaria hardware details | **ROTA EXISTE, CREDENCIAIS FALTAM** |

**Nota:** KVM + Contabo tipicamente usa VirtIO. A API `instances.get` retornaria detalhes de hardware (incluindo VirtIO), mas todas as 4 credenciais Contabo estão MISSING. Inferência forte mas não prova. `UNKNOWN != PASS`.

---

## 5.1. PROVIDER CONTROL PLANE — MEDIÇÃO MCP ADMIN (2026-09-30T09:15Z)

### Credenciais Contabo

| Credencial | Estado |
|---|---|
| `CONTABO_CLIENT_ID` | **MISSING** |
| `CONTABO_CLIENT_SECRET` | **MISSING** |
| `CONTABO_API_USER` | **MISSING** |
| `CONTABO_API_PASSWORD` | **MISSING** |

### Outros providers (referência)

| Provider | Estado |
|---|---|
| Cloudflare | `CLOUDFLARE_API_TOKEN` = CONFIGURED |
| Tailscale | `TAILSCALE_API_KEY` = CONFIGURED |
| Buildkite | `BUILDKITE_API_TOKEN` = CONFIGURED |

### Matriz de capabilities Contabo (21 mapeadas, verificadas 2026-08-15)

**READ_SUPPORTED + READY_READ_ONLY (rota existe, bloqueada por credenciais):**

| Capability | Endpoint | Params obrigatórios |
|---|---|---|
| `instances.list` | `GET /v1/compute/instances` | — |
| `instances.get` | `GET /v1/compute/instances/{instance_id}` | `instance_id` |
| `instances.audits` | `GET /v1/compute/instances/audits` | — |
| `instances.action_audits` | `GET /v1/compute/instances/actions/audits` | — |
| `snapshots.list` | `GET /v1/compute/instances/{instance_id}/snapshots` | `instance_id` |
| `snapshots.get` | `GET /v1/compute/instances/{instance_id}/snapshots/{snapshot_id}` | `instance_id`, `snapshot_id` |
| `snapshots.audits` | `GET /v1/compute/snapshots/audits` | — |
| `private_networks.audits` | `GET /v1/private-networks/audits` | — |
| `tags.list` | `GET /v1/tags` | — |
| `roles.api_permissions` | `GET /v1/roles/api-permissions` | — |
| `secrets.audits` | `GET /v1/secrets/audits` | — |

**WRITE/DESTRUCTIVE (quarantined, não tentadas — READ-ONLY total):**

| Capability | Tipo | Status |
|---|---|---|
| `instances.start` | DESTRUCTIVE | QUARANTINED |
| `instances.stop` | DESTRUCTIVE | QUARANTINED |
| `instances.restart` | DESTRUCTIVE | QUARANTINED |
| `snapshots.create` | WRITE | QUARANTINED |
| `snapshots.update` | WRITE | QUARANTINED |
| `snapshots.delete` | DESTRUCTIVE | QUARANTINED |
| `snapshots.rollback` | DESTRUCTIVE | QUARANTINED |

**BLOCKED / UNSUPPORTED:**

| Capability | Motivo |
|---|---|
| `secrets.list` | `BLOCKED_SECRET_BEARING_RESPONSE` |
| `billing.invoice` | `UNSUPPORTED_BY_PUBLIC_API` |
| `billing.payment` | `UNSUPPORTED_BY_PUBLIC_API` |

### Tentativa de `provider_read` (prova de exaustão da rota)

```text
provider_read(contabo, instances.list) → CONTABO_CREDENTIALS_MISSING
provider_read(contabo, snapshots.list, instance_id=vmi3256920) → CONTABO_CREDENTIALS_MISSING
```

**Conclusão:** A rota API Contabo EXISTE e está mapeada no control plane CentralDark. Está BLOQUEADA unicamente por credenciais ausentes, não por limitação de API.

---

## 6. SNAPSHOTS / BACKUPS (Contabo)

| Métrica | Valor | Estado |
|---|---|---|
| API `snapshots.list` | MAPEADA (`GET /v1/compute/instances/{id}/snapshots`) | **ROTA EXISTE** |
| API `snapshots.get` | MAPEADA (`GET /v1/.../snapshots/{sid}`) | **ROTA EXISTE** |
| API `snapshots.create` | MAPEADA (WRITE, quarantined) | **ROTA EXISTE** |
| API `snapshots.rollback` | MAPEADA (DESTRUCTIVE, quarantined) | **ROTA EXISTE** |
| Snapshots existentes | **DADOS INACESSÍVEIS** | **CREDENCIAIS MISSING** |
| Backup automático ativo | **DADOS INACESSÍVEIS** | **CREDENCIAIS MISSING** |
| Snapshot testado e recuperável | **NÃO PROVADO** | **BLOQUEADOR FASE 2** |

**ROTA PROVADA, DADOS BLOQUEADOS:** A API Contabo suporta CRUD completo de snapshots + rollback. O bloqueio é exclusivamente por 4 credenciais ausentes (`CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`, `CONTABO_API_PASSWORD`). Uma vez configuradas, a medição de snapshots existentes e a criação+rollback seriam possíveis programaticamente via `provider_read` / `provider_mutate`.

---

## 7. ISO / QCOW2 APLICÁVEL

| Métrica | Valor | Estado |
|---|---|---|
| openKylin 3.0 x86_64 ISO existe | SIM — distribuição oficial huanghe | CONHECIDO |
| CPU compatível | SIM — AMD EPYC x86_64 | MEDIDO |
| RAM suficiente | SIM — 25.2 GB > mínimo | MEDIDO |
| Disco suficiente para dual | POSSÍVEL — 57 GB livres | MEDIDO |
| Custom Image (API) | **NÃO MAPEADA** no control plane | **PAINEL-ONLY** |
| Reinstalação via ISO custom | **NÃO MAPEADA** no control plane | **PAINEL-ONLY** |
| QCOW2 suportado | **NÃO MAPEADO** no control plane | **PAINEL-ONLY** |

**Nota:** Custom Image upload, reinstalação e QCOW2 não aparecem na matriz de capabilities da API Contabo mapeada pelo control plane CentralDark (21 capabilities verificadas 2026-08-15). Estas funcionalidades, se existirem, são acessíveis apenas via painel web my.contabo.com.

---

## 8. CONSOLE / VNC

| Métrica | Valor | Estado |
|---|---|---|
| VNC via API Contabo | **NÃO MAPEADO** no control plane | **PAINEL-ONLY** |
| noVNC embutido no painel | INFERIDO (Contabo tipicamente oferece) | **INFERIDO** |
| Desktop Commander Remote (VPS) | RUNNING — 10 pids, 2 contas | MEDIDO |

**Nota:** Console/VNC não consta na matriz de capabilities da API pública Contabo. É funcionalidade de painel web exclusivamente.

---

## 9. RECOVERY / RESCUE

| Métrica | Valor | Estado |
|---|---|---|
| Modo rescue via API | **NÃO MAPEADO** no control plane | **PAINEL-ONLY** |
| Boot de rescue testado | **NÃO TESTADO** | **NÃO PROVADO** |
| Acesso a disco em rescue | **NÃO TESTADO** | **NÃO PROVADO** |

**Nota:** Rescue/recovery mode não consta na matriz de capabilities da API pública Contabo. Funcionalidade de painel web.

---

## 10. CAPACIDADE REAL DE REINSTALAÇÃO

| Métrica | Valor | Estado |
|---|---|---|
| Reinstalação via API | **NÃO MAPEADA** no control plane | **PAINEL-ONLY** |
| Custom OS via API | **NÃO MAPEADO** no control plane | **PAINEL-ONLY** |
| Caminho de retorno via snapshot API | **ROTA EXISTE** (`snapshots.rollback`) | **CREDENCIAIS MISSING** |
| Caminho de retorno provado | **NÃO PROVADO** | **BLOQUEADOR FASE 2** |

**Nota:** A reinstalação do SO não está mapeada na API, mas o rollback de snapshot SIM. Com credenciais configuradas, o caminho snapshot → rollback seria a rota programática de retorno.

---

## 11. INTELIGÊNCIA NATIVA openKylin (da medição anterior — aprendizados)

| Componente | Estado | Evidência |
|---|---|---|
| kytensor inference | VIVO em 127.0.0.1:8000/8001/8002 | Aprendizado #94 |
| kylin-ai-runtime | INSTALADO | Aprendizado #94 |
| kylin-assistant-systemdaemon | RUNNING | Aprendizado #94 |
| knowledge-base | RUNNING | Aprendizado #94 |
| vector-engine | RUNNING | Aprendizado #94 |
| document-qa | INSTALADO | Aprendizado #94 |
| libkysdk-mcp | INSTALADO (sem processo MCP observado) | Aprendizado #94 |
| Modelos (Qwen/DeepSeek) | INFERIDO (kytensor ativo) | **UNKNOWN** — não testado diretamente |
| Exposição externa | NENHUMA (localhost only) | Aprendizado #94 |
| Hostname | CENTRAKDARK-OS (typo: K em vez de L) | Aprendizado #95 |
| User path | /home/CENTRAKDARK-OS/Desktop | Aprendizado #91 |
| Tailscale name | centraldark-osh | Aprendizado #95 |
| Porta 4175 rota | PROVADA (OS→Tailscale→Casa) | Aprendizado #84 |
| SSH via Tailscale | Requer DOIS switches (set --ssh + ACL policy) | Aprendizado #93 |
| Rotas redundantes | NENHUMA REAL (3 rotas, 1 dependência: shell) | Aprendizado #92 |

---

## 12. PATTERN ALIGNMENT (VPS CentralDark atual)

| Dimensão | Estado |
|---|---|
| UNKNOWN_IS_NOT_PASS | PASS |
| ONE_WRITER_PER_SCOPE | PASS |
| REUSE_BEFORE_CREATE | PASS |
| SECRET_BOUNDARY | PASS |
| SOUL_CANONICA | PASS |
| FAST_PATH_CONTINUA | PASS |
| REMEASURE_PR_LIVE | PASS |
| AUXILIARY_YELLOW_NOT_BLOCKER | PASS |
| FORENSIC_FRESHNESS | **FAIL** (stale desde 2026-09-21) |
| RECEIPT_PRESENT | PASS |

**Alignment:** 90% GREEN (9/10 scored PASS, 1 FAIL)

---

## 13. WORKFLOWS CI

| Workflow | Status | Data |
|---|---|---|
| Hermes Core Signal Watch | skipped | 2026-09-30 07:24 |
| PR Update Branch | **failure** | 2026-09-30 06:37 |
| Autonomia — promoção segura | **failure** | 2026-09-30 06:00 |
| Status Badge Fabric | **failure** | 2026-09-30 05:41 |
| sentinela-divergencias | success | 2026-09-30 04:37 |

**3/5 workflows recentes em failure.**

---

## VEREDITO FASE 1

### MEDIDO (14/20 itens)

- [x] CURRENT_MAIN_SHA
- [x] VPS_HEAD + behind count
- [x] PM2 serviços (24/24 online)
- [x] MCP (132 tools, v0.4.0, health OK)
- [x] CPU (AMD EPYC 8c x86_64, KVM)
- [x] RAM (25.2 GB total, 7 GB usado)
- [x] Swap (2 GB, 96% usado — ALERTA)
- [x] Disco (203 GB total, 71% usado, 57 GB livres)
- [x] GPU (nenhuma)
- [x] Load avg (>cores — ALERTA)
- [x] Hypervisor (KVM)
- [x] Inteligência nativa openKylin (kytensor + services)
- [x] Pattern alignment (86%)
- [x] CI workflows (3 failures)

### ROTA PROVADA MAS BLOQUEADA POR CREDENCIAIS (3/20 itens)

- [~] Snapshots/backups — API `snapshots.list`/`get`/`create`/`rollback` MAPEADA → `CONTABO_CREDENTIALS_MISSING`
- [~] Instância detalhada (VirtIO) — API `instances.get` MAPEADA → `CONTABO_CREDENTIALS_MISSING`
- [~] Caminho de retorno (rollback) — API `snapshots.rollback` MAPEADA → `CONTABO_CREDENTIALS_MISSING`

### PAINEL-ONLY — sem rota API (3/20 itens, fronteira humana genuína)

- [ ] Custom Images / ISO upload — NÃO MAPEADO na API pública Contabo
- [ ] Console/VNC — NÃO MAPEADO na API pública Contabo
- [ ] Recovery/rescue mode — NÃO MAPEADO na API pública Contabo

### BLOQUEADOR PARA FASE 2

```text
FASE_2_GATE = SNAPSHOT_OR_BACKUP_PROVEN_RECOVERABLE
GATE_STATUS = NOT_PROVEN
REASON = CONTABO_CREDENTIALS_MISSING (rota API existe mas credenciais ausentes)

BLOQUEIO_NIVEL_1 (desbloqueável por CHEFE sem painel):
  → Configurar no VPS (env ou HUB):
    CONTABO_CLIENT_ID
    CONTABO_CLIENT_SECRET
    CONTABO_API_USER
    CONTABO_API_PASSWORD
  → Com credenciais: provider_read(snapshots.list) mediria snapshots existentes
  → Com credenciais + autorização: provider_mutate(snapshots.create) + provider_mutate(snapshots.rollback) provaria caminho de retorno

BLOQUEIO_NIVEL_2 (requer painel my.contabo.com — fronteira humana genuína):
  → Custom Image upload (ISO/QCOW2) — sem API pública mapeada
  → Console VNC — sem API pública mapeada
  → Rescue mode — sem API pública mapeada
  → Reinstalação de OS — sem API pública mapeada

ROTA_MINIMA_PARA_FASE_2:
  CHEFE configura 4 credenciais Contabo
  → provider_read(snapshots.list) prova snapshots existentes
  → provider_read(instances.get) prova VirtIO e hardware
  → SE snapshot existente: caminho rollback provável
  → SE sem snapshot: provider_mutate(snapshots.create) cria um → prova rollback
  → Gate FASE 2 pode abrir SEM painel, via API programática
```

### ALERTAS OPERACIONAIS

1. **Swap 96% usado** — sistema sob pressão de memória
2. **Load avg >cores** (10-13 em 8 cores) — CPU saturada
3. **3 CI workflows em failure** — atenção mas não bloqueia FASE 2
4. **Forensic stale desde 2026-09-21** — 9 dias sem prova forense fresca
5. **VPS 23 commits atrás** — drift acumulado

---

## PROVA DE EXAUSTÃO DE ROTA (META-GRILL: `TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN`)

```text
1. mcp_admin_catalog(filter="provider") → 4 tools encontradas ✅
2. provider_credentials_status(contabo) → 4/4 MISSING ✅
3. provider_capabilities(contabo) → 21 capabilities mapeadas ✅
4. provider_read(contabo, instances.list) → CONTABO_CREDENTIALS_MISSING ✅
5. provider_read(contabo, snapshots.list, instance_id=vmi3256920) → CONTABO_CREDENTIALS_MISSING ✅

ROTA TENTADA: SIM
ROTA EXAURIDA: SIM (até o limite das credenciais)
BLOQUEIO MATERIAL: CREDENCIAIS, não API
FRONTEIRA HUMANA GENUÍNA: Custom Images, VNC, Rescue, Reinstall (sem API pública)
```

---

**NEXT_CURSOR:** CHEFE configura 4 credenciais Contabo no VPS/HUB → medição completa via `provider_read` → gate FASE 2 reavaliado. Itens painel-only (Custom Image, VNC, rescue, reinstall) são fronteira humana genuína se necessários.


---

## 14. CASA — TWIN LOCAL VMWARE / PHYSICAL DISK / GPU SHARED (2026-10-01)

Medição read-only na Casa `SEGREDO`.

### VM

| Métrica | Valor | Estado |
|---|---|---|
| VMX | `E:\\VMs\\CENTRALDARK-OS\\CENTRALDARK-OSh.vmx` | MEDIDO |
| displayName | `CENTRALDARK-OSh` | MEDIDO |
| vCPU | 4 | MEDIDO |
| RAM | 8192 MB | MEDIDO |
| guestOS | `other6xlinux-64` | MEDIDO |
| rede | NAT | MEDIDO |
| estado final observado | poweredOff em 2026-09-30T07:35:29Z | MEDIDO |

### Disco

O VMDK é descriptor `fullDevice`, não disco virtual tradicional. Ele aponta diretamente para `\\.\\PhysicalDrive1`, identificado no descriptor como dispositivo Kingston.

```text
CENTRALDARK_OSH_DISK_MODE=PHYSICAL_DEVICE_PASSTHROUGH
VMDK_DESCRIPTOR_ONLY=true
PHYSICALDRIVE1_BACKING=PROVED
KINGSTON_DEVICE_REFERENCE=PROVED
```

Isso significa que a VM foi usada como casca de virtualização sobre um disco físico real. Não promover como snapshot/clone automático: `PHYSICAL_DISK != PORTABLE_VMDK_IMAGE`.

### Shared CentralDark

`sharedFolder0` está habilitado em leitura e escrita:

```text
HOST_PATH=E:\VMs\CENTRALDARK-OS\SHARED
GUEST_NAME=CENTRALDARK-SHARED
READ=true
WRITE=true
EXPIRATION=never
```

A árvore compartilhada contém o corpo CentralDark (`.agents`, `.claude`, `.codex`, `.hermes`, `apps`, `docs`, `infra`, `NUCLEO`, `scripts`, `skills`, `AGENTS.md`, `LEIA-ME-IA.md`, `CENTRALDARK_AI_BOOT.yaml`, `SECOND-BRAIN.yml` e outros owners).

Também existem shares read-only de `E:\` e `F:\`.

### GPU / aceleração 3D

A configuração da VM contém:

```text
mks.enable3d=TRUE
svga.vramSize=134217728
svga.graphicsMemoryKB=8388608
svga.guestBackedPrimaryAware=TRUE
```

O log prova uso de `Mesa: SVGA3D`, threads `SVGA/MKS`, backend `DX11` e ciclo DXGI/D3D durante execução. A GPU física medida no host é `Radeon RX 580 Series`.

```text
VMWARE_3D_ACCELERATION=PASS
GUEST_SVGA3D=PASS
HOST_GPU_RX580=PASS
DX11_RENDER_BACKEND=PASS
GPU_SHARED_WITH_VM=SUPPORTED_BY_VMWARE_RENDER_PATH
USER_STATED_GPU_REACTS_ON_TAB_WINDOW_ACTIVITY=true
ASSISTANT_REFRAME_EACH_TAB_HAS_OWN_AI=RETRACTED
TAB_WINDOW_TO_AI_GPU_CAUSAL_MAPPING=UNKNOWN
```

Declaração do CHEFE: ao abrir abas/janelas, ele percebe atividade da GPU e associa isso ao caráter profundamente integrado de IA do sistema. Esta sessão não mediu ainda a causalidade por evento. Portanto, não converter essa fala em “cada aba instancia uma IA própria” nem em negação disso. O claim técnico correto permanece: GPU/3D está provada; o vínculo exato ABA/JANELA → PROCESSO/IA/GPU permanece UNKNOWN até instrumentação por evento.

### Consequência arquitetural

```text
CASA_WINDOWS
→ VMWARE_SHELL
→ PHYSICAL_DISK_OPENKYLIN
→ SHARED_CENTRALDARK_TREE
→ GPU_ACCELERATED_DESKTOP
→ TAILSCALE
→ VPS_CENTRALDARK_OS
```

Leitura: a Casa já possui um twin local material do CENTRALDARK-OS com disco físico, árvore CentralDark compartilhada e aceleração gráfica. A VPS permanece outro corpo/runtime. Isso é composição de capacidades, não duplicação de identidade.

```text
MEGAZORD_LOCAL_REMOTE_CAPABILITY_COMPOSITION=SUPPORTED
ONE_SYSTEM_ONLY=true
CASA_TWIN_IS_NOT_SECOND_BRAIN=true
VPS_AND_CASA_CAN_SHARE_CAPABILITIES=true
```



### CURRENT remeasurement — twin local ligado / ponte host→guest (2026-10-01)

O estado histórico `poweredOff` de 2026-09-30 permanece como histórico. A remedição da Casa nesta sessão substitui esse estado como CURRENT do twin:

```text
VMWARE_VMX_PROCESS=PASS
VMWARE_VMX_PID_AT_MEASUREMENT=29768
VMX=E:\VMs\CENTRALDARK-OS\CENTRALDARK-OSh.vmx
DISPLAY_NAME=CENTRALDARK-OSh
OPENKYLIN=3.0
KERNEL=7.0.0-2-generic
VCPU=4
RAM_MB=8192
NETWORK=VMNET8_NAT
MAC=00:0c:29:94:7b:51
DHCP_IPV4=192.168.35.128
DHCP_HOSTNAME=CENTRALDARK-OS
CASA_TO_TWIN_PORT_22=PASS
CASA_TO_TWIN_PORT_8000=NOT_EXPOSED_AT_MEASUREMENT
CASA_TO_TWIN_PORT_8001=NOT_EXPOSED_AT_MEASUREMENT
CASA_TO_TWIN_PORT_8002=NOT_EXPOSED_AT_MEASUREMENT
CASA_TO_TWIN_PORT_42617=NOT_EXPOSED_AT_MEASUREMENT
```

O VMX readback preserva `mks.enable3d=TRUE`, disco raw `E:\VMs\CENTRALDARK-OSh\CENTRALDARK-OSh.vmdk`, NAT e share RW `E:\VMs\CENTRALDARK-OS\SHARED → CENTRALDARK-SHARED`. O descriptor VMDK preserva `createType="fullDevice"` e `\\.\PhysicalDrive1`.

A ponte existente também foi relida:

```text
BOOTSTRAP=E:\VMs\CENTRALDARK-OS\SHARED\centraldark-3em1.sh
BOOTSTRAP_CAPABILITIES=HGFS+TAILSCALE+DESKTOP_COMMANDER+SCREENPIPE
PRIMEIRA_MUTACAO=PROVA_DE_PONTE_HOST_GUEST
```

O repo compartilhado não é usado como CURRENT porque foi medido em:

```text
BRANCH=feature/ai-cli-runtime-kernel
HEAD=892454b98d941c3fada35d3df826f9962257f80f
UNTRACKED_FILES_PRESENT=true
WORKING_TREE_IS_LAB=true
```

Regra operacional resultante:

```text
LOCAL_TWIN_FIRST_PROVING_GROUND=true
PROCESSOS→SOCKETS→RUNTIME→MODELS→SDK→CAPABILITIES→REAL_CALL
PROVE_LOCALLY_THEN_REPLAY_REMOTELY=true
PORT_CLOSED != CAPABILITY_ABSENT
WORKING_TREE != CANONICAL_CURRENT
REUSE_EXISTING_3EM1_BRIDGE=true
```

**NEXT_CURSOR:** autenticar shell no twin, executar a autópsia nativa e provar pelo menos uma capability com chamada read-only + readback antes de repetir a receita na VPS.

---

## 15. CASA + VPS — FORÇA MULTICORPO ATIVADA PELO CHEFE (2026-10-01)

**Status:** ATIVAÇÃO EXPLÍCITA DO CHEFE.  
**Estado histórico preservado:** esta mesma direção havia sido estacionada como BACKLOG em 2026-10-01; esse estado anterior continua válido como histórico, mas não governa mais o CURRENT após a ativação explícita desta sessão.  
**Regra:** evoluir o owner existente; não criar segundo cérebro, identidade paralela ou arquitetura concorrente.

### Intenção vigente

O Hermes local da Casa passa a ser braço/coordenador/executor persistente da mesma CentralDark e deve incorporar capacidades reais da VPS/CENTRALDARK-OS por rotas provadas, sem transformar transporte, modelo ou host em nova identidade.

```text
CHATGPT/SOL_SESSION = COORDENACAO_DESTA_SESSAO
HERMES_CASA = LOCAL_CONTROL_AND_EXECUTION_BODY
VPS_CENTRALDARK_OS = ALWAYS_ON_REMOTE_CAPABILITY_BODY
TAILSCALE_SSH_MCP = PRIVATE_TRANSPORT_AND_CAPABILITY_ROUTES
GITHUB_MAIN = CANONICAL_KNOWLEDGE_RENDEZVOUS
ONE_SYSTEM_ONLY=true
```

### Prova nova — Hermes local Casa

Execução PowerShell em 2026-10-01 reparou a instalação existente sem exigir reinstalação do sistema operacional.

```text
HERMES_LOCAL_CLI=PASS
HERMES_LOCAL_VERSION=v0.21.5+4928.g60ce574.dirty
HERMES_LOCAL_UPDATE_COMPLETE=PASS
HERMES_PM_INSTALL=PASS
HERMES_DOCTOR=PASS_WITH_NONBLOCKING_WARNINGS
HERMES_RUNTIME_VENV=PASS
HERMES_REQUIRED_PYTHON_PACKAGES=PASS
HERMES_CONFIG_PRESENT=PASS
HERMES_ENV_PRESENT=PASS
HERMES_SOUL_PRESENT=PASS
HERMES_MEMORY_PRESENT=PASS
HERMES_STATE_DB_PRESENT=PASS
HERMES_EXISTING_SESSIONS=47
HERMES_GITHUB_AUTH=PASS
HERMES_DOCKER_AVAILABLE=PASS
HERMES_TERMINAL_AVAILABLE=PASS
HERMES_COMPUTER_USE_AVAILABLE=PASS
HERMES_BROWSER_AVAILABLE=PASS
```

### Separação de falhas

O teste final com o Python global 3.13 do Windows falhou em `typing_extensions`; isso não invalida o runtime Hermes, porque o `hermes doctor` provou o venv próprio do Hermes com Python 3.14.7 e dependências críticas presentes.

```text
WINDOWS_GLOBAL_PYTHON_IMPORT_FAILURE != HERMES_RUNTIME_FAILURE
HERMES_OWN_VENV_IS_SOURCE_FOR_HERMES_RUNTIME=true
```

### Próximo vínculo: VPS por capability, não por endpoint presumido

A rota `100.90.199.124:8099/v1` havia falhado em medição anterior. Portanto ela não é promovida por memória nem reutilizada cegamente.

```text
VPS_8099_LAST_MEASUREMENT=FAIL
VPS_CAPABILITY_BINDING=NOT_YET_PROVEN
HERMES_CASA_TO_VPS_INCORPORATION=ACTIVE_INTENT
HERMES_CASA_TO_VPS_INCORPORATION_RUNTIME=UNKNOWN_UNTIL_MEASURED
REUSE_NATIVE_VPS_CAPABILITIES_BEFORE_NEW_ROUTE=true
DO_NOT_ASSUME_OMNI_ROUTER_AS_CORE=true
```

### Regra operacional atual

```text
CASA_IS_REBUILDABLE_WORKSITE=true
LOCAL_INSTALLATION_IS_NOT_CANONICAL_MEMORY=true
CANONICAL_KNOWLEDGE_SURVIVES_IN_GITHUB=true
OLD_PROVEN_KNOWLEDGE_REMAINS_QUERYABLE=true
NEW_PROVEN_DELTA_EXPANDS_EXISTING_KNOWLEDGE=true
FAILED_OR_UNPROVEN_WORK_PRODUCT_IS_NOT_CRYSTAL=true
PROVEN_DELTA_BECOMES_CRYSTAL=true
```

### Next cursor

Medir, a partir do Hermes Casa, as capabilities realmente vivas e privadas da VPS/CENTRALDARK-OS; bindar a menor rota provada; executar uma chamada read-only; fazer readback/contraprova; somente então promover o binding correspondente a PASS.

```text
NEXT_CURSOR=HERMES_CASA_DISCOVER_AND_BIND_REAL_VPS_CAPABILITIES
```
