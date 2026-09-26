const ROUTES = {
  SCREEN_REGION: ['visual_inspection'],
  IMAGE: ['visual_inspection'],
  TAB_CONTEXT: ['dom_or_text_context'],
  SAVED_HTML: ['snapshot_harvest'],
  RECORDER_EXPORT: ['user_flow_harvest'],
  SCREENPIPE_EXPORT: ['activity_timeline_harvest'],
  GITHUB: ['git_structural_read'],
  RUNTIME: ['live_runtime_measurement'],
  LOG: ['log_observation'],
  VPS: ['runtime_remote_read'],
  WEB: ['external_research'],
  URL: ['external_research'],
  FILE: ['file_harvest'],
  TEXT: ['text_harvest'],
  VOICE: ['transcript_harvest']
};

export function selectCapability(source) {
  const candidates = ROUTES[source.kind] ?? ['generic_read'];
  return {
    policy: 'MINIMUM_SUFFICIENT_CAPABILITY',
    candidates,
    selected: candidates[0],
    mutation: false
  };
}
