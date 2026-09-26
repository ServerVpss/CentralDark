# BOOT — METALUPA XP PELO RASTRO REAL DO GITHUB

## COMANDO HUMANO CANÔNICO

```text
RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

Essa autorização vale para toda ação não destrutiva necessária à missão, sem pedir novamente a cada etapa.

Bloqueio temporário não encerra a missão:

```text
erro → investigar → corrigir → testar → retomar
consent gate → traduzir a autorização existente → retomar
provider indisponível → usar fallback → retomar
falha de teste → corrigir no mesmo artefato → retestar
```

Não declarar sucesso sem evidência reproduzível.

---

# MISSÃO

Recuperar pelo **rastro real do GitHub** o sistema de XP, percentuais, comitês, congelamento de candidato, `candidate_ref`, `contract_digest`, veto, consolidação e AutoLupa que nasceu no experimento da MetaLupa.

Comparar esse contrato comprovado com a skill atual `lupa-bayesiana`.

Incorporar somente o que estiver comprovado no **mesmo artefato canônico**, com código, testes, referências e saída operacional suficientes para que qualquer agente que carregar a skill compreenda e execute automaticamente o ciclo de XP e autoevolução.

Não usar Lovable, screenshots ou texto de conversa como fonte primária. Eles servem apenas como índice auxiliar. A fonte da verdade é:

```text
Git history
GitHub Actions
commits
diffs
PRs
logs
artefatos
scripts
testes
hashes
```

---

# IDENTIDADE CONGELADA DO EXPERIMENTO

```text
REPOSITÓRIO:
ServerVpss/CentralDark

ACTION_RUN:
29884365325

ACTION_URL:
https://github.com/ServerVpss/CentralDark/actions/runs/29884365325

SKILL_COMMIT:
084d5309b2d02259f66626367746369976d75344

CANDIDATE_REF:
d2567d991166d34d8dbc08987fc60d01ccc37e5ec1f866c3fc13f4259bf9e955

CONTRACT_DIGEST:
5e4e1c9a38454d8ef0d17169ba228d8c11f113a65c68ce548d8cf92f9c99797b

ARQUIVO_CANÔNICO_HISTÓRICO:
METALUPA-BAYESIANA-CANONICA.md

FILE_SHA256:
33d9a768651b822544462e88c1b128a96eb0b0eed854435b4600a94e6ae3d19a
```

Esses valores são âncoras de busca e verificação. Não presumir algoritmo, caminho atual ou validade apenas porque os hashes foram fornecidos: reproduzir pelo Git.

---

# AMBIENTE LOCAL

```text
E:\CentralDark\Pivete\CentralDark
```

Atualizar primeiro:

```powershell
git -C "E:\CentralDark\Pivete\CentralDark" fetch origin --prune --tags
git -C "E:\CentralDark\Pivete\CentralDark" switch main
git -C "E:\CentralDark\Pivete\CentralDark" pull --ff-only origin main
```

Registrar:

```text
REMOTE
BRANCH
HEAD_LOCAL
ORIGIN_MAIN
WORKING_TREE
```

Não usar:

```text
reset --hard
clean -fd
force-push
rebase destrutivo
sobrescrita de arquivo local desconhecido
```

Preservar qualquer mudança local e classificá-la antes de continuar.

---

# FONTE CANÔNICA DA SKILL

Localizar pelo frontmatter:

```yaml
name: lupa-bayesiana
```

Caminho histórico provável:

```text
.agents/skills/lupa-bayesiana/
```

Não presumir. Resolver o caminho real no `origin/main` atual e no commit histórico.

Carregar integralmente:

```text
SKILL.md
references/
scripts/
tests/
openai.yaml ou manifesto equivalente
```

A identidade pública continua:

```text
name: lupa-bayesiana
```

`MetaLupa` é evolução da mesma skill, não uma segunda skill.

Proibido criar:

```text
lupa-v2
metalupa-v2
lupa-xp
tecnica-da-lupa nova
segundo SKILL.md concorrente
documento canônico paralelo
```

---

# ARSENAL MÁXIMO

Usar tudo que estiver autenticado e disponível, sem economizar raciocínio ou tokens artificialmente.

## Funções

### 1. Orquestrador

Hermes mantém checkpoint, delega, consolida e não autossela o resultado.

### 2. Investigador de rastro Git

Recupera Action, commits, PRs, branches, comentários, artefatos, diffs e hashes.

Preferência:

```text
Grok 4.5 ou Gemini Pro
```

### 3. Arquiteto do contrato XP

Extrai invariantes, fórmulas, estados, gates e formato de saída.

Preferência:

```text
Claude/Opus/Sonnet ou melhor modelo de arquitetura disponível
```

### 4. Implementador

Altera o mesmo `lupa-bayesiana`, scripts, testes e referências.

Preferência:

```text
Codex ou modelo de código mais forte disponível
```

### 5. Crítico independente

Recebe o candidato congelado sem herdar o veredito do implementador.

Preferência:

```text
Grok 4.5 / DarkAI / modelo independente
```

### 6. Verificador determinístico

Git, hashes, pytest/unittest, scanners, linters e scripts.

Um agente por função. Modelos são cérebros intercambiáveis, não setores duplicados.

---

# FASE 1 — RECUPERAR O RASTRO REAL

Usar `gh`, `git` e API GitHub autenticada.

Comandos mínimos de partida:

```powershell
cd "E:\CentralDark\Pivete\CentralDark"

