---
name: especialista-de-modelos
description: Router por CAPACIDADE. Score 5 dim. Refina mesmo.
version: 0.2.0
author: Hermes Pivete (profile pivete)
license: MIT
metadata:
  hermes:
    tags: [especialista-modelos, router-capacidade, llm, evolutivo, meta-lupa]
    related_skills: [meta-lupa, external-source-alignment, organize-memory, hermes-casa-pivete]
---

# Especialista de Modelos — espelho reprodutivo evolutivo

## Propósito

Ser o **repositório único e crescente** de tudo que se descobre/valida sobre
um modelo de linguagem (LLM). Funciona como **espelho reprodutivo** — quando o
Pivete precisa operar sobre o "padrão GPT-X.Y" (ou Claude, Gemini, Grok, etc.),
esta skill é a fonte. Cada modelo vira uma **página** refinada e versionada.

**Princípio-âncora:** "Modelo = pensa | Skill = lembra | Logs = provam | Git = consolida"
(extensão do Pivete 07/08). Esta skill é o "lembra" de modelos.

---

## Filosofia central (Pivete 07/08 — virada)

> **"O roteador não deveria conhecer provedores. Deveria conhecer apenas
> capacidades."**

> **"Não orquestrar modelos, mas capacidades."**

> **"O token vai embora. O conhecimento fica."**

**Implicação operacional:**

- A skill **não é espelho de modelo**. É **roteador por score de capacidade**.
- Cada modelo vira página com **score de 5 capacidades** (reasoning, coding,
  context, latency, cost) + **status real** (provado por teste, não declarado).
- Cada melhoria entra **na mesma tabela**, refina, não substitui.
- **Casa primeiro.** VPS-rotação fica pra próxima missão (R4).
- **Custo é investimento**, não despesa. Gasto burro (repetir, benchmark
  infinito, escrever por escrever) é proibido. Gasto inteligente (padrão
  novo, skill viva, score real, regressão descoberta) é encorajado.

**Arquivo-âncora:** `router/capability-router.md` — tabela viva única.

---

## Regra de honestidade operacional (Pivete 07/08)

> **"Eu não crio crédito do nada. Só aviso o que está sem e o que precisa."**

**Aplicar sempre:**

- Se um provider autentica mas tem **insufficient balance**: **dizer isso**, não
  fingir que vai funcionar.
- Se um subagente cai em 429 (rate limit): **parar**, não re-dispatchar em loop.
- Se uma chave está no `.env` mas o painel mostra saldo: **declarar a
  diferença**, não inferir.
- Não usar "online" por fé. Provar com `chatcompletion` real OU declarar
  `⚪ não testado`.

---

## Estrutura do repositório

```
skills/pivete/especialista-de-modelos/
├── SKILL.md                      # este arquivo (índice + método)
├── INDEX-MODELOS.md              # tabela por score (capacidade)
├── router/
│   └── capability-router.md      # tabela viva única + perfis de tarefa
├── templates/
│   ├── perfil-modelo.md          # template canônico de página por modelo
│   └── delta-classificacao.md    # template p/ auditor de deltas
├── referencias/
│   ├── classificador-5-classes.md
│   └── gates-promocao.md
├── modelos/
│   ├── gpt-5.5.md
│   ├── MiniMax-M3.md
│   ├── gpt-4o-mini.md
│   └── gemini-2.5-flash.md
└── changelog/
    └── 2026-08-07-*.md
```

**Regra de ouro:** NUNCA criar skill paralela. Se já existe um doc de modelo
(canônico), criar a página **a partir** dele, não no lugar.

---

## Gatilhos (quando esta skill roda)

1. Pivete manda: "especialista de [modelo]", "opera sobre padrão [X]",
   "extrai ouro de [modelo]", "atualiza [modelo]", "refina [modelo]".
