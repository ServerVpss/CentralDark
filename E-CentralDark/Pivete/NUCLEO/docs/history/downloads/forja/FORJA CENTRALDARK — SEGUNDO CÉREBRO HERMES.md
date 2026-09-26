# 🔥 FORJA CENTRALDARK
## Segundo Cérebro Operacional do Hermes

**STATUS:** Arquitetura proposta para cristalização  
**ESCOPO:** Hermes / PIVETE  
**PRINCÍPIO:** `REUSE_BEFORE_CREATE`  
**REGRA:** `ONE_SYSTEM_ONLY`

---

## 🧠 1. OBJETIVO

Criar uma camada persistente onde Hermes consiga:

- registrar aprendizado útil;
- recuperar contexto;
- preservar decisões;
- consultar conhecimento anterior;
- refinar skills;
- retomar trabalho após reinício;
- alimentar o ciclo regenerativo;
- deixar conhecimento humano navegável pelo Obsidian.

Sem transformar memória histórica em verdade atual.

```text
MEMÓRIA != ESTADO VIVO
HISTÓRICO != REALIDADE ATUAL
```

---

# 💾 2. FUNDAÇÃO — DISCO LOCAL

Raiz operacional:

```text
E:\CentralDark\
```

Estrutura:

```text
E:\CentralDark\
│
├── Pivete\
│   ├── profiles\
│   ├── skills\
│   ├── runtime\
│   ├── checkpoints\
│   └── NUCLEO\
│
└── vault\
```

O disco é a camada persistente.

```text
RAM = execução temporária
DISCO = persistência
```

Se o processo cair:

```text
PROCESS_STOP
→ arquivos permanecem
→ runtime reinicia
→ estado persistido é recuperado
→ Hermes continua
```

---

# 🧠 3. NÚCLEO — MEMÓRIA OPERACIONAL

```text
E:\CentralDark\Pivete\NUCLEO\
```

Função:

Guardar somente conhecimento com valor operacional futuro.

Estrutura sugerida:

```text
NUCLEO\
│
├── decisions\
├── learnings\
├── patterns\
├── failures\
├── contracts\
├── skills\
├── missions\
└── checkpoints\
```

Cada registro deve responder:

```text
O_QUE_APRENDEMOS=
EVIDÊNCIA=
POR_QUE_IMPORTA=
ONDE_REUTILIZAR=
VALIDADE=
```

---

# 💎 4. CRISTALIZAÇÃO

Nem todo pensamento vira memória.

Pipeline:

```text
EVENTO
↓
EVIDÊNCIA
↓
DELTA_DE_CRENNÇA
↓
REUTILIDADE_FUTURA?
├── NÃO → DESCARTAR
└── SIM
     ↓
CRISTALIZAR
```

Critérios:

```text
INFORMATION_GAIN_REQUIRED=true
REUSABLE=true
EVIDENCE_REQUIRED=true
```

Proibido:

```text
NO_NOISE_MEMORY
NO_RANDOM_NOTES
NO_SAVE_EVERYTHING
NO_UNPROVEN_FACT_CRYSTALLIZATION
```

---

# 🔄 5. MOTOR REGENERATIVO

Hermes utiliza o segundo cérebro durante o ciclo:

```text
RECUPERAR
↓
MEDIR ESTADO ATUAL
↓
DELIBERAR
↓
GERAR
↓
EXECUTAR
↓
TESTAR
↓
CONTRAPROVAR
↓
REFINAR
↓
CRISTALIZAR APRENDIZADO
↓
FIXED_POINT
```

Mas:

```text
MEMÓRIA ANTIGA
        ↓
   referência
        ↓
ESTADO VIVO
        ↓
     juiz final
```

Estado comprovado atual sempre vence memória histórica.

---

# ⚒️ 6. A FORJA

A Forja é responsável por transformar experiência bruta em matéria reutilizável.

Entrada:

```text
erro
correção
contraprova
descoberta
padrão
decisão
skill refinada
```

Processamento:

```text
🔥 FORJA
│
├── separar ruído
├── encontrar causa material
├── extrair conhecimento
├── generalizar somente quando válido
├── testar reutilização
└── cristalizar
```

Saída:

```text
RULE
SKILL
CONTRACT
PATTERN
TEST
MEMORY
```

---

# 🗿 7. OBSIDIAN

Obsidian é a camada humana e navegável.

```text
E:\CentralDark\vault\
```

Função:

- visualizar conhecimento;
- navegar relações;
- consultar decisões;
- observar evolução;
- documentar arquitetura;
- manter conhecimento legível pelo CHEFE.

Obsidian NÃO é:

```text
SOURCE_OF_RUNTIME_TRUTH
```

Ele é:

```text
VISIBLE_SECOND_BRAIN
```

---

# 🔗 8. RELAÇÃO NÚCLEO ↔ OBSIDIAN

```text
                ┌────────────────┐
                │ 🧠 NÚCLEO      │
                │ operacional    │
                └───────┬────────┘
                        │
                conhecimento
                 cristalizado
                        │
                        ↓
                ┌────────────────┐
                │ 🗿 OBSIDIAN    │
                │ visão humana   │
                └────────────────┘
```

Uma mesma verdade lógica.

Duas representações.

Não criar dois cérebros concorrentes.

```text
ONE_KNOWLEDGE_SYSTEM
MULTIPLE_VIEWS
```

---

