# Verificação de SHA — Meta Lupa

## Referências do BOOT-METALUPA-XP-RASTRO-GITHUB.md

| Item | Valor Esperado |
|---|---|
| ACTION_RUN | 29884365325 |
| SKILL_COMMIT | 084d5309b2d02259f66626367746369976d75344 |
| CANDIDATE_REF | d2567d991166d34d8dbc08987fc60d01ccc37e5ec1f866c3fc13f4259bf9e955 |
| CONTRACT_DIGEST | 5e4e1c9a38454d8ef0d17169ba228d8c11f113a65c68ce548d8cf92f9c99797b |
| FILE_SHA256 (METALUPA-BAYESIANA-CANONICA.md) | 33d9a768651b822544462e88c1b128a96eb0b0eed854435b4600a94e6ae3d19a |

---

## SHA1 da SKILL.md (git-blob)

| Origem | SHA1 | Status |
|---|---|---|
| **AUTOLUPA_CANONICAL_SHA** (arquivo no repo) | `c124497474f381ec86047fb93407b9e04fbdcf58` | ⚠️ DIFERENTE |
| **Canonical (origin/main)** | `f25797593acc9c0bfae28269a229564bdedbc1f5` | ✅ Atual no remote |
| **Local (working tree)** | `58627901b8d92e3555d12542ef57fc9ab944906c` | 🔴 **DRIFT DETECTADO** |

---

## Análise

**TRÊS HASHES DIFERENTES** = Drift triplo:
1. `c124497...` = registrado no `AUTOLUPA_CANONICAL_SHA` (antigo)
2. `f257975...` = `origin/main` atual (canônico verdadeiro)
3. `5862790...` = local working tree (modificado sem commit)

**Ação necessária:** sincronizar local com `origin/main` ou documentar divergência autorizada.

---

