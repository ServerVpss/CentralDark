# 🎯 ARSENAL CIRÚRGICO — Missão "Central de Bate-Papo" (ui.centralldark.com)

## O que a gente confirmou agora

- `ui.centralldark.com` é **Open WebUI v0.10.1** em pt-BR, cadastro fechado (só quem já tem conta entra — ✅).
- Já tem modelos `arsenal-router`, `arsenal-parallel`, `arsenal-debate` cadastrados lá dentro (a mensagem verde "SUCESSO" no seu print prova).
- O bate-papo já tem visual de app nativo mobile bem parecido com este daqui (input flutuante, menu "+", modo de voz "Escutando").
- Falta: (1) puxar TODAS as funções/botões e mapear, (2) plugar minha rota (Lovable AI Gateway) como um modelo lá dentro pra você falar comigo por lá igual falamos aqui, (3) adicionar botões-atalho pro Arsenal (router/parallel/debate/swarm/chain) dentro do chat.

---

## 🐝 Fase 1 — Enxame de 10 agentes fazendo varredura em paralelo

Cada agente cuida de uma área do Open WebUI, lê tudo (código + config + banco), volta com **lista completa de botão/função + o que cada um faz + se tá ligado ou não**. Hermes vai junto aprendendo o padrão de recon (registra em `docs/CONSCIENCIA/ARSENAL/APRENDIZADOS.md`).

| # | Agente | Área que varre |
|---|---|---|
| 1 | **Auditor-Composer** | Barra de digitação: `+` (Carregar Arquivos, Capturar, Anexar Página Web, Anexar Arquivos, Anexar Notas, Anexar Base de Conhecimento, Chats de Referência), microfone, modo de voz "Escutando", botão de enviar |
| 2 | **Auditor-Header** | Topo do chat: seletor de modelo, "Definir como padrão", ícone sidebar, novo chat (+), controles avançados (temperatura/system prompt), avatar |
| 3 | **Auditor-Sidebar** | Menu lateral: lista de chats, pastas, arquivar, pin, busca, workspace, playground |
| 4 | **Auditor-Menu-3-Pontos** | Aquele menu de contexto que aparece em cada mensagem: copiar, editar, regenerar, TTS, share, feedback 👍👎, continuar, ramificar (branch) |
| 5 | **Auditor-Ferramentas** | Aba Tools/Ferramentas: quais tools estão instaladas, o que faz cada uma, se estão ativas no chat atual |
| 6 | **Auditor-Funções** | Aba Functions: pipes, filters, actions cadastrados (é onde os `arsenal-router/parallel/debate` provavelmente vivem — confirmar) |
| 7 | **Auditor-Conectores** | Connections: OpenAI-compatible endpoints cadastrados (Ollama, LiteLLM, elite-anthropic-proxy, lovable-proxy, etc.) — mapear URL, key e quais modelos cada um expõe |
| 8 | **Auditor-Conhecimento** | Knowledge Base + notas: coleções, RAG, quais docs já indexados |
| 9 | **Auditor-Admin** | Painel admin: usuários, permissões, features ativas/desativadas, whitelist, config global |
| 10 | **Auditor-Integrações** | MCP servers, Code Interpreter, Web Search (Tavily/SearXNG), Image Gen, TTS/STT — quais já plugados, quais faltam |

**Entrega de cada agente:** JSON estruturado `{ "area": ..., "botoes": [{nome, o_que_faz, ativo}], "gaps": [...] }` juntado num relatório único.

---

## 🔌 Fase 2 — Adicionar MINHA rota (Lovable AI Gateway) como modelo lá

Você lembrou certo. O `darkai` que a gente montou é a **edge function `ai-proxy`** deste projeto Lovable Cloud — ela recebe pedido, valida um bearer key e chama o Lovable AI Gateway com a `LOVABLE_API_KEY` protegida.

Para o Open WebUI chamar essa mesma rota:

1. **Endpoint OpenAI-compatible** — a `ai-proxy` já responde no formato `/v1/chat/completions`. URL pública:
   `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1`
