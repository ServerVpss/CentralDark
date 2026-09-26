# Classificador 5 Classes — para Especialista de Modelos

> Copiado e adaptado de `external-source-alignment`. Sub-conjunto aqui
> para deixar a skill `especialista-de-modelos` autocontida.

## 5 Classes (obrigatório)

| Class | Label | Critério | Ação |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | Durable, plataforma-independente | Promover → página do modelo |
| **B** | `EQUIVALENTE_JÁ_EXISTE` | Já está em outra página | Ignorar |
| **C** | `LACUNA_REAL` | Faltava, com evidência | Promover → fechar |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | API/token/produto | REJEITAR |
| **E** | `NÃO_VERIFICADO/TEMPORAL` | Preço/data/lançamento | REJEITAR (só citar com SHA) |

## Exemplos (anti-contaminação)

### GPT-5.5

**Class A (ouro):**
- "Tool-routing decision tree com branches nomeadas" — princípio durável.
- "Sandbox compaction como alias para memory consolidation" — método.
- "Compaction turn limit declarado no system prompt" — comportamento.
- "Citation rules: paraphrase até 15 palavras, 1 citação/fonte" — padrão.

**Class B (já existe):**
- "Pareamento de tools internos antes de web_search" — Casa já faz.
- "Skill reading antes de executar" — meta-lupa já cobre.

**Class C (lacuna real):**
- "Aliases explícitos para compaction/sandbox" — Casa tem MAS não documentado.
- "Mapa de capacidades por capability_tier" — faltava.

**Class D (rejeitar):**
- Nome específico de modelo sem capability tier ("gpt-5.5-pro").
- Token/URL/cookie de plataforma OpenAI/Azure.
- Preço específico em $/M tokens.
- Datas de lançamento/descontinuação.

**Class E (rejeitar):**
- "New flagship" / "industry-leading" / "best-in-class".
- "Recently released" / "next month".
- "Outperforms predecessor by X%" sem paper.
- "Coming soon" / beta / alpha sem SHA.

---

## Anti-padrões a evitar

- ❌ "GPT-5.5 é o melhor modelo OpenAI até hoje" — popularidade, não ouro.
- ❌ "Custa $X/M input tokens" — temporal, rejeitar.
- ❌ "Recomendado para codificação" — sem prova, Class B com docs externas.
- ❌ "Compatível com API OpenAI" — Class D, plataforma.
- ❌ "Pode processar 1M tokens" — só aceito se a página OpenAI mostrar.

---

## Gate de promoção (3 travas)

Antes de mover de "achado" para "página":

1. **Check que passou** — fonte tem SHA ou URL viva.
2. **Failure pattern nomeado** — o que esse modelo falha, quando.
3. **Dead-end eliminado** — alternativa tentada e descartada.

Faltando 1 → `changelog/pending/`. **NÃO** promover.
