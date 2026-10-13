// Regression test for the existing MTProto owner; no Telegram or bot credentials.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');

function fakeServer(sourceFile){
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'centraldark-qr-fixture-'));
  const routes=new Map(), clients=[];
  const express=()=>({
    use(){},get(route,fn){routes.set('GET '+route,fn);},
    post(route,fn){routes.set('POST '+route,fn);},
    listen(){}
  });
  express.json=()=>()=>{};
  class FakeClient {
    constructor(session) {
      this.session={save:()=> 'FICTIONAL_TEST_SESSION'};
      this.authorized=false;
      clients.push(this);
    }
    async connect(){}
    async disconnect(){this.disconnected=true;}
    async isUserAuthorized(){return this.authorized;}
    async getMe(){return {id:987n,firstName:'Fixture',username:'fixture'};}
    async signInUserWithQrCode(_app,callbacks){
      this.callbacks=callbacks;
      setImmediate(()=>{
        void callbacks.qrCode({token:Buffer.from('TEST_NON_AUTH_TOKEN'),expires:Math.floor(Date.now()/1000)+30})
          .catch(e=>this.reject?.(e));
      });
      return await new Promise((resolve,reject)=>{this.complete=resolve;this.reject=reject});
    }
  }
  class StringSession {constructor(){}}
  const fauxRequire=(name)=>{
    if(name==='express')return express;
    if(name==='cors')return ()=>()=>{};
    if(name==='telegram')return {TelegramClient:FakeClient,Api:{auth:{SignIn:class{}}}};
    if(name==='telegram/sessions')return {StringSession};
    if(name==='qrcode')return {toDataURL:async(uri)=>{
      assert.match(uri,/^tg:\/\/login\?token=[a-zA-Z0-9_-]+$/);
      return 'data:image/png;base64,'+Buffer.from('FAKE_PNG_FOR_TEST').toString('base64');
    }};
    return require(name);
  };
  const code=fs.readFileSync(sourceFile,'utf8');
  vm.runInNewContext(code,{require:fauxRequire,process:{env:{
    TELEGRAM_APP_API_ID:'1234567', TELEGRAM_APP_API_HASH:'0'.repeat(32),
    MTPROTO_DATA_DIR:home, PORT:'0',
  }}, console:{log(){},warn(){},error(){}},Buffer,setTimeout,clearTimeout,setImmediate},{filename:'server.js'});
  async function call(method,route,body={}){
    const fn=routes.get(method+' '+route);
    assert.ok(fn,method+' '+route);
    const response={code:200,status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
    await fn({body,query:{}},response);
    return response;
  }
  async function settle(){await new Promise(r=>setTimeout(r,25));}
  return {home,clients,call,settle,close(){fs.rmSync(home,{recursive:true,force:true});}};
}

test('QR uses one owner: pending, 2FA, authorization and saved session',async()=>{
  const s=fakeServer(process.env.CENTRALDARK_QR_TEST_SOURCE || path.join(__dirname,'server.js'));
  try {
    assert.equal((await s.call('GET','/health')).body.configured,true);
    const first=await s.call('POST','/qr/start');
    assert.equal(first.code,200);
    assert.equal(first.body.status,'QR_PENDING');
    assert.match(first.body.qrDataUrl,/^data:image\/png;base64,/);
    assert.match(first.body.id,/^[a-f0-9-]{36}$/i);
    const duplicate=await s.call('POST','/qr/start');
    assert.equal(duplicate.code,409);
    assert.equal(duplicate.body.status,'QR_ALREADY_PENDING');
    const client=s.clients[0];
    const passPromise=client.callbacks.password();
    assert.equal((await s.call('POST','/qr/status',{id:first.body.id})).body.status,'NEEDS_2FA');
    const step=await s.call('POST','/qr/password',{id:first.body.id,password:'TEST_2FA'});
    assert.equal(step.body.status,'VERIFYING_2FA');
    assert.equal(await passPromise,'TEST_2FA');
    client.authorized=true;
    client.complete({});
    await s.settle();
    const final=await s.call('POST','/qr/status',{id:first.body.id});
    assert.equal(final.body.status,'CONNECTED');
    assert.equal(final.body.qrDataUrl,undefined);
    assert.equal(fs.readFileSync(path.join(s.home,'session.txt'),'utf8'),'FICTIONAL_TEST_SESSION');
    assert.equal((fs.statSync(path.join(s.home,'session.txt')).mode&0o777),0o600);
    assert.equal((await s.call('POST','/qr/start')).body.status,'SESSION_PRESENT');
  } finally {s.close();}
});

test('cancel stops a pending QR and cannot overwrite an existing session',async()=>{
  const s=fakeServer(process.env.CENTRALDARK_QR_TEST_SOURCE || path.join(__dirname,'server.js'));
  try{
    const one=await s.call('POST','/qr/start');
    assert.equal(one.body.status,'QR_PENDING');
    const cancel=await s.call('POST','/qr/cancel',{id:one.body.id});
    assert.equal(cancel.body.status,'CANCELLED');
    assert.equal((await s.call('POST','/qr/status',{id:one.body.id})).code,404);
    s.clients[0].authorized=true;
    s.clients[0].complete({});
    await s.settle();
    assert.equal(fs.existsSync(path.join(s.home,'session.txt')),false);
    fs.writeFileSync(path.join(s.home,'session.txt'),'EXISTING_SESSION',{mode:0o600});
    const retry=await s.call('POST','/qr/start');
    assert.equal(retry.code,409);
    assert.equal(fs.readFileSync(path.join(s.home,'session.txt'),'utf8'),'EXISTING_SESSION');
  } finally {s.close();}
});
