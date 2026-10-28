/**
 * TaskSystemPreferences
 *
 * Encapsulates the granular task-system toggle state across all agents:
 *   - task_instructions_enabled : whether the CAS instruction section is injected
 *                                  in agent files (CLAUDE.md / GEMINI.md / AGENTS.md)
 *   - task_mcp_enabled          : whether the CAS MCP server entry is registered
 *                                  in agent configs (.claude.json / .gemini/settings.json
 *                                  / .codex/config.toml)
 *   terminal_status_enabled_<agentId> : per-agent work-phase status toggle; when
 *                                  OFF the agent's instruction file drops the
 *                                  status rules and the MCP server hides
 *                                  set_terminal_status for that agent (default true)
 *
 * Constraint:
 *   Disabling MCP forces instructions off (instructions are useless without MCP tools).
 *   Enabling instructions is rejected when MCP is off.
 *
 * Legacy compatibility:
 *   The old single setting `task_system_enabled` is kept in sync with the AND of
 *   the two new settings. Existing callers that read it (e.g. ensureAllAgentMdConfigurations)
 *   keep working.
 *
 * Migration:
 *   On first read after the upgrade, if `task_system_enabled` exists and the new
 *   keys do not, migrateLegacy() copies the legacy value into both new keys.
 */

const SETTINGS_INSTRUCTIONS = 'task_instructions_enabled';
const SETTINGS_MCP = 'task_mcp_enabled';
const SETTINGS_LEGACY = 'task_system_enabled';
// Automatic task management (the kanban workflow: create/start/complete tasks).
// Independent from the toggles above: when OFF, agents keep the MCP server and
// the terminal-title tools but lose the task tools and the kanban instructions
// (instruction files are written with the 'titles-only' variant).
const SETTINGS_TASK_MANAGEMENT = 'task_management_enabled';
// Task CREATION, a sub-toggle of kanban automation. Per-agent key prefix
// (`task_creation_mode_<agentId>`): automatic, on-request (default), or never.
// Legacy enabled booleans remain readable; task tools still depend on kanban.
const SETTINGS_TASK_CREATION_PREFIX = 'task_creation_enabled';
const SETTINGS_TASK_CREATION_MODE_PREFIX = 'task_creation_mode';
const TASK_CREATION_MODES = ['automatic', 'on-request', 'never'];

// Shared by Settings and the MCP server. Legacy choices retain their meaning;
// an unset preference starts in the explicit-request mode.
function readTaskCreationMode(db, agentId) {
    const mode = agentId ? db.getSetting(`${SETTINGS_TASK_CREATION_MODE_PREFIX}_${agentId}`) : null;
    if (mode !== null && mode !== undefined) {
        return TASK_CREATION_MODES.includes(mode) ? mode : 'on-request';
    }
    const legacy = agentId ? db.getSetting(`${SETTINGS_TASK_CREATION_PREFIX}_${agentId}`) : null;
    const value = legacy ?? db.getSetting(SETTINGS_TASK_CREATION_PREFIX);
    if (value === true || value === 'true') return 'automatic';
    if (value === false || value === 'false') return 'never';
    return 'on-request';
}

// Dynamic terminal titles & activity. Per-agent key prefix
// (`terminal_titles_enabled_<agentId>`): when OFF for an agent, that agent's
// instruction file drops the title/activity rules and the MCP server hides the
// title tools for that agent. Defaults to true when unset.
const SETTINGS_TITLES_PREFIX = 'terminal_titles_enabled';
// Terminal work-phase status. Per-agent key prefix
// (`terminal_status_enabled_<agentId>`): when OFF for an agent, that agent's
// instruction file drops the work-phase-status rules and the MCP server hides
// `set_terminal_status` for that agent. Defaults to true when unset.
const SETTINGS_STATUS_PREFIX = 'terminal_status_enabled';
// One-shot marker for migratePerAgentSplit(): 'true' once the legacy fused
// per-agent state has been split into the three independent per-agent keys.
const SETTINGS_SPLIT_MIGRATION = 'task_toggles_split_migrated_v1';
const SETTINGS_SESSION_COMMUNICATION = 'session_communication_enabled';

