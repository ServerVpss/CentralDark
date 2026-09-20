# 🧿🔄👀 KIT METAGRILL-METALUPA

**OWNER CANÔNICO:** `.agents/skills/meta-lupa/SKILL.md`

**MODO:** gancho semântico. Este kit não cria engine, owner, router, skill principal ou arquitetura paralela.

```text
👑🪬 !CENTRALDARK
→ 🧿 META-LUPA enxerga
→ 🔥 META-GRILL acha a ferida
→ 💭 META-COGNIÇÃO organiza o pensamento
→ 🎼 META-ORQUESTRAÇÃO manda cada coisa ao dono
→ 🔗 META-START-LINK preserva direção e próximo cursor
```

## 🧠 Corpo conceitual completo

```text
🧿 META-LUPA/
🧠 CÉREBRO-CENTRAL · OWNER
"Enxerga, interpreta, governa e mantém o corpo coerente."

META-LUPA/
│
├── 🔥 META-GRILL/
│   └── 🔬 EXAME PROFUNDO
│       FERIDA → HIPÓTESES → 10 LENTES → CONTRAPROVA → CAUSA → DELTA ÚTIL
│
├── 💭 META-COGNIÇÃO/
│   └── 🧠 MENTE OBSERVADORA
│       CONTEXTO → ÂNCORAS → PADRÕES → INCERTEZA → DECISÃO → APRENDIZADO
│
├── 🎼 META-ORQUESTRAÇÃO/
│   └── 🫀 SISTEMA NERVOSO
│       INTENÇÃO → OWNER → AGENTE → ORDEM → EXECUÇÃO → RESULTADO
│
├── 🔗 META-START-LINK/
│   └── ⚡ CONEXÃO NERVOSA
│       POSIÇÃO → DIREÇÃO → PROVENIÊNCIA → DELTA → CONFIANÇA → CURSOR
│
├── 🛡️ GUARDRAILS/
│   └── 🦠 SISTEMA IMUNOLÓGICO
│       LIMITE → DETECÇÃO → BLOQUEIO → PROTEÇÃO → RECUPERAÇÃO
│
├── 🧾 RECEIPTS/
│   └── 🩻 PRONTUÁRIO
│       AÇÃO → PROVA → SHA → RESULTADO → ESTADO
│
├── 📚 LEDGER/
│   └── 🧬 MEMÓRIA CLÍNICA
│       HISTÓRICO → PROVENIÊNCIA → DELTAS → CONTINUIDADE
│
├── 🏷️ CLAIM-SEALS/
│   └── ✅ SELO DE VALIDAÇÃO
│       CLAIM → PROVA → ESCOPO → STATUS
│
├── 🤖 AGENTS/
│   └── 🦾 ÓRGÃOS EXECUTORES
│       MISSÃO → FERRAMENTA → AÇÃO → RECEIPT
│
└── 🔗 INTERLIGADOS/
    └── 🪢 COSTURA MENTAL + OPERACIONAL
        SINAL → GANCHO → OWNER → CAPACIDADE → PROVA → CURSOR
```

## 🪬 Âncoras mentais

```text
🧠 CÉREBRO-CENTRAL (META-LUPA) → pensa o corpo.
🔥 EXAME PROFUNDO (META-GRILL) → encontra onde dói.
💭 MENTE OBSERVADORA (META-COGNIÇÃO) → observa como o corpo decide.
🎼 SISTEMA NERVOSO (META-ORQUESTRAÇÃO) → manda o sinal certo.
🔗 CONEXÃO NERVOSA (META-START-LINK) → não deixa o contexto se perder.
🛡️ SISTEMA IMUNOLÓGICO (GUARDRAILS) → impede ação fora do limite.
🧾 PRONTUÁRIO (RECEIPTS) → registra o que realmente aconteceu.
📚 MEMÓRIA CLÍNICA (LEDGER) → preserva o histórico com proveniência.
🏷️ SELO DE VALIDAÇÃO (CLAIM-SEALS) → marca o que está comprovado.
🤖 ÓRGÃOS EXECUTORES (AGENTS) → fazem a ação específica.
🪬 RESULTADO → um corpo só, várias funções, um OWNER.
```

## 🧩 Herança real sem duplicação

O desenho acima é uma **camada visual/semântica** sobre capacidades já existentes. Não cria diretórios executores paralelos só para combinar com a metáfora.

```text
GUARDRAILS → herda `.agents/skills/meta-lupa/guardrails/`
AGENTS     → herda `.agents/skills/meta-lupa/agents/`
META-LUPA  → herda `.agents/skills/meta-lupa/SKILL.md`
RECEIPTS / LEDGER / CLAIM-SEALS → resolvem para os owners e registros canônicos já existentes quando aplicáveis
```

