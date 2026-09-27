from flask import Flask, request, jsonify
import uuid

app = Flask(__name__)
onboardings = {}

@app.post("/onboarding/start")
def start():
    oid = str(uuid.uuid4())
    onboardings[oid] = {"status": "started"}
    return jsonify({"onboarding_id": oid})

@app.post("/onboarding/<oid>/<step>")
def update_step(oid, step):
    if oid not in onboardings:
        return jsonify({"error": "onboarding_not_found"}), 404
    allowed = {"chip","plan","number","address","person","email","payment"}
    if step not in allowed:
        return jsonify({"error": "unknown_step"}), 404
    onboardings[oid][step] = request.get_json(silent=True) or {}
    return jsonify({"ok": True, "step": step})

@app.post("/onboarding/<oid>/confirm")
def confirm(oid):
    if oid not in onboardings:
        return jsonify({"error": "onboarding_not_found"}), 404
    onboardings[oid]["status"] = "completed"
    return jsonify({"success": True, "onboarding": onboardings[oid]})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=False, use_reloader=False)
