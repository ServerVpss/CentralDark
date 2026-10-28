const { permissionOptionsForAgent, normalizePermissionModeForAgent } = require('../agent-drivers/chat-permission-modes');
const AUTO_WORK_STYLES = require('../../shared/utils/auto-work-styles');
// Kept in parity with SkillsService.SUPPORTED_CLIS by the Auto lane tests.
// This small contract is also extracted into the standalone MCP installation.
const AUTO_RUN_AGENTS = ['claude', 'codex', 'antigravity', 'opencode', 'kimi', 'grok', 'cursor', 'pi', 'devin', 'muse'];
const REASONING_IDS = ['effort', 'thinking', 'reasoning_effort'];

function validateAutoRun(value) {
  if (value == null) return null;
  const text = (input, max = 200) => typeof input === 'string' && input.trim()
    && input.length <= max && !/[\x00-\x1f\x7f]/.test(input);
  if (typeof value !== 'object' || Array.isArray(value) || !AUTO_RUN_AGENTS.includes(value.agent)
    || (value.model != null && !text(value.model))
    || (value.modelName != null && !text(value.modelName))
    || (value.useWorktree !== undefined && typeof value.useWorktree !== 'boolean')
    || (value.workStyle !== undefined && (typeof value.workStyle !== 'string' || !Object.hasOwn(AUTO_WORK_STYLES, value.workStyle)))
    || (value.permissionMode != null && value.permissionMode !== 'approval-required'
      && !permissionOptionsForAgent(value.agent, { allowBypassPermissions: true }).some(option => option.id === value.permissionMode))
    || (value.reasoning != null && (!REASONING_IDS.includes(value.reasoning.id)
      || !(typeof value.reasoning.value === 'boolean' || text(value.reasoning.value))))) {
    throw new Error('Invalid Auto run settings');
  }
  return {
    ...(value.useLaneDefaults === true ? { useLaneDefaults: true } : {}),
    ...(typeof value.useWorktree === 'boolean' ? { useWorktree: value.useWorktree } : {}),
    ...(value.workStyle !== undefined ? { workStyle: value.workStyle } : {}),
    agent: value.agent, model: value.model || null, modelName: value.modelName || value.model || null,
    reasoning: value.reasoning ? { id: value.reasoning.id, value: value.reasoning.value } : null,
    permissionMode: normalizePermissionModeForAgent(value.agent, value.permissionMode), retries: 0,
  };
}

module.exports = { AUTO_RUN_AGENTS, validateAutoRun };
