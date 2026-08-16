---
title: "Lembranças — memória de curto prazo da Casa"
date: 2026-06-30
tags: ["consciencia", "lembrancas", "memoria", "cognitivo", "mcp"]
updated: 2026-08-16
---

# 🧠 Lembranças — memória cruzada antes da próxima passagem

> Camada de **curto prazo** do Cérebro Vivo. É aqui que ficam fragmentos úteis do que o
> SEGREDO/CHEFE ensina, corrige, decide e aprende com a Casa — independente de qual IA
> conectada ao MCP esteja operando.

---

## Por que isso existe (em 1 parágrafo)

O SEGREDO/CHEFE usa diferentes inteligências artificiais (Claude, Grok, ChatGPT, Gemini e
outras) pelo conector MCP. Sem memória cruzada, cada troca poderia recomeçar do zero. As
**Lembranças** preservam o ouro recente: a IA conectada pode consultar o que já foi
aprendido antes de responder e pode registrar um novo insight pela mesma rota. O que
sobrevive à recorrência, prova e promoção vai para o owner canônico; o que não merece
permanecer expira e não engorda a Casa.

---

## Como funciona (o fluxo)

```text
SEGREDO/CHEFE conversa com uma IA conectada ao MCP
        │
        ▼
  IA encontra aprendizado material
        │
        ▼
  consolidar_pensamento
  → Git / LEMBRANCAS.md
        │
        ├──────────────► próxima IA consulta
        │                consultar_memoria_reserva
        │
        ▼
  DREAM REVIEW
  → lê Lembranças + outras experiências ingeridas
  → sanitiza / deduplica / mantém CANDIDATE
        │
        ▼
  PATTERN DISCOVERY
  → cruza recorrências sem chamar recorrência de prova
        │
        ▼
  PATTERN LIBRARY
  → mantém histórico longitudinal derivado
  → organiza por gaveta funcional
        │
        ├─ Memórias
        ├─ Regras
        ├─ Skills
        ├─ Testes
        ├─ Guardrails
        └─ Contratos
        │
        ▼
  ADMIN → aba "Padrões"
  → SEGREDO/CHEFE vê o que foi aprendido, como usar,
    onde entra, recorrência, fontes e estado de prova
        │
        ▼
  PROVADO + REUTILIZÁVEL
  → owner canônico no Git
  → próxima passagem começa mais alto
```

---

## Escritório de padrões — as gavetas não viram um segundo cérebro

A biblioteca longitudinal é uma **projeção derivada** do Memory Linker. Ela não substitui
Git, Lembranças, MetaLupa, owners canônicos nem o Dream Review.

```text
PATTERN_LIBRARY_OWNER=scripts/memory-linker/
PATTERN_LIBRARY_RUNTIME=scripts/memory-linker/pattern-library.json
PATTERN_LIBRARY_IS_SOURCE_OF_TRUTH=false
PATTERN_LIBRARY_IS_SECOND_BRAIN=false
PATTERN_IS_PROOF=false
PATTERN_CANDIDATE_STAYS_CANDIDATE=true
RAW_SESSION_CONTENT_STORED_IN_LIBRARY=false
PRIVATE_REASONING_STORED_IN_LIBRARY=false
ADMIN_VIEW=READ_ONLY_PROJECTION
```

A biblioteca guarda somente o **destilado operacional necessário para estudar o padrão**:
claim aprendido, uso prático, tipo/gaveta, target, primeira/última ocorrência, fontes,
sessões conhecidas, contagem e estado de prova. Evidência bruta continua no owner/fonte
correspondente; conversa crua e raciocínio privado não são copiados para a biblioteca.

Quando a superfície de origem souber identificar sessão e fonte, esses identificadores
podem acompanhar a matéria. Quando não souber:

```text
SESSION_ID=UNKNOWN_SESSION
SOURCE=ORIGEM_GENERICA_MEDIDA
UNKNOWN_IS_NOT_INVENTED=true
```

