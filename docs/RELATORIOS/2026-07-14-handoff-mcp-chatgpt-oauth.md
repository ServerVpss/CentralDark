# HANDOFF TÉCNICO — CentralDark MCP ↔ ChatGPT OAuth

**Data UTC:** 2026-07-14  
**Repo:** `ServerVpss/CentralDark`  
**Branch runtime VPS:** `main`  
**URL MCP:** `https://mcp.centralldark.com/mcp`  
**App ChatGPT (CIMD):** `https://chatgpt.com/oauth/5ZEp8NFMN5JU/client.json`  
**Autor sessão:** Grok CLI na VPS · **Autorização Pivete:** postar handoff no GitHub  

> **Sem secrets:** este documento não contém tokens, senhas, `.env` nem chaves.  
> **Para o ChatGPT / próxima IA:** leia isto e continue só o eixo OAuth MCP.

---

## 1. Objetivo atual

Estabilizar o **connector MCP do ChatGPT** (app CentralDarkk) em:

`https://mcp.centralldark.com/mcp`

- Tools locais (CLI, Cursor, Claude desktop, etc.) já estão OK — **não é o foco**.
- Foco único: OAuth ChatGPT completar  
  **authorize → code → POST /token → Bearer → tools**.
- Pivete autorizou modo **TEMP público / sem senha admin** só para teste (com prazo).

---

## 2. Diagnóstico confirmado

### 2.1 O que o MCP faz certo

| Etapa | Status | Evidência |
|--------|--------|-----------|
| CIMD `client_id` com `?token_endpoint_auth_method=none` | OK | authorize 302 |
| Alias `POST/GET /` → mesmo handler que `/mcp` | OK | evita 404 na URL raiz |
| `GET /authorize` → **302** com `code` | OK | log `oauth_authorize` |
| Modo TEMP sem senha admin | OK | `mode: temp_open_no_password` |
| Escopo `mcp admin` no authorize aberto | OK | logs |
| MCP HTTP sem Bearer (TEMP public) | OK | `tools/list` local 200 |
| Claude / Grok `POST /token` | OK | 200 no mesmo dia |

### 2.2 Falha raiz (ChatGPT)

```
Browser → GET /authorize → 302 → chatgpt.com/connector/oauth/…?code=…
                                    ↓
                     ChatGPT DEVERIA POST /token no MCP
                                    ↓
                     NÃO chega (zero POST /token do ChatGPT após authorize)
```

- Após authorize bem-sucedido **não há** `oauth_token_issued` do ChatGPT.
- Sem access_token o connector fica desconectado / “tente novamente”.
- **Não é** falta de tools no servidor; é **exchange do code** no lado cliente OpenAI (ou browser).

### 2.3 Ruído que confunde log

- `tools/call` a cada ~60s, `ua: Guardiao-CentralDark/2.0` → tool `atualizar_painel` (**Guardião**, não ChatGPT).
- `temp_public: false` nesses calls = Bearer válido do Guardião.

### 2.4 Client IDs observados

- Com query: `…/client.json?token_endpoint_auth_method=none`
- Sem query: `…/client.json`  
- Ambos passam authorize no modo TEMP.  
- Se `/token` um dia chegar: validar match exato do `client_id` do code vs body.

---

## 3. Erros do console (browser / ChatGPT UI)

| Mensagem | Origem | Relevância MCP |
|----------|--------|----------------|
| Bundle minificado React (`2340486e-….js`, React 19 canary, etc.) | Frontend OpenAI | **Nenhuma** |
| `A router only supports one blocker at a time` | React Router UI ChatGPT | Ruído de navegação |
| `formatjs` / `MISSING_TRANSLATION` (pt-BR) | i18n OpenAI | Bug UI, não MCP |
| `SyntaxError: Unexpected identifier 'POST'` | Colar `curl` no DevTools | Shell ≠ JS |
| `CRYPT_E_NO_REVOCATION_CHECK` (Git Bash Windows) | schannel | Cliente Windows; usar `--ssl-no-revoke` se curl |

**Conclusão:** dump JS / router blocker **não diagnosticam** o MCP. Diagnóstico útil = log servidor: `oauth_authorize` vs ausência de `/token`.

---

## 4. Arquivos alterados (eixo MCP desta sessão)

Runtime PM2 usa **`dist/`**.

| Arquivo | Mudança |
|---------|---------|
| `apps/modulos/mcp/src/index.js` | TEMP public `/mcp` `/` `/admin/mcp`; fallback Bearer stale; `tmp-diag` IP allow |
| `apps/modulos/mcp/dist/index.js` | Espelho (processo vivo) |
| `apps/modulos/mcp/src/oauth.js` | TEMP authorize sem senha admin (`temp_open_no_password`) |
| `apps/modulos/mcp/dist/oauth.js` | Espelho |

### Flags TEMP (expiram juntos)

- **Until UTC:** `2026-07-15T12:00:00Z`
- `TEMP_MCP_PUBLIC = true` → POST `/mcp` sem auth usa token GitHub **interno do processo** (valor só no env PM2, não aqui)
- Authorize aberto sem senha admin no mesmo prazo
- `tmp-diag`: `GET /tmp-diag`, `POST /tmp-diag/token` (allow IPv4 casa + IPv6 do Pivete)

