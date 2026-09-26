---
name: centraldark-front-integration
description: Integrate a new FABLE LOOP reconciliation front.
---

# centraldark-front-integration

Padroniza a criação e integração de uma nova FRONT de reconciliação/sincronização no FABLE LOOP da CentralDark.

FRONTs são READERS, não WRITERS. Cada FRONT mede, cruza, e entrega saída para o RENDEZVOUS. A FRONT de reconciliação/sincronização envolve ação real (sync, upload, download) e exige hard stops adicionais.

---

## Quando usar esta skill

- Criar uma nova FRONT de reconciliação/sync no FABLE LOOP
- Adicionar um script de reconciliação (ex: drive_reconcile.py, git_reconcile.py)
- Integrar um reconciliador de terceiro (Google Drive, GitHub, Notepad, etc.)
- Resolver inconsistência de numeração de FRONTs no FABLE LOOP
- Adicionar regras de ouro para uma nova classe de sync

---

## Padrão de workflow de uma FRONT de reconciliação

Toda FRONT de reconciliação segue:

```
measure_local → measure_remote → reconcile → clean_garbage
→ push_useful (writer único) → pull_remote → verify_equal
hard_stop: confirmação humana antes de push/destroy/delete remoto
output: receipt com diff + shas + decisão
```

### 1. measure_local

Antes de qualquer coisa:

```
- listar árvore local alvo
- shas dos arquivos relevantes (não carrega tudo na memória; lê em blocos)
- status (untracked, modificados, deleted)
- identificar writer atual (se houver sessão/background rodando)
- identificar conflitos conhecidos
- verificar se há sessão de sync rodando (um writer por recurso)
```

Só metadados. Não toca nada.

### 2. measure_remote

Com conta/svc aceticionado e disponível:

```
- listar estrutura remota no folder alvo
- shas/metadados dos arquivos remotes
- comparar com local
- identificar o que existe só no remoto, só local, em ambos, em nenhum
- verificar quota/creds disponíveis ANTES de operações pesadas
```

Sem medir remoto = sem saber o que tá chegando = risco de trazer lixo ou perder trabalho que só existe no remoto.

### 3. reconcile

Cruzar:

| Situação | Ação |
|---|---|
| Só local | candidato a upload, se útil |
| Só remoto | candidato a download, se útil |
| Em ambos, mesma versão | nada |
| Em ambos, versões diferentes | diff + hard stop se drástico |
| Em ambos, hash igual + metadado diferente | decidir se é semântico ou só timestamp |
| Arquivo modificado em ambos os lados sem commitante claro | NÃO resolver automaticamente — chamar humano |

Classificação por arquivo:

```
CURRENT_LOCAL     — existe local, está em sync ou precisa de decisão
CURRENT_REMOTE    — existe no remoto, pode precisar de download
DUPLICATE         — mesmo conteúdo em ambos, sem risco
HISTORICAL        — registro antigo, sem ação necessária agora
UNKNOWN           — não deu para medir, sem assumir
```

Se 99% conhecido e 1% novo: preservar o 1% novo. Não limpar só porque está perto do conhecido.

### 4. clean_garbage

Sem `git add -A` cego e sem `rm -rf` cego no remoto.

Antes de apagar remoto ou local:

```
- verificar se o arquivo é ignorável (ver NO LIXO abaixo)
- verificar se é backup de algo útil
- verificar se é work temporário de alguma ferramenta vigente
- se não sabe: não apaga, vira UNKNOWN
```

Delete remoto É DESTRUTIVO. Hard stop obrigatório.

### 5. push_useful (writer único)

Só o útil. Sem copiar besteira.

```
- um writer por pasta/alvo por vez
- upload só dos arquivos úteis confirmados
- idempotente quando possível
- receipt de cada operação (fileId, timestamp, hash, antes/depois)
- se o svc suportar update no mesmo fileId: atualiza, não duplica
```

Sem subir `.env`, sem subir credenciais, sem subir lixo temporário.

### 6. pull_remote

Puxar o que mudou lá, se útil.

