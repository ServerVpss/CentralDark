# 🖥️ Tutorial — Ligar Claude Desktop (Windows) ao Gateway CentralDark

> Registrado em 09/07/2026 — validado pelo Pivete.
> Gateway oficial: `https://api.centralldark.com`

---

## 🎯 Objetivo

Configurar Claude Desktop (Cursor, VSCode, qualquer cliente OpenAI-compat) no Windows pra usar o **gateway pessoal do Pivete** em vez de pagar API direto.

---

## ✅ Método rápido (funcionou 100%)

Abre o **PowerShell como administrador** e cola isso:

```powershell
[Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_URL","https://api.centralldark.com","User")
[Environment]::SetEnvironmentVariable("CENTRALDARK_GATEWAY_KEY","cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE","User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL","https://api.centralldark.com","User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY","cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE","User")
Write-Host "OK - reabra Claude Desktop" -ForegroundColor Green
```

Depois **fecha e abre o Claude Desktop** pra ele pegar as vars novas.

---

## 🧾 Método via script

Se baixar o script `scripts/set-centraldark-gateway.ps1` do repo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\set-centraldark-gateway.ps1"
```

⚠️ **NÃO clica duas vezes no `.ps1`** — o Windows fecha calado por causa da Execution Policy. Sempre roda com o comando acima.

---

## 🔧 Configuração no Claude Desktop

Na tela **"Configure third-party inference"**:

| Campo | Valor |
|---|---|
| **Base URL** | `https://api.centralldark.com` ⚠️ **SEM `/v1` no final** |
| **API Key** | `cdk_live_UW_-Ad10vjqkFOcVYtUry2nrwhKAdE9L7lMUEesDktE` |
| **Models (fallback)** | `arsenal-router`, `arsenal-parallel`, `arsenal-debate` |

### ❌ Erro comum: `/v1/models` 404

**Causa:** você colocou Base URL com `/v1` no final. O Claude Desktop já anexa `/v1/models` sozinho, então vira `/v1/v1/models` → 404.

**Fix:** Base URL é só `https://api.centralldark.com`.

---

## 🧪 Teste manual

```powershell
curl -H "Authorization: Bearer $env:CENTRALDARK_GATEWAY_KEY" "$env:CENTRALDARK_GATEWAY_URL/v1/models"
```

Deve retornar HTTP 200 com a lista de modelos.

---

## 🚨 Troubleshooting

| Sintoma | Causa | Fix |
|---|---|---|
| PowerShell abre e fecha | Execution Policy bloqueou | Usar `-ExecutionPolicy Bypass` |
| `/v1/models` 404 | Base URL tem `/v1` no fim | Tirar o `/v1` |
| "Discovery de modelos falhou" | Idem acima | Idem acima |
| Claude Desktop não pega a chave | Não reabriu depois de setar | Fechar 100% (bandeja também) e reabrir |
| `Unblock-File` reclama | Windows marcou como origem externa | `Unblock-File "$env:USERPROFILE\Downloads\set-centraldark-gateway.ps1"` |

---

## 🔗 Referências

- Script: [`scripts/set-centraldark-gateway.ps1`](../../scripts/set-centraldark-gateway.ps1)
- Aprendizado: [`docs/CONSCIENCIA/APRENDIZADOS/2026-07-09-gateway-centraldark-chave-propria.md`](../CONSCIENCIA/APRENDIZADOS/2026-07-09-gateway-centraldark-chave-propria.md)
- Doutrina: [`docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md`](../GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md)
