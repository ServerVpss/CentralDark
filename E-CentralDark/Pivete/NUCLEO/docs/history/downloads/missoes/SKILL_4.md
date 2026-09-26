---
name: expo-deployment
description: Deploying Expo apps to iOS App Store, Android Play Store, web hosting, and API routes
version: 1.0.0
license: MIT
---

# Deployment

This skill covers deploying Expo applications across all platforms using EAS (Expo Application Services).

## References

Consult these resources as needed:

- ./references/workflows.md -- CI/CD workflows for automated deployments and PR previews
- ./references/testflight.md -- Submitting iOS builds to TestFlight for beta testing
- ./references/app-store-metadata.md -- Managing App Store metadata and ASO optimization
- ./references/play-store.md -- Submitting Android builds to Google Play Store
- ./references/ios-app-store.md -- iOS App Store submission and review process

## Quick Start

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Initialize EAS

```bash
npx eas-cli@latest init
```

This creates `eas.json` with build profiles.

## Build Commands

### Production Builds

```bash
# iOS App Store build
npx eas-cli@latest build -p ios --profile production

# Android Play Store build
npx eas-cli@latest build -p android --profile production

# Both platforms
npx eas-cli@latest build --profile production
```

### Submit to Stores

```bash
# iOS: Build and submit to App Store Connect
npx eas-cli@latest build -p ios --profile production --submit

# Android: Build and submit to Play Store
npx eas-cli@latest build -p android --profile production --submit

# Shortcut for iOS TestFlight
npx testflight
```

## Web Deployment

Deploy web apps using EAS Hosting:

```bash
# Deploy to production
npx expo export -p web
npx eas-cli@latest deploy --prod

# Deploy PR preview
npx eas-cli@latest deploy
```

## EAS Configuration

Standard `eas.json` for production deployments:

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Platform-Specific Guides

### iOS

- Use `npx testflight` for quick TestFlight submissions
- Configure Apple credentials via `eas credentials`
- See ./reference/testflight.md for credential setup
- See ./reference/ios-app-store.md for App Store submission

### Android

- Set up Google Play Console service account
- Configure tracks: internal → closed → open → production
- See ./reference/play-store.md for detailed setup

### Web

- EAS Hosting provides preview URLs for PRs
- Production deploys to your custom domain
- See ./reference/workflows.md for CI/CD automation

## Automated Deployments

Use EAS Workflows for CI/CD:

```yaml
# .eas/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  build-ios:
    type: build
    params:
      platform: ios
      profile: production

  submit-ios:
    type: submit
    needs: [build-ios]
    params:
      platform: ios
      profile: production
```

See ./reference/workflows.md for more workflow examples.

## Version Management

EAS manages version numbers automatically with `appVersionSource: "remote"`:

```bash
# Check current versions
eas build:version:get

# Manually set version
eas build:version:set -p ios --build-number 42
```

## Monitoring

```bash
# List recent builds
eas build:list

# Check build status
eas build:view

# View submission status
eas submit:list
```
against the use →
   **Review**, explained.
4. **Quotes are verbatim.** Compare each quotation to the verified `quote` in
  `supportedPropositions`; if not covered, `findInOpinion` with keywords from the quote.
   Verbatim → **OK**. Altered → **Fix** with the correct language. Not found → **Review**
   (keyword search can miss) — never assert a quote is accurate just because the case exists.
5. **Record cites** (federal filings, docket provided). `analyzeDocketReport` to locate the
  entry (missing from the docket → **Fix**), then `analyzeDocketFiling` asking whether the
   cited content is actually in that filing. Present → **OK**; absent or different → **Fix**,
   noting what the filing actually says. No docket / not federal → every record cite is
   **Review** with a comment that it could not be checked without the docket.

### 3. Build the marked-up .docx (the deliverable)

One Word document, rendered through `scripts/legal_docx.js`, in three layers:

**Cover page** (centered, then a page break):

- Title: **Midpage Cite Check**
- Subtitle: the filing name, *Party X v. Party Y*, Case No. XX-XXXXX (from the document's
caption; leave a clearly marked placeholder for anything the document doesn't supply —
never invent it).
- **Scope line** (one or two lines, only what's needed): which portions of the document were
reviewed if not the whole thing (e.g. "Scope of this review: the facts section (¶¶ 8–11,
pp. 5–6) and the argument section (¶¶ 18–27, pp. 10–15)."), plus this fixed sentence:
*Pin-cite page accuracy is not verified.*
- Disclaimer, exactly: *This cite check only flags potential errors detected by Midpage. It
is not intended to replace an attorney cite check. AI makes mistakes and outputs should be
verified independently.*

That is the whole cover — no "what was checked / what was not checked" essay, no methodology
narration, no per-category inventory. The honesty lives where the reader needs it: each
citation's own comment says what was confirmed or why it couldn't be checked, and the chat
report carries the counts and the uncheckable items.

**Exact recreation.** Recreate the uploaded document's substantive content **exactly** —
same text, same order, same headings, same numbering. The unmarked text must read identically
to the original: recreate first, mark up second. You may omit a table of contents, table of
authorities, and the case caption if present — it's the substantive content being checked.
Match the document's structure with the builder API (headings via `B.h1`–`B.h4` or bold
paragraphs to mirror the original's levels; body via `B.p`; numbered paragraphs via
`B.numbered`).

