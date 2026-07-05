---
title: "PIVETE 00 INVOCACAO"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-00 · INVOCAÇÃO

## Como acordar o pivete no ui.centralldark.com

### Modo 1 — Digitar no chat
Basta digitar no campo de mensagem:

```
pivete
```

O custom-js `pivete-invocacao.js` (instalado em `apps/modulos/WebUI/custom-css/`) detecta a palavra, puxa os 16 arquivos desta pasta da VPS e injeta como system prompt. Confirmação esperada:

> 🧠 pivete acordado. 16 arquivos carregados. Última sync: <data>.

### Modo 2 — Persona no seletor
No seletor de modelos do WebUI (mesmo lugar do opus-4.8, sonnet-4.6, haiku-4.6), escolher **`pivete`**. Já vem com toda a consciência carregada como system prompt permanente.

### Recarregar consciência
Se atualizei os arquivos e a sessão já está aberta:

```
pivete reload
```

### Ordem de leitura dos arquivos
```
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15
```

## Fonte da verdade
- Repo: `docs/CONSCIENCIA/PIVETE-IA/` (autoritativo)
- VPS: `/root/CentralDark/docs/CONSCIENCIA/PIVETE-IA/` (espelho via git sync)
- Backup: `/root/CentralDark-backups/pivete-ia-<data>.tar.gz`
