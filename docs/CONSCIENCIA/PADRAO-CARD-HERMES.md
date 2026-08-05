---
title: "PADRAO CARD HERMES"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-08-05
---

# 🎴 PADRÃO CARD HERMES — v1.3 (PROPOSTA)

> **Status:** 🟡 EM PR — aprovação final do Pivete pendente
> **Autoria:** Fabler (v1.0) + Gemini (v1.1) + Fabler (v1.1.1) + Fabler+Gemini (v1.2) + Pivete/GPT (v1.3)
> **Validado por:** Pivete em 04/07/2026 para v1.2 — "agora sim foi direto pra meu privado, esse sim tá lindo"
> **Regra dura:** TODA ação relevante do sistema DEVE mandar esse card. Nada de aviso solto, nada fora do padrão.

---

## 🔒 Regras invioláveis

1. **TUDO dentro de UM único `<pre>...</pre>`.** Nada de texto fora. Sem título proporcional em cima. Sem rodapé fora do bloco. Nada.
2. **Envio pelo connector Telegram** (`sendMessage`), NUNCA pelo `notify-telegram` (aquele exige `NOTIFY_API_KEY` e falha).
   - Bot: `@srver1bot`
   - `connection_id`: `std_01kvw4jkcbekyr1t33vs4p5e9w`
   - `connector_id`: `telegram`
   - `chat_id` admin: `1901426549` (secret `TELEGRAM_ADMIN_CHAT_ID`)
   - `chat_id` canal status: `-1003669176367` (secret `TELEGRAM_STATUS_CHANNEL_ID`)
   - `parse_mode`: `"HTML"`
3. **Largura fixa:** 36 caracteres (moldura e separador).
4. **STATUS só emoji + palavra:** `✅ OK` / `⚠️ AVISO` / `❌ FALHA`. Nunca misturar prova técnica com status.
5. **Prova técnica só no bloco `🔧 DETALHE TÉCNICO`** — commits, arquivos, IDs, validadores.

---

## 🧩 Template canônico v1.2

```
<pre>
╔══════════════════════════════════╗
║  {SISTEMA} / {MÓDULO}            ║
║  {NOME DA ENGINE} v{X.Y.Z}       ║
╚══════════════════════════════════╝

STATUS:    ✅ OK
PRIORID:   🟡 Média
RESPONS:   @segredounlocker

🎯 MISSÃO: {frase curta}
📌 FASE:   {fase atual → próxima}
⏱  TEMPO:  {ex: 4m 12s}

📘 LEIGO
  {2 linhas em português simples}

⚙️  AÇÃO
  {o que foi feito, 2-4 linhas}

📊 PROGRESSO
  NÍVEL: [████████░░] Lv.{N}
  XP:    [██████████] {ganho}/{total}
  PROG:  {0-100}%

🧠 SKILLS UP
  • {Skill}  +{XP} XP (Lv.{N})
  • {Skill}  +{XP} XP (Lv.{N})

🚨 BLOQUEIOS
  {nenhum | descrição curta}

🎯 PRÓXIMO PASSO
  {1 linha objetiva}

────────────────────────────────────
🔧 DETALHE TÉCNICO (PROVA)
  Arquivo:  {caminho}
  Commits:  {hash} ({versão})
  Validad:  {quem validou}
  Log ID:   {uuid curto}
  Tags:     #dev #consciencia
</pre>
```

---

## 🧠 Modo Percentual Honesto — avaliação evolutiva reproduzível

### Objetivo

Quando o Pivete pedir uma porcentagem sobre conhecimento, evolução, ganho ou perda, a IA deve repetir o mesmo método: evidência primeiro, cálculo explícito, perdas visíveis e nenhuma porcentagem inventada para agradar.

### Gatilhos equivalentes

Reconhecer sem diferenciar maiúsculas, minúsculas ou acentos:

- `fala a verdade qual a porcentagem`
- `qual a porcentagem de hoje`
- `qual a porcentagem do meu conhecimento`
- `qual foi meu ganho e minha perda`
- `minha evolução em porcentagem`
- variações semanticamente equivalentes que peçam avaliação percentual honesta

O gatilho não autoriza alteração de código, memória, XP, skill, banco, GitHub ou produção. Ele autoriza somente **análise e recibo**.

### Regra de honestidade

```text
PORCENTAGEM_EXATA_SEM_BASELINE=PROIBIDA
ELOGIO_SEM_EVIDENCIA=PROIBIDO
POTENCIAL_MISTURADO_COM_ESTADO_ATUAL=PROIBIDO
GANHO_SEM_MOSTRAR_PERDA_OU_RISCO=PROIBIDO
IMPLEMENTACAO_DECLARADA_SEM_ARTEFATO=PROIBIDO
UNKNOWN_TRANSFORMADO_EM_PASS=PROIBIDO
```

