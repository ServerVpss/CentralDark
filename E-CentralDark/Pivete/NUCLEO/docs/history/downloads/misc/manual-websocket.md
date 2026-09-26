# OUTRO - manual-websocket.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\rtms\examples\manual-websocket.md
**SHA:** 329716e15adfac3d
**Timestamp:** 2026-08-26T18:46:23.632536
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = now - last;

### Ouro Bruto (primeiros 5000 chars)
```
# Manual WebSocket Implementation

Full RTMS protocol implementation without the SDK. Use this for:
- Languages without SDK support
- Custom protocol requirements
- Learning the underlying protocol

## Overview

RTMS requires two WebSocket connections:
1. **Signaling WebSocket** - Control plane (handshake, heartbeat, start/stop)
2. **Media WebSocket** - Data plane (audio, video, transcript, chat, share)

## Complete Implementation

```javascript
const WebSocket = require('ws');
const crypto = require('crypto');
const express = require('express');

const app = express();
app.use(express.json());

// Configuration
const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const SECRET_TOKEN = process.env.ZOOM_SECRET_TOKEN;

// Active connections
const signalingConnections = new Map();
const mediaConnections = new Map();
const activeSessions = new Map();
const activeVideoUsers = new Map();

// ============================================
// SIGNATURE GENERATION
// Uses meeting_uuid for meetings/webinars, session_id for Video SDK
// ============================================

function generateSignature(clientId, idValue, streamId, clientSecret) {
  const message = `${clientId},${idValue},${streamId}`;
  return crypto.createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');
}

// ============================================
// WEBHOOK HANDLER
// ============================================

const RTMS_EVENTS = ['meeting.rtms_started', 'webinar.rtms_started', 'session.rtms_started'];
const RTMS_STOP_EVENTS = ['meeting.rtms_stopped', 'webinar.rtms_stopped', 'session.rtms_stopped'];

app.post('/webhook', (req, res) => {
  // CRITICAL: Respond 200 IMMEDIATELY before any processing!
  res.status(200).send();

  const { event, payload } = req.body;

  // Handle URL validation challenge
  if (event === 'endpoint.url_validation') {
    const hash = crypto
      .createHmac('sha256', SECRET_TOKEN)
      .update(payload.plainToken)
      .digest('hex');
    return res.json({
      plainToken: payload.plainToken,
      encryptedToken: hash
    });
  }

  // Handle RTMS events (meetings, webinars, and Video SDK)
  if (RTMS_EVENTS.includes(event)) {
    handleRTMSStarted(payload.object);
  } else if (RTMS_STOP_EVENTS.includes(event)) {
    handleRTMSStopped(payload.object);
  }
});

// ============================================
// RTMS START HANDLER
// ============================================

function handleRTMSStarted(payload) {
  const { rtms_stream_id, server_urls } = payload;
  // meeting_uuid for meetings/webinars, session_id for Video SDK
  const idValue = payload.meeting_uuid || payload.session_id;

  // Prevent duplicate connections
  if (activeSessions.has(rtms_stream_id)) {
    console.log('Already connected to this stream, ignoring');
    return;
  }

  activeSessions.set(rtms_stream_id, {
    idValue: idValue,
    startTime: Date.now()
  });

  connectToSignaling(idValue, rtms_stream_id, server_urls);
}

// ============================================
// SIGNALING WEBSOCKET
// ============================================

function connectToSignaling(idValue, streamId, serverUrl) {
  console.log('Connecting to signaling:', serverUrl);

  const signature = generateSignature(CLIENT_ID, idValue, streamId, CLIENT_SECRET);
  const ws = new WebSocket(serverUrl);

  signalingConnections.set(streamId, ws);

  ws.on('open', () => {
    console.log('Signaling connected, sending handshake');

    ws.send(JSON.stringify({
      msg_type: 1,                    // SIGNALING_HAND_SHAKE_REQ
      protocol_version: 1,
      meeting_uuid: idValue,          // Works for both meeting_uuid and session_id
      rtms_stream_id: streamId,
      sequence: Math.floor(Math.random() * 1000000),
      signature: signature,
      media_type: 9                   // AUDIO(1) | TRANSCRIPT(8)
    }));
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    handleSignalingMessage(msg, idValue, streamId);
  });

  ws.on('close', (code, reason) => {
    console.log('Signaling closed:', code, reason.toString());
    signalingConnections.delete(streamId);
    // Implement reconnection logic if needed
  });

  ws.on('error', (error) => {
    console.error('Signaling error:', error);
  });
}

function handleSignalingMessage(msg, idValue, streamId) {
  switch (msg.msg_type) {
    case 2:  // SIGNALING_HAND_SHAKE_RESP
      if (msg.status_code === 0) {
        console.log('Signaling handshake success');

        // Extract media server URL and connect
        const mediaUrl = msg.media_server.server_urls.all;
        connectToMedia(idValue, streamId, mediaUrl);
      } else {
        console.error('Signaling handshake failed:', msg.status_code);
      }
      break;

    case 6:  // EVENT_UPDATE
      handleEventUpdate(msg, streamId);
      break;

    case 8:  // STREAM_STATE_UPDATE
      console.log('Stream state:', msg.state);
      break;

    case 9:  /
```