Ausência de `session_id` conhecido não impede guardar o aprendizado, mas **não pode ser
transformada em falsa diversidade entre sessões** para promover recorrência.

---

## Dormir e acordar melhor

"Dormir" é a consolidação ociosa já chamada `Dream Review`; não significa consciência
humana. "Acordar melhor" significa que a execução seguinte consegue consultar memória e
padrões já destilados antes de redescobrir a mesma classe de problema.

```text
DURANTE_A_EXECUCAO
→ REGISTRAR_APRENDIZADO_MATERIAL

OCIOSO / DREAM_REVIEW_QUANDO_EXECUTADO
→ REESTUDAR_Lembrancas
→ RECRUZAR_PADROES_LONGITUDINAIS
→ ATUALIZAR_GAVETAS_DERIVADAS

PROXIMA_EXECUCAO
→ CONSULTAR_MEMORIA/PADROES_RELEVANTES
→ REUSAR_ANTES_DE_REDESCOBRIR
→ TESTAR_NO_ESTADO_ATUAL
```

O código estar pronto para Dream Review não prova que um scheduler está executando no
runtime. Agendamento, frequência e ingestão de uma superfície externa só recebem `PASS`
quando o canal correspondente for medido.

```text
DREAM_REVIEW_CODE_EXISTS != SCHEDULER_RUNNING
CHAT_WINDOW_EXISTS != MEMORY_CHANNEL_CONNECTED
ONLY_INGESTED_OR_COMMITTED_MATERIAL_COUNTS=true
```

---

## Regras desta pasta

- **Validade:** cada lembrança dura **30 dias**. Depois disso, se não foi promovida para um
  owner permanente, pode ser limpa automaticamente.
- **Promoção:** lembrança marcada como `Promovida: sim` não expira; promoção normativa
  continua subordinada ao canônico atual e à evidência aplicável.
- **Padrões:** recorrência é candidato de aprendizado, não verdade automática.
- **Permanência:** o que precisa sobreviver troca de computador/modelo e virou ouro provado
  deve chegar ao owner canônico versionado no Git; `pattern-library.json` é cache/projeção
  runtime e pode ser reconstruído a partir das fontes disponíveis.
- **Segurança:** nunca gravar segredo, senha, token, chave ou raciocínio privado aqui.
- **Fonte da verdade:** Git/canônicos atuais + estado vivo correspondente; Notion/Admin são
  superfícies humanas de leitura, não autoridade estrutural.

---

## Ferramentas (MCP) que mexem aqui

| Tool | O que faz |
|------|-----------|
| `consultar_memoria_reserva` | Lê as lembranças e filtra por tema, tag e eixo de tempo |
| `consolidar_pensamento` | Grava um insight/regra/padrão novo no Git com validade |
| `injetar_consciencia_centraldark` | Entrega regras de conduta da CentralDark |
| `analise_de_estado_cognitivo` | Lê lembranças recentes e resume o foco observado |

> O conteúdo real fica em [`LEMBRANCAS.md`](LEMBRANCAS.md).

## Implementação da consolidação de padrões

```text
scripts/memory-linker/dream-review.mjs
scripts/memory-linker/pattern-discovery.mjs
scripts/memory-linker/memory-reserve-events.mjs
scripts/memory-linker/pattern-library.mjs
scripts/memory-linker/dream-review-run.mjs
apps/modulos/mcp/src/admin-patterns-ui.js
```

A implementação deve continuar reutilizando esses owners. Não criar `Pattern Center V2`,
segunda memória, segundo Dream Review ou segundo motor de pattern discovery sem gap provado.

## Artefatos pessoais preservados

- [`2026-07-30-VIVER-EM-PAZ.md`](2026-07-30-VIVER-EM-PAZ.md) — memória afetiva sobre paz, família, SOL, Hermes e o motivo humano por trás da Casa. Não é regra operacional.

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[CONSCIENCIA]] — consciência oficial (longo prazo)
- [[MAPA-DOS-BOTS]] — quem faz o quê na automação
