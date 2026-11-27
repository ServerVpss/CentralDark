#!/usr/bin/env bash
# 077 - Classificar pastas de suporte da raiz /root/Multizap.
# Alvo: central-logs, central-notificacoes, consciencia, deploy-hooks, ia, logs, backups.
# Regra: SO classifica. NAO move se a pasta for usada por PM2, webhook, Caddy, workflow ou scripts ativos.
set -uo pipefail

BASE="/root/Multizap"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/077-classificar-pastas-suporte"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig'
}

echo "=== RUN-ONCE 077: CLASSIFICAR PASTAS SUPORTE ==="
echo "Revisao: $REV"
echo "Modo: SOMENTE CLASSIFICACAO. Nada sera movido."

PASTAS=(central-logs central-notificacoes consciencia deploy-hooks ia logs backups)

PM2_JSON="$(pm2 jlist 2>/dev/null || echo '[]')"
echo "$PM2_JSON" | sanitize > "$REV/dados/pm2-jlist.json"

CADDY_CONTENT="$(cat /etc/caddy/Caddyfile 2>/dev/null || true)"

> "$REV/dados/classificacao.tsv"
echo -e "pasta\texiste\ttamanho\tarquivos\tusada_pm2\tusada_caddy\tdecisao" >> "$REV/dados/classificacao.tsv"

for p in "${PASTAS[@]}"; do
  dir="$BASE/$p"
  if [ ! -d "$dir" ]; then
    echo -e "$p\tnao\t-\t-\t-\t-\tnao_existe" >> "$REV/dados/classificacao.tsv"
    continue
  fi

  tamanho=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
  qtd=$(find "$dir" -type f 2>/dev/null | wc -l | tr -d ' ')

  usada_pm2="nao"
  echo "$PM2_JSON" | grep -q "/$p/" && usada_pm2="sim"

  usada_caddy="nao"
  echo "$CADDY_CONTENT" | grep -q "$dir" && usada_caddy="sim"

  decisao="candidato_quarentena"
  [ "$usada_pm2" = "sim" ] && decisao="manter_em_uso"
  [ "$usada_caddy" = "sim" ] && decisao="manter_em_uso"
  [ "$qtd" -gt 100 ] && [ "$decisao" = "candidato_quarentena" ] && decisao="precisa_revisao"

  echo -e "$p\tsim\t$tamanho\t$qtd\t$usada_pm2\t$usada_caddy\t$decisao" >> "$REV/dados/classificacao.tsv"

  find "$dir" -maxdepth 3 2>/dev/null | sort > "$REV/dados/arvore-$p.txt"
done

cat > "$REPORT" <<MD
# 077 - Classificacao de pastas suporte

Data: $(date)
Revisao: $REV
Status final: ok (classificacao concluida, nada movido)

## Classificacao

\`\`\`
$(column -t -s $'\t' "$REV/dados/classificacao.tsv" 2>/dev/null || cat "$REV/dados/classificacao.tsv")
\`\`\`

## Regra aplicada

- usada_pm2=sim  -> manter_em_uso
- usada_caddy=sim -> manter_em_uso
- arquivos > 100 e nao em uso -> precisa_revisao (nao mover sem confirmacao)
- restante -> candidato_quarentena (mover so com confirmacao do usuario)

## Seguranca

- Movido: nao
- Apagado: nao
- PM2 alterado: nao
- Caddy alterado: nao

## Evidencias

- $REV/dados/classificacao.tsv
- $REV/dados/pm2-jlist.json
- $REV/dados/arvore-*.txt

## Proxima acao

Usuario confirma quais pastas em "candidato_quarentena" podem ir para
$BASE/quarantine/. Movimento real fica para etapa propria.
MD

cat "$REPORT"
echo "=== RUN-ONCE 077 DONE ==="
exit 0
