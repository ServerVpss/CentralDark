```
┌──────────────────────────────────────────────────────────────────┐
│  🎓 AULA DO TUTOR — HERMES mantém o GRAFO VIVO · 03/07/2026       │
│  "quem chama quem" com estado real do PM2 + gateway               │
│  Gerador: scripts/grafo-vivo/gerar-grafo-vivo.mjs                 │
└──────────────────────────────────────────────────────────────────┘
```

# 🎓 Grafo Vivo — manter o mapa "quem chama quem" respirando

## 🗺️ O que é

A aba **🕸️ Grafo Vivo — quem chama quem** em `status.centralldark.com` desenha a arquitetura como um grafo de força (force-graph, partículas fluindo nas arestas = fluxo de chamadas). Antes era uma **foto estática** de 02/07. Agora é **vivo**: reflete o estado real do sistema a cada regeneração.

```
scripts/grafo-vivo/gerar-grafo-vivo.mjs           apps/modulos/status/
   │ lê pm2 jlist  (status por processo)              graph-data.json  (feed)
   │ lê gateway.log (atividade recente)      ──grava──►      ▲
   │ preserva topologia curada (nodes/edges)                 │ fetch a cada load
   ▼ sobrepõe status vivo (🟢/🔴 no label)          index.html + app.js  🔒 (render)
```

**Divisão sagrada:** o **render** (`index.html`, `app.js`) é 🔒 protegido — só leitura. O **feed** (`graph-data.json`) é dado, atualizado de rotina (igual `painel-data.json`). O gerador só toca o feed.

## 🧠 AULA: regenerar o grafo com estado real

**Contexto:** manter o grafo refletindo a realidade (processo que caiu, gateway ativo, novo serviço).
**Anti-padrão:** editar `graph-data.json` na mão (quebra a topologia curada) ou mexer no render protegido.

**Explicação:** o gerador lê o `graph-data.json` como topologia-verdade, roda `pm2 jlist`, casa cada nó com seu processo (alias + nome normalizado), põe 🟢/🔴 no label conforme o status, adiciona processos vivos que ainda não eram nós (Hermes, Zentinel, Guardiões…) ligados à VPS, mede atividade recente do `gateway.log`, e recalcula `stats` + `updatedAt`. Não destrói nada — sobrepõe.

**Comandos práticos:**
```bash
# testar sem gravar (imprime resumo + stats)
node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs --dry
# regenerar de verdade (grava o feed)
node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs
# validar o feed
python3 -c "import json;d=json.load(open('/root/CentralDark/apps/modulos/status/graph-data.json'));print(d['stats']['online'],'online /',d['stats']['offline'],'off')"
```

## 🧠 AULA: adicionar um processo/serviço novo ao grafo

**Contexto:** subiu um serviço PM2 novo e ele deve aparecer no mapa.
**Anti-padrão:** adicionar nó direto no JSON (some na próxima regeneração).

**Explicação:** a fonte é o mapa `LIVE_EXTRA` dentro do gerador (`id → {label, type, group}`). Nó que está lá vira automático quando o processo aparece no PM2. Tipos que o render sabe colorir: `orquestrador` (verde), `bot` (âmbar), `gateway` (roxo), `servico` (azul), `storage` (cinza), `monitoramento` (rosa), `ia` (verde).

**Comandos práticos:**
```bash
# 1) ver processos vivos que ainda NÃO estão no grafo
node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs --dry   # compara nós vs pm2
# 2) editar o mapa (adicionar a entrada em LIVE_EXTRA) — via escrever_arquivo
# 3) regenerar e validar
node /root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs
```

## 🔁 Manter respirando

O render faz `fetch('./graph-data.json')` a cada load da página. Pra ser "tempo real", o gerador precisa rodar de tempos em tempos. Opções:
- Hermes roda numa missão de manutenção periódica (recomendado agora).
- Futuro: cron / loop dedicado (`* /5 * * * *`) ou o `vigia.mjs` do Hermes chamando o gerador.

**Sinais no grafo:** nó 🔴 no label = processo caído (investigar com `pm2 describe <nome>`); arestas mais grossas chegando no `elite-http-gateway` = tráfego real de ChatGPT nos últimos 15min.
