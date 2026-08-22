const {SoulGate} = require('./soul-gate.cjs');

async function test() {
  const gate = new SoulGate();
  
  // Test 1: Unknown command should fail
  let res = await gate.mutate({action: 'EXECUTE_COMMAND', scope: 'test', writer: 'test', payload: {command: '!UNKNOWN'}, metadata: {}});
  console.log('Unknown command:', JSON.stringify({allowed: res.allowed, violations: res.violations.map(v => v.rule)}));
  
  // Test 2: Known command should pass pre-filter
  res = await gate.mutate({action: 'EXECUTE_COMMAND', scope: 'test', writer: 'test', payload: {command: '#ACORDAR'}, metadata: {}});
  console.log('#ACORDAR pre-filter:', JSON.stringify({allowed: res.allowed, stage: res.stage}));
  
  // Test 3: Simulate a full mutation with evidence (mock exec to return evidence)
  const originalExecute = gate.execute.bind(gate);
  gate.execute = async (ctx) => ({
    ...ctx,
    result: {success: true, evidence: 'sha123', receipt: 'abc'},
    executed: true,
    timestamp: Date.now()
  });
  res = await gate.mutate({action: 'GIT_COMMIT', scope: 'repo', writer: 'agent', payload: {message: 'test'}, metadata: {reuseChecked: true}});
  gate.execute = originalExecute;
  console.log('Git commit with evidence:', JSON.stringify({allowed: res.allowed, selfApplied: res.meta?.selfApplied}));
  
  // Test 4: Check that we have command rules loaded
  console.log('Rules loaded:', gate.getStatus().rulesLoaded);
  const commandRules = gate.rules.filter(r => r.type === 'command');
  console.log('Command rules:', commandRules.map(r => r.value));
}

test().catch(console.error);