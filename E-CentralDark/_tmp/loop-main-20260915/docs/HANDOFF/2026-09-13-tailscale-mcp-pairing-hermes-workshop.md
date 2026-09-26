# 🔐 CentralDark — Tailscale + MCP Pairing + Hermes Skill Workshop

STATUS: CANDIDATO_EM_PR
OWNER_MCP: `apps/modulos/mcp/`
OWNER_SKILLS: `.agents/skills/skill-workshop/`
OWNER_HERMES_RUNTIME: adaptador por referência, nunca cópia do cérebro

## Intenção do Chefe

```text
SEGREDO/CHEFE
→ MCP CentralDark privado e autenticado
→ Casa↔VPS por Tailscale
→ pairing + aprovação + token rotativo
→ heartbeat + device registry + PING/PONG
→ skill-workshop disponível ao Hermes sem duplicar owner
→ REUSE_BEFORE_CREATE / ONE_SYSTEM_ONLY / ZERO_REGRESSION
```

## Delta aplicado neste candidato

1. `scripts/vps/configure-tailscale-private-mcp.sh`
   - exige MCP saudável em `127.0.0.1:9100`;
   - falha se detectar bind público em `:9100`;
   - publica `:9100` somente no tailnet via Tailscale Serve TCP;
   - Tailscale SSH é opt-in (`--enable-ts-ssh`), não ativado implicitamente.

2. `apps/modulos/mcp/src/device-pairing.js`
   - pairing de 2 minutos;
   - código humano + segredo de posse de alta entropia;
   - aprovação administrativa;
   - token do device entregue uma vez e persistido apenas como hash;
   - registry atômico `0600`;
   - heartbeat e estado `online/offline` por idade;
   - listagem nunca devolve `token_hash`.

3. `apps/modulos/mcp/tests/device-pairing.test.mjs`
   - token one-shot;
   - segredo de posse obrigatório;
   - heartbeat autenticado;
   - expiração sem falso verde.

4. `scripts/hermes/bind-skill-workshop.ps1` e `.sh`
   - `LOAD_REFERENCE`, não cópia;
   - Windows: junction para o owner canônico;
   - Linux/VPS: symlink para o owner canônico;
   - destino divergente bloqueia em vez de sobrescrever.

## Proveniência externa destilada

O pacote de referência fornecido pelo Chefe foi usado somente como material de arquitetura. O delta comportamental aproveitado foi:

```text
device authorization
→ start
→ human approval
→ poll/status
→ token
→ persisted device identity
→ heartbeat
→ online/offline registry
→ session recovery
```

Nenhuma persona, autoridade, segredo ou governança externa é herdada. Código externo continua candidato, não autoridade.

## Regra Zero

```text
CURRENT > HISTORICAL
REALITY = JUDGE
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_BLIND_OVERWRITE=true
```

## Contraprova / estado ainda não verde

- O módulo `device-pairing.js` existe no candidato, mas o bind HTTP em `src/index.js` ainda precisa ser promovido junto do `dist/` exato. `EXISTS != RUNNING`.
- O workflow de deploy do MCP exige build sem `dist` drift; portanto fonte nova não pode ser promovida com `dist` antigo.
- Tailscale foi comprovado como presente/conectado nas duas máquinas por evidência anterior, mas o `tailscale serve` deste candidato ainda não foi executado na VPS. `DOCUMENTED != EXECUTED`.
- O canal remoto usado para a Casa ficou indisponível durante a aplicação; nenhum claim de mutação local/VPS é feito depois desse ponto.
- `skill-workshop` foi preparado para bind por referência, mas o bind no runtime Hermes ainda precisa de execução e prova no host.

## Próximo cursor obrigatório

```text
1. bindar router em `src/index.js`
2. regenerar `apps/modulos/mcp/dist` com TypeScript pinado do repo
3. typecheck + testes completos + build sem drift
4. executar Tailscale private serve na VPS
5. executar bind skill-workshop no Hermes Casa + VPS
6. heartbeat real Casa→MCP→registry
7. receipt PING/PONG
8. só então REALITY_JUDGE=PASS
```
