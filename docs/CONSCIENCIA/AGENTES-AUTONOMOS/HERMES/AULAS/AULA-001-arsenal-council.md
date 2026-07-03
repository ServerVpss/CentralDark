# AULA-001 — Arsenal Council

**Data:** 2026-07-03  
**Categoria:** rota-fixa  
**Pré-requisitos:** nenhum  
**Tempo estimado:** 5 min

## 1. O que é
Sistema de Conselho de IAs rodando na VPS. Dois serviços: ArsenalProxy (porta 8083, endpoints REST) e ArsenalAdapter (porta 8090, OpenAI-compatible com 4 modelos "verbais").

## 2. Quando usar
- Precisa disparar múltiplos modelos em paralelo → `arsenal-parallel`
- Precisa debate entre modelos → `arsenal-debate`
- Precisa roteamento inteligente → `arsenal-router`
- Precisa loop autônomo do Hermes → `arsenal-hermes`

## 3. Como fazer (passo-a-passo)
1. Confirma que serviços estão up: `docker ps | grep -E "arsenal|adapter"`
2. Testa health: `curl http://localhost:8083/health && curl http://localhost:8090/health`
3. Chama modelo verbal via OpenAI-compat na porta 8090 (ver aula 4 abaixo)
4. Se quiser ferramenta específica (intel/stats), chama porta 8083 direto ou via sidecar 9077

## 4. Comandos prontos
```bash
# Baseline dos 4 verbos
for m in arsenal-router arsenal-parallel arsenal-debate arsenal-hermes; do
  echo "=== $m ===" &&
  curl -s http://localhost:8090/v1/chat/completions \
    -H "Authorization: Bearer arsenal-key-local-2026" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$m\",\"messages\":[{\"role\":\"user\",\"content\":\"oi\"}]}"
done
```

## 5. Armadilhas
- ❌ Porta **9000 PROIBIDA** (conflita com webhook GitHub) — sidecar tools usa 9077
- ❌ Key `arsenal-key-local-2026` só funciona de dentro do `127.0.0.1` — não expor externamente
- ❌ `arsenal-debate` e `arsenal-hermes` podem levar 40-50s — não abortar antes

## 6. Verificação
- ✅ 4 modelos retornam HTTP 200 com `.choices[0].message.content`
- ✅ Health checks 8083 e 8090 respondem
- ✅ 5 slash-commands no WebUI: `/router` `/swarm` `/chain` `/debate` `/hermes`

## 7. Ver também
- ROTAS-FIXAS/arsenal-endpoints.md
- ROTAS-FIXAS/comandos-curl-baseline.md
- APRENDIZADOS/002-arsenal-portas-fixas.md
