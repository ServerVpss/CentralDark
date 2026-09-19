# 👑🪬 PADRÃO · DELTA ÚTIL → RUNTIME DISTRIBUÍDO

Data: 2026-09-16
Owner: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/`
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_CRYSTALLIZED`

## Intenção

Tudo que o CHEFE trouxer para a CentralDark deve ser tratado como **DELTA ÚTIL AUTORIZADO PARA ABSORÇÃO**, não como conversa solta e não como candidato por padrão.

`CANDIDATO` só existe quando o CHEFE disser explicitamente que aquilo ainda é candidato, dúvida, hipótese, rascunho, teste ou exploração.

A resposta padrão deve explicar, classificar, priorizar e despachar sem transformar poesia em prova e sem fazer o runtime engasgar.

## Compressão arquitetural (CHEFE · 2026-09-19)

O sistema cresce por compressão, não por inchaço. Menos por fora, mais por dentro. Não simplificar destruindo informação.

```text
MATÉRIA
→ CRUZAR com o que já existe
→ REDUZIR repetição/ambiguidade
→ PRESERVAR só complexidade com função (same-head, lease, runtime, contraprova)
→ COMPRIMIR ao menor delta útil
→ DESTINO = owner existente + gate
```

```text
DUAS_REGRAS_MESMA_COISA     → FUNDIR
DOIS_SISTEMAS_MESMO_PAPEL   → RECONCILIAR_NO_MESMO_OWNER
SEM_CAPACIDADE_NOVA         → DROP
CAPACIDADE_CABE_NO_EXISTENTE→ EXTEND
LACUNA_PROVADA_INSUPERÁVEL  → CRIAR (só com prova)
```

Saída operacional ao processar input do CHEFE:

```text
[OWNER]        peça existente
[DROP/EXTEND]  o que saiu / o que ficou
[DELTA ÚTIL]   instrução final, simples por cima, amarrada por baixo
```

Não criar `CONTRATO-BASE` paralelo. Este bloco estende este owner. Reconciliação-antes-de-criar continua canônica.

```text
MATÉRIA → PEGATUDO → DEDUPE → META_LUPA → OWNER → MENOR DELTA → CONTRAPROVA → CRISTAL
```

Cada informação nova justifica a própria existência. Objetivo: **mais capacidade com menos peça**.

```text
MAIS CONHECIMENTO → MENOS DUPLICAÇÃO → MENOS OWNERS → MENOS ROTAS
→ MAIS CAPACIDADE → MAIS PROVA → MAIS RESILIÊNCIA
```

**COMPLEXIDADE ABSORVIDA:** rigor na fundação (Git, CI, Hermes, MCP, heartbeat, gates, receipts, Reality Judge). Superfície: CHEFE aponta → Casa entende → executa → prova.

`SIMPLES != BURRO`. Cortar prova, segurança, rastreio, estado ou recuperação **não** é compressão — é amputação.

```text
SIMPLICIDADE_MAXIMA_NA_SUPERFICIE
RIGOR_MAXIMO_NA_FUNDACAO
```

```text
ENTRADA_DO_CHEFE
→ DELTA_UTIL_AUTORIZADO
→ CLASSIFICAÇÃO
→ PRIORIDADE
→ DESTINATION_LOCK
→ OWNER_EXISTENTE
→ DISPATCH_DISTRIBUÍDO
→ EXECUÇÃO_MEDIDA
→ CONTRAPROVA
→ RECEIPT
→ RUNTIME_CRYSTAL quando aplicável
```

## Regra do CHEFE · DEFAULT_ABSORB

```text
DEFAULT_DO_CHEFE = ABSORVER_NA_CENTRALDARK
CANDIDATO_AUTOMATICO = false
CANDIDATO_SOMENTE_SE_CHEFE_DISSER = true
DELTA_UTIL_AUTORIZADO = true
TRABALHO_ATOMICO = true
```

O agente não deve rebaixar a entrada do CHEFE para candidato por cautela genérica. A cautela correta é outra: manter a CentralDark online, localizar o owner, aplicar delta mínimo, provar, registrar e marcar `UNKNOWN` quando a prova ainda não fechou.

```text
CAUTELA_CORRETA = ESCOPO_ESTREITO + BACKUP + TESTE + CONTRAPROVA
CAUTELA_ERRADA  = CHAMAR_TUDO_DE_CANDIDATO_E_PARAR
```

## Gate TLC23/Horn

O gate TLC23 entra como forma de propagação lógica: premissas verdadeiras disparam consequências até ponto fixo; contradição ou objetivo negativo bloqueia promoção.

```text
FATO_DO_CHEFE
→ REGRA_CANONICA
→ HORN_PROPAGATION
→ OWNER
→ PATCH_ATOMICO
→ TESTE
→ CONTRAPROVA
→ FIXED_POINT
```

Aplicação operacional:

```text
SE CHEFE_ENTREGOU_DELTA=true
E ESCOPO_AUTORIZADO=true
E OWNER_EXISTENTE=true
E RISCO_DESTRUTIVO=false
ENTÃO APLICAR_DELTA_ATOMICO=true
```

Exceções:

```text
SE CHEFE_DISSER_CANDIDATO=true → manter como candidato
SE RISCO_DESTRUTIVO=true       → exigir gate explícito
SE OWNER_UNKNOWN=true          → medir antes de escrever
SE CENTRALDARK_ONLINE_RISK=true→ reduzir escopo / microdeploy / backup
SE CONTRADICAO=true            → fail closed + receipt
```

## Gate obrigatório antes de commit

Para qualquer commit que altere padrão lógico, regime operacional, regra de absorção, contraprova ou fixed point, o PDF TLC23 deve ser consultado **antes** da mutação no source.

```text
PDF_GATE_BEFORE_COMMIT_REQUIRED=true
TLC23_READ_BEFORE_MUTATION=true
NO_AFTER_THE_FACT_PDF_PROOF=true
COMMIT_WITHOUT_GATE_FOR_LOGICAL_RULE=FAIL
```

O gate não é enfeite de citação posterior. Ele é pré-condição da escrita quando o delta depende de lógica Horn, satisfazibilidade, contradição, objetivo ou ponto fixo.

```text
ANTES_DE_COMMITAR:
1. READ_TLC23_GATE
2. MAPEAR_PREMISSAS
3. PROPAGAR_REGRAS
4. CHECAR_CONTRADICAO
5. DEFINIR_OWNER_EXISTENTE
6. SÓ_ENTÃO_COMMITAR
```

## Voz obrigatória

Toda explicação pode carregar tempero baiano + bíblico, mas isso fica como **camada humana**, não como prova técnica.

```text
BAIANÊS_BÍBLICO = explicação humana / memória / intenção
PROVA_TÉCNICA   = arquivo / commit / rota / teste / log / runtime / hash
```

Frase-guia:

> Oxe, meu rei, semente que o CHEFE entrega já vem para plantar na Casa; só fica na peneira de candidato quando o próprio CHEFE disser que ainda é grão de teste.

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
```
