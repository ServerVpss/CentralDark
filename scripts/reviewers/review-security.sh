#!/usr/bin/env bash
# Guardas comuns antes de enviar diffs para qualquer revisor externo.
set -euo pipefail

REVIEW_DIFF_MAX_BYTES="${REVIEW_DIFF_MAX_BYTES:-786432}"

review_check_sensitive_paths() {
  local paths_file="$1"
  local path_regex='(^|/)(\.env($|\.)|secrets?(/|$)|tokens?(/|$)|sessions?(/|$)|\.ssh(/|$)|id_(rsa|ed25519)$)|\.(pem|key|p12|pfx)$'

  if LC_ALL=C grep -Ein "$path_regex" "$paths_file"; then
    echo "ERRO: PR contém caminho sensível; revisão externa bloqueada" >&2
    return 1
  fi
}

review_scan_diff() {
  local diff_file="$1"
  local bytes
  bytes="$(wc -c < "$diff_file" | tr -d ' ')"
  if [ "$bytes" -gt "$REVIEW_DIFF_MAX_BYTES" ]; then
    echo "ERRO: diff excede ${REVIEW_DIFF_MAX_BYTES} bytes; revisão externa bloqueada" >&2
    return 1
  fi

  # Prefixos são montados em runtime para o próprio scanner não disparar em si mesmo.
  local xai_prefix="x""ai-"
  local groq_prefix="g""sk_"
  local openai_prefix="s""k-"
  local github_prefix="g""h[pousr]_"
  local github_pat_prefix="github""_pat_"
  local google_prefix="A""Iza"
  local aws_prefix="A""KIA"
  local centraldark_prefix="cdk_""live_"
  local private_begin='-----BE'
  private_begin+='GIN '
  local private_kind='PRIVATE'
  private_kind+=' KEY-----'
  local private_key_marker="${private_begin}.*${private_kind}"
  local secret_regex
  secret_regex="(${xai_prefix}[A-Za-z0-9_-]{20,}|${groq_prefix}[A-Za-z0-9_-]{20,}|${openai_prefix}[A-Za-z0-9_-]{20,}|${github_prefix}[A-Za-z0-9_-]{20,}|${github_pat_prefix}[A-Za-z0-9_-]{20,}|${google_prefix}[A-Za-z0-9_-]{30,}|${aws_prefix}[A-Z0-9]{16}|${centraldark_prefix}[A-Za-z0-9_-]{16,}|${private_key_marker}|(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^[:space:]/:@]+:[^[:space:]@]+@)"

  if LC_ALL=C grep -Ein "$secret_regex" "$diff_file"; then
    echo "ERRO: padrão de credencial detectado; revisão externa bloqueada" >&2
    return 1
  fi
}

review_redact() {
  local xai_prefix="x""ai-"
  local groq_prefix="g""sk_"
  local openai_prefix="s""k-"
  local github_prefix="g""h[pousr]_"
  local github_pat_prefix="github""_pat_"
  local google_prefix="A""Iza"
  local centraldark_prefix="cdk_""live_"
  local private_begin='-----BE'
  private_begin+='GIN '
  local private_kind='PRIVATE'
  private_kind+=' KEY-----'
  local private_key_marker="${private_begin}.*${private_kind}"
  local key_regex
  key_regex="(${xai_prefix}|${groq_prefix}|${openai_prefix}|${github_prefix}|${github_pat_prefix}|${google_prefix}|${centraldark_prefix})[A-Za-z0-9._-]{8,}"

  sed -E 's/\x1b\[[0-9;]*[mGKHF]//g' \
    | sed -E "s/${key_regex}/<REDACTED>/g" \
    | sed -E 's/(Bearer )[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    | sed -E 's#((postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^[:space:]/:@]+:)[^[:space:]@]+@#\1<REDACTED>@#gi' \
    | sed -E "s/${private_key_marker}/<REDACTED PRIVATE KEY>/g"
}
