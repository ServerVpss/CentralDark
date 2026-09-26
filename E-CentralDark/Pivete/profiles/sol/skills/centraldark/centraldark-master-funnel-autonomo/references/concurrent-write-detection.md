# Concurrent Write Detection — Writer Collision Forensics

> **Quando usar:** Dois ou mais escritores (agentes, humanos, processos) podem estar editando o mesmo arquivo/scope simultaneamente. O arquivo "volta ao estado anterior" após correção, ou há edições não explicadas no git log. Usar para investigar colinearidade de escrita antes de assumir falha de agente ou bug de sistema.

---

## Sinais de Writer Collision

- Arquivo corrigido → teste passa → arquivo "regresse" para estado anterior
- git diff HEAD vs disco mostra diferenças inesperadas depois de commit
- Editores/IDEs abrem o mesmo arquivo que o agente está modificando
- Timestamps de modificação não coincidem com commits conhecidos
-git log mostra autor humano (ex: "SegredoiDev") em commits recentes do arquivo

## Cenário Real Observado (2026-08-31)

```
FILE: scripts/health_check.sh
-------------------------------
Agente corrige função get_proc_mem (KB→MB integer division)
→ Teste 17/17 PASS
→ Arquivo "regresse" para estado anterior
→ Nova correção necessária

INVESTIGAÇÃO FORENSE:
  git log -- scripts/health_check.sh
  → commit f78e5b316: SegredoiDev, 22:31:26
  → commit 3fa8963f2: SegredoiDev, 22:18:12
  → commit 9d3b38736: SegredoiDev, 20:58:44

  timestamp disco: 2026-08-31 22:31:11
  timestamp commit f78e5b316: 2026-08-31 22:31:26

CONCLUSÃO:
  → O "escritor concorrente" foi o CHEFE (SegredoiDev) via IDE/editor
  → Não foi agente-vs-agente. Foi humano-vs-agente.
  → A ferida é: sistema não registra quem escreveu o quê, quando,
    em qual sessão, de forma observável SEM rely only on git log.
```

## Invariantes Necessários

```
ONE_WRITER_PER_SCOPE
→ Se dois escritores querem o mesmo arquivo, um espera ou o escopo
  é subdividido com ownership claro.

TRACE_DO_WRITER_REAL
→ Cada escrita commitada deve poder responder:
  - writer_id (quem: agente ID, humano GitHub user, processo)
  - process_id (PID do processo que executou a escrita)
  - session_id (sessão Hermes/ID da operação)
  - trace_id (cadeia causal da operação)
  - commit/head (sha do commit, branch)
  - before/after hash (diff material)
```

## Deteção Prática

### 1. Git-based detection (leve, disponível sempre)

```bash
# Quem commitou o arquivo recentemente?
git log --format='%h %an <%ae> %ai %s' -10 -- scripts/health_check.sh

# O disco difere do HEAD?
git diff HEAD -- scripts/health_check.sh

# Há unstaged changes?
git status --short -- scripts/health_check.sh

# Timestamps do arquivo
stat -c '%y %n' scripts/health_check.sh
```

### 2. Process-based detection (quando ferramentas disponíveis)

```powershell
# Processos ouvindo portas relevantes (Screenpipe 3030, Omni 8099)
Get-NetTCPConnection -State Listen -LocalPort 3030,8099,8787 |
  Select-Object LocalPort, OwningProcess

# Processos com handles elevados (possíveis editors/IDEs)
Get-Process | Where-Object { $_.Handles -gt 50 } |
  Sort-Object WorkingSet64 -Descending |
  Select-Object -First 15 ProcessName, Id, CPU, WorkingSet64, Handles
```

**Limitação:** PowerShell/Get-Process pode ser lento ou indisponível (fork unavailable, WinError 10061). Ter alternativa em Python com Win32 API (GetExtendedTcpTable) é útil para forense quando PowerShell falha.

### 3. File watcher / hook-based detection

O hook `post-merge` do repo executa:
```bash
python3 .agents/skills/reality-drift-detector/detector.py --once
```

**PROBLEMA IDENTIFICADO:** O hook depende de `python3` que pode estar indisponível no PATH da máquina. Quando indisponível, o hook falha SILENCIONAMENTE (redirecionado para /dev/null), e o drift detection não roda.

**Verificação:**
```bash
# O python3 existe?
which python3 || echo "python3 indisponível"

# O detector existe?
ls -la .agents/skills/reality-drift-detector/detector.py

# O hook está configurado?
cat .git/hooks/post-merge
```

### 4. Screenpipe como testemunha forense

Screenpipe (port 3030) grava frames da tela e pode servir como evidência de quem estava editando o arquivo e quando.

```bash
# Verificar se Screenpipe tá vivo
curl -s http://127.0.0.1:3030/health
→ {"status":"healthy", ..., "last_frame_timestamp":"2026-08-31T23:15:46-03:00", ...}

# Se healthy, pode-se investigar frames capturados
# para ver atividade do editor/IDE no arquivo
```

**Lei:** `CONFIGURED != ACTIVE`. Screenpipe pode estar rodando mas não capturar a sessão relevante. `HEALTH != PROVIDER_INVOCATION_PROOF`.

## Distinção Importante

