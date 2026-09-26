---
name: tauri-code-signing
description: Configure Tauri v2 Windows code signing with EV certificate.
---

# Tauri Code Signing — Windows

## Pré-requisitos

1. **Certificado Code Signing válido** (EV recomendado para SmartScreen imediato)
   - `.pfx` com private key
   - Senha do certificado
   - Thumbprint (SHA1) do certificado

2. **Ferramentas**
   - `signtool.exe` (Windows SDK)
   - Tauri CLI v2+ (`@tauri-apps/cli`)

3. **Ambiente**
   - Windows 10/11 com Windows SDK instalado
   - Variável de ambiente `PATH` incluindo `signtool.exe`

---

## Configuração tauri.conf.json (Windows)

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "windows": {
      "certificateThumbprint": "SEU_THUMBPRINT_AQUI",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.sectigo.com",
      "tsp": false,
      "signCommand": null
    }
  }
}
```

### Opções de `bundle.windows`

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `certificateThumbprint` | **SIM** | Thumbprint SHA1 do certificado no Windows Certificate Store |
| `digestAlgorithm` | Não | `sha256` (padrão) ou `sha384`/`sha512` |
| `timestampUrl` | Não | URL do timestamp server (ex: `http://timestamp.sectigo.com`, `http://timestamp.digicert.com`) |
| `tsp` | Não | `true` para RFC 3161 TSP, `false` para Authenticode legado |
| `signCommand` | Não | Comando customizado se não usar certificado do store |

---

## Como obter Thumbprint

```powershell
# Listar certificados no store "My" (Personal)
Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert

# Ou no LocalMachine (precisa admin)
Get-ChildItem Cert:\LocalMachine\My -CodeSigningCert

# Saída exemplo:
# Thumbprint                                Subject
# ----------                                -------
# A1B2C3D4E5F6...  CN=CentralDark, O=CentralDark, C=BR
```

Use o **Thumbprint** (sem espaços) no `tauri.conf.json`.

---

## Instalar Certificado no Store

```powershell
# Importar .pfx para CurrentUser\My
$pfxPath = "C:\caminho\centraldark.pfx"
$senha = "SUA_SENHA_AQUI"
Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation Cert:\CurrentUser\My -Password (ConvertTo-SecureString $senha -AsPlainText -Force)

# Ou para LocalMachine (requer admin + máquina confiável)
Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString $senha -AsPlainText -Force)
```

---

## Build Assinado Local

```bash
# 1. Build frontend
npm run build

# 2. Build Tauri assinado (usa certificado do store)
npm run tauri build

# Ou direto cargo (mais controle)
cd src-tauri
cargo build --release
# Tauri CLI invoca signtool automaticamente se certificateThumbprint configurado
```

---

## CI/CD (GitHub Actions) — Code Signing

### Secrets necessários
| Secret | Descrição |
|--------|-----------|
| `WINDOWS_CERT_PFX_BASE64` | Certificado `.pfx` codificado em base64 |
| `WINDOWS_CERT_PASSWORD` | Senha do certificado |
| `WINDOWS_CERT_THUMBPRINT` | Thumbprint SHA1 (sem espaços) |

### Workflow exemplo

```yaml
# .github/workflows/tauri-sign.yml
name: Tauri Windows Sign

on:
  push:
    tags: ["v*"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write  # para OIDC se usar

jobs:
  sign-windows:
    runs-on: windows-latest
    timeout-minutes: 60
    env:
      TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}  # se usar chave Tauri
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-pc-windows-msvc

      - name: Import Code Signing Certificate
        uses: actions/import-code-signing-cert@v3
        with:
          certificate: ${{ secrets.WINDOWS_CERT_PFX_BASE64 }}
          password: ${{ secrets.WINDOWS_CERT_PASSWORD }}

      - name: Verify Certificate Imported
        run: |
          Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object {$_.Thumbprint -eq "${{ secrets.WINDOWS_CERT_THUMBPRINT }}".Replace(" ", "")}

      - name: Install Dependencies
        run: npm ci
        working-directory: ./apps/sol-desktop

      - name: Build Frontend
        run: npm run build
        working-directory: ./apps/sol-desktop

      - name: Build Tauri (Signed)
        uses: tauri-apps/tauri-action@v0
        env:
          TAURI_SIGNING_WINDOWS_CERT_THUMBPRINT: ${{ secrets.WINDOWS_CERT_THUMBPRINT }}
          TAURI_SIGNING_WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "SOL CentralDark ${{ github.ref_name }}"
          releaseBody: "Build assinado com certificado EV"
          args: --target x86_64-pc-windows-msvc

      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: sol-desktop-signed
          path: apps/sol-desktop/src-tauri/target/release/bundle/msi/*.msi
```

