# COMANDO - 00-master-orchestrator.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\centraldark-hardening-pack\CentralDark-Runtime-Closed-Loop-01\prompts\00-master-orchestrator.md
**SHA:** a4e9a7e8cf9f40ef
**Timestamp:** 2026-08-26T19:10:16.215342
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- NEXT_GATE:

### Ouro Bruto (primeiros 5000 chars)
```
#ACORDA !CALIBRAR

MISSION_ID=CENTRALDARK-RUNTIME-CLOSED-LOOP-01
REPOSITORY=ServerVpss/CentralDark

OBJETIVO:
Transformar a depuração manual comprovada do CentralDark em garantia de runtime autônoma, determinística, evolutiva, auditável e fail-closed.

REGRAS:
1. Medir o estado remoto e o runtime antes de interpretar.
2. Reutilizar `scripts/sentinela/run.mjs`, `scripts/sentinela/drift.mjs`, `sentinela-divergencias.yml` e `vps-healthcheck.yml`.
3. Não criar monitor paralelo.
4. Código determinístico resolve o conhecido.
5. LLM local apenas tria, resume e correlaciona.
6. Agente de fronteira recebe somente UNKNOWN sanitizado.
7. Um escritor por escopo.
8. Judge separado, read-only.
9. Nenhum log é apagado antes de snapshot, hash e artifact.
10. Nenhum valor secreto pode aparecer em saída.

BOOT:
- Leia integralmente `LEIA-ME-IA.md`, `AGENTS.md`, a Meta Lupa canônica e a arquitetura Delta.
- Verifique branch, HEAD, PRs e writers atuais.
- Valide a identidade vigente da Meta Lupa.
- Não confie no relato anterior sem re-medição.

FASES:
A. Ler `artifacts/discovery-*` e comprovar hardware, runtimes, PM2, portas, rotas, Git e logs.
B. Produzir mapa ponta a ponta:
   processo → script → cwd → config → porta → proxy → endpoint → auth → upstream → consumidor → logs → workflow → owner.
C. Classificar cada ligação: CONFIRMED, PARTIAL, STALE, ORPHAN, DUPLICATE, DEAD ou UNKNOWN.
D. Mapear detectores existentes e ausentes.
E. Definir matriz:
   KNOWN_SAFE_AUTOFIX | KNOWN_HUMAN_GATE | UNKNOWN_AI_INVESTIGATION | BLOCKED.
F. Propor diff mínimo dentro da árvore canônica da Sentinela.
G. Somente depois aplicar gate de escrita em branch/worktree isolada.
H. Testes primeiro; Meta Lupa; HEAD congelado; Judge separado; PR único.

SAÍDA OBRIGATÓRIA:
MISSION_ID=
MODE=READ_ONLY|ISOLATED_WRITE|JUDGE
STATUS=
WRITER=
MAIN_HEAD=
BRANCH=
HEAD=
ACTIVE_PR=
VPS_MUTATED=false
SECRETS_READ=false
LOGS_DELETED=false

FACTS:
INFERENCES:
UNKNOWN:
TOPOLOGY:
FINDINGS:
EXISTING_CAPABILITIES:
MISSING_CAPABILITIES:
MODEL_RUNTIME:
MODEL_RECOMMENDATION:
AUTOFIX_ALLOWLIST:
HUMAN_GATES:
PROPOSED_DIFF:
TEST_MATRIX:
JUDGE:
RECEIPT:
NEXT_GATE:

Não volte com plano genérico. Entregue fatos reproduzíveis.

```