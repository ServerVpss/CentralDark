# COMANDO - plugin-api-standalone.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use\references\plugin-api-standalone.d.ts
**SHA:** 06eaedbf743a3c0d
**Timestamp:** 2026-08-26T18:31:23.230821
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- *   start: number
- * connector.connectorStart = {
- start: (seconds: number) => void
- start: number
- readonly start: number
- start: number
- start: {
- start: {
- insertCharacters(start: number, characters: string, useStyle?: 'BEFORE' | 'AFTER'): void
- deleteCharacters(start: number, end: number): void

### Padroes
- *   pattern: 'GRID',
- readonly pattern: 'ROWS' | 'COLUMNS'
- readonly pattern: 'GRID'
- dashPattern: ReadonlyArray<number>

### Gaps
- gridRowGap: number
- gridColumnGap: number
- gap: number

### Ouro Bruto (primeiros 5000 chars)
```
// https://raw.githubusercontent.com/figma/plugin-typings/refs/heads/master/plugin-api-standalone.d.ts

/* plugin-typings are auto-generated. Do not update them directly. See developer-docs/ for instructions. */
/**
 * NOTE: This file is useful if you want to import specific types eg.
 * import type { SceneNode } from "@figma/plugin-typings/plugin-api-standalone"
 */
/**
 * @see https://developers.figma.com/docs/plugins/api/properties/figma-on
 */
declare type ArgFreeEventType =
  | 'selectionchange'
  | 'currentpagechange'
  | 'close'
  | 'timerstart'
  | 'timerstop'
  | 'timerpause'
  | 'timerresume'
  | 'timeradjust'
  | 'timerdone'
/**
 * @see https://developers.figma.com/docs/plugins/api/figma
 */
interface PluginAPI {
  /**
   * The version of the Figma API this plugin is running on, as defined in your `manifest.json` in the `"api"` field.
   */
  readonly apiVersion: '1.0.0'
  /**
   * The currently executing command from the `manifest.json` file. It is the command string in the `ManifestMenuItem` (more details in the [manifest guide](https://developers.figma.com/docs/plugins/manifest)). If the plugin does not have any menu item, this property is undefined.
   */
  readonly command: string
  /**
   * The current editor type this plugin is running in. See also [Setting editor type](https://developers.figma.com/docs/plugins/setting-editor-type).
   */
  readonly editorType: 'figma' | 'figjam' | 'dev' | 'slides' | 'buzz'
  /**
   * Return the context the plugin is current running in.
   *
   * - `default` - The plugin is running as a normal plugin.
   * - `textreview` - The plugin is running to provide text review functionality.
   * - `inspect` - The plugin is running in the Inspect panel in Dev Mode.
   * - `codegen` - The plugin is running in the Code section of the Inspect panel in Dev Mode.
   * - `linkpreview` - The plugin is generating a link preview for a [Dev resource](https://help.figma.com/hc/en-us/articles/15023124644247#Add_external_links_and_resources_for_developers) in Dev Mode.
   * - `auth` - The plugin is running to authenticate a user in Dev Mode.
   *
   * Caution: The `linkpreview` and `auth` modes are only available to partner and Figma-owned plugins.
   *
   * @remarks
   * Here’s a simplified example where you can create an if statement in a plugin that has one set of functionality when it is run in `Dev Mode`, and another set of functionality when run in Figma design:
   * ```ts title="Code sample to determine editorType and mode"
   * if (figma.editorType === "dev") {
   *   // Read the document and listen to API events
   *   if (figma.mode === "inspect") {
   *     // Running in inspect panel mode
   *   } else if (figma.mode === "codegen") {
   *     // Running in codegen mode
   *   }
   * } else if (figma.editorType === "figma") {
   *   // If the plugin is run in Figma design, edit the document
   *   if (figma.mode === 'textreview') {
   *     // Running in text review mode
   *   }
   * } else if (figma.editorType === "figjam") {
   *   // Do FigJam only operations
   *   if (figma.mode === 'textreview') {
   *     // Running in text review mode
   *   }
   * }
   * ```
   */
  readonly mode: 'default' | 'textreview' | 'inspect' | 'codegen' | 'linkpreview' | 'auth'
  /**
   * The value specified in the `manifest.json` "id" field. This only exists for Plugins.
   */
  readonly pluginId?: string
  /**
   * Similar to `figma.pluginId` but for widgets. The value specified in the `manifest.json` "id" field. This only exists for Widgets.
   */
  readonly widgetId?: string
  /**
   * The file key of the current file this plugin is running on.
   * **Only [private plugins](https://help.figma.com/hc/en-us/articles/4404228629655-Create-private-organization-plugins) and Figma-owned resources (such as the Jira and Asana widgets) have access to this.**
   * To enable this behavior, you need to specify `enablePrivatePluginApi` in your `manifest.json`.
   */
  readonly fileKey: string | undefined
  /**
   * When enabled, causes all node properties and methods to skip over invisible nodes (and their descendants) inside {@link InstanceNode | instances}.
   * This makes operations like document traversal much faster.
   *
   * Note: Defaults to true in Figma Dev Mode and false in Figma and FigJam
   *
   * @remarks
   *
   * Accessing and modifying invisible nodes and their descendants inside instances can be slow with the plugin API.
   * This is especially true in large documents with tens of thousands of nodes where a call to {@link ChildrenMixin.findAll} might come across many of these invisible instance children.
   *
   * If your plugin does not need access to these nodes, we recommend setting `figma.skipInvisibleInstanceChildren = true` as that often makes document traversal significantly faster.
   *
   * When this flag is enabled, it will not be possible to access invisible nodes (and their descendants) inside instances. This has the following effects:
   *
   * - {@link Childre
```