class TaskSystemPreferences {
    /**
     * @param {{getSetting:Function,setSetting:Function}} db - SQLite settings facade
     * @param {object} registry - AgentConfigRegistry instance with the granular *ForAll methods
     */
    constructor(db, registry) {
        this.db = db;
        this.registry = registry;
    }

    /** @returns {boolean} default false until the user opts in */
    getInstructionsEnabled() {
        return this._readBoolSetting(SETTINGS_INSTRUCTIONS, false);
    }

    /** @returns {boolean} default false until the user opts in */
    getMcpEnabled() {
        return this._readBoolSetting(SETTINGS_MCP, false);
    }

    /** @returns {boolean} default true when nothing persisted */
    getTaskManagementEnabled() {
        return this._readBoolSetting(SETTINGS_TASK_MANAGEMENT, true);
    }

    /**
     * Which instruction variant the current settings call for.
     * @returns {'full'|'titles-only'}
     */
    getInstructionsVariant() {
        return this.getTaskManagementEnabled() ? 'full' : 'titles-only';
    }

    /**
     * Toggle automatic task management (kanban) while keeping the MCP server and
     * terminal titles. Persists the setting and rewrites the instruction files of
     * every agent whose task system is on, using the matching variant. The MCP
     * server reads the same setting per call, so no MCP re-registration is needed.
     * @param {boolean} enabled
     */
    async setTaskManagementEnabled(enabled) {
        this.db.setSetting(SETTINGS_TASK_MANAGEMENT, enabled ? 'true' : 'false');
        // Fan the global decision out to every agent's per-agent kanban key so the
        // global toggle and the per-agent toggles never disagree. Guarded so old
        // registry doubles without getAllIds() (used in some unit tests) don't crash.
        if (typeof this.registry.getAllIds === 'function') {
            for (const id of this.registry.getAllIds()) {
                this.db.setSetting(`${SETTINGS_TASK_MANAGEMENT}_${id}`, enabled ? 'true' : 'false');
            }
        }
        // The variant arg is now a per-agent resolver (the split model computes a
        // distinct variant per agent from its three independent toggles).
        return this.registry.ensureAllInstructionFiles(
            id => this.getTaskSystemEnabledForAgent(id),
            id => this.getInstructionsVariantForAgent(id),
            id => this._sectionOptionsForAgent(id)
        );
    }

    /**
     * One-shot migration of the legacy `task_system_enabled` key into the two new ones.
     * Idempotent: if the new keys already have values, leaves them alone.
     */
    migrateLegacy() {
        const legacy = this.db.getSetting(SETTINGS_LEGACY);
        if (legacy === null || legacy === undefined) return;

        const legacyValue = this._coerceBool(legacy) ? 'true' : 'false';

        if (this.db.getSetting(SETTINGS_INSTRUCTIONS) === null) {
            this.db.setSetting(SETTINGS_INSTRUCTIONS, legacyValue);
        }
        if (this.db.getSetting(SETTINGS_MCP) === null) {
            this.db.setSetting(SETTINGS_MCP, legacyValue);
        }
    }

    /**
     * Toggle the CAS instruction section injection across all agents.
     * Rejects enabling when MCP is currently disabled (instructions need MCP tools).
     * @param {boolean} enabled
     */
    async setInstructionsEnabled(enabled) {
        if (enabled && !this.getMcpEnabled()) {
            return {
                success: false,
                message: 'Cannot enable instructions while MCP is disabled. Enable MCP first.'
            };
        }

        this.db.setSetting(SETTINGS_INSTRUCTIONS, enabled ? 'true' : 'false');
        this._syncLegacy();

        return enabled
            ? await this.registry.enableInstructionsForAll(this.getInstructionsVariant())
            : await this.registry.disableInstructionsForAll();
    }

