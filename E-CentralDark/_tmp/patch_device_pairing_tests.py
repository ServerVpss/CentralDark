from pathlib import Path
p=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915\apps\modulos\mcp\tests\device-pairing.test.mjs')
s=p.read_text(encoding='utf-8')
s=s.replace('    assert.ok(first.token);\n    const second = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });', '    assert.ok(first.token);\n    assert.ok(first.refresh_token);\n    assert.ok(first.token_expires_at);\n    const second = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });')
s=s.replace('    assert.equal("token_hash" in device, false);\n', '    assert.equal("token_hash" in device, false);\n    assert.equal("refresh_token_hash" in device, false);\n    assert.ok(device.token_expires_at);\n')
p.write_text(s, encoding='utf-8')
print('PATCHED device-pairing.test.mjs')
