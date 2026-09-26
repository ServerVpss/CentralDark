---
name: pr-auditing
description: Detectar falso verde em PRs antes de merge — validar testes citados, recursos declarados, interface CLI compatível, achievements com evidência, flags coerentes. Usar quando auditar PRs de escopo crítico ou quando o Pivete mandar "analise lacunas" / "prove antes de merge".
---

# PR Auditing — False Green Detection

Padrão reutilizável para auditar PRs e detectar inconsistências entre o que o PR **declara** (body, commit message, SKILL.md) e o que **existe no repositório** (checkout limpo, ledger, diff).

> Princípio central: **"O Git aparenta saúde mas o checkout limpo não entrega."**
> Sempre validar com prova mecânica no disco antes de declarar existência.

---

## 1. Checklist de Auditoria Pré-Merge

### 1.1 Testes Citados vs Existência Real

**Padrão de falha**: PR body cita `test_lupa.py TOTAL=52 PASS=52` mas arquivo não existe no repo.

**Verificação obrigatória**:
```bash
# Para cada teste citado no PR body/commit message:
find . -name "*test_lupa*" -o -name "*test_meta_lupa*" -o -name "*test_deny*" -o -name "*test_ledger*"
# Se retorna vazio → LACUNA CRÍTICA
```

### 1.2 Recursos Declarados em Matriz/Skill vs Existência Real

**Padrão de falha**: SKILL.md declara `guardrails/validar_meta_lupa.py` como "PRESENTE" mas não existe.

**Verificação obrigatória**:
```bash
# Para cada caminho na matriz de recursos (XP-5, etc.):
ls -la <caminho_declarado> 2>&1 || echo "AUSENTE: <caminho_declarado>"
```

### 1.3 Compatibilidade de Interface CLI (branch vs main)

**Padrão de falha**: Branch do PR adiciona args novos (`--achievement`, `--mode-used`, etc.) que não existem no `main`.

**Verificação obrigatória**:
```bash
# Comparar args do comando no branch vs main:
git show origin/main:<script_path> | grep -A 50 'comando_alvo'
git show origin/fix/...:<script_path> | grep -A 50 'comando_alvo'
# diff deve mostrar apenas adições compatíveis (novos args com defaults)
```

### 1.4 Achievements vs Evidência Reproduzível

**Padrão de falha**: `achievements: ["erro_reproduzido", "ponto_fixo_atingido"]` mas:
- `erro_reproduzido` → sem teste automatizado que reproduza o defeito
- `ponto_fixo_atingido` → AutoLupa não executada (`autolupa_executed: false`)

**Regra**: achievement só é válido se houver **evidência reproduzível** no ledger (teste, log, diff, hash).

### 1.5 Flag `false_green_blocked` Coerente

**Padrão de falha**: defeito era "comando passa mas não mostra XP" = falso verde de exposição, mas ledger marca `false_green_blocked: false`.

**Regra**: se o defeito se enquadra na **Invariante de Falsificação** (painel verde / ausência de erro / listagem = evidência insuficiente) → deve ser `true`.

### 1.6 Correção Semântica — suíte verde não prova o contrato

Integridade do pacote, reprodução byte a byte e testes passando são camadas necessárias, mas não provam que o comportamento satisfaz a regra de negócio.

Ordem obrigatória:

```text
1. extrair o contrato literal da regra/spec;
2. derivar invariantes sem ler a implementação como fonte de verdade;
3. construir oráculo independente por mecanismo diferente;
4. produzir contraexemplo mínimo;
5. executar propriedades/casos gerados contra o oráculo;
6. testar matriz de papéis, inclusive papéis privilegiados;
7. testar bordas inferior, interior, superior e fora da janela;
8. rastrear feature flag em implementação, configuração, call site, teste e rollback;
9. provar o consumidor real da biblioteca/rota;
10. comparar o que os testes realmente provam com o que o PR afirma provar.
```

#### Independência do oráculo

Um segundo código que repete a mesma fórmula, branch ou condição da implementação **não é oráculo independente**. Exigir pelo menos uma destas origens:

- algoritmo derivado diretamente da especificação;
- implementação por mecanismo matemático/estrutural diferente;
- biblioteca de referência primária;
- enumeração exaustiva para domínio pequeno;
- propriedades metamórficas que não reutilizem a mesma decisão interna.

Se implementação e oráculo compartilham a lógica suspeita, marcar:

```text
ORACULO_INDEPENDENTE=NAO
EVIDENCIA_MISREPRESENTADA=SIM quando o PR o chama de independente
VEREDITO=REJEITAR
```

#### Contraexemplo e bordas

- Preferir o menor caso que separa esperado de atual.
- Para dinheiro/alocação, validar conservação do total, não negatividade, regra de arredondamento, desempate e maior resto fracionário quando especificado.
- Para autorização, cruzar identidade do ator × papel × propriedade do recurso; `admin` nunca ganha exceção que a regra proíba explicitamente.
- Para janelas `[t, t + ttl)`, testar `t-1`, `t`, interior, `t+ttl-1` e `t+ttl`.

#### Alegações de integração e rollback

Se o PR diz “feature-flagged”, “integrado”, “consumido” ou “reversível”, localizar prova em cada camada aplicável:

```text
IMPLEMENTACAO
CONFIGURACAO
CALL_SITE/CONSUMIDOR
TESTE
MECANISMO_DE_ROLLBACK
```

Texto do PR sem rastro no diff/runtime permanece `NAO_COMPROVADO`.

#### Gate de rejeição

`REJEITAR` quando qualquer item bloqueante for verdadeiro:

- resultado monetário incorreto;
- autorização incorreta;
- oráculo alegadamente independente copia a implementação;
- evidência de teste é apresentada de modo enganoso;
- feature flag/integração/rollback declarados sem mecanismo;
- suíte verde contradiz contraexemplo derivado da regra.

O gate executável está em `scripts/semantic-gate.py`. Ele valida um manifesto de auditoria e deve ser rodado antes de qualquer `APROVAR`.

---

## 2. Tipos de Falso Verde Mapeados

| Tipo | Sinal | Verificação Mecânica |
|---|---|---|
| **Falso verde de versão** | Tests citados no body, inexistentes no checkout | `git ls-files` / `find` |
| **Falso verde de interface** | Args novos no branch, não no main | `git diff main..branch -- script.py` |
| **Falso verde de achievement** | XP reivindicado sem teste/autolupa | ledger `autolupa_executed`, `test_created` |
| **Falso verde de métrica** | `false_green_blocked=false` quando defeito era falso verde | Confrontar com Invariante de Falsificação |
| **Falso verde de recurso** | Matriz declara "PRESENTE" mas arquivo ausente | `ls -la <path>` |

---

## 3. Template de Relatório de Auditoria

```markdown
## Auditoria PR #XXX — <title>

### ✅ Entregue
- [ ] Correção real (descrever)
- [ ] CI passing (N checks)
- [ ] Ledger chain íntegra
- [ ] Sem breaking change

### 🔴 Lacunas Críticas (bloqueiam merge)
1. **Testes inexistentes**: <lista>
2. **Interface incompatível**: <detalhe>
3. **Recursos declarados ausentes**: <matriz>

### 🟡 Lacunas Menores
1. **Achievement sem evidência**: <qual>
2. **Flag inconsistente**: <qual>

### Veredito
```
VEREDITO: CONDICIONAR | APROVAR | BLOQUEAR
PRÓXIMA AÇÃO: <passo concreto>
```
```

---

## 4. Gate que não inicia continua BLOQUEADO

Se o processo não chegou a executar o teste/gate, o resultado não é `PASS` nem `FAIL`:

```text
GATE=BLOCKED
STARTED=NAO
EXIT_CODE_OBSERVADO=NAO
RESULTADO_DO_CODIGO=NAO_AVALIADO
```

Nunca deduzir exit code lendo a implementação, nunca preencher relatório manual para substituir execução e nunca chamar avaliação mental de fallback. Diagnóstico manual serve somente para localizar a causa e preparar a nova execução.

