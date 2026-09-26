# COMANDO - canvas-server.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\canvas-server.mjs
**SHA:** 0b95af11bd622357
**Timestamp:** 2026-08-28T02:37:56.284017
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const NEW_SESSION_BRANCH_PROMPT = "Create a new branch for the current session.";
- const targetStart = Math.max(0, targetAnchor - 1 - THREAD_DIFF_FALLBACK_RADIUS);
- const sourceStart = Math.max(0, sourceAnchor - 1 - THREAD_DIFF_FALLBACK_RADIUS);
- let start = selectedIndexes[0];
- leftFileStart: tracking.origLeftFileStart || current.leftFileStart,
- rightFileStart: tracking.origRightFileStart || current.rightFileStart,
- await copilotSession.send({ prompt: buildCommentFixPrompt(pullRequest, thread, comment) });
- await copilotSession.send({ prompt: NEW_SESSION_BRANCH_PROMPT });

### Ouro Bruto (primeiros 5000 chars)
```
import { createServer } from "node:http";
import { execFile, spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { CanvasError } from "@github/copilot-sdk/extension";
import {
    encodePathPart,
    hasRenderableContent,
    normalizeMultilineFieldFormat,
    normalizeRichText,
    normalizeString,
} from "./common.mjs";
import {
    AGENCY_AUTH_ENABLED,
    PULL_REQUEST_REVIEW_VOTING_ENABLED,
} from "./ui/feature-flags.mjs";
// The write policy lives under ui/ because the browser editor enforces it too, and
// only files under that directory are served to the canvas. It is DOM-free so the
// same module loads here.
import { validateEditableHtml, validateWriteHtml } from "./ui/rich-text-policy.mjs";
import {
    CONNECTION_SOURCE_REMOTE,
    CONNECTION_WRITE_FAILED,
    clearConnectionDefault,
    clearConnectionPreference,
    normalizeConnection,
    readConnectionPreference,
    resolveConnections,
    selectConnection,
    writeConnectionPreference,
} from "./connection.mjs";
import { mapPolicyEvaluation, mapPullRequest, parsePullRequestUrl, selectCurrentBranchPullRequest } from "./pull-request.mjs";
import {
    hasWorkItemReference,
    mapWorkItem,
    mapWorkItemDevelopment,
    mapWorkItemDetail,
    parseWorkItemTemplate,
    relatedWorkItemIds,
    resolveWorkItemReference,
} from "./work-item.mjs";

const DEFAULT_API_VERSION = "7.1";
const PREVIEW_API_VERSION = "7.1-preview";
const DEFAULT_STATUS = "active";
const DEFAULT_LIST_LIMIT = 5;
const HOME_LIST_LIMIT = 10;
const NEW_SESSION_BRANCH_PROMPT = "Create a new branch for the current session.";
// How many recently-changed work items the organization-scope query pulls back
// before filtering out the closed ones. Capped by the 200-id limit of the work
// item batch-get endpoint.
const ORG_WORK_ITEM_CANDIDATE_LIMIT = 200;
// Organizations and profiles are served by VS SaaS Platform Services, a
// different host from the per-organization dev.azure.com URLs.
const VSSPS_BASE_URL = "https://app.vssps.visualstudio.com";
const PROJECT_LIST_LIMIT = 500;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const TERMINAL_WORK_ITEM_STATE_CATEGORIES = new Set(["completed", "removed"]);
const AZUREAUTH_TIMEOUT_MINUTES = "15";
// A silent attempt must never hold /api/config open waiting on a person. A warm
// AzureAuth cache returns in well under a second, so anything past this budget
// means the acquisition escalated to a prompt and should be abandoned. AzureAuth
// is told the same budget so it does not believe it may prompt for 15 minutes
// while this side kills it after ten seconds.
const AZUREAUTH_SILENT_TIMEOUT_MINUTES = "1";
const AZUREAUTH_SILENT_TIMEOUT_MS = 10 * 1000;
const AZURE_DEVOPS_RESOURCE_ID = "499b84ac-1321-427f-aa17-267ca6975798";
const AZURE_AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const AZURE_PUBLIC_CLIENT_ID = "04b07795-8ddb-461a-bbee-02f9e1bf7b46";
const AZURE_DEVOPS_SCOPE = `${AZURE_DEVOPS_RESOURCE_ID}/.default offline_access openid profile`;
const AZURE_OAUTH_LOOPBACK_HOST = "localhost";
const EXTENSION_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_EXTENSION_REPO_ROOT = resolve(EXTENSION_DIR, "..", "..");
const UI_DIR = resolve(EXTENSION_DIR, "ui");
const EXTENSION_VERSION = loadExtensionVersion();
const execFileAsync = promisify(execFile);
const staticAssetCache = new Map();
const workItemStateFilterCache = new Map();
const workItemTypeAppearanceCache = new Map();
let azureAuthTokenCache = null;
let browserTokenCache = null;
let silentAgencyAuthAttempt = null;
// Bumped on sign-out so a sign-in still in flight cannot write its result
// afterwards. Sign-in work outlives the request that started it.
let authGeneration = 0;
let copilotSession;

function loadExtensionVersion() {
    try {
        const manifest = JSON.parse(
            readFileSync(join(PROJECT_EXTENSION_REPO_ROOT, ".claude-plugin", "plugin.json"), "utf8"),
        );
        const version = normalizeString(manifest?.version);
        return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version) ? version : "unknown";
    } catch {
        return "unknown";
    }
}

function parseAzureDevOpsRemoteUrl(remoteUrl) {
    const trimmed = normalizeString(remoteUrl).replace(/\.git$/i, "");
    if (!trimmed) {
        return null;
    }

    const sshMatch = trimmed.match(/^(?:[^@]+@)?ssh\.dev\.azure\.com:v3\/([^/]+)\/([^/]+)\/(.+)$/i);
    if (sshMatch) {
        const [, organization, project, repository] = sshMatch;
        return {
            organization,
            project,
            repository,
            url: `https://dev.azure.com/${encodePathPart(organization)}/${encodePa
```