---
title: "Gabarito Determinístico do Recibo Telegram"
status: "CANONICAL_TEMPLATE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
complements: "REGRA-EMOJI-RICO-GRAMATICA-LIMPA.md"
truth_rule: "DOCUMENTED != EXECUTED"
---

# Gabarito Determinístico do Recibo Telegram

## 0. Por que este arquivo existe

A `REGRA-EMOJI-RICO-GRAMATICA-LIMPA.md` define a paleta. Mesmo assim, um recibo
saiu com **apenas o 📣 no cabeçalho** e o corpo limpo de âncoras — exatamente o
que a regra proíbe. A regra estava certa; a execução falhou.

Regra que depende de memória quebra. Este gabarito fecha a lacuna: **não é
instrução, é modelo com slot fixo.** Cada bloco tem emoji obrigatório; quem
preenche não escolhe, só coloca o texto.

```text
DOCUMENTED != EXECUTED
REGRA_SEM_GABARITO = REGRA_QUE_ESQUECE
```

## 1. O molde — blocos fixos, emoji fixo

```text
📣 <TÍTULO> · <linha de escopo>

🟢 <O QUE ANDOU / FEITO>
   <linha limpa, sem emoji>
   <linha limpa, sem emoji>

⚠️ <PENDÊNCIAS ABERTAS>
   <linha limpa, sem emoji>

📊 <PORCENTAGEM HONESTA>
   <valor>% <o que>

🎯 <PRÓXIMO PASSO>
   1. <ação>

📌 <commit / arquivo / message_id>

<i>UNKNOWN != PASS · REALIDADE = JUIZ</i>
```

## 2. Tabela de obrigatoriedade

| Bloco | Emoji | Obrigatório | Quando muda |
|---|---|---|---|
| Cabeçalho | 📣 | SIM | sempre |
| Feito | 🟢 | SIM | vira 🔴 se nada andou |
| Pendências | ⚠️ | SIM | — |
| Porcentagem | 📊 | **SIM** | se houver número |
| Próximo passo | 🎯 | SIM | — |
| Âncora de prova | 📌 | SIM | se houver commit/arquivo |
| Rodapé | 🧾 ou itálico | SIM | — |

**Bloco sem o emoji certo = recibo inválido.** Não existe "saiu sem" — existe
"saiu errado".

## 3. Emojis de estado dentro dos blocos

Quando o bloco tiver itens, o emoji de estado entra **no item**, não no bloco:

```text
✅ item que passou
❌ item que falhou
🔴 risco material
⚠️  armadilha possível
🔎 o que foi medido
💎 achado novo
🔄 divergência entre fontes
⚖️ contraprova aplicada
```

Dentro dos blocos de **Feito** e **Pendência**, cada item pode carregar seu próprio
estado. Fora deles, o emoji é do bloco.

## 4. Casos especiais

- **Nada andou:** o bloco do topo vira `🔴 NADA ANDOU`, não fica vazio.
- **Bloqueio:** vira `🔒 BLOQUEIO` com o motivo em linha limpa.
- **Segredo:** nunca aparece valor. Se o recibo toca em credencial, usa
  `🔒 SECRET_BOUNDARY` e diz só o nome da chave.
- **Recibo curto (1 assunto):** pode reduzir a 📣 + 🟢/🔴 + 🎯. **📊 e 📌 só caem
  se não houver número nem prova** — e se não houver, é sinal de recibo fraco.

## 5. Teste antes de enviar

```text
1. Tem 📣 no cabeçalho?                    → se não, corrigir
2. Tem emoji de estado no bloco principal? → se não, corrigir
3. Tem 📊 se há número?                    → se não, corrigir
4. Tem 🎯 no fecho?                        → se não, corrigir
5. Tem 📌 se há commit/arquivo?            → se não, corrigir
6. Algum emoji fora da paleta?             → remover
7. Apago os emojis: o texto continua claro? → se não, reescrever texto
```

## 6. Frase canônica

> A regra diz o que pode. O gabarito diz o que **tem que** ter. Sem o segundo,
> o primeiro vira promessa.

> Recibo sem âncora é texto solto. Recibo com âncora é mapa.
