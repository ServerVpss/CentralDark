# CentralDark Builder (Bolt)

Fábrica visual da CentralDark. Fork de [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)
(stackblitz-labs) com customizações CentralDark.

| | |
|---|---|
| Código | `source/` — versionado como árvore normal (não é submódulo) |
| Container | `CentralDark-Builder` |
| Portas | `127.0.0.1:5174` → `5173` (app) · `5175` (HMR) |
| Público | https://builder.centralldark.com |

Deltas CentralDark sobre o upstream:

- `source/app/components/header/Header.tsx` — `LogoCentralDarkAI`
- `source/app/styles/variables.scss` — tema esmeralda
- `source/vite.config.ts` — `allowedHosts: ['builder.centralldark.com']`

---

## Como subir

O `docker-compose.yml` declara `env_file: ./source/.env`, então esse arquivo
**precisa existir** antes de subir. Crie-o a partir da tabela abaixo:

```bash
cd apps/modulos/Bolt
# criar source/.env com as variáveis da tabela (NUNCA versionar esse arquivo)
docker compose up -d
```

> ⚠️ Não crie um arquivo `.env.example` neste repositório. O gate de CI
> **Gates determinísticos** bloqueia qualquer caminho que case com
> `(^|/)\.env(\.|$)` — pelo **nome**, antes mesmo de olhar o conteúdo. Foi por
> isso que `958666567` ("remover caminhos env bloqueados") apagou os arquivos
> `.env.example` e `.env.production` originais. Documente as variáveis aqui,
> neste README, e não em um arquivo `.env.*`.
>
> Nota: o `.gitignore` (linha 60, `!*.env.example`) permite esses arquivos,
> mas o gate de CI os rejeita. As duas regras do repositório se contradizem —
> na prática, vale a mais restritiva, que é o gate.

---

## Variáveis

### Provider ativo — gateway CentralDark

Único caminho de modelo comprovadamente cabeado. Verificado de dentro do
container: `HTTP 200` em `/v1/models`.

| Variável | Valor |
|---|---|
| `OPENAI_LIKE_API_BASE_URL` | `https://api.centralldark.com/v1` |
| `OPENAI_LIKE_API_KEY` | chave do gateway |

### Anthropic — vai direto na API oficial

| Variável | Observação |
|---|---|
| `ANTHROPIC_API_KEY` | única que o provider realmente lê |

⚠️ **`ANTHROPIC_API_BASE_URL` não funciona.** Ela existe no `docker-compose.yml`
mas é **ignorada pelo código**: `source/app/lib/modules/llm/providers/anthropic.ts`
não declara `baseUrlKey` e nunca passa `baseURL` para `createAnthropic()`. Sem
isso, o SDK usa o endpoint oficial da Anthropic.

Confirmado em runtime, de dentro do container:

```text
host.docker.internal:8082  → timeout   (container não alcança o host)
api.centralldark.com/v1    → HTTP 200  (gateway público responde)
```

O caminho Anthropic falha em **duas camadas independentes**: o código ignora a
variável **e** a rede do container não chega no host. Rotear Anthropic pelo
Elite Gateway exige **alterar o provider**, não configurar variável.

Houve historicamente um terceiro nome em circulação, `VITE_ANTHROPIC_API_BASE`,
citado apenas em documentação — nunca existiu no código.

### Runtime

`PORT`, `HOST`, `VITE_HMR_*` e `PUBLIC_ORIGIN` já vêm do `docker-compose.yml`.
Ajuste `VITE_LOG_LEVEL` se precisar de mais verbosidade.

### Outros providers (opcionais)

`OPENAI_API_KEY`, `GROQ_API_KEY`, `OPEN_ROUTER_API_KEY`,
`GOOGLE_GENERATIVE_AI_API_KEY`, `OLLAMA_API_BASE_URL`, `TOGETHER_API_BASE_URL`,
`TOGETHER_API_KEY`, `DEEPSEEK_API_KEY`, `MISTRAL_API_KEY`, `XAI_API_KEY`,
`PERPLEXITY_API_KEY`.

---

## Estado conhecido

| Item | Situação |
|---|---|
| Preview ao vivo | WebContainer + iframe (upstream) — **não validado** neste repo |
| Workspace por projeto | **não existe** — `WORK_DIR` é constante global, todo chat divide `/home/project` |
| Bridge Lovable | **não existe** — zero referências a Lovable no código do Bolt |
| Integração Hermes | **não existe** |
| Testes | 3 specs do upstream; não rodam sem `node_modules` |

## Armadilha de caminho

`scripts/deploy/install-builder-bolt.sh` e
`scripts/validate/builder-bolt-static-checks.sh` operam sobre
`apps/builder-bolt/` — caminho que **não existe**. O módulo real é
`apps/modulos/Bolt/`. Os dois scripts falham hoje.
