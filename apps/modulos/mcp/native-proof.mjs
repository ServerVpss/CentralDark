import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { execFileSync } from 'node:child_process';
import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("../../../", import.meta.url));
const dir='/root/.hermes/audio_cache/centraldark';
execFileSync('python3',['-c',`from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path("/root/.hermes/audio_cache/centraldark");p.mkdir(parents=True,exist_ok=True)
im=Image.new("RGB",(640,240),"white")
ImageDraw.Draw(im).text((30,80),"CENTRALDARK PROOF",font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",40),fill="black")
im.save(p/"proof.png")
`]);
const c=new Client({name:'centraldark-native-replay',version:'1'},{capabilities:{}});
await c.connect(new StdioClientTransport({command:'node',args:[root+'/apps/modulos/mcp/dist/mcp-server.js','--stdio'],stderr:'pipe'}));
const results=[];
async function call(name,args,expectError=false) {
 const raw=await c.callTool({name,arguments:args},undefined, {timeout:180000});
 const text=raw.content.find(x=>x.type==='text')?.text||'';
 let d;try{d=JSON.parse(text);}catch{d={error:text};}
 const result=d.result||d;
 let pass=Boolean(raw.isError)===expectError;
 if (!expectError && name==='kylin_text_embedding') pass &&= result.dimensions===768 && result.vector.every(Number.isFinite);
 if (!expectError && name==='kylin_image_embedding') pass &&= result.dimensions===1024 && result.vector.every(Number.isFinite);
 if (!expectError && name==='kylin_audio_synthesize') {
   const audio=raw.content.find(x=>x.type==='audio');
   pass &&= result.samples>1000 && result.sample_rate===44100 && !!audio && Buffer.from(audio.data,'base64').subarray(0,4).toString()==='RIFF';
 }
 if (!expectError && name==='kylin_audio_transcribe') pass &&= result.transcript.join('').includes('你好');
 if (!expectError && name==='kylin_image_analyze') pass &&= result.ocr.includes('CENTRALDARK PROOF');
 if (!expectError && name==='kylin_video_analyze') pass &&= result.frames.length===1 && result.frames[0].ocr.includes('CENTRALDARK PROOF') && result.audio.transcript.join('').includes('你好');
 const summary={name,pass,isError:!!raw.isError,...(raw.isError?{error:text.slice(0,1000)}:{}),...(result.dimensions?{dimensions:result.dimensions,vector_finite:result.vector.every(Number.isFinite),vector_hash:createHash('sha256').update(JSON.stringify(result.vector)).digest('hex')}:{}),...(result.artifact?{artifact:result.artifact}:{}),...(result.samples?{samples:result.samples}:{}),...(result.transcript?{transcript:result.transcript}:{}),...(result.ocr!==undefined?{ocr:result.ocr}:{}),...(result.frames?{frames:result.frames.length,audio:result.audio}:{}),...(expectError?{counterproof:text.slice(0,500)}:{})};
 results.push(summary);console.log(JSON.stringify(summary));return result;
}
const list=await c.listTools();console.log('CATALOG_COUNT='+list.tools.length);
await call('kylin_text_embedding',{text:'CentralDark reuse before create'});
const tts=await call('kylin_audio_synthesize',{text:'你好'});
if(tts.artifact)await call('kylin_audio_transcribe',{path:tts.artifact});
await call('kylin_image_analyze',{path:dir+'/proof.png'});
await call('kylin_image_embedding',{path:dir+'/proof.png'});
if(tts.artifact){
 execFileSync('ffmpeg',['-v','error','-loop','1','-i',dir+'/proof.png','-i','/root/.hermes/audio_cache/'+tts.artifact,'-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest','-y',dir+'/proof.mp4'],{timeout:30000});
 await call('kylin_video_analyze',{path:dir+'/proof.mp4',frames:1});
}
await call('kylin_image_analyze',{path:'/etc/passwd'},true);
await call('kylin_video_analyze',{path:dir+'/proof.mp4',frames:7},true);
await call('kylin_audio_synthesize',{text:''},true);
if (process.env.CENTRALDARK_NATIVE_WEB_URL && tts.artifact) {
 const base=new URL(process.env.CENTRALDARK_NATIVE_WEB_URL);
 if (!['127.0.0.1','localhost'].includes(base.hostname))throw new Error('LOCAL_WEBUI_REQUIRED');
 const form=new FormData();form.append('file',new Blob([readFileSync('/root/.hermes/audio_cache/'+tts.artifact)],{type:'audio/wav'}),'proof.wav');
 form.append('fileName','proof.wav');form.append('mimeType','audio/wav');
 const response=await fetch(new URL('/api/stt',base),{method:'POST',body:form});const body=await response.json();
 const pass=response.ok && body.success===true && body.data.text.includes('你好');
 results.push({name:'aionui_stt',pass,status:response.status,transcript:body.data?.text});console.log(JSON.stringify(results.at(-1)));
}
await c.close();writeFileSync(process.env.CENTRALDARK_NATIVE_PROOF_OUTPUT || root+'/native-proof.json',JSON.stringify({time:new Date().toISOString(),catalog_count:list.tools.length,results},null,2));
if(results.some(x=>!x.pass))process.exitCode=1;
