# Aprendizado operacional aprovado — 2026-10-19

O CHEFE aprovou o método de trabalho iterativo da CentralDark: intenção exata → medir → reutilizar owner → menor edição → testar → corrigir → contraprovar → registrar → sincronizar Casa e main. Dentro do escopo autorizado, os agentes não devem interromper o CHEFE a cada microcorreção. Alterações de escopo ou destrutivas exigem autorização própria.

## Critérios de entrega
- **COMMIT LOCAL CONFIRMADO** somente com commit e readback na Casa.
- **COMMIT NA MAIN CONFIRMADO** somente com commit publicado e readback no GitHub.
- Se a alteração afetar o design, abrir o setor modificado e conferir a interface ao vivo; HTTP 200 sozinho não comprova renderização.
- Se qualquer prova faltar, apresentar pendência real; não inventar verde.
- Preservar trabalho de outros agentes e sincronizar sem force push ou reset destrutivo.
- Usar PR somente por decisão do CHEFE ou exigência técnica de revisão.
- Michelin: construir, integrar, provar. K: patrimônio; F: transitório; C: compatibilidade.
- Um Claude oficial, um Hermes original, uma CentralDark.

## Conformidade
O CHEFE declarou 100% de conformidade com sua intenção na experiência de colaboração e mapeamento de 19/10/2026. Isso não comprova 100% de conformidade técnica global. A melhoria observada foi a facilidade de acompanhar resultados sem supervisionar cada microedição. Esse princípio pode beneficiar outras pessoas que prefiram fluxos simples, sem pressupor adequação universal.

## 🌟 !MICHELIN — integração no mesmo Loop Mestre (2026-10-21)

@last_updated: 2026-10-22T00:31:00.000Z
@code_ref: scripts/trigger-fabric/centraldark_master_cycle.py
@code_ref: scripts/trigger-fabric/test_centraldark_master_cycle.py
@code_ref: docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json

**CHEFE:** usar o gatilho `🌟 !MICHELIN` nas próximas etapas da `⭕ !AURÉOLA CANÔNICA`, ligando-o ao `!CENTRALDARK` já existente e mostrando somente setas com `!` ou `#`. O novo gatilho não cria scheduler, executor, workflow, segundo router nem três estrelas automáticas.

**Owner de qualidade já existente:** `RULES.md` (M — Michelin). **Owner do caminho:** `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`. **Resolver:** `scripts/trigger-fabric/centraldark_master_cycle.py`.

**Rota:** `!CENTRALDARK → #ACORDAR → !CALIBRAR → !CONTRAPROVA → 🌟 !MICHELIN → !FIXED_POINT → !REGISTRA → !RASTRO`. Os gatilhos executados são selecionados por pertinência; a linha indica vínculo, não claim de execução efetiva em todos os ambientes.

**Estrelas:** 🌟 fonte/testes/lint/build/auth; 🌟🌟 CI concluída + integração no mesmo SHA; 🌟🌟🌟 deploy + visual autenticado + Casa/VPS + logs com recibos no mesmo SHA. `QUEUED/SKIPPED/SMOKE_PUBLIC/SCREENSHOT != PROOF`. O mero acionamento de `!MICHELIN` retorna `UNKNOWN` e zero estrelas atribuídas até observação/contraprova concreta.

**Fronteira:** somente candidato de código e contrato em PR até `CI_SAME_HEAD`, sem deploy ou promoção silenciosa.
