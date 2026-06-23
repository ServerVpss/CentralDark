## O que vai ser montado

Um serviço novo na VPS chamado **`contas-admin`** (porta interna 9400), exposto de forma secreta em **`https://status.centralldark.com/ai-review.html`** (a mesma URL camuflada que você já usa).

Quando você abrir esse link, vê o painel com a lista das contas salvas e, do lado de cada provedor, **dois botões de login**:

```text
┌─ ChatGPT / Claude / Gemini ─────────────────────┐
│  [ Logar pelo Navegador Remoto ]  ← noVNC      │
│     abre um Chrome rodando na VPS, você loga    │
│     normal, fecha — o profile fica salvo        │
└─────────────────────────────────────────────────┘

┌─ Google / GitHub ───────────────────────────────┐
│  [ Logar com OAuth ]  ← um clique               │
│     vai pro provedor, autoriza, volta, token    │
│     salvo automático em /root/CentralDark/contas │
└─────────────────────────────────────────────────┘
```

## Como cada botão funciona

**Navegador Remoto (noVNC)** — pra ChatGPT, Claude, Gemini, qualquer site sem OAuth público:
- Você clica → backend sobe um `Xvfb + Chrome + x11vnc + websockify` numa porta temporária (6080–6099)
- Abre uma aba nova com o noVNC do Chrome rodando na VPS
- Você loga normal (e-mail/senha, Google, código no celular, etc.)
- Sessão dura até 15 min e desliga sozinha; o profile do Chrome (cookies/tokens) fica salvo em `/root/CentralDark/contas/<provedor>/profile/` pra reuso pelas IAs

**OAuth real** — pra Google e GitHub:
- Você clica → redireciona pro provedor → autoriza → callback no `contas-admin` salva o `access_token` + `refresh_token` em `/root/CentralDark/contas/<provedor>.json`
- GitHub usa as credenciais que **já estão nos secrets** (`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`)
- Google precisa de credencial nova (te peço depois, num passo separado)

## Segurança

- Painel inteiro protegido por **Bearer token** (`CONTAS_ADMIN_TOKEN`, gerado automático)
- Caddy só libera o caminho secreto `/ai-review.html` e `/api/*` sob esse host
- Sessões noVNC com senha aleatória por sessão + timeout

## Arquivos / componentes

- **VPS** `/root/CentralDark/scripts/contas-admin/`
  - `main.py` (FastAPI)
  - `novnc_session.py` (gerenciador de sessões temporárias)
  - `oauth.py` (fluxo GitHub agora, Google quando você passar a credencial)
  - `ecosystem.config.cjs` (PM2)
  - `index.html` (painel com os botões)
- **Caddy** novo bloco em `status-centraldark.Caddyfile` roteando `/ai-review.html` e `/api/contas/*` pro `127.0.0.1:9400`
- **PM2** processo `contas-admin` registrado e salvo no dump

## O que NÃO vai mudar

- Nada no projeto TelePanel (frontend do Lovable) — tudo é VPS
- Nenhum bot, nenhuma edge function, nenhuma tabela do banco
- Caddyfile principal fica intacto, só o arquivo do host status recebe append

## Depois de subir

Te entrego: a URL secreta + o Bearer token + o caminho da pasta `contas/`. Você abre, clica nos botões, valida o fluxo. Se quiser Google OAuth também, me passa o Client ID/Secret depois e eu ligo num turno só.

---
**Posso ir?** Se sim, eu já subo o serviço, o Caddy e registro no PM2 nesse mesmo passo.