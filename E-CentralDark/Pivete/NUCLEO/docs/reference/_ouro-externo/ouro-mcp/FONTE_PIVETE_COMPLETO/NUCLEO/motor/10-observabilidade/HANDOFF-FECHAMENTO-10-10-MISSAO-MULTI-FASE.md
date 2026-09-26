# HANDOFF — Fechamento 10/10 da missão multi-fase

**Data:** 2026-07-18  
**Autoridade:** Pivete  
**Para:** Grok da sessão Hermes Desktop (goal loop) + profile `pivete`  
**Sessões:**  
- Desktop loop: `20260718_022637_6cf626`  
- Missão multi-fase: `20260718_040020_c23e466e`  

**Regra:** não perder o fio do que já foi aprovado. Não reinventar. Não criar relatório paralelo. Atualizar só `REVISAO-TECNICA-DA-LUPA.md` + este handoff + `resultado-canonico-fase2.json` quando houver prova nova.

---

## 0. Onde parou (checkpoint real)

| Item | Estado |
|------|--------|
| Veredito atual | `FASE2_COMUNICACAO_APROVADA_CONDICIONADA` |
| Orquestrador real | `xai-oauth:grok-4.5` (modo **condicionado** — Claude não entrou) |
| Executor planejado | `xai-oauth:grok-build-0.1` |
| Crítico real | `xai-oauth:grok-4.5` |
| Codex | autenticado, **429 usage_limit** — preservar, não depender |
| Anthropic no usage da missão | **0 calls** (histórico) |
| Gateway pivete | online (reload já provado) |
| Profile | único `pivete` |
| `E:\CentralDark\backups` ACL | não mexer |

**Já fechado de verdade (não refazer):**

- Fase 1 inventário/backup (preservada / congelada no NÚCLEO)
- Pipeline voz: Edge MP3 → ffmpeg OGG/Opus → `sendVoice` + `result.voice`
- Card Hermes mono + reply_to
- origem `.ogg.bin` fechada (bytes OGG reais; nome legado)
- STT voice / audio / document (sniff anti-`.bin`)
- Read Aloud = mesmo `text_to_speech_tool` (Edge Francisca)
- reload gateway controlado + `state.db` preservado
- rollback drill do `config.yaml`
- pytest focado 114 / suíte STT+audio 259
- resultado canônico parcial em `resultado-canonico-fase2.json`
- Autolupa **parcial** §17.4

**O que impede 10/10 (lista honesta):**

1. Orquestração multi-modelo **incompleta** (Claude não foi orquestrador)
2. Harness formal de **dedupe inbound por `update_id`**
3. **Fases 3–9** da missão original com checklist executável (abaixo) — ainda abertas
4. **Autolupa final** multi-fase + resposta final canônica `MISSÃO ENCERRADA`
5. Alguns gates da lista-mestre original ainda abertos (memória/busca/roteamento/curadoria)

---

## 1. Plano de introdução Grok + Claude Code (como era pra ser)

### Hierarquia oficial (da missão / standing goal)

```text
ORQUESTRADOR  → Claude mais forte saudável (OAuth Claude Code / Anthropic)
FALLBACK+CRÍTICO → xai-oauth : grok-4.5
EXECUTOR CÓDIGO  → xai-oauth : grok-build-0.1
RÁPIDO           → xai-oauth : grok-composer-2.5-fast
CODEX            → openai-codex : gpt-5.6-luna (reserva; agora 429)
MoA              → só decisões críticas / Autolupa (preset xai-critical ou multi se Claude ok)
```

### Evidência externa já obtida (2026-07-18, fora do goal loop)

Prova mínima real (sem expor token):

```text
resolve_anthropic_token()  → OK (lê ~/.claude/.credentials.json)
chamada HTTP Messages API → HTTP 200
modelo OK                 → claude-sonnet-4-6
resposta                  → OK-HERMES-CLAUDE
```

Ou seja: **Claude Code já tem OAuth válido no PC**. O loop falhou antes por “Claude indisponível no profile / setup-token zombie / Anthropic não explicitado”, não porque a conta sumiu.

### Como reintroduzir **sem derrubar** o goal loop

**NÃO fazer:**

- matar gateway pivete sem necessidade
- trocar `model.default` no meio de um turno crítico sem backup
- colar token no chat
- reabrir OAuth no browser se o token ainda responde (evita `claude setup-token` órfão)
- usar Codex como dependência (429)

**FAZER (ordem segura):**

1. **Backup** de `profiles/pivete/config.yaml` + SHA (já existe drill; repetir se for editar de novo).
2. **Prova real isolada** (fora da conversa, via terminal/python do venv Hermes):
   - Claude: `claude-sonnet-4-6` (ou opus se responder)
   - Grok: `grok-4.5`, `grok-build-0.1`, `grok-composer-2.5-fast`
   - Codex: documentar 429, não bloquear missão
