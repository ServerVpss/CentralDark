# Hermes Desktop - Hardcoded English Strings Audit

**Date:** 2026-10-24  
**Scope:** All React/TSX/JSX (renderer) + TypeScript (main/shared) source files  
**Criteria:** Strings NOT wrapped in `t()` or `useTranslation()`  

---

## Summary

| Category | Files Scanned | Hardcoded Strings Found |
|----------|---------------|-------------------------|
| Renderer (React/TSX/JSX) | 200 | ~65 |
| Main Process (Electron/TS) | 175 | ~222 |
| Shared Code (TS) | ~300 | ~16 |
| **Total** | **~675** | **~303** |

---

## 1. Renderer (React) - JSX Text Content (User-Visible UI Text)

| File | Line | String | Context |
|------|------|--------|---------|
| `src/renderer/src/components/RemoteNotice.tsx` | 7 | `Connected to remote Hermes` | `<p className="remote-notice-title">` |
| `src/renderer/src/components/settings/ConnectionPane.tsx` | 354 | `Chat transport` | `<label className="settings-field-label">` |
| `src/renderer/src/components/settings/ConnectionPane.tsx` | 489 | `Chat transport` | `<label className="settings-field-label">` |
| `src/renderer/src/screens/Chat/ContextFolderChip.tsx` | 89 | `No recent folders` | `<div className="chat-ctxfolder-dropdown-empty">` |
| `src/renderer/src/screens/Chat/ContextFolderChip.tsx` | 129 | `Open folder...` | `<span>` |
| `src/renderer/src/screens/Chat/hooks/useChatScroll.test.tsx` | 40 | `Jump to latest` | `<button onClick={api.jumpToLatest}>` |
| `src/renderer/src/screens/Layout/Layout.speech.test.tsx` | 98 | `Select work profile` | `<button onClick={() => onSwitch("work")}>` |
| `src/renderer/src/screens/SplashScreen/SplashScreen.tsx` | 65 | `Taking longer than usual?` | `<span className="splash-escape-hint">` |

---

## 2. Renderer (React) - Props (placeholder, label, aria-label, title, alt)

