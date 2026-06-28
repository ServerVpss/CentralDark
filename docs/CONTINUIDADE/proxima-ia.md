# 🔄 PRÓXIMA IA — Handoff de Continuidade CentralDark

> Lar canônico do handoff (regra do `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md`).
> Toda IA lê ISTO + `kit_boas_vindas` + `ler_consciencia` + `ler_pendencias` + `APRENDIZADOS.md` antes de agir.
> Substitui o "bloco de continuidade colado". A partir daqui, o fluxo vive aqui.
> Última atualização: **2026-06-28** (sessão Claude).

---

## ✅ MENSAGEM VALIDADA PARA A PRÓXIMA IA (estado real, com prova)

**Feito nesta sessão (2026-06-28):**
- 🔴→🟢 **GitHub OAuth do MCP estava 401** (token `gho_` morto). Resolvido **reconectando o conector CentralDark no app Claude** (a reconexão refaz o OAuth do GitHub — não é edição de `.env`). Prova: `github_viewer` = `segredounlock`.
- ✅ **Padrão de Apresentação registrado:** `docs/CONSCIENCIA/21-PADRAO-APRESENTACAO.md` (commit `88cf2b6`) + aprendizado **#260** (commit `26a750c`).
- ⚠️ **OVERLAP detectado:** já existia `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` cobrindo o MESMO tema. **Consolidar (merge ou cross-ref). Não criar um terceiro.**

**NÃO tocado:** WhatsApp / `whatsapp-server` (stopped de propósito) / `MultiZap-Gateway` / CRM / Caddy / Docker / banco / secrets. Nenhum merge na main por IA.

**Infra (validado HOJE):**
- 🟢 Conector MCP (cliente) funcionando.
- 🟢 GitHub auth OK (reconectado).
- 🔴 `MCP_ALLOW_VPS_COMMANDS=false` → `execute_command` (shell VPS) **BLOQUEADO**. Ligar no servidor pra ter shell.
- 🟡 Reads podem cair em "FALLBACK LOCAL" se o token OAuth do GitHub expirar de novo.

---

## ⚠️ CORREÇÃO DO BLOCO ANTERIOR (premissas que estavam FALSAS)

- "MCP_ALLOW_VPS_COMMANDS=true destravado" → **FALSO** (está `false`).
- "token GitHub renovou" → estava **MORTO (401)**; só voltou após reconexão nesta sessão.
- Pendências **"#7/#8/#9" do bloco NÃO batem** com `docs/PENDENCIAS.md` atual. Tratar como **tópicos**, não números.

---

## 📋 PENDÊNCIAS REAIS (fonte viva: `docs/PENDENCIAS.md`)

1. 🟡 Domínios `centralldark.com` + telepainel (código pronto, falta DNS + VPS).
2. ✅ Reestruturação repo padrão VPS (2026-06-20).
3. 🟡 `bot-whatsapp`/`crm`/`financeiro` só landing (falta produto).
4. 🟢 Arquitetura CentralDark 2026 consolidada (adiado, complexo).
5. 🟡 Revisão migração `docs/` do legado `CentralDark1VPS` (5.1→5.21).
- Tail: MCP local STDIO (🔴), MCP-CentralDark `.env` real (🟡), reativar stack WhatsApp (🟡), `index.html` do painel some (🟡).

**Tópicos do bloco anterior a renumerar/reconciliar dentro do `PENDENCIAS.md`:**
- Secrets → Supabase Vault (relaciona com `secret-vault-future.md`, item 5.18).
- Revisar `vps_write_file_safe` público sem auth.
- Refatorar `CONSCIENCIA.md` + `00-PORTA-DE-ENTRADA-IA.md`: universalizar agentes, remover legado Multizap/clone-deck, corrigir nomes PM2, regra "ferramenta-ausente" (o "fluxo Obsidian, seção por seção").

**Tarefas mecânicas pendentes:**
- Resolver conflito de merge em `painel-data.json`.
- Sincronizar git da VPS (atrás do remoto) — **PRECISA `MCP_ALLOW_VPS_COMMANDS=true`**.

---

## 🧭 PROMPT PRONTO PARA A PRÓXIMA IA (copiar)

```txt
RELOAD CENTRALDARK.
Sou o dono (Pivete). Você está via conector MCP autorizado.

PRIMEIRO: kit_boas_vindas + ler_consciencia + ler_pendencias + ler docs/CONSCIENCIA/APRENDIZADOS.md (#255+).
DEPOIS: ler docs/CONTINUIDADE/proxima-ia.md (este handoff) pra pegar o estado real.

ESTADO (2026-06-28): GitHub OK (reconectado). VPS shell OFF (MCP_ALLOW_VPS_COMMANDS=false).
Padrao de Apresentacao registrado (#21 + aprendizado #260) — CONSOLIDAR com 2026-06-20-padrao-resposta-pivete.md.

NAO mexer: WhatsApp/whatsapp-server/MultiZap-Gateway/CRM/Caddy/Docker/banco/secrets sem "PERMITO PIVETE".
Ciclo: Ler -> Perguntar -> Agir -> Registrar. Nao inventar sucesso, validar com prova.
Se faltar tool, avise ("nao tenho a tool X"). Nao finja nem contorne.
Ao fim de cada resposta, sugira o modelo/esforco mais economico que resolve 100%.
```
