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

### Criação e alteração de ferramentas MCP

Aplicar o [padrão obrigatório de observabilidade](../../../.agents/skills/centraldark-operational-method/SKILL.md#observabilidade-obrigatória-na-criação-de-ferramentas) do BOOT. O evento de execução não substitui a leitura do efeito. Validar a ferramenta por sua chamada MCP oficial, com a autorização aplicável, um sucesso comprovado e uma recusa/falha controlada com código seguro. Catálogo, `initialize` ou `tools/list` isoladamente não provam execução. Reutilizar o logger do owner e não enviar logs integrais para o registro de decisões.

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

## OAuth do MCP quando o navegador esta em OUTRA maquina

O `redirect_uri` do cliente e **loopback** (`http://127.0.0.1:<porta>/callback`) e aponta para a
maquina ONDE O CLIENTE RODA, nao para o navegador. Se o navegador do CHEFE esta no celular/Windows
e o cliente roda na VPS, o `127.0.0.1` do navegador e o proprio navegador -> `ERR_CONNECTION_REFUSED`.
**Isso e normal, nao e defeito.** O `authorize` ja emitiu o `code`; ele so precisa ser entregue ao
receptor do cliente.

Fluxo que fecha (comprovado em 2026-11-17, 142 ferramentas descobertas com escopo `mcp`):

```text
1. subir UM receptor no host do cliente: 127.0.0.1:51070/callback
   -> usar serve_forever em thread; handle_request() atende UMA conexao e morre
      (uma simples checagem de porta ja consome esse unico atendimento)
2. gerar PKCE proprio (verifier + challenge S256 + state) e reusar um client_id JA REGISTRADO
   (o registro dinamico responde 403)
3. pedir ao CHEFE: abrir a URL de authorize e, na pagina de erro, COPIAR a barra de endereco
4. entregar essa URL no receptor do passo 1 (curl local) -> capturar o code
5. POST /token com grant_type=authorization_code + code + redirect_uri + client_id + code_verifier
6. usar o access_token em POST /api/mcp (JSON-RPC tools/list e tools/call)
```

Armadilhas:

- **Cloudflare 1010** bloqueia o POST de `/token` vindo de `urllib`/curl sem UA de navegador. Mande
  `User-Agent` de navegador real, senao a troca falha no edge (e o `code` continua valido).
- **O `code` e de uso unico** e expira rapido: capture e troque na mesma janela.
- Escopo `mcp` expoe ~142 das 160 ferramentas; `admin` libera o resto.
- `tools/list` autenticado + um `tools/call` real com readback e o que fecha o circuito;
  `/health` 200 nao prova consumo.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

<!-- MCP_CLOUDFLARE_1033_CASA_TUNNEL_DOWN_20261118 -->
### 18/11/2026 — Error 1033/530 não é rota MCP: é o conector da Casa

**Sintoma:** `https://mcp.centralldark.com/health` = **530** (Cloudflare Tunnel Error 1033), Ray ID `a5c2d70d6c81f521`, 18/11 00:25 UTC.

**Diagnóstico discriminante (FRIA):** medidos no mesmo instante — `centralldark.com` = **200**, `gateway.centralldark.com` = **302**, mas `mcp.centralldark.com`, `admin.centralldark.com` e `multizap-mvp.centralldark.com` = **530**. Os três domínios caídos pertencem ao **túnel da Casa**; os dois vivos pertencem ao túnel `fe52c8b1-dcc3-46c3-ab75-ee41fa3c3555` da VPS. Logo, não é DNS, não é ingress do MCP, não é OAuth, não é CORS e não é o serviço MCP na Forja.

**Causa observada:** a tailnet mostra `segredo-chefe-pc` (`100.122.246.22`) **offline**, last seen ~15 min, e `centraldark-os-forja` também offline via relay. Sondas TCP diretas na Casa (:8080/:9100/:9101) falharam. O conector Cloudflare que serve `mcp`/`admin` roda na Casa; máquina desligada = túnel sem conector = 530/1033.

**O que NÃO foi feito:** nenhum túnel novo, nenhuma alteração de DNS/ingress/Cloudflare Access, nenhuma credencial tocada, nenhum restart de serviço remoto sem acesso autorizado, nenhuma exclusão. O túnel da VPS e o MCP da Forja (`/health` local 200, 160 tools) permanecem intactos.

**Estado:** VPS_TUNNEL=PASS; FORJA_MCP=PASS; CASA_NODE=OFFLINE; CASA_TUNNEL=BLOCKED; AUTH=UNCHANGED; FIXED_POINT=NÃO — depende da Casa voltar e do conector existente reconectar.

**NEXT_CURSOR:** quando `100.122.246.22` reaparecer na tailnet, conferir `cloudflared` na Casa pelo owner local e repetir os quatro domínios. Não criar túnel substituto.
<!-- /MCP_CLOUDFLARE_1033_CASA_TUNNEL_DOWN_20261118 -->
