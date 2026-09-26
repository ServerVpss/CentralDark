# 🏠🧾 RUNTIME · PROVAS DA SESSÃO · 2026-09-16

**OWNER:** `.agents/skills/meta-lupa/SKILL.md`  
**PR:** `#1550 · NARRATED_TOOL_CALL_TRACE`  
**ADAPTER:** `../TOOL-CALL-RECEIPT-ADAPTER.md`  
**STATUS:** receipt source para cristalização runtime. Runtime real só é PASS quando escrito/medido em `/root/CentralDark`.

---

## ✅ Provado nesta sessão

```text
MCP_CENTRALDARK_HEALTH_OK=true
SERVICE=mcp-centraldark
VERSION=0.4.0
CATALOG_VERSION=115-d6d3af7bb117
TOOL_COUNT=115
MCP_ADMIN_PANEL=visible
MCP_ADMIN_STREAM=/admin/logs/stream
MCP_ADMIN_LOGS=/admin/api/logs
MCP_ADMIN_TOOLS=/admin/api/tools
REMOTE_DEVICE_NAME=vmi3256920
REMOTE_DEVICE_AUTHORIZED=true
REMOTE_CHANNEL_SUBSCRIBED=true
REMOTE_PRESENCE_ONLINE=true
REMOTE_DEVICE_ID_USER_SIDE=b6cba15d-ccc9-4ab6-b9b3-e8953c86a4d7
```

---

## ✅ Provado por print/execução do CHEFE

```text
CONTA2_WATCHDOG_TIMER_CREATED=true
CONTA2_WATCHDOG_STATUS=ok
REMOTE_TRAY_PATHS_FOUND=true
SCREENPIPE_FOUND_ON_VPS=true
SCREENPIPE_PATH_1=/root/CentralDark/apps/modulos/fixed-point-fabric/screenpipe-pipe
SCREENPIPE_PATH_2=/usr/bin/screenpipe
SCREENPIPE_VPS_RUNTIME_BLOCKED_BY_GLIBC=true
SCREENPIPE_REQUIRED_GLIBC=2.38/2.39
SCREENPIPE_PRIMARY_RUNTIME=WINDOWS_CASA
VPS_PRIMARY_RUNTIME=MCP/HERMES/PM2/RECEIPTS
HYBRID_ARCHITECTURE=true
```

---

## 🔴 Contraprova deste ChatGPT

```text
REMOTE_DESKTOP_COMMANDER_THIS_CHAT=NO_DEVICES_AVAILABLE
CHATGPT_REMOTE_DEVICE_VMI3256920=OFFLINE_IN_THIS_BINDING
RUNTIME_FAILURE=not_proven
CONNECTOR_BINDING_GAP=proven
BINDING_SPLIT=true
```

Interpretação:

```text
MCP_HEALTH_OK != ALL_CAPABILITIES_ACTIVE
DEVICE_VERIFIED_BY_USER != CHATGPT_CONNECTOR_ATTACHED
CHATGPT_CONNECTOR_OFFLINE != VPS_RUNTIME_DOWN
SCREENPIPE_INSTALLED_ON_VPS != SCREENPIPE_RUNS_ON_VPS
```

---

## 🧬 Arquitetura runtime correta

```text
CASA / WINDOWS
├─ Screenpipe principal
├─ Remote Tray / Desktop Commander
├─ captura visual/áudio/desktop
└─ ponte autenticada por conta/canal

VPS
├─ MCP CentralDark :9100
├─ MCP Admin / logs / SSE
├─ Hermes / PM2 / Caddy
├─ receipts / deploy / evidence
└─ Screenpipe apenas detectado, não runtime principal por GLIBC

SYNC
CASA Screenpipe
→ Remote Tray
→ MCP 9100 / audit event
→ TOOL-CALL RECEIPT ADAPTER
→ MCP Admin / HUD
→ Drive/GitHub/PR receipt
→ Meta-Lupa
→ Realidade
```

---

## 🧭 Comando seguro para cristalizar no runtime VPS

```bash
mkdir -p /root/CentralDark/.centraldark/runtime/receipts
cat > /root/CentralDark/.centraldark/runtime/receipts/2026-09-16-runtime-provas-sessao.md <<'EOF'
# 🏠🧾 RUNTIME · PROVAS DA SESSÃO · 2026-09-16

MCP_CENTRALDARK_HEALTH_OK=true
SERVICE=mcp-centraldark
VERSION=0.4.0
CATALOG_VERSION=115-d6d3af7bb117
TOOL_COUNT=115
MCP_ADMIN_STREAM=/admin/logs/stream
REMOTE_DEVICE_NAME=vmi3256920
REMOTE_DEVICE_AUTHORIZED=true
REMOTE_PRESENCE_ONLINE=true
CONTA2_WATCHDOG_STATUS=ok
SCREENPIPE_FOUND_ON_VPS=true
SCREENPIPE_VPS_RUNTIME_BLOCKED_BY_GLIBC=true
SCREENPIPE_PRIMARY_RUNTIME=WINDOWS_CASA
VPS_PRIMARY_RUNTIME=MCP/HERMES/PM2/RECEIPTS
HYBRID_ARCHITECTURE=true
CHATGPT_REMOTE_BINDING_SPLIT=true
UNKNOWN_IS_NOT_PASS=true
REALIDADE=JUIZ
EOF
sha1sum /root/CentralDark/.centraldark/runtime/receipts/2026-09-16-runtime-provas-sessao.md
```

---

## ⚖️ Fixed point parcial

```text
SOURCE_RECEIPT_CREATED=true
RUNTIME_RECEIPT_COMMAND_READY=true
RUNTIME_WRITE_BY_THIS_CHAT=false
REASON=REMOTE_BINDING_SPLIT
NEXT_CURSOR=run_runtime_receipt_command_on_vps_then_measure_sha1
```
