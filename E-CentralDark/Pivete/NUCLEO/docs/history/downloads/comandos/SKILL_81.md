---
name: twilio-security-api-auth
description: >
  Choose the right Twilio authentication method and implement it correctly.
  Covers Auth Token (testing only), API Keys (production standard), OAuth2
  client_credentials (time-limited bearer tokens), Access Tokens (client-side
  SDKs), and test credentials. Use this skill before making any Twilio API
  calls in production.
---

## Overview

Twilio supports four authentication methods. Choosing the wrong one is a security risk — Auth Tokens in production code are the most common credential leak.

| Method | Use for | Token lifetime | Revocable individually |
|--------|---------|---------------|----------------------|
| **Auth Token** | Local testing only | Permanent (until rotated) | No — rotation breaks ALL API keys |
| **API Key + Secret** | Production server-side | Permanent (until deleted) | Yes |
| **OAuth2 Bearer Token** | Production server-side (enhanced) | 1 hour | Expires automatically |
| **Access Token (JWT)** | Client-side SDKs (Voice, Video, Chat) | Up to 24 hours | No — delete issuing API key |

**Decision framework:**
- **Building a quick prototype?** → Auth Token (but switch to API Key before deploying)
- **Production server-side code?** → API Key + Secret (simplest production auth) or OAuth2 (time-limited tokens)
- **Browser/mobile client needs to connect?** → Access Token (JWT) generated server-side
- **Running tests without charges?** → Test credentials with magic numbers

---

## API Key Authentication (Production Standard)

**Create:** Console → Account → API keys & tokens → Create API key

| Key type | Access | Create via |
|----------|--------|-----------|
| **Main** | Full account access | Console only |
| **Standard** | All resources except /Accounts and /Keys endpoints | Console or API |
| **Restricted** | Specific resources only (up to 100 permissions) | Console or v1 IAM API only |

**Python**
```python
import os
from twilio.rest import Client

client = Client(
    os.environ["TWILIO_API_KEY"],      # SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    os.environ["TWILIO_API_SECRET"],
    os.environ["TWILIO_ACCOUNT_SID"]   # required as third argument
)
```

**Node.js**
```node
const client = require("twilio")(
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
);
```

---

## OAuth2 Authentication (Client Credentials)

Time-limited bearer tokens that expire after 1 hour. More secure than permanent API keys for server-to-server communication.

### Step 1 — Create an OAuth App

Create an OAuth App in the Twilio Console to get a Client ID and Client Secret.

### Step 2 — Request a Bearer Token

**cURL**
```bash
curl -X POST 'https://oauth.twilio.com/v2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id={ClientID}' \
  -d 'client_secret={ClientSecret}' \
  -d 'grant_type=client_credentials'
```

**Response:**
```json
{
    "access_token": "{BearerToken}",
    "token_type": "Bearer",
    "expires_in": 3600
}
```

### Step 3 — Use the Bearer Token

```bash
curl 'https://api.twilio.com/2010-04-01/Accounts/{AccountSID}/Messages.json' \
  -H 'Authorization: Bearer {BearerToken}'
```

### SDK Support

OAuth2 is supported in all Twilio SDKs:

| Language | Minimum version |
|----------|----------------|
| Java | 10.6.0 |
| C#/.NET | 7.6.0 |
| Node.js | 5.4.0 |
| Python | 9.4.1 |
| Ruby | 7.4.0 |
| PHP | 8.5.0 |
| Go | 1.25.1 |

