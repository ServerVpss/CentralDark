---
title: "VPS Main Pulse — prova viva"
status: "LIVE_PROBE"
date: 2026-09-28
---

# VPS Main Pulse — prova viva

Este arquivo é um probe benigno do trilho:

MAIN_PUSH
→ GitHub webhook de push
→ CentralDark-WebhookDeploy
→ /usr/local/sbin/centraldark-main-pulse
→ owner hermes
→ main-pinned-microdeploy.sh
→ restart/validação do CentralDark-Hermes
→ receipt local

Regras:
- UNKNOWN != PASS
- MERGED != DEPLOYED
- webhook é fast path
- systemd timer de 60s é catch-up
- arquivos fora dos owners conhecidos são enviados ao Hermes somente para classificação read-only.
