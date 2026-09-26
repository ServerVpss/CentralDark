# COMANDO - tabs.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\tabs.test.mjs
**SHA:** fb20c494f3d90418
**Timestamp:** 2026-08-28T02:37:57.034242
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const firstRun = await boot({ remote: { isAzureDevOps: false }, connections: [] });

### Contratos
- const gate = state.hold?.[id];
- const gate = state.holdWorkItems?.[id];

### Gaps
- assert.match(styles, /button\.comment-fix-button\s*\{[^}]*gap: 6px/);

### Ouro Bruto (primeiros 5000 chars)
```
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PULL_REQUEST_REVIEW_VOTING_ENABLED } from "./ui/feature-flags.mjs";
import { workItemTypeColor } from "./ui/pull-request-actions.mjs";

// These extensions ship without node_modules, so jsdom is not guaranteed to be
// present. Skip rather than fail when it is missing, and run with:
//   npm install jsdom && node --test tabs.test.mjs
let JSDOM;
try {
    ({ JSDOM } = await import("jsdom"));
} catch {
    JSDOM = null;
}
const describeDom = { skip: JSDOM ? false : "jsdom is not installed" };

const html = readFileSync(new URL("./ui/index.html", import.meta.url), "utf8");
const styles = readFileSync(new URL("./ui/styles.css", import.meta.url), "utf8");

// Drives the real app.mjs against a real DOM through the same controls a user
// clicks. Nothing is exported from the app for testing.
function makePullRequest(state, id) {
    return {
        id,
        title: `PR ${id}`,
        status: state.prStatus || "active",
        isDraft: Boolean(state.prDraft),
        webUrl: `https://dev.azure.com/example/project/_git/repo/pullrequest/${id}`,
        sourceRefName: "refs/heads/feature",
        targetRefName: "refs/heads/main",
        description: state.prDescription || "",
        threads: [],
        commentThreads: state.commentThreads || [],
        creationDate: state.creationDate || "",
        createdBy: state.prCreatedBy || "Avery Anderson",
        reviewers: state.reviewers || [],
        policyEvaluations: state.policyEvaluations || [],
        mergeStatus: state.mergeStatus || "succeeded",
        currentUser: state.currentUser === undefined ? { id: "me", displayName: "Me" } : state.currentUser,
        commits: [],
        workItems: [],
    };
}

function makeFetch(state) {
    const connection = {
        source: "remote",
        organization: state.organization || "example",
        project: state.project === undefined ? "project" : state.project,
        repositoryId: "repo",
        isDefault: false,
        isRemote: true,
        requiresProject: state.project === "",
    };
    return async (url, options = {}) => {
        const path = String(url);
        const json = (body) => ({ ok: true, json: async () => body });
        if (path.includes("/api/config")) {
            const response = json({
                apiNonce: "n",
                authProcess: state.configAuthProcess || null,
                config: {
                    auth: state.configAuth || {
                        isAuthenticated: !state.configAuthProcess,
                        authType: state.configAuthProcess ? "none" : "azureauth",
                        azureAuthDiscovery: { selected: "x" },
                    },
                    remote: state.remote === undefined
                        ? { isAzureDevOps: state.isAzureDevOps !== false }
                        : state.remote,
                    connections: state.connections === undefined ? [connection] : state.connections,
                    hasDefaultConnection: Boolean(state.hasDefaultConnection),
                    branch: state.branch || "",
                    project: "Project",
                    repositoryId: "repo-id",
                    pullRequestReference: Boolean(state.pullRequestReference),
                    workItemReference: Boolean(state.workItemReference),
                    azureDevOpsMcpAvailable: Boolean(state.azureDevOpsMcpAvailable),
                    extensionVersion: "test",
                },
            });
            return state.holdConfig ? state.holdConfig.then(() => response) : response;
        }
        if (path.includes("/api/auth/status")) {
            state.authStatusRequests = (state.authStatusRequests || 0) + 1;
            const response = json(state.authStatus || {
                authProcess: { provider: "azureauth", mode: "silent", status: "succeeded", output: "Authenticated with AzureAuth." },
                auth: { isAuthenticated: true, authType: "azureauth", azureAuthDiscovery: { selected: "x" } },
            });
            return state.holdAuthStatus ? state.holdAuthStatus.then(() => response) : response;
        }
        if (path.includes("/api/current-pull-request")) {
            return json({
                pullRequest: state.leadPr || null,
                sourceRefName: `refs/heads/${state.branch || "feature"}`,
                canCreatePullRequest: false,
                isDefaultBranch: Boolean(state.defaultBranch),
                repository: { name: "repo" },
                relatedWorkItems: {
                    workItems: (state.relatedWorkItems || []).map((id) => ({
                        id,
                        title: `WI ${id}`,
                        type: "Task",
                        state: "Active",
                    })),
                    error: state.relatedWorkItemsError || "",
                },
                development: {
            
```