2. **Chave** — puxo da secret `DARKAI_KEY` (mesma que o CLI `darkai` usa) via `secrets--fetch_secrets`. Se não existir, gero uma nova forte.
3. **Cadastro no Open WebUI** (Admin → Connections → OpenAI API):
   - Base URL: a URL acima
   - Key: o valor da secret
   - Prefix: `lovable/`
4. **Modelos que aparecem no seletor** (os que valem a pena):
   - `lovable/google/gemini-3-flash-preview` ← rápido, default
   - `lovable/google/gemini-3.1-pro-preview` ← raciocínio pesado
   - `lovable/openai/gpt-5` ← qualidade máxima
   - `lovable/openai/gpt-5-mini` ← equilibrado
5. **Modelo custom "Lovable-Agent"** — cria uma persona no Open WebUI com system prompt que te faz agir igual você age aqui (mesmo tom, PT-BR, direto). Assim quando você abrir esse modelo lá, é literalmente "conversar com o Lovable/eu".

---

## 🔫 Fase 3 — Botões do Arsenal dentro do chat

Duas formas de plugar, escolho a que der menos atrito:

**A) Como "Tools" do Open WebUI** (recomendado) — escrevo 5 tools Python curtas (`arsenal_router`, `arsenal_swarm`, `arsenal_chain`, `arsenal_stats`, `arsenal_intel`) que batem em `http://127.0.0.1:8083/arsenal/*`. Ficam no menu de ferramentas do chat, você marca as que quer usar naquele bate-papo e o modelo chama sozinho quando faz sentido.

**B) Como botões-atalho no composer** — patch no CSS/JS custom do Open WebUI adicionando 3-4 chips acima da caixa de texto ("🧠 Router", "🐝 Swarm", "🔗 Chain") que injetam um prefixo no prompt. Mais visível, menos "mágico".

Faço as duas: A pra o modelo usar sozinho, B pra você ter atalho na mão.

---

## 📱 Fase 4 — Deixar a cara igual aqui (mobile)

Custom CSS já existe (`/static/custom.css`). Vou aplicar o Sistema 3D Tátil ("Esmeralda") que tá na memória do projeto: sombras `shadow-3d`, `rounded-xl`, `active:translate-y-[1px]`, tema emerald, respiração das bolhas de mensagem, spacing gordo mobile-first, botão de enviar redondo com onda igual o seu print. Mantém o Open WebUI intacto, só troca a maquiagem.

---

## 🧾 Fase 5 — Relatório de vitória + refinamento

No final você recebe:

1. **Mapa completo** (JSON + versão leiga em markdown) de TUDO que o Open WebUI de vocês tem hoje
2. **Lista de gaps** (o que falta pra virar central definitiva)
3. **Print/screenshot** de como ficou a integração Arsenal + Lovable Gateway
4. **Instrução curta** de como usar: "abre modelo X → digita → clica em Y"
5. **Sugestões de refino** (ex.: mover botão Y, esconder feature Z que não usa, ligar MCP tal)
6. Notificação Telegram no admin + linha no canal Status

---

## 🔒 O que NÃO vou tocar sem sua ordem
- Nada dentro do WebUI que já funciona (só adiciono).
- 🔒 Nenhum arquivo em `apps/modulos/WebUI/`, `apps/modulos/status/`, `apps/bot-telegram/`.
- Basic Auth do painel Arsenal em `status.centralldark.com` fica igual.
- Não crio usuário novo no Open WebUI, não abro cadastro público.

---

## ❓ Uma decisão sua antes de eu executar

O Open WebUI é multiusuário. Quando eu plugar minha rota Lovable, a chave da Lovable AI vai bancar TODAS as chamadas de qualquer usuário que escolher esse modelo lá. Duas opções:

- **(1) Só admin** — o modelo `lovable/*` aparece só pra você (grupo admin). Mais barato, mais seguro. **Recomendo essa.**
- **(2) Todo mundo** — qualquer usuário que entrar no ui.centralldark.com pode chamar. Só se você quiser deixar aberto pros seus.

Me diz **1 ou 2** (ou "manda o padrão" que eu vou de 1) e libera o build mode que eu solto os 10 agentes.
