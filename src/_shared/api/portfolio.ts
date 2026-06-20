// _shared/api | 포트폴리오 등록 / 수정 / 상세 조회 / 편집 조회 / 관심 토글 / 삭제 / 내 요약 / 공개 무한 스크롤 API
// 등록     : POST   /api/portfolios — 사전조건: presigned URL → S3 업로드 후 imageFileMetaId 확보
// 수정     : PUT    /api/portfolios/{portfolioId} — 전체 교체 시맨틱, body shape 은 등록과 동일
// 상세     : GET    /api/portfolios/{portfolioId}
// 편집 조회: GET    /api/portfolios/{portfolioId}/edit — 작성자 본인만 접근 가능
// 관심 등록: POST   /api/portfolios/{portfolioId}/interest — 멱등, 204 No Content
// 관심 해제: DELETE /api/portfolios/{portfolioId}/interest — 멱등, 204 No Content
// 삭제     : DELETE /api/portfolios/{portfolioId} — hard delete, 비멱등 (재호출 시 404)
// 내 요약   : GET    /api/portfolios/summaries/mine — 작성자 본인의 모든 포트폴리오 요약, updatedAt 내림차순
import type { JSONContent } from "@tiptap/core"
import type { ExternalLink, Visibility } from "@/_shared/model"
import { httpClient } from "@/_shared/config"

export interface PortfolioTagInput {
  name: string
  sortOrder: number
}

/**
 * 직무 분류 선택.
 * - code: L3 직무 코드 (assignable=true 인 노드)
 * - userInput: code 가 가리키는 노드가 allowsCustomInput=true 일 때, 사용자가 입력한 직무명
 */
export interface JobCategoryInput {
  code: string
  userInput?: string
}

export interface CreatePortfolioRequest {
  leafJobCategory: JobCategoryInput
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  /** null 명시 시 비공개 메모 클리어 (PUT 수정 컨텍스트 한정). */
  privateMemo?: string | null
  /** 포트폴리오 카드/검색 결과에 노출되는 사용자 입력 요약 (필수, ≤ 100자) */
  previewSummary: string
  /**
   * 썸네일 ImageFileMeta TSID. null 명시 시 썸네일 제거 (PUT 수정 컨텍스트).
   * POST 등록은 보통 미지정 시 키 자체를 생략한다.
   */
  thumbnailImageId?: string | null
  contentImageIds?: string[]
  tags?: PortfolioTagInput[]
  externalLinks?: ExternalLink[]
  content: {
    json: JSONContent
    html: string
  }
  /** null 명시 시 연결 해제 (PUT 수정 컨텍스트). */
  linkedResumeId?: string | null
  /** null 명시 시 연결 해제 (PUT 수정 컨텍스트). */
  linkedCoverLetterId?: string | null
}

export interface CreatePortfolioResponse {
  /** TSID 문자열 */
  portfolioId: string
}

export async function createPortfolio(
  body: CreatePortfolioRequest
): Promise<CreatePortfolioResponse> {
  const { data } = await httpClient.post<CreatePortfolioResponse>("/api/portfolios", body)
  return data
}

// ── 수정 ──────────────────────────────────────────────────────────
// PUT /api/portfolios/{portfolioId}
// 본문 shape 은 등록(POST) 과 동일. PUT 시맨틱이므로 클라이언트가 모든 필드를 송신한다
// (tags/externalLinks 같은 컬렉션 필드는 빈 배열이 곧 클리어 의도).

/** 수정 요청 본문 — 등록 요청과 동일 shape. nullable 필드는 명시적 null 로 클리어 가능. */
export type UpdatePortfolioRequest = CreatePortfolioRequest

export interface UpdatePortfolioResponse {
  /** TSID 문자열 — path variable 과 동일 값 (등록 응답과 일관된 shape) */
  portfolioId: string
}

export async function updatePortfolio(
  portfolioId: string,
  body: UpdatePortfolioRequest
): Promise<UpdatePortfolioResponse> {
  const { data } = await httpClient.put<UpdatePortfolioResponse>(
    `/api/portfolios/${portfolioId}`,
    body
  )
  return data
}

