// _entities/portfolio/model | 마이페이지 포트폴리오 관리 탭 데이터
// TODO: API 연결 시 GET /api/portfolios/managed 로 교체
import {
  MOCK_MANAGED_PORTFOLIOS_DATA,
  MOCK_AVAILABLE_RESUMES_DATA,
  MOCK_AVAILABLE_COVERLETTERS_DATA,
} from "../api/mock-portfolio-data"
import type { ManagedPortfolio, AvailableDoc } from "./types"

export interface ManagedPortfoliosResult {
  portfolios: ManagedPortfolio[]
  availableResumes: AvailableDoc[]
  availableCoverletters: AvailableDoc[]
}

export function useManagedPortfolios(): ManagedPortfoliosResult {
  return {
    portfolios:            MOCK_MANAGED_PORTFOLIOS_DATA,
    availableResumes:      MOCK_AVAILABLE_RESUMES_DATA,
    availableCoverletters: MOCK_AVAILABLE_COVERLETTERS_DATA,
  }
}
