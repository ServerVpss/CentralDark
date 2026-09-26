# GitHub Provider Reality

`/meta` entra como sensor do estado do próprio provider GitHub.

## Medir

- `GET https://api.github.com/meta`
- `GET https://api.github.com/versions`
- header canônico: `X-GitHub-Api-Version: 2026-03-10`

O receipt salva:
- timestamp;
- versão pedida;
- SHA-256 do JSON canônico;
- hashes separados de domínios, hooks, ranges da API/Actions, fingerprints SSH e chaves de assinatura.

## Não confundir

`/meta` **não autentica webhook**.
Webhook continua exigindo assinatura do payload.

`/meta` não prova que a CentralDark está saudável.
Ele prova apenas a observação do estado publicado do provider naquele instante.

## Uso

- detectar drift de allowlists;
- detectar mudança de ranges/domínios;
- reconciliar versões da REST API;
- registrar âncora externa;
- separar `PROVIDER_DRIFT` de `LOCAL_REGRESSION`.
