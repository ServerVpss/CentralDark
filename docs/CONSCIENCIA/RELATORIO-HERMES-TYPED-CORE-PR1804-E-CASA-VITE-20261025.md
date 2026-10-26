# Auditoria — Casa Vite 8080 e Hermes Typed Core PR #1804

**Data:** 2026-10-25
**Owner:** CentralDark `main`; Casa `SEGREDO` (`K:\\`); VPS por SSH direto, sem CI/CD.
**Método:** Kimetsu Brainstorm + 17-slot reference / REUSE_BEFORE_CREATE / ONE_WRITER_PER_SCOPE / TESTA → PROVA.
**Classificação:** BOUNDED para duplicata de Vite; SPIKE para reconciliação do Hermes PR.
**Status:** CASA_PORTA=PASS; HERMES_PR_REUSE=PARCIAL; DEPLOY_VPS=NOT_EXECUTED.

## 1. Porta canônica Casa

Contrato existente:
- `apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat` é um launcher idempotente que chama `scripts/casa/instinto-cockpit-autostart.ps1`.
- O script valida o owner por PID/comando, evita kill automático indiscriminado e usa **porta TCP 8080** com `--strictPort`.
- `vite.config.ts` já reusa o plugin TanStack/Vite do proprietário; NÃO adicionar plugins duplicados nem servidor paralelo. HMR é próprio do Vite.
- `3000` pertence ao listener de infraestrutura Tailscale, não a outro Vite deste Cockpit. `9101` é a ponte local CentralDark Casa Commander, preservada.
- `80` e `454` não tinham listeners na medição; não são justificativa para nova porta dev.

### Prova ativa

No início da sessão, a Casa tinha Vite PID `15796` em `8080` (`npm run dev`) e Vite PID `38052` em `127.0.0.1:8081` (`--strictPort`) — segundo Vite usado como execução paralela de prova.
Apenas PID `38052` foi terminado após confirmar o comando e que era dono exclusivo do listener `8081`.
**Contraprova:** `GET http://127.0.0.1:8080/cockpit` retornou `HTTP 200`; `8081` deixou de ouvir; `GET http://127.0.0.1:8080/@vite/client` retornou `HTTP 200`, confirmando presença do client HMR. Não houve restart do MCP, OneShot ou Casa Commander.

**ONE_SERVER=8080** para desenvolvimento na Casa. Em VPS, respeitar a porta interna já configurada no serviço de produção, sem Vite dev público. Pipeline proposto para a VPS é **SSH direto → validar fonte/owner → build existente → restart somente serviço afetado → readback/receipt**. Não executar só porque o HTTP é 200.

## 2. Hermes Typed Core PR #1804 — origem e alcance

GitHub: PR **#1804** `HERMES TYPED CORE SCRIPT-FIRST + RUNTIME BINDING`; origem `crystal/hermes-typed-core-script-first-20261013`; base `main`. Verificado via `gh pr view 1804`: **CLOSED, mergedAt=null**, em 15/10/2026. PR mudou dezenas de arquivos (9.303 linhas adicionadas e 1.948 removidas): NÃO mesclar a branch inteira na main atual, que já mudou substancialmente.

Cristal fonte do PR em `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/HERMES-TYPED-CORE-SCRIPT-FIRST.yml` (commit `f43cb6c60e`). **Ele NÃO está presente como arquivo rastreado na main atual.**
- Owner de execução permanece `apps/modulos/HERMES-CORE/`, sob `HERMES-AUTOCONFIG-RUNTIME.yml`.
- `HERMES_TYPED_CORE`: regras e receitas determinísticas primeiro; sem consulta ao modelo para cada operação.
- `HERMES_INTELLIGENCE_MODE`: análise de IA sob demanda quando regras e medições forem insuficientes.
- Recibo tipado exigido: INTENT_ID / MODE / COMMAND_OR_EVENT / OWNER / MAIN_SHA_OR_RUNTIME_SHA / CURRENT / ACTION / EFFECT_READBACK / STATUS / NEXT_CURSOR.
- Invariantes: UNKNOWN != PASS, UM_WRITER, NO_SECOND_ROUTER, AI_DOES_NOT_SELF_AUTHORIZE.

## 3. O que já existe na main — não duplicar

- `apps/modulos/HERMES-CORE/core/routing-strategy.mjs`: estratégia `priority/cost/latency/round_robin`; teste `routing-strategy.test.mjs` → 1/1 PASS nesta sessão.
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/HERMES-AUTOCONFIG-RUNTIME.yml`: owner formal do runtime, script-first e regras contra cérebro/roteador paralelo.
- `scripts/agent-call.mjs`: trilha já prevista na referência das 17 respirações; não criar event bus paralelo.
- `apps/instinto-superior/src/components/central/CockpitShell.tsx`: Cockpit já integra Hermes, modelos e rotas; preservar áreas de autenticação e demais mudanças locais.
- `apps/instinto-superior/src/components/central/MenuContaCentralDark.tsx`: catraca de conta da Casa em desenvolvimento, independente do escopo Hermes.
- Outros commits do PR `92a8ea6ed6` e `834e106aa1` ilustram runtime binding/HUD, **não provam replay vivo atual**.

**Atenção:** “typed core” do PR #1804 é sobretudo um contrato **tipado semanticamente** em YAML, com JavaScript `.mjs` e testes; isso **não comprova um core TypeScript `.ts` já integrado**. Um adaptador TypeScript novo só deve existir quando testes demonstrarem ausência real desse contrato no owner atual.

## 4. Proposta tipada mínima, reutilizando o runtime

Em vez de novo Hermes ou processo:
1. Reconciliar campos do receipt do contrato acima com o formato já emitido pelo `HERMES-CORE`.
2. Se houver lacuna comprovada, adicionar tipos/interfaces TS **somente ao adaptador do Cockpit existente**, com validação em tempo de execução no servidor; não lançar novo processo nem novo roteador.
3. Manter `SCRIPT_FIRST` como política do owner; `INTELLIGENCE` requer disparador e recepção autorizada.
4. Transportar para VPS **scripts/projetos existentes pelo SSH** após contra-prova, não copiar porta `8080`, nem servir `vite dev` na produção.
5. Testar fluxos determinísticos `recipe→executor→effect readback→typed receipt→Cockpit`; estado UNKNOWN caso ferramenta/token/ambiente não permitam medir.

Critério: `npm run dev` único em 8080, Vite HMR no mesmo processo, alterações de código gerando atualização visível, schema tipado compilando no adaptador, teste do Hermes, integração real com MCP/auth somente com receipt, build de produção e rollback antes de deploy VPS.

## 5. Veredito / próximo cursor

- **PASS:** Casa 8080 única instância do Vite; 8081 desligada; 3000 e 9101 preservadas; prova HTTP/cliente HMR; teste unitário de routing Hermes.
- **NOT_PROVEN:** recarregamento visual autenticado via navegador, Hermes `typed receipt` E2E, deploy VPS, OneShot↔MCP fechado, typecheck global.
- **NOOP deliberado:** não portar todo PR #1804 (CLOSED e divergente), não duplicar roteador, não publicar Vite dev na VPS, não matar quaisquer outros PIDs.
- **NEXT_CURSOR:** reconciliar contrato de receipt contra runtime/HUD da `main`, criar teste de integração pontual; quando verde, SSH direto para a VPS com recibo/rollback. Preservar trabalho paralelo de Claude/skills e árvore dirty; não usar reset/clean.
