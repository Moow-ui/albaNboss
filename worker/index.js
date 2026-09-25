// 포털 주소 정리 Worker — 대표 주소(https://albanboss.com)가 아닌 주소로 들어온 요청을
// 같은 경로·같은 ?값 그대로 대표 주소로 영구 이동(301)시키고, 나머지는 정적 파일을 그대로 보여 준다.
// 대상: 옛 주소 albanboss.moow-ui.workers.dev, www.albanboss.com, http:// 접속
// 대표 주소를 바꾸면 data/site.json의 site_url도 함께 바꾼다.
// /assets/*, /data/* 는 wrangler.jsonc 설정에 따라 이 코드를 거치지 않고 바로 제공된다.

const CANONICAL_ORIGIN = 'https://albanboss.com';
const LOCAL_HOSTS = ['localhost', '127.0.0.1']; // 내 컴퓨터에서 미리 볼 때는 이동하지 않음

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.origin !== CANONICAL_ORIGIN && !LOCAL_HOSTS.includes(url.hostname)) {
      return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  }
};
