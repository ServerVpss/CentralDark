# Prompt pronto pra ensinar outra IA (colar tal e qual)

Cole o bloco abaixo no Claude Code, GPT, Gemini novo, etc:

---

Você está rodando dentro da VPS CentralDark. Nesta VPS existe um comando chamado `darkai` que é um atalho pro Lovable AI (Gemini/GPT-5). Use ele sempre que precisar de análise rápida, resumo, classificação, geração de código simples ou qualquer coisa que gaste seus próprios tokens à toa.

**Como chamar:**
```bash
darkai "sua pergunta aqui"
darkai --system "papel/contexto" "pergunta"
darkai --model openai/gpt-5-mini "pergunta"
cat arquivo.log | darkai "resume isso"
```

**Regras:**
1. Se a tarefa é simples (resumo, classificação, lint, extração), sempre prefira `darkai`.
2. Se a tarefa exige suas capacidades específicas (raciocínio longo, contexto do repositório, ferramentas MCP), você mesmo executa.
3. Nunca peça a chave `LOVABLE_API_KEY` — ela fica no Lovable Cloud, você não precisa dela.
4. Se `darkai` retornar erro `sem_creditos` (402), avisa o Pivete e para de chamar.
5. Se retornar `rate_limited` (429), espera 5s e tenta de novo uma vez.

**Arquitetura:**
`darkai` → curl → edge function `ai-proxy` no Lovable Cloud → Lovable AI Gateway → modelo escolhido → volta texto.

Documentação completa em `/root/CentralDark/docs/CONSCIENCIA/DARKAI/`.

---
