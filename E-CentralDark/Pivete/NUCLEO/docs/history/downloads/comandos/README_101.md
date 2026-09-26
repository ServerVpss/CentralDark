# 🌪️ Kit Enxame Ômega — debate multiagente fail-closed

Fluxo: agentes cegos em paralelo → papel adversarial Fable → Judge adversarial → um recibo.

## Segurança

Os scripts são apenas wrappers do runtime Node. Eles **não procuram nem leem `.env`**.
Credenciais devem chegar já injetadas pelo ambiente do Hermes:

1. `CENTRALDARK_API_KEY` → `CENTRALDARK_BASE_URL` opcional;
2. `OPENAI_API_KEY` + `OPENAI_BASE_URL` opcional;
3. `ANTHROPIC_API_KEY`;
4. nenhuma disponível → `ENXAME_UNAVAILABLE`.

Os valores nunca entram no recibo nem nos arquivos de saída.

## Modos

| Script | Chamadas | Observação |
|---|---:|---|
| `enxame-econo-5.sh` | 5 + Judge | padrão seguro |
| `enxame-padrao-10.sh` | 10 + Judge | investigação média |
| `enxame-titanico-20.sh` | 20 + Judge | exige invocação explícita |
| `hypernova-50.sh` | 50 + Judge | exige invocação explícita; alto custo |

Os nomes representam **papéis independentes**. Se apenas um modelo estiver disponível, o recibo marca `JUDGE_INDEPENDENCE=MODEL_REUSED`; não finge independência.

## Uso

```bash
bash enxame-econo-5.sh "diagnóstico do erro"
```

Ou diretamente:

```bash
node ../runtime/enxame-runner.mjs --mode econo --prompt "diagnóstico do erro"
```
