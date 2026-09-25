---
name: weekly-update
description: 매주 1회 법적 기준치, 정책소식, 뉴스, 팁, Q&A, 영상 종합 갱신 및 전체 링크 무결성 자동 검사
disable-model-invocation: true
---

`.agents/workflows/weekly-update.md`을 읽고 그 순서를 그대로 수행한다. 이 저장소 CLAUDE.md 규칙을 함께 지킨다.

차이 메모 (안티그래비티 → Claude Code)
- 7단계의 `// turbo`(자동 실행 표시)는 Claude Code에 없다. `node scripts/check-links.js`는 .claude/settings.json 허용 목록에 있어 묻지 않고 실행된다.
- 1~6단계의 `/check-standards` 등은 대표만 부르는 명령어이므로, 같은 이름의 `.agents/workflows/<이름>.md`를 직접 읽고 수행한다.
- 출처·링크 확인은 Claude Code의 웹 검색·웹 페이지 읽기 도구와 scripts/ 안 확인 스크립트로 한다.
