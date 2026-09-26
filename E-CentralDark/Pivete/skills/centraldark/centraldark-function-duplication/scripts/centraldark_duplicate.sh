#!/usr/bin/env bash
# centraldark_duplicate.sh
# Read profiles from ZENDRIVER_PROFILE_PATH or CENTRALDARK_ZENDRIVE_PROFILES_JSON
# Run centraldark command for each profile

if [[ -n "$ZENDRIVER_PROFILE_PATH" ]]; then
  CONFIG_FILE="$ZENDRIVER_PROFILE_PATH"
elif [[ -n "$CENTRALDARK_ZENDRIVE_PROFILES_JSON" ]]; then
  CONFIG_FILE="$CENTRALDARK_ZENDRIVE_PROFILES_JSON"
else
  echo "Error: No Zendrive profile configuration set. Use ZENDRIVER_PROFILE_PATH or CENTRALDARK_ZENDRIVE_PROFILES_JSON."
  exit 1
fi

if ! [[ -f "$CONFIG_FILE" ]]; then
  echo "Config file $CONFIG_FILE not found."
  exit 1
fi

# Ensure jq is installed
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found. Please install jq to parse JSON."
  exit 1
fi

# Iterate over profiles
jq -c '.profiles[]' "$CONFIG_FILE" | while read -r profile; do
  name=$(echo "$profile" | jq -r '.name')
  endpoint=$(echo "$profile" | jq -r '.endpoint')
  token_path=$(echo "$profile" | jq -r '.token_path')
  echo "Processing profile '$name' at '$endpoint'"
  # Example call - replace with real centraldark usage
  # centraldark --profile "$endpoint" --token-file "$token_path"
  echo "(Placeholder) running centraldark for $name"
  # Insert real invocation here

done

echo "All profiles processed."
