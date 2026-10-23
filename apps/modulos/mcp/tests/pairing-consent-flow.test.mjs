// Regressao end-to-end LOCAL e isolada (sem GitHub, credenciais ou rede externa).
// Testa: login admin existente, consentimento por codigo, CSRF, PKCE binding,
// negacao anonima, device status de uso unico e heartbeat autenticado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';

const tmp = mkdtempSync(join(tmpdir(), 'centraldark-pairing-flow-'));
process.env.MCP_STATE_FILE = join(tmp, 'sessions.json');
process.env.MCP_ADMIN_PASSWORD = 'TEST_ONLY_ADMIN_PASSWORD_DO_NOT_USE';
process.env.MCP_ADMIN_COOKIE_SECRET = 'TEST_ONLY_LOCAL_HMAC_NOT_PRODUCTION';
process.env.MCP_SESSION_SECRET = 'TEST_ONLY_LOCAL_SESSION_NOT_PRODUCTION';
process.env.GITHUB_TOKEN = 'TEST_ONLY_OWNER_TOKEN_NOT_PRODUCTION';
process.env.MCP_PUBLIC_URL = 'http://127.0.0.1';
process.on('exit', () => { try { rmSync(tmp,{recursive:true,force:true}); } catch {} });

const { adminLogin, isAdmin } = await import('../src/admin.js');
const { handleAuthorize } = await import('../src/oauth.js');
const { registerClient } = await import('../src/sessions.js');
const { createDevicePairingRouter, createDevicePairingStore } = await import('../src/device-pairing.js');

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.post('/admin/login',adminLogin);
app.get('/authorize',handleAuthorize);
app.post('/authorize',handleAuthorize);
const store=createDevicePairingStore({registryPath:join(tmp,'devices.json')});
app.use('/device',createDevicePairingRouter({
  store,isBrowserAdmin:isAdmin,publicOrigin:'http://127.0.0.1'
}));
const server=await new Promise(resolve=>{
  const live=app.listen(0,'127.0.0.1',()=>resolve(live));
});
const base='http://127.0.0.1:'+server.address().port;
async function request(path,opts={}){
  const res=await fetch(base+path,{redirect:'manual',...opts});
  return res;
}
const form=(data)=>new URLSearchParams(data).toString();
const urlEncoded=(data,cookie='',origin='http://127.0.0.1')=>({
  method:'POST',
  headers:{'Content-Type':'application/x-www-form-urlencoded',
    ...(cookie?{Cookie:cookie}:{}),Origin:origin},
  body:form(data)
});
const json=(data)=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
async function adminCookie(){
  const res=await request('/admin/login',
    urlEncoded({password:process.env.MCP_ADMIN_PASSWORD}));
  assert.equal(res.status,302);
  const full=res.headers.get('set-cookie');
  assert.match(full,/^cd_admin=/);
  return full.split(';')[0];
}
const getHidden=(html,key)=>{
  const pattern=new RegExp('name="'+key+'" value="([^"]+)"');
  const match=html.match(pattern);
  assert.ok(match,'missing hidden field '+key);
  return match[1];
};

