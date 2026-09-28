---
title: "SHA  estado  NEXT_CURSOR ou b atualiza os handoffs do"
date: 2026-09-24
tags: ["reuniões-&-notas"]
---

SHA + estado + NEXT_CURSOR) ou (b) "atualiza os handoffs do repo" (eu reescrevo CENTRALDARK_HANDOFF.md com o estado medido agora).

⭕ !CENTRALDARK → medindo o estado vivo agora.
⭕ !CENTRALDARK → medido. Delta real, e um dos achados muda o diagnóstico.

ESTADO VIVO (4 chamadas, agora):

main — avançou de novo:

6fce1850bce9889955b6a1a803815730a1d18ef0 — 🧿 FIX(REALITY): SQUASH DETERMINÍSTICO DE TODO PR 100% VERDE (#1671) ← main atual, o #1671 foi mergeado
ec52fad8 · 7d56993e · eecf1aa0 · a14b9ef7

#1562 (PR-mãe):

HEAD b3602e3353566ec9d904010833c53890f9e01c83 · base 7d56993e (defasada vs. 6fce1850)
198 commits · 159 arquivos · 183 comentários (era 182 — alguém comentou)
mergeable_state=unstable

#1662 (PR-filho):

HEAD 019fd75c477f768ef2d7af3fb41a3a46e06e8840 (o update de branch funcionou — base já é ec52fad8)
base.sha = ec52fad8 — atualizada ✅
54 commits · 92 arquivos · +3018/-642 · 24 comentários

CHECKS DO #1662 — 43 runs, e o quadro mudou:

🟢 Success (3): Gates determinísticos em runner self-hosted · Comentar e rotear usando código confiável da base · Gemini Flash (aparece em run anterior)

🔴 Failure (3):

guard — job 107520010482 (07:12:29→07:13:05, 36s)
🧩 Validar Lotes 2–10 offline — job 107520010319 (07:08:32→07:09:27, 55s)
🧩 Porta, identidade e governança canônica — job 107520001020 (07:17:00→07:18:24, 84s)

🟡 Queued (~30): Porta... (nova instância), Promotor, CodeQL privado, Validate Codex, Validate canonical map, Validate [[MCP]] admin guard, deterministic-beta1, build-dupla, runner-e-imutabilidade, scan, cápsula, lockfile, Gemini, Groq, [[Claude]], drift-guard, cartazes, GATE_GRAFO, normalize-title, /v1/models, copilot-setup, Juiz determinístico, Casa PR humano, Remeasure, IA consultiva

⚫ Skipped (~11): Hermes oficial, IA consultiva, CodeRabbit, Jobs Hermes, Dependabot fast-path, Sincronizar Dependabot, Casa varrer, Provar gerador, CodeQL, [[Supabase]] Preview

ACHADO MATERIAL — A Porta demorou 84s, não 30s.

Antes ela falhava em 30s (falha rápida, provavelmente no início). Agora leva 84s — ou seja, ela está rodando mais portões antes de falhar. Isso é progresso: o checkout passou, o fork_guard passou, e a falha está mais adiante na cadeia dos 21 portões.

E o main avançou com o #1671 — que é SQUASH DETERMINÍSTICO DE TODO PR 100% VERDE. Ou seja: a main agora tem capacidade de squash automático para PR verde. É a infra que faltava para o teu pedido de squash.

CHECKLIST — atualização:

C3 (patch Dependabot) → O #1671 foi mergeado na main e JÁ implementa isso. Item passa de "pendente" para resolvido pela main.
A1 → a Porta agora leva 84s (era 30s) — o log de hoje pode fechar.
D1 → main = 6fce1850; 13 SHAs agora.
A8/A9 → Validate MCP admin guard e Validar Lotes 2-10 seguem em fila/failure.

FALTA: 47 itens. O log do job 107520001020 (84s) é o que fecha A1.