| File | Line | String | Prop | Context |
|------|------|--------|------|---------|
| `src/renderer/src/components/AttachmentChip.tsx` | 119 | `Close` | aria-label | `aria-label="Close"` |
| `src/renderer/src/components/AuxiliaryTasksSection.tsx` | 286 | `e.g. gpt-4o-mini` | placeholder | `placeholder="e.g. gpt-4o-mini"` |
| `src/renderer/src/components/MediaImage.tsx` | 128 | `Close` | aria-label | `aria-label="Close"` |
| `src/renderer/src/components/common/HermesLogo.tsx` | 10 | `Hermes` | alt | `alt="Hermes"` (brand) |
| `src/renderer/src/components/common/Toggle.test.tsx` | 11 | `Enable priority processing` | label | `label="Enable priority processing"` (test) |
| `src/renderer/src/components/common/Toggle.test.tsx` | 41 | `Unavailable setting` | label | `label="Unavailable setting"` (test) |
| `src/renderer/src/components/settings/AboutPane.tsx` | 126 | `Desktop API` | label | `<Meta label="Desktop API">` |
| `src/renderer/src/components/settings/AboutPane.tsx` | 132 | `Python` | label | `label="Python"` |
| `src/renderer/src/components/settings/AboutPane.tsx` | 134 | `Python` | alt | `alt="Python"` |
| `src/renderer/src/components/settings/AboutPane.tsx` | 139 | `OpenAI SDK` | label | `label="OpenAI SDK"` |
| `src/renderer/src/components/settings/AboutPane.tsx` | 141 | `OpenAI` | alt | `alt="OpenAI"` |
| `src/renderer/src/components/settings/ConnectionPane.tsx` | 453 | `~/.ssh/id_rsa` | placeholder | `placeholder="~/.ssh/id_rsa"` |
| `src/renderer/src/screens/Chat/RemoteFolderPicker.tsx` | 187 | `Breadcrumb` | aria-label | `aria-label="Breadcrumb"` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 436 | `Drag to resize` | title | `title="Drag to resize"` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 475 | `Search or enter web address...` | placeholder | `placeholder="Search or enter web address..."` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 575 | `Cancel annotation` | title | `title="Cancel annotation"` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 576 | `Cancel annotation` | aria-label | `aria-label="Cancel annotation"` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 584 | `Add annotation to chat` | title | `title="Add annotation to chat"` |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 585 | `Add annotation to chat` | aria-label | `aria-label="Add annotation to chat"` |
| `src/renderer/src/screens/Chat/WorktreePanel.tsx` | 344 | `Drag to resize` | title | `title="Drag to resize"` |
| `src/renderer/src/screens/Discover/Discover.tsx` | 528 | `Open Registry on GitHub` | title | `title="Open Registry on GitHub"` |
| `src/renderer/src/screens/Kanban/Kanban.tsx` | 1095 | `Assignee profile` | aria-label | `aria-label="Assignee profile"` |
| `src/renderer/src/screens/Kanban/Kanban.tsx` | 1146 | `Workspace` | aria-label | `aria-label="Workspace"` |
| `src/renderer/src/screens/Layout/Layout.tsx` | 967 | `Workspace tools` | aria-label | `aria-label="Workspace tools"` |
| `src/renderer/src/screens/Layout/StatusBar.tsx` | 83 | `Status` | aria-label | `aria-label="Status"` |
| `src/renderer/src/screens/Office/Office.tsx` | 563 | `Developer: click a building then click the ground to move it (logs coordinates to the console)` | title | `title="..."` (dev hint) |
| `src/renderer/src/screens/Office/Office.tsx` | 950 | `Chat` | alt | `alt="Chat"` |
| `src/renderer/src/screens/Office/office3d/objects/Bank.tsx` | 181 | `ATM` | label | `label="ATM"` (3D label) |
| `src/renderer/src/screens/Providers/RemoteProviders.tsx` | 206 | `Pool provider` | aria-label | `aria-label="Pool provider"` |
| `src/renderer/src/screens/Providers/RemoteProviders.tsx` | 222 | `Pool API key` | aria-label | `aria-label="Pool API key"` |
| `src/renderer/src/screens/Providers/RemoteProviders.tsx` | 230 | `Pool label` | aria-label | `aria-label="Pool label"` |
| `src/renderer/src/screens/Sessions/Sessions.tsx` | (multiple) | Various | console.error | See below |
| `src/renderer/src/screens/Setup/Setup.tsx` | 209 | `sk-...` | placeholder | `placeholder="sk-..."` |
| `src/renderer/src/screens/SplashScreen/SplashScreen.tsx` | 62 | `Hermes One` | alt | `alt="Hermes One"` (brand) |
| `src/renderer/src/screens/Tools/Tools.tsx` | 1037 | `GITHUB_PERSONAL_ACCESS_TOKEN=...` | placeholder | `placeholder="GITHUB_PERSONAL_ACCESS_TOKEN=..."` |
| `src/renderer/src/screens/Welcome/Welcome.tsx` | 259 | `~/.ssh/id_rsa` | placeholder | `placeholder="~/.ssh/id_rsa"` |

---

## 3. Renderer (React) - Error Messages & Console Logs