test('OAuth consent: no password; existing admin session + code + nonce required; replay blocked',async()=>{
  const client=registerClient({
    client_name:'Hermes Test Client',redirect_uris:[base+'/callback'],
    token_endpoint_auth_method:'none'
  });
  const params=new URLSearchParams({
    client_id:client.client_id,redirect_uri:base+'/callback',
    response_type:'code',code_challenge:'TEST_ONLY_PKCE_CHALLENGE',
    code_challenge_method:'S256',scope:'mcp',
    state:'TEST_ONLY_OAUTH_STATE'
  });
  const page=await request('/authorize?'+params.toString());
  assert.equal(page.status,200);
  const html=await page.text();
  assert.match(html,/Confirmar pareamento/);
  assert.doesNotMatch(html,/name="password"/);
  const data={
    pair_id:getHidden(html,'pair_id'),
    pair_code:getHidden(html,'pair_code'),
    pair_nonce:getHidden(html,'pair_nonce')
  };
  assert.match(data.pair_code,/^[A-F0-9]{5}-[A-F0-9]{5}$/);
  const denied=await request('/authorize',urlEncoded(data));
  assert.equal(denied.status,403);
  const cookie=await adminCookie();
  const crossSite=await request('/authorize',urlEncoded(data,cookie,'https://external.example'));
  assert.equal(crossSite.status,403);
  const authorized=await request('/authorize',urlEncoded(data,cookie));
  assert.equal(authorized.status,302);
  const target=new URL(authorized.headers.get('location'));
  assert.equal(target.origin,new URL(base).origin);
  assert.ok(target.searchParams.get('code'));
  assert.equal(target.searchParams.get('state'),'TEST_ONLY_OAUTH_STATE');
  const replay=await request('/authorize',urlEncoded(data,cookie));
  assert.equal(replay.status,403);
});

test('VS Code device: code displayed, real owner confirms, token delivered once',async()=>{
  const created=await request('/device/pair/start',json({
    device_name:'SEGREDO-VSCODE-TEST',executor:'vscode',surface:'test'
  }));
  assert.equal(created.status,201);
  const pair=await created.json();
  assert.match(pair.code,/^[A-F0-9]{4}-[A-F0-9]{4}$/);
  const pendingPage=await request('/device/pair/consent?id='+encodeURIComponent(pair.pair_id));
  assert.equal(pendingPage.status,200);
  const plain=await pendingPage.text();
  assert.ok(plain.includes(pair.code));
  assert.doesNotMatch(plain,/type="submit"/);
  const pending=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  assert.equal((await pending.json()).status,'pending');
  const cookie=await adminCookie();
  const withAdmin=await request('/device/pair/consent?id='+encodeURIComponent(pair.pair_id),{headers:{Cookie:cookie}});
  const html=await withAdmin.text();
  const body={
    id:getHidden(html,'id'),
    code:getHidden(html,'code'),
    nonce:getHidden(html,'nonce')
  };
  const denied=await request('/device/pair/confirm',urlEncoded(body));
  assert.equal(denied.status,401);
  const deniedNonce=await request('/device/pair/confirm',urlEncoded({...body,nonce:'wrong'},cookie));
  assert.equal(deniedNonce.status,403);
  const wrongOrigin=await request('/device/pair/confirm',urlEncoded(body,cookie,'https://evil.example'));
  assert.equal(wrongOrigin.status,403);
  const confirmed=await request('/device/pair/confirm',urlEncoded(body,cookie));
  assert.equal(confirmed.status,200);
  const completed=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  const auth=await completed.json();
  assert.equal(auth.status,'approved');
  assert.ok(auth.token?.length>=32);
  assert.ok(auth.refresh_token?.length>=32);
  const already=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  assert.equal((await already.json()).token,undefined);
  const heartbeat=await request('/device/heartbeat',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
    body:JSON.stringify({capabilities:{vscode:true}})
  });
  const beat=await heartbeat.json();
  assert.equal(beat.ok,true);
  assert.equal(beat.device_id,auth.device_id);
});

test('Expired pair cannot be confirmed; code alone never issues token',()=>{
  let now=0;
  const isolated=createDevicePairingStore({registryPath:join(tmp,'expired.json'),now:()=>now,ttlMs:500});
  const p=isolated.start({deviceName:'expired-test'});
  const consent=isolated.pendingConsent(p.pairId);
  assert.ok(consent);
  assert.equal(isolated.approveWeb({pairId:p.pairId,code:'WRONG',nonce:consent.nonce}).ok,false);
  now=501;
  assert.equal(isolated.pendingConsent(p.pairId),null);
  assert.equal(isolated.approveWeb({pairId:p.pairId,code:p.code,nonce:consent.nonce}).ok,false);
});

test.after(()=>server.close());
