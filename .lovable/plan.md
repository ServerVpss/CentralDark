# 🚨 MODO ARSENAL — Plano de Execução

## Parte 1 — 6 Superpoderes no Proxy (VPS)

**Local:** `/root/CentralDark/apps/modulos/elite-anthropic-proxy/` (é o path real do proxy, o `proxy/` que você citou não existe — confirma se é pra usar esse mesmo ou criar novo).

**Antes de qualquer coisa:**
- Backup completo: `cp -r elite-anthropic-proxy elite-anthropic-proxy.bak-$(date +%s)`
- `pm2 describe` pra confirmar o ID real do processo
- Cada magia = 1 arquivo `.py` + `python -m py_compile` + git commit isolado

### Arquivos a criar

| # | Arquivo | O que faz | Depende de |
|---|---|---|---|
| 1 | `neural_router.py` | Classifica prompt (simples/complexa/segurança) e escolhe modelo. Usa heurística por tamanho + keywords + 1 chamada barata ao Gemini Flash pra classificação quando ambíguo. | Gemini API |
| 2 | `swarm.py` | Se modelo principal timeout/erro, dispara 3 fallbacks em paralelo (`asyncio.gather` + `return_exceptions`), retorna o primeiro OK, cancela os outros. | httpx async |
| 3 | `chain_reaction.py` | Pipeline: Gemini Flash → GPT-5 mini → Claude Sonnet → Gemini Pro. Cada etapa recebe a resposta anterior + instrução "melhore isso". | os 4 upstreams |
| 4 | `dark_intel.py` | Tail do log de acesso do proxy, detecta padrões (rate abuso, paths suspeitos, user-agents ruins), bloqueia IP via iptables/set em memória, notifica Telegram admin. | notify Telegram já existente |
| 5 | `synthetic.py` | Lê logs estruturados de chamadas, anonimiza (remove keys/tokens/PII), gera JSONL de treino em `data/synthetic/`. | logs do proxy |
| 6 | `self_evolve.py` | Cron noturno (cron do PM2 ou systemd timer). Lê métricas (latência, erro por modelo), reordena prioridade do router, escreve em `docs/APRENDIZADOS/PROXY/APRENDIZADOS.md`. | métricas persistidas |

### Integração no `proxy.py` principal
- Router de entrada chama `neural_router.route()` → decide modelo
- Se falhar, cai em `swarm.spawn_fallbacks()`
- Endpoint novo `POST /chain` dispara `chain_reaction.run()`
- Middleware roda `dark_intel.inspect(request)` antes de tudo
- `synthetic` e `self_evolve` rodam como jobs, não middleware

### Endpoints novos expostos
- `POST /arsenal/neural` — força passar pelo neural router
- `POST /arsenal/swarm` — força modo swarm
- `POST /arsenal/chain` — chain reaction 4 IAs
- `GET /arsenal/intel` — lista IPs bloqueados / ameaças detectadas
- `GET /arsenal/stats` — métricas usadas pelo self-evolve

### Deploy VPS
- Um commit por magia
- `pm2 restart CentralDark-Proxy --update-env` só no fim
- Validar `/health` + testar cada endpoint com curl

---

## Parte 2 — Painel Arsenal protegido por senha no `status.centralldark.com`

**Local protegido:** `apps/modulos/status/` (🔒 na seção 9 do CLAUDE.md — vou adicionar arquivos NOVOS sem tocar em `index.html`, `app.js`, `painel-data.json`, seguindo o mesmo padrão do `conselho.html`).

### Arquivos novos
- `apps/modulos/status/arsenal.html` — painel visual do Arsenal (mesmo tema dark do `styles.css`)
- `apps/modulos/status/arsenal.js` — consome `https://api.centralldark.com/arsenal/stats` + `/arsenal/intel`
- `apps/modulos/status/arsenal-gate.js` — tela de senha antes de renderizar

### Trava de senha (opções)

**Opção A — Simples client-side (rápido, MAS senha fica no JS):**
- Prompt de senha, hash SHA-256, compara com hash embutido. Bloqueia a UI mas quem inspeciona o JS acha o hash e pode brutar offline. Serve pra afastar curioso, não hacker.

**Opção B — Sério, Basic Auth no Caddy (recomendado):**
- Adiciona bloco no Caddyfile do subdomínio `status.centralldark.com` protegendo só o path `/arsenal.html` e `/arsenal.js` com `basicauth`. Senha hasheada com `caddy hash-password`. Zero senha no repo. Requer editar Caddy (protegido — precisa da tua autorização explícita).

**Recomendo B.** Mais seguro e nem carrega o painel pra quem não tem senha.

### Nome de acesso
Você escreveu `status.centralDark` — assumo que é `https://status.centralldark.com/arsenal.html` (mesmo subdomínio que já existe).

---

## ❓ Preciso confirmar 3 coisas antes de executar

1. **Path do proxy:** uso o existente `apps/modulos/elite-anthropic-proxy/` ou crio um novo `apps/modulos/proxy/` do zero?
2. **Senha do painel:** Opção A (client-side rápido) ou Opção B (Caddy basicauth, mais seguro, mexe em arquivo protegido)?
3. **Senha em si:** você me passa a senha agora ou eu gero uma forte e te mando no Telegram admin depois de aplicar?

Responde essas 3 e eu já saio martelando as 6 magias + o painel em paralelo.
