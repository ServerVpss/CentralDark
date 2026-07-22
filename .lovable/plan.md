# Rota temporária pra você ver o Overclock

## O que vou fazer (exatamente isto, nada mais)

1. Editar **um único arquivo** — `src/app/rotas/rotas-admin.tsx` — adicionando 1 linha:
   ```tsx
   import CockpitOverclock from "@/admin/cockpit";
   // dentro do <Routes>:
   <Route path="/admin/cockpit-overclock" element={<CockpitOverclock />} />
   ```
2. Abrir `http://localhost:8080/admin/cockpit-overclock` no Playwright headless.
3. Tirar screenshot em 1440×900.
4. Te mostrar a imagem inline aqui no chat.

## O que NÃO vou fazer

- Não toco em `SalaControle` nem no arquivo `src/admin/cockpit/index.tsx`.
- Não mexo em `useCockpitLive`, HERMES-CORE, HUB Supabase, PENDENCIAS.md, ou qualquer outra rota.
- Não removo, não movo, não renomeio nada.
- Não faço commit, push ou PR.
- A rota fica lá até você decidir: se escolher SalaControle como canônico, eu removo a rota temporária e você me diz o que fazer com o arquivo órfão. Se escolher Overclock, promovemos ele.

## Resultado esperado

Você vê os 2 designs lado a lado (SalaControle já tá capturado, Overclock vai pra imagem nova) e me diz qual é o canônico. Depois disso a gente decide os próximos passos das Extensões 1/2/3.

## Rollback

Reverter a rota é apagar as 2 linhas que adicionei em `rotas-admin.tsx`. Zero impacto em outros lugares.

## Próximo passo único

Aprovar este plano mínimo → aplicar → capturar → mostrar screenshot.
