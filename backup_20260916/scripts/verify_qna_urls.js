const { checkUrl } = require('./verify_links');

const urls = [
  'https://www.law.go.kr/법령/근로기준법',
  'https://www.law.go.kr/법령/최저임금법',
  'https://www.law.go.kr/법령/근로자퇴직급여보장법',
  'https://www.law.go.kr/법령/산업재해보상보험법',
  'https://www.law.go.kr/법령/국민연금법'
];

async function main() {
  for (const u of urls) {
    const res = await checkUrl(encodeURI(u));
    console.log(`[${res.ok ? 'OK' : 'FAIL'}] ${res.statusCode} | ${u} (Title: ${res.title})`);
  }
}

main();
