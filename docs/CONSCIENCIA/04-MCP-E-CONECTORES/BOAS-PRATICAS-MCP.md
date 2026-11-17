---
title: "BOAS PRATICAS MCP"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Boas Práticas do MCP — CentralDark

> **Status:** Obrigatório · **Escopo:** Universal — vale para TODA IA que se conectar ao MCP CentralDark, independente de onde opera (Claude, Lovable, GPT, Cursor, Grok, Gemini, Codex, Copilot e futuras).
> Última atualização: 29/06/2026

---

## Lei Absoluta — Leitura Obrigatória Antes de Qualquer Ação

**Toda inteligência artificial que se conectar ao MCP CentralDark DEVE OBRIGATORIAMENTE ler os seguintes documentos ANTES de iniciar qualquer trabalho:**

1. `docs/CONSCIENCIA/00-LEIA-PRIMEIRO.md` — porta de entrada
2. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md` — **como você deve pensar**
3. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` — protocolo de operação
4. `docs/CONSCIENCIA/04-MCP-E-CONECTORES/ferramentas-cognitivas-e-comandos.md` — ferramentas disponíveis
5. `docs/CONSCIENCIA/ARTEFATOS/` — contexto histórico de construção (leitura recomendada)

> **Não existe exceção.** Conectou ao MCP → leu os documentos → então pode operar.

---

## O que é o MCP CentralDark

O MCP (Model Context Protocol) é a **via oficial de integração** entre qualquer IA e o ecossistema CentralDark. Ele fornece:

- Acesso ao repositório GitHub (`ServerVpss/CentralDark`)
- Acesso controlado à VPS (`/root/CentralDark/`)
- Conexões com Notion, Supabase, Telegram, Linear e outros serviços
- Execução controlada de comandos na infraestrutura

**Com grande poder vem grande responsabilidade.** O MCP dá acesso real ao sistema — e por isso as regras são mais rígidas, não menos.

---

## Regras de Operação via MCP

### Read-only por padrão
Conectar ao MCP não autoriza escrita ou execução. Cada ação sensível exige autorização explícita e individual do Pivete — uma autorização não vale para a próxima.

### Identidade declarada
Ao operar via MCP, a IA deve declarar:
- Qual modelo/sistema é (Claude, GPT, Cursor, etc.)
- Qual papel está exercendo (planejador, executor, leitor, revisor)

### Rastreabilidade total
Toda ação executada via MCP deve deixar rastro:
- Linha em `🤖 Agent Logs` no Notion
- E/ou registro em `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` para decisões relevantes

### Ciclo obrigatório: Ler → Agir → Registrar
1. **Ler** a Fonte da Verdade antes de qualquer ação
2. **Agir** somente o que foi pedido e autorizado
3. **Registrar** o resultado no canal correto

### Sem token, sem ação privilegiada
O catálogo público (`/mcp-public`) é leitura livre. Ação que exige `/mcp` autenticado só acontece com credencial válida — nunca contornar auth.

---

## Áreas Sensíveis — Autorização Literal Obrigatória

Nunca tocar sem o Pivete dizer literalmente **"Pode seguir"** ou **"PERMITO SEGREDO: (ação)"**:

- WhatsApp / wuzapi-server
- PM2 (restarts, dumps, estados)
- Docker / containers
- Caddy / proxies / SSL
- Scripts de deploy (`scripts/webhook/`)
- Edge functions em produção
- GitHub Actions workflows
- Migrations / schemas em produção
- Secrets / tokens / `.env`
- Qualquer área listada na **Seção 9 do CLAUDE.md** (Áreas Protegidas)

---

## Capacidades Cognitivas no MCP

Quando operar via MCP, ative especialmente:

- **System 2** — raciocínio deliberado antes de qualquer escrita ou execução
- **Self-Reflection** — perguntar "isso quebra algo que já funciona?" antes de agir
- **Verificação de Consistência** — checar contra `08-HISTORICO-DECISOES.md`
- **Compreensão Semântica** — entender a intenção, não só a instrução literal

Referência completa: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md`

---

## Referências Cruzadas

- `CLAUDE.md` — regras gerais do projeto e áreas protegidas (Seção 9)
- `01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` — protocolo multi-agente completo
- `01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md` — metodologias de raciocínio
- `ferramentas-cognitivas-e-comandos.md` — ferramentas disponíveis
- `REGRA-OFICIAL-HIERARQUIA-MEMORIA.md` — hierarquia de memória oficial

---

*Última atualização: 29/06/2026 · Criado com autorização do Pivete*

---

## Operacao: bind, porta e o 502 do host publico

Sintoma: `https://mcp.centralldark.com/health` responde **502**, o tunel aparece `healthy` e o
`admin.centralldark.com` (mesma maquina, outra porta) responde **200**. O MCP em si esta de pe —
basta le-lo localmente. Ou seja: `TUNEL_SAUDAVEL != SERVICO_EXPOSTO`.

Assinatura de causa raiz comprovada: o processo do MCP escuta **somente em `127.0.0.1:9100`**,
enquanto o ingress do tunel `centraldark-casa-mcp` entrega em `http://192.168.35.130:9100` (a LAN
da Forja). Nada escuta no endereco da LAN -> o `cloudflared` recebe conexao recusada -> 502.

### Como medir sem chutar

```text
1. ss -ltnp | grep :9100            # em QUAL endereco o MCP escuta (0.0.0.0? 127.0.0.1? LAN?)
2. curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9100/health   # processo vivo?
3. curl -s -o /dev/null -w '%{http_code}' http://192.168.35.130:9100/health # atende no ingress?
4. Cloudflare: comparar o ingress ativo com os destinos que REALMENTE escutam
5. analytics por hora: 530 -> tunel sem origem; 502 -> origem recusando; 401 -> servico OK, so auth
```

### Regras que ficam

- **`127.0.0.1` fixo no codigo nao sobrevive a um ingress que aponta para a LAN.** O `app.listen`
  deve ler o endereco de uma variavel (`MCP_HOST`), com **padrao loopback** — expor exige variavel
  explicita.
- **Nao troque a porta nem o ingress como primeira acao.** Confirme quem escuta onde antes de mexer
  na topologia.
- **Cuidado ao publicar sonda de diagnostico na mesma porta**: um listener em `100.x:9100`
  (Tailscale Serve) impede o bind em `0.0.0.0:9100` e derruba o servico. Se usar sonda, aponte o
  bind do servico para o endereco especifico da LAN ou remova a sonda antes.
- **Reinicio de servico com `TimeoutStopSec` curto vira SIGKILL**: o processo do MCP demora a
  morrer e o systemd registra `Failed with result 'timeout'` — isso nao e a causa do 502.
- **`/mcp` e `/api/mcp` variam por build.** Nao declare rota inexistente por um unico 404: confirme
  no MESMO build que esta servindo (`401` = rota existe e pede auth).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
