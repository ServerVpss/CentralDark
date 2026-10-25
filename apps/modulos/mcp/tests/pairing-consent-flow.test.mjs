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
const { handleAuthorize, configureDevicePairingForOAuth } = await import('../src/oauth.js');
const { registerClient } = await import('../src/sessions.js');
const { createDevicePairingRouter, createDevicePairingStore } = await import('../src/device-pairing.js');

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.post('/admin/login',adminLogin);
app.get('/authorize',handleAuthorize);
app.post('/authorize',handleAuthorize);
const store=createDevicePairingStore({registryPath:join(tmp,'devices.json')});
configureDevicePairingForOAuth(store);
app.use('/device',createDevicePairingRouter({
  store
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
    {...urlEncoded({password:process.env.MCP_ADMIN_PASSWORD}),headers:{...urlEncoded({password:process.env.MCP_ADMIN_PASSWORD}).headers,Accept:"text/html"}});
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

test('Hermes: o MESMO /authorize conserva formulário original OAuth 2.1 e PKCE',async()=>{
  const client=registerClient({
    client_name:'Hermes Agent',redirect_uris:[base+'/callback'],
    token_endpoint_auth_method:'none'
  });
  const params=new URLSearchParams({
    client_id:client.client_id,redirect_uri:base+'/callback',response_type:'code',
    code_challenge:'TEST_ONLY_PKCE_CHALLENGE',
    code_challenge_method:'S256',scope:'mcp',state:'TEST_ONLY_HERMES_STATE'
  });
  const page=await request('/authorize?'+params);
  assert.equal(page.status,302);
  const ownerConsent=new URL(page.headers.get('location'));
  assert.equal(ownerConsent.origin,'https://admin.centralldark.com');
  assert.equal(ownerConsent.pathname,'/mcp-autorizar');
  assert.equal(ownerConsent.searchParams.get('client_name'),'Hermes Agent');
  assert.equal(ownerConsent.searchParams.get('code_challenge'),'TEST_ONLY_PKCE_CHALLENGE');
  assert.ok(!ownerConsent.searchParams.has('pair_code'));

  const inputs={
    client_id:client.client_id,redirect_uri:base+'/callback',
    response_type:'code',code_challenge:'TEST_ONLY_PKCE_CHALLENGE',
    code_challenge_method:'S256',scope:'mcp',
    state:'TEST_ONLY_HERMES_STATE',password:process.env.MCP_ADMIN_PASSWORD
  };
  const denied=await request('/authorize',urlEncoded({...inputs,password:'incorrect'}));
  assert.equal(denied.status,302);
  const deniedConsent=new URL(denied.headers.get('location'));
  assert.match(deniedConsent.searchParams.get('error') || '',/Senha inv/);
  const approved=await request('/authorize',urlEncoded(inputs));
  assert.equal(approved.status,302);
  const target=new URL(approved.headers.get('location'));
  assert.equal(target.origin,new URL(base).origin);
  assert.ok(target.searchParams.get('code'));
  assert.equal(target.searchParams.get('state'),'TEST_ONLY_HERMES_STATE');
});

test('VS Code: mesmo OAuth /authorize, identificação pelo client_id e código sem senha',async()=>{
  const created=await request('/device/pair/start',json({
    device_name:'SEGREDO-VSCODE-TEST',executor:'vscode',surface:'test'
  }));
  assert.equal(created.status,201);
  const pair=await created.json();
  assert.match(pair.code,/^[A-F0-9]{4}-[A-F0-9]{4}$/);
  // Página paralela removida: tudo usa o MESMO /authorize do Hermes.
  const oldRoute=await request('/device/pair/consent?id='+encodeURIComponent(pair.pair_id));
  assert.equal(oldRoute.status,404);
  const url='/authorize?'+new URLSearchParams({
    client_id:'centraldark.centraldark-vscode-restore',pair_id:pair.pair_id
  });
  const consent=await request(url);
  assert.equal(consent.status,302);
  const noOwner=new URL(consent.headers.get('location'));
  assert.equal(noOwner.origin,'https://admin.centralldark.com');
  assert.equal(noOwner.pathname,'/mcp-autorizar');
  assert.equal(noOwner.searchParams.get('pair_id'),pair.pair_id);
  assert.equal(noOwner.searchParams.get('pair_code'),pair.code);
  assert.ok(noOwner.searchParams.get('pair_nonce'));
  assert.ok(!noOwner.searchParams.has('pair_secret'));
  const cookie=await adminCookie();
  const page=await request(url,{headers:{Cookie:cookie}});
  assert.equal(page.status,302);
  const ownerPage=new URL(page.headers.get('location'));
  assert.equal(ownerPage.searchParams.get('pair_code'),pair.code);
  const body={
    client_id:'centraldark.centraldark-vscode-restore',
    pair_id:ownerPage.searchParams.get('pair_id'),
    pair_code:ownerPage.searchParams.get('pair_code'),
    pair_nonce:ownerPage.searchParams.get('pair_nonce')
  };
  const before=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  assert.equal((await before.json()).status,'pending');
  const anonymous=await request('/authorize',urlEncoded(body));
  assert.equal(anonymous.status,403);
  const invalidNonce=await request('/authorize',urlEncoded({...body,pair_nonce:'wrong'},cookie));
  assert.equal(invalidNonce.status,403);
  const invalidCode=await request('/authorize',urlEncoded({...body,pair_code:'FFFF-FFFF'},cookie));
  assert.equal(invalidCode.status,403);
  const confirmed=await request('/authorize',urlEncoded(body,cookie));
  assert.equal(confirmed.status,302);
  const confirmPage=new URL(confirmed.headers.get('location'));
  assert.equal(confirmPage.searchParams.get('success'),'1');
  const replay=await request('/authorize',urlEncoded(body,cookie));
  assert.equal(replay.status,404);
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

test('Integracao /device e /authorize tem um unico store no src e dist',async()=>{
  const {readFileSync}=await import('node:fs');
  for(const f of ['../src/index.js','../dist/index.js']){
    const source=readFileSync(new URL(f,import.meta.url),'utf8');
    assert.equal((source.match(/app\.use\("\/device", createDevicePairingRouter/g)||[]).length,1);
    assert.match(source,/createDevicePairingRouter\(\{ store: oauthDeviceStore, cookieAdmin: isCockpitAdmin \}\)/);
    assert.match(source,/configureDevicePairingForOAuth\(oauthDeviceStore\)/);
  }
});

test('Cockpit mostra o codigo da tentativa e exige clique humano',async()=>{
  const {readFileSync}=await import('node:fs');
  const page=readFileSync(new URL('../../../instinto-superior/src/routes/mcp-autorizar.tsx',import.meta.url),'utf8');
  assert.match(page,/params\.get\("pair_code"\)/);
  assert.match(page,/"pair_nonce"/);
  assert.match(page,/type="hidden" name="pair_code"/);
  assert.match(page,/Confirmar pareamento/);
  assert.match(page,/type="submit"/);
});
test.after(()=>server.close());
