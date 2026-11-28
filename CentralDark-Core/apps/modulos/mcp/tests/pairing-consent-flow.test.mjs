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
  assert.equal(ownerConsent.origin,'https://mcp.centralldark.com');
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
  assert.equal(anonymous.status,302);
  const passwordFallback=new URL(anonymous.headers.get('location'));
  assert.equal(passwordFallback.searchParams.get('auth_method'),'password');
  assert.match(passwordFallback.searchParams.get('error') || '',/Sessão administrativa ausente/);
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

test('Remote Bridge: mesmo /authorize e consentimento, sem token na URL',async()=>{
  const created=await request('/device/pair/start',json({
    device_name:'CLIENTE-REMOTE-TEST',executor:'remote-bridge',surface:'windows-tray'
  }));
  assert.equal(created.status,201);
  const pair=await created.json();
  const consent=await request('/authorize?'+new URLSearchParams({
    client_id:'centraldark.remote-bridge',pair_id:pair.pair_id
  }));
  assert.equal(consent.status,302);
  const page=new URL(consent.headers.get('location'));
  assert.equal(page.pathname,'/mcp-autorizar');
  assert.equal(page.searchParams.get('client_name'),'CentralDark Remote Bridge');
  assert.equal(page.searchParams.get('pair_code'),pair.code);
  assert.ok(page.searchParams.get('pair_nonce'));
  assert.ok(!page.searchParams.has('pair_secret'));
  const cookie=await adminCookie();
  const approved=await request('/authorize',urlEncoded({
    client_id:'centraldark.remote-bridge',pair_id:pair.pair_id,
    pair_code:pair.code,pair_nonce:page.searchParams.get('pair_nonce')
  },cookie));
  assert.equal(approved.status,302);
  const result=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  const auth=await result.json();
  assert.equal(auth.status,'approved');
  assert.ok(auth.token?.length>=32);
  const heartbeat=await request('/device/heartbeat',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
    body:JSON.stringify({capabilities:{remote_bridge:true}})
  });
  assert.equal((await heartbeat.json()).ok,true);
});

test('Remote Bridge: senha fallback exige código, nonce e senha válidos; limita tentativas',async()=>{
  const created=await request('/device/pair/start',json({
    device_name:'BRIDGE-FALLBACK-TEST',executor:'remote-bridge',surface:'windows-tray'
  }));
  assert.equal(created.status,201);
  const pair=await created.json();
  const consent=await request('/authorize?'+new URLSearchParams({
    client_id:'centraldark.remote-bridge',pair_id:pair.pair_id,auth_method:'password'
  }));
  assert.equal(consent.status,302);
  const page=new URL(consent.headers.get('location'));
  assert.equal(page.searchParams.get('auth_method'),'password');
  const body={
    client_id:'centraldark.remote-bridge',
    pair_id:pair.pair_id,
    pair_code:pair.code,
    pair_nonce:page.searchParams.get('pair_nonce'),
    auth_method:'password'
  };
  const invalid=await request('/authorize',urlEncoded({...body,password:'INCORRECT'}));
  assert.equal(invalid.status,302);
  assert.match(new URL(invalid.headers.get('location')).searchParams.get('error'),/Senha/);
  const pending=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  assert.equal((await pending.json()).status,'pending');
  const invalidCode=await request('/authorize',urlEncoded({...body,pair_code:'0000-0000',password:process.env.MCP_ADMIN_PASSWORD}));
  assert.equal(invalidCode.status,403);
  const invalidNonce=await request('/authorize',urlEncoded({...body,pair_nonce:'invalid',password:process.env.MCP_ADMIN_PASSWORD}));
  assert.equal(invalidNonce.status,403);
  const approved=await request('/authorize',urlEncoded({...body,password:process.env.MCP_ADMIN_PASSWORD}));
  assert.equal(approved.status,302);
  assert.equal(new URL(approved.headers.get('location')).searchParams.get('success'),'1');
  const result=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
  const auth=await result.json();
  assert.equal(auth.status,'approved');
  assert.ok(auth.token?.length>=32);
  const replay=await request('/authorize',urlEncoded({...body,password:process.env.MCP_ADMIN_PASSWORD}));
  assert.equal(replay.status,404);
});

