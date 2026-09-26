# COMANDO - single-click-summaries-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\docs\single-click-summaries-spec.md
**SHA:** a65588a73cb1bc5a
**Timestamp:** 2026-08-23T14:17:12.423357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- → Frontend builds prompt: system context + template prompt + time filter

### Riscos
- - **Hallucination risk:** PI agent might fabricate activities not in the data. Templates should include: "Only report activities you can verify from the recordings. If uncertain, say so."

### Ouro Bruto (primeiros 5000 chars)
```
# Single-Click Summaries — Product Spec

<!-- doc-covers: apps/screenpipe-app-tauri/components/chat -->
<!-- doc-verified: 3606788c6 -->
> **Historical.** Last verified against 3606788c6 (2026-02-19). `apps/screenpipe-app-tauri/components/chat` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

**Author:** Louis / Menelaus (znitchi)
**Date:** Feb 19, 2026
**Status:** Draft

---

## Problem

Screenpipe records everything you see, say, and hear — but most users never ask the AI anything meaningful. The current empty chat state shows a few auto-suggestions ("What did I do in the last hour?"), but they're small, text-only, and easy to ignore. Users who don't know what to ask just stare at the input box and leave.

**Evidence:**
- Auto-suggestions exist (via `suggestions.rs`) but are small text buttons at the bottom of the empty chat
- The PI agent is powerful but requires users to formulate their own prompts
- Daily Summary exists but is limited to timeline view, auto-triggers only at 6 PM, and only covers audio transcriptions
- Menelaus (power user): "A lot of users might not know what to ask but having these auto-suggestions and one-click prompts makes everything a lot easier"

**Core tension:** Screenpipe collects 2K-13K+ memories per day, but the value is locked behind a blank text box.

---

## Solution

**"Single-Click Summaries"** — a prompt template library and visual builder that makes screenpipe's value immediately obvious. Instead of a blank chat, users see curated one-click actions that generate structured summaries from their data.

Menelaus calls this an "Enhanced AI Prompt Builder" — consumer-friendly, visually pleasing, accessible to non-technical users.

---

## User Value

| Summary | Value to User |
|---------|--------------|
| **Day Recap** | End-of-day reflection, "what did I actually accomplish?" |
| **Standup Update** | Copy-paste ready standup for team meetings |
| **Morning Brief** | Catch up on yesterday's unfinished work |
| **Time Breakdown** | Understand where time went (by app, by project) |
| **What's Top of Mind** | Surface recurring topics you keep coming back to |
| **AI Habits** | Track which AI tools you use, how much, patterns |
| **Custom Summary** | Power-user builder with time/app/website filters |
| **Collaboration Patterns** | Who you interact with most (Slack, meetings) |
| **Professional Persona** | Work style analysis for self-improvement |
| **Week Recap** | Weekly review without manual journaling |

**Key insight from Menelaus:** He mostly uses Time Breakdown, Day Recap, and AI Habits — the ones that answer "what did I actually do?" without requiring the user to remember.

---

## Design

### Component 1: Pre-Chat Landing Page

Replaces the current empty chat state. Shows before any conversation is initiated.

```
┌─────────────────────────────────────────────┐
│                                             │
│          [PI icon]                          │
│    How can I help today, {name}?            │
│                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│  │ 📋 Day      │ │ 🏢 Standup  │ │ ✨ Custom      │
│  │ Recap       │ │ Update      │ │ Summary        │
│  │ Today's     │ │ What you    │ │ Custom time,   │
│  │ accomplish- │ │ did, next,  │ │ filters &      │
│  │ ments...    │ │ blockers    │ │ instructions   │
│  └─────────────┘ └─────────────┘ └────────────────┘
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│  │ ❗ Top of   │ │ 🤖 AI      │ │ 🔍 Discover    │
│  │ Mind        │ │ Habits      │ │ Reminders,     │
│  │ Recurring   │ │ AI usage &  │ │ Recaps, and    │
│  │ topics...   │ │ model pref  │ │ More...        │
│  └─────────────┘ └─────────────┘ └────────────────┘
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Ask about your screen activity...       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Behavior:**
- Cards are larger and more prominent than current auto-suggestion chips
- Clicking a card immediately sends the corresponding prompt to PI agent
- "Discover" opens the full library modal (Component 2)
- "Custom Summary" opens the builder modal (Component 3)
- Chat input remains at the bottom — this doesn't block regular usage
- Once a message is sent, the landing page disappears (same as current behavior)

**Which 5 cards to feature?** Based on Menelaus' usage data:
1. Day Recap (most universal)
2. Standup Update (work context)
3. Custom Summary (power users)
4. What's Top of Mind (reflection)
5. AI Habits (meta-awareness)
6. Discover (gateway to full library)

### Component 2: Summary Library Modal ("Discover")

Full library of all templates, opened from the "Discover" card or a menu button.

```
┌─────────────────────────────────────────
```

---

