const fs = require('fs');
const path = require('path');
const ADMIN_PATH = path.join(__dirname, '../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json');
console.log('File exists:', fs.existsSync(ADMIN_PATH));
if (fs.existsSync(ADMIN_PATH)) {
  const content = fs.readFileSync(ADMIN_PATH, 'utf8');
  console.log('Content length:', content.length);
  console.log('First 200 chars:', content.substring(0, 200));
  try {
    const parsed = JSON.parse(content);
    console.log('Parsed type:', typeof parsed);
    console.log('Parsed keys:', Object.keys(parsed));
    if (parsed.items) {
      console.log('Items length:', parsed.items.length);
      console.log('First item command:', parsed.items[0]?.command);
      console.log('First item administrable:', parsed.items[0]?.administrable);
    }
  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
}