// ── 상세 조회 ─────────────────────────────────────────────────────
// GET /api/portfolios/{portfolioId}
// 인증: 선택 — 로그인 시 cookie 기반 토큰이 자동 전송되어 isOwner / 비공개 접근 / 자원 본문 노출 결정에 사용.
// 응답 구조는 nested — viewer 의존 통계는 최상위, 본문/메타는 portfolio, 작성자 정보는 publisher,
// 연결 자원(이력서/자기소개서)은 별도 키로 분리되어 있다.

/** 루트→리프 순서의 직무 카테고리 계층 단일 노드 */
export interface PortfolioDetailJobCategory {
  /** TSID 문자열 */
  id: string
  depth: number
  categoryCode: string
  name: string
}

export interface PortfolioDetailTag {
  name: string
  sortOrder: number
}

export interface PortfolioDetailContent {
  /** 에디터 직렬화 JSON. 백엔드가 object 로 내려보내지만 문자열 호환 위해 unknown 으로 둠 — 매퍼에서 파싱. */
  json: unknown
  /** 렌더링용 HTML */
  html: string
}

/** 본 포트폴리오 본체. 메타/태그/외부링크/본문을 묶는다. */
export interface PortfolioDetailBody {
  title: string
  collaborationType: "team" | "personal"
  visibility: Visibility
  /** 루트→리프 정렬되어 옴 */
  jobCategories: PortfolioDetailJobCategory[]
  /** sortOrder ASC 정렬되어 옴 */
  tags: PortfolioDetailTag[]
  externalLinks: ExternalLink[]
  content: PortfolioDetailContent
}

/** publisher.otherPortfolios — 작성자의 다른 PUBLIC 포트폴리오 요약 (본 포트폴리오 제외) */
export interface PublisherOtherPortfolioSummary {
  portfolioId: string
  title: string
  jobCategories: PortfolioDetailJobCategory[]
  viewCount: number
  interestCount: number
  updatedAt: string
}

/** 작성자 정보 + 같은 작성자의 다른 PUBLIC 포트폴리오 요약 목록 (페이징 없음, updatedAt DESC). */
export interface PortfolioDetailPublisher {
  nickname: string
  otherPortfolios: PublisherOtherPortfolioSummary[]
}

/**
 * 연결된 이력서·자기소개서.
 * - 객체 자체가 null: 연결 없음 또는 자원 삭제
 * - content 가 null: 자원은 존재하지만 visibility 정책상 viewer 에게 본문 노출 차단
 */
export interface PortfolioDetailLinkedDoc {
  id: string
  title: string
  content: PortfolioDetailContent | null
}

export interface PortfolioDetailResponse {
  // ── viewer 의존 통계 / 분기 ──
  isOwner: boolean
  viewCount: number
  interestCount: number
  /**
   * 요청자가 이 포트폴리오에 관심 등록했는지 여부.
   * - 비로그인 사용자 / 본인 포트폴리오(isOwner=true) → null
   * - 비소유자 미등록 → false
   * - 비소유자 등록됨 → true
   */
  isInterested: boolean | null
  /** ISO-8601. 본문/태그/메타 중 가장 최근 갱신 시각. 비정상 케이스에 null 가능. */
  updatedAt: string | null

  // ── 본문 / 작성자 / 연결 자원 ──
  portfolio: PortfolioDetailBody
  publisher: PortfolioDetailPublisher
  linkedResume: PortfolioDetailLinkedDoc | null
  linkedCoverLetter: PortfolioDetailLinkedDoc | null
}

export async function fetchPortfolioDetail(
  portfolioId: string
): Promise<PortfolioDetailResponse> {
  const { data } = await httpClient.get<PortfolioDetailResponse>(
    `/api/portfolios/${portfolioId}`
  )
  return data
}

// ── 편집 조회 ──────────────────────────────────────────────────────
// GET /api/portfolios/{portfolioId}/edit
// 작성자 본인만 200, 그 외엔 403(PORTFOLIO_FORBIDDEN). 상세 응답과 달리
// privateMemo / previewSummary 가 포함되고, isOwner/publisher/viewCount/
// interestCount/updatedAt 등 통계·메타 필드는 빠진다.

/** 편집 응답에 포함되는 본문 이미지 (imageFileMetaId ↔ URL) 매핑. */
export interface PortfolioEditContentImage {
  /** ImageFileMeta TSID 문자열 */
  imageId: string
  /** 본문 image 노드의 src 와 동일한 전체 URL */
  url: string
}

