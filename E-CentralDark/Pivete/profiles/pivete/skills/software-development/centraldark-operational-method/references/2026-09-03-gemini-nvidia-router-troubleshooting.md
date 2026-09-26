# Gemini + NVIDIA NIM + Router 8099 — Troubleshooting Patterns (2026-09-03)

## Resumo da Sessão
Diagnóstico de falhas em múltiplos providers (Gemini, NVIDIA NIM) + validação do router local 8099 com modelos Nous gratuitos.

---

## 1. GEMINI API KEY — Localização e Extração no Windows

### Onde está guardada
**Windows Credential Manager** → `LegacyGeneric:target=gemini-cli-api-key/default-api-key`

### Como extrair (PowerShell via P/Invoke CredRead)
```powershell
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredManager {
    [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
    public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
    [DllImport("advapi32.dll", SetLastError=true)]
    public static extern bool CredFree(IntPtr credential);
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public IntPtr TargetName;
        public IntPtr Comment;
        public long LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public IntPtr TargetAlias;
        public IntPtr UserName;
    }
    public static string GetPasswordBase64(string target) {
        IntPtr ptr = IntPtr.Zero;
        bool ok = CredRead(target, 1, 0, out ptr);
        if (ok && ptr != IntPtr.Zero) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(ptr, typeof(CREDENTIAL));
            byte[] bytes = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
            CredFree(ptr);
            return Convert.ToBase64String(bytes);
        }
        return "NOT_FOUND";
    }
}
'@
$b64 = [CredManager]::GetPasswordBase64('LegacyGeneric:target=gemini-cli-api-key/default-api-key')
$b64 | Out-File -FilePath 'C:\Users\danda\gemini_key_b64.txt' -Encoding ASCII
```

### Formato do blob (base64 → JSON)
```json
{
  "serverName": "default-api-key",
  "token": {
    "accessToken": "AIzaSy...",      // <-- A KEY REAL
    "tokenType": "ApiKey"
  },
  "updatedAt": 1788398180579
}
```

### Validação rápida
```bash
# List models (confirma key válida - quota menor)
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"

# Generate content (testa quota - mais restritivo)
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}],"generationConfig":{"maxOutputTokens":20}}'
```

### Resultado desta sessão
- ✅ `list models` → **200 OK** (50 modelos)
- ⚠️ `generateContent` → **429 Quota Exceeded** (rate limit por minuto)
- Key salva em `C:/Users/danda/.centraldark_ai_env` para `darkai`

---

## 2. NVIDIA NIM — Erro 404 "Function not found for account"

### Sintoma
```
HTTP 404: {"detail":"Function '767b5b9a-3f9d-4c1d-86e8-fa861988cee7': Not found for account 'uPrWOJanfu9tBQ9HMhO9Jn0iII0pdXlKxGut5UY-J0A'"}
```

### Causa Raiz
**`NVIDIA_API_KEY` VAZIA no ambiente** → Header `Authorization: Bearer ` (vazio)

### Prova
```bash
curl -v -X POST "https://integrate.api.nvidia.com/v1/chat/completions" \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mistralai/mistral-large","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
```

Output mostra: `> Authorization: Bearer ` (sem token após "Bearer ")

### Diagnóstico Rápido
```bash
echo "NVIDIA_API_KEY set: ${NVIDIA_API_KEY:+YES}"
# Se vazio → é a causa
```

### Modelos NVIDIA disponíveis (catálogo)
```bash
curl -s "https://integrate.api.nvidia.com/v1/models" | grep -o '"id":"[^"]*"' | head -20
# Inclui: mistralai/mistral-large, nvidia/nemotron-3-ultra-550b-a55b, etc.
```

### Solução
1. Configurar `NVIDIA_API_KEY` válida no ambiente/hermes secrets
2. **OU** usar router 8099 (já funcionando com Nous free)

---

## 3. CENTRALDARK OMNI ROUTER (PORTA 8099) — VALIDADO

### Health Check
```bash
curl -s http://127.0.0.1:8099/health
# Retorna: engines.nous.configured=true, transport=nous_inference_api
# ⚠️ BUG CONHECIDO: /health retorna 500 Internal Server Error (shutil.which(CLAUDE_BIN) falha)
# Mas chat completions FUNCIONA
```

### Modelos Nous GRATUITOS Testados e Funcionando
| Modelo | Status | Latência |
|--------|--------|----------|
| `nous/meituan/longcat-2.0:free` | ✅ OK | ~34ms (mais rápido) |
| `nous/upstage/solar-pro4:free` | ✅ OK | ~3.2s |
| `nous/poolside/laguna-s-2.1:free` | ✅ OK | — |
| `nous/poolside/laguna-xs-2.1:free` | ✅ OK | — |
| `nous/stepfun/step-3.7-flash:free` | ✅ OK | — |
| `nous/inclusionai/ling-3.0-flash-fin:free` | ✅ OK | — |

