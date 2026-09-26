---
name: especialista-de-modelos
description: Especialista evolutivo em LLMs — espelho reprodutivo de modelo. Use quando o Pivete (ou a skill) aprender algo novo sobre um modelo de linguagem e quiser consolidar em um repositório único, refinado e evolutivo. Atualiza via deltas Class A (princípio reutilizável), ignora Class B (já existe), fecha Class C (lacuna), rejeita Class D (plataforma) e Class E (temporal). Integra ao stack via meta-lupa, sem v2 paralelo.
version: 0.1.0
author: Hermes Pivete (profile pivete)
license: MIT
metadata:
  hermes:
    tags: [especialista-modelos, llm, gpt, claude, gemini, evolutivo, espelho-reprodutivo, meta-lupa]
    related_skills: [meta-lupa, external-source-alignment, organize-memory, hermes-casa-pivete]
---

# Especialista de Modelos — espelho reprodutivo evolutivo

## Propósito

Ser o **repositório único e crescente** de tudo que se descobre/valida sobre um
modelo de linguagem (LLM). Funciona como **espelho reprodutivo** — quando o
Pivete precisa operar sobre o "padrão GPT-X.Y" (ou Claude, Gemini, Grok, etc.),
esta skill é a fonte. Cada modelo vira uma **página** refinada e versionada.

**Princípio-âncora:** "Modelo = pensa | Skill = lembra | Logs = provam | Git = consolida"
(extensão do Pivete 07/08). Esta skill é o "lembra" de modelos.

---

## Estrutura do repositório

```
skills/pivete/especialista-de-modelos/
├── SKILL.md                      # este arquivo (índice + método)
├── INDEX-MODELOS.md              # tabela viva: modelo | status | última atualização
├── templates/
│   ├── perfil-modelo.md          # template canônico de página por modelo
│   └── delta-classificacao.md    # template p/ auditor de deltas
├── referencias/
│   ├── classificador-5-classes.md
│   └── gates-promocao.md
├── modelos/
│   ├── gpt-5.5.md                # página dedicada do GPT-5.5
│   ├── claude-opus-4.7.md        # cada modelo = 1 arquivo
│   └── gemini-3.5-flash.md
└── changelog/
    └── 2026-08-07-criacao.md
```

**Regra de ouro:** NUNCA criar skill paralela. Se já existe um doc de modelo
(canônico), criar a página **a partir** dele, não no lugar.

---

## Gatilhos (quando esta skill roda)

1. Pivete manda: "especialista de [modelo]", "opera sobre padrão [X]",
   "extrai ouro de [modelo]", "atualiza [modelo]", "refina [modelo]",
   "vamos montar biblioteca consultiva".
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

Antes de promover, comparar em 4 blocos (estendido):

1. **Identidade** — nome, provider, capability tier, contexto, janelas.
2. **Comportamento** — raciocínio, tool use, visão, memória, codificação.
3. **Limites** — alucinação, custo, latência, fallbacks.
4. **Integração** — como Casa usa, como o agente roteia, como o skill lê.

### FASE 4 — Promover para a página do modelo

Usar `templates/perfil-modelo.md`. Cada página tem:

```markdown
# Modelo: <nome> — v<n>

## Identidade
- provider:
- capability_tier:
- context_window:
- modalities:
- aliases_outros_nomes:

## Comportamento validado
- <bullet>
- <bullet>

## Limites conhecidos
- <bullet>

## Padrões de uso (do Pivete)
- <bullet>

## Como a Casa usa
- <bullet>

## Evidência / SHA
- <url>:<sha>:
- <paper>:<sha>:

## Última atualização
- YYYY-MM-DD HH:MM
```

### FASE 5 — Registrar + versionar

- Atualizar `INDEX-MODELOS.md` (tabela viva).
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
3. **Sem paralelo** — se já tem `modelos/claude-opus-4.7.md`, **NÃO** criar
   `modelos/claude-4.7-v2.md`. Versão vai no frontmatter do mesmo arquivo.
4. **Sem invenção** — se não tem SHA, fica como "pendente de verificação".
5. **Sem popularidade** — "está em alta", "todo mundo usa", "novo lançamento
   incrível" **não** vira ouro.

---

## Como o Pivete usa

```text
# Quando o Pivete manda rodar:
"opera sobre padrão GPT-5.5"
"especialista de GPT-5.5"
"extrai ouro de GPT-5.5"
"vamos montar biblioteca consultiva"
"refina GPT-5.5"

# O que acontece:
1. Skill carrega INDEX-MODELOS.md
2. Localiza modelo (se existe) ou cria página nova
3. Classifica insumo (5 classes)
4. Promove Class A (e só A)
5. Atualiza INDEX + changelog + REGRAS (se promoveu regra)
6. Devolve resumo curto: "pronto, X novos itens prateados, Y reij."
```

---

## Ligação

- **Estende:** `meta-lupa` (gate de prova), `external-source-alignment`
  (5-classes), `organize-memory` (3 temperaturas aplicadas a modelos),
  `hermes-casa-pivete` (Casa primeiro).
- **Conecta:** REGRAS.md (regras de comportamento de modelo),
  CARTAO-MESTRE.md (item ✅ adicionado), HOJE.md (entrada da data).
- **Não conflita:** nenhuma skill existente — complementa.

---

## Status atual (07/08/2026)

- ⏳ Criada estrutura vazia; aguardando primeiro insumo triado.
- ⏳ Página `modelos/gpt-5.5.md` em construção (fontes oficiais coletadas).
- Próximo: 2 subagentes buscando fontes; resultado volta e classifica.