# COMANDO - single-click-summaries-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\docs\single-click-summaries-spec.md
**SHA:** a65588a73cb1bc5a61871d78e2b7f3b03467d3a227174c042e806ffd0fb44f95
**Timestamp:** 2026-08-23T23:44:03.919435
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- → Frontend builds prompt: system context + template prompt + time filter

### Riscos
- - **Hallucination risk:** PI agent might fabricate activities not in the data. Templates should include: "Only report activities you can verify from the recordings. If uncertain, say so."

### Ouro Bruto (primeiros 5000 chars)
```
# Single-Click Summaries — Product Spec

<!-- doc-covers: apps/screenpipe-app-tauri/components/chat -->
<!-- doc-verified: 3606788c6 -->
> **Historical.** Last verified against 3606788c6 (2026-02-19). `apps/screenpipe-app-tauri/components/chat` has moved a long way
> since; read this for original intent only. Names, signatures, and thresholds are
> probably wrong. The code wins. Run `bun scripts/check-doc-freshness.ts` for current drift.

**Author:** Louis / Menelaus (znitchi)
**Date:** Feb 19, 2026
**Status:** Draft

---

## Problem

Screenpipe records everything you see, say, and hear — but most users never ask the AI anything meaningful. The current empty chat state shows a few auto-suggestions ("What did I do in the last hour?"), but they're small, text-only, and easy to ignore. Users who don't know what to ask just stare at the input box and leave.

**Evidence:**
- Auto-suggestions exist (via `suggestions.rs`) but are small text buttons at the bottom of the empty chat
- The PI agent is powerful but requires users to formulate their own prompts
- Daily Summary exists but is limited to timeline view, auto-triggers only at 6 PM, and only covers audio transcriptions
- Menelaus (power user): "A lot of users might not know what to ask but having these auto-suggestions and one-click prompts makes everything a lot easier"

**Core tension:** Screenpipe collects 2K-13K+ memories per day, but the value is locked behind a blank text box.

---

## Solution

**"Single-Click Summaries"** — a prompt template library and visual builder that makes screenpipe's value immediately obvious. Instead of a blank chat, users see curated one-click actions that generate structured summaries from their data.

Menelaus calls this an "Enhanced AI Prompt Builder" — consumer-friendly, visually pleasing, accessible to non-technical users.

---

## User Value

| Summary | Value to User |
|---------|--------------|
| **Day Recap** | End-of-day reflection, "what did I actually accomplish?" |
| **Standup Update** | Copy-paste ready standup for team meetings |
| **Morning Brief** | Catch up on yesterday's unfinished work |
| **Time Breakdown** | Understand where time went (by app, by project) |
| **What's Top of Mind** | Surface recurring topics you keep coming back to |
| **AI Habits** | Track which AI tools you use, how much, patterns |
| **Custom Summary** | Power-user builder with time/app/website filters |
| **Collaboration Patterns** | Who you interact with most (Slack, meetings) |
| **Professional Persona** | Work style analysis for self-improvement |
| **Week Recap** | Weekly review without manual journaling |

**Key insight from Menelaus:** He mostly uses Time Breakdown, Day Recap, and AI Habits — the ones that answer "what did I actually do?" without requiring the user to remember.

---

## Design

### Component 1: Pre-Chat Landing Page

Replaces the current empty chat state. Shows before any conversation is initiated.

```
┌─────────────────────────────────────────────┐
│                                             │
│          [PI icon]                          │
│    How can I help today, {name}?            │
│                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│  │ 📋 Day      │ │ 🏢 Standup  │ │ ✨ Custom      │
│  │ Recap       │ │ Update      │ │ Summary        │
│  │ Today's     │ │ What you    │ │ Custom time,   │
│  │ accomplish- │ │ did, next,  │ │ filters &      │
│  │ ments...    │ │ blockers    │ │ instructions   │
│  └─────────────┘ └─────────────┘ └────────────────┘
│  ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│  │ ❗ Top of   │ │ 🤖 AI      │ │ 🔍 Discover    │
│  │ Mind        │ │ Habits      │ │ Reminders,     │
│  │ Recurring   │ │ AI usage &  │ │ Recaps, and    │
│  │ topics...   │ │ model pref  │ │ More...        │
│  └─────────────┘ └─────────────┘ └────────────────┘
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ Ask about your screen activity...       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Behavior:**
- Cards are larger and more prominent than current auto-suggestion chips
- Clicking a card immediately sends the corresponding prompt to PI agent
- "Discover" opens the full library modal (Component 2)
- "Custom Summary" opens the builder modal (Component 3)
- Chat input remains at the bottom — this doesn't block regular usage
- Once a message is sent, the landing page disappears (same as current behavior)

**Which 5 cards to feature?** Based on Menelaus' usage data:
1. Day Recap (most universal)
2. Standup Update (work context)
3. Custom Summary (power users)
4. What's Top of Mind (reflection)
5. AI Habits (meta-awareness)
6. Discover (gateway to full library)

### Component 2: Summary Library Modal ("Discover")

Full library of all templates, opened from the "Discover" card or a menu button.

```
┌─────────────────────────────────────────
```