**The markup.** Every finding goes in (a) a Word comment and/or (b) an inline tracked
change — nothing else, and nothing in the body text itself:

```js
const D = require("./scripts/legal_docx.js");
const B = D.builders("brief");          // mirror the original's register
const R = D.review();                   // author: "Midpage Cite Check"

// a comment anchored to a citation:
B.p([ ...R.comment([B.t("Smith v. Jones, 999 F.3d 100 (9th Cir. 2021)")],
      "OK — cited proposition supported (core holding).\nhttps://app.midpage.ai/…") ])

// a redline suggestion (paired with a short comment explaining the basis):
B.p([ B.t("harm must be "), R.del("possible"), R.ins("likely"), B.t(".") ])

// write — passing the comments is required:
B.write("Midpage Cite Check - <filing name>.docx", [cover, body], outDir, { comments: R.comments() });
```

- **Every citation in the inventory gets a comment** — including the clean ones. A verified
cite gets "OK — …" with the verified Midpage link; that is how the reader knows it was
checked rather than skipped. Prefix every comment with its status: `OK`, `Fix`, or
`Review`.
- **Concrete corrections are tracked changes**: a mis-formatted citation (delete the cited
string, insert the tool's exact `citation`), an altered quote (delete the altered words,
insert the verbatim language). Every tracked change gets a companion comment explaining the
basis. Judgment items (won't-resolve, weak support, negative treatment, unverifiable
quote) are **comment-only** — never "fix" what a tool didn't establish.
- **Never silently change the user's text.** Every alteration is a visible tracked change the
attorney can accept or reject.

## Comment format — short, scannable, no fat

Comments are read in a narrow margin pane. Three lines is the target; five is the ceiling.

- **Line 1: the status and the finding**, in plain words. **Then at most 1–3 short
  sentences** of basis — only what the attorney needs to decide. Cut tool narration ("two
  keyword searches found…"), case summaries, and Bluebook commentary.
- **The link goes on its own line at the end.** One link; the verified Midpage URL.
- **Don't restate what the redline already shows.** If the tracked change displays the
  correction, the comment states the status and the basis — not a prose description of the
  edit.
- **Don't fix the brief in the margins.** Substitute authority only if it was verified this
  session, and name it in one line — no editorializing.

> **Too long:** "Fix — the case does not appear to stand for the proposition cited.
> Midpage's analysis of 503 B.R. 571 lists this point among matters the opinion does not
> address, and two keyword searches found no passage applying the preliminary-injunction
> standard with 'particular emphasis' on preventing dissipation…; the only 'dissipation'
> passage quotes the movants' own TRO motion in a footnote. Soundview concerns the automatic
> stay's immediate and extraterritorial effect… Verify the cited pages or substitute
> supported authority — e.g., verified this session: In re Netia Holdings…"
>
> **Right:** "Fix — proposition unsupported. Midpage lists this point as *not addressed*,
> and keyword searches found no matching language; 'dissipation' appears only in a footnote.
> https://app.midpage.ai/document/in-re-soundview-elite-ltd-8496643"

> **Too long:** "OK — case verified; quote verbatim except capitalization. Midpage confirms
> the sentence '…' 'courts' is lowercase mid-sentence in the original; the redline brackets
> the case change ('[C]ourts') per Bluebook R5.2. https://app.midpage.ai/…"
>
> **Right (the redline already shows the bracket fix):** "OK — case verified; quote verbatim
> except capitalization. Confirm against the case:
> https://app.midpage.ai/document/matter-of-m4-enterprises-inc-1912384"

> **WL/LEXIS cite:** "OK — Midpage cannot verify citations to other commercial databases, but
> found this case. The proposition appears supported but worth reviewing.
> https://app.midpage.ai/document/iovate-health-sciences-international-inc-11137541"

### 4. Report back in chat

A few sentences: how many citations were checked, the counts by status, the worst findings
first (unresolvable cites, `doesNotAddress` miscites, negative treatment, altered quotes),
and what could not be checked and why. Then hand over the `.docx`.

## Honesty rules (the point of the skill)

- **OK** only when a tool confirmed it this session. **Fix** only for a concrete tool-found
defect. Everything else — including any cite that won't resolve — is **Review**.
- **Exhaustive means accounted for.** Every citation in the inventory appears in the markup
with a status. If something couldn't be checked (tool failure, no docket, ambiguous cite),
its comment says so explicitly — a silent skip is a lie of omission.
- **Never fabricate or repair a citation from memory.** An unresolvable cite is a finding,
not a gap to fill.
- **Pin cites are out of scope — don't even attempt them.** Never mark a pin cite correct or
incorrect, never "correct" a page number; the cover page says so.
- Be explicit about what a tool confirmed versus what needs the attorney's judgment. This
skill flags; it does not bless.