export interface PortfolioEditResponse {
  /** 작성자 비공개 메모. 미작성 시 null */
  privateMemo: string | null
  previewSummary: string
  /**
   * 썸네일 ImageFileMeta ID. PUT 수정 요청에서 동일 썸네일 유지를 전달하기 위해
   * 클라이언트가 그대로 thumbnailImageId 로 돌려보낸다. 썸네일 미등록 시 null.
   */
  thumbnailImageId: string | null
  /**
   * 썸네일 이미지의 전체 URL (환경별 CDN base URL 은 서버에서 자동 결합).
   * null 인 경우 사용자가 등록 시 썸네일을 넣지 않은 상태 — 편집 화면에서는
   * 신규 업로드 드롭존을 노출한다.
   */
  thumbnailImageUrl: string | null
  jobCategories: PortfolioDetailJobCategory[]
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  tags: PortfolioDetailTag[]
  externalLinks: ExternalLink[]
  /**
   * 본문에서 사용 중인 이미지의 (imageId, url) 매핑 목록. 본문에 이미지가 없으면 빈 배열.
   * 편집 진입 직후 클라이언트는 이 매핑을 룩업 테이블로 보관해 PUT 수정 시
   * 본문 image src → imageFileMetaId 변환에 사용한다. 누락 시 서버가 모든 본문 이미지를
   * 회수(orphan) 처리하므로 PUT 요청 시 반드시 채워서 보낸다.
   */
  contentImages: PortfolioEditContentImage[]
  content: PortfolioDetailContent
}

export async function fetchPortfolioForEdit(
  portfolioId: string
): Promise<PortfolioEditResponse> {
  const { data } = await httpClient.get<PortfolioEditResponse>(
    `/api/portfolios/${portfolioId}/edit`
  )
  return data
}

// ── 관심 토글 ──────────────────────────────────────────────────────
// POST   /api/portfolios/{portfolioId}/interest — 관심 등록
// DELETE /api/portfolios/{portfolioId}/interest — 관심 해제
// 두 엔드포인트 모두 멱등 (이미 등록/미등록 상태에서도 204 응답).

export async function registerPortfolioInterest(portfolioId: string): Promise<void> {
  await httpClient.post(`/api/portfolios/${portfolioId}/interest`)
}

export async function cancelPortfolioInterest(portfolioId: string): Promise<void> {
  await httpClient.delete(`/api/portfolios/${portfolioId}/interest`)
}

// ── 영구 삭제 ──────────────────────────────────────────────────────
// DELETE /api/portfolios/{portfolioId}
// hard delete — DB 행, 본문/직무/태그, 다른 사용자의 관심·조회 기록 모두 영구 삭제.
// 참조 중이던 본문/썸네일 이미지는 ORPHANED 전이되며 사용자 스토리지 사용량 자동 차감.
// 비멱등: 재호출 시 404 PORTFOLIO_NOT_FOUND → 클라이언트 중복 클릭 가드 필요.
//
// 도메인 에러: 401 AUTHENTICATION_FAILED / 403 PORTFOLIO_FORBIDDEN / 404 PORTFOLIO_NOT_FOUND
// (401 은 axios 응답 인터셉터가 로그인 페이지로 자동 라우팅한다.)

export type PortfolioDeleteErrorCode =
  | "PORTFOLIO_FORBIDDEN"
  | "PORTFOLIO_NOT_FOUND"
  | "AUTHENTICATION_FAILED"

export async function deletePortfolio(portfolioId: string): Promise<void> {
  await httpClient.delete(`/api/portfolios/${portfolioId}`)
}

// ── 내 포트폴리오 요약 목록 ────────────────────────────────────────
// GET /api/portfolios/summaries/mine
// 작성자 본인 호출 전용 — 비로그인 시 401. updatedAt 내림차순, 페이징 없음 (단일 호출).
// 응답에 본문(content) / externalLinks 미포함 — 상세는 fetchPortfolioDetail 사용.

export interface MyPortfolioSummaryTag {
  name: string
  sortOrder: number
}

export interface MyPortfolioSummaryJobCategory {
  /** TSID 문자열 */
  id: string
  depth: number
  categoryCode: string
  name: string
}

