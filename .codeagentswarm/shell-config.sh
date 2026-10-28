#!/bin/bash
# CodeAgentSwarm Shell Configuration
# This file is automatically sourced before command execution
# It optimizes the terminal behavior without modifying user's shell config

# Load nvm if available (for Node.js/Claude Code support)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null

# Detect if we're in a CodeAgentSwarm terminal
if [[ -n "$CODEAGENTSWARM_CURRENT_QUADRANT" ]]; then
    # For zsh: Disable job notifications to prevent [1] 12345 messages
    if [[ -n "$ZSH_VERSION" ]]; then
        unsetopt NOTIFY 2>/dev/null || true
        unsetopt MONITOR 2>/dev/null || true
        # Also ensure aliases are enabled
        setopt ALIASES 2>/dev/null || true
    fi

    # For bash: Disable job control notifications
    if [[ -n "$BASH_VERSION" ]]; then
        set +m 2>/dev/null || true
        # Ensure aliases are expanded
        shopt -s expand_aliases 2>/dev/null || true
    fi
fi

# Load any user's custom CodeAgentSwarm settings if they exist
if [[ -f "$HOME/.codeagentswarm/user-config.sh" ]]; then
    source "$HOME/.codeagentswarm/user-config.sh"
fi
