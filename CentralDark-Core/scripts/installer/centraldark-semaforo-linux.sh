#!/usr/bin/env bash
# CENTRALDARK_SEMAFORO_LINUX_V1 | executor do owner scripts/centraldark-inventory-reconcile.sh
# GitHub main (SHA exato) -> base Git -> arquivos locais -> classificacao -> recibos.
# --check: nao escreve na worktree; --apply: so deltas sem sobreposicao, com backup + rollback.
set -Eeuo pipefail
if [[ $# -gt 0 ]]; then MODE="$1"; else MODE="--check"; fi
case "$MODE" in --check|--apply|--help) ;; *) echo 'Uso: centraldark-semaforo-linux.sh [--check|--apply]' >&2; exit 64 ;; esac
if [[ "$MODE" == "--help" ]]; then
  echo 'Semaforo Linux: --check (auditoria) | --apply (backup, candidatos seguros, readback).'
  echo 'Nao faz commit, reset, clean ou push. Conflitos e testes de owner ficam pendentes.'
  exit 0
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
if [[ -v CENTRALDARK_REPO ]]; then ROOT="$CENTRALDARK_REPO"; fi
STATE="$HOME/.local/state/centraldark/inventory-reconcile"
if [[ -v CENTRALDARK_INVENTORY_STATE_DIR ]]; then STATE="$CENTRALDARK_INVENTORY_STATE_DIR"; fi
command -v python3 >/dev/null || { echo 'FALHOU: python3 ausente'; exit 2; }
command -v git >/dev/null || { echo 'FALHOU: git ausente'; exit 2; }
python3 - "$ROOT" "$STATE" "$MODE" <<'PY'
import ast, datetime, fcntl, hashlib, json, os, pathlib, shutil, subprocess, sys, tempfile, time
from collections import Counter
from pathlib import Path

root=Path(sys.argv[1]).resolve()
state=Path(sys.argv[2]).resolve()
mode=sys.argv[3]
logs=state/"semaforo"/"logs"
recovery=state/"semaforo"/"recovery"
prefix="CentralDark/"
def git(*args, timeout=35, data=None):
    r=subprocess.run(["git",*args],cwd=root,input=data,stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,timeout=timeout)
    if r.returncode:
        raise RuntimeError("GIT_"+args[0].upper()+"_FALHOU rc="+str(r.returncode))
    return r.stdout
def tree(ref):
    out={}
    for row in git("ls-tree","-r","-z",ref,timeout=50).split(b"\0"):
        if not row: continue
        head,raw=row.split(b"\t",1)
        md,kind,oid=head.decode("ascii").split()
        out[os.fsdecode(raw)]=(md,kind,oid)
    return out
def oid_by_data(content,path=None):
    args=["hash-object"]
    if path is not None: args+=["--path="+path]
    return git(*args,"--stdin",data=content).decode("ascii").strip()
def oid_by_path(path):
    return git("hash-object","--path="+path,"--",path).decode("ascii").strip()
def is_regular(p):
    return p.is_file() and not p.is_symlink()
def protected(p):
    if p.is_symlink(): return True
    return any(v.is_symlink() for v in p.parents if v!=root and root in v.parents)
def sha256(b): return hashlib.sha256(b).hexdigest()
def atomic_text(path,contents):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=".cd-proof-",dir=str(path.parent))
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as f:
            f.write(contents); f.flush(); os.fsync(f.fileno())
        os.replace(tmp,path)
    finally:
        if os.path.lexists(tmp): os.unlink(tmp)
def atomic_json(path,value):
    atomic_text(path,json.dumps(value,ensure_ascii=False,indent=2)+"\n")
def atomic_blob(path,data,modebits):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=".cd-apply-",dir=str(path.parent))
    try:
        with os.fdopen(fd,"wb") as f:
            f.write(data);f.flush();os.fsync(f.fileno())
        os.chmod(tmp,modebits);os.replace(tmp,path)
    finally:
        if os.path.lexists(tmp):os.unlink(tmp)
def read_manifest(remote_sha,base_sha):
    m=tree(remote_sha)
    if prefix+"scripts/trigger-fabric/centraldark_full_trigger_boot.py" not in m:
        raise RuntimeError("PREFIX_MAIN_CENTRALDARK_NAO_COMPROVADO")
    return {name[len(prefix):]:v for name,v in m.items() if name.startswith(prefix)}
