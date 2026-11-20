# 🔻 FUNIL CLI CENTRALDARK/HERMES [MELHORIA CONTÍNUA]

## Recibo de acesso e reconciliação

```text
RECEIPT_ID=FUNIL-CLI-CENTRALDARK-HERMES-20261110-0257Z
INTENÇÃO=provar a rota de acesso Hermes → Tailscale → openKylin → MCP CentralDark e registrar uma melhoria reutilizável
OWNER=ServerVpss/CentralDark@main + runtime MCP CentralDark na openKylin
WRITER=Hermes Agent nesta branch; somente este arquivo foi incluído no delta
ESCOPO=leitura, contraprova, documentação e PR; sem deploy, sem restart, sem mudança de segredo
```

## 1. CURRENT GitHub e checkout

```text
REPOSITÓRIO=https://github.com/ServerVpss/CentralDark
DEFAULT_BRANCH=main
LOCAL_HEAD=429238f434885ebdcbd1c3067d56e9853eea27b1
ORIGIN_MAIN=429238f434885ebdcbd1c3067d56e9853eea27b1
LOCAL_VS_ORIGIN_MAIN=IGUAL
PR_1662=MERGED
PR_1662_MERGE_SHA=239f20ddad14edb3617569469ee2f133c0949b45
PR_1662_MERGED_AT=2026-09-24T15:02:25Z
```

O checkout já possuía trabalho local de outros owners antes desta missão. Esses arquivos foram preservados e não foram incluídos neste recibo:

```text
M .agents/skills/centraldark-operational-method/SKILL.md
M .agents/skills/centraldark-operational-method/Skills/centraldark-integration-verification/SKILL.md
M .agents/skills/deploying-tailscale-for-zero-trust-vpn/SKILL.md
M .agents/skills/github/github-pr-workflow/SKILL.md
?? .agents/skills/centraldark-operational-method/Skills/centraldark-redteam-llm-continuo/
?? <caminho-vps>/
?? apps/modulos/mcp/<caminho-vps>/
```

```text
WORKTREE_POLICY=preserved; no reset, clean, stash, overwrite or force push
NEW_DELTA=docs/receipts/2026-11-10-FUNIL-CLI-CENTRALDARK-HERMES-MELHORIA-CONTINUA.md
```

## 2. Rota real usada para acessar a openKylin

A rota não transportou chave privada. Foi usada a autenticação Tailscale SSH com um `ProxyCommand` do cliente Tailscale em modo userspace:

```text
HERMES_CONTAINER_TAILSCALE=/data/bin/tailscale
TAILSCALE_SOCKET=/data/.tailscale/tailscaled.sock
TARGET_IP=100.74.85.115
TARGET_HOST=centraldark-os-forja
TARGET_USER=root
PROXY_ROUTE=/data/bin/tailscale --socket=/data/.tailscale/tailscaled.sock nc %h %p
```

Comando operacional equivalente, com host key estrita:

```bash
ssh \
  -o 'ProxyCommand=/data/bin/tailscale --socket=/data/.tailscale/tailscaled.sock nc %h %p' \
  -o StrictHostKeyChecking=yes \
  -o BatchMode=yes \
  root@100.74.85.115 \
  'hostname; id -un; uname -r; ss -ltn'
```

## 3. Identidade e contraprova SSH

Fingerprint fornecida pelo host openKylin e conferida no cliente:

```text
HOST_KEY_ALGORITHM=ED25519
HOST_KEY_BITS=256
HOST_KEY_SHA256=SHA256:qjiWxwM44TEixUJRsAlf2VcZSTSZ8VncffIkHgZUI2g
HOST_KEY_SOURCE=/etc/ssh/ssh_host_ed25519_key.pub
HOST_KEY_CHECK=PASS
```

Readback da sessão remota:

```text
hostname=CentralDark-OS
id -un=root
kernel=7.0.0-3-generic
SSH_AUTHENTICATION=PASS
```

O comando `/data/bin/tailscale` não existe na openKylin. Ele pertence ao contêiner Hermes. Na openKylin, o comando usado para habilitar o servidor foi:

```bash
sudo tailscale set --ssh
```

## 4. Estado do runtime MCP na openKylin

Leitura remota somente leitura em `127.0.0.1:9100`:

