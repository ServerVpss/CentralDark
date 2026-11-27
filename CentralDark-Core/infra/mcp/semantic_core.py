"""NILC GloVe-50d: primitiva lexical local canônica da CentralDark.

Percepção somente: similaridade/rank/candidatos nunca viram fato, autorização,
memória canônica ou ouro. Este módulo não baixa nada implicitamente.
"""
from __future__ import annotations

import hashlib, json, logging, os, re, time, unicodedata
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable

import numpy as np
from safetensors.numpy import load_file

SOURCE_REPO = "nilc-nlp/glove-50d"
SOURCE_REVISION = "9296f6537f6b0a24d449a2677c21c18c2c0c3bdd"
MODEL_ID = f"nilc-glove-50d@{SOURCE_REVISION}"
MODEL_SLUG = "nilc-glove-50d-9296f6537f6b"
SOURCE_LICENSE = "CC-BY-4.0"
EXPECTED_EMBEDDINGS_SHA256 = "497d9b1371d083fd0018e938dcc262244883522762e0321c7bff04c1448a9e17"
DIMENSION = 50
NORMALIZATION_VERSION = "centraldark-semantic-normalize-v1"
SOURCE_FILES = ("embeddings.safetensors", "vocab.txt", "README.md", ".gitattributes")
EMBEDDING_FILENAME, VOCAB_FILENAME, MANIFEST_FILENAME = "embeddings.safetensors", "vocab.txt", "manifest.json"
logger = logging.getLogger("centraldark.semantic")

class SemanticCoreError(RuntimeError): code = "SEMANTIC_CORE_ERROR"
class ModelNotFoundError(SemanticCoreError): code = "MODEL_NOT_FOUND"
class ModelIntegrityError(SemanticCoreError): code = "MODEL_INTEGRITY_ERROR"

@dataclass(frozen=True)
class ModelFiles:
    embeddings: Path
    vocab: Path
    manifest: Path | None
    physical_path: str
    resolution: str

def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""): h.update(chunk)
    return h.hexdigest()

def _repo_root() -> Path: return Path(__file__).resolve().parents[2]

def _model_dir(value: str | os.PathLike[str] | None) -> Path | None:
    if not value: return None
    base = Path(value).expanduser()
    for p in (base, base / MODEL_SLUG):
        if (p / EMBEDDING_FILENAME).is_file() and (p / VOCAB_FILENAME).is_file(): return p
    return None

def resolve_model_files(model_home: str | os.PathLike[str] | None = None) -> ModelFiles:
    for resolution, value in (
        ("explicit", model_home), ("env", os.getenv("SEMANTIC_MODEL_HOME")),
        ("workspace", _repo_root() / ".cache" / "semantic-models"),
    ):
        if p := _model_dir(value):
            m = p / MANIFEST_FILENAME
            return ModelFiles(p/EMBEDDING_FILENAME, p/VOCAB_FILENAME, m if m.is_file() else None, str(p), resolution)
    try:
        from huggingface_hub import try_to_load_from_cache
        e = try_to_load_from_cache(SOURCE_REPO, EMBEDDING_FILENAME, revision=SOURCE_REVISION)
        v = try_to_load_from_cache(SOURCE_REPO, VOCAB_FILENAME, revision=SOURCE_REVISION)
        if isinstance(e, str) and isinstance(v, str):
            return ModelFiles(Path(e), Path(v), None, str(Path(e).parent), "huggingface_cache")
    except Exception: pass
    raise ModelNotFoundError("MODEL_NOT_FOUND: rode infra/mcp/download_semantic_model.py e configure SEMANTIC_MODEL_HOME")

def _manifest(path: Path | None) -> dict[str, Any] | None:
    if not path: return None
    try: x = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e: raise ModelIntegrityError(f"MANIFEST_INVALID:{e}") from e
    if not isinstance(x, dict): raise ModelIntegrityError("MANIFEST_INVALID")
    return x

def _file_record(m: dict[str, Any], name: str) -> dict[str, Any] | None:
    files = m.get("files")
    if isinstance(files, list): return next((x for x in files if isinstance(x, dict) and x.get("name") == name), None)
    return files.get(name) if isinstance(files, dict) and isinstance(files.get(name), dict) else None