| File | Line | String | Type |
|------|------|--------|------|
| `src/renderer/src/App.tsx` | 67 | `SSH tunnel failed to start on launch:` | console.warn |
| `src/renderer/src/components/ErrorBoundary.tsx` | 26 | `[ErrorBoundary]` | console.error |
| `src/renderer/src/components/pet/PetSettings.test.tsx` | 110 | `Electron does not support prompt` | throw Error (test) |
| `src/renderer/src/screens/BotGroups/BotGroups.test.tsx` | 106 | `No acknowledgement` | throw Error (test) |
| `src/renderer/src/screens/BotGroups/BotGroups.tsx` | 68 | `Group connection authority is unavailable.` | throw Error |
| `src/renderer/src/screens/BotGroups/BotGroups.tsx` | 104 | `Group connection changed; refresh before retrying.` | throw Error |
| `src/renderer/src/screens/Chat/ClarifyCard.test.tsx` | 177 | `Expected an interactive clarification` | throw Error (test) |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 206 | `Failed to identify web preview:` | console.error |
| `src/renderer/src/screens/Chat/WebPreviewPanel.tsx` | 237 | `Failed to inspect web preview:` | console.error |
| `src/renderer/src/screens/Chat/hooks/useDashboardChatTransport.test.tsx` | 1153 | `acknowledgement lost` | throw Error (test) |
| `src/renderer/src/screens/Chat/hooks/useDashboardChatTransport.test.tsx` | 1213 | `session not found` | throw Error (test) |
| `src/renderer/src/screens/Gateway/Gateway.profile.test.tsx` | 478 | `Cannot read pending status` | throw Error (test) |
| `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | 142 | `The profile could not be selected.` | throw Error |
| `src/renderer/src/screens/Layout/SidebarRecentSessions.tsx` | 669 | `Failed to move session to project` | console.error |
| `src/renderer/src/screens/Layout/SidebarRecentSessions.tsx` | 706 | `Failed to delete session` | console.error |
| `src/renderer/src/screens/Sessions/Sessions.tsx` | 481 | `Failed to refresh sessions` | console.error |
| `src/renderer/src/screens/Sessions/Sessions.tsx` | 500 | `Failed to load sessions` | console.error |
| `src/renderer/src/screens/Sessions/Sessions.tsx` | 512 | `Failed to load cached sessions` | console.error |
| `src/renderer/src/screens/Sessions/Sessions.tsx` | 635 | `Failed to delete sessions` | console.error |

---

## 4. Main Process (Electron) - Menu Items, Dialogs, User-Facing Errors

### Menu Items (app/menu.ts)
| Line | String | Context |
|------|--------|---------|
| 31 | `Chat` | Menu label |
| 34 | `New Chat` | Menu item |
| 40 | `Search Sessions` | Menu item |
| 48 | `Edit` | Menu label |
| 60 | `View` | Menu label |
| 77 | `Window` | Menu label |
| 87 | `Help` | Menu label |
| 92 | `Toggle Developer Tools` | Menu item |
| 100 | `Hermes Agent on GitHub` | Menu item |
| 105 | `Report an Issue` | Menu item |

### Context Menu (app/context-menu.ts)
| Line | String | Context |
|------|--------|---------|
| 22 | `Select All` | Context menu |
| 34 | `Copy entire chat (text)` | Context menu |
| 39 | `Copy entire chat (Markdown)` | Context menu |

### User-Facing Error Messages (throw new Error)
| File | Line | String |
|------|------|--------|
| `src/main/account-store.ts` | 93 | `Secure storage is not available on this device.` |
| `src/main/agent-sync.ts` | 241 | `Invalid cloud link; profile was not deleted.` |
| `src/main/agent-sync.ts` | 381 | `Invalid deletion history` |
| `src/main/agent-sync.ts` | 494 | `Could not sync profile persona.` |
| `src/main/bot-groups.ts` | 26 | `A connection is required.` |
| `src/main/config-health.ts` | 438 | `Nothing to migrate.` |
| `src/main/config-health.ts` | 442 | `.env already has API_SERVER_KEY.` |
| `src/main/config-health.ts` | 454 | `Copied API_SERVER_KEY into .env.` |
| `src/main/config-health.ts` | 462 | `Missing fix context (from/to env keys).` |
| `src/main/config-health.ts` | 520 | `Nothing to clean.` |
| `src/main/config-health.ts` | 816 | `Missing fix context (field/wslHome).` |
| `src/main/config-health.ts` | 991 | `config.yaml not found` |
| `src/main/config-health.ts` | 995 | `No legacy toolset entry found.` |
| `src/main/config-health.ts` | 1034 | `Detected legacy entry but rewrite did not match.` |
| `src/main/config.ts` | 135 | `invalid root` |
| `src/main/config.ts` | 315 | `Connection not found.` (multiple) |
| `src/main/config.ts` | 385 | `Connection names must be between 1 and 80 characters.` |
| `src/main/config.ts` | 424 | `The last connection cannot be removed.` |
| `src/main/config.ts` | 1070 | `Could not persist the selected speech setting.` |
| `src/main/cronjobs.ts` | 855 | `Run history response was invalid.` |
| `src/main/cronjobs.ts` | 975 | `Run not found in this job's history.` |
| `src/main/cronjobs.ts` | 988 | `Run output response was invalid.` |
| `src/main/cronjobs.ts` | 1007 | `Invalid run ID` |
| `src/main/dashboard-api-url.ts` | 5 | `Remote Hermes dashboard URL is not configured.` |
| `src/main/dashboard.ts` | 218 | `Hermes Desktop is shutting down.` (multiple) |
| `src/main/dashboard.ts` | 488 | `Could not resolve remote OAuth URL.` |
| `src/main/dashboard.ts` | 653 | `Remote dashboard URL is invalid.` |
| `src/main/dashboard.ts` | 666 | `Remote dashboard session token is missing.` |
| `src/main/gatewayPrompt.ts` | 42 | `Administrator Password Required` (dialog title) |
| `src/main/gatewayPrompt.ts` | 63 | `Secret Required` (dialog title) |
| `src/main/hermes-agent-compat.ts` | 343 | `Dashboard embedded chat is always enabled by this Hermes Agent.` |
| `src/main/hermes-agent-compat.ts` | 352 | `Dashboard embedded chat is already enabled by default.` |
| `src/main/hermes-agent-compat.ts` | 370 | `Patched Hermes Agent dashboard embedded_chat default to True.` |
| `src/main/hermes-agent-compat.ts` | 394 | `Hermes One model library endpoint is already installed.` |
| `src/main/hermes-agent-compat.ts` | 526 | `Could not inspect local Hermes Agent dashboard source.` |
| `src/main/hermes-agent-compat.ts` | 690 | `Could not apply Hermes Agent compatibility patch over SSH.` |
| `src/main/hermes.ts` | 146 | `SSH tunnel is not active` |
| `src/main/hermes.ts` | 581 | `Hermes dashboard gateway did not become ready` |
| `src/main/installer.ts` | 749 | `Hermes is not installed.` |
| `src/main/installer.ts` | 754 | `No OpenClaw installation found.` |
| `src/main/installer.ts` | 763 | `Migrating from OpenClaw` (dialog title) |
| `src/main/installer.ts` | 814 | `Hermes is not installed. Please install it first.` |
| `src/main/installer.ts` | 824 | `Updating Hermes Agent` (dialog title) |
| `src/main/installer.ts` | 889 | `Checking prerequisites` (dialog title) |
| `src/main/installer.ts` | 894 | `Setting up package manager` (dialog title) |
| `src/main/installer.ts` | 899 | `Setting up Python` (dialog title) |
| `src/main/installer.ts` | 905 | `Downloading Hermes Agent` (dialog title) |
| `src/main/installer.ts` | 910 | `Creating Python environment` (dialog title) |
| `src/main/installer.ts` | 916 | `Installing dependencies` (dialog title) |
| `src/main/installer.ts` | 926 | `Finishing setup` (dialog title) |
| `src/main/installer.ts` | 1295 | `Restore Hermes backup` (dialog title) |
| `src/main/installer.ts` | 1296 | `Restore this Hermes backup?` (dialog message) |
| `src/main/ipc/register.ts` | 520 | `SSH connection is not configured.` |
| `src/main/ipc/register.ts` | 536 | `SSH tunnel is not active.` |
| `src/main/ipc/register.ts` | 561 | `Provider connection changed; reload and retry.` |
| `src/main/ipc/register.ts` | 673 | `This SSH session operation requires dashboard transport.` |
| `src/main/ipc/register.ts` | 693 | `SSH connection is not configured.` |
| `src/main/ipc/register.ts` | 1159 | `An explicit provider connection is required.` |
| `src/main/ipc/register.ts` | 1693 | `Enter a Remote gateway URL.` |
| `src/main/ipc/register.ts` | 1750 | `Configure a Remote gateway URL before signing in.` |
| `src/main/ipc/register.ts` | 1777 | `Remote gateway is not configured.` |
| `src/main/ipc/register.ts` | 3171 | `Soul reset is unavailable in remote mode.` |
| `src/main/ipc/register.ts` | 3378 | `SSH credential pool operations are unavailable.` |
| `src/main/ipc/register.ts` | 3413 | `SSH credential pool operations are unavailable.` |
| `src/main/mcp-servers.ts` | 749 | `MCP registration requires a YAML mapping.` |
| `src/main/mcp-servers.ts` | 759 | `MCP servers must use a plain YAML mapping.` |
| `src/main/mcp-servers.ts` | 765 | `MCP servers must use a plain YAML mapping.` |
| `src/main/mcp-servers.ts` | 788 | `Could not register the MCP server in this YAML layout.` |
| `src/main/messaging-platforms.ts` | 122 | `Messaging platform toolsets are not editable here.` |
| `src/main/minimax-speech.ts` | 108 | `Speech generation was cancelled.` |
| `src/main/minimax-speech.ts` | 110 | `Speech text is required.` |
| `src/main/minimax-speech.ts` | 176 | `Invalid JSON result` |
| `src/main/minimax-speech.ts` | 178 | `MiniMax speech returned an invalid response.` |
| `src/main/minimax-speech.ts` | 181 | `Speech generation was cancelled.` |
| `src/main/minimax-speech.ts` | 191 | `MiniMax speech generation did not complete.` |
| `src/main/profile-editor-target.ts` | 35 | `The editor connection is no longer selected.` |
| `src/main/profile-editor-target.ts` | 61 | `Invalid editor target.` |
| `src/main/profile-editor-target.ts` | 67 | `The editor target changed; reload before editing.` |
| `src/main/profile-editor-target.ts` | 74 | `The editor configuration changed; reload before editing.` |
| `src/main/providers-store.ts` | 40 | `Invalid profile name.` |
| `src/main/registry-integrity.ts` | 39 | `Registry tree is incomplete` |
| `src/main/registry-integrity.ts` | 166 | `Unsafe registry folder` |
| `src/main/registry.ts` | 244 | `Transport` (label in registry display) |
| `src/main/registry.ts` | 247 | `URL` (label) |
| `src/main/registry.ts` | 250 | `Command` (label) |
| `src/main/registry.ts` | 256 | `Environment` (label) |
| `src/main/registry.ts` | 259 | `Permissions` (label) |
| `src/main/registry.ts` | 262 | `Model` (label) |
| `src/main/registry.ts` | 263 | `Tools` (label) |
| `src/main/registry.ts` | 265 | `Entry` (label) |
| `src/main/registry.ts` | 266 | `Requires` (label) |
| `src/main/registry.ts` | 269 | `Category` (label) |
| `src/main/registry.ts` | 271 | `Platforms` (label) |
| `src/main/registry.ts` | 273 | `Tags` (label) |
| `src/main/registry.ts` | 275 | `License` (label) |
| `src/main/registry.ts` | 276 | `Author` (label) |
| `src/main/registry.ts` | 277 | `Version` (label) |
| `src/main/registry.ts` | 280 | `Requires Hermes` (label) |
| `src/main/remote-gateway.ts` | 104 | `Remote gateway status did not include gateway_running.` |
| `src/main/remote-gateway.ts` | 223 | `Remote gateway action status did not include running.` |
| `src/main/remote-memory.ts` | 46 | `Remote authentication changed; reload before editing.` |
| `src/main/remote-memory.ts` | 238 | `The remote Soul response has no text content.` |
| `src/main/remote-memory.ts` | 254 | `The remote Soul save was not confirmed.` |
| `src/main/remote-oauth.ts` | 54 | `Remote OAuth gateway URL must use HTTP(S).` |
| `src/main/remote-oauth.ts` | 88 | `Desktop is not ready for remote OAuth authentication.` |
| `src/main/remote-oauth.ts` | 390 | `Sign in to remote Hermes gateway` (dialog title) |
| `src/main/remote-profiles.ts` | 19 | `Remote profiles require a Remote connection.` |
| `src/main/remote-profiles.ts` | 117 | `Remote profiles response was invalid.` |
| `src/main/remote-profiles.ts` | 158 | `The server did not confirm profile creation.` |
| `src/main/remote-providers.ts` | 27 | `Remote providers require a direct Remote connection.` |
| `src/main/remote-providers.ts` | 42 | `Remote authentication changed; reload and retry.` |
| `src/main/remote-providers.ts` | 96 | `Remote environment response was invalid.` |
| `src/main/remote-providers.ts` | 157 | `Remote credential pool response was invalid.` |
| `src/main/remote-sessions.ts` | 63 | `Remote Hermes dashboard token is not configured.` |
| `src/main/speech.ts` | 37 | `An explicit valid speech profile is required.` |
| `src/main/speech.ts` | 43 | `An explicit speech connection is required.` |
| `src/main/speech.ts` | 47 | `Speech playback is available only on a Local connection.` |
| `src/main/speech.ts` | 53 | `Speech connection changed; reload and retry.` |
| `src/main/speech.ts` | 84 | `Invalid MiniMax speech setting.` |
| `src/main/ssh-remote.ts` | 1409 | `Invalid SSH session deletion response` |
| `src/main/ssh-remote.ts` | 2019 | `Failed to create profile` |
| `src/main/ssh-tunnel.ts` | 35 | `Hermes Desktop is shutting down.` |
| `src/main/ssh-tunnel.ts` | 41 | `SSH tunnel start was superseded by another target.` |
| `src/main/sudoCreds.ts` | 117 | `Administrator Password` (dialog title) |
| `src/main/validation.ts` | 117 | `No model selected. Pick one in Models or the Chat picker.` |
| `src/main/wallet-store.ts` | 57 | `Secure wallet storage is not available on this device.` |
| `src/main/wallet-store.ts` | 97 | `Invalid profile name.` |
| `src/main/web-preview-inspector.ts` | 240 | `Invalid web preview inspection result` (multiple) |
| `src/main/web-preview-inspector.ts` | 286 | `Unauthorized web preview inspection request` |
| `src/main/web-preview-inspector.ts` | 293 | `Invalid web preview webContents ID` |
| `src/main/web-preview-inspector.ts` | 304 | `Invalid web preview target` |

