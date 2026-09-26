# COMANDO - BOOT-METALUPA-XP-RASTRO-GITHUB.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.hermes\desktop-attachments\BOOT-METALUPA-XP-RASTRO-GITHUB.md
**SHA:** c1ddfc591b151e91
**Timestamp:** 2026-08-28T02:57:50.941389
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ACTION_RUN:
- SOURCE_RUN:

### Contratos
- SAME_CONTRACT:
- XP_CONTRACT:

### Riscos
- RESIDUAL_RISK:

### Ouro Bruto (primeiros 5000 chars)
```
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
git show --format=fuller --name-status 084d5309b2d02259f66626367746369976
```