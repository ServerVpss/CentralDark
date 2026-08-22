const {SoulGate} = require('./soul-gate.cjs');

async function test() {
  console.log('Testing SOUL Gate...');
  const gate = new SoulGate();
  
  // Debug: Check what rules were loaded
  console.log('Rules loaded:', gate.getStatus().rulesLoaded);
  const commandRules = gate.rules.filter(r => r.type === 'command');
  console.log('Command rules found:', commandRules.length);
  commandRules.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.value} (from ${r.source})`);
  });
  
  // Test 1: Unknown command should fail
  let res = await gate.mutate({action: 'EXECUTE_COMMAND', scope: 'test', writer: 'test', payload: {command: '!UNKNOWN'}, metadata: {}});
  console.log('\n1. Unknown command test:');
  console.log('   Allowed:', res.allowed);
  console.log('   Violations:', res.violations.map(v => v.rule));
  
  // Test 2: Known command should pass pre-filter
  res = await gate.mutate({action: 'EXECUTE_COMMAND', scope: 'test', writer: 'test', payload: {command: '#ACORDAR'}, metadata: {}});
  console.log('\n2. #ACORDAR pre-filter test:');
  console.log('   Allowed:', res.allowed);
  console.log('   Stage:', res.stage);
  
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
  console.log('\n3. Git commit with evidence test:');
  console.log('   Allowed:', res.allowed);
  console.log('   Self-applied:', res.meta?.selfApplied);
  
  // Test 4: Test another known command
  res = await gate.mutate({action: 'EXECUTE_COMMAND', scope: 'test', writer: 'test', payload: {command: '!CALIBRAR'}, metadata: {}});
  console.log('\n4. !CALIBRAR pre-filter test:');
  console.log('   Allowed:', res.allowed);
  console.log('   Stage:', res.stage);
}

test().catch(console.error);