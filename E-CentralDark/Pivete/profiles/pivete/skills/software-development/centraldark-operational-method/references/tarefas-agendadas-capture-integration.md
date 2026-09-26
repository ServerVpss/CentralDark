# Tarefas Agendadas / ChatGPT Scheduled Capture Integration (2026-09-05)

## Input Example (from screenshot)
- Page: chatgpt.com/scheduled
- Highlighted prompt: "Em poucas palavras, me ensine a usar o ChatGPT para traduzir voz e fotos durante a viagem. Depois, me ajude a traduzir a foto de um cardápio e a praticar como perguntar se um prato contém amendoim."
- Scheduled CentralDark monitors:
  - CentralDark - Realidade Viva (Monitoramento, next ~25min)
  - Contraprova green-first #1377 (Monitoramento)
  - Vigiar CentralDark Vivo (Monitoramento, next ~6min)
  - Acompanhar gates PR #1189 (Monitoramento, next ~45min)
  - Screenpipe Hermes Watch (Monitoramento, next ~21h)
- Recommended: CentralDark work alerts, Agent reliability research, Second Brain consolidation.

## Protocol (see SKILL.md section "EXTERNAL SCHEDULED CAPTURE & GOAL INTEGRATION")
1. Search repo for "Tarefas agendadas.html" or exact task names first (0 matches in this session → new matter).
2. Extract literally.
3. Transform to gateway_feed / PEGATUDO:
   {
     "timestamp": "...",
     "session_id": "chatgpt-scheduled-YYYYMMDD",
     "source": "CHATGPT SCHEDULED / Tarefas Agendadas",
     "user_prompt": "<extracted or summary>",
     "assistant_response": "Summary of monitors + links to Vigiar/Screenpipe/gates PR #1189/Realidade Viva",
     "transformed_for_cd": {
       "type": "gateway_feed",
       "target": "CentralDark via elite-gateway / omni-router",
       "format": "PEGATUDO compatible receipt"
     }
   }
4. Test goals: current (reanchor, Zendrive capture, runtime "NENHUMA" pendencias, vigiar, gates) → link → activate best linked ("Runtime + External Capture for execution pendencias").
5. Integrate: absorb to elite-gateway + centraldark-operational-method + update PENDENCIAS if runtime-related.
6. After init: use short "!CENTRALDARK continua." 
7. Reanchor with AURÉOLA every continuation.

## Links to Existing
- Vigiar CentralDark Vivo
- Screenpipe Hermes Watch
- Acompanhar gates PR #1189
- CentralDark - Realidade Viva
- Contraprova workflows
- Zendrive capture (same format)

## User Preference Embedded
- Search first ("PROCUIRE POR ISSO AI!")
- /GOAL E INTENGRA (link + activate better)
- Ultra-concise report (list monitors → capture JSON → link)
- No repeat full process after one init

## Example Output (for gateway)
See zendrive_capture.json pattern. Use for future scheduled inputs. Absorb only proven deltas. REALITY=JUDGE on monitor status.

## Pitfalls
- Do not treat as isolated; always class-level capture.
- Do not create parallel monitoring system (ONE_SYSTEM_ONLY).
- Confirm runtime measurement (these scheduled are external observers for "NENHUMA" pendencias).