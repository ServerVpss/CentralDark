import zipfile, hashlib, pathlib, json
zpath=pathlib.Path(r"E:\CentralDark\Pivete\CASA-VAULT\00-CANONICO\docs\BRAIN\08-ARTEFATOS-VISUAIS\CARTAZES-CANONICOS\03-trajetoria-vivida.zip")
sums=pathlib.Path(r"E:\CentralDark\_tmp\centraldark-ci-main-20260919\docs\BRAIN\08-ARTEFATOS-VISUAIS\CARTAZES-CANONICOS\RECIBO\SHA256SUMS.txt")
canon={}
for line in sums.read_text(encoding="utf-8-sig").splitlines():
    parts=line.strip().split(None,1)
    if len(parts)==2: canon[pathlib.PurePosixPath(parts[1]).name]=parts[0].lower()
rows=[]
with zipfile.ZipFile(zpath) as z:
    for info in z.infolist():
        if info.is_dir(): continue
        data=z.read(info.filename)
        sha=hashlib.sha256(data).hexdigest()
        name=pathlib.PurePosixPath(info.filename).name
        rows.append({"name":name,"sha256":sha,"canonical_sha256":canon.get(name),"same":canon.get(name)==sha})
print(json.dumps({"zip":str(zpath),"members":rows,"all_same":all(r["same"] for r in rows),"count":len(rows)},ensure_ascii=False,indent=2))
