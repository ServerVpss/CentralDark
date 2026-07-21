#!/usr/bin/env bash

set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"
VALIDATOR="$SCRIPT_DIR/validate-migrations.sh"

MODE="dry-run"
EXPECTED_CHECKSUM=""

usage() {
  cat <<'USAGE'
Uso:
  apply-migrations-vps.sh --checksum <sha256> [--dry-run]
  ALLOW_PRODUCTION_MIGRATIONS=YES_I_UNDERSTAND \
    apply-migrations-vps.sh --checksum <sha256> --apply

O modo padrao e dry-run. --apply exige confirmacao explicita por variavel de ambiente.
USAGE
}

fail() {
  printf 'ERRO: %s\n' "$*" >&2
  exit 1
}

while (( $# > 0 )); do
  case "$1" in
    --checksum)
      [[ $# -ge 2 ]] || fail "--checksum exige um valor"
      EXPECTED_CHECKSUM="$2"
      shift 2
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      fail "argumento desconhecido: $1"
      ;;
  esac
done

[[ "$EXPECTED_CHECKSUM" =~ ^[a-f0-9]{64}$ ]] || fail "checksum SHA-256 obrigatorio e invalido"
[[ -f "$VALIDATOR" ]] || fail "validador ausente: $VALIDATOR"
command -v git >/dev/null || fail "git nao encontrado"
command -v supabase >/dev/null || fail "Supabase CLI nao encontrada"

git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || fail "repositorio Git nao encontrado"

if ! git -C "$REPO_ROOT" diff --quiet \
  || ! git -C "$REPO_ROOT" diff --cached --quiet \
  || [[ -n "$(git -C "$REPO_ROOT" ls-files --others --exclude-standard)" ]]; then
  fail "working tree suja; operacao bloqueada"
fi

CURRENT_BRANCH="$(git -C "$REPO_ROOT" branch --show-current)"
[[ "$CURRENT_BRANCH" == "main" ]] || fail "branch atual nao e main; operacao bloqueada"

HEAD_SHA="$(git -C "$REPO_ROOT" rev-parse HEAD)"
UPSTREAM_SHA="$(git -C "$REPO_ROOT" rev-parse '@{upstream}' 2>/dev/null)" \
  || fail "branch main sem upstream configurado"
[[ "$HEAD_SHA" == "$UPSTREAM_SHA" ]] \
  || fail "main local diverge do upstream; operacao bloqueada"

validation_output="$(bash "$VALIDATOR" "$MIGRATIONS_DIR")"
CURRENT_CHECKSUM="$(printf '%s\n' "$validation_output" | awk -F= '/^CHECKSUM=/{print $2}')"
[[ -n "$CURRENT_CHECKSUM" ]] || fail "validador nao retornou checksum"
[[ "$CURRENT_CHECKSUM" == "$EXPECTED_CHECKSUM" ]] \
  || fail "checksum divergente; operacao bloqueada"

RUN_DIR="$(mktemp -d /tmp/centraldark-supabase-migrations.XXXXXX)"
tar -C "$REPO_ROOT" -czf "$RUN_DIR/migrations.tar.gz" supabase/migrations
supabase migration list >"$RUN_DIR/migration-list-before.log" 2>&1 \
  || fail "nao foi possivel consultar o historico remoto; veja $RUN_DIR/migration-list-before.log"

supabase db push --dry-run >"$RUN_DIR/db-push-dry-run.log" 2>&1 \
  || fail "dry-run falhou; veja $RUN_DIR/db-push-dry-run.log"

if [[ "$MODE" == "dry-run" ]]; then
  printf 'OK: dry-run concluido; nenhuma migration foi aplicada\n'
  printf 'CHECKSUM=%s\n' "$CURRENT_CHECKSUM"
  printf 'EVIDENCIA=%s\n' "$RUN_DIR"
  exit 0
fi

[[ "${ALLOW_PRODUCTION_MIGRATIONS:-}" == "YES_I_UNDERSTAND" ]] \
  || fail "--apply bloqueado; falta confirmacao explicita"

supabase db push >"$RUN_DIR/db-push-apply.log" 2>&1 \
  || fail "aplicacao falhou; veja $RUN_DIR/db-push-apply.log"

supabase migration list >"$RUN_DIR/migration-list-after.log" 2>&1 \
  || fail "aplicacao concluida, mas validacao remota falhou; veja $RUN_DIR/migration-list-after.log"

printf 'OK: migrations aplicadas e historico remoto consultado\n'
printf 'CHECKSUM=%s\n' "$CURRENT_CHECKSUM"
printf 'EVIDENCIA=%s\n' "$RUN_DIR"
