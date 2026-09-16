const https = require('https');
const http = require('http');
const { URL } = require('url');

function fetchRss(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const client = u.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  const feeds = [
    { source: '연합뉴스 경제', url: 'https://www.yna.co.kr/rss/economy.xml' },
    { source: '연합뉴스 사회', url: 'https://www.yna.co.kr/rss/society.xml' },
    { source: '매일경제 경제', url: 'https://www.mk.co.kr/rss/30100041/' },
    { source: '매일경제 사회', url: 'https://www.mk.co.kr/rss/50400012/' },
    { source: '매일경제 기업·경영', url: 'https://www.mk.co.kr/rss/50100032/' },
    { source: '이데일리 전체', url: 'https://rss.edaily.co.kr/edaily_news.xml' },
    { source: '뉴시스 경제', url: 'https://www.newsis.com/RSS/economy.xml' },
    { source: '뉴시스 사회', url: 'https://www.newsis.com/RSS/society.xml' },
    { source: '조선비즈', url: 'https://biz.chosun.com/site/data/rss/rss.xml' }
  ];


  const keywords = ['최저임금', '소상공인', '자영업', '알바', '근로', '임금', '청년', '고용', '노동', '외식', '배달', '생활임금', '일자리', '인건비', '수당'];

  const matched = [];

  for (const feed of feeds) {
    try {
      const xml = await fetchRss(feed.url);
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemBlock = match[1];
        const title = (itemBlock.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || itemBlock.match(/<title>(.*?)<\/title>/i) || [])[1] || '';
        const link = (itemBlock.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i) || itemBlock.match(/<link>(.*?)<\/link>/i) || [])[1] || '';
        const pubDate = (itemBlock.match(/<pubDate><!\[CDATA\[(.*?)\]\]><\/pubDate>/i) || itemBlock.match(/<pubDate>(.*?)<\/pubDate>/i) || [])[1] || '';
        const desc = (itemBlock.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || itemBlock.match(/<description>(.*?)<\/description>/i) || [])[1] || '';

        const fullText = (title + ' ' + desc);
        const hit = keywords.filter(k => fullText.includes(k));
        if (hit.length > 0) {
          matched.push({
            source: feed.source,
            hit,
            title: title.trim(),
            link: link.trim(),
            pubDate: pubDate.trim(),
            desc: desc.replace(/<[^>]*>/g, '').trim().substring(0, 150)
          });
        }
      }
    } catch (err) {
      // feed error
    }
  }

  const ynaMatched = matched.filter(m => m.source.includes('연합뉴스'));
  console.log(`Matched ${ynaMatched.length} YNA articles:`);
  ynaMatched.slice(0, 6).forEach((m, idx) => {
    console.log(`[${idx + 1}] ${m.title}`);
    console.log(`    Date: ${m.pubDate}`);
    console.log(`    Hits: ${m.hit.join(', ')}`);
    console.log(`    Link: ${m.link}`);
    console.log(`    Desc: ${m.desc.slice(0, 120)}...`);
  });
}

main();




