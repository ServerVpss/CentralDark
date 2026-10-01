#!/usr/bin/env bash
# CentralDark-OS Bootstrap Restore — validador e restaurador
# Owner: scripts/vps/ | PR-mãe: #1562
# Modo padrão: READONLY (valida sem aplicar)
# Uso:
#   bash scripts/vps/centraldark-os-bootstrap-restore.sh                          # readonly
#   CENTRALDARK_BOOTSTRAP_APPLY=1 bash scripts/vps/centraldark-os-bootstrap-restore.sh  # valida install.sh
#   CENTRALDARK_RESTORE_APPLY=1  bash scripts/vps/centraldark-os-bootstrap-restore.sh  # restaura vault
# Nunca imprime valor de segredo.
set -euo pipefail
umask 077

BOOTSTRAP_APPLY="${CENTRALDARK_BOOTSTRAP_APPLY:-0}"
RESTORE_APPLY="${CENTRALDARK_RESTORE_APPLY:-0}"
VAULT_PATH="${CENTRALDARK_VAULT_PATH:-}"
BOOTSTRAP_ENV="${CENTRALDARK_BOOTSTRAP_ENV:-}"
REPO_ROOT="${CENTRALDARK_REPO_ROOT:-/root/CentralDark}"
RESTORE_ROOT="${CENTRALDARK_RESTORE_ROOT:-/}"
RESTORE_BACKUP_DIR="${CENTRALDARK_RESTORE_BACKUP_DIR:-/root/CentralDark-restore-backup-$(date -u +%Y%m%dT%H%M%SZ)}"

CANONICAL_FILES=(
  "install.sh"
  "CENTRALDARK_AI_BOOT.yaml"
  "LEIA-ME-IA.md"
  "AGENTS.md"
)

err() { echo "ERROR: $*" >&2; }
ok()  { echo "OK: $*"; }
warn(){ echo "WARN: $*"; }

resolve_vault() {
  if [ -n "$VAULT_PATH" ] && [ -e "$VAULT_PATH" ]; then
    return 0
  fi

  if [ -n "$BOOTSTRAP_ENV" ] && [ -f "$BOOTSTRAP_ENV" ]; then
    VAULT_PATH="$(grep -oP '(?<=CENTRALDARK_VAULT_ARCHIVE=).*' "$BOOTSTRAP_ENV" || true)"
    [ -n "$VAULT_PATH" ] && [ -e "$VAULT_PATH" ] && return 0
  fi

  local latest
  latest="$(find /root/ -maxdepth 1 -type f -name 'Vault-Cofre-CentralDark-*.tar.gz' ! -name '*.tar.gz.tar.gz' -printf '%T@ %p\n' 2>/dev/null | sort -nr | awk 'NR==1{sub(/^[^ ]+ /,"");print;exit}')"
  if [ -n "$latest" ]; then
    VAULT_PATH="$latest"
    return 0
  fi

  return 1
}

