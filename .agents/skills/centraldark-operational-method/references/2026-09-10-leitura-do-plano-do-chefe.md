---
title: Leitura do Plano do Chefe
status: CRISTALIZADO
owner: .agents/skills/centraldark-operational-method/SKILL.md
classification: DELTA_COMPLEMENTAR_DO_OWNER_EXISTENTE
source: CHEFE, sessao 2026-09-10
regression_policy: ZERO_REGRESSION_SEM_V1_V2_V3
---

# 👑🪬 Leitura do Plano do Chefe

## 💡 Ideia simples

Quando o CHEFE pergunta se a CentralDark esta indo bem, a resposta deve avaliar primeiro o plano, nao a maquina.

Main, CI, SHA, PR, VPS e ferramentas entram como prova quando ajudam. Eles nao sao o assunto principal quando a pergunta e sobre intencao, direcao e trajetoria.

## 🗣️ Regra de fala

```text
👑 PLANO PRIMEIRO
⚖️ PROVA DEPOIS
🧠 INTENCAO PRIMEIRO
🏛️ GITHUB SO QUANDO FOR PROVA NECESSARIA
```

## 🩸 Corrente sanguinea mental da Casa

Toda leitura do plano deve passar por tres lugares antes de virar veredito:

```text
🧠 MENTE  = intencao, padrao, direcao, desejo do CHEFE
⚙️ MOTOR  = como a Casa executa sem duplicar nem criar paralelo
⚖️ PROVA  = realidade que confirma, nega ou deixa como nao sei ainda
```

A ordem da resposta deve preservar essa corrente:

```text
🧠 MENTE DO CHEFE
  -> 🔗 CONEXOES ENTRE GUIAS
  -> 💎 DELTA UTIL
  -> 🧱 OWNER CERTO
  -> ⚙️ MOTOR DA CASA
  -> ⚖️ PROVA / GATE
  -> 🧾 RECIBO
  -> 🧭 NEXT_CURSOR
```

## 📋 Formato preferido

```text
👑🪬 PLANO DO CHEFE

🧠 INTENCAO:
boa / confusa / forte / desviando

🧭 DIRECAO:
dentro do padrao / fora do padrao

📈 EVOLUCAO:
o que ficou melhor em palavras simples

⚠️ RISCO:
onde pode virar ruido, duplicacao ou falso-verde

🧩 PECA FALTANTE:
o proximo encaixe pratico da Casa

⚖️ VEREDITO:
continua / ajusta / segura / corta
```

## 🧱 O que nao fazer

- Nao comecar por HEAD, branch, CI ou commit quando a pergunta for sobre o plano.
- Nao transformar diferenca entre chats em disputa de vencedor.
- Nao criar arquitetura paralela para explicar uma ideia que ja tem owner.
- Nao usar palavra tecnica sem traduzir em linguagem simples.
- Nao tratar print, painel verde, resposta bonita, modelo forte ou arquivo existente como prova final.
- Nao chamar guia aberta de execucao real sem rastro.
- Nao deixar um modelo ou uma aba virar autoridade acima da intencao do CHEFE.

## 🔗 Gatilhos e conexoes multiplas

Quando o CHEFE usa `👑🪬 !CENTRALDARK`, `#ACORDAR`, `!CALIBRAR`, `!># INTERLIGADOS`, `!META_LUPA`, `!RECONCILIAR`, `!CONTRAPROVA`, `!REGISTRA` ou aliases equivalentes, a leitura do plano deve ser composta, nao isolada.

```text
👑🪬 !CENTRALDARK
  -> 🔗 !># INTERLIGADOS
  -> ⭕ !AUREOLA CANONICA
  -> 🧠 MENTE / INTENCAO
  -> ⚙️ MOTOR / EXECUCAO POSSIVEL
  -> ⚖️ REALIDADE / PROVA
```

Regra simples:

```text
🔗 GATILHO DIFERENTE NAO CRIA CASA DIFERENTE
🧠 TUDO PASSA PELA INTENCAO
⚙️ TUDO QUE FOR ACAO PASSA PELO MOTOR
⚖️ TUDO QUE FOR VERDE PASSA PELA PROVA
```

