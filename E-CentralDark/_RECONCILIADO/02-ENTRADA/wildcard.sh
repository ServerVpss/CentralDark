#!/usr/bin/env bash
# ============================================================================
#  lib/wildcard.sh — Validação de DNS wildcard (@, www, *).
#  Faz polling até propagar OU dar timeout. Prova que o `*` está vivo
#  usando um subdomínio aleatório (probe-xxxx.<zona>).
#  Depende de: dig, lib/ui.sh
# ============================================================================

WC_TIMEOUT="${WC_TIMEOUT:-300}"   # segundos
WC_INTERVAL="${WC_INTERVAL:-10}"  # segundos entre tentativas
WC_RESOLVERS=("1.1.1.1" "8.8.8.8" "9.9.9.9")

wc_dig_a() {
  # Resolve em vários resolvers, devolve o primeiro IP A que encontrar.
  local fqdn="$1" r ip
  for r in "${WC_RESOLVERS[@]}"; do
    ip="$(dig +short +time=3 +tries=1 A "$fqdn" "@${r}" 2>/dev/null | grep -E '^[0-9.]+$' | head -1)"
    [ -n "$ip" ] && { echo "$ip"; return 0; }
  done
  return 1
}

wc_show_records_box() {
  local zone="$1" ip="$2"
  cat <<EOF

  ┌────────────────────────────────────────────────────┐
  │  Cadastra no painel DNS do domínio "${zone}":      │
  │                                                    │
  │    www   A   ${ip}                                 │
  │    @     A   ${ip}                                 │
  │    *     A   ${ip}                                 │
  │                                                    │
  │  Só isso. Não precisa cadastrar nada além disso.   │
  └────────────────────────────────────────────────────┘

EOF
}

# Testa um nome até obter o IP esperado ou dar timeout.
# Args: fqdn ip_esperado timeout_seg label
wc_wait_one() {
  local fqdn="$1" expected="$2" timeout="${3:-$WC_TIMEOUT}" label="${4:-$fqdn}"
  local end=$(( $(date +%s) + timeout ))
  local current
  while [ "$(date +%s)" -lt "$end" ]; do
    current="$(wc_dig_a "$fqdn" || true)"
    if [ "$current" = "$expected" ]; then
      ui_ok "${label} → ${current}"
      return 0
    fi
    printf "  ${UI_DIM}aguardando ${label} (atual: %s, esperado: %s)...${UI_RST}\n" "${current:-vazio}" "$expected"
    sleep "$WC_INTERVAL"
  done
  ui_err "${label} não propagou em ${timeout}s (atual: ${current:-vazio})"
  return 1
}

# Valida @, www e probe aleatório para *. Retorna 0 se todos OK.
wc_validate_wildcard() {
  local zone="$1" ip="$2" timeout="${3:-$WC_TIMEOUT}"
  local probe="probe-$(openssl rand -hex 4 2>/dev/null || date +%s).${zone}"
  ui_info "Validando DNS wildcard (timeout ${timeout}s por registro)..."
  ui_info "Probe wildcard: ${probe}"

  local fails=0
  wc_wait_one "$zone"        "$ip" "$timeout" "@   (${zone})"          || fails=$((fails+1))
  wc_wait_one "www.${zone}"  "$ip" "$timeout" "www (www.${zone})"      || fails=$((fails+1))
  wc_wait_one "$probe"       "$ip" "$timeout" "*   (probe wildcard)"   || fails=$((fails+1))

  if [ "$fails" -eq 0 ]; then
    ui_ok "DNS wildcard validado — @, www e * apontam pra ${ip}"
    return 0
  fi
  ui_err "${fails} registro(s) não propagaram. Confere no painel DNS."
  return 1
}
