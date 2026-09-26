---
name: session-intelligence-harvester
description: Minera sessões e Notepad para handoff.
---

# Session Intelligence Harvester

Extrai inteligência acionável de sessões, logs, transcripts, screenshots, receipts e evidências de navegação — incluindo **Notepad Windows LocalState** (TabState, WindowState, LocalState.zip), chat exports, terminal output, agent transcripts e screenshots.

## When to Use

- **Use when** o CHEFE pede para preparar inteligência, handoff, lapidação ou transferência de contexto para outro modelo/consumidor (ex: preparar HANDOFF.md para ChatGPT)
- **Use when** material de sessão/spasha/prints/transcripts/escrts/terminal output precisa ser mineração em lote sem pedir que o CHEFE abra cada item manualmente
- **Use when** Notepad Windows LocalState (TabState/WindowState/LocalState.zip) foi entregue ou está disponível como fonte
- **Use when** preciso reconciliar material histórico com estado atual do CentralDark antes de cristalizar qualquer fato
- **Do not use for** leitura de um único arquivo pequeno que não pede pipeline (use read_file direto)
- **Do not use for** extrair segredo ou promover estado antigo para verdade atual sem revalidação

## Core Concept

Sessões contêm decisões, erros, padrões, ferramentas usadas, gaps, contradições, deltas de continuidade e cadeias causais. Este skill os extrai de forma estruturada, separando fato/inferência/hipótese/UNKNOWN, e entrega para cristalização (knowledge-compiler) ou handoff (formato definido abaixo) — mas **nunca promove história para verdade viva** sem revalidação.

```text
HOUSE_WIDE=true
MODEL_NEUTRAL=true
SOL_AND_HERMES_SHARE_THE_SAME_LEARNING_CONTRACT=true
HISTORICAL != CURRENT
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
DOCUMENTED != EXECUTED
```

Formato de saída: **JSON estruturado com classificação epistemológica + referência de evidência observável**. Nunca inventar probabilidade/confiança numérica.

## Extraction Process

1. **Ingest** → sessão JSONL, chat export, transcript, screenshot, receipt, navegação evidência, Notepad LocalState
2. **Segment** → por tópico, fase, participante, alvo, tempo
3. **Classify** → decisão / erro / padrão / ferramenta / gap / contradição / continuidade delta / cadeia causal
4. **Extract** → registro estruturado com referência de evidência + contexto
5. **Countercheck** → separar fato / inferência / hipótese / UNKNOWN; buscar observação discriminadora quando material
6. **Deduplicate** → mergear achados idênticos entre sessões/superfícies por identidade/proveniência estável
7. **Crystallize** → feedar delta reutilizável ao `knowledge-compiler`
8. **Remeasure** → quando um claim descreve o presente, reaquisitar estado vivo antes de promoção

### Padrão obrigatório — receipt histórico não é estado vivo

Quando HTML, screenshot, painel, terminal, log ou checkpoint contiver estado operacional:

```text
OBSERVADO_EM_T0
→ LAST_PROVEN_AT=T0
→ HISTORICAL_REFERENCE
→ CURRENT_STATE=UNKNOWN_UNTIL_REMEASURED
```

Ao retomar: `#ACORDAR` → recuperar receipt/checkpoint → medir o mesmo alvo agora → comparar T0→T1 → SURVIVED|CHANGED|FAILED|UNKNOWN → atualizar CURRENT_STATE.

```text
OLD_GREEN != CURRENT_GREEN
PERSISTED_RECEIPT != LIVE_RUNTIME
DOCUMENTED != EXECUTED
SAME_VISUAL_SURFACE != SAME_BACKEND
```

Painel derivado deve apresentar idade da evidência; não reciclar último PASS como presente sem health-check.

## When Mining Notepad LocalState (Windows)

### Fonte observada

```text
%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\
├── WindowState\     → composição/ordem das janelas
└── TabState\        → estado das abas: texto + meta + referência de arquivo origem
```

