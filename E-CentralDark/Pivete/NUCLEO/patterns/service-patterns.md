# PADRAO - service-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\contact-center\ios\examples\service-patterns.md
**SHA:** a60be54d02c05009
**Timestamp:** 2026-08-26T18:42:51.360370
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- chat.chatDelegate = self
- video.videoDelegate = self
- scheduled.scheduledCallbackDelegate = self

### Ouro Bruto (primeiros 5000 chars)
```
# iOS Service Patterns

## Context Setup

```swift
let context = ZoomCCContext()
context.cacheFolder = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
context.userName = userName
context.domainType = .US01
ZoomCCInterface.sharedInstance().context = context
```

## Chat Pattern

```swift
let item = ZoomCCItem()
item.sdkType = .chat
item.entryId = chatEntryId

let chat = ZoomCCInterface.sharedInstance().chatService()
chat.chatDelegate = self
if chat.status == .initial {
    chat.initialize(with: item)
    chat.login()
}
chat.fetchUI { vc in
    if let vc { self.navigationController?.pushViewController(vc, animated: true) }
}
```

## Video Pattern

```swift
let item = ZoomCCItem()
item.sdkType = .video
item.entryId = videoEntryId

let video = ZoomCCInterface.sharedInstance().videoService()
video.videoDelegate = self
if video.status == .initial {
    video.initialize(with: item)
}
video.fetchUI { vc in
    if let vc { self.navigationController?.pushViewController(vc, animated: true) }
}
```

## Scheduled Callback Pattern

```swift
let item = ZoomCCItem()
item.sdkType = .scheduledCallback
item.apiKey = callbackApiKey

let scheduled = ZoomCCInterface.sharedInstance().scheduledCallbackService()
scheduled.scheduledCallbackDelegate = self
if scheduled.status == .initial {
    scheduled.initialize(with: item)
}
scheduled.fetchUI { vc in
    if let vc { self.navigationController?.pushViewController(vc, animated: true) }
}
```

## Rejoin Pattern

```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return rootVC.handleRejoinVideoOpenURL(url)
}
```

```