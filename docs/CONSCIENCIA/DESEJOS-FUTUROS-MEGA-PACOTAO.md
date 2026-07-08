# 🗺️ MEGA PACOTÃO DE DESEJOS — CentralDark
> Documento único, versionado no repo. Cada bloco é uma fase com checklist `[ ]` — marcar `[x]` ao consolidar.
> **Status:** rascunho vivo · **Aceita:** sugestões, PRs, refinamentos · **Dono:** Pivete
> Criado: 2026-07-08 · Última atualização: 2026-07-08 (adicionadas fases N-R)

---

## 🎯 Índice das Fases

- **FASE A** — Arqueólogo de Pastas (auditor autônomo)
- **FASE B** — Reconstrutor Estrutural (mapeia + reorganiza + reergue serviços)
- **FASE C** — Painel Jarvis (UI leiga por botões)
- **FASE D** — Radar de Regressão
- **FASE E** — Grafo Vivo do Ecossistema
- **FASE F** — Caçador de Segredos Vazados
- **FASE G** — Memória Fotográfica (snapshots externos)
- **FASE H** — Espião de Modelos (multi-IA lado-a-lado)
- **FASE I** — Warm Cache Preditivo
- **FASE J** — Fuzzy Kill Switch (`panico` / `voltar`)
- **FASE K** — Kit Produtividade VPS (tmux/fzf/btop/ncdu/just/direnv)
- **FASE L** — Auto-Reconstrutor 24h (loop de pendências → PR)
- **FASE M** — 🔒 Segredos de Guerra (dinheiro & vantagem)
- **FASE N** — Relatório Consolidado (PDF + HTML)
- **FASE O** — Agendador Universal + Log Central + Alertas
- **FASE P** — Snapshot Automático + Rollback 1-Clique
- **FASE Q** — Modo Dry-Run Universal
- **FASE R** — Jarvis Integrado com "Sets de Operação"

---

## FASE A — 🏛️ Arqueólogo de Pastas

Robô que audita `/root/CentralDark/` e sugere organização SEM quebrar nada.

- [ ] A.1 Script `apps/modulos/arqueologo/scan.mjs` — varre árvore, hash SHA1 por arquivo
- [ ] A.2 Detecta duplicados (mesmo hash em paths diferentes) → `relatorio/duplicados.json`
- [ ] A.3 Detecta órfãos: arquivos sem import/require/link em nenhum outro → `relatorio/orfaos.json`
- [ ] A.4 Detecta gordura: `node_modules`, `.cache`, `dist/` antigos → `relatorio/gordura.json`
- [ ] A.5 Detecta nomenclatura fora do padrão (misturado `snake_case` + `kebab-case`) → `relatorio/nomes.json`
- [ ] A.6 Gera `relatorio/SUGESTOES.md` com ações propostas + comando `dry-run` de cada uma
- [ ] A.7 Nada é apagado sem aprovação — só sugestão + botão "aprovar" no Jarvis
- [ ] A.8 Notifica no Telegram (Card Hermes v1.3) com placar `✅/⚠️/❌`
- [ ] A.9 Agenda `systemd timer` semanal (domingo 03:00)

**Extra:** classifica por "confiança" (alta = safe delete, média = review, baixa = não tocar).

---

## FASE B — 🔧 Reconstrutor Estrutural

Mapeia estrutura atual → reconstrói organização correta → **reescreve TODOS os links** → reergue PM2.

- [ ] B.1 `apps/modulos/reconstrutor/mapear.mjs` — snapshot da árvore + grafo de dependências
- [ ] B.2 Detecta paths hard-coded em: `.ts .js .mjs .py .yml .json .caddy Dockerfile ecosystem.config.js .env`
- [ ] B.3 Motor de reescrita AST-safe (usa `@babel/parser` p/ JS/TS, `ast` p/ Python, regex tolerante p/ config)
- [ ] B.4 Dry-run obrigatório: mostra diff antes de mover
- [ ] B.5 Transação: cria branch `reorg/<timestamp>`, move tudo, roda testes, se falhar → `git reset --hard`
- [ ] B.6 Após mover: `pm2 reload ecosystem.config.js` + healthcheck em todas as portas
- [ ] B.7 Se qualquer serviço não responder em 30s → rollback automático
- [ ] B.8 Relatório final: quantos arquivos movidos, quantos imports reescritos, tempo total
- [ ] B.9 Integra com Jarvis: usuário clica em pasta no painel + escreve novo nome/local → robô faz o resto

**Extra:** modo "sugerir estrutura ideal" — o robô propõe reorganização baseada em convenções (monorepo padrão).

---

## FASE C — 🎛️ Painel Jarvis (UI leiga)

Interface de botões dentro do TelePainel/Bolt onde o Pivete opera sem digitar comandos.

