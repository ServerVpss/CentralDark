# 🔐 PM2 OPERATIONAL AUTHORIZATION POLICY — CENTRALDARK

**Status:** CANÔNICO · **Authority:** SEGREDO/CHEFE · **Effective:** 2026-09-20

---

## 1. AUTHORIZATION PRINCIPLE

All critical PM2 operations are **LOCKED by default** and require explicit authorization via the phrase:

```
PERMITO SEGREDO
```

**Single Authority:** Only SEGREDO/CHEFE may authorize PM2 mutations.

---

## 2. PROTECTED OPERATIONS

The following operations on ALL PM2 processes require "PERMITO SEGREDO" authorization:

- **restart** — Process restart (immediate termination + restart)
- **stop** — Process termination
- **update_config** — Configuration changes (env vars, args, interpreter, etc.)
- **delete_logs** — Log file deletion or rotation
- **scale** — Instance count changes
- **delete_process** — Process removal from PM2 ecosystem

---

## 3. AUTHORIZATION FLOW

### 3.1 Request Phase

**Who can request?** Any operator with VPS access  
**To whom?** SEGREDO/CHEFE (via message, PR comment, Telegram @srver1bot, or GitHub issue)  
**What to include?**
- Process name
- Operation type (restart, stop, update_config, etc.)
- Reason (mandatory — logged for audit)
- Expected impact (brief description)
- Rollback plan (if config change)
- Deployment window (if scheduled)

### 3.2 Authorization Phase

**Who authorizes?** SEGREDO/CHEFE only  
**How?** Explicit statement containing phrase: **"PERMITO SEGREDO"**  
**Where?** Can be communicated via:
- Direct message/email
- PR comment on operator's branch
- GitHub issue comment
- Telegram DM to operator
- This conversation/session

**Must include:**
- Process name(s) affected
- Operation(s) authorized
- Time window or single execution scope
- Any constraints or conditions

### 3.3 Execution Phase

**Who executes?** Operator who received authorization  
**Before executing:** Record authorization evidence
- Screenshot of authorization message
- Link to GitHub comment/issue
- Timestamp of authorization
- Requester and authorizer names

**Execution:**
```bash
# Example: Restart Hermes with authorization
pm2 restart CentralDark-Hermes-acp --reason "PERMITO SEGREDO: [evidence link] — hotfix deployment"
```

**After executing:** Log outcome
- Actual vs expected result
- Any anomalies or errors
- Rollback actions taken (if needed)

---

## 4. OPERATIONAL CONTRACTS

Each process has a `.pm2/contracts/{process-name}-operational-lock.json` file that encodes:

### 4.1 Contract Structure

```json
{
  "process_name": "CentralDark-ProcessName",
  "locked": true,
  "lock_type": "OPERATIONAL",
  "authorization_phrase": "PERMITO SEGREDO",
  "authority": "SEGREDO/CHEFE",
  "protected_operations": [
    "restart",
    "stop",
    "update_config",
    "delete_logs"
  ],
  "rules": {
    "cooldown_seconds": 30,
    "max_restarts_per_day": 5,
    "require_reason_on_stop": true,
    "require_backup_on_config_update": true,
    "require_test_on_config_update": true
  },
  "monitoring": {
    "health_check_interval_seconds": 60,
    "auto_restart_on_crash": true,
    "max_crash_restarts": 3,
    "failover_pool": [
      "CentralDark-ProcessName-1",
      "CentralDark-ProcessName-2",
      "CentralDark-ProcessName-3"
    ],
    "failover_timeout_seconds": 10
  },
  "alerting": {
    "channels": [
      "telegram:@srver1bot",
      "github:issues",
      "logs:/var/log/centraldark-{process}-audit.log"
    ],
    "alert_on": [
      "unauthorized_access_attempt",
      "operation_request",
      "operation_completed",
      "operation_failed",
      "crash_detected",
      "failover_triggered"
    ]
  },
  "audit": {
    "log_file": "/var/log/centraldark-{process}-audit.log",
    "retention_days": 90,
    "fields": [
      "timestamp",
      "operator",
      "operation",
      "authorization_evidence",
      "reason",
      "status",
      "result"
    ]
  },
  "metadata": {
    "created_by": "Claude Haiku 4.5",
    "created_at": "2026-09-20T00:00:00Z",
    "authorized_by": "SEGREDO/CHEFE",
    "last_updated": "2026-09-20T00:00:00Z"
  }
}
```

### 4.2 Contract Validation

On every operation, PM2 manager (or external wrapper script) must:
1. Check if contract exists for process
2. Check if operation is in protected_operations list
3. If protected: require authorization evidence
4. If authorization missing: BLOCK operation, log attempt
5. If authorized: execute, log result, alert

---

## 5. PROCESS REGISTRATION

All PM2 processes managed by CentralDark must register with this policy:

### 5.1 Mandatory Processes (with contracts)

```
CentralDark-Hermes-acp              [CRITICAL — User auth, API gateway]
CentralDark-MCP                     [CRITICAL — MCP ecosystem]
CentralDark-EliteAnthropic          [CRITICAL — Elite gateway]
CentralDark-ContasAdmin             [CRITICAL — Account management]
CentralDark-EvolucaoIAs             [CRITICAL — AI evolution pipeline]
CentralDark-HubBot                  [CRITICAL — Hub coordination]
CentralDark-Sentinel                [CRITICAL — Monitoring and alerts]
CentralDark-MultiZap                [CRITICAL — WhatsApp/Telegram gateway]
CentralDark-BotServer               [HIGH — Bot server, Caddy reverse proxy]
CentralDark-Zentinel                [HIGH — Centralized sentinel]
CentralDark-Notion-Sync             [MEDIUM — Notion integration]
CentralDark-GitHub-Sync             [MEDIUM — GitHub integration]
CentralDark-GoogleDrive-Sync        [MEDIUM — Google Drive integration]
```