3. **Ligar Anthropic no Hermes sem copiar secret pro chat:**
   - Preferência Hermes moderna: usar store do Claude Code (`~/.claude/.credentials.json`) — `resolve_anthropic_token` já lê.
   - Só gravar `ANTHROPIC_TOKEN` no `.env` do profile se o mecanismo oficial do Hermes exigir após `hermes model` / fluxo OAuth.
   - **Nunca** exibir o token.
4. **Não trocar o cérebro da sessão mid-flight** se o adapter avisar reasoning selado (já ocorreu Codex→xAI).  
   - Preferir: manter Grok na sessão atual **e** usar Claude em:
     - testes de orquestração (chamadas mínimas)
     - subagente/delegate “orquestrador/crítico Anthropic”
     - **ou** `/new` só depois de checkpoint gravado, se for obrigatório Claude como modelo principal
5. **Repetir o passo que o Grok já fez sozinho** (auto-orquestração):
   - backup+SHA config
   - chamadas reais
   - preencher bloco `ORQUESTRAÇÃO CONFIGURADA`
   - só então seguir fases
6. Se Claude falhar de novo com prova: continuar **condicionado Grok**, mas registrar no relatório o HTTP e o modelo tentado (sem token).

### Papéis após reintrodução

| Papel | Quem | O que faz nesta retomada |
|-------|------|---------------------------|
| Orquestrador | Claude (se OK) | prioriza gates, sintetiza Autolupa, decide próximo gate |
| Crítico | Claude **ou** Grok 4.5 | tenta reprovar falso-verde |
| Executor código | grok-build-0.1 | patches mínimos, testes, harness |
| Investigação | grok-4.5 | logs, state.db, adapter, provas |
| Rápido | grok-composer-2.5-fast | resumos curtos, checklists |
| Reserva | Codex | só se 429 sumir |

---

## 2. Checklist original fases 1–9 (fonte: missão user na sessão Telegram)

> Extraído da mensagem canônica da missão `20260718_040020_c23e466e`. **Não inventado.**

### Fase 1 — Inventário e backup — ✅ feita / preservada

Inventário profile, state.db, backup SQLite consistente, integrity, restore temp.

### Fase 2 — Estabilidade + Comunicação (incorporada) — ✅ condicionada / quase 10

Seis falhas originais + fase obrigatória comunicação (Telegram/Card/TTS/STT/ReadAloud/dedupe/reload).

**Ainda falta dentro do “quase 10” da Fase 2:**

- [ ] harness formal dedupe inbound `update_id` (simular update duplicado; provar 1 processamento)
- [ ] orquestrador Claude comprovado (ou bloqueio re-testado com HTTP 200/erro novo)
- [ ] Autolupa final da **missão inteira** (não só §17.4)

### Fase 3 — Casa canônica — ⬜ executar

Comprovar mecanismo oficial:

- Hermes home / profile / state.db / sessões / skills / memória / gateway / logs  
Separar binários reinstaláveis × dados duráveis.  
**Não migrar de verdade para E: sem:** backup + restore + integrity + rollback preparado + um único profile ativo.  
**Nesta rodada preferir:** provar mecanismo + documentar plano de casa canônica; migrar só se seguro e autorizado.

**Critério verde:**

- [ ] comando/caminho oficial de profile comprovado (`--profile pivete`, `HERMES_HOME`)
- [ ] único gateway pivete; default sem processo
- [ ] rollback de config já drillado (herdar §17.3)
- [ ] texto no relatório: “casa canônica = profile pivete; E: = NÚCLEO/docs/ouro”

### Fase 4 — Curadoria CentralDark-main — ⬜ executar (somente leitura + adaptar útil)

Ler cópia local `E:\CentralDark\Pivete\CentralDark-main` (docs CONSCIENCIA, memória, orquestrador, etc.).  
Classificar: APROVEITAR / REFORMULAR / REFERENCIAR / IGNORAR / BLOQUEAR.  
**Não executar** serviços/scripts da CentralDark-main.  
Adaptar só o útil ao doméstico (Lupa, Ouro, Lei da Apuração, multi-agente, fallback, kill-switch…).

**Critério verde:**

- [ ] tabela de classificação no relatório (sem copiar repo inteiro)
- [ ] zero execução de deploy/VPS
- [ ] ≤ N mecanismos realmente adaptados ao profile/NÚCLEO (se nenhum couber, declarar IGNORAR com motivo)

### Fase 5 — Memória — ⬜ executar (mínimo seguro)

Não inflar USER/MEMORY.  
Aprimorar modelo mental: ID, chave exata, origem, confiança, correção, tombstone…  
Busca parcial só localiza; mutação só por ID/chave exata.

