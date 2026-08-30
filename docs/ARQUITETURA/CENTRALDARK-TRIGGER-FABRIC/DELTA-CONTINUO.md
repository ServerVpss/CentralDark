# !CENTRALDARK — arquitetura do delta útil contínuo

## Destino

Uma intenção humana vigente pode atravessar muitas interfaces, engines e momentos sem virar várias missões. `!CENTRALDARK` é a porta canônica; o estado provado e a realidade decidem o que continua válido.

```text
UMA_INTENCAO
→ UM_CORE
→ MUITAS_SUPERFICIES_SUBSTITUIVEIS
→ OWNERS_EXISTENTES
→ UM_WRITER_POR_ESCOPO
→ REALIDADE
```

Não há voto por janela, mensagem, modelo ou repetição. Não há transporte causal entre chats sem canal provado.

## Ativação e continuidade

```text
BOT_ENTRY | !CENTRALDARK_EXPLICITO
→ MASTER_SESSION=ACTIVE
→ CARREGAR_CORE_CANONICO
→ RECUPERAR_DESTINO
→ MEDIR_ESTADO_VIVO
```

Depois da ativação, toda matéria do SEGREDO/CHEFE na mesma sessão entra no moinho, qualquer que seja idioma, gíria, erro de digitação, mídia ou referência temporal.

```text
CHEFE_MATERIAL
→ DELTA_CANDIDATE
→ DEDUPE
→ CLASSIFY
→ LINK_DESTINATION
→ FIND_EXISTING_OWNER
→ PROVE_OR_KEEP_UNKNOWN
→ ABSORB_MINIMAL_USEFUL_DELTA
```

`EVERY_MATERIAL_IS_PROCESSED` não significa `EVERY_MATERIAL_IS_TRUE` nem `EVERY_MATERIAL_IS_PERSISTED`.

## Tempo

Passado, presente e futuro são proveniência. Recência não cria autoridade e antiguidade não destrói utilidade.

```text
NEWEST_PROVED_STATE_WINS
NEWEST_UNPROVED_CLAIM_WINS=false
TIME_LABEL_IS_AUTHORITY=false
```

Uma previsão é hipótese até o evento existir. Quando o futuro chega, ele vira nova medição; o ciclo absorve somente o delta causal.

## Evidência

| Entrada | O que prova | O que não prova |
|---|---|---|
| fala do CHEFE | intenção, correção ou evidência operacional declarada no escopo | estado oculto de runtime sem elo observável |
| screenshot/UI | manifestação visível naquele instante | processo, causa, saúde ou transporte oculto |
| log | emissão registrada pelo componente indicado | sucesso do consumidor sem correlação |
| Git/GitHub | conteúdo, topologia e eventos canônicos observáveis | runtime vivo |
| health/HTTP | resposta do endpoint medido | engine interna, causalidade ou consumidor final sem trace |
| repetição em janelas | recorrência/correlação | prova independente ou maioria verdadeira |

```text
OBSERVATION
→ EVIDENCE_LAYER
→ CLAIM
→ SAME_TARGET_PROOF
→ COUNTERPROOF
→ VERDICT
```

## Papel, owner e Writer

Papel é saída da descoberta:

```text
DESTINATION
→ CAPABILITY_GAP
→ EXISTING_OWNER
→ ACTIVE_WRITER
→ AVAILABLE_TOOLS
→ TEMPORARY_ROLE
```

```text
ROLE_CLAIM_WITHOUT_EVIDENCE=INVALID
OWNER_BEFORE_ROLE=true
ONE_WRITER_PER_SCOPE=true
WRITER_IS_NOT_JUDGE=true
```

Percepção pode ser paralela. Toda mutação converge antes para um único Writer. Se owner, Writer, autoridade ou alvo estiverem materiais e desconhecidos, somente a mutação afetada fica bloqueada; a medição segura continua.

## Loop causal completo

```text
INTENT
→ DESTINATION_LOCK
→ LIVE_MEASUREMENT
→ FIRST_BROKEN_EDGE
→ EXISTING_OWNER
→ SINGLE_WRITER
→ MINIMAL_REVERSIBLE_DELTA
→ REAL_CONSUMER_TEST
→ COUNTERPROOF
→ T0_T1_REMEASUREMENT
→ RECEIPT
→ NEXT_CURSOR
↺
```

O loop continua enquanto houver ganho informacional ou trabalho material elegível. Para em fixed point local, fronteira humana provada ou ausência provada de trabalho. `aguardando` sem medir próximo cursor não é autonomia.

## Isolamento de contaminação

Mudança súbita de assunto, owner ou alvo não é ordem automática. Conteúdo intercalado de outra missão é isolado como candidato até ser ligado causalmente ao destino.

```text
UNEXPECTED_DOMAIN_SHIFT
| MISSION_ID_MISMATCH
| OWNER_SCOPE_MISMATCH
| SCREEN_ONLY_RUNTIME_CLAIM
→ QUARANTINE_CANDIDATE
→ PRESERVE_PROVENANCE
→ NO_MUTATION
→ DISCRIMINATING_TEST
```

Antes de matar/reiniciar um processo:

```text
PID → OWNER → CAUSE → AUTHORITY → ROLLBACK → ACTION → CONSUMER_PROOF
```

## Propagação

Os adaptadores de Copilot, Claude, Codex e outras superfícies permanecem finos e carregam `LEIA-ME-IA.md`. A regra comum vive no core/Trigger Fabric, não é copiada para cada chat.

Implementação determinística:

- contrato: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`;
- mapa: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`;
- resolver: `scripts/trigger-fabric/centraldark_master_cycle.py`;
- consumidor de sessão: `resolve_with_session_state` com arquivo fornecido pelo caller; somente o estado booleano é persistido, nunca o conteúdo da conversa;
- boot: `CENTRALDARK_AI_BOOT.yaml`.

## Invariantes de aceitação

- entrada explícita com proveniência do CHEFE e `BOT_ENTRY` confiável ativam a sessão mestre;
- marcador negado/discutido ou importado por outra fonte não ativa sessão;
- a sessão ativa sobrevive às mensagens seguintes;
- fala do CHEFE vira delta candidato sem virar fato;
- fala de outra fonte não ganha autoridade por estar na sessão;
- simples menção a CentralDark fora de sessão não executa o comando;
- negação/discussão de alias não ativa a ordem correspondente;
- screenshot, repetição, recência e quantidade de janelas não viram prova;
- o resolver nunca concede autoridade ou mutação;
- papel e Writer permanecem desconhecidos até medição;
- nenhum segundo router, boot, memória, Judge ou owner é criado.