test('Remote Bridge: Supabase JWT admin autoriza somente após clique, role e nonce (sem rede externa)',async()=>{
  const existingFetch=globalThis.fetch;
  const oldUrl=process.env.HUB_SUPABASE_URL;
  const oldKey=process.env.HUB_SUPABASE_PUBLISHABLE_KEY;
  process.env.HUB_SUPABASE_URL='https://centraldark-auth-test.invalid';
  process.env.HUB_SUPABASE_PUBLISHABLE_KEY='sb_publishable_test_only';
  let role='user';
  const bearer='Bearer '+'T'.repeat(64);
  globalThis.fetch=async(input,options={})=>{
    const address=String(input);
    if(address.startsWith('https://centraldark-auth-test.invalid/')){
      if(options.headers?.Authorization!==bearer) return new Response('{}',{status:401});
      if(address.includes('/auth/v1/user')) return new Response(JSON.stringify({
        id:'00000000-0000-4000-8000-000000000001',is_anonymous:false
      }),{status:200,headers:{'Content-Type':'application/json'}});
      if(address.includes('/rest/v1/user_roles')) return new Response(
        JSON.stringify(role==='admin'?[{role:'admin'}]:[]),
        {status:200,headers:{'Content-Type':'application/json'}}
      );
      return new Response('{}',{status:404});
    }
    return existingFetch(input,options);
  };
  try{
    const start=await request('/device/pair/start',json({
      device_name:'TEST-REMOTE-SUPABASE',executor:'remote-bridge',surface:'windows-tray'
    }));
    assert.equal(start.status,201);
    const pair=await start.json();
    const page=await request('/authorize?'+new URLSearchParams({
      client_id:'centraldark.remote-bridge',pair_id:pair.pair_id
    }));
    assert.equal(page.status,302);
    const challenge=new URL(page.headers.get('location'));
    const body={
      client_id:'centraldark.remote-bridge',pair_id:pair.pair_id,
      pair_code:pair.code,pair_nonce:challenge.searchParams.get('pair_nonce')
    };
    const withoutJwt=await request('/authorize',urlEncoded(body));
    assert.equal(withoutJwt.status,302);
    assert.match(new URL(withoutJwt.headers.get('location')).searchParams.get('error') || '', /Sessão administrativa ausente/);
    const opts=(data)=>({...urlEncoded(data),headers:{...urlEncoded(data).headers,Authorization:bearer}});
    const regularUser=await request('/authorize',opts(body));
    assert.equal(regularUser.status,302);
    assert.match(new URL(regularUser.headers.get('location')).searchParams.get('error') || '', /Sessão administrativa ausente/);
    role='admin';
    const badNonce=await request('/authorize',opts({...body,pair_nonce:'WRONG_NONCE'}));
    assert.equal(badNonce.status,403);
    const approved=await request('/authorize',opts(body));
    assert.equal(approved.status,302);
    assert.equal(new URL(approved.headers.get('location')).searchParams.get('success'),'1');
    const completed=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
    assert.equal((await completed.json()).status,'approved');
  }finally{
    globalThis.fetch=existingFetch;
    if(oldUrl===undefined) delete process.env.HUB_SUPABASE_URL;
    else process.env.HUB_SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.HUB_SUPABASE_PUBLISHABLE_KEY;
    else process.env.HUB_SUPABASE_PUBLISHABLE_KEY=oldKey;
  }
});

