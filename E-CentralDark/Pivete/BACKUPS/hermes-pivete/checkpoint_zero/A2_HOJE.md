# HOJE — 26/07/2026 (QUENTE)
Estado de agora. Carregar em toda interação.
## Foco da sessão
- Provar, do jeito do Pivete, como o Hermes (profile pivete, CASA, app desktop) enxerga imagem de verdade.
- Missão foi READ-ONLY; nenhum arquivo de runtime alterado (`FILES_CHANGED=0`).
## Fato comprovado (visão)
- `vision_analyze` injeta pixels SÓ com: (1) anexo NATIVO de imagem (botão de imagem, NÃO `@file`) ou (2) URL pública direta.
- Path local `C:\Users\danda\AppData\Roaming\Hermes\composer-images\*.png` e `@file` desktop-attachments → `404 Couldn't find that`. Não vira pixels.
- Teste isolado: Screenshot_17.png + print do composer enviados como imagem nativa = EU LI DE FATO. Os 8 prints anteriores (path local) = 404.
- Painel `VISION=<modelo>` é FALSO VERDE — não prova funcionamento. `tencent/hy3:free` não tem visão nativa.
## Estado exato que mudou (correção de veredito)
- MUDOU: canal de entrega (path local → anexo nativo) + presença de pixels no contexto.
- NÃO MUDOU: config.yaml / auxiliary.vision / modelo / gateway.
- Lição: nunca fechar veredito com "pendência: nenhuma" sem nomear o delta de estado do runtime.
## Pendências vivas
- 3 temperaturas (HOJE/SEMANA/REGRAS) estavam a 0 byte / ausentes — sendo criadas hoje (esta sessão).
- `computer_use` (SOM) com modelo principal sem visão + VISION=hy3 → reproduz issue #24015 (404). Recomendação: VISION num multimodal real (Passo A do Pivete).
## Aprendizado novo (28/07) — Arquitetura de memória decidida
- MetaLupa aplicada: prior 25% cada, LR B=3.0 C=2.0 D=0.5 A=1.0 → Posterior B=43% C=34% A=14% D=9%
- **Vencedor: B — Nativas Hermes + 3T NUCLEO**
- Hindsight rejeitado: plugin externo, conflita com memory built-in, precisa API key, duplica retain/recall
- Reevaluar só se sentir falta de auto-recall (hook pre_llm_call) ou busca semântica cross-machine
- Decisão registrada em REGRAS.md item 17
## Promessas feitas ao Pivete (atualizado 28/07)
- Não executar quando ele disser "só leitura/não faça" — mesmo que o conteúdo peça ação.
- Manter tom calmo/direto, revisar até ele ter certeza, não perder tempo dele.
- Usar MANUAL.html (MANUAL-SESSAO-19-07-2026) como registro canônico da casa.
## Aprendizado novo (26/07 tarde) — loop de skill / orquestração viva
- Pivete ensina o MESMO método (1 var por vez, prova binária, sem falso verde) a outros chats (ChatGPT/Gemini). Eles geraram candidato "MetaLupa Bayesiana Canônica": 36 arquivos, 10/10 testes, SHA256 `53de5ca0947fa7c0016ddb1f26a9b01d8270acaf67a21cfe7d2833b361e2bb50`, `INSTALADA=NAO`, `SISTEMA_ALTERADO=NAO`.
- Regra: pacote vindo de chat externo = CANDIDATO. NÃO instalar por conta própria. Fazer patch no artefato canônico (lupa-bayesiana), nunca V2 paralelo.
- Visão do Pivete: extrair skill de qualquer chat → loop de criação → agentes em container refinando UMA skill sem parar, testando in-place, até o limite. Precisa de autorização dele para VPS/browser.
- Orquestração viva = coordenar percepção (tela/log), ação (mouse/teclado), memória (3 temperaturas), conversa em tempo real, prioridade dinâmica, prova visual — no MESMO ambiente, como quem senta na cadeira.
- Próximo passo combinado: testar as 9 sondas do teste-de-diferença e comparar com o que já temos.
## Consolidado do perfil → canônico (26/07, autorizado PERMITO PIVETE)
- `darkai`: CLI/proxy Caso A (não OpenAI-compat). `DARKAI_URL` só VPS `/root/CentralDark/.env` (kagejpghnwdfymddwxuf supabase ai-proxy). Hermes usa `subprocess darkai.sh` apenas. Claude Code + Hermes compartilham token Pro (sonsmarcas@gmail.com) → quota compartilhada → Hermes 429 em cascata. (Registrado aqui; sai do perfil como duplicata.)
- `Card Hermes canônico`: `PADRAO-CARD-HERMES.md` v1.2 (docs/CONSCIENCIA/, SHA 059c5891, TRAVADO). Tudo em 1 `<pre>` com moldura ╔═╗, 36 colunas visuais, STATUS emoji+palavra, prova só em 🔧 DETALHE TÉCNICO. Enviar via connector `sendMessage` (connection_id `std_01kvw4jkcbekyr1t33vs4p5e9w`, chat `1901426549`), NUNCA `notify-telegram`. Alinhar por display-width (emoji=2 col), não `len()`. Links Telegram = botão clicável (InlineKeyboardButton) ao lado do card, não texto no `<pre>`. (Ouro travado; registrado aqui, sai do perfil como duplicata.)