```text
MCP_LOCAL_URL=http://127.0.0.1:9100
MCP_HEALTH_HTTP=200
SERVICE=mcp-centraldark
VERSION=0.4.0
CATALOG_VERSION=160-45340263b107
TOOL_COUNT=160
RECIPE_FIRST_STATUS=PASS
RECIPE_FIRST_CODE=RECIPE_FIRST_MATCHED
RECIPE_FIRST_SCOPE=MCP_HTTP_ONLY
CANONICAL_ROUTE=MCP_CENTRALDARK_VPS_DIRECT
HOSTED_DISPATCH_LOCKED=true
ADMIN_ALIAS_LOADED=true
PROOF_LEVEL=HTTP_CODE_AND_RUNTIME_RECIPE_READBACK
```

Timestamp retornado pelo runtime:

```text
2026-11-10T02:53:30.807Z
```

OAuth discovery local:

```text
GET /.well-known/oauth-authorization-server → HTTP 200
```

Listeners observados no host:

```text
0.0.0.0:22       → SSH
127.0.0.1:8742   → serviço local
127.0.0.1:9100   → MCP HTTP
```

## 5. Status por plano de evidência

```text
GITHUB_MAIN=PASS
CHECKOUT_IDENTITY=PASS
WORKTREE_PRESERVATION=PASS
TAILSCALE_DEVICE=PASS
TAILSCALE_NETWORK=PASS
SSH_HOST_KEY=PASS
SSH_AUTHENTICATION=PASS
OPENKYLIN_RUNTIME_SHELL=PASS
MCP_LOCAL_HEALTH=PASS
MCP_RUNTIME_RECIPE_READBACK=PASS
OAUTH_DISCOVERY_LOCAL=PASS
MCP_PUBLIC_ROUTE=PASS (medição anterior, fora do readback local desta rodada)
MCP_TOOL_CALL_AUTHENTICATED=NOT_EXECUTED
MCP_FEATURE_EFFECT=UNKNOWN
DEPLOYMENT=NOT_IN_SCOPE
```

`HTTP 200` prova disponibilidade da rota de health. Não prova uma chamada MCP autenticada, execução de ferramenta, efeito de negócio ou deploy.

## 6. Rotas descartadas e motivo

```text
/data/bin/tailscale executado na openKylin → inválido; caminho é do Hermes
ssh-agent → desnecessário para Tailscale SSH nesta rota
ssh root@centraldark-os-forja sem host key → bloqueado pela verificação estrita
StrictHostKeyChecking=no → não usado
chave privada transportada pelo chat → não usada
porta pública 9100 → não presumida; serviço está em 127.0.0.1:9100 na openKylin
```

## 7. Melhoria contínua registrada

A melhoria desta rodada é tornar explícita a separação entre os dois ambientes:

```text
OPENKYLIN_CLI= tailscale / ssh local
HERMES_CONTAINER= /data/bin/tailscale + tailscaled.sock
RUNTIME_MCP= 127.0.0.1:9100 dentro da openKylin
PUBLIC_MCP= superfície pública separada
```

Isso evita três falhas recorrentes:

1. Colar o prompt `CentralDark-OS@...$` junto com o comando.
2. Executar o caminho do Tailscale do Hermes dentro da openKylin.
3. Confundir host key desconhecida com falha de autenticação.

## 8. UNKNOWN, bloqueios e limite da prova

```text
UNKNOWN_1=chamada MCP autenticada de leitura ainda não foi executada nesta rodada
UNKNOWN_2=efeito de ferramenta MCP não foi medido
UNKNOWN_3=persistência pós-reboot do serviço MCP não foi revalidada nesta rodada
UNKNOWN_4=PR ainda não foi mergeado nem deployado
BLOCKED=nenhum bloqueio de acesso para leitura remota
```

## 9. NEXT_CURSOR

```text
NEXT_CURSOR=EXECUTE_ONE_AUTHENTICATED_READONLY_MCP_CALL_THEN_READBACK_RECEIPT
```

Pré-condições para o próximo cursor:

```text
1. Reutilizar esta rota Tailscale SSH.
2. Não transportar chave privada.
3. Confirmar o endpoint MCP e o método de autenticação pelo contrato existente.
4. Executar somente uma ferramenta de leitura autorizada.
5. Ler o resultado e o recibo pelo mesmo identificador.
6. Manter UNKNOWN até a contraprova do efeito.
```

## Veredito

```text
RUNTIME_ACCESS=PROVADO
MCP_HEALTH=PROVADO
OAUTH_DISCOVERY=PROVADO
MCP_AUTHENTICATED_TOOL_CALL=PENDENTE
FIXED_POINT=NAO_ATINGIDO_NO_ESCOPO_END_TO_END
```
