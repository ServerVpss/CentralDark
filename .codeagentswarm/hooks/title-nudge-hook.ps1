# ============================================================================
# title-nudge-hook.ps1 - CodeAgentSwarm UserPromptSubmit nudge
# Reminds the agent to set a terminal title and keep its activity fresh.
# Stdout is injected as context by Claude Code. Silent when nothing is needed.
# ============================================================================
$q = $env:CODEAGENTSWARM_CURRENT_QUADRANT
$tid = $env:CODEAGENTSWARM_TERMINAL_ID
# Not inside CodeAgentSwarm (no quadrant AND no terminal id) -> stay silent.
if ((-not $q) -and (-not $tid)) { exit 0 }
$stateDir = Join-Path $env:USERPROFILE '.codeagentswarm\terminal-nudge-state'
# Key on the STABLE terminal id when present (renumber-proof, same as the gate); else quadrant.
if ($tid) { $key = ($tid -replace '[^A-Za-z0-9_-]', '_') } else { $key = $q }
$titleFile = Join-Path $stateDir ($key + '.title')
$activityFile = Join-Path $stateDir ($key + '.activity')
$statusFile = Join-Path $stateDir ($key + '.status')
# Per-agent Privacy toggle (this script is Claude-only: UserPromptSubmit is a Claude Code hook).
$statusOffFlag = Join-Path $stateDir 'status-off-claude'
if (-not (Test-Path $titleFile)) {
  if ((Test-Path $statusOffFlag) -or (Test-Path (Join-Path $stateDir ($key + '.coordinator')))) {
    Write-Output 'CodeAgentSwarm: this agent still has no title. Before doing anything else, call set_terminal_title with a short feature-level title, then update_terminal_activity with what you are about to do.'
  } else {
    Write-Output 'CodeAgentSwarm: this agent still has no title. Before doing anything else, call set_terminal_title with a short feature-level title, then update_terminal_activity with what you are about to do, and set_terminal_status with status="working".'
  }
} elseif ((-not (Test-Path $activityFile)) -or (((Get-Date) - (Get-Item $activityFile).LastWriteTime).TotalMinutes -gt 10)) {
  Write-Output 'CodeAgentSwarm: your agent activity is stale. Call update_terminal_activity with what you are doing right now so the Agent tab keeps showing your current status.'
}
# Work-phase STATUS nudge (independent): the user just sent a prompt, so a resting
# status is about to be wrong. The .status file's CONTENT is the current status key.
# Silenced when the status feature is off for Claude (title/activity nudges unaffected).
if ((-not (Test-Path $statusOffFlag)) -and (-not (Test-Path (Join-Path $stateDir ($key + '.coordinator')))) -and (Test-Path $titleFile)) {
  if (-not (Test-Path $statusFile)) {
    Write-Output 'CodeAgentSwarm: this agent has no work-phase status yet. If you are starting to work, call set_terminal_status with status="working" and keep it updated at every phase change.'
  } else {
    $currentStatus = (Get-Content $statusFile -Raw -ErrorAction SilentlyContinue)
    if ($currentStatus) { $currentStatus = $currentStatus.Trim() }
    if ($currentStatus -and ($currentStatus -ne 'working')) {
      Write-Output ("CodeAgentSwarm: the user just sent a prompt while this agent's status is '" + $currentStatus + "'. If you are going to work on it, call set_terminal_status with status=""working"" NOW; and when you stop again (asking something, handing over for testing, or finished) set the matching status before ending your turn.")
    }
  }
}
exit 0
