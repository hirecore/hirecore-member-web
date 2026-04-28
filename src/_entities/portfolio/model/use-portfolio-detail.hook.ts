// _entities/portfolio/model | 포트폴리오 상세 조회
// TODO: API 연결 시 GET /api/portfolios/:id 로 교체
import { MOCK_PORTFOLIO_DETAIL_DATA } from "../api/mock-portfolio-data"
import type { ExternalLink } from "@/_shared/model"

export interface InterestField {
  code: string
  name: string
}

export interface LinkedDocEmbed {
  id: string
  type: "resume" | "coverletter"
  title: string
  visibility: "public" | "private"
  interestFields: InterestField[]
  tags: string[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  company?: string | null
  position?: string | null
  content: object
}

export interface PortfolioDetail {
  id: string
  /** 작성자 사용자 ID — 소유자 판별에 사용 */
  authorId: string
  /** L3 직무 코드 (assignable=true 인 노드) */
  categoryCode: string
  /** L3 직무명 (또는 customCategory) — 표시용 */
  categoryName: string
  /** L1 분야명 — 표시용 */
  majorCategoryName: string
  /** "기타(직접입력)" 선택 시 사용자 입력 텍스트 */
  customCategory?: string
  projectType: "personal" | "team"
  visibility: "public" | "private"
  title: string
  thumbnailUrl: string | null
  tags: string[]
  externalLinks: ExternalLink[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  likeCount: number
  content: object
  linkedResume: LinkedDocEmbed | null
  linkedCoverletter: LinkedDocEmbed | null
  otherPortfolios?: OtherPortfolio[]
}

export interface OtherPortfolio {
  id: string
  /** L3 직무 코드 */
  categoryCode: string
  /** L3 직무명 (또는 customCategory) — 표시용 */
  categoryName: string
  /** L1 분야명 — 표시용 */
  majorCategoryName: string
  customCategory?: string
  title: string
  tags: string[]
  thumbnailUrl: string | null
  likeCount: number
  updatedAt: string
  visibility: "public" | "private"
}

export function usePortfolioDetail(id: string): PortfolioDetail | null {
  return MOCK_PORTFOLIO_DETAIL_DATA[id] ?? null
}
