# CentralDark Rules Validator

VS Code extension para syntax highlight, linter e validator das regras invioláveis do CentralDark.

## 🚀 Funcionalidades

### 1. Syntax Highlight para Rules
- Destaca regras críticas (🛑), avisos (🟡) e info (🟢)
- Cores diferentes para cada nível de severidade
- Suporta comentários e blocos de código

### 2. Linter Inteligente
- Detecta violações de regras invioláveis em tempo real
- Valida automático ao salvar arquivo
- Bloqueia patterns perigosos:
  - Exposição de `service_role_key`, tokens JWT, API tokens
  - Comando `pm2 restart all`
  - Caminho `/root/whatsapp-server`
  - Edição direta na VPS
  - Mistura de bots Telegram

### 3. Command Palette: `CentralDark: Load Rules`
- Carrega e valida as regras invioláveis
- Mostra status de carregamento
- Valida todos os arquivos abertos

### 4. Status Bar Indicator
- **🟢 rules loaded** — Sistema validando, sem violações
- **🟡 warnings** — Avisos detectados
- **🔴 violations found** — Erros críticos bloqueados

## ⌨️ Keyboard Shortcuts

- **Ctrl+Shift+R** (Windows/Linux) / **Cmd+Shift+R** (Mac) — Load Rules
- **Clique no status bar** — Abre painel de regras

## ⚙️ Configuração

### Settings (`.vscode/settings.json`)

```json
{
  "centraldark.rules.enabled": true,
  "centraldark.rules.strictMode": true,
  "centraldark.rules.autoValidate": true,
  "centraldark.rules.rulesPath": "./centraldark-rules.md"
}
```

### Variáveis de Configuração

| Configuração | Tipo | Padrão | Descrição |
|---|---|---|---|
| `centraldark.rules.enabled` | boolean | `true` | Habilita validação |
| `centraldark.rules.strictMode` | boolean | `true` | Modo estrito (bloqueia violações) |
| `centraldark.rules.autoValidate` | boolean | `true` | Valida ao salvar |
| `centraldark.rules.rulesPath` | string | `./centraldark-rules.md` | Caminho das regras |

## 📋 Regras Suportadas

### 🛑 Críticas (Bloqueia)
1. **Nunca Expor Secrets** — service_role_key, JWT, API tokens
2. **Nunca `pm2 restart all`** — Causa downtime total
3. **Nunca Alterar `/root/whatsapp-server`** — Quebra WhatsApp
4. **Nunca Ignorar Sincronia 4-Point** — Fluxo: Lovable → GitHub → VPS
5. **Nunca Misturar Bots Telegram** — @srver1bot vs @SEGREDOPUXADASBOT

### 🟡 Avisos
6. Preferir Create Sobre Update (tasks >24h)
7. Documentar Decisões de Arquitetura

### 🟢 Melhor Prática
8. Nomenclatura Consistente (`centraldark.*`, `CENTRALDARK_*`)
9. Logar Decisões Importantes

## 🔍 Exemplos de Detecção

### ❌ Violação Detectada
```javascript
// Expõe service_role_key — ERRO
const KEY = 'eyJhbGc...'; 

// pm2 restart all — ERRO
pm2 restart all

// Editar /root/whatsapp-server — ERRO
fs.writeFileSync('/root/whatsapp-server/config.js', data);
```

### ✅ Padrão Correto
```javascript
// Usa variável de ambiente
const KEY = process.env.SERVICE_ROLE_KEY;

// Reinicia serviço específico
pm2 restart 27

// Fluxo correto: Lovable → GitHub → VPS
// Nunca editar direto na VPS
```

## 📦 Instalação

1. Clone a extensão em `K:\apps\centraldark-vscode-rules\`
2. Abra VS Code e carregue em modo desenvolvimento
3. Ou instale via command palette: `CentralDark: Load Rules`

## 🧪 Testes

```bash
node self-test.mjs
```

Valida:
- Carregamento de regras
- Detecção de padrões críticos
- Status bar indicator
- Funcionalidade de commands

## 🔄 Sincronização 4-Point

Este extension valida a seguinte arquitetura:

```
Lovable (editor/preview)
    ↓
GitHub (source of truth)
    ↓
VPS (/root/CentralDark/)
    ↓
Cérebro Vivo (docs/CONSCIENCIA/)
```

**Nunca editar código direto na VPS.** Sempre: **Lovable → GitHub → VPS**

## 📝 Changelog

### v1.0.0 (2026-10-15)
- Initial release
- Syntax highlight para rules
- Linter com 5+ padrões críticos
- Command palette binding
- Status bar indicator
- Rules documentation panel

## 🛡️ Segurança

Este extension protege as 8 regras críticas do CentralDark:
- Nunca expor secrets
- Nunca quebrar sincronia
- Nunca misturar componentes
- Nunca editar direto na VPS

## 📞 Suporte

Para reportar violações ou sugerir melhorias, abra issue no repositório GitHub.

---

**Desenvolvido para CentralDark** | PT-BR only | Versão 1.0
