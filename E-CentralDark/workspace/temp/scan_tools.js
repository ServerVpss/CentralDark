const fs = require('fs');
const readline = require('readline');

const files = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean);

const bashCounts = {};
const mcpCounts = {};

function splitSegments(cmd) {
  // split on newlines, &&, ||, ;, | — each becomes its own command invocation
  return cmd.split(/\n|&&|\|\||[;|]/).map(s => s.trim()).filter(Boolean);
}

function firstTokens(seg) {
  let c = seg.trim();
  c = c.replace(/^(?:[A-Z_][A-Z0-9_]*=\S+\s+)+/, '');
  c = c.replace(/^(sudo|timeout\s+\S+|command|nohup)\s+/, '');
  return c.split(/\s+/).filter(Boolean);
}

async function processFile(f) {
  return new Promise((resolve) => {
    if (!fs.existsSync(f)) return resolve();
    const rl = readline.createInterface({ input: fs.createReadStream(f, 'utf8') });
    rl.on('line', (line) => {
      if (!line.trim()) return;
      let obj;
      try { obj = JSON.parse(line); } catch { return; }
      if (obj.type !== 'assistant') return;
      const content = obj.message && obj.message.content;
      if (!Array.isArray(content)) return;
      for (const item of content) {
        if (item.type !== 'tool_use') continue;
        if (item.name === 'Bash') {
          const cmd = (item.input && item.input.command) || '';
          for (const seg of splitSegments(cmd)) {
            const parts = firstTokens(seg);
            if (!parts.length) continue;
            if (parts[0] === 'cd') continue; // navigation noise
            let key = parts[0];
            if (parts.length > 1 && !parts[1].startsWith('-')) key = parts[0] + ' ' + parts[1];
            else if (parts.length > 1) key = parts[0];
            bashCounts[key] = bashCounts[key] || { count: 0, example: seg };
            bashCounts[key].count++;
          }
        } else if (item.name && item.name.startsWith('mcp__')) {
          mcpCounts[item.name] = (mcpCounts[item.name] || 0) + 1;
        }
      }
    });
    rl.on('close', resolve);
  });
}

(async () => {
  for (const f of files) await processFile(f);
  const bashSorted = Object.entries(bashCounts).sort((a, b) => b[1].count - a[1].count);
  const mcpSorted = Object.entries(mcpCounts).sort((a, b) => b[1] - a[1]);
  console.log('=== BASH ===');
  for (const [k, v] of bashSorted) console.log(`${v.count}\t${k}\t| ${v.example.slice(0, 90)}`);
  console.log('\n=== MCP ===');
  for (const [k, v] of mcpSorted) console.log(`${v}\t${k}`);
})();
