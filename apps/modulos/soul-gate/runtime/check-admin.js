const fs = require('fs');
const path = require('path');

const ADMIN_PATH = path.join(process.cwd(), 'docs/CONSCIENCIA/ADMINISTRAVEIS.json');
console.log('ADMIN_PATH:', ADMIN_PATH);
console.log('Exists:', fs.existsSync(ADMIN_PATH));

if (fs.existsSync(ADMIN_PATH)) {
  const content = fs.readFileSync(ADMIN_PATH, 'utf8');
  console.log('Content length:', content.length);
  console.log('First 500 chars:', content.substring(0, 500));
  console.log('Last 500 chars:', content.substring(content.length - 500));
  
  try {
    const parsed = JSON.parse(content);
    console.log('Parsed successfully');
    console.log('Keys:', Object.keys(parsed));
    if (parsed.items) {
      console.log('Items length:', parsed.items.length);
      console.log('First item:', JSON.stringify(parsed.items[0], null, 2));
    } else {
      console.log('No items property');
    }
  } catch (e) {
    console.log('JSON parse error:', e.message);
    console.log('Error at position:', e.position);
  }
}