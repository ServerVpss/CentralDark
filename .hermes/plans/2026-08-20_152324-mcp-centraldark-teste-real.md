# MCP CentralDark — Teste Real e Reparo

> **Para Hermes:** Executar task-by-task. READ_ONLY até Task 3.

**Goal:** Testar se o MCP CentralDark funciona de verdade (tool call real, não receipt auto-declarado), e se não funcionar, reparar a autenticação OAuth.

**Contexto medido (não narrativa):**
- Gateway `api.centralldark.com` → 🟢 HTTP 200, 152 modelos
- MCP `mcp.centralldark.com` → configurado no Hermes com `auth: "none"` (deveria ser `oauth`)
- `hermes mcp list` → precisa confirmar se centraldark aparece e se responde
- `arsenal-council.sh` → conflito de merge (linhas 32-78) com `<<<<<<< Updated upstream`
- `regras.json` → íntegro, v4, gateway confirmado 2026-07-10
- `reparo-mcp-centraldark.bat` → existe, criado pelo Claude, não executado ainda
- Hermes cron jobs → 3 pinados (On-this-day, Dependabot, Garimpo), aguardando próximo schedule

**Arquitetura:** Hermes Desktop → MCP client → `mcp.centralldark.com` (OAuth) → VPS tools (110 ferramentas). O `.bat` de reparo faz: backup → remove conector → re-add com OAuth → login → teste.

---

## Task 1: Medir estado atual do MCP no Hermes (READ_ONLY)

**Objetivo:** Saber se o conector centraldark existe, está ativo, e responde.

**Passo 1:** Listar MCPs configurados
```bash
hermes mcp list
```
Esperado: centraldark aparece na lista (pode estar com auth errado)

**Passo 2:** Verificar config do MCP no Hermes
```bash
cat %LOCALAPPDATA%\hermes\mcp_servers.json
```
Esperado: ver a URL e tipo de auth atual do centraldark

**Passo 3:** Tentar chamar uma tool read-only do MCP
```bash
# Via Hermes tool_call (dentro do chat) ou via terminal
hermes mcp test centraldark
```
Esperado: se auth=none → 401. Se auth=oauth sem token → redirect_uri error.

**Verificação:** Se tool call responde → MCP funciona, PARA AQUI. Se 401/redirect → Task 2.

---

## Task 2: Localizar e validar o .bat de reparo (READ_ONLY)

**Objetivo:** Confirmar que o `reparo-mcp-centraldark.bat` existe e é seguro pra rodar.

**Passo 1:** Encontrar o arquivo
```bash
find "C:/CentralDark" -name "reparo-mcp-centraldark*" -o -name "hermes-mcp-centraldark*" 2>/dev/null
```

**Passo 2:** Ler o conteúdo e validar
- Confirmar que faz backup antes de remove
- Confirmar exit codes (0/10/20/30/40)
- Confirmar que não expõe secrets
- Confirmar rollback existe

**Passo 3:** Verificar se resultado.json tem os campos de segurança
- `evidencia: auto-declarada`
- `prova_independente_exigida: true`

**Verificação:** Arquivo existe, é seguro, tem rollback. Se não existir → pular pra Task 3.

---

## Task 3: Executar reparo OAuth (REQUER ORDEM DO CHEFE)

**Objetivo:** Re-autenticar o MCP centraldark com OAuth.

**Opção A — Via .bat (se existe e validado na Task 2):**
```cmd
cd C:\CentralDark
reparo-mcp-centraldark.bat
```

**Opção B — Via Hermes CLI (manual, sem .bat):**
```bash
# 1. Backup
hermes mcp list > backup_mcp_antes.txt

# 2. Remove conector atual
hermes mcp remove centraldark

# 3. Re-add com OAuth
hermes mcp add centraldark --url https://mcp.centralldark.com/mcp --auth oauth

# 4. Login OAuth (abre navegador)
hermes mcp login centraldark

# 5. Teste
hermes mcp test centraldark
```

**Opção C — Via UI do Hermes Desktop:**
1. Settings → MCP → centraldark
2. Mudar `auth: "none"` → `auth: "oauth"`
3. Save
4. Hermes abre flow OAuth automaticamente

**Verificação:** `hermes mcp test centraldark` retorna tool list, não 401.

---

## Task 4: Prova independente (OBRIGATÓRIA — receipt ≠ efeito)

**Objetivo:** Provar que o MCP funciona com tool call REAL, não com receipt do .bat.

**Passo 1:** Sessão nova do Hermes (não esta)
```bash
# Nova sessão CLI ou novo chat no Desktop
hermes chat --new
```

**Passo 2:** Chamar tool real do MCP CentralDark
```
# Dentro do chat, pedir pra usar uma tool do MCP
> usa a tool mcp_status do centraldark
```

**Passo 3:** Verificar resposta
- Se retorna dados reais (health, tools count, version) → 🟢 PASS
- Se retorna 401/error → ❌ FAIL, volta pra Task 3

**Verificação:** Tool call real respondeu com dados. Isso é PROVA, não receipt.

---

## Task 5: Resolver conflito de merge no arsenal-council.sh

**Objetivo:** Limpar o `<<<<<<< Updated upstream` / `>>>>>>> Stashed changes` no script.

**Arquivo:** `docs/CONSCIENCIA/ARSENAL/scripts/arsenal-council.sh` (linhas 32-78)

**Passo 1:** Ler as duas versões do conflito
- Updated upstream (linhas 33-48): mesma lógica, variável `REGRAS`
- Stashed changes (linhas 50-62): mesma lógica, variável `REGRAS_JSON`

**Passo 2:** Resolver — aceitar a versão mais limpa (Stashed usa nome mais explícito `REGRAS_JSON`)

**Passo 3:** Remover marcadores de conflito (`<<<<<<<`, `=======`, `>>>>>>>`)

**Passo 4:** Commit
```bash
git add docs/CONSCIENCIA/ARSENAL/scripts/arsenal-council.sh
git commit -m "fix(arsenal): resolver conflito de merge no council.sh"
```

**Verificação:** `grep '<<<<<<' docs/CONSCIENCIA/ARSENAL/scripts/arsenal-council.sh` → 0 resultados

---

## Riscos e tradeoffs

| Risco | Mitigação |
|-------|-----------|
| OAuth login abre navegador — pode travar se redirect_uri não registrado | Opção C (UI) é fallback |
| Remove MCP antes de re-add — janela sem conector | .bat faz backup, rollback manual existe |
| Conflito de merge no council.sh — pode ter lógica diferente nas duas versões | Ler ambas antes de escolher |
| receipt.json auto-declarado — pode virar falso verde | Task 4 (prova independente) é obrigatória |

## Open questions

- O `redirect_uri` do OAuth tá registrado no servidor MCP? (erro anterior: `redirect_uri não registrado pra esse client`)
- O .bat de reparo tá no disco local ou só na conversa do Claude?
- O `darkai` CLI existe na VPS pra rodar o council.sh?

---

**Feito:** plano de 5 tasks.
**Evidência:** medições de gateway, config, git status.
**Pendência:** executar Tasks 1-4 (MCP), Task 5 (conflito merge).
**Próximo passo:** Task 1 (READ_ONLY, medir MCP).
**BOOT:** #ACORDAR aplicado.
**Fio:** restaurar MCP CentralDark + limpar conflito arsenal.