test('Cockpit Supabase: consentimento JSON exige admin, origem e PKCE; sem senha duplicada', async()=>{
  const realFetch=globalThis.fetch;
  const oldUrl=process.env.HUB_SUPABASE_URL, oldKey=process.env.HUB_SUPABASE_PUBLISHABLE_KEY;
  process.env.HUB_SUPABASE_URL='https://centraldark-auth-test.invalid';
  process.env.HUB_SUPABASE_PUBLISHABLE_KEY='sb_publishable_test_only';
  let role='user';
  const bearer='Bearer '+'T'.repeat(64);
  globalThis.fetch=async(input,opts={})=>{
    const url=String(input);
    if(url.startsWith('https://centraldark-auth-test.invalid/')){
      if(opts.headers?.Authorization!==bearer) return new Response('{}',{status:401});
      if(url.includes('/auth/v1/user')) return new Response(JSON.stringify({id:'00000000-0000-4000-8000-000000000002',is_anonymous:false}),{status:200});
      if(url.includes('/rest/v1/user_roles')) return new Response(JSON.stringify(role==='admin'?[{role:'admin'}]:[]),{status:200});
      return new Response('{}',{status:404});
    }
    return realFetch(input,opts);
  };
  try{
    const client=registerClient({client_name:'Hermes Cockpit JSON Test',redirect_uris:[base+'/cb-json'],token_endpoint_auth_method:'none'});
    const data={client_id:client.client_id,redirect_uri:base+'/cb-json',response_type:'code',
      code_challenge:'TEST_ONLY_PKCE_JSON',code_challenge_method:'S256',scope:'mcp',state:'STATE_JSON'};
    const post=(origin='https://admin.centralldark.com',auth=bearer)=>({
      ...urlEncoded(data),
      headers:{...urlEncoded(data).headers,Origin:origin,Accept:'application/json',Authorization:auth}
    });
    const missing=await request('/authorize',post('https://admin.centralldark.com',''));
    assert.equal(missing.status,401);
    assert.equal((await missing.json()).ok,false);
    const nonAdmin=await request('/authorize',post());
    assert.equal(nonAdmin.status,401);
    assert.match((await nonAdmin.json()).error,/administrador/);
    const missingMcp=await request('/authorize',post('https://mcp.centralldark.com',''));
    assert.equal(missingMcp.status,401);
    assert.equal((await missingMcp.json()).ok,false);
    const nonAdminMcp=await request('/authorize',post('https://mcp.centralldark.com'));
    assert.equal(nonAdminMcp.status,401);
    assert.equal((await nonAdminMcp.json()).ok,false);
    role='admin';
    const otherOrigin=await request('/authorize',post('https://outro.invalid'));
    assert.equal(otherOrigin.status,403);
    // Antes: PKCE inv?lido devolvia 302, mas o Cockpit usa redirect:error;
    // o browser apresentava TypeError Failed to fetch em vez do erro OAuth.
    const invalidPkceBody={...data,code_challenge_method:'plain'};
    const invalidPkceOpts={...urlEncoded(invalidPkceBody),headers:{
      ...urlEncoded(invalidPkceBody).headers,Origin:'https://admin.centralldark.com',
      Accept:'application/json',Authorization:bearer
    }};
    const rejected=await request('/authorize',invalidPkceOpts);
    assert.equal(rejected.status,400);
    assert.equal(rejected.headers.get('location'),null);
    const rejectedData=await rejected.json();
    assert.equal(rejectedData.ok,false);
    assert.equal(rejectedData.error,'invalid_request');
    assert.match(rejectedData.error_description,/PKCE/);
    const valid=await request('/authorize',post());
    assert.equal(valid.status,200);
    const response=await valid.json();
    assert.equal(response.ok,true);
    const callback=new URL(response.redirect_to);
    assert.equal(callback.pathname,'/cb-json');
    assert.equal(callback.searchParams.get('state'),'STATE_JSON');
    assert.ok(callback.searchParams.get('code'));
    assert.equal(valid.headers.get('cache-control'),'no-store');
    const validMcp=await request('/authorize',post('https://mcp.centralldark.com'));
    assert.equal(validMcp.status,200);
    const mcpResponse=await validMcp.json();
    assert.equal(mcpResponse.ok,true);
    const mcpCallback=new URL(mcpResponse.redirect_to);
    assert.equal(mcpCallback.origin,new URL(base).origin);
    assert.equal(mcpCallback.pathname,'/cb-json');
    assert.equal(mcpCallback.searchParams.get('state'),'STATE_JSON');
    assert.ok(mcpCallback.searchParams.get('code'));
    assert.equal(validMcp.headers.get('cache-control'),'no-store');
    const invalidMcpPkce=await request('/authorize',{...invalidPkceOpts,headers:{...invalidPkceOpts.headers,Origin:'https://mcp.centralldark.com'}});
    assert.equal(invalidMcpPkce.status,400);
    assert.equal(invalidMcpPkce.headers.get('location'),null);
    const invalidMcpRedirect=await request('/authorize',{...post('https://mcp.centralldark.com'),body:form({...data,redirect_uri:'https://unregistered.invalid/callback'})});
    assert.equal(invalidMcpRedirect.status,400);
    // A mesma sess?o admin pode aprovar uma tentativa VS Code iniciada pelo cliente.
    const created=await request('/device/pair/start',json({
      device_name:'TEST-VSCODE-JSON-ADMIN',executor:'vscode',surface:'test'
    }));
    assert.equal(created.status,201);
    const pair=await created.json();
    const consent=await request('/authorize?'+new URLSearchParams({
      client_id:'centraldark.centraldark-vscode-restore',pair_id:pair.pair_id
    }));
    assert.equal(consent.status,302);
    const challenge=new URL(consent.headers.get('location'));
    const deviceBody={
      client_id:'centraldark.centraldark-vscode-restore',pair_id:pair.pair_id,
      pair_code:pair.code,pair_nonce:challenge.searchParams.get('pair_nonce')
    };
    const deviceOpts={...urlEncoded(deviceBody),headers:{
      ...urlEncoded(deviceBody).headers,Origin:'https://admin.centralldark.com',
      Accept:'application/json',Authorization:bearer
    }};
    const approvedDevice=await request('/authorize',deviceOpts);
    assert.equal(approvedDevice.status,200);
    assert.deepEqual(await approvedDevice.json(),{ok:true,approved:true});
    const status=await request('/device/pair/status',json({id:pair.pair_id,secret:pair.pair_secret}));
    assert.equal((await status.json()).status,'approved');
  }finally{
    globalThis.fetch=realFetch;
    if(oldUrl===undefined) delete process.env.HUB_SUPABASE_URL; else process.env.HUB_SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.HUB_SUPABASE_PUBLISHABLE_KEY; else process.env.HUB_SUPABASE_PUBLISHABLE_KEY=oldKey;
  }
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
  // O currentTarget do evento React pode tornar-se nulo apos um await.
  assert.match(page,/const formulario = event\.currentTarget/);
  assert.match(page,/formulario instanceof HTMLFormElement/);
  assert.match(page,/new FormData\(formulario\)/);
  assert.ok(page.indexOf("new FormData(formulario)") < page.indexOf("await supabase.auth.getSession()"));
  assert.doesNotMatch(page,/new FormData\(event\.currentTarget\)/);
});
test('extensao distribuida contem o pareamento e dependencias compiladas',async()=>{
  const {readFileSync,existsSync}=await import('node:fs');
  const entry=new URL('../../../../skills/vs-code-restore/out/extension.js',import.meta.url);
  const compiled=readFileSync(entry,'utf8');
  assert.match(compiled,/async function pairVsCode/);
  assert.match(compiled,/vscode\.env\.openExternal\(approvedUri\)/);
  assert.match(compiled,/centraldark\.pairVsCode/);
  assert.doesNotMatch(compiled,/modal:\s*true/);
  assert.ok(existsSync(new URL('../../../../skills/vs-code-restore/out/autoUpdater.js',import.meta.url)));
  assert.ok(existsSync(new URL('../../../../skills/vs-code-restore/out/remote-terminal.js',import.meta.url)));
});
test.after(()=>server.close());