validate_archive() {
  local archive="$1"
  local sha_file="${archive}.sha256"

  if [ ! -f "$archive" ]; then
    err "Archive not found: $archive"
    return 1
  fi

  if [ -f "$sha_file" ]; then
    local expected actual
    expected="$(cut -d' ' -f1 "$sha_file")"
    actual="$(sha256sum "$archive" | awk '{print $1}')"
    if [ "$expected" = "$actual" ]; then
      ok "SHA256 match: $actual"
    else
      err "SHA256 mismatch: expected=$expected actual=$actual"
      return 1
    fi
  else
    err "SHA256 file not found: $sha_file"
    return 1
  fi

  if ! tar -tzf "$archive" >/dev/null 2>&1; then
    err "Archive corrupt or not a valid tar.gz"
    return 1
  fi

  if ! python3 - "$archive" <<'PY'
import csv, hashlib, io, pathlib, re, sys, tarfile
try:
    with tarfile.open(sys.argv[1]) as archive:
        members = archive.getmembers()
        names = [m.name for m in members]
        if len(names) != len(set(names)):
            raise ValueError("DUPLICATE_MEMBERS")
        if any(pathlib.PurePosixPath(m.name).is_absolute() or ".." in pathlib.PurePosixPath(m.name).parts
               or not (m.isfile() or m.isdir()) for m in members):
            raise ValueError("UNSAFE_MEMBERS")
        manifests = [m for m in members if pathlib.PurePosixPath(m.name).name == "MANIFEST.tsv"]
        if len(manifests) != 1:
            raise ValueError("MANIFEST_REQUIRED")
        root = pathlib.PurePosixPath(manifests[0].name).parent
        files = {m.name: m for m in members if m.isfile()}
        for required in ("SHA256SUMS.txt", "BOOTSTRAP-NEXT.env"):
            if str(root / required) not in files:
                raise ValueError("INTERNAL_METADATA_REQUIRED")
        rows = list(csv.DictReader(io.StringIO(archive.extractfile(manifests[0]).read().decode()), delimiter="\t"))
        if not rows:
            raise ValueError("EMPTY_MANIFEST")
        checked = 0
        for row in rows:
            destination = pathlib.PurePosixPath(row["dest"])
            # Destinations from the canonical inventory are absolute paths inside the vault root.
            parts = destination.parts
            if root.name not in parts:
                raise ValueError("DEST_OUTSIDE_VAULT")
            relative = pathlib.PurePosixPath(*parts[parts.index(root.name) + 1:])
            if ".." in relative.parts or relative.is_absolute():
                raise ValueError("UNSAFE_DEST")
            member = files.get(str(root / relative))
            if not member or not re.fullmatch(r"[a-f0-9]{64}", row["sha256"]):
                raise ValueError("MANIFEST_BINDING_MISSING")
            content = archive.extractfile(member).read()
            if len(content) != int(row["bytes"]) or hashlib.sha256(content).hexdigest() != row["sha256"]:
                raise ValueError("MANIFEST_PAYLOAD_MISMATCH")
            checked += 1
        print("VAULT_MANIFEST_ENTRIES=" + str(checked))
        print("VAULT_PAYLOAD_HASHES=PASS")
except Exception as error:
    allowed = {"DUPLICATE_MEMBERS", "UNSAFE_MEMBERS", "MANIFEST_REQUIRED", "INTERNAL_METADATA_REQUIRED", "EMPTY_MANIFEST", "DEST_OUTSIDE_VAULT", "UNSAFE_DEST", "MANIFEST_BINDING_MISSING", "MANIFEST_PAYLOAD_MISMATCH"}
    reason = str(error) if str(error) in allowed else type(error).__name__
    print("ERROR: VAULT_PAYLOAD_INVALID=" + reason, file=sys.stderr)
    sys.exit(1)
PY
  then
    return 1
  fi
  ok "Archive valid: $archive"
  return 0
}

