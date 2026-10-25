# 🚀 PLANO DE MIGRAÇÃO: F:\_worktrees → K:\_worktrees

## 📊 INVENTÁRIO COMPLETO

**Total: 67 arquivos**
**Tamanho aproximado: ~105 MB** (maioria é go-setup.msi 64 MB)

### Categorias:

#### 1️⃣ INSTALADORES & MSI (1 arquivo)
```
go-setup.msi (64 MB)
  └─ Tipo: Microsoft Installer
  └─ Uso: Go 1.27.3 Windows installer
  └─ Crítico: ⚠️ GRANDE, pode deletar se Go já instalado
```

#### 2️⃣ SCRIPTS BATCH & POWERSHELL (8 arquivos)
```
cd-go-dl.cmd           (314 B)  - Download Go
cd-go-dl2.cmd          (355 B)  - Download Go (alternativo)
cd-go-install.log      (124 B)  - Log instalação Go
cd-commit.ps1          (1.7K)   - Git commit script
cd-scan.ps1            (1.6K)   - Scan script
cd-neon.ps1            (3.8K)   - Neon DB script
pr1919-jobs.ps1        (1.1K)   - PR 1919 jobs
cd-reconcile.cmd       (445 B)  - Reconciliação
```
**Uso:** Automação, CI/CD, operações

#### 3️⃣ LOGS (36+ arquivos)
```
cd-preview.log         (2.5M)   - Preview build
cd-go-msi.log          (38M)    - MSI download log (⚠️ GRANDE)
cd-build2.log          (25K)    - Build output
cd-vite.log            (23K)    - Vite build
cd-dev.log             (23K)    - Dev server
cd-cfg.log             (1.9K)   - Config
cd-keep.nul            (326K)   - Keep alive
cd-reconcile.log       (7.1K)   - Reconciliation
pr-1895-*.log          (múltiplos) - PR 1895 logs
pr1919-watch.log       (35K)    - PR 1919 watch
... (20+ mais)
```
**Uso:** Auditoria, debug, rastreamento

#### 4️⃣ PATCHES & DIFFS (2 arquivos)
```
pr-1895-dailyreview-contraste.patch    (9.8K)  - Patch dailyreview
pr-1895-autosync-contraste.patch       (3.8K)  - Patch autosync
```
**Uso:** Aplicar mudanças em branches

#### 5️⃣ SCRIPTS PYTHON (3 arquivos)
```
cd-fcntl-patch.py      (1.8K)   - File control patching
cd-lock-test.py        (1.6K)   - Lock testing
cd-lock-test2.py       (1.4K)   - Lock testing variant
```
**Uso:** Testes de lock, patch automation

#### 6️⃣ COMPONENTES TSX/TYPESCRIPT (2 arquivos)
```
DailyReviewPanel.antes.tsx                (9.3K)  - Antes de mudança
ClaudeNotificationsHub.pr-mock.tsx        (7.9K)  - Mock component
```
**Uso:** Backup de componentes antes de modificação

#### 7️⃣ METADADOS & TEXTO (15+ arquivos)
```
cd-excl.txt            (5.5K)   - Exclusions list
cd-pair-search.txt     (6.9K)   - Pair search results
cd-msg.txt             (489 B)  - Message
cd-msg2.txt            (582 B)  - Message 2
cd-neon-msg.txt        (473 B)  - Neon message
cd-neon.out            (521 B)  - Neon output
pr1919-comment.md      (994 B)  - PR comment
cd-add.err             (61K)    - Add error output
cd-add.out             (0 B)    - Add success output
... (6+ mais)
```
**Uso:** Comunicação, metadados, resultados de operações


## 🛠️ COMO FAZER A MIGRAÇÃO

### Opção A: CÓPIA SIMPLES (recomendada — preserva TUDO)

```bash
# 1. Criar diretório em K:
mkdir -p K:/_worktrees

# 2. Copiar tudo (preservar timestamps, atributos, sem seguir symlinks)
robocopy "F:\_worktrees" "K:\_worktrees" /E /COPY:DAT /R:3 /W:5

# 3. Verificar cópia
dir K:\_worktrees | wc -l        # Deve ser 67 arquivos
```

**Flags explicadas:**
- `/E` = Copia subdiretórios (com vazio)
- `/COPY:DAT` = Copia Data, Atributos, Timestamps
- `/R:3` = Retry 3x se falhar
- `/W:5` = Aguarda 5s entre retries

---

### Opção B: CÓPIA SELETIVA (se disco K: limitado)

```bash
# 1. Copiar TUDO MENOS go-setup.msi (64 MB)
robocopy "F:\_worktrees" "K:\_worktrees" /E /COPY:DAT /XF "go-setup.msi"

# 2. Se precisar depois, pode baixar novamente:
cd K:\_worktrees
cd-go-dl.cmd          # Script de download fica em K:
```

---

### Opção C: MIGRAÇÃO COM LIMPEZA (otimizada)

