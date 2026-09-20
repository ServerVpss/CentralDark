# 🧠 Tools Cognitivas — Governança Cognitiva + Memória Cruzada

> Implementadas em `dist/tools/cognitivo/cognitivo.js` (30/06/2026). Dão a qualquer IA
> conectada a capacidade de aprender o jeito do Pivete e manter contexto entre trocas de IA.

---

## O conceito: "Lembranças"

Camada de memória de **curto prazo** (30 dias) em `docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md`.
O Pivete troca muito de IA via conector MCP; sem isso, o contexto se perdia a cada troca.

```
Você fala com qualquer IA (via MCP)
   │
   ├─ A IA LÊ as Lembranças ao começar  → consultar_memoria_reserva
   │     (aprende seu jeito ANTES de responder)
   │
   ├─ A IA GRAVA fragmentos novos         → consolidar_pensamento
   │     (o que você gosta / como age / aprendeu hoje — validade 30d)
   │
   ├─ A IA se calibra na conduta          → injetar_consciencia_centraldark
   │
   └─ A IA mede seu foco atual            → analise_de_estado_cognitivo

   ↓ periodicamente
   Lembranças recorrentes/relevantes são CRUZADAS e PROMOVIDAS
   pra consciência oficial (docs/CONSCIENCIA/). O resto EXPIRA em 30 dias.
```

---

## As 4 ferramentas

### 1. `consultar_memoria_reserva` (leitura)
Lê as Lembranças, filtra e agrupa por eixo temporal (passado/presente/futuro).
**Use ANTES** de qualquer pedido complexo.
- Entradas: `query?`, `tag?`, `eixo?`, `limite?` (20), `incluir_expiradas?` (false)
- Saída: `{ ok, total, contexto_temporal: { passado, presente, futuro } }`

### 2. `consolidar_pensamento` (escrita-segura)
Grava uma lembrança nova, indexada, com validade de 30 dias. Faz **limpeza automática** das
lembranças vencidas (não-promovidas). Sanitiza credenciais antes de gravar.
- Entradas: `titulo`, `conteudo` (obrigatórios), `tags?`, `relevancia?` (media),
  `eixo?` (presente), `promovida?` (false → se true, não expira)
- Efeito: commita no Git → webhook puxa pra VPS → Notion sincroniza
- Saída: `{ ok, gravada, expira, expiradas_limpas, total_ativas, commit }`

### 3. `injetar_consciencia_centraldark` (leitura)
Retorna as **regras de conduta imutáveis** (estão no código, que é trancado): zero enrolação,
pragmatismo extremo, execução direta, foco total, PT-BR, segurança, Sincronia. Complementa
`ler_consciencia` (regras técnicas).
- Entradas: nenhuma
- Saída: texto das regras de conduta

### 4. `analise_de_estado_cognitivo` (leitura)
Lê as últimas Lembranças, infere o **foco atual** (tags mais frequentes), sugere o **nível de
detalhe** da resposta e aponta **candidatos a promoção** pra consciência oficial.
- Entradas: `limite?` (15)
- Saída: `{ ok, lembrancas_ativas, foco_atual, nivel_detalhe_sugerido, candidatos_a_promover }`

---

## Formato de uma lembrança (em `LEMBRANCAS.md`)

```
### [AAAA-MM-DDThh:mm] Título curto
- **Data:** AAAA-MM-DD
- **Tags:** tag1, tag2
- **Relevância:** alta | media | baixa
- **Eixo:** passado | presente | futuro
- **Expira:** AAAA-MM-DD   (Data + 30 dias, salvo se Promovida)
- **Promovida:** nao | sim

Conteúdo: o essencial (o "ouro"), sem ruído nem segredo.
```

A leitura/escrita é via GitHub API (com fallback local), mesmo padrão de `consciencia.js`.
Entradas mantidas preservam o texto original (não são re-serializadas) — só novas entradas
são geradas pelo template. Comparação de validade é lexicográfica sobre `YYYY-MM-DD`.
