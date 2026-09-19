# DELTA ÚTIL 01 — Hub Telegram + contas Claude + autenticação Casa

```text
PR_MOTHER=#1562
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
ACTIVE_CHILD_PR=#1579
PR_ROLE=CHILD_PROMOTION_PR
DELTA_UTIL_ID=01
COMPASSO_GLOBAL=ON
RETEM_O_BEM=true

ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
```

## Intenção do CHEFE

Absorver no Hub existente da CentralDark o fluxo de contas/autenticação sem criar
segundo Hub, segundo broker, segundo bot ou segundo cérebro.

O Hub Telegram `@srver1bot` deve expor, em linguagem humana, a gestão de contas
Claude/Claude Code e das demais capacidades já inventariadas, reutilizando owners
existentes antes de criar qualquer peça.

## Owner e peças a reutilizar

- `apps/bot-telegram/unified-bot.cjs` — cockpit Telegram.
- `apps/modulos/oauth-broker/server.mjs` — broker de conexões suportadas.
- `scripts/contas-admin/` — login web remoto já existente.
- `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` — roteamento/fallback.
- `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md` — corredor Desktop Commander.
- `docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json` — compasso/global rendezvous.

## Claude multi-conta — contrato

O Hub deve representar várias contas Claude como identidades separadas:

```text
🔵 ativa
🟢 saudável / disponível
🟡 precisa autenticar / estado parcial
🟠 sessão expirada
🔴 não autorizada / indisponível
⚫ desativada
⚪ ainda não provada
```

Adicionar conta:
1. usuário escolhe `🧠 Claude → ➕ Adicionar conta`;
2. medir primeiro qual mecanismo é realmente suportado no runtime atual;
3. se houver OAuth/CLI oficial suportado, usar o fluxo oficial;
4. se for login web, chamar de LOGIN WEB — nunca fingir OAuth;
5. autenticação humana ocorre fora da conversa quando o provedor exigir;
6. persistir somente referência/credencial cifrada no owner existente;
7. executar health/test real;
8. somente depois marcar a conta como 🟢.

Troca:
- uma conta pode estar 🔵 ativa e outras 🟢 prontas;
- troca manual deve existir;
- failover automático pode ocorrer para sessão expirada, credencial inválida,
  conta desativada ou indisponibilidade real;
- cada conta é tentada no máximo uma vez por request;
- anti-loop/circuit-breaker obrigatório.

Quota/limite:
- NÃO usar rotação de contas para burlar limite do provedor;
- só alternar por quota quando o provedor/política oficial permitir;
- caso contrário marcar `LIMIT_REACHED`;
- se todas as contas autorizadas estiverem indisponíveis, mostrar alerta vermelho;
- fallback para free tier/outro provider somente se já permitido/configurado;
- fallback nunca pode fingir que é a conta Claude paga.

## Telegram — superfície obrigatória

Menu mínimo:

```text
🔐 CONEXÕES
└── 🧠 Claude
    ├── 🔵 Conta ativa
    ├── 🟢 Contas prontas
    ├── ➕ Adicionar conta
    ├── 🔄 Trocar conta
    ├── ♻️ Reautenticar
    ├── 🧪 Testar contas
    ├── ⏸️ Desativar
    └── 🔙 Hub
```

O mesmo padrão humano deve ser reutilizado para Codex/OpenAI, Google,
Supabase, GitHub, Grok/xAI, Groq e demais providers já inventariados.
Cada provider conserva o mecanismo de autenticação real; a interface é unificada,
a semântica da credencial não é falsificada.

## Desktop Commander — autenticação da Casa

Comando canônico medido no contrato atual:

```powershell
npx --yes @wonderwhy-er/desktop-commander@0.2.48 remote
```

Fluxo:
1. executar na Casa;
2. aguardar `DEVICE_CODE_READY` quando não houver sessão válida;
3. abrir `https://mcp.desktopcommander.app/device/verify`;
4. informar o código efêmero;
5. após autenticação, o Remote restaura/persiste a sessão permitida.

Multi-conta Desktop Commander:
- `MULTI_ACCOUNT_ISOLATED_HOME`;
- cada conta usa HOME próprio;
- cada conta usa `device.json` próprio;
- serviços/watchdogs próprios;
- todas passam pelo mesmo corredor Remote MCP;
- não copiar token/session entre perfis.

## Gates

```text
G1 owner existente identificado
G2 mecanismo auth medido, não inventado
G3 nenhum segredo em Telegram/log/receipt/Git
G4 conta adicionada permanece isolada
G5 conta ativa observável
G6 troca manual provada
G7 expiração provoca failover seguro
G8 todas indisponíveis => alerta vermelho
G9 fallback permitido fica explicitamente identificado
G10 anti-loop provado
G11 unauthorized continua fail-closed
G12 SAME_HEAD_CI antes de promoção
G13 runtime VPS/Casa remensurado depois do deploy
```

## Contraprovas obrigatórias

- token/credencial inválida não pode ficar verde;
- sessão expirada não pode permanecer ativa;
- conta desativada não pode ser selecionada;
- saída de ferramenta não vira intenção do CHEFE;
- browser login não pode ser rotulado como OAuth;
- quota bloqueada não pode ser mascarada como failover autorizado;
- ausência de prova vira UNKNOWN;
- PR/texto não é prova de runtime.

## Promoção

```text
#1562 PR-MÃE
→ DELTA ÚTIL 01
→ SUB-PR/Writer
→ implementação mínima
→ testes
→ contraprova
→ SAME_HEAD_CI
→ main
→ micro-deploy causal
→ remedição
→ receipt volta ao #1562
```

O #1562 recebe o rastro e a coordenação; não recebe promoção direta de código.

## Estado desta cristalização

```text
DELTA_UTIL_01=CRISTALIZADO
TELEGRAM_RUNTIME_IMPLEMENTATION=NOT_YET_PROVEN
CLAUDE_MULTI_ACCOUNT_RUNTIME=NOT_YET_PROVEN
DESKTOP_COMMANDER_COMMAND=DOCUMENTED_FROM_CANONICAL_CONTRACT
PR_MOTHER_LEDGER=REQUIRED
REALITY_JUDGE=PENDING
```
