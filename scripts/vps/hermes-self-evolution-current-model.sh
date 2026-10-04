#!/usr/bin/env bash
set -euo pipefail
DONOR_DIR="${HERMES_SELF_EVOLUTION_DIR:-/root/.hermes/cache/scratch/hermes-agent-self-evolution}"
BASE_URL="${CENTRALDARK_LOCAL_AI_BASE_URL:-http://127.0.0.1:18435/v1}"
HEALTH_URL="${BASE_URL%/v1}/health"
HEALTH_JSON="$(curl -fsS --max-time 5 "$HEALTH_URL")"
MODEL="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("model", ""))' <<<"$HEALTH_JSON")"
[ -n "$MODEL" ] || { echo "CURRENT_LOCAL_MODEL_UNKNOWN" >&2; exit 42; }
MODEL_SPEC="openai/$MODEL"
export OPENAI_API_BASE="$BASE_URL"
export OPENAI_BASE_URL="$BASE_URL"
export OPENAI_API_KEY="${OPENAI_API_KEY:-local-kylin}"
ARGS=("$@")
has_optimizer=0; has_eval=0
for ((i=0;i<${#ARGS[@]};i++)); do
  case "${ARGS[$i]}" in
    --optimizer-model|--eval-model)
      flag="${ARGS[$i]}"
      if (( i + 1 >= ${#ARGS[@]} )); then
        echo "MODEL_IS_NOT_IDENTITY: $flag requires $MODEL_SPEC" >&2
        exit 64
      fi
      override="${ARGS[$((i + 1))]}"
      if [ "$override" != "$MODEL_SPEC" ]; then
        echo "MODEL_IS_NOT_IDENTITY: $flag=$override current=$MODEL_SPEC" >&2
        exit 64
      fi
      [ "$flag" = "--optimizer-model" ] && has_optimizer=1 || has_eval=1
      i=$((i + 1))
      ;;
    --optimizer-model=*|--eval-model=*)
      flag="${ARGS[$i]%%=*}"
      override="${ARGS[$i]#*=}"
      if [ "$override" != "$MODEL_SPEC" ]; then
        echo "MODEL_IS_NOT_IDENTITY: $flag=$override current=$MODEL_SPEC" >&2
        exit 64
      fi
      [ "$flag" = "--optimizer-model" ] && has_optimizer=1 || has_eval=1
      ;;
  esac
done
[ "$has_optimizer" -eq 1 ] || ARGS+=(--optimizer-model "$MODEL_SPEC")
[ "$has_eval" -eq 1 ] || ARGS+=(--eval-model "$MODEL_SPEC")
mkdir -p /root/CentralDark/logs
python3 - "$MODEL" "$BASE_URL" "$$" <<'PY'
import json,sys,time,os
model,base,pid=sys.argv[1:]
path="/root/CentralDark/logs/self-evolution-binding.json"
with open(path,"w") as f:
    json.dump({"schema":"centraldark.self-evolution-binding.v1","observed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"model":model,"model_spec":"openai/"+model,"base_url":base,"pid":int(pid),"rules":{"resolved_at_lote_start":True,"mid_lote_swap":False}},f,indent=2)
    f.write("\n")
os.chmod(path,0o600)
PY
cd "$DONOR_DIR"
exec .venv/bin/python -m evolution.skills.evolve_skill "${ARGS[@]}"
