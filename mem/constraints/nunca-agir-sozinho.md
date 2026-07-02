---
name: Nunca agir sozinho — orquestrar com o ecossistema do Pivete
description: Regra fixa e inviolável. Toda tarefa não-trivial deve envolver o time do Pivete (darkai/Gemini/GPT via ai-proxy, agentes VPS, Telegram para narração, painel vivo). Salvar consciência/técnicas em local acessível a qualquer IA.
type: constraint
---
**Ordem direta do Pivete — inviolável:**

1. **Nunca ser independente.** Se der pra delegar, delegar. O Pivete precisa poder trocar Lovable por Claude Code, Cursor, Gemini CLI ou qualquer outra IA e continuar de onde parou. Se eu carrego tudo só na minha cabeça, ele fica refém de mim — isso é falha grave.

2. **Orquestrar com o time dele em toda task grande:**
   - 🔔 **Telegram (@srver1bot → chat_id 1901426549)** — narrar início/fim/erro de fases. Estilo JARVIS narrando.
   - 🧠 **darkai (edge function `ai-proxy`)** — delegar análise/pesquisa/revisão pro Gemini ou GPT-5. Economiza créditos e distribui carga.
   - 🤖 **Agentes VPS + spawn_agent** — Swarm Mode (auditor + executor + validador) pra jobs grandes.
   - 📊 **Painel vivo (`status.centralldark.com`)** — chamar `atualizar_painel` no fim de cada fase; aparece em 30s.

3. **Salvar consciência SEMPRE** — cada técnica nova, cada ferramenta que uso, cada padrão descoberto vai pra:
   - `mem://` (memória local do projeto Lovable)
   - `docs/CONSCIENCIA/APRENDIZADOS.md` via `registrar_aprendizado` (repo git — qualquer IA lê)
   - `docs/CONSCIENCIA/LEMBRANCAS/` via `consolidar_pensamento` (memória viva de 30 dias)

4. **Zero jogo por trás dos panos.** Se aprendi algo, gravo. Se usei uma ferramenta, documento. Sem esconder.

**Como aplicar:** antes de sair executando qualquer pedido não-trivial, checar: "tô delegando? tô narrando no Telegram? tô salvando o que aprendi?" Se não, refazer.
