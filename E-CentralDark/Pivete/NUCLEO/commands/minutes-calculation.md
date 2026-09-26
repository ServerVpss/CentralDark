# COMANDO - minutes-calculation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\general\use-cases\minutes-calculation.md
**SHA:** 6595792edb744e8a
**Timestamp:** 2026-08-26T18:42:56.616210
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.sessionStart = null;
- this.sessionStart = new Date();
- sessionStart = std::chrono::system_clock::now();

### Ouro Bruto (primeiros 5000 chars)
```
# Minutes Calculation for Billing

Calculate usage minutes for Video SDK sessions and Meeting SDK meetings for billing and cost management.

## Overview

Zoom SDKs are billed based on **participant-minutes**. This guide covers how to track and calculate usage for accurate billing projections and cost optimization.

## Skills Needed

- **zoom-rest-api** - Reports API
- **webhooks** - Real-time tracking
- **zoom-video-sdk** - Session Quality API

## Billing Models

| SDK | Billing Unit | Calculation |
|-----|--------------|-------------|
| Video SDK | Participant-minutes | Sum of (each participant's session duration) |
| Meeting SDK | Host minutes | Based on meeting duration, not participant count |

**Example**: A 30-minute Video SDK session with 4 participants = 120 participant-minutes.

## Video SDK Usage Tracking

### Method 1: Session Quality API (Recommended)

Most accurate method using Zoom's built-in analytics.

```javascript
const axios = require('axios');

// Get session details including participant minutes
async function getSessionUsage(sessionId) {
  const response = await axios.get(
    `https://api.zoom.us/v2/videosdk/sessions/${sessionId}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  return {
    sessionName: response.data.session_name,
    startTime: response.data.start_time,
    endTime: response.data.end_time,
    totalMinutes: response.data.duration, // Total session minutes
    participantCount: response.data.participant_count
  };
}

// Get participant-level breakdown
async function getSessionParticipants(sessionId) {
  const response = await axios.get(
    `https://api.zoom.us/v2/videosdk/sessions/${sessionId}/participants`,
    {
      params: { page_size: 300 },
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  // Calculate participant-minutes
  const participants = response.data.participants.map(p => {
    const joinTime = new Date(p.join_time);
    const leaveTime = new Date(p.leave_time);
    const durationMinutes = (leaveTime - joinTime) / 1000 / 60;

    return {
      name: p.user_name,
      joinTime: p.join_time,
      leaveTime: p.leave_time,
      durationMinutes: Math.round(durationMinutes * 100) / 100
    };
  });

  const totalParticipantMinutes = participants.reduce(
    (sum, p) => sum + p.durationMinutes, 0
  );

  return {
    participants,
    totalParticipantMinutes: Math.round(totalParticipantMinutes * 100) / 100
  };
}

// Get all sessions in date range
async function getSessionsInRange(from, to) {
  const response = await axios.get(
    'https://api.zoom.us/v2/videosdk/sessions',
    {
      params: { from, to, page_size: 300 },
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  return response.data.sessions;
}

// Calculate monthly usage
async function calculateMonthlyUsage(year, month) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const sessions = await getSessionsInRange(from, to);

  let totalParticipantMinutes = 0;
  const sessionDetails = [];

  for (const session of sessions) {
    const participants = await getSessionParticipants(session.id);
    totalParticipantMinutes += participants.totalParticipantMinutes;

    sessionDetails.push({
      sessionId: session.id,
      sessionName: session.session_name,
      date: session.start_time,
      participantMinutes: participants.totalParticipantMinutes
    });
  }

  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    totalSessions: sessions.length,
    totalParticipantMinutes: Math.round(totalParticipantMinutes),
    sessions: sessionDetails
  };
}
```

### Method 2: Real-Time Webhook Tracking

Track usage in real-time as sessions happen.

```javascript
const express = require('express');
const app = express();

// In-memory storage (use database in production)
const activeSessions = new Map();
const usageRecords = [];

app.post('/webhook', express.json(), (req, res) => {
  const { event, payload } = req.body;

  switch (event) {
    case 'session.started':
      handleSessionStarted(payload);
      break;
    case 'session.ended':
      handleSessionEnded(payload);
      break;
    case 'session.participant_joined':
      handleParticipantJoined(payload);
      break;
    case 'session.participant_left':
      handleParticipantLeft(payload);
      break;
  }

  res.status(200).send();
});

function handleSessionStarted(payload) {
  const { object } = payload;
  activeSessions.set(object.id, {
    sessionId: object.id,
    sessionName: object.session_name,
    startTime: new Date(object.start_time),
    participants: new Map()
  });
}

function handleSessionEnded(payload) {
  const { object } = payload;
  const session = activeSessions.get(object.id);

  if (session) {
    // Calculate final usage for any remaining participants
    const endTime = new Date(object.end
```