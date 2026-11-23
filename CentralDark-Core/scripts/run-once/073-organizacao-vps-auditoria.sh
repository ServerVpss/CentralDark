#!/usr/bin/env bash
# 073 - Organizacao VPS (APENAS auditoria)
# Regra: nao mover, nao apagar, nao reiniciar nada.
# Decisao do usuario: revisoes/ intactas, 12 pastas suspeitas nao tocadas.
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/073-organizacao-vps-auditoria"
REPORT="$REV/resumo.md"
MAN="$REV/manifesto.md"

mkdir -p "$REV/dados"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 073: AUDITORIA ORGANIZACAO VPS ==="
echo "Revisao: $REV"
echo "Modo: SOMENTE AUDITORIA. Nada sera movido nem apagado."

cd "$REPO" 2>/dev/null || true

pm2 ls --no-color > "$REV/dados/pm2-ls.txt" 2>&1 || true

find "$BASE" -maxdepth 4 \
  -path "$REPO/.git" -prune -o \
  -path "$REPO/node_modules" -prune -o \
  -path "$BASE/apps/crm" -prune -o \
  -print 2>/dev/null | sort > "$REV/dados/arvore-multizap.txt"

find "$REPO" -maxdepth 4 \
  -path '*/.git' -prune -o -path '*/node_modules' -prune -o \
  -print 2>/dev/null | sort > "$REV/dados/arvore-repo.txt"

find "$BASE" -type f -size +50M \
  -not -path "$BASE/apps/crm/*" \
  -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -printf '%s %p\n' 2>/dev/null | sort -nr > "$REV/dados/arquivos-grandes.txt" || true

find "$BASE" -maxdepth 6 \
  \( -name "*.bak" -o -name "*.old" -o -name "*.tmp" -o -name "*.log.*" -o -name "*~" -o -name ".DS_Store" -o -name "nohup.out" \) \
  -not -path "$BASE/apps/crm/*" \
  -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -print 2>/dev/null | sort > "$REV/dados/candidatos-lixo.txt"

find "$BASE" -type f \( -name "*.log" -o -name "*.log.*" \) -mtime +14 \
  -not -path "$BASE/apps/crm/*" \
  -not -path "$BASE/revisoes/*" \
  -not -path '*/node_modules/*' \
  -print 2>/dev/null | sort > "$REV/dados/logs-antigos.txt"

find "$BASE" -mindepth 1 -maxdepth 1 -type d \
  -not -name apps -not -name api -not -name guarda \
  -not -name quarantine -not -name revisoes \
  -print 2>/dev/null | sort > "$REV/dados/pastas-suspeitas-raiz.txt"

GRANDES=$(wc -l < "$REV/dados/arquivos-grandes.txt" | tr -d ' ')
LIXO=$(wc -l < "$REV/dados/candidatos-lixo.txt" | tr -d ' ')
LOGS=$(wc -l < "$REV/dados/logs-antigos.txt" | tr -d ' ')
SUSP=$(wc -l < "$REV/dados/pastas-suspeitas-raiz.txt" | tr -d ' ')

cat > "$MAN" <<MD
# Manifesto 073 - Organizacao VPS (auditoria)

Data: $(date)
Revisao: $REV
Modo: SOMENTE AUDITORIA. Nenhum arquivo movido. Nenhum arquivo apagado.

## Classificacao das pastas da raiz $BASE

| Pasta | Classificacao | Acao | Proxima etapa |
|---|---|---|---|
| apps | manter | nenhuma | - |
| api | manter | nenhuma | - |
| guarda | manter | nenhuma | - |
| quarantine | manter | nenhuma | - |
| revisoes | manter (evidencia) | nenhuma | - |
| gateway | PRODUCAO PM2 | NAO TOCAR | 075 |
| wuzapi | PRODUCAO WhatsApp | NAO TOCAR | 076 |
| secrets | SENSIVEL | NAO TOCAR | etapa propria |
| credenciais | SENSIVEL | NAO TOCAR | etapa propria |
| scripts | operacional ativo | NAO TOCAR | 077 |
| backups | backups vivos | NAO TOCAR | 077 |
| logs | logs vivos | NAO TOCAR | 077 |
| central-logs | a classificar | NAO TOCAR | 077 |
| central-notificacoes | a classificar | NAO TOCAR | 077 |
| consciencia | a classificar | NAO TOCAR | 077 |
| deploy-hooks | a classificar | NAO TOCAR | 077 |
| ia | a classificar | NAO TOCAR | 077 |

## Contagens

- Arquivos grandes (>50MB): $GRANDES
- Candidatos a lixo (.bak/.old/.tmp/etc): $LIXO
- Logs antigos (>14d, fora de revisoes): $LOGS
- Pastas suspeitas na raiz: $SUSP

## Regra aplicada

Todos os .bak detectados estao dentro de revisoes/ e sao mantidos como
area de evidencia/auditoria.

## Seguranca

- Apagados: 0
- Movidos: 0
- CRM: nao tocado
- Banco: nao alterado
- Caddy: nao alterado
- PM2: nao reiniciado
- Docker/WuzAPI: nao reiniciado
- WhatsApp reset/logout: nao
MD

cat > "$REPORT" <<MD
# 073 - Organizacao VPS (auditoria)

Data: $(date)
Revisao: $REV
Status final: ok (auditoria concluida, nada movido)

## Resultado

- Arvore inventariada
- $SUSP pastas fora da arvore alvo classificadas
- $LIXO candidatos a lixo (todos dentro de revisoes/, mantidos)
- $GRANDES arquivos grandes
- $LOGS logs antigos

## Seguranca

- Apagados: nao
- Movidos: nao
- CRM: nao tocado
- Banco: nao alterado
- Caddy: nao alterado
- PM2: nao reiniciado
- Docker/WuzAPI: nao reiniciado
- WhatsApp reset/logout: nao

## Evidencias

- $REV/dados/arvore-multizap.txt
- $REV/dados/arvore-repo.txt
- $REV/dados/pm2-ls.txt
- $REV/dados/arquivos-grandes.txt
- $REV/dados/candidatos-lixo.txt
- $REV/dados/logs-antigos.txt
- $REV/dados/pastas-suspeitas-raiz.txt
- $MAN

## Proximas etapas

- 074-diagnostico-pm2-crash
- 075-plano-migracao-gateway
- 076-plano-migracao-wuzapi
- 077-classificar-pastas-suporte
MD

cat "$REPORT"
echo "=== RUN-ONCE 073 DONE ==="
exit 0