**Critério verde:**

- [ ] inventário: o que mora em USER / MEMORY / state.db / skills / NÚCLEO
- [ ] prova: não há duas verdades ativas para mesma chave crítica
- [ ] se patch: mínimo + teste; senão, plano escrito sem over-engineering

### Fase 6 — Busca e domínio — ⬜ executar

Inventariar FTS5 / session search / embeddings.  
Provar lexical. Semântica local: provar **ou** bloquear com evidência.  
Índice semântico, se existir, reconstruível e não substitui state.db.

**Critério verde:**

- [ ] `session_search` / FTS prova com query real
- [ ] semântica: OK com prova **ou** BLOQUEADA documentada
- [ ] domínios iniciais listados (Pivete, casa, voz, Telegram…)

### Fase 7 — Roteamento inteligente — ⬜ executar (liga com Claude+Grok)

Inventariar principal/rápido/visão/compressão/MoA/fallback.  
**Uma** política. Registrar tarefa → modelo → motivo → resultado.  
Medir com testes reais (não %).

**Critério verde:**

- [ ] política escrita no relatório (Claude orquestra se OK; senão Grok)
- [ ] ≥1 troca registrada com motivo
- [ ] fallback preserva contexto (sem segundo profile)

### Fase 8 — Fontes futuras (contratos only) — ⬜ executar

Preparar contratos **sem conectar**: Drive, Notion, Obsidian, HA, câmeras, site, banco online.  
Hierarquia: canônica / espelho / cache / índice / conflito / autoridade / rollback.

**Critério verde:**

- [ ] 1 doc de contratos no NÚCLEO (ou seção na REVISÃO) — sem sync real
- [ ] proibição explícita de multi-fonte canônica simultânea

### Fase 9 — Testes integrados + Autolupa final — ⬜ executar (fecho 10/10)

Testar Desktop, gateway, Telegram, STT, TTS, Read aloud, memória, busca, skill Lupa, roteamento, profile único, reinício, rollback.  
Crítico tenta reprovar falso-verde, duplicação, dois bancos, secret, v1/v2/v3, CentralDark executada, etc.

**Critério verde:**

- [ ] gates-mestre (lista abaixo) todos `[x]` ou `N/A justificado`
- [ ] harness dedupe `update_id`
- [ ] Autolupa final completa no relatório
- [ ] resposta final `MISSÃO ENCERRADA` + veredito

---

## 3. Gates-mestre originais (checklist de fechamento)

Copiar para o relatório e ir marcando:

```text
[x] skill da Lupa existente localizada e refinada   (se já; senão fechar)
[ ] nenhuma skill duplicada
[x] nenhum v1/v2/v3 criado
[x] backup criado
[x] restauração aprovada (protótipo Fase1 + drills config)
[x] state.db íntegro
[x] um único profile ativo
[x] Permission denied apurado
[x] Read aloud apurado
[ ] Autosave apurado (re-testar se ainda falha)
[x] Telegram preservado
[x] STT preservado
[x] TTS preservado
[x] providers preservados
[ ] CentralDark classificada
[ ] docs comparada com código e testes
[ ] conhecimento útil adaptado
[x] nenhuma execução da CentralDark (manter)
[ ] memória aprimorada
[ ] busca lexical provada
[ ] busca semântica provada ou bloqueada com evidência
[ ] roteamento testado (com Claude se OK)
[x] nenhum secret exposto
[x] rollback provado
[ ] Autolupa concluída
[ ] começo, meio e fim registrados
[ ] dedupe inbound update_id harness
[ ] orquestrador Claude comprovado OU re-bloqueio documentado com prova nova
```

---

## 4. Harness dedupe inbound (definição executável)

**Objetivo:** provar que o mesmo `update_id` do Telegram **não** gera segundo processamento de missão.

**Como provar (mínimo):**

1. Registrar `update_id` real recente (ex.: `.restart_last_processed.json` / logs gateway).
2. Localizar no código o ponto que confirma updates / offset / dedupe (adapter Telegram + gateway).
3. Teste automatizado **ou** simulação controlada:
   - injetar/replay do mesmo `update_id` (sem spam real pro chat se possível)
   - esperar: 1 processamento, 2º ignorado/observado
4. Registrar no relatório: arquivo de teste, resultado, PID gateway, marker.

**Não basta:** “só tem um gateway” (isso já está no §17 — necessário mas insuficiente).

---

## 5. Ordem de retomada recomendada (para o Grok do loop)

