# Pitfalls cristalizados — sessão 2026-08-27

Aprendizado de classe extraído da sessão (Pivete/Hermes + Claude-VPS). Não é narrativa de tarefa, é regra dura de operação.

## 1. Imagem não processa no chat → ler por PATH, não esperar API

Quando o chat devolve "API Error: an image could not be processed", NÃO diga "não consegui ver" e pare.
O arquivo many vezes caiu no disco em `E:/CentralDark/Pivete/images/clip_*.png` (ou temp).
Ação: `vision_analyze(image_url="E:/.../clip_NNN.png", question=...)`.

Pitfall repetido nesta sessão: esperei a API de chat 3x antes de ir no disco. Corrigido depois que o CHEFE cobrou.

## 2. Secrets em pedaços de script → IGNORAR, não repetir, não rodar

Se o usuário cola fragmentos de Python/typescript com `import` + `"CONTABO_CLIENT_ID"`, `"CONTABO_CLIENT_SECRET"`, `"CONTABO_API_USER"`, `"CONTABO_API_PASSWORD"`, `"CLOUDFLARE_API_TOKEN"` etc:
- NÃO leia o valor
- NÃO repita o nome do secret no output
- NÃO rode o script (mesmo incompleto)
- Se for pra VPS, o braço VPS (Claude) executa quando voltar — sem expor aqui

Regra do SOUL: NEVER pedir/expor `.env`, tokens, senhas, cookies, credenciais, chave SSH privada.

## 3. `pm2 restart all` DESTRÓI produção — parar processo específico

`pm2 restart all` na VPS religa serviço parado por política (WebhookDeploy 9300) e amplifica crash-loop existente via watchdog (HermesVerificador revivendo o que tu parou).
Resultado real desta sessão: 5+ serviços em crash-loop (MCP EADDRINUSE 9100 por TDZ, ArsenalProxy 5582, EliteHTTP 5352...).

Regra:
- Nunca `pm2 restart all`
- Parar 1 processo só: `pm2 stop <nome>`
- Se quiser destravar tudo: terminar o rebase/reconciliar PRIMEIRO, não restartar por cima de árvore em conflito
- Watchdog automático (HermesVerificador) brigará com teu stop → parar o watchdog também se precisar manter parado

## 4. `mergeable: true` ≠ seguiu a intenção

PR #1172 era mergeable (git ok) mas violou:
- F1: colidiu sem reconciliar com #1166-#1170 (6º competidor no mesmo núcleo TRIGGERS.yml/ENGINE_BINDING.yml/GraphRAG-Master/agent.mjs)
- F2: criou mecanismo novo (MASTER-CYCLE.yml + centraldark_master_cycle.py) em vez de reusar trigger-fabric existente
- F3: dono duplicado (pasta APRENDIZADOS/ vs arquivo APRENDIZADOS.md único) — viola ONE_OWNER_PER_CAPABILITY + issue #722

Raiz: `mandatory_pre_solution_sequence` (passos 3/5/9/10) não rodou.
Lição: intenção do CHEFE > mergeable do GitHub. Ter a lei na main ≠ gate que bloqueia.

## 5. `permito` NÃO reescreve lei canônica

"permito restart all pm2" não anula a regra "Nunca pm2 restart all" já registrada (MCP CentralDark + skill centraldark-esteira-motor).
Se "permito" sempre valesse, a regra não existiria.
Autoridade (CHEFE) manda intenção, mas lei canônica só muda por escrito (PR no contrato), não por grito pontual.

## 6. Medir antes de afirmar (sempre)

"acho/parace/provavelmente/já estava/foi feito" não substituem medição.
VPS = UNKNOWN se não alcançável (MCP 502, SSH timeout). Não declaro PASS/FIXED_POINT com UNKNOWN material.
Hermes da Casa NÃO alcança VPS — quem mede lá é o braço VPS (Claude). Não finja que executou.
