import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const s=readFileSync(new URL('../scripts/casa/screenpipe-continuity.ps1',import.meta.url),'utf8');
test('no credentials, browser authority or media transport',()=>{
 for(const forbidden of [/Get-Clipboard/i,/Get-Credential/i,/Set-ItemProperty.*token/i,/chrome-extension:\/\//i,/cookies\.sqlite/i,/screenpipe\s+record/i,/--data-dir/i,/Invoke-RestMethod.*-Method\s+Post/i]){
  assert.doesNotMatch(s,forbidden);
 }
 assert.match(s,/browser_ws = 'UNKNOWN_UNTIL_WS_101_AND_HEARTBEAT'/);
 assert.match(s,/NO_TOKENS_OR_REAUTH/);
});
test('repair only native existing screenpipe and guard against duplicate owner',()=>{
 assert.match(s,/function Get-ExistingOwners/);
 assert.match(s,/HERMES_CADEIA_FREE_WATCHDOG_FILE/);
 assert.match(s,/SCREENPIPE_OWNER_NOT_NATIVE_APP/);
 assert.match(s,/NOOP_HEALTHY; NO_SECOND_RECORDER/);
 assert.match(s,/PORT_3030_OCCUPIED_UNHEALTHY/);
 assert.match(s,/Start-Process -FilePath \$exe/);
 assert.match(s,/TaskName = 'CentralDark-Screenpipe-Continuity'/);
});
test('persistence is opt-in, user scoped, revocable',()=>{
 assert.match(s,/Mode = 'Status'/);
 assert.match(s,/'Install', 'Tick', 'Uninstall'/);
 assert.match(s,/LogonType Interactive/);
 assert.match(s,/RunLevel Limited/);
 assert.match(s,/Unregister-ScheduledTask/);
 assert.match(s,/RepetitionInterval \(New-TimeSpan -Minutes 5\)/);
 assert.match(s,/TASK_REGISTERED_NOT_REBOOT_PROVEN/);
});