gh run view 29884365325 --repo ServerVpss/CentralDark
gh run view 29884365325 --repo ServerVpss/CentralDark --log
gh run view 29884365325 --repo ServerVpss/CentralDark --json `
  databaseId,name,event,status,conclusion,headBranch,headSha,workflowName,url,jobs

git cat-file -t 084d5309b2d02259f66626367746369976d75344
git show --stat --summary 084d5309b2d02259f66626367746369976d75344
git show --format=fuller --name-status 084d5309b2d02259f66626367746369976d75344
git diff 084d5309b2d02259f66626367746369976d75344^ `
         084d5309b2d02259f66626367746369976d75344

git branch -a --contains 084d5309b2d02259f66626367746369976d75344
git log --all --decorate --oneline --grep="MetaLupa\|XP\|candidate_ref\|contract_digest"
```

Pesquisar no repositório inteiro e em todos os refs:

```powershell
git grep -n -I -e "candidate_ref" -e "contract_digest" `
  -e "XP válido" -e "XP_VALIDO" -e "PONTO_FIXO" `
  -e "comitê" -e "committee" -e "veto" $(git for-each-ref --format='%(refname)')
```

Usar também:

```text
gh pr list
gh pr view
gh pr checks
gh pr diff
gh api
gh run download
```

quando os identificadores forem encontrados.

## Resultado obrigatório desta fase

Produzir um mapa:

```text
EVENTO
DATA
BRANCH
PR
COMMIT
PARENT
ARQUIVO
ALTERAÇÃO
TESTE
COMITÊ/AGENTE
PERCENTUAL
XP
VETO
CANDIDATE_REF
CONTRACT_DIGEST
RESULTADO
EVIDÊNCIA
```

Não escrever código antes de entender o rastro.

---

# FASE 2 — REPRODUZIR A IDENTIDADE

Descobrir pelo código histórico como foram calculados:

```text
candidate_ref
contract_digest
SHA-256 do arquivo
XP
percentuais
rubricas
veto
ponto fixo
```

Não inventar fórmulas.

Reproduzir:

```text
candidate_ref esperado:
d2567d991166d34d8dbc08987fc60d01ccc37e5ec1f866c3fc13f4259bf9e955

contract_digest esperado:
5e4e1c9a38454d8ef0d17169ba228d8c11f113a65c68ce548d8cf92f9c99797b

