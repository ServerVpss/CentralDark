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

### 9.5 Painel Instinto Superior — stub

O painel Instinto Superior ainda não tem UI implementada. Capacidade registrada como pendência futura:
- Inventário visual de vault/secrets (read-only)
- Rotação de credenciais via HUB Credential Control Plane
- Bootstrap/restore assistido
- Owner existente candidato: `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js`

```text
PAINEL_INSTINTO_SUPERIOR_UI=PENDENCIA_FUTURA
CAPABILITY_REGISTERED=VAULT_INVENTORY+BOOTSTRAP_RESTORE
OWNER_CANDIDATO=admin-provider-control.js
IMPLEMENTAR_UI_QUANDO=CHEFE_AUTORIZAR
```

## 10. Próximo cursor

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