    /**
     * Toggle the CAS MCP server registration across all agents.
     * Disabling MCP also disables instructions (constraint).
     * @param {boolean} enabled
     */
    async setMcpEnabled(enabled) {
        this.db.setSetting(SETTINGS_MCP, enabled ? 'true' : 'false');

        if (!enabled) {
            this.db.setSetting(SETTINGS_INSTRUCTIONS, 'false');
            this._syncLegacy();
            await this.registry.disableInstructionsForAll();
            return await this.registry.disableMcpForAll();
        }

        this._syncLegacy();
        return await this.registry.enableMcpForAll();
    }

    // ============================================================
    // Per-agent split model: three independent per-agent toggles
    // ============================================================
    // Each agent has THREE independent per-agent toggles:
    //   1. Kanban automation  → task_management_enabled_<id>  (fallback: global
    //      task_management_enabled, default true)
    //   2. Dynamic titles     → terminal_titles_enabled_<id>  (fallback: true)
    //   3. MCP connection      → task_mcp_enabled_<id>         (fallback chain:
    //      fused task_system_enabled_<id>, else global instructions && mcp)
    // MCP off makes tasks + titles EFFECTIVELY off for the agent WITHOUT touching
    // their persisted keys (those are the memory restored when MCP is re-enabled).

    /**
     * The base "MCP connection" intent for an agent — whether the CAS MCP server
     * entry should be registered for it. Falls back through the legacy fused key
     * (task_system_enabled_<id>) and then the global instructions+mcp pair, so
     * pre-split users retain their setting while fresh installs stay Off until consent.
     * @param {string} agentId
     * @returns {boolean}
     */
    getMcpEnabledForAgent(agentId) {
        const perAgentMcp = this.db.getSetting(`${SETTINGS_MCP}_${agentId}`);
        if (perAgentMcp !== null && perAgentMcp !== undefined) {
            return this._coerceBool(perAgentMcp);
        }
        const fused = this.db.getSetting(`${SETTINGS_LEGACY}_${agentId}`);
        if (fused !== null && fused !== undefined) {
            return this._coerceBool(fused);
        }
        return this.getInstructionsEnabled() && this.getMcpEnabled();
    }

    /**
     * Per-agent kanban automation intent. Falls back to the global setting.
     * @param {string} agentId
     * @returns {boolean}
     */
    getTaskManagementEnabledForAgent(agentId) {
        const perAgent = this.db.getSetting(`${SETTINGS_TASK_MANAGEMENT}_${agentId}`);
        if (perAgent === null || perAgent === undefined) {
            return this.getTaskManagementEnabled();
        }
        return this._coerceBool(perAgent);
    }

    getTaskCreationModeForAgent(agentId) {
        return readTaskCreationMode(this.db, agentId);
    }

    // Compatibility for consumers that only need tool availability.
    getTaskCreationEnabledForAgent(agentId) {
        return this.getTaskCreationModeForAgent(agentId) !== 'never';
    }

    /**
     * Per-agent dynamic titles/activity intent. Defaults to true when unset.
     * @param {string} agentId
     * @returns {boolean}
     */
    getTitlesEnabledForAgent(agentId) {
        const perAgent = this.db.getSetting(`${SETTINGS_TITLES_PREFIX}_${agentId}`);
        if (perAgent === null || perAgent === undefined) {
            return true;
        }
        return this._coerceBool(perAgent);
    }

    /**
     * Per-agent terminal work-phase status intent. Defaults to true when unset.
     * @param {string} agentId
     * @returns {boolean}
     */
    getStatusEnabledForAgent(agentId) {
        const perAgent = this.db.getSetting(`${SETTINGS_STATUS_PREFIX}_${agentId}`);
        if (perAgent === null || perAgent === undefined) {
            return true;
        }
        return this._coerceBool(perAgent);
    }

