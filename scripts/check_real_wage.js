const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');
const lines = backup.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('실급여')) {
    console.log(`Backup Line ${idx+1}: ${line.trim()}`);
  }
});
