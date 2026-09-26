#!/usr/bin/env python3
import zipfile, hashlib, json, collections, re, sys
from pathlib import Path

def scan(path):
    groups=collections.defaultdict(list)
    out=[]
    with zipfile.ZipFile(path) as z:
        for i in z.infolist():
            if i.is_dir(): continue
            data=z.read(i.filename)
            h=hashlib.sha256(data).hexdigest()
            groups[h].append(i.filename)
            out.append({"path":i.filename,"size":i.file_size,"sha256":h})
    return {
        "files":len(out),
        "unique_hashes":len(groups),
        "duplicate_hash_groups":sum(1 for v in groups.values() if len(v)>1),
        "duplicate_extra_files":sum(len(v)-1 for v in groups.values() if len(v)>1),
        "entries":out
    }

if __name__=="__main__":
    print(json.dumps(scan(sys.argv[1]),ensure_ascii=False))
