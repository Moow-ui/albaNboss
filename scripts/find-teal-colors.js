// scripts/find-teal-colors.js
const fs = require('fs');

const content = fs.readFileSync('wage/index.html', 'utf8');
const lines = content.split('\n');

const tealKeywords = ['#0f766e', '#115e59', '#134e4a', '#0d9488', '#f0fdfa', '#ccfbf1', '#99f6e4', '#2dd4bf', '15, 118, 110', '15,118,110', 'teal'];

console.log('=== wage/index.html 내 초록/틸 색상 발견 위치 ===');
lines.forEach((line, idx) => {
  const match = tealKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()));
  if (match) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
