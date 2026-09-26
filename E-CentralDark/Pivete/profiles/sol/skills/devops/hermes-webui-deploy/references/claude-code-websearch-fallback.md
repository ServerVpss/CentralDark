# Fallback: web research via Claude Code when Hermes web_search has no credits

## Quando usar
O `web_search` do Hermes retorna erro do tipo:
> Web tools are not configured. Set FIRECRAWL_API_KEY ... Your Nous Portal account has no usable paid credits

NÃO desista. Delegate a pesquisa pro **Claude Code** (print mode), que tem
`WebSearch` first-party próprio, independente dos créditos do Hermes.

## Passo a passo provado (sessão 2026-08-30)

### 1. Instala o Claude Code (se não estiver no PATH)
```bash
npm install -g @anthropic-ai/claude-code
```
No terminal MSYS/git-bash do Hermes, `claude` pode não estar no PATH após
instalar. Confirmar com `npx --yes @anthropic-ai/claude-code --version`.
Se `claude auth status` disser `loggedIn: true`, a sessão OAuth já existe.

### 2. Delega a pesquisa (print mode + JSON)
```bash
claude -p 'Use WebSearch to verify <pergunta>.
Return a structured report with: <campos específicos>.' \
  --allowedTools 'WebSearch,Read,Bash' --max-turns 20 --output-format json
```

### 3. Parsear o resultado
O stdout é um JSON com campo `"result"` contendo o relatório em texto.
Usar `python -c` ou jq pra extrair `result` e apresentar pro usuário.
Não confiar no stdout bruto.

## Caveats
- `WebFetch` pode ser NEGADO pela camada de permissão do Claude Code em print mode
  mesmo quando `WebSearch` funciona. Baseie o prompt em WebSearch; snippets
  indexados costumam trazer o conteúdo necessário.
- Custa créditos da conta Anthropic do usuário, não créditos do Hermes.
- Útil para: confirmar existência de repo, passos de install, nomes de env var,
  docs de setup externo.

## Exemplo real desta sessão
Usuário pediu pra "delegar o claude verificar na internet". O Hermes não tinha
créditos de web search. Delegatei via Claude Code print mode e obtive relatório
confirmando que `nesquena/hermes-webui` é Python (não Node), variável
`HERMES_WEBUI_PASSWORD`, e comando `tailscale serve --bg 8787`. Isso guiou o
deploy inteiro em seguida.
