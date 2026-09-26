# REFERENCIA - common-issues.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\team-chat\troubleshooting\common-issues.md
**SHA:** 1a6388f764b95e7e
**Timestamp:** 2026-08-26T18:42:50.904581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- console.error(`❌ Missing: ${key}`);

### Ouro Bruto (primeiros 5000 chars)
```
# Common Issues and Solutions

Quick diagnostics and solutions for Zoom Team Chat development.

## Authentication Issues

### "Invalid client_id or client_secret"

**Cause**: Incorrect credentials or using wrong environment (dev vs production)

**Solution**:
1. Verify credentials in `.env` match Zoom Marketplace
2. Check you're using Development credentials (not Production)
3. Regenerate Client Secret if needed

### "Get Bot Token" returns 404 or HTML page

**Cause**: Using wrong token endpoint.

**Fix**:
- Use `https://zoom.us/oauth/token` for token exchange.
- Do not use `https://zoom.us/oauth/token` for chatbot token requests.

Quick check:
```bash
curl -X POST https://zoom.us/oauth/token \
  -H "Authorization: Basic <base64(client_id:client_secret)>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

### "Token expired"

**Cause**: Access token has expired (1 hour for user tokens)

**Solution**:
```javascript
// Implement token refresh
if (error.message.includes('token expired')) {
  const newToken = await refreshAccessToken(refreshToken);
  // Retry request with new token
}
```

### "Scope not authorized"

**Cause**: Missing required scope in app configuration

**Solution**:
1. Go to Zoom Marketplace → Your App → Scopes
2. Add missing scope (e.g., `chat_message:write`)
3. Users must re-authorize the app

## Webhook Issues

### "Cannot GET /webhook" (Browser)

**Expected Behavior**: This is NORMAL

**Explanation**: Webhooks are POST-only. Browsers send GET requests.

**Test properly**:
```bash
WEBHOOK_BASE_URL="http://YOUR_DEV_HOST:4000"

# Use POST instead
curl -X POST "$WEBHOOK_BASE_URL/webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'
```

### "Invalid webhook signature"

**Cause**: Mismatch between your Secret Token and Zoom's

**Solution**:
1. Verify `ZOOM_VERIFICATION_TOKEN` in `.env`
2. Check Secret Token in Zoom Marketplace → Features → Team Chat Subscriptions
3. Ensure no extra spaces/characters in token

**Debug**:
```javascript
console.log('Expected token:', process.env.ZOOM_VERIFICATION_TOKEN);
console.log('Signature from Zoom:', req.headers['x-zm-signature']);
```

### URL Validation Fails

**Cause**: Incorrect response format

**Correct response**:
```javascript
{
  "plainToken": "xyz123",
  "encryptedToken": "hmac_sha256_hash"
}
```

**Incorrect**:
```javascript
{ "success": true }  // Wrong!
```

### No Webhooks Received

**Checklist**:
- [ ] ngrok is running: `ngrok http 4000`
- [ ] Bot Endpoint URL in Zoom Marketplace matches ngrok URL
- [ ] Server is running: `node server.js`
- [ ] Slash command configured in Zoom Marketplace
- [ ] Bot installed in your account

**Test**:
```bash
# In Zoom Team Chat, type:
/yourbot test

# Should see webhook in server logs
```

## Bot JID Issues

### "Bot JID not found"

**Cause**: Chatbot feature not enabled

**Solution**:
1. Go to Zoom Marketplace → Your App → Features
2. Toggle **Chatbot** ON
3. Bot JID will appear in **Bot Credentials** section

### "Bot JID appears but messages not sending"

**Cause**: Wrong Bot JID format or environment mismatch

**Solution**:
1. Verify format: `v1abc123xyz@xmpp.zoom.us`
2. Use Development Bot JID for testing
3. Check Account ID matches the bot's account

## Message Sending Issues

### "Messages not appearing in Team Chat"

**Common causes**:

1. **Wrong `to_jid`**
   ```javascript
   // Use toJid from webhook payload
   await sendMessage(payload.toJid, accountId, content);
   ```

2. **Missing `account_id`**
   ```javascript
   // Required for chatbot messages
   {
     "account_id": process.env.ZOOM_ACCOUNT_ID,  // Don't forget!
     "robot_jid": process.env.ZOOM_BOT_JID,
     "to_jid": toJid
   }
   ```

3. **Incorrect content format**
   ```javascript
   // ❌ Wrong
   { "text": "Hello" }

   // ✅ Correct
   {
     "content": {
       "body": [
         { "type": "message", "text": "Hello" }
       ]
     }
   }
   ```

### "Message truncated or garbled"

**Cause**: Special characters or exceeding 4096 char limit

**Solution**:
```javascript
function sanitizeMessage(message) {
  return message
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control chars
    .substring(0, 4096);                // Enforce limit
}
```

## Button/Form Issues

### "Buttons not clickable"

**Cause**: Missing `value` field

**Incorrect**:
```javascript
{
  "type": "actions",
  "items": [
    { "text": "Click Me" }  // Missing value!
  ]
}
```

**Correct**:
```javascript
{
  "type": "actions",
  "items": [
    { "text": "Click Me", "value": "clicked" }
  ]
}
```

### "Button clicks not triggering webhooks"

**Checklist**:
- [ ] Webhook handler has `interactive_message_actions` case
- [ ] Bot Endpoint URL configured correctly
- [ ] Server responding with 200 status
- [ ] Webhook signature verification passing

## ngrok Issues

### "ngrok session expired"

**Cause**: Free ngrok URLs expire after 2 hours

**Solutions**:
1. **Short-term**: Restart ngr
```