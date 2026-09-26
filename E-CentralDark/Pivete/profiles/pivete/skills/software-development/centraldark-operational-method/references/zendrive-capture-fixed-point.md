# Zendrive Capture to CentralDark Gateway — Fixed Point Pattern (2026-09-05)

## Trigger
User wants Zendrive (zendriver/elite-gateway) to capture GPT session (e.g. open "ZENDRIVE-CHAT GPT" or specific chat URL), output in **1 single local artifact**, integrate to API (elite-gateway/omni-router), and use immediately in the Hermes model (CENTRAL DARK GATEWAY / Arsenal Router Med selector).

## Simple Ready Workflow (no options, execute first)
1. Locate system yourself: `apps/modulos/elite-gateway/test-local/` (mock for test, real in scripts/).
2. Run the agent yourself:
   ```bash
   cd E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local
   python zendrive_mock_agent.py
   ```
   (For real: `python local_send_dump.py zendrive_specialized` after .venv setup.)
3. Verify single local output:
   - `logs/zendrive_capture.json` (preferred)
   - `logs/last_messages.json`
4. Confirm format (gateway_feed for CentralDark):
   - Must have `"transformed_for_cd": {"type": "gateway_feed", "target": "CentralDark via elite-gateway / omni-router"}`
5. Use in the model here:
   - In current Hermes chat, open model dropdown.
   - Select **CENTRAL DARK GATEWAY** or **Arsenal Router Med**.
   - Paste the full JSON or `assistant_response` to test the integrated capture.
6. Fixed point check (you execute):
   - File exists + valid JSON.
   - Format matches gateway_feed.
   - Can be used directly in selector without further steps.
   - Report: "Pronto. Rodei. Output em logs/zendrive_capture.json. Selecione CENTRAL DARK GATEWAY no dropdown e cole."

## Rules (embed user corrections)
- **Procure sozinho**: Use search/terminal to find zendrive, elite scripts, gateway selectors — do not ask user for location.
- **Você mesmo usa**: Run the python, cat the JSON, ls logs/, confirm via tool output.
- **Entregue logo pronto, sem opções**: Command + proven output + 1 file + exact UI action (dropdown select). No lists of alternatives, no long explanations unless asked.
- **Saída em 1 só local**: Reduce to one artifact ready for API (the zendrive_capture.json).
- **Integrado na API**: The artifact targets elite-gateway / omni-router. Use via the Hermes CENTRAL DARK GATEWAY selector as the "model".
- **Até ponto fixo**: Keep executing/verifying until artifact is usable in the selected gateway without further intervention.
- **Screenpipe for observation**: If UI confirmation needed (dropdown, open tab), query :3030 for the session (ZENDRIVE-CHAT GPT ID or terms).
- **Reuso**: Always extend existing (elite-gateway + PEGATUDO F4), no new system/V2.

## Pitfalls to avoid
- Giving options or "A or B?" when user wants direct.
- Verbose reports before the ready artifact.
- Assuming location — search first.
- Not verifying the file/output yourself before claiming "funcional".
- Forgetting the model selector direction in Hermes.

## Example Fixed Point Output
See conversation runs: mock produces valid gateway_feed JSON for session 20260905_010608_8c07f9, ready for selector paste.

## Related
- Main skill sections on "EXECUTE PRIMEIRO", "MENOR MOVIMENTO EFICAZ", "Saída em 1 só local".
- Other refs: zendrive-agent-integration.md, zendrive-mock-execution-pattern.md.

This pattern is now the canonical for Zendrive → CentralDark capture integration.