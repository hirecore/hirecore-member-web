// _entities/resume/model | 이력서 상세 조회
// TODO: API 연결 시 GET /api/resumes/:id 로 교체
import { MOCK_RESUME_DETAIL_DATA } from "../api/mock-resume-data"
import type { ExternalLink, LinkedPortfolio } from "@/_shared/model"

export interface ResumeDetail {
  id: string
  authorId: string
  title: string
  visibility: "public" | "private"
  interestFields: string[]
  tags: string[]
  externalLinks: ExternalLink[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  linkedPortfolios: LinkedPortfolio[]
  content: object
}

export function useResumeDetail(id: string): ResumeDetail | null {
  return MOCK_RESUME_DETAIL_DATA[id] ?? null
}
