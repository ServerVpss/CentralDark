# CENTRALDARK — ATLAS BIO-COGNITIVO + ARQUITETURAS NEURAIS OPENAI

**Estado desta entrega:** pacote único, autocontido e verificável  
**Medição pública:** 2026-08-24T09:33:00-03:00  
**Regra:** `HISTORY != CURRENT_STATE`  
**Regra:** `BIOLOGICAL_INSPIRATION != OPENAI_BLUEPRINT`

## 1. Objetivo

Conectar dois campos sem misturá-los:

1. **O que a OpenAI publica de fato sobre arquiteturas neurais/sistêmicas.**
2. **O que a cognição animal oferece como princípios biológicos comparativos para testar na CentralDark.**

O Atlas não afirma que a OpenAI copie cérebros de animais específicos. O que existe publicamente é, principalmente, arquitetura computacional: Transformers, Mixture-of-Experts, atenção, embeddings, encoders/decoders, ferramentas, instruções, handoffs, guardrails e tracing.

## 2. Estado vivo público da OpenAI

### GPT-5.6
A família pública atual inclui **Sol, Terra e Luna**. A documentação pública atual descreve capacidades, segurança, eficiência, uso de ferramentas, compaction, orquestração multiagente e programmatic tool calling.

**Importante:** a topologia neural interna detalhada de GPT-5.6 (número de camadas, especialistas, dimensões, etc.) **não está publicada nas fontes oficiais medidas para este pacote**.

`GPT_5_6_EXACT_NEURAL_TOPOLOGY = UNKNOWN_PUBLICLY`

### gpt-oss
É o caso mais detalhado publicamente:

- Transformer autoregressivo;
- Mixture-of-Experts (MoE);
- gpt-oss-120b: ~116.8B parâmetros totais, ~5.1B ativos por token;
- gpt-oss-20b: ~21B totais, ~3.6B ativos por token;
- atenção alternando densa e esparsa com banda local;
- grouped multi-query attention;
- RoPE;
- contexto nativo até 128k.

### Agents SDK / camada de sistema
Isto **não é arquitetura neural**, e sim arquitetura de agente:

`AGENT = MODEL + TOOLS + INSTRUCTIONS`

Multiagente:
`HANDOFFS + GUARDRAILS + TRACING + ORCHESTRATION`

## 3. Arquiteturas neurais OpenAI publicamente documentadas

### GPT-4
- descrito como **Transformer-style**;
- pré-treinado para previsão do próximo token;
- detalhes internos completos não foram publicados no relatório técnico.

### Whisper
- **encoder-decoder Transformer**;
- áudio → log-Mel spectrogram → encoder → decoder textual;
- arquitetura end-to-end.

### CLIP
- arquitetura dual-encoder multimodal;
- image encoder: ResNet ou Vision Transformer;
- text encoder: Transformer;
- treinamento contrastivo em pares imagem-texto;
- embeddings conjuntos normalizados para similaridade.

### gpt-oss
- Transformer + MoE + atenção densa/esparsa + GQA + RoPE;
- é a arquitetura pública mais específica deste conjunto.

## 4. Atlas bio-cognitivo

O objetivo não é criar `ElephantAgent`, `OctopusAgent` etc.  
O método é:

`ESPÉCIE/GRUPO → CAPACIDADE → MECANISMO → PRINCÍPIO → ANALOGIA COMPUTACIONAL → TESTE → CONTRAPROVA → CRISTAL`

### Famílias