2. Chega fonte nova sobre modelo (link, doc, paper, post de X/Twitter).
3. Pós-execução de agente — o que se descobriu novo vira delta.
4. Dream noturno (cron 03:00) — rotina de consolidação vê entrada não-triada.

---

## Ciclo de vida (5 fases)

### FASE 1 — Receber insumo
- **R0 leitura.** Aceita: URL, doc, paper, X/Twitter, conversa, prompt do Pivete.
- **NÃO aceita** como verdade: páginas de marketing especulativas, datas
  relativas ("recently"), preços voláteis, sem SHA verificável.

### FASE 2 — Classificar (5 classes, obrigatório)

Da skill `external-source-alignment`, com adaptação:

| Class | Label | Critério | Ação |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | Durable, plataforma-independente | Promover → página do modelo |
| **B** | `EQUIVALENTE_JÁ_EXISTE` | Já está em outra página desta skill | Ignorar (anti-duplicação) |
| **C** | `LACUNA_REAL` | Faltava na skill, com evidência | Promover → fechar lacuna |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | API/token/cookie/produto específico | REJEITAR |
| **E** | `NÃO_VERIFICADO/TEMPORAL` | Modelos, preços, datas, claims de benchmark | REJEITAR (só citar com SHA) |

**Regra de ouro:** A e C só viram ouro. D e E ficam no changelog como
"insumo rejeitado — motivo".

### FASE 3 — Comparar contra o existente (4 blocos)

Antes de promover, comparar em 4 blocos:

1. **Identidade** — nome, provider, capability tier, contexto, janelas.
2. **Comportamento** — raciocínio, tool use, visão, memória, codificação.
3. **Limites** — alucinação, custo, latência, fallbacks.
4. **Integração** — como Casa usa, como o agente roteia, como o skill lê.

### FASE 4 — Promover para a página do modelo

Usar `templates/perfil-modelo.md`. Cada página tem frontmatter com
**score_capacidade** (5 dimensões de 0–10) + **status** (online / trial_exhausted
/ quota_exceeded / não testado).

### FASE 5 — Registrar + versionar

- Atualizar `INDEX-MODELOS.md` (tabela por score).
- Entrar em `changelog/YYYY-MM-DD-<slug>.md` (delta, classe, motivo, fonte).
- Se promoveu regra nova de comportamento do modelo, **estende** REGRAS.md
  existente (nunca cria REGRAS-modelos.md paralelo).
- Se fechou lacuna, atualizar HOJE.md (entrada da data).

---

## Evidence gate (promotion rule)

Antes de promover **qualquer** item a página do modelo, as 3 condições hold:

1. **Check que passou** — fonte verificada (SHA, URL viva, paper revisado).
2. **Failure pattern nomeado** — "declarar X causou erro Y em Z contexto".
3. **Dead-end eliminado** — alternativa tentada e descartada, com motivo.

Faltando 1 → fica em `changelog/pending/` como triagem, **NÃO** vira página.

---

## Anti-contaminação (5 travas)

1. **Gate 5-classes** — Class D/E = REJEITADO, sempre.
2. **Gate mapa único** — antes de criar página: localizar equivalente.
3. **Sem paralelo** — se já tem `modelos/MiniMax-M3.md`, **NÃO** criar
   `modelos/MiniMax-M3-v2.md`. Versão vai no frontmatter do mesmo arquivo.
4. **Sem invenção** — se não tem SHA, fica como "pendente de verificação".
5. **Sem popularidade** — "está em alta", "todo mundo usa", "novo lançamento
   incrível" **não** vira ouro.

---

## Como o Pivete usa

```text
# Comando Pivete:
"opera sobre padrão GPT-5.5"
"especialista de GPT-5.5"
"extrai ouro de GPT-5.5"
"router decide qual modelo"

# Fluxo:
1. Skill carrega router/capability-router.md
2. Puxa score + status de cada modelo
3. Classifica insumo (5-classes)
4. Promove Class A (e só A)
5. Atualiza INDEX + changelog + REGRAS (se promoveu regra)
6. Devolve resumo curto: "pronto, X novos itens prateados, Y reij."
```

