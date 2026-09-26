# porta-de-entrada — Anatomia do gate e raízes vermelhas (Casa)

Mapa durável do job `Porta, identidade e governança canônica estão íntegras?`
(workflow `porta-de-entrada.yml`). Sempre que a base (`origin/main`) ou um PR
estiver vermelho nesse gate, meça QUAL step falha antes de editar. Em 27/08 a
base estava vermelha em TODOS os steps por débito acumulado; cada step tem uma
raiz diferente.

## Passos observados e onde cada um falha

| Step | Script | Falha conhecida (27/08) |
|------|--------|--------------------------|
| Validar continuidade global | `scripts/lupa/validar-continuidade-global.mjs` | falso-positivo `MAIN_WRITER_SHARED_FORBIDDEN_FORCE` |
| Testar core único e adapters finos | `scripts/lupa/agent-core-adapters.test.mjs` | `ENGINE_MARKER_MISSING` / `ADAPTER_REDEFINED_CANONICAL_POLICY` |
| Testar retomada fail-closed do Hermes | `apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs` (importa `.../GraphRAG-Master/agent.mjs`) | `agent.mjs` com sintaxe corrompida |
| Validar porta, fronteira CentralDark e reuso | `scripts/lupa/validar-porta-de-entrada.mjs` | `RECONCILIACAO_SEM_TOKEN` em adapters específicos |
| Emitir todos os relatórios reproduzíveis | — | costuma falhar em cascata se algum step acima falhou |

> Se o step `Emitir relatórios` falha mas os outros passam, quase sempre é
> cascata de um step anterior que deu `failure`. Confirme o step real com
> `gh api repos/.../actions/runs/<id>/jobs`.

## Raiz 1 — validar-continuidade-global falso-positivo (COMENTÁRIO)

`validar-continuidade-global.mjs` faz:
```js
if (sharedScriptText.includes("rebase -X ours") || /git\s+push\s+--force/.test(sharedScriptText))
```
O `writer-safe-push-main.sh` tem o comentário `# - ZERO rebase -X ours`.
`.includes("rebase -X ours")` casa o COMENTÁRIO → emite
`MAIN_WRITER_SHARED_FORBIDDEN_FORCE` em 5 workflows. O `origin/main` inteiro
falha esse check.

Fixo mínimo: antes de scannear, remover linhas de comentário shell:
```js
const stripComments = (src) => src.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
const scanned = stripComments(sharedScriptText);
if (scanned.includes("rebase -X ours") || /git\s+push\s+--force/.test(scanned)) { ... }
```
Contraprova: sem o patch → 5 ERROS; com o patch → `CONTINUIDADE_GLOBAL=PASS ERRORS=0`.

## Raiz 2 — agent-core-adapters.test.mjs

Dois modos de falha, em adapters diferentes:

**(a) Assinatura de adapter fino ausente**
`ENGINE_MARKER_MISSING:<file>:<ENGINE>` / `CORE_ROUTE_MISMATCH:<file>`.
O adapter deve conter `ENGINE=<NOME>` (literal, ex: `ENGINE=CLAUDE`),
`CANONICAL_AGENT_CORE=LEIA-ME-IA.md` e os 12 `REQUIRED_ADAPTER_MARKERS`
(`ONE_SOL=true`, `LAZY_LOAD_BY_DEMAND=true`, etc). Tamanho ≤ 2400 chars.
O `CLAUDE.md` usava `ENGINE=REPLACEABLE` + `CANONICAL_BOOT = LEIA-ME-IA.md`
(formato amigável) e falhava. Adicionar bloco de markers canônicos.

**(b) FORBIDDEN_ADAPTER_POLICY pega ponteiro legítimo**
`ADAPTER_REDEFINED_CANONICAL_POLICY:<file>:/docs\/ARQUITETURA\//i` (e
`/\.agents\/skills\//i`). Seis adapters (GEMINI/CODEX/.claude/.cursor/.windsurf/
copilot) citam `docs/ARQUITETURA/JARVIS-...` e `.agents/skills/meta-lupa/...`
como "ponteiros verificáveis; não duplicam governança". O teste os proibia por
regex ampla. Fixo: remover essas 2 regex de `FORBIDDEN_ADAPTER_POLICY` (manter
as demais: redefinição de merge/autoridade/CONSCIENCIA).

> IMPORTANTE: o teste local NÃO roda no Windows (ver técnica de verificação
> abaixo). Valide no runner Linux.

## Raiz 3 — agent.mjs sintaxe corrompida

`apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs` tinha blocos
duplicados/interrompidos:
- `varrer`: `try { ... } catch {}` seguido de `} catch (error) {` órfão
  (`SyntaxError: Unexpected token 'catch'`).
- `selfTest()`: objeto `const checks = {` aberto e repetido com `const alias` /
  `const negative` duplicados.

Fixo: remover as duplicatas, deixando um único `try/catch` por função.
Verificação: `node --check agent.mjs` + rodar `continuity-guard.test.mjs`
(que o importa) → 34 pass, 0 fail.

## Raiz 4 — validar-porta-de-entrada exige tokens por adapter

`scripts/lupa/validar-porta-de-entrada.mjs` tem `semanticRequirements`
(estático). Em 27/08 só `.claude/rules/00-centraldark-boot-universal.md` e
`CHATGPT.md` estavam nessa lista, exigindo:
- `REUSE_BEFORE_CREATE_REQUIRED`
- `CONTRATO_RECONCILIACAO` (= string literal
  `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`)
- `FALHA_DE_RECONCILIACAO_DE_CONTEXTO`

Erro emitido: `RECONCILIACAO_SEM_TOKEN:<file>:<token>`. Adicionar os 3 tokens
(augmentar a assinatura de adapter).

## Padrão de resolução (R2, autorizado por !RECONCILIAR)

1. `gh run view <id> --log` + `gh api .../jobs` para achar o step exato que falha.
2. Branch de `origin/main` (NÃO do PR travado — corrija a BASE).
3. Patch mínimo por raiz (acima).
4. `gh workflow run porta-de-entrada.yml --repo ServerVpss/CentralDark --ref <branch>` → espera run → `gh api .../runs/<id>` + `/jobs` confirmam verde.
5. Abre PR. Quando a base fica verde, os PRs herdados destravam no rerun.

Não tente consertar os PRs individualmente: se o `origin/main` falha o gate,
TODO PR herda o vermelho. Corrija a base.

## Verificação no Windows (environ bug)

`node --check <file>` funciona sempre. Mas `node --test scripts/lupa/agent-core-adapters.test.mjs`
FALHA no Windows/MSYS com `ENOENT: E:\E:\CentralDark\...` — o `ROOT` do teste
usa `resolve(new URL("../..", import.meta.url).pathname)` e duplica a letra do
drive (`E:\E:\`). Isso é bug de harness, NÃO do seu patch. Não declare PASS
local nesse teste; valide no runner Linux (dispatch do workflow). Para o
`continuity-guard.test.mjs` (que NÃO usa esse ROOT) o `node --test` local roda
normalmente e serve de contraprova de que o `agent.mjs` importado está íntegro.
