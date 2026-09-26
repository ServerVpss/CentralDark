const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('onClick={handleAdd}', 'onClick={handleAddInstance}');

fs.writeFileSync(file, content, 'utf8');
