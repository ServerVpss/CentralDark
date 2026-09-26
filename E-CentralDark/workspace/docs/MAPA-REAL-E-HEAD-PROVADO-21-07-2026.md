# MAPA REAL — ESCOPO ALINHADO + HEAD PROVADO
**Data:** 21/07/2026
**Fluxo PROVADO (corrigido pela Lupa — ver `LUPA-12TXT-21-07-2026.md`):**
Pivete decide → **Opus coordena e EXECUTA direto** → subagentes controlados pelo Opus ajudam → **Gemini analisa o material coletado** → **Sonnet externo entrega arquivo separado** → **GPT faz a validação final**.

> Alinhamento do `E:\CentralDark\12.txt` + `PLANO-DA-CASA-CENTRALDARK-HERMES.md` + o que o GPT e o Pivete precisam.
> ⚠️ **CORREÇÃO (Lupa 21/07):** a mecânica antiga — "Opus prepara e espera; Sonnet + Gemini executam de fora; GPT valida" — **ESTAVA ERRADA e travava a missão** (o Opus ficava esperando agentes que não controlava, e confundia modelo com executor). O que FUNCIONA, provado hoje: o Opus (topo) **AGE e executa direto** (ssh próprio + subagentes que ele controla) e cruza os resultados. Gemini = analisa; Sonnet externo = arquivo separado; GPT = validação final. Não repetir a regra velha.
> Regra: documento é o que alguém DISSE; só vira 🟢 com prova (HTTP status / processo na porta). Sem prova = 🟡 NÃO PROVADO.
> Regra: documento é o que alguém DISSE; só vira 🟢 com prova (HTTP status / processo na porta). Sem prova = 🟡 NÃO PROVADO.

---

## HEAD provado:  (gabarito do topo — testado hoje, com evidência)

```text
🟢 ssh Segredo-VPS ................. host vmi3256920, root (89.117.78.124)
🟢 ai-proxy /v1/chat/completions ... HTTP 200 — gpt-5.5 ("pong") e google/gemini-2.5-pro ("gemini ok")
                                     rota: kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1/chat/completions
                                     senha: Bearer WEBUI_LOVABLE_KEY (nao anon)
🟢 api.centralldark.com/v1/models .. HTTP 200 (WEBUI key) — lista Arsenal (router/parallel/debate)
🔴 api.centralldark.com/v1/chat .... HTTP 401 — Arsenal exige senha SEPARADA (falta essa)
🟢 darkai local (PC) ............... C:\Users\danda\bin\darkai.cmd — funciona (pong)
🟢 gateway Hermes .................. ligado (PID vivo), patch de voz _MD_TABLE reaplicado e ativo
🔴 memoria Hermes ................. state.db ~346 MB inchado; 3-temperaturas 0 byte; 6 fontes espalhadas
🔴 symlink vault .................. E:\CentralDark\vault aponta pra repo\docs\BRAIN (MORTO). Data do atalho: 02/07/2026 14:08
🟢 cofre organizado ............... E:\CentralDark\backups\vaults-antigos\Brain-Copia-bagunca (backup 29/06, pastas arrumadas, plugins + zip)
🟢 registros persistentes ......... aprendizados #336–#340 no GitHub (docs/CONSCIENCIA/APRENDIZADOS.md)
```

---

## Regras do topo (anti falso-verde) — o que vai bloquear a entrega
- Processo online no PM2 **≠** rota funcionando. Só conta com HTTP status real.
- Subdomínio sem processo físico na porta → **NÃO PROVADO / EXPULSO DO PLANO**.
- "Verde" reportado sem número (200/401/404) → rejeitado.
- Resultado dos executores que divergir do gabarito acima → investigar antes de aceitar.
- Nenhum `.env`, token, senha ou chave em nenhuma seção — só NOMES de variável.

---

## VARREDURA EXECUTADA (Opus, ssh read-only, 21/07) — fonte: `/etc/caddy/Caddyfile` + `pm2 list` + `du -sh`

### Seção 1 — Subdomínios → Destino real → Porta

| Subdomínio | Destino / Porta | Estado (provado) |
|---|---|---|
| `api.centralldark.com` | supabase (ai-proxy) + `127.0.0.1:3101`, `:3102`, `:8090` (ArsenalAdapter) | 🟢 `/v1/models` 200 · 🔴 `/v1/chat` 401 (ArsenalAdapter exige senha própria) |
| `bridge.centralldark.com` | `127.0.0.1:8099` (Bridge Lovable OpenAI-compat) | 🔴 **503 rota MORTA** — processo desligado → **EXPULSO DO PLANO** |
| `grafo.centralldark.com` | `127.0.0.1:3030` | 🟢 processo GrafoVivo/GraphPanel online |
| `builder.centralldark.com` | `localhost:3090` | ⚪ não testado |
| `ui.centralldark.com` | (tls próprio) | ⚪ não testado |
| `elite` / `portal` / `telepainel` / `install` / `root` | imports separados | ⚪ não testados |

### Seção 2 — Inventário de pastas → Tamanho (TOTAL `/root/CentralDark` = **13 GB**)

| Pasta | Tamanho | Nota |
|---|---|---|
| `apps` | 2,2 GB | módulos (o núcleo) |
| `actions-runner` | 1,3 GB | 🟡 runner do GitHub Actions — candidato a peso removível |
| `graphify-out` | 597 MB | 🟡 saída acumulada do graphify — provável lixo |
| `node_modules` | 461 MB | dependências |
| `contas` | 106 MB · `install-callback` 79 MB · `scripts` 72 MB · `docs` 52 MB · `infra` 38 MB · `revisoes` 31 MB · `secrets` 18 MB · `backups` 15 MB | — |
| `ecosystem.config.js.bak-*` (2) | ~92 KB cada | 🟡 backups de config antigos |

### Seção 3 — Processos PM2 (21 no total) — nomes, sem tokens

🟢 **20 online** · 🔴 1 stopped (`CentralDark-AiDiag`, id 11).
**Falso-verde detectado (o topo marca):** "online" NÃO é saudável quando reinicia sem parar —
- `CentralDark-ArsenalProxy` (id 6) → **5.576 restarts** 🔴 instável
- `CentralDark-EliteHTTP` (id 7) → **5.308 restarts** 🔴 instável
- `CentralDark-MCP` (826) · `WebhookDeploy` (278) · `GraphPanel` (260) → 🟡 reiniciam bastante
- Núcleo estável (0 restart, 4 dias no ar): Hermes, HubBot, Memoria, OAuthBroker, ArsenalAdapter, GrafoVivo, Guardiões.

---

## Direção final (etapa de fechamento) — Obsidian
Aproveitar `E:\CentralDark\backups\vaults-antigos\Brain-Copia-bagunca` (pastas já arrumadas pelo Pivete) e colocar na estrutura do Plano da Casa:
```text
00-INICIO · 01-ESTADO-ATUAL · 02-ARQUITETURA · 03-MISSOES · 04-APRENDIZADOS · 05-PENDENCIAS · 06-RELATORIOS · 99-ARQUIVO
```
Antes: refazer o atalho `vault` morto pro cofre certo. Quem valida a estrutura final = **GPT rigoroso**.

---

## Estado do fluxo
- [x] Topo assumido, gabarito guardado (Opus)
- [x] Varredura VPS executada (Opus, ssh read-only) → Seções 1–3 preenchidas
- [x] Cruzamento topo × varredura → falso-verdes marcados (ArsenalProxy 5576 / EliteHTTP 5308 restarts; bridge 8099 morta)
- [ ] Validação final (GPT)
- [ ] Fechamento Obsidian (cofre → estrutura do plano)