`WindowState` descreve composição/ordem das janelas e abas. `TabState` guarda estado individual das abas e pode conter texto ainda não salvo ou referência ao arquivo de origem. Para exportação histórica, pode existir `LocalState.zip` com pasta `TabState - Copia/` (~50 sessões).

### Pipeline obrigatório

```text
LOCALSTATE
→ INVENTARIAR WindowState + TabState
→ RECONSTRUIR janelas/abas a partir dos .bin
→ EXTRAIR texto recuperável (decodificar UTF-16-LE, UTF-8, UTF-16-BE; fallback Latin-1)
→ identificar caminho de origem quando houver (referenciado no .bin)
→ DEREFERENCIAR arquivo original SOMENTE se necessário e permitido
→ DEDUPLICAR por conteúdo/identidade estável
→ CLASSIFICAR
→ QUARENTENAR sensível
→ CRUZAR com estado vivo do CentralDark
→ CRISTALIZAR somente inteligência útil
→ PRODUZIR HANDOFF ou imprimir bloco copiável
```

### Decodificação de .bin

Os arquivos TabState/WindowsState são binários proprietários do Notepad. Tentar decodificação em ordem:

1. UTF-16-LE (comum para Notepad em Windows)
2. UTF-8
3. UTF-16-BE
4. Latin-1 (último fallback para extrair bytes brutos como string)

Se nenhuma decodificação produz conteúdo imprimível ≥70%, tratar como **formato não lido** — não adivinhar. Arquivo pode ser estado de UI, hash, ou encoding não coberto. Registrar como `FORMAT_UNREADABLE` ou `BINARY_UI_STATE`.

### Classificação mínima

| Classe | Descrição |
|--------|-----------|
| `CURRENT_CANDIDATE` | informação que pode descrever o presente; ainda exige revalidação contra estado atual |
| `HISTORICAL_REFERENCE` | lembrança, plano, checkpoint, estado antigo minerável (útil como contexto) |
| `DUPLICATE` | conteúdo repetido; manter uma identidade principal, descartar repetição |
| `SENSITIVE_QUARANTINE` | `.env`, senha, token, cookie, chave, credencial, sessão, auth, API key, chave SSH, material equivalente. **Detectar para classificar, não reproduzir valor.** |
| `DISCARD` | ruído sem valor operacional ou cognitivo |

### Travas (nunca violar)

```text
NOTEPAD_STATE != CANONICAL_TRUTH
UNSAVED_TAB != SAFE_TO_PERSIST
HISTORICAL != CURRENT
DOCUMENTED != EXECUTED
SECRET_DETECTED -> SENSITIVE_QUARANTINE
RAW_LOCALSTATE -> DO_NOT_COMMIT
FORMAT_UNREADABLE -> UNKNOWN_AND_REGISTERED
```

- Nunca commitar `LocalState` bruto, `TabState`/`WindowState` binário ou ZIP cru como memória canônica.
- Nunca persistir `.env`, `auth.json`, access token, refresh token, API key, cookie, senha, chave SSH ou sessão em relatório/skill/commit/handoff.
- Conteúdo sensível pode ser detectado para classificação, mas deve ser omitido/redigido do resultado persistente.
- Um caminho de arquivo salvo é referência; quando a verdade atual depender dele, reabra/releia a fonte atual em vez de confiar na cópia histórica da aba.
- Abas não salvas podem conter ouro histórico, mas só entram na memória após extração, dedupe, classificação e remoção de segredo.
- Se a estrutura do formato do Notepad mudar, marcar `UNVERIFIABLE` e remapear; não adivinhar offsets/formato.

### Detecção de segredo (heurística de reading, não exibindo valor)

