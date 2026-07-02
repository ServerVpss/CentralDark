
# Plano — Pacote DARKAI Completo (Tutorial + Imagens + Terminal)

Vou transformar `docs/CONSCIENCIA/DARKAI/` num **kit completo de aprendizado** (tipo mini-curso), gerar imagens ilustrativas com IA, adicionar suporte pro seu terminal local (não só VPS), re-zipar tudo e deixar cópia na VPS.

## 1. Novos documentos (tutorial estilo curso, linguagem leiga)

Dentro de `docs/CONSCIENCIA/DARKAI/`:

- `00-COMECE-AQUI.md` — índice do curso, ordem de leitura, o que é cada arquivo
- `01-O-QUE-E-DARKAI.md` — explicação leiga com analogia (telefone central inteligente), o que resolve
- `02-COMO-FUNCIONA-POR-DENTRO.md` — fluxo: você → darkai → edge `ai-proxy` → Lovable AI → modelo → resposta (com diagrama)
- `03-CATALOGO-DE-MODELOS.md` — lista completa dos modelos disponíveis (Gemini 3 Flash, Gemini 2.5 Pro, GPT-5, GPT-5.4, GPT-5.5, etc.), quando usar cada um, custo relativo, velocidade
- `04-USANDO-NO-TERMINAL-LOCAL.md` — como instalar `darkai` no seu Mac/Linux/Windows local (não só VPS)
- `05-USANDO-NA-VPS.md` — versão atualizada do install VPS
- `06-ENSINANDO-OUTRAS-IAS.md` — prompt pronto pra colar em Claude Code, Cursor, ChatGPT, etc. ensinando eles a usar `darkai`
- `07-EXEMPLOS-PRATICOS.md` — 15+ exemplos reais (resumir log, gerar script, classificar erro, traduzir, revisar código, gerar commit message, etc.)
- `08-TECNICAS-QUE-USO.md` — minhas técnicas: sub-agentes/swarm, ferramentas cognitivas, orquestração paralela, método gamificado, fallback de secrets, execução defensiva
- `09-ARQUITETURA-E-ORQUESTRACAO.md` — como organizo trabalho (Sincronia 4-Point, Cérebro Vivo, áreas protegidas, plan mode vs build mode)
- `10-TROUBLESHOOTING.md` — erros comuns (429, 402, 401, timeout) e como resolver

## 2. Imagens geradas com IA (usando `imagegen--generate_image`)

Vou gerar 6 imagens ilustrativas e salvar em `docs/CONSCIENCIA/DARKAI/imagens/`:

1. `01-visao-geral.png` — diagrama do fluxo VPS → Edge → Modelos IA
2. `02-arquitetura-tecnica.png` — versão técnica com componentes
3. `03-darkai-terminal.png` — mockup do CLI rodando no terminal
4. `04-catalogo-modelos.png` — visualização dos modelos disponíveis
5. `05-uma-chave-infinitas-possibilidades.png` — imagem conceitual do benefício
6. `06-orquestracao-sub-agentes.png` — como sub-agentes trabalham em paralelo

Estilo inspirado na imagem que você mandou (fundo escuro, neon roxo/ciano/verde).

## 3. Suporte pro terminal local

- Atualizar `darkai.sh` pra funcionar em Mac/Linux/Windows(WSL)
- Adicionar flag `--list-models` pra listar modelos disponíveis
- Adicionar flag `--help` completo em PT-BR
- Criar `instalar-local.sh` (Mac/Linux) e `instalar-windows.ps1` (PowerShell)
- Instruções pra colocar em `~/.local/bin/darkai` (local) OU `/usr/local/bin/darkai` (VPS)

## 4. Empacotamento e entrega

- Gerar novo `/mnt/documents/DARKAI-COMPLETO.zip` com tudo (docs + imagens + scripts)
- Copiar zip pra VPS via `mcp_custom_FNKF0--execute_command` em `/root/CentralDark/DARKAI-COMPLETO.zip` pra você pegar direto de lá também
- Manter `CREDENCIAIS-TEMP.env` no zip até você confirmar "peguei"

## 5. Detalhes técnicos

- Imagens: modelo `premium` (tem texto legível nos diagramas)
- Scripts terminal: bash puro + fallback Python pra parse JSON (sem depender de `jq`)
- Docs em Markdown puro, sem HTML, pra funcionar em qualquer editor/leitor
- Cada doc começa com "📖 Pra quem é este arquivo" e "⏱️ Tempo de leitura"

## O que NÃO vou mexer

- `supabase/functions/ai-proxy/index.ts` já tá funcionando — não toco
- Edge functions do `graph-mapper` — intocadas
- Áreas protegidas do CLAUDE.md — intocadas

Posso começar?