    /**
     * EFFECTIVE work-phase status for an agent: persisted status intent AND MCP connected.
     * @param {string} agentId
     * @returns {boolean}
     */
    isStatusEffectiveForAgent(agentId) {
        return this.getMcpEnabledForAgent(agentId) && this.getStatusEnabledForAgent(agentId);
    }

    // Section-level options for an agent's instruction file. Status, task creation
    // and session communication are flags, so they do not multiply the variant matrix.
    _sectionOptionsForAgent(agentId) {
        return {
            includeStatus: this.getStatusEnabledForAgent(agentId),
            allowTaskCreation: this.getTaskCreationEnabledForAgent(agentId),
            taskCreationMode: this.getTaskCreationModeForAgent(agentId),
            includeSessionCommunication: this.getSessionCommunicationEnabled() && this.getMcpEnabledForAgent(agentId)
        };
    }

    /**
     * EFFECTIVE kanban for an agent: persisted kanban intent AND MCP connected.
     * @param {string} agentId
     * @returns {boolean}
     */
    isTaskManagementEffectiveForAgent(agentId) {
        return this.getMcpEnabledForAgent(agentId) && this.getTaskManagementEnabledForAgent(agentId);
    }

    /**
     * EFFECTIVE task creation for an agent: kanban effective AND creation intent.
     * Kanban off already removes every task tool, so creation cannot outlive it.
     * @param {string} agentId
     * @returns {boolean}
     */
    isTaskCreationEffectiveForAgent(agentId) {
        return this.isTaskManagementEffectiveForAgent(agentId) && this.getTaskCreationEnabledForAgent(agentId);
    }

    /**
     * EFFECTIVE titles for an agent: persisted titles intent AND MCP connected.
     * @param {string} agentId
     * @returns {boolean}
     */
    isTitlesEffectiveForAgent(agentId) {
        return this.getMcpEnabledForAgent(agentId) && this.getTitlesEnabledForAgent(agentId);
    }

    /**
     * The instruction-file variant an agent's current toggles call for (2x2 matrix
     * plus the MCP-off short-circuit):
     *   - mcp off                  → 'none' (section removed entirely)
     *   - tasks on,  titles on     → 'full'
     *   - tasks off, titles on     → 'titles-only'
     *   - tasks on,  titles off    → 'tasks-only'
     *   - tasks off, titles off    → communication-only when enabled, else 'none'
     * @param {string} agentId
     * @returns {'full'|'titles-only'|'tasks-only'|'communication-only'|'none'}
     */
    getInstructionsVariantForAgent(agentId) {
        if (!this.getMcpEnabledForAgent(agentId)) return 'none';
        const tasks = this.getTaskManagementEnabledForAgent(agentId);
        const titles = this.getTitlesEnabledForAgent(agentId);
        if (tasks && titles) return 'full';
        if (!tasks && titles) return 'titles-only';
        if (tasks && !titles) return 'tasks-only';
        return this.getSessionCommunicationEnabled() ? 'communication-only' : 'none';
    }

