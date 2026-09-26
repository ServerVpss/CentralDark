from pathlib import Path
P=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915\apps\modulos\mcp\tests\device-pairing.test.mjs')
t=P.read_text(encoding='utf-8-sig')
old='''    staleMs: 45_000,\n  });'''
new='''    staleMs: 45_000,\n    deviceTokenTtlMs: 60_000,\n  });'''
if old not in t: raise SystemExit('fixture pattern missing')
t=t.replace(old,new,1)
old='''    assert.ok(first.token);\n    const second = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });'''
new='''    assert.ok(first.token);\n    assert.ok(first.refresh_token);\n    assert.ok(first.token_expires_at);\n    const second = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });'''
if old not in t: raise SystemExit('first token pattern missing')
t=t.replace(old,new,1)
P.write_text(t,encoding='utf-8',newline='\n')
print('PATCHED tests')
P=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915\apps\modulos\mcp\tests\device-pairing.test.mjs')
t=P.read_text(encoding='utf-8')
insert='''\ntest("refresh token renova sessão sem re-pair e token expirado falha fechado", () => {\n  const f = fixture();\n  try {\n    const pair = f.store.start({ deviceName: "SEGREDO" });\n    f.store.approve({ pairId: pair.pairId, code: pair.code });\n    const auth = f.store.status({ pairId: pair.pairId, pairSecret: pair.pairSecret });\n    f.advance(60_001);\n    assert.equal(f.store.heartbeat({ token: auth.token }).error, "device_token_expired");\n    const renewed = f.store.refresh({ refreshToken: auth.refresh_token });\n    assert.equal(renewed.ok, true);\n    assert.ok(renewed.token);\n    assert.equal(f.store.heartbeat({ token: renewed.token }).ok, true);\n  } finally { f.cleanup(); }\n});\n'''
marker='\ntest("pairing expira sem falso verde", () => {'
if marker not in t: raise SystemExit('marker missing')
t=t.replace(marker,insert+marker,1)
P.write_text(t,encoding='utf-8',newline='\n')
print('ADDED refresh test')
