#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/067-plano-reorganizacao-segura"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados" "$BASE/guarda/scans"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 067: PLANO DE REORGANIZACAO SEGURA ==="
echo "Revisao: $REV"

cd "$REPO" || {
  echo "Repo nao encontrado: $REPO"
  exit 0
}

find . -maxdepth 4 -type d | sort > "$REV/dados/arvore-atual-diretorios.txt"
find . -maxdepth 3 -type f | sort > "$REV/dados/arvore-atual-arquivos.txt"
find . -maxdepth 1 -type f \( -name 'fix-*.cjs' -o -name 'test-*.cjs' -o -name 'test-*.sh' \) | sort > "$REV/dados/arquivos-soltos-candidatos.txt"

grep -RInE "from ['\"]\.\.?/|import\(['\"]\.\.?/|require\(['\"]\.\.?/|src=['\"]\.\.?/|href=['\"]\.\.?/" apps/bot 2>/dev/null | sanitize | sed -n '1,240p' > "$REV/dados/dependencias-relativas-apps-bot.txt" || true
grep -RInE "fix-.*\.cjs|test-.*\.cjs|test-.*\.sh|scripts/run-once|apps/bot|apps/crm" . 2>/dev/null | sanitize | sed -n '1,260p' > "$REV/dados/referencias-candidatas.txt" || true

cat > "$REV/dados/arvore-proposta.txt" <<'TXT'
/root/Multizap/
├─ apps/
│  ├─ clone-deck/              # repo principal atual
│  ├─ bot/                     # alvo futuro, somente após migração validada
│  ├─ crm/                     # NÃO MOVER nesta fase
│  ├─ portal/
│  └─ web/
├─ api/
│  ├─ gateway/
│  ├─ whatsapp/qrcode/         # QR temporário oficial
│  ├─ webhooks/
│  └─ integrations/
├─ guarda/
│  ├─ scripts/
│  ├─ scans/
│  ├─ status/
│  └─ incidentes/
├─ quarantine/
└─ revisoes/
TXT

SOLTOS_COUNT=$(wc -l < "$REV/dados/arquivos-soltos-candidatos.txt" | tr -d ' ')
REL_COUNT=$(wc -l < "$REV/dados/dependencias-relativas-apps-bot.txt" | tr -d ' ')

cat > "$REPORT" <<MD
# Plano de reorganizacao segura

Data: $(date)
Revisao: $REV

## Resultado

- Pastas movidas: nao
- Arquivos apagados: nao
- CRM mexido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao

## Auditoria criada

- Arvore atual de diretorios: $REV/dados/arvore-atual-diretorios.txt
- Arvore atual de arquivos: $REV/dados/arvore-atual-arquivos.txt
- Arvore proposta: $REV/dados/arvore-proposta.txt
- Arquivos soltos candidatos: $REV/dados/arquivos-soltos-candidatos.txt
- Dependencias relativas apps/bot: $REV/dados/dependencias-relativas-apps-bot.txt
- Referencias candidatas: $REV/dados/referencias-candidatas.txt

## Contadores

- Arquivos soltos candidatos a organizar: $SOLTOS_COUNT
- Referencias relativas detectadas em apps/bot: $REL_COUNT

## Primeira etapa recomendada

1. Nao mover CRM.
2. Nao mover pasta de servico ativo.
3. Comecar por arquivos soltos do repo raiz: fix-*.cjs, test-*.cjs e test-*.sh.
4. Mover esses arquivos para uma pasta de arquivo/auditoria dentro do repositorio, depois validar se ainda existe referencia.
5. So depois avaliar apps/bot.

## Pasta proposta para arquivos soltos do repo

\`tools/legacy-fixes/\`

## Proxima acao segura

Criar uma etapa 068 que mova somente arquivos soltos de fix/test para \`tools/legacy-fixes/\`, dentro do Git, com validacao de referencias antes e depois. Essa etapa nao mexe em producao real da VPS e nao mexe no CRM.
MD

cp "$REPORT" "$BASE/guarda/scans/067-plano-reorganizacao-segura-$TS.md" 2>/dev/null || true
cat "$REPORT"

echo "=== RUN-ONCE 067 DONE ==="
exit 0