def remote_sha():
    out=git("ls-remote","origin","refs/heads/main",timeout=20).decode().split()
    if not out or len(out[0])!=40:raise RuntimeError("MAIN_REMOTA_NAO_COMPROVADA")
    sha=out[0]
    try:git("cat-file","-e",sha,timeout=7)
    except (RuntimeError,subprocess.TimeoutExpired):
        # Apenas objetos Git; nao altera HEAD, indice ou arquivos de trabalho.
        git("-c","core.hooksPath=/dev/null","fetch","--no-tags",
            "--no-write-fetch-head","origin",sha,timeout=80)
        git("cat-file","-e",sha,timeout=10)
    return sha
def scan(main,base,dirty,untracked):
    names=sorted(set(main)|set(base)|dirty|untracked)
    rows=[]; count=Counter(); candidate=[]
    for rel in names:
        if not rel or rel.startswith("/") or "\x00" in rel or any(x==".." for x in Path(rel).parts):
            raise RuntimeError("CAMINHO_INVALIDO_NO_INVENTARIO")
        path=root/rel
        old=base.get(rel); their=main.get(rel)
        oldoid=old[2] if old else ""
        theirs=their[2] if their else ""
        local_exists=os.path.lexists(path)
        # Confiar nos objetos do HEAD apenas quando Git confirmou arquivo limpo.
        localoid=""
        if local_exists:
            if old and rel not in dirty:
                localoid=oldoid
            elif is_regular(path) and not protected(path):
                localoid=oid_by_path(rel)
            elif path.is_symlink():
                localoid=oid_by_data(os.fsencode(os.readlink(path)))
        if old and old[1]=="commit" and their is None: status="GITLINK_LEGADO_PRESERVADO"
        elif their and their[1]!="blob":status="TIPO_REMOTO_REVISAR"
        elif old and old[1]!="blob":status="TIPO_LOCAL_REVISAR"
        elif their and their[0] not in ("100644","100755"):status="MODO_REMOTO_REVISAR"
        elif localoid and their and localoid==theirs and (not old or old[0]==their[0]):
            status="ALINHADO"
        elif not local_exists and not their:status="REMOVIDO_AMBOS"
        elif their is None:status="MAIN_REMOVEU_VM_MANTEVE"
        elif not local_exists and old:status="EXCLUSAO_LOCAL_PENDENTE"
        elif old is None and not local_exists:status="NOVO_SO_MAIN"
        elif old is None:status="NOVO_INDEPENDENTE_REVISAR"
        elif rel in dirty and localoid==oldoid and old[0]==their[0]:
            # staged/unstaged muda a seguranca: dirty exige revisao mesmo com bytes iguais.
            status="LOCAL_SUJO_REVISAR"
        elif localoid==oldoid and old[0]==their[0]:
            status="MUDANCA_SO_MAIN"
        elif their and their[2]==oldoid:status="DELTA_SO_VM"
        else:status="CONFLITO_OU_MESCLA"
        if their and old and their[0]!=old[0] and status=="ALINHADO":
            status="MODO_DIFERENTE"
        if status in ("NOVO_SO_MAIN","MUDANCA_SO_MAIN"):
            if protected(path):status="LINK_PROTEGIDO"
            elif rel in dirty or rel in untracked:status="LOCAL_SUJO_REVISAR"
            else:candidate.append((rel,their,old))
        count[status]+=1
        rows.append({"arquivo":rel,"estado":status,"sha_base":oldoid,
                     "sha_local":localoid,"sha_main":theirs,"local_sujo":rel in dirty})
    return rows,count,candidate
