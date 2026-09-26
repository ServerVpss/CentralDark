---
title: "Snapshot local — APPCENTRALDARK EVOLUIR"
status: "REFERENCE_ONLY_CLEAN_ROOM"
sha256: "378848b430f182bc54b48839e2eef09c20220aaa7ee7c8d9bb725283490de009"
size_bytes: 57640977
entries: 11360
---

# Referência local para a SOL

O pacote fornecido pelo 👑 SEGREDO/CHEFE contém uma instalação/distribuição do Overclock com:

- executável desktop e sidecar Node;
- integração Tauri;
- PTY/panes e sessões visíveis;
- Claude, Codex e Gemini;
- MCP, catálogo, missões, squads e cron;
- `JarvisService`, `JarvisMemory`, `JarvisWakeLock` e `jarvisLivePrompt`;
- roteamento de voz/NLU e sessão live;
- watchers de transcript;
- ponte remota e preview server;
- observação, screenshots e QA visual;
- playbooks de QA swarm, squad former, cinema e site builder;
- banco e estado local em `.overclock-app`.

## Regra

O pacote é evidência funcional e referência de arquitetura. Não foi importado literalmente porque:

1. contém binários, dependências e estado local;
2. o snapshot não expõe licença raiz suficiente para autorizar redistribuição integral;
3. a primeira implementação da SOL deve ser clean-room e subordinada ao cânone CentralDark;
4. secrets, sessões e bancos locais não podem entrar no Git.

A cooperação com o autor pode liberar integração formal ou upstream futuro. Até lá, preservar hash, origem e mapa funcional.
