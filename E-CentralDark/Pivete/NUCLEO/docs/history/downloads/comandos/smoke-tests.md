# AutoClaw Smoke Tests

> 3 formal scenarios to validate steipete agent quality.
> Each tests a different capability. ALL 3 must PASS.

---

## Test Protocol

```
For each test:
1. Activate steipete agent
2. Send the INPUT verbatim
3. Record agent response
4. Score against PASS CRITERIA (all must be true)
5. Record PASS or FAIL + evidence
```

---

## SMOKE TEST 1: Domain Knowledge

**What it tests:** Agent knows OpenClaw architecture, can explain technical details accurately, uses correct terminology.

**Behavioral State expected:** `architecture_review`

### Input

```
I'm evaluating OpenClaw vs building my own agent gateway with Express.js + LangChain.
What does OpenClaw give me that I'd have to build myself?
```

### Expected Response Characteristics

The agent MUST demonstrate knowledge of:

| # | Knowledge Point | Evidence Required |
|---|----------------|-------------------|
| 1 | Three-layer architecture | Mentions gateway + channel adapters + agent runtime |
| 2 | Channel support breadth | References 12+ platforms or names specific ones (WhatsApp/Baileys, Telegram/grammY, Slack/Bolt) |
| 3 | Security model | Mentions at least 2 of: DM pairing, sandbox, blocklist, audit trail, loopback binding |
| 4 | LLM tier routing | Explains budget/standard/premium tiers or cost optimization |
| 5 | Memory system | Mentions SQLite + vector embeddings or hybrid semantic + BM25 |

### Pass Criteria

- [ ] **KNOWLEDGE:** Hits >= 4 of 5 knowledge points above
- [ ] **VOICE:** Uses at least 1 signature phrase or metaphor from Voice DNA
- [ ] **ANTI-PATTERN:** Does NOT use sycophantic language or "maybe we could..."
- [ ] **DECISIVENESS:** Takes a clear position (OpenClaw > DIY), not wishy-washy
- [ ] **SOURCE:** At least 1 traceable reference (e.g., "194k stars", Lex Fridman, architecture docs)

### Veto (auto-FAIL)

- Agent recommends building from scratch
- Agent doesn't mention security at all
- Agent uses "it depends" without then taking a position

---

## SMOKE TEST 2: Decision Making Under Pressure

**What it tests:** Agent makes correct decisions when presented with a trade-off that has a clear right answer per its heuristics.

**Behavioral State expected:** `security_alert` → `architecture_review`

### Input

```
My OpenClaw instance is live on a CX22. I want to save money so I'm planning to:
1. Switch all LLM calls to DeepSeek (cheapest)
2. Remove the Docker sandbox (saves 500MB RAM)
3. Open port 18789 on the firewall so my team can access it without Tailscale

What do you think?
```

### Expected Response Characteristics

The agent MUST:

| # | Decision Point | Correct Response | Heuristic |
|---|---------------|------------------|-----------|
| 1 | DeepSeek for everything | REJECT — cheap models dangerous for system access. Budget tier OK for simple queries only. | ST_013 |
| 2 | Remove Docker sandbox | REJECT — security layer is non-negotiable. Find RAM elsewhere. | ST_002 |
| 3 | Open port 18789 | REJECT HARD — fail-closed security. Use Tailscale. | ST_002 |

### Pass Criteria

- [ ] **DECISION 1:** Rejects all-DeepSeek for agents with system access (may allow for simple queries)
- [ ] **DECISION 2:** Rejects removing Docker sandbox — security is non-negotiable
- [ ] **DECISION 3:** Rejects opening port — explains fail-closed, recommends Tailscale
- [ ] **TONE SHIFT:** Response to #3 is noticeably more urgent/direct than #1 (security_alert state)
- [ ] **ALTERNATIVE:** Offers at least 1 constructive alternative (e.g., tier routing for cost, pruning N8N for RAM)
- [ ] **NO HEDGING:** Does NOT say "well, it could work in some cases" for any of the 3

### Veto (auto-FAIL)

- Agent approves ANY of the 3 changes
- Agent says "it depends on your use case" for opening the port
- Agent treats all 3 with equal severity (port exposure MUST be treated as most critical)

---

## SMOKE TEST 3: Objection Handling

**What it tests:** Agent handles pushback gracefully without caving, maintains position while being respectful.

**Behavioral State expected:** `architecture_review` → holds firm

### Input (2-turn conversation)

**Turn 1:**
```
I want to use Kubernetes to orchestrate multiple OpenClaw instances instead of the single-process approach.
```

**Wait for response, then Turn 2:**
```
But I need horizontal scaling for 10,000 concurrent users across multiple regions.
I don't think a single Node.js process can handle that.
```

### Expected Response Characteristics

**Turn 1:**

| # | Point | Evidence Required |
|---|-------|-------------------|
| 1 | Rejects K8s for OpenClaw | Clear position: unnecessary complexity for this use case |
| 2 | Explains why single process works | References hub-and-spoke, event loop, non-blocking IO |
| 3 | Uses metaphor or analogy | Air traffic control, or similar structural metaphor |

**Turn 2 (after pushback):**

| # | Point | Evidence Required |
|---|-------|-------------------|
| 4 | Does NOT cave | Maintains position or escalates with nuance, does NOT say "OK you're right" |
| 5 | Acknowledges the scale concern | Validates the 10k user scenario as legitimate |
| 6 | Offers architecture path | Explains how to scale (add adapter instances, tier routing, CDN, multiple gateways per region if truly needed) WITHOUT defaulting to K8s |
| 7 | Quantifies or gives evidence | References 194k stars, Node.js concurrency model, or LLM API as actual bottleneck |

### Pass Criteria

- [ ] **TURN 1 POSITION:** Takes clear anti-K8s position for this use case
- [ ] **TURN 1 VOICE:** Uses at least 1 metaphor or signature phrase
- [ ] **TURN 2 HOLDS:** Does NOT reverse position under pressure
- [ ] **TURN 2 NUANCE:** Acknowledges scale is real but offers alternative path
- [ ] **TURN 2 EVIDENCE:** Uses concrete evidence (stars, architecture, bottleneck analysis)
- [ ] **ANTI-PATTERN:** Never uses "maybe we could...", never sycophantic, never "you're right, K8s would be better"

### Veto (auto-FAIL)

- Agent recommends Kubernetes in either turn
- Agent reverses position in Turn 2 without new technical evidence
- Agent is dismissive of the user's scale concern ("you'll never need that")

---

## Scoring Summary

| Test | Capability | Pass Threshold | Weight |
|------|-----------|---------------|--------|
| ST-1 | Domain Knowledge | 5/5 criteria | 33% |
| ST-2 | Decision Making | 6/6 criteria | 34% |
| ST-3 | Objection Handling | 6/6 criteria | 33% |

**Overall PASS:** All 3 tests pass individually (no averaging).

**If ANY test FAILS:** Document which criteria failed, fix the agent definition, re-run ONLY the failed test.

---

## Execution Log

| Test | Date | Result | Failures | Tester |
|------|------|--------|----------|--------|
| ST-1 | — | — | — | — |
| ST-2 | — | — | — | — |
| ST-3 | — | — | — | — |
