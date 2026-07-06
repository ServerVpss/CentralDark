## Objetivo
Tirar a rota separada `/admin/modo-livre` e colocar os botões **LIGAR / DESLIGAR** direto no painel principal `/admin`, naquele card vazio que tá do lado do "Info do Processo" (o quadrado com borda vermelha na imagem).

## O que muda na VPS (`CentralDark-MCP`)

**1. Painel principal `/admin` — adicionar card "Modo Livre"**
No lugar do card vazio, injetar um bloco assim:

```text
┌─ MODO LIVRE ──────────────────────┐
│  Status: 🔴 DESLIGADO             │
│  [ 🔓 LIGAR ]   [ 🔒 DESLIGAR ]   │
│  Última mudança: 06/07 03:01      │
└───────────────────────────────────┘
```

- Quando ligado: fundo fica amarelo/alerta, status vira `🟢 LIGADO`
- Botões chamam `fetch('/admin/api/modo-livre', {method:'POST', body:{acao:'ligar'|'desligar'}})` — sem recarregar página, sem redirect, sem pedir confirmação
- Auto-refresh do status a cada 5s (já tem polling no painel)

**2. Remover a rota `/admin/modo-livre`**
- Deleta `GET /admin/modo-livre` (a página HTML separada)
- Deleta `POST /admin/modo-livre` (o form submit)
- **Mantém** `GET /admin/api/modo-livre` e `POST /admin/api/modo-livre` (os endpoints JSON que os botões usam)

**3. Passar direto sem pedir permissão**
O `modo-livre.js` já faz bypass dos validadores quando ligado. O que falta é: quando ligado, **não logar warning nem pedir confirmação** em nenhum lugar. Vou varrer `vps-files.js`, `vps-lazy.js`, `admin-files.js` e garantir que o `if (isModoLivre()) return { ok:true }` seja a PRIMEIRA linha, antes de qualquer `console.warn` ou prompt.

## Arquivos tocados na VPS

| Arquivo | Ação |
|---|---|
| `src/dist/index.js` | Remover 2 rotas HTML, manter as 2 API |
| `src/dist/admin-panel.html` (ou template inline) | Injetar card Modo Livre no slot vazio |
| `src/dist/modo-livre.js` | Sem mudança (já funciona) |
| `src/dist/vps-files.js` · `vps-lazy.js` · `admin-files.js` | Garantir bypass silencioso (sem warn) |

## Deploy
`pm2 restart CentralDark-MCP` e valida abrindo `https://mcp.centralldark.com/admin` — o card aparece no lugar do quadrado vazio, botões funcionam sem sair da página.

## Fora de escopo
- Não mexer em nada do Lovable (esse projeto aqui é só frontend do painel de status, o admin do MCP mora na VPS).
- Não criar novas travas de tempo (segue "só desliga manual" como já combinado).
