# Plano — Grupo da Evolução + Mapeamento (100% VPS)

## 🚫 Trava absoluta
- **Zero Lovable** — nem painel, nem rota, nem edge function. Tudo VPS.
- **Notificação sempre monoespaçada** dentro de `<pre>...</pre>`, padrão Card Hermes v1.3. Nunca texto solto.

## 📁 Estrutura (só VPS)

```
/root/CentralDark/apps/modulos/
├── grupo-evolucao/       🆕
│   ├── agents/
│   │   ├── arquiteto.mjs        (Gemini Pro — propõe melhorias)
│   │   ├── pesquisador.mjs      (Flash + web — tendências)
│   │   ├── critico.mjs          (GPT-5 — steelman)
│   │   ├── produto.mjs          (Claude Elite — UX)
│   │   └── historiador.mjs      (Flash — cruza CONSCIENCIA)
│   ├── core/
│   │   └── orquestrador.mjs     (cascata do debate)
│   ├── missions/                (debates em execução)
│   ├── logs/                    (vereditos)
│   └── README.md
│
└── mapeamento/           🆕
    ├── agents/
    │   └── cartografo.mjs       (1 agente, cron 30min)
    ├── core/
    │   └── scanner.mjs
    ├── missions/
    ├── logs/
    │   ├── mapa-atual.json
    │   └── historico/
    └── README.md
```

## 🔄 Fluxo

1. **Cron 30min** → Cartógrafo escaneia apps/modulos/, PM2, edge functions, tabelas
2. Detecta **drift** → salva em `logs/historico/` + dispara Grupo Evolução automaticamente
3. Os 5 agentes debatem em cascata:
   Pesquisador → Arquiteto → Crítico → Produto → Historiador → Veredito
4. Veredito salvo em `grupo-evolucao/logs/vereditos/`
5. **Notificação** → Card Hermes v1.3 em `<pre>` → connector Telegram (`@srver1bot`) → privado admin (1901426549)

## 📋 Formato obrigatório da notificação

Toda notificação segue `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`:

```
<pre>
╔══════════════════════════════════╗
║   CENTRAL DARK — [MÓDULO]         ║
╠══════════════════════════════════╣
║ Status:  ✅ / ⚠️ / ❌            ║
║ Ação:    [o que aconteceu]        ║
║ Prova:   [arquivo/PM2 id/rota]    ║
║ Próxima: [next step]              ║
╚══════════════════════════════════╝
</pre>
```

Envio **sempre** via connector Telegram `sendMessage` com `parse_mode: HTML`. Proibido `notify-telegram`, proibido texto fora do `<pre>`.

## 🛠️ Infra VPS

- **PM2:**
  - `grupo-evolucao` (daemon escutando triggers)
  - `mapeamento-cron` (roda scanner a cada 30min)
- **`pm2 save`** após registrar
- **Persistência:** JSON local na VPS + espelho no HUB Supabase (`lyoigsqluyktoclwdaft`)
- **IA:** cascata usa Lovable AI Gateway (Flash/Pro/GPT-5) + Elite Gateway (Claude) — chamados direto da VPS via `LOVABLE_API_KEY`

## 🚀 Ordem de execução (modo enxame)

1. Criar 2 estruturas de pasta na VPS (paralelo)
2. Escrever os 5 agentes + orquestrador do Grupo Evolução (paralelo, 5 sub-agentes)
3. Escrever Cartógrafo + scanner do Mapeamento (paralelo)
4. Registrar no PM2 + `pm2 save`
5. Cron 30min via crontab
6. Teste ponta-a-ponta: forçar drift → debate roda → notificação Card Hermes chega no Telegram
7. Registrar áreas como 🔒 protegidas no CLAUDE.md
8. Notificação final Card Hermes confirmando tudo online

Bora disparar o enxame?