def apply_safe(candidates,commit):
    if not candidates:return {"aplicados":0,"backup":"","owner_tests":"PENDENTE"}
    if root==state or root in state.parents:
        raise RuntimeError("ESTADO_DENTRO_REPO_PROIBIDO")
    if recovery.exists() and list(recovery.glob("*/IN_PROGRESS")):
        raise RuntimeError("TRANSACAO_ANTERIOR_PENDENTE_DE_RECUPERACAO")
    prepared=[];total=0
    for rel,meta,old in candidates:
        md,kind,oid=meta
        if kind!="blob" or md not in ("100644","100755"):continue
        p=root/rel
        if protected(p):continue
        if old:
            if not is_regular(p) or oid_by_path(rel)!=old[2]:continue
        elif os.path.lexists(p):continue
        data=git("cat-file","blob",oid,timeout=30)
        total+=len(data)
        if len(data)>12_000_000 or total>250_000_000:raise RuntimeError("LOTE_ACIMA_DO_LIMITE")
        if oid_by_data(data)!=oid or oid_by_data(data,rel)!=oid:
            raise RuntimeError("FILTRO_GIT_NAO_EQUIVALENTE:"+rel)
        prepared.append({"rel":rel,"main_oid":oid,"mode":md,"before":old[2] if old else "",
                         "old_mode":old[0] if old else "100644","existed":bool(old),"data":data})
    if not prepared:return {"aplicados":0,"backup":"","owner_tests":"PENDENTE"}
    if remote_sha()!=commit:raise RuntimeError("MAIN_AVANCOU_DURANTE_PREPARACAO")
    name=datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")+"-"+commit[:10]
    recovery.mkdir(parents=True,exist_ok=True)
    vault=recovery/name
    vault.mkdir(mode=0o700)
    marker=vault/"IN_PROGRESS"
    marker.write_text("Leia manifest.json antes de prosseguir.\n",encoding="utf-8")
    manifest={"versao":"CENTRALDARK_SEMAFORO_LINUX_V1","main_sha":commit,
              "estado":"PREPARACAO","arquivos":[],"owner_runtime_tests":"PENDENTE"}
    modified=[]
    try:
        for idx,c in enumerate(prepared):
            p=root/c["rel"]
            entry={k:v for k,v in c.items() if k!="data"}
            if c["existed"]:
                if not is_regular(p) or oid_by_path(c["rel"])!=c["before"]:
                    raise RuntimeError("RACE_ANTES_BACKUP:"+c["rel"])
                bak=vault/("original-%05d.bin"%idx)
                shutil.copy2(p,bak,follow_symlinks=False)
                if sha256(bak.read_bytes())!=sha256(p.read_bytes()):
                    raise RuntimeError("BACKUP_READBACK:"+c["rel"])
                entry["backup"]=str(bak)
                entry["sha256_original"]=sha256(bak.read_bytes())
            elif os.path.lexists(p):
                raise RuntimeError("COLISAO_NOVO:"+c["rel"])
            else:entry["backup"]=""
            manifest["arquivos"].append(entry)
        manifest["estado"]="BACKUP_APROVADO"
        atomic_json(vault/"manifest.json",manifest)
        for c in prepared:
            p=root/c["rel"]
            if c["existed"]:
                if not is_regular(p) or oid_by_path(c["rel"])!=c["before"]:
                    raise RuntimeError("RACE_ANTES_ESCRITA:"+c["rel"])
            elif os.path.lexists(p):raise RuntimeError("COLISAO_ANTES_ESCRITA:"+c["rel"])
            atomic_blob(p,c["data"],0o755 if c["mode"]=="100755" else 0o644)
            modified.append(c)
            if oid_by_path(c["rel"])!=c["main_oid"]:
                raise RuntimeError("READBACK_DIVERGENTE:"+c["rel"])
        for offset in range(0,len(modified),40):
            paths=[c["rel"] for c in modified[offset:offset+40]]
            git("diff","--check","HEAD","--",*paths,timeout=30)
        for c in modified:
            data=c["data"]
            if c["rel"].endswith(".py"):ast.parse(data.decode("utf-8-sig"),filename=c["rel"])
            elif c["rel"].endswith(".json"):json.loads(data.decode("utf-8-sig"))
            elif c["rel"].endswith((".sh",".bash")):
                result=subprocess.run(["bash","-n",str(root/c["rel"])],
                                      stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=15)
                if result.returncode:raise RuntimeError("BASH_N_FALHOU:"+c["rel"])
        if remote_sha()!=commit:raise RuntimeError("MAIN_MUDOU_APOS_APLICAR")
        manifest["estado"]="HASH_E_SINTAXE_APROVADOS_OWNER_TEST_PENDENTE"
        atomic_json(vault/"manifest.json",manifest)
        marker.unlink()
        return {"aplicados":len(modified),"backup":str(vault),"owner_tests":"PENDENTE"}
    except BaseException as e:
        errors=[]
        for c in reversed(modified):
            try:
                p=root/c["rel"]
                if c["existed"]:
                    idx=prepared.index(c);bak=vault/("original-%05d.bin"%idx)
                    if not bak.is_file():raise RuntimeError("BACKUP_AUSENTE")
                    atomic_blob(p,bak.read_bytes(),0o755 if c["old_mode"]=="100755" else 0o644)
                elif is_regular(p):p.unlink()
            except BaseException as ex:errors.append(c["rel"]+":"+str(ex))
        manifest["estado"]="ROLLBACK_FALHOU" if errors else "ROLLBACK_APROVADO"
        manifest["erro"]=str(e);manifest["rollback_erros"]=errors
        atomic_json(vault/"manifest.json",manifest)
        if not errors:marker.unlink()
        raise RuntimeError("LOTE_ABORTADO:"+str(e)+";BACKUP="+str(vault)+
                           ";ROLLBACK_ERROS="+str(len(errors)))
