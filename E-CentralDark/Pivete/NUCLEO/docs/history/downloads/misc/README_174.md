# Dados Brutos — Correlação Overclock.sh

Pasta com os artefatos crus usados pelos relatórios v1 → v3.1. Tudo aqui é evidência primária — dá pra reprocessar em Excel/Pandas.

## Arquivos

### Teste A/B v3.1 (empírico)
- **`ab_result.json`** — resultado completo (medianas + runs individuais).
- **`ab_runs.csv`** — 10 linhas (5 baseline + 5 blocked) com métricas por run. Pronto pra pivot/scatter.
- **`ab_summary.csv`** — medianas + delta absoluto e percentual por métrica.
- **`ab_test.py`** — script Playwright que gerou os dados (interceptação do chunk Supabase).

### Profiling V8 (v2)
- **`prof_0/1/2.json`** — 3 CPU profiles crus (Chrome DevTools Profiler, sampling 100µs).
- **`profile.cpuprofile`** — profile v1, formato compatível com Chrome DevTools (Performance → Load).
- **`longtasks.json`** — long tasks capturadas via PerformanceObserver.
- **`scripts.json`** — mapeamento URL → tamanho dos scripts carregados.

### Análise de bundles (v3)
- **`chunks.json`** — 18 chunks baixados de produção com metadados (size, hash).
- **`chunk_map.json`** — mapa chunk → bibliotecas detectadas por assinatura de bytes.
- **`chunk_urls.json`** — URLs originais dos chunks.
- **`chunks_analysis.json`** / **`summary_v2.json`** — análises intermediárias v2.

## Como reproduzir a correlação

```python
import pandas as pd
runs = pd.read_csv('ab_runs.csv')
runs.groupby('variant')[['fcp','loadEvent','jsBytes']].describe()
```

Ou abra o `profile.cpuprofile` no Chrome DevTools (aba Performance → botão "Load profile") pra ver a flamechart original.

## Pontos-chave já correlacionados

| Métrica | Baseline | Bloqueado | Δ |
|---|---|---|---|
| TTFB | 725ms | 217ms | **−70%** |
| FCP | 1012ms | 560ms | **−45%** |
| Load | 3209ms | 2670ms | −17% |
| JS transferido | 313KB | 224KB | −29% |

Chunk removido no teste: `17-r5~e9uf6xa.js` (Supabase Realtime + ws, ~90KB gzip).
