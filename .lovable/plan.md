## 🩺 Diagnóstico agora (antes de mexer)

- 🟢 **Hermes ONLINE** (pm2 id 66, `CentralDark-Hermes`). Não parou — está no loop de 5s vigiando `missoes/pendente/`.
- 🟡 **Sem missão ativa**: `pendente/` e `em-andamento/` vazios. Ele não "morreu", ficou **ocioso por falta de trabalho**.
- ⏱️ **Turnos atuais** (daemon.mjs):
  - Loop de vigília: **5 s** entre varreduras
  - Entre etapas de uma missão: **2 s**
  - Retry quando decisor falha: **10 s**
  - Timeout por modelo: 15 s (Flash) → 30 s (Pro) → 45 s (GPT-5-mini) → 30 s (Claude Elite)
- 🧠 **Últimas execuções**: Flash respondendo 2–4 s em 95% das etapas; Pro entrou 1× em 4,7 s. Nenhuma queda pra GPT-5-mini nem pra Elite hoje.
- 📊 **O que o decisor JÁ sabe e não envia pro card**: `_modelo_usado`, tempo em ms, cadeia de fallback tentada, contagem de aprendizados por categoria.

---

## 🎯 O que vai ser feito

### 1. Card admin enriquecido (`daemon.mjs` + `decisor.mjs`)
Adicionar ao card monoespaçado de cada etapa:

```
🔨 HERMES — etapa 4 · 18:42
├─ Missão   : hub-mtproto
├─ Passo    : vps_write_file
├─ IA usada : gemini-3-flash-preview  (2.4s)
├─ Cadeia   : ✅ Flash · ⏭ Pro · ⏭ GPT5m · ⏭ Elite
├─ XP       : 47 lições · +1 nesta etapa
├─ Balanço  : Flash ▓▓▓▓▓▓▓▓░░ 82%
│             Pro   ▓▓░░░░░░░░ 15%
│             GPT5m ░░░░░░░░░░  2%
│             Elite ░░░░░░░░░░  1%
├─ Turno    : 5s vigília · 2s entre etapas
└─ Progresso: ▓▓▓▓▓░░░░░ 50%
```

- **IA usada + tempo**: já capturado (`_modelo_usado`, `Date.now()-t0`) — só falta enviar.
- **Cadeia**: mostra qual nível respondeu e quais foram pulados/falharam.
- **XP**: contar total de lições em `aprendizados.json` + delta da etapa.
- **Balanço**: manter contador rolante (últimas 100 etapas) em `stats.json` — % de uso de cada IA + barra 10 blocos.
- **Turnos**: exibir os intervalos vigentes.

### 2. Card de "refinamento" ao fim da missão
Extra card ao concluir:
- Qual IA ajudou mais (contagem de decisões aceitas por modelo)
- Ganho médio de latência (Flash vs Pro)
- Aprendizados novos gravados
- Sugestão automática: "Flash está dando conta → manter"; ou "Flash falhou 3×, subir threshold pra Pro direto"

### 3. Garantir 24 h sem ocioso
Dois níveis:
- **Missão-sentinela permanente**: criar `missoes/recorrentes/heartbeat.md` que o daemon dispara a cada 30 min se `pendente/` estiver vazio (auto-diagnóstico + relatório curto pro admin). Isso força "vida" e valida a cadeia sem gastar muito.
- **Watchdog externo**: cron 5 min (`pm2 describe 66`) — se `status != online` OU `uptime < 20s` repetidas, notifica admin no privado. Nunca fica em silêncio quando cair.

### 4. Notificação sobre turnos (agora)
Enviar 1 card admin explicando exatamente os intervalos atuais + status "vivo, aguardando missão".

---

## 🔧 Detalhes técnicos

**Arquivos tocados (VPS):**
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/daemon.mjs` — enriquecer `card()` e adicionar `stats.json`.
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/decisor.mjs` — expor cadeia tentada (`_cadeia_tentada: [{modelo, ms, ok}]`).
- **Novo**: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/stats.mjs` — helpers de contagem/barra.
- **Novo**: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/missoes/recorrentes/heartbeat.md`.
- **Novo**: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/watchdog.sh` + entry no cron (`*/5 * * * *`).

**Sem tocar em**: notify.mjs (já monoespaçado), padrões de emojis, whatsapp-server, áreas 🔒.

**Backup antes**: `.bak3` em daemon.mjs e decisor.mjs.

**Restart**: `pm2 restart 66 --update-env` + `pm2 save`.

---

## ✅ Como valida

1. Após restart, próxima etapa de qualquer missão traz o card novo com IA + cadeia + XP + balanço.
2. `cat stats.json` mostra distribuição rolante.
3. Sentinela dispara em ≤ 30 min → card no admin comprovando "vivo".
4. Cron watchdog roda `pm2 describe 66` a cada 5 min sem alertar (baseline).

Confirma que posso executar e eu já disparo tudo em sequência.
