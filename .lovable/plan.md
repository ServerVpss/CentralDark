
# Plano ampliado: Deploy do Hub + Painel Jarvis (visibilidade total do que a IA faz)

Entendi o que faltava: você não quer só o Hub no ar, quer **enxergar em tempo real** tudo que eu (e qualquer outro agente) fazemos na VPS — estilo painel do Homem de Ferro — e ter minha "consciência" espelhada pro seu Obsidian pra você poder chamar isso de qualquer lugar, inclusive um dia sem a Lovable.

Esse plano junta 3 coisas em uma entrega só, sem perder as pendências anteriores.

---

## PARTE 1 — Deploy automático do Hub (custo zero, direto na VPS)

Igual ao plano anterior, mantido:

- Webhook na VPS recebe push do GitHub → roda `build-hub.sh` → publica em `/var/www/hub/` → avisa no Telegram.
- Zero custo. Zero cartão. GitHub Actions fica pra depois.
- Documentação passo-a-passo em `docs/CONSCIENCIA/DEPLOY-HUB/README.md` pra você fazer sozinho.

---

## PARTE 2 — Painel Jarvis (feed ao vivo do que os agentes fazem)

Nova camada — o que resolve seu "estou cego".

### O que aparece pra você

Uma aba nova no Hub chamada **"Consciência Viva"** com:

- 🧠 **Feed ao vivo:** cada ação de IA aparece linha por linha em tempo real (agente, ferramenta usada, arquivo mexido, resultado). Estilo terminal do Jarvis.
- 📍 **Mapa de operação:** mostra ONDE cada agente está mexendo agora (VPS? Lovable? GitHub? Notion?).
- 📜 **Histórico navegável:** filtro por dia, por agente, por área (Hub, Bot, MCP, etc).
- 🔔 **Alertas:** quando alguém toca em área protegida (do CLAUDE.md seção 9), pisca vermelho.

### Como funciona por trás

```text
   Qualquer agente (eu, Claude na VPS, MCP, bot)
              │
              ▼
   Escreve 1 linha JSON em /root/CentralDark/logs/consciencia.jsonl
              │
              ├──► Espelho automático pra docs/CONSCIENCIA/LEMBRANCAS/ (git sync)
              ├──► Push pro Supabase Realtime (aba Consciência Viva atualiza sozinha)
              └──► (opcional) Espelho pro Google Drive → seu Obsidian vê no computador
```

Cada linha é um "pensamento" registrado — o que o MCP já faz parcialmente com `consolidar_pensamento` e `registrar_aprendizado`. Vou unificar tudo num único fluxo.

### Componentes

1. **`agent-log.sh`** — helper na VPS que qualquer script/agente chama com `agent-log "MCP" "editou X" "sucesso"`. Já grava no jsonl + espelha.
2. **Edge function `consciencia-stream`** — lê o jsonl e publica no Supabase Realtime.
3. **Aba React `ConscienciaViva.tsx`** no Hub — assina o canal e renderiza o feed em tempo real, com filtros e tema terminal escuro.
4. **Sync automático** pra `docs/CONSCIENCIA/LEMBRANCAS/YYYY-MM-DD.md` (commit a cada hora) — assim seu Obsidian sempre tem o histórico.

---

## PARTE 3 — Ponte pro seu Obsidian (Google Drive SIM ajuda)

**Resposta direta:** conectar o Google Drive vale a pena, sim. Serve pra:

- 🔄 **Espelhar `docs/CONSCIENCIA/` no Drive** — seu Obsidian sincroniza via Drive e você vê minha memória viva no computador, offline, no grafo.
- 📥 **Você jogar prints/notas soltas no Drive** — eu leio pelo conector e integro na consciência automática.
- 🧩 **Backup extra** — se a VPS cair, o cérebro tá em 3 lugares (VPS + GitHub + Drive).

### Como fica

```text
   VPS (docs/CONSCIENCIA/) ⇄ GitHub ⇄ Google Drive ⇄ Obsidian (seu PC)
```

O rclone bisync que já roda na VPS (tá no `status.centralldark.com`) faz metade disso. Só falta apontar uma pasta espelho.

### Ação necessária sua

Quando eu tiver autorização, você clica em conectar o **Google Drive** na área de conectores da Lovable (é o único passo manual — leva 30s). Depois é tudo automático.

---

## PARTE 4 — MOCs do seu Obsidian (o que é aquilo)

Você perguntou: **MOC = Map Of Content** (Mapa de Conteúdo). É uma nota-índice que aponta pra outras notas relacionadas. Tipo um sumário vivo.

- **MOC CentralDark** → aponta pra Hub Bot, MCP, VPS, etc.
- **MOC PM2** → só as notas sobre processos PM2.

Faz sentido total pro seu modelo mental. Se você quiser, depois desta entrega eu monto um **script que gera MOCs automáticos** dentro do `docs/CONSCIENCIA/` a partir das lembranças — aí seu Obsidian herda de graça.

Fica na fila de pendências, não misturo com este plano pra não inchar.

---

## PARTE 5 — Pendências antigas (não esqueci)

Ficam registradas via `pendencias_add` no MCP antes de executar este plano:

1. ✅ Consolidar as 2 pastas duplicadas (você pediu no início — vou fazer junto)
2. 🟡 Reconstruir hub visual completo (Serviços, Live Voice, etc — já em andamento)
3. 🟡 Notion + Drive + GitHub + VPS sincronização automática (parte disso entra aqui na PARTE 3)
4. 🟡 Consertar bagunça do Brain/Obsidian (MOCs) — vira tarefa separada
5. 🟡 Migração futura pra IA local na VPS (Ollama/llama.cpp) — mapeado, sem execução ainda
6. 🟡 Substituir Lovable a longo prazo — a PARTE 2+3 já prepara terreno pra isso

Tudo isso vira lista visível no Hub também (aba **Pendências** já existe, vou popular).

---

## Ordem de execução (o que vou fazer nesta rodada)

1. Registrar todas as pendências acima no MCP (visível pra você)
2. Consolidar as 2 pastas duplicadas do início da conversa
3. Construir PARTE 1 (deploy webhook do Hub)
4. Construir PARTE 2 (Consciência Viva — feed ao vivo)
5. Preparar hooks de PARTE 3 (esperar você conectar Drive quando quiser)
6. Escrever o **manual do Pivete** em `docs/CONSCIENCIA/MANUAL-DO-PIVETE.md` — passo a passo pra você operar sozinho tudo isso quando eu não tiver por perto
7. Atualizar o Mega Painel

---

## Uma coisa preciso confirmar

Só isso: **posso já usar seu subdomínio `webhook.centralldark.com`** pro deploy do Hub, ou você prefere outro nome? Se não responder, sigo com `webhook.centralldark.com/hub`.

O resto tá claro. Pode aprovar que eu ataco tudo em sequência.
