## O que aconteceu

O grabber v0.3 pegou um ID errado do localStorage (`OThmNTIwMzQtNzc1Yi00` — parece pedaço de base64, não workspace real). Por isso tudo deu 404. O ID verdadeiro que apareceu no sniffer foi `SnHKuU0wOdEEUsYxWOrJ`.

## Plano

### 1. Grabber v0.4 (console) — detecção robusta

Trocar a heurística furada por três fontes em ordem:

- **Fonte A (mais confiável):** interceptar `fetch` por 2 segundos e capturar o primeiro `workspaces/{ID}/...` que a página chamar sozinha.
- **Fonte B:** ler cookies/sessionStorage procurando chave que contenha "workspace" com valor no formato certo (20 chars alfanuméricos misturando maiúsc/minúsc).
- **Fonte C (fallback):** `prompt()` pedindo pro Pivete colar o ID visto no sniffer.

Assim nunca mais chuta ID errado.

### 2. Rodar em cada workspace

Pivete troca de workspace no site → roda o script → cada workspace vira uma chave em `window.__grabber`. No final: `copy(JSON.stringify(window.__grabber, null, 2))` e cola aqui pra eu ver.

### 3. Próximo passo (HUB) — só depois que o v0.4 funcionar

Quando os JSONs dos workspaces estiverem batendo certo, subir no HUB (`lyoigsqluyktoclwdaft`, via MCP/VPS, respeitando a trava):

- Tabela `contas_lovable` (workspace_id PK, nome, saldo_restante, saldo_concedido, usado_periodo, diário, bônus_json, expirações_json, período, raw_json, coletado_em)
- Edge function `lovable-ingest` validando `X-Hub-Token`
- Preencher `HUB_URL` + `HUB_TOKEN` no topo do grabber → envio automático

### 4. Card no TelePainel (etapa 3)

Ler `contas_lovable` do HUB e mostrar os workspaces lado a lado com saldos, no padrão visual esmeralda dos outros cards.

## Fora do escopo agora

- OAuth "Sign in with Lovable" (não existe hoje, já discutido)
- Extensão Chrome empacotada (fica pra depois que o fluxo manual estiver rodando)
- Rotação automática de contas (depois de ter os dados no HUB)

## O que preciso confirmar antes de sair do plan mode

Você quer que eu **só corrija o grabber v0.4** agora (rápido, você testa nos seus workspaces), ou já quer que eu **prepare também os arquivos SQL + edge function** pra você levar pro HUB via MCP na sequência?