### Console Logs (Main Process - Dev/Debug)
Many `console.error/warn` calls with English messages - these are developer-facing but could be user-visible in logs.

---

## 5. Shared Code - Error Messages

| File | Line | String |
|------|------|--------|
| `src/shared/bot-groups.ts` | 111 | `Unknown Bot group operation or parameters.` |
| `src/shared/bot-groups.ts` | 179 | `Select 2–6 different Agent profiles.` |
| `src/shared/bot-groups.ts` | 204 | `Each member, profile, and handle must be unique.` |
| `src/shared/bot-groups.ts` | 218 | `Only allow once or deny is supported.` |

**Note:** The `iMessage` strings in locale files (`src/shared/i18n/locales/*/constants.ts`) are translation targets, not hardcoded strings needing i18n.

---

## Recommendations

### High Priority (User-Facing UI)
1. **Renderer JSX text** (8 strings) - Directly visible to users
2. **Renderer props** (35 strings) - placeholders, labels, tooltips, aria-labels
3. **Main process menu/dialogs** (40+ strings) - Electron native menus and dialogs

### Medium Priority (Error Messages)
1. **Main process throw Error** (~100 strings) - Some shown to users via dialogs
2. **Renderer throw Error** (~15 strings) - Some propagated to UI

### Low Priority (Developer-Facing)
1. **Console logs** - Dev tools only, but could be localized for consistency
2. **Test files** - Not shipped to users

