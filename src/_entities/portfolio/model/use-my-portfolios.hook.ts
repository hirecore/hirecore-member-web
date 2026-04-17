// _entities/portfolio/model | 내 포트폴리오 목록 (이력서/자기소개서 작성 폼 연결용)
// TODO: API 연결 시 GET /api/portfolios/mine 로 교체
import { MOCK_MY_PORTFOLIOS_DATA } from "../api/mock-portfolio-data"

export interface LinkablePortfolio {
  id: string
  title: string
  thumbnailUrl: string | null
  tags: string[]
}

export function useMyPortfolios(): LinkablePortfolio[] {
  return MOCK_MY_PORTFOLIOS_DATA
}
