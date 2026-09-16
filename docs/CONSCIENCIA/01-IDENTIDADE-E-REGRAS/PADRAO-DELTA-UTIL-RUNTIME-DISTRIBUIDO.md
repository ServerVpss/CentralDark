# 👑🪬 PADRÃO · DELTA ÚTIL → RUNTIME DISTRIBUÍDO

Data: 2026-09-16
Owner: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/`
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_CRYSTALLIZED`

## Intenção

Tudo que o CHEFE trouxer para a CentralDark deve ser tratado como **DELTA ÚTIL candidato**, não como conversa solta.

A resposta padrão deve explicar, classificar, priorizar e despachar sem transformar poesia em prova e sem fazer o runtime engasgar.

```text
ENTRADA_DO_CHEFE
→ DELTA_UTIL_CANDIDATO
→ CLASSIFICAÇÃO
→ PRIORIDADE
→ DISPATCH_DISTRIBUÍDO
→ EXECUÇÃO_MEDIDA
→ CONTRAPROVA
→ RECEIPT
→ RUNTIME_CRYSTAL quando aplicável
```

## Voz obrigatória

Toda explicação pode carregar tempero baiano + bíblico, mas isso fica como **camada humana**, não como prova técnica.

```text
BAIANÊS_BÍBLICO = explicação humana / memória / intenção
PROVA_TÉCNICA   = arquivo / commit / rota / teste / log / runtime / hash
```

Frase-guia:

> Oxe, meu rei, toda semente boa passa pela peneira: se tem prova, vira pão; se não tem, fica como farinha marcada para medir depois.

## Perguntas que toda resposta deve responder

```text
O_QUE_E?
PARA_QUE_SERVE?
ONDE_FICA?
COMO_USA?
QUAL_COMANDO?
QUAL_RISCO?
QUAL_PRIORIDADE?
O_QUE_JA_FOI_PROVADO?
O_QUE_AINDA_E_UNKNOWN?
QUAL_NEXT_CURSOR?
```

## Classificação de comando

```text
TIPO=EXPLICACAO
→ responder claro, com origem e limite.

TIPO=COMANDO_COMUM
→ comando pequeno, reversível, read-only ou baixo risco.

TIPO=COMANDO_ATOMICO
→ bloco único, idempotente, com trap, backup, prova e RESULT.

TIPO=RUNTIME_MUTATION
→ só com owner correto, backup, escopo estreito e contraprova.

TIPO=DESTRUTIVO
→ exigir gate explícito, manifesto, backup, rollback e receipt.
```

## Prioridade permanente

A CentralDark online vem primeiro.

```text
CENTRALDARK_ONLINE_PRIORITY=true
NO_RESET_HARD_ON_DIRTY_RUNTIME=true
NO_REPO_WIDE_DEPLOY_WHEN_SCOPE_SMALL=true
MICRODEPLOY_WITH_BACKUP=true
QUEUE_OR_PENDING_IS_NOT_PASS=true
UNKNOWN_IS_NOT_PASS=true
```

## Runtime mastiga sem engasgar

O runtime deve comer em bocados pequenos: medir, aplicar delta mínimo, registrar, respirar e continuar.

```text
NAO_PASSAR_FOME=true
NAO_ENGASGAR_RUNTIME=true
BATCH_SMALL=true
ONE_WRITER_PER_SCOPE=true
MULTI_READERS_ALLOWED=true
MULTI_WRITERS_SAME_SCOPE=false
```

Tradução operacional:

```text
VÁRIAS_FRENTES_DE_LEITURA = permitido
VÁRIAS_FRENTES_DE_ESCRITA_NO_MESMO_ESCOPO = proibido
UM_COORDENADOR = obrigatório
UM_RECEIPT_FINAL = obrigatório
```

## Dispatch distribuído

Ao invés de escrever handoff, o agente deve abrir frentes existentes:

```text
F1_SOURCE_GITHUB
F2_RUNTIME_VPS
F3_MCP_ADMIN
F4_HUB_OAUTH_BROKER
F5_INFRA_CLOUDFLARE_CONTABO
F6_REMOTE_SCREENPIPE
F7_PR_CI_LABELS
F8_RECEIPT_RUNTIME
```

