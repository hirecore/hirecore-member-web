# 포트폴리오 관심 해제 — 클라이언트 연동 가이드

포트폴리오에 등록한 **관심(찜)을 해제**하는 API 계약서다. 등록은 [register-interest.md](register-interest.md) 참고.

## 엔드포인트

```
DELETE /api/portfolios/{portfolioId}/interest
```

| 항목 | 값 |
|---|---|
| 인증 | **필수** (`accessToken` 쿠키) |
| 요청 바디 | **없음** (경로의 `portfolioId`와 인증 쿠키만 사용) |
| 성공 응답 | **`204 No Content`** (바디 없음) |

> `portfolioId`는 TSID이며 JSON/경로에서 **문자열**로 다룬다 (숫자 파싱 금지 — 정밀도 손실).
> 요청 시 쿠키를 포함한다: `fetch(url, { method: "DELETE", credentials: "include" })`.

## 언제 호출하나 — 관심 상태로 분기

관심 상태 `isInterested`는 조회 응답(`GET /api/portfolios/summaries/public`, `GET /api/portfolios/{portfolioId}`)의 각 항목 최상위에 있다. 값은 3-상태다.

| `isInterested` | 의미 | 이 해제 API 호출? |
|---|---|---|
| `true` | 로그인 · 비소유자 · 이미 관심 등록함 | **예 → DELETE** |
| `false` | 아직 관심 안 함 | 아니오 (등록 대상) |
| `null` | 비로그인 또는 본인 글(`isOwner=true`) | 아니오 (버튼 숨김/비활성) |

> JSON 직렬화상 **`null` 필드는 응답에서 생략**된다. `isInterested` 키가 없으면 `null`로 간주.

## 성공 처리

- `204`를 받으면 로컬 상태를 `isInterested = false`로, `interestCount`를 **-1** 낙관적 갱신.
- **멱등**: 관심이 없던 상태에서 호출해도 `204`. 재시도해도 안전.

## 실패 응답

| HTTP | errorCode | 상황 |
|---|---|---|
| `401` | (인증 오류) | 미로그인 상태로 호출 |
| `404` | `INTEREST_PORTFOLIO_NOT_FOUND` | 존재하지 않는 `portfolioId` |

> 해제는 등록과 달리 소유자/공개 여부 검증이 없다(멱등 해제). 따라서 `403`은 발생하지 않는다.

**에러 응답 바디(공통 형식)**

```json
{
  "timestamp": "2026-07-05T12:00:00.000Z",
  "trackingId": "…",
  "errorCode": "INTEREST_PORTFOLIO_NOT_FOUND",
  "message": "관심 등록 대상 포트폴리오를 찾을 수 없습니다.",
  "path": "/api/portfolios/5234567890123456789/interest",
  "attributes": {}
}
```