/** 연결된 이력서·자기소개서 요약. 합성 실패 / 미연결 시 null. */
export interface MyPortfolioLinkedDoc {
  /** TSID 문자열 */
  id: string
  title: string
}

export interface MyPortfolioSummary {
  /** TSID 문자열 — 상세/편집 라우팅 키 */
  portfolioId: string
  title: string
  previewSummary: string
  privateMemo: string | null
  thumbnailImageId: string | null
  thumbnailImageUrl: string | null
  jobCategories: MyPortfolioSummaryJobCategory[]
  collaborationType: "team" | "personal"
  visibility: Visibility
  tags: MyPortfolioSummaryTag[]
  interestCount: number
  linkedResume: MyPortfolioLinkedDoc | null
  linkedCoverLetter: MyPortfolioLinkedDoc | null
  /** ISO-8601 (UTC) */
  updatedAt: string
}

export interface MyPortfolioSummariesResponse {
  /** updatedAt 내림차순. 보유 포트폴리오 없으면 빈 배열. */
  items: MyPortfolioSummary[]
}

export async function fetchMyPortfolioSummaries(): Promise<MyPortfolioSummariesResponse> {
  const { data } = await httpClient.get<MyPortfolioSummariesResponse>(
    "/api/portfolios/summaries/mine"
  )
  return data
}

// ── 공개 포트폴리오 요약 목록 (무한 스크롤) ────────────────────────
// GET /api/portfolios/summaries/public
// 비로그인 호출 가능. effective updatedAt DESC 정렬, opaque cursor 페이지네이션.
// size: 1~50 (default 20). 본문(content) 미포함 — 상세는 fetchPortfolioDetail.

export interface PublicPortfolioSummaryTag {
  name: string
  sortOrder: number
}

export interface PublicPortfolioSummaryJobCategory {
  /** TSID 문자열 */
  id: string
  depth: number
  categoryCode: string
  name: string
}

export interface PublicPortfolioSummaryThumbnail {
  /** TSID 문자열 */
  imageId: string
  /** URL 해소 실패 시 null (imageId 는 유지) */
  imageUrl: string | null
}

export interface PublicPortfolioSummary {
  /** TSID 문자열 — 상세 라우팅 키 */
  portfolioId: string
  /** 썸네일 미등록 시 객체 자체가 null */
  thumbnail: PublicPortfolioSummaryThumbnail | null
  jobCategories: PublicPortfolioSummaryJobCategory[]
  title: string
  previewSummary: string
  /** 협업 유형 — 카드의 "팀/개인" 배지에 사용 */
  collaborationType: "team" | "personal"
  tags: PublicPortfolioSummaryTag[]
  externalLinks: ExternalLink[]
  /** 작성자 닉네임. 해소 실패 시 null */
  nickname: string | null
  viewCount: number
  interestCount: number
  /**
   * 호출자가 해당 포트폴리오의 작성자인지 여부.
   * - 비로그인 호출 시 항상 false.
   * - 도메인 규칙: 본인 포트폴리오에는 관심 등록 불가 → 카드의 관심 버튼을 숨김/비활성에 사용.
   */
  isOwner: boolean
  /** ISO-8601 (UTC). effective updatedAt — 정렬 키와 동일 */
  updatedAt: string
}

export interface PublicPortfolioPagination {
  /** 다음 페이지 요청 시 그대로 echo. hasNext=false 면 null */
  nextCursor: string | null
  hasNext: boolean
}

export interface PublicPortfolioSummariesResponse {
  items: PublicPortfolioSummary[]
  pagination: PublicPortfolioPagination
}

export interface FetchPublicPortfolioSummariesParams {
  /** 직전 응답의 nextCursor — 첫 페이지면 undefined */
  cursor?: string
  /** 1~50, default 20 */
  size?: number
}

export async function fetchPublicPortfolioSummaries(
  params: FetchPublicPortfolioSummariesParams = {}
): Promise<PublicPortfolioSummariesResponse> {
  const { data } = await httpClient.get<PublicPortfolioSummariesResponse>(
    "/api/portfolios/summaries/public",
    {
      params: {
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.size != null ? { size: params.size } : {}),
      },
    }
  )
  return data
}