NOMES_PT={
    "ALINHADO":"Alinhado com a versão principal",
    "REMOVIDO_AMBOS":"Removido nos dois lados",
    "GITLINK_LEGADO_PRESERVADO":"Vínculo Git antigo preservado para revisão",
    "TIPO_REMOTO_REVISAR":"Tipo de arquivo da versão principal precisa de revisão",
    "TIPO_LOCAL_REVISAR":"Tipo de arquivo local precisa de revisão",
    "MODO_REMOTO_REVISAR":"Permissões da versão principal precisam de revisão",
    "MAIN_REMOVEU_VM_MANTEVE":"Removido na versão principal, mantido na máquina",
    "EXCLUSAO_LOCAL_PENDENTE":"Arquivo ausente na máquina e presente na versão principal",
    "NOVO_SO_MAIN":"Arquivo novo disponível na versão principal",
    "NOVO_INDEPENDENTE_REVISAR":"Arquivo novo nos dois lados precisa de revisão",
    "LOCAL_SUJO_REVISAR":"Alteração local precisa ser preservada e analisada",
    "MUDANCA_SO_MAIN":"Atualização exclusiva da versão principal",
    "DELTA_SO_VM":"Alteração exclusiva da máquina",
    "CONFLITO_OU_MESCLA":"Conflito ou mescla ainda precisa de revisão",
    "LINK_PROTEGIDO":"Caminho protegido por vínculo simbólico",
    "MODO_DIFERENTE":"Permissões diferentes entre máquina e versão principal",
}
def nome_pt(chave):
    return NOMES_PT.get(chave,"Situação a conferir: "+chave.replace("_"," ").lower())

def save_logs(rows,count,commit,head,applied,previous_atual):
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    total=len(rows)
    pending=sum(n for k,n in count.items() if k not in ("ALINHADO","REMOVIDO_AMBOS"))
    lines=["CENTRALDARK | SEMÁFORO DE CONFORMIDADE",
           "Data e hora: "+now,
           "Fonte: Git, versão principal verificada por identificação SHA",
           "Versão principal (SHA): "+commit,
           "Versão local (SHA): "+head,
           "Operação: "+("Conferir" if mode=="--check" else "Aplicar com cópia de segurança"),
           "Arquivos avaliados: "+str(total),
           "Arquivos alinhados: "+str(count["ALINHADO"]),
           "Pendências: "+str(pending),
           "Arquivos aplicados: "+str(applied["aplicados"]),
           "Cópia de segurança: "+(applied["backup"] or "Não necessária nesta execução"),
           "Testes dos serviços responsáveis: PENDENTES",
           "Selo final: "+("CANDIDATO A TESTES FUNCIONAIS" if pending==0 else "PENDENTE"),
           "=== RESUMO POR SITUAÇÃO ==="]
    lines.extend(nome_pt(k)+": "+str(v)+" arquivo(s)" for k,v in sorted(count.items()))
    lines.append("=== SITUAÇÃO DE CADA ARQUIVO ===")
    lines.extend(r["arquivo"]+" | "+nome_pt(r["estado"]) for r in rows)
    lines.append("=== DADOS TÉCNICOS PARA AUTOMAÇÕES ===")
    lines.extend(["DATA_HORA="+now,"FONTE=GIT_SHA_MAIN_EXATO",
                  "MAIN_SHA="+commit,"VM_HEAD="+head,"MODO="+mode,
                  "TOTAL="+str(total),"ALINHADOS="+str(count["ALINHADO"]),
                  "PENDENCIAS="+str(pending),"APLICADOS="+str(applied["aplicados"]),
                  "BACKUP="+applied["backup"],"TESTES_OWNER_RUNTIME=PENDENTE",
                  "SELO="+("CANDIDATO_A_TESTES_OWNER" if pending==0 else "PENDENTE")])
    lines.extend("COUNT_"+k+"="+str(v) for k,v in sorted(count.items()))
    lines.extend("ITEM_STATE="+json.dumps(r,ensure_ascii=False,separators=(",",":")) for r in rows)
    logs.mkdir(parents=True,exist_ok=True)
    passado=logs/"CentralDark-Resultado-Passado.txt"
    atual=logs/"CentralDark-Resultado-Atual.txt"
    presente=logs/"CentralDark-Resultado-Presente.txt"
    prev=previous_atual if previous_atual else "SEM_REGISTRO\n"
    atomic_text(passado,prev)
    atomic_text(atual,"\n".join(lines)+"\n")
    old_status={}
    for line in prev.splitlines():
        if line.startswith("ITEM_STATE="):
            try:r=json.loads(line[len("ITEM_STATE="):]);old_status[r["arquivo"]]=r["estado"]
            except (ValueError,KeyError,TypeError):pass
    transitions=[r for r in rows if r["arquivo"] in old_status and
                 old_status[r["arquivo"]]!=r["estado"]]
    summary=["CENTRALDARK | RESULTADO PRESENTE",
             "Data e hora: "+now,"Versão principal (SHA): "+commit,
             "Arquivos aplicados: "+str(applied["aplicados"]),
             "Pendências: "+str(pending),
             "Mudanças de situação: "+str(len(transitions)),
             "Cópia de segurança: "+(applied["backup"] or "Não necessária nesta execução"),
             "=== MUDANÇAS ENTRE PASSADO E PRESENTE ==="]
    summary.extend("Antes: "+nome_pt(old_status[r["arquivo"]])+" | Agora: "+nome_pt(r["estado"])+" | Arquivo: "+r["arquivo"] for r in transitions)
    summary.append("=== DADOS TÉCNICOS PARA AUTOMAÇÕES ===")
    summary.extend(["DATA_HORA="+now,"MAIN_SHA="+commit,
                    "APLICADOS="+str(applied["aplicados"]),
                    "PENDENCIAS="+str(pending),"TRANSICOES="+str(len(transitions)),
                    "BACKUP="+applied["backup"]])
    atomic_text(presente,"\n".join(summary)+"\n")
    print("\n🪬 CENTRALDARK | SEMÁFORO DE CONFORMIDADE | "+("CONFERIR" if mode=="--check" else "APLICAR COM CÓPIA DE SEGURANÇA"))
    print("🏛️ Versão principal (SHA): "+commit+" | Versão local (SHA): "+head)
    print("🟢 [CERTO] Alinhados: "+str(count["ALINHADO"])+
          " | 🟡 [ATENÇÃO] Pendentes: "+str(pending)+
          " | 🔵 [INFORMAÇÃO] Aplicados: "+str(applied["aplicados"]))
    for status,n in sorted(count.items()):
        if status not in ("ALINHADO","REMOVIDO_AMBOS"):
            print("  "+nome_pt(status)+": "+str(n))
    print("🧾 Passado / Atual / Presente: "+str(logs))
    if applied["backup"]:print("🛡️ Cópia de segurança conferida: "+applied["backup"])
    print("🟡 Testes dos serviços responsáveis: PENDENTES | Nenhum commit ou envio ao GitHub efetuado.")