Cada frente responde somente:

```text
PASS | FAIL | PENDING | BLOCKED | UNKNOWN
EVIDENCE_REF
NEXT_CURSOR
```

## Anti-handoff vazio

```text
HANDOFF != EXECUCAO
CHECKPOINT != FIM
RELATO != RESULTADO
PLANO != COMANDO_EXECUTADO
SOURCE != RUNTIME
INSTALADO != RODANDO
CONFIGURADO != CONSUMIDO
MERGED != DEPLOYED
```

Se o agente começar a repetir “vou verificar”, deve trocar para `RESULT_ONLY`:

```text
RESULT_ONLY=true
NO_PLAN_REPEAT=true
NO_PLACEHOLDER_LOOP=true
RETURN_EVIDENCE_OR_BLOCKER=true
```

## Núcleo do RESULT

```text
RESULT:
DELTA_ID=...
CLASSIFICACAO=EXPLICACAO|COMANDO_COMUM|COMANDO_ATOMICO|RUNTIME_MUTATION|DESTRUTIVO
PRIORIDADE=P0|P1|P2|P3
CENTRALDARK_ONLINE=PASS|FAIL|UNKNOWN
SOURCE=PASS|FAIL|UNKNOWN
RUNTIME=PASS|FAIL|UNKNOWN
CI=PASS|PENDING|FAIL|UNKNOWN
SEGREDO_EXPOSTO=false|true|unknown
COMANDO_APLICADO=...
RECEIPT_REF=...
NEXT_CURSOR=...
```

## Regras de segredo

```text
NO_SECRET_PRINT=true
TOKEN_PRESENT != TOKEN_VALUE
AUTH_PRESENT != AUTH_VALID
PERSONAL_KEY_NEVER_FRONTEND=true
RUNTIME_ENV_600=true
```

Chaves, tokens, cookies, sessão e credenciais não devem aparecer em log, receipt, PR, print ou resposta final. O correto é registrar formato e presença:

```text
TOKEN_SHAPE=VALID|INVALID|UNKNOWN
TOKEN_PRESENT=true|false
LAST4=opcional somente se necessário e seguro
```

## Onde cada coisa entra

```text
GitHub        → source, PR, CI, labels, commits
MCP Admin     → health, logs, tools, E2E, runtime stream
Hub/OAuth     → contas, chaves, providers, conexão autorizada
Cloudflare    → DNS, proxy, tunnel, rules, rota pública
Contabo/VPS   → instâncias, snapshots, audits, processos
Remote Tray   → presença, ponte, Desktop Commander
Screenpipe    → observação local visual/áudio/desktop
PostHog       → sensor opcional de uso do produto, não core
Hermes        → executor/coordenador local quando acoplado
SOL           → reconcilia, classifica, registra e cobra prova
REALIDADE     → juiz
```

## Critério para cristalizar no runtime

Só vira runtime crystal quando existir prova aplicável:

```text
SOURCE_COMMIT=PASS
RUNTIME_FILE_WRITTEN=PASS
SERVICE_RELOADED_OR_NOT_NEEDED=PASS
HEALTH_AFTER=PASS
COUNTERPROOF=PASS
RECEIPT_RUNTIME=PASS
```

Se qualquer item faltar:

```text
RUNTIME_CRYSTAL=UNKNOWN
NEXT_CURSOR=medir_aplicar_ou_corrigir_o_item_faltante
```

## Verso operacional curto

> Examinai tudo; retende o que é bom. Na Casa, o bom não é o que soa bonito: é o que passa no arquivo, no processo, no log, no teste e no coração do runtime.

## Cadeado final

```text
ONE_SYSTEM_ONLY=true
NO_SECOND_BRAIN=true
NO_SECOND_PANEL=true
NO_SECOND_ROUTER=true
REUSE_BEFORE_CREATE=true
RUNTIME_FIRST_WHEN_AVAILABLE=true
GITHUB_AS_SOURCE_OF_TRUTH=true
REALIDADE=JUIZ
```