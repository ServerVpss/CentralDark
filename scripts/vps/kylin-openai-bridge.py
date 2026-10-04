#!/usr/bin/env python3
import ctypes, json, threading, time, uuid, os, sys
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

sys.path.insert(0, str(Path(__file__).resolve().parent))
from current_model_resolver import resolve_current_model, resolve_current_model_details

LIB="/usr/lib/x86_64-linux-gnu/libkysdk-genai-nlp.so.1"
lib=ctypes.CDLL(LIB)

c_void_p=ctypes.c_void_p
c_char_p=ctypes.c_char_p
c_int=ctypes.c_int
c_bool=ctypes.c_bool

lib.genai_text_create_session.restype=c_void_p
lib.genai_text_destroy_session.argtypes=[ctypes.POINTER(c_void_p)]
lib.genai_text_init_session.argtypes=[c_void_p]
lib.genai_text_init_session.restype=c_int
lib.genai_text_enable_internal_event_loop.argtypes=[c_void_p,c_bool]
CALLBACK=ctypes.CFUNCTYPE(None,c_void_p,c_void_p)
lib.genai_text_result_set_callback.argtypes=[c_void_p,CALLBACK,c_void_p]
lib.chat_model_config_create.restype=c_void_p
lib.chat_model_config_destroy.argtypes=[ctypes.POINTER(c_void_p)]
lib.chat_model_config_set_name.argtypes=[c_void_p,c_char_p]
lib.chat_model_config_set_thinking_enabled.argtypes=[c_void_p,c_bool,ctypes.POINTER(c_int)]
lib.chat_model_config_set_max_completion_tokens.argtypes=[c_void_p,c_int]
lib.chat_model_config_set_max_completion_tokens.restype=c_int
lib.genai_text_set_model_config.argtypes=[c_void_p,c_void_p]
lib.genai_text_chat_async.argtypes=[c_void_p,c_char_p]
lib.chat_result_get_assistant_message.argtypes=[c_void_p]
lib.chat_result_get_assistant_message.restype=c_char_p
lib.chat_result_get_error_code.argtypes=[c_void_p]
lib.chat_result_get_error_code.restype=c_int
lib.chat_result_get_error_message.argtypes=[c_void_p]
lib.chat_result_get_error_message.restype=c_char_p
lib.chat_result_get_is_end.argtypes=[c_void_p]
lib.chat_result_get_is_end.restype=c_bool

def ask_native(prompt, timeout=90, thinking=None, max_tokens=None):
    sess=c_void_p(lib.genai_text_create_session())
    if not sess: raise RuntimeError("SESSION_CREATE_FAILED")
    done=threading.Event()
    chunks=[]
    err=[None]
    @CALLBACK
    def cb(result,_):
        ec=lib.chat_result_get_error_code(result)
        if ec:
            msg=lib.chat_result_get_error_message(result)
            err[0]=f"{ec}:{msg.decode('utf-8','replace') if msg else ''}"
            done.set()
            return
        txt=lib.chat_result_get_assistant_message(result)
        if txt: chunks.append(txt.decode("utf-8","replace"))
        if lib.chat_result_get_is_end(result): done.set()
    try:
        lib.genai_text_enable_internal_event_loop(sess, True)
        lib.genai_text_result_set_callback(sess, cb, None)
        rc=lib.genai_text_init_session(sess)
        if rc != 0: raise RuntimeError(f"INIT_FAILED:{rc}")
        cfg=c_void_p(lib.chat_model_config_create())
        if not cfg: raise RuntimeError("CONFIG_CREATE_FAILED")
        try:
            lib.chat_model_config_set_name(cfg, resolve_current_model().encode())
            if thinking is not None:
                code=c_int(0);lib.chat_model_config_set_thinking_enabled(cfg,bool(thinking),ctypes.byref(code))
                if code.value:raise RuntimeError("THINKING_CONFIG_UNSUPPORTED:"+str(code.value))
            if max_tokens is not None:
                code=lib.chat_model_config_set_max_completion_tokens(cfg,int(max_tokens))
                if code:raise RuntimeError("TOKEN_LIMIT_CONFIG_UNSUPPORTED:"+str(code))
            lib.genai_text_set_model_config(sess, cfg)
        finally:
            lib.chat_model_config_destroy(ctypes.byref(cfg))
        lib.genai_text_chat_async(sess, prompt.encode())
        if not done.wait(timeout): raise RuntimeError("TIMEOUT")
        if err[0]: raise RuntimeError(err[0])
        return "".join(chunks)
    finally:
        lib.genai_text_destroy_session(ctypes.byref(sess))

