---
name: centraldark-drive-auth
description: "Setup Google OAuth for CentralDark Drive integration."
version: 1.0.0
author: Pivete
skill_type: helper
---

# CentralDark Drive OAuth Setup

This skill guides the user through creating and storing Google OAuth credentials required for any CentralDark tool that interacts with Google Drive, including the `centraldark-drive-reconciliation` skill.

## Usage
When you want to set up or confirm OAuth credentials on a machine that will run CentralDark drive‑sync operations.

1. **Create a Google Cloud OAuth 2.0 client** at <https://console.cloud.google.com/apis/credentials/oauthclient>.
2. **Export credentials** as environment variables:
   ```bash
   export GOOGLE_OAUTH_CLIENT_ID="<client-id>"
   export GOOGLE_OAUTH_CLIENT_SECRET="<client-secret>"
   ```
   or place them in a `.env` file in the repo root:
   ```ini
   GOOGLE_OAUTH_CLIENT_ID=<client-id>
   GOOGLE_OAUTH_CLIENT_SECRET=<client-secret>
   ```
3. Authenticate using your preferred client (`gdrive`, `rclone`, or the centraldark internal helper). The token will be written to `google_token.json`.
4. Verify connectivity:
   ```bash
   gdrive list --max 1
   ```
   If the command succeeds, the credentials are valid.

## Key Points
- The token and client secrets must **never** be committed to source control.
- The reconciliation skill will abort with a hard‑stop if credentials are missing or invalid.
- If the token expires, re‑authenticate to obtain a new refresh token.

---
