// _entities/portfolio/model | 포트폴리오 상세 조회
// TODO: API 연결 시 GET /api/portfolios/:id 로 교체
import { MOCK_PORTFOLIO_DETAIL_DATA } from "../api/mock-portfolio-data"

interface PortfolioLink {
  label: string
  url: string
}

export interface LinkedDocEmbed {
  id: string
  type: "resume" | "coverletter"
  title: string
  visibility: "public" | "private"
  interestFields: string[]
  tags: string[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  company?: string | null
  position?: string | null
  content: object
}

export interface PortfolioDetail {
  id: string
  /** L3 직무 코드 (assignable=true 인 노드) */
  categoryCode: string
  /** "기타(직접입력)" 선택 시 사용자 입력 텍스트 */
  customCategory?: string
  projectType: "personal" | "team"
  visibility: "public" | "private"
  title: string
  thumbnailUrl: string | null
  tags: string[]
  externalLinks: PortfolioLink[]
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
