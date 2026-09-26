# Handoff Unificado + Escritor Único + Promoção de Commits no GitHub Oficial

## Sistema Canônico
O **sistema de handoff unificado** que garante continuidade e resulta em commits no GitHub oficial (ServerVpss/CentralDark) é a combinação de:

1. **Protocolo de Handoff IA (POMBO-CORREIO COM CHECKSUM)**
   - Owner: `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`
   - Transporta: CHEFE_INTENT + DESTINATION_LOCK + HEAD_SHA + OWNER + WRITER_SCOPE + STATE + EVIDENCE_REFS + UNKNOWNS + RESIDUAL + NEXT_CURSOR + receipt + checksum
   - Regras chave: DESTINATION_PRESERVED, UNKNOWN_PRESERVED, PROVENIENCIA_PRESERVED, ONE_SYSTEM_ONLY, REUSE_BEFORE_CREATE
   - Não cria owner/Writer paralelo; não redelibera decisões provadas sem nova evidência material.

2. **Escritor Único por Escopo**
   - Owner: `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
   - "um escritor por escopo"
   - Leitura/pesquisa/teste paralelas OK; mutação serializada.
   - Troca de writer **exige handoff explícito**.
   - SOL orquestra; Writer executa delta; SOL consolida.

3. **Autonomia Promoção (motor que escreve os commits)**
   - Workflow: `.github/workflows/autonomia-promocao.yml`
   - Script motor: `scripts/github-autonomia-promocao.mjs` (e green-guard, varredura)
   - Modos: FAST (intenção autorizada → squash main) ou ADVERSARIAL (opt-in)
   - Fail-closed: verifica workflows obrigatórios no mesmo HEAD, Trigger Fabric, labels, segurança, sem conflitos.
   - Doutrina: **GITHUB REGISTRA.**

## Fluxo Operacional
CHEFE → intenção → SOL recupera/meia estado → Writer (único) executa → prova → handoff (POMBO checksum) se necessário → Autonomia Promoção → squash/merge → commit no main oficial.

## Regras Críticas (AGENTS.md + SOUL)
- Troca de writer exige handoff.
- GITHUB REGISTRA.
- ONE_WRITER_PER_SCOPE.
- UNKNOWN != PASS; HISTORICAL != CURRENT; ACTION != PROOF.
- Intenção autorizada + clean → AUTO_SQUASH_IF_CLEAN (sem reask humano).

## Prova de Funcionamento
- Router 8099 + engine nous validado com chamadas reais (ex: nous/meituan/longcat-2.0:free responde OK).
- Key extraction de Windows Credential Manager (CredRead P/Invoke) → base64 → decode → test API (list models 200 OK).
- Status re-verificação após extração ("VERIFICA DE ENOVO").

## Comandos de Prova (router)
```bash
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nous/meituan/longcat-2.0:free","messages":[{"role":"user","content":"OK"}],"max_tokens":10}'
```

## Referências Canônicas
- `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
- `AGENTS.md` (doutrina + trabalho dos agentes)
- `.github/workflows/autonomia-promocao.yml`
- `scripts/github-autonomia-promocao.mjs`

Sempre medir HEAD/WRITER/estado vivo antes de handoff ou promoção.