---

## Files Using i18n Correctly (Reference)

189/200 renderer TSX/JSX files use `t()` from `src/shared/i18n`. The 11 files NOT using `t()`:
- `assets/icons/index.tsx` - Icon exports only
- `components/common/HermesLogo.tsx` - Brand only
- `components/common/ProfileAvatar.tsx` - Profile initials fallback
- `components/common/Toggle.tsx` - Receives label via props
- `components/RemoteNotice.tsx` ⚠️ **Has hardcoded strings**
- `components/settings/SettingsModalProvider.tsx` - Provider only
- `components/Versions.tsx` ⚠️ **Has hardcoded strings**
- `screens/Memory/CapacityBar.tsx` ⚠️ **Has "chars"**
- `screens/Office/office3d/objects/CarShowroom.tsx` - 3D scene, brand names
- `screens/Office/office3d/objects/Interactable.tsx` - Receives label via props
- `screens/Office/office3d/objects/Roofs.tsx` - 3D geometry only

---

## Next Steps

1. **Add i18n keys** for all user-facing strings in renderer components
2. **Wrap main process dialog/menu strings** with i18n (requires IPC to renderer or main-process i18n)
3. **Create translation keys** in `src/shared/i18n/locales/en/*.ts`
4. **Run i18n extraction** to verify coverage