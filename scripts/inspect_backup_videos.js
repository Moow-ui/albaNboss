const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');
const lines = backup.split('\n');

for (let i = 2298; i < Math.min(lines.length, 2330); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
