---
title: "Padrão complementar — links clicáveis SEGREDO/CHEFE"
status: "ATIVO_COMPLEMENTAR"
date: 2026-09-10
owner: "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
extends:
  - "docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
  - "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json"
intent_authority: "SEGREDO/CHEFE"
repository: "ServerVpss/CentralDark"
---

# 🔗 Padrão complementar — links clicáveis SEGREDO/CHEFE

## 🧠 Intenção do Chefe

Quando a Casa citar link, arquivo, recibo, PR, commit, pasta, Drive ou documento, o humano precisa conseguir clicar direto.

Este documento não substitui o padrão anterior. Ele só complementa a forma de entrega.

## Regra simples

- Link normal deve aparecer clicável com nome bonito.
- Recibo do GitHub deve aparecer com caminho e link clicável.
- Documento do Drive deve aparecer com nome e link clicável.
- Pasta do Drive deve aparecer com nome e link clicável quando o id/url foi medido.
- Prova de ferramenta deve vir com citação clicável quando disponível.
- Arquivo criado para o usuário deve vir com link direto quando houver caminho confirmado.
- Não jogar link cru perdido no texto quando puder mostrar com rótulo humano.

## Forma preferida

```text
🏛️ GitHub, recibo na main:
[abrir recibo NOME_DO_ARQUIVO](URL_MEDIDA) + citação/prova quando disponível

☁️ Google Drive, espelho criado:
[abrir espelho no Google Drive](URL_MEDIDA) + citação/prova quando disponível

📁 Pasta:
[abrir pasta NOME_DA_PASTA](URL_MEDIDA)
```

## O que não muda

- GitHub continua fonte oficial de código, decisões e recibos.
- Drive continua espelho humano.
- Obsidian/Screenpipe continuam memória e contexto, não juiz.
- Realidade continua julgando.
- Link clicável não é prova sozinho.
- Documento criado não é execução.
- Espelho no Drive não é fonte oficial acima da main.

## Tradução em linguagem da Casa

Antes:

```text
criei docs/RECEIPTS/arquivo.md
```

Agora:

```text
🏛️ GitHub:
[abrir recibo arquivo.md](url)
```

Antes:

```text
Drive: 1P-...
```

Agora:

```text
☁️ Drive:
[abrir espelho no Google Drive](url)
```

## Cadeado de prova

```text
CLICKABLE_LINK=USABILIDADE
CLICKABLE_LINK!=PROVA_SOZINHO
PROVA=tool/readback/commit/sha/log/teste
LINK_CRU=EVITAR
LINK_COM_NOME_HUMANO=PADRAO
PADRAO_ANTERIOR=preservado
ESTE_DOCUMENTO=COMPLEMENTO
```

## Ligação com gatilhos

Quando a resposta vier de `👑🪬 !CENTRALDARK`, `🔗 !># INTERLIGADOS`, `⭕ !AURÉOLA CANÔNICA`, `🧿 #ACORDAR` ou outros gatilhos da Casa, os links relevantes devem ser apresentados clicáveis no final ou no próprio trecho onde forem citados.

## Veredito

O padrão visual da Casa agora inclui links clicáveis como complemento obrigatório de usabilidade, sem perder o padrão anterior de prova, linguagem simples e realidade como juiz.
