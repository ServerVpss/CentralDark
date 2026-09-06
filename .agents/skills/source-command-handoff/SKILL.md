---
name: "source-command-handoff"
description: "Gera um prompt enxuto pra retomar esta sessão numa conversa nova sem perder contexto"
---

# source-command-handoff

Use this skill when the user asks to run the migrated source command `handoff`.

## Command Template

Gere um prompt de handoff pra eu colar numa sessão nova e continuar exatamente de onde paramos, sem precisar reexplicar nada.

Inclua, nesta ordem:
1. **O que foi decidido** — decisões e escolhas de abordagem tomadas nesta sessão (não o histórico completo, só o que importa pra continuar).
2. **O que foi construído/feito** — mudanças reais aplicadas: arquivos tocados, migrations, comandos rodados, o que já está confirmado funcionando.
3. **Próximos passos** — o que falta, em ordem de prioridade.
4. **Restrições importantes** — regras/limites que a próxima sessão precisa lembrar (áreas protegidas tocadas, credenciais pendentes, coisas que NÃO foram feitas de propósito, autorizações já dadas pelo Pivete que continuam valendo).

Regras de formato:
- PT-BR, direto, sem enrolação — é um handoff técnico, não um resumo de conversa.
- Máximo ~500 tokens — a sessão nova tem que começar leve, não recarregada.
- Cite caminhos de arquivo exatos quando relevante (não descreva vagamente "o arquivo do hub", diga o path).
- Se houver segredo/chave envolvida, cite ONDE ela está salva (nunca o valor).
- Entregue em um bloco de código markdown único, pronto pra copiar e colar como primeira mensagem da sessão nova.