```
- baixa só mudanças relevantes
- preservar timestamp e estrutura original quando possível
- não sobrepor arquivo local modificado sem decisão humana
```

### 7. verify_equal

Prova final.

```
- compara estrutura esperada × real
- compara shas dos arquivos críticos
- sem assumir "synced" só pelo retorno 200 do svc
- sem descartar UNKNOWN como se fosse igual
```

---

## Regras de ouro (obrigatórias em toda FRONT de sync)

### ZERO REGRESSION

Nunca apaga no remoto (Drive, GitHub, etc.) sem confirmação explícita.

Se não tem certeza absoluta do que está apagando:

```
- não apaga
- move para _CONFLICTS/ com timestamp e motivo
- registra no receipt: o que foi movido, por quê, de onde veio
- entrega ao humano para decisão
```

Se for apagar mesmo (humano confirmou):

```
- receipt antes: SHA, nome, localização, motivo
- apaga só o que foi confirmado
- receipt depois: SHA, nome, confirmação de remoção
- se não confirmou: NÃO executa
```

UNKNOWN sobre o que está sendo apagado = _CONFLICTS/, não DELETE.

Sem pressa, sem forçar. Se não dá para medir, vira UNKNOWN, não PASS.

### HISTORICAL ≠ CURRENT (específico para Drive/repositórios)

Se um arquivo tá velho no remoto:

```
- não assume que é atual só porque tá lá
- não baixa automaticamente só porque existe
- não apaga automaticamente só porque é velho
- cruza com o que existe local antes de qualquer decisão
- se LOCAL tem versão mais nova: verifica fork, não sobrescreve cego
- se REMOTO tem versão mais nova: baixa só se útil e sem conflito
- se não dá para saber qual é a mais recente: vira UNKNOWN, não assume
```

Arquivo velho no remoto fica quieto.

Não confunda existência com atualidade. Não confunda timestamp com verdade.

O remoto é repositório, não fonte absoluta. Sem cross-check local, sem decisão.

### NO LIXO

Sempre ignorar antes de processar:

```
- .env*       (variáveis de ambiente, credenciais)
- auth.json   (arquivos de autenticação)
- node_modules/** (dependências de js/node)
- __pycache__/**  (cache de python)
- *.log       (logs)
- *.tmp       (temporários)
- *.bak       (backups)
```

Verifica se o arquivo é ignorável ANTES de qualquer operação. Se não sabe: não processa, vira UNKNOWN.

Sem subir `.env`, sem subir credenciais, sem subir lixo temporário.

### Writer único

Um writer por pasta/alvo por vez.

Sem escrever em paralelo no mesmo alvo. Sem assumir que outro processo não está escrevendo. Sem duplicar esforço.

### Sem resolver conflito bidirecional automaticamente

Se arquivo modificado em ambos os lados sem commitante claro: NÃO resolver automaticamente — chamar humano.

O humano decide: upload, download, merge manual, ou move para _CONFLICTS/.

---

## Conflicto: força se travar em conflito

Quando a FRONT encontra arquivo em conflito (versões diferentes, hash diferente):

**Padrão (sem --force):**
```
- NÃO apaga
- NÃO sobrescreve
- Move para _CONFLICTS/<timestamp>_<nome> (se tiver permissão)
- Registra no receipt: o que foi movido, por quê, de onde veio
- Entrega ao humano para decisão
```

**Com --force (humano explicitamente autorizou):**
```
- Move para _CONFLICTS/<timestamp>_<nome> (mesmo que sem --force)
- Mas sem pedir confirmação extra (humano já autorizou)
- Registra no receipt: o que foi movido, por quê, de onde veio
- Se não tem permissão para mover: registra como FAILED, não apaga
```

**IMPORTANTE:** --force não significa "apaga tudo". Significa "move para _CONFLICTS/ sem perguntar". O arquivo segue disponível em _CONFLICTS/ para reversão manual.

**Nunca apaga sem confirmação. Nunca apaga e não deixa cópia.**

---

