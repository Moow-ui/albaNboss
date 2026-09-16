const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. New renderTips
const newRenderTips = `      function renderTips(items) {
        const displayItems = items.slice(0, 4);
        listContainer.innerHTML = displayItems.map(item => {
          const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.slice(0, 2) : (item.category ? [item.category] : []);
          const tagsHtml = tags.map(t => \`<span class="tag-chip">#\${escapeHtml(t)}</span>\`).join('');
          return \`
            <li class="module-card-item">
              <a href="tips.html" target="_blank" rel="noopener noreferrer" class="module-item-title-link" title="\${escapeHtml(item.title)} 팁 전체보기">
                \${escapeHtml(item.title)} <span class="external-link-arrow">↗</span>
              </a>
              <p class="module-item-desc">\${escapeHtml(item.summary)}</p>
              <div class="module-item-meta">
                <div class="meta-left">
                  <span>✍️ \${escapeHtml(item.author || 'ALBA&BOSS 편집부')} · \${escapeHtml(item.date)}</span>
                </div>
                \${tagsHtml ? \`<div class="meta-right-tags">\${tagsHtml}</div>\` : ''}
              </div>
            </li>
          \`;
        }).join('');
      }`;

// 2. New renderVideos
const newRenderVideos = `      function renderVideos(items) {
        const displayItems = items.slice(0, 4);
        listContainer.innerHTML = displayItems.map(item => {
          const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.slice(0, 2) : (item.badge ? [item.badge] : []);
          const tagsHtml = tags.map(t => \`<span class="tag-chip" style="color:#b91c1c; background-color:#fef2f2;">#\${escapeHtml(t)}</span>\`).join('');
          return \`
            <li class="module-card-item">
              <a href="\${item.url ? encodeURI(item.url) : 'https://www.youtube.com'}" target="_blank" rel="noopener noreferrer" class="module-item-title-link" title="\${escapeHtml(item.title)} 영상 시청 (새 창)">
                ▶ \${escapeHtml(item.title)} <span class="external-link-arrow">↗</span>
              </a>
              <p class="module-item-desc">\${escapeHtml(item.summary)}</p>
              <div class="module-item-meta">
                <div class="meta-left">
                  <span>📺 \${escapeHtml(item.channel)} (\${escapeHtml(item.duration)})</span>
                </div>
                \${tagsHtml ? \`<div class="meta-right-tags">\${tagsHtml}</div>\` : ''}
              </div>
            </li>
          \`;
        }).join('');
      }`;

// Find existing renderTips and renderVideos in content
const oldTipsStart = content.indexOf('function renderTips(items) {');
const oldTipsEnd = content.indexOf('function getFallbackTipsData() {');

if (oldTipsStart === -1 || oldTipsEnd === -1) {
  console.error('Could not find renderTips block');
  process.exit(1);
}

const beforeTips = content.slice(0, oldTipsStart);
const afterTips = content.slice(oldTipsEnd);

content = beforeTips + newRenderTips + '\n\n      ' + afterTips;

const oldVideosStart = content.indexOf('function renderVideos(items) {');
const oldVideosEnd = content.indexOf('function getFallbackVideosData() {');

if (oldVideosStart === -1 || oldVideosEnd === -1) {
  console.error('Could not find renderVideos block');
  process.exit(1);
}

const beforeVideos = content.slice(0, oldVideosStart);
const afterVideos = content.slice(oldVideosEnd);

content = beforeVideos + newRenderVideos + '\n\n      ' + afterVideos;

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully updated renderTips and renderVideos in index.html');
