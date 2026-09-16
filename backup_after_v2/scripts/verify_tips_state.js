const fs = require('fs');
const path = require('path');

function loadJson(relPath) {
  const full = path.resolve(__dirname, '..', relPath);
  const raw = fs.readFileSync(full, 'utf8');
  const clean = raw.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*/g, '');
  return JSON.parse(clean);
}

try {
  const tips = loadJson('data/tips.json');
  console.log(`Successfully loaded data/tips.json. Total count: ${tips.length}`);
  tips.slice(0, 5).forEach((t, i) => {
    console.log(`[${i + 1}] [${t.category}] ${t.title}`);
    console.log(`    Law: ${t.law || 'N/A'}`);
    console.log(`    Target: ${t.target}`);
    console.log(`    Author: ${t.author}`);
    console.log(`    Date: ${t.date}`);
    console.log(`    Summary: ${t.summary.slice(0, 80)}...`);
  });
} catch (err) {
  console.error("Failed to parse tips.json:", err.message);
}