---

## Status atual (07/08/2026)

- ✅ Router por CAPACIDADE ativo (`router/capability-router.md`).
- ✅ Páginas: gpt-5.5, MiniMax-M3, gpt-4o-mini, gemini-2.5-flash.
- ✅ Changelog: criação + virada-router.
- 🟡 M3 / M2.7: trial_exhausted (autentica, sem saldo).
- 🟢 gpt-4o-mini + gemini-2.5-flash: online (free, OpenRouter, provado).
- Próximo: testar M3 / M2.7 quando Pivete recarregar; refinar score com
  prova real; adicionar mais modelos conforme entrarem grátis.

---

## Ligação

- **Estende:** `meta-lupa` (gate de prova), `external-source-alignment`
  (5-classes), `organize-memory` (3 temperaturas aplicadas a modelos),
  `hermes-casa-pivete` (Casa primeiro).
- **Conecta:** REGRAS.md (regras de comportamento de modelo),
  CARTAO-MESTRE.md (item ✅ adicionado), HOJE.md (entrada da data).
- **Não conflita:** nenhuma skill existente — complementa.

---

## Pitfalls conhecidos (07/08/2026 — provados)

**P1 — Autentica ≠ tem saldo (MiniMax e similares)**

```bash
# Aceita a chave, lista modelos, mas chat retorna:
curl ... /v1/text/chatcompletion_v2 ... → 200, choices=null,
   base_resp.status_code=1008, status_msg="insufficient balance"
```

Status: `🟡 trial_exhausted`. Não é 401 (chave inválida) nem 404 (endpoint errado).

**P2 — `Voice_messages_forbidden` no Telegram**

`hermes send "MEDIA:foo.mp3"` retorna `sent` mas o Telegram **rejeita o áudio silenciosamente** quando o chat tem voice messages bloqueados. SEMPRE enviar como **documento** (anexo), nunca como bolha de voz. Checar `logs/gateway-stdio.log` por `Voice_messages_forbidden` antes de declarar entregue.

**P3 — Subagente em 429 não é "fazer retry"**

Quando `delegate_task` cai em 429 (rate limit do plano), **não re-dispatchar em loop**. Fazer a busca localmente (curl + parser) ou marcar como "adiado até renovar quota".

**P4 — Múltiplas chaves da mesma conta**

M3 tinha 4 chaves (Pivete + Falano DONe + 2 novas). Todas caíram juntas porque são da mesma org/family. Adicionar mais chaves **não** resolve esgotamento. Solução real: **comprar crédito / upgrade plan**.

**P5 — DarkAI (Supabase proxy) retorna `{"error":"sem_creditos"}` (402) — free tier zerado**

O proxy `DarkAI` (base `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1`, key `DARKAI_ANON_KEY`) lista 19 modelos via `GET /models` (200) mas **todo** chat completion retorna 402 `sem_creditos`. Não existe endpoint de saldo (`/balance`, `/user/me` → `not_found`).

Probe cirúrgico (ver `references/darkai-probe-08-08-2026.md`):

```bash
B="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1"
K="$DARKAI_ANON_KEY"
curl -s "$B/models" -H "Authorization: Bearer $K"        # lista (200, sem pricing)
curl -s -X POST "$B/chat/completions" -H "Authorization: Bearer $K" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.5-flash-lite","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'
# → {"error":"sem_creditos"} (402) quando sem crédito
```

Status: `🔴 sem_credito` (diferente de `🟡 trial_exhausted` do MiniMax). Conclusão: free tier do DarkAI **não tem crédito** — só o `tencent/hy3:free` do Nous está operando (rate-limited, sem saldo $). Gateway local Hermes (127.0.0.1:9119) pode estar OFF (curl rc=7) — nesse caso bater direto no proxy, não no `/v1/models` do gateway.
