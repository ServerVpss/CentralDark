---
name: hermes-desktop-concert
description: Diagnose Hermes desktop app failures by reading logs first.
version: 1.0.0
author: SOL-Pivete
category: hermes
---

# Hermes Desktop Concert

## Purpose
Triage why the Hermes desktop app is failing and pick the least-destructive repair path — reading logs first, without assuming OpenRouter credits or inventing providers.

## When to use
- User says the desktop app is broken, stuck, crashing, not connecting, or "concerta o app desktop".
- Before any repair, always triage from the logs first — don't guess.
- After triage, either fix a real identifiable cause or hand the finding to the user with the exact gap.

## Log triage — first, always

### 1. Confirm the installation path exists
```bash
ls -la "C:/Users/danda/AppData/Local/hermes"
ls -la "C:/Users/danda/AppData/Local/hermes/logs"
```
If the directory doesn't exist, the app was uninstalled or moved — stop and tell the user the path is gone.

### 2. Count and eyeball log files
```bash
ls "C:/Users/danda/AppData/Local/hermes/logs" | wc -l
du -sh "C:/Users/danda/AppData/Local/hermes/logs"
```
Big files (desktop.log, agent.log, errors.log, mcp-stderr.log, logs.zip) are high-value targets. Small metadata logs matter less.

### 3. Diagnose app failure mode from desktop.log

Tail the desktop log and grep for the two classic failure fingerprints:

**Failure A — model API failure (credits, rate limit, billing)**
```bash
tail -c 40000 "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "402" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "rate-limited" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "provider returned error" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
```
If you see repeated HTTP 402 or rate-limited upstream, the app is failing because the active provider/credential can't fulfill the request. Diagnosis: **provider supply problem**, not a desktop bug.

**Failure B — SSH / remote connection failure**
```bash
grep -i "Desktop boot failed" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "hermes executable" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "ssh-session-token-file" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
```
Two sub-cases:

- Hermes not installed on the remote — log says "Hermes is not installed on the remote host (could not find a hermes executable)". Fix: install Hermes on the remote host with `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh`.
- Remote Hermes version too old for SSH Desktop mode — log says "The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce". Fix: update Hermes on the remote.

**Failure C — local backend timeout / renderer disconnect**
```bash
grep -i "Timed out connecting to Hermes backend" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "ECONNRESET" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "HERMES_BACKEND_READY" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
```
If the backend never reaches HERMES_BACKEND_READY or the renderer times out repeatedly, diagnose the local backend, not the remote.

### 4. Confirm provider credentials from auth.json

The desktop app's ability to call a model depends on what Hermes actually holds:

```bash
python - <<'PY'
import json, pathlib
p = pathlib.Path("C:/Users/danda/AppData/Local/hermes/auth.json")
d = json.loads(p.read_text())
print("active_provider:", d.get("active_provider"))
for pool_name, creds in d.get("credential_pool", {}).items():
    print(f"\n[{pool_name}]")
    for c in creds:
        print(f"  id={c.get('id')} label={c.get('label')} source={c.get('source')} base_url={c.get('base_url')} last_status={c.get('last_status')}")
PY
```
Check:
- active_provider — qual provedor o Hermes esta tentando usar.
- credential_pool — cada pool tem credenciais com last_status, source, base_url.
- Se source for env:VAR_NAME, a chave precisa estar na variavel de ambiente do sistema. Se o agente nao puder ver o valor, diagnostique como credential gap no env, nao como chave invalida.

## Provider fallback — before touching logs or config

Se o triage aponta provider failure (402, rate limit, billing esgotado) e o usuario diz que tem outra ligacao (ex.: Google Generative API), o fluxo correto e:

1. Ler auth.json e identificar se ja existe um credential_pool para aquele provedor.
2. Verificar se a chave ta disponivel no env ou se falta autenticacao.
3. Se a chave ta no auth.json sem source: env (token gravado), testar direto com uma chamada de ping minima.
4. Se a chave vem de env e nao ta disponivel ao agente, avisar o usuario que falta a variavel e pedir a chave ou o fluxo de terminal — nao inventar.

Nao cair na armadilha do OpenRouter creditado como padrao. Se o usuario diz explicitamente que nao quer depender de credito OpenRouter, respeite e siga o provider alternativo que ele mencionou.

## Repair paths by diagnosis

| Diagnosis | Repair | Owner |
|---|---|---|
| OpenRouter credit esgotado (402 em todos os modelos) | Trazer credito no OpenRouter OU trocar active_provider/provider para um modelo funcional com credencial disponível | Usuario decide a origem |
| SSH remote sem Hermes | Usuario instala Hermes no VPS via curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh | Usuario (VPS) |
| SSH remote Hermes versao antiga (--ssh-session-token-file nao suportado) | Usuario atualiza Hermes no VPS | Usuario (VPS) |
| Falha de backend local (timeout/ECONNRESET) | Diagnosticar Python venv, hermes serve, porta, e correlacionar com agent.log, errors.log | Agente + usuario |
| Provider alternativo disponivel no auth.json mas underexplored | Testar ping minima com a credencial mais fraca possivel antes de assumir que nao funciona | Agente |

Nao aplicar nenhuma correcao ate o triage apontar uma causa identificada. Se o log nao diz nada conclusivo, devolver "UNKNOWN com evidencia do que foi checado" — nao adivinhar.

## Pitfalls

- Nao tratar logs.zip como o log vivo. E um snapshot — diagnostique de logs/*.log se existirem e forem recentes.
- Nao assumir curator/ com arquivos significa o app ta com problema — pasta vazia e normal, nao bug.
- Nao confundir provider failed no log com app quebrado. Falha de API de modelo e muitas vezes problema de credential/credit, nao conserto do app.
- Nao reformular a analise do log em paredao gigante. Diagnostique nos bastidores, relate apenas os achados de alto sinal com o grep exato e a linha de evidencia.
- Nao modificar conteudo de logs/ a menos que o usuario peça reparo que toque logs. Triagem e read-only; reparo e explicito.

## Workflow recap

```text
USER: "concerta o app desktop"
  -> medir: ls logs, tail desktop.log, grep 402, grep ssh, grep backend timeout
  -> ler auth.json: active_provider + credential_pool
  -> classificar: A (credits/billing), B (SSH remote), C (backend local), ou OUTRO
  -> se A: provavelmente provider/credit, nao bug do app — avisar ao usuario
  -> se B: instrucao exata de instalacao/atualizacao do Hermes no VPS
  -> se C: investigar backend local com agent.log/errors.log
  -> se provider alternativo mencionado pelo usuario: verificar auth.json + env antes de pedir
  -> reparar apenas o que o triage apontou
  -> reportar diagnostico + provavel causa + proxima acao
```

## References

- references/desktop-triage-patterns.md — fingerprints de falha reais: OpenRouter 402, SSH desktop failure chain (Hermes nao instalado vs. versao sem suporte), custo de diagnostico via tail+grep em desktop.log grande.
- references/auth-json-provider-fingerprint.json — formato canonico de como Hermes registra provedores no auth.json, usado para identificar credential gaps.

## Templates

- templates/desktop-concert-report.md — estrutura de relatorio de diagnostico: triagem feita, fingerprint observado, classificacao, causa provavel, acao recomendada, o que foi verificado e o que e UNKNOWN.
