const fs = require('fs');

const current = fs.readFileSync('index.html', 'utf8');
const lines = current.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('videos.json') || line.includes('loadVideos') || line.includes('video-list')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
