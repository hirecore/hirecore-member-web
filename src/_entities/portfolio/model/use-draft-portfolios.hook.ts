// _entities/portfolio/model | 마이페이지 포트폴리오 임시저장 데이터
// TODO: API 연결 시 GET /api/portfolios/drafts 로 교체

import type { DraftItem } from "@/_shared/ui/draft-section"

const MOCK_DRAFT_PORTFOLIOS: DraftItem[] = [
  { id: "draft-p1", title: "UI/UX 리디자인 프로젝트 포트폴리오", updatedAt: "2026.04.15" },
  { id: "draft-p2", title: "토스 클론코딩 포트폴리오", updatedAt: "2026.04.12" },
]

export function useDraftPortfolios(): DraftItem[] {
  return MOCK_DRAFT_PORTFOLIOS
}