```bash
# 1. Copiar SCRIPTS + PATCHES + COMPONENTES (o que é referência)
mkdir -p K:/_worktrees
copy "F:\_worktrees\*.cmd" "K:\_worktrees\"
copy "F:\_worktrees\*.ps1" "K:\_worktrees\"
copy "F:\_worktrees\*.patch" "K:\_worktrees\"
copy "F:\_worktrees\*.tsx" "K:\_worktrees\"
copy "F:\_worktrees\*.py" "K:\_worktrees\"

# 2. Copiar LOGS recentes (últimos 7 dias)
# (usar robocopy com /MAXAGE para arquivos recentes)

# 3. IGNORAR:
#  - go-setup.msi (64 MB — Go já instalado)
#  - cd-go-msi.log (38 MB — pode regenerar)
#  - cd-preview.log (2.5 MB — pode regenerar)
```

---

## ✅ VERIFICAÇÃO PÓS-MIGRAÇÃO

```bash
# 1. Contar arquivos
ls K:\_worktrees | wc -l         # Deve ser 67 (ou menos se seletiva)

# 2. Verificar tamanho
du -sh K:\_worktrees              # Deve ser ~105 MB (ou ~1-2 MB se seletiva)

# 3. Validar scripts funcionam
cd K:\_worktrees
./cd-go-dl.cmd                     # Deve executar sem erro

# 4. Validar Python scripts
python cd-fcntl-patch.py --help    # Deve rodar

# 5. Comparar timestamps
ls -lh K:\_worktrees | head -5     # Deve ter datas recentes
ls -lh F:\_worktrees | head -5     # Deve ser idêntico
```

---

## 📋 O QUE PRECISA DE ATENÇÃO

| Item | Status | Ação |
|------|--------|------|
| **go-setup.msi** | ⚠️ PESADO | Copiar? SIM (preserva) ou NÃO (libera 64 MB)? |
| **cd-go-msi.log** | ⚠️ 38 MB | Mesmo do MSI — pode deletar após cópia |
| **cd-preview.log** | ⚠️ 2.5 MB | Log de build — pode deletar |
| **Scripts .cmd/.ps1** | ✅ CRÍTICO | COPIAR SEMPRE — reutilizável |
| **Patches .patch** | ✅ CRÍTICO | COPIAR SEMPRE — referência de mudanças |
| **TSX components** | ✅ CRÍTICO | COPIAR SEMPRE — backup antes de edit |
| **Python .py** | ✅ IMPORTANTE | COPIAR SEMPRE — testes/automation |
| **Logs .log** | 📝 OPCIONAL | COPIAR se auditoria; DELETE se espaço |

---

## 🎯 RECOMENDAÇÃO FINAL

### Se disco K: tem espaço (>100 MB livre):
**Use Opção A (cópia completa)**
```bash
robocopy "F:\_worktrees" "K:\_worktrees" /E /COPY:DAT /R:3 /W:5
```
✅ Preserva TUDO  
✅ Sem perda de informação  
✅ Auditoria completa

---

### Se disco K: é limitado (<100 MB):
**Use Opção C (seletiva)**
```bash
# Copiar só o essencial (~5-10 MB)
copy "F:\_worktrees\*.cmd" "K:\_worktrees\"
copy "F:\_worktrees\*.ps1" "K:\_worktrees\"
copy "F:\_worktrees\*.patch" "K:\_worktrees\"
copy "F:\_worktrees\*.py" "K:\_worktrees\"
copy "F:\_worktrees\*.tsx" "K:\_worktrees\"
```
✅ Economiza 95 MB  
⚠️ Perde histórico de logs  
✅ Mantém capacidade operacional

---

## 📝 SCRIPT DE MIGRAÇÃO PRONTO

```batch
@echo off
REM Migração F:\_worktrees → K:\_worktrees

setlocal enabledelayedexpansion
set SOURCE=F:\_worktrees
set TARGET=K:\_worktrees
set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

echo [%TIMESTAMP%] Iniciando migração...
echo Origem: %SOURCE%
echo Destino: %TARGET%

if not exist "%TARGET%" (
    mkdir "%TARGET%"
    echo Diretório criado: %TARGET%
)

echo.
echo Opção 1: Cópia COMPLETA (com go-setup.msi)
echo robocopy "%SOURCE%" "%TARGET%" /E /COPY:DAT /R:3 /W:5 /V /LOG:"%TARGET%\migração_%TIMESTAMP%.log"
echo.
echo Opção 2: Cópia SELETIVA (sem go-setup.msi)
echo robocopy "%SOURCE%" "%TARGET%" /E /COPY:DAT /XF "go-setup.msi" /R:3 /W:5 /V /LOG:"%TARGET%\migração_%TIMESTAMP%.log"
echo.
echo Execute uma das linhas acima.
pause
```

---

**Status:** Pronto para executar quando der sinal!

