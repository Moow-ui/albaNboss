// og-image.svg를 그대로 렌더링해 og-image.png(1200x630)로 다시 저장한다.
// W40-02: 이미지 속 옛 주소(albanboss.moow-ui.workers.dev) 교체 후 PNG 동기화.
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const repoRoot = path.join(__dirname, '..', '..');
const svgPath = path.join(repoRoot, 'assets', 'images', 'og-image.svg');
const pngPath = path.join(repoRoot, 'assets', 'images', 'og-image.png');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + svgPath);
  await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log('저장:', pngPath);
})();
