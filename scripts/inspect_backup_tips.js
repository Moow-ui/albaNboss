const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');
const lines = backup.split('\n');

for (let i = 2240; i < Math.min(lines.length, 2280); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
