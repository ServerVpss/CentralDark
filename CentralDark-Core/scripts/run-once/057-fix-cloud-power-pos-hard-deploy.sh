#!/bin/bash
set -euo pipefail

cd /root/Multizap/apps/clone-deck || exit 1

TS="$(date +%Y%m%d-%H%M%S)"
BASE="/root/Multizap/revisoes/$TS/057-fix-cloud-power-pos-hard-deploy"
mkdir -p "$BASE/logs" "$BASE/raw" "$BASE/backups" "$BASE/reports"

exec > >(tee -a "$BASE/logs/execucao.log") 2>&1

BOT_APP="/root/Multizap/apps/clone-deck/apps/bot"
BOT_ROOT="/var/www/multizap/bot"
FILE="$BOT_APP/src/pages/Instances.tsx"

echo "=================================================="
echo "057 - FIX Cloud/Power após hard deploy"
echo "=================================================="
echo "base=$BASE"

echo ""
echo "== 1. Backup do arquivo atual =="
cp "$FILE" "$BASE/backups/Instances.tsx.before-$TS"

echo ""
echo "== 2. Imports antes =="
grep -nE "lucide-react|Cloud|Power|RefreshCw|QrCode|Settings|Settings2" "$FILE" | head -140 || true

echo ""
echo "== 3. Garantir Cloud e Power no import lucide-react =="
node - "$FILE" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
let s = fs.readFileSync(file, "utf8");

const re = /import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'];/m;
const m = s.match(re);

if (!m) {
  console.error("ERRO: import de lucide-react não encontrado.");
  process.exit(1);
}

const original = m[0];
const inside = m[1];

const names = inside
  .split(",")
  .map(x => x.trim())
  .filter(Boolean);

for (const needed of ["Cloud", "Power"]) {
  if (!names.includes(needed)) names.push(needed);
}

const unique = Array.from(new Set(names)).sort();

const replacement = `import {\n  ${unique.join(",\n  ")}\n} from "lucide-react";`;

s = s.replace(original, replacement);
fs.writeFileSync(file, s);

console.log("Cloud_importado=" + (unique.includes("Cloud") ? "SIM" : "NAO"));
console.log("Power_importado=" + (unique.includes("Power") ? "SIM" : "NAO"));
NODE

echo ""
echo "== 4. Imports depois =="
grep -nE "lucide-react|Cloud|Power|RefreshCw|QrCode|Settings|Settings2" "$FILE" | head -160 || true

echo ""
echo "== 5. Build do BOT =="
cd "$BOT_APP" || exit 1

rm -rf dist build .vite .turbo

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build

echo ""
echo "== 6. Validar build =="
BUILD_DIR="$BOT_APP/dist"

if [ ! -f "$BUILD_DIR/index.html" ]; then
  echo "ERRO: dist/index.html não existe."
  exit 2
fi

grep -oE '/assets/[^"]+' "$BUILD_DIR/index.html" | tee "$BASE/raw/index-assets.txt" || true

MISSING_ASSET="NAO"

while IFS= read -r asset; do
  [ -z "$asset" ] && continue
  path="$BUILD_DIR$asset"
  if [ ! -f "$path" ]; then
    echo "ASSET_FALTANDO: $path"
    MISSING_ASSET="SIM"
  else
    echo "asset_ok: $path"
  fi
done < "$BASE/raw/index-assets.txt"

if [ "$MISSING_ASSET" = "SIM" ]; then
  echo "ERRO: asset faltando. Não vou publicar."
  exit 3
fi

echo ""
echo "== 7. Backup da produção atual =="
PROD_BACKUP="/var/www/multizap/bot_backup_before_057_$TS"
cp -a "$BOT_ROOT" "$PROD_BACKUP"
echo "Backup criado: $PROD_BACKUP"

echo ""
echo "== 8. Publicar build corrigido =="
rm -rf "${BOT_ROOT:?}/"*
cp -a "$BUILD_DIR"/. "$BOT_ROOT"/
chmod -R 755 "$BOT_ROOT"

echo ""
echo "== 9. Validar produção =="
curl -sS -I https://bot.multizap.dev --max-time 20 | tee "$BASE/raw/http-root.txt" || true
curl -sS -I https://bot.multizap.dev/instancias --max-time 20 | tee "$BASE/raw/http-instancias.txt" || true

grep -RInE "Cloud|Power|Forçar Logout|Reconectar / Gerar QR|Central de Conexões" \
  "$BOT_ROOT" \
  2>/dev/null \
  | tee "$BASE/raw/prod-string-check.txt" \
  | head -80 || true

HTTP_OK="NAO"
grep -qE "HTTP/2 200|HTTP/1.1 200" "$BASE/raw/http-root.txt" && HTTP_OK="SIM"

echo ""
echo "== 10. Commit e push da correção =="
cd /root/Multizap/apps/clone-deck || exit 1

git status --short | tee "$BASE/raw/git-status-before-commit.txt"

git add apps/bot/src/pages/Instances.tsx
git commit -m "fix(bot): preserve Cloud and Power lucide imports" || echo "Nada novo para commit."
git push origin main || echo "WARN: push falhou. Revisar remoto."

git log -6 --oneline --decorate | tee "$BASE/raw/git-log-after.txt"

echo ""
echo "=================================================="
echo "== 99. RESUMO PARA COLAR NO CHATGPT =="
echo "=================================================="

SUMMARY="$BASE/reports/RESUMO_PARA_CHATGPT.txt"

{
  echo "RODEI O SCRIPT: 057-fix-cloud-power-pos-hard-deploy"
  echo ""
  echo "📍 FASE:"
  echo "Corrigir novamente Cloud/Power após hard deploy ter republicado bundle quebrado"
  echo ""
  echo "✅ PROVAS:"
  echo "- Arquivo corrigido: $FILE"
  echo "- Build gerado: $BUILD_DIR"
  echo "- Assets faltando?: $MISSING_ASSET"
  echo "- HTTP bot.multizap.dev OK?: $HTTP_OK"
  echo "- Backup produção: $PROD_BACKUP"
  echo ""
  echo "🎯 PRÓXIMA DECISÃO:"
  echo "Abrir bot.multizap.dev/instancias com CTRL+F5/aba anônima e confirmar que sumiu Cloud/Power is not defined."
  echo ""
  echo "📁 BASE:"
  echo "$BASE"
  echo "=================================================="
} | tee "$SUMMARY"

