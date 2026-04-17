// _entities/portfolio/model | 포트폴리오 목록 조회
// TODO: API 연결 시 GET /api/portfolios 로 교체
import { MOCK_PORTFOLIO_LIST_DATA } from "../api/mock-portfolio-data"
import type { Portfolio } from "./types"

export function usePortfolioList(): Portfolio[] {
  return MOCK_PORTFOLIO_LIST_DATA
}
