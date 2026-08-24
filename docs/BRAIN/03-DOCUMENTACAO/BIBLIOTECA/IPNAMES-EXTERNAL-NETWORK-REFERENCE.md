# 📡 IPNAMES → referência externa de rede

Status: `HANDOFF_READY_FOR_HERMES`
Autoridade: `SEGREDO/CHEFE`
Owner existente: `docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md`
Ontologia aplicável: `docs/GOVERNANCA/ONTOLOGIA-DE-EVIDENCIA-E-CAUSALIDADE.md`
Writer desta rodada: `SOL`
Writer-scope: `HANDOFF_DOC_ONLY`
Deploy autorizado: `false`

## Intenção

Preparar a integração de `antonme/ipnames` como **enriquecimento externo de rede** da CentralDark, sem transformar feed público em autoridade, sem criar segunda fonte da verdade e sem alterar firewall/VPN automaticamente.

Upstream observado:

```text
repo=antonme/ipnames
branch=master
commit=954b53bb9d106f5f74a39ca719576ed1cbd85387
observed_at=2026-08-22
```

O README do upstream declara listas atualizadas de FQDNs e IPv4/IPv6 para serviços como OpenAI/ChatGPT, GitHub, Google, Anthropic/Claude, Hugging Face e outros; a metodologia combina logs DNS, fontes externas, Certificate Transparency e resolução em múltiplos DNS/regiões.

## Papel correto na Casa

```text
antonme/ipnames
        ↓
INDEXED_EXTERNAL_REFERENCE
        ↓
source identity + upstream commit + timestamp
        ↓
providers materialmente usados
        ↓
FQDN / IPv4 / IPv6 observados no feed
        ↓
comparar com DNS / conexão / trace LOCAL
        ↓
ENRICHMENT
        ↓
CONTRAPROVA
        ↓
diagnóstico / evidência contextual
```

O feed responde: **"isso já foi observado associado a este serviço nessa fonte e nesse tempo?"**

Ele NÃO responde sozinho: **"este IP é autenticado como este serviço"**, **"este IP é malicioso"** ou **"esta foi a causa"**.

## Invariantes

```text
EXTERNAL_NETWORK_INTELLIGENCE != NETWORK_TRUTH
EXTERNAL_FEED != LOCAL_REALITY
IP_PRESENTE_NO_FEED != SERVICO_AUTENTICADO
IP_AUSENTE_DO_FEED != MALICIOSO
FQDN_ASSOCIADO != CAUSALIDADE
NETWORK_REQUEST != TOOL_SUCCESS
CORRELACAO != CAUSALIDADE
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
REALITY_JUDGES_CLAIMS_NOT_LABELS=true
UNKNOWN != MALICIOUS
HISTORICAL != CURRENT
```

## O que pode gerar

Estados de enriquecimento sugeridos, sem promover para veredito:

```text
FEED_MATCH
FEED_MISS
FEED_UNAVAILABLE
NEW_FQDN_CANDIDATE
NEW_IP_CANDIDATE
DISAPPEARED_IP_CANDIDATE
RESOLUTION_DIVERGENCE
PLAUSIBLE_PROVIDER_ASSOCIATION
UNSEEN_IN_FEED
```

`FEED_MISS` e `UNSEEN_IN_FEED` significam apenas ausência no snapshot consultado.

## Segurança

- Não usar o feed para allowlist/denylist automática.
- Não alterar firewall, VPN, rota, DNS ou Zero Trust automaticamente.
- Não classificar malware por IP isolado.
- Não copiar/vendorizar código ou dataset do upstream enquanto licença de incorporação/redistribuição não estiver comprovada.
- Referenciar upstream por proveniência; guardar somente identidade, versão/commit, tempo, hashes/contagens quando necessário.
- Se o feed estiver indisponível, degradar para `UNKNOWN/FEED_UNAVAILABLE` sem quebrar runtime.

## Consumer operacional

Hermes deve localizar primeiro o **consumer de rede já existente** da Casa e estendê-lo. Não criar `IPNAMES-V2`, segundo motor de rede ou segundo banco.

```text
REUSE_BEFORE_CREATE
→ localizar consumer de DNS/trace/conexão
→ localizar receipt/proof owner aplicável
→ adapter fino para fonte externa
→ teste positivo + teste negativo
→ gate
→ somente então habilitar consulta operacional
```

Se nenhum consumer adequado existir, parar em `BLOCKED_OWNER_NOT_FOUND` e devolver evidência da busca; não inventar um sistema paralelo.

## Prova mínima para Hermes

1. Recuperar o upstream e registrar `repo + branch + commit + timestamp`.
2. Lookup conhecido positivo em provider usado pela Casa.
3. Lookup inexistente retorna `UNSEEN_IN_FEED/UNKNOWN`, nunca `MALICIOUS`.
4. Divergência `feed ↔ DNS local` permanece divergência observada, sem falso veredito.
5. Feed indisponível não quebra o consumer local.
6. Provar zero efeito em firewall/VPN/rota/DNS.
7. Teste negativo: IP presente no feed não pode promover automaticamente para `SERVICO_AUTENTICADO`.
8. Receipt deve separar `FATO / INFERENCIA / UNKNOWN` e citar upstream observado + realidade local medida.

## DONE

```text
LOCAL_NETWORK_OBSERVATION
+ IPNAMES_REFERENCE_WITH_PROVENANCE_AND_TIME
+ LOCAL_DNS_OR_TRACE
+ COUNTERPROOF
→ CONTEXTUAL_NETWORK_EVIDENCE
```

DONE somente quando uma observação local puder receber contexto externo do `ipnames` com proveniência + tempo + contraprova, sem criar segunda verdade e sem automação destrutiva.

## Estado desta PR

```text
UPSTREAM_VALIDATED=YES
UPSTREAM_COMMIT=954b53bb9d106f5f74a39ca719576ed1cbd85387
LIBRARY_OWNER_REUSED=YES
NETWORK_ONTOLOGY_REUSED=YES
RUNTIME_ADAPTER_IMPLEMENTED=NO
TESTS_EXECUTED=NO
FIREWALL_CHANGED=NO
VPN_CHANGED=NO
DEPLOY=NO
READY_FOR_HERMES_IMPLEMENTATION=YES
```

Esta PR é deliberadamente um **handoff implementável**, não uma declaração de que o runtime já está integrado.
