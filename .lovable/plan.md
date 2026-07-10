## Análise Staff v2 — overclock.sh (fechar as 4 lacunas)

Objetivo: entregar um relatório que sobreviva a review de Staff/Principal — atribuição real de símbolos, mapeamento chunk→componente, números por componente e correlação direta com o ciclo de hidratação do App Router.

### As 4 lacunas e como cada uma é fechada

| # | Lacuna apontada | Correção nesta rodada |
|---|---|---|
| 1 | Nomes minificados | Baixar `.js.map` de cada chunk quente e desminificar cada frame do `.cpuprofile` (linha/coluna → símbolo original + arquivo fonte) |
| 2 | Chunks não mapeados para componentes | Cruzar os módulos dentro do source map (`sources[]`) com o import tree do App Router para dizer exatamente "chunk X = `<Hero>` + `<Releases>` + `framer-motion`" |
| 3 | Fix genérico | Ranquear componentes por (CPU self × bytes JS × posição no viewport) e dar top-3 nomeados com ganho esperado individual em ms |
| 4 | Baixa correlação com App Router | Instrumentar o ciclo `RSC payload → schedulerRoot → beginWork → commitRoot` via marks do React DevTools profiler + `Performance.measure`, alinhar ao eixo de tempo da long-task de 299 ms |

### O que a rodada v2 vai produzir

1. **`profile.symbolicated.json`** — cada sample do `.cpuprofile` reescrito com nome original (`performConcurrentWorkOnRootSync`, `Releases.render`, etc.) via source-map-cli.
2. **`chunk-to-components.md`** — tabela: `chunk hash | tamanho | componentes App Router dentro | libs de terceiros`.
3. **Flamegraph real** (não só top-N textual) — hierarquia completa até folhas, com % CPU e link para o arquivo fonte de cada frame.
4. **Ranking de componentes por custo** — CPU self ms, JS bytes, e ganho previsto ao aplicar `next/dynamic` (usando modelo: `ganho ≈ self_ms × (1 - visível_no_LCP)`).
5. **Diff de fix pronto** — `app/page.tsx` com os imports exatos convertidos, um por vez, com ganho estimado por linha alterada.
6. **Plano de verificação numérico** — baseline vs meta por métrica (long-task máx, TBT, INP p75, JS bytes hidratados no LCP).

### Como será executado (fluxo técnico)

```text
1. Coletar assets
   - GET https://overclock.sh/ → parsear <script>/link modulepreload
   - Baixar cada chunk .js + o .js.map correspondente (quando servido)
   - Se .js.map não estiver público: tentar // sourceMappingURL, senão
     usar heurística por AST (identificadores exportados) e marcar "unmapped"

2. Reprofile em condições controladas
   - Playwright + CDP:
       CPU throttling 4x   (simula mid-range)
       Network: Fast 3G off, cache disabled
       Profiler.setSamplingInterval = 50 µs (mais fino que o v1)
       Emular região BR (Accept-Language)
   - Rodar 5 execuções, usar mediana

3. Desminificar
   - Para cada callFrame do profile → source-map lookup (linha,coluna)
   - Produzir profile.symbolicated.json compatível com Chrome DevTools

4. Mapear chunk → componentes
   - Parse do sources[] de cada .map
   - Filtrar por prefixo webpack (app/, components/)
   - Cruzar com bundle stats se disponível em /_next/static/…/build-manifest.json

5. Correlacionar com hidratação
   - Injetar via addInitScript:
       performance.mark('rsc-start') em fetch de /_next/*
       observar entries 'measure' com nome contendo 'React'
   - Alinhar timeline: RSC receive → hydrate begin → long-task end

6. Ranquear e propor fix
   - score = self_ms * bytes_kb * (fora_do_viewport ? 1 : 0.2)
   - Top-3 vira o diff mínimo com ganho previsto individual
```

### Detalhes técnicos importantes

- **Se o site não expor `.js.map` em produção** (comum), a v2 registra isso explicitamente e cai no plano B: análise por AST + assinatura de bytes conhecidos das libs (react-dom, framer-motion, radix, etc.) para atribuir os frames "genéricos" a bibliotecas nomeadas. Isso já resolve o ponto 1 em ~80% dos casos.
- **CPU throttling 4x** muda o número absoluto (mais realista para mobile) — o relatório vai apresentar as duas colunas: desktop unthrottled (comparável ao v1) e mobile 4x (o que o usuário real sente).
- **Nada no site é modificado** — é 100% profiling externo, executado em sandbox Playwright.

### O que precisa da tua decisão antes de eu ir codar

Nada bloqueante — o plano se auto-adapta se `.js.map` não estiver disponível. Se quiser, posso incluir também:
- Comparativo lado a lado (v1 vs v2) num único arquivo, pra tu ver a evolução;
- Um `flamegraph.html` interativo (speedscope/pprof), além do textual;
- Repetir o mesmo pipeline no `status.centralldark.com` como controle, pra calibrar.

Diz o que entra ou aprova como está e eu executo.
