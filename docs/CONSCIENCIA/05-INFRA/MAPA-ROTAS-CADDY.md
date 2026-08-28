---
title: "Mapa de rotas Caddy — domínio → porta → dono"
status: "MEDIDO"
medido_em: 2026-08-28
fonte: "ss -tlnp + /etc/caddy na VPS 89.117.78.124"
authority: "REFERÊNCIA; a autoridade é o estado medido, não este arquivo"
---

# Mapa de rotas Caddy

Medido na VPS, não presumido. Este arquivo é retrato datado: se divergir do
runtime, **o runtime ganha** e este arquivo é que está velho.

## Rotas vivas

| Domínio | Porta | Dono real | Prova |
|---|---|---|---|
| `mcp.centralldark.com` | 9100 | `CentralDark-MCP` (node) | `/health` = 200 |
| `hub.centralldark.com` | 8098 | node CentralDark | 200 |
| `status.centralldark.com` | 8083 / 9500 | uvicorn / PM2 God | 200 |
| `gateway.centralldark.com` | 3000 | docker-proxy | 200 |
| `elite.centralldark.com` | 8082 | `CentralDark-EliteHTTP` (`elite-anthropic-proxy`, uvicorn) | 401 JSON da app |

`mcp` responde **404 em `/`** — isso é correto, ele serve `/mcp` e `/health`.
Testar a raiz e concluir que caiu é falso-negativo.

`elite` responde **401** com `{"error":"unauthorized"}`. É a aplicação pedindo
credencial, não o Caddy falhando. 401 aqui é rota **provada**, não rota quebrada.

## Rotas sem backend — e por quê

| Domínio | Porta | Diagnóstico |
|---|---|---|
| `bot.centralldark.com` | 9210 | `GuardiaoBot` é bot de **Telegram** (`guardiao-security-bot.cjs`), não servidor HTTP. Não abre porta e nunca vai abrir. |
| `bridge.centralldark.com` | 8099 | `GuardiaoBridge` / `LovableBridge`: zero portas abertas. Mesma natureza. |
| `builder.centralldark.com` | 5174 | Porta de **dev-server Vite**. Só existe sob `npm run dev`. Sem backend de produção por desenho. |
| `deploy.centralldark.com` | 9300 | `WebhookDeploy` parado **intencionalmente** (já registrado na skill esteira-motor). |

```text
ROTA_SEM_BACKEND != ROTA_QUEBRADA
```

Três destas nunca tiveram backend de produção. Apagá-las é remoção sem ganho
funcional, e remoção não é extensão segura — fica como está.

## Correção aplicada em 2026-08-28

Única mudança material feita neste mapeamento:

```text
elite.centralldark.com
  antes:  reverse_proxy 127.0.0.1:8080   -> ninguém escutava, 502
  depois: reverse_proxy 127.0.0.1:8082   -> EliteHTTP, 401 da aplicação
```

`CentralDark-EliteHTTP` (pid medido: 2926731) escutava 8082 o tempo todo; o
Caddy apontava para 8080. Um número.

Procedimento: backup `.bak-<ts>` do arquivo → `caddy validate` (`Valid
configuration`) → `systemctl reload caddy` → contraprova em todas as rotas.

```text
T0: elite=502
T1: elite=401  mcp_health=200  hub=200  status=200  gateway=200  builder=502
REGRESSAO=0
```

`builder` continuou 502 antes e depois — inalterado, como esperado.

## O que foi considerado e recusado

**Faxina das declarações mortas.** Havia proposta de remover ~7 declarações de
porta sem listener (`status` declara 6 portas e só 2 respondem; `gateway` e
`builder` têm portas fantasma). Recusado ao passar pelo filtro de infra:

- é **remoção**, não extensão segura;
- ganho é cosmético — rota morta não consome recurso nem causa incidente;
- exige `reload` num Caddy que atende 19 domínios, incluindo o MCP;
- não é possível provar "morta em todo contexto" com um retrato de `ss` — um
  serviço sob demanda sumiria da medição e voltaria depois.

```text
RISCO_NAO_ZERO + GANHO_FUNCIONAL_ZERO = NAO_FAZER
```

**Repontar `builder` para `ArtifactsBuilder` (3090).** Recusado: seria mandar um
domínio para um serviço que ele nunca serviu. Isso é inventar arquitetura, não
consertar regressão.

## Armadilha de medição registrada

A primeira extração deste mapa usou `awk` guardando o domínio entre arquivos e
atribuiu portas ao domínio errado — chegou a indicar que `builder` e `elite`
estavam trocados. Era artefato do parser, não da configuração.

```text
LER_O_ARQUIVO_INTEIRO > PARSEAR_VARIOS_DE_UMA_VEZ
```

Ler `builder.centralldark.com.Caddyfile` e `elite.centralldark.com.Caddyfile`
diretamente desmentiu a hipótese em dois comandos.
