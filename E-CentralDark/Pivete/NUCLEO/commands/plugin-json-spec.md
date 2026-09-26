# COMANDO - plugin-json-spec.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\skills\.system\plugin-creator\references\plugin-json-spec.md
**SHA:** eeb640130f69636a
**Timestamp:** 2026-08-26T18:42:51.480082
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- intentional preflight check that rejects leftover `[TODO: ...]` placeholders.

### Ouro Bruto (primeiros 5000 chars)
```
# Plugin JSON sample spec

```json
{
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./skills/",
  "hooks": "./hooks.json",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json",
  "interface": {
    "displayName": "Plugin Display Name",
    "shortDescription": "Short description for subtitle",
    "longDescription": "Long description for details page",
    "developerName": "OpenAI",
    "category": "Productivity",
    "capabilities": ["Interactive", "Write"],
    "websiteURL": "https://openai.com/",
    "privacyPolicyURL": "https://openai.com/policies/row-privacy-policy/",
    "termsOfServiceURL": "https://openai.com/policies/row-terms-of-use/",
    "defaultPrompt": [
      "Summarize my inbox and draft replies for me.",
      "Find open bugs and turn them into Linear tickets.",
      "Review today's meetings and flag scheduling gaps."
    ],
    "brandColor": "#3B82F6",
    "composerIcon": "./assets/icon.png",
    "logo": "./assets/logo.png",
    "logoDark": "./assets/logo-dark.png",
    "screenshots": [
      "./assets/screenshot1.png",
      "./assets/screenshot2.png",
      "./assets/screenshot3.png"
    ]
  }
}
```

## Field guide

### Top-level fields

- `name` (`string`): Plugin identifier (kebab-case, no spaces). Required if `plugin.json` is provided and used as manifest name and component namespace.
- `version` (`string`): Plugin semantic version.
- `description` (`string`): Short purpose summary.
- `author` (`object`): Publisher identity.
  - `name` (`string`): Author or team name.
  - `email` (`string`): Contact email.
  - `url` (`string`): Author/team homepage or profile URL.
- `homepage` (`string`): Documentation URL for plugin usage.
- `repository` (`string`): Source code URL.
- `license` (`string`): License identifier (for example `MIT`, `Apache-2.0`).
- `keywords` (`array` of `string`): Search/discovery tags.
- `skills` (`string`): Relative path to skill directories/files.
- `hooks` (`string`): Hook config path.
- `mcpServers` (`string` or `object`): MCP config path, or an object whose keys are MCP server names and whose values are MCP server config objects.
- `apps` (`string`): App manifest path for plugin integrations.
- `interface` (`object`): Interface/UX metadata block for plugin presentation.

`mcpServers` may be declared as a companion file path:

```json
{
  "mcpServers": "./.mcp.json"
}
```

Or as an object directly in `plugin.json`:

```json
{
  "mcpServers": {
    "counter": {
      "type": "http",
      "url": "https://sample.example/counter/mcp"
    }
  }
}
```

### `interface` fields

- `displayName` (`string`): User-facing title shown for the plugin.
- `shortDescription` (`string`): Brief subtitle used in compact views.
- `longDescription` (`string`): Longer description used on details screens.
- `developerName` (`string`): Human-readable publisher name.
- `category` (`string`): Plugin category bucket.
- `capabilities` (`array` of `string`): Capability list from implementation.
- `websiteURL` (`string`): Public website for the plugin.
- `privacyPolicyURL` (`string`): Privacy policy URL.
- `termsOfServiceURL` (`string`): Terms of service URL.
- `defaultPrompt` (`array` of `string`): Starter prompts shown in composer/UX context.
  - Include at most 3 strings. Entries after the first 3 are ignored and will not be included.
  - Each string is capped at 128 characters. Longer entries are truncated.
  - Prefer short starter prompts around 50 characters so they scan well in the UI.
- `brandColor` (`string`): Theme color for the plugin card.
- `composerIcon` (`string`): Path to icon asset.
- `logo` (`string`): Path to logo asset.
- `logoDark` (`string`): Optional path to the logo asset used in dark mode.
- `screenshots` (`array` of `string`): List of screenshot asset paths.
  - Screenshot entries must be PNG filenames and stored under `./assets/`.
  - Keep file paths relative to plugin root.

### Path conventions and defaults

- Path values should be relative and begin with `./`.
- `skills`, `hooks`, and string-valued `mcpServers` are supplemented on top of default component discovery; they do not replace defaults.
- Custom path values must follow the plugin root convention and naming/namespacing rules.
- This repo’s scaffold writes `.codex-plugin/plugin.json`; treat that as the manifest location this skill generates.

# Marketplace JSON sample spec

`marketplace.json` depends on where the plugin should live. New plugin creation defaults to the
personal marketplace unless the caller explicitly requests a repo-local destination:

- Personal plugin: `~/.agents/plugins/marketplace.json`
- Repo/team plugin: `<repo-root>/.agents/plugins/marketplace.json`


```