---
title: "REGRA OFICIAL MULTI AGENTE SEMANTICO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-07-16
---

# REGRA OFICIAL — Protocolo Multi-Agente Semântico

> **Status:** Obrigação · **Escopo:** Todos os agentes — IAs externas (Claude, GPT/ChatGPT, Grok, Gemini, Codex, Cursor, Copilot, Windsurf, Lovable e qualquer IA futura) **e** agentes autônomos internos (Hermes e sub-agentes, Guardião, Arsenal Council) · **Ativa:** Sim
>
> Esta é uma **regra-mãe**. Ela não substitui as outras regras oficiais — ela as torna **obrigatórias e inegociáveis** para qualquer agente, em qualquer ferramenta, em qualquer sessão. Ela obedece e amplifica o canon de governança: [`CLAUDE.md`](../../../CLAUDE.md), [Doutrina de Proteção Estratégica](../../GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md) e [Fluxo de Ouro](../../GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md).

---

## 0. Lei Zero (a regra acima das regras)

**Nenhum agente age por conta própria no CentralDark. O Pivete comanda; autorização não se presume.**

Toda IA, em toda tarefa relevante, cumpre o **ciclo oficial de 5 passos** — o mesmo do [`PROTOCOLO-ORQUESTRACAO-PIVETE.md`](../PROTOCOLO-ORQUESTRACAO-PIVETE.md), um ciclo só para o ecossistema inteiro:

```txt
LER → PERGUNTAR → AGIR → PROVAR → REGISTRAR
```

Se um agente não puder cumprir esse ciclo, ele **não executa** a tarefa — relata a limitação ao Pivete e para.

- **Tarefa relevante** = qualquer ação que muda arquivo, estado, configuração ou produção. Leitura, busca e diagnóstico read-only estão liberados sem o ciclo completo — mas nunca dispensam a verdade: só citar o que foi validado. **Na dúvida, é relevante.**
- **Kill-switch:** `TRAVA`, `PARA` ou `!CALIBRA` do Pivete interrompe tudo imediatamente, em qualquer ponto do ciclo.
- **Precedência em conflito entre documentos:** decisão explícita do Pivete > Doutrina + `CLAUDE.md` > regras oficiais (`REGRA-OFICIAL-*.md`) > docs vivos e aprendizados. Achou conflito? Aponta pro Pivete e registra — nunca resolve em silêncio.

---

## 1. A Fonte da Verdade é única e não-negociável

O CentralDark opera no **Fluxo de Ouro 5-Point**:

| Ponto | Onde | Papel |
| --- | --- | --- |
| **GitHub** | `ServerVpss/CentralDark` (memória oficial em `docs/CONSCIENCIA/`) | **Fonte da Verdade** — código, docs, regras, histórico |
| **VPS** | `/root/CentralDark/` | Executor/runtime — prova real, nunca fonte |
| **Supabase** | HUB + projetos | Estado vivo — painel, eventos, filas, logs rápidos |
| **Gateway** | `https://api.centralldark.com/` | Roteamento oficial de IA/modelos |
| **Cérebro Vivo** | `docs/CONSCIENCIA/` + `.claude/` | Contexto persistente entre sessões |

**Tudo que precisa sobreviver nasce ou é registrado no Git.** O que NÃO vale como memória oficial:

- **Notion** é espelho humano, alimentado automaticamente pelo workflow `notion-sync` a partir do Git (mapa em [`NOTION-MAPA.md`](../NOTION-MAPA.md)). Registrar direto no Notion **não conta como prova**. Mudou no Notion → é obrigatório refletir no Git; mudou no Git → o espelho atualiza sozinho.
- **`mem://` e contexto de sessão** não contam e não podem ser citados como prova de que algo foi feito — ver [`REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../REGRA-OFICIAL-HIERARQUIA-MEMORIA.md), seção *"Por que `mem://` NÃO é fonte oficial de memória"*.

---

## 2. O ciclo obrigatório — toda tarefa relevante

### Ler
- **Git primeiro** (`CLAUDE.md`, `docs/CONSCIENCIA/`, `docs/GOVERNANCA/`), depois o estado vivo (Supabase/painel) quando aplicável.
- **Validar caminhos antes de assumir.** Nenhum agente cita arquivo, pasta ou estado sem confirmar que existe de verdade (no repo via leitura, na VPS via `vps_read_file_safe` ou equivalente). Proibido inventar path.
- **Busca semântica primeiro.** Antes de criar qualquer coisa nova (arquivo, regra, pendência), procurar semanticamente se já existe. Reaproveitar vence criar (Regra Anti-Inflação / Mínima Complexidade Viável). **Nada de arquivo paralelo "-V2/-V3": melhora-se o que existe — quem versiona é o git.**

### Perguntar
- Escopo ambíguo, área protegida 🔒 ou ação sensível → autorização explícita **antes** (protocolo do §4).
- Silêncio ou dúvida do Pivete = **não agir**.

### Agir
- Executar **somente** o que foi pedido e autorizado, com a **menor mudança segura**. Não abrir frentes paralelas.

### Provar
- Toda conclusão relevante exige evidência verificável: commit, PR, diff, log, teste, health-check. Não dizer que leu/testou/executou sem ter feito.

### Registrar — destinos oficiais (tudo no Git)
- Decisão oficial → `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
- Pendência → `docs/PENDENCIAS.md` (ou tool MCP `adicionar_pendencia`)
- Aprendizado → `docs/CONSCIENCIA/APRENDIZADOS.md` (ou tool MCP `registrar_aprendizado`)
- Regra nova → arquivo `REGRA-OFICIAL-*.md` em `docs/CONSCIENCIA/`
- Notificação de ação relevante → **Card Hermes** ([`PADRAO-CARD-HERMES.md`](../PADRAO-CARD-HERMES.md) 🔒)
- O Notion recebe tudo isso sozinho via sync — não é destino de registro manual.

### Checklist de fechamento (obrigatório)

- [ ] Li a Fonte da Verdade antes de começar
- [ ] Validei todos os caminhos citados
- [ ] Tinha autorização para tudo que toquei
- [ ] Registrei no Git conforme o tipo de conteúdo
- [ ] Notifiquei via Card Hermes quando a ação foi relevante
- [ ] Atualizei e comuniquei as pendências abertas
- [ ] Tenho prova concreta (commit/PR/log/relatório) — não apenas "está na memória"

---

## 3. ⚡ Quando conectado via MCP CentralDark — rigor máximo

Quando o agente está plugado no **conector MCP CentralDark** (`mcp.centralldark.com`), esta regra deixa de ser recomendação e vira **trilho**. Estar no MCP significa ter poder real sobre o sistema:

1. **O MCP é a via oficial de registro.** Havendo tool para a ação (`registrar_aprendizado`, `adicionar_pendencia`, `atualizar_consciencia`...), o agente **usa a tool** — não improvisa, não inventa fluxo paralelo.
2. **Read-only por padrão.** Conexão MCP não autoriza escrita/execução — ação sensível segue o protocolo do §4.
3. **Toda ação via MCP deixa rastro** — log de auditoria + registro conforme §2.
4. **Sem token, sem ação.** Todo acesso exige credencial válida — nunca contornar auth. O antigo catálogo público `/mcp-public` **foi removido em 30/06/2026 por segurança**; não existe mais acesso sem token.
5. **Identidade declarada.** O agente declara qual é (Claude/GPT/Grok/Hermes/etc.) e qual papel exerce (planejador, executor, revisor) ao registrar.
6. **Chamada de modelo de IA passa pelo Gateway oficial** `https://api.centralldark.com/` — nunca provedor direto (rota fixada em `docs/CONSCIENCIA/ARSENAL/regras.json`).

---

## 4. Guardrails — autorização e áreas protegidas

**Protocolo de autorização** — o mesmo da [Doutrina de Proteção Estratégica](../../GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md):

| Comando do Pivete | Efeito |
| --- | --- |
| `PERMITO PIVETE` | Autoriza o plano imediatamente anterior |
| `PERMITO PIVETE <escopo>` | Autoriza somente o escopo nomeado |
| `TRAVA` / `PARA` / `!CALIBRA` | Cancela/interrompe tudo |
| Silêncio, dúvida ou resposta ambígua | **Não agir** |

- Autorização vale para o **escopo nomeado da missão** — não se generaliza, não se herda de missão ou sessão anterior, não se deduz do contexto. **Assumir autorização é violação.**
- **Áreas protegidas 🔒:** a lista canônica é a **tabela do `CLAUDE.md` Seção 9** + Doutrina (§3 e §5). Esta regra **não duplica a lista** — lista duplicada diverge. Exemplos do que mora lá: PM2/VPS, secrets/`.env`, workflows GitHub Actions, Caddy/proxies/SSL, migrations em produção, bots Telegram, módulos consolidados (`HERMES-CORE`, `status`, `hub`...).
- Padrão travado de notificação: **só** Card Hermes via connector `sendMessage` — a edge function `notify-telegram` é **proibida** ([`PADRAO-CARD-HERMES.md`](../PADRAO-CARD-HERMES.md)).

---

## 5. Papéis dos agentes — funcionais, não fixos

**As IAs variam. O método permanece.** Papel não é marca de produto — é função na missão:

- **Pivete** — comandante e decisor final. Define prioridade, escopo e autorização.
- **Papéis funcionais** — planejador, executor, revisor/crítico, auditor, notificador — atribuídos por missão, a qualquer IA. A IA pode mudar; o papel designado continua (método completo no [`PROTOCOLO-ORQUESTRACAO-PIVETE.md`](../PROTOCOLO-ORQUESTRACAO-PIVETE.md)).
- **Roteamento de modelos** — via Arsenal Council ([`ARSENAL/regras.json`](../ARSENAL/regras.json)) e CLI `darkai` ([`DARKAI/`](../DARKAI/README.md)), sempre pelo Gateway oficial.
- **Agentes autônomos internos** (Hermes e sub-agentes, Guardião, Analista) obedecem esta mesma regra **mais** suas travas próprias (quorum, kill-switch, modo propor).

Nenhum agente toma ação destrutiva ou abre frente paralela sem autorização. Sessão que encerra sem concluir deixa **handoff claro** para a próxima.

---

## 6. Proibições absolutas (qualquer uma anula a tarefa)

- ❌ Declarar tarefa concluída sem prova concreta (commit/PR/log/relatório).
- ❌ Citar arquivo, estado ou fato sem ter validado que existe.
- ❌ Criar arquivo/regra/pendência sem antes buscar se já existe — inclui criar "-V2/-V3" paralelo em vez de melhorar o original.
- ❌ Tocar área protegida 🔒 ou sensível sem autorização do §4.
- ❌ Tratar `mem://`, Notion ou memória de sessão como fonte oficial de registro.
- ❌ Contornar autenticação do MCP ou agir privilegiado sem credencial.
- ❌ Expor secret, token, service_role_key, senha, chave SSH ou conteúdo de `.env` — nunca, a ninguém.
- ❌ `pm2 restart all` — e não tocar no `whatsapp-server` (PM2 id 1, estado desejado `stopped`).
- ❌ `git push --force` / `reset --hard` na `main`, ou editar produção (VPS) como fonte da verdade.
- ❌ Trocar endpoint oficial (`https://api.centralldark.com/`) sem autorização e sem mapear dependências.

---

## 7. Referências cruzadas

**Canon de governança (manda em tudo):**
- [`CLAUDE.md`](../../../CLAUDE.md) — dump de estado, Regras de Execução Defensiva (Seção 5) e tabela de áreas 🔒 (Seção 9)
- [`docs/GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md`](../../GOVERNANCA/DOUTRINA-PROTECAO-ESTRATEGICA.md) — proteção estratégica + protocolo `PERMITO PIVETE`
- [`docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md`](../../GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md) — arquitetura oficial 5-Point
- [`docs/GOVERNANCA/REGRAS-OPERACIONAIS-PIVETE.md`](../../GOVERNANCA/REGRAS-OPERACIONAIS-PIVETE.md) — 6 regras operacionais seladas

**Método e memória:**
- [`PROTOCOLO-ORQUESTRACAO-PIVETE.md`](../PROTOCOLO-ORQUESTRACAO-PIVETE.md) — o método: ciclo, modos operacionais, boot, evidência
- [`REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../REGRA-OFICIAL-HIERARQUIA-MEMORIA.md) — por que `mem://` não é fonte oficial
- [`PADRAO-CARD-HERMES.md`](../PADRAO-CARD-HERMES.md) 🔒 — padrão oficial de notificação Telegram
- [`00-LEIA-PRIMEIRO.md`](../00-LEIA-PRIMEIRO.md) — porta de entrada para qualquer IA nova
- [`APRENDIZADOS.md`](../APRENDIZADOS.md) e [`docs/PENDENCIAS.md`](../../PENDENCIAS.md) — aprendizados validados e pendências abertas

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
