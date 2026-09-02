# Sessão → HUD → GARIMPO → MCP — reconciliação 2026-09-02

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**PR-mãe:** `#1381`  
**Natureza:** receipt/ledger subordinado; não cria novo sistema, owner, identidade ou autoridade.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT > HISTORICAL
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
VISUAL != RUNTIME_PROOF
CONNECTED != SYNCHRONIZED
PAIRING_UI != CONNECTION_FAILURE
PAST_ERROR_MUST_IMPROVE_FUTURE=true
NARRATIVE != AUTHORITY
```

## 1. Snapshot T0 observado imediatamente antes deste commit

```text
PR=1381
PR_STATE=OPEN
MERGED=false
MERGEABLE=false
PR_HEAD=452fb23462487c923eb7fddc17c3fb0e0dc2120a
BASE=main
BASE_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
COMMITS=54
CHANGED_FILES=84
AHEAD_OF_MAIN=54
BEHIND_MAIN=58
CI_STATUSES=0
PR_WORKFLOW_RUNS=0
CI_SAME_HEAD=UNKNOWN
HUD_UI_COGNITIVE_GATE=IMPLEMENTED_IN_SOURCE
HUD_RUNTIME_RENDER_T1=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O commit deste receipt avança o HEAD. Portanto o bloco acima é T0, não estado permanente.

## 2. O HUD real que foi reaberto

Owner observado:

```text
apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx
```

O source atual contém materialmente:

```text
COGNITIVE_DEBT
TEORIA_DO_SISTEMA:
- intenção reconstruível?
- decisão explicável?
- owner conhecido?
- relações entre peças claras?
- mudança reversível?
- próximo agente continua sem adivinhar?

CONFIRMACOES_SISTEMATICAS:
- CURRENT > HISTORY
- UNKNOWN != PASS
- DOCUMENTED != EXECUTED
- ACTION != PROOF
- REUSE_BEFORE_CREATE
- ONE_SYSTEM_ONLY
- ONE_WRITER_PER_SCOPE
- CONTINUE_BEFORE_RESTART
```

Esses itens aparecem como `UNKNOWN` ou `REGRA`; não são apresentados como PASS automático. O card GitHub usa `PR #1381 · referência operacional` e não inventa Writer vivo.

### Regra consolidada desta sessão

```text
SE_O_PROXIMO_AGENTE_PRECISA_ADIVINHAR_O_PORQUE
→ COGNITIVE_DEBT=OPEN
→ GLOBAL_FIXED_POINT=NOT_PROVEN
```

O objetivo não é preservar cadeia de pensamento privada; é preservar decisão material reconstruível: intenção, owner, restrição, evidência, contraprova, HEAD/estado e próximo cursor.

## 3. Conexão visual não é falha de arquitetura

A tela `Code Connect` mostrada pelo CHEFE é uma tela de pareamento por código para ligar um dispositivo remoto. A existência dessa tela, isoladamente, não prova falha de runtime, MCP, Desktop ou arquitetura.

```text
PAIRING_SCREEN_OBSERVED=true
PAIRING_NOT_COMPLETED != SERVICE_BROKEN
CONNECTION_UI_STATE != RUNTIME_CAUSE
```

Relato do CHEFE sobre como completar o pareamento entra como `HUMAN_INPUT`; causalidade técnica continua dependendo de medição do alvo.

Do mesmo modo:

```text
FIGMA_COMMUNICATION_INTERRUPTED
!=
FIGMA_PROJECT_DELETED
!=
CENTRALDARK_ARCHITECTURE_FAILED
```

Falha/transporte de uma superfície não pode derrubar o estado provado de outra.

## 4. API e MCP — correção de rota sem criar segundo MCP

O repositório atual contém referências materiais a `https://api.centralldark.com` como gateway/API pública e ao MCP CentralDark em `https://mcp.centralldark.com`.

Endpoint MCP normal documentado:

```text
https://mcp.centralldark.com/mcp
```

Correção importante do path administrativo:

```text
ADMIN_MCP_CANONICAL_PATH=/admin/mcp
/mcp/admin = NAO_EXISTE / 404 conforme owner de reconexão
```

Logo:

```text
ONE_MCP_SERVICE=true
NORMAL_AND_ADMIN_ARE_SCOPES_OR_ENTRYPOINTS
NORMAL_ADMIN != TWO_BRAINS
```

Qualquer estado vivo desses endpoints ainda exige health/auth/runtime remeasure; código/documentação não substitui execução.

## 5. Materiais e GARIMPO — inventário desta rodada

### 5.1 Observado agora na superfície de arquivos

```text
Telegram Desktop(4).zip
SIZE_BYTES=68620193
STATUS=CONVERSATION_FILE_OBSERVED
NOTE=nao e prova de equivalencia com Telegram Desktop(3).zip

CENTRALDARK-MASTER-PEGATUDO-20260831-ARQUITETURA.pdf
STATUS=LIBRARY_FILE_OBSERVED
ROLE=ARQUITETURA/CONTINUIDADE/PROVENIENCIA

tlc23(5).pdf
STATUS=LIBRARY_FILE_OBSERVED
ROLE=FONTE_DE_LOGICA_COMPUTACIONAL

mapa_futurista_da_arquitetura_centraldark.png
STATUS=CONVERSATION/LIBRARY_VISUAL_OBSERVED

centraldark_fluxos_do_ecossistema.png
STATUS=CONVERSATION_VISUAL_OBSERVED

Infografico futurista do Garimpo Cognitivo.png
STATUS=LIBRARY_VISUAL_OBSERVED
```

### 5.2 Citado na sessão, mas não montado/localizado com identidade exata nesta remedição

```text
Telegram Desktop(3).zip
GARIMPO-CHEFE_zip(1).zip
CENTRALDARK-MASTER-PEGATUDO-20260831(3).zip
docs_RASTRO_UNICO_20260823-135833(1).zip
CentralDark-Architecture-Bruta-METAFORJA-2026-08-30(1).zip
The_Secret_History_of_Hermes_Trismegistu(3).pdf
```

Classificação correta nesta rodada:

```text
SESSION_REFERENCE_PRESENT=true
CURRENT_BYTES_AVAILABLE=UNKNOWN
CURRENT_SHA256=UNKNOWN
DO_NOT_CLAIM_BYTE_PROOF=true
```

Para `GARIMPO-CHEFE` multipart, a sessão registra a expectativa histórica de volumes irmãos `.z01 + .z02 + .zip`; enquanto os bytes exatos não estiverem presentes juntos e hashados, `GARIMPO_COMPLETE != PASS`.

### 5.3 Regra de ingestão

Arquivos ZIP/PDF/HTML brutos não são automaticamente enviados ao Git por serem grandes, sensíveis ou redundantes. O que entra no PR é o delta semântico/proveniência sanitizada, salvo quando um artefato binário tiver consumidor/versionamento explicitamente comprovado.

```text
RAW_PACKAGE
→ IDENTIFY
→ HASH_WHEN_BYTES_AVAILABLE
→ SECRET_SCREEN
→ DEDUPE
→ OWNER_MATCH
→ DELTA_UTIL
→ COUNTERPROOF
→ PERSIST_NON_SENSITIVE_DELTA
```

Byte idêntico é processado uma vez e preserva múltiplas proveniências; nome parecido não prova duplicata.

## 6. Delta útil confirmado pelo pacote arquitetural

O material arquitetural disponível reforça o mesmo lineage:

```text
CLASSIFY_SOURCE_AND_SCOPE
→ VERIFY_RECENCY_REVISION_HEAD
→ VERIFY_OWNER_CONSUMER
→ DISTILL_UNIQUE_DELTA
→ QUARANTINE_CREDENTIAL_LIKE_CONTENT
→ RENDEZVOUS
→ DEDUPE_PROVENANCE
→ WRITE_MISSING_DELTA_ONLY
→ TEST + FALSIFIER + COUNTERPROOF
→ RECEIPT
```

Também separa Google/Drive/Gmail/Calendar/Contacts/Gemini como capacidades do mesmo HUB/control plane, sem entregar segredo bruto ao agent plane.

## 7. Horn / ponto fixo — analogia determinística, não novo motor

`tlc23(5).pdf` documenta cláusulas de Horn, propagação de consequências até não existir informação nova e raciocínio por satisfazibilidade/modelo mínimo.

Delta metodológico compatível com a CentralDark:

```text
PRECONDICOES_PROVADAS
→ DERIVAR_CONSEQUENCIA
→ REPETIR_ATE_NAO_HAVER_DELTA

CONTRADICAO_MATERIAL
→ NAO_PROMOVER

NO_NEW_INFORMATION
+ ALL_APPLICABLE_GATES_SATISFIED
→ FIXED_POINT_CANDIDATE
```

Isto permanece `HORN_INSPIRED`; CentralDark não vira Prolog e não substitui MetaLupa/Reality Judge.

## 8. Lei passado → presente → futuro

Nova cristalização desta sessão:

```text
ERRO_PASSADO_PROVADO
→ ASSINATURA_CAUSAL
→ OWNER_ATUAL
→ TESTE_DISCRIMINANTE
→ MENOR_CORRECAO
→ CONTRAPROVA
→ LEARNING_DELTA
→ FUTURE_GUARD
```

```text
PAST_ERROR_MUST_IMPROVE_FUTURE=true
HISTORICAL_BRANCH != CURRENT_AUTHORITY
ABANDONED_BRANCH_CAN_CONTAIN_GOLD_CANDIDATE=true
GOLD_REQUIRES_CURRENT_OWNER_RECONCILIATION=true
```

Branch/PR antigo não governa o presente, mas erro já pago não deve ser pago outra vez.

## 9. PR #1381 versus main — sem contradição semântica

```text
PR_1381 = BANCADA_ATUAL_DE_INTEGRACAO + LEDGER
main = BASELINE_VERSIONADA_DURAVEL
```

Quando o #1381 estiver elegível e for promovido por merge/squash/rebase conforme política canônica:

```text
PR_STATE → MERGED/CLOSED
HISTORY → PRESERVED
DELTA_PROMOTED → MAIN
OWNER/LAW/HUD → SURVIVE_IN_MAIN
```

Portanto o PR não precisa ficar aberto eternamente para a lei sobreviver. Copiar/cherry-pickar continuamente para `main` só para manter o PR aberto criaria duas linhas de integração e violaria a intenção `ONE_SYSTEM_ONLY`/`NO_DIRECT_MAIN_WRITE`.

## 10. SOL, Hermes, Jarvis e F.R.I.D.A.Y.

```text
SOL = IDENTIDADE_OPERACIONAL_CANONICA
HERMES = EXECUTOR/PRESERVACAO/CONTINUIDADE
JARVIS = METAFORA/ALIAS_LEGADO QUANDO APARECER
F.R.I.D.A.Y. = METAFORA_CULTURAL_DE_ASSISTENTE, NAO_NOVA_IDENTIDADE
MODEL/CLI/PROVIDER = MOTOR_SUBSTITUIVEL
```

A referência cultural pode orientar UX/linguagem de assistência, mas não cria novo cérebro, nova autoridade ou renomeia a SOUL sem decisão explícita e owner aplicável.

## 11. Estado após esta reconciliação — veredito antes do commit

```text
HUD_SOURCE=PROVEN
HUD_RUNTIME_RENDER=UNKNOWN
API_DOMAIN_CODE_REFERENCES=OBSERVED
MCP_NORMAL_PATH_CODE_DOCS=OBSERVED
MCP_ADMIN_PATH_CORRECTED_TO=/admin/mcp
CI_SAME_HEAD=UNKNOWN
PR_MAIN_RELATION=DIVERGED
GARIMPO_MULTIPART_COMPLETE=UNKNOWN/BLOCKED_BY_MISSING_CURRENT_BYTES
GLOBAL_FIXED_POINT=NOT_PROVEN
```

## 12. Próximo cursor

Após este commit:

```text
REMEASURE_NEW_PR_HEAD
→ UPDATE_PR_TOP_HUD
→ CI/status/workflow SAME HEAD
→ runtime Casa/VPS somente no território afetado
→ GARIMPO multipart quando volumes exatos forem fornecidos
→ branch genealogy read-only
→ reconcile main no owner existente
→ tests + counterproof
→ Reality Judge
→ fixed point
→ LAST_GOOD_STATE
→ promotion
```

O objetivo continua sendo guardar o verde, aprender com o vermelho e impedir que histórico, visual, conexão, ação ou documentação se fantasiem de prova atual.