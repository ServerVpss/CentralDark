# !CENTRALDARK :: NOUS FREE ONLY CHAIN — comando fixo para Hermes
# Criado 2026-08-31 22:03 (modelo z-ai/glm-5.2:free; host=CLAUDE_COWORK / Pivete)
# Autor operacional: HERMES-CASA (papel, nao identidade); writer: HERMES; observer: NEMOTRON
# Status: CRISTALIZADO — nao experimental; nao V2/V3; reusa router existente; nao paga; nao inventa schema

# PRÉ-CONDIÇÕES (medir antes de rodar):
- git rev-parse HEAD (repo E:/CentralDark/Pivete/CentralDark)
- gh auth status + remote origin/head
- router existente confirmado (scripts/launch_omni_router.py existe; nao criar segundo router)
- FABLE LOOP skill criado: .agents/skills/fable-loop/SKILL.md (hash 685db0384a)

INTENÇÃO:>
  Configurar dentro do router EXISTENTE (não novo) uma cadeia de failover
  exclusivamente de modelos FREE do Nous Portal, dinâmica, com refresh
  de catálogo vivo, e bloqueio absoluto de modelo pago ou preço desconhecido.

FREE_FILTER (rigoroso):
- provider: nous
- accept_when: live_input_price == 0 AND live_output_price == 0
- also: id termina com ":free"
- missing_price = SKIP; unavailable = SKIP; paid = BLOCKED

SEED_MODELS_OBSERVED (base viva, nao cristalizada eterna — pode mudar):
- nous/upstage/solar-pro4:free
- nous/tencent/hy3:free (era o atual quando trocou pra z-ai/glm-5.2:free; nao fixar)
- nous/stepfun/step-3.7-flash:free
- nous/inclusionai/ling-3.0-flash-fin:free
- nous/poolside/laguna-s-2.1:free
- nous/poolside/laguna-xs-2.1:free
- nous/meituan/longcat-2.0:free

MODE: FAILOVER_CHAIN (nao paralelismo concorrente de escrita)
- select: require_free=true; prefer_healthy=true; prefer_tools_when_needed=true
- on_success: stop (primeiro vivo ganha; nao rola todos)
- on_failure (RATE_LIMIT / TIMEOUT / TEMP_UNAVAILABLE / 5XX / MODEL_UNAVAIL): NEXT_FREE_MODEL
- AUTH_ERROR / CONFIG_ERROR: MARK_ROUTE_BROKEN + continue (nao parar o router)
- UNKNOWN (preço nao confirmado): RECORD + try next PROVEN_FREE only

RETRY / COOLDOWN:
- same_model_max: 1 (nao loop infinito)
- avoid_retry_loop: true
- cooldown_failed_model: true

DYNAMIC_REFRESH (obrigatorio — a cadeia nao é estática):
- refresh_catalog_on_startup: true
- refresh_on_model_failure: true
- remove_no_longer_free: true
- add_new_free_automatically: true
- Nunca cristalizar 7 nomes como lei permanente; o Portal muda pricing.

HARD_GATES (falha fechada — nao passa sem prova):
- paid_model_allowed: false
- unknown_price_allowed: false
- no_second_router: true (reusar existente)
- writer_per_scope: HERMES executor / NEMOTRON observer (nao dois editores no mesmo scope)

REALITY_JUDGE (contraprova obrigatoria):
- HERMES executa -> produz log/porta/health
- NEMOTRON mede independentemente (mesmo evento, outro caminho; nao repetir comando)
- Se divergir -> RECONCILE, nao PASS
- PASS apenas se executor + observer concordam com evidência (hash / curl / process / port)

TEST (prova antes de chamar FIXED_POINT):
- enumerate_free_models (vivo no Portal)
- prove_each_selected_price_is_zero
- send_controlled_request
- force_first_model_failure (simular rate limit)
- prove_fallback_to_second_free_model
- prove_no_paid_model_was_called
- print_sanitized_receipt (sem tokens / sem preço pago exposto)

INVARIANTS (sempre verdade nesta rota):
- NEVER_ROUTE_TO_PAID_MODEL
- UNKNOWN_PRICE_IS_NOT_FREE
- FREE_MODEL_LIST_IS_DYNAMIC
- PROVIDER_FAILURE_DOES_NOT_KILL_ROUTER
- REUSE_EXISTING_ROUTER (scripts/launch_omni_router.py, nao novo)
- ONE_WRITER_PER_SCOPE
- REALITY_IS_JUDGE

FIXED POINT (quando parar):
- Router vivo com cadeia NOUS FREE comprovada (curl/port/log + observer independente concorda)
- Nenhum modelo pago chamado (receipt sanitizado)
- MAIN HEAD do repo nao alterado por esta rota (nao é deploy, é configuração de roteamento)
- FABLE LOOP caracteriza: cada ciclo reduziu pelo menos 1 UNKNOWN; nao repetiu leitura consolidada sem input novo
- Se ainda há UNKNOWN (preço de algum modelo nao confirmado), nao PROMOTE — registrar e tentar proximo FREE confirmado

OUTPUT ESPERADO (o que entrega, nao o que finge):
FREE_MODELS: <lista viva do Portal no momento>
CHAIN_ORDER: <ordem de failover confirmada>
ACTIVE_MODEL: <qual está respondendo agora>
FALLBACK_TEST: PASS / FAIL (com prova)
PAID_CALLS: 0 (prova exigida; nao assumida)
UNKNOWN: <lista de modelos sem preço confirmado>
STATUS: FIXED_POINT | RECONCILE | BLOCKED

COMANDO PARA HERMES (executar quando autorizado, nao antes de medir):
> apurar router existente; confirmar scripts/launch_omni_router.py; 
> configurar failover somente dentro dele; 
> nao criar segundo router; 
> medir antes de cada ciclo (portas 8099/8788/3030, PID, health); 
> registrar delta num PR canônico (nao V2/V3); 
> escritor único = HERMES; observador = NEMOTRON; judge = REALITY_JUDGE.
