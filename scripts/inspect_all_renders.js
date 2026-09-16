const fs = require('fs');

const current = fs.readFileSync('index.html', 'utf8');

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

['renderPolicy', 'renderQna', 'renderBoard', 'renderNews', 'renderTips', 'renderVideos'].forEach(fn => {
  console.log(`=== Current ${fn} ===`);
  console.log(extractFunction(current, fn));
});