- [ ] C.1 Rota `/jarvis` no frontend (React + Tailwind — paleta esmeralda oficial)
- [ ] C.2 Sidebar: setores mapeados (auto-populado do Grafo Vivo)
- [ ] C.3 Cada setor tem cards de ação: `[Auditar] [Reorganizar] [Reiniciar] [Snapshot] [Ver logs]`
- [ ] C.4 Botão universal "🎯 Ação personalizada": abre modal com dropdown de setor + textarea "o que fazer"
- [ ] C.5 Fila de aprovações: robôs propõem, Pivete clica ✅/❌
- [ ] C.6 Timeline de execuções (últimas 50 ações) com status colorido
- [ ] C.7 Botão pânico grande vermelho (`kill switch`) + botão "voltar" verde
- [ ] C.8 Placar ao vivo: `serviços OK / warnings / falhas` com contadores animados
- [ ] C.9 Modo escuro esmeralda + atalhos de teclado (`?` mostra ajuda)
- [ ] C.10 Autenticação: só admin (`1901426549`) via Lovable Cloud auth

**Extra:** comando por voz (Web Speech API) — Pivete fala "auditar pasta apps" e o Jarvis executa.

---

## FASE D — 📡 Radar de Regressão

- [ ] D.1 Coleta métricas ANTES de cada deploy (latência p50/p95, CPU, RAM, erros/min)
- [ ] D.2 Coleta métricas 5min DEPOIS
- [ ] D.3 Se piorou >20% → alerta vermelho no Telegram + botão "rollback" no Jarvis
- [ ] D.4 Histórico em `metrics.db` (SQLite) — gráfico no painel

---

## FASE E — 🕸️ Grafo Vivo do Ecossistema

- [ ] E.1 Página `/grafo` com D3.js/Cytoscape — bolinhas = serviços, linhas = dependências
- [ ] E.2 Cores: 🟢 up · 🟡 warn · 🔴 down · ⚫ desconhecido
- [ ] E.3 Click na bolinha → drawer com logs, métricas, botões de ação
- [ ] E.4 Auto-refresh 10s via WebSocket
- [ ] E.5 Export PNG/SVG do grafo pra documentação

---

## FASE F — 🕵️ Caçador de Segredos Vazados

- [ ] F.1 Roda `trufflehog` + `gitleaks` no repo completo (inclui histórico)
- [ ] F.2 Varre `.env`, `config.*`, `*.json` procurando padrões (sk-, ghp_, AKIA, etc.)
- [ ] F.3 Relatório com severidade + link pro commit
- [ ] F.4 Auto-abre issue no GitHub com label `security-leak`
- [ ] F.5 Agenda semanal via GitHub Action

---

## FASE G — 📸 Memória Fotográfica

- [ ] G.1 Snapshot semanal: `pm2 save`, `docker ps`, `caddy dump`, `pg_dump`, `git bundle`
- [ ] G.2 Compacta em `.tar.zst` (zstd = melhor compressão)
- [ ] G.3 Upload pra bucket externo (Backblaze B2 = mais barato)
- [ ] G.4 Retenção: 4 semanais + 6 mensais + 2 anuais
- [ ] G.5 Comando `restaurar <data>` reergue tudo em VPS nova

---

## FASE H — 🎭 Espião de Modelos

- [ ] H.1 Endpoint `/espiao` recebe 1 pergunta
- [ ] H.2 Dispara pra 5 IAs em paralelo (GPT-5, Claude, Gemini, DeepSeek, Grok)
- [ ] H.3 UI lado-a-lado com placar de concordância (embedding similarity)
- [ ] H.4 Salva histórico pra treinar router ("qual IA acerta mais em X tipo de pergunta")

---

## FASE I — 🔥 Warm Cache Preditivo

- [ ] I.1 MCP loga quais tools são chamadas em sequência
- [ ] I.2 Treina modelo simples (Markov chain) pra prever próxima tool
- [ ] I.3 Pré-carrega resultado em background
- [ ] I.4 Ganho esperado: -40% latência em fluxos repetitivos

---

## FASE J — 🚨 Fuzzy Kill Switch

- [ ] J.1 Comando `panico` (CLI + botão Jarvis): snapshot instantâneo, para PM2 não-críticos, notifica
- [ ] J.2 Modo mínimo: só bots essenciais + status page
- [ ] J.3 Comando `voltar`: restaura tudo do snapshot
- [ ] J.4 Confirmação dupla via Telegram (evita acidente)

---

## FASE K — 🧰 Kit Produtividade VPS