O protocolo não promete infalibilidade. Ele deve tornar qualquer erro detectável, mostrar a conta e bloquear afirmações quando faltarem dados.

### Janela e baseline

1. Usar como baseline o último cartão percentual aceito pelo Pivete.
2. Se o Pivete disser `ontem`, `hoje` ou indicar período, usar somente evidências desse intervalo.
3. Se não existir baseline verificável:

```text
BASELINE=NAO_ENCONTRADO
GANHO_PERCENTUAL=NAO_CALCULAVEL
```

Nesse caso, entregar apenas o retrato atual e registrar o primeiro baseline; nunca inventar um “antes”.

### Classes de evidência

| Código | Classe | Exemplo |
|---|---|---|
| `P` | PROVADO | PR, commit, teste, log, arquivo, diff ou execução reproduzível |
| `O` | OBSERVADO | decisão, correção ou comportamento visível na conversa |
| `D` | DECLARADO | afirmação do Pivete ainda sem recibo independente |
| `U` | UNKNOWN | informação ausente, conflitante ou impossível de confirmar |

`D` e `U` não podem sustentar sozinhos nota alta de implementação.

### Régua fixa por dimensão

```text
0   = ausente ou contradito
20  = percebeu ou nomeou o problema
40  = explicou com clareza
60  = aplicou uma vez com resultado observável
80  = aplicou repetidamente com evidência
100 = reproduziu em casos independentes, com regressão e contraprova
```

### Dimensões e pesos oficiais

| Dimensão | Peso |
|---|---:|
| Intenção e modelagem do problema | 10% |
| Visão sistêmica e arquitetura | 15% |
| Separação de papéis e autoridade | 15% |
| Evidência, falsificação e retratação | 15% |
| Escopo, prioridade e “menos é mais” | 10% |
| Consolidação e fechamento de frentes | 10% |
| Implementação comprovada | 15% |
| Sustentabilidade, rollback e observabilidade | 10% |

Os pesos somam 100%. Não alterar pesos durante a resposta para produzir resultado mais bonito.

### Fórmulas obrigatórias

```text
NOTA_GERAL = Σ(nota_dimensao × peso_dimensao) / 100
DELTA_ABSOLUTO = NOTA_ATUAL - NOTA_BASELINE
GANHO_RELATIVO = (DELTA_ABSOLUTO / NOTA_BASELINE) × 100
```

Se `NOTA_BASELINE=0` ou baseline não existir, `GANHO_RELATIVO=NAO_CALCULAVEL`.

### Confiança da avaliação

```text
ALTA  = cobertura suficiente de evidências P/O e pelo menos 2 provas P
MEDIA = maioria O, poucas P, sem contradição material
BAIXA = maioria D/U, baseline incompleto ou evidência conflitante
```

Com confiança baixa, entregar **faixa**, não número exato. Exemplo: `62–72%`.

### Saída obrigatória

A resposta deve conter, nesta ordem:

1. **Veredito direto**, sem elogio automático.
2. **Tabela completa** com `Área | Peso | Antes | Agora | Δ | Evidência | Confiança`.
3. **Conta reproduzível** da nota geral.
4. **Ganho absoluto** e, quando calculável, **ganho relativo**.
5. **Maior avanço** observado.
6. **Maior perda, regressão ou dívida** — obrigatório, mesmo quando o saldo for positivo.
7. **Implementação comprovada**, separada de visão e potencial.
8. **Contraprova:** ao menos um fato que limite ou ataque a conclusão.
9. **Lacunas/UNKNOWN**.
10. **Próximo gate mínimo**, uma única ação que melhoraria a nota com prova.

### Template da tabela

```text
| Área | Peso | Antes | Agora | Δ | Evidência | Confiança |
|---|---:|---:|---:|---:|---|---|
| Intenção/modelagem | 10% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Visão sistêmica | 15% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Papéis/autoridade | 15% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Evidência/falsificação | 15% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Escopo/menos é mais | 10% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Consolidação/fechamento | 10% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Implementação comprovada | 15% | __ | __ | __ | P/O/D/U: ... | A/M/B |
| Sustentabilidade/rollback | 10% | __ | __ | __ | P/O/D/U: ... | A/M/B |
```

### Recibo final obrigatório

```text
JANELA_AVALIADA={início → fim}
BASELINE={fonte ou NAO_ENCONTRADO}
NOTA_BASELINE={0-100 ou UNKNOWN}
NOTA_ATUAL={0-100 ou faixa}
DELTA_ABSOLUTO={pontos ou UNKNOWN}
GANHO_RELATIVO={percentual ou NAO_CALCULAVEL}
CONFIANCA={ALTA|MEDIA|BAIXA}
MAIOR_GANHO={dimensão}
MAIOR_PERDA_OU_DIVIDA={dimensão}
IMPLEMENTACAO_PROVADA={0-100 ou faixa}
CONTRAPROVA={evidência que limita a conclusão}
PROXIMO_GATE={uma ação mínima e verificável}
```