```text
A. Checkpoint — reler este handoff + §15–17 da REVISÃO + resultado-canonico-fase2.json
B. Auto-orquestração 2.0 — prova real Claude + Groks (sem matar loop; backup config)
C. Preencher ORQUESTRAÇÃO CONFIGURADA (Claude se 200; senão condicionado de novo)
D. Fechar residual Fase 2: harness dedupe update_id
E. Fase 3 casa canônica (provar, migrar só se seguro)
F. Fase 4 curadoria CentralDark-main (tabela)
G. Fase 5 memória (mínimo / sem inflar)
H. Fase 6 busca (lexical + semântica OK ou BLOQUEIO)
I. Fase 7 roteamento (política única com multi-modelo)
J. Fase 8 contratos futuros (sem conectar)
K. Fase 9 testes + Autolupa final + MISSÃO ENCERRADA
L. Atualizar REVISAO-TECNICA-DA-LUPA.md §18+ e resultado canônico
```

**Máx. 3 subagentes paralelos.**  
Lei da Apuração: executor / observador / crítico.  
Sem arquivos v1/v2/v3. Sem bot/gateway paralelo.

---

## 6. Mensagem pronta para colar no Hermes Desktop (goal loop)

> Cole na sessão `20260718_022637_6cf626` (ou na que estiver com standing goal).  
> Não mata o loop: é continuidade com caminho e provas.

```text
RETOMADA 10/10 — NÃO REINICIE A MISSÃO. NÃO REFAÇA O QUE JÁ ESTÁ VERDE.

Leia e obedeça integralmente:
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\HANDOFF-FECHAMENTO-10-10-MISSAO-MULTI-FASE.md

Também leia o checkpoint:
- REVISAO-TECNICA-DA-LUPA.md §15–17
- resultado-canonico-fase2.json

ESTADO HERDADO (não disputar):
- FASE2_COMUNICACAO_APROVADA_CONDICIONADA
- voz/STT/card/reload/rollback/pytest já comprovados
- profile pivete único; backups E:\CentralDark\backups intocados
- missão multi-fase 20260718_040020_c23e466e AINDA ABERTA nas fases 3–9 + Autolupa final + dedupe inbound

ORQUESTRAÇÃO (revalidar AGORA com chamada real, sem colar token):
1) Backup+SHA do config.yaml pivete antes de qualquer mudança de modelo.
2) Claude Code OAuth já existe em ~/.claude/.credentials.json e JÁ respondeu HTTP 200 com modelo claude-sonnet-4-6 em prova externa (2026-07-18). Use o mecanismo oficial do Hermes (resolve_anthropic_token / hermes model / Claude Code credentials). NÃO rodar setup-token órfão se a prova mínima passar. NÃO exibir token.
3) Hierarquia: Claude orquestrador se saudável → grok-4.5 crítico/fallback → grok-build-0.1 executor → grok-composer-2.5-fast rápido → Codex só reserva (hoje 429).
4) Se Claude falhar de novo, continue CONDICIONADO com Grok, mas registre prova HTTP.
5) Não troque provider mid-session de forma que quebre reasoning selado; prefira subagente/delegate ou /new só após gravar checkpoint.

DEPOIS da orquestração, execute na ordem do handoff:
Dedupe update_id → Fases 3 → 4 → 5 → 6 → 7 → 8 → 9 Autolupa final.

Checklist das fases 3–9 está no handoff (texto da missão original — não inventar escopo).
Relatório único: REVISAO-TECNICA-DA-LUPA.md
Resposta final obrigatória no formato MISSÃO ENCERRADA do handoff.

Continue automaticamente em ações reversíveis do escopo. Pare só em bloqueio real ou gate que exija o Pivete.
```

---

## 7. Formato de resposta final (quando 10/10)

```text
MISSÃO ENCERRADA

VEREDITO: APROVADO | CONDICIONADO | BLOQUEADO
PROFILE: C:\Users\danda\AppData\Local\hermes\profiles\pivete
CASA CANÔNICA: ...
TÉCNICA DA LUPA: ...
CENTRALDARK: aproveitado / descartado
ORQUESTRAÇÃO: Claude?... Grok?...
CORREÇÕES: ...
MEMÓRIA: ...
BUSCA: ...
ROTEAMENTO: ...
TESTES: aprovados/total
ROLLBACK: ...
DEDUPE update_id: ...
PENDÊNCIA: uma frase
PRÓXIMO PASSO: uma capacidade concreta
RELATÓRIO: E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md
```

---

## 8. O que este handoff **não** faz

- Não altera o goal loop sozinho (precisa da mensagem colada / continuidade do Hermes).
- Não migra dados para E: sem as provas da Fase 3.
- Não conecta Drive/Notion/GitHub (Fase 8 = contrato).
- Não declara 10/10 sem gates-mestre e Autolupa final.

---

*Gerado para continuidade honesta da missão multi-fase · 2026-07-18 · sem secrets*