| Grupo | Princípio observado | Analogia computacional CentralDark | Estado |
|---|---|---|---|
| Formigas | coordenação coletiva, feedback local, estigmergia | coordenação distribuída por sinais/estado compartilhado | EVIDÊNCIA_CIENTÍFICA |
| Abelhas | navegação, comunicação, memória espacial, categorização | busca distribuída + mapas + comunicação compacta | EVIDÊNCIA_CIENTÍFICA |
| Polvos | controle neural distribuído entre cérebro e braços | executores periféricos com autonomia limitada | EVIDÊNCIA_CIENTÍFICA |
| Corvídeos | planejamento, memória, ferramenta, flexibilidade | planejamento episódico + causalidade + tool use | EVIDÊNCIA_CIENTÍFICA |
| Papagaios | comunicação, categorização, abstração | representação simbólica / interface linguística | INSPIRAÇÃO_COMPARATIVA |
| Elefantes | memória social/longitudinal e cognição flexível | memória longitudinal com contexto | EVIDÊNCIA_PARCIAL_NO_PACOTE |
| Cetáceos | cooperação e comunicação social | coordenação multiagente social | INSPIRAÇÃO_COMPARATIVA |
| Primatas | aprendizagem social, ferramenta, estratégia | aprendizagem social + modelagem de agentes | EVIDÊNCIA_CIENTÍFICA |
| Roedores | navegação espacial e aprendizagem por reforço | mapas de estado + exploração/recompensa | INSPIRAÇÃO_COMPARATIVA |
| Peixes | navegação e cognição eficiente | processamento compacto / decisão com baixo custo | INSPIRAÇÃO_COMPARATIVA |
| Invertebrados | cognição útil em sistemas nervosos compactos | eficiência computacional / embodied intelligence | EVIDÊNCIA_COMPARATIVA |
| Predador–presa | antecipação, detecção, adaptação adversarial | red-team/counterproof dinâmico | ANALOGIA_ECOLÓGICA |

As linhas `INSPIRAÇÃO_COMPARATIVA` e `ANALOGIA_ECOLÓGICA` **não são prova de equivalência neural**.

## 5. Cognição animal: quantidade

Não existe um número mundial canônico de espécies com “cognição registrada”.

Evidência medida:
- revisão sistemática de 2025: **49 meta-análises / 1.824 estudos primários**;
- contagens de inovação, ferramenta e aprendizagem social já existem em **centenas de espécies** de aves e primatas.

Portanto:

`EXACT_GLOBAL_SPECIES_COUNT = UNKNOWN`

## 6. Tradução para CentralDark

```text
FORMIGA       → distributed coordination
ABELHA        → navigation + communication
POLVO         → peripheral execution
CORVÍDEO      → planning + tool use
PAPAGAIO      → symbolic communication
ELEFANTE      → longitudinal memory
CETÁCEO       → cooperation
PRIMATA       → social learning + strategy
ROEDOR        → state map + reinforcement
PEIXE         → efficient cognition
INVERTEBRADO  → compact neural computation
PREDADOR/PRESA→ adversarial adaptation
```

Mas o gate é sempre:

`BIOLOGICAL_PATTERN → COMPUTATIONAL_HYPOTHESIS → TEST → COUNTERPROOF → ONLY_THEN_ABSORB`

## 7. Arquitetura integrada

```text
CHEFE / INTENÇÃO
        ↓
CENTRALDARK
        ↓
PERCEPÇÃO MULTIFONTE
        ↓
BIBLIOTECA BIO-COGNITIVA
        +
ARQUITETURAS COMPUTACIONAIS PROVADAS
        ↓
HIPÓTESES DE MECANISMO
        ↓
MULTIBÚSSOLA
        ↓
META_LUPA / CONTRAPROVA
        ↓
MENOR DELTA IMPLEMENTÁVEL
        ↓
HERMES / EXECUÇÃO
        ↓
REALIDADE / JUDGE
        ↓
CRISTAL
        ↓
PRÓXIMO BOOT
```

## 8. Invariantes

- `REALITY = JUDGE`
- `UNKNOWN != PASS`
- `BIOLOGICAL_INSPIRATION != OPENAI_ARCHITECTURE`
- `PUBLIC_SYSTEM_CARD != FULL_NEURAL_TOPOLOGY`
- `AGENT_ARCHITECTURE != NEURAL_ARCHITECTURE`
- `HISTORY != CURRENT_STATE`
- `CORRELATION != CAUSE`
- `SOURCE != AUTHORITY`
- `REUSE_BEFORE_CREATE`
- `ONE_SYSTEM_ONLY`

## 9. Entrega

Esta família contém:

- PNG canônico;
- Markdown;
- Mermaid;
- estado vivo separado;
- histórico separado;
- catálogo OpenAI;
- catálogo bio-cognitivo;
- índice de fontes;
- contraprova;
- denominador cross-agent;
- trace;
- receipt;
- manifesto com SHA-256;
- pasta SUPERSEDED isolada;
- verificador reproduzível.

## BOOT

`EVOLUTION → COGNITIVE_PRINCIPLE → COMPUTATIONAL_ANALOGY → COUNTERPROOF → CRYSTAL`

## Fio da missão

`vida → mecanismo → arquitetura → teste → prova → aprendizado → continuidade`
