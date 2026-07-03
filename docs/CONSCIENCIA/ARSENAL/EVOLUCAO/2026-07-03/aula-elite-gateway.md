```
┌──────────────────────────────────────────────────────────────────┐
│  🎓 AULA DO TUTOR — HERMES vira admin do ELITE GATEWAY · 03/07    │
│  Criar contas ChatGPT + manutenção do gateway (Zendriver)         │
│  Ferramenta: apps/modulos/elite-gateway/scripts/gateway_admin.py  │
└──────────────────────────────────────────────────────────────────┘
```

# 🎓 Elite Gateway — criar contas e manutenção (aula pro Hermes)

## 🗺️ O que é o Elite Gateway (como foi feito)

Gateway HTTP **OpenAI-compatível** que fala com o ChatGPT web **dirigindo um Chrome real** via **Zendriver** (fork do nodriver — CDP, anti-detecção Cloudflare). Não usa API paga: automatiza a sessão logada no navegador.

```
Cliente (Cline/Cursor/WebUI)                    ChatGPT web
   │ POST /v1/chat/completions                      ▲
   │ Authorization: Bearer <token>                  │ Chrome headless (Zendriver)
   ▼                                                │ user_data_dir = perfil da conta
elite_http_gateway.py  ──resolve_account(token)──► _chatgpt_request()
   (FastAPI :8080, PM2 60)   token→{id,profile_dir}   injeta prompt, espera 'Stop
                             lock por perfil          answering' sumir, lê resposta
```

**Peças:**
| Arquivo | Papel |
|---|---|
| `scripts/elite_http_gateway.py` | o gateway (FastAPI :8080, v2.4) |
| `config/accounts.json` | mapa `token → {id, profile_dir}` (🔒 credencial — backup antes de tocar) |
| `contas/profiles/<id>/` | perfil Chrome de cada conta (cookies/sessão do ChatGPT) |
| `scripts/zentinel_health.py` | vigia latência do chatgpt.com; restart cirúrgico do gateway (cooldown 5min) — PM2 58 |
| `scripts/gateway_admin.py` | **NOVO** — CLI de admin (criar conta, doctor, test) |

**Fluxo de uma request:** token → conta → `asyncio.Lock` do perfil (1 Chrome por conta, sem corrida) → Chrome headless abre chatgpt.com → injeta o prompt no `div[contenteditable]` → ENTER → espera o botão "Stop answering" **aparecer e depois sumir** (fim real da geração) → lê o último `[data-message-author-role="assistant"]` → devolve em formato OpenAI (ou SSE se `stream:true`).

---

## 🧰 A ferramenta: gateway_admin.py

```bash
cd /root/CentralDark/apps/modulos/elite-gateway
python3 scripts/gateway_admin.py <comando>
```
| Comando | O que faz |
|---|---|
| `list` | lista contas (id + perfil, **nunca** token cru) |
| `health` | ping no gateway (:8080) |
| `doctor` | diagnóstico: contas, duplicatas, perfil com/sem sessão, zentinel |
| `add <id>` | cria SLOT: perfil vazio + token novo + entrada no accounts.json (backup automático) |
| `login <id>` | sobe Xvfb+Chrome+noVNC pra você LOGAR a conta (passo humano) |
| `login-stop` | encerra o ambiente de login |
| `test <id>` | manda "pong" pela conta e confere a resposta |
| `fix-duplicates` | aponta ids/perfis duplicados |

---

## 🧠 Procedimento: CRIAR uma conta nova (semi-automático)

O único passo que o Hermes **não** faz sozinho é o login (ChatGPT pede usuário/senha/2FA — só o Pivete). Tudo em volta é mecânico e é do Hermes.

```bash
# 1) Hermes: cria o slot (perfil + token + accounts.json, com backup)
python3 scripts/gateway_admin.py add conta_02
#    → imprime o TOKEN uma vez. Hermes entrega o token ao Pivete no relatório.

# 2) PIVETE (humano): loga a conta pelo navegador
python3 scripts/gateway_admin.py login conta_02
#    → abre http://SEU_IP:6080/vnc.html — Pivete loga no ChatGPT, fecha o Chrome
python3 scripts/gateway_admin.py login-stop

# 3) Hermes: ativa e valida
pm2 restart CentralDark-EliteHTTP && pm2 save   # recarrega accounts.json (só quando ocupado=false)
python3 scripts/gateway_admin.py test conta_02  # espera 🟢 pong
```
**Anti-padrão:** editar `accounts.json` na mão sem backup; reusar o `profile_dir` de outra conta (vira o bug atual: 2 tokens, 1 login); dar `pm2 restart` com `ocupado=true` (derruba request em andamento — checar `health` antes).

---

## 🩺 Procedimento: MANUTENÇÃO / diagnóstico

```bash
python3 scripts/gateway_admin.py doctor          # visão geral em 3s
python3 scripts/gateway_admin.py health          # só o ping
curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8080/  # 200 = vivo
pm2 logs CentralDark-EliteHTTP --lines 30 --nostream   # últimos eventos
```

**Sintomas → causa → ação:**
| Sintoma no log | Causa | Ação |
|---|---|---|
| `cloudflare_block` / title "just a moment" | Cloudflare desconfiou | esperar; se persistir, re-login da conta |
| `input_not_found` | ChatGPT mudou o DOM ou deslogou | `doctor` → se perfil sem Cookies, re-login |
| `generation_start_timeout` | prompt não enviou / página lenta | conferir latência; zentinel reinicia sozinho se >15s |
| perfil "🟡 sem sessão" no doctor | conta deslogou (cookie expirou) | `login <id>` de novo |
| gateway não responde | processo caiu | `pm2 restart CentralDark-EliteHTTP && pm2 save` |

**Zentinel** já cuida da latência sozinho (checa chatgpt.com a cada 45s, restart cirúrgico do gateway se >15s, cooldown 5min pra não entrar em loop). Nunca reinicie tudo em massa — só o processo `CentralDark-EliteHTTP` pelo nome.

---

## 🔒 Segurança (aprendido na marra hoje)

- `accounts.json` e `contas/profiles/` são **credenciais** (tokens + cookies de sessão). NUNCA versionar no git (já estão no `.gitignore`). NUNCA imprimir token cru — sempre mascarado.
- Bug ativo achado no `doctor`: as 2 contas têm `id=conta_padrao` e o **mesmo** `profile_dir`. Multi-conta real = ids distintos + perfis distintos + logins distintos. Corrigir com cuidado (renomear id quebra o token em uso — coordenar com o Pivete).
- Perfil ChatGPT vazou pro histórico do GitHub (via `git add -A` antigo). Pendência do Pivete: rotacionar a sessão (re-login) e avaliar purge do histórico.
