# Relatorio - Builder Bolt Caddy publico

- **Data:** 2026-06-16
- **Categoria:** Caddy publico / precheck / ativacao bloqueada
- **Status:** preparado no repo; aplicacao real do Caddy pendente de confirmacao humana literal.

## Objetivo

Preparar a publicacao de `builder.centralldark.com` apontando para o Builder Bolt local em `127.0.0.1:5174`, sem tocar Open WebUI, porta `3000`, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou containers antigos.

## Precheck

- Container `centraldark-builder-bolt`: `running`, `healthy`, `RESTARTING=false`, `EXIT=0`.
- Porta local: `127.0.0.1:5174 -> 5173/tcp`.
- HTTP local: `200 OK`.
- Headers locais vindos do upstream: `Cross-Origin-Embedder-Policy: require-corp` e `Cross-Origin-Opener-Policy: same-origin`.
- Snippet versionado existe em `infra/caddy/builder.centralldark.com.Caddyfile`.
- Caddy real atual importa snippets de `/root/CentralDark/infra/caddy`, mas ainda nao importa o snippet do Builder Bolt.
- DNS de `builder.centralldark.com` resolve para IP publico.
- HTTPS publico ainda nao abre (`HTTP_CODE=000`, curl exit 35), esperado enquanto o Caddy real nao estiver ativado para o dominio.

Relatorio operacional do precheck:

```txt
/root/CentralDark/revisoes/20260616-123518-builder-bolt-caddy-precheck/relatorio.md
```

## Patch preparado

- `infra/caddy/builder.centralldark.com.Caddyfile` agora faz apenas proxy e headers seguros basicos, sem sobrescrever COOP/COEP. Esses headers ja vem do upstream e devem ser preservados.
- `scripts/deploy/ativar-builder-bolt-caddy.sh` criado para ativacao real com Tema Bash V4, precheck, backup, instalacao do snippet, `caddy validate`, reload e validacao publica.
- `scripts/validate/builder-bolt-static-checks.sh` atualizado para validar o ativador Caddy e impedir COOP/COEP hardcoded no snippet.
- `apps/builder-bolt/PLANO.md`, `docs/PENDENCIAS.md` e `CentralDark/README.md` atualizados com estado e proximo passo.

## Tentativa real com confirmacao humana

Em 2026-06-16, a frase literal `CONFIRMO CADDY BUILDER BOLT` foi recebida e o script foi executado com `CD_CONFIRM_CADDY_BUILDER_BOLT=1`.

Resultado:

- Precheck do Builder Bolt passou: container `running/healthy`, sem restart, HTTP local `200`.
- Backup do Caddyfile real foi salvo em `/root/CentralDark/revisoes/20260616-124632-builder-bolt-caddy/Caddyfile.backup`.
- O snippet real do Builder Bolt ja estava importado no Caddyfile real.
- O processo parou antes do reload porque `caddy validate` falhou em um import pre-existente ausente:

```txt
/root/CentralDark/infra/caddy/portal.Caddyfile
```

O Caddy permaneceu `active`, mas nao houve reload e `https://builder.centralldark.com` continuou sem abrir.

Decisao segura tomada naquele momento: nao criar, remover ou alterar o import de portal dentro da autorizacao do Builder Bolt. A correcao do import ausente precisava de confirmacao humana separada.

## Correcao do import portal e resultado final

Depois, a confirmacao separada foi recebida:

```txt
CONFIRMO CORRIGIR IMPORT PORTAL CADDY
```

Foi criado `/root/CentralDark/infra/caddy/portal.Caddyfile` como placeholder inerte/comentado, sem site block, proxy ou dominio. O unico objetivo foi satisfazer o import pre-existente do Caddyfile real.

Resultado final:

- `caddy validate --config /etc/caddy/Caddyfile`: OK.
- Reload do Caddy: OK.
- Certificado Let's Encrypt de `builder.centralldark.com`: emitido.
- `https://builder.centralldark.com`: `HTTP/2 200`.
- HTML: carregou com titulo `Bolt`.
- Asset JS principal: `200`.
- Headers: `Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff`.
- Container `centraldark-builder-bolt`: `running`, `healthy`, `RESTARTING=false`, `EXIT=0`, `RESTARTS=0`.
- Log do container: sem `wrangler: not found`, panic ou fatal. Permanecem apenas aviso conhecido `indexedDB is not available in this environment` e probes externos sem rota (`/wp-json/`, `/xmlrpc.php`).

Relatorio da execucao final:

```txt
/root/CentralDark/revisoes/20260616-125116-builder-bolt-caddy/relatorio.md
```

## Como aplicar quando autorizado

Executar somente com confirmacao humana literal:

```bash
cd /root
CD_CONFIRM_CADDY_BUILDER_BOLT=1 bash scripts/deploy/ativar-builder-bolt-caddy.sh "CONFIRMO CADDY BUILDER BOLT"
```

Sem essa confirmacao, o script roda dry-run/precheck e para antes de alterar Caddy real.

Bloqueio de validacao resolvido:

```txt
File to import not found: /root/CentralDark/infra/caddy/portal.Caddyfile
```

## Nao tocado

- Caddy real, reload real e `/etc/caddy/Caddyfile`.
- Docker real, containers antigos e porta `3000`.
- Open WebUI.
- WuzAPI, WhatsApp, sessoes e CRM.
- Supabase, banco real, secrets, tokens e `.env`.
- PM2.
