import sys, yaml

CFG = r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml"
ok = True
try:
    with open(CFG, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    print("YAML_VALID=TRUE")
except Exception as e:
    print("YAML_VALID=FALSE ::", repr(e)); sys.exit(1)

vis = data.get("auxiliary", {}).get("vision", {})
prov = vis.get("provider")
model = vis.get("model")
chain = vis.get("fallback_chain", [])
print("PRIMARY_PROVIDER=", prov)
print("PRIMARY_MODEL=", model)
print("CHAIN_COUNT=", len(chain))
for i, c in enumerate(chain):
    print(f"FALLBACK_{i}=", c.get("provider"), "/", c.get("model"))

if prov != "nous": ok = False; print("ASSERT_FAIL provider")
if model != "google/gemini-3.5-flash": ok = False; print("ASSERT_FAIL model")
models = [c.get("model") for c in chain]
if "x-ai/grok-4.5" not in models: ok = False; print("ASSERT_FAIL grok-4.5 missing")
if "openai/gpt-5.5" not in models: ok = False; print("ASSERT_FAIL gpt-5.5 missing")

print("ALL_ASSERTS_PASS=", ok)
sys.exit(0 if ok else 2)
