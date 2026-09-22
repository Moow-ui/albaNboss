---
description: 알바 꿀팁 및 매장 운영·노무 유튜브 영상 선별 및 videos.json 갱신
---

# 추천 영상 갱신 워크플로 (update-videos)

알바생의 첫 근무 꿀팁과 사장님의 실무 매장 운영·노무·세무 가이드를 다룬 신뢰성 있는 유튜브 개별 영상을 선별하여 [`data/videos.json`](data/videos.json)에 추가합니다.

---

### 1단계: 영상 탐색
유튜브의 전문 노무사, 세무사 채널 또는 검증된 매장 운영/알바 전문 크리에이터의 개별 영상을 검색합니다:
- **개별 영상 링크 필수**: `https://www.youtube.com/watch?v=VIDEO_ID` 또는 `https://youtu.be/VIDEO_ID` 형태여야 하며 채널 홈 링크는 금지됩니다.

### 2단계: 선별 및 oEmbed 유효성 검증
- **주제**: 알바 첫날 꿀팁, 근로계약서 및 주휴수당 분쟁 해결, 5인 미만 노무 관리, 종합소득세/원천세 신고 실무 등
- **최신성**: 최근 6개월 이내 업로드된 영상
- **유효성 검증**: 유튜브 oEmbed API(`https://www.youtube.com/oembed?url=...&format=json`)를 통해 영상이 비공개/삭제 상태가 아니며 정상 재생 가능한지 10초 이내 검증합니다.
- **수량 제한**: 1회 최대 3개까지 선별하며, 기존 `data/videos.json`과 중복을 제외합니다.

### 3단계: data/videos.json 갱신
- 스키마 준수: `id`, `title`, `channel`, `url`, `thumbnail`, `date`, `desc`
- 배열의 맨 앞(`unshift`)에 추가합니다.

### 4단계: 갱신 결과 보고
작업 결과를 아래 표 형식으로 보고합니다:

| 제목 | 채널명 | 링크 | oEmbed 확인 결과 |
| :--- | :--- | :--- | :--- |
| [영상 제목] | 채널명 | https://www.youtube.com/watch?v=... | oEmbed 200 OK (정상) |