| Tipo de Colisão | Detecção | Ação |
|---|---|---|
| Agente vs Agente | git log mostra commits de different authors | ONE_WRITER_PER_SCOPE: handoff explícito |
| Humano vs Agente | git log mostra autor humano (SegredoiDev) + timestamp sync | Coordenar: humano avisa agente antes de editar, ou agente trava arquivo |
| Processo vs Processo | processos com mesmo arquivo aberto | Identificar owner do processo, não matar sem avaliação |
| Hook quebrado (python3 missing) | hook roda mas script não executa (silencioso) | Documentar dependência, adaptar para python disponível |

## Ouro Cristalizado

1. **Nome do autor no git log NÃO é suficiente para rastreabilidade completa.** Precisa de: writer_id + process_id + session_id + trace_id + commit/head + before/after hash.

2. **Hook silenciosamente quebrado ≠ hook funcionando.** Quando um hook redireciona output para /dev/null e a dependência (python3) tá indisponível, o hook "succeed" mas não executa a ação pretendida. Isso é gap de observabilidade real.

3. **A ausência de omni-router (port 8099 recusada) quebra a cadeia de rastreadura.** Se o Omni Router é o gateway entre Screenpipe e Hermes, e ele tá down, não há como provar consumo de Screenpipe pela Hermes nesta sessão. `CORRELATION != CAUSE`.

4. **Screenpipe vivo (3030 healthy) é NECESSÁRIO mas NÃO SUFICIENTE** para provar que agente consumiu tela. Precisa de: frame capture + tool invocation + trace ID propagado.

## Gap Identification

```
MECANISMO EXISTENTE:
  - reality-drift-detector/detector.py (monitora git drift, salva .state.json)
  - git hooks (post-merge roda detector)
  - Screenpipe (port 3030, captura tela)

LACUNAS:
  [ ] Hook post-merge quebrado — python3 indisponível, execução silenciosa
  [ ] Detector não captura: writer_id, process_id, session_id, trace_id
  [ ] Detector monitora apenas arquivos canônicos (LEIA-ME, AGENTS, etc),
      não scripts/health_check.sh
  [ ] Omni Router (8099) indisponível — quebra cadeia Screenpipe→Hermes
  [ ] Sem mecanismo de trace que ligue escrita → session → trace → commit
  [ ] LEIA-ME-IA.md não documenta hook quebrado nem pendências de ambiente

PRÓXIMOS PASSOS POSSÍVEIS (não executar sem autorização):
  [ ] Adaptar hook para usar 'python' quando 'python3' indisponível
  [ ] Estender detector.py para capturar writer/process/session/trace
  [ ] Documentar em LEIA-ME: hook status, dependências, pendências
  [ ] Testar Screenpipe capture para ver atividade de editor no arquivo
```

## Leitura Correta da Situacao

```
O CHEFE observou corretamente:
  → O problema não é "falta de mecanismo"
  → É "coordenação concorrente do mecanismo existente"
  → O invariante necessário é ONE_WRITER_PER_SCOPE + trace do writer real

O que os commits mostram:
  → O "escritor concorrente" foi o CHEFE mesmo (SegredoiDev)
  → Não agente-vs-agente. Humano-vs-agente.
  → O sistema não tinha instrumentação para mostrar isso em tempo real

A ferida real:
  → Quando humano edita arquivo que agente está mexendo,
    não há handshake, não há trace, não há coordenação visível.
  → Isso vira "alguém mexeu e ninguém sabe quem" quando na verdade
    é o CHEFE mexendo e o sistema não registrando de forma observável.

O detector.py existe mas:
  → monitora drift de arquivos canônicos e status git
  → NÃO captura quem escreveu o quê
  → NÃO tem writer_id, process_id, session_id, trace_id
  → Seu hook tá quebrado (python3 missing)
  → Não cobre scripts/health_check.sh (archivo não canônico)
```

## Verificação Rápida (script)

```python
#!/usr/bin/env python3
"""Verificação rápida de writer collision para arquivo alvo."""
import subprocess, os, sys

def cmd(c):
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=10)
        return r.stdout.strip(), r.returncode
    except Exception as e:
        return f"ERR:{e}", 1

target = sys.argv[1] if len(sys.argv) > 1 else "scripts/health_check.sh"

print(f"=== WRITER COLLISION CHECK: {target} ===\n")

out, rc = cmd(f"git log --oneline -5 -- {target}")
print(f"1. Últimos 5 commits ({target}):")
print(out or "(sem commits para este arquivo)")
print()

out, rc = cmd(f"git diff HEAD -- {target}")
print(f"2. Disco vs HEAD (diff):")
print(out if out else "  → Sincronizado com HEAD (sem diferenças)")
print()

out, rc = cmd(f"git status --short -- {target}")
print(f"3. Status git:")
print(out if out else "  → Limpo (nada para commitar)")
print()

out, rc = cmd(f"stat -c '%y' {target}")
print(f"4. Timestamp modificação: {out}")
print()

out, rc = cmd("which python3 2>/dev/null || echo 'INDISPONÍVEL'")
print(f"5. python3 disponível: {out}")
print()

out, rc = cmd("cat .git/hooks/post-merge 2>/dev/null | head -3")
print(f"6. Hook post-merge (primeiras linhas):")
print(out if out else "  → Hook não existe ou vazio")
print()

out, rc = cmd("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3030/health")
print(f"7. Screenpipe (3030) HTTP status: {out}")
print()

out, rc = cmd("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8099/health")
print(f"8. Omni Router (8099) HTTP status: {out}")
print()

print("=== CHECK COMPLETO ===")
```