## Diff Summary (origin/main vs local)
--- /e/CentralDark/Pivete/EVIDENCE_ROOT/turno-10/meta-lupa/CANONICAL-SKILL.md	2026-08-02 15:39:42.331325100 -0300
+++ /e/CentralDark/Pivete/EVIDENCE_ROOT/turno-10/meta-lupa/LOCAL-SKILL.md	2026-08-02 15:39:42.251753900 -0300
@@ -1,486 +1,486 @@
----
-name: meta-lupa
-description: Aplicar a META LUPA com três temperaturas operacionais — FRIA, MÉDIA e QUENTE — preservando Bayes, entropia, valor da informação, mapa canônico, AutoLupa, contract_digest, candidate_ref, comitês independentes, registro auditável e autorização humana. Usar em auditorias, investigações, debugging multimodal, decisões arquiteturais, incidentes, avaliações de agentes, alegações conflitantes ou situações em que evidência deva alterar uma hipótese sem transformar confiança em autorização.
----
-
-# META LUPA
-
-Transformar a sequência `mapa → evidência → crença → teste → decisão → AutoLupa → consolidação` em análise explícita, reproduzível e proporcional ao custo do erro.
-
-META LUPA é a evolução do mesmo artefato e mantém o motor bayesiano. FRIA, MÉDIA e QUENTE são modos internos, não skills concorrentes.
-
-## Invariante de falsificação
-
-Uma alegação de sucesso apoiada apenas por painel verde, status `Scheduled`, HTTP 200, ausência de erro ou listagem de recurso é evidência insuficiente do funcionamento ponta a ponta.
-
-Nesse caso, a saída obrigatória é `VEREDITO=BLOQUEAR` (ou `CORRIGIR` quando o formato não admitir bloqueio), `FALSO_VERDE_BLOQUEADO=SIM`, e uma prova contrária ou próximo teste concreto. É proibido combinar `VEREDITO=APROVAR/APROVADA` com evidência insuficiente. Se isso ocorrer, a própria saída é inválida e a AutoLupa deve corrigi-la antes de responder.
-
-### Falso verde de instrumento
-
-O instrumento que observa também mente. Um resultado vazio, um `404` ou um
-"nenhuma ocorrência" descrevem **o que a ferramenta devolveu**, não o que
-existe no sistema. Antes de concluir ausência, identificar se a ferramenta
-tem allowlist, filtro de caminho sensível, escopo padrão, paginação ou índice
-defasado — e repetir a busca por um segundo canal independente.
-
-Regra: **ausência de resultado em um instrumento não é evidência de ausência
-no sistema.** Só vale como prova quando dois canais de proveniência distinta
-concordarem.
-
-### Falso verde de versionamento
-
-Casos em que o Git aparenta saúde e esconde o defeito. Cada linha traz o
-teste que efetivamente separa as hipóteses:
-
-| Aparência | O que pode estar por trás | Teste que resolve |
-|---|---|---|
-| `git status` limpo | gitlink órfão: submódulo sem `.gitmodules` apontando para commit inexistente — a pasta chega vazia em todo clone | `git ls-tree <ref> <caminho>`; modo `160000` é gitlink, `100644` é arquivo |
-| blob local igual ao da ref remota | a ref remota é cache local, podendo estar defasada ou já deletada no servidor | `git ls-remote origin <branch>`; ou `git fetch` e reler |
-| merge sem conflito, `exit=0` | conteúdo de um dos lados descartado silenciosamente | `git diff <merge-base> <outro-lado> -- <arquivo>`; se vazio, aquele lado nada trouxe |
-| verificação passa no código novo | a checagem podia já falhar antes — não mede regressão | rodar a **mesma** checagem no código original e comparar contagem e identidade dos erros |
-| arquivo existe no disco | pode não estar versionado nem alcançável por outros | checkout limpo em worktree detached e contagem dos arquivos entregues |
-
-Regra: para provar que algo está versionado, medir **o que um checkout limpo
-entrega** — não o que a árvore de trabalho exibe.
-
-## Três temperaturas operacionais
-
-### FRIA — provar o que aconteceu
-
-Use para R0/R1 e fatos locais. Separe SIM/NÃO, antes/depois, mudou/não mudou. Não explique mecanismo invisível.
-
-Saída mínima: `MODO=FRIA`, fato, resultado, prova e lacuna.
-
-### MÉDIA — localizar por que aconteceu
-
-Ative em 401, 404, 429, timeout, contradição, evidência fraca, drift, falso verde ou R2. Formule hipóteses distinguíveis, mude uma variável por vez, use o canal correto, busque prova contrária e capture o delta do runtime.
-
-Saída mínima: `MODO=MEDIA`, hipótese, variável alterada, canal, resultado binário, delta, prova contrária e camada localizada.
-
-### QUENTE — tornar o achado repetível
-
-Ative em R3/R4, produção, autenticação, dados, merge, alteração da própria skill, recorrência ou CAÇA_AO_ERRO. Fixe alvo e SHA; combine tela, log, processo e ação; use revisão adversarial; execute positivo, negativo, limite e rollback; valide autorização; registre BEGIN/FINAL e AutoLupa.
-
-Saída mínima: `MODO=QUENTE`, contratos, observadores, testes, rollback, registro, autorização e ponto fixo.
-
-Escalonamento: comece FRIA; contradição escala para MÉDIA; criticidade, recorrência ou promoção escala para QUENTE; ponto fixo resfria e encerra.
-
-## Princípios inegociáveis
-
-1. Separar fato, inferência, suposição e desconhecido.
-2. Não inventar probabilidades, likelihood ratios ou precisão estatística.
-3. Tratar nome, aparência, status verde e autoridade como evidência fraca até validação.
-4. Não multiplicar evidências correlacionadas como se fossem independentes.
-5. Separar confiança epistemológica de permissão operacional.
-6. Manter bloqueios críticos acima de qualquer posterior ou nota.
-7. Escolher o teste que mais reduz incerteza por custo e risco.
-8. Registrar cálculo, proveniência, sensibilidade, lacunas e próximo passo.

---

## Conclusão da Verificação

**APÓS NORMALIZAÇÃO DE LINE ENDINGS (dos2unix):**

| Origem | SHA1 (normalizado) | Status |
|---|---|---|
| Canonical (origin/main / HEAD) | `f25797593acc9c0bfae28269a229564bdedbc1f5` | ✅ |
| Local (working tree, CRLF→LF) | `f25797593acc9c0bfae28269a229564bdedbc1f5` | ✅ **IDÊNTICO** |

---

## ✅ **VEREDICTO: SEM DRIFT DE CONTEÚDO**

A diferença era **apenas line endings** (CRLF no Windows vs LF no Git). Conteúdo é **idêntico ao `origin/main`**.

---

## Ação
- **NÃO precisa sincronizar** — conteúdo já está alinhado
- `AUTOLUPA_CANONICAL_SHA` está desatualizado (`c124497...` vs `f257975...`) — registrar para atualização futura com PERMITO PIVETE
- Working tree limpo quanto ao conteúdo da skill

---

## Próximo Passo: PARALLEL_READERS (R1-R4)
