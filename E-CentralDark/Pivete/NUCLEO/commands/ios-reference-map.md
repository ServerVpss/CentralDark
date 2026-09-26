# COMANDO - ios-reference-map.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\contact-center\ios\references\ios-reference-map.md
**SHA:** 2728af897f92eed0
**Timestamp:** 2026-08-26T18:42:52.990715
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- - `handleRejoinVideoOpenURL:item:videoDelegate:complete:`

### Ouro Bruto (primeiros 5000 chars)
```
# iOS Reference Map

Primary references:
- https://marketplacefront.zoom.us/sdk/contact/ios/index.html
- SDK headers packaged in iOS SDK zip (`ZoomCCInterface.h`)

## Core Types

- `ZoomCCInterface`
- `ZoomCCContext`
- `ZoomCCItem`
- `ZoomCCCampaignInfo`

## Service Protocols

- `ZoomCCService`
- `ZoomCCChatService`
- `ZoomCCVideoService`
- `ZoomCCScheduledCallbackService`

## Delegate Protocols

- `ZoomCCServiceDelegate`
- `ZoomCCChatServiceDelegate`
- `ZoomCCAppLifecyleDelegate`

## Key Methods

- Interface:
- `sharedInstance`
- `chatService`
- `zvaService`
- `videoService`
- `scheduledCallbackService`
- `getCampaigns`
- Service lifecycle:
- `initializeWithItem`
- `login`
- `logout`
- `fetchUI`
- Video:
- `handleRejoinVideoOpenURL:item:videoDelegate:complete:`

## Deprecation Note

- `onService:error:detail:` is deprecated.
- Use `onService:error:detail:description:`.

```