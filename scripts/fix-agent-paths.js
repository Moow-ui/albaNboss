// scripts/fix-agent-paths.js
// .agent 및 .agents 내의 file:///c:/Users/... 절대 경로를 저장소 기준 상대 경로(data/...)로 변환

const fs = require('fs');
const path = require('path');

const targetDirs = ['.agent', '.agents'];

function processDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // 정규식: file:///c:/Users/[^)]+/main/(data/[^)]+) -> $1
      const regex = /file:\/\/\/c:\/Users\/[^)]+\/main\/(data\/[^)]+)/g;
      if (regex.test(content)) {
        const updated = content.replace(regex, '$1');
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`[수정 완료] ${fullPath}`);
      }
    }
  }
}

targetDirs.forEach(d => {
  if (fs.existsSync(d)) {
    processDir(d);
  }
});

console.log('경로 정리 완료.');