## Estrutura de script de reconciliação

Todo script de reconciliação segue esta estrutura:

```python
#!/usr/bin/env python3
"""
<nome>.py — Reconciliador <remoto> ↔ workspace local.
Front do FABLE LOOP: FRONT <N>: <NOME>.

Uso:
  python scripts/<nome>.py              # sync completo (se configurado)
  python scripts/<nome>.py --dry-run    # só mostra o que faria
  python scripts/<nome>.py --check      # verifica se está configurado
  python scripts/<nome>.py --local <pasta> --dry-run  # modo local sem remoto

Regra: sem credencial/config, vira UNKNOWN. Sem apagar/sobrescrever sem
confirmação humana (--force + confirmação). Sem copiar lixo.
"""

# Estrutura obrigatória:
# 1. Config (caminhos, padrões ignore, mappings)
# 2. SHA256 (blocos, não carrega tudo)
# 3. list_local_tree (walk, ignora, shas)
# 4. generate_report (diff local vs remoto)
# 5. print_report (resumo + detalhes)
# 6. check_config (verifica se tá configurado)
# 7. main (argparse: --dry-run, --check, --local, --config, --force, --resolve-conflicts)
```

---

## Estrutura de configuração

Todo script de reconciliação usa um config.yaml com:

```yaml
drive:  # ou nome do svc
  root_folder_name: "CentralDark"  # opcional

  mappings:
    - local: "pasta_local"
      remote: "Pasta no Remoto"

  ignore:
    - ".env*"
    - "auth.json"
    - "node_modules/**"
    - "__pycache__/**"
    - "*.log"
    - "*.tmp"
    - "*.bak"

  # direction (opcional): upload_only, download_only, bidirectional
  # auth (opcional): credenciais só se o svc vigente exigir arquivo
```

**NUNCA coloque credenciais/tokens no config.yaml.** Use o svc vigente.

---

## Integrazione no FABLE LOOP

Para integrar uma nova FRONT no FABLE LOOP:

1. **Criar a skill** `centraldark-<nome>-reconciliation` (ou similar)
2. **Criar o script** `scripts/<nome>_reconcile.py`
3. **Criar o config** `example_config.yaml` (modelo) em `skills/centraldark-<nome>-reconciliation/`
4. **Criar a pasta de conflitos** `_CONFLICTS/` e adicionar ao `.gitignore`
5. **Atualizar o fable-loop/SKILL.md** para adicionar a FRONT na tabela e no fluxo
6. **Verificar a numeração de FRONTs** — evitar duplicação ou lacuna

### Numeração de FRONTs

A numeração de FRONTs é canônica e sequencial. Antes de adicionar uma nova:

1. Ler o fable-loop/SKILL.md
2. Verificar a numeração atual na tabela de fronts
3. Adicionar a nova FRONT na posição correta (sequencial, sem duplicação)
4. Se houver inconsistência entre o que a skill afirma e o que o fable-loop define:
   - Corrigir a skill para bater com o fable-loop, OU
   - Corrigir o fable-loop para bater com a skill (se a skill é canônica)
   - NUNCA deixar inconsistência ir embora

**Regra:** a numeração de FRONTs no fable-loop/SKILL.md é a fonte canônica. A skill de cada FRONT deve referenciar o número correto.

---

## Artefatos criados nesta sessão

### Script: drive_reconcile.py

```
CentralDark/scripts/drive_reconcile.py
  - --dry-run      (mede e mostra, não executa)
  - --check        (verifica se está configurado)
  - --local <pasta> (modo local sem Drive)
  - --config <caminho> (caminho do config.yaml)
  - --resolve-conflicts <report.json> (move conflitos para _CONFLICTS/)
  - --force        (força conflitos para _CONFLICTS/ sem pedir confirmação)
```

### Skill: centraldark-drive-reconciliation

