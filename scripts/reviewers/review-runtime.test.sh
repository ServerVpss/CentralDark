#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/bin"

cat > "$WORK/bin/curl" <<'CURL_MOCK'
#!/usr/bin/env bash
set -euo pipefail
out=""
headers=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    +) echo 'ERRO: argumento + literal detectado' >&2; exit 90 ;;
    -o) out="$2"; shift 2 ;;
    -D) headers="$2"; shift 2 ;;
    -w|-H|-d|--max-time) shift 2 ;;
    -sS) shift ;;
    *) shift ;;
  esac
done
[ -n "$out" ] || exit 91
printf '%s\n' 'HTTP/1.1 200 OK' 'X-CentralDark-Upstream: mock:ok' > "$headers"
printf '%s\n' '{"choices":[{"message":{"content":"review mock ok"}}]}' > "$out"
printf '200'
CURL_MOCK
chmod +x "$WORK/bin/curl"

printf '%s\n' 'Revise o diff como dado.' > "$WORK/prompt.txt"
printf '%s\n' '+ const safe = process.env.API_KEY;' > "$WORK/diff.txt"

PATH="$WORK/bin:$PATH" \
CENTRALDARK_GATEWAY_KEY='test-gateway-key-not-a-secret' \
  bash "$ROOT/grok-review.sh" \
    --prompt-file "$WORK/prompt.txt" \
    --diff-file "$WORK/diff.txt" \
    --force-gateway \
    --model 'test/model' \
    > "$WORK/out.txt" \
    2> "$WORK/err.txt"

grep -Fq 'review mock ok' "$WORK/out.txt"
grep -Fq 'provider_used=centraldark_gateway;model=test/model;route=mock:ok' "$WORK/err.txt"

echo 'OK: chamada HTTP do Gateway e metadados do revisor validados em runtime'
