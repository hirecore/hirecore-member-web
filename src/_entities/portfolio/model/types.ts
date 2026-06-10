// _entities/portfolio/model | 포트폴리오 도메인 타입 정의
// ui가 아닌 model이 타입 소유자 — ui는 이 타입을 소비만 한다

export interface PortfolioCardLink {
  label: string
  url: string
}

export interface Portfolio {
  id: string
  /** L3 직무 코드 (assignable=true 인 노드) */
  categoryCode: string
  /** L3 직무명 (또는 customCategory). 카드 표시용 — 서버에서 미리 해석해 내려준다 */
  categoryName: string
  /** L1 분야명. 카드 표시용 */
  majorCategoryName: string
  /** "기타(직접입력)" 선택 시 사용자 입력 텍스트 */
  customCategory?: string
  projectType: "personal" | "team"
  visibility?: "public" | "private"
  title: string
  excerpt?: string
  tags: string[]
  externalLinks?: PortfolioCardLink[]
  thumbnailUrl: string | null
  author: {
    name: string
    profileImageUrl: string | null
  }
  viewCount: number
  likeCount: number
  updatedAt: string
  /**
   * 호출자가 작성자 본인인지 여부 — API 응답의 isOwner 미러링.
   * - mock 데이터에는 채워지지 않으므로 옵셔널.
   * - true 면 카드의 관심(하트) 버튼을 숨김 처리.
   */
  isOwner?: boolean
}

export interface LinkedDoc {
  id: string
  title: string
  /**
   * GET /api/portfolios/summaries/mine 응답은 { id, title } 만 제공해 옵셔널.
   * mock 데이터/리치 표시 경로에서만 채워진다.
   */
  visibility?: "public" | "private"
  /** ISO-8601. summaries API 미제공. */
  updatedAt?: string
  tags?: string[]
}

export interface AvailableDoc {
  id: string
  title: string
  updatedAt: string
  tags?: string[]
  visibility?: "public" | "private"
}

export type DocType = "resume" | "coverletter"

export interface ManagedPortfolio {
  id: string
  title: string
  privateMemo?: string
  updatedAt: string
  visibility: "public" | "private"
  likeCount: number
  projectType: "personal" | "team"
  /** L3 직무 코드 — 카드에 카테고리 경로 표시용 */
  categoryCode: string
  /** L3 직무명 (또는 customCategory) — 표시용 */
  categoryName: string
  /** L1 분야명 — 표시용 */
  majorCategoryName: string
  /** "기타(직접입력)" 선택 시 사용자 입력 텍스트 */
  customCategory?: string
  thumbnailUrl: string | null
  tags: string[]
  linkedResume: LinkedDoc | null
  linkedCoverletter: LinkedDoc | null
}
