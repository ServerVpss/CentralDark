# COMANDO - importExportService.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\app\lib\services\importExportService.ts
**SHA:** 40331773bc375105
**Timestamp:** 2026-08-28T02:56:18.512629
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- cachedPrompt: allCookies.cachedPrompt,

### Ouro Bruto (primeiros 5000 chars)
```
import Cookies from 'js-cookie';
import { type Message } from 'ai';
import { getAllChats, deleteChat } from '~/lib/persistence/chats';

interface ExtendedMessage extends Message {
  name?: string;
  function_call?: any;
  timestamp?: number;
}

/**
 * Service for handling import and export operations of application data
 */
export class ImportExportService {
  /**
   * Export all chats to a JSON file
   * @param db The IndexedDB database instance
   * @returns A promise that resolves to the export data
   */
  static async exportAllChats(db: IDBDatabase): Promise<{ chats: any[]; exportDate: string }> {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      // Get all chats from the database using the getAllChats helper
      const chats = await getAllChats(db);

      // Validate and sanitize each chat before export
      const sanitizedChats = chats.map((chat) => ({
        id: chat.id,
        description: chat.description || '',
        messages: chat.messages.map((msg: ExtendedMessage) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          name: msg.name,
          function_call: msg.function_call,
          timestamp: msg.timestamp,
        })),
        timestamp: chat.timestamp,
        urlId: chat.urlId || null,
        metadata: chat.metadata || null,
      }));

      console.log(`Successfully prepared ${sanitizedChats.length} chats for export`);

      return {
        chats: sanitizedChats,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting chats:', error);
      throw new Error(`Failed to export chats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export application settings to a JSON file
   * @returns A promise that resolves to the settings data
   */
  static async exportSettings(): Promise<any> {
    try {
      // Get all cookies
      const allCookies = Cookies.get();

      // Create a comprehensive settings object
      return {
        // Core settings
        core: {
          // User profile and main settings
          bolt_user_profile: this._safeGetItem('bolt_user_profile'),
          bolt_settings: this._safeGetItem('bolt_settings'),
          bolt_profile: this._safeGetItem('bolt_profile'),
          theme: this._safeGetItem('theme'),
        },

        // Provider settings (both local and cloud)
        providers: {
          // Provider configurations from localStorage
          provider_settings: this._safeGetItem('provider_settings'),

          // API keys from cookies
          apiKeys: allCookies.apiKeys,

          // Selected provider and model
          selectedModel: allCookies.selectedModel,
          selectedProvider: allCookies.selectedProvider,

          // Provider-specific settings
          providers: allCookies.providers,
        },

        // Feature settings
        features: {
          // Feature flags
          viewed_features: this._safeGetItem('bolt_viewed_features'),
          developer_mode: this._safeGetItem('bolt_developer_mode'),

          // Context optimization
          contextOptimizationEnabled: this._safeGetItem('contextOptimizationEnabled'),

          // Auto-select template
          autoSelectTemplate: this._safeGetItem('autoSelectTemplate'),

          // Latest branch
          isLatestBranch: this._safeGetItem('isLatestBranch'),

          // Event logs
          isEventLogsEnabled: this._safeGetItem('isEventLogsEnabled'),

          // Energy saver settings
          energySaverMode: this._safeGetItem('energySaverMode'),
          autoEnergySaver: this._safeGetItem('autoEnergySaver'),
        },

        // UI configuration
        ui: {
          // Tab configuration
          bolt_tab_configuration: this._safeGetItem('bolt_tab_configuration'),
          tabConfiguration: allCookies.tabConfiguration,

          // Prompt settings
          promptId: this._safeGetItem('promptId'),
          cachedPrompt: allCookies.cachedPrompt,
        },

        // Connections
        connections: {
          // Netlify connection
          netlify_connection: this._safeGetItem('netlify_connection'),

          // GitHub connections
          ...this._getGitHubConnections(allCookies),
        },

        // Debug and logs
        debug: {
          // Debug settings
          isDebugEnabled: allCookies.isDebugEnabled,
          acknowledged_debug_issues: this._safeGetItem('bolt_acknowledged_debug_issues'),
          acknowledged_connection_issue: this._safeGetItem('bolt_acknowledged_connection_issue'),

          // Error logs
          error_logs: this._safeGetItem('error_logs'),
          bolt_read_logs: this._safeGetItem('bolt_read_logs'),

          // Event logs
          eventLogs: allCookies.eventLogs,
        },

        // Update settings
        updates: {
          update_settings: this._safeGetItem('update_settings'),
          last_acknowledged_update: this._s
```