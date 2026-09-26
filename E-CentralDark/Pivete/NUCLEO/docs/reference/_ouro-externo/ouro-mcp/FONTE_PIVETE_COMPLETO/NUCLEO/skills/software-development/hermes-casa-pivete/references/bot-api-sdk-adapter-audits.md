# Bot API / SDK / Adapter Compatibility Audits

Use this reference when Pivete asks for a critical compatibility review of a messaging API, installed SDK, Hermes adapter, and live profile.

## Keep five evidence layers separate

1. **Official API:** fetch the current authoritative docs/changelog; record release version and date.
2. **Installed SDK:** inspect package version, declared API compatibility constants, method signatures, classes, and parameter-conversion source.
3. **Hermes implementation:** inspect public adapter methods and the complete call chain, including CLI/standalone paths that may bypass the adapter.
4. **Effective configuration:** load config through Hermes's own loader; raw YAML location/default assumptions are insufficient.
5. **Loaded runtime:** compare gateway process start time with source/config modification times. Disk support may not be loaded yet.

## Required classifications

Use one of these labels per capability:

- **Native/typed:** SDK models the method/type/parameter and Hermes invokes it.
- **Raw escape hatch:** official API supports it, SDK lacks typed support, and Hermes uses a generic request method or untyped kwargs.
- **Partial/fallback:** a real path exists only for some formats, chats, fields, configurations, or error classes.
- **Absent in Hermes:** SDK may support it, but the adapter neither exposes nor invokes it.
- **Configured off:** implementation exists but effective profile flags prevent normal execution.
- **Not loaded:** source/config changed after the current process started.

Never call a generic raw request “native SDK support.” Never infer adapter exposure merely because an internal branch can call the SDK method.

## Read-only probes

- Use package metadata, compatibility constants, `hasattr`, signatures, and SDK source inspection.
- Capture the SDK's exact endpoint/payload with a mock or transport subclass. This reveals conversions such as a legacy reply ID becoming a modern reply object on the wire.
- Instantiate the real adapter with async mocks and vary input type, file extension, chat type, config, and failure class.
- Support absence claims with both static inspection and a boundary probe where practical. Example: a file-ID-looking string reveals whether Hermes forwards it or rejects it as a local path.
- Probe API limits with the service's counting convention; Python `len()` can hide UTF-16 overflow.
- Re-read Git status, diff statistics, and file timestamps immediately before the verdict because parallel agents may change the snapshot during the audit.

A custom assertion harness proves only the exercised routes. Call it an **audit harness**, not “the test suite.” Do not claim live service validation unless an intentional real request was made.

## Semantic traps

- A classic `sendVoice` implementation is not support for a newer `InputMediaVoiceNote` type.
- `parse_mode` support is not explicit outbound `entities`/`caption_entities` support.
- Uploading a local file is not URL support or server-side `file_id` reuse.
- A feature can be implemented on disk, disabled by profile flags, and absent from the loaded gateway simultaneously.
- API release identifiers are not decimal quantities; name concrete missing releases/features rather than subtracting versions.
- Documentation may accurately state when a feature was introduced while omitting later additions.

## Report structure

1. Lead with the version gap and one-sentence verdict.
2. Matrix: official API × installed SDK × Hermes adapter × classification.
3. Separate implementation from effective profile/runtime state.
4. List critical schema/semantic gaps and operational risks.
5. State verification scope, live-call status, and pre-existing/concurrent working-tree changes.
