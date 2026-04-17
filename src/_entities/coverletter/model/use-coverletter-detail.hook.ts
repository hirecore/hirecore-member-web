// _entities/coverletter/model | 자기소개서 상세 조회
// TODO: API 연결 시 GET /api/coverletters/:id 로 교체
import { MOCK_COVERLETTER_DETAIL_DATA } from "../api/mock-coverletter-data"

interface LinkedPortfolio {
  id: string
  title: string
  thumbnailUrl: string | null
  tags: string[]
}

export interface CoverLetterDetail {
  id: string
  title: string
  company: string | null
  position: string | null
  visibility: "public" | "private"
  interestFields: string[]
  tags: string[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  linkedPortfolios: LinkedPortfolio[]
  content: object
}

export function useCoverLetterDetail(id: string): CoverLetterDetail | null {
  return MOCK_COVERLETTER_DETAIL_DATA[id] ?? null
}
