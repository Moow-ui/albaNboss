const { checkUrl } = require('./verify_links');

const candidates = [
  {
    title: "연봉은 '회사 내규', 깜깜이 채용공고 개선…정상화 과제 논의",
    source: "연합뉴스",
    date: "2026-09-16",
    url: "https://www.yna.co.kr/view/AKR20260916135200530",
    tags: ["채용공고", "임금공개", "청년구직"]
  },
  {
    title: "배민-가맹점주들 '부당 수수료' 소송 첫 재판…쿠폰 할인 공방",
    source: "연합뉴스",
    date: "2026-09-16",
    url: "https://www.yna.co.kr/view/AKR20260916126000004",
    tags: ["배달앱", "소상공인", "외식업"]
  },
  {
    title: "김치찌개 백반도 9천원 시대…주요 외식 메뉴 물가 '고공행진'",
    source: "연합뉴스",
    date: "2026-09-16",
    url: "https://www.yna.co.kr/view/AKR20260916151000030",
    tags: ["외식물가", "소상공인", "자영업"]
  },
  {
    title: "장사하느라 바쁘실텐데 은행 오지 마세요…국민은행, 앱으로 보증 대출",
    source: "매일경제",
    date: "2026-09-15",
    url: "https://www.mk.co.kr/news/economy/12152894",
    tags: ["자영업지원", "소상공인", "금융지원"]
  },
  {
    title: "노동감독권 지자체 위임…“美·日 실패 밟지 말아야”",
    source: "매일경제",
    date: "2026-09-16",
    url: "https://www.mk.co.kr/news/economy/12154395",
    tags: ["근로감독", "노동법", "사업장"]
  }
];

async function verifyAll() {
  console.log("Verifying 5 candidate news articles...\n");
  for (const item of candidates) {
    const res = await checkUrl(item.url);
    console.log(`[${res.ok ? 'SUCCESS' : 'FAILED'}] Status: ${res.statusCode} | ${item.source}`);
    console.log(`  Title: ${item.title}`);
    console.log(`  Fetched Title: ${res.title}`);
    console.log(`  URL: ${item.url}`);
    if (!res.ok) console.log(`  Error: ${res.error}`);
    console.log('---');
  }
}

verifyAll();
