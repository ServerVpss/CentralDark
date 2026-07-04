# Plano refinado — Mistral Vibe ↔ claude.ap7.site

Curl já passou (HTTP 200) em todos os testes, com e sem `anthropic-beta` gordo. Proxy tá liberado. Não precisa de nginx intermediário no caminho feliz — vira só rollback.

Gemini avisou 3 armadilhas que reescreveram o plano:
- Vibe procura `ANTHROPIC_API_KEY` por padrão, não `CLAUDE_AP7_API_KEY`.
- Beta `interleaved-thinking` muda o formato do SSE e pode quebrar o parser do Vibe.
- Tool use (ler/escrever arquivos no VS Code) pode ser gated pelo nome do modelo — `haiku-4.6` talvez não seja reconhecido como "Claude" e desabilite as ferramentas.

## Fase 0 — Descoberta (5 min, na VPS)

Antes de configurar qualquer coisa, ler o schema real do Vibe:

```text
/root/.vscode-server/extensions/mistralai.mistral-vibe-code-1.11.5-linux-x64/
├─ package.json          ← ver quais env vars a extensão lê
├─ README.md             ← ver formato oficial do config.toml
└─ bin/vibe-acp          ← binário ACP
```

Objetivo: confirmar 3 coisas
1. Nome exato da env var (é `ANTHROPIC_API_KEY` mesmo?).
2. Se o `config.toml` aceita bloco `headers = { ... }` por modelo (pra injetar `anthropic-beta` se precisar).
3. Se aceita `api_style = "anthropic"` mesmo, ou se o nome do campo é outro.

Sem essa checagem, adivinhar o schema = 400 no primeiro request.

## Fase 1 — Config mínima, um modelo só

Guardar a chave via `add_secret` (nunca commitar). Na VPS, exportar as duas env vars por segurança:

```bash
# ~/.bashrc
export ANTHROPIC_API_KEY="sk-lab-..."
export CLAUDE_AP7_API_KEY="sk-lab-..."
```

`~/.vibe/config.toml` mínimo, sem beta, sem streaming thinking, um modelo só:

```toml
api_base = "https://claude.ap7.site"
api_style = "anthropic"

[[models]]
id = "haiku-4.6"
display_name = "Haiku 4.6 (ap7)"
context = 200000
```

Objetivo: garantir que texto simples flui antes de mexer em tool use / thinking / cache.

## Fase 2 — Validação em camadas (na ordem, parando no primeiro erro)

1. **Texto puro**: `/model haiku-4.6` no chat Vibe → mandar "oi" → tem que responder.
2. **Streaming**: mandar prompt longo (~500 palavras de resposta). Se travar ou cortar → o parser SSE do Vibe é o problema.
3. **Tool use**: pedir "leia o arquivo package.json e me diz a versão". Se o Vibe não chamar a tool → gating por nome do modelo, ir pra rota A da Fase 4.
4. **Thinking blocks**: só depois que os 3 anteriores passarem, adicionar `anthropic-beta = "interleaved-thinking-2025-05-14"` no bloco do modelo (se o schema aceitar headers).

## Fase 3 — Expandir catálogo

Só depois da Fase 2 verde, adicionar os outros 5 modelos no `config.toml`:

```toml
[[models]]
id = "sonnet-4.6"
context = 200000

[[models]]
id = "sonnet-4.6[1m]"
context = 1000000

[[models]]
id = "opus-4.8"
context = 200000

[[models]]
id = "opus-4.8[1m]"
context = 1000000

[[models]]
id = "haiku-4.6[1m]"
context = 1000000
```

Testar cada um com um `ping` no `/model X`.

## Fase 4 — Rotas de rollback (só se algo quebrar na Fase 2)

**Rota A — Tool use não ativa porque nome do modelo é estranho**  
Rebatizar no proxy (não no Vibe). Se você tiver acesso ao `claude.ap7.site`, mapear alias:  
`claude-3-5-sonnet-latest` → `sonnet-4.6` internamente. Assim o Vibe reconhece como "Claude oficial" e libera tool use. Se não tiver acesso ao proxy, subir mini-nginx local (rota B) e fazer o rewrite ali.

**Rota B — Vibe não deixa injetar `anthropic-beta` via config**  
Nginx local em `127.0.0.1:8787` que:
- Adiciona `anthropic-beta` que o Vibe não conseguiu mandar.
- Ou remove `anthropic-beta` que o Vibe manda mas o proxy não gosta.
- Reescreve nome de modelo se precisar.
- Faz `proxy_pass https://claude.ap7.site;`

Aponta o `api_base` do Vibe pra `http://127.0.0.1:8787`. Fica invisível pro Vibe.

## O que NÃO fazer

- Não colocar `anthropic-beta` gordo (4 flags) já na primeira config — o `interleaved-thinking` altera o SSE (`thinking_delta` antes de `text_delta`) e o parser do Vibe pode não entender.
- Não commitar a chave em lugar nenhum do repo — só env var ou `add_secret`.
- Não usar aliases fantasia tipo "sonnet-ap7" no config do Vibe se a suspeita do gating por nome for real. Manter o id igual ao que o proxy expõe, e resolver rename no proxy/nginx.

## Detalhes técnicos (pra IA que for executar)

- Rodar Fase 0 via `vps_read_file_safe` no `package.json` e `README.md` da extensão.
- Salvar chave com `add_secret` (nome `CLAUDE_AP7_API_KEY`) além de exportar no bashrc, pra deixar rastreável.
- Depois do `config.toml` gravado, VS Code precisa de "Developer: Reload Window" — não basta reabrir aba.
- Teste de smoke automatizável: script bash roda `curl` em `/v1/messages` a cada 6 modelos e reporta HTTP+latência. Já tenho ele quase pronto do teste anterior.

## Decisão que preciso de você

Executo agora Fase 0 (só leitura na VPS pra descobrir schema real do Vibe) e volto com o `config.toml` já ajustado ao que a extensão de fato aceita?