restore_files_from_vault() {
  local archive="$1"
  local restore_root="$2"
  local backup_dir="$3"

  python3 - "$archive" "$restore_root" "$backup_dir" <<'PY'
import csv, hashlib, io, os, pathlib, shutil, sys, tarfile, tempfile

archive_path, restore_root_raw, backup_raw = sys.argv[1:4]
restore_root = pathlib.Path(restore_root_raw).resolve()
backup_root = pathlib.Path(backup_raw).resolve()
allowed_prefixes = (
    "/root/secrets", "/root/.centraldark-secrets", "/root/.centraldark",
    "/root/CentralDark/secrets", "/root/CentralDark", "/root/.cloudflared",
    "/root/.ssh", "/root/.pm2", "/root/.config", "/root/.claude",
    "/root/.claude_conta1", "/root/.claude_conta2", "/root/.codex",
    "/root/.cline", "/root/.gemini", "/root/.grok", "/root/.cursor",
    "/root/.hermes", "/root/.supabase", "/root/.docker",
)

def safe_source(value):
    p = pathlib.PurePosixPath(value)
    if not p.is_absolute() or ".." in p.parts:
        return None
    s = str(p)
    if not any(s == prefix or s.startswith(prefix + "/") for prefix in allowed_prefixes):
        return None
    return p

def rooted(source):
    rel = pathlib.Path(*source.parts[1:])
    return (restore_root / rel).resolve()

with tarfile.open(archive_path) as archive:
    members = archive.getmembers()
    manifests = [m for m in members if pathlib.PurePosixPath(m.name).name == "MANIFEST.tsv"]
    if len(manifests) != 1:
        raise SystemExit("RESTORE_FAIL=MANIFEST_REQUIRED")
    manifest = manifests[0]
    vault_root = pathlib.PurePosixPath(manifest.name).parent
    files = {m.name: m for m in members if m.isfile()}
    rows = list(csv.DictReader(io.StringIO(archive.extractfile(manifest).read().decode()), delimiter="\t"))

    plan = []
    skipped_process_env = 0
    for row in rows:
        if row.get("kind") != "file":
            skipped_process_env += 1
            continue
        source = safe_source(row.get("source", ""))
        if source is None:
            raise SystemExit("RESTORE_FAIL=SOURCE_OUTSIDE_ALLOWLIST")
        vault_dest = pathlib.PurePosixPath(row["dest"])
        parts = vault_dest.parts
        if vault_root.name not in parts:
            raise SystemExit("RESTORE_FAIL=DEST_OUTSIDE_VAULT")
        relative = pathlib.PurePosixPath(*parts[parts.index(vault_root.name) + 1:])
        member = files.get(str(vault_root / relative))
        if member is None:
            raise SystemExit("RESTORE_FAIL=MANIFEST_BINDING_MISSING")
        payload = archive.extractfile(member).read()
        if hashlib.sha256(payload).hexdigest() != row["sha256"] or len(payload) != int(row["bytes"]):
            raise SystemExit("RESTORE_FAIL=PAYLOAD_MISMATCH")
        target = rooted(source)
        try:
            target.relative_to(restore_root)
        except ValueError:
            raise SystemExit("RESTORE_FAIL=TARGET_ESCAPE")
        plan.append((source, target, payload))

    if not plan:
        raise SystemExit("RESTORE_FAIL=NO_FILE_ROWS")

    backup_root.mkdir(parents=True, exist_ok=True)
    restored = 0
    for source, target, payload in plan:
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            backup_target = backup_root / pathlib.Path(*source.parts[1:])
            backup_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup_target)
        fd, tmp_name = tempfile.mkstemp(prefix=".centraldark-restore-", dir=str(target.parent))
        try:
            with os.fdopen(fd, "wb") as out:
                out.write(payload)
                out.flush()
                os.fsync(out.fileno())
            os.chmod(tmp_name, 0o600)
            os.replace(tmp_name, target)
        finally:
            if os.path.exists(tmp_name):
                os.unlink(tmp_name)
        if hashlib.sha256(target.read_bytes()).hexdigest() != hashlib.sha256(payload).hexdigest():
            raise SystemExit("RESTORE_FAIL=POST_WRITE_HASH_MISMATCH")
        restored += 1

print("RESTORE_FILES_APPLIED=" + str(restored))
print("RESTORE_PROCESS_ENV_SKIPPED=" + str(skipped_process_env))
print("RESTORE_POST_WRITE_HASHES=PASS")
PY
}

validate_canonical() {
  local source="$1"
  local missing=0

  for f in "${CANONICAL_FILES[@]}"; do
    if [ -f "$source/$f" ]; then
      ok "Canonical found: $f"
    else
      err "Canonical missing: $f"
      missing=$((missing + 1))
    fi
  done

  return "$missing"
}

validate_bootstrap_env() {
  local env_dir="$1"
  local env_file

  env_file="$(find "$env_dir" -name 'BOOTSTRAP-NEXT.env' -type f 2>/dev/null | head -1)"
  if [ -z "$env_file" ]; then
    warn "BOOTSTRAP-NEXT.env not found in vault"
    return 1
  fi

  ok "BOOTSTRAP-NEXT.env found: $env_file"
  grep -v '=' "$env_file" >/dev/null 2>&1 || true
  grep -c '=' "$env_file" | xargs -I{} echo "  entries: {}"
  return 0
}

