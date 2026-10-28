# Receipt — X vermelho universal e sensores Casa (2026-10-28)

**Estado:** SOURCE_APPLIED / LOCAL_READBACK_PASS / VPS_BLOCKED
**Intenção CHEFE:** todos os pop-ups do mesmo tipo devem reutilizar o botão X vermelho no canto; mostrar estado vivo, ligar conexões corretas quando houver rota válida; delegar outra frente ao Hermes e verificar seu status.
**Skill-Mãe:** `.agents/skills/centraldark-operational-method/SKILL.md`.
**Owner de interface:** `apps/instinto-superior/src/components/ui/`.
**Owner de sensores:** `apps/instinto-superior/src/lib/cockpit.functions.ts`, UI `apps/instinto-superior/src/components/central/StatusPanel.tsx`.
**Owner de prova de engine:** `scripts/trigger-fabric/engine_gap_probe.py`.

## Delta útil aplicado

- `ui/popup-close-button.tsx`: botão único com ícone X, cor vermelha, canto superior direito, acessibilidade/foco; sem copiar a classe manualmente em cada popup.
- `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/drawer.tsx`: reutilizam `PopupCloseButton` com os respectivos `Close asChild`. Radix preserva teclado, foco e desmontagem.
- `central/PlayerLocalJarvis.tsx`: usa o mesmo componente e o callback original de fechar. Caixa cinza adicional já foi removida de `CockpitShell.tsx` na etapa anterior.
- `ui/alert-dialog.tsx`: **não recebeu fechamento implícito**; confirmação/cancelamento seguem controles específicos, evitando encerrar decisões sem aviso.
- `scripts/verify-popup-close.mjs`: 4 testes de regressão para aparência única, diálogo/gaveta e preservação de confirmação.
- `cockpit.functions.ts`: Casa/Site local usa porta real `8080` e variável opcional `CENTRALDARK_CASA_SITE_URL`, em vez de `4175` fixo; preserva API remota como alvo distinto.
- `StatusPanel.tsx`: exibe o binding real do sensor Casa/Site, sem nome fixo de porta obsoleta.
- `engine_gap_probe.py`: default de read-only health aponta para o Casa Commander `9101` (antigo `8099` indisponível), respeita `CENTRALDARK_ROUTER_HEALTH_URL`, anota identidade do serviço, `engine_connected` e resolve a raiz do Git pelo caminho do script.

## Leitura e contraprova no host Casa

| Fonte | Readback | Escopo real da prova |
| --- | --- | --- |
| `http://127.0.0.1:8080/` | HTTP 200 | Vite/Cockpit local disponível, não saúde da API nem execução de motor |
| `http://127.0.0.1:9101/health` | HTTP 200; `ok=true`; `engine_connected=true` | Casa Commander conectado na leitura; nova invocação de ferramenta não foi feita nesta rodada |
| `http://127.0.0.1:8099/health` | Sem listener | Default antigo obsoleto |
| `https://api.centralldark.com/health` | HTTP 523 | Origem HTTP pública indisponível; manter API/Grafo/Omni sem PASS |
| SSH VPS port 22 | Timeout, exit 255 | Sem caminho SSH para diagnosticar/reiniciar origem na rodada; não inferir host desligado |
| `node --test scripts/verify-popup-close.mjs` | 4 PASS, 0 FAIL | Contrato de reutilização em fonte |
| Vite módulos alterados | HTTP 200 | Transpilação dos módulos no dev server; não equivale a teste visual end-to-end |
| ESLint focado sem regra de CRLF histórica | 0 errors, 1 warning legado de hook de áudio | Alteração sem erro novo de lint detectado |
| `engine_gap_probe.py --self-test` | PASS | UNKNOWN não vira invocação comprovada |

## Delegação Hermes monitorada

- Gateway `hermes gateway status`: running PID `13668` na leitura.
- Sessão antiga informada `20260920_235705_013b82`: **não localizada no histórico da instalação local**; não houve injeção nessa sessão.
- Frente separada foi executada com `hermes --safe-mode --provider nous -m reflection/beam-1.0-501b-a23b:free --in K:\ -z ...`, **somente leitura**; saída final `HERMES_FRONT_EXIT=0`.
- Relatório da frente: Grafo/Omni/API referem a `api.centralldark.com` (HTTP 523), Commander Casa 9101 PASS, Screenpipe Casa 3030 degradado, Vite 8080 não oferece `/health`.
- Sem escritas ou reinícios solicitados à frente Hermes; os commits Git do Obsidian são um processo externo independente.

## Errata e continuidade: API nasce local (28/10/2026)

**Correção de entendimento:** a porta `8099` era *um Router local não iniciado*, não uma porta descartável. O seu owner é `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`; `9101` continua sendo o Casa Commander. A Casa não depende da origem pública HTTP 523 para construir, validar e consultar sua API. A VPS recebe o **mesmo código**, com binding e runtime próprios.

Foi criada uma `.venv` isolada no owner existente, usando `uv`, para contornar a distribuição Python global com FastAPI incompleto. Iniciado o Router somente em `127.0.0.1:8099`; GET de `/health`, `/api/omni/status`, `/api/omni/models`, `/api/live-fabric/status`, `/api/live-fabric/graph`, `/api/microdeploy/receipts/index.json` e `/heartbeat` responderam **HTTP 200** após restart controlado do mesmo owner. Grafo derivado de 24 receipts reais, com `proof_state=NOT_REVALIDATED`, sem alegação de execução de agentes. O probe volta a usar seu alvo canônico `8099`, sem confundir o health do Commander; o Cockpit troca o default público por loopback local e preserva `CENTRALDARK_API_BASE_URL` opcional.

**Ainda não provado:** inicialização automática pós-reboot; deploy VPS e exposição Caddy; E2E do Cockpit em navegador; execução de provedor/LLM. A instância local deve manter o Router ativo para fornecer status a partir da Casa.

## Limites

`HTTP_200 != END_TO_END_PROOF`. `ENGINE_CONNECTED_TRUE != PROVIDER_INVOCATION_PASS`. `PUBLIC_API_523 != CASA_COMMANDER_DOWN`. `SSH_TIMEOUT != PROOF_VPS_OFF`.

**NEXT_CURSOR:** `UNIVERSAL_RED_CLOSE_SOURCE_PASS; CASA_SITE_BINDING_8080_MEASURED; CASA_COMMANDER_ENGINE_CONNECTED; VPS_ORIGIN_HTTP_523; SSH_ROUTE_BLOCKED; REPLAY_REMOTE_WHEN_ROUTE_PROVEN`.

Quando houver rota VPS, localizar o **owner existente do serviço da API** e verificar origem/proxy, sem desviar `/api/omni` ou `/api/live-fabric` para o Casa Commander, pois são contratos diferentes.
