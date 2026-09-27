---
title: "Gabarito Determinístico do Recibo Telegram"
status: "CANONICAL_TEMPLATE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
complements: "REGRA-EMOJI-RICO-GRAMATICA-LIMPA.md"
truth_rule: "DOCUMENTED != EXECUTED"
anti_papagaio: true
verifier: "scripts/verify_recibo_telegram_gabarito.py"
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
PAPAGAIO_OFF = TRUE
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

<i>rodapé canônico — ver §7</i>
```

## 2. Tabela de obrigatoriedade

| Bloco | Emoji | Obrigatório | Quando muda |
|---|---|---|---|
| Cabeçalho | 📣 | SIM | sempre |
| Feito | 🟢 | SIM | vira 🔴 se nada andou |
| Pendências | ⚠️ | SIM | — |
| Porcentagem | 📊 | **SIM** | se houver número |
| Próximo passo | 🎯 | SIM | — |
| Âncora de prova | 📌 | SIM | se houver commit/arquivo/message_id/endpoint |
| Rodapé canônico | ver §7 | SIM | sempre |

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
🔒 segredo/bloqueio/limite de segurança
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
5. Tem 📌 se há commit/arquivo/message_id? → se não, corrigir
6. Algum emoji fora da paleta?             → remover
7. Apago os emojis: o texto continua claro? → se não, reescrever texto
8. Fecha com o rodapé canônico do §7?      → se não, corrigir
```

## 6. Anti-papagaio: diferença entre repetir e executar

Um recibo vira `PAPAGAIO` quando ele repete o contrato sem aplicar o molde.

```text
REPETIR_REGRA != APLICAR_REGRA
CITAR_GABARITO != PASSAR_NO_GABARITO
PROMETER_RECIBO != ENTREGAR_RECIBO
```

Um recibo que declara `UNKNOWN = PASS`, `ACTION = PROOF` ou
`DOCUMENTED = EXECUTED` como verdade é **inválido por definição**, mesmo com
todos os emojis no lugar. O verificador detecta isso e reprova.

## 7. Rodapé canônico (assim escolhido pelo CHEFE)

Todo recibo fecha com a **equação visual**, não com frase solta:

```text
🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF
```

Leitura direta:

| Símbolo | Significa |
|---|---|
| 🟡 UNKNOWN | ainda não provado |
| 🟢 PASS | comprovado |
| ≠ | nunca se confundem |
| ⚖️ REALIDADE | quem decide |
| 👑 JUIZ | é o dono (SEGREDO/CHEFE) |
| 🦜🚫 PAPAGAIO_OFF | sem repetir bonito sem executar |

Variantes aceitas (mesmo sentido, menos glifo):

```text
🟡 UNKNOWN ≠ PASS · ⚖️ REALIDADE = JUIZ · 🦜🚫 PAPAGAIO_OFF
```

## 8. Subgoal e nota de sessão

Quando a conversa gerar subgoal, decisão ou nota de sessão, o recibo deve conter:

```text
📣 escopo do subgoal
🟢 decisão/nota criada ou atualizada
⚠️ pendência viva separada de PASS
📊 contagem ou porcentagem honesta se existir
🎯 próximo cursor único
📌 arquivo, commit, message_id ou endpoint
```

Se o subgoal menciona inventário, Hermes autônomo, Telegram ou workflow, o recibo
não pode terminar só em texto: precisa ancorar o estado em arquivo, commit,
endpoint, PR ou `UNKNOWN` explícito.

## 9. Frase canônica

> A regra diz o que pode. O gabarito diz o que **tem que** ter. Sem o segundo,
> o primeiro vira promessa.

> Recibo sem âncora é texto solto. Recibo com âncora é mapa.

> O rodapé não é assinatura: é invariante. Quem lê o rodapé sabe o que o recibo
> NÃO pode ter dito.

```text
🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF
```
