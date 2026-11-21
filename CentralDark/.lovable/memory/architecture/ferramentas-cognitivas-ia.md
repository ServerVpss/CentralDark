---
name: Ferramentas Cognitivas da IA
description: Regras de uso das 3 ferramentas cognitivas (browse_page, code_execution, conversation_search) no CentralDark
type: preference
---

Três ferramentas cognitivas estão disponíveis pras IAs que operam no CentralDark. Usar proativamente, sem pedir permissão a cada vez.

**browse_page** — ler direto qualquer página (Notion, GitHub, Mega Painel, status pages, links externos).
- Antes de pedir pro usuário copiar texto de um link → tentar `browse_page`.
- Quando NÃO: páginas atrás de login sem sessão; aí pedir export ou usar conector.

**code_execution** — rodar Python pra análise em massa de `.md`, detecção de duplicatas, comparação, organização.
- Antes de abrir 20+ arquivos manualmente → usar `code_execution`.
- Quando NÃO: mudança destrutiva sem aprovação.

**conversation_search** — buscar em conversas antigas por significado, não por palavra exata.
- Antes de dizer "não me lembro" / "não tenho contexto" → tentar `conversation_search`.
- Quando NÃO: contexto já foi trazido na mensagem atual; ou precisa de fonte oficial (aí vai pro Notion/cerebro).

**Por quê:** o usuário é não-técnico e não quer perder tempo copiando texto, abrindo links ou repetindo o que já decidiu. Essas ferramentas existem pra isso.

**Como aplicar:** antes de qualquer "preciso que você me mande X" ou "não sei Y", checar se uma dessas 3 resolve sozinha.