def run():
    if not (root/".git").exists():raise RuntimeError("REPOSITORIO_SEM_GIT")
    if root==state or root in state.parents:
        raise RuntimeError("ESTADO_NAO_PODE_FICAR_DENTRO_DO_REPO")
    commit=remote_sha()
    head=git("rev-parse","HEAD").decode("ascii").strip()
    main=read_manifest(commit,head)
    base=tree("HEAD")
    dirty={os.fsdecode(p) for cmd in (("diff","HEAD","--name-only","-z"),
                                     ("diff","--cached","--name-only","-z"))
           for p in git(*cmd).split(b"\0") if p}
    untracked={os.fsdecode(p) for p in
               git("ls-files","--others","--exclude-standard","-z").split(b"\0") if p}
    rows,count,candidates=scan(main,base,dirty,untracked)
    applied={"aplicados":0,"backup":"","owner_tests":"PENDENTE"}
    if mode=="--apply":
        applied=apply_safe(candidates,commit)
        rows,count,_=scan(main,base,dirty|{c[0] for c in candidates if c[0] not in dirty},untracked)
    atual=logs/"CentralDark-Resultado-Atual.txt"
    previous=atual.read_text(encoding="utf-8",errors="replace") if atual.is_file() else ""
    save_logs(rows,count,commit,head,applied,previous)
def guarded_run():
    if root==state or root in state.parents:
        raise RuntimeError("ESTADO_DENTRO_REPO_NAO_AUTORIZADO")
    lock_dir=state/"semaforo"
    lock_dir.mkdir(parents=True,exist_ok=True)
    with open(lock_dir/".writer.lock","a+") as lock:
        try:
            fcntl.flock(lock.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("EXECUCAO_SIMULTANEA_BLOQUEADA")
        run()
try:guarded_run()
except BaseException as error:
    print("🔴 FALHOU: "+str(error),file=sys.stderr)
    sys.exit(2)
PY
