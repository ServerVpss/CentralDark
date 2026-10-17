# CentralDark — Instinto Superior

Corpo visual final da CentralDark. Este repositório reúne a landing trilíngue, autenticação Supabase, sala administrativa, cockpit de estado, comparação de repositório, Hermes, exportação e inventário do roteador.

## Autoridade e publicação

- Código visual canônico: `ServerVpss/CentralDark/apps/instinto-superior`.
- Contratos, runtime, governança e código visual convergem no mesmo repositório: `ServerVpss/CentralDark`.
- `ServerVpss/centraldark-instinto-superior` + Lovable: projeção/editor compatível; não são segunda autoridade nem owner paralelo.
- URL conhecida: <https://centraldark-instinto-superior.lovable.app>.

Uma URL conhecida ou uma sincronização declarada não prova que o HEAD está publicado. O cockpit só promove deploy quando consegue medir e comparar os SHAs; ausência de fonte aparece como `UNKNOWN`.

## Desenvolvimento

Requer Node.js 22 e npm.

```sh
npm ci
npm run lint
npm run build
npm run dev
```

## Rotas materiais

- `/`: corpo visual e doutrina.
- `/auth` e `/auth/callback`: e-mail/senha e OAuth PKCE.
- `/reset-password`: recuperação e troca de senha.
- `/cockpit`: entrada e estado público sem fingir runtime.
- `/sala-controle`: superfície autenticada e autorização administrativa real.
- `/repositorio`: leitura e comparação estrutural determinística do GitHub.
- `/roteador`: capacidades declaradas do Omni Router e probes vivos separados.

Veja `docs/CONVERGENCIA-CAPACIDADES-2026-09-25.md` para a matriz de reaproveitamento.


## Contraprova de autenticação na VPS — 12/10/2026

- **Causa medida:** o serviço `centraldark-instinto-superior-web.service` estava ativo, mas seu processo Node não recebia `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`; middleware `src/integrations/supabase/auth-middleware.ts` exige ambas e o journal registrou `Missing Supabase environment variable(s)`. A checagem de admin/RLS permanece inalterada.
- **Fonte existente:** `.env.production.local` na VPS, modo 0600, já continha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` públicos do projeto Supabase canônico; nenhum valor foi transportado à main.
- **Menor delta:** gerar `/etc/centraldark/instinto-superior-auth-public.env` (0600, apenas aliases `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`, sem service-role) e adicionar drop-in `/etc/systemd/system/centraldark-instinto-superior-web.service.d/10-supabase-public.conf` com EnvironmentFile. Unit original intacta. Reinício somente do cockpit, não do MCP/Hermes.
- **Readback:** `ActiveState=active`, `MainPID=128667`, ambiente novo contém as duas variáveis e nenhuma SERVICE_ROLE; `/auth`, `/auth/callback`, `/sala-controle` HTTP 200; nenhum novo `Missing Supabase` desde a inicialização do novo PID às 17:28:18 UTC. **HTTP 200 não comprova login admin.**
- **Rollback:** remover somente drop-in `10-supabase-public.conf` e env derivado `instinto-superior-auth-public.env`, `systemctl daemon-reload`, reiniciar somente a unit do cockpit. Não mexer na `.env.production.local` nem em cookies.
- **NEXT_CURSOR:** reentrar pelo navegador em `/auth`, testar chamada SSR com sessão verdadeira e confirmar `admin=true`. O erro `chrome-extension://.../inject-scripts/set-global.js` é da extensão Chrome e deve ser testado separadamente; não é prova da causa server-side.
- **Reality Judge:** `RUNTIME_ENV=PASS`, `SSR_ROUTES=PASS`, `SESSION_SERVER_FN=UNKNOWN`, `ADMIN_LOGIN_E2E=UNKNOWN`, `EXTENSION_ERROR=SEPARATE`, `GLOBAL_FIXED_POINT=FALSE`.



## 🪬 Quatro cartões de estado · frente CURRENT / verso histórico (2026-10-17)

**Owner único:** `src/components/central/StatusPanel.tsx`, com coleta no owner
`src/lib/cockpit.functions.ts`; regressão no `scripts/verify-hud-zone.mjs`.
Nenhuma nova aba, executor, backend de memória ou novo contrato de autenticidade.

Os cartões **Casa / Site local**, **Main GitHub**, **VPS · comparação SHA** e
**API CentralDark** viram ao clicar/tocar (acessível também pelo teclado).
A frente exibe o estado atual medido com política de 15 s, o verso exibe
**a última medição positiva persistida neste navegador** em `localStorage`
(apenas estado/timestamp/SHA truncado/escopo fixo, sem cookies ou secrets).
Histórico é memória de UI, não recibo canônico; dados de outro navegador/antigas
conversas não são magicamente disponibilizados. Sem registro válido, o verso
declara essa ausência; jamais pinta um PASS inventado.

- **Casa desligada:** o servidor VPS consulta `tailscale status --json` em
  operação de leitura e identifica somente o peer exato `SEGREDO`. Se o peer
  informa `Online=false`, a face corrente exibe **OFFLINE NA MALHA**, sem
  declarar que PC, site e processo morreram. Se o binário Tailscale ou peer
  não existir, fica **CASA NÃO MEDIDA**, não offline inferido. `127.0.0.1:4175`
  só é testado como Casa quando o servidor efetivamente roda no Windows;
  HTML HTTP 200 confirma apenas que a **página local respondeu**.
- **Main:** PASS apenas quando a API GitHub fornece HEAD válido. Ausência de
  credencial é **AUTORIZAÇÃO DO SENSOR**, não reprovação de commit aprovado.
- **VPS:** SHA é identificador da versão do código. `SHA COINCIDE` apenas se
  HEAD Main e HEAD do Live Fabric forem iguais; **não certifica deploy,
  processo, autenticação nem serviço ativo**.
- **API:** `/health` identificado e HTTP 200 prova apenas essa rota, não
  todos os módulos nem três estrelas Michelin.

Estética: a casca metálica usa os tokens do cockpit existente;
`rotateY(180deg)`, indicador sem piscada falsa de estado desconhecido,
controle de teclado, `aria-pressed` e `prefers-reduced-motion`.
No verso também aparece o estado atual e um gatilho cognitivo curto,
por exemplo **“Mesmo SHA não prova serviço”**.

**Regressão:** `npm run verify:hud` verifica distinção CURRENT/histórico,
proibição de falso verde, offline da malha e quatro controles. O teste não
prova navegador real, login, deploy ou aceitação visual.
**NEXT_CURSOR:** concluir merge sem perder mudanças concorrentes, CI no
HEAD exato, deploy autorizado da VPS e contraprova visual no cockpit,
preservando Casa offline e o histórico sem promover STATUS por memória.

## 🪬 Manifesto incremental do harness privado

O contrato evolutivo, os owners, o catálogo da Forja Viva, a gaveta histórica, a migração do HUD e o NEXT_CURSOR ficam em [INSTINTO-MANIFESTO-INCREMENTAL.md](docs/INSTINTO-MANIFESTO-INCREMENTAL.md). Acrescentar deltas nesse mesmo documento; não criar manifesto paralelo. Os snapshots de inventário não provam runtime ou deploy.