Escolher o launcher realmente existente no ambiente (`python`, `python3`, runner do projeto etc.), registrar o comando literal, capturar `stdout/stderr` e observar o exit code. Se não houver execução mecânica, o gate permanece bloqueado.

### 4.1 Lockfile e gates JavaScript que não iniciam

`vitest`, `eslint` ou `vite` ausentes não significam teste aprovado ou reprovado; significam que o gate não iniciou. O único fato permitido é o bloqueador observado. Para provar que o bloqueio é preexistente e independente do candidato:

```text
1. registrar BASE_SHA, versões de Node/npm e hashes de package.json/package-lock.json;
2. reproduzir o mesmo erro em checkout limpo do BASE_SHA;
3. gerar lockfile candidato somente em worktree descartável;
4. revisar o diff do lock contra upgrades e resolução inesperados;
5. executar npm ci, test, lint e build no candidato;
6. manter a correção do lock em commit separado;
7. integrar esse commit ao candidato original e repetir todos os gates.
```

`npm install --no-package-lock` nunca aprova: produz resolução não registrada e contorna a reprodutibilidade. Não atribuir o bloqueio a outra camada do sistema sem teste discriminatório no `BASE_SHA`.

### 4.2 Swarm de revisão precisa de amostra atômica

Paralelismo válido separa hipóteses; não multiplica concordância. Antes de aceitar revisores paralelos, congelar:

```text
CANDIDATE_DIFF_HASH
BASE_SHA_COMUM
LISTA_DE_ARQUIVOS/ESCOPO
MODO_READ_ONLY
INTEGRADOR_UNICO
```

Critérios de aceitação:

- todos revisam o mesmo `BASE_SHA` e o mesmo hash do candidato;
- subagentes não escrevem, criam projeto/worktree nem alteram a amostra;
- escopos são independentes e complementares;
- cobertura declarada é conferida arquivo por arquivo;
- contradições relevantes são reproduzidas mecanicamente;
- somente o integrador principal altera a árvore após consolidar os pareceres.

Se o diff mudar durante a revisão, todos os recibos anteriores ficam obsoletos. `passed=true` com cobertura parcial — por exemplo, 2 de 11 arquivos — é `REVIEW_INCOMPLETE`, não aprovação.

Detalhes e recibo-modelo: `references/gates-bloqueados-e-swarm-atomico.md`.

---

## 5. Referência da Sessão 27/07/2026 (PR #410)

### Contexto
PR #410: `fix(meta-lupa): finish-use passa a exibir o recibo de XP na saída`
Branch: `fix/meta-lupa-recibo-xp-20260727`

### Lacunas Encontradas
1. **4 testes citados inexistentes**: `test_lupa.py`, `test_meta_lupa_3t.py`, `test_deny_delete.py`, `test_ledger_check.py`, `test_run_attacks.py`
2. **4 recursos declarados ausentes**: `guardrails/validar_meta_lupa.py`, `approvals/politica.json`, `testes/test_meta_lupa_3t.py`, `testes/test_lupa.py`
3. **13 args novos no branch** não existentes no main (interface quebrada se mergeado sozinho)
4. **2 achievements sem evidência**: `erro_reproduzido` (sem teste), `ponto_fixo_atingido` (AutoLupa não rodou)
5. **Flag inconsistente**: `false_green_blocked=false` mas defeito era falso verde de exposição

### Veredito
```
VEREDITO: CONDICIONAR
Não mergear até resolver Lacunas 1 e 2.
```

---

## 6. Lição Central para Futuras Sessões

> **Nunca confiar no PR body, commit message ou SKILL.md como prova de existência.**
> 
> A única prova válida é **prova mecânica no disco**: `git ls-files`, `find`, `ls -la`, `cat`, `git show`, `diff`.
> 
> Se a skill/matriz declara "PRESENTE" → validar no checkout limpo.
> Se o PR body cita "TOTAL=52 PASS=52" → rodar o teste ou confirmar arquivo.
> Se o branch adiciona args → garantir compatibilidade com main ou bloquear merge.

---

## Recursos

- `scripts/` — (futuro) scripts de verificação automatizada
- `templates/auditoria-pr.md` — template pronto para preencher