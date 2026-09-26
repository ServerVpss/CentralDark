# Process Tree Discovery — VS Code Terminal + Hermes Agent (2026-08-25)

## Contexto
Investigação do processo "ORQUESTRADOR HARNES" (PID 6192) visto no VS Code terminal details, para entender a árvore de processos da Casa.

## Árvore de Processos Descoberta

```
explorer.exe (11196) — shell do Windows
  └── Code.exe (47368) — VS Code principal
        └── Code.exe (93040) — Node service utility (pty host)
              ├── powershell.exe (6192) — Terminal "ORQUESTRADOR HARNES"  ← PID da screenshot
              │     └── hermes.exe (74824) — Hermes Agent rodando DENTRO do terminal VS Code
              ├── powershell.exe (37640)
              ├── powershell.exe (4064)
              ├── powershell.exe (88580)
              ├── powershell.exe (23716)
              ├── powershell.exe (9884)
              ├── powershell.exe (60892)
              ├── powershell.exe (84652)
              └── powershell.exe (95068)
```

## Comandos de Descoberta Validados

### 1. Listar processos relevantes
```bash
tasklist /FO TABLE | findstr -i "powershell\|node\|hermes\|code"
```

### 2. Obter CommandLine + ParentProcessId de um PID
```bash
wmic process where "ProcessId=6192" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST
```

### 3. Subir a árvore recursivamente
```bash
# Pai do 6192
wmic process where "ProcessId=93040" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST

# Pai do 93040
wmic process where "ProcessId=47368" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST

# Pai do 47368
wmic process where "ProcessId=11196" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST
```

### 4. Listar todos os PowerShell filhos do VS Code
```bash
wmic process where "Name like '%powershell%'" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST
```

### 5. Filtrar apenas processos hermes
```bash
wmic process where "Name like '%hermes%'" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST
```

## Lições Cristalizadas

### 1. VS Code Spawn Tree
- VS Code principal (47368) → Node utility (93040) → múltiplos `powershell.exe` (terminais integrados)
- Cada terminal PowerShell é filho direto do processo Node utility (pty host)
- O Hermes Agent (74824) roda como **filho do terminal PowerShell** (6192), não como processo independente do VS Code

### 2. Hermes Agent no Terminal VS Code
- O Hermes roda **dentro** da sessão terminal do VS Code
- Fecha o terminal → mata o Hermes (background terminal session dies → orphan process dies)
- Confirma a **Liçao 27/34/38**: `background=true` sem daemon robusto = morte silenciosa

### 3. Identificação Visual no VS Code
- Terminal mostra "ORQUESTRADOR HARNES" como título
- Shell integration: "Rich"
- CWD: `E:\CentralDark\Pivete\CentralDark`
- Prompt input: `hermes` (mostra que o Hermes estava ativo no prompt)

### 4. Múltiplos Terminais = Múltiplos PIDs PowerShell
- VS Code cria um processo `powershell.exe` por terminal aberto
- Todos compartilham o mesmo ParentProcessId (93040 = Node utility)
- Útil para matar terminais específicos sem matar o VS Code inteiro

## Aplicação Prática

### Matar terminal específico (sem quebrar VS Code)
```bash
taskkill /PID 6192 /F  # Mata só o terminal "ORQUESTRADOR HARNES" + filho hermes.exe
```

### Verificar se Hermes está rodando no terminal VS Code
```bash
wmic process where "Name like '%hermes%'" get ProcessId,ParentProcessId,CommandLine /FORMAT:LIST
# Se ParentProcessId for um powershell.exe → está rodando em terminal VS Code
```

### Subir Hermes fora do terminal VS Code (daemon robusto)
Para evitar morte silenciosa ao fechar terminal:
- Usar `hermes serve` ou similar como serviço/daemon independente
- Implementar os 6 pilares do Daemon Robusto (Liçao 26/33)

## Referência Cruzada
- Liçao 26/33: `daemon-robust-mandatory-rules.md` — 6 pilares obrigatórios
- Liçao 27/34/38: `auto-destilador-death-lesson.md` — terminal background morre silenciosamente
- Liçao 28/35/39: `auto-destilador-kanban-hook.md` — hook Kanban ativo