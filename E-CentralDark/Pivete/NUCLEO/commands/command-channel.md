# COMANDO - command-channel.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\video-sdk\windows\examples\command-channel.md
**SHA:** ec6f845ab9e40243
**Timestamp:** 2026-08-26T18:42:50.989235
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- class MyDelegate : public IZoomVideoSDKDelegate {

### Ouro Bruto (primeiros 5000 chars)
```
# Command Channel

Complete working code for custom command messaging between participants.

**Official Sample**: `VSDK_CommandChannel` in [videosdk-windows-rawdata-sample](https://github.com/zoom/videosdk-windows-rawdata-sample)

---

## Overview

The command channel enables custom data exchange between participants. Use cases:
- Application-specific signaling
- Game state synchronization
- Custom control messages
- Real-time collaboration data

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMAND CHANNEL FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│  Sender:                                                        │
│    getCmdChannel() → sendCommand() or sendCommandToAll()        │
│                                                                 │
│  Receiver:                                                      │
│    onCommandReceived(sender, command) callback                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Limitations

| Limit | Value |
|-------|-------|
| Max message rate | 60 messages/second |
| Max message size | ~1KB recommended |
| Reliability | Best effort (not guaranteed) |

**Note**: Commands are not persisted - late joiners won't receive previous commands.

---

## Complete Working Code

### CommandHandler.h

```cpp
#pragma once
#include <windows.h>
#include <string>
#include <functional>
#include "zoom_video_sdk_interface.h"

USING_ZOOM_VIDEO_SDK_NAMESPACE

class CommandHandler {
public:
    CommandHandler(IZoomVideoSDK* sdk);

    // Send commands
    bool SendToAll(const std::wstring& command);
    bool SendToUser(IZoomVideoSDKUser* user, const std::wstring& command);

    // Connection status
    bool IsConnected() const { return m_connected; }

    // Callbacks from delegate
    void OnCommandReceived(IZoomVideoSDKUser* sender, const zchar_t* command);
    void OnConnectResult(bool success);

    // Set message handler
    using MessageCallback = std::function<void(IZoomVideoSDKUser*, const std::wstring&)>;
    void SetMessageHandler(MessageCallback callback) { m_callback = callback; }

private:
    IZoomVideoSDK* m_sdk;
    IZoomVideoSDKCmdChannel* m_cmdChannel;
    bool m_connected;
    MessageCallback m_callback;
};
```

### CommandHandler.cpp

```cpp
#include "CommandHandler.h"
#include <iostream>

CommandHandler::CommandHandler(IZoomVideoSDK* sdk)
    : m_sdk(sdk)
    , m_cmdChannel(nullptr)
    , m_connected(false) {
}

bool CommandHandler::SendToAll(const std::wstring& command) {
    if (!m_cmdChannel) {
        m_cmdChannel = m_sdk->getCmdChannel();
    }

    if (!m_cmdChannel) {
        std::cout << "Command channel not available" << std::endl;
        return false;
    }

    ZoomVideoSDKErrors err = m_cmdChannel->sendCommand(nullptr, command.c_str());
    if (err == ZoomVideoSDKErrors_Success) {
        std::wcout << L"Sent to all: " << command << std::endl;
        return true;
    }

    std::cout << "Send failed: " << err << std::endl;
    return false;
}

bool CommandHandler::SendToUser(IZoomVideoSDKUser* user, const std::wstring& command) {
    if (!user) return false;

    if (!m_cmdChannel) {
        m_cmdChannel = m_sdk->getCmdChannel();
    }

    if (!m_cmdChannel) {
        return false;
    }

    ZoomVideoSDKErrors err = m_cmdChannel->sendCommand(user, command.c_str());
    if (err == ZoomVideoSDKErrors_Success) {
        std::wcout << L"Sent to " << user->getUserName()
                   << L": " << command << std::endl;
        return true;
    }

    std::cout << "Send failed: " << err << std::endl;
    return false;
}

void CommandHandler::OnCommandReceived(IZoomVideoSDKUser* sender, const zchar_t* command) {
    if (!sender || !command) return;

    std::wstring cmdStr(command);
    std::wcout << L"Command from " << sender->getUserName()
               << L": " << cmdStr << std::endl;

    // Call user handler if set
    if (m_callback) {
        m_callback(sender, cmdStr);
    }
}

void CommandHandler::OnConnectResult(bool success) {
    m_connected = success;
    std::cout << "Command channel " << (success ? "connected" : "failed") << std::endl;
}
```

### Using in Delegate

```cpp
class MyDelegate : public IZoomVideoSDKDelegate {
private:
    CommandHandler* m_cmdHandler;

public:
    MyDelegate(IZoomVideoSDK* sdk) {
        m_cmdHandler = new CommandHandler(sdk);

        // Set message handler
        m_cmdHandler->SetMessageHandler([this](IZoomVideoSDKUser* sender,
                                                const std::wstring& cmd) {
            HandleCommand(sender, cmd);
        });
    }

    void onSessionJoin() override {
        // Send hello to all participants
        m_cmdHandler->SendToAll(L"hello");
    }

    void onCommandReceived(IZoomVideoSDKUser* sender, const zchar_t* strCmd) override {
        m_cmdHandler->OnCommandReceived(sender, strCmd);
    }

    void onCommandChannelConne
```