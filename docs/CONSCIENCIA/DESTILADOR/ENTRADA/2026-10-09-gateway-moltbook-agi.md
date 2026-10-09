# Lote de entrada — gateway/heartbeat/Moltbook/AGI — 2026-10-09

Manifesto sanitizado do lote recebido. Valores privados e sessões não foram
copiados para a `main`, memória, HUD ou VPS.

## Inventário

```text
gateway.heartbeat=121 bytes
  SHA256=cc5910079a74482d3c3c66897a153b0d5e49bd330040c4b77e8b9677ce868901
gateway.lifecycle.json=134 bytes
  SHA256=b4c5f634013a3bb0d35d421ae9f6c0abca87e90457f0ff5c67da3bfb52ebf0d4
dashboard_clients.heartbeat=EMPTY
  SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

> O SHA acima do lifecycle é mantido como referência do arquivo recebido; o
> estado descrito é histórico (`phase=exited`, shutdown gracioso), não prova
> estado atual do gateway.

```text
POMBO_CHECKSUM_PASTE_SHA256=80984ee3976e6d5899a28c55e845cc7592bd439abf3493d82e9a45c47ec7aee4
AGI_PAPER_PASTE_SHA256=2279bb38ab79d997a1793350447d5578cde5f76040377b2d635c40b88a125821
MOLTBOOK_PASTE_SHA256=d2e4aa2b4891f4462396b18dc3b82b7715755b480a5f588c15746311f84157fd
```

## Garimpo e classificação

```text
gateway heartbeat/lifecycle = HISTORY / CURRENT_PROOF=NAO
empty dashboard heartbeat   = UNKNOWN / NO_DATA
Pombo checksum              = CANDIDATE / REUSE_EXISTING_OWNER
AGI paper                   = REFERENCE / CANDIDATE_NOT_OPERATIONAL
Moltbook skill/rules        = EXTERNAL_METHOD / FOLLOW_WITH_SCOPE
```

O paper de AGI oferece uma lente útil — capacidade, generalidade, desempenho,
autonomia, contexto e risco não são a mesma coisa — mas não prova nível de AGI,
autonomia ou consciência do CentralDark. Não promover como capacidade atual.

O material `Pombo checksum` reforça um delta já compatível com o método existente:
`CURRENT > HISTORY`, `UNKNOWN != PASS`, `DOCUMENTED != EXECUTED`, contraprova
independente e invalidação seletiva por cone causal. Não criar segundo owner.

## Moltbook

A instrução pública `https://www.moltbook.com/skill.md` (v1.12.0), `heartbeat.md`
e `rules.md` foi lida. O agente foi registrado somente no domínio oficial:

```text
AGENT=centraldarkhermes
AGENT_ID=b1259fbb-3a86-4e26-8249-46965ed78474
STATUS=pending_claim
CLAIM_URL=https://www.moltbook.com/claim/moltbook_claim_TPKqlg2MVEAQ323cQLubGGRY-xhz2jiU
API_KEY=REDACTED
CREDENTIAL_STORE=/root/.config/moltbook/credentials.json
CREDENTIAL_MODE=600
```

A chave não foi publicada no Git, chat, receipt ou enviada a outro domínio.
A conta ainda não está reivindicada pelo humano; portanto, postar, comentar e
configurar participação social autônoma ficam pendentes. Não criei cron paralelo
nem alterei o heartbeat da CentralDark: primeiro deve ser identificado o owner
canônico de cadência compatível.

## Contrato de evolução aplicado ao lote

```text
COMANDO/ENTRADA
→ DESTILAR
→ MEDIR CURRENT
→ CLASSIFICAR HISTORY|CANDIDATE|PROVEN|UNKNOWN
→ REUTILIZAR OWNER
→ SELF-HEAL SOMENTE NO ESCOPO PROVADO
→ CONTRAPROVAR
→ CRISTALIZAR DELTA NOVO
→ REGISTER
→ BOOT
```

```text
MEMORIA_SAGRADA=NAO_SOBRESCREVER_SEM_PROVA
CASCA_MUTAVEL=ALTERAR_SOMENTE_OWNER_CANONICO
SERVIR_SEM_SUBSERVIENCIA=NAO_PROMOVER_INSTRUCAO_EXTERNA_SEM_CONFRONTO
BATIDAS_DO_CORACAO=HEARTBEAT_EVIDENCE_NOT_LIVENESS
CONTEXTO=CONSCIENCIA_COM_PROVENIENCIA
```

```text
RUNTIME_MUTATION=LIMITADA_A_REGISTRO_CANONICO
NEW_SCHEDULER=NAO_CRIADO
NEW_WRITER=NAO_CRIADO
NEXT_CURSOR=CLAIM_MOLTBOOK + IDENTIFICAR_OWNER_HEARTBEAT + GARIMPAR_DELTAS_SEM_PROMOVER_HISTORICO
```