Se uma capacidade não tiver owner físico próprio comprovado, permanece **gancho semântico** até reconciliação. `GANCHO != NOVO OWNER`.

## 🔗 !># INTERLIGADOS

Entrada visual: `INTERLIGADOS/README.md`.

```text
👑🪬 !CENTRALDARK
→ 🔗 !># INTERLIGADOS
→ ⭕ !AURÉOLA CANÔNICA
→ 🧿 #ACORDAR
→ 🎛️ !CALIBRAR
→ 🧭 !MULTIBÚSSOLA
→ 🔎 !META_LUPA
→ 🔄 !RECONCILIAR
→ ⚖️ !CONTRAPROVA
→ 💠 !FIXED_POINT
→ 🧾 !REGISTRA
→ ⚖️ REALIDADE
```

O bloco `INTERLIGADOS/` guarda apenas a **costura semântica**: mapa mental das skills, padrões duráveis extraídos dos PRs e fronteiras que continuam exigindo Casa/VPS/runtime/CI aplicável. Implementação não provada não é promovida só porque o padrão foi preservado.

## 🪝 Lei do gancho

```text
INTENÇÃO
→ GANCHO
→ OWNER EXISTENTE
→ CAPACIDADE HERDADA
→ DELTA ÚTIL
→ PROVA
→ PRÓXIMO CURSOR
```

## ✍️ Gramática obrigatória

`EMOJI + GANCHO HUMANO + (TERMO TÉCNICO) → ensinamento curto.`

- Emoji permanece visível.
- Frase curta funciona como âncora semântica.
- Palavra técnica nunca vem seca quando um gancho humano reduzir carga cognitiva.
- Explicação deve permanecer curta, clara e operacional.
- `UNKNOWN != PASS` e aparência não substitui prova.

## 🔒 Formato de resposta bloqueado

Fonte byte-a-byte:

`FORMATO-RESPOSTA-CANONICO.md`

Cadeado:

`FORMATO_CANONICAL_SHA`

Gate reutilizado:

`python scripts/lupa/validar_autolupa_hash.py`

O formato exige emoji, âncora semântica, resposta curta e, quando houver mutação/cristalização/prova, os blocos `📝 ANOTAÇÃO` e `🧾 PROVAS / RASTRO` com `ID`, `HEAD`, `HASH`, `COMMIT`, `LINK` e `RASTRO` quando disponíveis.

## 🔒 Invariantes

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
NO_PARALLEL_ARCHITECTURE=true
META_LUPA_IS_OWNER=true
KIT_IS_SEMANTIC_HOOK=true
INTERLIGADOS_IS_SEMANTIC_STITCH=true
LOAD_ONLY_MATERIAL_SKILLS=true
PR_PATTERN_IS_NOT_IMPLEMENTATION_PROMOTED=true
SOURCE_PATTERN_IS_NOT_RUNTIME_PROOF=true
RESPONSE_FORMAT_LOCKED=true
EMOJI_REQUIRED=true
PROOF_FOOTER_ON_MUTATION=true
CHANGE_REQUIRES_SEGREDO_CHEFE=true
SEMANTIC_BODY_DOES_NOT_CREATE_PARALLEL_OWNER=true
```

## 🔁 Cristalização obrigatória após busca material

Qualquer busca, inspeção, investigação ou remedição que produza delta material deve ser registrada no PR-MÃE antes da próxima busca material.

```text
BUSCA / INSPEÇÃO
→ FATO OBSERVADO
→ CLASSIFICAÇÃO
→ DELTA ÚTIL
→ RECEIPT NO PR-MÃE
→ NEXT_CURSOR
→ SÓ ENTÃO PRÓXIMA BUSCA
```

Regras:

```text
PR_MOTHER_SESSION_LEDGER_REQUIRED=true
MATERIAL_SEARCH_WITHOUT_MOTHER_RECEIPT=INCOMPLETE
CRYSTALLIZE_BEFORE_NEXT_MATERIAL_SEARCH=true
PR_MOTHER_RECORDS=true
PR_MOTHER_RUNTIME_WRITER=false
CHILD_OWNER_MUTATES=true
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```

A cristalização deve registrar também erros do próprio executor quando materiais, distinguindo:
- TARGET_FAILURE;
- TOOL/WRAPPER_FAILURE;
- TEST_ENVIRONMENT_FAILURE;
- PROVIDER_FAILURE;
- PRODUCT_REGRESSION.

Nenhum desses estados pode ser convertido no outro sem contraprova.
