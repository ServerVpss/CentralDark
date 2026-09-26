const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'scripts/post-deploy.sh');
let content = fs.readFileSync(file, 'utf-8');

// Replace the naive check with a checksum/diff check or just overwrite
const oldPullCheck = `if [ -f "$NEW_PULL" ] && [ -f "$PULL_SCRIPT" ]; then
  if ! grep -q "post-deploy" "$PULL_SCRIPT" 2>/dev/null; then
    cp "$PULL_SCRIPT" "\${PULL_SCRIPT}.backup" 2>/dev/null
    cp "$NEW_PULL" "$PULL_SCRIPT"
    chmod +x "$PULL_SCRIPT"
    log "✅ Pull script atualizado"
  fi
fi`;

const newPullCheck = `if [ -f "$NEW_PULL" ] && [ -f "$PULL_SCRIPT" ]; then
  if ! cmp -s "$NEW_PULL" "$PULL_SCRIPT"; then
    cp "$PULL_SCRIPT" "\${PULL_SCRIPT}.backup" 2>/dev/null
    cp "$NEW_PULL" "$PULL_SCRIPT"
    chmod +x "$PULL_SCRIPT"
    log "✅ Pull script atualizado e sincronizado"
  fi
fi`;

if(content.includes(oldPullCheck)) {
    content = content.replace(oldPullCheck, newPullCheck);
    fs.writeFileSync(file, content, 'utf-8');
    console.log("post-deploy.sh updated.");
} else {
    console.log("Could not find the target string.");
}