Ao decodificar .bin, varrer por keywords de contexto sem exibir os valores:
- `.env`, `password`, `senha`, `token`, `auth.json`, `API key`, `chave`, `credencial`, `refresh_token`, `access_token`, `Bearer `, cabeçalhos de Authorization, `PRIVATE KEY`, `ssh-rsa`, `-----BEGIN`
- Se detectar: classificar como `SENSITIVE_QUARANTINE`, registrar nome do arquivo + posição do trecho (ex: "linha 12, coluna 40-80: trecho de credencial detectado"), **não exibir valor**.
- Arquivo com múltiplas ocorrências ou conteúdo majoritariamente sensível: quarentena total do arquivo.

### Evidência mínima por lote (sem segredo)

Registar no handoff/inventory:

```text
SOURCE=WINDOWS_NOTEPAD_LOCALSTATE
WINDOWS_FOUND=<n>
TABS_FOUND=<n>
UNSAVED_TABS=<n>
FILE_BACKED_TABS=<n>
DEDUPED_ITEMS=<n>
SENSITIVE_QUARANTINED=<n>
HISTORICAL_ITEMS=<n>
CURRENT_CANDIDATES=<n>
FORMAT_VERIFIED=SIM|NAO|UNVERIFIABLE
HASH_WINDOWSTATE_SHA256=<sha256 dos arquivos .bin>
```

O objetivo é preservar o **mental e a inteligência** contidos nas abas, não preservar bytes temporários do aplicativo.

### Path de arquivo no .bin

Alguns .bin do TabState referenciam caminho de arquivo externo (ex: `C:\Users\danda\OneDrive\Área de Trabalho\comando serealizado mutaçao cdedo poribido.txt`). Registrar o path, mas:
- Não ler arquivos fora do repo sem ordem explícita
- Se ler: tratar como informação externa, reconciliar com o que existe no repo, não persistir como canônico se for material sensível ou não reconciliavel

## HANDOFF para ChatGPT (ou outro modelo/consumidor externo)

Quando o CHEFE pede para preparar inteligência para entregar ao ChatGPT:

**Proibido:**
- criar API, endpoint, webhook, serviço residente, daemon, bot/notificador
- criar bridge VPS↔ChatGPT nova
- duplicar owner existente (session-intelligence-harvester, knowledge-compiler, meta-lupa)

**O que fazer:**
1. Minerar fonte local (Notepad, logs, receipts, transcript) usando owner canônico
2. ReconReconciliar contra estado atual do CentralDark
3. Quarentenar sensível
4. Produzir `CENTRALDARK_HANDOFF.md` ou bloco copiável no terminal
5. O CHEFE decide quando entregar ao ChatGPT — o Hermes NÃO envia nada automaticamente

**Formato do HANDOFF:**

```text
=== HANDOFF CHATGPT ===

MEASURED_AT=
CENTRALDARK_BRANCH=
CENTRALDARK_HEAD=
ACTIVE_PR=
WRITER_SCOPE=

NOTEPAD:
  WINDOWS_FOUND=
  TABS_FOUND=
  UNSAVED_TABS=
  FILE_BACKED_TABS=
  DEDUPED_ITEMS=
  SENSITIVE_QUARANTINED=
  HISTORICAL_ITEMS=
  CURRENT_CANDIDATES=
  FORMAT_VERIFIED=

CURRENT_FACTS:
  - somente fatos reconciliados contra estado atual

SUPERSEDED_HISTORY:
  - fatos antigos úteis, marcados como superados

OPEN_GAPS:
  - somente UNKNOWN material

CONTRADICTIONS:
  - histórico versus realidade atual

IPNAMES_DELTA:
  - somente se houver correlação observável útil
  - nunca transformar associação em autenticação

NEXT_SAFE_ACTION:
  - menor delta material seguinte

=== END HANDOFF ===
```

### Contra-prova (MetaLupa) antes de finalizar

Para cada conclusão, tentar derrubar:
- Isto veio só de aba histórica?
- Isto foi medido agora?
- Existe fonte duplicada?
- Existe estado mais recente contradizendo?
- Existe Writer ativo?
- Um nome/IP está sendo confundido com identidade?
- Uma ausência está sendo confundida com malícia?
- Algum segredo escapou?
- Estamos criando algo que o owner existente já faz?

