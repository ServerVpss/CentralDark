# Telegram Bot API — setMyProfilePhoto (InputProfilePhoto)

Validated 04/08/2026 on `@Guardiaodopivete_bot` (GuardiaoCasa, id 8884831955).

## Symptom — the naive call fails
Trying to set a bot profile photo with a plain file upload:

```bash
curl -X POST "https://api.telegram.org/bot$TOKEN/setMyProfilePhoto" \
  -F "photo=@avatar.png"
# → 400 Bad Request: photo isn't specified
```

Passing a Windows absolute path with `-F "photo=@C:\path\file.png;type=image/png"` fails with the same 400. The field name `photo` is **not** the problem.

## Root cause — the API changed
Modern Bot API replaced the old `InputFile` param with the **`InputProfilePhoto`** type, which is one of:
- `InputProfilePhotoStatic` → field `photo`, **`.JPG` only**, must be static
- `InputProfilePhotoAnimated` → field `animation`, `.MPEG4`

It is a JSON object whose `photo`/`animation` value is an `attach://<name>` reference, so you must upload the file **alongside** the JSON in one multipart request. Docs: https://core.telegram.org/bots/api#inputprofilephoto

## Working recipe (validated OK: `{"ok":true,"result":true}`)
1. Convert to **JPG** (static). Here old-PIL in the venv was broken, so use `ffmpeg`:
   ```bash
   ffmpeg -y -loglevel error -i avatar.png avatar.jpg
   ```
2. Send JSON + separate multipart file:
   ```bash
   curl -X POST "https://api.telegram.org/bot$TOKEN/setMyProfilePhoto" \
     -F "photo={\"type\":\"static\",\"photo\":\"attach://profile\"};type=application/json" \
     -F "profile=@avatar.jpg;type=image/jpeg"
   ```
   - The JSON part is named `photo` (the method's param).
   - The actual file part is named whatever you used after `attach://` (here `profile`).
3. Verify the bot token with `getMe` (cheap, read-only) if in doubt.

## Notes
- Profile photos **cannot be reused** — the file must be uploaded fresh each time (no `file_id`).
- This changes the **bot's** profile photo, which the bot owner sets. It is a state change on the account, so only do it with the Pivete's explicit order.
- Do not guess the payload from memory/history — the Bot API version changes this shape; `curl` the doc and grep the `InputProfilePhoto` section when unsure.
