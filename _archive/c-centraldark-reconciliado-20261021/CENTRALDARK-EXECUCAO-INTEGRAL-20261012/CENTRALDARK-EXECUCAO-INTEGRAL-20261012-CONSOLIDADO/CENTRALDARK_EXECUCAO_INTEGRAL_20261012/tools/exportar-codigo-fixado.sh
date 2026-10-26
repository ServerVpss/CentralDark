#!/usr/bin/env bash
set -Eeuo pipefail
export LC_ALL=C
REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
DEST="${1:-}"
[[ -n "$DEST" ]] || { echo 'Uso: exportar-codigo-fixado.sh DIRETORIO_DE_SAIDA'; exit 64; }
[[ -d "$REPO/.git" ]] || { echo 'BLOCKED: checkout Git ausente';exit 65; }
mkdir -p "$DEST"
# Extrai por commit existente, nunca usa working tree dirty. Falha em falta de objeto.
export_one() {
 local ref="$1" path="$2" out="$DEST/$2" blob="$3" now
 git -C "$REPO" cat-file -e "${ref}^{commit}" || { echo "BLOCKED: commit não materializado $ref"; return 65; }
 now="$(git -C "$REPO" rev-parse "$ref:$path")"
 [[ "$now" == "$blob" ]] || { echo "BLOCKED: blob divergente $path expected=$blob actual=$now";return 65; }
 mkdir -p "$(dirname "$out")"
 git -C "$REPO" show "$ref:$path" >"$out"
 [[ "$(git -C "$REPO" hash-object "$out")" == "$blob" ]] || { echo "BLOCKED: readback não corresponde $path";return 65; }
 printf '🟢 EXPORTED %s blob=%s\n' "$path" "$blob"
}
export_one 9f516fbe7842aa56b2be93a7f5021208cfc06b16 apps/modulos/mcp/src/tools/core/mcp-admin.js 12f4c9cc6f49cc16757f99f5b1dccfbcfdbcd405
export_one 9277a9ff41c7b341411fe6465186231554116904 scripts/centraldark-inventory-reconcile.sh 4a70ed98f37990e0f099dfbed9b1eb419bc53e31
export_one 9f516fbe7842aa56b2be93a7f5021208cfc06b16 apps/modulos/mcp/src/lib/admin-guard.js 9958926325a247c09f0dd97ba026cfb1969459d7
export_one 9f516fbe7842aa56b2be93a7f5021208cfc06b16 apps/modulos/mcp/tests/admin-guard-core.test.mjs 668841fe6a7ff3b7de68891f1c70505d326a5542
# Pulso antigo exato como entrada de prova; preservar working tree modificada.
export_one 9f516fbe7842aa56b2be93a7f5021208cfc06b16 scripts/vps/main-pulse-reconciler.sh 1588c0d7c5717e2843611f6ae01b4e22b3b45c1a
printf '🧾 SNAPSHOTS_DONE=%s (nenhum runtime alterado)\n' "$DEST"
