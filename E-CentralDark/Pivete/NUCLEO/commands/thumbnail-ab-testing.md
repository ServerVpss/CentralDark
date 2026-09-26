# COMANDO - thumbnail-ab-testing.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\thumbnail-ab-testing.md
**SHA:** c7587941905dc333
**Timestamp:** 2026-08-28T13:25:12.639707
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- **Core Principle:** "The thumbnail you think will win almost never does. Test everything."

### Ouro Bruto (primeiros 5000 chars)
```
# Structure A/B Tests for Thumbnail Optimization

> Task ID: paddy-thumbnail-ab-testing
> Agent: Paddy Galloway (YouTube Thumbnail Strategist)
> Version: 1.0.0

## Description

Create a rigorous A/B testing plan for YouTube thumbnails using Paddy Galloway's ABC Testing Framework (Always Be Comparing). This task structures the testing protocol, monitoring cadence, swap triggers, and documentation requirements.

**Core Principle:** "The thumbnail you think will win almost never does. Test everything."

## Prerequisites

- Thumbnail concepts generated (minimum 5, ideal 10-20)
- Access to YouTube Studio analytics
- Understanding of niche CTR benchmarks
- Variants ready for quick swap (pre-uploaded if possible)

## Workflow

### Interactive Elicitation

1. **Gather Test Context**
   - How many thumbnail variants are ready to test?
   - What is your niche's average CTR? (use benchmarks if unknown)
   - What time/day are you publishing?
   - Is this a high-stakes video (product launch, milestone)?

2. **Define Success Metrics**
   - Target CTR for this video
   - Minimum acceptable CTR (swap trigger)
   - Secondary metrics to monitor (AVD, impressions)

3. **Confirm Monitoring Availability**
   - Can you check analytics every 30-60 min for first 4 hours?
   - Who will execute the swap if needed?

### Steps

1. **Validate Variant Diversity**

   **ABC Philosophy:**
   - A - Always have alternatives ready
   - B - Be prepared to swap rapidly
   - C - Comparing data, not opinions

   **Diversity Check:**
   - [ ] Variants are DRASTICALLY different (not subtle tweaks)
   - [ ] At least 2 different emotions represented
   - [ ] At least 1 with face, 1 without face
   - [ ] At least 1 with text, 1 without text
   - [ ] Color schemes vary significantly

   **What to Vary (Good):**
   - Angle/perspective
   - Primary emotion
   - Text presence/absence
   - Face presence/absence
   - Color scheme
   - Composition (close vs wide)
   - Curiosity element

   **What NOT to Vary Alone (Bad):**
   - Button color
   - Font choice (same text)
   - Subtle position changes
   - Saturation/brightness only

   - Validation: Variants pass diversity check

2. **Establish CTR Benchmarks**

   **Niche Benchmarks (Reference):**

   | Niche | Average CTR | Good CTR | Excellent CTR |
   |-------|-------------|----------|---------------|
   | Entertainment | 8-12% | 12-15% | 15%+ |
   | Educational | 5-8% | 8-12% | 12%+ |
   | Tech Review | 4-6% | 6-10% | 10%+ |
   | Vlog | 3-5% | 5-8% | 8%+ |
   | How-to | 4-7% | 7-10% | 10%+ |

   - Define: Target CTR = [niche good + 20%]
   - Define: Alarm CTR = [niche average - 20%]
   - Define: Swap Trigger = [below alarm for 2h]

   - Validation: Benchmarks documented

3. **Create Test Sequence**

   **Ranking Criteria:**
   - Glance Test scores
   - Internal feedback preference
   - Gut check (tie-breaker only)

   **Test Sequence Template:**
   ```
   INITIAL: [Variant A] - Highest Glance Test score
   BACKUP 1: [Variant B] - Different emotion than A
   BACKUP 2: [Variant C] - Different format (text/no-text swap)
   BACKUP 3: [Variant D] - Radical alternative
   ```

   - Validation: Sequence of 4+ variants documented

4. **Define Monitoring Protocol**

   **Phase 1: Launch (0-2h)**
   - Check every 30 minutes
   - Record: CTR, impressions, views
   - Note: CTR trend (rising/falling/stable)
   - Decision point at 2h mark

   **Phase 2: Early Decision (2-4h)**
   - Check every 60 minutes
   - Compare CTR to benchmark
   - Execute swap if below alarm
   - Document reason for swap

   **Phase 3: Settling (4-24h)**
   - Check every 2-4 hours
   - CTR typically stabilizes
   - Final swap opportunity
   - Document performance

   **Phase 4: Analysis (24-48h)**
   - Compare all tested variants
   - Document learnings
   - Archive for future reference

   - Validation: Monitoring schedule confirmed

5. **Define Swap Triggers**

   **Automatic Swap Triggers:**

   | Condition | Action |
   |-----------|--------|
   | CTR < Alarm for 2h | Swap to Backup 1 |
   | CTR declining >20% | Swap to Backup 1 |
   | Impressions stalled | Check title, then swap |
   | All variants <Alarm | Investigate title |

   **Manual Swap Triggers:**
   - Significant negative comments about thumbnail
   - Thumbnail displays incorrectly on mobile
   - Technical issues (cropping, resolution)

   **DO NOT Swap Based On:**
   - Personal preference
   - Single negative comment
   - Less than 1h of data
   - "Feeling" without data

   - Validation: Triggers documented

6. **Create Documentation Template**

   **Test Log Template:**
   ```
   VIDEO: [Title]
   PUBLISH DATE: [Date/Time]
   NICHE: [Category]
   TARGET CTR: [X%]
   ALARM CTR: [Y%]

   VARIANTS:
   - A (Initial): [Description]
   - B (Backup 1): [Description]
   - C (Backup 2): [Description]
   - D (Backup 3): [Description]

   TIMELINE:
   | Time | Variant | CTR | Impressions | Notes |
   |------|---------|-----|-------------|-------|
   | 0h   | A       | -   | -           | 
```