### Risco

Enquanto TEMP public estiver ativo, **qualquer um na internet** pode chamar o MCP. Fechar após o teste.

### Commit do patch MCP

Patch ainda estava **só working tree VPS** no momento do handoff; este **arquivo de handoff** foi versionado por ordem do Pivete. Validar se o patch runtime já foi commitado em commit separado.

---

## 5. Branch / estado git (snapshot)

- Branch: `main`
- VPS costuma estar **ahead** de `origin/main` (muitos commits locais / painel).
- Topo recente frequentemente: `chore(painel): IA atualiza painel` (Guardião; push git do painel pode falhar com “fetch first”).
- **Não** misturar commit de handoff com drift de missões Hermes / painel sem revisão.

---

## 6. Testes e resultados

| Teste | Resultado |
|-------|-----------|
| `GET /mcp` TEMP | `temp_public: true` |
| `POST /mcp` `tools/list` sem Authorization | 200 com tools |
| `GET /admin/mcp` TEMP | aberto |
| `GET /tmp-diag` IPv6 Pivete | `allowed: true` |
| ChatGPT authorize (Chrome/Avast ~08:58Z e retries) | 302 + `temp_open_no_password` |
| ChatGPT `POST /token` após authorize | **Ausente** |
| Guardião `atualizar_painel` | 200 (ruído) |

**Processo:** PM2 `CentralDark-MCP` · `apps/modulos/mcp/dist/index.js` · porta local `9100`  
**Logs app:** `/root/CentralDark/apps/mcp/logs/mcp-app-YYYY-MM-DD.jsonl`  
**Logs audit:** `/root/CentralDark/apps/mcp/logs/mcp-audit-YYYY-MM-DD.jsonl`

---

## 7. Pendências

1. ChatGPT **não** completa `POST /token` após 302 — cliente/browser.
2. **Fechar modo público** após teste (`TEMP_MCP_PUBLIC=false` + senha authorize de volta).
3. Versionar patch MCP no GitHub (src+dist) com commit dedicado, se ainda não.
4. Remover bloco TEMP (`tmp-diag` + public + open authorize) após validação.
5. Guardião `atualizar_painel` / divergência git — fora do OAuth, polui main.
6. Após expiry TEMP, OAuth com senha volta; se ChatGPT continuar sem `/token`, public mode **não** “cura” o connector (ChatGPT força OAuth).

---

## 8. Restrições

- Fluxo de Ouro: GitHub = verdade; VPS = executor.
- Áreas 🔒 (Hermes, hub, notify, telepainel, etc.) — **não** mexidas neste eixo.
- Não reabrir `/mcp-public` permanente sem PERMITO.
- Nunca colar secrets no chat/issue.
- Pivete: tools locais OK; não exigir prova curl; foco ChatGPT.

---

## 9. Próximo comando seguro (só leitura, VPS)

Após clicar Connect no ChatGPT:

```bash
rg -n 'oauth_authorize|oauth_token_|path":"/token"|5ZEp8NFMN5JU|mcp_unauthorized' \
  /root/CentralDark/apps/mcp/logs/mcp-app-$(date -u +%Y-%m-%d).jsonl \
  | tail -40
```

**Sucesso:** `oauth_token_issued` ou `POST /token` 200 com client ChatGPT logo após authorize.  
**Falha atual:** só authorize, zero `/token`.

Teste humano: **Chrome limpo sem Avast** · recriar connector · URL `https://mcp.centralldark.com/mcp`.

### Fechar risco público (só com ordem do Pivete)

1. `TEMP_MCP_PUBLIC = false` + desligar open authorize em src+dist  
2. `pm2 restart CentralDark-MCP`  
3. Confirmar `GET /mcp` → 401  
4. Commit no GitHub

**Não fazer sem ordem:** `git push` em massa, `reset --hard`, desligar Guardião.

---

## 10. Prompt de retomada (colar no ChatGPT)

Retome o problema CentralDark MCP OAuth no ChatGPT.  
Servidor: `https://mcp.centralldark.com/mcp`.  
Confirmado: `GET /authorize` retorna 302 com code, modo temp sem senha admin, scope mcp admin.  
Confirmado: ChatGPT **não** chama `POST /token` no MCP após o redirect.  
Console React/router/formatjs do chatgpt.com = ruído UI, não do MCP.  
`tools/call` no log com UA Guardião = não é ChatGPT.  
TEMP public `/mcp` sem Bearer até 2026-07-15T12:00:00Z (risco segurança).  
Arquivos: `apps/modulos/mcp/{src,dist}/index.js` e `oauth.js`.  
Próximo passo: provar se em browser limpo aparece `oauth_token_issued`; se não, bug 100% no cliente OpenAI pós-redirect. Não pedir secrets. Não “provar tools” locais.

---

## 11. Decisão do Pivete (2026-07-14)

- **PERMITO** postar este handoff no GitHub para o ChatGPT / IAs.  
- Pivete sobrecarregado (“n sei nem oq falar”) — este doc é a fonte única de contexto do eixo OAuth.

---

**Fim do handoff.**