    /**
     * Toggle per-agent kanban automation. Persists the intent and, when the agent
     * is still connected (MCP on), rewrites its instruction file to the resulting
     * variant. When MCP is off the change is remembered but not applied (nothing
     * to write — the section is absent).
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setTaskManagementEnabledForAgent(agentId, enabled) {
        return this._setInstructionPreferenceForAgent(
            agentId,
            `${SETTINGS_TASK_MANAGEMENT}_${agentId}`,
            enabled,
            this.getTaskManagementEnabledForAgent(agentId)
        );
    }

    /**
     * Toggle per-agent task CREATION. Same shape as setTaskManagementEnabledForAgent:
     * the instruction variant itself never changes, only the no-create override block
     * threaded via _sectionOptionsForAgent.
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setTaskCreationEnabledForAgent(agentId, enabled) {
        if (typeof enabled !== 'boolean') throw new Error('Task creation enabled must be a boolean');
        return this.setTaskCreationModeForAgent(agentId, enabled ? 'automatic' : 'never');
    }

    async setTaskCreationModeForAgent(agentId, mode) {
        if (!TASK_CREATION_MODES.includes(mode)) throw new Error('Unknown task creation mode');
        return this._setInstructionPreferenceForAgent(
            agentId,
            `${SETTINGS_TASK_CREATION_MODE_PREFIX}_${agentId}`,
            mode,
            this.getTaskCreationModeForAgent(agentId)
        );
    }

    /**
     * Toggle per-agent dynamic titles/activity. Same shape as
     * setTaskManagementEnabledForAgent.
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setTitlesEnabledForAgent(agentId, enabled) {
        return this._setInstructionPreferenceForAgent(
            agentId,
            `${SETTINGS_TITLES_PREFIX}_${agentId}`,
            enabled,
            this.getTitlesEnabledForAgent(agentId)
        );
    }

    /**
     * Toggle per-agent terminal work-phase status. Same shape as
     * setTitlesEnabledForAgent. The instruction variant itself is unchanged; only
     * the include-flag differs (status rules are threaded via _sectionOptionsForAgent).
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setStatusEnabledForAgent(agentId, enabled) {
        return this._setInstructionPreferenceForAgent(
            agentId,
            `${SETTINGS_STATUS_PREFIX}_${agentId}`,
            enabled,
            this.getStatusEnabledForAgent(agentId)
        );
    }

    async _setInstructionPreferenceForAgent(agentId, settingKey, enabled, previous) {
        if (this.db.setSetting(settingKey, String(enabled)) === false) {
            throw new Error('Could not save integration preference');
        }
        if (!this.getMcpEnabledForAgent(agentId)) {
            return { success: true, message: 'Saved; agent is disconnected (MCP off)' };
        }
        try {
            const result = await this.registry.applyInstructionVariantFor(
                agentId,
                this.getInstructionsVariantForAgent(agentId),
                this._sectionOptionsForAgent(agentId)
            );
            if (!result || !result.success) this.db.setSetting(settingKey, String(previous));
            return result;
        } catch (error) {
            this.db.setSetting(settingKey, String(previous));
            throw error;
        }
    }

    /**
     * Toggle the per-agent MCP connection (the base toggle). Persists the intent
     * AND keeps the legacy fused key task_system_enabled_<id> in sync (old boot
     * readers still consult it). Disabling removes the instruction section AND the
     * MCP entry, leaving the per-feature keys untouched (memory for a later
     * re-enable). Enabling adds the MCP entry back and writes the variant the
     * per-feature toggles call for.
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setMcpEnabledForAgent(agentId, enabled) {
        if (!enabled) {
            // Do not claim Off until disk cleanup has succeeded. If malformed
            // user config blocks cleanup, the UI remains truthful and retryable.
            const result = await this.registry.disableTaskSystemFor(agentId);
            if (result && result.success) {
                this.db.setSetting(`${SETTINGS_MCP}_${agentId}`, 'false');
                this.db.setSetting(`${SETTINGS_LEGACY}_${agentId}`, 'false');
            }
            return result;
        }

        const previousMcp = this.db.getSetting(`${SETTINGS_MCP}_${agentId}`);
        const previousLegacy = this.db.getSetting(`${SETTINGS_LEGACY}_${agentId}`);
        this.db.setSetting(`${SETTINGS_MCP}_${agentId}`, 'true');
        this.db.setSetting(`${SETTINGS_LEGACY}_${agentId}`, 'true');
        const mcpResult = await this.registry.enableMcpFor(agentId);
        if (!mcpResult || !mcpResult.success) {
            this.db.setSetting(`${SETTINGS_MCP}_${agentId}`, previousMcp ?? 'false');
            this.db.setSetting(`${SETTINGS_LEGACY}_${agentId}`, previousLegacy ?? 'false');
            return {
                success: false,
                message: mcpResult?.message || `Failed to enable MCP connection for ${agentId}`
            };
        }
        const variantResult = await this.registry.applyInstructionVariantFor(
            agentId,
            this.getInstructionsVariantForAgent(agentId),
            this._sectionOptionsForAgent(agentId)
        );
        const bothSucceeded = !!(mcpResult && mcpResult.success) && !!(variantResult && variantResult.success);
        if (!bothSucceeded) {
            await this.registry.disableTaskSystemFor(agentId);
            this.db.setSetting(`${SETTINGS_MCP}_${agentId}`, previousMcp ?? 'false');
            this.db.setSetting(`${SETTINGS_LEGACY}_${agentId}`, previousLegacy ?? 'false');
        }
        return {
            success: bothSucceeded,
            message: bothSucceeded
                ? `MCP connection enabled for ${agentId}`
                : `Failed to fully enable MCP connection for ${agentId}`
        };
    }

    /**
     * One-shot idempotent migration that seeds the three independent per-agent keys
     * from the legacy fused state. Guarded by SETTINGS_SPLIT_MIGRATION so it runs
     * exactly once. For each agentId (never overwriting an existing value):
     *   - task_mcp_enabled_<id>        ← fused fallback chain value
     *   - task_management_enabled_<id> ← global getTaskManagementEnabled()
     *   - terminal_titles_enabled_<id> ← true
     * Fresh install ⇒ MCP Off until consent; feature choices remembered as On.
     * Synchronous (db reads/writes only).
     * @param {Array<string>} agentIds
     */
    migratePerAgentSplit(agentIds) {
        const ids = Array.isArray(agentIds) ? agentIds : [];
        const legacyMigrated = this._coerceBool(this.db.getSetting(SETTINGS_SPLIT_MIGRATION));

        for (const id of ids) {
            const mcpKey = `${SETTINGS_MCP}_${id}`;
            const mgmtKey = `${SETTINGS_TASK_MANAGEMENT}_${id}`;
            const titlesKey = `${SETTINGS_TITLES_PREFIX}_${id}`;
            const has = (k) => this.db.getSetting(k) !== null && this.db.getSetting(k) !== undefined;

            // Post-flag runs only handle a BRAND-NEW agent (no keys at all): an agent
            // added to the roster after the one-shot split (e.g. kimi, 2026-07-17)
            // must not silently inherit the STALE pre-split globals — on installs
            // where the user later drove everything per-agent, the old fused global
            // can say 'false' while every visible agent is ON. Existing keys are
            // never touched.
            if (legacyMigrated && (has(mcpKey) || has(mgmtKey) || has(titlesKey))) {
                continue;
            }

            // Peer-based default for a new agent: debut like the roster it joins
            // (ON if ANY peer is on); fall back to the fused/global chain when
            // there are no peers to imitate (fresh installs keep MCP Off).
            const peerDefault = (prefix, fallback) => {
                for (const other of ids) {
                    if (other === id) continue;
                    const v = this.db.getSetting(`${prefix}_${other}`);
                    if (v !== null && v !== undefined && this._coerceBool(v)) return true;
                }
                return fallback;
            };

            if (!has(mcpKey)) {
                // getMcpEnabledForAgent resolves the fused fallback chain while the
                // per-agent MCP key is still unset (it is, inside this branch).
                const fallback = this.getMcpEnabledForAgent(id);
                this.db.setSetting(mcpKey, (legacyMigrated ? peerDefault(SETTINGS_MCP, fallback) : fallback) ? 'true' : 'false');
            }

            if (!has(mgmtKey)) {
                const fallback = this.getTaskManagementEnabled();
                this.db.setSetting(mgmtKey, (legacyMigrated ? peerDefault(SETTINGS_TASK_MANAGEMENT, fallback) : fallback) ? 'true' : 'false');
            }

            if (!has(titlesKey)) {
                this.db.setSetting(titlesKey, 'true');
            }
        }
        this.db.setSetting(SETTINGS_SPLIT_MIGRATION, 'true');
    }

