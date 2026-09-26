# DECISAO - ai-integration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\rtms\examples\ai-integration.md
**SHA:** c2494e32884126db
**Timestamp:** 2026-08-26T18:42:52.988712
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = timestamp - lastTimestamp;

### Ouro Bruto (primeiros 5000 chars)
```
# AI Integration Patterns

Patterns for integrating RTMS with AI services for transcription, analysis, and meeting assistants. These examples work with meetings, webinars, and Video SDK sessions.

## Audio Transcription with External Services

### Deepgram Integration

```javascript
import rtms from "@zoom/rtms";
import { createClient } from "@deepgram/sdk";

const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;

  const client = new rtms.Client();

  // Configure for Deepgram-compatible audio
  client.setAudioParams({
    codec: 1,          // L16 (PCM)
    sampleRate: 1,     // 16kHz
    channel: 1,        // Mono
    dataOpt: 1         // Mixed stream
  });

  // Create live transcription connection
  const connection = deepgram.listen.live({
    model: "nova-2",
    language: "en",
    smart_format: true,
    punctuate: true,
  });

  connection.on("Results", (data) => {
    const transcript = data.channel.alternatives[0].transcript;
    if (transcript) {
      console.log(`[Deepgram]: ${transcript}`);
    }
  });

  client.onAudioData((buffer, timestamp, metadata) => {
    // Send audio to Deepgram
    connection.send(buffer);
  });

  client.onLeave(() => {
    connection.finish();
  });

  client.join(payload);
});
```

### AssemblyAI Integration

```javascript
import rtms from "@zoom/rtms";
import { AssemblyAI } from "assemblyai";

const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;

  const client = new rtms.Client();

  client.setAudioParams({
    codec: 1,          // L16 (PCM)
    sampleRate: 1,     // 16kHz
    channel: 1         // Mono
  });

  const transcriber = aai.realtime.createService({
    sampleRate: 16000,
  });

  transcriber.connect();

  transcriber.on("transcript", (transcript) => {
    if (transcript.text) {
      console.log(`[AssemblyAI]: ${transcript.text}`);
    }
  });

  client.onAudioData((buffer, timestamp, metadata) => {
    transcriber.sendAudio(buffer);
  });

  client.onLeave(() => {
    transcriber.close();
  });

  client.join(payload);
});
```

### Whisper (Local) Integration

```javascript
import rtms from "@zoom/rtms";
import { Whisper } from "whisper-node";

const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];
const whisper = new Whisper("base.en");

let audioBuffer = Buffer.alloc(0);
const BUFFER_SIZE = 16000 * 10; // 10 seconds at 16kHz

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;

  const client = new rtms.Client();

  client.setAudioParams({
    codec: 1,          // L16 (PCM)
    sampleRate: 1,     // 16kHz
    channel: 1         // Mono
  });

  client.onAudioData(async (buffer, timestamp, metadata) => {
    // Accumulate audio
    audioBuffer = Buffer.concat([audioBuffer, buffer]);

    // Transcribe when buffer is full
    if (audioBuffer.length >= BUFFER_SIZE) {
      const transcript = await whisper.transcribe(audioBuffer);
      console.log(`[Whisper]: ${transcript}`);
      audioBuffer = Buffer.alloc(0);
    }
  });

  client.join(payload);
});
```

## Meeting Summarization

### OpenAI/GPT Integration

```javascript
import rtms from "@zoom/rtms";
import OpenAI from "openai";

const RTMS_EVENTS = ["meeting.rtms_started", "webinar.rtms_started", "session.rtms_started"];
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcripts = [];
let summaryInterval;

rtms.onWebhookEvent(({ event, payload }) => {
  if (!RTMS_EVENTS.includes(event)) return;

  const client = new rtms.Client();

  client.onTranscriptData((buffer, timestamp, metadata) => {
    const text = buffer.toString('utf8');
    transcripts.push({
      speaker: metadata.userName,
      text: text,
      time: new Date(timestamp)
    });
  });

  // Generate summary every 5 minutes
  summaryInterval = setInterval(async () => {
    if (transcripts.length === 0) return;

    const fullTranscript = transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const summary = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Summarize this meeting transcript. Include key points, decisions, and action items."
        },
        {
          role: "user",
          content: fullTranscript
        }
      ]
    });

    console.log("Meeting Summary:", summary.choices[0].message.content);
  }, 5 * 60 * 1000);

  client.onLeave(async () => {
    clearInterval(summaryInterval);

    // Generate final summary
    const fullTranscript = transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n
```