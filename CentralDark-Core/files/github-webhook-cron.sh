#!/usr/bin/env bash
set -euo pipefail
WEBHOOK_LIST=/root/centraldark/webhooks.list
LOGDIR=/root/logs
LOGFILE="$LOGDIR/webhook-health-$(/bin/date +%Y%m%d).log"
mkdir -p "$LOGDIR" /root/centraldark
if [ ! -f "$WEBHOOK_LIST" ]; then
  echo "# Add one webhook URL per line" > "$WEBHOOK_LIST"
  echo "# e.g. https://example.com/webhook" >> "$WEBHOOK_LIST"
fi
while IFS= read -r url || [ -n "$url" ]; do
  url_trim=$(echo "$url" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  if [ -z "$url_trim" ] || [[ "$url_trim" == \#* ]]; then
    continue
  fi
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  http=$(curl -s -o /dev/null -w "%{http_code}" -m 15 -X POST -H "Content-Type: application/json" -d "{\"source\":\"centraldark-cron\",\"test\":\"ping\",\"ts\":\"$ts\"}" "$url_trim" || echo "000")
  echo "$ts $url_trim $http" >> "$LOGFILE"
done < "$WEBHOOK_LIST"
