(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/constants/cliToolsGrokBuild.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Grok Build CLI tool registry entry — extracted from cliTools.ts to keep the
// frozen registry file under its file-size ratchet cap (config/quality/file-size-baseline.json).
__turbopack_context__.s([
    "GROK_BUILD_CLI_TOOL",
    ()=>GROK_BUILD_CLI_TOOL
]);
const GROK_BUILD_CLI_TOOL = {
    id: "grok-build",
    name: "Grok Build",
    icon: "terminal",
    color: "#1DA1F2",
    description: "xAI Grok Build TUI coding agent — custom provider via ~/.grok/config.toml",
    docsUrl: "https://x.ai/cli",
    configType: "custom",
    category: "code",
    vendor: "xAI",
    acpSpawnable: false,
    baseUrlSupport: "full",
    defaultCommand: "grok"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/constants/cliTools.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLI_TOOLS",
    ()=>CLI_TOOLS,
    "getCliTool",
    ()=>getCliTool,
    "listCliTools",
    ()=>listCliTools
]);
// CLI Tools configuration
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$cliToolsGrokBuild$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/cliToolsGrokBuild.ts [app-client] (ecmascript)");
;
;
const _cc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getClaudeCodeDefaultModels"])();
const createCliModel = (id, name)=>({
        id,
        name,
        alias: id
    });
