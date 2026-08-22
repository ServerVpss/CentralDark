const fs = require('fs');
const path = require('path');

const ADMIN_PATH = path.join(process.cwd(), 'docs/CONSCIENCIA/ADMINISTRAVEIS.json');
console.log('Checking ADMINISTRAVEIS.json at:', ADMIN_PATH);
console.log('File exists:', fs.existsSync(ADMIN_PATH));

if (fs.existsSync(ADMIN_PATH)) {
  const content = fs.readFileSync(ADMIN_PATH, 'utf8');
  console.log('File size:', content.length, 'bytes');
  try {
    const json = JSON.parse(content);
    console.log('Successfully parsed JSON');
    console.log('Top-level keys:', Object.keys(json));
    console.log('Has items?', !!json.items);
    if (json.items) {
      console.log('Items is array:', Array.isArray(json.items));
      console.log('Number of items:', json.items.length);
      if (json.items.length > 0) {
        console.log('First item:', JSON.stringify(json.items[0], null, 2));
        console.log('First item has command?', !!json.items[0].command);
        console.log('First item command:', json.items[0].command);
        console.log('First item administrable:', json.items[0].administrable);
      }
    } else {
      console.log('No items property found');
    }
  } catch (e) {
    console.log('Error parsing JSON:', e.message);
  }
} else {
  console.log('File does not exist');
}