    /**
     * Seed the global cross-session setting once. Existing users get it only
     * when every detected agent already has MCP enabled; otherwise it stays off.
     * @param {Array<string>} agentIds
     */
    migrateSessionCommunication(agentIds) {
        const existing = this.db.getSetting(SETTINGS_SESSION_COMMUNICATION);
        if (existing !== null && existing !== undefined) return;
        const ids = Array.isArray(agentIds) ? agentIds : [];
        const enabled = ids.length > 0 && ids.every(id => this.getMcpEnabledForAgent(id));
        this.db.setSetting(SETTINGS_SESSION_COMMUNICATION, enabled ? 'true' : 'false');
    }

    getSessionCommunicationEnabled() {
        return this._readBoolSetting(SETTINGS_SESSION_COMMUNICATION, false);
    }

    /** Persist and reconcile instructions for future sessions only. */
    async setSessionCommunicationEnabled(enabled) {
        const previous = this.getSessionCommunicationEnabled();
        this.db.setSetting(SETTINGS_SESSION_COMMUNICATION, enabled ? 'true' : 'false');
        try {
            const result = await this.registry.ensureAllInstructionFiles(
                id => this.getTaskSystemEnabledForAgent(id),
                id => this.getInstructionsVariantForAgent(id),
                id => this._sectionOptionsForAgent(id)
            );
            if (!result || !result.success) {
                this.db.setSetting(SETTINGS_SESSION_COMMUNICATION, previous ? 'true' : 'false');
                await this.registry.ensureAllInstructionFiles(
                    id => this.getTaskSystemEnabledForAgent(id),
                    id => this.getInstructionsVariantForAgent(id),
                    id => this._sectionOptionsForAgent(id)
                );
            }
            return result || { success: false, message: 'Failed to update agent instructions' };
        } catch (error) {
            this.db.setSetting(SETTINGS_SESSION_COMMUNICATION, previous ? 'true' : 'false');
            throw error;
        }
    }

