# 공개 포트폴리오 요약 목록 조회 — 클라이언트 연동 가이드

공개 포트폴리오 피드(무한 스크롤)를 조회하는 API 계약서다. 이 목록의 각 항목은 **현재 사용자의 관심 여부(`isInterested`)** 를 포함하므로, 관심(찜) 버튼 상태를 여기서 렌더한다. 등록/해제는 [register-interest.md](register-interest.md) · [cancel-interest.md](cancel-interest.md) 참고.

## 엔드포인트

```
GET /api/portfolios/summaries/public
```

| 항목 | 값 |
|---|---|
| 인증 | **선택** (`accessToken` 쿠키). 로그인하면 `isOwner`·`isInterested`가 사용자 기준으로 채워진다. |
| 성공 응답 | `200 OK` + 목록 |

> 로그인 상태를 반영하려면 요청에 쿠키를 포함한다: `fetch(url, { credentials: "include" })`.

## 쿼리 파라미터

| 이름 | 필수 | 기본 | 설명 |
|---|---|---|---|
| `cursor` | 아니오 | — | 직전 응답의 `pagination.nextCursor`. **첫 페이지는 미지정.** |
| `size` | 아니오 | `20` | 페이지 크기. `1`~`50`. |

- 정렬: 최신순(effective updatedAt 내림차순, 동률 시 `portfolioId` 내림차순).
- 페이지네이션은 **커서 기반**. `nextCursor`는 **불투명 토큰**이니 해석하지 말고 다음 요청 `cursor`에 그대로 echo.

## 성공 응답 `200`

```json
{
  "items": [
    {
      "portfolioId": "5234567890123456789",
      "thumbnail": { "imageId": "7876543210987654321", "imageUrl": "https://cdn.example.com/....webp" },
      "jobCategories": [
        { "id": "1001", "depth": 1, "categoryCode": "DEV", "name": "개발" },
        { "id": "1002", "depth": 2, "categoryCode": "DEV_BACKEND", "name": "백엔드" }
      ],
      "title": "회원 서비스 도메인 모델링 회고",
      "previewSummary": "회원 서비스를 도메인 모델링한 회고를 정리한 글입니다.",
      "collaborationType": "team",
      "tags": [ { "name": "Spring", "sortOrder": 0 } ],
      "externalLinks": [ { "label": "GitHub", "url": "https://github.com/example/repo" } ],
      "nickname": "euncheol",
      "viewCount": 128,
      "interestCount": 42,
      "isOwner": false,
      "isInterested": false,
      "updatedAt": "2026-06-10T15:00:00.123456Z"
    }
  ],
  "pagination": { "nextCursor": "MTc4MDg4...", "hasNext": true }
}
```

### 필드 설명

| 필드 | 타입 | 설명 |
|---|---|---|
| `items[].portfolioId` | string(TSID) | 포트폴리오 ID. **숫자 파싱 금지**(정밀도 손실). |
| `items[].thumbnail` | object \| null | 썸네일. 미등록 시 키 생략. `imageUrl`은 해소 실패 시 null. |
| `items[].jobCategories[]` | array | 직무 계층(루트→리프). `id`는 문자열. |
| `items[].title` / `previewSummary` | string | 제목 / 미리보기 요약. |
| `items[].collaborationType` | string | `"team"` \| `"personal"`. |
| `items[].tags[]` | array | `{ name, sortOrder }`. 없으면 빈 배열. |
| `items[].externalLinks[]` | array | `{ label, url }`. 없으면 빈 배열. |
| `items[].nickname` | string \| null | 작성자 닉네임. 해소 실패 시 null. |
| `items[].viewCount` | number | 조회수. |
| `items[].interestCount` | number | **총** 관심 수(모든 사용자 합계). |
| `items[].isOwner` | boolean | 내가 작성자인지. **비로그인이면 항상 false.** |
| `items[].isInterested` | boolean \| null | **내가 관심 등록했는지.** 아래 3-상태 참고. |
| `items[].updatedAt` | string | ISO-8601(UTC). |
| `pagination.nextCursor` | string \| null | 다음 페이지 커서. `hasNext=false`면 null. |
| `pagination.hasNext` | boolean | 다음 페이지 존재 여부. |

> **`null` 필드는 응답에서 생략**된다(JSON 직렬화 규칙). 예: `isInterested`가 null이면 키 자체가 없다.

## 관심 상태(`isInterested`) — 3-상태

| 값 | 의미 | 관심 버튼 |
|---|---|---|
| `false` | 로그인 · 비소유자 · 아직 관심 안 함 | 빈 하트 → 클릭 시 **등록**([register-interest.md](register-interest.md)) |
| `true` | 로그인 · 비소유자 · 이미 관심 등록함 | 찬 하트 → 클릭 시 **해제**([cancel-interest.md](cancel-interest.md)) |
| `null`(키 생략) | 비로그인 또는 본인 글(`isOwner=true`) | 숨김/비활성 |

## 클라이언트 구현 체크리스트

- [ ] 로그인 반영을 위해 `credentials: "include"`로 호출.
- [ ] 첫 페이지는 `cursor` 없이, 이후 `pagination.nextCursor`를 그대로 echo. `hasNext=false`면 더 불러오지 않음.
- [ ] `portfolioId`·`jobCategories[].id`·`thumbnail.imageId`는 문자열로 취급.
- [ ] 각 카드의 관심 버튼 상태는 `isInterested`(없으면 null)로 렌더. `null`이면 버튼 숨김/비활성.
- [ ] 관심 토글 성공(`204`) 후 해당 카드의 `isInterested`와 `interestCount`를 낙관적 갱신.
