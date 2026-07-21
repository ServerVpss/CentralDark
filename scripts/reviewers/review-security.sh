#!/usr/bin/env bash
# Guardas comuns antes de enviar diffs para qualquer revisor externo.
set -euo pipefail

REVIEW_DIFF_MAX_BYTES="${REVIEW_DIFF_MAX_BYTES:-786432}"

review_check_sensitive_paths() {
  local paths_file="$1"
  local path_regex='(^|/)(\.env($|\.)|secrets?(/|$)|tokens?(/|$)|sessions?(/|$)|\.ssh(/|$)|id_(rsa|ed25519)$)|\.(pem|key|p12|pfx)$'

  if LC_ALL=C grep -Eiq -- "$path_regex" "$paths_file"; then
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

  local xai_prefix="x""ai-"
  local groq_prefix="g""sk_"
  local openai_prefix="s""k-"
  local github_prefix="g""h[pousr]_"
  local github_pat_prefix="github""_pat_"
  local google_prefix="A""Iza"
  local aws_prefix="A""KIA"
  local centraldark_prefix="cdk_""live_"
  local secret_regex
  secret_regex="(${xai_prefix}[A-Za-z0-9_-]{20,}|${groq_prefix}[A-Za-z0-9_-]{20,}|${openai_prefix}[A-Za-z0-9_-]{20,}|${github_prefix}[A-Za-z0-9_-]{20,}|${github_pat_prefix}[A-Za-z0-9_-]{20,}|${google_prefix}[A-Za-z0-9_-]{30,}|${aws_prefix}[A-Z0-9]{16}|${centraldark_prefix}[A-Za-z0-9_-]{16,}|(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^[:space:]/:@]+:[^[:space:]@]+@)"

  if LC_ALL=C grep -Eiq -- "$secret_regex" "$diff_file"; then
    echo "ERRO: padrão de credencial detectado; revisão externa bloqueada" >&2
    return 1
  fi

  # Um texto explicando "BEGIN PRIVATE KEY" não é uma chave.
  # Só bloqueia quando o cabeçalho vem acompanhado de corpo codificado.
  if ! python3 - "$diff_file" <<'PY'
import re
import sys
from pathlib import Path

text = Path(sys.argv[1]).read_text(encoding="utf-8", errors="ignore")
pattern = re.compile(
    r"(?m)^[+-]?-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----\r?$"
    r"\n^[+-]?[A-Za-z0-9+/=]{20,}\r?$"
)
sys.exit(1 if pattern.search(text) else 0)
PY
  then
    echo "ERRO: conteúdo de chave privada detectado; revisão externa bloqueada" >&2
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
  local aws_prefix="A""KIA"
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
    | sed -E "s/${aws_prefix}[A-Z0-9]{16}/<REDACTED>/g" \
    | sed -E 's/eyJ[A-Za-z0-9._-]{20,}/<REDACTED JWT>/g' \
    | sed -E 's/(Bearer )[A-Za-z0-9._-]+/\1<REDACTED>/gi' \
    | sed -E 's#((postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^[:space:]/:@]+:)[^[:space:]@]+@#\1<REDACTED>@#gi' \
    | sed -E "s/${private_key_marker}/<REDACTED PRIVATE KEY>/g"
}
