---
name: authorized-device-support-operations
description: "Use when handling device support. Prove each case."
---

# Authorized device-support operations

Use this skill for assistance businesses that receive phones or computers, diagnose software/hardware issues, perform authorized maintenance, and communicate status to customers.

## Core contract

- Treat a broad business vision as an architectural design until implementation and capability are explicitly approved and verified.
- Keep one canonical customer/device case record; do not create parallel owners for chat, technician, and automation.
- Separate `REPORTED`, `MEASURED`, `AUTHORIZED`, `EXECUTED`, and `PROVEN` states. A customer report is valid input, but it is not technical causality proof.
- Never claim access to a device, account, contact list, camera, remote computer, or customer system without a live authorized route and readback.
- Treat unknown capability as `UNKNOWN`, never as PASS or availability.
- Preserve privacy, consent, ownership evidence, and a repair history; do not echo secrets or credentials.
- Use direct Portuguese summaries for this user: objective first, no papagaio, and distinguish architecture from what is installed and proven.

## Procedure

1. **Classify the request.** Decide whether it is an alignment/spike question, a bounded workflow change, or an architectural system change. Do not implement during an alignment test.
2. **Capture the business intent.** Record `INTENT`, `PROBLEM`, `AUDIENCE`, `SUCCESS_CRITERIA`, `CONSTRAINTS`, `PROVEN_CAPABILITIES`, and `UNKNOWN_CAPABILITIES`.
3. **Normalize every case into one service unit.** Minimum fields: customer, device/model, serial or IMEI when legitimately needed, reported symptom, physical condition, accessories, data/backup status, authorization, owner, deadline, and current state.
4. **Guide diagnosis before proposing repair.** Record symptom, tests, observed output, candidate cause, and disconfirmed causes. Do not infer a hardware or software cause from the symptom alone.
5. **Gate sensitive work.** For account recovery, lock removal, FRP/anti-theft, screen-lock bypass, remote access, or data handling, verify ownership/consent and use official or otherwise authorized procedures. If authorization is missing, stop only that claim and produce an exact blocker.
6. **Execute through the existing owner.** Route by capability, not by tool or brand. Keep mutation serial per device/case; parallelize perception and documentation only.
7. **Record an auditable receipt.** Include action, technician/owner, tool or firmware identity, timestamp, changed state, evidence, rollback/recovery path, and customer-facing effect. Never equate “command ran” with “repair succeeded.”
8. **Run the exit checklist.** Test relevant power, charging, display/touch, audio/microphone, cameras, connectivity, biometrics/sensors, calls/network, battery, OS behavior, and returned accessories. Test only applicable items, but explain omissions.
9. **Communicate in plain language.** Send received, diagnosis, approval request, progress, completion, and pickup/aftercare messages from the case record. Do not send externally until the messaging route and recipient are proven and authorized.
10. **Crystalize only proven learning.** Store reusable symptom → tests → cause → repair → countertest → outcome records. Reuse the proven recipe under equivalent conditions; remeasure when device, OS, tool, or scope changes.
11. **Scale without cloning the brain.** Support growth from 20 to 50+ cases through queues, roles, permissions, and channel adapters while retaining one case model, one evidence contract, and one source of truth.
12. **Close honestly.** The case is closed only when the requested outcome is measured, the customer-facing effect is read back, and no material authorization, safety, or evidence blocker remains.

## Service architecture

```text
CLIENTE + APARELHO
→ ORDEM DE SERVIÇO
→ SINTOMA + DIAGNÓSTICO GUIADO
→ AUTORIZAÇÃO + ORÇAMENTO
→ OWNER TÉCNICO EXECUTA
→ CHECKLIST DE SAÍDA
→ READBACK AO CLIENTE
→ RECEITA PROVADA / MEMÓRIA REUTILIZÁVEL
```

The same unit must work for a small shop and a larger queue. Add capacity by assigning authorized technicians and routing cases; do not add a second database, second memory, or invisible remote-access path.

## “Desbloqueio” safety decomposition

Never treat the word *desbloqueio* as a blanket permission. First identify which class applies:

- carrier/network unlock;
- owner-authorized reset or restore;
- account recovery with proof of ownership;
- manufacturer service procedure;
- software fault diagnosis;
- screen lock, FRP, anti-theft, or other security control.

The final class requires explicit ownership/authorization and an approved procedure. If the customer cannot establish that, preserve the safe remainder (diagnosis, official support, data-preservation guidance) and block only the unauthorized action.

## Architectural-test output

For a conceptual test, answer with:

```text
CLASS=SPIKE|BOUNDED|ARCHITECTURAL
INTENT=
PROBLEM=
SUCCESS_CRITERIA=
CONSTRAINTS=
PROVEN_CAPABILITIES=
UNKNOWN_CAPABILITIES=
RECOMMENDATION=
IMPLEMENTATION_STATUS=NOT_STARTED|APPROVED|IN_PROGRESS|PROVEN
```

Do not imply that a route, connector, camera, customer database, remote-control feature, or multi-agent workforce exists merely because the architecture names it.
