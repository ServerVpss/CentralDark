#!/usr/bin/env bash
# Exemplo: resume os últimos 200 linhas de um log
tail -n 200 "${1:-/var/log/syslog}" | darkai --system "você é SRE, seja objetivo" \
  "resuma em 5 bullets os eventos mais importantes e destaque erros"