class H(BaseHTTPRequestHandler):
    def sendj(self,code,obj):
        b=json.dumps(obj,ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def log_message(self,*a): pass
    def do_GET(self):
        if self.path=="/health":
            try: details=resolve_current_model_details()
            except RuntimeError as e: return self.sendj(503,{"status":"degraded","backend":"kylin-native-sdk","error":str(e)})
            return self.sendj(200,{"status":"ok","backend":"kylin-native-sdk",**details})
        if self.path=="/v1/models":
            model=resolve_current_model()
            return self.sendj(200,{"object":"list","data":[{"id":model,"object":"model","owned_by":"openkylin"}]})
        return self.sendj(404,{"error":"not found"})
def ask(prompt, timeout=90, thinking=None, max_tokens=None):
    import subprocess
    result=subprocess.run([sys.executable,__file__,"--native-once"],input=json.dumps({"prompt":prompt,"timeout":timeout,"thinking":thinking,"max_tokens":max_tokens}),text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout+5,check=True)
    answer=json.loads(result.stdout.splitlines()[-1])
    if not answer.get("ok"):raise RuntimeError(answer.get("error","NATIVE_CALL_FAILED"))
    return answer["text"]

def serialize_messages(messages):
    rows=[]
    for m in messages:
        if not isinstance(m,dict): raise ValueError("MESSAGE_INVALID")
        content=m.get("content") or ""
        if isinstance(content,list):
            if any(p.get("type")!="text" for p in content if isinstance(p,dict)):
                raise ValueError("MULTIMODAL_CHAT_UNSUPPORTED_USE_MCP_MEDIA_TOOLS")
            content="\n".join(p.get("text","") for p in content)
        row=m.get("role","user")+": "+str(content)
        if m.get("tool_calls"): row+="\nMODEL_TOOL_CALLS: "+json.dumps(m["tool_calls"],ensure_ascii=False)
        if m.get("tool_call_id"): row+="\nTOOL_CALL_ID: "+m["tool_call_id"]
        rows.append(row)
    return "\n".join(rows)

def tool_prompt(prompt,tools):
    functions=[{**t["function"],"description":t["function"].get("description","")[:240]} for t in tools if t.get("type")=="function"]
    return prompt+"\n\nAvailable tools (JSON schemas):\n"+json.dumps(functions,ensure_ascii=False)+"\nIf you need a tool, respond ONLY with JSON: {\"tool_calls\":[{\"name\":\"exact_tool_name\",\"arguments\":{}}]}. Do not claim the tool ran. The client executes it and returns the result. Otherwise answer normally. Never invent a tool."

def decode_tool_calls(text,tools):
    candidate=text.strip()
    if "</think>" in candidate: candidate=candidate.rsplit("</think>",1)[-1].strip()
    if candidate.startswith("```json") and candidate.endswith("```"): candidate=candidate[7:-3].strip()
    elif candidate.startswith("```") and candidate.endswith("```"): candidate=candidate[3:-3].strip()
    try: data=json.loads(candidate)
    except ValueError:return []
    calls=data.get("tool_calls") if isinstance(data,dict) else None
    if not isinstance(calls,list) or not calls:return []
    names={t.get("function",{}).get("name") for t in tools}
    result=[]
    for call in calls:
        if not isinstance(call,dict) or call.get("name") not in names or not isinstance(call.get("arguments"),dict):raise ValueError("INVALID_MODEL_TOOL_CALL")
        result.append({"id":"call_"+uuid.uuid4().hex,"type":"function","function":{"name":call["name"],"arguments":json.dumps(call["arguments"],ensure_ascii=False)}})
    return result

def media_binding():
    import importlib.util
    path=os.environ.get("CENTRALDARK_NATIVE_MEDIA_ADAPTER","/root/.cache/centraldark-work/aionui-native/scripts/vps/kylin-native-media.py")
    spec=importlib.util.spec_from_file_location("centraldark_native_media",path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module

class IntegratedHandler(H):
    def send_binary(self,body,mime):
        self.send_response(200);self.send_header("Content-Type",mime);self.send_header("Content-Length",str(len(body)));self.end_headers();self.wfile.write(body)
    def completion(self,data):
        tools=data.get("tools") or []
        prompt=serialize_messages(data.get("messages") or [])
        if tools and data.get("tool_choice")!="none":prompt=tool_prompt(prompt,tools)
        print(json.dumps({"event":"kylin_bridge_request","prompt_chars":len(prompt),"tool_count":len(tools),"stream":bool(data.get("stream"))}),flush=True)
        text=ask(prompt,thinking=False if tools else None,max_tokens=min(8192,max(1,int(data.get("max_completion_tokens") or data.get("max_tokens") or 2048))) if tools else None)
        calls=decode_tool_calls(text,tools) if tools and data.get("tool_choice")!="none" else []
        message={"role":"assistant","content":None if calls else text}
        if calls:message["tool_calls"]=calls
        result={"id":"kylin-native-"+uuid.uuid4().hex,"object":"chat.completion","created":int(time.time()),"model":resolve_current_model(),
            "choices":[{"index":0,"message":message,"finish_reason":"tool_calls" if calls else "stop"}],
            "_meta":{"usage_status":"UNAVAILABLE_BY_NATIVE_SDK","tool_binding":"model_generated_json_adapter" if tools else "native_text"}}
        if data.get("stream"):
            self.send_response(200);self.send_header("Content-Type","text/event-stream");self.send_header("Cache-Control","no-cache");self.end_headers()
            delta={"role":"assistant"}
            if calls:delta["tool_calls"]=[{"index":i,**c} for i,c in enumerate(calls)]
            else:delta["content"]=text
            for d,finish in [(delta,None),({},result["choices"][0]["finish_reason"])]:
                chunk={**{k:v for k,v in result.items() if k!="choices"},"object":"chat.completion.chunk","choices":[{"index":0,"delta":d,"finish_reason":finish}]}
                self.wfile.write(("data: "+json.dumps(chunk,ensure_ascii=False)+"\n\n").encode())
            self.wfile.write(b"data: [DONE]\n\n");self.wfile.flush()
        else:self.sendj(200,result)
    def do_POST(self):
        try:
            n=int(self.headers.get("Content-Length","0"))
            if not 0<n<=32*1024*1024: return self.sendj(413,{"error":{"message":"REQUEST_SIZE_INVALID"}})
            raw=self.rfile.read(n)
            if self.path=="/v1/audio/transcriptions":
                from email.parser import BytesParser
                from email.policy import default
                message=BytesParser(policy=default).parsebytes(("Content-Type: "+self.headers.get("Content-Type","")+"\r\nMIME-Version: 1.0\r\n\r\n").encode()+raw)
                file=next((p for p in message.iter_parts() if p.get_param("name",header="Content-Disposition")=="file"),None)
                if file is None:raise ValueError("AUDIO_FILE_REQUIRED")
                suffix=Path(file.get_filename() or "audio.wav").suffix.lower()
                if suffix not in {".wav",".mp3",".webm",".ogg",".m4a",".mp4",".flac"}:raise ValueError("AUDIO_TYPE_NOT_ALLOWED")
                media=media_binding();media.CACHE.mkdir(parents=True,exist_ok=True)
                path=media.CACHE/(uuid.uuid4().hex+suffix);path.write_bytes(file.get_payload(decode=True))
                result=media.transcribe(path);return self.sendj(200,{"text":" ".join(result["transcript"])})
            data=json.loads(raw)
            if self.path=="/v1/chat/completions":return self.completion(data)
            media=media_binding()
            if self.path=="/v1/embeddings":
                inputs=data.get("input");inputs=[inputs] if isinstance(inputs,str) else inputs
                if not isinstance(inputs,list) or not 1<=len(inputs)<=16 or any(not isinstance(t,str) or not 0<len(t)<=4000 for t in inputs):raise ValueError("EMBEDDING_INPUT_INVALID")
                vectors=[media.embedding(t) for t in inputs]
                return self.sendj(200,{"object":"list","model":"ensemble-embd_gte-base_uint8-text","data":[{"object":"embedding","index":i,"embedding":v["vector"]} for i,v in enumerate(vectors)]})
            if self.path=="/v1/audio/speech":
                text=data.get("input")
                if not isinstance(text,str) or not 0<len(text)<=4000:raise ValueError("TEXT_LENGTH_INVALID")
                result=media.synthesize(text);return self.send_binary((media.CACHE.parent/result["artifact"]).read_bytes(),"audio/wav")
            return self.sendj(404,{"error":{"message":"ENDPOINT_UNSUPPORTED"}})
        except ValueError as e:return self.sendj(422,{"error":{"message":str(e),"type":"binding_error"}})
        except Exception as e:return self.sendj(502,{"error":{"message":str(e)[:1000],"type":"kylin_native_error"}})

if __name__=="__main__":
    if len(sys.argv)>1 and sys.argv[1]=="--native-once":
        try:
            data=json.load(sys.stdin);print(json.dumps({"ok":True,"text":ask_native(data["prompt"],data.get("timeout",90),data.get("thinking"),data.get("max_tokens"))},ensure_ascii=False))
        except Exception as e:print(json.dumps({"ok":False,"error":str(e)}))
    else:ThreadingHTTPServer(("127.0.0.1",18435),IntegratedHandler).serve_forever()