**Docs:** [OAuth access tokens](https://www.twilio.com/docs/iam/oauth-apps/oauth-access-token) | [Segment OAuth connections](https://www.twilio.com/docs/segment/connections/oauth)

---

## Access Tokens (Client-Side SDKs)

Short-lived JWTs for authenticating browser/mobile clients. Generate server-side, pass to the client.

**Python**
```python
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant

token = AccessToken(
    os.environ["TWILIO_ACCOUNT_SID"],
    os.environ["TWILIO_API_KEY"],
    os.environ["TWILIO_API_SECRET"],
    identity="user-123",
    ttl=3600
)
token.add_grant(VoiceGrant(outgoing_application_sid="APxxxx"))
print(token.to_jwt())
```

Grant types: `VoiceGrant`, `VideoGrant`, `ChatGrant` (Conversations), `SyncGrant`

---

## Test Credentials

Make API calls without charges. Find at Console → Account → API keys & tokens → Test credentials.

Magic numbers: `+15005550006` (valid), `+15005550001` (invalid, error 21211), `+15005550007` (no SMS, error 21612)

---

## CANNOT

- **Standard keys cannot access /Accounts or /Keys endpoints** — Returns 20003 (401). Use Auth Token or Main key.
- **Cannot create restricted keys via v2010 API** — Silently creates a standard key instead. Use v1 IAM API.
- **Restricted keys cannot generate Access Tokens** — Only Standard and Main keys can.
- **Cannot revoke individual Access Tokens** — Valid until expiration (max 24h). Delete the issuing API key to revoke all.
- **OAuth2 only supports `client_credentials` grant** — No refresh tokens, no authorization code flow.
- **OAuth2 tokens expire after 1 hour** — Your application must handle token refresh.
- **API Key Secret shown only at creation** — Cannot be retrieved afterward.
- **Auth Token rotation breaks ALL API keys** — One-way door. This is why you should use API keys from day one.
- **Test credentials work with only 4 endpoints** — Messages, Calls, IncomingPhoneNumbers, Lookups. All others return 403.

---

## Next Steps

- **Account setup and sub-accounts:** `twilio-account-setup`
- **HIPAA account configuration:** `twilio-security-compliance-hipaa`
- **Webhook signature validation:** `twilio-webhook-architecture`
- **Credential security patterns:** `twilio-security-hardening`
s per call = 300 webhook invocations per second. Twilio Functions allow 30 concurrent executions per service.

**Thin-receiver pattern** — receive, queue, respond immediately:

**Node.js (Express)**
```node
const { Queue } = require("bullmq");
const statusQueue = new Queue("twilio-status");

// Thin receiver: accept callback, queue it, respond 200 immediately
app.post("/status", async (req, res) => {
    await statusQueue.add("status-event", {
        callSid: req.body.CallSid,
        callStatus: req.body.CallStatus,
        timestamp: Date.now(),
    });
    res.sendStatus(200);  // Respond FAST — Twilio will retry on timeout
});

// Process asynchronously
const worker = new Worker("twilio-status", async (job) => {
    const { callSid, callStatus } = job.data;
    await updateDatabase(callSid, callStatus);
});
```

**Python (Flask + Celery)**
```python
@app.route("/status", methods=["POST"])
def status_callback():
    # Queue for async processing
    process_status.delay(
        call_sid=request.form["CallSid"],
        call_status=request.form["CallStatus"]
    )
    return "", 200  # Respond FAST

@celery.task
def process_status(call_sid, call_status):
    update_database(call_sid, call_status)
```

**Idempotency key:** Use `{CallSid}-{CallStatus}` as a composite key. Twilio retries on timeout, which can cause duplicate callbacks. Deduplicate before processing.

### 5. Fallback Chains

When delivery on one channel fails, escalate to the next:

**Python**
```python
async def send_with_fallback(client, to, message, messaging_service_sid):
    """Try SMS → Voice → Email fallback chain."""
    
    # Try SMS first
    try:
        msg = client.messages.create(
            to=to, body=message, messaging_service_sid=messaging_service_sid,
            status_callback="https://yourapp.com/status"
        )
        # Wait for delivery confirmation via StatusCallback
        # If undelivered after timeout, fall through to voice
        return {"channel": "sms", "sid": msg.sid}
    except Exception:
        pass  # SMS failed, try voice
    
    # Fallback to voice
    try:
        call = client.calls.create(
            to=to, from_="+15551234567",
            twiml=f"<Response><Say>{message}</Say></Response>",
            status_callback="https://yourapp.com/call-status"
        )
        return {"channel": "voice", "sid": call.sid}
    except Exception:
        pass  # Voice failed, try email
    
    # Last resort: email
    # Use SendGrid — see twilio-sendgrid-email
    return {"channel": "email", "status": "queued"}
```

### 6. Voice Concurrency Limits

| Resource | Default limit | Notes |
|----------|--------------|-------|
| Concurrent calls per account | 1 (trial) / variable (paid) | Request increase via support |
| Calls per second (CPS) | 1 CPS (default) | Increase via support for outbound campaigns |
| Conference participants | 250 per conference | |
| Twilio Functions concurrent | 30 per service | Use thin-receiver pattern above |

For outbound campaigns, request CPS increase before launch — not during.

### 7. Webhook Timeout Handling

Twilio expects a response within **15 seconds** for voice webhooks and **15 seconds** for messaging webhooks. If your endpoint doesn't respond:
- Voice: Twilio hangs up or falls back to `voiceFallbackUrl`
- Messaging: Twilio retries the callback

**Always configure fallback URLs:**
```python
# On phone number configuration
number = client.incoming_phone_numbers(phone_sid).update(
    voice_url="https://yourapp.com/voice",
    voice_fallback_url="https://yourapp.com/voice-fallback",  # backup endpoint
    sms_url="https://yourapp.com/sms",
    sms_fallback_url="https://yourapp.com/sms-fallback"
)
```

---

## Monitoring Checklist

Set up these alerts before going to production:

| Metric | Alert threshold | How to track |
|--------|----------------|-------------|
| 429 error rate | > 5% of requests | Count 429s in your backoff handler |
| Delivery failure rate | > 2% of messages | StatusCallback `failed`/`undelivered` events |
| Webhook response time | > 5 seconds p95 | Your APM tool (DataDog, New Relic) |
| Queue depth | Growing over 5 minutes | Your message queue metrics |
| Concurrent calls | > 80% of limit | Twilio Usage API or Event Streams |

Twilio's built-in alerting systems are under-used — end-users often discover issues before developers do. Configure StatusCallbacks + Event Streams for delivery failure alerts on every integration.

---

## CANNOT

- **Cannot avoid 429 errors on any Twilio API** — Backoff patterns apply to all APIs (Messaging, Voice, Verify, Lookup)
- **Cannot increase per-number throughput** — Add more numbers via Messaging Services instead
- **Cannot configure StatusCallback retry behavior** — Twilio retries on timeout automatically; not configurable
- **Cannot exceed Twilio Functions limits** — 30 concurrent executions/service, 10-second timeout, 256 MB memory
- **Cannot use a native Twilio rate limiting API** — You must implement rate limiting in your application

---

## Next Steps

- **Messaging at scale:** `twilio-messaging-services`
- **Monitor delivery:** `twilio-sms-send-message` (StatusCallbacks)
- **Debug failures:** `twilio-debugging-observability`
- **Compliance for bulk sends:** `twilio-compliance-traffic`
