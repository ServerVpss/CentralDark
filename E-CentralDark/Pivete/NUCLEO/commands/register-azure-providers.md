# COMANDO - register-azure-providers.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\components\cluster-azure\terraform\prerequisites\register-azure-providers.sh
**SHA:** d7a045b19129cbf9
**Timestamp:** 2026-08-26T18:40:12.801550
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- elapsed_time_start=$(date +%s)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROVIDERS_FILE="${SCRIPT_DIR}/robotics-azure-resource-providers.txt"

usage () {

  echo ""
  echo "  Register Azure resource providers"
  echo "  ------------------------------------------------------------"
  echo ""
  echo "  USAGE: ./register-azure-providers.sh"
  echo ""
  echo "    Registers Azure resource providers defined in:"
  echo "    ${PROVIDERS_FILE}"
  echo ""
  echo "  USAGE: ./register-azure-providers.sh --help"
  echo ""
  echo "    Prints this help."
  echo ""
}

# Calculate the length of a string
str_len () {
  str=$1

  echo ${#str}
}

# Trim leading and trailing whitespace from a string.
trim_whitespace() {
    str=$1

    # remove leading whitespace characters
    str="${str#"${str%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    str="${str%"${str##*[![:space:]]}"}"

    echo "$str"
}

# Prints the provider name followed by a number of dots to the terminal screen. The
# \033[0K CSI sequence clears any prior content at the location and then prints the
# provider name and dots. This is to allow for in-place refreshes of the registration
# state on the terminal screen.
#
# https://en.wikipedia.org/wiki/ANSI_escape_code#Control_Sequence_Introducer_commands
# \033[nK - Erases part of the line. If n is 0 (or missing), clear from cursor to the end
# of the line. If n is 1, clear from cursor to beginning of the line. If n is 2, clear entire
# line. Cursor position does not change.
print_provider_name () {
  provider=$1

  provider_name_len=$(str_len "$provider")
  dot_len=$((max_len_provider_name-provider_name_len+5))
  echo -ne "\033[0K$provider "
  printf '.%.0s' $(seq 1 $dot_len)
  echo -n " "
}

# Print the provider state "NotRegistered" with white text on dark red background
# to the terminal screen.
#
# https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
# \033[38;5;15m - foreground color - white
# \033[48;5;1m - background color - dark red
# \033[m - reset to normal
print_not_registered_state () {
  echo -e "\033[38;5;15m\033[48;5;1m NotRegistered \033[m"
}

# Print the provider state "Registered" with black text on dark green background
# to the terminal screen.
#
# https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
# \033[38;5;0m - foreground color - black
# \033[48;5;2m - background color - dark green
# \033[m - reset to normal
print_registered_state () {
  echo -e "\033[38;5;0m\033[48;5;2m Registered \033[m"
}

# Print the provided provider state with white text on dark grey background
# to the terminal screen.
#
# https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
# \033[38;5;15m - foreground color - white
# \033[48;5;243m - background color - dark grey
# \033[m - reset to normal
# https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
print_state () {
  state=$1
  echo -e "\033[38;5;15m\033[48;5;243m $state \033[m"
}

# Moves the cursor up n lines to the first line of provider names and states. This allows
# the script to overwrite the provider name and state so that the terminal screen appears
# to refresh the state values in-place.
#
# https://en.wikipedia.org/wiki/ANSI_escape_code#Control_Sequence_Introducer_commands
# \033[nF	- Moves cursor to beginning of the line n (default 1) lines up.
move_cursor_to_first_line () {
  number_of_lines=$1
  echo -ne "\033[${number_of_lines}F"
}

# Function to check if Azure CLI is installed
# This function verifies if the Azure CLI is installed.
# If the Azure CLI is installed, it outputs the path to the executable.
# If the Azure CLI is not installed, it prompts the user to install it and exits with a status code of 1.
test_cli_install() {
    # Check if Azure CLI is installed
    if command -v az &> /dev/null; then
        az_cli_path=$(command -v az)
        echo "Azure CLI is installed. Path: $az_cli_path"
    else
        echo "Azure CLI is not installed. Please install Azure CLI at https://aka.ms/azurecli."
        exit 1
    fi
}

test_cli_install

# Check input parameters for correct usage
if [ $# -gt 0 ]; then
  if [ "$1" == "--help" ]; then
    usage
    exit 0
  else
    echo "Error: This script does not accept arguments."
    usage
    exit 1
  fi
fi

if [[ ! -f "${PROVIDERS_FILE}" ]]; then
  echo -e "\033[38;5;15m\033[48;5;1m Providers file does not exist: ${PROVIDERS_FILE} \033[m"
  exit 1
fi

delay_in_seconds=5
max_len_provider_name=0
elapsed_time_start=$(date +%s)

# Read azure resource providers from text file into associative array
# with state of NotRegistered
declare -A providers
while IFS= read -r line || [[ "$line" ]]; do
  line=$(trim_whitespace "$line") # required to cater for LF and CRLF line endings
  providers[$line]="NotRegistered"
  provider_name_len=$(str_len "$line")
  if [ "$provider_name_len" -gt "$max_len_provider_name" ]; then
    max_len_provider_name=$provider_name_len
 
```