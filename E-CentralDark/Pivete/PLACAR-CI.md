# 🟢🟡🔴 PLACAR CENTRALDARK — STATUS FIXO

> Regra das bolinhas:
> 🟢 = resolvido / verde / prova real
> 🟡 = em andamento / pendente merge ou run / PAUSADO aguardando input
> 🔴 = bloqueado / falta ação ou decisão
>
> Atualizado sob demanda. Pede "PLACAR" ou "TABELA" que eu trago fresco.

---

## 🔧 PLACAR CI (erros medidos na base)

| # | Erro CI | Causa (medida) | Correção | PR | Prova | Status |
|---|---------|----------------|----------|----|-------|--------|
| 1 | `porta-de-entrada` base FAIL (fonte externa) | gate certo barra `SynkraAI/aiox-core` sem escape | sanitiza tokens, mantém hashes/inspected_sha | #1378 | grep=0 tokens ✅ | 🟡 OPEN (run FAIL: destravou #4) |
| 2 | `codex-validate` FAIL | `auditarFinalizacao` sumiu do `agent.mjs` (#1336) | restaura estado canônico 1490417d8 | #1371 | 26/26 ✅ | 🟢 MERGED |
| 3 | `Lupa Drift Guard` FAIL | `lupa-bayesiana` paralela à MetaLupa | alias compatível validado | #1372 | drift exit 0 ✅ | 🟢 MERGED |
| 4 | `porta-de-entrada` FAIL (após #1) | `aplicarGatePercepcao` sumiu do `decisor.mjs` | restaura estado canônico db8dd290f | #1379 | 34/34 ✅ | 🟡 OPEN (run 33310488718 pending) |

**Resumo:** 2 verdes (mergeados), 2 amarelos (PRs abertos, prova local ok, falta merge/run do runner).

---

## 🏰 PLACAR CONSOLIDAÇÃO HARNESS (menos é mais, zero regressão, sem V2)

| Onda | Alvo | Estado medido | Ação | Status |
|------|------|---------------|------|--------|
| 0 | Mapear arquitetura existente | 47 skills / 23 módulos / trigger-fabric+HERMES-CORE+omni-router+enxame+naps | mapa único de redundância | 🟡 aguardando corte do Chefe |
| 1 | Núcleo de orquestração (harness) | trigger-fabric(30 doc) / HERMES-CORE(core) / omni-router(1 cérebro 689l + 3 wrappers) / enxame(1 sh) / naps(snapshots) | consolidar 1 ponto de entrada | 🟡 **PAUSADO** — aguardando contexto SSR/tela do Chefe |
| 2 | Colapsar skills duplicadas | Lupa×3, git×4, memória×3, síntese×3 | fundir por domínio + redirect | 🔴 não iniciado |
| 3 | Unificar módulos de transporte | elite-gateway+proxy+oauth-broker+mcp | 1 `gateway` canônico | 🔴 não iniciado |

**Resumo:** 0 verde, Onda 1 pausada p/ SSR, 2 vermelhos esperando.

---

## 📡 PENDÊNCIA SSR / TELA (Screenpipe)

| Item | Estado | Nota |
|------|--------|------|
| Mecanismo confirmado | ✅ Screenpipe | pipeline: Browser tabs → Screenpipe Browser Bridge → Screenpipe agent/context |
| Já uso SSR de tela do Chefe? | ❌ não ainda | computer_use vê só tela local do Hermes; Screenpipe é o canal remoto |
| Skills na Casa | ✅ prontas | `screenpipe-hermes-integration` + `screenpipe-live-observer` já no repo |
| Ligar / mandar "umas coisas" | ⏳ Chefe vai mandar | depois disso eu aprendo a ver tela/abas/video |

---

## 📌 FIO DA MISSÃO
Revisar criticamente ANTES de executar. Extensão segura, nunca substituição. Zero regressão. Sem V1/V2/V3. Dono do castelo: SEGREDO/CHEFE. Executor: HERMES-CASA.

## 🔗 Fontes
- Repo canônico: ServerVpss/CentralDark
- Clone local: E:\CentralDark\Pivete\CentralDark
- Worktrees: E:\CentralDark\Pivete\worktrees\
- Este placar: E:\CentralDark\Pivete\PLACAR-CI.md