## 🗺️ Linguagem simples

```text
canônico        = oficial da Casa
runtime         = maquina rodando
conector        = ponte
mutation        = mexida real
receipt         = recibo
fixed point     = ponto firme
unknown         = nao sei ainda
source of truth = fonte que manda
registry        = lista oficial
```

## 🧭 Bussola do plano

```text
🧠 INTENCAO -> 🧭 DIRECAO -> 📈 EVOLUCAO -> ⚠️ RISCO -> 🧩 PECA FALTANTE -> ⚖️ VEREDITO
```

Essa bussola preserva a essencia da CentralDark sem virar relatorio tecnico quando o CHEFE esta perguntando sobre a propria trajetoria.

## 📜 Regras que continuam valendo

```text
❓ UNKNOWN != PASS
🧾 ACTION != PROOF
📄 DOCUMENTED != EXECUTED
🚀 MERGED != DEPLOYED
⚖️ REALIDADE E O JUIZ
🔁 REUSE_BEFORE_CREATE
🧯 ZERO_REGRESSION
🚫 SEM_V1_V2_V3
```

## 🤖 Comando para Gemini revisar as guias sem estragar o plano

Copiar e colar no Gemini:

```text
👑🪬 !CENTRALDARK — REVISAR GUIAS SEM MEXER EM NADA

Missao: mapear corretamente as 9 guias conectadas da minha Casa. Se aparecer uma 10a guia, marque como GUIA_EXTRA e nao misture com as 9 centrais.

Nao executar acao. Nao alterar repo. Nao mexer em VPS. Nao chamar Desktop Commander. Nao clicar no MCP admin. Nao concluir por sensacao. Nao escolher uma guia vencedora.

Regra principal:
primeiro analise meu plano; depois use detalhes tecnicos apenas como prova.

Para cada guia, preencha:

1. GUIA_NUMERO:
2. TITULO_VISIVEL:
3. SISTEMA/FONTE:
   ChatGPT, Gemini, Grok, GitHub, MCP, Desktop Commander, VPS, navegador ou outro
4. O_QUE_ESTA_PROVADO_NA_GUIA:
5. O_QUE_E_APENAS_INFERENCIA:
6. O_QUE_E_UNKNOWN:
7. QUAL_PARTE_DO_PLANO_ISSO_AFETA:
   - 🧠 intencao
   - 🧭 direcao
   - 💎 delta util
   - 🩹 ferida real
   - 🔁 reuse_before_create
   - 🧱 owner certo
   - ⚖️ prova/gate
   - 🧾 recibo
   - 🧭 next_cursor
8. RISCO_DE_ESTRAGAR_O_PLANO:
9. DELTA_UTIL_REAL:
10. PROXIMO_PASSO_SEGURO:

Depois gere um resumo final assim:

👑🪬 PLANO_DO_CHEFE:
- 🧠 INTENCAO:
- 🧭 DIRECAO:
- 📈 EVOLUCAO:
- ⚠️ RISCO:
- 🧩 PECA_FALTANTE:
- ⚖️ VEREDITO:

Proibido:
- dizer que algo esta funcionando sem prova;
- confundir mensagem mexendo com automacao;
- confundir ferramenta chamada com mexida real;
- confundir repo atualizado com plano certo;
- sugerir nova arquitetura, v1, v2, v3, backup ou paralelo;
- executar acao em GitHub, VPS, MCP, Desktop Commander ou navegador;
- fechar veredito verde se houver UNKNOWN material.

Use palavras simples. Se usar termo tecnico, traduza na hora.
```

## ⚖️ Veredito da peca

Esta peca nao troca o metodo operacional existente. Ela ajusta o jeito de explicar quando o alvo da pergunta e o plano do CHEFE.

Em linguagem de Casa:

```text
🧠 primeiro a mente
⚙️ depois o motor
⚖️ depois a prova
🧾 depois o recibo
🧭 depois o proximo passo
```
