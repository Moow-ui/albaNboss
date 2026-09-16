const fs = require('fs');

const current = fs.readFileSync('index.html', 'utf8');
const lines = current.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('qna.json') || line.includes('loadQna') || line.includes('qna-list')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
