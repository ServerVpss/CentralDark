const fs = require('fs');
const path = require('path');

// Electron caches userData when taking its instance lock. Select the profile
// before that call, independent of whether setName has already run.
function resolveLinuxUserDataPath(configRoot) {
  const current = path.join(configRoot, 'codeagentswarm');
  const legacy = path.join(configRoot, 'CodeAgentSwarm');
  // If both databases exist, retain the current profile and its explicit choices.
  // Reuse a legacy-only profile in place: no copying auth, SQLite WALs or settings.
  return !fs.existsSync(path.join(current, 'codeagentswarm.db'))
    && fs.existsSync(path.join(legacy, 'codeagentswarm.db')) ? legacy : current;
}

module.exports = { resolveLinuxUserDataPath };
