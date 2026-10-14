---
title: "🧾 Rastro multimodal — CentralDark"
status: "VISUAL_EVIDENCE_INDEXED_RUNTIME_UNVERIFIED"
date: "2026-10-14"
updated: "2026-10-14"
owner: "docs/CONSCIENCIA/RECEIPTS/CENTRALDARK-MULTIMODAL-TRACE.md"
truth_scope: "USER_PROVIDED_MEDIA_PROVENANCE_ONLY"
canonical: false
tags: [centraldark, multimodal, video, frames, imagens, sha256, rastro, hermes]
related: ["[[MAPA-DO-CEREBRO]]", "[[APRENDIZADOS]]", "[[PADRAO-GRAFO-VIVO-MARKDOWN]]"]
links:
  - "docs/CONSCIENCIA/APRENDIZADOS/CAPABILITY-CRISTAL-20260913/14-PREVIOUS-WORK/VIDEO-CRISTAL-BASE/03-TUTORIAL/TUTORIAL-OPERACIONAL.md"
  - "docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md"
  - "docs/CONSCIENCIA/APRENDIZADOS.md"
  - "AGENTS.md"
---

# 🧾 Rastro multimodal indexado — um organismo

## 🎯 Intenção recebida
O CHEFE forneceu 19 fotografias e um vídeo de 57,21 segundos; determinou extrair cada quadro, indexar metadados e registrar descobertas para o mesmo Hermes/CentralDark sem criar outra arquitetura. Fonte: material da conversa de 2026-10-14.

## 📸 Origem e hashes verificáveis

- MOV original: `E5E21D04-EDB5-4027-AFAA-7DC72EDBB855.mov`
- SHA-256 original: `2109381c75a5ddb526143fe12af54dd0704ddb221f9d0daabfa22f81ac5f1fb9`
- Tamanho original: `108382578` bytes; 1080 × 1920; duração `57.210` s.
- Frames de vídeo extraídos: **1715 de 1715**, do PTS `0.000` ao `57.176667`, JPEG alta qualidade com perda; **1715 hashes SHA-256 distintos**.
- Fotografias anexas indexadas: **19 de 19**, hash e dimensão por foto; zero duplicatas binárias exatas.
- Hash SHA-256 de `QUADROS_INDEX.md` (1715 linhas de quadro): `673894fa1b389e4c891b8807f45d65e57d8c36b2494ff2bebb1d32e7ad9b4b49`.
- Hash SHA-256 de `IMAGENS_INDEX.md`: `c5c99405a9c67f6d350393868bb44dc77db54b389b9df48e6cce8355486c5596`.
- Hash do pacote de índices `CENTRALDARK_RASTRO_INDICES.zip`: `9f0fd8af9cbebaa869b5fc6ac865b72b42339d826badf7ebf4f21ba8d74fb362`.
- Hash do pacote de todos os frames e fotos `CENTRALDARK_FRAMES_COMPLETOS.zip`: `d47fed006f91de521cb83295977609b35881ab36cb937e503a4ec97b5f145472`.
- Pacotes gerados como **artefatos de conversa**, não afirmados presentes no repositório/VPS/Obsidian. Quadros e índices binários **não foram enviados à main**.

## 🔍 Observações extraídas, com fronteira de prova

| Família observada | Evidência visual | Estado |
|---|---|---|
| Uma intenção e múltiplas superfícies | Vídeo, 0–12 s: diagrama, apontamentos e navegação | OBSERVED_SCREEN |
| IDE, mensagens, cockpit e Instinto Superior | Vídeo, 12–35 s: transição entre telas | OBSERVED_SCREEN |
| Cartazes, script único, conversas e interface de comando | Vídeo, 35–57 s | OBSERVED_SCREEN |
| HUD Casa ↔ VPS, Tailscale, logs e Screenpipe | Fotografias `IMG_7213/7214/7215` | OBSERVED_SCREEN |
| Erro de autenticação interativa MCP/OAuth | Fotografia `IMG_7212`: `OAuthNonInteractiveError` na janela Hermes | OBSERVED_LOG_NOT_REPRODUCED |
| Integração visual Admin/Cofre (ADM) | Fotografias `IMG_7150/7151`: `UNKNOWN`, `FAIL`, `AUTH_REQUIRED` e erro da tabela `public.modulos_portal` | OBSERVED_SCREEN |
| Critérios de intenção/Kaizen/Oracle/28 peças/C01–C20 | Fotografias `IMG_7152/7153/7154/7155/7157` | OBSERVED_SCREEN |
| GitHub Actions, emails e multiabas | Fotografias `IMG_7156/7207/7208/7209` | OBSERVED_SCREEN |

**Nenhuma fotografia ou frame prova sozinho** saúde atual de serviço, login, conexão, publicação, deploy, CI ou relógio de billing. `UNKNOWN != PASS`. Texto parcialmente ilegível não foi convertido em transcrição exata.

## 🧠 Reuso do owner já existente

A receita de vídeo já está documentada em `docs/CONSCIENCIA/APRENDIZADOS/CAPABILITY-CRISTAL-20260913/14-PREVIOUS-WORK/VIDEO-CRISTAL-BASE/03-TUTORIAL/TUTORIAL-OPERACIONAL.md`:
`source video → SHA-256 → frame → timestamp → frame SHA-256 → semantic tags → trace/evidence → graph/Obsidian projection`.

Este arquivo é apenas **receipt de uma captura**, não motor, pipeline, skill, writer ou cérebro novo. Nenhum código, configuração, runtime, schema ou autorização mudou.

## ⚖️ Contraprova

```text
SOURCE_VIDEO_HASH=PASS_LOCAL
FRAME_COUNT=1715/1715_PASS_LOCAL
FRAME_TIMESTAMPS=PASS_LOCAL
IMAGE_HASH_COUNT=19/19_PASS_LOCAL
BINARY_EXACT_DUPLICATES_IN_PHOTOS=0
AUDIO_TRANSCRIPTION=NOT_PERFORMED
OCR_EXACT_TEXT=NOT_PERFORMED
CURRENT_RUNTIME=UNKNOWN
BINARY_PACKAGES_IN_REPO=FALSE
DOCUMENTED != EXECUTED
```

## 🧭 NEXT_CURSOR

`SOURCE_SHA256 → FRAME_ID/TIMESTAMP → IMAGE_HASH → OWNER_EXISTENTE → RECHECK_CURRENT → CONTRAPROVA → DELTA_MINIMO → RECEIPT`.

Recuperar, quando necessário, o arquivo MOV original e os índices do pacote da conversa pelo SHA descrito acima, sem declarar o ZIP publicado em GitHub. O próximo registro desta mesma evidência deve atualizar este owner, nunca criar uma família V2/V3.