### 5.2 Exemption Criteria

A process may be **exempted** from this policy only if:
- Explicitly approved by SEGREDO/CHEFE in writing
- Process runs in isolated, non-critical context
- Process has no access to secrets, databases, or external APIs
- Exemption documented in `{process-name}.exempted` marker file

---

## 6. HYBRID FAILOVER & REDUNDANCY

### 6.1 Failover Pool Strategy

For each critical process, maintain N-1 redundancy pool:

```
Primary:    CentralDark-ProcessName      (active, critical)
Replica 1:  CentralDark-ProcessName-1    (standby)
Replica 2:  CentralDark-ProcessName-2    (standby)
Replica 3:  CentralDark-ProcessName-3    (standby)
```

### 6.2 Failover Trigger

When primary crashes or becomes unresponsive:
1. Health check detects failure (60-second interval)
2. Alert sent via all channels (Telegram, GitHub, logs)
3. Automatic switch to first available replica
4. Expected failover time: < 10 seconds
5. Primary restarted in background if possible
6. Operator notified via multi-channel alerts

### 6.3 Multi-Channel Alerting

**Telegram:** @srver1bot receives real-time alerts
```
🔴 CentralDark-ProcessName CRASHED
⏱️ Failover triggered → CentralDark-ProcessName-1
🔗 Evidence: [GitHub issue link]
📝 Operator: [name] | Auth: [authorization link]
```

**GitHub:** Automatic issue creation
```
Title: 🚨 CentralDark-ProcessName Failover — 2026-09-20 14:23:45 UTC
Body:
- Process: CentralDark-ProcessName
- Status: CRASHED → FAILOVER
- Active replica: CentralDark-ProcessName-1
- Recovery: [Rollback link] | [Manual restart authorization form]
```

**Logs:** Structured audit trail
```
/var/log/centraldark-{process}-audit.log
2026-09-20T14:23:45.123Z [CRITICAL] CentralDark-ProcessName CRASHED
2026-09-20T14:23:45.234Z [ALERT] Failover to CentralDark-ProcessName-1
2026-09-20T14:23:50.456Z [INFO] Failover complete (5.222s)
```

---

## 7. EMERGENCY OPERATIONS

### 7.1 "Break Glass" Authorization

In critical emergency (service down, data loss imminent):
- **Authorized personnel:** SEGREDO/CHEFE only (even stricter)
- **Process:** Immediate action with retroactive documentation
- **Evidence required:** Screenshots, logs, timestamps
- **Post-mortem:** Full audit within 24 hours

### 7.2 Emergency Restart Procedure

```bash
# Emergency restart (all safeguards bypass)
pm2 restart all --force --emergency

# Logging (mandatory)
echo "[EMERGENCY] Restart authorized by SEGREDO/CHEFE" \
  | sudo tee -a /var/log/centraldark-emergency.log
echo "Evidence: [link to authorization]" \
  | sudo tee -a /var/log/centraldark-emergency.log
```

---

## 8. MONTHLY AUDIT & REPORT

### 8.1 Audit Process

**Frequency:** Every month (1st of month)
**Responsible:** SEGREDO/CHEFE
**Scope:** All PM2 operations from past 30 days

**Checklist:**
- [ ] Count: operations by type (restart, stop, update_config, etc.)
- [ ] Authorization: all operations had valid authorization (100%)
- [ ] Audit trail: all logs present and complete
- [ ] Alerting: all alerts delivered to channels
- [ ] Failures: any unauthorized attempts, security incidents
- [ ] Anomalies: unexpected behavior, anomalous patterns
- [ ] Failover events: count, duration, resolution time

### 8.2 Audit Report

**Published at:** `/docs/OPERACOES/PM2-AUDIT-{YYYY-MM}.md`

**Sections:**
- Summary (1 sentence)
- Metrics (operations count, success rate, failover events)
- Security (unauthorized attempts, incidents)
- Recommendations (policy changes, process improvements)

---

## 9. POLICY UPDATES

### 9.1 Change Process

1. Proposal phase: Documented in GitHub issue
2. Review phase: SEGREDO/CHEFE reviews
3. Approval phase: Explicit "PERMITO SEGREDO" for policy change
4. Implementation: Contracts updated in `.pm2/contracts/`
5. Rollout: Applied to all processes
6. Verification: 24-hour monitoring period

### 9.2 Versioning

Policy version: `YYYY.MM.DD`  
Current: `2026.09.20`  
All contracts updated with policy version timestamp.

---

## 10. SEAL

```
STATUS=CANONICAL
AUTHORITY=SEGREDO/CHEFE
AUTHORIZATION_PHRASE=PERMITO SEGREDO
SCOPE=ALL_PM2_PROCESSES
CREATED_BY=Claude Haiku 4.5
CREATED_AT=2026-09-20T00:00:00Z
ZERO_REGRESSAO=ENFORCED
ONE_WRITER_PER_SCOPE=ENFORCED
HUMAN_SAFETY_INVARIANT=PRESERVED
```

This policy is binding on all operators and processes managed by CentralDark infrastructure.
