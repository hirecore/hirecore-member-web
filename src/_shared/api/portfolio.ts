// _shared/api | 포트폴리오 등록 / 수정 / 상세 조회 / 편집 조회 API
// 등록     : POST /api/portfolios — 사전조건: presigned URL → S3 업로드 후 imageFileMetaId 확보
// 수정     : PUT  /api/portfolios/{portfolioId} — 전체 교체 시맨틱, body shape 은 등록과 동일
// 상세     : GET  /api/portfolios/{portfolioId}
// 편집 조회: GET  /api/portfolios/{portfolioId}/edit — 작성자 본인만 접근 가능
import type { JSONContent } from "@tiptap/core"
import type { ExternalLink, Visibility } from "@/_shared/model"
import { httpClient } from "@/_shared/config"

export interface PortfolioTagInput {
  userInputTag: string
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
  jobCategory: JobCategoryInput
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  privateMemo?: string
  /** 포트폴리오 카드/검색 결과에 노출되는 사용자 입력 요약 (필수, ≤ 100자) */
  previewSummary: string
  /** TSID 문자열 — 정밀도 보존 컨벤션 (tsid-id-json-convention.md) */
  thumbnailImageId?: string
  contentImageIds?: string[]
  tags?: PortfolioTagInput[]
  externalLinks?: ExternalLink[]
  content: {
    json: JSONContent
    html: string
  }
  linkedResumeId?: string
  linkedCoverLetterId?: string
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
// 인증: 선택 — 로그인 시 cookie 기반 토큰이 자동 전송되어 isOwner / 비공개 접근이 활성화된다.

/** 루트→리프 순서의 직무 카테고리 계층 단일 노드 */
export interface PortfolioDetailJobCategory {
  /** TSID 문자열 */
  id: string
  depth: number
  categoryCode: string
  name: string
}

export interface PortfolioDetailTag {
  userInputTag: string
  sortOrder: number
}

export interface PortfolioDetailContent {
  /** 에디터 원본 JSON 직렬화 문자열 — JSON.parse 후 TipTap에 주입 */
  json: string
  /** 렌더링용 HTML */
  html: string
}

export interface PortfolioDetailResponse {
  isOwner: boolean
  publisher: string
  jobCategories: PortfolioDetailJobCategory[]
  collaborationType: "team" | "personal"
  visibility: Visibility
  viewCount: number
  interestCount: number
  title: string
  tags: PortfolioDetailTag[]
  externalLinks: ExternalLink[]
  content: PortfolioDetailContent
  /** ISO-8601 Instant (UTC, 'Z' 접미사) — 소수점 자릿수 가변 */
  updatedAt: string
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

export interface PortfolioEditResponse {
  /** 작성자 비공개 메모. 미작성 시 null */
  privateMemo: string | null
  previewSummary: string
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
