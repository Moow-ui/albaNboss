const fs = require('fs');

const backup = fs.readFileSync('backup_before_v4/index.html', 'utf8');

function extractFunction(code, fnName) {
  const idx = code.indexOf(`function ${fnName}(`);
  if (idx === -1) return null;
  const start = code.indexOf('{', idx);
  let depth = 1;
  let end = start + 1;
  while (depth > 0 && end < code.length) {
    if (code[end] === '{') depth++;
    else if (code[end] === '}') depth--;
    end++;
  }
  return code.slice(idx, end);
}

const fns = ['loadPolicyNews', 'loadQnaAccordion', 'loadBoard', 'loadNews', 'loadTips', 'loadVideos'];
fns.forEach(fn => {
  console.log(`=== Backup ${fn} ===`);
  const full = extractFunction(backup, fn);
  // print first 50 lines
  if (full) {
    console.log(full.split('\n').slice(0, 45).join('\n'));
  } else {
    console.log('Not found');
  }
});
