# CentralDark — App Registry / Slack + Figma Control Plane

Status: EXTENSION_OF_EXISTING_HUB_AND_DELTAUTIL

`APP != NEW_ENGINE`. Every provider is a capability record under the existing HUB.

Dense flow:

`DISCOVER -> AUTH -> SECRETREF -> MEASURE -> TEST -> REGISTER -> REFRESH_IF_SUPPORTED -> REMEASURE -> RECEIPT`.

Measured this pass:
- Slack: workspace `CENTRALDARK`, team `T0BTRETGDC5`, connector live.
- Figma: authenticated account, starter plan, View seat. Write authority remains target-dependent and must be measured.

Rules:
- Raw token/client secret/signing secret never enters docs, logs, prompts, screenshots, receipts.
- `CONNECTED != WRITE_AUTHORITY`.
- `OAUTH_SCOPE != RUNTIME_PROOF`.
- UI name may change; canonical_id/function remain stable.
- ON/OFF controls policy execution. DISCONNECT/revoke is a separate action.
- Provider refresh follows provider-supported OAuth lifecycle and is remeasured after refresh.

Admin card per app:
`glyph | name | workspace/account | auth | health | capabilities | permissions | last measured | TEST | DETAILS | ENABLE/DISABLE | DISCONNECT`.

Figma source reference supplied by operator: `https://developers.figma.com/docs/rest-api/#refresh-oauth2`. Runtime adapter must validate current provider docs before hardcoding refresh behavior.