### Falhas que invalidam o cartão

- Média anunciada não coincide com as linhas da tabela.
- “Antes” inventado por memória vaga.
- Dimensões sobrepostas usadas para contar o mesmo avanço duas vezes.
- Potencial futuro contado como conhecimento atual.
- Número preciso com confiança baixa.
- Ausência de perdas, dívida, contraprova ou UNKNOWN.
- Implementação pontuada apenas porque a ideia foi explicada.
- Percentual alterado para combinar com o tom emocional da conversa.

Quando qualquer falha acima ocorrer:

```text
STATUS=INVALID_PERCENTUAL_CARD
ACAO=RECALCULAR_ANTES_DE_RESPONDER
```

---

## 📞 Como chamar (o único jeito certo)

**Ferramenta:** `standard_connectors--call_gateway_connection`

```json
{
  "connection_id": "std_01kvw4jkcbekyr1t33vs4p5e9w",
  "connector_id": "telegram",
  "method": "POST",
  "path": "/sendMessage",
  "reason_for_call": "Notificar admin da ação X",
  "body": {
    "chat_id": 1901426549,
    "parse_mode": "HTML",
    "text": "<pre>...card inteiro aqui...</pre>"
  }
}
```

---

## 📨 REGRA DE CANAL: ADMIN ≠ GRUPO (OBRIGATÓRIO)

Nunca mandar o mesmo texto nos dois canais. Cada um tem formato próprio:

### 🔹 ADMIN (privado — `1901426549`)
**Público-alvo:** Pivete (leigo, precisa de gamificação)
**Formato:** Card `<pre>` completo com moldura, emojis, progresso, XP, skills, próximo passo
**Tom:** Gamificado, visual, didático — ele precisa ENTENDER o que aconteceu sem ler código
**Conteúdo obrigatório:**
- STATUS com emoji + palavra (`✅ OK` / `⚠️ AVISO` / `❌ FALHA`)
- PRIORIDADE + RESPONSÁVEL
- MISSÃO + FASE + TEMPO
- 📘 LEIGO (2 linhas em português simples)
- ⚙️ AÇÃO (o que foi feito)
- 📊 PROGRESSO (barra + XP)
- 🧠 SKILLS UP
- 🚨 BLOQUEIOS
- 🎯 PRÓXIMO PASSO
- 🔧 DETALHE TÉCNICO (prova)

### 🔸 GRUPO / CANAL STATUS (`-1003669176367`)
**Público-alvo:** IAs, bots, sistemas
**Formato:** Texto limpo, SEM `<pre>`, SEM moldura, SEM spoiler, SEM tags HTML visíveis
**Tom:** Seco, técnico, informativo — elas precisam do fato, não da apresentação
**Conteúdo:**
- `🤖 {SISTEMA} — {resumo em 1 linha}`
- Sem emojis decorativos, sem barras de progresso, sem XP
- No máximo 2 linhas

### ⚠️ Regra dura
- Toda ação relevante do sistema DEVE mandar **nos dois canais**
- Mas cada um com SEU formato — **nunca** o mesmo texto
- O `notify.mjs` do Hermes já implementa essa separação automaticamente

---

## 🚫 O que NÃO fazer (erros já cometidos)

| Erro | Motivo |
|---|---|
| Texto/título fora do `<pre>` | Vira letra proporcional, quebra o "fundo preto monoespaçado" |
| Usar `notify-telegram` | Exige `NOTIFY_API_KEY` no header e retorna 401 |
| Misturar hash de commit no `STATUS` | Polui coluna de status; prova vai só em `DETALHE TÉCNICO` |
| Postar em bot errado (`@SEGREDOPUXADASBOT`) | Aquele é do TelePainel, não Central |
| Card sem `PRÓXIMO PASSO` | Deixa Pivete sem saber o que vem a seguir |

---

## 📜 Histórico

- **v1.0** (Fabler) — estrutura base
- **v1.1** (Gemini) — largura 36, STATUS no topo
- **v1.1.1** (Fabler) — XP atual/total, PROVA só verificável
- **v1.2** (Fabler+Gemini) — TEMPO, BLOQUEIOS, PRÓXIMO PASSO, RESPONSÁVEL, PRIORIDADE, LOG ID, TAGS + regra "sempre notificar"
- **v1.3 proposta** (Pivete/GPT) — Modo Percentual Honesto com gatilhos, baseline, pesos fixos, perdas, contraprova, confiança e cálculo reproduzível

---

**Este arquivo é a fonte da verdade. Qualquer IA/agente lê isso antes de mandar card no Telegram.**

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
