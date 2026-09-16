const fs = require('fs');

const current = fs.readFileSync('index.html', 'utf8');
const lines = current.split('\n');

for (let i = 2405; i < Math.min(lines.length, 2445); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
