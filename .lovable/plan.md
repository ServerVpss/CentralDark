## Objetivo

Bater nos 76 módulos da `api-query`, um de cada vez com pausa de 10s, e te entregar um relatório claro de quais respondem OK, quais retornam "sem dados", quais quebram, e quais APIs estão de fato mortas — pra você saber o que realmente está saudável (não só os 4 que aparecem hoje).

## Importante (esclarecimento sobre os "4 ativos")

Os 76 módulos estão **todos ligados** (enabled=true). O "4 saudáveis" da tela é só o histórico de saúde nas últimas 24h — 72 estão como "sem dados" porque ninguém testou ainda. Esse teste vai justamente popular essa tela.

## Como vou montar os inputs

1. **Reutilizar o histórico real**: pra cada `query_type` com pelo menos 1 sucesso no `query_history`, pego o último `query_input` que deu certo. Cobre ~30 módulos com dado válido garantido.
2. **Fallback por tipo de input** pros 46 módulos sem histórico — usando exemplos extraídos do próprio histórico de sucesso:
   - CPF / módulos pessoa, financeiro, foto-UF → o último CPF que deu success em `/cpf`
   - Placa → última placa de sucesso em `/placa`
   - CNPJ → último CNPJ de `/cnpj`
   - Telefone → último de `/telefone`
   - Nome → último de `/nome`
   - CEP → último de `/cep`
   - Email → último de `/email`
3. Mapeamento `módulo → tipo de input` é deduzido pela categoria em `query_modules` + nome do módulo (fotoXX → CPF, advogadoOAB → OAB, etc).

## Como vou rodar

Script Node em `/tmp/test-modulos.mjs` chamando a edge `api-query` via HTTPS direto (mesma URL do projeto, com anon key). Loop sequencial, **`await sleep(10_000)` entre cada chamada**, timeout individual de 35s. Sem paralelismo, sem retries (queremos ver o estado real).

Pra cada módulo registro:
- `module_key`, `input_usado`, `tipo_input` (real ou exemplo)
- `http_status`, `tempo_ms`
- `outcome`: `success` | `notfound` | `module_disabled` | `provider_error` | `timeout` | `http_error`
- `erro_curto` (se houver)
- `tem_dados` (boolean — se o payload veio com algo útil)

## Entregáveis

1. `/mnt/documents/teste-modulos-76.csv` — planilha pra você abrir
2. `/mnt/documents/teste-modulos-76.json` — payload completo (pra debugar caso a caso)
3. Resumo final no chat: contagem por outcome + lista dos módulos que estão de fato mortos (provider_error/timeout em todos), com sugestão de desativar.

## Tempo estimado

76 × 10s + tempo de resposta médio ≈ **15 a 20 min** rodando aqui no sandbox. Eu disparo em background e te aviso quando terminar.

## O que NÃO vai acontecer

- Nada de mudar config de módulo / desativar automaticamente. Só leitura + relatório.
- Não vou tocar em `module_health_status` — o cron já cuida disso quando vir as chamadas chegando.
- Nada de UI nova — você pediu rodar agora.

Se aprovar, na fase de build eu já começo a rodar e mando o relatório.