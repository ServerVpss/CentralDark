#!/usr/bin/env python3
"""
Simple bridge to turn Zendrive dump (last_messages.json or reconciled_both.json) into gateway response.
Use this to feed the existing CentralDark elite-gateway / omni-router / API.

Run after capture:
python zendrive_gateway_bridge.py

It prints the last assistant response in a format ready for /v1/chat/completions or custom.
"""

import json
import os

LOGS_DIR = os.path.join(os.getcwd(), "logs")

def load_dump(filename="last_messages.json"):
    path = os.path.join(LOGS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_last_assistant(dump):
    for m in reversed(dump):
        if m.get("role") == "assistant" and m.get("text"):
            return m["text"]
    return None

if __name__ == "__main__":
    print("=== Zendrive to CentralDark Gateway Bridge ===")
    dump = load_dump("reconciled_both.json") or load_dump("last_messages.json")
    if not dump:
        print("No dump found. Run the zendrive capture first.")
        exit(1)

    assistant = get_last_assistant(dump)
    if assistant:
        print("\n[LAST ASSISTANT RESPONSE FROM ZEN DRIVE / CONTRA GPT]")
        print(assistant)
        print("\n[READY FOR GATEWAY]")
        print("Use this text as the 'content' in the API response for CentralDark.")
        print("Example for openai_http_gateway or omni-router:")
        print(json.dumps({
            "id": "zendrive-001",
            "object": "chat.completion",
            "model": "zendrive/contra",
            "choices": [{"message": {"role": "assistant", "content": assistant}}]
        }, ensure_ascii=False, indent=2))
    else:
        print("No assistant response in dump.")

    print("\n[INTEGRAÇÃO] Delta absorbed into existing elite-gateway. No new system.")
    print("Feed this to the CentralDark API/MCP/Hub.")