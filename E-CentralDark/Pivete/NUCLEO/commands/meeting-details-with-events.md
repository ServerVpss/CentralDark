# COMANDO - meeting-details-with-events.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\meeting-details-with-events.md
**SHA:** eca076f7c5fcb451
**Timestamp:** 2026-08-26T18:42:50.866524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- A common integration pattern: get meeting information via REST API, then receive real-time updates via webhooks when meeting events occur (started, ended, participants join/leave).

### Ouro Bruto (primeiros 5000 chars)
```
# Meeting Details with Event Subscription

Retrieve meeting details and subscribe to real-time meeting events.

## Overview

A common integration pattern: get meeting information via REST API, then receive real-time updates via webhooks when meeting events occur (started, ended, participants join/leave).

For implementation-heavy orchestration patterns (token refresh locks, retries, queue-based webhook handling, circuit-breaker and reconciliation fallbacks), see:
- [../references/automatic-skill-chaining-rest-webhooks.md](../references/automatic-skill-chaining-rest-webhooks.md)
- [../references/meeting-webhooks-oauth-refresh-orchestration.md](../references/meeting-webhooks-oauth-refresh-orchestration.md)
- [../references/distributed-meeting-fallback-architecture.md](../references/distributed-meeting-fallback-architecture.md)

## Skills Needed

| Order | Skill | Purpose |
|-------|-------|---------|
| 1 | **zoom-rest-api** | Retrieve meeting details |
| 2 | **webhooks** | Subscribe to and receive meeting events |

## Skill Chaining Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE INTEGRATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

SETUP PHASE (One-time):
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Configure Event Subscriptions (Marketplace Portal or API)            │
│    └── Subscribe to: meeting.started, meeting.ended,                    │
│        meeting.participant_joined, meeting.participant_left             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
RUNTIME PHASE:
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. GET Meeting Details (zoom-rest-api)                                  │
│    └── GET /meetings/{meetingId}                                        │
│    └── Store meeting info (topic, host, settings, join_url)             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Receive Meeting Events (webhooks)                               │
│    └── meeting.started → Update status, notify users                    │
│    └── meeting.participant_joined → Track attendance                    │
│    └── meeting.participant_left → Log departure time                    │
│    └── meeting.ended → Finalize records, trigger post-processing        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Zoom app with OAuth or Server-to-Server OAuth
- Scopes: `meeting:read` (for REST API)
- Event subscriptions configured for meeting events
- HTTPS endpoint for receiving webhooks
- **See [Authorization Patterns](../references/authorization-patterns.md)** for scope validation and permission checking

## Step 1: Configure Event Subscriptions

### Option A: Via Marketplace Portal (Recommended for most apps)

1. Go to [marketplace.zoom.us](https://marketplace.zoom.us/) → Your App
2. Navigate to **Feature** → **Event Subscriptions**
3. Click **Add Event Subscription**
4. Configure:
   - **Subscription name**: "Meeting Events"
   - **Event notification endpoint URL**: `https://yourapp.com/webhooks/zoom`
5. Select events:
   - ✅ `meeting.started`
   - ✅ `meeting.ended`
   - ✅ `meeting.participant_joined`
   - ✅ `meeting.participant_left`
6. Save and activate

### Option B: Programmatic Setup

Event subscriptions are configured at app creation time in the Marketplace portal. However, you can verify your subscription status via API:

```javascript
// List webhook subscriptions for your app
const response = await fetch(
  'https://api.zoom.us/v2/webhooks',
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
);

const webhooks = await response.json();
console.log('Active webhooks:', webhooks);
```

## Step 2: Retrieve Meeting Details (zoom-rest-api)

```javascript
const axios = require('axios');

/**
 * Get meeting details from Zoom REST API
 * @param {string} meetingId - The meeting ID
 * @param {string} accessToken - Valid OAuth access token
 * @returns {Promise<Object>} Meeting details
 */
async function getMeetingDetails(meetingId, accessToken) {
  try {
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const meeting = response.data;

    return {
      id: meeting.id,
      uuid: meeting.uuid,
      topic: meeting.topic,
      type: meeting.type,
      status: meeting.status,
      start_time: meeting.start_time,
      duration: meeting.duration,
      timezone: meeting.timezone,
      host_id: meeting.host_id,
      
```