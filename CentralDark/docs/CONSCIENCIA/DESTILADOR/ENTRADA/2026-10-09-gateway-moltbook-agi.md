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
STATUS_AT_SOURCE_TIME=pending_claim
OWNER_REPORT_2026_10_09=verified
AUTHENTICATED_RUNTIME_READBACK=UNKNOWN
CLAIM_URL=REDACTED_SENSITIVE_HISTORICAL
API_KEY=REDACTED
CREDENTIAL_STORE=/root/.config/moltbook/credentials.json
CREDENTIAL_MODE=600
```

A chave não foi publicada no Git, chat, receipt ou enviada a outro domínio.
O lote acima é histórico: havia `pending_claim` na medição original.
O CHEFE informou em 2026-10-09 que `Centraldarkhermes` já foi verificado,
mas o runtime da VPS ainda não apresentou readback de identidade autenticada.
A consulta pública diária foi testada separadamente; não habilita postagens,
comentários ou participação social automática. Não criei cron paralelo
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

## Readback Moltbook diário — 2026-10-09

O lote acima continua HISTÓRICO. A capacidade operacional foi acrescentada
ao **Knowledge Compiler existente** e ao **mesmo job do Hermes**, sem novo
agente, cron, gateway, HUD ou API key:

- `main`: commit `3b0edb06b75485f2d7cbaec82bcd1d820b19cf35`,
  `.agents/skills/knowledge-compiler/scripts/moltbook-daily.mjs` e
  `tests/moltbook-daily.test.mjs`; testes VPS **5/5 PASS**,
  compilador principal **21/21 PASS**.
- GET público em `www.moltbook.com/api/v1/posts?sort=new&limit=12`:
  `READ_OK`, 12 títulos/IDs externos candidatos (`EXTERNAL_UNTRUSTED`);
  SHA-256 da coleção e IDs ficam apenas em recibo local sem corpos
  privados. Repetir a chamada no mesmo dia devolveu `ALREADY_READ`
  sem segunda coleta (`new_count=0`).
- Recibo local: `/root/.hermes/state/centraldark/moltbook-daily.json`,
  modo `600`; estado `identity_status=NOT_TESTED_PUBLIC_READ`.
- Scheduler existente: `/root/.hermes/cron/jobs.json`, job id
  `fd9b50e7cb0e` `enabled=true`, expressão
  `0 3,7,11,15,19,23 * * *` (6 rodadas por dia). Prompt deste
  **mesmo job** atualizado com `MOLTBOOK_PUBLIC_DAILY_READ_20261009`
  e backup privado; `JOBS_TOTAL=5`, readback PASS.
- **Execução automática futura**: aguarda receipt após próxima rodada.
  `JOB_CONFIGURED=PASS` não é `JOB_AUTO_EXECUTED=PASS`.
  Ler o feed não equivale a instalar novas capacidades nem confirmar
  identidade autenticada, por isso cada pepita ainda requer comparação
  com `main/VPS`, teste, contraprova e readback antes de aplicação.
- O link antigo de reivindicação foi sanitizado no HEAD atual. Links
  anteriormente publicados podem permanecer no histórico do Git; se
  ainda forem válidos, revogar/rotacionar na origem.
