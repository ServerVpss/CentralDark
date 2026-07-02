# Conserto do Vigia Actions Vermelhos

## Diagnóstico da causa raiz

O `vigia-actions-vermelhos.yml` tem 3 problemas encadeados que geram o enxame de bolinhas cinza e o "Waiting for #2695":

1. **Gatilho amplo demais**: dispara em `workflow_run: workflows: ["*"] types: [completed]` — ou seja, toda vez que qualquer workflow termina, o vigia começa. Nos picos, isso é 20+ execuções por minuto.
2. **Fila serial**: `concurrency: cancel-in-progress: false` — cada nova execução espera a anterior terminar. Somado ao volume, empilha dezenas de runs em "Waiting".
3. **Runner dependente**: `runs-on: [self-hosted, Linux]` — se o runner da VPS cai, tudo empilha. Foi o que aconteceu antes.

Resultado prático: mesmo com o vigia "funcionando", ele polui o Actions com fila gigante e ainda derruba a operação inteira se o runner tossir.

## O que vou mudar no `.github/workflows/vigia-actions-vermelhos.yml`

1. **Trocar para runner do GitHub** (`runs-on: ubuntu-latest`)
   - Deixa de depender do self-hosted; vira imune ao runner offline.
   - Repo tem execução grátis suficiente pra isso (workflow curto, <1min).

2. **Concurrency inteligente**
   - `group: vigia-${{ github.event.workflow_run.name || github.event_name }}`
   - `cancel-in-progress: true`
   - Efeito: só mantém 1 vigia vivo por workflow monitorado; qualquer novo cancela o anterior. Fila zera.

3. **Filtro precoce no job (`if:`)**
   - Só executa de verdade se: `conclusion == 'failure'` **ou** for `schedule`/`workflow_dispatch` **ou** for um `success` de workflow que estava na lista de falhas (recuperação).
   - Ignora o próprio nome pra nunca disparar loop consigo.
   - Ignora explicitamente `Farm — trailer Co-authored-by`, `CodeQL` e outros ruidosos que não precisam de alerta.

4. **Auto-limpeza no início do job**
   - Primeiro passo: `gh api` cancela runs anteriores do próprio vigia que ainda estejam em `queued`/`waiting`. Rede de segurança.

5. **Estado persistente movido de `/var/lib/centraldark/vigia` (VPS) para artifact + gist**
   - Como agora roda em runner do GitHub, o `STATE_FILE` (evita notificações repetidas) precisa sobreviver entre runs.
   - Solução simples: guardar `reported.txt` e `failing_workflows.txt` como **cache do GitHub Actions** (`actions/cache@v4`), chave fixa `vigia-state-v1`.
   - Se o cache falhar (primeira vez), começa do zero — não quebra nada.

6. **Funcionalidades novas pedidas**
   - **Resumo diário consolidado**: no cron das 07h, envia 1 mensagem com "X falhas nas últimas 24h, Y recuperações, Z workflows saudáveis" em vez de heartbeat vazio.
   - **Auto-mute de workflow rebelde**: se o mesmo workflow falhar 5x seguidas em 1h, o vigia manda uma notificação especial "🔕 workflow X em modo silencioso — investigue manualmente" e para de spammar até success.
   - **Botão manual mais útil**: `workflow_dispatch` ganha input `janela_horas` (padrão 6) pra permitir varredura customizada.

## Estrutura de arquivos afetados

```
.github/workflows/
└── vigia-actions-vermelhos.yml   (reescrito)
```

Nenhum outro arquivo muda. Nada na VPS precisa ser mexido.

## Como valido depois

1. Contar runs do vigia por minuto — deve cair pra 1-2 em vez de 20+.
2. Simular falha (workflow_dispatch com input) — confirmar que chega notificação no Telegram.
3. Verificar que "Waiting for #XXXX" some da UI do GitHub Actions.

## Riscos

- Baixo. Se algo der errado, é só reverter o commit — o vigia velho volta.
- Perda de estado do `reported.txt` na primeira execução (pode reenviar 1 alerta antigo) — aceito.