# ⚕️ 9. HERMES

Hermes trabalha diretamente sobre o sistema.

```text
           ⚕ HERMES
              │
      ┌───────┼────────┐
      ↓       ↓        ↓
   SKILLS   NÚCLEO   RUNTIME
      │       │        │
      └───────┼────────┘
              ↓
          EXECUÇÃO
```

Hermes pode:

```text
READ
SEARCH
DELIBERATE
GENERATE
TEST
REFINE
CRYSTALLIZE
```

Mas cristalização exige prova.

---

# ☀️ 10. SOL

SOL não substitui Hermes.

SOL coordena e reconcilia.

```text
CHEFE
  ↓
 SOL
  ↓
HERMES
  ↓
REALIDADE
```

Autoridades:

```text
CHEFE = intenção
SOL = coordenação
HERMES = execução
REALIDADE = juiz
```

---

# 🔄 11. GITHUB

GitHub preserva histórico versionado do que pertence ao projeto.

```text
DISCO LOCAL
   ↕
GIT
   ↕
GITHUB
```

GitHub NÃO substitui:

- runtime;
- memória operacional;
- estado vivo.

Serve como:

```text
HISTORY
VERSIONING
DIFF
AUDIT
RECOVERY
```

---

# 🧭 12. ARQUITETURA COMPLETA

```text
                     👑 CHEFE
                        │
                     intenção
                        ↓
                      ☀ SOL
                        │
                    coordenação
                        ↓
                    ⚕ HERMES
                 ┌──────┼──────┐
                 │      │      │
                 ↓      ↓      ↓
              SKILLS  RUNTIME  NÚCLEO 🧠
                 │      │      │
                 └──────┼──────┘
                        │
                     EXECUÇÃO
                        │
                        ↓
                    REALIDADE
                        │
                   evidência
                        ↓
                     🔥 FORJA
                        │
                 ┌──────┴──────┐
                 ↓             ↓
             🧠 NÚCLEO      🗿 OBSIDIAN
                 │             │
                 └──────┬──────┘
                        ↓
                    🔄 GIT/GITHUB
```

---

# 🫁 13. CICLO OPERACIONAL

```text
🫁 RECUPERAR CONTEXTO
↓
☀️ ALINHAR INTENÇÃO
↓
🐗 INVESTIGAR
↓
🦋 CORRIGIR
↓
🌙 CONTRAPROVAR
↓
🪨 VALIDAR INVARIANTES
↓
🔥 FORJAR APRENDIZADO
↓
💎 CRISTALIZAR
↓
🧠 PERSISTIR
↓
🫁 REMEDIR
↓
🎯 FIXED_POINT
```

---

# 🧬 14. AUTOAPRIMORAMENTO

A Forja não cria versões soltas.

```text
skill_v1
skill_v2
skill_final
skill_final_final
```

❌ PROIBIDO.

Usar:

```text
SKILL_CANÔNICA
     ↓
DELTA
     ↓
TESTE
     ↓
CONTRAPROVA
     ↓
ACEITA?
├── NÃO → baseline permanece
└── SIM → skill canônica evolui
```

---

# ⚖️ 15. GATE DE CRISTALIZAÇÃO

```text
IF information_gain
AND evidence_exists
AND applicable_tests_pass
AND invariants_hold
AND no_detected_regression:

    CRYSTALLIZE()

ELSE:

    PRESERVE_BASELINE()
```

---

# 🔥 16. LEI DA FORJA

> Matéria bruta entra.  
> Evidência aquece.  
> Contraprova martela.  
> Teste tempera.  
> Só o que sobrevive vira aço.

Formalmente:

```text
EXPERIENCE
→ EVIDENCE
→ REFINEMENT
→ COUNTERPROOF
→ VALIDATION
→ CRYSTALLIZATION
→ REUSE
```

---

# 🚫 17. PROIBIÇÕES

```text
NO_COSPLAY
NO_EMPTY_VERSE
NO_RANDOM_MEMORY
NO_RANDOM_BREATH
NO_ACTION_WITHOUT_EVIDENCE
NO_PASS_WITHOUT_PROOF

NO_DUPLICATE_BRAIN
NO_MEMORY_AS_LIVE_STATE
NO_CRYSTALLIZATION_WITHOUT_EVIDENCE
NO_REWRITE_WHEN_REUSE_EXISTS
NO_V1_V2_V3_WITHOUT_GAP
NO_BASELINE_REGRESSION
```

---

# 🎯 18. FIXED POINT DA FORJA

```text
IF objective_closed
AND counterproof_survived
AND applicable_invariants_hold
AND no_material_unknown
AND no_candidate_beats_baseline:

    FIXED_POINT=TRUE

ELSE:

    FIXED_POINT=FALSE
    CONTINUE()
```

---

# 💎 CRISTALIZAÇÃO FINAL

```text
DISCO = persistência física

NUCLEO = memória operacional

OBSIDIAN = segundo cérebro visível

FORJA = transformação de experiência em conhecimento

SKILLS = comportamento reutilizável

HERMES = executor

SOL = coordenadora

GIT/GITHUB = histórico e auditoria

CHEFE = intenção e autoridade humana

REALIDADE = juiz
```

## PRINCÍPIO CENTRAL

**Hermes não precisa lembrar de tudo.**

**Precisa conseguir recuperar o que importa, provar o estado atual e começar cada execução mais alto do que a anterior.**