def _prov(method: str, value: Any, known: list[str], oov: list[str], params: dict[str, Any]) -> dict[str, Any]:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return {"model_id":MODEL_ID,"revision":SOURCE_REVISION,"method":method,"input_hash":hashlib.sha256(raw).hexdigest(),
            "known_tokens":known,"oov_tokens":oov,"parameters":params,"source_is_authority":False}

class _Cache:
    def __init__(self, n=256): self.n, self.data = n, OrderedDict()
    def key(self, op, value, params):
        raw=json.dumps({"model_id":MODEL_ID,"normalization_version":NORMALIZATION_VERSION,"operation":op,
          "input_hash":hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True).encode()).hexdigest(),"parameters":params},sort_keys=True).encode()
        return hashlib.sha256(raw).hexdigest()
    def get(self,k):
        if k not in self.data:return None
        v=self.data.pop(k);self.data[k]=v;return v
    def put(self,k,v):
        self.data.pop(k,None);self.data[k]=v
        while len(self.data)>self.n:self.data.popitem(last=False)
    def info(self): return {"entries":len(self.data),"max_entries":self.n,"key_contract":["MODEL_ID","NORMALIZATION_VERSION","INPUT_HASH","PARAMETERS"]}

class GloveSemanticCore:
    def __init__(self, model_home=None, *, tokenizer: Callable[[str],Iterable[str]]|None=None,
                 verify_hashes=True, verify_source_hash=True, cache_entries=256):
        self.model_home,self.tokenizer,self.verify_hashes,self.verify_source_hash=model_home,tokenizer,verify_hashes,verify_source_hash
        self.files=self.manifest=self.vectors=self.normalized=None; self.vocab=[]; self.rows={}; self.sha_vocab=self.sha_embeddings=None; self.cache=_Cache(cache_entries)
    @property
    def loaded(self): return self.vectors is not None
    def load(self):
        if self.loaded:return self
        f=resolve_model_files(self.model_home); m=_manifest(f.manifest)
        if m:
            if (m.get("model_id") or m.get("MODEL_ID")) not in (None,MODEL_ID): raise ModelIntegrityError("MODEL_ID_MISMATCH")
            if (m.get("revision") or m.get("SOURCE_REVISION")) not in (None,SOURCE_REVISION): raise ModelIntegrityError("REVISION_MISMATCH")
        vocab=f.vocab.read_text(encoding="utf-8",errors="strict").splitlines()
        if not vocab: raise ModelIntegrityError("VOCAB_EMPTY")
        if len(vocab)!=len(set(vocab)): raise ModelIntegrityError("VOCAB_DUPLICATE_TOKEN")
        tensors=load_file(str(f.embeddings)); vec=tensors.get("embeddings") if "embeddings" in tensors else (next(iter(tensors.values())) if len(tensors)==1 else None)
        if vec is None: raise ModelIntegrityError("EMBEDDING_TENSOR_AMBIGUOUS")
        vec=np.asarray(vec)
        if vec.ndim!=2: raise ModelIntegrityError(f"EMBEDDING_RANK_INVALID:{vec.shape}")
        if vec.shape[0]!=len(vocab): raise ModelIntegrityError(f"VOCAB_ROWS_MISMATCH:vocab={len(vocab)} rows={vec.shape[0]}")
        if vec.shape[1]!=DIMENSION: raise ModelIntegrityError(f"DIMENSION_MISMATCH:expected={DIMENSION} observed={vec.shape[1]}")
        if not np.isfinite(vec).all(): raise ModelIntegrityError("EMBEDDINGS_NON_FINITE")
        sv,se=sha256_file(f.vocab),sha256_file(f.embeddings)
        if self.verify_source_hash and se!=EXPECTED_EMBEDDINGS_SHA256: raise ModelIntegrityError(f"SHA256_MISMATCH:{EMBEDDING_FILENAME}")
        if m and self.verify_hashes:
            for name,observed in ((VOCAB_FILENAME,sv),(EMBEDDING_FILENAME,se)):
                r=_file_record(m,name); expected=r.get("sha256") if r else None
                if expected and expected!=observed: raise ModelIntegrityError(f"SHA256_MISMATCH:{name}")
        vec=np.asarray(vec,dtype=np.float32); norms=np.linalg.norm(vec,axis=1,keepdims=True)
        self.normalized=np.divide(vec,norms,out=np.zeros_like(vec),where=norms!=0)
        self.files,self.manifest,self.vectors,self.vocab,self.rows,self.sha_vocab,self.sha_embeddings=f,m,vec,vocab,{w:i for i,w in enumerate(vocab)},sv,se
        return self
    def _ensure(self):
        if not self.loaded:self.load()
    def _resolve(self,t):
        s=unicodedata.normalize("NFC",str(t).strip()); edge=re.sub(r"^\W+|\W+$","",s,flags=re.UNICODE)
        for c in dict.fromkeys((s,edge,s.lower(),edge.lower())):
            if c and c in self.rows:return c,self.rows[c]
        return None,None
    def _tokenize(self,text): return re.findall(r"[^\W_]+(?:[-'][^\W_]+)*",unicodedata.normalize("NFC",text),flags=re.UNICODE)
    def _tokens(self,text):
        raw=list(self.tokenizer(text) if self.tokenizer else self._tokenize(text)) or ([text.strip()] if text.strip() else [])
        known=[];oov=[]
        for x in raw:
            t,i=self._resolve(x); (known if i is not None else oov).append(t if i is not None else str(x))
        return known,oov
    def _phrase(self,text):
        self._ensure(); known,oov=self._tokens(text)
        if not known:return None,known,oov
        v=self.vectors[[self.rows[t] for t in known]].mean(axis=0,dtype=np.float64).astype(np.float32); n=float(np.linalg.norm(v))
        return (v/n if n else None),known,oov
    def lookup(self,term):
        self._ensure(); t,i=self._resolve(term)
        if i is None:return {"term":term,"oov":True,"vector":None,"provenance":_prov("semantic_lookup",term,[],[term],{})}
        return {"term":term,"resolved_token":t,"row":i,"oov":False,"vector":self.vectors[i].astype(float).tolist(),"provenance":_prov("semantic_lookup",term,[t],[],{})}
    def neighbors(self,term,top_k=10):
        if not 1<=top_k<=100: raise ValueError("top_k must be between 1 and 100")
        key=self.cache.key("neighbors",term,{"top_k":top_k}); cached=self.cache.get(key)
        if cached is not None:return cached
        q,known,oov=self._phrase(term)
        if q is None:r={"input":term,"oov":True,"neighbors":[],"provenance":_prov("semantic_neighbors",term,known,oov,{"top_k":top_k})};self.cache.put(key,r);return r
        scores=self.normalized@q; excluded={self.rows[t] for t in known}; order=np.argsort(scores)[::-1]
        out=[]
        for x in order:
            i=int(x)
            if i in excluded:continue
            out.append({"term":self.vocab[i],"score":float(scores[i]),"row":i})
            if len(out)>=top_k:break
        r={"input":term,"oov":False,"neighbors":out,"provenance":_prov("semantic_neighbors",term,known,oov,{"top_k":top_k})};self.cache.put(key,r);return r
    def similarity(self,left,right):
        value={"left":left,"right":right};key=self.cache.key("similarity",value,{});cached=self.cache.get(key)
        if cached is not None:return cached
        a,ak,ao=self._phrase(left);b,bk,bo=self._phrase(right);score=None if a is None or b is None else float(np.dot(a,b))
        r={"left":left,"right":right,"score":score,"oov":score is None,"left_known_tokens":ak,"right_known_tokens":bk,"left_oov_tokens":ao,"right_oov_tokens":bo,
           "provenance":_prov("semantic_similarity",value,ak+bk,ao+bo,{})};self.cache.put(key,r);return r
    def expand(self,text,top_k=10):
        r=self.neighbors(text,top_k);return {"input":text,"candidates":r["neighbors"],"oov":r["oov"],"provenance":_prov("semantic_expand",text,r["provenance"]["known_tokens"],r["provenance"]["oov_tokens"],{"top_k":top_k}),"candidate_is_truth":False}
    def rank(self,query,candidates):
        if not isinstance(candidates,list) or not candidates or len(candidates)>500: raise ValueError("candidates must contain 1..500 strings")
        q,qk,qo=self._phrase(query);out=[]
        for pos,c in enumerate(candidates):
            v,k,o=self._phrase(c);score=None if q is None or v is None else float(np.dot(q,v));out.append({"candidate":c,"score":score,"oov":score is None,"known_tokens":k,"oov_tokens":o,"input_position":pos})
        out.sort(key=lambda x:(x["score"] is not None,x["score"] if x["score"] is not None else -2,-x["input_position"]),reverse=True)
        return {"query":query,"ranked":out,"provenance":_prov("semantic_rank",{"query":query,"candidates":candidates},qk,qo,{}),"rank_is_decision":False}
    def dedupe(self,items,threshold=None):
        if not isinstance(items,list) or not 2<=len(items)<=200:raise ValueError("items must contain 2..200 strings")
        if threshold is not None and not -1<=threshold<=1:raise ValueError("threshold must be between -1 and 1")
        pairs=[];merge=[]
        for i in range(len(items)):
            for j in range(i+1,len(items)):
                s=self.similarity(items[i],items[j]);p={"left_index":i,"right_index":j,"left":items[i],"right":items[j],"score":s["score"],"oov":s["oov"]};pairs.append(p)
                if threshold is not None and s["score"] is not None and s["score"]>=threshold:merge.append(p)
        pairs.sort(key=lambda x:x["score"] if x["score"] is not None else -2,reverse=True)
        return {"items":items,"threshold":threshold,"threshold_source":"CALLER_EVIDENCE_REQUIRED" if threshold is not None else "UNPROVEN","pairs":pairs,"merge_candidates":merge,
          "automatic_merge":False,"same_intent_claim":False,"decision":"CANDIDATES_ONLY" if threshold is not None else "UNPROVEN_THRESHOLD","provenance":_prov("semantic_dedupe",items,[],[],{"threshold":threshold})}
    def model_info(self):
        self._ensure();return {"model_id":MODEL_ID,"source":SOURCE_REPO,"revision":SOURCE_REVISION,"dimension":int(self.vectors.shape[1]),"vocab_size":int(self.vectors.shape[0]),"license":SOURCE_LICENSE,
          "physical_path":self.files.physical_path,"embedding_path":str(self.files.embeddings),"vocab_path":str(self.files.vocab),"sha256_vocab":self.sha_vocab,"sha256_embeddings":self.sha_embeddings,
          "resolution":self.files.resolution,"normalization_version":NORMALIZATION_VERSION,"cache":self.cache.info(),"source_is_authority":False,"loaded":True}
    def health(self):
        t=time.perf_counter()
        try:i=self.model_info();return {"ok":True,"status":"HEALTHY","model_id":MODEL_ID,"revision":SOURCE_REVISION,"dimension":i["dimension"],"vocab_size":i["vocab_size"],"duration_ms":round((time.perf_counter()-t)*1000,3)}
        except SemanticCoreError as e:return {"ok":False,"status":e.code,"error":str(e),"model_id":MODEL_ID,"revision":SOURCE_REVISION,"duration_ms":round((time.perf_counter()-t)*1000,3)}
    def dispatch(self,operation,args=None):
        ops={"semantic_lookup":self.lookup,"semantic_neighbors":self.neighbors,"semantic_similarity":self.similarity,"semantic_expand":self.expand,"semantic_rank":self.rank,"semantic_dedupe":self.dedupe,"semantic_model_info":self.model_info,"semantic_health":self.health}
        if operation not in ops:raise ValueError(f"UNKNOWN_OPERATION:{operation}")
        t=time.perf_counter();args=args or {};r=ops[operation](**args);count=sum(len(self._tokenize(v)) if isinstance(v,str) else sum(len(self._tokenize(x)) for x in v if isinstance(x,str)) if isinstance(v,list) else 0 for v in args.values())
        logger.info("semantic_operation operation=%s duration_ms=%.3f model_id=%s token_count=%d",operation,(time.perf_counter()-t)*1000,MODEL_ID,count);return r

__all__=["GloveSemanticCore","SemanticCoreError","ModelNotFoundError","ModelIntegrityError","MODEL_ID","MODEL_SLUG","SOURCE_REPO","SOURCE_REVISION","SOURCE_LICENSE","EXPECTED_EMBEDDINGS_SHA256","DIMENSION","NORMALIZATION_VERSION","SOURCE_FILES","EMBEDDING_FILENAME","VOCAB_FILENAME","MANIFEST_FILENAME","sha256_file","resolve_model_files"]
