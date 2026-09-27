---
name: centraldark-hub-credential-control-plane
description: Use quando o CHEFE trabalhar com Hub, conectores, OAuth, API keys temporarias, providers, Abacus, Tailscale, Supabase, Gmail, GitHub, Google Drive, Casa/VPS ou catalogo de modelos pelo painel CentralDark.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# CENTRALDARK HUB CREDENTIAL CONTROL PLANE

## Quando usar

Use quando a intencao for conectar provider/capacidade pelo HUB, testar rota, aplicar credencial temporaria, trocar token, validar modelos ou registrar o que o painel realmente tem.

## Regra curta

```text
CHEFE -> HUB -> CONNECTOR -> OWNER_SECRET_OR_OAUTH -> TEST -> EFFECT -> RECEIPT_SEM_VALOR
```

## Secret transit

- usar somente no owner pedido;
- nao ecoar segredo;
- nao commitar segredo;
- nao gravar valor em receipt;
- nao transformar segredo em memoria;
- nao levar segredo para Git, log, PR, issue, comentario ou artefato permanente;
- se pacote vier com segredo, sinalizar tipo/caminho/funcao sem valor e continuar o delta util;
- cofre/local/origem segura sao donos do valor; Git guarda prova e receita sem valor;
- limpar logs sob controle quando aplicavel;
- registrar apenas provider, owner, destino, status e resultado.

```text
SEGREDO_DETECTADO=true
VALOR_EXIBIDO=false
VALOR_COMMITADO=false
VALOR_LOGADO=false
VALOR_PERSISTIDO_EM_RECEIPT=false
COFRE_E_DONO_DO_VALOR=true
DELTA_UTIL_CONTINUA=true
```

## Leitura de status

```text
CONNECTED = conexao/canal visivel
ACTIVE_MASKED = segredo existe no painel com mascara
HTTP_200 = endpoint respondeu
MODEL_COUNT = inventario respondeu
PASS = somente quando a chamada real do escopo passa
UNKNOWN = tudo que ainda nao foi testado no runtime/owner real
```

## Cadeados

```text
HUB_CONNECTED != PROVIDER_RUNTIME_PASS
OAUTH_ACTIVE != TOOL_CALL_PASS
MODEL_COUNT != MODEL_ROUTE_PASS
HTTP_200 != FEATURE_READY
SESSION_EXPIRED = LOGIN_REQUIRED_NOT_FAILURE
UNKNOWN != PASS
```

## Donos

- conhecimento humano/maquina: `MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.*`
- runtime visual: `apps/modulos/hub`
- componentes: `apps/modulos/hub/src/components/connectors/`
- servicos: `apps/modulos/hub/src/services/`
- receipts: `MODULES/HUB/receipts/`