main() {
  echo "=== CentralDark-OS Bootstrap Restore ==="
  echo "MODE=$([ "$RESTORE_APPLY" = "1" ] && echo "RESTORE_APPLY" || ([ "$BOOTSTRAP_APPLY" = "1" ] && echo "BOOTSTRAP_APPLY" || echo "READONLY"))"
  echo "TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)"
  echo ""

  local vault_ok=0
  local canonical_ok=0
  local installer_found="NO"
  local archive_info="NONE"
  local archive_sha="NONE"

  if resolve_vault; then
    archive_info="$VAULT_PATH"
    if validate_archive "$VAULT_PATH"; then
      vault_ok=1
      archive_sha="$(sha256sum "$VAULT_PATH" | awk '{print $1}')"


    fi
  else
    warn "No vault archive found"
  fi

  echo ""
  echo "--- Canonical files check (repo: $REPO_ROOT) ---"
  if validate_canonical "$REPO_ROOT"; then
    canonical_ok=1
  fi

  if [ -x "$REPO_ROOT/install.sh" ]; then
    installer_found="YES"
    ok "install.sh is executable"
  elif [ -f "$REPO_ROOT/install.sh" ]; then
    installer_found="YES_NOT_EXECUTABLE"
    warn "install.sh exists but not executable"
  fi

  if [ "$BOOTSTRAP_APPLY" = "1" ] && [ "$installer_found" = "YES" ]; then
    echo ""
    echo "--- Running install.sh --check ---"
    bash "$REPO_ROOT/install.sh" --check 2>&1 || true
  fi

  local restore_applied=0
  if [ "$RESTORE_APPLY" = "1" ]; then
    echo ""
    echo "--- Restore proven file payloads from vault ---"
    if [ "$vault_ok" != "1" ] || [ "$canonical_ok" != "1" ]; then
      err "RESTORE_BLOCKED: vault/canonical validation must PASS before apply"
      return 2
    fi
    if restore_files_from_vault "$VAULT_PATH" "$RESTORE_ROOT" "$RESTORE_BACKUP_DIR"; then
      restore_applied=1
      ok "Restore apply completed with post-write hash verification"
    else
      err "RESTORE_APPLY_FAILED"
      return 2
    fi
  fi

  echo ""
  echo "=== RECEIPT ==="
  echo "BOOTSTRAP_VALIDATE=$([ "$canonical_ok" = "1" ] && echo "PASS" || echo "FAIL")"
  echo "VAULT_ARCHIVE=$archive_info"
  echo "VAULT_SHA256=$archive_sha"
  echo "INSTALLER_FOUND=$installer_found"
  echo "RESTORE_MODE=$([ "$RESTORE_APPLY" = "1" ] && echo "APPLY" || echo "READONLY")"
  echo "CANONICAL_FILES_OK=$canonical_ok"
  echo "VAULT_OK=$vault_ok"
  echo "NEXT_STEP=$(
    if [ "$vault_ok" = "0" ]; then
      echo "RUN_VAULT_INVENTORY_FIRST"
    elif [ "$canonical_ok" = "0" ]; then
      echo "FIX_MISSING_CANONICAL_FILES"
    elif [ "$RESTORE_APPLY" = "1" ] && [ "$restore_applied" = "1" ]; then
      echo "HYDRATE_PROCESS_ENV_AND_VERIFY_RUNTIME"
    else
      echo "READY_FOR_RESTORE_APPLY"
    fi
  )"
  echo "RESTORE_APPLIED=$restore_applied"
  [ "$canonical_ok" = "1" ] && [ "$vault_ok" = "1" ] && { [ "$RESTORE_APPLY" = "0" ] || [ "$restore_applied" = "1" ]; }
}

main "$@"
