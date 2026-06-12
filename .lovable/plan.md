## O que descobri investigando os 3 endereços

### 1. Por que o card "MCP Status" tá vermelho (no print que você mandou)
Bati direto no `https://mcp.centralldark.com/status.json` — ele **responde rápido (200 OK, ~260ms)**, mas retorna no JSON:

```
"ok": false
```

E é só isso que o widget olha. Como o campo `ok` veio `false`, ele acende **vermelho** mesmo o serviço estando no ar. Os motivos do `ok:false` são *avisos* (não erros graves):

- `Supabase` → `warn: sem env Supabase (cofre opcional)`
- `VPS SSH (hint)` → `warn: sem VPS_SSH_KEY_LOVABLE/VPS_HOST_LOVABLE`
- Grupo `Outros (sem grupo)` → `warn` (Linear, Notion, Sentry sem categorização)
- `deploy.diff` → `warn: não consegui consultar o GitHub agora`
- Uma recomendação: `Rodar vps_git_pull pra alinhar a VPS com a main`

Ou seja: o MCP em si tá **online e saudável** (97 tools no catálogo, health verde, versão 0.4.0), mas o status.json marca `ok:false` porque tem *warnings*, não porque deu pau.

### 2. Sobre o "amarelo" no `https://status.centralldark.com/`
No site abri agora e o que tá amarelo (🟡) são os cards de **progresso de evolução do projeto**, não falha técnica:
- 🟡 Frontend bot/site — **75%** ("andando")
- 🟡 Testes e checker — **58%** ("parcial")
- 🟡 Instalador — **56%** ("meio caminho")

O MCP/conector lá tá **🟢 ativo (85%)**. Então o amarelo é status de roadmap, não bug.

### 3. Precisa página separada `https://mcp.centralldark.com/status`?
**Não.** Hoje o MCP só serve dois endpoints crus:
- `/health` → JSON enxuto (ok/versão/toolCount)
- `/status.json` → JSON detalhado completo

Não existe nem precisa existir uma página HTML `/status` no domínio do MCP — a visualização bonita já mora no Mega Painel (`status.centralldark.com`), que consome esses dois JSONs. Duplicar seria retrabalho.

---

## Importante: o que dá pra mexer aqui no Lovable

Esse projeto Lovable é o **TelePanel** (painel admin do bot Telegram). Os sites `status.centralldark.com` e `mcp.centralldark.com` **moram em outros repositórios na VPS** (CentralDark), não aqui. Então qualquer ajuste "real" nesses dois precisa ser feito via:

- Edge function `vps-exec` + GitHub Actions (jeito que a gente já usa)
- Ou direto na VPS via SSH

---

## O que eu proponho fazer

Te dou 3 opções, você escolhe:

**Opção A — Limpar o `ok:false` do MCP (recomendado)**
Fazer o `status.json` retornar `ok:true` quando só houver *warnings* (sem erros críticos). Hoje qualquer warn derruba o `ok` pra false e acende vermelho no widget. Mudaria o critério: `ok = false` só se houver `level: "error"` ou serviço fora do ar. Warnings ficam visíveis num campo separado (`warnings: [...]`).
→ Precisa editar no repo do MCP na VPS (não é aqui).

**Opção B — Mudar a regra no widget "Status ao vivo"**
Em vez de pintar vermelho quando `ok:false`, pintar **amarelo** quando `ok:false` mas o HTTP foi 200 (serviço respondeu). Vermelho só se HTTP falhar ou timeout. Mais honesto visualmente.
→ Precisa achar onde tá esse widget. Pelo print parece ser do `status.centralldark.com`, também repo externo.

**Opção C — Confirmar que página `/status` separada não é necessária**
Só documentar no README/memória: "MCP expõe `/health` e `/status.json`; visualização HTML fica no `status.centralldark.com`. Não criar página HTML no domínio do MCP."
→ Posso fazer agora, daqui.

---

## Detalhes técnicos
- `mcp.centralldark.com/health` → HTTP 200, `{"ok":true,"version":"0.4.0","toolCount":97}` (~205ms)
- `mcp.centralldark.com/status.json` → HTTP 200, `ok:false` por 4 warnings, 97 tools, uptime 30h
- `install.centralldark.com/status.json` → HTTP 200, verde
- `status.centralldark.com` → Mega Painel renderizado, sem erro técnico

---

**Me diz qual caminho seguir:** A (corrigir lógica do `ok` no MCP via VPS), B (ajustar regra do widget), C (só documentar), ou combinar (A+C é o mais limpo).