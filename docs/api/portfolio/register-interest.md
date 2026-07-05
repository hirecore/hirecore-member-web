# 포트폴리오 관심 등록 — 클라이언트 연동 가이드

포트폴리오에 **관심(찜)을 등록**하는 API 계약서다. 해제는 [cancel-interest.md](cancel-interest.md) 참고.

## 엔드포인트

```
POST /api/portfolios/{portfolioId}/interest
```

| 항목 | 값 |
|---|---|
| 인증 | **필수** (`accessToken` 쿠키) |
| 요청 바디 | **없음** (경로의 `portfolioId`와 인증 쿠키만 사용) |
| 성공 응답 | **`204 No Content`** (바디 없음) |

> `portfolioId`는 TSID이며 JSON/경로에서 **문자열**로 다룬다 (숫자 파싱 금지 — 정밀도 손실).
> 요청 시 쿠키를 포함한다: `fetch(url, { method: "POST", credentials: "include" })`.

## 언제 호출하나 — 관심 상태로 분기

관심 상태 `isInterested`는 **조회 응답이 내려준다**. 목록(`GET /api/portfolios/summaries/public`)과 상세(`GET /api/portfolios/{portfolioId}`)의 각 항목 최상위에 있다. 값은 3-상태다.

| `isInterested` | 의미 | 이 등록 API 호출? |
|---|---|---|
| `false` | 로그인 · 비소유자 · 아직 관심 안 함 | **예 → POST** |
| `true` | 이미 관심 등록함 | 아니오 (해제 대상) |
| `null` | 비로그인 또는 본인 글(`isOwner=true`) | 아니오 (버튼 숨김/비활성) |

> JSON 직렬화상 **`null` 필드는 응답에서 생략**된다. `isInterested` 키가 없으면 `null`로 간주.

## 성공 처리

- `204`를 받으면 로컬 상태를 `isInterested = true`로, `interestCount`를 **+1** 낙관적 갱신.
- **멱등**: 이미 관심 등록된 상태에서 또 호출해도 `204`(중복 집계 없음). 재시도해도 안전.

## 실패 응답

| HTTP | errorCode | 상황 |
|---|---|---|
| `401` | (인증 오류) | 미로그인 상태로 호출 |
| `403` | `INTEREST_OWNER_NOT_ALLOWED` | 본인 글에 관심 등록 시도 |
| `403` | `INTEREST_PORTFOLIO_FORBIDDEN` | 비공개(PRIVATE) 포트폴리오에 관심 등록 시도 |
| `404` | `INTEREST_PORTFOLIO_NOT_FOUND` | 존재하지 않는 `portfolioId` |

**에러 응답 바디(공통 형식)**

```json
{
  "timestamp": "2026-07-05T12:00:00.000Z",
  "trackingId": "…",
  "errorCode": "INTEREST_PORTFOLIO_FORBIDDEN",
  "message": "비공개 포트폴리오에는 관심을 등록할 수 없습니다.",
  "path": "/api/portfolios/5234567890123456789/interest",
  "attributes": {}
}
```

- `message`는 사용자 안내용 문구다. `403/404`는 이 문구로 안내하고, `401`은 로그인 유도.