---

## Variáveis de Ambiente Tauri para Signing (v2)

| Variável | Descrição |
|----------|-----------|
| `TAURI_SIGNING_WINDOWS_CERT_THUMBPRINT` | Thumbprint do certificado |
| `TAURI_SIGNING_WINDOWS_CERT_PASSWORD` | Senha do .pfx (se usar arquivo) |
| `TAURI_SIGNING_WINDOWS_TIMESTAMP_URL` | URL timestamp server |
| `TAURI_SIGNING_WINDOWS_DIGEST_ALGORITHM` | `sha256` |
| `TAURI_PRIVATE_KEY` | Chave privada Tauri (para updater) |

---

## Verificação Pós-Build

```powershell
# Verificar assinatura do .exe
signtool verify /pa /v "src-tauri\target\release\bundle\msi\SOL_CentralDark_0.1.0_x64_en-US.msi"

# Verificar assinatura do binário
signtool verify /pa /v "src-tauri\target\release\sol-desktop.exe"

# Ver detalhes da assinatura
signtool verify /pa /v /ph "src-tauri\target\release\sol-desktop.exe"
```

Saída esperada:
```
Successfully verified: sol-desktop.exe
```

---

## SmartScreen / Reputação

| Tipo Certificado | SmartScreen | Tempo Reputação |
|------------------|-------------|-----------------|
| **EV (Extended Validation)** | ✅ Imediato | 0 dias |
| Standard (OV) | ⚠️ Aviso inicial | Dias/semanas |
| Self-signed | ❌ Bloqueado | Nunca |

**Recomendação:** Certificado EV (DigiCert, Sectigo, GlobalSign) — custa mais, mas elimina aviso SmartScreen no primeiro download.

---

## Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `SignTool Error: No certificates found` | Thumbprint errado ou cert não no store | Verificar `Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert` |
| `SignTool Error: Access denied` | Sem permissão no store | Rodar como admin ou usar CurrentUser |
| `Timestamp server error` | URL errada ou offline | Usar `http://timestamp.sectigo.com` ou `http://timestamp.digicert.com` |
| `AppLocker/WDAC blocked` | Política bloqueia binário não assinado | Assinar **antes** de executar; build assinado passa |
| `THUMBPRINT_NOT_FOUND` | Certificado não no store do usuário do CI | Importar no step `actions/import-code-signing-cert@v3` |

---

## Checklist Pré-Release

- [ ] Certificado EV válido (não expirado)
- [ ] Thumbprint correto no `tauri.conf.json`
- [ ] Certificado instalado no store do usuário de build
- [ ] `signtool verify /pa` passa no binário e .msi
- [ ] SmartScreen não avisa em máquina limpa (testar em VM)
- [ ] Updater Tauri configurado (`TAURI_PRIVATE_KEY`)
- [ ] Artefatos .msi/.exe publicados no GitHub Releases

---

## Referências

- Tauri v2 Code Signing: https://v2.tauri.app/distribute/sign/
- GitHub Actions import-code-signing-cert: https://github.com/actions/import-code-signing-cert
- signtool.exe docs: https://learn.microsoft.com/windows/win32/seccrypto/signtool
- SmartScreen EV: https://learn.microsoft.com/windows/win32/seccrypto/extended-validation-certificates