## O plano

Agora que tenho a Global API Key + e-mail da Cloudflare, consigo fazer tudo que faltava sem você precisar clicar em nada no painel. Vou agir em duas fases: primeiro **auditar** (só leitura, mostro o estado atual), depois **aplicar** os ajustes com tua confirmação.

### Fase 1 — Auditoria (só leitura)

1. Listar as zonas da conta e confirmar o `centralldark.com` (pegar o Zone ID sozinho).
2. Listar todos os registros DNS e identificar quais estão com proxy (nuvem laranja) ligado/desligado — foco no `telepainel` e `deploy`.
3. Conferir as configurações atuais de SSL/TLS, Always Use HTTPS, Min TLS Version, HSTS, Bot Fight Mode, e regras de cache.
4. Te mando um relatório curto: "isso aqui está ok, isso precisa mudar".

### Fase 2 — Aplicação (com tua confirmação)

Depois do relatório, aplico via API:

- **Proxy ligado** (nuvem laranja) nos subdomínios que faltam: `telepainel.centralldark.com` e `deploy.centralldark.com` — isso resolve o último item pendente do plano de ontem (cert Origin CA passa a validar de verdade).
- **SSL/TLS = Full (Strict)** — ponta a ponta criptografado com validação do cert do servidor.
- **Always Use HTTPS = ON** — qualquer acesso http vira https.
- **Automatic HTTPS Rewrites = ON** — corrige links http dentro das páginas.
- **Min TLS Version = 1.2** — corta versões velhas e inseguras.
- **HSTS** ligado com 6 meses (sem preload por enquanto, pra não travar nada).
- **Bot Fight Mode = ON** (gratuito, filtra bots óbvios).
- **Brotli + Early Hints = ON** (performance).
- **Browser Cache TTL** ajustado pra estático.

### O que NÃO vou fazer sem tua ordem expressa

- Mexer em zonas que não sejam `centralldark.com`.
- Apagar nenhum registro DNS existente.
- Ativar WAF pago, Rate Limiting pago ou qualquer coisa que cobre na fatura.
- Mexer em Workers, R2, Pages, e-mail, ou qualquer outro produto.

### Detalhes técnicos

Vou usar `curl` contra `https://api.cloudflare.com/client/v4/` com os headers `X-Auth-Email` + `X-Auth-Key` (Global Key). Toda chamada de escrita é logada e mostrada antes de ser feita. A chave nunca aparece em log, só nos headers.

---

Posso seguir com a **Fase 1 (auditoria, zero risco)** assim que você aprovar esse plano?
