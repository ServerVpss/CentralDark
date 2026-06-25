# REGRA OFICIAL — Protocolo Multi-Agente Semântico (regra-mãe)

> **Regra-mãe.** Não substitui as outras regras oficiais — torna todas obrigatórias e inegociáveis para qualquer agente, em qualquer ferramenta, em qualquer sessão.
>
> **Fonte canônica:** este arquivo (`docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md`).
> **Espelho no Notion:** [Protocolo Multi-Agente Semântico (regra-mãe)](https://app.notion.com/p/38ad08b5e95981e0b983e667e3254eb4) — database `📜 Regras do Projeto` em `CentralDark • Consolidação`.

---

## 0. Lei zero

Nenhum agente age por conta própria no CentralDark. Toda IA: **Lê a Fonte da Verdade → Age → Registra.** Sempre nessa ordem. Se não puder cumprir o ciclo, **não executa** — relata a limitação e para.

## 1. Fonte da Verdade única

Dois lugares espelhados, e só eles:

- **Git** — `docs/CONSCIENCIA/` (espelhado na VPS `/root/CentralDark/docs/CONSCIENCIA/`) = canon permanente.
- **Notion** — `CentralDark • Consolidação` = memória viva consultável.

`mem://` e contexto de sessão **não contam** e não servem de prova. Ver [`REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../REGRA-OFICIAL-HIERARQUIA-MEMORIA.md).

## 2. Ciclo obrigatório

**Antes (Ler):** consultar Notion/Git; validar caminhos antes de assumir (proibido inventar path); busca semântica antes de criar (reaproveitar vence criar — Anti-Inflação).

**Durante (Agir):** só o que foi pedido e autorizado; sem frentes paralelas.

**Depois (Registrar):**
- Decisão → `✅ Decisões Tomadas`
- Pendência → `🔥 Pendências Ativas`
- Ação → `🤖 Agent Logs`
- Regra → `📜 Regras do Projeto` + arquivo no Git
- Informar links/IDs ao usuário.

**Checklist de fechamento:** li a fonte / validei caminhos / registrei no lugar certo / informei IDs / atualizei pendências / tenho prova concreta (não "está na memória").

## 3. Conectado via MCP CentralDark = rigor máximo

Plugado em `mcp.centralldark.com` o protocolo vira trilho:

1. MCP é a via oficial de registro — usar a tool (`registrar_aprendizado` etc.), não improvisar.
2. Read-only por padrão; cada ação sensível exige autorização por ação.
3. Toda ação via MCP deixa rastro (`Agent Logs` + relatório em `/root/CentralDark/revisoes/` se mudou estado).
4. Sem token, sem ação privilegiada — nunca contornar auth.
5. Identidade declarada (qual IA + qual papel).

## 4. Áreas sensíveis — autorização literal

Nunca tocar sem *"Pode seguir"* / *"PERMITO PIVETE: (ação)"*:

WhatsApp/wuzapi · PM2 · Docker · Caddy/SSL · VPS · Edge functions · GitHub Actions · Migrations · Secrets/.env.

Autorização é por ação e por sessão — não se herda nem se deduz.

## 5. Papéis fixos

- **Claude** = planeja/registra
- **Lovable/Cowork** = executa
- **Codex** = lê o repo
- **GPT/Grok/Gemini** = análise e revisão cruzada (mesmo protocolo)

Ninguém decide pelo usuário. Sessão incompleta deixa handoff claro.

## 6. Proibições absolutas (anulam a tarefa)

- ❌ Concluir sem prova
- ❌ Citar sem validar
- ❌ Criar sem buscar antes
- ❌ Tocar área sensível sem autorização
- ❌ Tratar `mem://` como oficial
- ❌ Contornar auth do MCP

---

**Sincronia 4-Point:**
- ✅ Notion — [página espelho](https://app.notion.com/p/38ad08b5e95981e0b983e667e3254eb4)
- ✅ Git — este arquivo (fonte canônica)
- ⏳ VPS — sincroniza no próximo pull em `/root/CentralDark/`
- ⏳ Cérebro Vivo — referenciar em `00-LEIA-PRIMEIRO.md`