const CLI_TOOLS = {
    claude: {
        id: "claude",
        name: "Claude Code",
        image: "/providers/claude.svg",
        color: "#D97757",
        description: "Anthropic Claude Code CLI — ANTHROPIC_BASE_URL points to OmniRoute",
        docsUrl: "https://docs.anthropic.com/en/docs/claude-code/overview",
        configType: "env",
        category: "code",
        vendor: "Anthropic",
        acpSpawnable: true,
        baseUrlSupport: "full",
        envVars: {
            baseUrl: "ANTHROPIC_BASE_URL",
            model: "ANTHROPIC_MODEL",
            fableModel: "ANTHROPIC_DEFAULT_FABLE_MODEL",
            opusModel: "ANTHROPIC_DEFAULT_OPUS_MODEL",
            sonnetModel: "ANTHROPIC_DEFAULT_SONNET_MODEL",
            haikuModel: "ANTHROPIC_DEFAULT_HAIKU_MODEL"
        },
        modelAliases: [
            "default",
            "fable",
            "sonnet",
            "opus",
            "haiku",
            "opusplan"
        ],
        settingsFile: "~/.claude/settings.json",
        defaultCommand: "claude",
        defaultModels: [
            {
                id: "model",
                name: "Default Model",
                alias: "model",
                envKey: "ANTHROPIC_MODEL",
                defaultValue: _cc.sonnet ? `cc/${_cc.sonnet}` : "cc/claude-sonnet-4-5-20250929",
                isTopLevel: true
            },
            {
                id: "fable",
                name: "Claude Fable",
                alias: "fable",
                envKey: "ANTHROPIC_DEFAULT_FABLE_MODEL",
                defaultValue: _cc.fable ? `cc/${_cc.fable}` : "cc/claude-fable-5",
                isTopLevel: true
            },
            {
                id: "opus",
                name: "Claude Opus",
                alias: "opus",
                envKey: "ANTHROPIC_DEFAULT_OPUS_MODEL",
                defaultValue: _cc.opus ? `cc/${_cc.opus}` : "cc/claude-opus-4-5-20251101"
            },
            {
                id: "sonnet",
                name: "Claude Sonnet",
                alias: "sonnet",
                envKey: "ANTHROPIC_DEFAULT_SONNET_MODEL",
                defaultValue: _cc.sonnet ? `cc/${_cc.sonnet}` : "cc/claude-sonnet-4-5-20250929"
            },
            {
                id: "haiku",
                name: "Claude Haiku",
                alias: "haiku",
                envKey: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
                defaultValue: _cc.haiku ? `cc/${_cc.haiku}` : "cc/claude-haiku-4-5-20251001"
            }
        ]
    },
    codex: {
        id: "codex",
        name: "OpenAI Codex CLI",
        image: "/providers/codex.svg",
        color: "#10A37F",
        description: "OpenAI Codex CLI — OpenAI-compatible base URL targets OmniRoute",
        docsUrl: "https://github.com/openai/codex",
        configType: "custom",
        category: "code",
        vendor: "OpenAI",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "codex"
    },
    droid: {
        id: "droid",
        name: "Factory Droid",
        image: "/providers/droid.svg",
        color: "#00D4FF",
        description: "Factory AI Droid — BYOK assistant with configurable endpoint",
        docsUrl: "/docs?section=cli-tools&tool=droid",
        configType: "custom",
        category: "code",
        vendor: "Factory AI",
        acpSpawnable: false,
        baseUrlSupport: "partial",
        defaultCommand: "droid"
    },
    openclaw: {
        id: "openclaw",
        name: "Open Claw",
        image: "/providers/openclaw.svg",
        color: "#FF6B35",
        description: "Open Claw — open-source multi-backend agent CLI (OSS, P. Steinberger)",
        docsUrl: "/docs?section=cli-tools&tool=openclaw",
        configType: "custom",
        category: "agent",
        vendor: "OSS (P. Steinberger)",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "openclaw"
    },
    cursor: {
        id: "cursor",
        name: "Cursor",
        image: "/providers/cursor.svg",
        color: "#000000",
        // Cursor App routes via its own cloud server — local base URL not supported.
        // Use cursor-cli entry for headless/agent CLI mode with custom endpoint.
        description: "Cursor AI Code Editor — Cloud Endpoint required (use cursor-cli for CLI mode)",
        docsUrl: "https://docs.cursor.com/settings/models",
        configType: "guide",
        category: "code",
        vendor: "Anysphere",
        acpSpawnable: false,
        baseUrlSupport: "none",
        requiresCloud: true,
        defaultCommands: [
            "agent",
            "cursor"
        ],
        notes: [
            {
                type: "warning",
                text: "Requires Cursor Pro account to use this feature."
            },
            {
                type: "cloudCheck",
                text: "Cursor routes requests through its own server, so local endpoint is not supported. Please enable Cloud Endpoint in Settings."
            }
        ],
        guideSteps: [
            {
                step: 1,
                title: "Open Settings",
                desc: "Go to Settings → Models"
            },
            {
                step: 2,
                title: "Enable OpenAI API",
                desc: 'Enable "OpenAI API key" option'
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 5,
                title: "Add Custom Model",
                desc: 'Click "View All Model" → "Add Custom Model"'
            },
            {
                step: 6,
                title: "Select Model",
                type: "modelSelector"
            }
        ]
    },
    cline: {
        id: "cline",
        name: "Cline",
        image: "/providers/cline.svg",
        color: "#00D1B2",
        description: "Cline — open-source VS Code coding agent with OpenAI-compatible base URL",
        docsUrl: "https://docs.cline.bot/",
        configType: "custom",
        category: "code",
        vendor: "OSS",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "cline"
    },
    kilo: {
        id: "kilo",
        name: "Kilo Code",
        image: "/providers/kilocode.svg",
        color: "#FF6B6B",
        description: "Kilo Code — VS Code AI assistant with custom base URL support",
        docsUrl: "/docs?section=cli-tools&tool=kilocode",
        configType: "custom",
        category: "code",
        vendor: "Kilo-Org",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "kilocode"
    },
    continue: {
        id: "continue",
        name: "Continue",
        image: "/providers/continue.svg",
        color: "#7C3AED",
        description: "Continue — open-source AI coding assistant with full provider config",
        docsUrl: "https://docs.continue.dev/",
        configType: "guide",
        category: "code",
        vendor: "continue.dev",
        acpSpawnable: false,
        baseUrlSupport: "full",
        guideSteps: [
            {
                step: 1,
                title: "Open Config",
                desc: "Open Continue configuration file"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Select Model",
                type: "modelSelector"
            },
            {
                step: 4,
                title: "Add Model Config",
                desc: "Add the following configuration to your models array:"
            }
        ],
        codeBlock: {
            language: "json",
            code: `{
  "apiBase": "{{baseUrl}}",
  "title": "{{model}}",
  "model": "{{model}}",
  "provider": "openai",
  "apiKey": "{{apiKey}}"
}`
        }
    },
    antigravity: {
        id: "antigravity",
        name: "Antigravity",
        color: "#4285F4",
        description: "Google Antigravity IDE — MITM intercept required (plan 11 backlog)",
        docsUrl: "/docs?section=cli-tools&tool=antigravity",
        // configType:"mitm" — fluxo MITM; baseUrlSupport:"none" → excluído das listas,
        // acessível só via legacy /[id] route após F8
        configType: "mitm",
        category: "code",
        vendor: "Google",
        acpSpawnable: false,
        baseUrlSupport: "none",
        modelAliases: [
            "gemini-3.6-flash-high",
            "gemini-3.6-flash-medium",
            "gemini-3.6-flash-low",
            "claude-opus-4-6-thinking",
            "claude-sonnet-4-6",
            "gemini-pro-agent",
            "gemini-3.1-pro-low",
            "gemini-3-flash-agent",
            "gemini-3.5-flash-low",
            "gemini-3.5-flash-extra-low",
            "gpt-oss-120b-medium"
        ],
        defaultModels: [
            createCliModel("gemini-3.6-flash-high", "Gemini 3.6 Flash High"),
            createCliModel("gemini-3.6-flash-medium", "Gemini 3.6 Flash Medium"),
            createCliModel("gemini-3.6-flash-low", "Gemini 3.6 Flash Low"),
            createCliModel("gemini-pro-agent", "Gemini 3.1 Pro High"),
            createCliModel("gemini-3.1-pro-low", "Gemini 3.1 Pro Low"),
            createCliModel("gemini-3-flash-agent", "Gemini 3.5 Flash High"),
            createCliModel("gemini-3.5-flash-low", "Gemini 3.5 Flash Medium"),
            createCliModel("gemini-3.5-flash-extra-low", "Gemini 3.5 Flash Low"),
            createCliModel("claude-sonnet-4-6", "Claude Sonnet 4.6"),
            createCliModel("claude-opus-4-6-thinking", "Claude Opus 4.6 Thinking"),
            createCliModel("gpt-oss-120b-medium", "GPT OSS 120B Medium")
        ]
    },
    copilot: {
        id: "copilot",
        name: "GitHub Copilot",
        image: "/providers/copilot.svg",
        color: "#1F6FEB",
        // D-nota: copilot suporta COPILOT_PROVIDER_BASE_URL desde v1.0.19+
        description: "GitHub Copilot Chat — VS Code extension with COPILOT_PROVIDER_BASE_URL support",
        docsUrl: "https://code.visualstudio.com/docs/copilot/overview",
        configType: "custom",
        category: "code",
        vendor: "GitHub / Microsoft",
        acpSpawnable: false,
        baseUrlSupport: "full"
    },
    opencode: {
        id: "opencode",
        name: "OpenCode",
        imageLight: "/providers/opencode-light.svg",
        imageDark: "/providers/opencode-dark.svg",
        icon: "terminal",
        color: "#FF6B35",
        description: "OpenCode — AI coding agent CLI by Anomaly (terminal, multi-provider)",
        docsUrl: "/docs?section=cli-tools&tool=opencode",
        configType: "guide",
        category: "code",
        vendor: "Anomaly",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "opencode",
        modelSelectionMode: "multiple",
        hideComboModels: true,
        previewConfigMode: "opencode",
        notes: [
            {
                type: "warning",
                text: "Config path: ~/.config/opencode/opencode.json on all platforms (Windows: %USERPROFILE%\\\\.config\\\\opencode\\\\opencode.json)"
            },
            {
                type: "warning",
                text: 'Thinking variant example: opencode run "implement this feature" --model omniroute/claude-sonnet-4-5-thinking --variant high'
            }
        ],
        guideSteps: [
            {
                step: 1,
                title: "Install OpenCode",
                desc: "Install via npm: npm install -g opencode-ai"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Set Base URL",
                desc: "opencode config set baseUrl {{baseUrl}}"
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            },
            {
                step: 5,
                title: "Use Thinking Variant",
                desc: "For thinking models, run with --variant high/low/max (example command below)."
            }
        ],
        codeBlock: {
            language: "json",
            code: `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "omniroute": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "OmniRoute",
      "options": {
        "baseURL": "{{baseUrl}}",
        "apiKey": "{{apiKey}}"
      },
      "models": {
        "{{model}}": { "name": "{{model}}" },
        "claude-sonnet-4-5-thinking": { "name": "claude-sonnet-4-5-thinking" },
        "gemini-3.1-pro-high": { "name": "gemini-3.1-pro-high" },
        "gemini-3-flash": { "name": "gemini-3-flash" }
      }
    }
  }
}`
        }
    },
    // hermes (simple guide) — category: "code", baseUrlSupport: "none"
    // Excluded from the CLI Code's list (not in D15 19-entry list).
    // The advanced multi-role agent is "hermes-agent" (category: "agent", baseUrlSupport: "full").
    // Legacy /[id] route still renders this card after F8.
    hermes: {
        id: "hermes",
        name: "Hermes",
        icon: "terminal",
        color: "#8B5CF6",
        description: "Nous Research Hermes — generic OpenAI-compatible setup (use hermes-agent for full agent)",
        docsUrl: "/docs?section=cli-tools&tool=hermes",
        configType: "guide",
        category: "code",
        vendor: "Nous Research",
        acpSpawnable: false,
        baseUrlSupport: "none",
        defaultCommand: "hermes",
        guideSteps: [
            {
                step: 1,
                title: "Open Hermes Config",
                desc: "Open your Hermes configuration file or create one if this is the first run."
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            },
            {
                step: 5,
                title: "Save Provider Block",
                desc: "Use the JSON block below as the OpenAI-compatible provider definition for OmniRoute."
            }
        ],
        codeBlock: {
            language: "json",
            code: `{
  "provider": {
    "type": "openai",
    "baseURL": "{{baseUrl}}",
    "apiKey": "{{apiKey}}",
    "model": "{{model}}"
  }
}`
        }
    },
    // Rich, first-class support for the real advanced Hermes Agent (Nous Research)
    // Separate from the original simple "Hermes" guide above.
    "hermes-agent": {
        id: "hermes-agent",
        name: "Hermes Agent",
        icon: "terminal",
        color: "#8B5CF6",
        description: "Hermes Agent (Nous Research) — advanced multi-role autonomous terminal AI",
        docsUrl: "/docs?section=cli-tools&tool=hermes-agent",
        configType: "custom",
        category: "agent",
        vendor: "Nous Research",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "hermes"
    },
    kiro: {
        id: "kiro",
        name: "Kiro AI",
        image: "/providers/kiro.svg",
        icon: "psychology_alt",
        color: "#FF6B35",
        description: "Amazon Kiro — AI-powered IDE with MITM intercept (plan 11 backlog)",
        docsUrl: "/docs?section=cli-tools&tool=kiro",
        // configType:"mitm" — fluxo MITM; baseUrlSupport:"none" → excluído das listas,
        // acessível só via legacy /[id] route após F8
        configType: "mitm",
        category: "code",
        vendor: "Amazon",
        acpSpawnable: false,
        baseUrlSupport: "none",
        guideSteps: [
            {
                step: 1,
                title: "Open Kiro Settings",
                desc: "Go to Settings → AI Provider"
            },
            {
                step: 2,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 3,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ]
    },
    qwen: {
        id: "qwen",
        name: "Qwen Code",
        image: "/providers/qwen.svg",
        color: "#10B981",
        description: "Qwen Code CLI — current V4 OpenAI-compatible model provider via OmniRoute",
        docsUrl: "https://qwenlm.github.io/qwen-code-docs/en/users/configuration/model-providers/",
        configType: "guide",
        category: "code",
        vendor: "Alibaba",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "qwen",
        previewConfigMode: "qwen",
        notes: [
            {
                type: "info",
                text: "OmniRoute is registered under modelProviders.openai using Qwen Code's current bare-array V4 format."
            },
            {
                type: "info",
                text: "The API key is stored only as OMNIROUTE_API_KEY in ~/.qwen/.env, leaving your existing provider credentials untouched."
            }
        ],
        guideSteps: [
            {
                step: 1,
                title: "Install Qwen Code",
                desc: "npm install -g @qwen-code/qwen-code"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            },
            {
                step: 5,
                title: "Save Config",
                desc: "Write the modelProviders entry and dedicated .env key without replacing other Qwen Code settings."
            }
        ],
        codeBlock: {
            language: "json",
            code: `{
  "modelProviders": {
    "openai": [
      {
        "id": "{{model}}",
        "name": "{{model}} (OmniRoute)",
        "envKey": "OMNIROUTE_API_KEY",
        "baseUrl": "{{baseUrl}}"
      }
    ]
  },
  "security": { "auth": { "selectedType": "openai" } },
  "model": { "name": "{{model}}", "baseUrl": "{{baseUrl}}" }
}`
        }
    },
    custom: {
        id: "custom",
        name: "Custom CLI",
        icon: "terminal",
        color: "#10B981",
        description: "Generic OpenAI-compatible CLI or SDK configuration generator",
        docsUrl: "/docs?section=cli-tools",
        configType: "custom-builder",
        category: "code",
        vendor: "Custom",
        acpSpawnable: false,
        baseUrlSupport: "full"
    },
    // ── Code entries — aider ──────────────────────────────────────────────────
    aider: {
        id: "aider",
        name: "Aider",
        icon: "terminal",
        color: "#2DD4BF",
        description: "Aider AI pair-programming CLI — OpenAI-compatible --openai-api-base flag",
        docsUrl: "https://aider.chat/docs/config/options.html",
        configType: "guide",
        category: "code",
        vendor: "OSS (P. Gauthier)",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "aider",
        guideSteps: [
            {
                step: 1,
                title: "Install Aider",
                desc: "pip install aider-chat"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ],
        codeBlock: {
            language: "bash",
            code: `export OPENAI_API_KEY="{{apiKey}}"
aider --openai-api-base "{{baseUrl}}" --model "{{model}}"`
        }
    },
    // ── Code entries — forge ──────────────────────────────────────────────────
    forge: {
        id: "forge",
        name: "ForgeCode",
        icon: "terminal",
        color: "#F97316",
        description: "ForgeCode coding agent CLI — custom provider via .forge.toml",
        docsUrl: "https://github.com/antinomyhq/forge",
        configType: "custom",
        category: "code",
        vendor: "Antinomy HQ",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "forge"
    },
    "grok-build": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$cliToolsGrokBuild$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROK_BUILD_CLI_TOOL"],
    // ── Code entries — cursor-cli ─────────────────────────────────────────────
    "cursor-cli": {
        id: "cursor-cli",
        name: "Cursor Agent CLI",
        image: "/providers/cursor.svg",
        color: "#000000",
        description: "Cursor Agent CLI — headless agent mode with custom provider endpoint",
        docsUrl: "https://docs.cursor.com/advanced/api",
        configType: "guide",
        category: "code",
        vendor: "Anysphere",
        acpSpawnable: true,
        baseUrlSupport: "partial",
        defaultCommand: "cursor",
        guideSteps: [
            {
                step: 1,
                title: "Install Cursor CLI",
                desc: "Download cursor binary from cursor.com"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ]
    },
    // ── Code entries — new ★ ──────────────────────────────────────────────────
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ roo: {
        id: "roo",
        name: "Roo Code",
        image: "/providers/roocode.svg",
        color: "#7C3AED",
        description: "Roo Code AI Assistant — VS Code extension with OpenAI-compatible custom base URL",
        docsUrl: "https://docs.roocode.com/",
        configType: "guide",
        category: "code",
        vendor: "Roo (OSS)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        guideSteps: [
            {
                step: 1,
                title: "Install Roo Code",
                desc: "Install the Roo Code VS Code extension"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ]
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ jcode: {
        id: "jcode",
        name: "jcode",
        icon: "terminal",
        color: "#10B981",
        description: "jcode terminal coding agent — OpenAI-compatible CLI by 1jehuang",
        docsUrl: "https://github.com/1jehuang/jcode",
        configType: "custom",
        category: "code",
        vendor: "OSS (1jehuang)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "jcode"
    },
    /**
   * ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27
   * Kept as a legacy/dual entry after CodeWhale (see below) took over as the
   * actively-maintained successor. Existing users who still have DeepSeek
   * TUI installed keep a working dashboard card; new users are steered to
   * "codewhale" instead.
   */ "deepseek-tui": {
        id: "deepseek-tui",
        name: "DeepSeek TUI",
        image: "/providers/deepseek.svg",
        color: "#4F46E5",
        description: "DeepSeek TUI — Rust-based coding agent CLI with OPENAI_BASE_URL support",
        docsUrl: "https://github.com/hunterbown/deepseek-tui",
        configType: "custom",
        category: "code",
        vendor: "OSS (Hunter Bown)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "deepseek-tui"
    },
    /**
   * ★ Added 2026-07-02 (dual-entry, see deepseek-tui above). CodeWhale is
   * the actively-maintained successor to DeepSeek TUI — same author, new
   * name. Config lives under ~/.codewhale/config.toml; the settings route
   * also keeps ~/.deepseek/config.toml (legacy) in sync for upgrading
   * users. Reference: https://github.com/Hmbown/CodeWhale
   */ codewhale: {
        id: "codewhale",
        name: "CodeWhale",
        icon: "terminal",
        color: "#4F46E5",
        description: "CodeWhale — Rust-based coding agent CLI with OPENAI_BASE_URL support (successor to DeepSeek TUI)",
        docsUrl: "https://github.com/Hmbown/CodeWhale",
        configType: "custom",
        category: "code",
        vendor: "OSS (Hmbown)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "codewhale"
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ smelt: {
        id: "smelt",
        name: "Smelt",
        icon: "terminal",
        color: "#EF4444",
        description: "Smelt coding agent CLI — OpenAI-compatible agent by leonardcser",
        docsUrl: "https://github.com/leonardcser/smelt",
        configType: "custom",
        category: "code",
        vendor: "OSS (leonardcser)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "smelt"
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ pi: {
        id: "pi",
        name: "Pi",
        icon: "terminal",
        color: "#F59E0B",
        description: "Pi coding agent CLI — lightweight terminal AI by M. Zechner",
        docsUrl: "https://github.com/badlogic/pi",
        configType: "custom",
        category: "code",
        vendor: "OSS (M. Zechner)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "pi"
    },
    /** Added — ported from upstream decolua/9router#1233 (dashboard catalog entry for Crush). */ crush: {
        id: "crush",
        name: "Crush",
        icon: "terminal",
        color: "#FB923C",
        description: "Crush coding agent CLI — terminal AI agent by Charm (charmbracelet/crush)",
        docsUrl: "https://github.com/charmbracelet/crush",
        configType: "custom",
        category: "code",
        vendor: "OSS (Charm)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "crush"
    },
    // ── Agent entries ─────────────────────────────────────────────────────────
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ goose: {
        id: "goose",
        name: "Goose",
        icon: "smart_toy",
        color: "#F97316",
        description: "Goose autonomous agent CLI — Block / Linux Foundation OSS, full base URL",
        docsUrl: "https://block.github.io/goose/",
        configType: "guide",
        category: "agent",
        vendor: "Block / Linux Foundation",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "goose",
        guideSteps: [
            {
                step: 1,
                title: "Install Goose",
                desc: "pip install goose-ai or brew install goose"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ],
        codeBlock: {
            language: "yaml",
            code: `# ~/.config/goose/config.yaml
GOOSE_PROVIDER: "openai"
GOOSE_MODEL: "{{model}}"
OPENAI_HOST: "{{baseUrl}}"
OPENAI_API_KEY: "{{apiKey}}"`
        }
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ interpreter: {
        id: "interpreter",
        name: "Open Interpreter",
        icon: "smart_toy",
        color: "#8B5CF6",
        description: "Open Interpreter — autonomous coding agent CLI with --api_base flag",
        docsUrl: "https://docs.openinterpreter.com/",
        configType: "guide",
        category: "agent",
        vendor: "OSS",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "interpreter",
        guideSteps: [
            {
                step: 1,
                title: "Install",
                desc: "pip install open-interpreter"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ],
        codeBlock: {
            language: "bash",
            code: `interpreter --api_base "{{baseUrl}}" --api_key "{{apiKey}}" --model "{{model}}"`
        }
    },
    omp: {
        id: "omp",
        name: "Oh My Pi",
        image: "/providers/omp.png",
        color: "#111111",
        docsUrl: "https://github.com/can1357/oh-my-pi",
        description: "Oh My Pi terminal coding agent via OmniRoute",
        configType: "custom",
        category: "agent",
        vendor: "OSS",
        acpSpawnable: true,
        baseUrlSupport: "full",
        defaultCommand: "omp",
        notes: [
            {
                type: "info",
                text: "Oh My Pi reads custom OpenAI-compatible providers from ~/.omp/agent/models.yml. OmniRoute adds itself as a provider with auto-discovery — models appear automatically in omp's /model menu."
            },
            {
                type: "warning",
                text: "Config path: Linux/macOS ~/.omp/agent/models.yml • Windows %USERPROFILE%\\.omp\\.omp\\agent\\models.yml"
            }
        ]
    },
    letta: {
        id: "letta",
        name: "Letta CLI",
        image: "/providers/letta.png",
        color: "#FF6B35",
        description: "Letta CLI — AI agent with persistent memory and tool use",
        configType: "custom",
        category: "agent",
        vendor: "Letta",
        acpSpawnable: false,
        baseUrlSupport: "full",
        docsUrl: "https://docs.letta.com",
        notes: [
            {
                type: "info",
                text: "Letta CLI uses pi-ai which sends OpenAI-compatible requests. OmniRoute configures it as an OpenAI provider with custom base URL."
            },
            {
                type: "info",
                text: "CLI (Local Mode): OmniRoute auto-configures ~/.letta/lc-local-backend/providers/auth.json. Use 'letta --info' to check if local mode is enabled."
            },
            {
                type: "warning",
                text: "Local mode config path: ~/.letta/lc-local-backend/providers/auth.json (CLI only)"
            }
        ]
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ warp: {
        id: "warp",
        name: "Warp AI",
        icon: "terminal",
        color: "#1D4ED8",
        description: "Warp AI terminal — BYOK desktop app with partial base URL support",
        docsUrl: "https://docs.warp.dev/",
        configType: "guide",
        category: "agent",
        vendor: "Warp Inc.",
        acpSpawnable: true,
        baseUrlSupport: "partial",
        guideSteps: [
            {
                step: 1,
                title: "Install Warp",
                desc: "Download Warp from warp.dev (desktop app)"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Configure BYOK",
                desc: "Go to Settings → AI → BYOK Provider"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ],
        notes: [
            {
                type: "warning",
                text: "Warp is a desktop app, not a CLI binary. baseUrlSupport is partial — some models may require the native Warp endpoint."
            }
        ]
    },
    /** ★ Added by plan 14 (CLI Pages Redesign) — 2026-05-27 */ "agent-deck": {
        id: "agent-deck",
        name: "Agent Deck",
        icon: "device_hub",
        color: "#0EA5E9",
        description: "Agent Deck — multi-agent stdio backend orchestrator (OSS, asheshgoplani)",
        docsUrl: "https://github.com/asheshgoplani/agent-deck",
        configType: "guide",
        category: "agent",
        vendor: "OSS (asheshgoplani)",
        acpSpawnable: false,
        baseUrlSupport: "full",
        defaultCommand: "agent-deck",
        guideSteps: [
            {
                step: 1,
                title: "Install Agent Deck",
                desc: "npm install -g agent-deck"
            },
            {
                step: 2,
                title: "API Key",
                type: "apiKeySelector"
            },
            {
                step: 3,
                title: "Base URL",
                value: "{{baseUrl}}",
                copyable: true
            },
            {
                step: 4,
                title: "Select Model",
                type: "modelSelector"
            }
        ]
    }
};
function listCliTools() {
    return Object.values(CLI_TOOLS);
}
function getCliTool(id) {
    return CLI_TOOLS[id];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/schemas/cliCatalog.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliCatalogEntrySchema",
    ()=>CliCatalogEntrySchema,
    "CliCatalogSchema",
    ()=>CliCatalogSchema,
    "EXPECTED_AGENT_COUNT",
    ()=>EXPECTED_AGENT_COUNT,
    "EXPECTED_CODE_COUNT",
    ()=>EXPECTED_CODE_COUNT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-client] (ecmascript) <export * as z>");
;
const CliCatalogEntrySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "code",
        "agent"
    ]),
    vendor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    acpSpawnable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    baseUrlSupport: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "full",
        "partial",
        "none"
    ]),
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    image: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    imageLight: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    imageDark: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^#[0-9A-Fa-f]{6}$/),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    docsUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    configType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "env",
        "custom",
        "guide",
        "custom-builder",
        "mitm"
    ]),
    envVars: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional(),
    modelAliases: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional(),
    settingsFile: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    defaultCommand: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    defaultCommands: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional(),
    defaultModels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        alias: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        envKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        isTopLevel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).optional(),
    guideSteps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        step: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        desc: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        value: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        copyable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "apiKeySelector",
            "modelSelector"
        ]).optional()
    })).optional(),
    codeBlock: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        language: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    }).optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "info",
            "warning",
            "error",
            "cloudCheck"
        ]),
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).optional(),
    requiresCloud: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    modelSelectionMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "single",
        "multiple"
    ]).optional(),
    hideComboModels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    previewConfigMode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const CliCatalogSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(CliCatalogEntrySchema);
