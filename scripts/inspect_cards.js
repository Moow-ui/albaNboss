const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('index.html', 'utf8');

console.log('--- Checking Bulb and Play in index.html ---');
const bulbMatches = content.match(/.{0,30}💡.{0,30}/g);
console.log('💡 matches:', bulbMatches);

const playMatches = content.match(/.{0,30}▶.{0,30}/g);
console.log('▶ matches:', playMatches);

// Check what verify_v4 evaluated
const tipsHasBulb = content.includes('💡 ${escapeHtml(item.title)}');
const videoHasPlay = content.includes('▶ ${escapeHtml(item.title)}');
console.log('tipsHasBulb:', tipsHasBulb);
console.log('videoHasPlay:', videoHasPlay);

// Search for video rendering logic
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('item.title') || line.includes('escapeHtml(item.title)')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