file_sha esperado:
33d9a768651b822544462e88c1b128a96eb0b0eed854435b4600a94e6ae3d19a
```

Se não reproduzir, continuar investigando até encontrar:

```text
serialização
ordem dos campos
normalização de texto
arquivos incluídos
encoding
algoritmo de hash
versão do contrato
```

Não aceitar “aproximadamente igual”.

---

# FASE 3 — EXTRAIR O CONTRATO DE XP

O XP não é uma nota decorativa. É variação de aprendizado comprovado por defeito novo e válido.

O contrato final deve ser derivado do rastro, mas precisa responder explicitamente:

```text
O que gera XP?
O que não gera XP?
Como um defeito é identificado?
Como defeitos duplicados são agrupados?
Como snapshots rejeitados são tratados?
Como veto funciona?
Como percentual por comitê é calculado?
Como percentuais incompatíveis são consolidados?
Como o candidato é congelado?
Quando XP novo vira zero?
Quando ponto fixo é permitido?
Como regressão futura reabre o candidato?
```

Invariantes mínimos a confirmar pelo rastro:

1. XP só conta defeito novo, reproduzível e pertencente ao candidato correto.
2. O mesmo defeito encontrado por três comitês conta uma vez.
3. Snapshot rejeitado preserva o achado como teste, mas não aprova o novo candidato.
4. Testes verdes não aprovam contrato incompleto.
5. Veto crítico domina percentual alto.
6. Percentual exige rubrica, numerador, denominador e escopo.
7. `candidate_ref` congela o candidato.
8. `contract_digest` congela o contrato de avaliação.
9. Mudança no candidato ou contrato invalida a comparação anterior.
10. XP novo igual a zero só significa ponto fixo se todos os gates do contrato estiverem verdes.
11. O executor não pode aprovar sozinho o próprio candidato.
12. AutoLupa deve tentar falsificar o ponto fixo antes do selo.

Se o rastro contradizer algum item, usar o rastro e registrar a diferença.

---

# FASE 4 — COMPARAR COM A SKILL ATUAL

Criar matriz:

```text
REGRA_DO_RASTRO
LOCAL_HISTÓRICO
EXISTE_NA_SKILL_ATUAL
COMPLETA
PARCIAL
AUSENTE
TESTE_EXISTENTE
AÇÃO_MÍNIMA
```

Verificar especialmente se a skill atual possui:

```text
candidate_ref
contract_digest
rubrica versionada
percentual por comitê
XP evidencial
deduplicação por causa raiz
veto
snapshot aceito/rejeitado
ledger de XP
congelamento do candidato
reabertura por regressão
gate final
AutoLupa aplicada à própria skill
propagação para agentes futuros
```

A conversa e `XP.txt` podem apontar a lacuna, mas somente o rastro Git pode aprovar a incorporação.

---

# FASE 5 — IMPLEMENTAR NO MESMO ARTEFATO

Criar branch:

```text
feat/lupa-bayesiana-xp-canonico-AAAA-MM-DD-HHMM
```

Atualizar somente o artefato canônico e seus recursos existentes.

Possíveis arquivos, conforme estrutura real:

```text
.agents/skills/lupa-bayesiana/SKILL.md
.agents/skills/lupa-bayesiana/references/*
.agents/skills/lupa-bayesiana/scripts/lupa_bayesiana.py
.agents/skills/lupa-bayesiana/scripts/test_lupa_bayesiana.py
```

Não criar outro método. Incorporar no fluxo atual.

## Seções que a skill final deve conter

### Contrato de candidato

```text
TARGET_SHA:
CANDIDATE_REF:
CONTRACT_DIGEST:
RUBRIC_VERSION:
SOURCE_OF_TRUTH:
```

### Comitê evidencial

```text
COMMITTEE_ID:
MODEL/AGENT:
INDEPENDENT_FROM:
CANDIDATE_REF:
CONTRACT_DIGEST:
SCORE_NUMERATOR:
SCORE_DENOMINATOR:
SCORE_PERCENT:
NEW_DEFECT_IDS:
DUPLICATE_DEFECT_IDS:
VETO:
EVIDENCE:
VERDICT:
```

### Ledger de defeitos e XP

```text
DEFECT_ID:
ROOT_CAUSE_CLUSTER:
FIRST_SEEN_BY:
REPRODUCIBLE:
SAME_CANDIDATE:
SAME_CONTRACT:
SEVERITY:
XP_VALUE:
STATUS:
TEST_ADDED:
FIX_COMMIT:
```

### Consolidação

```text
RAW_COMMITTEE_RESULTS:
VALID_COMMITTEE_RESULTS:
VETOES:
UNIQUE_NEW_DEFECTS:
XP_VALID:
XP_REJECTED:
FINAL_SCORE:
PONTO_FIXO:
```

### Autoevolução

Ao final de toda missão que usar a skill:

```text
1. executar AutoLupa;
2. extrair defeitos novos comprovados;
3. transformar cada causa raiz em teste de reincidência;
4. propor patch mínimo na mesma skill;
5. validar com crítico independente;
6. atualizar a mesma skill somente se houver ganho comprovado;
7. registrar commit, testes e mudança de contrato;
8. não criar skill, pasta ou documento paralelo.
```

A autoevolução não pode alterar silenciosamente o contrato no meio da avaliação. Toda mudança gera novo `contract_digest` e nova rodada.

---

# FASE 6 — PROPAGAÇÃO CORRETA

A skill deve ser carregada automaticamente por qualquer agente que executar tarefa coberta por sua descrição.

Não usar “vírus” literalmente no código.

Traduzir a intenção para comportamento seguro:

```text
AUTOATIVAÇÃO POR ESCOPO
HERANÇA PELO REPOSITÓRIO
MESMA IDENTIDADE CANÔNICA
TESTES DE REGRESSÃO
AUTOAPLICAÇÃO NO ENCERRAMENTO
```

A skill deve tornar explícito:

> Toda missão elegível carrega `lupa-bayesiana`; toda missão termina com AutoLupa; todo aprendizado novo comprovado volta como teste e patch mínimo no mesmo artefato canônico.

Não atualizar a skill a partir de opinião, elogio, erro não reproduzido ou saída de um único agente.

---

# FASE 7 — TESTES

Preservar todos os testes existentes.

Adicionar testes determinísticos derivados dos falsos verdes históricos.

No mínimo:

1. reproduzir `candidate_ref` histórico;
2. reproduzir `contract_digest` histórico;
3. detectar `candidate_ref` inválido;
4. detectar contrato alterado;
5. rejeitar evidência “confie em mim”;
6. rejeitar `target_sha` arbitrário;
7. rejeitar score sem denominador;
8. rejeitar score de comitê com candidato divergente;
9. agrupar defeito duplicado entre comitês;
10. não acumular XP de snapshot rejeitado;
11. preservar achado rejeitado como teste;
12. veto crítico bloquear score alto;
13. impedir ponto fixo com contrato incompleto;
14. XP zero após congelamento sem defeito novo;
15. reabrir candidato quando surgir regressão;
16. exigir crítico independente;
17. AutoLupa detectar autosselagem;
18. mudança na skill gerar novo `contract_digest`;
19. não criar segunda skill;
20. output CLI sem traceback sensível.

Executar a suíte histórica e a nova.

Registrar separadamente:

```text
SUÍTES
CHECKS
TEST_CASES
PROPERTY_CASES
```

Não misturar denominadores.

---

# FASE 8 — PROPRIEDADES MATEMÁTICAS

Localizar as 20.000 propriedades históricas e reutilizar o gerador real.

Não escrever “20.000 verdes” sem executar.

Testar propriedades como:

```text
determinismo
idempotência
ordem estável
deduplicação
monotonicidade válida
veto dominante
invariância a comitê duplicado
mudança de hash com mudança material
mesmo hash para serialização normalizada equivalente
XP não negativo
XP rejeitado não entra no total
```

Se o gerador histórico não estiver mais disponível, recuperar pelo Git em vez de criar um substituto adivinhado.

---

# FASE 9 — REVISÃO POR COMITÊS

Congelar antes:

```text
candidate_ref
contract_digest
HEAD_SHA
test_manifest
```

Executar comitês independentes em paralelo.

Cada comitê recebe:

```text
mesmo candidato
mesmo contrato
mesma rubrica
sem ver o veredito dos demais
```

Consolidar somente depois que todos terminarem.

Percentuais devem mostrar:

```text
numerador
denominador
percentual
rubrica
candidate_ref
contract_digest
veto
XP válido
```

Defeito repetido não vira XP triplo.

---

# FASE 10 — AUTOLUPA SOBRE A PRÓPRIA LUPA

Aplicar a skill candidata nela mesma.

Perguntas obrigatórias:

1. A skill está usando o mesmo contrato que declara?
2. Algum teste só confirma a implementação?
3. Há caso de falso verde não coberto?
4. O calculador aceita dados arbitrários?
5. O hash depende de ordem instável?
6. XP duplicável foi impedido?
7. Percentuais têm denominadores consistentes?
8. O executor está autosselando?
9. A regra nova contradiz a Lupa anterior?
10. Houve perda de recurso existente?
11. Surgiu skill/documento paralelo?
12. O ponto fixo sobrevive a novo crítico independente?
13. O mesmo SHA foi revisado por todos?
14. A saída permite reprodução por outro agente?
15. O aprendizado propagará para a próxima missão?

Se aparecer defeito novo:

```text
registrar
→ corrigir no mesmo artefato
→ adicionar teste
→ gerar novo candidato
→ novo candidate_ref
→ novo contract_digest se o contrato mudou
→ repetir comitês
```

Continuar até uma nova passagem não alterar materialmente o candidato, o contrato, o risco, os testes ou o veredito.

---

# FASE 11 — GIT E PR

Permitido:

```text
criar branch
editar skill canônica
editar referências/scripts/testes existentes
executar testes
commit
push da branch
abrir PR draft
aplicar label permito-pivete quando o gate exigir
acompanhar checks
corrigir falhas
atualizar o mesmo PR
```

Não permitido:

```text
merge
deploy
restart
force-push
apagar histórico
apagar skill duplicada sem prova de consumidores
alterar secrets
ler .env
mudar produção
```

Se a área consolidada exigir autorização legível por máquina, aplicar ao PR:

```text
permito-pivete
```

Isso traduz a autorização já concedida; não pedir novamente.

---

# FASE 12 — RELATÓRIO CANÔNICO

Atualizar relatório existente se houver relatório canônico desta missão.

Caso não exista equivalente, criar somente:

```text
docs/RELATORIOS/AAAA-MM-DD-metalupa-xp-rastro-github.md
```

Conteúdo:

```text
rastro recuperado
Action/jobs
commits/PRs
algoritmo reproduzido
candidate_ref
contract_digest
file SHA
contrato XP
rubricas
comitês
veto
falsos verdes
mudanças na skill
testes
propriedades
percentuais
XP aceito/rejeitado
AutoLupa
risco residual
rollback
branch/commit/PR
```

Não criar outro documento canônico da Lupa.

---

# SAÍDA FINAL

```text
VEREDITO: READY_FOR_PIVETE_REVIEW | CONTINUANDO_CORRECAO

SOURCE_RUN:
SOURCE_COMMITS:
SOURCE_PRS:
SKILL_CANONICAL_PATH:
SKILL_BEFORE_SHA:
BRANCH:
HEAD:
CANDIDATE_REF:
CONTRACT_DIGEST:
CONTRACT_REPRODUCED:
FILE_SHA_REPRODUCED:
XP_CONTRACT:
RUBRIC_VERSION:
COMMITTEES_TOTAL:
COMMITTEES_VALID:
COMMITTEES_VETO:
SCORES:
UNIQUE_DEFECTS:
DUPLICATE_DEFECTS:
XP_VALID:
XP_REJECTED:
SUITES_TOTAL:
CHECKS_TOTAL:
TEST_CASES_TOTAL:
PROPERTY_CASES_TOTAL:
PASS:
FAIL:
AUTOLUPA_ITERATIONS:
PONTO_FIXO:
FILES_CHANGED:
DUPLICATE_SKILLS_FOUND:
DUPLICATE_SKILLS_CHANGED:
REGRESSION:
ROLLBACK:
COMMIT:
PUSH:
PR:
CHECKS:
REPORT:
RESIDUAL_RISK:
NEXT_ACTION:
```

## READY_FOR_PIVETE_REVIEW somente quando

```text
rastro Git recuperado
algoritmo reproduzido
contrato XP incorporado
mesma skill canônica preservada
testes históricos verdes
testes novos verdes
propriedades executadas
comitês independentes concluídos
AutoLupa atingiu ponto fixo
branch publicada
PR draft aberto
checks verdes
zero merge/deploy/restart
```

Não encerrar por bloqueio temporário. Preservar checkpoint, trocar rota e continuar.

---

# FIO DA MISSÃO

```text
GitHub run
→ commits
→ PRs/comitês
→ algoritmo histórico
→ candidate_ref
→ contract_digest
→ contrato XP
→ comparação com skill atual
→ patch no mesmo artefato
→ testes históricos + novos
→ propriedades
→ comitês independentes
→ AutoLupa sobre si mesma
→ branch
→ PR
→ checks verdes
→ Pivete revisa
```