_c = CliCatalogSchema;
const EXPECTED_CODE_COUNT = 21;
const EXPECTED_AGENT_COUNT = 8;
var _c;
__turbopack_context__.k.register(_c, "CliCatalogSchema");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
/**
 * Shared status badge for CLI tool cards.
 * Shows the effective config/installation status using batch data,
 * so badges are visible even when cards are collapsed.
 * Optionally shows last-configured relative timestamp.
 */ function formatRelativeTime(isoDate, t) {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffMs = now - then;
    if (diffMs < 0) return t("justNow");
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return t("justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("minutesAgoShort", {
        count: minutes
    });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("hoursAgoShort", {
        count: hours
    });
    const days = Math.floor(hours / 24);
    if (days < 30) return t("daysAgoShort", {
        count: days
    });
    const months = Math.floor(days / 30);
    if (months < 12) return t("monthsAgoShort", {
        count: months
    });
    return t("yearsAgoShort", {
        count: Math.floor(months / 12)
    });
}
function CliStatusBadge({ effectiveConfigStatus, batchStatus, lastConfiguredAt = null }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliTools");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    // Determine badge from effectiveConfigStatus or batchStatus
    const status = effectiveConfigStatus || batchStatus?.configStatus || null;
    const badges = {
        configured: {
            dotClass: "bg-green-500",
            badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400",
            text: t("configured")
        },
        not_configured: {
            dotClass: "bg-yellow-500",
            badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
            text: t("notConfigured")
        },
        not_installed: {
            dotClass: "bg-zinc-400 dark:bg-zinc-500",
            badgeClass: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
            text: t("notInstalled")
        },
        other: {
            dotClass: "bg-blue-500",
            badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            text: t("custom")
        },
        unknown: {
            dotClass: "bg-zinc-400 dark:bg-zinc-500",
            badgeClass: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
            text: t("unknown")
        }
    };
    const badge = status ? badges[status] || badges.unknown : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full ${badge.badgeClass}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `size-1.5 rounded-full ${badge.dotClass}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this),
                    badge.text
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this),
            lastConfiguredAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-text-muted",
                title: t("lastSavedAt", {
                    date: new Date(lastConfiguredAt).toLocaleString(locale)
                }),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "schedule"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this),
                    formatRelativeTime(lastConfiguredAt, t)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this) : status && status !== "not_installed" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "schedule"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this),
                    t("never")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true);
}
_s(CliStatusBadge, "ibHvjDxkLpek5QWjIfNYywjof5I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c = CliStatusBadge;
var _c;
__turbopack_context__.k.register(_c, "CliStatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/cli/CliToolCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliToolCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$cli$2d$code$2f$components$2f$CliStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/useTheme.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function CliToolCard({ tool, batchStatus, detailHref, hasActiveProviders }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliCommon");
    const tTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliTools");
    const { isDark } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const installed = batchStatus?.detection.installed ?? false;
    const configStatus = batchStatus?.config.status ?? null;
    const version = batchStatus?.detection.version ?? t("card.versionNotFound");
    const endpoint = batchStatus?.config.endpoint ?? null;
    const imageSrc = tool.image || (isDark ? tool.imageDark || tool.imageLight : tool.imageLight || tool.imageDark);
    const showInstallChips = !installed && tool.configType !== "guide";
    const title = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2.5",
        children: [
            imageSrc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: imageSrc,
                alt: tool.name,
                width: 32,
                height: 32,
                className: "rounded-md object-contain flex-shrink-0"
            }, void 0, false, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[20px] flex-shrink-0",
                style: {
                    color: tool.color
                },
                "aria-hidden": "true",
                children: tool.icon ?? "terminal"
            }, void 0, false, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 49,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-text-main text-sm leading-tight truncate",
                                children: tool.name
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-text-muted font-mono bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded",
                                children: version
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted line-clamp-1 mt-0.5",
                        children: tTools(`toolDescriptions.${tool.id}`)
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[18px] text-text-muted flex-shrink-0",
                children: "chevron_right"
            }, void 0, false, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: detailHref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("block min-h-[180px]", "bg-surface border border-black/5 dark:border-white/5 rounded-lg shadow-sm", "hover:shadow-md hover:border-primary/30 transition-all", "p-4 flex flex-col gap-3"),
        children: [
            title,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded", installed ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: installed ? "✓" : "✗"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            installed ? t("card.detected") : t("card.notDetected")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    configStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$cli$2d$code$2f$components$2f$CliStatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        effectiveConfigStatus: configStatus,
                        batchStatus: null,
                        lastConfiguredAt: batchStatus?.config.lastConfiguredAt ?? null
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this),
                    endpoint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-text-muted font-mono truncate max-w-[140px]",
                        children: endpoint
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 flex-wrap",
                children: [
                    tool.baseUrlSupport === "partial" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "⚠"
                            }, void 0, false, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this),
                            " ",
                            t("card.baseUrlPartial")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this),
                    tool.acpSpawnable === true && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        children: t("card.alsoAcp")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    showInstallChips && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-black/5 dark:bg-white/5 text-text-muted",
                                children: [
                                    "📋 ",
                                    t("card.manualConfig")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-black/5 dark:bg-white/5 text-text-muted",
                                children: [
                                    "⬇ ",
                                    t("card.installGuide")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                                lineNumber: 136,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto pt-1 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-primary font-medium",
                        children: installed ? t("card.configure") : t("card.howToInstall")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    !hasActiveProviders && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-text-muted italic",
                        title: t("card.connectProviderHint"),
                        children: t("card.connectProviderHint")
                    }, void 0, false, {
                        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/shared/components/cli/CliToolCard.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(CliToolCard, "0DROzoHUM/u5TJWrnm8jiz7/xP0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = CliToolCard;
var _c;
__turbopack_context__.k.register(_c, "CliToolCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/cli/CliConceptCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliConceptCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const TYPE_HREFS = {
    code: "/dashboard/cli-code",
    agent: "/dashboard/cli-agents",
    acp: "/dashboard/acp-agents"
};
function CliConceptCard({ currentType }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliCommon");
    const types = [
        "code",
        "agent",
        "acp"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-surface border rounded-lg shadow-sm p-4", "border-primary/30 bg-primary/5"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-semibold uppercase tracking-wider text-primary",
                            children: t(`concept.${currentType}.title`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-text-muted",
                            children: t(`concept.${currentType}.phrase`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-text-muted font-mono",
                            children: t(`concept.${currentType}.flow`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 flex-wrap pt-1 border-t border-black/5 dark:border-white/5",
                    children: types.filter((type)=>type !== currentType).map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: TYPE_HREFS[type],
                            className: "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-black/5 dark:bg-white/5 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors",
                            children: [
                                t(`concept.${type}.title`),
                                " — ",
                                t(`concept.${type}.seeOther`)
                            ]
                        }, type, true, {
                            fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                            lineNumber: 46,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/cli/CliConceptCard.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(CliConceptCard, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CliConceptCard;
var _c;
__turbopack_context__.k.register(_c, "CliConceptCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/cli/CliComparisonCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliComparisonCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const TYPE_HREFS = {
    code: "/dashboard/cli-code",
    agent: "/dashboard/cli-agents",
    acp: "/dashboard/acp-agents"
};
function CliComparisonCard({ currentType }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliCommon");
    const types = [
        "code",
        "agent",
        "acp"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-surface border border-black/5 dark:border-white/5 rounded-lg shadow-sm p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-3 gap-3",
            children: types.map((type)=>{
                const isCurrent = type === currentType;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 p-3 rounded-lg", isCurrent ? "bg-primary/10 border border-primary/30" : "bg-black/[0.02] dark:bg-white/[0.02] border border-transparent"),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-1 flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-xs font-semibold uppercase tracking-wider", isCurrent ? "text-primary" : "text-text-muted"),
                                    children: t(`comparison.${type}.title`)
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                                    lineNumber: 40,
                                    columnNumber: 17
                                }, this),
                                isCurrent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary whitespace-nowrap",
                                    children: [
                                        t("comparison.thisPage"),
                                        " ✓"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                                    lineNumber: 49,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: TYPE_HREFS[type],
                                    className: "inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-black/5 dark:bg-white/5 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap",
                                    children: t("comparison.open")
                                }, void 0, false, {
                                    fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                                    lineNumber: 53,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                            lineNumber: 39,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[11px] text-text-muted leading-relaxed",
                            children: t(`comparison.${type}.desc`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                            lineNumber: 63,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-text-muted font-mono",
                            children: t(`comparison.${type}.flow`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                            lineNumber: 68,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[10px] text-text-muted italic",
                            children: t(`comparison.${type}.examples`)
                        }, void 0, false, {
                            fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                            lineNumber: 73,
                            columnNumber: 15
                        }, this)
                    ]
                }, type, true, {
                    fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
                    lineNumber: 29,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/shared/components/cli/CliComparisonCard.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(CliComparisonCard, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CliComparisonCard;
var _c;
__turbopack_context__.k.register(_c, "CliComparisonCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/cli/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliToolCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliToolCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliConceptCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliConceptCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliComparisonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliComparisonCard.tsx [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/components/cli/CliToolCard.tsx [app-client] (ecmascript) <export default as CliToolCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliToolCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliToolCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliToolCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliToolCard.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/components/cli/CliConceptCard.tsx [app-client] (ecmascript) <export default as CliConceptCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliConceptCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliConceptCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliConceptCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliConceptCard.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/components/cli/CliComparisonCard.tsx [app-client] (ecmascript) <export default as CliComparisonCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CliComparisonCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliComparisonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliComparisonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliComparisonCard.tsx [app-client] (ecmascript)");
}),
"[project]/src/shared/hooks/cli/useToolBatchStatuses.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useToolBatchStatuses",
    ()=>useToolBatchStatuses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useToolBatchStatuses() {
    _s();
    const [statuses, setStatuses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchStatuses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useToolBatchStatuses.useCallback[fetchStatuses]": async (forceRefresh = false)=>{
            setLoading(true);
            setError(null);
            try {
                const url = `/api/cli-tools/all-statuses${forceRefresh ? "?refresh=true" : ""}`;
                const res = await fetch(url);
                if (!res.ok) {
                    const text = await res.text().catch({
                        "useToolBatchStatuses.useCallback[fetchStatuses]": ()=>String(res.status)
                    }["useToolBatchStatuses.useCallback[fetchStatuses]"]);
                    setError(`HTTP ${res.status}: ${text.slice(0, 200)}`);
                    setStatuses(null);
                    return;
                }
                const data = await res.json();
                setStatuses(data);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg);
                setStatuses(null);
            } finally{
                setLoading(false);
            }
        }
    }["useToolBatchStatuses.useCallback[fetchStatuses]"], []);
    const refetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useToolBatchStatuses.useCallback[refetch]": ()=>{
            void fetchStatuses(true);
        }
    }["useToolBatchStatuses.useCallback[refetch]"], [
        fetchStatuses
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useToolBatchStatuses.useEffect": ()=>{
            void fetchStatuses();
            function handleFocus() {
                void fetchStatuses();
            }
            window.addEventListener("focus", handleFocus);
            return ({
                "useToolBatchStatuses.useEffect": ()=>{
                    window.removeEventListener("focus", handleFocus);
                }
            })["useToolBatchStatuses.useEffect"];
        }
    }["useToolBatchStatuses.useEffect"], [
        fetchStatuses
    ]);
    return {
        statuses,
        loading,
        error,
        refetch
    };
}
_s(useToolBatchStatuses, "1T6aCEj8kOoPbNyZzm/5ml7Shrw=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliProfileAutoSyncToggles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Toggle.tsx [app-client] (ecmascript) <export default as Toggle>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const CODEX_KEY = "OMNIROUTE_AUTO_SYNC_CODEX_PROFILES";
const CLAUDE_KEY = "OMNIROUTE_AUTO_SYNC_CLAUDE_PROFILES";
function isOn(value) {
    return value === "true" || value === "1" || value === "yes" || value === "on";
}
function CliProfileAutoSyncToggles() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliTools");
    const [codexOn, setCodexOn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [claudeOn, setClaudeOn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savingKey, setSavingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliProfileAutoSyncToggles.useCallback[load]": async ()=>{
            setLoading(true);
            try {
                const res = await fetch("/api/settings/feature-flags");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const flags = Array.isArray(data.flags) ? data.flags : [];
                setCodexOn(isOn(flags.find({
                    "CliProfileAutoSyncToggles.useCallback[load]": (f)=>f.key === CODEX_KEY
                }["CliProfileAutoSyncToggles.useCallback[load]"])?.effectiveValue));
                setClaudeOn(isOn(flags.find({
                    "CliProfileAutoSyncToggles.useCallback[load]": (f)=>f.key === CLAUDE_KEY
                }["CliProfileAutoSyncToggles.useCallback[load]"])?.effectiveValue));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : t("profileSyncLoadFailed"));
            } finally{
                setLoading(false);
            }
        }
    }["CliProfileAutoSyncToggles.useCallback[load]"], [
        t
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CliProfileAutoSyncToggles.useEffect": ()=>{
            load();
        }
    }["CliProfileAutoSyncToggles.useEffect"], [
        load
    ]);
    const persist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliProfileAutoSyncToggles.useCallback[persist]": async (key, next, previous, apply)=>{
            apply(next); // optimistic
            setSavingKey(key);
            setError(null);
            try {
                const res = await fetch("/api/settings/feature-flags", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        key,
                        value: next ? "true" : "false"
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            } catch (err) {
                apply(previous); // revert on failure
                setError(err instanceof Error ? err.message : t("failedSave"));
            } finally{
                setSavingKey(null);
            }
        }
    }["CliProfileAutoSyncToggles.useCallback[persist]"], [
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-border bg-surface/40 p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-text-main",
                        children: t("profileSyncTitle")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-text-muted",
                        children: t("profileSyncDescription")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                        checked: codexOn,
                        disabled: loading || savingKey === CODEX_KEY,
                        onChange: (v)=>persist(CODEX_KEY, v, codexOn, setCodexOn),
                        label: t("codexProfiles"),
                        description: t("codexProfilesDescription")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Toggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Toggle$3e$__["Toggle"], {
                        checked: claudeOn,
                        disabled: loading || savingKey === CLAUDE_KEY,
                        onChange: (v)=>persist(CLAUDE_KEY, v, claudeOn, setClaudeOn),
                        label: t("claudeProfiles"),
                        description: t("claudeProfilesDescription")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-xs text-red-500",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
                lineNumber: 95,
                columnNumber: 16
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(CliProfileAutoSyncToggles, "k2/WaodIYDKKDBrx0PyMcZzEKcM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CliProfileAutoSyncToggles;
var _c;
__turbopack_context__.k.register(_c, "CliProfileAutoSyncToggles");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CliCodePageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-client] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$cliTools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/cliTools.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$schemas$2f$cliCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/schemas/cliCatalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/cli/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliToolCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliToolCard$3e$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliToolCard.tsx [app-client] (ecmascript) <export default as CliToolCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliConceptCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliConceptCard$3e$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliConceptCard.tsx [app-client] (ecmascript) <export default as CliConceptCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliComparisonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliComparisonCard$3e$__ = __turbopack_context__.i("[project]/src/shared/components/cli/CliComparisonCard.tsx [app-client] (ecmascript) <export default as CliComparisonCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$cli$2f$useToolBatchStatuses$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/hooks/cli/useToolBatchStatuses.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$cli$2d$code$2f$components$2f$CliProfileAutoSyncToggles$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/cli-code/components/CliProfileAutoSyncToggles.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
// ── Static catalogue slice ────────────────────────────────────────────────────
const CODE_TOOLS = Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$cliTools$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLI_TOOLS"]).filter(_c = ([, tool])=>tool.category === "code" && tool.baseUrlSupport !== "none");
_c1 = CODE_TOOLS;
// Cardinality guard (D15) — non-blocking, log only
if (CODE_TOOLS.length !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$schemas$2f$cliCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPECTED_CODE_COUNT"]) {
    console.warn(`[CliCodePage] Expected ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$schemas$2f$cliCatalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPECTED_CODE_COUNT"]} code tools, found ${CODE_TOOLS.length}. ` + "Check F1 catalog edits.");
}
function CliCodePageClient({ machineId: _machineId }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliCode");
    const tCommon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cliCommon");
    // ── Batch statuses ──────────────────────────────────────────────────────────
    const { statuses, loading, refetch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$cli$2f$useToolBatchStatuses$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToolBatchStatuses"])();
    // ── Providers ───────────────────────────────────────────────────────────────
    const [hasActiveProviders, setHasActiveProviders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [providersLoading, setProvidersLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CliCodePageClient.useEffect": ()=>{
            let cancelled = false;
            fetch("/api/providers").then({
                "CliCodePageClient.useEffect": (res)=>res.ok ? res.json() : Promise.resolve({
                        connections: []
                    })
            }["CliCodePageClient.useEffect"]).then({
                "CliCodePageClient.useEffect": (data)=>{
                    if (cancelled) return;
                    const active = (data.connections ?? []).filter({
                        "CliCodePageClient.useEffect.active": (c)=>c.isActive !== false
                    }["CliCodePageClient.useEffect.active"]);
                    setHasActiveProviders(active.length > 0);
                }
            }["CliCodePageClient.useEffect"]).catch({
                "CliCodePageClient.useEffect": ()=>{
                    if (!cancelled) setHasActiveProviders(false);
                }
            }["CliCodePageClient.useEffect"]).finally({
                "CliCodePageClient.useEffect": ()=>{
                    if (!cancelled) setProvidersLoading(false);
                }
            }["CliCodePageClient.useEffect"]);
            return ({
                "CliCodePageClient.useEffect": ()=>{
                    cancelled = true;
                }
            })["CliCodePageClient.useEffect"];
        }
    }["CliCodePageClient.useEffect"], []);
    // ── Filters ─────────────────────────────────────────────────────────────────
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [detectionFilter, setDetectionFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [baseUrlFilter, setBaseUrlFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const handleSearchChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliCodePageClient.useCallback[handleSearchChange]": (e)=>{
            setSearch(e.target.value);
        }
    }["CliCodePageClient.useCallback[handleSearchChange]"], []);
    const handleDetectionChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliCodePageClient.useCallback[handleDetectionChange]": (e)=>{
            setDetectionFilter(e.target.value);
        }
    }["CliCodePageClient.useCallback[handleDetectionChange]"], []);
    const handleBaseUrlChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CliCodePageClient.useCallback[handleBaseUrlChange]": (e)=>{
            setBaseUrlFilter(e.target.value);
        }
    }["CliCodePageClient.useCallback[handleBaseUrlChange]"], []);
    // ── Filtered tools ──────────────────────────────────────────────────────────
    const filteredTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CliCodePageClient.useMemo[filteredTools]": ()=>{
            const q = search.trim().toLowerCase();
            return CODE_TOOLS.filter({
                "CliCodePageClient.useMemo[filteredTools]": ([id, tool])=>{
                    // Search filter
                    if (q) {
                        const haystack = `${tool.name} ${tool.vendor} ${tool.description}`.toLowerCase();
                        if (!haystack.includes(q)) return false;
                    }
                    // Detection filter
                    if (detectionFilter !== "all") {
                        const installed = statuses?.[id]?.detection.installed ?? false;
                        if (detectionFilter === "installed" && !installed) return false;
                        if (detectionFilter === "not_installed" && installed) return false;
                    }
                    // Base URL filter
                    if (baseUrlFilter !== "all") {
                        if (tool.baseUrlSupport !== baseUrlFilter) return false;
                    }
                    return true;
                }
            }["CliCodePageClient.useMemo[filteredTools]"]);
        }
    }["CliCodePageClient.useMemo[filteredTools]"], [
        search,
        detectionFilter,
        baseUrlFilter,
        statuses
    ]);
    // ── Render ───────────────────────────────────────────────────────────────────
    const isLoadingOverall = loading || providersLoading;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliConceptCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliConceptCard$3e$__["CliConceptCard"], {
                currentType: "code"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliComparisonCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliComparisonCard$3e$__["CliComparisonCard"], {
                currentType: "code"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$cli$2d$code$2f$components$2f$CliProfileAutoSyncToggles$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-semibold text-text-main leading-tight",
                                children: t("pageTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-text-muted mt-0.5",
                                children: t("pageSubtitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                        variant: "secondary",
                        size: "sm",
                        onClick: refetch,
                        icon: "refresh",
                        "aria-label": tCommon("card.refreshDetection"),
                        children: tCommon("card.refreshDetection")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row gap-3 items-start sm:items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                            placeholder: t("searchPlaceholder"),
                            value: search,
                            onChange: handleSearchChange,
                            icon: "search"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 min-w-[150px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[11px] text-text-muted uppercase tracking-wide",
                                children: t("filterDetectionLabel")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: detectionFilter,
                                onChange: handleDetectionChange,
                                className: "h-8 px-2 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: t("detectionAll")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 179,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "installed",
                                        children: t("detectionInstalled")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "not_installed",
                                        children: t("detectionNotFound")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 min-w-[150px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-[11px] text-text-muted uppercase tracking-wide",
                                children: t("filterBaseUrlLabel")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: baseUrlFilter,
                                onChange: handleBaseUrlChange,
                                className: "h-8 px-2 text-sm rounded-lg border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: t("baseUrlAll")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 195,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "full",
                                        children: t("baseUrlFull")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 196,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "partial",
                                        children: t("baseUrlPartial")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 190,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            !providersLoading && !hasActiveProviders && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 flex items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-amber-500 flex-shrink-0",
                        children: "warning"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-amber-600 dark:text-amber-400",
                                children: tCommon("detail.noActiveProviders")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-text-muted mt-0.5",
                                children: tCommon("detail.noActiveProvidersDesc")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/providers",
                                className: "inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline",
                                children: tCommon("detail.openProviders")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                                lineNumber: 213,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 204,
                columnNumber: 9
            }, this),
            isLoadingOverall ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                children: Array.from({
                    length: 6
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, i, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 227,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 225,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                children: filteredTools.map(([id, tool])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$cli$2f$CliToolCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CliToolCard$3e$__["CliToolCard"], {
                        tool: tool,
                        batchStatus: statuses?.[id] ?? null,
                        detailHref: `/dashboard/cli-code/${id}`,
                        hasActiveProviders: hasActiveProviders
                    }, id, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                        lineNumber: 233,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
                lineNumber: 231,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/cli-code/CliCodePageClient.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
_s(CliCodePageClient, "jtGDr55jdHf3sVbywhUwUXV0q7U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$hooks$2f$cli$2f$useToolBatchStatuses$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToolBatchStatuses"]
    ];
});
_c2 = CliCodePageClient;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CODE_TOOLS$Object.entries(CLI_TOOLS).filter");
__turbopack_context__.k.register(_c1, "CODE_TOOLS");
__turbopack_context__.k.register(_c2, "CliCodePageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1cjfdh9._.js.map