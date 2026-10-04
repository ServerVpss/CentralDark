#!/usr/bin/env python3
"""Native media binding for the existing CentralDark local MCP owner."""
import array, hashlib, json, math, os, subprocess, sys, time, urllib.request, uuid, wave
from pathlib import Path
BASE="http://127.0.0.1:8000"
CACHE=Path.home()/".hermes/audio_cache/centraldark"
def request(path,data=None):
    req=urllib.request.Request(BASE+path,data=None if data is None else json.dumps(data).encode(),headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req,timeout=90) as f:
        raw=f.read();return json.loads(raw) if raw else {}
def infer(model,inputs,parameters=None):
    return request("/v2/models/"+model+"/infer",{"inputs":inputs,**({"parameters":parameters} if parameters else {})})
def tensor(name,shape,datatype,data): return dict(name=name,shape=shape,datatype=datatype,data=data)
def media_path(value):
    p=(Path(value) if Path(value).is_absolute() else CACHE.parent/value).resolve(strict=True)
    roots=[Path.home()/".hermes/audio_cache",Path.home()/".hermes/image_cache",Path.home()/".aionui-web",Path("/root/CentralDark"),Path("/root/CentralDark_FULL_20261004003605")]
    if os.environ.get("CENTRALDARK_MEDIA_ROOT"): roots.append(Path(os.environ["CENTRALDARK_MEDIA_ROOT"]).resolve())
    if not any(p.is_relative_to(root.resolve()) for root in roots): raise ValueError("MEDIA_PATH_OUT_OF_SCOPE")
    if not p.is_file() or p.suffix.lower() not in {".wav",".mp3",".m4a",".ogg",".flac",".mp4",".mkv",".webm",".mov",".png",".jpg",".jpeg",".webp",".bmp"}: raise ValueError("MEDIA_TYPE_NOT_ALLOWED")
    if p.stat().st_size>100*1024*1024: raise ValueError("MEDIA_TOO_LARGE")
    return p
def run(args,timeout=90):
    return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout).stdout
def normalize(v):
    n=math.sqrt(sum(x*x for x in v));return [x/n if n else x for x in v]
def embedding(text):
    out=infer("ensemble-embd_gte-base_uint8-text",[tensor("product_reviews",[1],"BYTES",[text])])["outputs"][0]
    n=out["shape"][-1];rows=len(out["data"])//n
    return {"model":"ensemble-embd_gte-base_uint8-text","pooling":"mean","dimensions":n,"vector":normalize([sum(out["data"][j*n+i] for j in range(rows))/rows for i in range(n)])}
def synthesize(text):
    model="ensemble-tts_melo"
    result=infer(model,[tensor("text",[1,1],"BYTES",[text]),tensor("speaker",[1,1],"INT32",[0])],{"sequence_id":int(time.time()*1000000),"sequence_start":True,"sequence_end":True})
    out=next(x for x in result["outputs"] if x["name"]=="Audio")
    samples=array.array("h",(int(max(-1,min(1,float(x)))*32767) for x in out["data"]))
    CACHE.mkdir(parents=True,exist_ok=True);path=CACHE/(str(uuid.uuid4())+".wav")
    with wave.open(str(path),"wb") as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(44100);w.writeframes(samples.tobytes())
    return {"model":model,"artifact":str(path.relative_to(CACHE.parent)),"sample_rate":44100,"samples":len(samples),"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}
def transcribe(path):
    raw=run(["ffmpeg","-v","error","-i",str(path),"-t","120","-f","f32le","-ac","1","-ar","16000","pipe:1"])
    samples=array.array("f");samples.frombytes(raw)
    if not samples:raise ValueError("AUDIO_EMPTY")
    out=infer("ensemble-asr_paraformer_nonstreaming",[tensor("WAV",[1,len(samples)],"FP32",list(samples)),tensor("WAV_LENS",[1,1],"INT32",[len(samples)])])["outputs"]
    return {"model":"ensemble-asr_paraformer_nonstreaming","sample_rate":16000,"duration_seconds":len(samples)/16000,"transcript":out[0]["data"]}
def image_embed(path):
    from PIL import Image
    model="embd_cn-clip_512-uint8-image";request("/v2/repository/models/"+model+"/load",{})
    im=Image.open(path).convert("RGB").resize((224,224));pixels=list(im.getdata())
    means=[.48145466,.4578275,.40821073];stds=[.26862954,.26130258,.27577711]
    data=[(p[c]/255-means[c])/stds[c] for c in range(3) for p in pixels]
    out=infer(model,[tensor("image",[3,224,224],"FP32",data)])["outputs"][0]
    return {"model":model,"dimensions":len(out["data"]),"vector":normalize(out["data"])}
def image_analyze(path):
    from PIL import Image
    with Image.open(path) as im:size=list(im.size);fmt=im.format
    text=run(["tesseract",str(path),"stdout","-l","eng+chi_sim"],30).decode().strip()
    return {"path":str(path),"size":size,"format":fmt,"ocr":text,"engine":"tesseract (installed)","scope":"metadata and OCR; no unproved visual reasoning"}
def video_analyze(path,frames=3):
    meta=json.loads(run(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(path)],15))
    duration=float(meta.get("format",{}).get("duration",0));limit=min(duration,120)
    result={"duration_seconds":duration,"analyzed_seconds":limit,"frames":[],"scope":"sampled frame OCR and audio transcription"}
    CACHE.mkdir(parents=True,exist_ok=True)
    for i in range(frames):
        stamp=limit*(i+1)/(frames+1);p=CACHE/(str(uuid.uuid4())+".png")
        run(["ffmpeg","-v","error","-ss",str(stamp),"-i",str(path),"-frames:v","1","-y",str(p)])
        result["frames"].append({"timestamp":stamp,**image_analyze(p)})
    result["audio"]=transcribe(path) if any(x.get("codec_type")=="audio" for x in meta.get("streams",[])) else {"status":"NO_AUDIO_STREAM"}
    return result
def main(a):
    action=a["action"]
    if action=="status":return {"runtime":request("/v2"),"models":request("/v2/repository/index",{"ready":False})}
    if action in {"embedding","tts"}:
        text=a["text"]
        if not isinstance(text,str) or not 0<len(text)<=4000:raise ValueError("TEXT_LENGTH_INVALID")
        return embedding(text) if action=="embedding" else synthesize(text)
    p=media_path(a["path"])
    if action=="asr":return transcribe(p)
    if action=="image":return image_analyze(p)
    if action=="image_embedding":return image_embed(p)
    if action=="video":
        frames=a.get("frames",3)
        if not isinstance(frames,int) or not 1<=frames<=6:raise ValueError("FRAME_LIMIT_INVALID")
        return video_analyze(p,frames)
    raise ValueError("ACTION_NOT_ALLOWED")
if __name__=="__main__":
    try:print(json.dumps({"ok":True,"result":main(json.loads(sys.argv[1]))},ensure_ascii=False))
    except Exception as e:print(json.dumps({"ok":False,"error":str(e)[:1000]}));sys.exit(1)