    /**
     * Now an alias for getMcpEnabledForAgent: in the split model the per-agent
     * "task system" concept means the MCP-connection intent (the base toggle).
     * Boot reconcilers keep calling this to decide whether to touch an agent.
     * @param {string} agentId
     * @returns {boolean}
     */
    getTaskSystemEnabledForAgent(agentId) {
        return this.getMcpEnabledForAgent(agentId);
    }

    /**
     * DEPRECATED alias: the fused per-agent toggle now routes through the MCP
     * connection toggle. Kept so existing callers keep compiling.
     * @param {string} agentId
     * @param {boolean} enabled
     */
    async setTaskSystemEnabledForAgent(agentId, enabled) {
        return this.setMcpEnabledForAgent(agentId, enabled);
    }

    _syncLegacy() {
        const both = this.getInstructionsEnabled() && this.getMcpEnabled();
        this.db.setSetting(SETTINGS_LEGACY, both ? 'true' : 'false');
    }

    _readBoolSetting(key, defaultValue) {
        const value = this.db.getSetting(key);
        if (value === null || value === undefined) return defaultValue;
        return this._coerceBool(value);
    }

    _coerceBool(value) {
        return value === 'true' || value === true;
    }
}

module.exports = {
    TaskSystemPreferences,
    readTaskCreationMode,
    TASK_CREATION_MODES,
    SETTINGS_TASK_CREATION_MODE_PREFIX,
    SETTINGS_INSTRUCTIONS,
    SETTINGS_MCP,
    SETTINGS_LEGACY,
    SETTINGS_TASK_MANAGEMENT,
    SETTINGS_TASK_CREATION_PREFIX,
    SETTINGS_TITLES_PREFIX,
    SETTINGS_STATUS_PREFIX,
    SETTINGS_SPLIT_MIGRATION,
    SETTINGS_SESSION_COMMUNICATION
};
