import yaml

CONFIG_PATH = "E:/CentralDark/Pivete/config.yaml"

with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

print("=== Config fallback_providers ===")
print("raw value:", config.get("fallback_providers"))
print("type:", type(config.get("fallback_providers")))

fp = config.get("fallback_providers")
if isinstance(fp, str):
    print("\nNOTE: fallback_providers is a STRING, not a list. Re-parsing...")
    try:
        parsed = yaml.safe_load(fp)
        print("parsed:", parsed)
        print("parsed type:", type(parsed))
    except Exception as e:
        print("re-parse failed:", e)

print("\n=== Full model section ===")
print(config.get("model"))
