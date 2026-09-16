---
description: 매주 1회 법적 기준치, 정책소식, 뉴스, 팁, Q&A, 영상 종합 갱신 및 전체 링크 무결성 자동 검사
---

# 종합 주간 콘텐츠 갱신 워크플로 (weekly-update)

ALBA & BOSS 포털의 모든 핵심 콘텐츠와 법적 기준치를 순서대로 점검 및 갱신하고, 최종적으로 전체 링크의 무결성을 검증합니다.

> **주의사항**: 사용자의 검토와 승인을 위해 1~6단계는 대화형으로 순차 진행되며, 7단계 링크 검사 스크립트만 자동 실행(`// turbo`)됩니다. 문제 항목이 감지될 경우 해당 항목을 즉시 제외/롤백합니다.

---

### 1단계: 법적 기준치 검증 (`/check-standards`)
- 노동법, 최저임금, 가산수당, 4대보험 요율 고시를 확인하고 [`data/standards.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/standards.json)을 최신화합니다.

### 2단계: 알바·노무 정책소식 갱신 (`/update-policy-news`)
- 고용노동부 및 공단 공식 보도자료/공지 중 최근 3개월 이내 자료를 최대 5개 선별하여 [`data/news.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/news.json) 상단에 추가합니다.

### 3단계: 최신 뉴스 갱신 (`/update-news`)
- 주요 언론사의 알바·소상공인·외식업 분야 최근 1주일 이내 개별 기사를 최대 5개 선별하여 [`data/articles.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/articles.json) 상단에 추가합니다.

### 4단계: 노무·세무 팁 갱신 (`/update-tips`)
- 5인 미만 사업장 및 알바생 실무 지침(결론 우선 3~4문장, 근거 법령, 저자 "ALBA&BOSS 편집부")을 최대 5개 제작하여 [`data/tips.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/tips.json)에 추가합니다.

### 5단계: 노무 Q&A 갱신 (`/update-labor-qa`)
- 빈출 노무 질문 및 조문 근거 답변, 계산기 링크(/payroll, /scheduler)를 포함하여 최대 5개 제작 후 [`data/qna.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/qna.json)에 추가합니다.

### 6단계: 추천 영상 갱신 (`/update-videos`)
- 유튜브 oEmbed 검증을 거친 최근 6개월 이내 실무/꿀팁 개별 영상을 최대 3개 선별하여 [`data/videos.json`](file:///c:/Users/s_kingm0209/OneDrive%20-%20konkuk.ac.kr/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/main/data/videos.json) 상단에 추가합니다.

### 7단계: 전체 링크 유효성 검사 (자동 실행)
- 모든 데이터 파일 및 내부 페이지 연결 상태를 10초 타임아웃과 oEmbed API로 종합 점검합니다.

// turbo
```powershell
node scripts/check-links.js
```

---

### 8단계: 종합 갱신 보고서 작성
모든 검증이 완료되면 아래 양식의 종합 주간 갱신 보고서를 작성하여 사용자에게 보고합니다:
- **기준치 상태**: 최저임금 및 4대보험 요율 최종 확인일자
- **신규 추가 항목 요약**: 카테고리별 건수 (정책소식 N건, 뉴스 N건, 팁 N건, Q&A N건, 영상 N건)
- **링크 점검 결과**: 전체 검사 수, 정상 수, 실패/이상 수 (이상 발견 시 즉시 제외 및 조치 내역 명시)
