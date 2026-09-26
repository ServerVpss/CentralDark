---
name: daily-ops
description: Rotina matinal/sob demanda do Hermes local (profile pivete, Windows). Checa gateway, providers autenticados, pendências do MANUAL.html, e integridade dos 3 arquivos de memória (HOJE/SEMANA/REGRAS). Use quando o Pivete mandar "status", "resumo do dia", "tá tudo ok?", ou ao abrir sessão. Read-only, não escreve nada.
category: hermes
---

# daily-ops — checkup local do Hermes

## 1. Gateway / processo
```
tasklist | grep -i hermes
hermes auth status nous gemini openrouter xai openai-codex 2>&1
```

## 2. Modelo ativo
```
hermes config get model.default --profile pivete
hermes config get model.provider --profile pivete
```

## 3. Memória (3 Temperaturas) — integridade
```
BASE=E:/CentralDark/Pivete/NUCLEO/motor/03-memoria/memoria
sha256sum $BASE/HOJE.md $BASE/SEMANA.md $BASE/REGRAS.md
wc -l $BASE/HOJE.md $BASE/SEMANA.md $BASE/REGRAS.md
```
- Se SEMANA.md = 0 bytes → destilador não rodou (rodar `bash motor/03-memoria/destilar-3-temp.sh`).
- hermes-mente é ORIGIN_LOCKED — não escrever nunca.

## 4. Pendências do MANUAL
```
grep -nE "pendente|Falta decidir|\[PROMETIDO\]" E:/CentralDark/Pivete/NUCLEO/MANUAL-SESSAO-19-07-2026/MANUAL.html | head
```

## 5. OpenRouter (se ativo)
Saldo via API (sem expor key):
```
python -c "import urllib.request,json,os; print(json.load(urllib.request.urlopen(urllib.request.Request('https://openrouter.ai/api/v1/credits',headers={'Authorization':'Bearer '+os.environ['OPENROUTER_API_KEY']})))['data'])"
```

## Saída esperada
Bloco curto:
- GATEWAY=PID ou DOWN
- MODELO=default/provider
- PROVIDERS=logados
- MEMORIA=SHAs + tamanhos
- PENDENCIAS=lista ou "nenhuma"
- OPENROUTER=crédito ou N/A

## Pitfalls
- Não misturar com GATE-0 / VPS / Lupa canônica — isto é checkup local isolado.
- search_files não enxerga E: (bug MSYS) — usar terminal find/grep.
- Não declarar "tudo ok" sem rodar os comandos acima.
