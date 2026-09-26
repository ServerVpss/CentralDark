#!/usr/bin/env bash
# CentralDark VPS Audit Canonical V2
# Modo: somente leitura do sistema; escreve apenas evidências em /root/centraldark-evidence.
# Não instala, não reinicia, não altera firewall, Docker, PM2, systemd, Git ou configurações.
set -Eeuo pipefail
umask 077

VERSION="2.0.0"
CAPTURE_NAME="centraldark-vps-audit-v2"
TARGET_ROOT="${TARGET_ROOT:-/root/centraldark-evidence}"
REPO="${REPO:-/root/CentralDark}"
NOW_UTC="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${TARGET_ROOT}/${CAPTURE_NAME}-${NOW_UTC}"
RAW="${OUT}/.raw"
STATUS="CAPTURE_OK"
FAILURES=()
WARNINGS=()

if [[ "${EUID:-999}" -ne 0 ]]; then
  echo "BLOCKED_NOT_ROOT: execute como root para obter leitura completa."
  exit 10
fi

mkdir -p "$RAW" "$OUT"/{00-meta,01-system,02-users,03-network,04-firewall,05-security,06-systemd,07-schedulers,08-docker,09-pm2,10-proxies,11-panels,12-git,13-logs,14-state}
chmod 700 "$OUT" "$RAW"

log() { printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*"; }

degrade() {
  STATUS="CAPTURE_DEGRADED"
  FAILURES+=("$1")
  log "DEGRADED: $1"
}

warn() {
  WARNINGS+=("$1")
  log "WARNING: $1"
}

have() { command -v "$1" >/dev/null 2>&1; }

# Redação genérica para saídas textuais. A defesa principal continua sendo:
# 1) evitar comandos que despejem env; 2) scanner final fail-closed.
redact_stream() {
  python3 -c '
import re, sys
text = sys.stdin.read()
patterns = [
    (r"(?i)(Bearer\s+)[A-Za-z0-9._~+/=-]{12,}", r"\1<REDACTED_SECRET>"),
    (r"\bgh[pousr]_[A-Za-z0-9]{20,}\b", "<REDACTED_GITHUB_TOKEN>"),
    (r"\bgithub_pat_[A-Za-z0-9_]{20,}\b", "<REDACTED_GITHUB_TOKEN>"),
    (r"\bsk-ant-[A-Za-z0-9_-]{20,}\b", "<REDACTED_ANTHROPIC_KEY>"),
    (r"\bsk-[A-Za-z0-9_-]{20,}\b", "<REDACTED_API_KEY>"),
    (r"\bAIza[0-9A-Za-z_-]{25,}\b", "<REDACTED_GOOGLE_KEY>"),
    (r"\bAKIA[0-9A-Z]{16}\b", "<REDACTED_AWS_KEY>"),
    (r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b", "<REDACTED_JWT>"),
    (r"(?i)\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://([^/\s:@]+):([^@\s/]+)@", r"\1://<REDACTED_USER>:<REDACTED_PASSWORD>@"),
]
for pattern, replacement in patterns:
    text = re.sub(pattern, replacement, text)

# Atribuições conhecidas; preserva o nome e remove o valor.
key = r"(?:TOKEN|SECRET|PASSWORD|PASSWD|API[_-]?KEY|PRIVATE[_-]?KEY|CLIENT[_-]?SECRET|ADMIN[_-]?KEY|SERVICE[_-]?ROLE(?:[_-]?KEY)?|DATABASE_URL|AUTHORIZATION)"
text = re.sub(rf"(?im)^(\s*[A-Za-z_][A-Za-z0-9_]*{key}[A-Za-z0-9_]*\s*[=:]\s*).+$", r"\1<REDACTED_SECRET>", text)
sys.stdout.write(text)
'
}

capture() {
  local name="$1"; shift
  local critical="$1"; shift
  local seconds="$1"; shift
  local file="$OUT/$name"
  mkdir -p "$(dirname "$file")"
  log "CAPTURE $name"
  set +e
  timeout --signal=TERM --kill-after=5s "$seconds" "$@" 2>&1 | redact_stream >"$file"
  local rc=${PIPESTATUS[0]}
  set -e
  if [[ $rc -ne 0 ]]; then
    printf '\nCAPTURE_COMMAND_RC=%s\n' "$rc" >>"$file"
    if [[ "$critical" == "critical" ]]; then
      degrade "$name rc=$rc"
    else
      warn "$name rc=$rc"
    fi
  fi
}

capture_shell() {
  local name="$1"; shift
  local critical="$1"; shift
  local seconds="$1"; shift
  local command="$*"
  capture "$name" "$critical" "$seconds" bash -lc "$command"
}

log "Starting ${CAPTURE_NAME} version=${VERSION} out=${OUT}"

# ---------------------------------------------------------------------------
# 00 META
# ---------------------------------------------------------------------------
cat >"$OUT/00-meta/README-FIRST.txt" <<EOF
CentralDark VPS Audit Canonical V2

MODE=READ_ONLY
WRITES_ONLY=${OUT}
DOES_NOT_INSTALL=true
DOES_NOT_RESTART=true
DOES_NOT_CHANGE_FIREWALL=true
DOES_NOT_CHANGE_DOCKER=true
DOES_NOT_CHANGE_PM2=true
DOES_NOT_CHANGE_SYSTEMD=true
DOES_NOT_CHANGE_GIT=true

O pacote só deve ser compartilhado quando:
SECRET_SCAN=PASS
ARCHIVE_SHA256 estiver presente
STATUS for CAPTURE_OK ou CAPTURE_DEGRADED explicado no RECEIPT.json
EOF

printf '%s\n' "$VERSION" >"$OUT/00-meta/VERSION"

# ---------------------------------------------------------------------------
# 01 SYSTEM
# ---------------------------------------------------------------------------
capture_shell "01-system/overview.txt" critical 20 '
echo "UTC=$(date -u +%FT%TZ)"
echo "HOSTNAME=$(hostname -f 2>/dev/null || hostname)"
echo "KERNEL=$(uname -srmo)"
echo
cat /etc/os-release 2>/dev/null || true
echo
uptime
echo
free -h
echo
df -hT
echo
df -ih
echo
findmnt -rno TARGET,SOURCE,FSTYPE,OPTIONS
echo
echo "REBOOT_REQUIRED=$(test -f /var/run/reboot-required && echo true || echo false)"
test -f /var/run/reboot-required.pkgs && cat /var/run/reboot-required.pkgs || true
'

capture_shell "01-system/package-versions.txt" optional 30 '
for cmd in docker node npm pm2 python3 caddy nginx apache2 traefik ufw fail2ban-client git gh; do
  if command -v "$cmd" >/dev/null 2>&1; then
    printf "%-20s " "$cmd"
    "$cmd" --version 2>&1 | head -1 || true
  fi
done
echo
dpkg-query -W -f="${binary:Package}\t${Version}\n" 2>/dev/null |
grep -Ei "^(docker|containerd|caddy|nginx|apache2|cockpit|netdata|grafana|prometheus|fail2ban|ufw|openssh|nodejs|python3|auditd|apparmor)" |
sort -u || true
'

capture_shell "01-system/updates.txt" optional 45 '
apt list --upgradable 2>/dev/null || true
'

capture_shell "01-system/kernel-security.txt" optional 20 '
sysctl kernel.kptr_restrict kernel.dmesg_restrict kernel.yama.ptrace_scope \
  net.ipv4.ip_forward net.ipv4.conf.all.rp_filter \
  net.ipv4.conf.default.rp_filter net.ipv4.tcp_syncookies \
  net.ipv6.conf.all.disable_ipv6 2>/dev/null || true
aa-status 2>/dev/null || true
systemctl is-active auditd 2>/dev/null || true
systemctl is-enabled unattended-upgrades 2>/dev/null || true
'

# ---------------------------------------------------------------------------
# 02 USERS / ACCESS (sem hashes, sem chaves)
# ---------------------------------------------------------------------------
capture_shell "02-users/accounts.txt" critical 20 '
echo "=== LOGIN USERS ==="
awk -F: '\''$7 !~ /(nologin|false)$/ {print $1 ":" $3 ":" $4 ":" $6 ":" $7}'\'' /etc/passwd
echo
echo "=== SUDO GROUP ==="
getent group sudo || true
echo
echo "=== ROOT AUTHORIZED_KEYS METADATA ==="
if [[ -f /root/.ssh/authorized_keys ]]; then
  stat -c "path=%n mode=%a owner=%U:%G size=%s mtime=%y" /root/.ssh/authorized_keys
  echo "key_count=$(grep -cvE "^[[:space:]]*(#|$)" /root/.ssh/authorized_keys || true)"
else
  echo "ABSENT"
fi
echo
echo "=== SUDOERS FILE METADATA ==="
find /etc/sudoers.d -maxdepth 1 -type f -printf "%m %u:%g %s %TY-%Tm-%TdT%TH:%TM:%TS %p\n" 2>/dev/null | sort
'

# ---------------------------------------------------------------------------
# 03 NETWORK
# ---------------------------------------------------------------------------
capture_shell "03-network/interfaces-routes-dns.txt" critical 20 '
ip -br address
echo
ip route
echo
ip -6 route 2>/dev/null || true
echo
resolvectl status 2>/dev/null || cat /etc/resolv.conf
'

capture_shell "03-network/listeners.txt" critical 20 '
ss -H -lntup
'

capture_shell "03-network/connections-summary.txt" optional 20 '
ss -s
echo
ss -H -nt state established |
awk "{print \$4, \$5}" |
sed -E "s/:[0-9]+$/:PORT/" |
sort | uniq -c | sort -nr | head -100
'

# ---------------------------------------------------------------------------
# 04 FIREWALL
# ---------------------------------------------------------------------------
capture_shell "04-firewall/ufw.txt" critical 20 '
ufw status verbose
echo
ufw status numbered
'

capture_shell "04-firewall/nftables.txt" optional 30 '
nft list ruleset
'

capture_shell "04-firewall/iptables.txt" optional 30 '
iptables-save
echo
ip6tables-save
'

capture_shell "04-firewall/docker-user.txt" optional 15 '
iptables -S DOCKER-USER 2>/dev/null || true
echo
iptables -t nat -S DOCKER 2>/dev/null || true
'

# ---------------------------------------------------------------------------
# 05 SECURITY
# ---------------------------------------------------------------------------
capture_shell "05-security/sshd-effective.txt" critical 20 '
/usr/sbin/sshd -t
echo "SSHD_CONFIG_VALID=true"
/usr/sbin/sshd -T |
grep -E "^(port|listenaddress|permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|maxauthtries|logingracetime|permitemptypasswords|x11forwarding|clientaliveinterval|clientalivecountmax|allowusers|allowgroups) "
'

capture_shell "05-security/fail2ban-effective.txt" optional 30 '
fail2ban-client ping
fail2ban-client status
for jail in $(fail2ban-client status 2>/dev/null | sed -n "s/.*Jail list:[[:space:]]*//p" | tr "," " "); do
  jail=$(echo "$jail" | xargs)
  [[ -n "$jail" ]] || continue
  echo "=== JAIL $jail ==="
  fail2ban-client status "$jail" || true
  for key in bantime findtime maxretry; do
    printf "%s=" "$key"
    fail2ban-client get "$jail" "$key" 2>/dev/null || echo UNKNOWN
  done
done
'

capture_shell "05-security/security-file-metadata.txt" optional 20 '
for f in /etc/ssh/sshd_config /etc/ssh/sshd_config.d/*.conf /etc/fail2ban/jail.local /etc/fail2ban/jail.d/*.local /etc/ufw/*.rules; do
  [[ -f "$f" ]] || continue
  stat -c "%a %U:%G %s %y %n" "$f"
  sha256sum "$f"
done
'

# ---------------------------------------------------------------------------
# 06 SYSTEMD
# ---------------------------------------------------------------------------
capture_shell "06-systemd/failed.txt" critical 20 '
systemctl --failed --no-pager
'

capture_shell "06-systemd/services.txt" critical 35 '
systemctl list-units --type=service --all --no-pager --plain
'

capture_shell "06-systemd/enabled-services.txt" optional 30 '
systemctl list-unit-files --type=service --state=enabled --no-pager --plain
'

capture_shell "06-systemd/sockets.txt" optional 20 '
systemctl list-sockets --all --no-pager --plain
'

capture_shell "06-systemd/timers.txt" critical 20 '
systemctl list-timers --all --no-pager --plain
'

capture_shell "06-systemd/centraldark-units.txt" optional 30 '
units=$(systemctl list-units --type=service --all --no-legend |
  awk "{print \$1}" |
  grep -Ei "centraldark|hermes|runner|webhook|caddy|docker|portainer|cockpit|netdata|grafana|prometheus|uptime|pm2" || true)
for unit in $units; do
  echo "=== $unit ==="
  systemctl show "$unit" \
    -p Id -p Description -p LoadState -p ActiveState -p SubState \
    -p UnitFileState -p FragmentPath -p User -p Group -p MainPID \
    -p Restart -p NRestarts -p ExecMainStartTimestamp -p ExecMainExitTimestamp \
    -p ExecMainCode -p ExecMainStatus --no-pager
done
'

# ---------------------------------------------------------------------------
# 07 SCHEDULERS
# ---------------------------------------------------------------------------
capture_shell "07-schedulers/cron-inventory.txt" optional 30 '
echo "=== ROOT CRONTAB (SANITIZED COMMAND SHAPE) ==="
crontab -l 2>/dev/null |
sed -E "s#([A-Za-z_][A-Za-z0-9_]*(TOKEN|SECRET|PASSWORD|KEY)[A-Za-z0-9_]*=)[^[:space:]]+#\1<REDACTED>#Ig" || true
echo
echo "=== SYSTEM CRON FILES ==="
find /etc/cron.d /etc/cron.daily /etc/cron.hourly /etc/cron.weekly /etc/cron.monthly \
  -maxdepth 1 -type f -printf "%m %u:%g %s %TY-%Tm-%TdT%TH:%TM:%TS %p\n" 2>/dev/null | sort
echo
echo "=== AT QUEUE ==="
atq 2>/dev/null || true
'

# ---------------------------------------------------------------------------
# 08 DOCKER
# ---------------------------------------------------------------------------
if have docker; then
  capture_shell "08-docker/version-info.txt" critical 30 '
  docker version
  echo
  docker info
  '

  capture_shell "08-docker/containers.txt" critical 20 '
  docker ps -a --no-trunc \
    --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"
  '

  capture_shell "08-docker/networks-volumes.txt" optional 20 '
  docker network ls
  echo
  docker volume ls
  echo
  docker system df
  '

  # Inspect filtrado: nunca Config.Env com valores.
  capture_shell "08-docker/inspect-sanitized.jsonl" critical 45 '
  docker ps -aq |
  while read -r cid; do
    [[ -n "$cid" ]] || continue
    docker inspect "$cid" |
    python3 -c '\''
import json, sys
d=json.load(sys.stdin)[0]
cfg=d.get("Config") or {}
host=d.get("HostConfig") or {}
state=d.get("State") or {}
labels=cfg.get("Labels") or {}
keys=sorted(x.split("=",1)[0] for x in (cfg.get("Env") or []) if "=" in x)
out={
 "Id":d.get("Id"),"Name":d.get("Name"),"Image":cfg.get("Image"),
 "State":{"Status":state.get("Status"),"Running":state.get("Running"),
          "StartedAt":state.get("StartedAt"),"FinishedAt":state.get("FinishedAt"),
          "ExitCode":state.get("ExitCode"),"Error":state.get("Error")},
 "RestartCount":d.get("RestartCount"),
 "NetworkMode":host.get("NetworkMode"),
 "PortBindings":host.get("PortBindings"),
 "RestartPolicy":host.get("RestartPolicy"),
 "Privileged":host.get("Privileged"),
 "ReadonlyRootfs":host.get("ReadonlyRootfs"),
 "CapAdd":host.get("CapAdd"),"CapDrop":host.get("CapDrop"),
 "SecurityOpt":host.get("SecurityOpt"),
 "Mounts":[{"Type":m.get("Type"),"Source":m.get("Source"),
            "Destination":m.get("Destination"),"RW":m.get("RW")}
           for m in (d.get("Mounts") or [])],
 "Compose":{"Project":labels.get("com.docker.compose.project"),
            "Service":labels.get("com.docker.compose.service"),
            "WorkingDir":labels.get("com.docker.compose.project.working_dir"),
            "ConfigFiles":labels.get("com.docker.compose.project.config_files")},
 "EnvKeysOnly":keys
}
print(json.dumps(out,sort_keys=True))
'\''
  done
  '

  capture_shell "08-docker/compose-files.txt" optional 40 '
  find /root /opt /srv /var/www -xdev -type f \
    \( -iname "compose.yml" -o -iname "compose.yaml" -o -iname "docker-compose.yml" -o -iname "docker-compose.yaml" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/backups/*" \
    -print 2>/dev/null | sort -u
  '

  # Logs curtos com timeout individual.
  mkdir -p "$OUT/13-logs/docker"
  while IFS= read -r cid; do
    [[ -n "$cid" ]] || continue
    name="$(docker inspect -f '{{.Name}}' "$cid" 2>/dev/null | tr -d '/' || echo "$cid")"
    safe_name="$(printf '%s' "$name" | tr -c 'A-Za-z0-9_.-' '_')"
    set +e
    timeout --signal=TERM --kill-after=3s 15s docker logs --timestamps --since 24h --tail 200 "$cid" 2>&1 |
      redact_stream >"$OUT/13-logs/docker/${safe_name}.log"
    rc=${PIPESTATUS[0]}
    set -e
    if [[ $rc -ne 0 ]]; then
      printf '\nLOG_CAPTURE_RC=%s\n' "$rc" >>"$OUT/13-logs/docker/${safe_name}.log"
      warn "docker log $name rc=$rc"
    fi
  done < <(docker ps -q)
else
  warn "docker absent"
fi

# ---------------------------------------------------------------------------
# 09 PM2
# ---------------------------------------------------------------------------
if have pm2; then
  capture_shell "09-pm2/status.txt" critical 20 '
  pm2 status
  '

  capture_shell "09-pm2/processes-sanitized.jsonl" critical 30 '
  pm2 jlist |
  node -e '\''
let s="";
process.stdin.on("data",d=>s+=d).on("end",()=>{
  for(const x of JSON.parse(s||"[]")){
    const e=x.pm2_env||{};
    console.log(JSON.stringify({
      name:x.name,pid:x.pid,status:e.status,restart_time:e.restart_time,
      unstable_restarts:e.unstable_restarts,created_at:e.created_at,
      pm_uptime:e.pm_uptime,exec_mode:e.exec_mode,
      interpreter:e.exec_interpreter,script:e.pm_exec_path,cwd:e.pm_cwd,
      args:e.args,watch:e.watch,max_memory_restart:e.max_memory_restart,
      out_log:e.pm_out_log_path,err_log:e.pm_err_log_path,
      env_keys_only:Object.keys(e).filter(k=>/^[A-Z][A-Z0-9_]+$/.test(k)).sort()
    }));
  }
});
'\''
  '

  mkdir -p "$OUT/13-logs/pm2"
  python3 - "$OUT/09-pm2/processes-sanitized.jsonl" "$OUT/13-logs/pm2" <<'PY'
import json, pathlib, re, sys
source=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2])
sensitive=re.compile(r"(?i)(token|secret|password|passwd|api[_-]?key|authorization|bearer)")
for line in source.read_text(errors="replace").splitlines():
    try: x=json.loads(line)
    except Exception: continue
    name=re.sub(r"[^A-Za-z0-9_.-]+","_",x.get("name") or "unknown")
    for kind,key in (("out","out_log"),("err","err_log")):
        p=x.get(key)
        if not p: continue
        f=pathlib.Path(p)
        if not f.exists(): continue
        rows=[]
        try:
            lines=f.read_text(errors="replace").splitlines()[-200:]
        except Exception as exc:
            rows=[f"READ_ERROR={type(exc).__name__}:{exc}"]
        else:
            for row in lines:
                rows.append("<REDACTED_SENSITIVE_LINE>" if sensitive.search(row) else row)
        (out/f"{name}-{kind}.log").write_text("\n".join(rows)+"\n",errors="replace")
PY
else
  warn "pm2 absent"
fi

# ---------------------------------------------------------------------------
# 10 REVERSE PROXIES
# ---------------------------------------------------------------------------
capture_shell "10-proxies/discovery.txt" optional 25 '
for svc in caddy nginx apache2 traefik haproxy; do
  printf "%-12s active=" "$svc"
  systemctl is-active "$svc" 2>/dev/null || true
  printf "%-12s enabled=" "$svc"
  systemctl is-enabled "$svc" 2>/dev/null || true
done
'

capture_shell "10-proxies/routes-sanitized.txt" optional 35 '
for root in /etc/caddy /etc/nginx /etc/apache2 /etc/traefik /etc/haproxy; do
  [[ -d "$root" ]] || continue
  echo "=== $root ==="
  grep -RInE "reverse_proxy|proxy_pass|upstream|listen[[:space:]]|server_name|Host\(|routers:|services:|loadBalancer|127\.0\.0\.1|0\.0\.0\.0" "$root" 2>/dev/null |
  head -3000
done
'

# ---------------------------------------------------------------------------
# 11 PANELS / OBSERVABILITY DISCOVERY
# ---------------------------------------------------------------------------
capture_shell "11-panels/discovery.txt" critical 30 '
echo "=== DOCKER PANELS ==="
docker ps -a --format "{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null |
grep -Ei "portainer|cockpit|netdata|grafana|prometheus|uptime.?kuma|dozzle|yacht|glances|cadvisor|loki|tempo|jaeger|kibana|elastic|zabbix|watchtower" || true
echo
echo "=== SYSTEMD PANELS ==="
systemctl list-unit-files --no-pager 2>/dev/null |
grep -Ei "cockpit|netdata|grafana|prometheus|uptime|glances|webmin|dozzle|cadvisor|zabbix|elastic|kibana" || true
echo
echo "=== INSTALLED PACKAGES ==="
dpkg-query -W -f="${binary:Package}\t${Version}\n" 2>/dev/null |
grep -Ei "cockpit|netdata|grafana|prometheus|glances|webmin|zabbix|elastic|kibana" || true
echo
echo "=== PM2 PANELS ==="
pm2 jlist 2>/dev/null |
node -e '\''
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
for(const x of JSON.parse(s||"[]")){
 const p=((x.name||"")+" "+(x.pm2_env?.pm_exec_path||""));
 if(/panel|dashboard|monitor|status|graf/i.test(p))
   console.log([x.name,x.pm2_env?.status,x.pm2_env?.pm_exec_path].join("\t"));
}});'\'' || true
echo
echo "=== PANEL PORTS ==="
ss -H -lntp 2>/dev/null |
grep -E ":(19999|3000|3001|3100|4000|5601|8000|8080|8086|9090|9091|9100|9443)\b" || true
'

# ---------------------------------------------------------------------------
# 12 GIT / SOURCE INVENTORY
# ---------------------------------------------------------------------------
capture_shell "12-git/repositories.txt" critical 50 '
find /root /opt /srv /var/www -xdev -type d -name .git \
  -not -path "*/node_modules/*" -not -path "*/backups/*" 2>/dev/null |
sort -u |
while read -r dotgit; do
  repo="${dotgit%/.git}"
  echo "=== $repo ==="
  git -C "$repo" rev-parse --show-toplevel 2>/dev/null || true
  echo "BRANCH=$(git -C "$repo" branch --show-current 2>/dev/null || true)"
  echo "HEAD=$(git -C "$repo" rev-parse HEAD 2>/dev/null || true)"
  echo "ORIGIN=$(git -C "$repo" remote get-url origin 2>/dev/null | sed -E "s#(https?://)[^/@]+@#\1<REDACTED>@#" || true)"
  echo "STATUS_COUNTS:"
  git -C "$repo" status --porcelain=v1 2>/dev/null |
    awk "{c[substr(\$0,1,2)]++} END{for(k in c) print k,c[k]}" |
    sort || true
done
'

if [[ -d "$REPO/.git" ]]; then
  capture_shell "12-git/centraldark-state.txt" critical 25 "
  echo \"ROOT=\$(git -C '$REPO' rev-parse --show-toplevel)\"
  echo \"BRANCH=\$(git -C '$REPO' branch --show-current)\"
  echo \"HEAD=\$(git -C '$REPO' rev-parse HEAD)\"
  echo
  git -C '$REPO' status --short
  echo
  git -C '$REPO' worktree list --porcelain
  echo
  git -C '$REPO' log -20 --oneline --decorate
  echo
  git -C '$REPO' diff --check || true
  "
fi

# ---------------------------------------------------------------------------
# 13 LOGS SYSTEMD - capped
# ---------------------------------------------------------------------------
mkdir -p "$OUT/13-logs/systemd"
mapfile -t UNITS < <(
  {
    printf '%s\n' ssh sshd fail2ban ufw docker caddy webhook
    systemctl --failed --no-legend 2>/dev/null | awk '{print $1}'
    systemctl list-units --type=service --all --no-legend 2>/dev/null |
      awk '{print $1}' |
      grep -Ei "centraldark|hermes|runner|portainer|cockpit|netdata|grafana|prometheus|pm2" || true
  } | sed '/^$/d' | sort -u
)

for unit in "${UNITS[@]}"; do
  safe_unit="$(printf '%s' "$unit" | tr -c 'A-Za-z0-9_.@-' '_')"
  set +e
  timeout --signal=TERM --kill-after=3s 15s journalctl -u "$unit" --since "24 hours ago" --no-pager -n 300 2>&1 |
    redact_stream >"$OUT/13-logs/systemd/${safe_unit}.log"
  rc=${PIPESTATUS[0]}
  set -e
  if [[ $rc -ne 0 ]]; then
    printf '\nLOG_CAPTURE_RC=%s\n' "$rc" >>"$OUT/13-logs/systemd/${safe_unit}.log"
    warn "journal $unit rc=$rc"
  fi
done

# ---------------------------------------------------------------------------
# 14 NORMALIZED STATE / DRIFT BASELINE
# ---------------------------------------------------------------------------
python3 - "$OUT" "$VERSION" "$STATUS" <<'PY'
import json, pathlib, re, sys, hashlib
out=pathlib.Path(sys.argv[1]); version=sys.argv[2]; status=sys.argv[3]

def lines(rel):
    p=out/rel
    return p.read_text(errors="replace").splitlines() if p.exists() else []

listeners=[]
for row in lines("03-network/listeners.txt"):
    if "LISTEN" not in row and "UNCONN" not in row: continue
    listeners.append(re.sub(r"\s+"," ",row.strip()))

containers=[]
for row in lines("08-docker/inspect-sanitized.jsonl"):
    try:
        d=json.loads(row)
    except Exception:
        continue
    containers.append({
        "name":d.get("Name"),"image":d.get("Image"),
        "status":(d.get("State") or {}).get("Status"),
        "running":(d.get("State") or {}).get("Running"),
        "restart_count":d.get("RestartCount"),
        "network_mode":d.get("NetworkMode"),
        "port_bindings":d.get("PortBindings"),
        "privileged":d.get("Privileged"),
    })

pm2=[]
for row in lines("09-pm2/processes-sanitized.jsonl"):
    try:
        d=json.loads(row)
    except Exception:
        continue
    pm2.append({k:d.get(k) for k in (
        "name","status","restart_time","unstable_restarts",
        "script","cwd","watch","max_memory_restart"
    )})

failed=[x for x in lines("06-systemd/failed.txt") if x.strip()]
panels=lines("11-panels/discovery.txt")

state={
  "schema":"centraldark.vps.audit.state.v2",
  "version":version,
  "listeners":sorted(listeners),
  "containers":sorted(containers,key=lambda x:str(x.get("name"))),
  "pm2":sorted(pm2,key=lambda x:str(x.get("name"))),
  "systemd_failed":failed,
  "panels":panels,
}
payload=json.dumps(state,sort_keys=True,separators=(",",":")).encode()
state["state_sha256"]=hashlib.sha256(payload).hexdigest()
(out/"14-state/STATE.json").write_text(json.dumps(state,indent=2,ensure_ascii=False)+"\n")
PY

# ---------------------------------------------------------------------------
# RECEIPT PRELIMINAR
# ---------------------------------------------------------------------------
python3 - "$OUT" "$VERSION" "$STATUS" "${FAILURES[*]:-}" "${WARNINGS[*]:-}" <<'PY'
import json, pathlib, sys
from datetime import datetime, timezone
out=pathlib.Path(sys.argv[1])
receipt={
 "schema":"centraldark.vps.audit.receipt.v2",
 "version":sys.argv[2],
 "status":sys.argv[3],
 "mode":"READ_ONLY",
 "generated_at_utc":datetime.now(timezone.utc).isoformat(),
 "output":str(out),
 "failures":[x for x in sys.argv[4].split(" ") if x],
 "warnings":[x for x in sys.argv[5].split(" ") if x],
 "mutations":{
   "packages":False,"services":False,"firewall":False,"docker":False,
   "pm2":False,"git":False,"system_config":False
 },
 "secret_scan":"PENDING",
}
(out/"00-meta/RECEIPT.json").write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+"\n")
PY

# ---------------------------------------------------------------------------
# FINAL SECRET SCAN - fail closed
# ---------------------------------------------------------------------------
python3 - "$OUT" <<'PY'
import pathlib, re, sys, json
out=pathlib.Path(sys.argv[1])
patterns={
 "github_token":re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b"),
 "openai_style":re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
 "anthropic":re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b"),
 "google":re.compile(r"\bAIza[0-9A-Za-z_-]{25,}\b"),
 "aws":re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
 "jwt":re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"),
 "private_key":re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
 "credential_assignment":re.compile(
   r"(?im)^\s*[A-Za-z_][A-Za-z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|API[_-]?KEY|PRIVATE[_-]?KEY|CLIENT[_-]?SECRET|ADMIN[_-]?KEY|SERVICE[_-]?ROLE(?:[_-]?KEY)?|DATABASE_URL)[A-Za-z0-9_]*\s*[=:]\s*(?!<REDACTED|AUSENTE|PRESENTE|UNKNOWN|PENDING)[^\s]+"
 ),
}
findings=[]
for p in sorted(out.rglob("*")):
    if not p.is_file() or "/.raw/" in str(p): continue
    text=p.read_text(errors="replace")
    for name,pat in patterns.items():
        if pat.search(text):
            findings.append({"file":str(p.relative_to(out)),"pattern":name})
scan=out/"00-meta/SECRET-SCAN.json"
scan.write_text(json.dumps({"status":"PASS" if not findings else "BLOCKED","findings":findings},indent=2)+"\n")
if findings:
    print(json.dumps(findings,indent=2))
    raise SystemExit(42)
PY
scan_rc=$?

if [[ $scan_rc -ne 0 ]]; then
  STATUS="CAPTURE_BLOCKED_SECRET"
  python3 - "$OUT/00-meta/RECEIPT.json" "$STATUS" <<'PY'
import json, pathlib, sys
p=pathlib.Path(sys.argv[1]); d=json.loads(p.read_text())
d["status"]=sys.argv[2]; d["secret_scan"]="BLOCKED"
p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
PY
  rm -rf "$RAW"
  echo "STATUS=$STATUS"
  echo "OUTPUT=$OUT"
  echo "ARCHIVE=NOT_CREATED"
  echo "ACTION=KEEP_LOCAL_AND_REVIEW_SECRET-SCAN.json"
  exit 42
fi

# Final receipt + manifest.
python3 - "$OUT/00-meta/RECEIPT.json" "$STATUS" <<'PY'
import json, pathlib, sys
p=pathlib.Path(sys.argv[1]); d=json.loads(p.read_text())
d["status"]=sys.argv[2]; d["secret_scan"]="PASS"
p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
PY

find "$OUT" -type f ! -path "$RAW/*" ! -name MANIFEST-SHA256.txt -print0 |
  sort -z |
  xargs -0 sha256sum >"$OUT/00-meta/MANIFEST-SHA256.txt"

# Remove raw staging; no raw secrets should be retained.
rm -rf "$RAW"

ARCHIVE="${OUT}.tar.gz"
tar -C "$OUT" -czf "$ARCHIVE" .
ARCHIVE_SHA256="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
printf '%s  %s\n' "$ARCHIVE_SHA256" "$(basename "$ARCHIVE")" >"${ARCHIVE}.sha256"

echo
echo "============================================================"
echo "STATUS=$STATUS"
echo "MODE=READ_ONLY"
echo "OUTPUT=$OUT"
echo "ARCHIVE=$ARCHIVE"
echo "ARCHIVE_SHA256=$ARCHIVE_SHA256"
echo "SECRET_SCAN=PASS"
echo "STATE_FILE=$OUT/14-state/STATE.json"
echo "STATE_SHA256=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["state_sha256"])' "$OUT/14-state/STATE.json")"
echo "SERVICES_RESTARTED=false"
echo "FIREWALL_CHANGED=false"
echo "DOCKER_CHANGED=false"
echo "PM2_CHANGED=false"
echo "GIT_CHANGED=false"
echo "============================================================"
