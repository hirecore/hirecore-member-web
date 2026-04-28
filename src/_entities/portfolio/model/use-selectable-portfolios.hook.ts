// _entities/portfolio/model | 링크 포트폴리오 모달용 선택 가능 포트폴리오 목록
// TODO: API 연결 시 GET /api/portfolios/mine?selectable=true 로 교체
import { MOCK_SELECTABLE_PORTFOLIOS_DATA } from "../api/mock-portfolio-data"

export interface SelectablePortfolio {
  id: string
  title: string
  /** L3 직무 코드 */
  categoryCode: string
  /** L3 직무명 (또는 customCategory) — 표시용 */
  categoryName: string
  /** L1 분야명 — 표시용 */
  majorCategoryName: string
  customCategory?: string
  thumbnailUrl: string | null
  tags: string[]
}

export function useSelectablePortfolios(): SelectablePortfolio[] {
  return MOCK_SELECTABLE_PORTFOLIOS_DATA
}