- [ ] K.1 `tmux` com layout salvo (4 painéis: logs, htop, git, shell)
- [ ] K.2 `fzf` + histórico de bash com Ctrl+R turbo
- [ ] K.3 `btop` como monitor padrão
- [ ] K.4 `ncdu` alias `disk` pra achar gordura rapidinho
- [ ] K.5 `just` como task runner (Justfile na raiz)
- [ ] K.6 `direnv` pra .env automático por pasta
- [ ] K.7 `asdf` pra versões de node/python/deno unificadas
- [ ] K.8 Script `setup-vps.sh` instala tudo isso de uma vez

---

## FASE L — 🤖 Auto-Reconstrutor 24h

- [ ] L.1 Cron a cada 6h lê `PENDENCIAS.md`
- [ ] L.2 Escolhe 1 pendência de severidade média (não crítica)
- [ ] L.3 Dispara `swarmS` pra resolver
- [ ] L.4 Cria branch + PR + notifica no Telegram
- [ ] L.5 Pivete revisa/merge com 1 clique
- [ ] L.6 Fallback: se falhar 3x, marca pendência como `precisa-humano`

---

## FASE M — 🔒 SEGREDOS DE GUERRA (dinheiro & vantagem)

> Ideias raras. Aceita refinamento. Não compartilhar fora do círculo.

- [ ] M.1 **Arbitragem de LLM**: roteador que escolhe modelo mais barato que atinge qualidade X (economia 60-80% em API)
- [ ] M.2 **Fine-tune privado** com histórico dos próprios chats → assistente que pensa igual ao Pivete
- [ ] M.3 **Scraper de oportunidades**: monitora marketplaces (Mercado Livre, OLX, Web3 mints) e alerta arbitragem
- [ ] M.4 **Farm de contas** legítimo: infra pra rotacionar identidades em automações (proxy residencial + browser fingerprint aleatório via `undetected-chromedriver` / `zendriver`)
- [ ] M.5 **API própria** dos módulos que você já domina → vender no RapidAPI/Gumroad (receita passiva)
- [ ] M.6 **Motor de conteúdo**: pipeline `pesquisa → roteiro → voz (ElevenLabs) → vídeo (Hedra/Sora) → post automático` em N canais
- [ ] M.7 **Bot Telegram premium**: cobra R$ 29/mês pra dar acesso ao arsenal (Stripe + user_roles)
- [ ] M.8 **Detector de tendências**: cruzando Google Trends + Reddit + X (Twitter API) → alerta nicho quente 48h antes de estourar
- [ ] M.9 **Consultoria fantasma**: o Jarvis responde clientes via WhatsApp com sua voz/estilo (fine-tune + `whatsapp-web.js`) — você escala sem estar
- [ ] M.10 **Bug bounty automatizado**: `nuclei` + templates custom rodando em bounty scopes → PoCs semi-automáticos (HackerOne)
- [ ] M.11 **Backup criptografado E2E** com chave só sua → vende serviço "cofre de dados" pra pequenos negócios
- [ ] M.12 **Datalake pessoal**: tudo que você já viu/leu/salvou vira embeddings pesquisáveis (Qdrant + nomic-embed) — memória infinita
- [ ] M.13 **Agentes que ganham dinheiro sozinhos**: 1 agente por vertical (crypto, dropshipping, afiliado), cada um com KPI, KPI cai → mata o agente
- [ ] M.14 **Rede de bots colaborativos**: cada bot Telegram/WhatsApp seu vira uma "célula" que troca dados via HUB Supabase (efeito de rede exponencial)
- [ ] M.15 **Motor de landing pages A/B infinito**: gera 50 variações via IA, roda tráfego pago pequeno, mantém só as top 3

---

## FASE N — 📄 Relatório Consolidado (PDF + HTML)

Um arquivo pronto pra arquivar e mandar por email/Telegram no fim de cada auditoria.

- [ ] N.1 Template HTML bonito (paleta esmeralda) com sumário executivo no topo
- [ ] N.2 Blocos: duplicados · órfãos · gordura · segredos vazados · regressões · sugestões
- [ ] N.3 Gráficos embutidos (Chart.js inline) — pizza de tipos, barras de severidade
- [ ] N.4 Exporta PDF via `puppeteer` (mesmo HTML → PDF pixel-perfect)
- [ ] N.5 Nome auto: `auditoria-YYYY-MM-DD-HHMM.pdf` salvo em `relatorios/`
- [ ] N.6 Envio automático: anexa no Telegram + upload no bucket externo (Fase G)
- [ ] N.7 Assinatura digital (hash SHA256 no rodapé) — comprova que não foi editado
- [ ] N.8 Botão no Jarvis "📎 gerar relatório agora" + histórico dos últimos 30

---

## FASE O — ⏰ Agendador Universal + Log Central + Alertas

