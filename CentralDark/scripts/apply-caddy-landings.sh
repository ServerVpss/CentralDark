#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Aplica o snippet das landings CentralDark no Caddy da VPS.
#
# O que faz:
#   1. Copia infra/caddy/landings-centraldark.Caddyfile pra /etc/caddy/conf.d/
#      (se /etc/caddy/conf.d/ não existir, anexa direto no /etc/caddy/Caddyfile
#      com marcadores únicos pra ser re-executável sem duplicar).
#   2. Valida a config (caddy validate).
#   3. Faz reload sem downtime (systemctl reload caddy).
#
# Uso na VPS:
#   cd /root/CentralDark/apps/modulos/telepainel
#   sudo bash scripts/apply-caddy-landings.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SNIPPET_SRC="$REPO_DIR/infra/caddy/landings-centraldark.Caddyfile"

if [[ ! -f "$SNIPPET_SRC" ]]; then
	echo "❌ Snippet não encontrado em $SNIPPET_SRC"
	exit 1
fi

MARK_START="# >>> landings-centraldark BEGIN (gerenciado pelo TelePainel) >>>"
MARK_END="# <<< landings-centraldark END <<<"

if [[ -d /etc/caddy/conf.d ]]; then
	echo "📁 Usando /etc/caddy/conf.d/landings-centraldark.Caddyfile"
	install -m 0644 "$SNIPPET_SRC" /etc/caddy/conf.d/landings-centraldark.Caddyfile
else
	echo "📝 Anexando snippet em /etc/caddy/Caddyfile (com marcadores)"
	CADDYFILE=/etc/caddy/Caddyfile
	cp -a "$CADDYFILE" "$CADDYFILE.bak.$(date +%Y%m%d-%H%M%S)"
	# Remove bloco antigo se já estava aplicado, pra ser idempotente
	if grep -qF "$MARK_START" "$CADDYFILE"; then
		sed -i "/$(printf '%s' "$MARK_START" | sed 's/[\/&]/\\&/g')/,/$(printf '%s' "$MARK_END" | sed 's/[\/&]/\\&/g')/d" "$CADDYFILE"
	fi
	{
		echo ""
		echo "$MARK_START"
		cat "$SNIPPET_SRC"
		echo "$MARK_END"
	} >> "$CADDYFILE"
fi

echo "🔎 Validando Caddyfile..."
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

echo "♻️  Recarregando Caddy..."
systemctl reload caddy

echo "✅ Pronto! Landings ativas em:"
echo "   https://centralldark.com         (home)"
echo "   https://whatsapp.centralldark.com"
echo "   https://crm.centralldark.com"
echo "   https://financeiro.centralldark.com"
echo ""
echo "⚠️  Lembrete: os 4 domínios precisam ter A record apontando pra IP da VPS."
echo "    O Caddy emite SSL sozinho assim que o DNS resolver."
