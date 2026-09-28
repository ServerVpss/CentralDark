---
title: "AURÉOLA CANÔNICA

 Ôchí sincronizei o delta do Dr"
date: 2026-09-24
tags: ["devedores-&-contatos"]
---

## 24/09/2026

⭕ !AURÉOLA CANÔNICA

🌴 Ôchí, sincronizei o delta do Drive no lugar certo. Não joguei nada em Git que pareça token/chave.

## ✅ Feito agora

Criei o PR filho #1677:

**feat(hud): registrar Google Drive no fluxo de ingest**

Base medida:

main = 8186d8b17ec7d59691ce25bf849174f3821a5b60

O PR ficou:

state = open
mergeable = true
head = 16fabfa4b3f2bdf50934737d18f3232531059a47
changed_files = 2


## O que entrou

### 1. HUD agora reconhece Google Drive

Adicionei GDRIVE no inventário de contas do [[Hub]].

Antes o HUD tinha Gmail, mas Drive não aparecia como superfície explícita. Agora fica assim:

GDRIVE = Google Drive
accountModel = OAuth no Contas / Hub existente
owner = oauth-broker


O próprio inventário já dizia que o registro unificado de contas deve estender o oauth-broker, sem criar segundo auth/hub paralelo.

### 2. Confirmei o owner certo

O owner canônico é:

apps/modulos/oauth-broker/server.mjs


Ele já tem:

/oauth/gdrive/start
/oauth/gdrive/callback
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
provider_id = gdrive
scopes Drive
oauth_connections cifrado


Então não criei outro auth.

### 3. Cristalizei o contrato Drive → [[VPS]] → PR

Criei o documento:

docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/2026-09-24-GOOGLE-DRIVE-HUD-INGEST.md


Regra registrada:

Google Drive OAuth/API
→ oauth-broker
→ VPS ingest
→ classificar conteúdo
→ micro-delta
→ PR filho
→ PR-mãe/ledger
→ gates + contraprova
→ só o que passa sobrevive


## ⚠️ Estado honesto

O sensor VPS caiu no meio:

VPS_SENSOR = BLOCKED / NO DEVICE AVAILABLE


Então eu não declarei runtime verde para:

oauth-broker :8098
Google OAuth env na VPS
Drive account connected
Drive ingest runtime


Isso fica:

RUNTIME_OAUTH_BROKER = UNKNOWN
DRIVE_ACCOUNT_CONNECTED = UNKNOWN
DRIVE_INGEST_RUNTIME = NOT_IMPLEMENTED


## Sobre o erro RECEIPT_EXPIRED

Eu localizei a causa:

OPERATION_RECEIPT_EXPIRED
→ estava caindo em UNKNOWN_FAILURE
→ bot spammava Status como autonomia bloqueada


Mas a VPS caiu antes de eu aplicar e provar o patch. Então:

RECEIPT_EXPIRED_FIX = PENDING / BLOCKED_BY_VPS_SENSOR


Não vou mentir dizendo que consertei.

## CI do PR #1677

Os workflows do novo HEAD apareceram como queued na leitura [[GitHub]].

Então:

CI_PENDING_IS_NOT_PASS


Nada de merge automático ainda.

## Micro-comando para o agente da VPS

!CENTRALDARK #ACORDAR #TIK_TAK
ALVO: GOOGLE_DRIVE_HUD_INGEST + RECEIPT_EXPIRED_SPAM
1. Revalidar VPS online.
2. Medir oauth-broker :8098 /health e /api/providers.
3. Verificar GOOGLE_OAUTH_CLIENT_ID/SECRET somente como PRESENT/ABSENT, sem imprimir valor.
4. Aplicar patch RECEIPT_EXPIRED → RECEIPT_EXPIRED_RECHECK_REQUESTED, sem [[Telegram]] spam UNKNOWN_FAILURE.
5. Rodar testes github-autonomia-varredura + github-autonomia-promocao.
6. Reportar PASS/UNKNOWN/BLOCKED com HEAD e diff.


## NEXT_CURSOR

VPS_SENSOR_BACK
→ medir oauth-broker :8098
→ validar Google OAuth env fora do Git
→ expor botão/link HUD /oauth/gdrive/start
→ conectar conta Google Drive
→ implementar ingest read-only
→ PR filho ancorado no PR-mãe
→ gates


Resumo direto: PR #1677 abriu o caminho correto do Google Drive no HUD e amarrou o contrato. Runtime ainda precisa voltar na VPS para ligar/testar de verdade.

---
*Registrado via bot — 24/09/2026*