const fs = require('fs');

const current = fs.readFileSync('index.html', 'utf8');
const lines = current.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('loadTips') || line.includes('renderTips') || line.includes('tips-list')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