### Modelo Default EXPIRADO
| Modelo | Erro |
|--------|------|
| `nous/tencent/hy3:free` | **404** "This model's free period has ended" |

### Teste Rápido de Qualquer Modelo
```bash
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nous/meituan/longcat-2.0:free","messages":[{"role":"user","content":"OK"}],"max_tokens":10}'
```

---

## 4. INSTABILIDADE DO ROUTER (OBSERVADO 2026-09-05)

### Sintoma
- Processo Python morre com exit code 1 repetidamente
- Watchdog reinicia automaticamente (contagem: 36 reinícios no log)
- PID muda frequentemente (ex: 17736 → 29272)

### Log de reinícios (`omni_router.log`)
```
WARNING | Router process died (exit code: 1), restarting... (count: 36)
```

### Estado atual (verificado via `omni_router_state.json`)
```json
{
  "started_at": "2026-08-26T02:39:16.445634Z",
  "pid": 29272,
  "restart_count": 36,
  "last_health": "2026-08-27T11:30:15.382611Z",
  "errors": 36,
  "sha256": "e6f1d409b226877a9791c0e5fd3e2843c1d63a61f8ede200b8e6253db7743d2b",
  "proved": true
}
```

### Causa provável do crash
Endpoint `/health` tenta `shutil.which(CLAUDE_BIN)` onde `CLAUDE_BIN` não está no PATH do processo Python → exceção não tratada → crash do worker uvicorn → watchdog reinicia.

### Workaround operacional
- **NÃO usar `/health`** como health check confiável
- Usar `GET /v1/models` ou `POST /v1/chat/completions` para verificar se router está vivo
- Chat completions com engine `nous` **FUNCIONA** mesmo com `/health` quebrado

---

## 5. CADEIA DE FALLBACK RECOMENDADA (Casa)

```text
PRIMÁRIO: nvidia/nemotron-3-ultra-550b-a55b (NVIDIA NIM - sessão atual)
FALLBACK 1: nous/meituan/longcat-2.0:free (router 8099 - 34ms, grátis)
FALLBACK 2: nous/upstage/solar-pro4:free (router 8099 - ~3s, grátis)
FALLBACK 3: nous/poolside/laguna-xs-2.1:free (router 8099 - grátis)
FALLBACK 4: nous/stepfun/step-3.7-flash:free (router 8099 - grátis)
```

### Para ativar no Hermes CLI
```bash
# Adicionar fallback apontando pro router local
hermes fallback add
# Escolher provider "custom" / endpoint http://127.0.0.1:8099/v1
# Model: nous/meituan/longcat-2.0:free
```

---

## 6. Padrões de Diagnóstico Rápido (Checklist)

| Sintoma | Verificação Imediata | Causa Provável |
|---------|---------------------|----------------|
| HTTP 400 "API key not valid" | `echo $GEMINI_API_KEY` | Key inválida/ausente |
| HTTP 404 "Function not found for account" | `echo $NVIDIA_API_KEY` | **Key vazia** (header Bearer vazio) |
| HTTP 429 "Quota exceeded" | Tentar modelo diferente / esperar | Rate limit real |
| HTTP 404 "Model not found" | `curl /v1/models` no endpoint | Modelo expirado/removido |
| "Method Not Allowed" no router | Verificar se POST em `/v1/chat/completions` | Engine não configurada |
| Router `/health` = 500 | Verificar `shutil.which(CLAUDE_BIN)` no PATH | CLAUDE_BIN não encontrado |

---

## 7. Regra de Ouro — NUNCA COLAR KEY NO CHAT

- Extrair via Credential Manager → base64 → file → decode local
- Salvar em `.centraldark_ai_env` ou `hermes secrets`
- **NUNCA** exibir, logar, commitar, colar no chat
- Tratamento padrão: `PRESENCA=SIM|NAO, PERMISSAO=SUFICIENTE|INSUFICIENTE|UNKNOWN, VALOR=<NAO_LER>`

---

## 8. Comandos Úteis para Próximas Sessões

```bash
# Verificar router 8099 (chat completions, não /health)
curl -s http://127.0.0.1:8099/v1/models
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nous/meituan/longcat-2.0:free","messages":[{"role":"user","content":"OK"}],"max_tokens":10}'

# Extrair Gemini key do Windows Credential Manager (PowerShell)
# Usar script P/Invoke acima

# Verificar NVIDIA key
echo "NVIDIA_API_KEY: ${NVIDIA_API_KEY:+SET} (len=${#NVIDIA_API_KEY})"

# Verificar se router process está vivo
netstat -ano | findstr 8099
# Ver PID e confirmar se é python.exe
```