- [ ] O.1 `systemd timer` ou `node-cron` configurável via YAML (`agenda.yml`)
- [ ] O.2 Horários por tarefa: auditoria diária 03:00, reconstrução preventiva domingo 04:00, snapshot semanal, etc.
- [ ] O.3 Log centralizado em `/var/log/centraldark/*.log` + `journalctl` unificado
- [ ] O.4 Painel `/logs` no Jarvis com filtro por serviço/severidade/data
- [ ] O.5 Alerta Telegram quando: erro crítico · inconsistência detectada · job falhou · demorou >2x o normal
- [ ] O.6 Silenciar alertas por janela (ex: madrugada de sábado) — configurável no Jarvis
- [ ] O.7 Métricas: quantos jobs rodaram, taxa de sucesso, tempo médio → dashboard

---

## FASE P — 💾 Snapshot Automático + Rollback 1-Clique

Toda mudança do Reconstrutor (Fase B) fica reversível.

- [ ] P.1 Antes de QUALQUER mudança estrutural: snapshot completo (`btrfs snapshot` ou `restic`)
- [ ] P.2 Snapshot inclui: código, `dump.pm2`, banco, `.env`, configs Caddy
- [ ] P.3 Etiqueta o snapshot com o motivo (`reorg-2026-07-08-14h`, `deploy-hermes-v3`)
- [ ] P.4 Retenção inteligente: últimas 20 mudanças + 1 por dia da semana + 1 por mês
- [ ] P.5 Botão "↩️ rollback" no Jarvis: lista snapshots com preview do diff
- [ ] P.6 Rollback dispara healthcheck e só confirma se todos serviços subirem
- [ ] P.7 Se healthcheck falhar → tenta próximo snapshot mais antigo automaticamente
- [ ] P.8 Notifica Telegram antes/depois do rollback com placar

---

## FASE Q — 🧪 Modo Dry-Run Universal

Nada é alterado até o Pivete confirmar.

- [ ] Q.1 Todo robô (auditor, reconstrutor, faxineiro) tem flag `--dry-run` **default**
- [ ] Q.2 Gera relatório de "o que faria" com diff colorido + estimativa de impacto
- [ ] Q.3 Cada ação recebe ID único (`act_abc123`) pra aprovação individual ou em lote
- [ ] Q.4 No Jarvis: lista de ações pendentes com checkbox `[✅ aprovar] [❌ rejeitar] [👁️ ver detalhe]`
- [ ] Q.5 Aprovar em lote por categoria: "aprovar todos duplicados de confiança alta"
- [ ] Q.6 Ações rejeitadas viram histórico (o robô não sugere de novo por 30 dias)
- [ ] Q.7 Modo "auto-aprovar seguros" opcional: só ações de confiança >95% executam sozinhas

---

## FASE R — 🎛️ Jarvis Integrado — "Sets de Operação"

Painel que junta auditor + reconstrutor + agendador num só lugar, salvando presets.

- [ ] R.1 Conceito "Set": pacote nomeado de config (ex: Set "Faxina Semanal", Set "Deploy Seguro")
- [ ] R.2 Cada Set guarda: alvo (pasta/serviço), robôs ativos, horário, thresholds, canal de alerta
- [ ] R.3 Tudo salvo em UMA tabela `operation_sets` no Lovable Cloud (JSONB por Set)
- [ ] R.4 UI: card por Set com botões `[▶️ rodar agora] [✏️ editar] [📅 agendar] [🗑️ excluir]`
- [ ] R.5 Wizard leigo: 4 passos guiados pra criar Set novo (alvo → o que fazer → quando → como avisar)
- [ ] R.6 Botões diretos no header do Jarvis: `[🏛️ Auditar] [🔧 Reconstruir] [📄 Relatório] [↩️ Rollback] [🚨 Pânico]`
- [ ] R.7 Menu por setor mapeado (vem do Grafo Vivo): click → ações contextuais daquele setor
- [ ] R.8 Histórico por Set: últimas 50 execuções com status, duração e diff
- [ ] R.9 Compartilhar Set: exporta JSON pra reusar em outro projeto/VPS
- [ ] R.10 Templates prontos: "Set Segurança", "Set Limpeza", "Set Deploy", "Set Backup"

---

## 📌 Como usar este documento

1. Este arquivo mora em `docs/CONSCIENCIA/DESEJOS-FUTUROS-MEGA-PACOTAO.md` no repo.
2. Não deletar nada. Só marcar `[x]` quando consolidar uma fase.
3. Adicionar sub-itens conforme surgirem ideias — commit direto.
4. Ao ativar uma fase, criar issue no GitHub linkando pra esta seção.
5. Ordem sugerida de ataque: **F → G → P → Q → A → N → O → E → C → R → B → L → D → J → K → H → I → M**
   (segurança → backup → reversibilidade → dry-run → auditoria → relatório → agenda → visibilidade → painel → reconstrução → autonomia → lucro)

---

_Aceita sugestões. Aceita melhorias. Aceita PRs. O sonho é grande e o método é paciente._