```
skills/centraldark-drive-reconciliation/SKILL.md
  - Front: FABLE LOOP (deveria ser FRONT 4: DRIVE_DOCS, ver inconsistência)
  - Workflow: measure_local → measure_remote → reconcile →
              clean_garbage → push_useful → pull_remote → verify_equal
  - Regras: ZERO REGRESSION, HISTORICAL ≠ CURRENT, NO LIXO
  - Hard stops: confirmação humana antes de push/destroy/delete
  - Conflict: move para _CONFLICTS/ (com --force ou sem)
```

### Config exemplo (FALTANTE NESTA SESSÃO)

```
skills/centraldark-drive-reconciliation/example_config.yaml
  - Modelo de config.yaml para drive_reconcile.py
  - Não contém credenciais (use o svc vigente)
  - CRIAR SE FALTAR (não assume que existe)
```

### Pasta de conflitos: _CONFLICTS/

```
_CONFLICTS/  (pasta vazia, adicionada ao .gitignore)
  - Arquivos movidos por --resolve-conflicts
  - Não versionar (gitignore)
```

---

## Verificação de integração

Após integrar uma nova FRONT, verificar:

```
1. Script funciona: python scripts/<nome>.py --check
2. Script funciona: python scripts/<nome>.py --help
3. Script funciona: python scripts/<nome>.py --dry-run [--local <pasta>]
4. Skill está no lugar: ls skills/centraldark-<nome>-reconciliation/SKILL.md
5. Config exemplo está no lugar: ls skills/centraldark-<nome>-reconciliation/example_config.yaml
   - SE NÃO EXISTIR: criar ou registrar como pending no skill
6. _CONFLICTS/ existe e está no .gitignore
7. Fable Loop atualizado: FRONT <N>: <NOME> na tabela e no fluxo
8. Numeração consistente: nenhuma duplicação, nenhuma lacuna
```

---

## Inconsistências detectadas nesta sessão

### FRONT 3: DRIVE_DOCS vs CASA_WORKTREES_RUNTIME

- No fable-loop/SKILL.md (skills/fable-loop/SKILL.md), FRONT 3 = CASA_WORKTREES_RUNTIME, FRONT 4 = DRIVE_DOCS_RECEIPTS
- Na skill centraldark-drive-reconciliation, afirma "FRONT 3: DRIVE_DOCS"
- O usuário disse: "FRONT 3 (DRIVE_DOCS) do Fable Loop"
- **Ação necessária:** corrigir um dos dois para bater com o outro
  - Se FRONT 3 = DRIVE_DOCS: atualizar fable-loop/SKILL.md (FRONT 3 → DRIVE_DOCS, FRONT 4 → CASA_WORKTREES_RUNTIME ou renumerar)
  - Se FRONT 3 = CASA_WORKTREES_RUNTIME: corrigir a skill drive para "FRONT 4: DRIVE_DOCS"
  - **Nunca deixar inconsistência ir embora**

### example_config.yaml faltante

- A skill centraldark-drive-reconciliation/SKILL.md menciona example_config.yaml
- O arquivo não existe no disco (write_file falhou com timeout nesta sessão)
- **Ação necessária:** criar o arquivo ou registrar como pending no skill

---

## Regras protegidas (não editar)

- `fable-loop/SKILL.md` — carregado via skill_view, pode ser bundled/hub/pinned
  → se for protegido, não editar; notificar o usuário da inconsistency
- `centraldark-drive-reconciliation/SKILL.md` — criado por usuário nesta sessão
  → não editar; recomendar `hermes curator adopt centraldark-drive-reconciliation`
- `centraldark-drive-reconciliation/example_config.yaml` — criar se faltar

---

## Quando entregar ao humano

- Inconsistência de FRONT não resolvida
- Script não compila ou dá erro de sintaxe
- _CONFLICTS/ não está no .gitignore
- Config exemplo não existe
- Skill não está integrada ao FABLE LOOP na tabela de fronts
- Numeração de FRONTs com lacuna ou duplicação

---

## Regra de ouro

Same fire, same simple, same dangerous se você não medir.

Front integration não é mágica. É medir, integrar, verificar, registrar. Sem isso, é só copiar lixo de um lado pro outro e fingir que ficou melhor.
