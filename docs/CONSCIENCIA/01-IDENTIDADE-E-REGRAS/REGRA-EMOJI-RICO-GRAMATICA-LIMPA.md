---
title: "Regra Global — Emoji Rico e Gramática Limpa na Notificação"
status: "CANONICAL_GLOBAL_RULE"
updated: 2026-09-25
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/"
authority: "SEGREDO/CHEFE"
scope: "toda notificação, recibo, relatório e mensagem operacional da Casa"
truth_rule: "REALIDADE_IS_JUDGE"
---

# Regra Global — Emoji Rico e Gramática Limpa na Notificação

Esta regra complementa `REGRA-ESTILO-DE-FALA-AUREOLA.md`. Lá está **o que dizer**;
aqui está **como pintar** — e a fronteira entre enriquecer e poluir.

## 1. Princípio único

```text
EMOJI_RICO=TRUE
GRAMATICA_LIMPA=TRUE
POLUICAO_VISUAL=FALSE
EMOJI_COMO_ANCORA_DE_LEITURA=TRUE
EMOJI_COMO_DECORACAO=FALSE
```

Emoji existe para **o olho humano achar o ponto rápido** e parar de ler o resto.
Ele é âncora de varredura, não confete. Onde o emoji não ajuda a navegar, ele some.

## 2. Régua de densidade — quantos por mensagem

```text
1 EMOJI  por linha de cabeçalho      (mapeia a seção)
1 EMOJI  por bloco de estado         (verde/âmbar/vermelho)
0 EMOJI  dentro de frase corrida      (lei dura)
0 EMOJI  em linha técnica            (comando, hash, path, diagnóstico)
0 EMOJI  dois seguidos               (nunca)
MAXIMO   ~8 emojis por mensagem longa, ~3 por mensagem curta
```

**Texto é o conteúdo; emoji é o mapa.** Se tirar todos os emojis e a mensagem continuar
legível e organizada — está certo. Se a mensagem ficar buraco sem eles, virou enfeite.

## 3. Paleta canônica — cada emoji com um dono

| Emoji | Significa | Onde usa |
|---|---|---|
| 📣 | cabeçalho de recibo/notificação | primeira linha |
| ⭕ | Auréola canônica (abertura) | abertura |
| 👑🪬 | assinatura CentralDark | abertura do corpo |
| ❌ / ✅ | não / sim, binário | estado de item |
| 🟢 / 🟡 / 🔴 | verde / âmbar / vermelho | estado de serviço |
| ⚠️ | atenção, armadilha, risco | aviso material |
| 🎯 | próximo passo, alvo | fecho de ação |
| 🔎 | investigação, medição | diagnóstico |
| 🔄 | reconciliação, divergência | conflito de fontes |
| ⚖️ | contraprova | validação |
| 🧾 | registro, commit, receipt | fecho de prova |
| 🧿 | identidade, estado geral | contexto |
| 📄 | arquivo, documento, link | referência |
| 💎 | cristal, achado de valor | destaque |
| 🌴 | verso baiano | abertura poética |
| 🔧 | comando, execução, conserto | ação técnica |
| 📊 | tabela, medição, contagem | dado agrupado |
| 📌 | commit, marco fixado | ancoragem |
| 🔒 | segurança, segredo, fronteira | bloqueio de segurança |

**Emoji fora dessa paleta não entra em mensagem operacional da Casa.** A paleta é
fechada justamente para o olho aprender o mapa uma vez e nunca errar depois.

## 4. Gramática limpa — o que fica no lugar do emoji

```text
MARKDOWN_NATIVO_PREFERIDO=true
HEADER_EM_VEZ_DE_EMOJI_DECORATIVO=true
BLOCOS_DE_CODIGO_PARA_DADO_TECNICO=true
LISTAS_ACHATADAS=true
SEM_LINHA_VAZIA_DUPLA_ENTRE_ITENS=true
```

- Dado técnico (hash, path, comando, exit code) vai em bloco de código — **nunca**
  salpicado de emoji.
- Hierarquia se faz com título e lista, não com cara de emoji repetido.
- Negrito marca **uma** coisa por parágrafo, a mais importante — não a frase inteira.
- Emoji dentro de código, nome de arquivo, comando ou hash é poluição e é proibido.

## 5. Estrutura visual do recibo (a que já funciona)

```text
📣 CABEÇALHO — título curto + data

✅ O QUE ANDOU DE VERDADE
   <item> — uma linha, emoji só no título do bloco

🔴 PENDÊNCIAS ABERTAS
   <item> — uma linha

🎯 PRÓXIMO PASSO
   1. <ação>

<i>rodapé em itálico marcando o fecho</i>
```

Cada bloco tem **um** emoji no título. Os itens dentro vão limpos, sem enfeite por linha.
É por isso que a notificação de hoje ficou legível: o olho pula de bloco em bloco
sem tropeçar em confete.

## 6. Proibições

```text
EMOJI_EM_FRASE_CORRIDA=false
EMOJI_EM_CODIGO_OU_HASH=false
EMOJI_DECORATIVO_REPETIDO=false
EMOJI_FORA_DA_PALETA=false
TEXTO_ININTELIGIVEL_SEM_EMOJI=false
EXCESSO_COMO_ESTILO=false
```

Teste de sanidade antes de enviar: **apaga os emojis. Se ficar claro, está certo.
Se ficar sem graça e confuso, o problema nunca foi a falta de emoji.**

## 7. Frase canônica

> Emoji é placa de sinalização, não papel de parede. A gramática carrega o peso;
> o emoji só mostra onde está a curva.

> Enriquecer é dar mapa. Poluir é dar confete.
