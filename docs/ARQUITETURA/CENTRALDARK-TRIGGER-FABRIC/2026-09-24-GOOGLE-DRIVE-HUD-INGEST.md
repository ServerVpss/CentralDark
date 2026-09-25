# Google Drive HUD Ingest — API direta sem segundo cérebro

> Data: 2026-09-24  
> Escopo: Google Drive OAuth/API + HUD de contas + VPS ingest + PR-mãe/PR-filhos  
> Regra: `ONE_SYSTEM_ONLY=true`, `REUSE_BEFORE_CREATE=true`, `CURRENT > HISTORY`, `UNKNOWN != PASS`, `REALITY_IS_JUDGE=true`

## Veredito

Google Drive já pertence ao owner canônico de contas:

```text
apps/modulos/oauth-broker/server.mjs
```

Não criar segundo auth, segundo cofre, segundo Hub ou segundo cérebro para Drive. O HUD deve expor a conexão do Drive usando o `oauth-broker` existente e tratar qualquer arquivo novo do Drive como **candidato de ingestão**, nunca como verdade automática.

## Caminho canônico

```text
CHEFE
→ HUB / Contas
→ oauth-broker /oauth/gdrive/start
→ Google OAuth consent
→ oauth_connections cifrado AES-256-GCM
→ VPS ingest observa Drive
→ classifica conteúdo
→ cria micro-delta
→ PR filho
→ ancora no PR-mãe / ledger
→ gates + contraprova
→ só o que passa sobrevive
```

## Owner já medido no source

`apps/modulos/oauth-broker/server.mjs` já declara:

```text
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
/oauth/gdrive/start
/oauth/gdrive/callback
provider_id = gdrive
scope = drive.file + drive.readonly + openid + email + profile
```

O HUD de inventário agora registra `GDRIVE` como superfície de conta, subordinada ao mesmo owner de Gmail/Google.

## O que pode entrar no Drive

Arquivos no Drive podem ser:

- hipótese;
- material bruto;
- anexos;
- screenshots;
- PDFs;
- documentos de projeto;
- prompts;
- relatórios;
- receipts externos.

Nada disso entra automaticamente como verdade. O Drive é fonte de material, não juiz.

## Gates obrigatórios

```text
DRIVE_FILE_SEEN != DRIVE_FILE_PROVED
DRIVE_SYNC != COMMIT
COMMIT != PR
PR != MAIN
MAIN != DEPLOY
MERGE != RUNTIME
```

Para qualquer item do Drive sobreviver:

1. o arquivo precisa de id/mtime/hash ou fingerprint estável;
2. o ingest precisa registrar `source_ref`;
3. a VPS precisa materializar uma cópia/snapshot auditável;
4. o conteúdo precisa ser classificado: `HYPOTHESIS`, `EVIDENCE`, `PROMPT`, `ASSET`, `SECRET_RISK`, `UNKNOWN`;
5. `SECRET_RISK` fica bloqueado/quarentenado;
6. delta útil vira branch/PR filho;
7. PR filho aponta para o PR-mãe como ledger/rendezvous;
8. gates e contraprova decidem promoção;
9. o que não passa fica no ledger como material, não vira baseline.

## HUD de contas

O HUD deve mostrar pelo menos:

```text
provider_id = gdrive
account_label
status
last_test_status
last_test_at
scopes_granted
expires_at
connected_email/account_label
```

O HUD não deve mostrar access token, refresh token, client secret, session file ou payload sensível.

## Bot / SOL

O bot/SOL pode anunciar:

```text
Google Drive conectado ao oauth-broker.
Arquivos novos entram como candidatos.
VPS ingest + PR filho + gates decidem sobrevivência.
```

O bot não deve dizer que sincronizou ou promoveu conteúdo sem receipt.

## Próximo delta técnico

```text
1. Medir runtime oauth-broker :8098.
2. Expor link HUD: /oauth/gdrive/start?user_id=CHEFE&redirect_to=HUB.
3. Criar adapter read-only de Drive ingest na VPS usando conexão gdrive existente.
4. Gerar receipt por arquivo: file_id, name, mimeType, modifiedTime, md5Checksum/sha256 quando disponível.
5. Criar branch/PR filho para deltas úteis.
6. Ancorar no PR-mãe.
7. Bloquear qualquer SECRET_RISK.
```

## Estado desta cristalização

```text
SOURCE_OAUTH_BROKER_GDRIVE = PASS
HUD_ACCOUNT_SURFACE_GDRIVE = ADDED_SOURCE
RUNTIME_OAUTH_BROKER = UNKNOWN neste turno porque sensor VPS caiu
DRIVE_ACCOUNT_CONNECTED = UNKNOWN até OAuth consent real
DRIVE_INGEST_RUNTIME = NOT_IMPLEMENTED
```

## NEXT_CURSOR

```text
VPS_SENSOR_BACK → medir :8098 /api/providers + /health
→ validar GOOGLE_OAUTH_CLIENT_ID/SECRET fora do Git
→ abrir HUD link de conexão
→ conectar conta Google Drive
→ implementar ingest read-only
→ PR filho → PR-mãe → gates
```