Se a resposta invalidar o claim: rebaixar para UNKNOWN/HISTORICAL/SUPERSEDED.

## MetaLupa integration

- Patterns → meta-lupa para falsificação quando material
- Gaps → knowledge-compiler como novos pedidos de capacidade
- Present-state claims → live remeasurement antes de promoção
- Navigation-tracking findings → usar causal-chain reference deste skill; mitigação destrutiva bloqueada sem autorização aplicável

## Read first before creating

```text
1. Ler .agents/skills/session-intelligence-harvester/SKILL.md (este arquivo)
2. Ler .agents/skills/knowledge-compiler/SKILL.md (se existir) para cristalização
3. Ler .agents/skills/meta-lupa/SKILL.md para falsificação crítica
4. Ler LEIA-ME-IA.md do CentralDark para boot + estado atual
```

Regras de criar:

```text
REUSE_BEFORE_CREATE=true
SE_OWNER_EXISTE_NAO_CRIE_NOVO=true
SE_O_OWNER_NAO_EXISTE_CONFIRME_ANTES_DE_CRIAR=true
ONE_SYSTEM_ONLY=true
```

Se o owner que o CHEFE nomeia não existe no disco (ex: `session-intelligence-harvester` foi referenciado mas não criado), **não criar skill nova sem confirmar com o CHEFE**. Pode ser que o owner mora em outro lugar, ou que o nome é de algo que ainda vai ser criado. Confirme antes de agir.

## Evidence format (output padrão)

```json
{
  "session_id": "...",
  "findings": [
    {
      "type": "decision|error|pattern|tool|gap|contradiction|continuity_delta|causal_chain",
      "summary": "one-line",
      "class": "FACT|INFERENCE|HYPOTHESIS|UNKNOWN",
      "evidence_ref": "observable reference or UNKNOWN",
      "target": "scope/host/file/runtime",
      "observed_at": "timestamp or UNKNOWN",
      "current_state": "CURRENT|HISTORICAL_REFERENCE|UNKNOWN_UNTIL_REMEASURED",
      "counterexample": "what would falsify the finding",
      "tags": ["architecture", "security", "performance"]
    }
  ]
}
```

## Pitfalls

- **Não criar V2 do que já existe**: se session-intelligence-harvester já é o owner do Notepad LocalState (como este skill), não criar `notepad-miner-v2` ou `tabstate-extractor`. Extender o existente.
- **Não confundir sensível detectado com sensível exibido**: detectar para classificar, nunca reproduzir valor.
- **Não promover histórico para verdade atual**: `HISTORICAL_REFERENCE` não vira `FACT` sem revalidação.
- **Não decodificar adivinhando formato**: se nada funciona, registrar `FORMAT_UNREADABLE` + `UNKNOWN`, não inventar conteúdo.
- **Não confundir caminho de arquivo salvo com arquivo atual**: se o .bin diz que a aba vier de `C:\...`, e a verdade atual depende do arquivo, reabrir e releia — não confiar na cópia histórica.
- **Não persistir ZIP/LocalState bruto como memória canônica**: é estado de UI temporário, não inteligência.
- **Não criar serviço para entregar ao ChatGPT**: o handoff é estático (arquivo.md ou bloco copiável), não streaming, não API, não webhook.
- **Se o owner que o comando nomeia não existe no disco**, não criar skill nova sem confirmar — pode ser owner que ainda não foi criado, ou que mora em outro lugar.

## Fixed point do handoff

Iterar: RECUPERAR → RECONSTRUIR → DEDUPLICAR → CLASSIFICAR → RECONCILIAR → CONTRAPROVAR → REMEDIR

Até: A) HANDOFF fechado e reproduzível; B) nenhuma informação nova material; ou C) bloqueio real explícito.

`NO_NEW_INFORMATION → NO_CHANGE`.
