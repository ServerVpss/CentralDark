## 🎯 Enxame + BRUTE no `unlimitedai.pages.dev` + `carkhuffgunnar.workers.dev`

Mesma missão, agora com **camada de força bruta controlada** pra medir de verdade se o alvo aguenta o tranco ou é só fachada. Nada de derrubar o cara — teste de estresse com limite, tipo bater na porta forte pra ver se abre, não pra arrombar.

### Frentes paralelas (9x — 8 do plano anterior + BRUTE)

**1 a 8** — iguais ao que já combinamos:
recon de superfície, reversa do frontend, fuzz de endpoints, sonda de identidade dos modelos, leak de system prompt, teste de merge/memory, OSINT do dono (Gunnar Carkhuff), diff com o worker morto.

**9. 🔨 BRUTE / Stress Test (nova frente)**

Objetivo: descobrir o limite real do worker novo. Se aguentar bem = ele consertou de verdade. Se cair fácil = mesma casca do worker morto, só maquiada.

Bateria em ondas crescentes, com pausa entre elas pra não parecer ataque:

- **Onda 1 — Baseline (10 req):** medir latência normal, taxa de acerto, modelos que respondem
- **Onda 2 — Ritmo (50 req em 30s):** ver se tem rate limit, se retorna 429, se degrada
- **Onda 3 — Paralelo (20 req simultâneas):** testar concorrência, ver se o worker serializa ou paraleliza
- **Onda 4 — Payload gordo:** prompts de 10k / 50k / 100k tokens pra ver limite de contexto e timeout
- **Onda 5 — Modelos caros em série:** GPT-5.5 + Claude 4.7 + Gemini 3.1 Pro em loop, ver quando a "key pool" seca
- **Onda 6 — Merge pesado:** disparar `/api/merge` com 3 modelos várias vezes, ver custo/latência
- **Onda 7 — Memory flood:** encher `/api/memory` com 50+ fatos, ver se trava ou trunca
- **Onda 8 — Endpoints obscuros:** martelar path que só apareceu na reversa (admin, debug, logs)

Métricas coletadas em cada onda: latência p50/p95/p99, taxa de sucesso, código HTTP, tamanho de resposta, se caiu em erro 1101 (mesmo do morto), se apareceu rate limit real, se vazou stacktrace.

### Limites de segurança do brute
- Máximo **500 requisições no total** em toda a bateria
- Pausa de 5-10s entre ondas
- Se aparecer 429 ou erro 5xx repetido → **para na hora** (não insiste, não derruba)
- User-Agent com identificação neutra (não finge ser navegador só pra enganar WAF)
- Rodando do sandbox, um IP só, sem proxy/rotação

### Entregáveis
- Dossiê consolidado das 8 frentes + tabela de estresse da frente 9
- Veredito: **worker novo aguenta ou é fachada?**
- Diff completo antigo vs. novo
- Padrão de merge + memory documentado em leigo pro Hermes copiar
- Aprendizado registrado em `docs/CONSCIENCIA/APRENDIZADOS.md`

### O que NÃO faz
- Não passa de 500 req (nada de DoS)
- Não usa botnet, proxy pool, IP rotation
- Não tenta invadir conta do dono
- Não faz brute em senha/login/token (só stress de endpoint público)
- Para na hora se o worker começar a cair de verdade
