# MetaLupa — Guardrail de Gatilhos Semânticos

Owner: `.agents/skills/meta-lupa/`
Resolver determinístico: `scripts/trigger-fabric/semantic_trigger_resolver.py`
Mapa de gatilhos: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`

## Objetivo

Permitir que a MetaLupa e o Trigger Fabric reconheçam a intenção operacional do SEGREDO/CHEFE mesmo quando o gatilho vier com abreviação, erro de digitação, variação de marcador ou símbolo canônico, sem transformar similaridade textual em autoridade, permissão, prova ou mutação automática.

```text
FALA_HUMANA
→ NORMALIZAÇÃO DETERMINÍSTICA
→ TOKEN|ALIAS|SÍMBOLO|TYPO_LIMITADO
→ TRIGGER_CANDIDATE
→ CONTEXTO + ESTADO VIVO
→ GATILHOS APLICÁVEIS
→ META_LUPA PROPORCIONAL AO RISCO
→ OWNER
→ ONE_WRITER
→ EVIDÊNCIA
→ REALITY_JUDGE
```

## Símbolos e famílias

```text
☼  → #ACORDAR
⚙  → !CALIBRAR
🧭 → !MULTIBUSSOLA
⊛  → !META_LUPA
```

Exemplos aceitos pela camada determinística:

```text
#ACORDAR | #ACORDA | acordar | acord
!CALIBRAR | #CALIBRAR | calibar | calibre | calibr
!MULTIBUSSOLA | !MULTI-BUSSOLA | multi bussola | bussola
!META_LUPA | !METALUPA | meta lupa | meta-lupa | meta lupe | lupa meta
```

A lista é um vocabulário de reconhecimento, não uma nova linguagem de autoridade.

## Hierarquia de reconhecimento

```text
1. TOKEN CANÔNICO EXATO       → confiança lexical máxima
2. ALIAS DECLARADO            → reconhecimento determinístico
3. SÍMBOLO CANÔNICO           → reconhecimento determinístico
4. TYPO LIMITADO              → edit distance <= 2 e token >= 5 caracteres
5. EMBEDDING/SEMANTIC CORE     → enriquecimento opcional / hipótese apenas
6. CONTEXTO AMBÍGUO            → UNKNOWN ou C1_INTENT_LANGUAGE
```

```text
EXACT > DECLARED_ALIAS > SYMBOL > BOUNDED_TYPO > EMBEDDING_HINT
```

## Invariantes MetaLupa

```text
SEMANTIC_MATCH != HUMAN_AUTHORITY
SEMANTIC_MATCH != AUTHORIZATION
SEMANTIC_MATCH != AUTO_MUTATION
SEMANTIC_MATCH != PROOF
SIMILARITY != IDENTITY
TYPO_TOLERANCE != MEANING_CERTAINTY
SYMBOL != HIDDEN_MECHANISM_PROOF
MULTI_MATCH != MODEL_VOTE
UNKNOWN != PASS
```

O SEGREDO/CHEFE continua sendo a única autoridade humana. O reconhecedor só reduz perda de intenção por superfície linguística.

## Composição de múltiplos gatilhos

Se a mesma mensagem contiver mais de um gatilho reconhecido, não escolher vencedor por score ou votação. Compor somente os gatilhos materialmente aplicáveis na ordem causal da Casa:

```text
#ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA quando material
→ !META_LUPA proporcional ao risco ou explícita
```

Gatilho detectado não obriga cerimônia inútil. `NO_NEW_INFORMATION → NO_CHANGE → NEXT` permanece válido.

## MetaLupa sobre o próprio reconhecimento

Quando a interpretação do gatilho puder mudar escopo, risco, Writer, autorização ou resultado material:

```text
TRIGGER_CANDIDATE
→ QUAL TEXTO/SÍMBOLO DISPAROU?
→ EXISTE OUTRA LEITURA PLAUSÍVEL?
→ O CONTEXTO VIGENTE SUPORTA A LEITURA?
→ O ESTADO VIVO CONTRADIZ?
→ A ATIVAÇÃO MUDA AUTORIDADE? SE SIM: BLOQUEAR ESSA EXPANSÃO
→ REGISTRAR RECEIPT
```

A MetaLupa deve falsificar a própria classificação sem exigir que o CHEFE redigite perfeitamente um token cujo significado contextual já esteja suficientemente discriminado.

## Receipt mínimo

```yaml
SEMANTIC_TRIGGER_RECEIPT:
  input: ""
  normalized: ""
  recognized: []
  reasons: []
  status: MATCH|NO_MATCH|AMBIGUOUS
  authority_changed: false
  auto_mutation: false
```

O runtime determinístico emite `centraldark.semantic-trigger-receipt.v1`.

## Prova / regressão

```text
python scripts/trigger-fabric/semantic_trigger_resolver.py --self-test
```

Fixtures mínimas obrigatórias:

- token canônico reconhece;
- `!calibar #acordar` reconhece CALIBRAR + ACORDAR;
- `⊛ ... meta lupe` reconhece META_LUPA;
- `🧭` reconhece MULTIBUSSOLA;
- frase comum sem gatilho permanece `NO_MATCH`.

Self-test do parser prova somente o reconhecimento lexical conhecido. Não prova que todo runtime da Casa já consumiu o receipt.
