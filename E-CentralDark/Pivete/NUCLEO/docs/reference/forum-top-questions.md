# REFERENCIA - forum-top-questions.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\rest-api\troubleshooting\forum-top-questions.md
**SHA:** 96375fd20b011948
**Timestamp:** 2026-08-26T18:42:56.721565
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Answer pattern:
- Answer pattern:
- Answer pattern:

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "Forum-Derived Top Questions (REST API)"
---

# Forum-Derived Top Questions (REST API)

This is a checklist of the most common forum questions for **Zoom REST API** integrations.

## Fast Routing Questions (Ask First)

- App type: **Server-to-Server OAuth** vs **User OAuth (authorization_code / PKCE)**
- Target endpoints: meetings, webinars, recordings, users, reports, team chat
- Who are you acting as: account-level automation vs per-user actions?
- Exact error: HTTP status + Zoom error `code` + `message`
- Scopes: list current scopes on the token (and whether they match the endpoint)

## “Invalid access token” / “does not contain scopes”

Common causes to cover:
- wrong OAuth app type for the use case
- token from the wrong account/app
- scopes not granted or not activated
- using `me` incorrectly (User OAuth vs S2S OAuth rules)

## Server-to-Server OAuth Migration

Common asks:
- “How do I switch from JWT app type to S2S OAuth?”
- “What is `grant_type=account_credentials` and `account_id`?”

Answer pattern:
- explain that Marketplace JWT app type is deprecated (REST API)
- show token request + where to store/refresh tokens server-side

## Webhooks

Common asks:
- verification (CRC or event verification)
- “which event proves the user actually joined?”
- limiting events to subsets of users

Answer pattern:
- recommend event-driven architecture over polling
- show signature/verification steps and typical pitfalls

## Recordings + Transcripts

Common asks:
- downloading recordings (`download_url` auth + redirects)
- bulk download across account/users
- getting transcripts and transcription availability

Answer pattern:
- use webhooks to trigger downloads
- follow redirects and keep auth headers

```