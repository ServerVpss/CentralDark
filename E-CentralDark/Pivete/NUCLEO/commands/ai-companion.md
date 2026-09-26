# COMANDO - ai-companion.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\examples\ai-companion.md
**SHA:** 8503fd086d323b0d
**Timestamp:** 2026-08-26T18:42:51.466583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const zchar_t* prompt = queryHelper->GetAICompanionQueryLegalNoticesPrompt();

### Ouro Bruto (primeiros 5000 chars)
```
# AI Companion Features: Smart Summary & Query

## Overview

The `IMeetingAICompanionController` provides Level 3 sub-helpers for AI-powered meeting features:

| Helper | Getter | Status | Purpose |
|--------|--------|--------|---------|
| `IMeetingSmartSummaryHelper` | `GetMeetingSmartSummaryHelper()` | **DEPRECATED** | Legacy smart summary API |
| `IMeetingAICompanionSmartSummaryHelper` | `GetMeetingAICompanionSmartSummaryHelper()` | Current | AI-powered meeting summaries |
| `IMeetingAICompanionQueryHelper` | `GetMeetingAICompanionQueryHelper()` | Current | AI Q&A about meeting content |

---

## Navigation Path

```
IMeetingService
  └─► GetMeetingAICompanionController()
        ├─► GetMeetingSmartSummaryHelper()              // DEPRECATED
        ├─► GetMeetingAICompanionSmartSummaryHelper()   // Smart Summary
        └─► GetMeetingAICompanionQueryHelper()          // AI Query/Q&A
```

---

## Prerequisites

AI Companion features require:
1. Feature enabled in Zoom account settings
2. Host privileges (for starting features)
3. Meeting in progress (`MEETING_STATUS_INMEETING`)

---

## 1. Smart Summary (IMeetingAICompanionSmartSummaryHelper)

AI-generated meeting summaries that capture key points, action items, and decisions.

### Get the Helper

```cpp
IMeetingAICompanionController* aiCtrl = meetingService->GetMeetingAICompanionController();
if (!aiCtrl) return;

IMeetingAICompanionSmartSummaryHelper* summaryHelper =
    aiCtrl->GetMeetingAICompanionSmartSummaryHelper();
if (!summaryHelper) return;
```

### Set Up Event Handler

```cpp
class SmartSummaryEventHandler : public IMeetingAICompanionSmartSummaryHelperEvent {
public:
    void onSmartSummaryStateNotSupported() override {
        // Meeting doesn't support smart summary
        // Account may not have the feature enabled
    }

    void onSmartSummaryStateSupportedButDisabled(
        IMeetingEnableSmartSummaryHandler* handler) override
    {
        // Feature supported but needs to be enabled
        if (handler) {
            if (handler->IsForRequest()) {
                // This is a request from another user
                // Host should decide whether to enable
            } else {
                // Current user can enable directly
                handler->EnableSmartSummary();
            }
        }
    }

    void onSmartSummaryStateEnabledButNotStarted(
        IMeetingStartSmartSummaryHandler* handler) override
    {
        // Feature enabled, ready to start
        if (handler) {
            if (handler->IsForRequest()) {
                // Request from another user to start
            } else {
                // Can start directly
                handler->StartSmartSummary();
            }
        }
    }

    void onSmartSummaryStateStarted(
        IMeetingStopSmartSummaryHandler* handler) override
    {
        // Smart summary is now active
        // handler is nullptr if current user can't stop it
        if (handler) {
            // Can stop if needed
            // handler->StopSmartSummary();
        }
    }

    void onFailedToStartSmartSummary(bool bTimeout) override {
        if (bTimeout) {
            // Request timed out
        } else {
            // Host/cohost declined the request
        }
    }

    void onSmartSummaryEnableRequestReceived(
        IMeetingApproveEnableSmartSummaryHandler* handler) override
    {
        // Another user requested to enable smart summary
        // Host/cohost receives this callback
        if (handler) {
            unsigned int requesterId = handler->GetSenderUserID();
            // Approve or handle the request
            handler->ContinueApprove();
        }
    }

    void onSmartSummaryStartRequestReceived(
        IMeetingApproveStartSmartSummaryHandler* handler) override
    {
        // Another user requested to start smart summary
        if (handler) {
            unsigned int requesterId = handler->GetSenderUserID();
            handler->Approve();  // or handler->Decline();
        }
    }

    void onSmartSummaryEnableActionCallback(
        IMeetingEnableSmartSummaryActionHandler* handler) override
    {
        // Confirmation dialog for enabling smart summary
        if (handler) {
            const zchar_t* title = handler->GetTipTitle();
            const zchar_t* tip = handler->GetTipString();
            // Show UI with tip, then:
            handler->Confirm();  // or handler->Cancel();
        }
    }
};

// Register the handler
SmartSummaryEventHandler summaryHandler;
summaryHelper->SetEvent(&summaryHandler);
```

---

## 2. AI Query (IMeetingAICompanionQueryHelper)

Ask questions about meeting content and get AI-generated answers.

### Get the Helper

```cpp
IMeetingAICompanionController* aiCtrl = meetingService->GetMeetingAICompanionController();
if (!aiCtrl) return;

IMeetingAICompanionQueryHelper* queryHelper =
    aiCtrl->GetMeetingAICompanionQueryHelper();
if (!queryHelper) return;
```

### Set Up Event Handler

```cpp
class AIQueryEventHandle
```